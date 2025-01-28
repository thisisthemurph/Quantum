package handler

import (
	"net/http"
	"quantum/internal/app"
	"quantum/internal/repository"
	"quantum/internal/service"
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
		NewItemHandler(services.ItemService, app.Logger),
		NewLocationHandler(services.LocationService, services.ItemService, app.Logger),
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

	applyMiddlewareFunc := applyMiddlewareFactory(app.Config.ClientBaseURL)

	for _, h := range handlers {
		h.RegisterRoutes(mux, applyMiddlewareFunc)
	}

	return mux
}

// applyMiddlewareFactory creates a single MiddlewareFunc function for applying middleware to all handlers.
func applyMiddlewareFactory(clientBaseURL string) MiddlewareFunc {
	return func(next http.HandlerFunc) http.HandlerFunc {
		return recoverMiddleware(corsMiddleware(next, clientBaseURL))
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
