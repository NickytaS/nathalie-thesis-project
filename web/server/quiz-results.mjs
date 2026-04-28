import { getDb } from './db.mjs';
import { parseSessionUser } from './session.mjs';

const TOOLS = new Set(['pgloader', 'mrm', 'mongify']);

function parseQuizPayload(body) {
  const winner = typeof body?.winner === 'string' ? body.winner.trim() : '';
  if (!TOOLS.has(winner)) return null;
  const s = body?.quizScores;
  if (!s || typeof s !== 'object') return null;
  const num = (k) => {
    const v = s[k];
    return typeof v === 'number' && Number.isFinite(v) ? v : null;
  };
  const pgloader = num('pgloader');
  const mrm = num('mrm');
  const mongify = num('mongify');
  if (pgloader === null || mrm === null || mongify === null) return null;
  return {
    winner,
    quizScores: { pgloader, mrm, mongify },
  };
}

function rowToDto(row) {
  let scores;
  try {
    scores = JSON.parse(row.scores_json);
  } catch {
    return null;
  }
  if (!scores || typeof scores !== 'object') return null;
  return {
    id: row.id,
    winner: row.winner,
    quizScores: scores,
    savedAt: row.created_at,
  };
}

export function mountQuizResults(app, { jwtSecret }) {
  const db = getDb();
  const selectUser = db.prepare('SELECT id FROM users WHERE id = ?');
  const insert = db.prepare(
    'INSERT INTO quiz_results (user_id, winner, scores_json) VALUES (?, ?, ?)',
  );
  const selectLatest = db.prepare(
    `SELECT id, user_id, winner, scores_json, created_at FROM quiz_results
     WHERE user_id = ? ORDER BY datetime(created_at) DESC LIMIT 1`,
  );
  const selectAll = db.prepare(
    `SELECT id, user_id, winner, scores_json, created_at FROM quiz_results
     WHERE user_id = ? ORDER BY datetime(created_at) DESC LIMIT 200`,
  );
  const selectOne = db.prepare(
    'SELECT id, user_id, winner, scores_json, created_at FROM quiz_results WHERE id = ?',
  );
  const deleteOne = db.prepare('DELETE FROM quiz_results WHERE id = ? AND user_id = ?');

  function requireUser(req, res) {
    const tokenUser = parseSessionUser(req, jwtSecret);
    if (!tokenUser) {
      res.status(401).json({ error: 'unauthorized', message: 'Not signed in.' });
      return null;
    }
    const row = selectUser.get(tokenUser.id);
    if (!row) {
      res.status(401).json({ error: 'unauthorized', message: 'Not signed in.' });
      return null;
    }
    return tokenUser;
  }

  app.get('/api/quiz-results/latest', (req, res) => {
    const user = requireUser(req, res);
    if (!user) return;
    const row = selectLatest.get(user.id);
    if (!row) {
      res.status(404).json({ error: 'not_found', message: 'No saved evaluations yet.' });
      return;
    }
    const dto = rowToDto(row);
    if (!dto) {
      res.status(500).json({ error: 'server', message: 'Could not read saved result.' });
      return;
    }
    res.json(dto);
  });

  app.get('/api/quiz-results', (req, res) => {
    const user = requireUser(req, res);
    if (!user) return;
    const rows = selectAll.all(user.id);
    const items = [];
    for (const row of rows) {
      const dto = rowToDto(row);
      if (dto) items.push(dto);
    }
    res.json({ items });
  });

  app.get('/api/quiz-results/:id', (req, res) => {
    const user = requireUser(req, res);
    if (!user) return;
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) {
      res.status(400).json({ error: 'validation', message: 'Invalid id.' });
      return;
    }
    const row = selectOne.get(id);
    if (!row || row.user_id !== user.id) {
      res.status(404).json({ error: 'not_found', message: 'Evaluation not found.' });
      return;
    }
    const dto = rowToDto(row);
    if (!dto) {
      res.status(500).json({ error: 'server', message: 'Could not read saved result.' });
      return;
    }
    res.json(dto);
  });

  app.post('/api/quiz-results', (req, res) => {
    const user = requireUser(req, res);
    if (!user) return;
    const parsed = parseQuizPayload(req.body);
    if (!parsed) {
      res.status(400).json({ error: 'validation', message: 'Invalid quiz result payload.' });
      return;
    }
    const scoresJson = JSON.stringify(parsed.quizScores);
    const info = insert.run(user.id, parsed.winner, scoresJson);
    const row = selectOne.get(Number(info.lastInsertRowid));
    const dto = rowToDto(row);
    if (!dto) {
      res.status(500).json({ error: 'server', message: 'Saved but could not load result.' });
      return;
    }
    res.status(201).json(dto);
  });

  app.delete('/api/quiz-results/:id', (req, res) => {
    const user = requireUser(req, res);
    if (!user) return;
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) {
      res.status(400).json({ error: 'validation', message: 'Invalid id.' });
      return;
    }
    const result = deleteOne.run(id, user.id);
    if (result.changes === 0) {
      res.status(404).json({ error: 'not_found', message: 'Evaluation not found.' });
      return;
    }
    res.status(204).end();
  });
}
