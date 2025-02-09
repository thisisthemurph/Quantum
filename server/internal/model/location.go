package model

import (
	"github.com/google/uuid"
	"time"
)

type LocationModel struct {
	ID          uuid.UUID `db:"id"`
	Name        string    `db:"name"`
	Description *string   `db:"description"`
	IsDeleted   bool      `db:"is_deleted"`
	CreatedAt   time.Time `db:"created_at"`
	UpdatedAt   time.Time `db:"updated_at"`
	IsUser      bool      `db:"is_user"`
}
