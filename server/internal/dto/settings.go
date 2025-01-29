package dto

import (
	"encoding/json"
	"quantum/internal/model"
)

type TerminologySettingsResponse struct {
	Item      string `json:"item"`
	Items     string `json:"items"`
	Location  string `json:"location"`
	Locations string `json:"locations"`
	Group     string `json:"group"`
	Groups    string `json:"groups"`
}

type SettingsResponse struct {
	Terminology TerminologySettingsResponse `json:"terminology"`
}

func NewSettingsResponseFromModel(m model.SettingsModel) (SettingsResponse, error) {
	var s SettingsResponse
	if err := json.Unmarshal(m.Data, &s); err != nil {
		return s, err
	}
	return s, nil
}
