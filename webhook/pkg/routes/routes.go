package routes

import (
	_ "embed"
	"encoding/json"
	"fmt"
	"io"
	"net"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/akiidjk/adh/pkg/logger"
	"github.com/akiidjk/adh/pkg/middleware"
	"github.com/akiidjk/adh/pkg/models"
	"github.com/akiidjk/adh/pkg/redis"
)

//go:embed scripts/script.js
var exploit []byte

func Handler(w http.ResponseWriter, r *http.Request) {
	middleware.SetCORSHeaders(w)

	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}

	err := r.ParseForm()
	if err != nil {
		logger.Error("Error parsing form data: %v", err)
		http.Error(w, "Error parsing form data", http.StatusBadRequest)
		return
	}

	logger.Debug("Request received from: %s | Method: %s | Path: %s", r.RemoteAddr, r.Method, r.URL.Path)
	logger.Debug("User agent: %s", r.UserAgent())
	logger.Debug("Headers: %v", r.Header)
	logger.Debug("Cookies: %v", r.Cookies())

	bodyBytes, err := io.ReadAll(io.LimitReader(r.Body, 10<<20)) // 10mb limits
	if err != nil {
		logger.Error("Error reading request body: %v", err)
		http.Error(w, "Error reading body", http.StatusInternalServerError)
		return
	}
	bodyString := strings.TrimSpace(string(bodyBytes))
	logger.Debug("Body (trimmed): %.1000s", bodyString)

	host, port, err := net.SplitHostPort(r.RemoteAddr)
	if err != nil {
		logger.Error("Error splitting host and port: %v", err)
		http.Error(w, "Error processing address", http.StatusInternalServerError)
		return
	}

	request := models.Request{
		Address:       host,
		Port:          port,
		UserAgent:     r.UserAgent(),
		Method:        r.Method,
		Path:          r.URL.Path,
		Headers:       r.Header,
		Body:          bodyBytes,
		Cookies:       r.Cookies(),
		ContentLength: r.ContentLength,
		Protocol:      r.Proto,
		Form:          r.Form,
		PostForm:      r.PostForm,
		TimeStamp:     time.Now().Format(time.RFC3339Nano),
	}

	if _, exists := r.Header["X-Report"]; exists && len(bodyString) > 0 {
		var report models.Report
		if err := json.Unmarshal(bodyBytes, &report); err != nil {
			logger.Error("Error parsing JSON report: %v", err)
		} else {
			logger.Debug("Report parsed: %+v", report)
			request.Report = report
		}
	}

	marshaledRequest, err := json.Marshal(request)
	if err != nil {
		logger.Error("Error marshaling request: %v", err)
		http.Error(w, "Error marshaling request", http.StatusInternalServerError)
		return
	}

	err = redis.AddRequest(strconv.FormatInt(time.Now().UnixMilli(), 10), marshaledRequest)
	if err != nil {
		logger.Error("Error storing request in Redis: %v", err)
		http.Error(w, "Error storing request", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	_, err = fmt.Fprint(w, "Eat a cookie bro...")
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
