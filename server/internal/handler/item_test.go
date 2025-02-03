package handler_test

import (
	"encoding/json"
	"fmt"
	"log/slog"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"

	"quantum/internal/app"
	"quantum/internal/dto"
	"quantum/internal/handler"
	"quantum/internal/model"
	"quantum/internal/repository"
	"quantum/internal/service"
	"quantum/pkg/migrator"
	"quantum/tests/testdata"
	"quantum/tests/testutils"

	"github.com/jmoiron/sqlx"
	"github.com/stretchr/testify/assert"
)

var application *app.App

const migrationsPath = "file://../../cmd/migrate/migrations"

func TestMain(m *testing.M) {
	application = testutils.BuildTestApp()

	mig := migrator.NewPostgresMigrator(application.DB.DB, application.Config.Database.Name, migrationsPath)
	err := mig.WithLogger(application.Logger).Migrate(migrator.MigrationDirectionUp)
	if err != nil {
		application.Logger.Error("error migrating database", "error", err)
		os.Exit(1)
	}

	exitCode := m.Run()

	err = mig.WithLogger(application.Logger).Migrate(migrator.MigrationDirectionDown)
	if err != nil {
		application.Logger.Error("error migrating database down", "error", err)
		os.Exit(1)
	}

	_, _ = application.DB.Exec("drop table if exists schema_migrations;")
	_ = application.DB.Close()
	os.Exit(exitCode)
}

func setUpItemHandler(db *sqlx.DB, logger *slog.Logger) *handler.ItemHandler {
	itemRepo := repository.NewItemRepository(db)
	historyRepo := repository.NewItemHistoryRepository(db)
	locationRepo := repository.NewLocationRepository(db)
	userRepo := repository.NewUserRepository(db)
	settingsRepo := repository.NewPostgresSettingsRepository(db)

	itemService := service.NewItemService(itemRepo, historyRepo, locationRepo, userRepo)
	settingsService := service.NewSettingsService(settingsRepo)

	return handler.NewItemHandler(itemService, settingsService, logger)
}

func TestGetItemByID(t *testing.T) {
	t.Cleanup(func() { testutils.CleanDatabase(t, application.DB) })
	h := setUpItemHandler(application.DB, application.Logger)

	adminUser := testdata.InsertAdminUser(t, application.DB)
	writerUser := testdata.InsertWriterUser(t, application.DB)
	readerUser := testdata.InsertReaderUser(t, application.DB)
	trackerUser := testdata.InsertTrackerUser(t, application.DB)

	location := testdata.NewLocationBuilder(t, application.DB).
		WithName("test").
		WithDescription("test").
		Build()

	item := testdata.NewItemBuilder(t, application.DB).
		WithIdentifier("ABC123").
		WithReference("REF-1").
		WithGroupKey("XYZ").
		WithDescription("This is only a test").
		WithCreatedHistoryRecord(adminUser.ID, location.ID).
		Build()

	testCases := []struct {
		name string
		user *model.User
	}{
		{"admin user", adminUser},
		{"writer user", writerUser},
		{"reader user", readerUser},
		{"tracker user", trackerUser},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			req := httptest.NewRequest("GET", fmt.Sprintf("/api/v1/item/%s", item.ID.String()), nil)
			testutils.RequestWithJWT(t, req, tc.user, application.Config.SessionSecret)
			rr := testutils.ServeRequest(h, req, application.Config.SessionSecret)

			assert.Equal(t, http.StatusOK, rr.Code)

			var itemResponse dto.ItemResponse
			if err := json.NewDecoder(rr.Body).Decode(&itemResponse); err != nil {
				t.Fatalf("failed to decode response: %v", err)
			}

			assert.Equal(t, item.ID, itemResponse.ID)
			assert.Equal(t, item.Identifier, itemResponse.Identifier)
			assert.Equal(t, location.ID, itemResponse.CurrentLocation.ID)
		})
	}
}

func TestListItems(t *testing.T) {
	t.Cleanup(func() { testutils.CleanDatabase(t, application.DB) })
	h := setUpItemHandler(application.DB, application.Logger)

	adminUser := testdata.InsertAdminUser(t, application.DB)
	writerUser := testdata.InsertWriterUser(t, application.DB)
	readerUser := testdata.InsertReaderUser(t, application.DB)
	trackerUser := testdata.InsertTrackerUser(t, application.DB)

	location := testdata.NewLocationBuilder(t, application.DB).
		WithName("test").
		WithDescription("test").
		Build()

	item1 := testdata.NewItemBuilder(t, application.DB).
		WithIdentifier("ITEM-1").
		WithReference("REF-1").
		WithGroupKey("XYZ").
		WithDescription("This is only a test").
		WithCreatedHistoryRecord(adminUser.ID, location.ID).
		Build()

	item2 := testdata.NewItemBuilder(t, application.DB).
		WithIdentifier("ITEM-2").
		WithReference("REF-2").
		WithGroupKey("XYZ").
		WithDescription("This is only a test").
		WithCreatedHistoryRecord(adminUser.ID, location.ID).
		Build()

	item3 := testdata.NewItemBuilder(t, application.DB).
		WithIdentifier("ITEM-3").
		WithReference("REF-3").
		WithGroupKey("XYZ").
		WithDescription("This is only a test").
		WithCreatedHistoryRecord(adminUser.ID, location.ID).
		Build()

	item4 := testdata.NewItemBuilder(t, application.DB).
		WithIdentifier("ITEM-4").
		WithReference("REF-4").
		WithGroupKey("XYZ").
		WithDescription("This is only a test").
		WithCreatedHistoryRecord(adminUser.ID, location.ID).
		Build()

	allItemModels := []*model.ItemModel{item1, item2, item3, item4}

	testCases := []struct {
		name string
		user *model.User
	}{
		{"admin user", adminUser},
		{"writer user", writerUser},
		{"reader user", readerUser},
		{"tracker user", trackerUser},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			req := httptest.NewRequest("GET", "/api/v1/item", nil)
			testutils.RequestWithJWT(t, req, tc.user, application.Config.SessionSecret)
			rr := testutils.ServeRequest(h, req, application.Config.SessionSecret)

			assert.Equal(t, http.StatusOK, rr.Code)

			var itemResponse []dto.ItemResponse
			if err := json.NewDecoder(rr.Body).Decode(&itemResponse); err != nil {
				t.Fatalf("failed to decode response: %v", err)
			}

			assert.Len(t, itemResponse, len(allItemModels))
		})
	}
}
