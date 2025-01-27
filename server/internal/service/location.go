package service

import (
	"database/sql"
	"errors"
	"github.com/google/uuid"
	"quantum/internal/dto"
	"quantum/internal/model"
	"quantum/internal/repository"
)

var ErrLocationNotFound = errors.New("location not found")

type LocationService struct {
	locationRepo repository.LocationRepository
}

func NewLocationService(locationRepo repository.LocationRepository) *LocationService {
	return &LocationService{
		locationRepo: locationRepo,
	}
}

func (s *LocationService) Get(locationID uuid.UUID) (dto.LocationResponse, error) {
	l, err := s.locationRepo.Get(locationID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return dto.LocationResponse{}, ErrLocationNotFound
		}
		return dto.LocationResponse{}, err
	}

	location := dto.LocationResponse{
		ID:          l.ID,
		Name:        l.Name,
		Description: l.Description,
		CreatedAt:   l.CreatedAt,
		UpdatedAt:   l.UpdatedAt,
	}

	return location, nil
}

func (s *LocationService) List(max *int, filter string, includeDeleted bool) ([]dto.LocationResponse, error) {
	locations, err := s.locationRepo.List(max, filter, includeDeleted)
	if err != nil {
		return nil, err
	}

	var locationResponses = make([]dto.LocationResponse, 0)
	for _, locationModel := range locations {
		location := dto.NewLocationResponseFromModel(locationModel)
		locationResponses = append(locationResponses, location)
	}

	return locationResponses, nil
}

func (s *LocationService) Create(request dto.CreateLocationRequest) (dto.LocationResponse, error) {
	if err := request.Validate(); err != nil {
		return dto.LocationResponse{}, err
	}

	locationModel := model.LocationModel{
		Name:        request.Name,
		Description: request.Description,
	}

	if err := s.locationRepo.Create(&locationModel); err != nil {
		return dto.LocationResponse{}, err
	}

	locationResponse := dto.NewLocationResponseFromModel(locationModel)
	return locationResponse, nil
}

func (s *LocationService) Delete(locationID uuid.UUID) error {
	if err := s.locationRepo.MarkDeleted(locationID); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return ErrLocationNotFound
		}
		return err
	}

	return s.locationRepo.MarkDeleted(locationID)
}
