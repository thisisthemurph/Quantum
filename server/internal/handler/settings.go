package handler

import (
	"encoding/json"
	"log/slog"
	"net/http"
	"quantum/internal/dto"
	"quantum/internal/service"
	"quantum/pkg/res"
)

type SettingsHandler struct {
	settingsService *service.SettingsService
	logger          *slog.Logger
}

func NewSettingsHandler(s *service.SettingsService, logger *slog.Logger) *SettingsHandler {
	return &SettingsHandler{
		settingsService: s,
		logger:          logger,
	}
}

func (h *SettingsHandler) RegisterRoutes(mux *http.ServeMux, mf MiddlewareFunc) {
	mux.HandleFunc("GET /api/v1/settings", mf(h.getSettings))
	mux.HandleFunc("PUT /api/v1/settings", mf(h.updateSettings))
}

func (h *SettingsHandler) getSettings(w http.ResponseWriter, r *http.Request) {
	settings, err := h.settingsService.Get()
	if err != nil {
		h.logger.Error("failed to get settings", "error", err)
		res.InternalServerError(w)
		return
	}

	res.JSON(w, settings)
}

func (h *SettingsHandler) updateSettings(w http.ResponseWriter, r *http.Request) {
	var settings dto.SettingsResponse
	if err := json.NewDecoder(r.Body).Decode(&settings); err != nil {
		h.logger.Error("failed to decode request body", "error", err)
		res.Error(w, "invalid request body", http.StatusBadRequest)
		return
	}

	if err := h.settingsService.Update(settings); err != nil {
		h.logger.Error("failed to update settings", "error", err)
		res.InternalServerError(w)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
