import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  emptyScores,
  maxQuizScores,
  pickWinner,
  questions,
  tools,
  type QuizScores,
  type ToolId,
} from '../data/thesis';
import { openPrintableRecommendation } from '../utils/exportPdf';

type Phase = 'quiz' | 'results';

export function Evaluator() {
  const [phase, setPhase] = useState<Phase>('quiz');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [quizScores, setQuizScores] = useState<QuizScores>(() => emptyScores());
  const [showJustification, setShowJustification] = useState(false);

  const maxScores = maxQuizScores();

  const q = questions[currentQuestion];
  const selected = answers[currentQuestion];

  function selectAnswer(index: number) {
    const next = [...answers];
    next[currentQuestion] = index;
    setAnswers(next);
  }

  function goNext() {
    if (selected === undefined || !q) return;
    const opt = q.options[selected];
    if (!opt) return;
    const nextScores: QuizScores = {
      pgloader: quizScores.pgloader + opt.scores.pgloader,
      mrm: quizScores.mrm + opt.scores.mrm,
      mongify: quizScores.mongify + opt.scores.mongify,
    };
    if (currentQuestion < questions.length - 1) {
      setQuizScores(nextScores);
      setCurrentQuestion((n) => n + 1);
    } else {
      setQuizScores(nextScores);
      setPhase('results');
    }
  }

  function goBack() {
    if (currentQuestion === 0) return;
    const prevQ = questions[currentQuestion - 1];
    const prevAns = answers[currentQuestion - 1];
    if (!prevQ || prevAns === undefined) return;
    const prevOpt = prevQ.options[prevAns];
    if (!prevOpt) return;
    setQuizScores((s) => ({
      pgloader: s.pgloader - prevOpt.scores.pgloader,
      mrm: s.mrm - prevOpt.scores.mrm,
      mongify: s.mongify - prevOpt.scores.mongify,
    }));
    setCurrentQuestion((n) => n - 1);
  }

  function restart() {
    setPhase('quiz');
    setCurrentQuestion(0);
    setAnswers([]);
    setQuizScores(emptyScores());
    setShowJustification(false);
  }

  const winner = pickWinner(quizScores);
  const tool = tools[winner];

  const rankings = (['pgloader', 'mrm', 'mongify'] as ToolId[])
    .map((toolId) => tools[toolId])
    .sort((a, b) => b.score - a.score);

  const matchPct =
    maxScores[winner] > 0 ? Math.round((quizScores[winner] / maxScores[winner]) * 100) : 0;

  let description: string;
  if (winner === 'pgloader') {
    description = `${tool.name} fits a PostgreSQL target with strong relational fidelity and speed priorities, consistent with the thesis results.`;
  } else if (winner === 'mrm') {
    description = `${tool.name} fits a MongoDB target when you value guided mapping and governance over a minimal CLI footprint.`;
  } else {
    description = `${tool.name} fits a MongoDB target when document modeling matters most and you can enforce clean target state before runs.`;
  }

  const stars = '★'.repeat(Math.min(5, Math.round(tool.score))) + '☆'.repeat(Math.max(0, 5 - Math.round(tool.score)));

  if (phase === 'results') {
    return (
      <div className="section page-pad">
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '1rem', fontSize: '0.85rem' }}>
          Quiz winner: <strong style={{ color: 'var(--accent-primary)' }}>{tool.name}</strong> — compatibility match ~{matchPct}%
        </p>
        <div className="results-grid">
          <div className="rankings-sidebar">
            {rankings.map((r, i) => (
              <div key={r.id} className={`ranking-item ${i === 0 ? 'top' : ''}`}>
                {i === 0 && <div className="ranking-badge">Thesis overall score</div>}
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
                <strong>Quiz vs thesis scores:</strong> The ~{matchPct}% line is your quiz <em>compatibility match</em> for {tool.name} (points vs the
                maximum achievable for that tool). The <strong>{tool.score} / 5.0 overall</strong> and the five category numbers below are the{' '}
                <strong>fixed thesis experiment scores</strong> from the weighted rubric — they are not recomputed from your quiz answers.{' '}
                <Link to="/methodology#rubric">Methodology</Link> explains the distinction.
              </p>
            </div>
            <div className="result-card">
              <div className="result-header">
                <div>
                  <div className="result-badge">Recommended</div>
                  <div className="result-tool-name">{tool.name}</div>
                  <div className="result-tool-score">
                    {tool.score} <span className="score-label">/ 5.0 thesis</span>
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
              <button type="button" className="btn btn-primary" onClick={restart}>
                Retake quiz
              </button>
              <Link to="/compare" className="btn btn-secondary">
                Open comparison table
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!q) {
    return null;
  }

  return (
    <div className="section page-pad">
      <h1 className="page-title">Evaluation</h1>
      <p className="page-lead">Six questions — answers steer a recommendation; displayed numbers are thesis category scores.</p>
      <div className="evaluation-container active">
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${(currentQuestion / questions.length) * 100}%` }} />
        </div>
        <div className="question-counter">
          Question {currentQuestion + 1} of {questions.length}
        </div>
        <div className="question-text">{q.text}</div>
        <div className="answer-options">
          {q.options.map((opt, i) => (
            <button
              key={opt.text}
              type="button"
              className={`answer-option ${selected === i ? 'selected' : ''}`}
              onClick={() => selectAnswer(i)}
            >
              <div className="radio" />
              <span>{opt.text}</span>
            </button>
          ))}
        </div>
        <div className="nav-buttons">
          <button type="button" className="btn btn-secondary" onClick={goBack} style={{ visibility: currentQuestion > 0 ? 'visible' : 'hidden' }}>
            ← Back
          </button>
          <button type="button" className="btn btn-primary" onClick={goNext} disabled={selected === undefined}>
            {currentQuestion === questions.length - 1 ? 'See results' : 'Next →'}
          </button>
        </div>
      </div>
    </div>
  );
}
