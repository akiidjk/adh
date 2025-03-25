# Adh

This project is nothing innovative or groundbreaking.
I just wanted to create my own webhook to deploy on a VPS, avoiding dependencies on tools like webhook.site, localtunnel, ngrok, or other similar services. It is fully customizable, and you can use it for various purposes like logging, request handling, or data collection.

### Overview

The core of this project is a simple webhook server that listens for incoming HTTP requests, logs the relevant information, and stores request data in Redis. It is built with Go for the backend and uses Redis for storage. The project aims to be lightweight, flexible, and simple to set up, but with room for expansion (such as adding a dashboard).

![img](/images/adh-schema.png)

### Features

- **Data Logging**: Logs requests including headers, cookies, body content, and user agent.
- **Redis Integration**: Store incoming request data in Redis, making it easy to scale or manage.
- **Exploit Script**: Serve a simple exploit script for XSS attacks (stealed from xss.report).
- **High customizability**: Customize the server to fit your needs.

### Installation

To get started with the Adh, follow the steps below:

#### Prerequisites

- A machine exposed to the Internet (this tool is not a tunnelling solution such as ngrok or Localtunnel).
- Docker and Docker Compose installed on your machine.

#### Clone the Repository

```bash
git clone https://github.com/akiidjk/adh.git
cd adh
```

#### Set Up Docker Containers

1. Modify your environment variables in the `.env` file to suit your configuration based on the provided example.

```
PORT=8000
ADDR=0.0.0.0
LOG_LEVEL=info
REDIS_ADDR=redis
REDIS_PORT=6379
```

2. Now you can build and start your containers with:

```bash
docker-compose up -d
```

#### Access the Webhook

Once the containers are running, you can access your webhook on:

```
http://localhost:8000
```

The server will now be accepting requests on the specified port (8000 by default).

### Configuration

The following environment variables are available for customization:

- **REDIS_ADDR**: Address of the Redis server. Defaults to `localhost` or `redis` if using Docker.
- **REDIS_PORT**: Port for the Redis server. Defaults to `6379`.
- **REDIS_PASS**: Redis password (if needed).
- **REDIS_DB**: Redis database index. Defaults to `0`.
- **LOG_LEVEL**: Log level for the application. Options are `debug`, `info`, `warn`, `error`. Defaults to `info`.

### Health Check

The Redis health check is handled by a background goroutine that pings Redis periodically to ensure it's available. The health status is reported through a channel, and you can customize the interval as needed.

### Log Storage

The application saves all logs to a folder on your host machine. The logs are stored in the `./adh-webhook/logs` directory on your host system, ensuring that the logs persist even when the container is restarted or destroyed. This is done via Docker bind mounts, which map the `./adh-webhook/logs` folder on your local machine to `/var/log/webhook` in the container.

### Example Request

You can send a test request to the webhook with tools like `curl`:

```bash
curl -X POST http://localhost:8000 -H "Content-Type: application/json" -d '{"key":"value"}'
```

This will log the request data and store it in Redis.

### To-Do

- ~~**Dashboard**: The current project lacks a UI dashboard to visualize requests and data. This will be added in the future (In progess).~~
- ~~**Authentication**: Implement an authentication mechanism to restrict access to the webhook dashboard.~~
- Fix http problem with Docker

### Contributing

Contributions are welcome! Feel free to fork the repository, create issues, and submit pull requests.

### License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

### Conclusion

The Adh Webhook is a flexible and lightweight solution for managing incoming webhooks with custom logging and Redis storage. It's easily deployable with Docker and offers the flexibility to customize headers, storage, and more.
