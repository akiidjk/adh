BIN_DIR := ./bin
CMD_DIR := ./cmd
LOGS_DIR := ./logs

RESET := \033[0m
BOLD := \033[1m
GREEN := \033[32m
YELLOW := \033[33m
RED := \033[31m
CYAN := \033[36m

build:
	@echo -e "$(CYAN)[*] Building $(BOLD)...$(RESET)"
	@mkdir -p $(BIN_DIR)
	@go build -o $(BIN_DIR)/ ./cmd/adh-webhook.go
	@echo -e "$(GREEN)[+] Build complete!$(RESET)"

test:
	@go test ./...

install: build
	@echo -e "$(CYAN)[*] Installing $(BOLD)...$(RESET)"
	@go install .
	@echo -e "$(GREEN)[+] Install complete!$(RESET)"

run: build
	@echo -e "$(CYAN)[*] Running $(BOLD)...$(RESET)"
	@$(BIN_DIR)/adh-webhook

version:
	@echo -e "$(GREEN)[+] Version adh v1.0$(RESET)"

clean:
	@echo -e "$(YELLOW)[*] Cleaning binaries...$(RESET)"
	@rm -rf $(BIN_DIR)/*
	@echo -e "$(GREEN)[+] Clean complete!$(RESET)"
	@echo -e "$(YELLOW)[*] Cleaning logs...$(RESET)"
	@rm -rf $(LOGS_DIR)/*
	@echo -e "$(GREEN)[+] Clean complete!$(RESET)"
