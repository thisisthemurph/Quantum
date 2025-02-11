package handler

import (
	"database/sql"
	"encoding/json"
	"errors"
	"log/slog"
	"net/http"
	"time"

	"quantum/internal/dto"
	"quantum/internal/permissions"
	"quantum/internal/service"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"github.com/thisisthemurph/emit"
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
	mux.HandleFunc("PUT /api/v1/auth/user/{userId}/password", mf(h.updateUserPassword))
}

func (h *AuthHandler) getCurrentUser(w http.ResponseWriter, r *http.Request) {
	userID, _ := currentUserID(r)
	if userID == uuid.Nil {
		emit.New(w).Status(http.StatusUnauthorized).ErrorJSON("You must be signed in")
		return
	}

	user, err := h.userService.Get(userID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			emit.New(w).Status(http.StatusNotFound).ErrorJSON("User not found")
			return
		}
		h.logger.Error("failed to get user", "error", err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	emit.New(w).JSON(user)
}

func (h *AuthHandler) signup(w http.ResponseWriter, r *http.Request) {
	var request dto.SignUpRequest
	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		emit.New(w).Status(http.StatusBadRequest).ErrorJSON("Invalid request")
		return
	}

	if err := request.Validate(); err != nil {
		emit.New(w).Status(http.StatusBadRequest).ErrorJSON(err.Error())
		return
	}

	role := permissions.ReaderRole
	count, err := h.userService.CountUsers()
	if err != nil {
		h.logger.Error("failed to count users", "error", err)
		emit.New(w).ErrorJSON("internal server error")
		return
	} else if count == 0 {
		// Set the role to admin if this is the first user to ever sign up.
		role = permissions.AdminRole
	}

	user, err := h.userService.Create(request.Name, request.Username, request.Password.String(), permissions.RoleCollection{role})
	if err != nil {
		if errors.Is(err, service.ErrUserUsernameExists) {
			emit.New(w).Status(http.StatusConflict).ErrorJSON("Username already taken, please choose another")
			return
		}
		h.logger.Error("failed to create user", "username", request.Username, "error", err)
		emit.New(w).ErrorJSON("failed to create user")
		return
	}

	emit.New(w).Status(http.StatusCreated).JSON(user)
}

func (h *AuthHandler) login(w http.ResponseWriter, r *http.Request) {
	var request dto.LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		emit.New(w).Status(http.StatusBadRequest).ErrorJSON("Invalid request")
		return
	}

	if err := request.Validate(); err != nil {
		emit.New(w).Status(http.StatusBadRequest).ErrorJSON(err.Error())
		return
	}

	user, err := h.userService.VerifyPasswordByUsername(request.Username, request.Password)
	if err != nil {
		emit.New(w).Status(http.StatusUnauthorized).ErrorJSON("Invalid username or password")
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
		emit.New(w).ErrorJSON("internal server error")
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

	if err := h.userService.UpdateLastLoggedIn(user.ID); err != nil {
		// An error here should not prevent a success
		h.logger.Error("failed to update user last logged in timestamp")
	}

	emit.New(w).JSON(user)
}

func (h *AuthHandler) logout(w http.ResponseWriter, r *http.Request) {
	emit.New(w).Cookie(&http.Cookie{
		Name:     "token",
		Value:    "",
		Expires:  time.Now().Add(-time.Hour),
		HttpOnly: true,
		Secure:   false,
		SameSite: http.SameSiteLaxMode,
		Path:     "/",
	}).NoContent()
}

func (h *AuthHandler) updateUserPassword(w http.ResponseWriter, r *http.Request) {
	var req dto.UpdatePasswordRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		emit.New(w).Status(http.StatusBadRequest).ErrorJSON("Invalid request")
		return
	}

	updateUserID, err := uuid.Parse(r.PathValue("userId"))
	if err != nil {
		emit.New(w).Status(http.StatusBadRequest).ErrorJSON("Invalid user ID")
		return
	}

	if !isCurrentUser(r, updateUserID) {
		emit.New(w).Status(http.StatusForbidden).ErrorJSON("You do not have permission to perform this action")
		return
	}

	if err := req.Validate(); err != nil {
		message := "There was an issue updating your password, please check and try again"
		if errors.Is(err, dto.ErrPasswordSame) {
			message = "The new password must not be the same as the old one"
		}
		emit.New(w).Status(http.StatusBadRequest).ErrorJSON(message)
		return
	}

	if err := h.userService.UpdatePassword(updateUserID, req.CurrentPassword.String(), req.NewPassword.String()); err != nil {
		if errors.Is(err, service.ErrPasswordsDoNotMatch) {
			emit.New(w).Status(http.StatusBadRequest).ErrorJSON("Current password is not correct")
		} else {
			h.logger.Error("failed to update user password", "user", updateUserID, "error", err)
			w.WriteHeader(http.StatusInternalServerError)
		}
		return
	}
}
