package model

import "encoding/json"

type SettingsModel struct {
	Id   int             `db:"id"`
	Data json.RawMessage `db:"data"`
}
