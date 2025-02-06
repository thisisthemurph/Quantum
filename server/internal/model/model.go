package model

import (
	"github.com/google/uuid"
	"time"
)

// ItemModel represents a row in the items table.
type ItemModel struct {
	ID          uuid.UUID `db:"id"`
	Identifier  string    `db:"identifier"`
	Reference   string    `db:"reference"`
	GroupKey    string    `db:"group_key"`
	Description *string   `db:"description"`
	Deleted     bool      `db:"deleted"`
	CreatedAt   time.Time `db:"created_at"`
	UpdatedAt   time.Time `db:"updated_at"`
}

// ItemWithCurrentLocationModel represents a row in the items_with_current_location view.
type ItemWithCurrentLocationModel struct {
	ItemModel

	LocationID          uuid.UUID `db:"location_id"`
	LocationName        string    `db:"location_name"`
	LocationDescription *string   `db:"location_description"`
	TrackedAt           time.Time `db:"tracked_at"`
}

type LocationModel struct {
	ID          uuid.UUID `db:"id"`
	Name        string    `db:"name"`
	Description *string   `db:"description"`
	IsDeleted   bool      `db:"is_deleted"`
	CreatedAt   time.Time `db:"created_at"`
	UpdatedAt   time.Time `db:"updated_at"`
}
