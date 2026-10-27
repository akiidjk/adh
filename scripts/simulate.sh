#!/usr/bin/env bash
# Fire a variety of realistic HTTP requests at the adh webhook to populate the dashboard
# (useful for screenshots / demos). A delay keeps you under the webhook rate limit (5 req/s/IP).
#
# Usage: ./scripts/simulate.sh [BASE_URL] [DELAY_SECONDS] [ROUNDS]
#   ./scripts/simulate.sh                         # http://localhost:8080, 1 round
#   ./scripts/simulate.sh http://localhost:8080 0.3 3
set -u

BASE="${1:-http://localhost:8080}"
DELAY="${2:-0.3}"
ROUNDS="${3:-1}"

if ! curl -fsS -o /dev/null "$BASE/healthz" 2>/dev/null; then
  echo "! Webhook not reachable at $BASE (is the stack running?)." >&2
  echo "  Start it with 'just compose' or 'just webhook-run', or pass the URL as arg 1." >&2
  exit 1
fi

UAS=(
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36"
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15"
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Safari/604.1"
  "curl/8.6.0"
  "python-requests/2.32.0"
  "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)"
  "sqlmap/1.8#stable"
)
ua() { echo "${UAS[$((RANDOM % ${#UAS[@]}))]}"; }

req() { # METHOD PATH [extra curl args...]
  local method="$1" path="$2"; shift 2
  curl -s -o /dev/null -w "  %{http_code}  ${method} ${path}\n" -X "$method" \
    -A "$(ua)" \
    -H "X-Forwarded-For: 203.0.113.$((RANDOM % 250 + 1))" \
    "$BASE$path" "$@"
  sleep "$DELAY"
}

REPORT='{"uri":"https://victim.example/account","cookies":"session=stolen123; csrf=xyz","referrer":"https://victim.example/","user_agent":"Mozilla/5.0 Chrome/125.0","origin":"https://victim.example","lang":"en-US","gpu":"ANGLE (NVIDIA GeForce RTX 3080)","localstorage":{"token":"jwt.abc.def","theme":"dark"},"sessionstorage":{"step":"checkout"},"dom":"<html><body><h1>Account</h1><form>...</form></body></html>","screenshot":""}'

echo "Target: $BASE  (delay ${DELAY}s, ${ROUNDS} round(s))"
for r in $(seq 1 "$ROUNDS"); do
  req GET     "/"
  req GET     "/robots.txt"
  req GET     "/.env"
  req GET     "/admin"                -H "Cookie: session=abc123; theme=dark"
  req GET     "/wp-login.php"
  req GET     "/api/users?limit=20"
  req GET     "/search?q=<script>alert(1)</script>"
  req POST    "/api/login"            -H "Content-Type: application/json" -d '{"username":"admin","password":"hunter2"}'
  req POST    "/contact"             -H "Content-Type: application/x-www-form-urlencoded" -d "name=Jane&email=jane@example.com&message=hello"
  req POST    "/webhooks/stripe"     -H "Content-Type: application/json" -H "Stripe-Signature: t=1,v1=deadbeef" -d '{"id":"evt_1","type":"payment_intent.succeeded","amount":4200}'
  req POST    "/graphql"             -H "Content-Type: application/json" -d '{"query":"{ me { id email } }"}'
  req PUT     "/api/users/42"         -H "Content-Type: application/json" -d '{"role":"admin"}'
  req PATCH   "/api/settings"         -H "Content-Type: application/json" -d '{"notifications":false}'
  req DELETE  "/api/sessions/abc"     -H "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.payload.sig"
  req HEAD    "/"
  req OPTIONS "/api"
  # XSS beacon — populates the "Report" tab in the dashboard.
  req POST    "/_report"             -H "Content-Type: application/json" -H "X-Report: 1" -d "$REPORT"
done

echo "Done. Open the dashboard ($BASE → dashboard on :3000) to see the requests."
