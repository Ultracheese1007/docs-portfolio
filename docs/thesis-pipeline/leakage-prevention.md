---
id: leakage-prevention
title: "Thesis Pipeline: Leakage Prevention"
sidebar_label: Leakage prevention
---

# Leakage prevention

In a weak-signal prediction task, even a small amount of look-ahead leakage can make a useless
predictor look useful. The pipeline treats **learn–predict separation** as a baseline requirement and
documents each rule so a reviewer can audit it.

## The rules

| Rule | What it enforces |
| --- | --- |
| **One-day lag** | Every predictor is lagged one trading day, so the forecast for day *t* uses only information available by the end of day *t − 1*. |
| **Chronological split** | Training is 2020–2023; the 2024 hold-out is never used for selection or tuning. No random shuffling that could interleave regimes across the split. |
| **Expanding-window CV** | Cross-validation preserves time order; validation blocks always sit *after* their training block. |
| **Train-only preprocessing** | Standardisation is fitted only on a fold's training block (or the full training set) and then applied unchanged to validation/test — never fitted on data it will later score. |
| **Frozen dataset** | A single frozen table is the source for all experiments, so the split and lags cannot drift between runs. |

## How it is documented for audit

Each rule is recorded next to the artefact that proves it: alignment and missingness checks, a leakage
checklist, and a split manifest. The intent is that a reviewer does not have to take the claim on
trust — they can open the manifest and confirm the boundary held.

## Why this is in a documentation portfolio

Leakage prevention is mostly a *documentation* problem: the code that prevents it is small, but the
value comes from making the guarantees explicit and auditable. Writing the rules down — and writing
down *where the evidence for each rule lives* — is the difference between "trust me" and a result
someone else can verify.
