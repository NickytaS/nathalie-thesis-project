import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { emptyScores, pickWinner, questions, type QuizScores } from '../data/thesis';
import { saveQuizResult } from '../utils/quizResultStorage';

export function Evaluator() {
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [quizScores, setQuizScores] = useState<QuizScores>(() => emptyScores());

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
      const w = pickWinner(nextScores);
      saveQuizResult(nextScores, w);
      navigate('/results');
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

  if (!q) {
    return null;
  }

  return (
    <div className="section page-pad">
      <h1 className="page-title">Start your evaluation</h1>
      <p className="page-lead">
        Welcome — six short questions capture your priorities and suggest a migration tool. The recommendation follows from your answers; the 0–5 category and overall
        scores on the results screen stay the fixed rubric outcomes from the benchmark (they are not recalculated by the quiz).
      </p>
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
