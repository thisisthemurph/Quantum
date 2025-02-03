package testutils

import (
	"fmt"
	"log/slog"
	"os"
	"quantum/internal/app"
)

var AppConfig = app.Config{
	Host:          ":8000",
	ClientBaseURL: "http://localhost:5173",
	SessionSecret: "secret",
	Environment:   app.DevelopmentEnvironment,
	Database: app.DatabaseConfig{
		Name:             "quantumdb_test",
		ConnectionString: "postgresql://postgres:postgres@127.0.0.1:5433/quantumdb_test?sslmode=disable",
	},
}

func BuildTestApp() *app.App {
	application := app.App{
		Config: &AppConfig,
		Logger: slog.New(slog.NewTextHandler(os.Stdout, nil)),
	}

	if err := application.Build(); err != nil {
		panic(fmt.Errorf("failed to build application: %w", err))
	}

	return &application
}
