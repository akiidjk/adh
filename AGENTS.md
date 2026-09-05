# Repository guide

## Layout

- `webhook/` is the Go webhook server. The entry point is `webhook/cmd/main.go`; shared code lives under `webhook/pkg/`.
- `dashboard/` is a Next.js application managed with Bun. Application code lives in `dashboard/src/`.
- `compose.yml` runs the complete stack. `compose.dev.yml` runs Redis and RedisInsight by default; its `full` profile also includes the application containers.
- Copy `.env.example` to `.env` before running the stack. Never commit real credentials.

## Development

- `just dev` starts the local Redis services from `compose.dev.yml`.
- Run the webhook locally with `just webhook-run`.
- Install dashboard dependencies with `just dashboard-install`, then run it locally with `just dashboard-dev`.
- `just compose` builds and starts the complete stack in the background.

## Checks

- Run `just fmt`, `just lint`, and `just test` separately, or `just check` for the non-formatting checks.
- For production-sensitive dashboard changes, also run `just dashboard-build`.
- Validate Compose edits with `docker compose config` and `docker compose -f compose.dev.yml config`.

## Conventions

- Keep changes scoped and reuse existing packages, services, hooks, and UI components.
- Preserve the current Go package layout and standard library HTTP patterns.
- Use the `@/*` import alias for dashboard source imports and follow `.prettierrc.json`.
- Keep environment-dependent values in Compose or environment files, not source code.
