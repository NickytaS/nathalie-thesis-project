import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChatMarkdown } from './ChatMarkdown';

function fallbackReply(msg: string): string {
  const m = msg.toLowerCase();
  if (m.includes('pgloader'))
    return 'pgLoader (4.65/5.0) targets PostgreSQL. In experiments it was fastest and preserved relational structure with row-count parity on all three databases.';
  if (m.includes('mrm') || m.includes('relational migrator'))
    return 'MongoDB Relational Migrator (4.37/5.0) targets MongoDB with a GUI workflow and passed all three databases with row-count parity.';
  if (m.includes('mongify'))
    return 'mongify (3.35/5.0) targets MongoDB via CLI. Strong document transformation scores; failed blog_db in testing due to idempotency when re-running.';
  if (m.includes('best') || m.includes('recommend') || m.includes('which'))
    return 'Use the evaluation quiz for a personalized pick. For PostgreSQL choose pgLoader; for MongoDB with governance needs prefer MRM; for MongoDB with controlled runs consider mongify.';
  if (m.includes('score') || m.includes('rating'))
    return 'Thesis overall scores: pgLoader 4.65, MRM 4.37, mongify 3.35 (weighted categories, empirical runs).';
  if (m.includes('performance') || m.includes('speed') || m.includes('fast'))
    return 'Observed runtimes: pgLoader sub-second per DB; MRM roughly 1–6s; mongify roughly 15–30s per scenario.';
  if (m.includes('schema') || m.includes('foreign'))
    return 'Schema fidelity (thesis): pgLoader 4.8, MRM 4.2, mongify 2.6 — relational preservation differs by target engine.';
  if (m.includes('quiz') || m.includes('compatibility') || m.includes('percent') || m.includes('%'))
    return 'The quiz picks a tool using priority points; the % is compatibility with that tool’s max quiz score. Thesis 0–5 scores on the results page are fixed experiment scores, not recalculated from your answers. See Methodology → “How the web quiz relates”.';
  if (m.includes('hello') || m.includes('hi'))
    return 'Hello — ask about pgLoader, MRM, mongify, scores, or methodology.';
  if (m.includes('thank')) return 'Glad it helps.';
  return 'I only have short preset answers right now. Try **Methodology** or **Evaluator** from the navigation, or ask about pgLoader, MRM, or mongify scores.';
}

function apiOrigin(): string {
  const o = import.meta.env.VITE_CHAT_API_ORIGIN;
  return typeof o === 'string' ? o.replace(/\/$/, '') : '';
}

function apiUrl(path: string): string {
  const base = apiOrigin();
  return base ? `${base}${path}` : path;
}

type Msg = { role: 'bot' | 'user'; text: string };

const INTRO = [
  '**Hi.** Ask about **pgLoader**, **MRM**, or **mongify** — thesis scores, the three datasets (WordPress, WooCommerce, ERPNext), or PostgreSQL vs MongoDB trade-offs.',
  '',
  'The **Methodology** page has the full rubric; **Evaluator** walks you through a recommendation. Quick links are just below.',
].join('\n\n');

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Msg[]>([{ role: 'bot', text: INTRO }]);
  const [loading, setLoading] = useState(false);
  const [aiReady, setAiReady] = useState<boolean | null>(null);

  const refreshHealth = useCallback(async () => {
    try {
      const r = await fetch(apiUrl('/api/health'));
      if (!r.ok) {
        setAiReady(false);
        return;
      }
      const j = (await r.json()) as { ai?: boolean };
      setAiReady(Boolean(j.ai));
    } catch {
      setAiReady(false);
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    void refreshHealth();
  }, [open, refreshHealth]);

  async function send() {
    const t = input.trim();
    if (!t || loading) return;
    setInput('');
    const userMsg: Msg = { role: 'user', text: t };
    const nextMessages: Msg[] = [...messages, userMsg];
    setMessages(nextMessages);
    setLoading(true);

    const history = nextMessages.slice(1).map((m) => ({
      role: m.role === 'user' ? ('user' as const) : ('assistant' as const),
      content: m.text,
    }));

    try {
      const r = await fetch(apiUrl('/api/chat'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history }),
      });
      const data = (await r.json().catch(() => ({}))) as { reply?: string; message?: string };

      const replyText = typeof data.reply === 'string' ? data.reply.trim() : '';
      if (r.ok && replyText) {
        setMessages((prev) => [...prev, { role: 'bot', text: replyText }]);
        setAiReady(true);
        return;
      }

      const hint =
        r.status === 503
          ? 'AI unavailable (set OPENAI_API_KEY in web/.env). Offline answer: '
          : `Request failed (${data.message || r.statusText}). Offline answer: `;
      setMessages((prev) => [...prev, { role: 'bot', text: hint + fallbackReply(t) }]);
      if (r.status === 503) setAiReady(false);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'bot', text: 'Network error — offline answer: ' + fallbackReply(t) },
      ]);
      setAiReady(false);
    } finally {
      setLoading(false);
    }
  }

  const subtitle =
    aiReady === true ? 'OpenAI · thesis context' : aiReady === false ? 'Offline fallback' : 'Checking…';

  const statusLabel = aiReady === true ? 'AI' : aiReady === false ? 'Local' : '…';

  return (
    <div className="chat-widget">
      <div className={`chat-box ${open ? 'open' : ''}`}>
        <div className="chat-header">
          <div className="chat-avatar">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" strokeWidth="2">
              <rect x="3" y="8" width="18" height="12" rx="3" />
              <path d="M9 8V6a3 3 0 0 1 6 0v2" />
            </svg>
          </div>
          <div className="chat-header-info">
            <h4>Migration Assistant</h4>
            <span>{subtitle}</span>
          </div>
          <div className="chat-status">{statusLabel}</div>
        </div>
        <div className="chat-messages">
          {messages.map((m, i) => (
            <div key={i} className={`chat-message ${m.role === 'bot' ? 'bot' : 'user'}`}>
              {m.role === 'bot' && (
                <div className="avatar">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" strokeWidth="2">
                    <rect x="3" y="8" width="18" height="12" rx="3" />
                  </svg>
                </div>
              )}
              <div className="text chat-md">
                <ChatMarkdown content={m.text} />
              </div>
            </div>
          ))}
          {loading && (
            <div className="chat-message bot">
              <div className="avatar">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" strokeWidth="2">
                  <rect x="3" y="8" width="18" height="12" rx="3" />
                </svg>
              </div>
              <div className="text chat-typing">Thinking…</div>
            </div>
          )}
        </div>
        <div className="chat-footer-hint">
          <Link to="/methodology">Methodology</Link>
          <span aria-hidden> · </span>
          <Link to="/evaluator">Evaluator</Link>
        </div>
        <div className="chat-input">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && void send()}
            placeholder={loading ? '…' : 'Ask about migration tools…'}
            aria-label="Chat message"
            disabled={loading}
          />
          <button type="button" onClick={() => void send()} aria-label="Send" disabled={loading}>
            <svg viewBox="0 0 24 24">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
          </button>
        </div>
      </div>
      <button type="button" className="chat-toggle" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-label="Toggle chat">
        <svg viewBox="0 0 24 24">
          <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z" />
        </svg>
      </button>
    </div>
  );
}
