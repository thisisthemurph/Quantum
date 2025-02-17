package dto

import (
	"errors"
	"github.com/google/uuid"
	"quantum/internal/model"
	"time"
)

var ErrInvalidItemReference = errors.New("invalid item reference")

type ItemResponse struct {
	ID              uuid.UUID            `json:"id"`
	Identifier      string               `json:"identifier"`
	Reference       string               `json:"reference"`
	GroupKey        string               `json:"groupKey"`
	Description     *string              `json:"description"`
	CurrentLocation *ItemCurrentLocation `json:"currentLocation"`
	Deleted         bool                 `json:"deleted"`
	CreatedAt       time.Time            `json:"createdAt"`
	UpdatedAt       time.Time            `json:"updatedAt"`
}

func NewItemResponseFromModel(item model.ItemModel, location *model.LocationModel) ItemResponse {
	r := ItemResponse{
		ID:          item.ID,
		Identifier:  item.Identifier,
		Reference:   item.Reference,
		GroupKey:    item.GroupKey,
		Description: item.Description,
		Deleted:     item.Deleted,
		CreatedAt:   item.CreatedAt,
		UpdatedAt:   item.UpdatedAt,
	}

	if location != nil {
		r.CurrentLocation = &ItemCurrentLocation{
			ID:   location.ID,
			Name: location.Name,
		}
	}

	return r
}

type CurrentLocation struct {
	ID            uuid.UUID `json:"id"`
	Name          string    `json:"name"`
	Description   *string   `json:"description"`
	TrackedAt     time.Time `json:"trackedAt"`
	TrackedToUser bool      `json:"trackedToUser"`
}

type ItemWithCurrentLocationResponse struct {
	ItemResponse
	CurrentLocation CurrentLocation `json:"currentLocation"`
}

type ItemCurrentLocation struct {
	ID   uuid.UUID `json:"id"`
	Name string    `json:"name"`
}

type CreateItemRequest struct {
	Identifier  string    `json:"identifier"`
	Reference   string    `json:"reference"`
	Description *string   `json:"description"`
	GroupKey    string    `json:"groupKey"`
	LocationID  uuid.UUID `json:"locationId"`
}

func (cir *CreateItemRequest) Validate() error {
	if cir.Reference == "" {
		return ErrInvalidItemReference
	}
	return nil
}
