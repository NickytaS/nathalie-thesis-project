# Database Migration Tool Evaluator

**Thesis Research Prototype** — A comparative study of three heterogeneous database migration tools evaluated against real-world MySQL databases.

🌐 **Live demo:** [Open `DatabaseMigrationToolEvaluator_v2.html` directly in your browser — no server required.]

---

## Overview

This project evaluates three open-source database migration tools across **68 tables** and **2,108 rows** of real production-style data, using a 35-criteria weighted scoring framework.

| Tool | Migration Path | Overall Score | Result |
|------|---------------|---------------|--------|
| **pgLoader** | MySQL → PostgreSQL | **4.65 / 5.0** | ✅ 3/3 databases PASS |
| **MRM** (MongoDB Relational Migrator) | MySQL → MongoDB | **4.37 / 5.0** | ✅ 3/3 databases PASS |
| **Mongify** | MySQL → MongoDB | **3.35 / 5.0** | ⚠️ 2/3 databases PASS |

---

## Source Databases

| Database | Application | Tables | Rows |
|----------|-------------|--------|------|
| `blog_db` | WordPress | 16 | 1,448 |
| `ecommerce_db` | WooCommerce | 34 | 150 |
| `erp_db` | ERPNext | 18 | 510 |
| **Total** | | **68** | **2,108** |

---

## Key Findings

### pgLoader (MySQL → PostgreSQL) — Score: 4.65/5.0
- 100% row-count accuracy on all 3 databases
- Fastest tool: under 1 second per database
- Preserves primary keys and full relational structure
- ⚠️ Lowercases all table names in PostgreSQL (e.g. `tabUser` → `tabuser`)

### MRM — MongoDB Relational Migrator (MySQL → MongoDB) — Score: 4.37/5.0
- 100% row-count accuracy on all 3 databases
- GUI-driven, fully auditable mapping workflow
- Completes migrations in 1–6 seconds
- Renames snake_case tables to camelCase collections (`wp_posts` → `wpPosts`)

### Mongify (MySQL → MongoDB) — Score: 3.35/5.0
- Passed on WooCommerce (150 docs) and ERPNext (510 docs)
- ❌ Failed on WordPress: produced 2,821 docs instead of 1,448 — **idempotency bug** (appends on re-run)
- Slowest tool: 15–30 seconds per database
- Best MongoDB document transformation score (4.8/5.0)

---

## Evaluation Framework

Scores are weighted across 5 categories:

| Category | Weight | pgLoader | MRM | Mongify |
|----------|--------|----------|-----|---------|
| Schema Fidelity | 30% | 4.8 | 4.2 | 2.6 |
| Data Fidelity | 30% | 4.9 | 4.9 | 3.8 |
| MongoDB Transformation | 10% | 3.0 | 4.0 | 4.8 |
| Performance | 20% | 5.0 | 4.0 | 2.2 |
| Operational | 10% | 4.4 | 4.4 | 3.0 |
| **Final Score** | **100%** | **4.65** | **4.37** | **3.35** |

---

## Project Structure

```
├── DatabaseMigrationToolEvaluator_v2.html  # Interactive website (open in browser)
├── scripts/
│   └── analyze_migration.py               # Live analysis script (requires Docker)
├── config/
│   ├── pgloader/                          # pgLoader .conf files
│   └── mongify/                           # Mongify .rb migration files
├── docker-compose.yml                     # MySQL + PostgreSQL + MongoDB containers
├── docker/mysql/                          # MySQL init SQL (WordPress/WooCommerce/ERPNext)
├── docs/
│   └── ERD.md                             # Mermaid ERDs for all 3 databases
├── platform/                              # Next.js MigrateOptima dashboard (prototype)
├── thesis_data_report.md                  # Full migration analysis results
└── analysis_results.txt                   # Historical synthetic data run (Feb 2026)
```

---

## How to Use the Website

No installation needed. Just open `DatabaseMigrationToolEvaluator_v2.html` in any browser.

Features:
- **Home** — Tool cards with scores and key highlights
- **Start Evaluation** — 6-question wizard that recommends the best tool for your needs
- **Compare** — Side-by-side scoring table with category weights
- **Resources** — Official documentation links for each tool
- **Help** — FAQ section with experimental findings
- **Chat widget** — Ask questions about the tools and get data-backed answers

---

## How to Run the Live Analysis

Requires Docker Desktop running with the thesis containers active.

```bash
# Start all containers
docker-compose up -d

# Run the analysis
python scripts/analyze_migration.py
```

---

## Tech Stack

- **Source DB:** MySQL 8.0 (Docker)
- **Target DBs:** PostgreSQL 15 (Docker), MongoDB 6.0 (Docker)
- **Migration tools:** pgLoader, Mongify (Ruby gem), MongoDB Relational Migrator (GUI)
- **Platform UI:** Next.js 14 + TypeScript + Tailwind CSS
- **Analysis:** Python 3 (`mysql-connector-python`, `psycopg2`, `pymongo`)
- **ERDs:** Mermaid.js

---

## GitHub Pages

To host the evaluator website via GitHub Pages:

1. Go to your repository → **Settings** → **Pages**
2. Set source to **main branch / root folder**
3. Rename `DatabaseMigrationToolEvaluator_v2.html` to `index.html`
4. Your site will be live at `https://<your-username>.github.io/<repo-name>/`
