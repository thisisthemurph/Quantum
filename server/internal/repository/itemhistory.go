package repository

import (
	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
)

type ItemHistoryRepository interface {
	GetItemCurrentLocationID(itemID uuid.UUID) (uuid.UUID, error)
}

type postgresItemHistoryRepository struct {
	db *sqlx.DB
}

func NewItemHistoryRepository(db *sqlx.DB) ItemHistoryRepository {
	return &postgresItemHistoryRepository{
		db: db,
	}
}

func (r *postgresItemHistoryRepository) GetItemCurrentLocationID(itemID uuid.UUID) (uuid.UUID, error) {
	var locationID string
	stmt := `
		select data->'data'->>'locationId' as location_id
		from item_history
		where item_id = $1
		and (data->>'type' = 'tracked' or data->>'type' = 'created')
		order by created_at desc
		limit 1;`

	err := r.db.Get(&locationID, stmt, itemID)
	if err != nil {
		return uuid.UUID{}, err
	}
	value := uuid.MustParse(locationID)
	return value, nil
}
