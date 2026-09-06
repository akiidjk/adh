package main

import (
	"context"
	_ "embed"
	"fmt"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

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
	_ = godotenv.Load()
	LOG_LEVEL = utils.GetEnv("LOG_LEVEL", "info")
	PORT = utils.GetEnv("PORT", utils.GetEnv("WEBHOOK_PORT", "8000"))
	logger.SetLevel(logger.ParseLevel(LOG_LEVEL))
	redis.InitRedis()
}

func main() {
	mux := http.NewServeMux()
	mux.HandleFunc("/healthz", routes.Health)
	mux.HandleFunc("/{$}", routes.Handler)
	mux.HandleFunc("/_", routes.GetExploit)
	mux.HandleFunc("/{endpoint...}", routes.ServePage)

	wrappedMux := middleware.RateLimitMiddleware(middleware.LoggerMiddleware(mux))
	server := &http.Server{
		Addr:              fmt.Sprintf("%s:%s", ADDR, PORT),
		Handler:           wrappedMux,
		ReadHeaderTimeout: 5 * time.Second,
		ReadTimeout:       15 * time.Second,
		WriteTimeout:      15 * time.Second,
		IdleTimeout:       60 * time.Second,
		MaxHeaderBytes:    1 << 20,
	}

	go func() {
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			logger.Fatal("Error starting server: %v", err)
		}
	}()

	logger.Info("Server started on %s:%s", ADDR, PORT)
	signals := make(chan os.Signal, 1)
	signal.Notify(signals, os.Interrupt, syscall.SIGTERM)
	<-signals
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	if err := server.Shutdown(ctx); err != nil {
		logger.Error("Server shutdown failed: %v", err)
	}
	if err := redis.Close(); err != nil {
		logger.Error("Redis shutdown failed: %v", err)
	}
	logger.CloseLogFile()
}
