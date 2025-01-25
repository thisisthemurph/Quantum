package main

import (
	"fmt"
	"log/slog"
	"net/http"
	"os"
	"quantum/internal/handler"

	"github.com/joho/godotenv"

	"quantum/internal/app"
)

func init() {
	if err := godotenv.Load(); err != nil {
		panic("failed to load environment variables")
	}
}

func main() {
	if err := run(); err != nil {
		fmt.Fprintf(os.Stderr, "error: %v\n", err)
		os.Exit(1)
	}
}

func run() error {
	logger := makeLogger()
	application, err := app.NewApp(logger)
	if err != nil {
		return fmt.Errorf("error creating new application: %w", err)
	}

	logger.Debug("Building application", "environment", application.Config.Environment)
	if err := application.Build(); err != nil {
		return fmt.Errorf("error building application: %w", err)
	}

	logger.Debug("Setting up routes...")
	mux := handler.BuildServerMux(application)

	logger.Debug("Starting server", "host", application.Config.Host)
	if err := http.ListenAndServe(application.Config.Host, mux); err != nil {
		return fmt.Errorf("failed to start server: %w", err)
	}

	return nil
}

func makeLogger() *slog.Logger {
	environment := app.NewEnvironment(os.Getenv("ENVIRONMENT"))

	logLevel := slog.LevelInfo
	if environment.IsDevelopment() {
		logLevel = slog.LevelDebug
	}

	return slog.New(slog.NewTextHandler(os.Stdout, &slog.HandlerOptions{
		AddSource: true,
		Level:     logLevel,
	}))
}
