package testdata

import (
	"encoding/json"
	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
	"quantum/internal/model"
	"testing"
)

type ItemBuilder struct {
	t          *testing.T
	db         *sqlx.DB
	model      *model.ItemModel
	historyFns []func() error
}

func NewItemBuilder(t *testing.T, db *sqlx.DB) *ItemBuilder {
	return &ItemBuilder{
		t:          t,
		db:         db,
		model:      &model.ItemModel{},
		historyFns: make([]func() error, 0),
	}
}

func (b *ItemBuilder) WithIdentifier(identifier string) *ItemBuilder {
	b.model.Identifier = identifier
	return b
}

func (b *ItemBuilder) WithReference(reference string) *ItemBuilder {
	b.model.Reference = reference
	return b
}

func (b *ItemBuilder) WithGroupKey(groupKey string) *ItemBuilder {
	b.model.GroupKey = groupKey
	return b
}

func (b *ItemBuilder) WithDescription(description string) *ItemBuilder {
	b.model.Description = &description
	return b
}

// WithCreatedHistoryRecord adds a history record for the item creation in the item_history table.
// The order of these functions in the builder is important, as the history records are inserted in the order they are added.
func (b *ItemBuilder) WithCreatedHistoryRecord(userID, locationID uuid.UUID) *ItemBuilder {
	data := &model.ItemCreatedHistoryData{
		Reference:   b.model.Reference,
		GroupKey:    b.model.GroupKey,
		Description: b.model.Description,
		LocationID:  locationID,
	}

	jsonData, err := json.Marshal(data)
	if err != nil {
		b.t.Fatalf("failed to marshal history data: %v", err)
	}

	history := model.HistoryDataContainer{
		Type: model.ItemHistoryTypeCreated,
		Data: jsonData,
	}

	// Add the history builder function to be handled in the Build function later.
	b.historyFns = append(b.historyFns, func() error {
		return b.buildHistoryForItem(history, userID)
	})

	return b
}

// WithTrackedHistoryRecord adds a history record for the tracking of an item in the item_history table.
// The order of these functions in the builder is important, as the history records are inserted in the order they are added.
func (b *ItemBuilder) WithTrackedHistoryRecord(userID, locationID uuid.UUID) *ItemBuilder {
	data := &model.ItemTrackedHistoryData{
		LocationID: locationID,
	}

	jsonData, err := json.Marshal(data)
	if err != nil {
		b.t.Fatalf("failed to marshal history data: %v", err)
	}

	history := model.HistoryDataContainer{
		Type: model.ItemHistoryTypeTracked,
		Data: jsonData,
	}

	// Add the history builder function to be handled in the Build function later.
	b.historyFns = append(b.historyFns, func() error {
		return b.buildHistoryForItem(history, userID)
	})

	return b
}

// WithTrackedUserHistoryRecord adds a history record for the tracking of an item to a user in the item_history table.
// The order of these functions in the builder is important, as the history records are inserted in the order they are added.
func (b *ItemBuilder) WithTrackedUserHistoryRecord(userID, trackedToUser uuid.UUID) *ItemBuilder {
	data := &model.ItemTrackedUserHistoryData{
		UserID: trackedToUser,
	}

	jsonData, err := json.Marshal(data)
	if err != nil {
		b.t.Fatalf("failed to marshal history data: %v", err)
	}

	history := model.HistoryDataContainer{
		Type: model.ItemHistoryTypeTrackedUser,
		Data: jsonData,
	}

	// Add the history builder function to be handled in the Build function later.
	b.historyFns = append(b.historyFns, func() error {
		return b.buildHistoryForItem(history, userID)
	})

	return b
}

func (b *ItemBuilder) Build() *model.ItemModel {
	insert := `
		INSERT INTO items (identifier, reference, group_key, description) 
		VALUES ($1, $2, $3, $4) 
		returning id, created_at, updated_at;`

	err := b.db.Get(
		b.model,
		insert,
		b.model.Identifier,
		b.model.Reference,
		b.model.GroupKey,
		b.model.Description,
	)

	if err != nil {
		b.t.Errorf("failed to insert item: %v", err)
	}

	for _, fn := range b.historyFns {
		if err := fn(); err != nil {
			b.t.Errorf("failed to insert history record: %v", err)
		}
	}

	return b.model
}

func (b *ItemBuilder) buildHistoryForItem(history model.HistoryDataContainer, userID uuid.UUID) error {
	historyJSON, err := json.Marshal(history)
	if err != nil {
		return err
	}

	stmt := `
		insert into item_history (user_id, item_id, data)
		values ($1, $2, $3)`

	if _, err = b.db.Exec(stmt, userID, b.model.ID, historyJSON); err != nil {
		return err
	}
	return nil
}
