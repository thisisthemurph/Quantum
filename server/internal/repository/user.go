package repository

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
	"github.com/lib/pq"
	"quantum/internal/model"
	"quantum/internal/permissions"
)

var ErrUserUsernameExists = errors.New("username already exists")

type UserRepository interface {
	List(roleFilters []string) ([]model.User, error)
	Get(id uuid.UUID) (model.User, error)
	GetByUsername(username string) (model.User, error)
	Create(user *model.User) error
	Update(user *model.User) error
	UpdatePassword(id uuid.UUID, password []byte) error
	UpdateLastLoggedIn(id uuid.UUID) error
	Delete(id uuid.UUID) error
	Count() (int, error)
}

type postgresUserRepository struct {
	db *sqlx.DB
}

func NewUserRepository(db *sqlx.DB) UserRepository {
	return &postgresUserRepository{
		db: db,
	}
}

// userRoleJoin represents a join between the users and user_roles tables.
type userRoleJoin struct {
	model.User
	Role permissions.Role `db:"role"`
}

func (r *postgresUserRepository) List(roleFilters []string) ([]model.User, error) {
	query, args, err := sqlx.In(`
		with matched_users as (
			select distinct u.id
			from users u
			join user_roles ur
			on u.id = ur.user_id
			where ur.role in (?)
		)
		select u.id, u.name, u.username, u.password, u.created_at, u.updated_at, u.deleted_at, u.last_logged_in_at, ur.role
		from users u left join user_roles ur on u.id = ur.user_id
		where u.id in (select id from matched_users)
		order by u.name, ur.role;`, roleFilters)

	if err != nil {
		return nil, err
	}

	query = r.db.Rebind(query)

	var usersWithRoles []userRoleJoin
	if err := r.db.Select(&usersWithRoles, query, args...); err != nil {
		return nil, err
	}

	userMap := make(map[uuid.UUID][]userRoleJoin)
	for _, u := range usersWithRoles {
		userMap[u.ID] = append(userMap[u.ID], u)
	}

	users := make([]model.User, 0, len(userMap))
	for _, u := range userMap {
		user, err := r.userRoleJoinToUserModel(u)
		if err != nil {
			return nil, err
		}
		users = append(users, user)
	}

	return users, nil
}

func (r *postgresUserRepository) Get(id uuid.UUID) (model.User, error) {
	stmt := `
		select u.id, u.name, u.username, u.password, u.created_at, u.updated_at, u.deleted_at, r.role
		from users u
		left join user_roles r on u.id = r.user_id
		where u.id = $1;`

	var userWithRoles []userRoleJoin
	if err := r.db.Select(&userWithRoles, stmt, id); err != nil {
		return model.User{}, err
	}

	return r.userRoleJoinToUserModel(userWithRoles)
}

func (r *postgresUserRepository) GetByUsername(username string) (model.User, error) {
	stmt := `
		select u.id, u.name, u.username, u.password, u.created_at, u.updated_at, r.role
		from users u
		left join user_roles r on u.id = r.user_id
		where u.username = $1;`

	var userWithRoles []userRoleJoin
	if err := r.db.Select(&userWithRoles, stmt, username); err != nil {
		return model.User{}, err
	}

	return r.userRoleJoinToUserModel(userWithRoles)
}

func (r *postgresUserRepository) Create(user *model.User) error {
	stmt := `
		insert into users (name, username, password)
		values ($1, $2, $3)
		returning id, created_at, updated_at;`

	rolesStmt := `
		insert into user_roles (user_id, role)
		values ($1, $2);`

	if user.Roles == nil || len(user.Roles) == 0 {
		return errors.New("a role is required")
	}

	tx, err := r.db.BeginTxx(context.TODO(), nil)
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer func() {
		if err != nil {
			_ = tx.Rollback()
		}
	}()

	if err = tx.Get(user, stmt, user.Name, user.Username, user.Password); err != nil {
		var pqErr *pq.Error
		if errors.As(err, &pqErr) && pqErr.Code.Name() == "unique_violation" && pqErr.Constraint == "users_username_key" {
			return ErrUserUsernameExists
		}
		return fmt.Errorf("failed to create user: %w", err)
	}

	for _, role := range user.Roles {
		if _, err = tx.Exec(rolesStmt, user.ID, role); err != nil {
			return fmt.Errorf("failed to assign role %v: %w", role, err)
		}
	}

	if err = tx.Commit(); err != nil {
		return fmt.Errorf("failed to commit transaction: %w", err)
	}
	return nil
}

func (r *postgresUserRepository) Update(user *model.User) error {
	updateUserStmt := `
		update users
		set name = $1, username = $2
		where id = $3;`

	selectRolesStmt := `
		select role from user_roles where user_id = $1;`

	insertRoleStmt := `
		insert into user_roles (user_id, role) values ($1, $2);`

	deleteRoleStmt := `
		delete from user_roles where user_id = $1 and role = $2;`

	tx, err := r.db.BeginTxx(context.TODO(), nil)
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer func() {
		if err != nil {
			_ = tx.Rollback()
		}
	}()

	if _, err = tx.Exec(updateUserStmt, user.Name, user.Username, user.ID); err != nil {
		return fmt.Errorf("failed to update user: %w", err)
	}

	var existingRoles []string
	if err = tx.Select(&existingRoles, selectRolesStmt, user.ID); err != nil {
		return fmt.Errorf("failed to select existing roles: %w", err)
	}

	existingRolesMap := make(map[string]struct{}, len(existingRoles))
	for _, role := range existingRoles {
		existingRolesMap[role] = struct{}{}
	}

	// Insert new roles if they are not one of the user's existing roles
	for _, role := range user.Roles {
		if _, exists := existingRolesMap[role.String()]; !exists {
			if _, err = tx.Exec(insertRoleStmt, user.ID, role); err != nil {
				return fmt.Errorf("failed to insert role %v: %w", role, err)
			}
		}
		delete(existingRolesMap, role.String())
	}

	// Delete any roles the user has that are not part of the new roles
	for role := range existingRolesMap {
		if _, err = tx.Exec(deleteRoleStmt, user.ID, role); err != nil {
			return fmt.Errorf("failed to delete role %v: %w", role, err)
		}
	}

	updatedUser, err := r.Get(user.ID)
	if err != nil {
		return fmt.Errorf("failed to retrieve updated user: %w", err)
	}

	user = &updatedUser

	if err = tx.Commit(); err != nil {
		return fmt.Errorf("failed to commit transaction: %w", err)
	}
	return nil
}

func (r *postgresUserRepository) UpdatePassword(userID uuid.UUID, password []byte) error {
	stmt := "update users set password = $1 where id = $2;"
	_, err := r.db.Exec(stmt, password, userID)
	return err
}

func (r *postgresUserRepository) UpdateLastLoggedIn(userID uuid.UUID) error {
	stmt := "update users set last_logged_in_at = now() where id = $1;"
	_, err := r.db.Exec(stmt, userID)
	return err
}

func (r *postgresUserRepository) Delete(id uuid.UUID) error {
	stmt := "update users set deleted_at = now() where id = $1;"

	if _, err := r.db.Exec(stmt, id); err != nil {
		return err
	}
	return nil
}

func (r *postgresUserRepository) Count() (int, error) {
	stmt := `select count(*) from users;`

	var count int
	if err := r.db.Get(&count, stmt); err != nil {
		return 0, err
	}
	return count, nil
}

func (r *postgresUserRepository) userRoleJoinToUserModel(userWithRoles []userRoleJoin) (model.User, error) {
	if userWithRoles == nil || len(userWithRoles) == 0 {
		return model.User{}, sql.ErrNoRows
	}

	roles := make(permissions.RoleCollection, 0, len(userWithRoles))
	for _, ur := range userWithRoles {
		if ur.Role != "" {
			roles = append(roles, ur.Role)
		}
	}

	user := userWithRoles[0].User
	user.Roles = roles
	return user, nil
}
