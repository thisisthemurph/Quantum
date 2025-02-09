package handler_test

import (
	"encoding/json"
	"fmt"
	"github.com/google/uuid"
	"log/slog"
	"net/http"
	"net/http/httptest"
	"os"
	"quantum/internal/permissions"
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
	locationRepo := repository.NewLocationRepository(db)
	userRepo := repository.NewUserRepository(db)
	settingsRepo := repository.NewPostgresSettingsRepository(db)

	itemService := service.NewItemService(itemRepo, locationRepo, userRepo)
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

func TestGetItemByID_FetchesLatestLocationHistory(t *testing.T) {
	t.Cleanup(func() { testutils.CleanDatabase(t, application.DB) })
	h := setUpItemHandler(application.DB, application.Logger)

	user1 := testdata.NewUserBuilder(t, application.DB).
		WithName("Terry Tracker").
		WithUsername("terry.tracker").
		WithRole(permissions.TrackerRole).
		Build()

	user2 := testdata.NewUserBuilder(t, application.DB).
		WithName("Timmy Tracker").
		WithUsername("timmy.tracker").
		WithRole(permissions.TrackerRole).
		Build()

	locationStart := testdata.NewLocationBuilder(t, application.DB).
		WithName("Start Location").
		Build()

	locationSecond := testdata.NewLocationBuilder(t, application.DB).
		WithName("Second Location").
		Build()

	locationThird := testdata.NewLocationBuilder(t, application.DB).
		WithName("Third Location").
		Build()

	itemWithCreatedHistory := testdata.NewItemBuilder(t, application.DB).
		WithIdentifier("item-0001").
		WithReference("REF-1").
		WithGroupKey("XYZ").
		WithCreatedHistoryRecord(user1.ID, locationStart.ID).
		Build()

	itemWithTrackedHistory := testdata.NewItemBuilder(t, application.DB).
		WithIdentifier("item-0002").
		WithReference("REF-2").
		WithGroupKey("XYZ").
		WithCreatedHistoryRecord(user1.ID, locationStart.ID).
		WithTrackedHistoryRecord(user1.ID, locationSecond.ID).
		WithTrackedHistoryRecord(user1.ID, locationThird.ID).
		Build()

	itemWithTrackedUserHistory := testdata.NewItemBuilder(t, application.DB).
		WithIdentifier("item-0003").
		WithReference("REF-3").
		WithGroupKey("XYZ").
		WithCreatedHistoryRecord(user1.ID, locationStart.ID).
		WithTrackedHistoryRecord(user1.ID, locationSecond.ID).
		WithTrackedUserHistoryRecord(user1.ID, user2.ID).
		Build()

	testCases := []struct {
		name               string
		item               *model.ItemModel
		expectedLocationID uuid.UUID
	}{
		{"with only created history", itemWithCreatedHistory, locationStart.ID},
		{"with created and tracked history", itemWithTrackedHistory, locationThird.ID},
		{"with created, tracked, and tracked-user history", itemWithTrackedUserHistory, user2.ID},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			req := httptest.NewRequest("GET", fmt.Sprintf("/api/v1/item/%s", tc.item.ID.String()), nil)
			testutils.RequestWithJWT(t, req, user1, application.Config.SessionSecret)
			rr := testutils.ServeRequest(h, req, application.Config.SessionSecret)

			assert.Equal(t, http.StatusOK, rr.Code)

			var itemResponse dto.ItemResponse
			if err := json.NewDecoder(rr.Body).Decode(&itemResponse); err != nil {
				t.Fatalf("failed to decode response: %v", err)
			}

			assert.Equal(t, tc.item.ID, itemResponse.ID)
			assert.Equal(t, tc.item.Identifier, itemResponse.Identifier)
			assert.Equal(t, tc.expectedLocationID.String(), itemResponse.CurrentLocation.ID.String())
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

func TestTrackItem_OnlyTrackersCanTrackItems(t *testing.T) {
	t.Cleanup(func() { testutils.CleanDatabase(t, application.DB) })
	h := setUpItemHandler(application.DB, application.Logger)

	reader := testdata.InsertReaderUser(t, application.DB)
	writer := testdata.InsertWriterUser(t, application.DB)
	tracker := testdata.InsertTrackerUser(t, application.DB)
	admin := testdata.InsertAdminUser(t, application.DB)
	adminWithTrackerRole := testdata.NewUserBuilder(t, application.DB).
		WithName("Tracker Admin").
		WithUsername("tracker.admin").
		WithRole(permissions.AdminRole).
		WithRole(permissions.TrackerRole).
		Build()

	item := testdata.NewItemBuilder(t, application.DB).
		WithIdentifier("item-identifier").
		WithReference("item-reference").
		WithGroupKey("item-group").
		Build()

	location := testdata.NewLocationBuilder(t, application.DB).
		WithName("target-location").
		Build()

	testCases := []struct {
		name         string
		user         *model.User
		expectStatus int
	}{
		{"admin should not be able to track", admin, 403},
		{"reader should not be able to track", reader, 403},
		{"writer should not be able to track", writer, 403},
		{"tracker should be able to track", tracker, 204},
		{"admin with tracker should be able to track", adminWithTrackerRole, 204},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			req := httptest.NewRequest("POST", fmt.Sprintf("/api/v1/item/%v/track/%s", item.ID, location.ID), nil)
			testutils.RequestWithJWT(t, req, tc.user, application.Config.SessionSecret)
			rr := testutils.ServeRequest(h, req, application.Config.SessionSecret)

			assert.Equal(t, tc.expectStatus, rr.Code)
		})
	}
}
