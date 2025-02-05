package repository

import "github.com/jmoiron/sqlx"

type Repositories struct {
	UserRepository     UserRepository
	ItemRepository     ItemRepository
	LocationRepository LocationRepository
	SettingsRepository SettingsRepository
}

func NewRepositories(db *sqlx.DB) *Repositories {
	return &Repositories{
		UserRepository:     NewUserRepository(db),
		ItemRepository:     NewItemRepository(db),
		LocationRepository: NewLocationRepository(db),
		SettingsRepository: NewPostgresSettingsRepository(db),
	}
}
