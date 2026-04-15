import { Link, useNavigate } from 'react-router-dom';
import { QuizResultsContent } from '../components/QuizResultsContent';
import { loadQuizResult } from '../utils/quizResultStorage';

export function Results() {
  const navigate = useNavigate();
  const stored = loadQuizResult();

  function handleRetake() {
    navigate('/evaluator');
  }

  if (!stored) {
    return (
      <div className="section page-pad">
        <h1 className="page-title">Results</h1>
        <p className="page-lead">Complete the short evaluator quiz to see a personalized recommendation and rubric breakdown.</p>
        <div className="callout callout--info" style={{ marginTop: '1.5rem' }}>
          <p>
            No quiz result is stored for this browser session yet. Start the evaluation to generate results (they are kept until you log out or close the
            tab, depending on your browser).
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

  return (
    <div className="section page-pad">
      <h1 className="page-title">Your results</h1>
      <p className="page-lead">Recommendation from your answers, shown next to the fixed benchmark scores from the thesis rubric.</p>
      <div style={{ marginTop: '1.5rem' }}>
        <QuizResultsContent quizScores={stored.quizScores} onRetake={handleRetake} />
      </div>
    </div>
  );
}
