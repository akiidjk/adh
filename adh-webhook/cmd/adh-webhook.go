package main

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
	"github.com/akiidjk/adh-webhook/pkg/models"
	"github.com/akiidjk/adh-webhook/pkg/redis"
	"github.com/akiidjk/adh-webhook/pkg/utils"
)

var (
	PORT      = utils.GetEnv("PORT", "8000")
	ADDR      = utils.GetEnv("ADDR", "localhost")
	LOG_LEVEL = utils.GetEnv("LOG_LEVEL", "info")
)

//go:embed scripts/script.js
var exploit []byte

func setCORSHeaders(w http.ResponseWriter) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "*")
	w.Header().Set("Access-Control-Allow-Headers", "*")
	w.Header().Set("Access-Control-Max-Age", "86400")
}

func handler(w http.ResponseWriter, r *http.Request) {
	setCORSHeaders(w)

	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusNoContent)
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

	redis.AddRequest(strconv.FormatInt(time.Now().UnixMilli(), 10), string(marshaledRequest))

	w.WriteHeader(http.StatusOK)
	fmt.Fprint(w, "Eat a cookie bro...")
}

func getExploit(w http.ResponseWriter, r *http.Request) {
	logger.Debug("Serving exploit script")
	w.Header().Set("Content-Type", "application/javascript")
	w.Header().Set("X-Content-Type-Options", "nosniff")
	w.WriteHeader(http.StatusOK)
	w.Write(exploit)
}

func init() {
	logger.SetLevel(logger.ParseLevel(LOG_LEVEL))
}

func main() {
	http.HandleFunc("/", handler)
	http.HandleFunc("/_", getExploit)

	go func() {
		if err := http.ListenAndServe(fmt.Sprintf("%s:%s", ADDR, PORT), nil); err != nil {
			logger.Fatal("Error starting server: %v", err)
		}
	}()

	stop := make(chan bool)
	redisStatus := make(chan bool)

	go redis.RedisHealthChecker(stop, redisStatus)

	go func() {
		for status := range redisStatus {
			if status {
				logger.Info("Redis is UP")
			} else {
				logger.Warning("Redis is DOWN! Check connection.")
			}
		}
	}()

	logger.Info("Server started on %s:%s", ADDR, PORT)
	select {}
}
