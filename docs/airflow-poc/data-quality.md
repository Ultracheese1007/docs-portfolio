---
id: data-quality
title: "Airflow PoC: Data Quality"
sidebar_label: Data quality
---

# Data quality

Data-quality (DQ) gates run **after transform and before publish**. They are *blocking*: if a gate
fails, the DAG stops and the staging tables are never swapped into the names consumers read. A bad
batch therefore cannot reach a dashboard.

## The gates

| Gate | Checks | Protects against |
| --- | --- | --- |
| **Grain / null validation** | The declared grain key is non-null and unique; required fields are non-null. | Duplicate or malformed rows silently breaking joins and counts. |
| **Referential integrity** | Every foreign key in a fact resolves to a row in its dimension. | Orphan facts that disappear or double-count after a join. |
| **Freshness** | The newest source row is within an expected lag window. | Publishing stale data as if it were current. |
| **Reconciliation** | Aggregates reconcile to their source fact within tolerance. | Roll-ups drifting away from the facts they summarise. |
| **Mapping coverage** | Every source category maps to a known canonical value. | New, unmapped categories being dropped or mislabelled. |

## Why blocking, not warning

A warning that something is wrong, emitted *after* consumers can already see the data, is too late:
the dashboard number is already wrong and someone has already acted on it. Making the gates blocking
moves the failure to a place where only the pipeline owner sees it, and where the previous good
version of the table is still serving consumers untouched.

## Failure behaviour

1. A gate fails on the staging tables.
2. The DAG task fails and the run halts before the publish/swap step.
3. The previously published tables remain in place — consumers keep reading the last good version.
4. The failure surfaces to the pipeline owner with the failing gate and offending rows.

## How this is validated

Phase 3 reran the full DAG three times for the same logical date. Each run reproduced identical row
counts (~207k production-order fact rows and ~135k daily fact rows) and passed all gates, demonstrating both that the gates
hold and that reruns are idempotent. See [Architecture](./architecture#idempotency-contract).
