---
id: overview
title: "Airflow PoC: Overview"
sidebar_label: Overview
---

# Airflow PoC — Overview

> **Sanitised case study.** This documents a Proof of Concept I built and documented during a
> data-platform internship. Employer-specific names, SQL, identifiers, and business rules have been
> removed; only the general engineering patterns remain.

## What the PoC sets out to prove

A BI audit found a recurring structural problem across several analytics dashboards:

- **Transformation logic lived in the wrong layer.** Revenue-allocation formulas, entity
  classification rules, status definitions, and time-anchor logic were embedded directly in
  dashboard SQL.
- **The same logic was duplicated and drifting.** A single allocation formula appeared in 10+
  dashboard cards; the same classification used different exclusion lists in different places.
- **There was no canonical fact layer.** Every consumer re-derived the same business facts from raw
  operational tables, so no two reports were guaranteed to agree.

A BI semantic layer can centralise *metric definitions*, but a BI tool is not designed to own heavy
transformation, scheduled refresh, dependency management, or data-quality checks. That responsibility
belongs in a pipeline layer.

**The PoC question:** can Apache Airflow own the transformation logic the audit identified as
misplaced, and produce governed, analytics-ready tables that the BI layer simply *consumes*?

The PoC is scoped to one bounded domain — a production-order pipeline — because that entity sits
across the most dashboards and carries the highest concentration of the audited problems.

## Scope

| In scope | Out of scope |
| --- | --- |
| Source → transform → load lifecycle in one master Airflow DAG | Replacing the BI semantic layer |
| Governed dimension and canonical fact tables | Dashboard redesign |
| Blocking data-quality checks between stages | Production scheduling, alerting, backfill |
| Migration-based schema setup | Real-time / streaming ingestion |

## Phase status

| Phase | Goal | Status |
| --- | --- | --- |
| 1 — Environment & Design | Local Airflow stack, source/target connections, migration-based schema setup, master DAG design, DQ framework | Complete |
| 2 — Dimensions | Governed dimension tables (e.g. provider classification, order status, reprint reason) | Complete |
| 3 — Canonical Facts | `production_order_summary` and `production_order_summary_daily` built and validated with DQ checks | Complete |
| 4 — Aggregation & Validation | Aggregation schemas and partitioned-upsert pattern exist; aggregation SQL, DAG wiring, and the validation report are still pending | In progress |

Phases 1–3 prove the core path end to end. The Phase 3 daily fact,
`production_order_summary_daily`, was validated across idempotent reruns producing a stable
~135k daily-fact (date-grain) rows alongside ~207k production-order summary rows, confirming that
reruns neither duplicate nor drift.

## Where to go next

- [Architecture](./architecture) — the master DAG and the source → transform → publish flow.
- [Data models](./data-models) — grain, semantics, and business rules of the canonical tables.
- [Data quality](./data-quality) — the blocking checks and what each one protects against.
- [Limitations](./limitations) — what is still in progress and what is deliberately out of scope.
