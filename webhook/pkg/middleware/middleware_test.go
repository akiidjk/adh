package middleware

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

func TestClientIP(t *testing.T) {
	t.Setenv("TRUST_PROXY", "false")
	request := httptest.NewRequest(http.MethodGet, "/", nil)
	request.RemoteAddr = "[2001:db8::1]:1234"
	if got := clientIP(request); got != "2001:db8::1" {
		t.Fatalf("clientIP() = %q", got)
	}

	t.Setenv("TRUST_PROXY", "true")
	request.Header.Set("X-Forwarded-For", "203.0.113.1, 10.0.0.1")
	if got := clientIP(request); got != "203.0.113.1" {
		t.Fatalf("trusted clientIP() = %q", got)
	}
}

func TestLoggerRejectsOversizedBody(t *testing.T) {
	called := false
	handler := LoggerMiddleware(http.HandlerFunc(func(http.ResponseWriter, *http.Request) { called = true }))
	request := httptest.NewRequest(http.MethodPost, "/", strings.NewReader(strings.Repeat("a", maxRequestBody+1)))
	response := httptest.NewRecorder()

	handler.ServeHTTP(response, request)

	if response.Code != http.StatusRequestEntityTooLarge {
		t.Fatalf("status = %d", response.Code)
	}
	if called {
		t.Fatal("oversized request reached the next handler")
	}
}
