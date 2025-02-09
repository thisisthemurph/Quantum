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

	// LocationID is the ID of the location or the user the item is tracked to.
	LocationID uuid.UUID `db:"location_id"`
	// LocationName is the name of the location or the user the item is tracked to.
	LocationName string `db:"location_name"`
	// LocationDescription is the description of the location or the username of the user the item is tracked to.
	LocationDescription *string `db:"location_description"`
	// TrackedAt is the time the item was tracked to the location or user.
	TrackedAt time.Time `db:"tracked_at"`
	// TrackedToUser is true if the item is tracked to a user, false if it is tracked to a location.
	TrackedToUser bool `db:"tracked_to_user"`
}
