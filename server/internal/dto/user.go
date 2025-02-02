package dto

import (
	"github.com/google/uuid"
	"quantum/internal/model"
	"quantum/internal/permissions"
)

type UserResponse struct {
	ID       uuid.UUID                  `json:"id"`
	Name     string                     `json:"name"`
	Username string                     `json:"username"`
	Roles    permissions.RoleCollection `json:"roles"`
}

func NewUserResponseFromModel(m model.User) UserResponse {
	return UserResponse{
		ID:       m.ID,
		Name:     m.Name,
		Username: m.Username,
		Roles:    m.Roles,
	}
}
