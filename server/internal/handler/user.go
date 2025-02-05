package handler

import (
	"encoding/json"
	"github.com/google/uuid"
	"log/slog"
	"net/http"
	"quantum/internal/permissions"
	"quantum/internal/service"
	"quantum/pkg/res"
	"strings"
)

type UserHandler struct {
	userService *service.UserService
	logger      *slog.Logger
}

func NewUserHandler(userService *service.UserService, logger *slog.Logger) *UserHandler {
	return &UserHandler{
		userService: userService,
		logger:      logger,
	}
}

func (h *UserHandler) RegisterRoutes(mux *http.ServeMux, mf MiddlewareFunc) {
	mux.HandleFunc("GET /api/v1/user", mf(h.list))
	mux.HandleFunc("GET /api/v1/user/{userId}", mf(h.get))
	mux.HandleFunc("POST /api/v1/user", mf(h.create))
}

type UserCreateRequest struct {
	Name     string                     `json:"name"`
	Username string                     `json:"username"`
	Roles    permissions.RoleCollection `json:"roles"`
}

func (h *UserHandler) list(w http.ResponseWriter, r *http.Request) {
	if !authenticated(r) {
		res.Unauthorized(w)
		return
	}

	if !currentUserRoles(r).IsAdmin() {
		res.Forbidden(w)
		return
	}

	rolesParam := r.URL.Query().Get("roles")
	var roles []string
	if rolesParam != "" {
		roles = strings.Split(rolesParam, ",")
	} else {
		roles = []string{"admin", "reader", "writer", "tracker"}
	}

	users, err := h.userService.List(roles)
	if err != nil {
		res.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	res.JSON(w, users)
}

func (h *UserHandler) get(w http.ResponseWriter, r *http.Request) {
	reqUserID, err := uuid.Parse(r.PathValue("userId"))
	if err != nil {
		h.logger.Error("failed to parse user id", "error", err)
		res.Error(w, "invalid user id", http.StatusBadRequest)
		return
	}

	authedUserID, authed := currentUserID(r)
	if !authed {
		res.Unauthorized(w)
		return
	}

	isSameUser := authedUserID == reqUserID
	if !currentUserRoles(r).IsAdmin() && !isSameUser {
		res.Forbidden(w)
		return
	}

	user, err := h.userService.Get(reqUserID)
	if err != nil {
		res.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	res.JSON(w, user)
}

func (h *UserHandler) create(w http.ResponseWriter, r *http.Request) {
	if !authenticated(r) {
		res.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	if !currentUserRoles(r).IsAdmin() {
		res.Forbidden(w)
		return
	}

	var req UserCreateRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		res.Error(w, "invalid request", http.StatusBadRequest)
		return
	}

	user, err := h.userService.Create(req.Name, req.Username, req.Username, req.Roles)
	if err != nil {
		res.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	res.WithStatus(w, http.StatusCreated).SendJSON(user)
}
