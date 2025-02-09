package testdata

import (
	"github.com/jmoiron/sqlx"
	"quantum/internal/model"
	"quantum/internal/permissions"
	"testing"
)

type UserBuilder struct {
	t     *testing.T
	db    *sqlx.DB
	model *model.User
}

func NewUserBuilder(t *testing.T, db *sqlx.DB) *UserBuilder {
	return &UserBuilder{
		t:  t,
		db: db,
		model: &model.User{
			Roles: make(permissions.RoleCollection, 0),
		},
	}
}

func InsertAdminUser(t *testing.T, db *sqlx.DB) *model.User {
	return NewUserBuilder(t, db).
		WithName("Adam Admin").
		WithUsername("adam.admin").
		WithRole(permissions.AdminRole).
		Build()
}

func InsertWriterUser(t *testing.T, db *sqlx.DB) *model.User {
	return NewUserBuilder(t, db).
		WithName("Wayne Writer").
		WithUsername("wayne.writer").
		WithRole(permissions.WriterRole).
		Build()
}

func InsertReaderUser(t *testing.T, db *sqlx.DB) *model.User {
	return NewUserBuilder(t, db).
		WithName("Randy Reader").
		WithUsername("randy.reader").
		WithRole(permissions.ReaderRole).
		Build()
}

func InsertTrackerUser(t *testing.T, db *sqlx.DB) *model.User {
	return NewUserBuilder(t, db).
		WithName("Terry Tracker").
		WithUsername("terry.tracker").
		WithRole(permissions.TrackerRole).
		Build()
}

func (b *UserBuilder) WithName(name string) *UserBuilder {
	b.model.Name = name
	return b
}

func (b *UserBuilder) WithUsername(username string) *UserBuilder {
	b.model.Username = username
	return b
}

func (b *UserBuilder) WithRole(role permissions.Role) *UserBuilder {
	b.model.Roles = append(b.model.Roles, role)
	return b
}

func (b *UserBuilder) Build() *model.User {
	b.model.Password = []byte("2a$10$qhV3xDdjNakp.KDYjcgnte7sX6HupQ7wjkhMMioIG/L5U2/f4xA8.")

	insert := `
		insert into users (name, username, password)
		values ($1, $2, $3)
		returning id, created_at, updated_at`

	err := b.db.Get(b.model, insert, b.model.Name, b.model.Username, b.model.Password)
	if err != nil {
		b.t.Errorf("failed to insert user: %v", err)
	}

	insert = `
		insert into user_roles (user_id, role)
		values ($1, $2)`

	for _, role := range b.model.Roles {
		_, err = b.db.Exec(insert, b.model.ID, role)
		if err != nil {
			b.t.Errorf("failed to insert user role: %v", err)
		}
	}

	return b.model
}
