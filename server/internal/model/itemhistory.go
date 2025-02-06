package model

import (
	"encoding/json"
	"errors"
	"github.com/google/uuid"
	"time"
)

type ItemHistoryType string

func (t ItemHistoryType) String() string {
	switch t {
	case ItemHistoryTypeCreated:
		return "Created"
	case ItemHistoryTypeUpdated:
		return "Updated"
	case ItemHistoryTypeDeleted:
		return "Deleted"
	case ItemHistoryTypeRestored:
		return "Restored"
	case ItemHistoryTypeTracked:
		return "Tracked"
	default:
		return "Unknown"
	}
}

const (
	ItemHistoryTypeUnknown  ItemHistoryType = "unknown"
	ItemHistoryTypeCreated  ItemHistoryType = "created"
	ItemHistoryTypeUpdated  ItemHistoryType = "updated"
	ItemHistoryTypeDeleted  ItemHistoryType = "deleted"
	ItemHistoryTypeRestored ItemHistoryType = "restored"
	ItemHistoryTypeTracked  ItemHistoryType = "tracked"
)

type ItemHistoryModel struct {
	ID        int64           `db:"id"`
	UserID    uuid.UUID       `db:"user_id"`
	ItemID    uuid.UUID       `db:"item_id"`
	Data      json.RawMessage `db:"data"`
	CreatedAt time.Time       `db:"created_at"`
}

type HistoryDataContainer struct {
	Type ItemHistoryType `json:"type"`
	Data json.RawMessage `json:"data"`
}

type ItemCreatedHistoryData struct {
	Reference   string    `json:"reference"`
	GroupKey    string    `json:"group"`
	Description *string   `json:"description"`
	LocationID  uuid.UUID `json:"locationId"`
}

type ItemUpdatedHistoryData struct {
	UpdatedFields map[string]string `json:"updatedFields"`
}

type ItemTrackedHistoryData struct {
	LocationID uuid.UUID `json:"locationId"`
}

func (h *ItemHistoryModel) ParseData() (ItemHistoryType, interface{}, error) {
	var container HistoryDataContainer
	if err := json.Unmarshal(h.Data, &container); err != nil {
		return ItemHistoryTypeUnknown, nil, err
	}

	switch container.Type {
	case ItemHistoryTypeCreated:
		var data ItemCreatedHistoryData
		if err := json.Unmarshal(container.Data, &data); err != nil {
			return ItemHistoryTypeCreated, nil, err
		}
		return ItemHistoryTypeCreated, data, nil
	case ItemHistoryTypeUpdated:
		var data ItemUpdatedHistoryData
		if err := json.Unmarshal(container.Data, &data); err != nil {
			return ItemHistoryTypeUpdated, nil, err
		}
		return ItemHistoryTypeUpdated, data, nil
	case ItemHistoryTypeTracked:
		var data ItemTrackedHistoryData
		if err := json.Unmarshal(container.Data, &data); err != nil {
			return ItemHistoryTypeTracked, nil, err
		}
		return ItemHistoryTypeTracked, data, nil
	case ItemHistoryTypeDeleted:
		return ItemHistoryTypeDeleted, nil, nil
	case ItemHistoryTypeRestored:
		return ItemHistoryTypeRestored, nil, nil
	default:
		return ItemHistoryTypeUnknown, nil, errors.New("unknown history type")
	}
}
