import fs from 'fs';
import path from 'path';
import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, 'data');

let db = null;

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

export function getDb() {
  if (!db) {
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
    const dbPath = path.join(dataDir, 'app.sqlite');
    db = new Database(dbPath);
    db.pragma('foreign_keys = ON');
    db.exec(`
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
    ensureUserProfileColumns(db);
  }
  return db;
}
