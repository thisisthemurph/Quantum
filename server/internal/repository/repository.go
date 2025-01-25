package repository

import "github.com/jmoiron/sqlx"

type Repositories struct {
	ItemRepository     ItemRepository
	LocationRepository LocationRepository
}

func NewRepositories(db *sqlx.DB) *Repositories {
	return &Repositories{
		ItemRepository:     NewItemRepository(db),
		LocationRepository: NewLocationRepository(db),
	}
}
