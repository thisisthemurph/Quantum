package auth

import "errors"

const PasswordMinLength int = 8

var ErrPasswordTooShort = errors.New("password too short")

type Password string

func NewPassword(password string) Password {
	return Password(password)
}

func (p Password) String() string {
	return string(p)
}

func (p Password) Validate() error {
	if len(p) < PasswordMinLength {
		return ErrPasswordTooShort
	}
	return nil
}
