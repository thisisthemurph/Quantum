package handler

import (
	"encoding/json"
	"errors"
	"github.com/google/uuid"
	"log/slog"
	"net/http"
	"quantum/internal/dto"
	"quantum/internal/service"
	"quantum/pkg/res"
)

type LocationHandler struct {
	locationService *service.LocationService
	itemService     *service.ItemService
	logger          *slog.Logger
}

func NewLocationHandler(
	locationService *service.LocationService,
	itemService *service.ItemService,
	logger *slog.Logger,
) *LocationHandler {
	return &LocationHandler{
		locationService: locationService,
		itemService:     itemService,
		logger:          logger,
	}
}

func (h *LocationHandler) RegisterRoutes(mux *http.ServeMux, mf MiddlewareFunc) {
	mux.HandleFunc("GET /api/v1/location", mf(h.listLocations))
	mux.HandleFunc("GET /api/v1/location/{locationId}/items", mf(h.listItemsByLocationID))
	mux.HandleFunc("GET /api/v1/location/{locationId}", mf(h.getLocationByID))
	mux.HandleFunc("POST /api/v1/location", mf(h.createLocation))
	mux.HandleFunc("DELETE /api/v1/location/{locationId}", mf(h.deleteLocation))
}

func (h *LocationHandler) listLocations(w http.ResponseWriter, r *http.Request) {
	filters := getFiltersFromRequest(r)
	locations, err := h.locationService.List(filters.Max, filters.Filter, filters.IncludeDeleted)
	if err != nil {
		h.logger.Error("failed to list locations", "error", err)
		res.InternalServerError(w)
		return
	}

	res.JSON(w, locations)
}

func (h *LocationHandler) listItemsByLocationID(w http.ResponseWriter, r *http.Request) {
	locationID, err := uuid.Parse(r.PathValue("locationId"))

	if err != nil {
		h.logger.Error("invalid location id", "error", err)
		res.Error(w, "invalid location id", http.StatusBadRequest)
		return
	}

	items, err := h.itemService.ListByLocationID(locationID)
	if err != nil {
		h.logger.Error("error listing items by location id", "error", err)
		res.InternalServerError(w)
		return
	}

	res.JSON(w, items)
}

func (h *LocationHandler) getLocationByID(w http.ResponseWriter, r *http.Request) {
	locationID, err := uuid.Parse(r.PathValue("locationId"))
	if err != nil {
		h.logger.Error("invalid location id", "error", err, "locationID", locationID)
		res.Error(w, "invalid location id", http.StatusBadRequest)
		return
	}

	locationResponse, err := h.locationService.Get(locationID)
	if err != nil {
		if errors.Is(err, service.ErrLocationNotFound) {
			res.Error(w, "location not found", http.StatusNotFound)
		}
		res.InternalServerError(w)
		return
	}

	res.JSON(w, locationResponse)
}

func (h *LocationHandler) createLocation(w http.ResponseWriter, r *http.Request) {
	var request dto.CreateLocationRequest
	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		h.logger.Error("invalid location request", "error", err)
		res.Error(w, "invalid location request", http.StatusBadRequest)
		return
	}

	locationResponse, err := h.locationService.Create(request)
	if err != nil {
		res.InternalServerError(w)
		return
	}

	res.JSON(w, locationResponse)
}

func (h *LocationHandler) deleteLocation(w http.ResponseWriter, r *http.Request) {
	locationID, err := uuid.Parse(r.PathValue("locationId"))
	if err != nil {
		h.logger.Error("invalid location id", "error", err, "locationID", locationID)
		res.Error(w, "invalid location id", http.StatusBadRequest)
		return
	}

	if err := h.locationService.Delete(locationID); err != nil {
		res.InternalServerError(w)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
