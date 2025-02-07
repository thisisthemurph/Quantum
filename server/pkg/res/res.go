package res

import (
	"encoding/json"
	"net/http"
)

type APIResponse struct {
	writer http.ResponseWriter
}

func WithStatus(w http.ResponseWriter, status int) APIResponse {
	w.WriteHeader(status)
	return APIResponse{w}
}

func (r APIResponse) SendJSON(v any) {
	JSON(r.writer, v)
}

func JSON(w http.ResponseWriter, v any) {
	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(v); err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "Error encoding response"})
	}
}

func Error(w http.ResponseWriter, message string, status int) {
	w.WriteHeader(status)
	JSON(w, map[string]string{"error": message})
}

func Unauthorized(w http.ResponseWriter) {
	http.Error(w, "You must be signed in to perform this action", http.StatusUnauthorized)
}

func Forbidden(w http.ResponseWriter) {
	http.Error(w, "You do not have permissions to perform this action", http.StatusForbidden)
}

func InternalServerError(w http.ResponseWriter) {
	http.Error(w, "internal server error", http.StatusInternalServerError)
}
