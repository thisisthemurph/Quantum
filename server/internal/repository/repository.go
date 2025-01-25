package repository

import "github.com/jmoiron/sqlx"

type Repositories struct {
	ItemRepository ItemRepository
}

func NewRepositories(db *sqlx.DB) *Repositories {
	return &Repositories{
		ItemRepository: NewItemRepository(db),
	}
}
