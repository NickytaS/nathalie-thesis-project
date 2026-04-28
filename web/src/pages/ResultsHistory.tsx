import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  deleteQuizResultRemote,
  fetchQuizHistory,
  saveQuizResultRemote,
  type RemoteQuizResult,
} from '../api/quizResultsApi';
import { useAuth } from '../context/AuthContext';
import { tools } from '../data/thesis';
import { loadQuizHistory, loadQuizResult, type StoredQuizResult } from '../utils/quizResultStorage';

export function ResultsHistory() {
  const { user, loading: authLoading } = useAuth();
  const [items, setItems] = useState<RemoteQuizResult[]>([]);
  const [localItems, setLocalItems] = useState<StoredQuizResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const refresh = useCallback(async () => {
    if (!user) {
      setItems([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      let list = await fetchQuizHistory();
      if (list.length === 0) {
        const local = loadQuizResult();
        if (local) {
          await saveQuizResultRemote(local.quizScores, local.winner);
          list = await fetchQuizHistory();
        }
      }
      setItems(list);
    } catch {
      setError('Could not load history.');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    setLocalItems(loadQuizHistory());
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setLoading(false);
      setItems([]);
      return;
    }
    void refresh();
  }, [user, authLoading, refresh]);

  if (authLoading) {
    return (
      <div className="section page-pad">
        <h1 className="page-title">Evaluation & comparison history</h1>
        <p className="page-lead">Loading…</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="section page-pad">
        <h1 className="page-title">Evaluation & comparison history</h1>
        <p className="page-lead">Your latest local evaluation runs are listed here. Sign in to sync history across devices.</p>
        {localItems.length === 0 ? (
          <div className="callout callout--info" style={{ marginTop: '1.5rem' }}>
            <p>No local evaluations found yet.</p>
            <p style={{ marginTop: '1rem' }}>
              <Link to="/evaluator" className="btn btn-primary">
                Start evaluation →
              </Link>
            </p>
          </div>
        ) : (
          <ul className="profile-card" style={{ marginTop: '1.5rem', listStyle: 'none', padding: '1.25rem' }}>
            {localItems.map((row, index) => {
              const tool = tools[row.winner];
              const when = new Date(row.savedAt);
              const dateLabel = Number.isFinite(when.getTime()) ? when.toLocaleString() : row.savedAt;
              return (
                <li
                  key={`${row.savedAt}-${index}`}
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.85rem 0',
                    borderBottom: '1px solid var(--border-subtle, rgba(255,255,255,0.08))',
                  }}
                >
                  <div style={{ flex: '1 1 12rem' }}>
                    <strong>{tool.name}</strong>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{dateLabel}</div>
                  </div>
                  <Link to="/compare" className="btn btn-secondary" style={{ fontSize: '0.9rem' }}>
                    Compare tools
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
        <p style={{ marginTop: '1rem' }}>
          <Link to="/login" className="btn btn-primary">
            Log in or register
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="section page-pad">
      <h1 className="page-title">Evaluation & comparison history</h1>
      <p className="page-lead">Every completed quiz is stored on your account (in addition to session storage for the current tab).</p>

      {error && (
        <p role="alert" style={{ color: 'var(--accent-warm, #c45c3e)', marginTop: '1rem' }}>
          {error}
        </p>
      )}

      {loading ? (
        <p style={{ marginTop: '1.5rem' }}>Loading your evaluations…</p>
      ) : items.length === 0 ? (
        <div className="callout callout--info" style={{ marginTop: '1.5rem' }}>
          <p>No saved evaluations yet. Complete the quiz while signed in to add your first entry.</p>
          <p style={{ marginTop: '1rem' }}>
            <Link to="/evaluator" className="btn btn-primary">
              Start evaluation →
            </Link>
          </p>
        </div>
      ) : (
        <ul className="profile-card" style={{ marginTop: '1.5rem', listStyle: 'none', padding: '1.25rem' }}>
          {items.map((row) => {
            const tool = tools[row.winner];
            const when = new Date(row.savedAt);
            const dateLabel = Number.isFinite(when.getTime()) ? when.toLocaleString() : row.savedAt;
            return (
              <li
                key={row.id}
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.85rem 0',
                  borderBottom: '1px solid var(--border-subtle, rgba(255,255,255,0.08))',
                }}
              >
                <div style={{ flex: '1 1 12rem' }}>
                  <strong>{tool.name}</strong>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{dateLabel}</div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <Link to={`/results/saved/${row.id}`} className="btn btn-secondary" style={{ fontSize: '0.9rem' }}>
                    Open
                  </Link>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    style={{ fontSize: '0.9rem' }}
                    disabled={deletingId === row.id}
                    onClick={() => {
                      if (!window.confirm('Remove this saved evaluation from your account?')) return;
                      setDeletingId(row.id);
                      void (async () => {
                        const { ok, message } = await deleteQuizResultRemote(row.id);
                        setDeletingId(null);
                        if (!ok) {
                          window.alert(message || 'Could not delete.');
                          return;
                        }
                        await refresh();
                      })();
                    }}
                  >
                    {deletingId === row.id ? '…' : 'Delete'}
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {localItems.length > 0 && (
        <>
          <h2 style={{ marginTop: '2rem' }}>Recent local runs</h2>
          <ul className="profile-card" style={{ marginTop: '1rem', listStyle: 'none', padding: '1.25rem' }}>
            {localItems.slice(0, 5).map((row, index) => {
              const tool = tools[row.winner];
              const when = new Date(row.savedAt);
              const dateLabel = Number.isFinite(when.getTime()) ? when.toLocaleString() : row.savedAt;
              return (
                <li
                  key={`${row.savedAt}-${index}`}
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.85rem 0',
                    borderBottom: '1px solid var(--border-subtle, rgba(255,255,255,0.08))',
                  }}
                >
                  <div style={{ flex: '1 1 12rem' }}>
                    <strong>{tool.name}</strong>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{dateLabel}</div>
                  </div>
                  <Link to="/compare" className="btn btn-secondary" style={{ fontSize: '0.9rem' }}>
                    Compare tools
                  </Link>
                </li>
              );
            })}
          </ul>
        </>
      )}

      <p style={{ marginTop: '1.5rem' }}>
        <Link to="/results">← Back to results</Link>
        <span aria-hidden> · </span>
        <Link to="/evaluator">New evaluation</Link>
      </p>
    </div>
  );
}
