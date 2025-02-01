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
	userRepo     repository.UserRepository
}

func NewItemService(
	itemRepo repository.ItemRepository,
	historyRepo repository.ItemHistoryRepository,
	locationRepo repository.LocationRepository,
	userRepo repository.UserRepository,
) *ItemService {
	return &ItemService{
		itemRepo:     itemRepo,
		historyRepo:  historyRepo,
		locationRepo: locationRepo,
		userRepo:     userRepo,
	}
}

func (s *ItemService) Get(id uuid.UUID) (dto.ItemResponse, error) {
	itemModel, err := s.itemRepo.GetByID(id)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return dto.ItemResponse{}, ErrItemNotFound
		}
		return dto.ItemResponse{}, err
	}

	locationID, err := s.historyRepo.GetItemCurrentLocationID(itemModel.ID)
	if err != nil {
		return dto.ItemResponse{}, err
	}

	locationModel, err := s.locationRepo.Get(locationID)
	if err != nil {
		return dto.ItemResponse{}, err
	}

	return dto.NewItemResponseFromModel(itemModel, &locationModel), nil
}

func (s *ItemService) List(groupKeyFilter *string) ([]dto.ItemWithCurrentLocationResponse, error) {
	items, err := s.itemRepo.List(groupKeyFilter)
	if err != nil {
		return nil, err
	}

	var itemsResponse = make([]dto.ItemWithCurrentLocationResponse, len(items))
	for i, item := range items {
		itemsResponse[i] = dto.ItemWithCurrentLocationResponse{
			ItemResponse: dto.NewItemResponseFromModel(item.ItemModel, nil),
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

func (s *ItemService) ListByLocationID(locationID uuid.UUID) ([]dto.ItemWithCurrentLocationResponse, error) {
	items, err := s.itemRepo.ListByLocationID(locationID)
	if err != nil {
		return nil, err
	}

	var itemsResponse = make([]dto.ItemWithCurrentLocationResponse, len(items))
	for i, item := range items {
		itemsResponse[i] = dto.ItemWithCurrentLocationResponse{
			ItemResponse: dto.NewItemResponseFromModel(item.ItemModel, nil),
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

func (s *ItemService) Create(userID uuid.UUID, item dto.CreateItemRequest) (dto.ItemResponse, error) {
	itemModel := model.ItemModel{
		Identifier:  item.Identifier,
		Reference:   item.Reference,
		GroupKey:    item.GroupKey,
		Description: item.Description,
	}

	if err := s.itemRepo.Create(&itemModel); err != nil {
		return dto.ItemResponse{}, err
	}
	if err := s.historyRepo.ItemCreated(userID, itemModel, item.LocationID); err != nil {
		return dto.ItemResponse{}, err
	}

	return dto.ItemResponse{
		ID:          itemModel.ID,
		Identifier:  itemModel.Identifier,
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

func (s *ItemService) TrackItem(userID, itemID, locationID uuid.UUID) error {
	item, err := s.itemRepo.GetByID(itemID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return ErrItemNotFound
		}
		return err
	}

	if err := s.historyRepo.ItemTracked(userID, item.ID, locationID); err != nil {
		return err
	}

	return nil
}

func (s *ItemService) GetItemHistory(itemID uuid.UUID) ([]dto.ItemHistoryRecord, error) {
	historyModel, err := s.historyRepo.GetItemHistory(itemID)
	if err != nil {
		return nil, err
	}

	var results = make([]dto.ItemHistoryRecord, 0)
	for _, h := range historyModel {
		historyType, data, err := h.ParseData()
		if err != nil {
			return nil, err
		}

		switch historyType {
		case model.ItemHistoryTypeCreated:
			d := data.(model.ItemCreatedHistoryData)
			user, err := s.userRepo.Get(h.UserID)
			if err != nil {
				return nil, err
			}
			location, err := s.locationRepo.Get(d.LocationID)
			if err != nil {
				return nil, err
			}

			hr := dto.CreatedItemHistoryRecord{
				ItemHistoryHeader: dto.ItemHistoryHeader[dto.CreatedItemHistoryRecordData]{
					Type:     historyType,
					UserID:   h.UserID,
					UserName: user.Name,
					Date:     h.CreatedAt,
					Data: dto.CreatedItemHistoryRecordData{
						Reference:    d.Reference,
						GroupKey:     d.GroupKey,
						Description:  d.Description,
						LocationID:   d.LocationID,
						LocationName: location.Name,
					},
				},
			}

			results = append(results, hr)
		case model.ItemHistoryTypeTracked:
			d := data.(model.ItemTrackedHistoryData)
			item, err := s.itemRepo.GetByID(itemID)
			if err != nil {
				return nil, err
			}
			user, err := s.userRepo.Get(h.UserID)
			if err != nil {
				return nil, err
			}
			location, err := s.locationRepo.Get(d.LocationID)
			if err != nil {
				return nil, err
			}

			hr := dto.TrackedItemHistoryRecord{
				ItemHistoryHeader: dto.ItemHistoryHeader[dto.TrackedItemHistoryRecordData]{
					Type:     historyType,
					UserID:   h.UserID,
					UserName: user.Name,
					Date:     h.CreatedAt,
					Data: dto.TrackedItemHistoryRecordData{
						ItemReference: item.Reference,
						LocationID:    d.LocationID,
						LocationName:  location.Name,
					},
				},
			}

			results = append(results, hr)
		default:
			continue
		}

		//results = append(results, res)
	}

	return results, nil
}
