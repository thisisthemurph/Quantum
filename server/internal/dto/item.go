package dto

import (
	"errors"
	"github.com/google/uuid"
	"time"
)

var ErrInvalidItemReference = errors.New("invalid item reference")

type ItemResponse struct {
	ID          uuid.UUID `json:"id"`
	Reference   string    `json:"reference"`
	GroupKey    string    `json:"groupKey"`
	Description *string   `json:"description"`
	CreatedAt   time.Time `json:"createdAt"`
	UpdatedAt   time.Time `json:"updatedAt"`
}

type CreateItemRequest struct {
	Reference   string  `json:"reference"`
	Description *string `json:"description"`
	GroupKey    string  `json:"groupKey"`
}

func (cir *CreateItemRequest) Validate() error {
	if cir.Reference == "" {
		return ErrInvalidItemReference
	}
	return nil
}
