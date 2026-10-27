package redis

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"strconv"
	"strings"
	"time"

	"github.com/akiidjk/adh/pkg/logger"
	"github.com/akiidjk/adh/pkg/utils"
	"github.com/redis/go-redis/v9"
)

var client *redis.Client

const (
	requestIndex  = "idx:adh:requests"
	requestPrefix = "adh:request:"
	pagesKey      = "adh:pages"
	streamKey     = "adh:events"

	schemaVersionKey    = "adh:schema:version"
	requestIndexVersion = 2
)

var (
	streamMaxLen = int64(10_000)
	requestTTL   = 7 * 24 * time.Hour
)

func InitRedis() {
	PORT := utils.GetEnv("REDIS_PORT", "6379")
	ADDR := utils.GetEnv("REDIS_ADDR", "localhost")
	PASS := utils.GetEnv("REDIS_PASSWORD", "")
	DB, _ := strconv.Atoi(utils.GetEnv("REDIS_DB", "0"))

	streamMaxLen = utils.GetEnvInt64("STREAM_MAX_LEN", 10_000)
	requestTTL = time.Duration(utils.GetEnvInt64("REQUEST_TTL_HOURS", 168)) * time.Hour

	logger.Debug("Redis configuration - ADDR: %s, PORT: %s, DB: %d", ADDR, PORT, DB)
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
	if err := migrateLegacyPages(ctx); err != nil {
		logger.Fatal("Failed to migrate page data: %v", err)
	}

	if err := client.Do(ctx, "FT._LIST").Err(); err != nil {
		logger.Fatal("RediSearch module not loaded: %v", err)
	}

	indexCtx, indexCancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer indexCancel()
	if err := migrateRequestIndex(indexCtx); err != nil {
		logger.Fatal("Failed to migrate request index: %v", err)
	}
	logger.Info("Redis client initialized")
}

func migrateRequestIndex(ctx context.Context) error {
	current, err := client.Get(ctx, schemaVersionKey).Int()
	if err != nil && err != redis.Nil {
		return fmt.Errorf("read schema version: %w", err)
	}
	if current >= requestIndexVersion {
		return createRequestIndex(ctx) // ensure the index exists (idempotent)
	}

	if err := client.Do(ctx, "FT.DROPINDEX", requestIndex).Err(); err != nil &&
		!strings.Contains(strings.ToLower(err.Error()), "unknown index") {
		return fmt.Errorf("drop stale index: %w", err)
	}
	if err := createRequestIndex(ctx); err != nil {
		return err
	}
	return client.Set(ctx, schemaVersionKey, requestIndexVersion, 0).Err()
}

func migrateLegacyPages(ctx context.Context) error {
	legacy, err := client.HGetAll(ctx, "page_data").Result()
	if err != nil || len(legacy) == 0 {
		return err
	}
	pipe := client.TxPipeline()
	for endpoint, value := range legacy {
		pipe.HSetNX(ctx, pagesKey, endpoint, value)
	}
	pipe.Del(ctx, "page_data")
	_, err = pipe.Exec(ctx)
	return err
}

func createRequestIndex(ctx context.Context) error {
	_, err := client.Do(ctx,
		"FT.CREATE", requestIndex,
		"ON", "JSON",
		"PREFIX", "1", requestPrefix,
		"SCHEMA",

		"$address", "AS", "address", "TEXT",
		"$port", "AS", "port", "TEXT",
		"$useragent", "AS", "useragent", "TEXT",
		"$method", "AS", "method", "TEXT",
		"$path", "AS", "path", "TEXT",
		"$protocol", "AS", "protocol", "TEXT",

		// Captured XSS beacon report fields, so operators can search by what the payload saw.
		"$.report.uri", "AS", "report_uri", "TEXT",
		"$.report.origin", "AS", "report_origin", "TEXT",
		"$.report.referrer", "AS", "report_referrer", "TEXT",
		"$.report.user_agent", "AS", "report_useragent", "TEXT",

		"$contentlength", "AS", "content_length", "NUMERIC",
		"$timestamp", "AS", "timestamp", "TEXT", "SORTABLE",

		"$body", "AS", "body_text", "TEXT", "NOINDEX",
	).Result()

	if err != nil && !strings.Contains(err.Error(), "Index already exists") {
		return fmt.Errorf("failed to create index: %w", err)
	}
	return nil
}

func newRequestKey() (string, error) {
	random := make([]byte, 16)
	if _, err := rand.Read(random); err != nil {
		return "", fmt.Errorf("generate request ID: %w", err)
	}
	return requestPrefix + hex.EncodeToString(random), nil
}

func AddRequest(value interface{}) (string, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
	defer cancel()
	key, err := newRequestKey()
	if err != nil {
		return "", err
	}

	pipe := client.TxPipeline()
	pipe.JSONSet(ctx, key, "$", value)
	pipe.Expire(ctx, key, requestTTL)
	pipe.XAdd(ctx, &redis.XAddArgs{
		Stream: streamKey,
		MaxLen: streamMaxLen,
		Approx: true,
		Values: map[string]interface{}{"key": key},
	})

	if _, err := pipe.Exec(ctx); err != nil {
		return "", fmt.Errorf("execute redis pipeline: %w", err)
	}
	return key, nil
}

type Response struct {
	Body    string            `json:"body"`
	Status  int               `json:"statusCode"`
	Headers map[string]string `json:"headers"`
}

func GetResponse(endpoint string) (Response, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	result := client.HGet(ctx, pagesKey, endpoint)
	if result.Err() != nil {
		return Response{}, result.Err()
	}

	data, err := result.Result()
	if err != nil {
		return Response{}, err
	}

	var response Response
	err = json.Unmarshal([]byte(data), &response)
	if err != nil {
		return Response{}, err
	}

	return response, nil
}

func Close() error {
	if client == nil {
		return nil
	}
	return client.Close()
}

func Ping(ctx context.Context) error {
	if client == nil {
		return fmt.Errorf("redis client is not initialized")
	}
	return client.Ping(ctx).Err()
}
