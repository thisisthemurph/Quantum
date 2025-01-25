package repository

import (
	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
	"quantum/internal/model"
)

type ItemRepository interface {
	GetByID(id uuid.UUID) (model.ItemModel, error)
	List() ([]model.ItemModel, error)
	ListItemGroups() ([]string, error)
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

func (r *postgresItemRepository) List() ([]model.ItemModel, error) {
	stmt := "select * from items;"
	var items = make([]model.ItemModel, 0)
	if err := r.db.Select(&items, stmt); err != nil {
		return nil, err
	}
	return items, nil
}

func (r *postgresItemRepository) ListItemGroups() ([]string, error) {
	stmt := "select distinct group_key from items order by group_key;"
	var groups = make([]string, 0)
	if err := r.db.Select(&groups, stmt); err != nil {
		return nil, err
	}
	return groups, nil
}

func (r *postgresItemRepository) Create(item *model.ItemModel) error {
	stmt := `
		insert into items (reference, description, group_key) 
		values ($1, $2, $3)
		returning id, created_at, updated_at;`

	return r.db.Get(item, stmt, item.Reference, item.Description, item.GroupKey)
}

func (r *postgresItemRepository) Delete(id uuid.UUID) error {
	stmt := "delete from items where id = $1;"
	_, err := r.db.Exec(stmt, id)
	return err
}
