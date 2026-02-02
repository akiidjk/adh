package middleware

import (
	"encoding/json"
	"io"
	"net"
	"net/http"
	"strconv"
	"strings"
	"sync"
	"time"

	"github.com/akiidjk/adh/pkg/logger"
	"github.com/akiidjk/adh/pkg/models"
	"github.com/akiidjk/adh/pkg/redis"
	"golang.org/x/time/rate"
)

var rateLimiters = struct {
	sync.RWMutex
	m map[string]*rate.Limiter
}{m: make(map[string]*rate.Limiter)}

const (
	requestsPerSecond = 5
	burstLimit        = 10
)

func getRateLimiter(ip string) *rate.Limiter {
	rateLimiters.RLock()
	limiter, exists := rateLimiters.m[ip]
	rateLimiters.RUnlock()

	if !exists {
		limiter = rate.NewLimiter(rate.Limit(requestsPerSecond), burstLimit)
		rateLimiters.Lock()
		rateLimiters.m[ip] = limiter
		rateLimiters.Unlock()
	}

	return limiter
}

func RateLimitMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		ip := strings.Split(r.RemoteAddr, ":")[0] // Ottieni solo l'IP senza porta
		limiter := getRateLimiter(ip)

		if !limiter.Allow() {
			logger.Warning("Rate limit exceeded for IP: %s", ip)
			http.Error(w, "Too many requests", http.StatusTooManyRequests)
			return
		}
		next.ServeHTTP(w, r)
	})
}

func SetCORSHeaders(w http.ResponseWriter) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "*")
	w.Header().Set("Access-Control-Allow-Headers", "*")
	w.Header().Set("Access-Control-Max-Age", "86400")
	w.Header().Set("Vary", "Origin")
}

func LoggerMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
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

		next.ServeHTTP(w, r)
	})
}
