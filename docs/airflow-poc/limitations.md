---
id: limitations
title: "Airflow PoC: Limitations & Open Questions"
sidebar_label: Limitations
---

# Limitations & open questions

A PoC earns trust by being explicit about what is still in progress and what it deliberately does not
do. These were documented as the hand-off boundary and as the questions taken into mentor design
reviews.

## Still in progress (Phase 4)

Phase 4 (Aggregation & Validation) is underway, not complete:

- **Aggregation SQL and DAG wiring.** The aggregation schemas and a partitioned-upsert pattern exist,
  but the real aggregation SQL and its wiring into the master DAG are still pending.
- **Validation report.** The dashboard-level validation evidence — confirming the governed tables
  reproduce the numbers currently computed inside dashboard SQL — is not yet finished.

## Deliberately out of scope

- **Production scheduling & alerting.** The DAG runs on demand; it has no production schedule,
  retry/alerting policy, or on-call runbook.
- **Backfill strategy.** Re-deriving long historical ranges is untested at scale.
- **Real-time / streaming.** The pipeline is batch; near-real-time freshness is not addressed.
- **Access control & lineage tooling.** Table-level governance and automated lineage are not part of
  the PoC.

## Known limitations within scope

- **Single-domain depth.** The PoC models one domain (production orders) end to end; breadth across
  all domains is argued by analogy, not yet proven.
- **Tolerance thresholds are provisional.** Freshness and reconciliation tolerances were set
  pragmatically and need owner sign-off before production use.

## Mentor-review questions

These are the open questions taken to design review, phrased so a reviewer can give a decision:

1. Should canonical business logic live in SQL transforms, or move to a transformation framework
   (e.g. dbt) before production?
2. What is the right freshness SLA per domain, and who owns the alert when it is breached?
3. Should publishing remain staging-swap, or move to a versioned/partitioned scheme to support
   backfills?
4. Which team owns the canonical tables once they leave PoC status?

> **Documentation principle.** Limitations are not an apology — they are the part of the document a
> reviewer needs most. A clear "in progress" and "out of scope" split is what lets the next engineer
> pick the work up without re-discovering the boundaries.
