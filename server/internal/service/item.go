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
	itemRepo repository.ItemRepository
}

func NewItemService(itemRepo repository.ItemRepository) *ItemService {
	return &ItemService{
		itemRepo: itemRepo,
	}
}

func (s *ItemService) GetByID(id uuid.UUID) (dto.ItemResponse, error) {
	i, err := s.itemRepo.GetByID(id)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return dto.ItemResponse{}, ErrItemNotFound
		}
		return dto.ItemResponse{}, err
	}

	return dto.ItemResponse{
		ID:          i.ID,
		Reference:   i.Reference,
		GroupKey:    i.GroupKey,
		Description: i.Description,
		CreatedAt:   i.CreatedAt,
		UpdatedAt:   i.UpdatedAt,
	}, nil
}

func (s *ItemService) List() ([]dto.ItemResponse, error) {
	items, err := s.itemRepo.List()
	if err != nil {
		return nil, err
	}

	var itemsResponse = make([]dto.ItemResponse, len(items))
	for i, item := range items {
		itemsResponse[i] = dto.ItemResponse{
			ID:          item.ID,
			Reference:   item.Reference,
			GroupKey:    item.GroupKey,
			Description: item.Description,
			CreatedAt:   item.CreatedAt,
			UpdatedAt:   item.UpdatedAt,
		}
	}

	return itemsResponse, nil
}

func (s *ItemService) ListItemGroups() ([]string, error) {
	return s.itemRepo.ListItemGroups()
}

func (s *ItemService) Create(item dto.CreateItemRequest) (dto.ItemResponse, error) {
	i := model.ItemModel{
		Reference:   item.Reference,
		GroupKey:    item.GroupKey,
		Description: item.Description,
	}

	if err := s.itemRepo.Create(&i); err != nil {
		return dto.ItemResponse{}, err
	}

	return dto.ItemResponse{
		ID:          i.ID,
		Reference:   i.Reference,
		GroupKey:    i.GroupKey,
		Description: i.Description,
		CreatedAt:   i.CreatedAt,
		UpdatedAt:   i.UpdatedAt,
	}, nil
}

func (s *ItemService) Delete(id uuid.UUID) error {
	return s.itemRepo.Delete(id)
}
