package testutils

import (
	"net/http"
	"net/http/httptest"
	"quantum/internal/handler"
)

func ServeRequest(h handler.HandlerBuilder, req *http.Request, secret string) *httptest.ResponseRecorder {
	rr := httptest.NewRecorder()
	mux := http.NewServeMux()
	h.RegisterRoutes(mux, func(next http.HandlerFunc) http.HandlerFunc {
		return handler.WithAuthenticatedUserMiddleware(next, secret)
	})
	mux.ServeHTTP(rr, req)
	return rr
}
