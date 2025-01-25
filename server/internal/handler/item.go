package handler

import (
	"encoding/json"
	"errors"
	"log/slog"
	"net/http"

	"github.com/google/uuid"

	"quantum/internal/dto"
	"quantum/internal/service"
	"quantum/pkg/res"
)

type ItemHandler struct {
	itemService *service.ItemService
	logger      *slog.Logger
}

func NewItemHandler(itemService *service.ItemService, logger *slog.Logger) *ItemHandler {
	return &ItemHandler{
		itemService: itemService,
		logger:      logger,
	}
}

func (h *ItemHandler) RegisterRoutes(mux *http.ServeMux, mf MiddlewareFunc) {
	mux.HandleFunc("GET /api/v1/item/groups", mf(h.listItemGroups))
	mux.HandleFunc("GET /api/v1/item/{itemId}", mf(h.getItemByID))
	mux.HandleFunc("GET /api/v1/item", mf(h.listItems))
	mux.HandleFunc("POST /api/v1/item", mf(h.createItem))
}

func (h *ItemHandler) getItemByID(w http.ResponseWriter, r *http.Request) {
	questionID, err := uuid.Parse(r.PathValue("itemId"))
	if err != nil {
		h.logger.Error("invalid question id", "error", err)
		res.Error(w, "invalid question id", http.StatusBadRequest)
		return
	}

	itemResponse, err := h.itemService.GetByID(questionID)
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
	items, err := h.itemService.List()
	if err != nil {
		res.InternalServerError(w)
		return
	}

	res.JSON(w, items)
}

func (h *ItemHandler) listItemGroups(w http.ResponseWriter, r *http.Request) {
	groups, err := h.itemService.ListItemGroups()
	if err != nil {
		res.InternalServerError(w)
		return
	}

	res.JSON(w, groups)
}

func (h *ItemHandler) createItem(w http.ResponseWriter, r *http.Request) {
	var item dto.CreateItemRequest
	if err := json.NewDecoder(r.Body).Decode(&item); err != nil {
		res.Error(w, "error decoding item", http.StatusBadRequest)
		return
	}

	if err := item.Validate(); err != nil {
		res.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	newItem, err := h.itemService.Create(item)
	if err != nil {
		h.logger.Error("error creating item", "error", err)
		res.InternalServerError(w)
		return
	}

	res.JSON(w, newItem)
}
