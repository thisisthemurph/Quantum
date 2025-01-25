package service

import "quantum/internal/repository"

type Services struct {
	ItemService     *ItemService
	LocationService *LocationService
}

func NewServices(repos *repository.Repositories) *Services {
	return &Services{
		ItemService:     NewItemService(repos.ItemRepository),
		LocationService: NewLocationService(repos.LocationRepository),
	}
}

// FromPtr returns the value of a pointer if it is not nil,
// otherwise it returns the zero value of the type.
func fromPtr[T any](value *T) T {
	if value == nil {
		return *new(T)
	}
	return *value
}
