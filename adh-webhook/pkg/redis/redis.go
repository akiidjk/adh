package redis

import (
	"context"
	"fmt"
	"strconv"
	"strings"
	"time"

	"github.com/akiidjk/adh-webhook/pkg/logger"
	"github.com/akiidjk/adh-webhook/pkg/models"
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
	logger.Info("Initializing Redis client")
	client = redis.NewClient(&redis.Options{
		Addr:         ADDR + ":" + PORT,
		Password:     PASS,
		DB:           DB,
		PoolSize:     50,
		MinIdleConns: 5,
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
		// Base fields
		"$.remoteaddr", "AS", "ip", "TAG",
		"$.useragent", "AS", "useragent", "TEXT", "NOSTEM",
		"$.method", "AS", "method", "TAG",
		"$.path", "AS", "path", "TEXT",
		"$.protocol", "AS", "protocol", "TAG",
		"$.contentlength", "AS", "content_length", "NUMERIC",
		"$.timestamp", "AS", "timestamp", "NUMERIC", "SORTABLE",

		// Advanced header management
		"$.headers", "AS", "headers_raw", "TEXT", "NOSTEM",
		"$.cookies", "AS", "cookies_raw", "TEXT", "NOSTEM",
		"$.cookies_string", "AS", "all_cookies", "TEXT", "NOSTEM",

		// Per campi specifici di headers che ti interessano
		"$.headers['User-Agent']", "AS", "header_user_agent", "TEXT",
		"$.headers['Content-Type']", "AS", "header_content_type", "TAG",

		// Form data
		"$.form_string", "AS", "form_data", "TEXT", "NOSTEM",
		"$.postform_string", "AS", "postform_data", "TEXT", "NOSTEM",

		// Report fields
		"$.report.uri", "AS", "report_uri", "TEXT",
		"$.report.referrer", "AS", "report_referrer", "TEXT",
		"$.report.user_agent", "AS", "report_user_agent", "TEXT",
		"$.report.lang", "AS", "report_lang", "TAG",
		"$.report.gpu", "AS", "report_gpu", "TAG",

		"$.report.localstorage_string", "AS", "localstorage", "TEXT", "NOSTEM",
		"$.report.sessionstorage_string", "AS", "sessionstorage", "TEXT", "NOSTEM",

		"$.body", "AS", "body_text", "TEXT", "NOINDEX",
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

func RedisHealthChecker(stop chan bool, status chan bool) {
	var lastStatus bool

	for {
		select {
		case <-stop:
			logger.Info("Stopping Redis health checker...")
			return
		default:
			ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
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
