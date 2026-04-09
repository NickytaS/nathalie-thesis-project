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
      'pgLoader achieved the highest overall score (4.65/5.0) in experiments across WordPress (blog_db), WooCommerce (ecommerce_db), and ERPNext (erp_db). It delivered strong schema fidelity, 100% row-count accuracy on all three databases, and the fastest runtimes. It is the primary recommendation when the target is PostgreSQL and relational structure must be preserved.',
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
      'MongoDB Relational Migrator scored 4.37/5.0 and achieved 100% row-count accuracy across all three databases. Its GUI-driven mapping workflow and pre-migration analysis make it strong when auditability and controlled MongoDB modeling matter more than raw CLI speed.',
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
      'mongify scored 3.35/5.0 overall. It passed WooCommerce and ERPNext migrations but failed on WordPress (blog_db) in testing: duplicate documents (2,821 vs 1,448 expected) due to an idempotency issue when re-running without dropping collections. It still offers strong MongoDB document transformation (4.8/5.0) for teams who can enforce clean target state before runs.',
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

/** Single source for thesis rubric: 35 criteria across five weighted categories (sums to 100%). */
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
      { id: 'S1', label: 'Table coverage', description: 'All source tables represented in the target model.' },
      { id: 'S2', label: 'Column types & nullability', description: 'Types, lengths, and NULL constraints preserved or safely mapped.' },
      { id: 'S3', label: 'Primary keys', description: 'PKs and uniqueness constraints survive migration.' },
      { id: 'S4', label: 'Foreign keys', description: 'Referential relationships and FK actions where applicable.' },
      { id: 'S5', label: 'Indexes', description: 'Supporting indexes and uniqueness indexes recreated or equivalent.' },
      { id: 'S6', label: 'Check & unique constraints', description: 'CHECK, UNIQUE, and domain rules enforced in target.' },
      { id: 'S7', label: 'Views', description: 'Views translated or documented when not supported.' },
      { id: 'S8', label: 'Triggers & routines', description: 'Triggers, procedures, and functions handled or flagged.' },
    ],
  },
  {
    id: 'data',
    name: 'Data Fidelity',
    weight: 0.3,
    summaryNote: 'Row counts, types, NULLs, encodings',
    criteria: [
      { id: 'D1', label: 'Row count parity', description: 'Expected vs migrated row counts per table/entity.' },
      { id: 'D2', label: 'Numeric precision', description: 'INT, DECIMAL, FLOAT fidelity without silent drift.' },
      { id: 'D3', label: 'Character encoding', description: 'UTF-8, collations, and special characters preserved.' },
      { id: 'D4', label: 'NULL semantics', description: 'NULL vs empty string behavior consistent.' },
      { id: 'D5', label: 'Date & time', description: 'Timezone, DST, and TIMESTAMP/DATE mapping correctness.' },
      { id: 'D6', label: 'BLOB & binary', description: 'Binary payloads and large objects integrity.' },
      { id: 'D7', label: 'Sequences & auto-increment', description: 'AUTO_INCREMENT / SERIAL alignment after load.' },
      { id: 'D8', label: 'Referential data', description: 'Child rows align with parents after migration.' },
    ],
  },
  {
    id: 'performance',
    name: 'Performance',
    weight: 0.2,
    summaryNote: 'Duration, throughput, resource use',
    criteria: [
      { id: 'P1', label: 'Duration', description: 'Wall-clock time to complete migration runs.' },
      { id: 'P2', label: 'Throughput', description: 'Rows or documents processed per second.' },
      { id: 'P3', label: 'Memory footprint', description: 'Peak RAM usage during migration.' },
      { id: 'P4', label: 'CPU usage', description: 'Processor utilization and efficiency.' },
      { id: 'P5', label: 'Disk I/O', description: 'Read/write load and temporary space usage.' },
      { id: 'P6', label: 'Parallelism & scalability', description: 'Parallel workers, batching, and tuning headroom.' },
    ],
  },
  {
    id: 'transform',
    name: 'MongoDB transformation',
    weight: 0.1,
    summaryNote: 'Embedding, BSON types, collections',
    criteria: [
      { id: 'T1', label: 'Embedding model', description: 'Embedding vs referencing choices for nested data.' },
      { id: 'T2', label: 'Nested documents', description: 'Hierarchy and subdocument structure quality.' },
      { id: 'T3', label: 'Arrays', description: 'Array fields and ordering semantics.' },
      { id: 'T4', label: 'ObjectId & keys', description: 'Stable identifiers and reference integrity in BSON.' },
      { id: 'T5', label: 'BSON type mapping', description: 'Types, decimals, dates, and extended JSON fidelity.' },
    ],
  },
  {
    id: 'operational',
    name: 'Operational',
    weight: 0.1,
    summaryNote: 'Config, logging, licensing, usability',
    criteria: [
      { id: 'O1', label: 'Configuration complexity', description: 'Effort to author and maintain config files or rules.' },
      { id: 'O2', label: 'Error reporting', description: 'Clarity and actionability of failures.' },
      { id: 'O3', label: 'Logging & observability', description: 'Verbosity and traceability of migration runs.' },
      { id: 'O4', label: 'Resumability & idempotency', description: 'Safe re-runs and clean target state.' },
      { id: 'O5', label: 'Documentation', description: 'Official docs, examples, and community support.' },
      { id: 'O6', label: 'Licensing & deployment', description: 'License fit and deployment constraints.' },
      { id: 'O7', label: 'CLI vs GUI ergonomics', description: 'Operator experience for chosen interface.' },
      { id: 'O8', label: 'Learning curve', description: 'Time to productive first migration.' },
    ],
  },
];

const _rubricCount = RUBRIC_CATEGORIES.reduce((n, c) => n + c.criteria.length, 0);
if (_rubricCount !== 35) {
  throw new Error(`Rubric expected 35 criteria, got ${_rubricCount}`);
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

export interface MigrationScenarioRow {
  database: string;
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
    system: 'WordPress',
    normalForm: { label: '1NF', className: 'nf-blue' },
    tables: 16,
    rows: 1448,
    pgLoader: { status: 'PASS', detail: '1448/1448 · <1s' },
    mrm: { status: 'PASS', detail: '1448/1448 · 6s' },
    mongify: { status: 'FAIL', detail: '2821/1448 · ~15s' },
  },
  {
    database: 'ecommerce_db',
    system: 'WooCommerce',
    normalForm: { label: '2NF/3NF', className: 'nf-green' },
    tables: 34,
    rows: 150,
    pgLoader: { status: 'PASS', detail: '150/150 · <1s' },
    mrm: { status: 'PASS', detail: '150/150 · 1s' },
    mongify: { status: 'PASS', detail: '150/150 · ~20s' },
  },
  {
    database: 'erp_db',
    system: 'ERPNext',
    normalForm: { label: 'BCNF', className: 'nf-purple' },
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
