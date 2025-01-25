package dto

import (
	"errors"
	"github.com/google/uuid"
	"quantum/internal/model"
	"time"
)

var ErrInvalidLocationName = errors.New("invalid location name")

type LocationResponse struct {
	ID          uuid.UUID `json:"id"`
	Name        string    `json:"name"`
	Description *string   `json:"description"`
	IsDeleted   bool      `json:"isDeleted"`
	CreatedAt   time.Time `json:"createdAt"`
	UpdatedAt   time.Time `json:"updatedAt"`
}

func NewLocationResponseFromModel(l model.LocationModel) LocationResponse {
	return LocationResponse{
		ID:          l.ID,
		Name:        l.Name,
		Description: l.Description,
		IsDeleted:   l.IsDeleted,
		CreatedAt:   l.CreatedAt,
		UpdatedAt:   l.UpdatedAt,
	}
}

type CreateLocationRequest struct {
	Name        string  `json:"name"`
	Description *string `json:"description"`
}

func (clr *CreateLocationRequest) Validate() error {
	if clr.Name == "" {
		return ErrInvalidLocationName
	}
	return nil
}
