package middleware

import (
	"net/http"
	"strings"
	"sync"

	"github.com/akiidjk/adh-webhook/pkg/logger"
	"golang.org/x/time/rate"
)

var rateLimiters = struct {
	sync.RWMutex
	m map[string]*rate.Limiter
}{m: make(map[string]*rate.Limiter)}

const requestsPerSecond = 5
const burstLimit = 10

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
