import fs from 'fs';
import path from 'path';
import Database from 'better-sqlite3';
import pg from 'pg';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const DATABASE_URL = process.env.DATABASE_URL?.trim();

const dataDir = path.join(__dirname, 'data');

let sqliteDb = null;
let pgPool = null;

/** @returns {'postgres' | 'sqlite'} */
export function dbBackend() {
  return DATABASE_URL ? 'postgres' : 'sqlite';
}

export function isUniqueEmailError(e) {
  return Boolean(e && typeof e === 'object' && (e.code === 'SQLITE_CONSTRAINT_UNIQUE' || e.code === '23505'));
}

function ensureUserProfileColumns(database) {
  const cols = database.prepare('PRAGMA table_info(users)').all();
  const names = new Set(cols.map((c) => c.name));
  if (!names.has('display_name')) {
    database.exec('ALTER TABLE users ADD COLUMN display_name TEXT NOT NULL DEFAULT ""');
  }
  if (!names.has('avatar_url')) {
    database.exec('ALTER TABLE users ADD COLUMN avatar_url TEXT NOT NULL DEFAULT ""');
  }
}

function getSqlite() {
  if (!sqliteDb) {
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
    const dbPath = path.join(dataDir, 'app.sqlite');
    sqliteDb = new Database(dbPath);
    sqliteDb.pragma('foreign_keys = ON');
    sqliteDb.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT NOT NULL UNIQUE COLLATE NOCASE,
        password_hash TEXT NOT NULL,
        display_name TEXT NOT NULL DEFAULT '',
        avatar_url TEXT NOT NULL DEFAULT '',
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );
      CREATE TABLE IF NOT EXISTS quiz_results (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        winner TEXT NOT NULL,
        scores_json TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
      CREATE INDEX IF NOT EXISTS idx_quiz_results_user_created ON quiz_results(user_id, created_at DESC);
    `);
    ensureUserProfileColumns(sqliteDb);
  }
  return sqliteDb;
}

function getPool() {
  if (!pgPool && DATABASE_URL) {
    pgPool = new pg.Pool({
      connectionString: DATABASE_URL,
      ssl:
        DATABASE_URL.includes('localhost') || DATABASE_URL.includes('127.0.0.1')
          ? false
          : { rejectUnauthorized: true },
    });
  }
  return pgPool;
}

/** @deprecated Prefer db helpers — kept for scripts/tests that still expect sync SQLite */
export function getDb() {
  if (DATABASE_URL) {
    throw new Error('getDb() is SQLite-only; DATABASE_URL is set — use async db helpers instead.');
  }
  return getSqlite();
}

/** Insert user; throws DB unique violation as SQLITE_CONSTRAINT_UNIQUE or 23505 */
export async function insertUser(email, passwordHash, displayName, avatarUrl) {
  const dn = displayName ?? '';
  const av = avatarUrl ?? '';
  if (DATABASE_URL) {
    const pool = getPool();
    const r = await pool.query(
      `INSERT INTO users (email, password_hash, display_name, avatar_url)
       VALUES ($1, $2, $3, $4)
       RETURNING id`,
      [email, passwordHash, dn, av],
    );
    return { id: Number(r.rows[0].id) };
  }
  const db = getSqlite();
  const info = db
    .prepare('INSERT INTO users (email, password_hash, display_name, avatar_url) VALUES (?, ?, ?, ?)')
    .run(email, passwordHash, dn, av);
  return { id: Number(info.lastInsertRowid) };
}

export async function selectUserByEmail(email) {
  if (DATABASE_URL) {
    const pool = getPool();
    const r = await pool.query(
      'SELECT id, email, password_hash, display_name, avatar_url FROM users WHERE email = $1',
      [email],
    );
    return r.rows[0] ?? null;
  }
  return (
    getSqlite()
      .prepare('SELECT id, email, password_hash, display_name, avatar_url FROM users WHERE email = ?')
      .get(email) ?? null
  );
}

export async function selectUserById(id) {
  if (DATABASE_URL) {
    const pool = getPool();
    const r = await pool.query(
      'SELECT id, email, password_hash, display_name, avatar_url FROM users WHERE id = $1',
      [id],
    );
    return r.rows[0] ?? null;
  }
  return (
    getSqlite()
      .prepare('SELECT id, email, password_hash, display_name, avatar_url FROM users WHERE id = ?')
      .get(id) ?? null
  );
}

export async function updateUserProfile(id, displayName, avatarUrl) {
  if (DATABASE_URL) {
    const pool = getPool();
    await pool.query('UPDATE users SET display_name = $1, avatar_url = $2 WHERE id = $3', [
      displayName,
      avatarUrl,
      id,
    ]);
    return;
  }
  getSqlite().prepare('UPDATE users SET display_name = ?, avatar_url = ? WHERE id = ?').run(displayName, avatarUrl, id);
}

export async function userExists(id) {
  if (DATABASE_URL) {
    const pool = getPool();
    const r = await pool.query('SELECT id FROM users WHERE id = $1', [id]);
    return Boolean(r.rows[0]);
  }
  return Boolean(getSqlite().prepare('SELECT id FROM users WHERE id = ?').get(id));
}

export async function insertQuizResult(userId, winner, scoresJson) {
  if (DATABASE_URL) {
    const pool = getPool();
    const r = await pool.query(
      `INSERT INTO quiz_results (user_id, winner, scores_json) VALUES ($1, $2, $3) RETURNING id`,
      [userId, winner, scoresJson],
    );
    return { id: Number(r.rows[0].id) };
  }
  const db = getSqlite();
  const info = db
    .prepare('INSERT INTO quiz_results (user_id, winner, scores_json) VALUES (?, ?, ?)')
    .run(userId, winner, scoresJson);
  return { id: Number(info.lastInsertRowid) };
}

export async function selectQuizLatest(userId) {
  if (DATABASE_URL) {
    const pool = getPool();
    const r = await pool.query(
      `SELECT id, user_id, winner, scores_json, created_at FROM quiz_results
       WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1`,
      [userId],
    );
    return r.rows[0] ?? null;
  }
  return (
    getSqlite()
      .prepare(
        `SELECT id, user_id, winner, scores_json, created_at FROM quiz_results
         WHERE user_id = ? ORDER BY datetime(created_at) DESC LIMIT 1`,
      )
      .get(userId) ?? null
  );
}

export async function selectQuizAll(userId) {
  if (DATABASE_URL) {
    const pool = getPool();
    const r = await pool.query(
      `SELECT id, user_id, winner, scores_json, created_at FROM quiz_results
       WHERE user_id = $1 ORDER BY created_at DESC LIMIT 200`,
      [userId],
    );
    return r.rows;
  }
  return getSqlite()
    .prepare(
      `SELECT id, user_id, winner, scores_json, created_at FROM quiz_results
       WHERE user_id = ? ORDER BY datetime(created_at) DESC LIMIT 200`,
    )
    .all(userId);
}

export async function selectQuizById(id) {
  if (DATABASE_URL) {
    const pool = getPool();
    const r = await pool.query(
      'SELECT id, user_id, winner, scores_json, created_at FROM quiz_results WHERE id = $1',
      [id],
    );
    return r.rows[0] ?? null;
  }
  return (
    getSqlite()
      .prepare('SELECT id, user_id, winner, scores_json, created_at FROM quiz_results WHERE id = ?')
      .get(id) ?? null
  );
}

/** @returns number of deleted rows */
export async function deleteQuizResult(id, userId) {
  if (DATABASE_URL) {
    const pool = getPool();
    const r = await pool.query('DELETE FROM quiz_results WHERE id = $1 AND user_id = $2', [id, userId]);
    return Number(r.rowCount ?? 0);
  }
  const info = getSqlite().prepare('DELETE FROM quiz_results WHERE id = ? AND user_id = ?').run(id, userId);
  return info.changes;
}

export async function closeDbPools() {
  if (pgPool) {
    await pgPool.end();
    pgPool = null;
  }
}
