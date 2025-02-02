package dto

import (
	"github.com/google/uuid"
	"quantum/internal/model"
	"quantum/internal/permissions"
)

type UserResponse struct {
	ID    uuid.UUID                  `json:"id"`
	Name  string                     `json:"name"`
	Email string                     `json:"email"`
	Roles permissions.RoleCollection `json:"roles"`
}

func NewUserResponseFromModel(m model.User) UserResponse {
	return UserResponse{
		ID:    m.ID,
		Name:  m.Name,
		Email: m.Email,
		Roles: m.Roles,
	}
}
