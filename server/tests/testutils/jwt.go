package testutils

import (
	"github.com/golang-jwt/jwt/v5"
	"net/http"
	"quantum/internal/model"
	"testing"
	"time"
)

func RequestWithJWT(t *testing.T, req *http.Request, user *model.User, secret string) {
	claims := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"sub":   user.ID.String(),
		"exp":   time.Now().Add(time.Hour).Unix(),
		"roles": user.Roles,
	})

	token, err := claims.SignedString([]byte(secret))
	if err != nil {
		t.Fatal(err)
	}

	cookie := &http.Cookie{
		Name:     "token",
		Value:    token,
		Expires:  time.Now().Add(time.Hour),
		HttpOnly: true,
		Secure:   false,
		SameSite: http.SameSiteLaxMode,
		Path:     "/",
	}

	req.AddCookie(cookie)
}
