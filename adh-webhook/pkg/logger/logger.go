package logger

import (
	"fmt"
	"io"
	"log"
	"os"
	"strings"
	"time"
	"unique"

	"github.com/akiidjk/adh-webhook/pkg/utils"
)

// Log levels
const (
	DebugLevel = iota
	InfoLevel
	SuccessLevel
	WarningLevel
	ErrorLevel
	FatalLevel
)

type Logger struct {
	Level       int
	lastLogged  unique.Handle[string]
	debugLogger *log.Logger
	infoLogger  *log.Logger
	succeLogger *log.Logger
	warnLogger  *log.Logger
	errorLogger *log.Logger
}

var logger *Logger
var logFile *os.File

func init() {
	var err error
	os.MkdirAll("/var/log/webhook", os.ModePerm)
	logFile, err = os.OpenFile(fmt.Sprintf("/var/log/webhook/adh-webhook-%d.log", time.Now().Unix()), os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0666)
	if err != nil {
		log.Fatal(err)
	}

	multiWriter := io.MultiWriter(logFile, os.Stdout)

	logger = &Logger{
		Level:       InfoLevel,
		debugLogger: log.New(multiWriter, utils.Gray+"[=] DEBUG: "+utils.White, log.LstdFlags),
		infoLogger:  log.New(multiWriter, utils.Cyan+"[*] INFO: "+utils.White, log.LstdFlags),
		succeLogger: log.New(multiWriter, utils.Green+"[+] SUCCESS: "+utils.White, log.LstdFlags),
		warnLogger:  log.New(multiWriter, utils.Yellow+"[/] WARN: "+utils.White, log.LstdFlags),
		errorLogger: log.New(multiWriter, utils.Red+"[//] ERROR: "+utils.White, log.LstdFlags),
	}
}

func CloseLogFile() {
	if logFile != nil {
		logFile.Close()
	}
}

func ParseLevel(level string) int {
	switch strings.ToLower(level) {
	case "debug":
		return DebugLevel
	case "info":
		return InfoLevel
	case "success":
		return SuccessLevel
	case "warning":
		return WarningLevel
	case "error":
		return ErrorLevel
	case "fatal":
		return FatalLevel
	default:
		return InfoLevel
	}
}

// Set log level
func SetLevel(level int) {
	logger.Level = level
}

// Debug logs a message at debug level
func Debug(format string, args ...interface{}) {
	if logger.Level <= DebugLevel {
		message := fmt.Sprintf(format, args...)
		logger.debugLogger.Println(message)
	}
}

// Info logs a message at info level
func Info(format string, args ...interface{}) {
	if logger.Level <= InfoLevel {
		message := fmt.Sprintf(format, args...)
		logger.infoLogger.Println(message)
	}
}

// Success logs a message at success level
func Success(format string, args ...interface{}) {
	if logger.Level <= SuccessLevel {
		message := fmt.Sprintf(format, args...)
		logger.succeLogger.Println(message)
	}
}

// Warning logs a message at warning level
func Warning(format string, args ...interface{}) {
	if logger.Level <= WarningLevel {
		message := fmt.Sprintf(format, args...)
		logger.warnLogger.Println(message)
	}
}

// Error logs a message at error level
func Error(format string, args ...interface{}) {
	if logger.Level <= ErrorLevel {
		message := fmt.Sprintf(format, args...)
		logger.errorLogger.Println(message)
	}
}

func Fatal(format string, args ...interface{}) {
	if logger.Level <= FatalLevel {
		message := fmt.Sprintf(format, args...)
		logger.errorLogger.Fatal(message)
		os.Exit(1)
	}
}
