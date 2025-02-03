package testutils

import (
	"github.com/jmoiron/sqlx"
	"testing"
)

func CleanDatabase(t *testing.T, db *sqlx.DB) {
	t.Helper()
	_, err := db.Exec(`
		DELETE FROM item_history;
		DELETE FROM locations;
		DELETE FROM items;
		DELETE FROM settings;
		DELETE FROM users;
		DELETE FROM user_roles;
	`)

	if err != nil {
		t.Fatalf("failed to clean database: %v", err)
	}
}
