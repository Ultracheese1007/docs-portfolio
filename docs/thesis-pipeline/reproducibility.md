---
id: reproducibility
title: "Thesis Pipeline: Reproducibility"
sidebar_label: Reproducibility
---

# Reproducibility

This documents the reproducibility design of my MSc thesis pipeline — a financial-NLP study that asks
whether macro variables and FinBERT-based institutional news sentiment can predict NASDAQ-100 daily
log returns. The goal of *this* page is not the finance result; it is to show how the work was
documented so a third party can re-run it and reach the same numbers.

> **Repository:** [Ultracheese1007/thesis_project](https://github.com/Ultracheese1007/thesis_project)

## The reproducibility contract

> Given the frozen processed dataset and a fixed random seed (42), every reported metric can be
> regenerated without re-running the expensive upstream steps (news collection and FinBERT inference).

This is the single promise the documentation has to keep. Everything below exists to make it true.

## Three environments, documented separately

The pipeline runs in three different places, so each environment is exported on its own rather than
pretended to be one:

| Environment | Purpose | Documented by |
| --- | --- | --- |
| Modelling (`thesis_daily_env`) | OLS / Random Forest / XGBoost / SHAP, figures | root `requirements.txt` |
| GDELT extraction | Collect 2024 news supplement, extract article text | `requirements_gdelt_env.txt` + summary |
| FinBERT inference (GPU) | Score articles, aggregate daily sentiment | `requirements_finbert_env.txt`, GPU metadata, run script |

Recording exact package versions, Python versions, and GPU metadata per environment is what lets a
reader tell *"I reproduced it"* apart from *"I ran something similar"*.

## Frozen artefacts

The modelling stage consumes **frozen processed files**, not live downloads:

- `final_daily_dataset.csv` — the single source table (1,257 trading-day rows).
- `train_daily.csv` / `test_daily.csv` — the chronological split (1,005 / 252 rows).
- `feature_manifest.json`, `split_manifest.json` — the authoritative feature and split definitions.

Because these are frozen and bundled, a reader can regenerate every model result **without** GDELT
extraction or GPU FinBERT inference.

## Script execution order

The pipeline is a fixed, documented sequence — acquire → freeze dataset → run experiments → tune →
interpret → build figures. Each step records its inputs and outputs, so a reader knows exactly what
produces what. See [Data flow](./data-flow) for the stage-by-stage map, and
[Leakage prevention](./leakage-prevention) for the rules that protect the train/test boundary.
