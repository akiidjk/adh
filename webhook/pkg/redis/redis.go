package redis

import (
	"context"
	"fmt"
	"strconv"
	"strings"
	"time"

	"github.com/akiidjk/adh/pkg/logger"
	"github.com/akiidjk/adh/pkg/models"
	"github.com/akiidjk/adh/pkg/utils"
	"github.com/redis/go-redis/v9"
)

var client *redis.Client

const HealthCheckInterval = 25 * time.Second

func InitRedis() {
	PORT := utils.GetEnv("REDIS_PORT", "6379")
	ADDR := utils.GetEnv("REDIS_ADDR", "localhost")
	PASS := utils.GetEnv("REDIS_PASSWORD", "")
	DB, _ := strconv.Atoi(utils.GetEnv("REDIS_DB", "0"))

	logger.Debug("Redis configuration - ADDR: %s, PORT: %s, DB: %d, PASS: %s", ADDR, PORT, DB, PASS)
	logger.Info("Initializing Redis client")
	client = redis.NewClient(&redis.Options{
		Addr:            ADDR + ":" + PORT,
		Password:        PASS,
		DB:              DB,
		PoolSize:        50,
		MinIdleConns:    5,
		MinRetryBackoff: 10 * time.Millisecond,
		MaxRetryBackoff: 100 * time.Millisecond,
		MaxRetries:      5,
		DialTimeout:     10 * time.Second,
		ReadTimeout:     5 * time.Second,
		WriteTimeout:    5 * time.Second,
	})
	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
	defer cancel()

	if _, err := client.Ping(ctx).Result(); err != nil {
		logger.Fatal("Failed to connect to Redis: %v", err)
	}

	if err := client.Do(ctx, "FT._LIST").Err(); err != nil {
		logger.Info("RedisJSON module not loaded")
	}

	err := createRequestIndex(ctx)
	if err != nil {
		logger.Fatal("Failed to create request index: %v", err)
	}
	logger.Info("Redis client initialized")
}

func createRequestIndex(ctx context.Context) error {
	_, err := client.Do(ctx,
		"FT.CREATE", "idx:complete_requests",
		"ON", "JSON",
		"SCHEMA",

		"$address", "AS", "address", "TEXT",
		"$port", "AS", "port", "TEXT",
		"$useragent", "AS", "useragent", "TEXT",
		"$method", "AS", "method", "TEXT",
		"$path", "AS", "path", "TEXT",
		"$protocol", "AS", "protocol", "TEXT",

		"$contentlength", "AS", "content_length", "NUMERIC",
		"$timestamp", "AS", "timestamp", "TEXT",

		"$body", "AS", "body_text", "TEXT", "NOINDEX",
	).Result()

	if err != nil && !strings.Contains(err.Error(), "Index already exists") {
		return fmt.Errorf("failed to create index: %w", err)
	}
	return nil
}

func AddRequest(key string, value interface{}) error {
	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
	defer cancel()

	pipe := client.TxPipeline()

	err := pipe.JSONSet(ctx, key, "$", value).Err()
	if err != nil {
		return err
	}
	err = pipe.Do(ctx, "EXPIRE", key, 7*24*60*60).Err()
	if err != nil {
		return err
	}

	streamID := strconv.FormatInt(time.Now().UnixNano()/1e6, 10)

	msg := models.StreamMessage{
		Key:   key,
		Value: value,
		Id:    streamID,
	}

	err = pipe.XAdd(ctx, &redis.XAddArgs{
		Stream: "data_stream",
		Values: msg,
	}).Err()
	if err != nil {
		return err
	}

	_, execErr := pipe.Exec(ctx)
	if execErr != nil {
		return fmt.Errorf("failed to execute redis pipeline: %w", err)
	}
	return execErr
}

func GetPage(endpoint string) (string, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	result := client.HGet(ctx, "page_data", endpoint)
	if result.Err() != nil {
		return "", result.Err()
	}

	data, err := result.Result()
	if err != nil {
		return "", err
	}

	return data, nil
}

func RedisHealthChecker(stop chan bool, status chan bool) {
	var lastStatus bool

	for {
		select {
		case <-stop:
			logger.Info("Stopping Redis health checker...")
			return
		default:
			ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
			if client == nil {
				logger.Error("Redis client is not initialized")
				time.Sleep(HealthCheckInterval)
				cancel()
				return
			}

			err := client.Ping(ctx).Err()
			cancel()

			newStatus := (err == nil)
			if newStatus != lastStatus {
				lastStatus = newStatus
				status <- newStatus
				if !newStatus {
					logger.Error("Redis health check failed: %v", err)
				}
			}

			time.Sleep(HealthCheckInterval)
		}
	}
}
