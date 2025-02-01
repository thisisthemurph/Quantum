package service

import "quantum/internal/repository"

type Services struct {
	UserService     *UserService
	ItemService     *ItemService
	LocationService *LocationService
	SettingsService *SettingsService
}

func NewServices(repos *repository.Repositories) *Services {
	return &Services{
		UserService:     NewUserService(repos.UserRepository),
		ItemService:     NewItemService(repos.ItemRepository, repos.ItemHistoryRepository, repos.LocationRepository, repos.UserRepository),
		LocationService: NewLocationService(repos.LocationRepository),
		SettingsService: NewSettingsService(repos.SettingsRepository),
	}
}
