package dto

import (
	"errors"
	"quantum/internal/types/auth"
)

var ErrNameRequired = errors.New("name is required")
var ErrUsernameRequired = errors.New("username is required")
var ErrPasswordRequired = errors.New("password is required")
var ErrPasswordSame = errors.New("old and new passwords are the same")

type SignUpRequest struct {
	Name     string        `json:"name"`
	Username string        `json:"username"`
	Password auth.Password `json:"password"`
}

func (r *SignUpRequest) Validate() error {
	if r.Name == "" {
		return ErrNameRequired
	}
	if r.Username == "" {
		return ErrUsernameRequired
	}
	if r.Password == "" {
		return ErrPasswordRequired
	}
	return r.Password.Validate()
}

type LoginRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

func (l *LoginRequest) Validate() error {
	if l.Username == "" {
		return ErrUsernameRequired
	}
	if l.Password == "" {
		return ErrPasswordRequired
	}
	return nil
}

type UpdatePasswordRequest struct {
	CurrentPassword auth.Password `json:"currentPassword"`
	NewPassword     auth.Password `json:"newPassword"`
}

func (r *UpdatePasswordRequest) Validate() error {
	if r.CurrentPassword == r.NewPassword {
		return ErrPasswordSame
	}
	return r.NewPassword.Validate()
}
