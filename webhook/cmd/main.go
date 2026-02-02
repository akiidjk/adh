package main

import (
	_ "embed"
	"fmt"
	"net/http"

	"github.com/akiidjk/adh/pkg/logger"
	"github.com/akiidjk/adh/pkg/middleware"
	"github.com/akiidjk/adh/pkg/redis"
	"github.com/akiidjk/adh/pkg/routes"
	"github.com/akiidjk/adh/pkg/utils"
	"github.com/joho/godotenv"
)

var (
	PORT      = "8000"
	LOG_LEVEL = "info"
)

const ADDR = "0.0.0.0"

func init() {
	err := godotenv.Load()
	if err != nil {
		fmt.Printf("Error loading .env file: %v\n", err)
	}
	LOG_LEVEL = utils.GetEnv("LOG_LEVEL", "info")
	logger.SetLevel(logger.ParseLevel(LOG_LEVEL))
	redis.InitRedis()
}

func main() {
	mux := http.NewServeMux()
	mux.HandleFunc("/", routes.Handler)
	mux.HandleFunc("/_", routes.GetExploit)
	mux.HandleFunc("/{endpoint}", routes.ServePage)

	wrappedMux := middleware.RateLimitMiddleware(mux)
	wrappedMux = middleware.LoggerMiddleware(wrappedMux)

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
