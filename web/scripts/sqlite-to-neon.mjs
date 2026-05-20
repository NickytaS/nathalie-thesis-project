/**
 * Copies web/server/data/app.sqlite (users + quiz_results) into Neon PostgreSQL.
 *
 * Prerequisites:
 * - Tables already created on Neon (citext + users / quiz_results DDL).
 * - DATABASE_URL in web/.env (full Neon URI, include sslmode=require).
 *
 * Destructive on Neon: TRUNCATE users + quiz_results before insert (target DB only).
 */
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Database from 'better-sqlite3';
import pg from 'pg';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const webRoot = path.join(__dirname, '..');
dotenv.config({ path: path.join(webRoot, '.env') });

const sqlitePath = path.join(webRoot, 'server', 'data', 'app.sqlite');
const url = process.env.DATABASE_URL?.trim();

if (!url) {
  console.error(
    '[migrate] Missing DATABASE_URL in web/.env.\n' +
      '  Paste your Neon connection string from the dashboard, e.g.\n' +
      '  DATABASE_URL=postgresql://USER:PASSWORD@HOST/neondb?sslmode=require',
  );
  process.exit(1);
}

if (!fs.existsSync(sqlitePath)) {
  console.error('[migrate] SQLite file not found:', sqlitePath);
  console.error('  Start the chat API once locally if you have not created accounts yet.');
  process.exit(1);
}

/** Normalize SQLite datetime strings for Postgres timestamptz. */
function toTimestamptz(v) {
  if (v == null || v === '') return new Date().toISOString();
  const s = String(v).trim();
  if (!s) return new Date().toISOString();
  if (/^\d{4}-\d{2}-\d{2} /.test(s)) return `${s.replace(' ', 'T')}Z`;
  return s;
}

const sqlite = new Database(sqlitePath);
const { Pool } = pg;
const pool = new Pool({
  connectionString: url,
  ssl: url.includes('localhost') || url.includes('127.0.0.1') ? false : { rejectUnauthorized: true },
});

async function main() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('TRUNCATE quiz_results, users RESTART IDENTITY CASCADE');

    const users = sqlite.prepare('SELECT id, email, password_hash, display_name, avatar_url, created_at FROM users').all();
    for (const u of users) {
      await client.query(
        `INSERT INTO users (id, email, password_hash, display_name, avatar_url, created_at)
         VALUES ($1, $2, $3, $4, $5, $6::timestamptz)`,
        [
          u.id,
          u.email,
          u.password_hash,
          u.display_name ?? '',
          u.avatar_url ?? '',
          toTimestamptz(u.created_at),
        ],
      );
    }

    const rows = sqlite.prepare('SELECT id, user_id, winner, scores_json, created_at FROM quiz_results').all();
    for (const r of rows) {
      await client.query(
        `INSERT INTO quiz_results (id, user_id, winner, scores_json, created_at)
         VALUES ($1, $2, $3, $4, $5::timestamptz)`,
        [r.id, r.user_id, r.winner, r.scores_json, toTimestamptz(r.created_at)],
      );
    }

    const uc = users.length;
    const qc = rows.length;
    if (uc > 0) {
      await client.query(`SELECT setval(pg_get_serial_sequence('users', 'id'), (SELECT MAX(id) FROM users), true)`);
    }
    if (qc > 0) {
      await client.query(
        `SELECT setval(pg_get_serial_sequence('quiz_results', 'id'), (SELECT MAX(id) FROM quiz_results), true)`,
      );
    }

    await client.query('COMMIT');
    console.log(`[migrate] Done. Neon now has ${uc} user(s) and ${qc} quiz_result row(s).`);
  } catch (e) {
    await client.query('ROLLBACK');
    console.error('[migrate] Failed:', e.message || e);
    process.exitCode = 1;
  } finally {
    client.release();
    sqlite.close();
    await pool.end();
  }
}

await main();
