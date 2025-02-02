package handler

import (
	"github.com/google/uuid"
	"net/http"
	"quantum/internal/permissions"
)

// authenticated checks if the request is authenticated.
// Returns true if the request has a user_id on the context, false otherwise.
func authenticated(r *http.Request) bool {
	_, ok := currentUserID(r)
	return ok
}

// currentUserID returns the user_id from the request context.
// Returns the user_id and true if it exists, uuid.Nil and false otherwise.
func currentUserID(r *http.Request) (uuid.UUID, bool) {
	id, ok := r.Context().Value("user_id").(uuid.UUID)
	return id, ok
}

// currentUserRoles returns the roles from the request context.
// Returns the roles if it exists, an empty RoleCollection otherwise.
func currentUserRoles(r *http.Request) permissions.RoleCollection {
	roles, ok := r.Context().Value("user_roles").(permissions.RoleCollection)
	if !ok {
		return permissions.RoleCollection{}
	}
	return roles
}
