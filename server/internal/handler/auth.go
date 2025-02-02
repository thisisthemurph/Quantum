package handler

import (
	"database/sql"
	"encoding/json"
	"errors"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"log/slog"
	"net/http"
	"quantum/internal/dto"
	"quantum/internal/permissions"
	"quantum/internal/service"
	"quantum/pkg/res"
	"time"
)

type AuthHandler struct {
	userService   *service.UserService
	sessionSecret string
	logger        *slog.Logger
}

func NewAuthHandler(userService *service.UserService, sessionSecret string, logger *slog.Logger) *AuthHandler {
	return &AuthHandler{
		userService:   userService,
		sessionSecret: sessionSecret,
		logger:        logger,
	}
}

func (h *AuthHandler) RegisterRoutes(mux *http.ServeMux, mf MiddlewareFunc) {
	mux.HandleFunc("POST /api/v1/auth/signup", mf(h.signup))
	mux.HandleFunc("POST /api/v1/auth/login", mf(h.login))
	mux.HandleFunc("POST /api/v1/auth/logout", mf(h.logout))
	mux.HandleFunc("GET /api/v1/auth/user/refresh", mf(h.getCurrentUser))
}

func (h *AuthHandler) getCurrentUser(w http.ResponseWriter, r *http.Request) {
	userID, _ := currentUserID(r)
	if userID == uuid.Nil {
		res.WithStatus(w, http.StatusNotFound).SendJSON(nil)
		return
	}

	user, err := h.userService.Get(userID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			res.WithStatus(w, http.StatusNotFound).SendJSON(nil)
			return
		}
		h.logger.Error("failed to get user", "error", err)
		res.InternalServerError(w)
		return
	}

	res.JSON(w, user)
}

func (h *AuthHandler) signup(w http.ResponseWriter, r *http.Request) {
	var request dto.SignUpRequest
	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		res.Error(w, "invalid request", http.StatusBadRequest)
		return
	}

	if err := request.Validate(); err != nil {
		res.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	role := permissions.ReaderRole
	count, err := h.userService.CountUsers()
	if err != nil {
		h.logger.Error("failed to count users", "error", err)
		res.InternalServerError(w)
		return
	} else if count == 0 {
		role = permissions.AdminRole
	}

	user, err := h.userService.Create(request, role)
	if err != nil {
		h.logger.Error("failed to create user", "username", request.Username, "error", err)
		res.InternalServerError(w)
		return
	}

	res.WithStatus(w, http.StatusCreated).SendJSON(user)
}

func (h *AuthHandler) login(w http.ResponseWriter, r *http.Request) {
	var request dto.LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		res.Error(w, "invalid request", http.StatusBadRequest)
		return
	}

	if err := request.Validate(); err != nil {
		res.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	user, err := h.userService.VerifyPassword(request.Username, request.Password)
	if err != nil {
		res.Error(w, "invalid username or password", http.StatusUnauthorized)
		return
	}

	jwtExpiration := time.Now().Add(time.Hour * 24)
	claims := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"sub":   user.ID.String(),
		"exp":   jwtExpiration.Unix(),
		"roles": user.Roles,
	})

	token, err := claims.SignedString([]byte(h.sessionSecret))
	if err != nil {
		h.logger.Error("failed to sign token", "error", err)
		res.InternalServerError(w)
		return
	}

	// write the token to a cookie
	http.SetCookie(w, &http.Cookie{
		Name:     "token",
		Value:    token,
		Expires:  jwtExpiration,
		HttpOnly: true,
		Secure:   false,
		SameSite: http.SameSiteLaxMode,
		Path:     "/",
	})

	res.JSON(w, user)
}

func (h *AuthHandler) logout(w http.ResponseWriter, r *http.Request) {
	http.SetCookie(w, &http.Cookie{
		Name:     "token",
		Value:    "",
		Expires:  time.Now().Add(-time.Hour),
		HttpOnly: true,
		Secure:   false,
		SameSite: http.SameSiteLaxMode,
		Path:     "/",
	})
}
