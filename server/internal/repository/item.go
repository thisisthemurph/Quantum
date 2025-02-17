package repository

import (
	"encoding/json"
	"fmt"
	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
	"quantum/internal/model"
)

type ItemRepository interface {
	Get(id uuid.UUID) (model.ItemModel, error)
	GetWithCurrentLocation(id uuid.UUID) (model.ItemWithCurrentLocationModel, error)
	GetItemHistory(itemID uuid.UUID) ([]model.ItemHistoryModel, error)
	List(groupKey *string) ([]model.ItemWithCurrentLocationModel, error)
	ListByLocationID(locationID uuid.UUID) ([]model.ItemWithCurrentLocationModel, error)
	ListItemGroups(max int, filter string) ([]string, error)
	GroupKeyExists(groupKey string) (bool, error)
	Create(item *model.ItemModel, createdByUserID, createdAtLocationID uuid.UUID) error
	Delete(itemID, userID uuid.UUID) error
	AppendNewItemTrackedToLocationHistory(userID, itemID, locationID uuid.UUID) error
	AppendNewItemTrackedToUserHistory(trackingUser, toUserID, itemID uuid.UUID) error
}

type postgresItemRepository struct {
	db *sqlx.DB
}

func NewItemRepository(db *sqlx.DB) ItemRepository {
	return &postgresItemRepository{
		db: db,
	}
}

func (r *postgresItemRepository) Get(id uuid.UUID) (model.ItemModel, error) {
	stmt := "select * from items where id = $1;"
	var item model.ItemModel
	if err := r.db.Get(&item, stmt, id); err != nil {
		return model.ItemModel{}, err
	}
	return item, nil
}

func (r *postgresItemRepository) GetWithCurrentLocation(id uuid.UUID) (model.ItemWithCurrentLocationModel, error) {
	stmt := "select * from items_with_current_location where id = $1;"
	var item model.ItemWithCurrentLocationModel
	if err := r.db.Get(&item, stmt, id); err != nil {
		return model.ItemWithCurrentLocationModel{}, err
	}
	return item, nil
}

func (r *postgresItemRepository) List(groupKey *string) ([]model.ItemWithCurrentLocationModel, error) {
	stmt := `
		select * 
		from items_with_current_location
		where ($1::text is null or group_key = $1)
			and deleted = false;`

	var items = make([]model.ItemWithCurrentLocationModel, 0)
	if err := r.db.Select(&items, stmt, groupKey); err != nil {
		return nil, err
	}
	return items, nil
}

func (r *postgresItemRepository) ListItemGroups(max int, filter string) ([]string, error) {
	stmt := `
		select distinct group_key 
		from items
		where ($1 = '' or group_key ilike '%' || $1 || '%')
		order by group_key 
		limit $2;`

	var groups = make([]string, 0)
	if err := r.db.Select(&groups, stmt, filter, max); err != nil {
		return nil, err
	}
	return groups, nil
}

func (r *postgresItemRepository) ListByLocationID(locationID uuid.UUID) ([]model.ItemWithCurrentLocationModel, error) {
	stmt := "select * from items_with_current_location where location_id = $1 and deleted = false;"

	var items = make([]model.ItemWithCurrentLocationModel, 0)
	if err := r.db.Select(&items, stmt, locationID); err != nil {
		return nil, err
	}
	return items, nil
}

func (r *postgresItemRepository) GroupKeyExists(groupKey string) (bool, error) {
	stmt := "select exists(select 1 from items where group_key = $1);"
	var exists bool
	if err := r.db.Get(&exists, stmt, groupKey); err != nil {
		return false, err
	}
	return exists, nil
}

func (r *postgresItemRepository) Create(item *model.ItemModel, createdByUserID, createdAtLocationID uuid.UUID) error {
	stmt := `
		insert into items (identifier, reference, description, group_key) 
		values ($1, $2, $3, $4)
		returning id, created_at, updated_at;`

	tx, err := r.db.Beginx()
	if err != nil {
		return fmt.Errorf("failed to start transaction: %w", err)
	}
	defer func() {
		if err != nil {
			_ = tx.Rollback()
		}
	}()

	if err = tx.Get(item, stmt, item.Identifier, item.Reference, item.Description, item.GroupKey); err != nil {
		return fmt.Errorf("failed to insert item: %w", err)
	}

	if err = r.updateHistoryOnItemCreation(tx, createdByUserID, createdAtLocationID, *item); err != nil {
		return fmt.Errorf("failed to update history: %w", err)
	}

	if err = tx.Commit(); err != nil {
		return fmt.Errorf("failed to commit transaction: %w", err)
	}

	return nil
}

func (r *postgresItemRepository) Delete(itemID, userID uuid.UUID) error {
	stmt := "update items set deleted = true where id = $1;"

	tx, err := r.db.Beginx()
	if err != nil {
		return fmt.Errorf("failed to start transaction: %w", err)
	}
	defer func() {
		if err != nil {
			_ = tx.Rollback()
		}
	}()

	_, err = tx.Exec(stmt, itemID)
	if err != nil {
		return fmt.Errorf("failed to delete item: %w", err)
	}

	if err = r.updateHistoryOnItemDeletion(tx, userID, itemID); err != nil {
		return fmt.Errorf("failed to update history: %w", err)
	}

	if err = tx.Commit(); err != nil {
		return fmt.Errorf("failed to commit transaction: %w", err)
	}

	return nil
}

func (r *postgresItemRepository) GetItemHistory(itemID uuid.UUID) ([]model.ItemHistoryModel, error) {
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

func (r *postgresItemRepository) AppendNewItemTrackedToLocationHistory(userID, itemID, locationID uuid.UUID) error {
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

func (r *postgresItemRepository) AppendNewItemTrackedToUserHistory(trackingUser, toUserID, itemID uuid.UUID) error {
	historyData := model.ItemTrackedUserHistoryData{
		UserID: toUserID,
	}

	jsonData, err := json.Marshal(historyData)
	if err != nil {
		return err
	}

	history := model.HistoryDataContainer{
		Type: model.ItemHistoryTypeTrackedUser,
		Data: jsonData,
	}

	jsonHistoryData, err := json.Marshal(history)
	if err != nil {
		return err
	}

	stmt := `
		insert into item_history (user_id, item_id, data)
		values ($1, $2, $3);`

	_, err = r.db.Exec(stmt, trackingUser, itemID, jsonHistoryData)
	if err != nil {
		return err
	}
	return nil
}

func (r *postgresItemRepository) insertHistoryRecord(tx *sqlx.Tx, userID, itemID uuid.UUID, data json.RawMessage) error {
	stmt := `
		insert into item_history (user_id, item_id, data)
		values ($1, $2, $3);`

	_, err := tx.Exec(stmt, userID, itemID, data)
	if err != nil {
		return err
	}

	return nil
}

func (r *postgresItemRepository) updateHistoryOnItemCreation(tx *sqlx.Tx, userID, locationID uuid.UUID, item model.ItemModel) error {
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

	if err := r.insertHistoryRecord(tx, userID, item.ID, jsonHistoryData); err != nil {
		return err
	}

	return nil
}

func (r *postgresItemRepository) updateHistoryOnItemDeletion(tx *sqlx.Tx, userID, itemID uuid.UUID) error {
	emptyJSONObject, err := json.Marshal(struct{}{})
	if err != nil {
		return err
	}

	history := model.HistoryDataContainer{
		Type: model.ItemHistoryTypeDeleted,
		Data: emptyJSONObject,
	}

	jsonHistoryData, err := json.Marshal(history)
	if err != nil {
		return err
	}

	if err := r.insertHistoryRecord(tx, userID, itemID, jsonHistoryData); err != nil {
		return err
	}

	return nil
}
