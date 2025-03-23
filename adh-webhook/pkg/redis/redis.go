package redis

import (
	"context"
	"strconv"
	"time"

	"github.com/akiidjk/adh-webhook/pkg/logger"
	"github.com/akiidjk/adh-webhook/pkg/utils"
	"github.com/redis/go-redis/v9"
)

var client *redis.Client

const HealthCheckInterval = 25 * time.Second

var (
	PORT  = utils.GetEnv("REDIS_PORT", "6379")
	ADDR  = utils.GetEnv("REDIS_ADDR", "localhost")
	PASS  = utils.GetEnv("REDIS_PASS", "")
	DB, _ = strconv.Atoi(utils.GetEnv("REDIS_DB", "0"))
)

func init() {
	logger.Debug("Initializing Redis client")
	client = redis.NewClient(&redis.Options{
		Addr:     ADDR + ":" + PORT,
		Password: PASS,
		DB:       DB,
	})
}

func AddRequest(key string, value string) error {
	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
	defer cancel()
	return client.Set(ctx, key, value, 7*24*time.Hour).Err()
}

func RedisHealthChecker(stop chan bool, status chan bool) {
	for {
		select {
		case <-stop:
			logger.Info("Stopping Redis health checker...")
			return
		default:
			ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
			err := client.Ping(ctx).Err()
			cancel()

			if err != nil {
				logger.Error("Redis health check failed: %v", err)
				status <- false
			} else {
				status <- true
			}
			time.Sleep(HealthCheckInterval)
		}
	}
}
