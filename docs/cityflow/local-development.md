---
id: local-development
title: "CityFlow: Local Development"
sidebar_label: Local development
---

# Local development

Run the full CityFlow stack locally with Docker Compose, then point the [Integration
guide](./integration-guide) examples at `http://localhost:8080`.

## Prerequisites

- Docker and Docker Compose
- JDK 17+ and Maven (only if running the app outside Docker)

## Start the stack

The Docker image is built from a pre-packaged jar (`COPY target/*.jar`), so build the jar first, then
start the stack:

```bash
git clone https://github.com/Ultracheese1007/CityFlow.git
cd CityFlow
./mvnw -DskipTests package   # produces target/*.jar consumed by the Dockerfile
docker compose up -d
```

This brings up the dependencies the service needs:

| Service | Role |
| --- | --- |
| MySQL | System of record; schema managed by Flyway migrations |
| Redis | Hot-path cache and seckill reservation/dedup |
| Kafka (KRaft) | Asynchronous event processing (no ZooKeeper) |

## Database migrations

Schema is versioned with **Flyway**. Migrations apply automatically on startup, so a fresh database
converges to the current schema without manual steps. Never edit an applied migration — add a new
versioned migration instead.

## Verify it is up

```bash
curl http://localhost:8080/actuator/health
```

```json
{ "status": "UP" }
```

Once `UP`, follow [Authentication](./integration-guide#2-authentication) to get a token.

## Running the tests

```bash
mvn test
```

The suite includes EmbeddedKafka integration tests that run against an in-process broker with isolated
consumer groups, so the asynchronous path is covered without a real Kafka cluster.
