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

var ErrUserNotFound = fmt.Errorf("user not found")

type UserService struct {
	userRepo repository.UserRepository
}

func NewUserService(userRepo repository.UserRepository) *UserService {
	return &UserService{
		userRepo: userRepo,
	}
}

func (s *UserService) List() ([]dto.UserResponse, error) {
	users, err := s.userRepo.List()
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
		return dto.UserResponse{}, err
	}

	return dto.NewUserResponseFromModel(userModel), nil
}

func (s *UserService) VerifyPassword(username, password string) (dto.UserResponse, error) {
	user, err := s.userRepo.GetByUsername(username)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return dto.UserResponse{}, ErrUserNotFound
		}
	}

	if err := bcrypt.CompareHashAndPassword(user.Password, []byte(password)); err != nil {
		return dto.UserResponse{}, fmt.Errorf("invalid password: %w", err)
	}

	return dto.NewUserResponseFromModel(user), nil
}

func (s *UserService) CountUsers() (int, error) {
	return s.userRepo.Count()
}
