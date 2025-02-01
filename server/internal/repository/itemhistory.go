package repository

import (
	"encoding/json"
	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
	"quantum/internal/model"
)

type ItemHistoryRepository interface {
	GetItemCurrentLocationID(itemID uuid.UUID) (uuid.UUID, error)
	GetItemHistory(itemID uuid.UUID) ([]model.ItemHistoryModel, error)
	ItemCreated(userID uuid.UUID, item model.ItemModel, locationID uuid.UUID) error
	ItemTracked(userID, itemID, locationID uuid.UUID) error
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
		and data->>'type' = 'tracked' or data->>'type' = 'created'
		order by created_at desc
		limit 1;`

	err := r.db.Get(&locationID, stmt, itemID)
	if err != nil {
		return uuid.UUID{}, err
	}
	value := uuid.MustParse(locationID)
	return value, nil
}

func (r *postgresItemHistoryRepository) GetItemHistory(itemID uuid.UUID) ([]model.ItemHistoryModel, error) {
	stmt := `
		select *
		from item_history
		where item_id = $1
		order by created_at desc;`

	var histories = make([]model.ItemHistoryModel, 0)
	if err := r.db.Select(&histories, stmt, itemID); err != nil {
		return nil, err
	}
	return histories, nil
}

func (r *postgresItemHistoryRepository) ItemCreated(userID uuid.UUID, item model.ItemModel, locationID uuid.UUID) error {
	historyData := model.ItemCreatedHistoryData{
		Reference:   item.Reference,
		GroupKey:    item.GroupKey,
		Description: item.Description,
		LocationID:  locationID,
	}

	jsonData, err := json.Marshal(historyData)
	if err != nil {
		return err
	}

	history := model.HistoryDataContainer{
		Type: model.ItemHistoryTypeCreated,
		Data: jsonData,
	}

	jsonHistoryData, err := json.Marshal(history)
	if err != nil {
		return err
	}

	stmt := `
		insert into item_history (user_id, item_id, data)
		values ($1, $2, $3);`

	_, err = r.db.Exec(stmt, userID, item.ID, jsonHistoryData)
	if err != nil {
		return err
	}
	return nil
}

func (r *postgresItemHistoryRepository) ItemTracked(userID, itemID, locationID uuid.UUID) error {
	historyData := model.ItemTrackedHistoryData{
		LocationID: locationID,
	}

	jsonData, err := json.Marshal(historyData)
	if err != nil {
		return err
	}

	history := model.HistoryDataContainer{
		Type: model.ItemHistoryTypeTracked,
		Data: jsonData,
	}

	jsonHistoryData, err := json.Marshal(history)
	if err != nil {
		return err
	}

	stmt := `
		insert into item_history (user_id, item_id, data)
		values ($1, $2, $3);`

	_, err = r.db.Exec(stmt, userID, itemID, jsonHistoryData)
	if err != nil {
		return err
	}
	return nil
}
