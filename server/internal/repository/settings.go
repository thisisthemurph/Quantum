package repository

import (
	"encoding/json"
	"github.com/jmoiron/sqlx"
	"quantum/internal/model"
)

type SettingsRepository interface {
	Get() (model.SettingsModel, error)
	Upsert(settingsData json.RawMessage) error
}

type postgresSettingsRepository struct {
	db *sqlx.DB
}

func NewPostgresSettingsRepository(db *sqlx.DB) SettingsRepository {
	return &postgresSettingsRepository{
		db: db,
	}
}

// Get retrieves the settings from the database.
// The database is not tenanted so we don't need to pass in an ID, there should only be one row in the settings table.
func (r *postgresSettingsRepository) Get() (model.SettingsModel, error) {
	var settings model.SettingsModel
	err := r.db.Get(&settings, "SELECT id, data FROM settings LIMIT 1;")
	return settings, err
}

func (r *postgresSettingsRepository) Upsert(settingsData json.RawMessage) error {
	stmt := `
		insert into settings (id, data)
		values (1, $1)
		on conflict (id) do update
		set data = $1;`

	_, err := r.db.Exec(stmt, settingsData)
	return err
}
