package dto

import (
	"github.com/google/uuid"
	"quantum/internal/model"
	"quantum/internal/permissions"
	"time"
)

type UserResponse struct {
	ID             uuid.UUID                  `json:"id"`
	Name           string                     `json:"name"`
	Username       string                     `json:"username"`
	Roles          permissions.RoleCollection `json:"roles"`
	LastLoggedInAt *time.Time                 `json:"lastLoggedInAt"`
	CreatedAt      time.Time                  `json:"createdAt"`
	UpdatedAt      time.Time                  `json:"updatedAt"`
}

func NewUserResponseFromModel(m model.User) UserResponse {
	return UserResponse{
		ID:             m.ID,
		Name:           m.Name,
		Username:       m.Username,
		Roles:          m.Roles,
		LastLoggedInAt: m.LastLoggedInAt,
		CreatedAt:      m.CreatedAt,
		UpdatedAt:      m.UpdatedAt,
	}
}
