package model

import (
	"github.com/google/uuid"
	"time"
)

// ItemModel represents a row in the items table.
type ItemModel struct {
	ID          uuid.UUID `db:"id"`
	Reference   string    `db:"reference"`
	GroupKey    string    `db:"group_key"`
	Description *string   `db:"description"`
	CreatedAt   time.Time `db:"created_at"`
	UpdatedAt   time.Time `db:"updated_at"`
}
