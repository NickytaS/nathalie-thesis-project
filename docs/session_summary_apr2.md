# Session Summary — April 2, 2026
**Context file for continuing work in a new chat.**

---

## Project Overview

This is a Master's thesis project comparing three database migration tools:

| Tool | Migration Path | Final Score |
|------|---------------|-------------|
| pgLoader | MySQL → PostgreSQL | 4.65 / 5.0 |
| MRM (MongoDB Relational Migrator) | MySQL → MongoDB | 4.37 / 5.0 |
| Mongify | MySQL → MongoDB | 3.35 / 5.0 |

**Source databases (MySQL, running in Docker):**

| Database | Application | Tables | Rows |
|----------|-------------|--------|------|
| `blog_db` | WordPress | 16 | 1,448 |
| `ecommerce_db` | WooCommerce | 34 | 150 |
| `erp_db` | ERPNext | 18 | 510 |
| **Total** | | **68** | **2,108** |

**Target databases:**
- PostgreSQL: `blog_db_migrated`, `ecommerce_db_migrated`, `erp_db_migrated` (port 5433)
- MongoDB (Mongify): `blog_db_migrated`, `ecommerce_db_migrated`, `erp_db_migrated`
- MongoDB (MRM): `blog_db_mrm`, `ecommerce_db_mrm`, `erp_db_mrm`

All databases run in Docker containers defined in `docker-compose.yml`.

---

## What Was Done This Session

### 1. Fixed and Updated `scripts/analyze_migration.py`

**Problem:** The script had reverted to an old version using synthetic table names (`posts`, `comments`, `products`, `orders`, `departments`, `employees`). These tables no longer exist in the databases.

**Fix:** Completely rewrote the script with the correct real-world table lists:
- `BLOG_TABLES` — 16 WordPress tables (`wp_posts`, `wp_users`, `wp_comments`, etc.)
- `ECOMMERCE_TABLES` — 34 WooCommerce tables (`wp_wc_orders`, `wp_woocommerce_order_items`, etc.)
- `ERP_TABLES` — 18 ERPNext tables (`tabUser`, `tabRole`, `tabCountry`, `tabCurrency`, etc.)

**Key behaviours the script handles:**
- pgLoader lowercases all table names in PostgreSQL (e.g. `tabUser` → `tabuser`) — script queries lowercase
- MRM renames snake_case MySQL tables to camelCase MongoDB collections (e.g. `wp_posts` → `wpPosts`) — `to_mrm_collection()` helper function handles this
- The script covers all three tools: `analyze_pgloader()`, `analyze_mongify()`, `analyze_mrm()`

**How to run:**
```bash
python scripts/analyze_migration.py
```
Requires Docker containers running (MySQL on 3306, PostgreSQL on 5433, MongoDB on 27017).

---

### 2. Updated `thesis_data_report.md`

**Previous state:** Contained only synthetic data from February 25, 2026 (2,000 posts, 5,915 order items, etc.). Was not representative of the real thesis work.

**Updated to:** Full real-world analysis report including:
- Source database overview (WordPress/WooCommerce/ERPNext row counts)
- Per-tool results table with integrity status, duration, row counts
- Key findings for each tool (pgLoader lowercasing, MRM camelCase, Mongify idempotency bug)
- Comparison with previous synthetic data run
- Notable schema transformation observations
- Reference to run `analyze_migration.py` for live results

**Location:** `thesis_data_report.md` (project root)

---

### 3. Real Migration Results (from live run on April 2, 2026)

#### pgLoader — MySQL → PostgreSQL
| Database | Tables | Src Rows | Tgt Rows | Integrity | Duration | FKs |
|----------|--------|----------|----------|-----------|----------|-----|
| blog_db | 16 | 1,448 | 1,448 | **PASS** | < 1 sec | 0 |
| ecommerce_db | 34 | 150 | 150 | **PASS** | < 1 sec | 0 |
| erp_db | 18 | 510 | 510 | **PASS** | < 1 sec | 0 |

Note: 0 FKs because the source MySQL schema uses application-level relationships, not DB-level `FOREIGN KEY` constraints. pgLoader lowercases all table names (tabUser → tabuser).

#### Mongify — MySQL → MongoDB
| Database | Tables | Src Rows | Tgt Rows | Integrity | Duration |
|----------|--------|----------|----------|-----------|----------|
| blog_db | 16 | 1,448 | 2,821 | **FAIL** | ~15 sec |
| ecommerce_db | 34 | 150 | 150 | **PASS** | ~20 sec |
| erp_db | 18 | 510 | 510 | **PASS** | ~15 sec |

**Critical finding:** `blog_db` FAILED — 2,821 documents instead of 1,448 (almost exactly double). Mongify was run twice without dropping the collection first. **Mongify has no idempotency** — it appends on every run.

#### MRM — MySQL → MongoDB
| Database | Tables | Src Rows | Tgt Rows | Integrity | Duration |
|----------|--------|----------|----------|-----------|----------|
| blog_db | 16 | 1,448 | 1,448 | **PASS** | 6 sec |
| ecommerce_db | 34 | 150 | 150 | **PASS** | 1 sec |
| erp_db | 18 | 510 | 510 | **PASS** | 1 sec |

MRM renames collections to camelCase: `wp_posts` → `wpPosts`, `wp_term_taxonomy` → `wpTermTaxonomy`. ERPNext `tabXxx` tables are unchanged (no underscores).

---

### 4. Files Deleted This Session

| File / Folder | Reason |
|---|---|
| `scripts/generate_data.py` | Synthetic data generator for old fake schemas — no longer relevant |
| `docs/mrm/mrm_guide.md` | Step-by-step MRM guide — migrations already done, outdated table names |
| `platform/` (entire folder) | Broken Next.js "MigrateOptima" app — backend never worked, never ran a migration |

---

### 5. `DatabaseMigrationToolEvaluator_v2.html` — Comprehensive Update

This is the main thesis demo website. It is a **single HTML file** — no server needed, just double-click to open in any browser.

**What was updated to match the real thesis:**

| Section | What changed |
|---------|-------------|
| Hero subtitle | Mentions WordPress, WooCommerce, ERPNext, 2,108 rows, 68 tables |
| Features grid | Updated to describe real-world data, 35-criteria framework, integrity analysis |
| Tool cards (Home) | Real row accuracy, real speeds, lowercasing note, camelCase note, idempotency bug |
| Tool cards (Compare) | Same real data in the Compare section |
| JavaScript justifications | Full paragraphs citing real DBs, real row counts, real tool behaviours |
| Compare table | Mongify Data Fidelity corrected from 4.5 → 3.8 (reflects WordPress failure) |
| Chat widget | 12+ responses updated with accurate real numbers and findings |
| FAQ | All 5 answers updated with real thesis findings and correct database names |
| Footer | Now lists databases and tools tested |

**Website sections:**
- **Home** — Tool cards with scores and key highlights
- **Start Evaluation** — 6-question wizard → recommends best tool for user's needs
- **Compare** — Side-by-side scoring table with weights
- **Resources** — Official documentation links for each tool
- **Help** — FAQ accordion
- **Chat widget** (bottom-right) — Answers questions about tools with real data

---

### 6. Created `README.md`

A professional GitHub README at the project root covering:
- Results table comparing all 3 tools
- Source database table with real row counts
- Key findings per tool
- Full scoring framework table (5 categories × 3 tools)
- Project structure tree
- Instructions for running the analysis script
- Tech stack
- GitHub Pages setup instructions

---

## Current Project State

### Files that matter

| File / Folder | Purpose |
|---|---|
| `DatabaseMigrationToolEvaluator_v2.html` | **Main thesis demo website** — open in browser |
| `README.md` | GitHub project description |
| `scripts/analyze_migration.py` | Live migration analysis script |
| `thesis_data_report.md` | Full migration results report (real data) |
| `analysis_results.txt` | Historical synthetic data run (Feb 25, 2026) — keep as archive |
| `docker-compose.yml` | All database containers (MySQL, PostgreSQL, MongoDB) |
| `docker/mysql/` | MySQL init SQL files (WordPress, WooCommerce, ERPNext data) |
| `config/pgloader/` | pgLoader `.conf` files for all 3 databases |
| `config/mongify/` | Mongify `.rb` migration files for all 3 databases |
| `docs/ERD.md` | Mermaid ERDs for all 3 databases (WordPress, WooCommerce, ERPNext) |
| `platform_design.md` | Platform architecture planning document |
| `docs/` | Documentation folder |

### Pending decisions

- `platform_design.md`, `final_platform_architecture.md`, `implementation.md` — planning docs from before the project was built. Can be deleted or kept as thesis writing reference.
- `backend/` folder — was identified in a previous session as containing hardcoded wrong paths and wrong Docker network. Verify if it still exists and delete if so.
- `erpnext/` and `frappe_docker/` — ERPNext-related folders. `frappe_docker/` is the active one; `erpnext/` may be redundant.

---

## Key Technical Facts to Know

### Docker setup
- MySQL: port 3306, user `migration_user`, password `rootpassword`
- PostgreSQL: port **5433** (not 5432 — mapped to avoid conflicts), user `postgres`, password `postgrespassword`
- MongoDB: port 27017, no auth

### pgLoader behaviour
- Lowercases ALL table names in the PostgreSQL target
- `tabUser` → `tabuser`, `wp_Posts` → `wp_posts`
- PostgreSQL target databases are named `*_migrated` with schema named after the source DB

### MRM behaviour
- Converts snake_case MySQL table names to camelCase MongoDB collection names
- `wp_posts` → `wpPosts`
- `wp_term_taxonomy` → `wpTermTaxonomy`
- `wp_wc_orders` → `wpWcOrders`
- ERPNext `tabUser`, `tabRole` etc. → unchanged (no underscores)
- MongoDB target databases named `*_mrm`

### Mongify behaviour
- Collection names = MySQL table names (no renaming)
- MongoDB target databases named `*_migrated` (same as pgLoader targets — different collections)
- **Has no idempotency** — always drop collections before re-running
- blog_db was run twice → 2,821 docs instead of 1,448

### Scoring framework
| Category | Weight | pgLoader | MRM | Mongify |
|----------|--------|----------|-----|---------|
| Schema Fidelity | 30% | 4.8 | 4.2 | 2.6 |
| Data Fidelity | 30% | 4.9 | 4.9 | 3.8 |
| MongoDB Transformation | 10% | 3.0 | 4.0 | 4.8 |
| Performance | 20% | 5.0 | 4.0 | 2.2 |
| Operational | 10% | 4.4 | 4.4 | 3.0 |
| **Final** | **100%** | **4.65** | **4.37** | **3.35** |
