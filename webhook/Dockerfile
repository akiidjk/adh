FROM golang:1.26-alpine AS builder

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o webhook ./cmd/

FROM alpine:3.22

RUN addgroup -S webhook && adduser -S -G webhook webhook && mkdir -p /var/log/webhook && chown webhook:webhook /var/log/webhook

WORKDIR /app

COPY --from=builder --chown=webhook:webhook /app/webhook .

USER webhook

EXPOSE 8000

CMD ["./webhook"]
