import { useState } from 'react';
import { Link } from 'react-router-dom';
import { maxQuizScores, pickWinner, tools, type QuizScores, type ToolId } from '../data/thesis';
import { openPrintableRecommendation } from '../utils/exportPdf';
import { evalSessionCount } from '../utils/quizResultStorage';

export function QuizResultsContent({
  quizScores,
  onRetake,
  accountSavedCount,
}: {
  quizScores: QuizScores;
  onRetake: () => void;
  /** When set, shows how many evaluations are stored on the signed-in account. */
  accountSavedCount?: number;
}) {
  const [showJustification, setShowJustification] = useState(false);
  const winner = pickWinner(quizScores);
  const tool = tools[winner];
  const maxScores = maxQuizScores();

  const rankings = (['pgloader', 'mrm', 'mongify'] as ToolId[])
    .map((toolId) => tools[toolId])
    .sort((a, b) => b.score - a.score);

  const matchPct =
    maxScores[winner] > 0 ? Math.round((quizScores[winner] / maxScores[winner]) * 100) : 0;

  let description: string;
  if (winner === 'pgloader') {
    description = `${tool.name} fits a PostgreSQL target with strong relational fidelity and speed priorities, consistent with the benchmark results.`;
  } else if (winner === 'mrm') {
    description = `${tool.name} fits a MongoDB target when you value guided mapping and governance over a minimal CLI footprint.`;
  } else {
    description = `${tool.name} fits a MongoDB target when document modeling matters most and you can enforce clean target state before runs.`;
  }

  const filled = Math.min(5, Math.round(tool.score));
  const stars = '\u2605'.repeat(filled) + '\u2606'.repeat(Math.max(0, 5 - filled));

  const nEval = evalSessionCount();

  return (
    <>
      {nEval > 0 && (
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '1rem', fontSize: '0.85rem' }}>
          You&apos;ve completed <strong style={{ color: 'var(--text-secondary)' }}>{nEval}</strong> evaluation
          {nEval === 1 ? '' : 's'} this session.
        </p>
      )}
      {accountSavedCount != null && accountSavedCount > 0 && (
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '1rem', fontSize: '0.85rem' }}>
          <strong style={{ color: 'var(--text-secondary)' }}>{accountSavedCount}</strong> evaluation
          {accountSavedCount === 1 ? '' : 's'} saved on your account —{' '}
          <Link to="/results/history">view history</Link>.
        </p>
      )}
      <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '1rem', fontSize: '0.85rem' }}>
        Quiz winner: <strong style={{ color: 'var(--accent-primary)' }}>{tool.name}</strong> — compatibility match ~{matchPct}%
      </p>
      <div className="results-grid">
        <div className="rankings-sidebar">
          {rankings.map((r, i) => (
            <div key={r.id} className={`ranking-item ${i === 0 ? 'top' : ''}`}>
              {i === 0 && <div className="ranking-badge">Overall rubric score</div>}
              {i > 0 && <div className="ranking-position">#{i + 1} rank</div>}
              <div className={`ranking-logo ${i > 0 ? 'small' : ''}`}>{r.shortLogo}</div>
              <div className="ranking-name">{r.name}</div>
              <div className="ranking-score">
                {r.score} <span>overall</span>
              </div>
              {r.id === winner && <div className="ranking-match">Your quiz aligns here</div>}
            </div>
          ))}
        </div>
        <div className="results-main">
          <div className="callout callout--info" style={{ marginBottom: '1.25rem' }}>
            <p>
              <strong>Quiz vs rubric scores:</strong> The ~{matchPct}% line is your quiz <em>compatibility match</em> for {tool.name}{' '}
              (points vs the maximum achievable for that tool). The <strong>{tool.score} / 5.0 overall</strong> and the five category numbers below are
              the <strong>fixed benchmark scores</strong> from the weighted rubric — they are not recomputed from your quiz answers.{' '}
              <Link to="/methodology#rubric">Methodology</Link> explains the distinction.
            </p>
          </div>
          <div className="result-card">
            <div className="result-header">
              <div>
                <div className="result-badge">Recommended</div>
                <div className="result-tool-name">{tool.name}</div>
                <div className="result-tool-score">
                  {tool.score} <span className="score-label">/ 5.0 rubric</span>
                </div>
                <div className="stars" aria-hidden>
                  {stars}
                </div>
              </div>
              <button type="button" className="btn btn-secondary export-btn" onClick={() => openPrintableRecommendation(tool, description)}>
                Print / PDF
              </button>
            </div>
            <p className="result-description">{description}</p>
            <button type="button" className="show-reasoning" onClick={() => setShowJustification((s) => !s)}>
              {showJustification ? 'Hide' : 'Show'} full justification
            </button>
            <div className={`reasoning-box ${showJustification ? '' : 'hidden'}`}>
              <p>{tool.justification}</p>
            </div>
            <div className="score-breakdown">
              <div className="score-item">
                <div className="value">{tool.schema}</div>
                <div className="label">Schema</div>
              </div>
              <div className="score-item">
                <div className="value">{tool.data}</div>
                <div className="label">Data</div>
              </div>
              <div className="score-item">
                <div className="value">{tool.transform}</div>
                <div className="label">Transform</div>
              </div>
              <div className="score-item">
                <div className="value">{tool.performance}</div>
                <div className="label">Performance</div>
              </div>
              <div className="score-item">
                <div className="value">{tool.operational}</div>
                <div className="label">Operational</div>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <button type="button" className="btn btn-primary" onClick={onRetake}>
              Retake quiz
            </button>
            <Link to="/compare" className="btn btn-secondary">
              Open comparison table
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
