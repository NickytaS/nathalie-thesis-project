import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { QuizResultsContent } from '../components/QuizResultsContent';
import { useAuth } from '../context/AuthContext';
import { tools } from '../data/thesis';
import { loadQuizResult, type StoredQuizResult } from '../utils/quizResultStorage';

export function Results() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const stored = loadQuizResult();
  const [remoteFallback, setRemoteFallback] = useState<StoredQuizResult | null>(null);

  useEffect(() => {
    if (!user || authLoading) {
      setRemoteFallback(null);
      return;
    }
    // History pages were removed; only session result is shown.
    setRemoteFallback(null);
  }, [user, authLoading]);

  const effective = useMemo(() => stored ?? remoteFallback, [stored, remoteFallback]);

  function handleRetake() {
    navigate('/evaluator');
  }

  if (!effective) {
    return (
      <div className="section page-pad">
        <h1 className="page-title">Results</h1>
        <p className="page-lead">Complete the short evaluator quiz to see a personalized recommendation and rubric breakdown.</p>
        <div className="callout callout--info" style={{ marginTop: '1.5rem' }}>
          <p>
            No quiz result is stored for this browser session yet. Results are kept in{' '}
            <strong>session storage</strong> until you close the tab. {user ? 'Signed-in users also get a synced copy on the server after each run.' : ''}
          </p>
        </div>
        <p style={{ marginTop: '1.5rem' }}>
          <Link to="/evaluator" className="btn btn-primary">
            Start evaluation →
          </Link>
        </p>
      </div>
    );
  }

  const fromAccount = Boolean(!stored && remoteFallback);
  const winnerLabel = tools[effective.winner].name;

  return (
    <div className="section page-pad">
      <h1 className="page-title">Your results</h1>
      <p className="page-lead">Recommendation from your answers, shown next to the fixed benchmark scores from the thesis rubric.</p>
      {fromAccount && (
        <div className="callout callout--info" style={{ marginTop: '1rem' }}>
          <p>
            Showing your <strong>latest saved evaluation</strong> from your account ({winnerLabel}). This tab had no session result; we loaded it from the
            server.
          </p>
        </div>
      )}
      <div style={{ marginTop: '1.5rem' }}>
        <QuizResultsContent
          quizScores={effective.quizScores}
          onRetake={handleRetake}
        />
      </div>
    </div>
  );
}
