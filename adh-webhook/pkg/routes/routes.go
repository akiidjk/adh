package routes

import (
	_ "embed"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/akiidjk/adh-webhook/pkg/logger"
	"github.com/akiidjk/adh-webhook/pkg/middleware"
	"github.com/akiidjk/adh-webhook/pkg/models"
	"github.com/akiidjk/adh-webhook/pkg/redis"
)

//go:embed scripts/script.js
var exploit []byte

func Handler(w http.ResponseWriter, r *http.Request) {
	middleware.SetCORSHeaders(w)

	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}

	r.ParseForm()

	logger.Debug("Request received from: %s | Method: %s | Path: %s", r.RemoteAddr, r.Method, r.URL.Path)
	logger.Debug("User agent: %s", r.UserAgent())
	logger.Debug("Headers: %v", r.Header)
	logger.Debug("Cookies: %v", r.Cookies())

	bodyBytes, err := io.ReadAll(io.LimitReader(r.Body, 10<<20)) // Limite a 10MB
	if err != nil {
		logger.Error("Error reading request body: %v", err)
		http.Error(w, "Error reading body", http.StatusInternalServerError)
		return
	}
	bodyString := strings.TrimSpace(string(bodyBytes))
	logger.Debug("Body (trimmed): %.1000s", bodyString)

	request := models.Request{
		RemoteAddr:    r.RemoteAddr,
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
		TimeStamp:     time.Now().Format(time.RFC3339),
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

	redis.AddRequest(strconv.FormatInt(time.Now().UnixMilli(), 10), marshaledRequest)

	w.WriteHeader(http.StatusOK)
	fmt.Fprint(w, "Eat a cookie bro...")
}

func GetExploit(w http.ResponseWriter, r *http.Request) {
	logger.Debug("Serving exploit script")
	middleware.SetCORSHeaders(w)
	w.Header().Set("Content-Type", "application/javascript")
	w.Header().Set("X-Content-Type-Options", "nosniff")
	w.WriteHeader(http.StatusOK)
	w.Write(exploit)
}
