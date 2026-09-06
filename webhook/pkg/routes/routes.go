package routes

import (
	"bytes"
	"context"
	_ "embed"
	"fmt"
	"net/http"
	"time"

	"github.com/akiidjk/adh/pkg/logger"
	"github.com/akiidjk/adh/pkg/middleware"
	"github.com/akiidjk/adh/pkg/redis"
	"github.com/akiidjk/adh/pkg/utils"
)

//go:embed scripts/script.js
var exploit []byte

func Health(w http.ResponseWriter, _ *http.Request) {
	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
	defer cancel()
	if err := redis.Ping(ctx); err != nil {
		http.Error(w, "Service unavailable", http.StatusServiceUnavailable)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func Handler(w http.ResponseWriter, r *http.Request) {
	middleware.SetCORSHeaders(w)

	w.WriteHeader(http.StatusOK)
	_, err := fmt.Fprint(w, "Eat a cookie bro...")
	if err != nil {
		logger.Error("Error writing response: %v", err)
	}
}

func GetExploit(w http.ResponseWriter, r *http.Request) {
	logger.Debug("Serving exploit script")
	middleware.SetCORSHeaders(w)
	w.Header().Set("Content-Type", "application/javascript")
	w.Header().Set("X-Content-Type-Options", "nosniff")
	w.WriteHeader(http.StatusOK)
	publicURL := utils.GetEnv("WEBHOOK_PUBLIC_URL", "http://localhost:8000")
	_, err := w.Write(bytes.ReplaceAll(exploit, []byte("http://localhost:8000"), []byte(publicURL)))
	if err != nil {
		logger.Error("Error writing exploit script: %v", err)
	}
}

func ServePage(w http.ResponseWriter, r *http.Request) {
	middleware.SetCORSHeaders(w)
	endpoint := r.PathValue("endpoint")
	logger.Debug("Serving page: %s", endpoint)
	response, err := redis.GetResponse(endpoint)
	if err != nil {
		logger.Error("Error retrieving page from Redis: %v", err)
		http.Error(w, "Page not found", http.StatusNotFound)
		return
	}
	if response.Status < 100 || response.Status > 599 {
		logger.Error("Invalid stored status for page %q: %d", endpoint, response.Status)
		http.Error(w, "Invalid page configuration", http.StatusInternalServerError)
		return
	}

	for header, value := range response.Headers {
		w.Header().Set(header, value)
	}

	w.WriteHeader(response.Status)

	_, err = w.Write([]byte(response.Body))
	if err != nil {
		logger.Error("Error writing page content: %v", err)
	}
}
