package dto

import (
	"encoding/csv"
	"github.com/google/uuid"
	"quantum/internal/model"
	"time"
)

const dateLayout = "Mon Jan _2 2006 15:04:05 MST"

type ItemHistoryRecord interface {
	CSV(writer *csv.Writer) error
}

type ItemHistoryHeader[T any] struct {
	Type         model.ItemHistoryType `json:"type"`
	UserID       uuid.UUID             `json:"userId"`
	UserName     string                `json:"userName"`
	UserUsername string                `json:"userUsername"`
	Date         time.Time             `json:"date"`
	Data         T                     `json:"data"`
}

type CreatedItemHistoryRecordData struct {
	Reference    string    `json:"reference"`
	GroupKey     string    `json:"group"`
	Description  *string   `json:"description"`
	LocationID   uuid.UUID `json:"locationId"`
	LocationName string    `json:"locationName"`
}

type CreatedItemHistoryRecord struct {
	ItemHistoryHeader[CreatedItemHistoryRecordData]
}

func (r CreatedItemHistoryRecord) CSV(w *csv.Writer) error {
	return w.Write([]string{r.Date.Format(dateLayout), r.Type.String(), r.UserName, r.Data.GroupKey, r.Data.LocationName})
}

type TrackedItemHistoryRecordData struct {
	ItemReference string    `json:"itemReference"`
	LocationID    uuid.UUID `json:"locationId"`
	LocationName  string    `json:"locationName"`
}

type TrackedItemHistoryRecord struct {
	ItemHistoryHeader[TrackedItemHistoryRecordData]
}

func (r TrackedItemHistoryRecord) CSV(w *csv.Writer) error {
	return w.Write([]string{r.Date.Format(dateLayout), r.Type.String(), r.UserName, "", r.Data.LocationName})
}
