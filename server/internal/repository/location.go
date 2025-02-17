package repository

import (
	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
	"quantum/internal/model"
)

type LocationRepository interface {
	List(max *int, filter string, includeDeleted bool) ([]model.LocationModel, error)
	Get(id uuid.UUID) (model.LocationModel, error)
	Create(location *model.LocationModel) error
	MarkDeleted(id uuid.UUID) error
}

type postgresLocationRepository struct {
	db *sqlx.DB
}

func NewLocationRepository(db *sqlx.DB) LocationRepository {
	return &postgresLocationRepository{
		db: db,
	}
}

func (r *postgresLocationRepository) List(max *int, filter string, includeDeleted bool) ([]model.LocationModel, error) {
	stmt := `
		with trackable_locations as (
			select
				id,
				name,
				description,
				is_deleted,
				created_at,
				updated_at,
				false as is_user
			from locations
			where name ilike '%' || $1 || '%'
				and ($2 = true or is_deleted = false)
		
			union
		
			select
				u.id,
				u.name,
				u.username as description,
				false as is_deleted,
				u.created_at,
				u.updated_at,
				true as is_user
			from users u
			join user_roles ur on u.id = ur.user_id
			where u.deleted_at is null
				and ur.role = 'tracker'
		)
		select *
		from trackable_locations
		order by name;`

	var locations = make([]model.LocationModel, 0)
	if err := r.db.Select(&locations, stmt, filter, includeDeleted); err != nil {
		return nil, err
	}
	return locations, nil
}

func (r *postgresLocationRepository) Get(id uuid.UUID) (model.LocationModel, error) {
	stmt := "select * from locations where id = $1;"
	var location model.LocationModel
	if err := r.db.Get(&location, stmt, id); err != nil {
		return model.LocationModel{}, err
	}
	return location, nil
}

func (r *postgresLocationRepository) Create(location *model.LocationModel) error {
	stmt := `
		insert into locations (name, description) 
		values ($1, $2)
		returning id, created_at, updated_at;`

	return r.db.Get(location, stmt, location.Name, location.Description)
}

func (r *postgresLocationRepository) MarkDeleted(id uuid.UUID) error {
	stmt := "update locations set is_deleted = true where id = $1;"
	_, err := r.db.Exec(stmt, id)
	return err
}
