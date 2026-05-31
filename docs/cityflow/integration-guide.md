---
id: integration-guide
title: "CityFlow API: Integration Guide"
sidebar_label: Integration guide
---

# CityFlow API — Integration Guide

This guide takes you from zero to a working integration against the CityFlow backend: authenticate,
make your first request, then handle the patterns a real client needs — errors, asynchronous
processing, idempotency, and observability.

:::note Prototype scope
This documents the current CityFlow prototype. The examples and the [OpenAPI specification](./api-overview)
are versioned alongside the documentation, so implementation changes are reviewed together with the
docs that describe them.
:::

CityFlow is a Spring Boot service backed by MySQL, Redis, and Kafka (KRaft mode). Reads are served on
a Redis-first hot path; the voucher-claim write is accepted synchronously and persisted asynchronously
through Kafka. That asynchronous behaviour is the part most integrations get wrong, so it has [its own
section](#6-asynchronous-behaviour).

## 1. Before you begin

| Item | Value (local prototype) |
| --- | --- |
| Base URL | `http://localhost:8080` |
| Content type | `application/json` |
| Auth | JWT access token in the `authorization` header (no `Bearer` prefix) |
| Response envelope | `Result` — see [Response conventions](#4-response-conventions) |
| Health check | `GET /actuator/health` |

To run the backend locally, see [Local development](./local-development).

## 2. Authentication

CityFlow uses a JWT **access token** sent on each request, plus an **HttpOnly refresh cookie** that
lets an expired access token be renewed passively.

### Step 1 — Request a login code

Login is phone + verification code. First request a code, which the server stores in Redis:

```bash
curl -X POST "http://localhost:8080/user/code?phone=13800000000"
```

```json
{ "success": true }
```

### Step 2 — Log in and receive an access token

```bash
curl -X POST http://localhost:8080/user/login \
  -H "Content-Type: application/json" \
  -d '{ "phone": "13800000000", "code": "123456" }'
```

```json
{ "success": true, "data": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." }
```

The access token is returned in `data`. The same response also sets an **HttpOnly refresh cookie**
(not readable by JavaScript), used for passive renewal below.

### Step 3 — Send the access token

Authenticated requests carry the raw access token in the `authorization` header. **There is no
`Bearer` prefix** — send the token value directly:

```bash
curl http://localhost:8080/shop/1 \
  -H "authorization: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Token expiry and passive refresh

- If the access token is still valid, the request proceeds.
- If the access token has **expired** but the request carries a valid refresh cookie, the server
  authenticates the request anyway and returns a freshly minted access token in the
  **`X-ACCESS-TOKEN`** response header. The original request still succeeds; clients may read that
  header to update their stored token, but are not required to.
- Only when **both** the access token and the refresh cookie are missing or invalid does the request
  fail as unauthenticated.

:::caution Security
Never log access tokens or include them in error reports. The refresh token is an HttpOnly cookie by
design and should not be read or stored by client code.
:::

## 3. Your first request

Fetch a single shop. This exercises auth and the Redis-first read path end to end.

```bash
curl -i http://localhost:8080/shop/1 \
  -H "authorization: <access-token>"
```

```http
HTTP/1.1 200
X-Trace-Id: b1f2c3d4
Content-Type: application/json

{ "success": true, "data": { "id": 1, "name": "Example Shop", "typeId": 1, "score": 4 } }
```

**What just happened:** the request hit the REST layer, was served from the Redis cache if present
(otherwise read from MySQL and cached), and came back inside the standard `Result` envelope. The
`X-Trace-Id` **response header** is the identifier to quote when reporting an issue (see
[Observability](#8-observability)).

## 4. Response conventions

Every endpoint returns the same envelope, `Result`. Null fields are omitted from the JSON.

| Field | Type | When present |
| --- | --- | --- |
| `success` | boolean | Always — the fastest field for a client to branch on |
| `data` | any | On success, when there is a payload |
| `total` | number | On paginated list responses |
| `code` | string | On failure — a stable error code (e.g. `VOUCHER_NOT_FOUND`) |
| `errorMsg` | string | On failure — a human-readable description |

```json
// success with payload
{ "success": true, "data": { "id": 1 } }

// success, no payload
{ "success": true }

// failure
{ "success": false, "code": "STOCK_INSUFFICIENT", "errorMsg": "voucher sold out" }
```

## 5. Core endpoints

| Method | Path | Purpose | Auth |
| --- | --- | --- | --- |
| `POST` | `/user/code?phone={phone}` | Send a login verification code | No |
| `POST` | `/user/login` | Log in (phone + code), receive an access token | No |
| `GET` | `/user/info/{id}` | Fetch a user's public info | Yes |
| `GET` | `/shop/{id}` | Fetch a shop (Redis-first) | Yes |
| `GET` | `/shop/of/type?typeId={t}&current={page}` | List shops by type (paginated) | Yes |
| `GET` | `/shop/of/name?name={q}&current={page}` | Search shops by name (paginated) | Yes |
| `POST` | `/voucher-order/seckill/{id}` | Claim a limited voucher (asynchronous) | Yes |
| `GET` | `/actuator/health` | Service health | No |

A machine-readable reference is published as an [OpenAPI specification](./api-overview).

## 6. Asynchronous behaviour

Claiming a limited voucher (`POST /voucher-order/seckill/{id}`) is **accepted synchronously but
persisted asynchronously**. The endpoint confirms the claim was *reserved* and returns an order id
immediately; the database write happens a moment later in a Kafka consumer.

```text
client                 REST API              Redis                Kafka              consumer / DB
  │  POST seckill/{id} ─▶ │                     │                    │                    │
  │                       │ DECR stock ───────▶ │ (atomic stock)     │                    │
  │                       │ SADD user  ───────▶ │ (per-user dedup)   │                    │
  │                       │ emit OrderCreated ───────────────────▶   │ order event        │
  │  { data: orderId } ◀─ │  (returns at once)  │                    │ ───────────────▶   │ INSERT order
  │                                                                                        │ (idempotent)
```

### What the immediate response means

```json
{ "success": true, "data": 1699876543210 }
```

`data` is the generated `orderId`. A success response means the claim **passed the Redis stock and
per-user dedup checks** and an `OrderCreatedEvent` was published to Kafka. The order row is then
written by the consumer; that write is idempotent (it skips an `orderId` already present), so the
returned `orderId` is stable and safe to reference.

:::note Status query
The prototype does not yet expose an order-status query endpoint, so a client treats a successful
seckill response as an accepted reservation rather than a confirmed database row. Adding a status
endpoint is a planned next step.
:::

## 7. Errors

Failures use the `Result` envelope with a stable `code`. The seckill path surfaces these:

| `code` | Meaning | Client action |
| --- | --- | --- |
| `INVALID_PHONE` | Phone number failed validation | Fix input before retrying |
| `INVALID_CODE` | Verification code wrong or expired | Request a new code |
| `VOUCHER_NOT_FOUND` | Voucher not pre-loaded in Redis | Do not retry; check the voucher id |
| `STOCK_INSUFFICIENT` | Sold out | Stop; the voucher is exhausted |
| `ALREADY_PURCHASED` | This user already claimed this voucher | Do not retry; one claim per user |

Because the per-user check runs in Redis **before** any event is emitted, a repeated claim from the
same user returns `ALREADY_PURCHASED` rather than creating a second order.

## 8. Observability

- **Trace id:** every response carries an `X-Trace-Id` header, and the same id is written to the
  server logs via MDC for that REST request, so quoting it lets the service locate the request in the
  logs. Clients may also send an inbound `X-Trace-Id` to set the id themselves. The asynchronous Kafka
  consumer logs its own processing; propagating the trace id into Kafka message headers is not yet
  implemented in the prototype.
- **Health:** `GET /actuator/health` returns service status; use it for readiness checks.

## 9. Troubleshooting

Common setup and integration issues are collected in [Troubleshooting](./troubleshooting).
