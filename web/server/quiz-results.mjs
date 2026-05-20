import {
  deleteQuizResult,
  insertQuizResult,
  selectQuizAll,
  selectQuizById,
  selectQuizLatest,
  userExists,
} from './db.mjs';
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
  const savedAt =
    row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at;
  return {
    id: row.id,
    winner: row.winner,
    quizScores: scores,
    savedAt,
  };
}

export function mountQuizResults(app, { jwtSecret }) {
  async function requireUser(req, res) {
    const tokenUser = parseSessionUser(req, jwtSecret);
    if (!tokenUser) {
      res.status(401).json({ error: 'unauthorized', message: 'Not signed in.' });
      return null;
    }
    try {
      const ok = await userExists(tokenUser.id);
      if (!ok) {
        res.status(401).json({ error: 'unauthorized', message: 'Not signed in.' });
        return null;
      }
      return tokenUser;
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'server', message: 'Could not verify session.' });
      return null;
    }
  }

  app.get('/api/quiz-results/latest', async (req, res) => {
    const user = await requireUser(req, res);
    if (!user) return;
    try {
      const row = await selectQuizLatest(user.id);
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
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'server', message: 'Could not load evaluation.' });
    }
  });

  app.get('/api/quiz-results', async (req, res) => {
    const user = await requireUser(req, res);
    if (!user) return;
    try {
      const rows = await selectQuizAll(user.id);
      const items = [];
      for (const row of rows) {
        const dto = rowToDto(row);
        if (dto) items.push(dto);
      }
      res.json({ items });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'server', message: 'Could not list evaluations.' });
    }
  });

  app.get('/api/quiz-results/:id', async (req, res) => {
    const user = await requireUser(req, res);
    if (!user) return;
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) {
      res.status(400).json({ error: 'validation', message: 'Invalid id.' });
      return;
    }
    try {
      const row = await selectQuizById(id);
      if (!row || Number(row.user_id) !== Number(user.id)) {
        res.status(404).json({ error: 'not_found', message: 'Evaluation not found.' });
        return;
      }
      const dto = rowToDto(row);
      if (!dto) {
        res.status(500).json({ error: 'server', message: 'Could not read saved result.' });
        return;
      }
      res.json(dto);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'server', message: 'Could not load evaluation.' });
    }
  });

  app.post('/api/quiz-results', async (req, res) => {
    const user = await requireUser(req, res);
    if (!user) return;
    const parsed = parseQuizPayload(req.body);
    if (!parsed) {
      res.status(400).json({ error: 'validation', message: 'Invalid quiz result payload.' });
      return;
    }
    const scoresJson = JSON.stringify(parsed.quizScores);
    try {
      const { id } = await insertQuizResult(user.id, parsed.winner, scoresJson);
      const row = await selectQuizById(id);
      const dto = row ? rowToDto(row) : null;
      if (!dto) {
        res.status(500).json({ error: 'server', message: 'Saved but could not load result.' });
        return;
      }
      res.status(201).json(dto);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'server', message: 'Could not save evaluation.' });
    }
  });

  app.delete('/api/quiz-results/:id', async (req, res) => {
    const user = await requireUser(req, res);
    if (!user) return;
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) {
      res.status(400).json({ error: 'validation', message: 'Invalid id.' });
      return;
    }
    try {
      const changed = await deleteQuizResult(id, user.id);
      if (changed === 0) {
        res.status(404).json({ error: 'not_found', message: 'Evaluation not found.' });
        return;
      }
      res.status(204).end();
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'server', message: 'Could not delete evaluation.' });
    }
  });
}
