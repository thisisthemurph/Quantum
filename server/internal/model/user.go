package model

import (
	"github.com/google/uuid"
	"quantum/internal/permissions"
	"time"
)

type User struct {
	ID             uuid.UUID                  `db:"id"`
	Name           string                     `db:"name"`
	Username       string                     `db:"username"`
	Password       []byte                     `db:"password"`
	Roles          permissions.RoleCollection `db:"roles"`
	LastLoggedInAt *time.Time                 `db:"last_logged_in_at"`
	CreatedAt      time.Time                  `db:"created_at"`
	UpdatedAt      time.Time                  `db:"updated_at"`
	DeletedAt      *time.Time                 `db:"deleted_at"`
}
