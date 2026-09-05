set dotenv-load

[group('info')]
default:
    @just --list

[group('compose')]
dev:
    docker compose -f compose.dev.yml up -d

[group('compose')]
compose:
    docker compose up --build -d

[group('compose')]
down:
    docker compose down --remove-orphans

[group('compose')]
logs *services:
    docker compose logs -f {{ services }}

[group('compose')]
ps:
    docker compose ps

[group('quality')]
build: dashboard-build webhook-build

[group('quality')]
check: lint test

[group('quality')]
fmt: dashboard-fmt webhook-fmt

[group('quality')]
lint: dashboard-lint dashboard-type-check webhook-lint

[group('quality')]
test: webhook-test

[group('dashboard')]
[working-directory('dashboard')]
dashboard-dev:
    bun run dev

[group('dashboard')]
[working-directory('dashboard')]
dashboard-install:
    bun install

[group('dashboard')]
[working-directory('dashboard')]
dashboard-build:
    bun run build

[group('dashboard')]
[working-directory('dashboard')]
dashboard-start:
    bun run start

[group('dashboard')]
[working-directory('dashboard')]
dashboard-fmt:
    bun run format:fix

[group('dashboard')]
[working-directory('dashboard')]
dashboard-format-check:
    bun run format

[group('dashboard')]
[working-directory('dashboard')]
dashboard-lint:
    bun run lint

[group('dashboard')]
[working-directory('dashboard')]
dashboard-type-check:
    bun run type-check

[group('webhook')]
[working-directory('webhook')]
webhook-run:
    go run ./cmd/main.go

[group('webhook')]
[working-directory('webhook')]
webhook-build:
    go build ./...

[group('webhook')]
[working-directory('webhook')]
webhook-fmt:
    gofumpt -w -d .

[group('webhook')]
[working-directory('webhook')]
webhook-lint:
    golangci-lint run

[group('webhook')]
[working-directory('webhook')]
webhook-test:
    go test ./...
