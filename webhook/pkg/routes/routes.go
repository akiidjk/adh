package routes

import (
	_ "embed"
	"fmt"
	"net/http"

	"github.com/akiidjk/adh/pkg/logger"
	"github.com/akiidjk/adh/pkg/middleware"
	"github.com/akiidjk/adh/pkg/redis"
)

//go:embed scripts/script.js
var exploit []byte

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
	_, err := w.Write(exploit)
	if err != nil {
		logger.Error("Error writing exploit script: %v", err)
	}
}

func ServePage(w http.ResponseWriter, r *http.Request) {
	middleware.SetCORSHeaders(w)
	w.WriteHeader(http.StatusOK)
	endpoint := r.PathValue("endpoint")
	logger.Debug("Serving page: %s", endpoint)
	pageContent, err := redis.GetPage(endpoint)
	if err != nil {
		logger.Error("Error retrieving page from Redis: %v", err)
		http.Error(w, "Page not found", http.StatusNotFound)
		return
	}
	_, err = w.Write([]byte(pageContent))
	if err != nil {
		logger.Error("Error writing page content: %v", err)
	}
}
