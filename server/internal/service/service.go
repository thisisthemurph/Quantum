package service

import "quantum/internal/repository"

type Services struct {
	ItemService     *ItemService
	LocationService *LocationService
	SettingsService *SettingsService
}

func NewServices(repos *repository.Repositories) *Services {
	return &Services{
		ItemService:     NewItemService(repos.ItemRepository, repos.ItemHistoryRepository, repos.LocationRepository),
		LocationService: NewLocationService(repos.LocationRepository),
		SettingsService: NewSettingsService(repos.SettingsRepository),
	}
}
