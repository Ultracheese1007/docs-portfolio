---
id: intro
title: About this portfolio
sidebar_label: About
slug: /intro
---

# About this portfolio

This is a documentation portfolio. Each section is a worked sample of developer-facing
documentation I have written for a real system, chosen to show three different documentation
problems:

- **[Airflow PoC — Case Study](/airflow-poc/overview)** — documenting a backend/data-platform
  architecture and its data contracts for an engineering audience. Sanitised from a data-platform
  internship.
- **[CityFlow API — Integration Guide](/cityflow/integration-guide)** — an SDK-style onboarding
  guide that takes a developer from zero to a working integration against a Spring Boot + Kafka
  backend, including event-driven behaviour.
- **[Thesis Pipeline — Reproducibility](/thesis-pipeline/reproducibility)** — reproducibility
  documentation for an ML research pipeline, so a third party can re-run the work from a frozen
  environment.

## How I approach documentation

- **Task-oriented.** Each page answers *"how does the reader do X"* or *"what contract can the reader
  rely on"*, not *"what is X"* in the abstract.
- **Docs-as-code.** Everything here is Markdown in a Git repository, built with Docusaurus, reviewed
  the same way code is.
- **Validated against the system.** Architecture and data-model claims are written by reading the
  code and pipeline, then confirmed with the engineers who own them.

## A note on sources and sanitisation

The Airflow section is a **sanitised case study** based on a BI / data-platform internship. It keeps
the general engineering patterns (governed pipeline layer, canonical fact/dimension/aggregation
tables, data-quality gates, staging-swap publishing) and removes all employer-specific material —
internal dashboard names, real SQL, identifiers, and business logic. The CityFlow and thesis sections
document my own projects and are not sanitised.

> **About me.** Backend- and data-platform-oriented documentation engineer. MSc Data Science &
> Society, Tilburg University (graduating 09/2026), based in the Netherlands.
> GitHub: [Ultracheese1007](https://github.com/Ultracheese1007).
