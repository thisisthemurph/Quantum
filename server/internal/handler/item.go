package handler

import (
	"encoding/csv"
	"encoding/json"
	"errors"
	"log/slog"
	"net/http"
	"strings"

	"github.com/google/uuid"

	"quantum/internal/dto"
	"quantum/internal/service"
	"quantum/pkg/res"
)

type ItemHandler struct {
	itemService     *service.ItemService
	settingsService *service.SettingsService
	logger          *slog.Logger
}

func NewItemHandler(
	itemService *service.ItemService,
	settingsService *service.SettingsService,
	logger *slog.Logger,
) *ItemHandler {
	return &ItemHandler{
		itemService:     itemService,
		settingsService: settingsService,
		logger:          logger,
	}
}

func (h *ItemHandler) RegisterRoutes(mux *http.ServeMux, mf MiddlewareFunc) {
	mux.HandleFunc("GET /api/v1/item/groups", mf(h.listItemGroups))
	mux.HandleFunc("GET /api/v1/item/{itemId}", mf(h.getItemByID))
	mux.HandleFunc("GET /api/v1/item/groups/exist", mf(h.getItemGroupsExist))
	mux.HandleFunc("GET /api/v1/item/{itemId}/history", mf(h.getItemHistory))
	mux.HandleFunc("GET /api/v1/item/{itemId}/history/csv", mf(h.downloadItemHistoryCSV))
	mux.HandleFunc("GET /api/v1/item", mf(h.listItems))
	mux.HandleFunc("POST /api/v1/item", mf(h.createItem))
	mux.HandleFunc("POST /api/v1/item/{itemId}/track/{locationId}", mf(h.trackItem))
}

func (h *ItemHandler) getItemByID(w http.ResponseWriter, r *http.Request) {
	if !authenticated(r) {
		res.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	if !currentUserRoles(r).HasReadPermissions() {
		res.Error(w, "forbidden", http.StatusForbidden)
		return
	}

	questionID, err := uuid.Parse(r.PathValue("itemId"))
	if err != nil {
		h.logger.Error("invalid question id", "error", err)
		res.Error(w, "invalid question id", http.StatusBadRequest)
		return
	}

	itemResponse, err := h.itemService.Get(questionID)
	if err != nil {
		if errors.Is(err, service.ErrItemNotFound) {
			res.Error(w, "item not found", http.StatusNotFound)
		}
		res.InternalServerError(w)
		return
	}

	res.JSON(w, itemResponse)
}

func (h *ItemHandler) listItems(w http.ResponseWriter, r *http.Request) {
	if !authenticated(r) {
		res.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	if !currentUserRoles(r).HasReadPermissions() {
		res.Error(w, "forbidden", http.StatusForbidden)
		return
	}

	groupKeyParam := r.URL.Query().Get("group")
	var groupKeyFilter *string
	if groupKeyParam != "" {
		groupKeyFilter = &groupKeyParam
	}

	items, err := h.itemService.List(groupKeyFilter)
	if err != nil {
		h.logger.Error("error listing items", "error", err)
		res.InternalServerError(w)
		return
	}

	res.JSON(w, items)
}

func (h *ItemHandler) listItemGroups(w http.ResponseWriter, r *http.Request) {
	if !authenticated(r) {
		res.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	if !currentUserRoles(r).HasReadPermissions() {
		res.Error(w, "forbidden", http.StatusForbidden)
		return
	}

	filters := getFiltersFromRequest(r)
	if filters.Max == nil {
		defaultMaxFilter := 10
		filters.Max = &defaultMaxFilter
	}

	groups, err := h.itemService.ListItemGroups(*filters.Max, filters.Filter)
	if err != nil {
		h.logger.Error("error listing item groups", "error", err)
		res.InternalServerError(w)
		return
	}

	res.JSON(w, groups)
}

func (h *ItemHandler) createItem(w http.ResponseWriter, r *http.Request) {
	userID, authed := currentUserID(r)
	if !authed {
		res.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	if !currentUserRoles(r).HasWritePermissions() {
		res.Error(w, "forbidden", http.StatusForbidden)
		return
	}

	var item dto.CreateItemRequest
	if err := json.NewDecoder(r.Body).Decode(&item); err != nil {
		res.Error(w, "error decoding item", http.StatusBadRequest)
		return
	}

	if err := item.Validate(); err != nil {
		res.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	newItem, err := h.itemService.Create(userID, item)
	if err != nil {
		h.logger.Error("error creating item", "error", err)
		res.InternalServerError(w)
		return
	}

	res.JSON(w, newItem)
}

func (h *ItemHandler) trackItem(w http.ResponseWriter, r *http.Request) {
	userID, authed := currentUserID(r)
	if !authed {
		res.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	if !currentUserRoles(r).HasTrackPermissions() {
		res.Error(w, "forbidden", http.StatusForbidden)
		return
	}

	itemID, err := uuid.Parse(r.PathValue("itemId"))
	if err != nil {
		h.logger.Error("invalid item id", "error", err)
		res.Error(w, "invalid item id", http.StatusBadRequest)
		return
	}

	locationID, err := uuid.Parse(r.PathValue("locationId"))
	if err != nil {
		h.logger.Error("invalid location id", "error", err)
		res.Error(w, "invalid location id", http.StatusBadRequest)
		return
	}

	if err := h.itemService.TrackItem(userID, itemID, locationID); err != nil {
		h.logger.Error("error tracking item", "error", err)
		res.InternalServerError(w)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func (h *ItemHandler) getItemHistory(w http.ResponseWriter, r *http.Request) {
	if !authenticated(r) {
		res.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	if !currentUserRoles(r).HasReadPermissions() {
		res.Error(w, "forbidden", http.StatusForbidden)
		return
	}

	itemID, err := uuid.Parse(r.PathValue("itemId"))
	if err != nil {
		h.logger.Error("invalid item id", "error", err)
		res.Error(w, "invalid item id", http.StatusBadRequest)
		return
	}

	history, err := h.itemService.GetItemHistory(itemID)
	if err != nil {
		h.logger.Error("error getting item history", "error", err)
		res.InternalServerError(w)
		return
	}

	res.JSON(w, history)
}

func (h *ItemHandler) downloadItemHistoryCSV(w http.ResponseWriter, r *http.Request) {
	if !authenticated(r) {
		res.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	if !currentUserRoles(r).HasReadPermissions() {
		res.Error(w, "forbidden", http.StatusForbidden)
		return
	}

	itemID, err := uuid.Parse(r.PathValue("itemId"))
	if err != nil {
		h.logger.Error("invalid item id", "error", err)
		res.Error(w, "invalid item id", http.StatusBadRequest)
		return
	}

	settings, err := h.settingsService.Get()
	if err != nil {
		h.logger.Error("error getting settings", "error", err)
		res.InternalServerError(w)
		return
	}

	history, err := h.itemService.GetItemHistory(itemID)
	if err != nil {
		h.logger.Error("error getting item history", "error", err)
		res.InternalServerError(w)
		return
	}

	writer := csv.NewWriter(w)
	defer writer.Flush()

	terms := settings.Terminology
	_ = writer.Write([]string{"Date", "Type", "User", terms.Group, terms.Location})
	for _, record := range history {
		if err := record.CSV(writer); err != nil {
			h.logger.Error("error writing csv record", "error", err)
			res.InternalServerError(w)
			return
		}
	}

	w.Header().Set("Content-Type", "text/csv")
}

func (h *ItemHandler) getItemGroupsExist(w http.ResponseWriter, r *http.Request) {
	if !authenticated(r) {
		res.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	if !currentUserRoles(r).HasReadPermissions() {
		res.Error(w, "forbidden", http.StatusForbidden)
		return
	}

	groupParams := r.URL.Query().Get("groups")
	groupsKeys := strings.Split(groupParams, ",")

	var results = make(map[string]bool)
	for _, groupKey := range groupsKeys {
		exists, err := h.itemService.GroupKeyExists(groupKey)
		if err != nil {
			h.logger.Error("error checking group key", "error", err)
			res.InternalServerError(w)
			return
		}
		results[groupKey] = exists
	}

	res.JSON(w, results)
}
