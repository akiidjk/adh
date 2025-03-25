FROM oven/bun:1.2 AS builder
WORKDIR /app

COPY package.json bun.lock ./

RUN bun install --production

COPY . .

RUN bun run build

FROM oven/bun:1.2 AS runner

WORKDIR /app

COPY --from=builder /app/package.json /app/bun.lock ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./

RUN bun add next

RUN echo "net.core.somaxconn=65535" >> /etc/sysctl.conf && \
    echo "vm.overcommit_memory=1" >> /etc/sysctl.conf

EXPOSE 3000

CMD ["bun", "run", "start"]
