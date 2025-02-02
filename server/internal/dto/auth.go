package dto

import "errors"

var ErrNameRequired = errors.New("name is required")
var ErrUsernameRequired = errors.New("username is required")
var ErrPasswordRequired = errors.New("password is required")

type SignUpRequest struct {
	Name     string `json:"name"`
	Username string `json:"username"`
	Password string `json:"password"`
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
	return nil
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
