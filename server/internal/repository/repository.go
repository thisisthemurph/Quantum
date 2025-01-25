package repository

import "github.com/jmoiron/sqlx"

type Repositories struct {
	ItemRepository        ItemRepository
	ItemHistoryRepository ItemHistoryRepository
	LocationRepository    LocationRepository
}

func NewRepositories(db *sqlx.DB) *Repositories {
	return &Repositories{
		ItemRepository:        NewItemRepository(db),
		ItemHistoryRepository: NewItemHistoryRepository(db),
		LocationRepository:    NewLocationRepository(db),
	}
}
