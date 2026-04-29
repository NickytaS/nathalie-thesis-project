# Migration Analysis Report — Real-World Data
**Date:** 2026-04-22  
**Analyst:** `scripts/analyze_migration.py`  
**Sources:** WordPress (`blog_db`) · WooCommerce (`ecommerce_db`) · ERPNext (`erp_db`)  
**Tools compared:** pgLoader · Mongify · MRM (MongoDB Relational Migrator)

---

## 1. Source Database Overview

| Database | Application | Tables | Total Rows |
|----------|-------------|--------|-----------|
| `blog_db` | WordPress | 16 | 1,448 |
| `ecommerce_db` | WooCommerce | 34 | 150 |
| `erp_db` | ERPNext | 18 | 510 |
| **Total** | | **68** | **2,108** |

> Normal-form labels used in the thesis: WordPress `blog_db` ~**1NF**; WooCommerce `ecommerce_db` ~**2NF/3NF**; ERPNext `erp_db` ~**3NF** (Doctype tables; relationships largely application-enforced).

> Note: WooCommerce row count is low because the ecommerce_db contains the WooCommerce plugin
> tables only (orders, products, shipping, etc.) without the underlying WordPress core tables.
> ERPNext row count is dominated by reference tables (249 countries, 148 currencies, 82 languages).

---

## 2. Tool-by-Tool Results

### 2.1 pgLoader — MySQL → PostgreSQL

| Database | Tables | Src Rows | Tgt Rows | Integrity | Duration | FKs |
|----------|--------|----------|----------|-----------|----------|-----|
| blog_db | 16 | 1,448 | 1,448 | **PASS** | < 1 sec | 0 |
| ecommerce_db | 34 | 150 | 150 | **PASS** | < 1 sec | 0 |
| erp_db | 18 | 510 | 510 | **PASS** | < 1 sec | 0 |

**Key findings:**
- 100% row-count integrity across all three databases.
- All primary keys preserved; foreign keys reported as 0 because the source MySQL
  schema defines relationships at the application layer rather than as DB-level `FOREIGN KEY` constraints.
- pgLoader **lowercases all table names** during migration (e.g., `tabUser` → `tabuser`,
  `wp_Posts` → `wp_posts`). Applications querying PostgreSQL must use lowercase names.
- Exceptionally fast: all three databases migrated in well under one second each.

---

### 2.2 Mongify — MySQL → MongoDB

| Database | Tables | Src Rows | Tgt Rows | Integrity | Duration |
|----------|--------|----------|----------|-----------|----------|
| blog_db | 16 | 1,448 | 4,269 | **FAIL** | ~15 sec |
| ecommerce_db | 34 | 150 | 300 | **FAIL** | ~20 sec |
| erp_db | 18 | 510 | 1,020 | **FAIL** | ~15 sec |

**Key findings:**
- All three Mongify targets currently show row-count mismatch due to append-on-rerun behavior:
  `blog_db` (4,269/1,448), `ecommerce_db` (300/150), and `erp_db` (1,020/510).
- Mongify has **no idempotency**: re-running without dropping target collections appends data
  rather than replacing it.
- Collection names mirror the MySQL table names exactly (no renaming).
- Documents are flat: foreign-key relationships become embedded reference IDs, with no
  embedded sub-documents or arrays.

**Critical limitation:** Mongify's append-on-re-run behavior is a significant data integrity
risk in production migration scenarios.

---

### 2.3 MRM (MongoDB Relational Migrator) — MySQL → MongoDB

| Database | Tables | Src Rows | Tgt Rows | Integrity | Duration |
|----------|--------|----------|----------|-----------|----------|
| blog_db | 16 | 1,448 | 1,448 | **PASS** | 6 sec |
| ecommerce_db | 34 | 150 | 150 | **PASS** | 1 sec |
| erp_db | 18 | 510 | 510 | **PASS** | 1 sec |

**Key findings:**
- 100% row-count integrity across all three databases.
- MRM automatically renames MySQL `snake_case` table names to `camelCase` MongoDB
  collection names (e.g., `wp_posts` → `wpPosts`, `wp_term_taxonomy` → `wpTermTaxonomy`).
  ERPNext `tabXxx` tables are unchanged since they contain no underscores.
- GUI-driven mapping allows the developer to inspect and approve each collection mapping
  before migration runs — making the process transparent and auditable.
- Fastest of the two MongoDB tools for `ecommerce_db` and `erp_db` (1 sec each).

---

## 3. Comparative Summary

| Tool | Target DB | Databases | Overall Integrity | Avg. Duration | Fidelity |
|------|-----------|-----------|-------------------|---------------|----------|
| pgLoader | PostgreSQL | 3 / 3 PASS | **100%** | < 1 sec | HIGH — relational schema fully preserved |
| Mongify | MongoDB | 0 / 3 PASS | **0%** | ~17 sec | MEDIUM — flat mapping; append risk |
| MRM | MongoDB | 3 / 3 PASS | **100%** | ~3 sec | HIGH — GUI-mapped; camelCase renaming |

---

## 4. Notable Schema Transformation Observations

### pgLoader
- All table names are lowercased in PostgreSQL (a known pgLoader behaviour).
- Schema structure (columns, data types, primary keys) is preserved as-is.
- No FK constraints were carried over because the source schema uses application-level
  relationships rather than database-level `FOREIGN KEY` declarations.

### Mongify
- Produces a strict 1-to-1 column → field mapping.
- No embedding or array nesting; each row becomes an independent flat document.
- Re-running without a prior collection drop results in duplicate documents
  (idempotency failure demonstrated in `blog_db`).

### MRM
- Converts `snake_case` MySQL table names to `camelCase` MongoDB collection names.
- Supports manual relationship mapping in the GUI: the operator can choose between
  embedded documents, arrays, or reference IDs for each FK relationship.
- All three databases migrated successfully with no data loss.

---

## 5. Automatable Criteria Summary (26/40 Criteria)

Legend: **PASS** | **FAIL** | **NOT APPLIED**

Only criteria that are fully script-evaluable are included in this section.

### 5.1 Category 1 - Schema Fidelity (Automatable)

| ID | Criterion | pgLoader | MRM | Mongify |
| --- | --- | --- | --- | --- |
| C1.1 | Table/Collection Completeness | PASS | PASS | PASS |
| C1.2 | Column Mapping Accuracy | PASS | PASS | PASS |
| C1.3 | Data Type Conversion Correctness | PASS | PASS | PASS |
| C1.4 | Primary Key Preservation | PASS | NOT APPLIED | NOT APPLIED |
| C1.5 | Foreign Key Preservation | PASS | NOT APPLIED | NOT APPLIED |
| C1.6 | Unique Constraint Migration | PASS | NOT APPLIED | NOT APPLIED |
| C1.7 | CHECK Constraint Migration | PASS | NOT APPLIED | NOT APPLIED |
| C1.8 | Index Migration Accuracy | PASS | NOT APPLIED | NOT APPLIED |
| C1.9 | View Migration | PASS | PASS | PASS |
| C1.10 | Stored Procedure/Trigger Migration | PASS | PASS | PASS |

### 5.2 Category 2 - Data Fidelity (Automatable)

| ID | Criterion | pgLoader | MRM | Mongify |
| --- | --- | --- | --- | --- |
| C2.1 | Row Count Accuracy | PASS | PASS | FAIL |
| C2.2 | Numeric Precision Preservation | PASS | PASS | PASS |
| C2.4 | NULL Handling | PASS | PASS | PASS |
| C2.5 | Date/Timestamp Accuracy | PASS | PASS | PASS |
| C2.6 | Boolean Value Correctness | PASS | PASS | PASS |
| C2.7 | ENUM/SET Handling | PASS | PASS | PASS |
| C2.8 | Binary/BLOB Integrity | PASS | PASS | PASS |
| C2.9 | Auto-Increment/Sequence Continuity | PASS | NOT APPLIED | NOT APPLIED |
| C2.10 | Default Value Preservation | PASS | PASS | PASS |

### 5.3 Category 3 - Performance Metrics (Automatable)

| ID | Criterion | pgLoader | MRM | Mongify |
| --- | --- | --- | --- | --- |
| C3.1 | Total Migration Duration | PASS | PASS | PASS |
| C3.2 | Throughput (Rows/Second) | PASS | PASS | PASS |
| C3.3 | Peak Memory Consumption | PASS | PASS | PASS |
| C3.4 | Peak CPU Utilisation | PASS | PASS | PASS |
| C3.5 | Disk I/O Impact | PASS | PASS | PASS |
| C3.6 | Scalability Across Complexity | PASS | PASS | PASS |
| C3.7 | Parallel/Batch Capability | PASS | PASS | FAIL |

### 5.4 Evidence Basis

- Outcomes above are derived from the run-level evidence in `scripts/latest_results.txt`.
- PASS/FAIL values come from per-table/per-collection counts, integrity results, PK/FK indicators, and duration summaries.
- C2.1 is **FAIL** for Mongify because `blog_db` target rows exceed source rows (append-on-rerun behavior).
- Resource metrics were collected via `scripts/measure_tool_resources.py` (pgLoader, Mongify) and `scripts/measure_mrm_window.ps1` (MRM UI runs), then consolidated into `scripts/resource_metrics.json`.
- Measured peak values: pgLoader (CPU 81.60%, Memory 203.74 MB, Block I/O 0.00 MB), MRM (CPU 0.39%, Memory 660.30 MB, Block I/O 1.90 MB), Mongify (CPU 93.80%, Memory 63.96 MB, Block I/O 3.44 MB).
- Methodology note: MRM was executed through the desktop/web UI workflow, and its CPU/memory were sampled from the `MongoDB Relational Migrator.exe` host process over fixed run windows; disk impact was approximated using MongoDB container Block I/O delta during the same windows.

---

## 6. Raw Output Reference

Full per-table row counts and per-collection PASS/FAIL status are available by running:

```bash
python scripts/analyze_migration.py
```

This script connects to the live Docker containers (MySQL on port 3306, PostgreSQL on
port 5433, MongoDB on port 27017) and prints the complete per-table breakdown for all
three tools across all three databases.

---

## 7. Extended scripted checks (C2.3, C4.4, C4.5) in `analyze_migration.py`

The latest script version also prints a dedicated section in `scripts/latest_results.txt`:

- `EXTENDED SCRIPTED CHECKS (C2.3, C4.4, C4.5)`

This section is generated in the same run as the migration comparison and includes:

- **C2.3 (String & Character Encoding Fidelity):**
  sampled post-content documents; Unicode replacement-character (`U+FFFD`) detection.
- **C4.4 (Reference Integrity for MongoDB targets):**
  relation checks across 16 declared child→parent mappings with valid/dangling counts.
- **C4.5 (MongoDB-Specific Type Usage):**
  BSON `$type` checks for expected date and numeric fields.

Current measured outcomes from the integrated run:

- `C2.3`: pgLoader **PASS**, MRM **PASS**, Mongify **PASS**
- `C4.4`: pgLoader **NOT APPLIED**, MRM **PASS/PARTIAL** (193/194), Mongify **FAIL** (0/452)
- `C4.5`: pgLoader **NOT APPLIED**, MRM **PASS** (0 mismatches), Mongify **PASS/PARTIAL** (numeric mismatches present)
