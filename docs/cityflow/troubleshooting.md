---
id: troubleshooting
title: "CityFlow: Troubleshooting"
sidebar_label: Troubleshooting
---

# Troubleshooting

Symptom, cause, and fix for the issues most likely to hit a new integrator.

### Requests are rejected as unauthenticated
- **Cause:** missing/expired access token *and* no valid refresh cookie; or the token was sent with a
  `Bearer` prefix.
- **Fix:** send the raw access token in the `authorization` header **without** a `Bearer` prefix. If
  the access token expired but you hold a valid refresh cookie, the request still succeeds and a new
  token is returned in the `X-ACCESS-TOKEN` response header. If both are invalid, log in again via
  `POST /user/login`. See [Authentication](./integration-guide#2-authentication).

### Login fails with `INVALID_CODE`
- **Cause:** the verification code is wrong, or expired in Redis.
- **Fix:** request a fresh code with `POST /user/code?phone=...` and log in promptly.

### Seckill succeeds but no order row appears immediately
- **Cause:** the write is asynchronous — the order id is returned at once, and a Kafka consumer
  persists the row shortly after.
- **Fix:** this is expected. The consumer write is idempotent, so the returned `orderId` is stable.
  See [Asynchronous behaviour](./integration-guide#6-asynchronous-behaviour).

### Seckill returns `ALREADY_PURCHASED`
- **Cause:** intended — a per-user check in Redis allows only one claim per voucher per user.
- **Fix:** do not retry; the user has already claimed this voucher.

### Seckill returns `VOUCHER_NOT_FOUND` or `STOCK_INSUFFICIENT`
- **Cause:** the voucher is not pre-loaded into Redis, or it is sold out.
- **Fix:** `VOUCHER_NOT_FOUND` — check the voucher id and that stock was pre-loaded; `STOCK_INSUFFICIENT`
  — the voucher is exhausted, stop retrying.

### `GET /actuator/health` is not `UP`
- **Cause:** a dependency (MySQL / Redis / Kafka) has not finished starting, or a port is taken.
- **Fix:** run `docker compose ps` to see which container is unhealthy; check that ports 3306, 6379,
  9092, and 8080 are free; then `docker compose up -d` again.

### Reporting a bug
- Include the `X-Trace-Id` value from the response header. It correlates your request across the REST
  layer, Redis, Kafka, and the database.
