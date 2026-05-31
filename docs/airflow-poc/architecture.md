---
id: architecture
title: "Airflow PoC: Architecture"
sidebar_label: Architecture
---

# Architecture

The PoC separates two responsibilities that were previously tangled together: **producing** governed
tables (the pipeline layer) and **consuming** them (the BI layer).

```text
            ┌──────────────────────────────────────────────┐
            │              Airflow pipeline                 │
 raw  ───▶  │  extract ─▶ transform ─▶ validate ─▶ publish  │ ──▶ governed tables ──▶ BI layer
 tables     │            (staging)        (DQ gates)        │      (dim / fact / agg)
            └──────────────────────────────────────────────┘
```

## Layers

1. **Extract.** Read raw operational tables into a staging area. No business logic here — staging is
   a faithful copy that isolates downstream work from source-system timing.
2. **Transform.** Apply the business logic the audit found scattered in dashboards — allocation,
   classification, status grouping, time-window derivation — exactly **once**, in version-controlled
   SQL/Python, producing canonical [data models](./data-models).
3. **Validate.** Run blocking [data-quality gates](./data-quality). If a gate fails, the run stops
   *before* publishing, so a bad batch never reaches consumers.
4. **Publish (staging swap).** Build the new tables under staging names, then atomically swap them
   into the names consumers read. Readers always see either the previous good version or the new good
   version — never a half-built table.

## Why staging-swap publishing

A naive "truncate then insert" leaves consumers reading an empty or partial table during the load.
The staging-swap pattern decouples *build time* from *publish time*:

- Build `fact_x__staging` while consumers keep reading `fact_x`.
- Only after DQ gates pass, rename/swap so `fact_x` points at the new data.
- The swap is the single, near-instant moment of change.

This is what makes reruns **idempotent**: re-running the DAG rebuilds staging and swaps again, with no
duplication and no window of broken reads.

## Dependency management

Airflow's DAG makes dependencies explicit: dimensions build before facts, facts before aggregations,
and DQ gates sit between transform and publish. If a source schema changes, the DAG shows exactly
which downstream tables are affected, replacing the previous situation where changes propagated
silently.

## Idempotency contract

> Running the same DAG for the same logical date any number of times produces the same published
> tables, with the same row counts, and never duplicates rows.

This contract is what Phase 3 validated with three consecutive reruns (see [Overview](./overview)).
