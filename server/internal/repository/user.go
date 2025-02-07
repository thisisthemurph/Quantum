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
		select u.id, u.name, u.username, u.password, u.created_at, u.updated_at, ur.role
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
		select u.id, u.name, u.username, u.password, u.created_at, u.updated_at, r.role
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

	user := userWithRoles[0]
	return model.User{
		ID:        user.ID,
		Name:      user.Name,
		Username:  user.Username,
		Password:  user.Password,
		Roles:     roles,
		CreatedAt: user.CreatedAt,
		UpdatedAt: user.UpdatedAt,
	}, nil
}
