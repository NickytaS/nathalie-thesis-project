/**
 * Local proxy for OpenAI Chat Completions — keeps OPENAI_API_KEY off the client.
 * Run: node server/chat-api.mjs (or npm run dev, which starts this alongside Vite).
 */
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const PORT = Number(process.env.CHAT_API_PORT || 5171);
const MODEL = (process.env.OPENAI_MODEL || 'gpt-4o-mini').trim();
const OPENAI_API_KEY = (process.env.OPENAI_API_KEY || '').trim();
const MAX_MESSAGES = 24;
const MAX_CONTENT = 8000;
const LOG_USAGE = process.env.CHAT_LOG_USAGE === '1' || process.env.CHAT_LOG_USAGE === 'true';

const SYSTEM_PROMPT = `You are the Migration Tool Evaluator assistant.

Ground truth (do not contradict):
- Tools: pgLoader (MySQL→PostgreSQL), MongoDB Relational Migrator / MRM (MySQL→MongoDB), mongify (MySQL→MongoDB).
- Overall scores (0–5, weighted rubric): pgLoader 4.65, MRM 4.37, mongify 3.35.
- Category scores (approximate): pgLoader schema 4.8, data 4.9, transform 3.0, performance 5.0, operational 4.4 | MRM 4.2, 4.9, 4.0, 4.0, 4.4 | mongify 2.6, 3.8, 4.8, 2.2, 3.0.
- Data: three non-trivial MySQL exports in the repo (content-heavy, commerce-shaped, operations/ERP-style); ~68 tables and ~2,100 rows in scope — use Methodology for filenames if the user needs them.
- Matrix: pgLoader 3/3 PASS, MRM 3/3 PASS, mongify 2/3 PASS (one MongoDB re-run showed duplicate documents / idempotency issue on the content-heavy workload).
- The six-question quiz does NOT recompute the weighted rubric average; it yields a compatibility match; displayed 0–5 scores are fixed empirical results.
- Evaluation uses 40 criteria across five weighted categories (Schema 30%, Data 30%, Performance 20%, MongoDB transform 10%, Operational 10%).

Style: concise, accurate, cite these numbers when relevant. Prefer neutral wording (workloads, benchmark, rubric) over vendor product names unless the user asks for specifics. If asked about something outside this migration benchmark, briefly decline and point to Methodology, Compare, and the repository README. Do not invent experiment results or scores.`;

function sanitizeMessages(raw) {
  if (!Array.isArray(raw)) return null;
  const out = [];
  for (const m of raw) {
    if (out.length >= MAX_MESSAGES) break;
    if (!m || typeof m !== 'object') continue;
    const role = m.role === 'user' || m.role === 'assistant' ? m.role : null;
    const content = typeof m.content === 'string' ? m.content.slice(0, MAX_CONTENT) : '';
    if (!role || !content.trim()) continue;
    out.push({ role, content: content.trim() });
  }
  return out.length ? out : null;
}

const app = express();
app.use(cors({ origin: true }));
app.use(express.json({ limit: '120kb' }));

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    ai: Boolean(OPENAI_API_KEY),
    model: OPENAI_API_KEY ? MODEL : null,
  });
});

app.post('/api/chat', async (req, res) => {
  const key = OPENAI_API_KEY;
  if (!key) {
    res.status(503).json({ error: 'no_api_key', message: 'Set OPENAI_API_KEY in web/.env to enable AI replies.' });
    return;
  }

  const messages = sanitizeMessages(req.body?.messages);
  if (!messages) {
    res.status(400).json({ error: 'bad_request', message: 'Expected { messages: [{ role, content }] }' });
    return;
  }

  const body = {
    model: MODEL,
    messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages],
    max_tokens: 700,
    temperature: 0.35,
  };

  try {
    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify(body),
    });

    const data = await r.json().catch(() => ({}));

    if (!r.ok) {
      const msg = data?.error?.message || r.statusText || 'OpenAI request failed';
      res.status(r.status >= 400 && r.status < 600 ? r.status : 502).json({
        error: 'openai_error',
        message: msg,
      });
      return;
    }

    const text = data?.choices?.[0]?.message?.content?.trim();
    if (!text) {
      res.status(502).json({ error: 'empty_response', message: 'No assistant text in response.' });
      return;
    }

    const usage = data?.usage;
    const usagePayload =
      usage && typeof usage === 'object'
        ? {
            prompt_tokens: usage.prompt_tokens,
            completion_tokens: usage.completion_tokens,
            total_tokens: usage.total_tokens,
          }
        : undefined;

    if (LOG_USAGE && usagePayload) {
      console.log(`[chat-api] OpenAI usage: ${JSON.stringify({ model: MODEL, ...usagePayload })}`);
    }

    res.json({ reply: text, model: MODEL, usage: usagePayload });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Network error';
    res.status(502).json({ error: 'upstream', message });
  }
});

app.listen(PORT, '127.0.0.1', () => {
  console.log(`[chat-api] http://127.0.0.1:${PORT}  (AI: ${OPENAI_API_KEY ? 'on' : 'off'})`);
});
