package app

import (
	"fmt"
	"log/slog"
	"os"

	"github.com/jmoiron/sqlx"
	_ "github.com/lib/pq"
)

type App struct {
	DB     *sqlx.DB
	Config *Config
	Logger *slog.Logger
}

func mustGetenv(key string) string {
	value := os.Getenv(key)
	if value == "" {
		panic(fmt.Sprintf("environment variable %s is required", key))
	}
	return value
}

func NewApp(logger *slog.Logger) (*App, error) {
	config := NewAppConfig(mustGetenv)
	return &App{
		Config: config,
		Logger: logger,
	}, nil
}

func (app *App) Build() error {
	if err := app.configureDatabase(); err != nil {
		return err
	}
	return nil
}

func (app *App) configureDatabase() error {
	db, err := sqlx.Open("postgres", app.Config.Database.ConnectionString)
	if err != nil {
		return fmt.Errorf("could not connect to database: %w", err)
	}

	if err := db.Ping(); err != nil {
		return fmt.Errorf("could not ping database: %w", err)
	}

	app.DB = db
	return nil
}
