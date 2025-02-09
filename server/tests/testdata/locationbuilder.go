package testdata

import (
	"github.com/jmoiron/sqlx"
	"quantum/internal/model"
	"testing"
)

type LocationBuilder struct {
	t     *testing.T
	db    *sqlx.DB
	model *model.LocationModel
}

func NewLocationBuilder(t *testing.T, db *sqlx.DB) *LocationBuilder {
	return &LocationBuilder{
		t:     t,
		db:    db,
		model: &model.LocationModel{},
	}
}

func (b *LocationBuilder) WithName(name string) *LocationBuilder {
	b.model.Name = name
	return b
}

func (b *LocationBuilder) WithDescription(description string) *LocationBuilder {
	b.model.Description = &description
	return b
}

func (b *LocationBuilder) AsDeleted() *LocationBuilder {
	b.model.IsDeleted = true
	return b
}

func (b *LocationBuilder) Build() *model.LocationModel {
	insert := `
		insert into locations (name, description, is_deleted)
	    values ($1, $2, $3)
	    returning id, created_at, updated_at;`

	if err := b.db.Get(b.model, insert, b.model.Name, b.model.Description, b.model.IsDeleted); err != nil {
		b.t.Fatalf("failed to insert location: %v", err)
	}
	return b.model
}
