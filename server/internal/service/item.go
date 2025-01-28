package service

import (
	"database/sql"
	"errors"
	"github.com/google/uuid"
	"quantum/internal/dto"
	"quantum/internal/model"
	"quantum/internal/repository"
)

var ErrItemNotFound = errors.New("item not found")

type ItemService struct {
	itemRepo     repository.ItemRepository
	historyRepo  repository.ItemHistoryRepository
	locationRepo repository.LocationRepository
}

func NewItemService(
	itemRepo repository.ItemRepository,
	historyRepo repository.ItemHistoryRepository,
	locationRepo repository.LocationRepository,
) *ItemService {
	return &ItemService{
		itemRepo:     itemRepo,
		historyRepo:  historyRepo,
		locationRepo: locationRepo,
	}
}

func (s *ItemService) Get(id uuid.UUID) (dto.ItemResponse, error) {
	i, err := s.itemRepo.GetByID(id)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return dto.ItemResponse{}, ErrItemNotFound
		}
		return dto.ItemResponse{}, err
	}

	locationID, err := s.historyRepo.GetItemCurrentLocationID(i.ID)
	if err != nil {
		return dto.ItemResponse{}, err
	}

	location, err := s.locationRepo.Get(locationID)
	if err != nil {
		return dto.ItemResponse{}, err
	}

	return dto.ItemResponse{
		ID:          i.ID,
		Reference:   i.Reference,
		GroupKey:    i.GroupKey,
		Description: i.Description,
		CurrentLocation: &dto.ItemCurrentLocation{
			ID:   location.ID,
			Name: location.Name,
		},
		CreatedAt: i.CreatedAt,
		UpdatedAt: i.UpdatedAt,
	}, nil
}

func (s *ItemService) List(groupKeyFilter *string) ([]dto.ItemWithCurrentLocationResponse, error) {
	items, err := s.itemRepo.List(groupKeyFilter)
	if err != nil {
		return nil, err
	}

	var itemsResponse = make([]dto.ItemWithCurrentLocationResponse, len(items))
	for i, item := range items {
		itemsResponse[i] = dto.ItemWithCurrentLocationResponse{
			ItemResponse: dto.NewItemResponseFromModel(item.ItemModel),
			CurrentLocation: dto.CurrentLocation{
				ID:          item.LocationID,
				Name:        item.LocationName,
				Description: item.LocationDescription,
			},
		}
	}

	return itemsResponse, nil
}

func (s *ItemService) ListByLocationID(locationID uuid.UUID) ([]dto.ItemWithCurrentLocationResponse, error) {
	items, err := s.itemRepo.ListByLocationID(locationID)
	if err != nil {
		return nil, err
	}

	var itemsResponse = make([]dto.ItemWithCurrentLocationResponse, len(items))
	for i, item := range items {
		itemsResponse[i] = dto.ItemWithCurrentLocationResponse{
			ItemResponse: dto.NewItemResponseFromModel(item.ItemModel),
			CurrentLocation: dto.CurrentLocation{
				ID:          item.LocationID,
				Name:        item.LocationName,
				Description: item.LocationDescription,
				TrackedAt:   item.TrackedAt,
			},
		}
	}

	return itemsResponse, nil
}

func (s *ItemService) ListItemGroups(max int, filter string) ([]string, error) {
	if max <= 0 {
		max = 1
	}

	return s.itemRepo.ListItemGroups(max, filter)
}

func (s *ItemService) GroupKeyExists(groupKey string) (bool, error) {
	return s.itemRepo.GroupKeyExists(groupKey)
}

func (s *ItemService) Create(item dto.CreateItemRequest) (dto.ItemResponse, error) {
	itemModel := model.ItemModel{
		Reference:   item.Reference,
		GroupKey:    item.GroupKey,
		Description: item.Description,
	}

	if err := s.itemRepo.Create(&itemModel); err != nil {
		return dto.ItemResponse{}, err
	}
	if err := s.historyRepo.ItemCreated(itemModel, item.LocationID); err != nil {
		return dto.ItemResponse{}, err
	}

	return dto.ItemResponse{
		ID:          itemModel.ID,
		Reference:   itemModel.Reference,
		GroupKey:    itemModel.GroupKey,
		Description: itemModel.Description,
		CreatedAt:   itemModel.CreatedAt,
		UpdatedAt:   itemModel.UpdatedAt,
		CurrentLocation: &dto.ItemCurrentLocation{
			ID:   item.LocationID,
			Name: "NOT IMPLEMENTED",
		},
	}, nil
}

func (s *ItemService) Delete(id uuid.UUID) error {
	return s.itemRepo.Delete(id)
}

func (s *ItemService) TrackItem(itemID uuid.UUID, locationID uuid.UUID) error {
	item, err := s.itemRepo.GetByID(itemID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return ErrItemNotFound
		}
		return err
	}

	if err := s.historyRepo.ItemTracked(item.ID, locationID); err != nil {
		return err
	}

	return nil
}

func (s *ItemService) GetItemHistory(itemID uuid.UUID) ([]map[string]interface{}, error) {
	historyModel, err := s.historyRepo.GetItemHistory(itemID)
	if err != nil {
		return nil, err
	}

	var results = make([]map[string]interface{}, 0)
	for _, h := range historyModel {
		historyType, data, err := h.ParseData()
		if err != nil {
			return results, err
		}

		res := map[string]interface{}{
			"type":     string(historyType),
			"userId":   h.UserID,
			"userName": "NOT IMPLEMENTED",
			"date":     h.CreatedAt,
		}

		switch historyType {
		case model.ItemHistoryTypeCreated:
			d := data.(model.ItemCreatedHistoryData)
			location, err := s.locationRepo.Get(d.LocationID)
			if err != nil {
				return results, err
			}
			res["data"] = map[string]interface{}{
				"reference":    d.Reference,
				"group":        d.GroupKey,
				"description":  d.Description,
				"locationId":   d.LocationID,
				"locationName": location.Name,
			}
		case model.ItemHistoryTypeTracked:
			d := data.(model.ItemTrackedHistoryData)
			location, err := s.locationRepo.Get(d.LocationID)
			if err != nil {
				return results, err
			}
			res["data"] = map[string]interface{}{
				"locationId":   d.LocationID,
				"locationName": location.Name,
			}
		default:
			continue
		}

		results = append(results, res)
	}

	return results, nil
}
