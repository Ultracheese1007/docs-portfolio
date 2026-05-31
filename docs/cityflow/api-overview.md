---
id: api-overview
title: "CityFlow API: Reference (OpenAPI)"
sidebar_label: API reference
---

# API reference (OpenAPI)

The CityFlow API is described by a machine-readable **OpenAPI 3.0** specification. The
[Integration guide](./integration-guide) is the narrative, task-oriented companion to this reference.

## Where the spec lives

- **Spec file:** [`/openapi.yaml`](pathname:///openapi.yaml), versioned with this documentation.
- **From the running service:** because the project includes `springdoc-openapi-ui`, a live spec and
  Swagger UI are served:
  - OpenAPI JSON: `http://localhost:8080/v3/api-docs`
  - Swagger UI: `http://localhost:8080/swagger-ui/index.html`

## Generating the spec from Spring Boot

The project (Spring Boot 2.7) already includes `springdoc-openapi-ui`:

```xml
<dependency>
  <groupId>org.springdoc</groupId>
  <artifactId>springdoc-openapi-ui</artifactId>
  <version>1.7.0</version>
</dependency>
```

So when the service is running, the OpenAPI JSON is generated from the controllers at
`/v3/api-docs` and Swagger UI is served at `/swagger-ui/index.html`. Exporting `/v3/api-docs` keeps a
versioned `openapi.yaml` in the repository.

## Endpoint summary

| Method | Path | Summary |
| --- | --- | --- |
| `POST` | `/user/code` | Send a login verification code (query param `phone`) |
| `POST` | `/user/login` | Authenticate with phone + code; returns an access token |
| `GET` | `/user/info/{id}` | Fetch a user's public info |
| `GET` | `/shop/{id}` | Fetch a shop by id |
| `GET` | `/shop/of/type` | List shops by type, paginated |
| `GET` | `/shop/of/name` | Search shops by name, paginated |
| `POST` | `/voucher-order/seckill/{id}` | Claim a limited voucher (asynchronous) |
| `GET` | `/actuator/health` | Service and dependency health |

All endpoints return the shared `Result` envelope described in
[Response conventions](./integration-guide#4-response-conventions). Authentication uses a JWT access
token in the `authorization` header with no `Bearer` prefix.
