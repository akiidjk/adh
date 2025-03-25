package main

import (
	_ "embed"
	"fmt"
	"net/http"

	"github.com/akiidjk/adh-webhook/pkg/logger"
	"github.com/akiidjk/adh-webhook/pkg/middleware"
	"github.com/akiidjk/adh-webhook/pkg/redis"
	"github.com/akiidjk/adh-webhook/pkg/routes"
	"github.com/akiidjk/adh-webhook/pkg/utils"
)

var (
	PORT      = utils.GetEnv("PORT", "8000")
	ADDR      = utils.GetEnv("ADDR", "localhost")
	LOG_LEVEL = utils.GetEnv("LOG_LEVEL", "info")
)

func init() {
	logger.SetLevel(logger.ParseLevel(LOG_LEVEL))
}

func main() {
	mux := http.NewServeMux()
	mux.HandleFunc("/", routes.Handler)
	mux.HandleFunc("/_", routes.GetExploit)

	wrappedMux := middleware.RateLimitMiddleware(mux)

	go func() {
		if err := http.ListenAndServe(fmt.Sprintf("%s:%s", ADDR, PORT), wrappedMux); err != nil {
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
