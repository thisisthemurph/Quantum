package repository

import (
	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
	"quantum/internal/model"
)

type UserRepository interface {
	Get(id uuid.UUID) (model.User, error)
	GetByEmail(email string) (model.User, error)
	Create(user *model.User) error
}

type postgresUserRepository struct {
	db *sqlx.DB
}

func NewUserRepository(db *sqlx.DB) UserRepository {
	return &postgresUserRepository{
		db: db,
	}
}

func (r *postgresUserRepository) Get(id uuid.UUID) (model.User, error) {
	stmt := "select * from users where id = $1;"
	var user model.User
	if err := r.db.Get(&user, stmt, id); err != nil {
		return model.User{}, err
	}
	return user, nil
}

func (r *postgresUserRepository) GetByEmail(email string) (model.User, error) {
	stmt := "select * from users where email = $1;"
	var user model.User
	if err := r.db.Get(&user, stmt, email); err != nil {
		return model.User{}, err
	}
	return user, nil
}

func (r *postgresUserRepository) Create(user *model.User) error {
	stmt := `
		insert into users (name, email, password)
		values ($1, $2, $3)
		returning id, created_at, updated_at;`

	return r.db.Get(user, stmt, user.Name, user.Email, user.Password)
}
