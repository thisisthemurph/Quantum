package handler

import (
	"fmt"
	"github.com/google/uuid"
	"net/http"
	"strconv"
)

func currentUserID(r *http.Request) (uuid.UUID, bool) {
	id, ok := r.Context().Value("user_id").(uuid.UUID)
	return id, ok
}

func authenticated(r *http.Request) bool {
	x, ok := currentUserID(r)
	fmt.Println(x)
	return ok
}

type Filters struct {
	Max            *int
	Filter         string
	IncludeDeleted bool
}

func getFiltersFromRequest(r *http.Request) Filters {
	return Filters{
		Max:            getMaxQueryParam(r),
		Filter:         getFilterQueryParam(r),
		IncludeDeleted: getIncludeDeletedQueryParam(r),
	}
}

func getMaxQueryParam(r *http.Request) *int {
	m := r.URL.Query().Get("max")
	if m == "" {
		return nil
	}
	maxInt, err := strconv.Atoi(m)
	if err != nil {
		return nil
	}
	return &maxInt
}

func getFilterQueryParam(r *http.Request) string {
	return r.URL.Query().Get("filter")
}

func getIncludeDeletedQueryParam(r *http.Request) bool {
	includeDeleted, _ := strconv.ParseBool(r.URL.Query().Get("includeDeleted"))
	return includeDeleted
}
