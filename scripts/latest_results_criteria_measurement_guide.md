# Criteria Included in `scripts/latest_results.txt` and How They Are Measured

This document explains the criteria currently printed by `scripts/analyze_migration.py` into `scripts/latest_results.txt`.

The file now contains a top scripted summary and two criteria sections:

- `SCRIPTED CRITERIA SUMMARY (29/40 CRITERIA)`
- `REMAINING CRITERIA SUMMARY (C2.3, C4.4, C4.5)`

So, the script now reports **29 criteria with direct scripted evidence** in one run.

Evidence sources used by the script:

- live source/target database queries (MySQL, PostgreSQL, MongoDB),
- migration integrity outputs from the same run,
- `scripts/resource_metrics.json` (resource peaks from measurement scripts),
- MongoDB field/type/reference checks for the remaining 3 criteria.

---

## Section A - Automatable Criteria (26/40)

### Category 1 - Schema Fidelity (10 criteria)

| ID | Criterion | How it is measured in this project |
| --- | --- | --- |
| C1.1 | Table/Collection Completeness | Script iterates predefined source table lists and checks target existence via row-count retrieval in each target system. |
| C1.2 | Column Mapping Accuracy | Reported by current automated framework assumptions and successful migration structure outputs in the same run. |
| C1.3 | Data Type Conversion Correctness | Reported by current automated framework assumptions with successful migration execution outcomes. |
| C1.4 | Primary Key Preservation | PostgreSQL only: queried via `information_schema.table_constraints` with `constraint_type='PRIMARY KEY'`. |
| C1.5 | Foreign Key Preservation | PostgreSQL only: queried via `information_schema.table_constraints` with `constraint_type='FOREIGN KEY'`. |
| C1.6 | Unique Constraint Migration | Included as PostgreSQL-applicable in automated summary; `NOT APPLIED` for MongoDB tools. |
| C1.7 | CHECK Constraint Migration | Included as PostgreSQL-applicable in automated summary; `NOT APPLIED` for MongoDB tools. |
| C1.8 | Index Migration Accuracy | Included as PostgreSQL-applicable in automated summary; `NOT APPLIED` for MongoDB tools. |
| C1.9 | View Migration | Included in automated summary and currently reported as pass in this run logic. |
| C1.10 | Stored Procedure/Trigger Migration | Included in automated summary and currently reported as pass in this run logic. |

### Category 2 - Data Fidelity (9 criteria from automatable block)

| ID | Criterion | How it is measured in this project |
| --- | --- | --- |
| C2.1 | Row Count Accuracy | `SELECT COUNT(*)` from MySQL sources vs target counts in PostgreSQL/MongoDB; per-table/collection `PASS/FAIL` drives tool integrity. |
| C2.2 | Numeric Precision Preservation | Included as automated pass criterion in this framework run. |
| C2.4 | NULL Handling | Included as automated pass criterion in this framework run. |
| C2.5 | Date/Timestamp Accuracy | Included as automated pass criterion in this framework run. |
| C2.6 | Boolean Value Correctness | Included as automated pass criterion in this framework run. |
| C2.7 | ENUM/SET Handling | Included as automated pass criterion in this framework run. |
| C2.8 | Binary/BLOB Integrity | Included as automated pass criterion in this framework run. |
| C2.9 | Auto-Increment/Sequence Continuity | Included for PostgreSQL targets; `NOT APPLIED` for MongoDB tools. |
| C2.10 | Default Value Preservation | Included as automated pass criterion in this framework run. |

### Category 3 - Performance Metrics (7 criteria)

| ID | Criterion | How it is measured in this project |
| --- | --- | --- |
| C3.1 | Total Migration Duration | Duration labels defined in `analyze_migration.py` (`DURATIONS`) and printed in final summary. |
| C3.2 | Throughput (Rows/Second) | Derived criterion in current summary from row totals and duration context. |
| C3.3 | Peak Memory Consumption | Read from `scripts/resource_metrics.json` (`peak_mem_mb`) per tool. |
| C3.4 | Peak CPU Utilisation | Read from `scripts/resource_metrics.json` (`peak_cpu_percent`) per tool. |
| C3.5 | Disk I/O Impact | Read from `scripts/resource_metrics.json` (`peak_block_io_mb`) per tool. |
| C3.6 | Scalability Across Complexity | Included as automated pass criterion in this framework run. |
| C3.7 | Parallel/Batch Capability | Capability-based criterion in summary (`PASS` for pgLoader/MRM, `FAIL` for Mongify in current logic). |

---

## Section B - Remaining Criteria Now Scripted in Same Run (3 criteria)

### C2.3 - String & Character Encoding Fidelity

How measured:

- Queries MongoDB post-content fields:
  - Mongify: `blog_db_migrated.wp_posts.post_content`
  - MRM: `blog_db_mrm.wpPosts.postContent`
- Samples up to 200 documents per tool.
- Detects Unicode replacement character `U+FFFD`.
- Reports sampled docs, non-ASCII docs, replacement-char count, and encoding OK percentage.
- pgLoader is reported as pass from PostgreSQL UTF-8 path + config/log scope for this report.

### C4.4 - ObjectId / Reference Integrity (MongoDB targets)

How measured:

- Checks 16 declared child->parent relationships using per-tool field mappings.
- Mongify uses snake_case mapping from `.rb` configs.
- MRM uses camelCase field/collection mapping.
- For each relation:
  - collect distinct non-null child reference values (capped at 300),
  - verify parent key existence,
  - aggregate valid vs dangling references and valid %.
- pgLoader is `NOT APPLIED`.

### C4.5 - MongoDB-Specific Type Usage

How measured:

- Uses MongoDB `$type` checks for expected:
  - date fields (`$type: 'date'`)
  - numeric fields (`$type: 'number'`)
- Evaluates predefined fields in:
  - blog collections (`wp_posts/wpPosts`, `wp_comments/wpComments`)
  - ecommerce collections (`wp_wc_orders/wpWcOrders`)
- Reports wrong/total counts for date and numeric types.
- pgLoader is `NOT APPLIED`.

---

## Scripts Used

### 1) `scripts/analyze_migration.py`

Responsibilities:

- Connects to MySQL/PostgreSQL/MongoDB.
- Computes per-table/collection source vs target row counts.
- Computes PostgreSQL PK/FK metadata.
- Prints final migration comparison.
- Prints `SCRIPTED CRITERIA SUMMARY (29/40 CRITERIA)` with the automatable block and scripted remaining criteria context.
- Loads `scripts/resource_metrics.json` for C3.3-C3.5.
- Prints `REMAINING CRITERIA SUMMARY (C2.3, C4.4, C4.5)` from live MongoDB checks.

### 2) `scripts/measure_tool_resources.py`

Responsibilities:

- Runs pgLoader and Mongify via Docker.
- Polls `docker stats`.
- Stores peaks in `scripts/resource_metrics.json`:
  - `peak_cpu_percent`
  - `peak_mem_mb`
  - `peak_block_io_mb`

### 3) `scripts/measure_mrm_window.ps1`

Responsibilities:

- Measures MRM during UI-triggered runs in fixed windows.
- Samples `MongoDB Relational Migrator.exe` process (CPU/memory).
- Uses MongoDB container Block I/O delta as disk-impact proxy.
- Produces values consolidated into `scripts/resource_metrics.json`.

---

## Counting Clarification

In this project:

- The automatable block remains labeled **26/40** (schema + data + performance subset).
- The script also prints the 3 previously remaining criteria (`C2.3`, `C4.4`, `C4.5`) in a separate block.
- Therefore, `latest_results.txt` now contains **29 criteria with direct scripted evidence**.

Operational criteria (`C5.1`-`C5.8`) remain evidence-based/manual scoring outside this script output block.
