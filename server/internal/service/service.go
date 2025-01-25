package service

import "quantum/internal/repository"

type Services struct {
	ItemService *ItemService
}

func NewServices(repos *repository.Repositories) *Services {
	return &Services{
		ItemService: NewItemService(repos.ItemRepository),
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
