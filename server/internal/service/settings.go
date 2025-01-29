package service

import (
	"database/sql"
	"encoding/json"
	"errors"
	"quantum/internal/dto"
	"quantum/internal/repository"
)

type SettingsService struct {
	settingsRepository repository.SettingsRepository
}

func NewSettingsService(sr repository.SettingsRepository) *SettingsService {
	return &SettingsService{
		settingsRepository: sr,
	}
}

var defaultSettings = dto.SettingsResponse{
	Terminology: dto.TerminologySettingsResponse{
		Item:      "Item",
		Items:     "Items",
		Location:  "Location",
		Locations: "Locations",
		Group:     "Group",
		Groups:    "Groups",
	},
}

func (s *SettingsService) Get() (dto.SettingsResponse, error) {
	settingsModel, err := s.settingsRepository.Get()
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return defaultSettings, nil
		}
		return dto.SettingsResponse{}, err
	}

	settings, err := dto.NewSettingsResponseFromModel(settingsModel)
	ensureSettingsDefaults(&settings)
	return settings, nil
}

func (s *SettingsService) Update(settings dto.SettingsResponse) error {
	jsonData, err := json.Marshal(settings)
	if err != nil {
		return err
	}
	return s.settingsRepository.Upsert(jsonData)
}

func ensureSettingsDefaults(s *dto.SettingsResponse) {
	if s.Terminology.Item == "" {
		s.Terminology.Item = defaultSettings.Terminology.Item
	}
	if s.Terminology.Items == "" {
		s.Terminology.Items = defaultSettings.Terminology.Items
	}
	if s.Terminology.Location == "" {
		s.Terminology.Location = defaultSettings.Terminology.Location
	}
	if s.Terminology.Locations == "" {
		s.Terminology.Locations = defaultSettings.Terminology.Locations
	}
	if s.Terminology.Group == "" {
		s.Terminology.Group = defaultSettings.Terminology.Group
	}
	if s.Terminology.Groups == "" {
		s.Terminology.Groups = defaultSettings.Terminology.Groups
	}
}
