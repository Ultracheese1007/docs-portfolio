---
id: data-flow
title: "Thesis Pipeline: Data Flow"
sidebar_label: Data flow
---

# Data flow

The pipeline runs as a fixed sequence of stages. Documenting it as an explicit ordered flow — rather
than a pile of scripts — is what makes it re-runnable by someone other than the author.

```text
1. Acquire        NASDAQ-100 prices (yfinance) · DGS10/VIX (FRED) · news (Hugging Face + GDELT)
        │
2. Score          FinBERT inference on each article → daily sentiment aggregates (GPU)
        │
3. Freeze         merge on the NASDAQ-100 trading calendar → final_daily_dataset.csv
        │            (forward-fill macro, zero-fill no-news days, build 1-day lags, split)
4. Model          historical-mean baseline · OLS · Random Forest · XGBoost
        │
5. Tune           expanding-window CV on the training period only
        │
6. Interpret      SHAP attribution · regime-based error analysis
        │
7. Figures        predicted-vs-actual and diagnostic plots
```

## Stage notes

- **Acquire.** Four public sources, each cited with its access method. Raw news text is **not**
  redistributed; only derived sentiment features are kept.
- **Score.** A frozen `ProsusAI/finbert` checkpoint scores each article; article scores aggregate to
  three daily indicators (mean, dispersion, share of extreme scores).
- **Freeze.** All sources are aligned to the NASDAQ-100 trading calendar; macro values are
  forward-filled, no-news days zero-filled, and every predictor is lagged one trading day. The output
  is the single frozen table all modelling reads.
- **Model → Figures.** Downstream stages consume only the frozen table, so they are cheap and
  deterministic to re-run.

## Why the boundaries matter

The expensive, non-deterministic work (news collection, GPU inference) is isolated **upstream** of the
freeze. Everything a reader is likely to want to reproduce — the metrics and figures — lives
**downstream** of the freeze and depends only on the frozen files plus the fixed seed. The freeze line
is the contract boundary.
