package middleware

import (
	"bytes"
	"encoding/json"
	"errors"
	"io"
	"net"
	"net/http"
	"os"
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
	m           map[string]limiterEntry
	lastCleanup time.Time
}{m: make(map[string]limiterEntry), lastCleanup: time.Now()}

type limiterEntry struct {
	limiter  *rate.Limiter
	lastSeen time.Time
}

const (
	requestsPerSecond = 5
	burstLimit        = 10
	maxRequestBody    = 10 << 20
	limiterTTL        = 10 * time.Minute
)

func getRateLimiter(ip string) *rate.Limiter {
	now := time.Now()
	rateLimiters.Lock()
	defer rateLimiters.Unlock()

	if now.Sub(rateLimiters.lastCleanup) >= time.Minute {
		for key, entry := range rateLimiters.m {
			if now.Sub(entry.lastSeen) > limiterTTL {
				delete(rateLimiters.m, key)
			}
		}
		rateLimiters.lastCleanup = now
	}

	entry, exists := rateLimiters.m[ip]
	if !exists {
		entry.limiter = rate.NewLimiter(rate.Limit(requestsPerSecond), burstLimit)
	}
	entry.lastSeen = now
	rateLimiters.m[ip] = entry
	return entry.limiter
}

func RateLimitMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		ip := clientIP(r)
		limiter := getRateLimiter(ip)

		if !limiter.Allow() {
			logger.Warning("Rate limit exceeded for IP: %s", ip)
			http.Error(w, "Too many requests", http.StatusTooManyRequests)
			return
		}
		next.ServeHTTP(w, r)
	})
}

func clientIP(r *http.Request) string {
	if os.Getenv("TRUST_PROXY") == "true" {
		forwarded := strings.TrimSpace(strings.Split(r.Header.Get("X-Forwarded-For"), ",")[0])
		if net.ParseIP(forwarded) != nil {
			return forwarded
		}
	}
	host, _, err := net.SplitHostPort(r.RemoteAddr)
	if err == nil {
		return host
	}
	return r.RemoteAddr
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
		if r.URL.Path == "/healthz" {
			next.ServeHTTP(w, r)
			return
		}
		r.Body = http.MaxBytesReader(w, r.Body, maxRequestBody)
		bodyBytes, err := io.ReadAll(r.Body)
		_ = r.Body.Close()
		if err != nil {
			var tooLarge *http.MaxBytesError
			if errors.As(err, &tooLarge) {
				http.Error(w, "Request body too large", http.StatusRequestEntityTooLarge)
				return
			}
			logger.Error("Error reading request body: %v", err)
			http.Error(w, "Error reading body", http.StatusBadRequest)
			return
		}

		r.Body = io.NopCloser(bytes.NewReader(bodyBytes))
		err = r.ParseForm()
		if err != nil {
			logger.Error("Error parsing form data: %v", err)
			http.Error(w, "Error parsing form data", http.StatusBadRequest)
			return
		}

		logger.Debug("Request received from: %s | Method: %s | Path: %s", r.RemoteAddr, r.Method, r.URL.Path)
		logger.Debug("User agent: %s", r.UserAgent())
		logger.Debug("Headers: %v", r.Header)
		logger.Debug("Cookies: %v", r.Cookies())

		r.Body = io.NopCloser(bytes.NewReader(bodyBytes))
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

		for header, values := range r.Header {
			if header == "User-Agent" && strings.Contains(strings.ToLower(values[0]), "uptime-kuma") {
				next.ServeHTTP(w, r) // if is uptime-kuma, don't store in redis
				return
			}
		}

		_, err = redis.AddRequest(marshaledRequest)
		if err != nil {
			logger.Error("Error storing request in Redis: %v", err)
			http.Error(w, "Error storing request", http.StatusInternalServerError)
			return
		}

		next.ServeHTTP(w, r)
	})
}
