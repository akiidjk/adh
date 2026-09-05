FROM golang:1.26-alpine AS builder

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o webhook ./cmd/

FROM alpine:latest

RUN apk add --no-cache redis

WORKDIR /root/

COPY --from=builder /app/webhook .

EXPOSE 8000

CMD ["./webhook"]
