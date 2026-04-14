# Migration Analysis Report — Real-World Data
**Date:** 2026-04-02  
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
| blog_db | 16 | 1,448 | 2,821 | **FAIL** | ~15 sec |
| ecommerce_db | 34 | 150 | 150 | **PASS** | ~20 sec |
| erp_db | 18 | 510 | 510 | **PASS** | ~15 sec |

**Key findings:**
- `ecommerce_db` and `erp_db` passed with 100% row integrity.
- `blog_db` **FAILED**: the target MongoDB database contains 2,821 documents instead of
  1,448 — almost exactly **double** the source. This occurred because Mongify was run twice
  for `blog_db` without first dropping the target collections. Mongify has **no idempotency**:
  it appends on every run rather than replacing existing data.
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
| Mongify | MongoDB | 2 / 3 PASS | **67%** | ~17 sec | MEDIUM — flat mapping; append risk |
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

## 5. Comparison with Previous Synthetic Data Run (February 2026)

The earlier thesis analysis (`analysis_results.txt`, run 2026-02-25) was conducted on a
synthetic dataset of three simple schemas (`posts/comments`, `products/orders/order_items`,
`departments/employees/projects`) totalling approximately **17,510 rows**.

The current analysis uses **real production schemas**:

| Dimension | Synthetic (Feb 2026) | Real-World (Apr 2026) |
|-----------|----------------------|----------------------|
| Source rows | ~17,510 | 2,108 |
| Tables per DB | 2–3 simple tables | 16–34 complex tables |
| Schema complexity | Minimal, hand-crafted | Full WordPress / WooCommerce / ERPNext |
| FK constraints | Explicit in schema | Application-level only |
| Tools covered | pgLoader + Mongify | pgLoader + Mongify + MRM |

The real-world schemas are significantly more complex (up to 34 tables in WooCommerce vs.
3 in the synthetic dataset), making the current analysis a more representative benchmark
for the thesis comparison of migration tool capabilities.

---

## 6. Raw Output Reference

Full per-table row counts and per-collection PASS/FAIL status are available by running:

```bash
python scripts/analyze_migration.py
```

This script connects to the live Docker containers (MySQL on port 3306, PostgreSQL on
port 5433, MongoDB on port 27017) and prints the complete per-table breakdown for all
three tools across all three databases.
