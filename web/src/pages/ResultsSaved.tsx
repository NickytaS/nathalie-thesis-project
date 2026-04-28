import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { fetchQuizHistory, fetchQuizResultById, type RemoteQuizResult } from '../api/quizResultsApi';
import { QuizResultsContent } from '../components/QuizResultsContent';
import { useAuth } from '../context/AuthContext';

export function ResultsSaved() {
  const { id: idParam } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [row, setRow] = useState<RemoteQuizResult | null>(null);
  const [historyCount, setHistoryCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const id = idParam ? Number(idParam) : NaN;

  useEffect(() => {
    if (authLoading) return;
    if (!user || !Number.isInteger(id) || id < 1) {
      setRow(null);
      setError(!user ? null : 'Invalid link.');
      return;
    }

    let cancelled = false;
    void (async () => {
      setError(null);
      const [one, list] = await Promise.all([fetchQuizResultById(id), fetchQuizHistory()]);
      if (cancelled) return;
      setHistoryCount(list.length);
      if (!one) {
        setRow(null);
        setError('This evaluation was not found or is no longer available.');
        return;
      }
      setRow(one);
    })();

    return () => {
      cancelled = true;
    };
  }, [user, authLoading, id]);

  if (authLoading) {
    return (
      <div className="section page-pad">
        <h1 className="page-title">Saved evaluation</h1>
        <p className="page-lead">Loading…</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="section page-pad">
        <h1 className="page-title">Saved evaluation</h1>
        <p className="page-lead">Sign in to view saved evaluations.</p>
        <p style={{ marginTop: '1.5rem' }}>
          <Link to="/login" className="btn btn-primary">
            Log in
          </Link>
        </p>
      </div>
    );
  }

  if (error || !row) {
    return (
      <div className="section page-pad">
        <h1 className="page-title">Saved evaluation</h1>
        <p className="page-lead">{error || 'Loading…'}</p>
        <p style={{ marginTop: '1.5rem' }}>
          <Link to="/results/history">← Evaluation history</Link>
        </p>
      </div>
    );
  }

  return (
    <div className="section page-pad">
      <h1 className="page-title">Saved evaluation</h1>
      <p className="page-lead">
        From your account ·{' '}
        {(() => {
          const when = new Date(row.savedAt);
          return Number.isFinite(when.getTime()) ? when.toLocaleString() : row.savedAt;
        })()}
      </p>
      <p style={{ marginTop: '0.75rem', fontSize: '0.9rem' }}>
        <Link to="/results/history">← All saved evaluations</Link>
      </p>
      <div style={{ marginTop: '1.5rem' }}>
        <QuizResultsContent
          quizScores={row.quizScores}
          onRetake={() => navigate('/evaluator')}
          accountSavedCount={historyCount}
        />
      </div>
    </div>
  );
}
