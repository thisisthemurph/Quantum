package repository

import (
	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
	"quantum/internal/model"
)

type ItemRepository interface {
	GetByID(id uuid.UUID) (model.ItemModel, error)
	List(groupKey *string) ([]model.ItemWithCurrentLocationModel, error)
	ListByLocationID(locationID uuid.UUID) ([]model.ItemWithCurrentLocationModel, error)
	ListItemGroups(max int, filter string) ([]string, error)
	GroupKeyExists(groupKey string) (bool, error)
	Create(item *model.ItemModel) error
	Delete(id uuid.UUID) error
}

type postgresItemRepository struct {
	db *sqlx.DB
}

func NewItemRepository(db *sqlx.DB) ItemRepository {
	return &postgresItemRepository{
		db: db,
	}
}

func (r *postgresItemRepository) GetByID(id uuid.UUID) (model.ItemModel, error) {
	stmt := "select * from items where id = $1;"
	var item model.ItemModel
	if err := r.db.Get(&item, stmt, id); err != nil {
		return model.ItemModel{}, err
	}
	return item, nil
}

func (r *postgresItemRepository) List(groupKey *string) ([]model.ItemWithCurrentLocationModel, error) {
	stmt := `
		select * 
		from items_with_current_location
		where ($1::text is null or group_key = $1);`

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
	stmt := "select * from items_with_current_location where location_id = $1;"

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

func (r *postgresItemRepository) Create(item *model.ItemModel) error {
	stmt := `
		insert into items (identifier, reference, description, group_key) 
		values ($1, $2, $3, $4)
		returning id, created_at, updated_at;`

	return r.db.Get(item, stmt, item.Identifier, item.Reference, item.Description, item.GroupKey)
}

func (r *postgresItemRepository) Delete(id uuid.UUID) error {
	stmt := "delete from items where id = $1;"
	_, err := r.db.Exec(stmt, id)
	return err
}
