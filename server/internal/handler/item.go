package handler

import (
	"encoding/csv"
	"encoding/json"
	"errors"
	"log/slog"
	"net/http"
	"strings"

	"github.com/google/uuid"
	"github.com/thisisthemurph/emit"

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
	mux.HandleFunc("DELETE /api/v1/item/{itemId}", mf(h.deleteItem))
	mux.HandleFunc("GET /api/v1/item/groups/exist", mf(h.getItemGroupsExist))
	mux.HandleFunc("GET /api/v1/item/{itemId}/history", mf(h.getItemHistory))
	mux.HandleFunc("GET /api/v1/item/{itemId}/history/csv", mf(h.downloadItemHistoryCSV))
	mux.HandleFunc("GET /api/v1/item", mf(h.listItems))
	mux.HandleFunc("POST /api/v1/item", mf(h.createItem))
	mux.HandleFunc("POST /api/v1/item/{itemId}/track/{locationId}", mf(h.trackItem))
	mux.HandleFunc("POST /api/v1/item/{itemId}/track/user/{userId}", mf(h.trackItemToUser))
}

func (h *ItemHandler) getItemByID(w http.ResponseWriter, r *http.Request) {
	if !authenticated(r) {
		emit.New(w).Status(http.StatusUnauthorized).ErrorJSON("Unauthorized")
		return
	}

	if !currentUserRoles(r).HasReadPermissions() {
		emit.New(w).Status(http.StatusForbidden).ErrorJSON("Forbidden")
		return
	}

	questionID, err := uuid.Parse(r.PathValue("itemId"))
	if err != nil {
		h.logger.Error("invalid item id", "error", err)
		emit.New(w).Status(http.StatusBadRequest).Flush()
		return
	}

	itemResponse, err := h.itemService.Get(questionID)
	if err != nil {
		if errors.Is(err, service.ErrItemNotFound) {
			emit.New(w).Status(http.StatusNotFound).ErrorJSON("Item not found")
			return
		}
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	emit.New(w).JSON(itemResponse)
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
		emit.New(w).Status(http.StatusUnauthorized).ErrorJSON("Unauthorized")
		return
	}

	if !currentUserRoles(r).HasReadPermissions() {
		emit.New(w).Status(http.StatusForbidden).ErrorJSON("Forbidden")
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
		emit.New(w).Status(http.StatusUnauthorized).ErrorJSON("Unauthorized")
		return
	}

	if !currentUserRoles(r).HasWritePermissions() {
		emit.New(w).Status(http.StatusForbidden).ErrorJSON("Forbidden")
		return
	}

	var item dto.CreateItemRequest
	if err := json.NewDecoder(r.Body).Decode(&item); err != nil {
		emit.New(w).Status(http.StatusBadRequest).ErrorJSON("Error decoding request")
		return
	}

	if err := item.Validate(); err != nil {
		emit.New(w).Status(http.StatusBadRequest).ErrorJSON(err.Error())
		return
	}

	newItem, err := h.itemService.Create(userID, item)
	if err != nil {
		h.logger.Error("error creating item", "error", err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	emit.New(w).Status(http.StatusCreated).JSON(newItem)
}

func (h *ItemHandler) deleteItem(w http.ResponseWriter, r *http.Request) {
	userID, authed := currentUserID(r)
	if !authed {
		emit.New(w).Status(http.StatusUnauthorized).ErrorJSON("Unauthorized")
		return
	}

	if !currentUserRoles(r).IsAdmin() {
		emit.New(w).Status(http.StatusForbidden).ErrorJSON("Forbidden")
		return
	}

	itemID, err := uuid.Parse(r.PathValue("itemId"))
	if err != nil {
		h.logger.Error("invalid item id", "error", err)
		emit.New(w).Status(http.StatusBadRequest).ErrorJSON("Invalid ID")
		return
	}

	if err := h.itemService.Delete(itemID, userID); err != nil {
		h.logger.Error("error deleting item", "error", err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func (h *ItemHandler) trackItem(w http.ResponseWriter, r *http.Request) {
	userID, authed := currentUserID(r)
	if !authed {
		emit.New(w).Status(http.StatusUnauthorized).ErrorJSON("Unauthorized")
		return
	}

	if !currentUserRoles(r).HasTrackPermissions() {
		emit.New(w).Status(http.StatusForbidden).ErrorJSON("Forbidden")
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

func (h *ItemHandler) trackItemToUser(w http.ResponseWriter, r *http.Request) {
	userID, authed := currentUserID(r)
	if !authed {
		w.WriteHeader(http.StatusUnauthorized)
		return
	}

	if !currentUserRoles(r).HasTrackPermissions() {
		w.WriteHeader(http.StatusForbidden)
		return
	}

	itemID, err := uuid.Parse(r.PathValue("itemId"))
	if err != nil {
		h.logger.Error("invalid item id", "error", err)
		emit.New(w).Status(http.StatusBadRequest).ErrorJSON("Invalid ID")
		return
	}

	toUserID, err := uuid.Parse(r.PathValue("userId"))
	if err != nil {
		h.logger.Error("invalid user id", "error", err)
		emit.New(w).Status(http.StatusBadRequest).ErrorJSON("Invalid user ID")
		return
	}

	if err := h.itemService.TrackItemToUser(userID, toUserID, itemID); err != nil {
		h.logger.Error("error tracking item", "error", err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func (h *ItemHandler) getItemHistory(w http.ResponseWriter, r *http.Request) {
	if !authenticated(r) {
		w.WriteHeader(http.StatusUnauthorized)
		return
	}

	if !currentUserRoles(r).HasReadPermissions() {
		w.WriteHeader(http.StatusForbidden)
		return
	}

	itemID, err := uuid.Parse(r.PathValue("itemId"))
	if err != nil {
		h.logger.Error("invalid item id", "error", err)
		emit.New(w).Status(http.StatusBadRequest).ErrorJSON("Invalid ID")
		return
	}

	history, err := h.itemService.GetItemHistory(itemID)
	if err != nil {
		h.logger.Error("error getting item history", "error", err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	emit.New(w).JSON(history)
}

func (h *ItemHandler) downloadItemHistoryCSV(w http.ResponseWriter, r *http.Request) {
	if !authenticated(r) {
		w.WriteHeader(http.StatusUnauthorized)
		return
	}

	if !currentUserRoles(r).HasReadPermissions() {
		w.WriteHeader(http.StatusForbidden)
		return
	}

	itemID, err := uuid.Parse(r.PathValue("itemId"))
	if err != nil {
		h.logger.Error("invalid item id", "error", err)
		emit.New(w).Status(http.StatusBadRequest).ErrorJSON("Invalid ID")
		return
	}

	settings, err := h.settingsService.Get()
	if err != nil {
		h.logger.Error("error getting settings", "error", err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	history, err := h.itemService.GetItemHistory(itemID)
	if err != nil {
		h.logger.Error("error getting item history", "error", err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	writer := csv.NewWriter(w)
	defer writer.Flush()

	terms := settings.Terminology
	_ = writer.Write([]string{"Date", "Type", "User", terms.Group, terms.Location})
	for _, record := range history {
		if err := record.CSV(writer); err != nil {
			h.logger.Error("error writing csv record", "error", err)
			w.WriteHeader(http.StatusInternalServerError)
			return
		}
	}

	w.Header().Set("Content-Type", "text/csv")
}

func (h *ItemHandler) getItemGroupsExist(w http.ResponseWriter, r *http.Request) {
	if !authenticated(r) {
		w.WriteHeader(http.StatusUnauthorized)
		return
	}

	if !currentUserRoles(r).HasReadPermissions() {
		w.WriteHeader(http.StatusForbidden)
		return
	}

	groupParams := r.URL.Query().Get("groups")
	groupsKeys := strings.Split(groupParams, ",")

	var results = make(map[string]bool)
	for _, groupKey := range groupsKeys {
		exists, err := h.itemService.GroupKeyExists(groupKey)
		if err != nil {
			h.logger.Error("error checking group key", "error", err)
			w.WriteHeader(http.StatusInternalServerError)
			return
		}
		results[groupKey] = exists
	}

	emit.New(w).JSON(results)
}
