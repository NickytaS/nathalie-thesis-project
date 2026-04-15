import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

const FAQ_ITEMS: { question: string; answer: ReactNode }[] = [
  {
    question: 'What is Migration Tool Evaluator?',
    answer: (
      <>
        <strong>Migration Tool Evaluator</strong> is a decision-support site that compares three migration tools — <strong>pgLoader</strong> (MySQL →
        PostgreSQL), <strong>MongoDB Relational Migrator (MRM)</strong>, and <strong>mongify</strong> (MySQL → MongoDB) — on realistic exported MySQL data.
        It publishes weighted scores, a scenario matrix, the full rubric, and paths in this repository to rerun the benchmark if you need raw outputs.
      </>
    ),
  },
  {
    question: 'What tools are compared?',
    answer: (
      <>
        <strong>pgLoader</strong> (PostgreSQL), <strong>MRM</strong>, and <strong>mongify</strong> (MongoDB). Each was run against the same set of MySQL
        exports wherever the tool supports that route. The matrix and methodology are on <Link to="/methodology#scenarios">Methodology</Link>; scores on{' '}
        <Link to="/compare">Compare</Link>.
      </>
    ),
  },
  {
    question: 'How is the recommendation generated?',
    answer: (
      <>
        The <Link to="/evaluator">Evaluator</Link> uses <strong>six multiple-choice questions</strong>. Each answer adds priority points per tool; the tool
        with the highest total is recommended, and the percentage is how much of that tool’s <em>maximum possible</em> quiz points your answers reached.
        That is a <strong>compatibility match</strong>, not a recomputation of the rubric: the <strong>0–5 category and overall scores</strong> on the results
        screen are <strong>fixed</strong> from the weighted model applied to the benchmark runs — they are not derived from your quiz alone. See{' '}
        <Link to="/methodology#quiz-scores">Methodology → How the quiz relates to rubric scores</Link>.
      </>
    ),
  },
  {
    question: 'Is the chat assistant always accurate?',
    answer: (
      <>
        No. The sidebar may use <strong>preset keyword replies</strong> or an <strong>optional AI</strong> (when the API is configured). Treat it as a
        convenience: for decisions or citations, rely on <Link to="/methodology">Methodology</Link>, <Link to="/compare">Compare</Link>, and repository
        outputs — not chat paraphrases alone.
      </>
    ),
  },
];

export function HelpCenter() {
  return (
    <div className="section page-pad">
      <h1 className="page-title">Help Center</h1>
      <p className="page-lead">
        Find answers to frequently asked questions about <strong>Migration Tool Evaluator</strong>.
      </p>

      <div className="callout callout--info" style={{ marginTop: '1.5rem', marginBottom: '2rem' }}>
        <strong>New here?</strong> <Link to="/">Home</Link> introduces the platform; <Link to="/methodology#scenarios">Methodology</Link> has the matrix and
        rubric; <Link to="/evaluator">Start evaluation</Link> runs the quiz; <Link to="/resources">Resources</Link> links to official tool documentation.
      </div>

      <h2 className="section-title">Frequently Asked Questions</h2>
      <p className="section-subtitle">Common questions and answers about using Migration Tool Evaluator</p>

      <div className="faq-list">
        {FAQ_ITEMS.map((item) => (
          <details key={item.question} className="faq-item">
            <summary className="faq-summary">{item.question}</summary>
            <div className="faq-answer">{item.answer}</div>
          </details>
        ))}
      </div>
    </div>
  );
}
