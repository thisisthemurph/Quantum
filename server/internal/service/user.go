package service

import (
	"database/sql"
	"errors"
	"fmt"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
	"quantum/internal/dto"
	"quantum/internal/model"
	"quantum/internal/permissions"
	"quantum/internal/repository"
)

var (
	ErrUserNotFound        = errors.New("user not found")
	ErrUserUsernameExists  = errors.New("username already exists")
	ErrPasswordsDoNotMatch = errors.New("passwords do not match")
)

type UserService struct {
	userRepo repository.UserRepository
}

func NewUserService(userRepo repository.UserRepository) *UserService {
	return &UserService{
		userRepo: userRepo,
	}
}

func (s *UserService) List(roleFilters []string) ([]dto.UserResponse, error) {
	users, err := s.userRepo.List(roleFilters)
	if err != nil {
		return nil, err
	}

	userResponses := make([]dto.UserResponse, 0, len(users))
	for _, user := range users {
		userResponses = append(userResponses, dto.NewUserResponseFromModel(user))
	}

	return userResponses, nil
}

func (s *UserService) Get(id uuid.UUID) (dto.UserResponse, error) {
	userModel, err := s.userRepo.Get(id)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return dto.UserResponse{}, ErrUserNotFound
		}
		return dto.UserResponse{}, err
	}
	return dto.NewUserResponseFromModel(userModel), nil
}

func (s *UserService) GetByUsername(username string) (dto.UserResponse, error) {
	userModel, err := s.userRepo.GetByUsername(username)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return dto.UserResponse{}, ErrUserNotFound
		}
		return dto.UserResponse{}, err
	}
	return dto.NewUserResponseFromModel(userModel), nil
}

func (s *UserService) Create(name, username, password string, roles permissions.RoleCollection) (dto.UserResponse, error) {
	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return dto.UserResponse{}, fmt.Errorf("failed to hash password: %w", err)
	}

	userModel := model.User{
		Name:     name,
		Username: username,
		Password: hash,
		Roles:    roles,
	}

	if err := s.userRepo.Create(&userModel); err != nil {
		if errors.Is(err, repository.ErrUserUsernameExists) {
			return dto.UserResponse{}, ErrUserUsernameExists
		}
		return dto.UserResponse{}, err
	}

	return dto.NewUserResponseFromModel(userModel), nil
}

func (s *UserService) Update(id uuid.UUID, name, username string, roles permissions.RoleCollection) (dto.UserResponse, error) {
	u := &model.User{
		ID:       id,
		Name:     name,
		Username: username,
		Roles:    roles,
	}

	err := s.userRepo.Update(u)
	if err != nil {
		return dto.UserResponse{}, err
	}

	return dto.NewUserResponseFromModel(*u), err
}

func (s *UserService) UpdatePassword(userID uuid.UUID, currentPassword, password string) error {
	if err := s.VerifyPassword(userID, currentPassword); err != nil {
		return err
	}

	newPasswordHash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return fmt.Errorf("failed to hash password: %w", err)
	}
	return s.userRepo.UpdatePassword(userID, newPasswordHash)
}

func (s *UserService) UpdateLastLoggedIn(userID uuid.UUID) error {
	return s.userRepo.UpdateLastLoggedIn(userID)
}

func (s *UserService) Delete(id uuid.UUID) error {
	return s.userRepo.Delete(id)
}

func (s *UserService) VerifyPassword(userID uuid.UUID, password string) error {
	user, err := s.userRepo.Get(userID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return ErrUserNotFound
		}
		return err
	}

	if err := bcrypt.CompareHashAndPassword(user.Password, []byte(password)); err != nil {
		return ErrPasswordsDoNotMatch
	}
	return nil
}

func (s *UserService) VerifyPasswordByUsername(username, password string) (dto.UserResponse, error) {
	user, err := s.userRepo.GetByUsername(username)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return dto.UserResponse{}, ErrUserNotFound
		}
		return dto.UserResponse{}, err
	}

	if err := bcrypt.CompareHashAndPassword(user.Password, []byte(password)); err != nil {
		return dto.UserResponse{}, ErrPasswordsDoNotMatch
	}

	return dto.NewUserResponseFromModel(user), nil
}

func (s *UserService) CountUsers() (int, error) {
	return s.userRepo.Count()
}
