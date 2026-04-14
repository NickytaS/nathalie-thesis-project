# Database Migration Tool Evaluator

**Master's Thesis Research Project** — A comparative study of three heterogeneous database migration tools evaluated against real-world MySQL databases from WordPress, WooCommerce, and ERPNext.

---

## Overview

This project evaluates three open-source database migration tools across **68 tables** and **2,108 rows** of real-world data, using a **40-criteria** weighted scoring framework (see `web/src/data/thesis.ts`).

| Tool | Migration Path | Overall Score | Result |
|------|---------------|---------------|--------|
| **pgLoader** | MySQL → PostgreSQL | **4.65 / 5.0** | 3/3 databases PASS |
| **MRM** (MongoDB Relational Migrator) | MySQL → MongoDB | **4.37 / 5.0** | 3/3 databases PASS |
| **Mongify** | MySQL → MongoDB | **3.35 / 5.0** | 2/3 databases PASS |

---

## Source Databases

| Database | Application | Tables | Rows |
|----------|-------------|--------|------|
| `blog_db` | WordPress | 16 | 1,448 |
| `ecommerce_db` | WooCommerce | 34 | 150 |
| `erp_db` | ERPNext | 18 | 510 |
| **Total** | | **68** | **2,108** |

---

## Migration Results

### pgLoader (MySQL → PostgreSQL) — Score: 4.65 / 5.0
- 100% row-count accuracy across all 3 databases
- Fastest tool: under 1 second per database
- Preserves primary keys and full relational structure
- Lowercases all table names in PostgreSQL (e.g. `tabUser` → `tabuser`)

### MRM — MongoDB Relational Migrator (MySQL → MongoDB) — Score: 4.37 / 5.0
- 100% row-count accuracy across all 3 databases
- GUI-driven, fully auditable mapping workflow
- Completes migrations in 1–6 seconds
- Renames snake_case tables to camelCase collections (`wp_posts` → `wpPosts`)

### Mongify (MySQL → MongoDB) — Score: 3.35 / 5.0
- Passed on WooCommerce (150 docs) and ERPNext (510 docs)
- Failed on WordPress: produced 2,821 docs instead of 1,448 — **idempotency bug** (appends on re-run)
- Slowest tool: 15–30 seconds per database
- Best MongoDB document transformation score (4.8 / 5.0)

---

## Evaluation Framework

Scores weighted across 5 categories:

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
nathalie-thesis project/
├── docker-compose.yml                  # MySQL + PostgreSQL + MongoDB containers
├── docker/
│   ├── mysql/
│   │   ├── init.sql                    # Creates migration user
│   │   ├── blog_db.sql                 # Real WordPress data (16 tables, 1,448 rows)
│   │   ├── ecommerce_db.sql            # Real WooCommerce data (34 tables, 150 rows)
│   │   └── erp_db.sql                  # Real ERPNext data (18 tables, 510 rows)
│   └── postgres/
│       └── init.sql                    # Creates migrated target databases
├── config/
│   ├── pgloader/                       # pgLoader .conf files (blog, ecommerce, erp)
│   └── mongify/                        # Mongify .rb migration files
├── scripts/
│   ├── analyze_migration.py            # Live migration analysis script
│   ├── latest_results.txt              # Most recent analysis output
│   └── thesis_data_report.md           # Full written migration results report
├── docs/
│   └── ERD.md                          # Mermaid ERDs for all 3 databases
└── frappe_docker/                      # ERPNext Docker setup
```

---

## How to Run the Analysis

Requires Docker Desktop running.

```bash
# Start all containers
docker-compose up -d

# Run the live migration analysis
python scripts/analyze_migration.py
```

Results are printed to the terminal and saved to `scripts/latest_results.txt`.

---

## Tech Stack

- **Source DB:** MySQL 8.0 (Docker)
- **Target DBs:** PostgreSQL 15 (Docker), MongoDB 6.0 (Docker)
- **Migration Tools:** pgLoader, Mongify (Ruby gem), MongoDB Relational Migrator (GUI)
- **Analysis:** Python 3 (`mysql-connector-python`, `psycopg2`, `pymongo`)
- **ERDs:** Mermaid.js
