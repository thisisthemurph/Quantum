package dto

import "errors"

var ErrNameRequired = errors.New("name is required")
var ErrEmailRequired = errors.New("email is required")
var ErrPasswordRequired = errors.New("password is required")

type RegisterRequest struct {
	Name     string `json:"name"`
	Email    string `json:"email"`
	Password string `json:"password"`
}

func (r *RegisterRequest) Validate() error {
	if r.Name == "" {
		return ErrNameRequired
	}
	if r.Email == "" {
		return ErrEmailRequired
	}
	if r.Password == "" {
		return ErrPasswordRequired
	}
	return nil
}

type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

func (l *LoginRequest) Validate() error {
	if l.Email == "" {
		return ErrEmailRequired
	}
	if l.Password == "" {
		return ErrPasswordRequired
	}
	return nil
}
