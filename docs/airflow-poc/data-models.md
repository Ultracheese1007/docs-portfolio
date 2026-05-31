---
id: data-models
title: "Airflow PoC: Data Models"
sidebar_label: Data models
---

# Data models

The canonical tables are the contract between the pipeline and every consumer. Each model is
documented with a fixed structure: **grain**, **semantics**, **business rules**, **intended use**, and
**out of scope**. This is the part of the work most directly relevant to documenting data systems, so
it is shown in full for one dimension and summarised for the facts.

## Model layers

| Layer | Prefix | Purpose |
| --- | --- | --- |
| Dimension | `dim_` | Stable descriptive entities (who / what), one row per entity. |
| Fact | (summary) | Business events at production-order grain. |
| Daily fact | (daily) | The same facts rolled to a per-day grain for dashboard consumption. |

In the production-order domain the implemented tables are three governed dimensions (provider
classification, order status, reprint reason) feeding a canonical fact (`production_order_summary`)
and its daily counterpart (`production_order_summary_daily`).

## Worked example — a provider classification dimension

This dimension centralises the entity-classification rule the audit found scattered (and drifting)
across dashboard SQL — for example an "External vs Internal vs Partner" classification that different
cards implemented with different hard-coded exclusion lists.

### Grain
> 1 row = 1 current, valid provider.

Each row is a provider with its current canonical classification. A provider appears **exactly once**:
no duplicates, no historical versions.

### Semantics
A single, governed answer to *"how is this provider classified"*, so every downstream fact and
dashboard applies the **same** classification rather than re-deriving it from a local exclusion list.

### Business rules

| # | Rule | Statement |
| --- | --- | --- |
| 1 | Identity | A provider is identified by a stable id that never changes; attribute changes are updates to the same provider, not new rows. |
| 2 | One row per provider | No duplicates; no historical snapshots. |
| 3 | Current state only | The dimension reflects the current classification; historical reclassification is not tracked. |
| 4 | Canonical classification | Classification (e.g. External / Internal / Partner) is defined **once** here, replacing per-dashboard `NOT IN (...)` lists. |
| 5 | Scope | Includes only providers valid for the production-order domain; unrelated or inactive records are excluded. |

### Intended use
The canonical provider dimension for consistent joins from the production-order fact — so revenue
attribution, status reporting, and volume metrics all classify a provider the same way.

### Out of scope
- **Provider lifecycle management** (onboarding / deactivation) — owned by the operational system.
- **Historical tracking** (reclassification history, slowly-changing dimensions).
- **Cross-domain attributes** unrelated to production-order classification.

## Fact models (summary)

Each fact is documented with the same five-part structure.

- **`production_order_summary`** — grain **1 row = 1 production order**. It applies the audited
  business logic once: the revenue-allocation formula, the provider classification (joined from the
  dimension above), status grouping, and a single canonical time anchor — the logic that previously
  lived, inconsistently, inside dashboard SQL.
- **`production_order_summary_daily`** — grain **1 row = 1 (date × key) combination**, a deterministic
  daily roll-up of the summary fact. This is a Phase 3 daily fact, not a Phase 4 aggregation table.

> **Documentation principle.** Every model states its grain first. Most disagreement between two
> "the same" numbers traces back to two tables silently using different grains; making grain explicit
> and singular is the cheapest way to prevent that class of bug.
