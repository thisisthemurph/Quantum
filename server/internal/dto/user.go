package dto

import (
	"github.com/google/uuid"
	"quantum/internal/model"
)

type UserResponse struct {
	ID    uuid.UUID `json:"id"`
	Name  string    `json:"name"`
	Email string    `json:"email"`
}

func NewUserResponseFromModel(userModel model.User) UserResponse {
	return UserResponse{
		ID:    userModel.ID,
		Name:  userModel.Name,
		Email: userModel.Email,
	}
}
