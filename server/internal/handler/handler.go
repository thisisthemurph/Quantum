package handler

import (
	"context"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"net/http"
	"quantum/internal/app"
	"quantum/internal/permissions"
	"quantum/internal/repository"
	"quantum/internal/service"
	"time"
)

type HandlerBuilder interface {
	RegisterRoutes(mux *http.ServeMux, mf MiddlewareFunc)
}

type MiddlewareFunc func(http.HandlerFunc) http.HandlerFunc

func BuildServerMux(app *app.App) *http.ServeMux {
	mux := http.NewServeMux()

	repositories := repository.NewRepositories(app.DB)
	services := service.NewServices(repositories)

	handlers := []HandlerBuilder{
		NewAuthHandler(services.UserService, app.Config.SessionSecret, app.Logger),
		NewUserHandler(services.UserService, app.Logger),
		NewItemHandler(services.ItemService, services.SettingsService, app.Logger),
		NewLocationHandler(services.LocationService, services.ItemService, app.Logger),
		NewSettingsHandler(services.SettingsService, app.Logger),
	}

	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodOptions {
			w.Header().Set("Access-Control-Allow-Origin", app.Config.ClientBaseURL)
			w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
			w.Header().Set("Access-Control-Allow-Headers", "Authorization, Content-Type, Accept, X-Requested-With, AnonymousUserId")
			w.Header().Set("Access-Control-Allow-Credentials", "true")
			w.WriteHeader(http.StatusNoContent)
			return
		}

		http.NotFound(w, r)
	})

	applyMiddlewareFunc := applyMiddlewareFactory(app.Config)

	for _, h := range handlers {
		h.RegisterRoutes(mux, applyMiddlewareFunc)
	}

	return mux
}

// applyMiddlewareFactory creates a single MiddlewareFunc function for applying middleware to all handlers.
func applyMiddlewareFactory(conf *app.Config) MiddlewareFunc {
	return func(next http.HandlerFunc) http.HandlerFunc {
		return recoverMiddleware(withAuthenticatedUserMiddleware(corsMiddleware(next, conf.ClientBaseURL), conf.SessionSecret))
	}
}

func withAuthenticatedUserMiddleware(next http.HandlerFunc, sessionSecret string) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		tokenCookie, err := r.Cookie("token")
		if err != nil || tokenCookie == nil {
			next.ServeHTTP(w, r)
			return
		}

		token, err := jwt.Parse(tokenCookie.Value, func(token *jwt.Token) (interface{}, error) {
			return []byte(sessionSecret), nil
		})

		if err != nil {
			next.ServeHTTP(w, r)
			return
		}

		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok {
			next.ServeHTTP(w, r)
			return
		}

		exp, ok := claims["exp"].(float64)
		if !ok {
			next.ServeHTTP(w, r)
			return
		}

		expiration := time.Unix(int64(exp), 0)
		if time.Now().After(expiration) {
			next.ServeHTTP(w, r)
			return
		}

		userID, err := uuid.Parse(claims["sub"].(string))
		if err != nil {
			next.ServeHTTP(w, r)
			return
		}

		claimRoles, ok := claims["roles"].([]interface{})
		roles := make(permissions.RoleCollection, 0, len(claimRoles))
		if ok {
			for _, r := range claimRoles {
				roles = append(roles, permissions.NewRole(r.(string)))
			}
		}

		ctx := context.WithValue(r.Context(), "user_id", userID)
		ctx = context.WithValue(ctx, "user_roles", roles)
		r = r.WithContext(ctx)

		next.ServeHTTP(w, r)
	}
}

// corsMiddleware sets up CORS configuration.
func corsMiddleware(next http.HandlerFunc, clientBaseURL string) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", clientBaseURL)
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Authorization, Content-Type, Accept, X-Requested-With")
		w.Header().Set("Access-Control-Allow-Credentials", "true")

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}

		next.ServeHTTP(w, r)
	}
}

// recoverMiddleware handles recovering from a panic.
func recoverMiddleware(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		defer func() {
			if err := recover(); err != nil {
				http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
			}
		}()
		next.ServeHTTP(w, r)
	}
}
