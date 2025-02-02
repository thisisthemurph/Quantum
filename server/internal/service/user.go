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

func (s *UserService) GetByEmail(email string) (dto.UserResponse, error) {
	userModel, err := s.userRepo.GetByEmail(email)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return dto.UserResponse{}, ErrUserNotFound
		}
		return dto.UserResponse{}, err
	}
	return dto.NewUserResponseFromModel(userModel), nil
}

func (s *UserService) Create(user dto.SignUpRequest, role permissions.Role) (dto.UserResponse, error) {
	hash, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
	if err != nil {
		return dto.UserResponse{}, fmt.Errorf("failed to hash password: %w", err)
	}

	userModel := model.User{
		Name:     user.Name,
		Email:    user.Email,
		Password: hash,
		Roles:    permissions.RoleCollection{role},
	}

	if err := s.userRepo.Create(&userModel); err != nil {
		return dto.UserResponse{}, err
	}

	return dto.NewUserResponseFromModel(userModel), nil
}

func (s *UserService) VerifyPassword(email, password string) (dto.UserResponse, error) {
	user, err := s.userRepo.GetByEmail(email)
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
