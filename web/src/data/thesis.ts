export type ToolId = 'pgloader' | 'mrm' | 'mongify';

export type QuizScores = Record<ToolId, number>;

export interface ToolProfile {
  id: ToolId;
  name: string;
  shortLogo: string;
  path: string;
  /** Overall weighted score from thesis experiments (0–5) */
  score: number;
  schema: number;
  data: number;
  transform: number;
  performance: number;
  operational: number;
  justification: string;
}

export const tools: Record<ToolId, ToolProfile> = {
  pgloader: {
    id: 'pgloader',
    name: 'pgLoader',
    shortLogo: 'pgL',
    path: 'MySQL → PostgreSQL',
    score: 4.65,
    schema: 4.8,
    data: 4.9,
    transform: 3.0,
    performance: 5.0,
    operational: 4.4,
    justification:
      'pgLoader achieved the highest overall score (4.65/5.0) across all tested MySQL workloads. It delivered strong schema fidelity, full row-count parity on every run, and the fastest observed runtimes. It is the primary recommendation when the target is PostgreSQL and relational structure must be preserved.',
  },
  mrm: {
    id: 'mrm',
    name: 'MongoDB Relational Migrator',
    shortLogo: 'MRM',
    path: 'MySQL → MongoDB',
    score: 4.37,
    schema: 4.2,
    data: 4.9,
    transform: 4.0,
    performance: 4.0,
    operational: 4.4,
    justification:
      'MongoDB Relational Migrator scored 4.37/5.0 with full row-count parity on every workload tested. Its GUI-driven mapping workflow and pre-migration analysis make it strong when auditability and controlled MongoDB modeling matter more than raw CLI speed.',
  },
  mongify: {
    id: 'mongify',
    name: 'mongify',
    shortLogo: 'mfy',
    path: 'MySQL → MongoDB',
    score: 3.35,
    schema: 2.6,
    data: 3.8,
    transform: 4.8,
    performance: 2.2,
    operational: 3.0,
    justification:
      'mongify scored 3.35/5.0 overall. It passed two of three workloads but failed the content-heavy export when the job was repeated without clearing MongoDB targets first (duplicate documents; counts no longer matched the source). It still offers strong document transformation (4.8/5.0) for teams who can enforce a clean target before each run.',
  },
};

export interface QuestionOption {
  text: string;
  scores: QuizScores;
}

export interface Question {
  text: string;
  options: QuestionOption[];
}

/** Same six questions as the original prototype; points steer the quiz winner. */
export const questions: Question[] = [
  {
    text: 'What is your target database for migration?',
    options: [
      { text: 'PostgreSQL (relational database)', scores: { pgloader: 3, mrm: 0, mongify: 0 } },
      { text: 'MongoDB (NoSQL document database)', scores: { pgloader: 0, mrm: 2, mongify: 2 } },
    ],
  },
  {
    text: 'How important is preserving foreign key relationships?',
    options: [
      { text: 'Critical — must maintain all referential integrity', scores: { pgloader: 3, mrm: 2, mongify: 0 } },
      { text: 'Important — prefer to keep but can adapt', scores: { pgloader: 2, mrm: 2, mongify: 1 } },
      { text: 'Not important — will redesign data model', scores: { pgloader: 0, mrm: 1, mongify: 2 } },
    ],
  },
  {
    text: 'What is your database schema complexity?',
    options: [
      { text: 'Simple (few tables, basic relationships)', scores: { pgloader: 1, mrm: 1, mongify: 2 } },
      { text: 'Moderate (10–20 tables, multiple relationships)', scores: { pgloader: 2, mrm: 2, mongify: 1 } },
      { text: 'Complex (20+ tables, advanced features)', scores: { pgloader: 3, mrm: 2, mongify: 0 } },
    ],
  },
  {
    text: 'How important is migration speed?',
    options: [
      { text: 'Critical — need fastest possible migration', scores: { pgloader: 3, mrm: 1, mongify: 0 } },
      { text: 'Moderate — speed matters but not critical', scores: { pgloader: 2, mrm: 2, mongify: 1 } },
      { text: 'Not important — can wait for quality results', scores: { pgloader: 1, mrm: 1, mongify: 2 } },
    ],
  },
  {
    text: 'Do you prefer a GUI or command-line interface?',
    options: [
      { text: 'GUI — visual interface preferred', scores: { pgloader: 0, mrm: 3, mongify: 0 } },
      { text: 'CLI — command-line is preferred', scores: { pgloader: 2, mrm: 1, mongify: 2 } },
      { text: 'No preference', scores: { pgloader: 1, mrm: 1, mongify: 1 } },
    ],
  },
  {
    text: "What's your priority for document structure (MongoDB)?",
    options: [
      { text: 'Optimal embedding and denormalization', scores: { pgloader: 0, mrm: 1, mongify: 3 } },
      { text: 'Balanced approach with smart analysis', scores: { pgloader: 0, mrm: 2, mongify: 1 } },
      { text: 'Not applicable — targeting PostgreSQL', scores: { pgloader: 2, mrm: 0, mongify: 0 } },
    ],
  },
];

export function emptyScores(): QuizScores {
  return { pgloader: 0, mrm: 0, mongify: 0 };
}

/** Per-question maximum achievable points per tool (for match %). */
export function maxQuizScores(): QuizScores {
  const max = emptyScores();
  for (const q of questions) {
    max.pgloader += Math.max(...q.options.map((o) => o.scores.pgloader));
    max.mrm += Math.max(...q.options.map((o) => o.scores.mrm));
    max.mongify += Math.max(...q.options.map((o) => o.scores.mongify));
  }
  return max;
}

export function pickWinner(scores: QuizScores): ToolId {
  let winner: ToolId = 'pgloader';
  if (scores.mrm > scores.pgloader && scores.mrm >= scores.mongify) winner = 'mrm';
  if (scores.mongify > scores.pgloader && scores.mongify > scores.mrm) winner = 'mongify';
  return winner;
}

/** Single source for thesis rubric: 40 criteria across five weighted categories (sums to 100%). */
export interface RubricCriterion {
  id: string;
  label: string;
  description: string;
}

export interface RubricCategoryDetail {
  id: 'schema' | 'data' | 'performance' | 'transform' | 'operational';
  name: string;
  weight: number;
  summaryNote: string;
  criteria: RubricCriterion[];
}

export const RUBRIC_CATEGORIES: RubricCategoryDetail[] = [
  {
    id: 'schema',
    name: 'Schema Fidelity',
    weight: 0.3,
    summaryNote: 'Tables, keys, constraints, indexes',
    criteria: [
      {
        id: 'S1',
        label: 'Table / collection completeness',
        description:
          'Every evaluated source table appears in PostgreSQL (pgLoader → blog_db_migrated, ecommerce_db_migrated, erp_db_migrated) or as a MongoDB collection (mongify → *_migrated; MRM → *_mrm with camelCase names). Scope matches scripts/analyze_migration.py (BLOG_TABLES, ECOMMERCE_TABLES, ERP_TABLES).',
      },
      {
        id: 'S2',
        label: 'Column mapping accuracy',
        description:
          'Source columns present in the target by name where applicable; known renames (e.g. MRM camelCase collection names, pgLoader lowercased PostgreSQL identifiers such as tabUser → tabuser) documented and checked against MySQL catalog.',
      },
      {
        id: 'S3',
        label: 'Data type conversion correctness',
        description:
          'MySQL types (INT, VARCHAR, TEXT, DECIMAL, ENUM, DATETIME, BLOB, etc.) mapped to PostgreSQL or BSON without silent truncation for the WordPress, WooCommerce, and ERPNext dumps under test.',
      },
      {
        id: 'S4',
        label: 'Primary key preservation',
        description:
          'Explicit PRIMARY KEY constraints in PostgreSQL where declared in source; WooCommerce-style tables without a single-column PK scored against observed metadata (information_schema) and thesis notes.',
      },
      {
        id: 'S5',
        label: 'Foreign key preservation',
        description:
          'Database-level FK counts on PostgreSQL targets vs source; WordPress, WooCommerce, and ERPNext rely largely on application-level relationships, so interpretation aligns with Chapter 3 limitations.',
      },
      {
        id: 'S6',
        label: 'Unique constraint migration',
        description:
          'UNIQUE constraints on identifier columns (e.g. WordPress wp_users.user_login) present or equivalently enforced after pgLoader migration.',
      },
      {
        id: 'S7',
        label: 'CHECK constraint migration',
        description:
          'CHECK rules and ENUM-implied domain constraints (notably WooCommerce order status) verified on PostgreSQL target where applicable.',
      },
      {
        id: 'S8',
        label: 'Index migration accuracy',
        description:
          'Non-primary indexes (composite, supporting) recreated or equivalent on PostgreSQL for representative tables across blog_db, ecommerce_db, erp_db.',
      },
      {
        id: 'S9',
        label: 'View migration',
        description:
          'Source SQL views absent in the project dumps; criterion covers tool capability and documentation (e.g. MRM SQL/view assistance) rather than empty-schema execution.',
      },
      {
        id: 'S10',
        label: 'Stored procedures & triggers',
        description:
          'ERPNext and sibling apps keep business logic in application code; absence of DB-level procedures/triggers in erp_db noted and tool behaviour on omission vs warning scored.',
      },
    ],
  },
  {
    id: 'data',
    name: 'Data Fidelity',
    weight: 0.3,
    summaryNote: 'Row counts, types, NULLs, encodings',
    criteria: [
      {
        id: 'D1',
        label: 'Row count accuracy',
        description:
          'Per-table source vs target counts for all scenarios; automated via scripts/analyze_migration.py → scripts/latest_results.txt (PASS when counts match).',
      },
      {
        id: 'D2',
        label: 'Numeric precision preservation',
        description:
          'DECIMAL/FLOAT sample checks on WooCommerce monetary fields; known mongify DECIMAL-as-string limitation documented.',
      },
      {
        id: 'D3',
        label: 'String & UTF-8 encoding fidelity',
        description:
          'LONGTEXT, serialised PHP/JSON in WordPress and WooCommerce meta sampled for truncation or encoding loss after migration.',
      },
      {
        id: 'D4',
        label: 'NULL value handling',
        description:
          'Nullable columns (e.g. WordPress wp_posts, ERPNext tabUser) retain NULL vs false empty-string coercion in targets.',
      },
      {
        id: 'D5',
        label: 'Date & timestamp accuracy',
        description:
          'DATE/DATETIME/TIMESTAMP samples; MySQL zero-dates (0000-00-00) vs pgLoader NULL mapping and MongoDB BSON date handling.',
      },
      {
        id: 'D6',
        label: 'Boolean value correctness',
        description:
          'TINYINT(1) boolean-style flags in WordPress/WooCommerce interpreted consistently in PostgreSQL (BOOLEAN) and MongoDB.',
      },
      {
        id: 'D7',
        label: 'ENUM & SET type handling',
        description:
          'ENUM columns (e.g. wp_posts.post_status) preserved semantically: PostgreSQL ENUM or text; MongoDB string fields.',
      },
      {
        id: 'D8',
        label: 'Binary & BLOB integrity',
        description:
          'Large binary or serialised payloads spot-checked for byte-level or functional equivalence after migration.',
      },
      {
        id: 'D9',
        label: 'Auto-increment / sequence continuity',
        description:
          'PostgreSQL sequences aligned after load for AUTO_INCREMENT-style keys on WordPress and related tables.',
      },
      {
        id: 'D10',
        label: 'Default value preservation',
        description:
          'Column DEFAULTs in source schema still declared or behaviourally equivalent on PostgreSQL target.',
      },
    ],
  },
  {
    id: 'performance',
    name: 'Performance',
    weight: 0.2,
    summaryNote: 'Duration, throughput, resource use',
    criteria: [
      {
        id: 'P1',
        label: 'Total migration duration',
        description:
          'Wall-clock time from start to completion per tool × database (blog_db, ecommerce_db, erp_db), Docker-isolated runs as in Chapter 3.',
      },
      {
        id: 'P2',
        label: 'Throughput (rows per second)',
        description:
          'Total migrated rows (2,108 across evaluated tables) divided by elapsed time; normalises across the three complexity tiers.',
      },
      {
        id: 'P3',
        label: 'Peak memory consumption',
        description:
          'Peak RSS or container memory during migration for pgLoader (Common Lisp), mongify (Ruby), and MRM (desktop JVM) contexts.',
      },
      {
        id: 'P4',
        label: 'Peak CPU utilisation',
        description:
          'Peak and average CPU during migration (e.g. Docker stats for containerised tools; host observation for MRM).',
      },
      {
        id: 'P5',
        label: 'Disk I/O impact',
        description:
          'Read/write volume or I/O patterns during migration; pgLoader direct DB-to-DB vs file-based or sequential paths.',
      },
      {
        id: 'P6',
        label: 'Scalability across complexity levels',
        description:
          'Relative duration from blog_db (16 tables, 1NF-oriented) through ecommerce_db (34 tables, 2NF/3NF) to erp_db (18 tables, ERPNext / 3NF-oriented Doctypes).',
      },
      {
        id: 'P7',
        label: 'Parallel / batch processing capability',
        description:
          'Tool support for parallel COPY (pgLoader), managed jobs (MRM), vs sequential Ruby pipeline (mongify) per vendor documentation and observed runs.',
      },
    ],
  },
  {
    id: 'transform',
    name: 'MongoDB transformation',
    weight: 0.1,
    summaryNote: 'Embedding, BSON types, collections',
    criteria: [
      {
        id: 'T1',
        label: 'Embedding vs referencing quality',
        description:
          'Whether one-to-few vs many-to-many patterns follow MongoDB guidance; MRM interactive mapping vs mongify manual translation files for the same three MySQL sources.',
      },
      {
        id: 'T2',
        label: 'Nested document structure',
        description:
          'Correct nesting of embedded documents without lossy flattening when embedding is chosen (e.g. post meta, order lines).',
      },
      {
        id: 'T3',
        label: 'Array field generation',
        description:
          'One-to-many child rows represented as BSON arrays or embedded arrays where the mapping prescribes it.',
      },
      {
        id: 'T4',
        label: 'ObjectId reference integrity',
        description:
          'Referenced ObjectIds resolve to existing parent documents in blog_db_mrm / ecommerce_db_mrm spot checks.',
      },
      {
        id: 'T5',
        label: 'MongoDB-specific type usage',
        description:
          'BSON Date vs string, numeric types, DECIMAL handling (including mongify string storage), and BinData vs base64 where relevant.',
      },
    ],
  },
  {
    id: 'operational',
    name: 'Operational',
    weight: 0.1,
    summaryNote: 'Config, logging, licensing, usability',
    criteria: [
      {
        id: 'O1',
        label: 'Configuration complexity',
        description:
          'Effort for config/pgloader/*.conf, config/mongify/* translation Ruby, vs MRM GUI project for each of the three databases.',
      },
      {
        id: 'O2',
        label: 'Error reporting & diagnostics',
        description:
          'Clarity of errors and warnings (table/column context); includes mongify silent duplicate risk on blog_db re-run without dropping collections.',
      },
      {
        id: 'O3',
        label: 'Logging & audit trail',
        description:
          'Structured logs vs minimal console output; reproducibility for thesis appendices.',
      },
      {
        id: 'O4',
        label: 'Resumability & failure recovery',
        description:
          'Mid-run resume vs restart-from-scratch; idempotency when re-executing against an existing MongoDB database.',
      },
      {
        id: 'O5',
        label: 'Pre-migration validation',
        description:
          'MRM Pre-Migration Analysis vs pgLoader pre-checks vs absence of built-in pre-flight in mongify for WooCommerce/ERPNext complexity.',
      },
      {
        id: 'O6',
        label: 'Documentation quality',
        description:
          'Official pgLoader, MongoDB Relational Migrator, and mongify GitHub/docs currency and disclosure of limitations.',
      },
      {
        id: 'O7',
        label: 'Installation & dependencies',
        description:
          'Docker-based pgLoader and mongify images vs host-installed MRM; Ruby gem and driver friction on mongify.',
      },
      {
        id: 'O8',
        label: 'Licensing & vendor dependency',
        description:
          'PostgreSQL Licence (pgLoader), MIT (mongify), free MongoDB vendor tool (MRM) and ecosystem coupling.',
      },
    ],
  },
];

const _rubricCount = RUBRIC_CATEGORIES.reduce((n, c) => n + c.criteria.length, 0);
if (_rubricCount !== 40) {
  throw new Error(`Rubric expected 40 criteria, got ${_rubricCount}`);
}

export const FRAMEWORK = {
  criteriaCount: _rubricCount,
  categories: RUBRIC_CATEGORIES.map((c) => ({
    name: c.name,
    weight: c.weight,
    note: c.summaryNote,
  })),
} as const;

/** Compare page: category rows keyed to ToolProfile fields. */
export const compareCategoryRows = [
  { label: 'Schema fidelity', weight: '30%', key: 'schema' as const },
  { label: 'Data fidelity', weight: '30%', key: 'data' as const },
  { label: 'MongoDB transformation', weight: '10%', key: 'transform' as const },
  { label: 'Performance', weight: '20%', key: 'performance' as const },
  { label: 'Operational', weight: '10%', key: 'operational' as const },
];

/** Recompute a 0–5 style overall from category scores and integer percents that should sum to 100. */
export function weightedScoreFromPercents(tool: ToolProfile, percents: readonly number[]): number {
  let s = 0;
  for (let i = 0; i < compareCategoryRows.length; i++) {
    const p = percents[i];
    const key = compareCategoryRows[i]!.key;
    if (p === undefined) continue;
    s += tool[key] * (p / 100);
  }
  return Math.round(s * 100) / 100;
}

export interface MigrationScenarioRow {
  /** Internal / repository identifier */
  database: string;
  /** Short label for UI tables (avoids vendor-specific naming in the main matrix). */
  workloadTitle: string;
  system: string;
  normalForm: { label: string; className: 'nf-blue' | 'nf-green' | 'nf-purple' };
  tables: number;
  rows: number;
  pgLoader: { status: 'PASS' | 'FAIL'; detail: string };
  mrm: { status: 'PASS' | 'FAIL'; detail: string };
  mongify: { status: 'PASS' | 'FAIL'; detail: string };
}

export const migrationScenarios: MigrationScenarioRow[] = [
  {
    database: 'blog_db',
    workloadTitle: 'Content-heavy',
    system: 'Publishing & metadata',
    normalForm: { label: '1NF', className: 'nf-blue' },
    tables: 16,
    rows: 1448,
    pgLoader: { status: 'PASS', detail: '1448/1448 · <1s' },
    mrm: { status: 'PASS', detail: '1448/1448 · 6s' },
    mongify: { status: 'FAIL', detail: '2821/1448 · ~15s' },
  },
  {
    database: 'ecommerce_db',
    workloadTitle: 'Commerce-shaped',
    system: 'Orders & catalog',
    normalForm: { label: '2NF/3NF', className: 'nf-green' },
    tables: 34,
    rows: 150,
    pgLoader: { status: 'PASS', detail: '150/150 · <1s' },
    mrm: { status: 'PASS', detail: '150/150 · 1s' },
    mongify: { status: 'PASS', detail: '150/150 · ~20s' },
  },
  {
    database: 'erp_db',
    workloadTitle: 'Operations / ERP-style',
    system: 'Core business data',
    normalForm: { label: '3NF', className: 'nf-purple' },
    tables: 18,
    rows: 510,
    pgLoader: { status: 'PASS', detail: '510/510 · <1s' },
    mrm: { status: 'PASS', detail: '510/510 · 1s' },
    mongify: { status: 'PASS', detail: '510/510 · ~15s' },
  },
];

/** Repository-relative paths (aligned with README). Optional VITE_REPO_BASE_URL for GitHub links. */
export const repoPaths = {
  readme: 'README.md',
  analyzeScript: 'scripts/analyze_migration.py',
  latestResults: 'scripts/latest_results.txt',
  thesisReport: 'scripts/thesis_data_report.md',
  pgloaderConfig: 'config/pgloader/',
  mongifyConfig: 'config/mongify/',
} as const;

export function repoRootUrl(): string {
  const base = import.meta.env.VITE_REPO_BASE_URL as string | undefined;
  return typeof base === 'string' ? base.replace(/\/$/, '') : '';
}

export function repoBlobUrl(relativePath: string): string | null {
  const root = repoRootUrl();
  if (!root) return null;
  const path = relativePath.replace(/^\/+/, '');
  return `${root}/blob/main/${path}`;
}
