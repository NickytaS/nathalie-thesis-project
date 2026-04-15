import { Link } from 'react-router-dom';
import { MigrationScenariosTable } from '../components/MigrationScenariosTable';
import { FRAMEWORK, RUBRIC_CATEGORIES } from '../data/thesis';

export function Methodology() {
  return (
    <div className="section page-pad">
      <h1 className="page-title">Methodology</h1>
      <p className="page-lead">
        Three heterogeneous migration tools are compared with a weighted rubric. Category weights and the full criterion list match the published framework ({FRAMEWORK.criteriaCount} checks across five categories, 100%).
      </p>

      <h2 className="section-title" style={{ marginTop: '2.5rem' }} id="scenarios">
        Migration scenarios
      </h2>
      <p className="section-subtitle">
        Each tool was run against every MySQL export in the benchmark set; cells show pass/fail from automated parity checks. For weighted scores and category breakdowns, see{' '}
        <Link to="/compare">Compare</Link>; raw outputs and file paths are documented in the repository README.
      </p>
      <MigrationScenariosTable />

      <h2 className="section-title" style={{ marginTop: '2.5rem' }} id="framework">
        Evaluation framework
      </h2>
      <p className="section-subtitle">Category weights and how they roll up into the overall 0–5 score</p>
      <div className="framework-cards" style={{ marginTop: '1.25rem' }}>
        {FRAMEWORK.categories.map((c) => (
          <div key={c.name} className="framework-card">
            <div className="framework-card-weight" aria-hidden="true">
              <span className="framework-pct">{(c.weight * 100).toFixed(0)}%</span>
            </div>
            <div className="framework-card-content">
              <div className="framework-name">{c.name}</div>
              <p className="framework-note">{c.note}</p>
            </div>
          </div>
        ))}
      </div>
      <p className="framework-formula" style={{ marginTop: '1.25rem' }}>
        Final score = Σ (category score × weight). pgLoader uses MongoDB transformation criteria only where applicable; normalization is documented with the benchmark.
      </p>
      <p className="framework-more">
        <Link to="#rubric">Full rubric: all {FRAMEWORK.criteriaCount} criteria →</Link>
      </p>

      <h2 className="section-title rubric-anchor" style={{ marginTop: '2.5rem' }} id="rubric">
        Full rubric ({FRAMEWORK.criteriaCount} criteria)
      </h2>
      <p className="section-subtitle">Grouped by category — same labels used when deriving the published scores</p>
      <div className="rubric-grid">
        {RUBRIC_CATEGORIES.map((cat) => (
          <section key={cat.id} className="rubric-category-card" aria-labelledby={`rubric-${cat.id}`}>
            <header className="rubric-category-head">
              <h3 id={`rubric-${cat.id}`} className="rubric-category-title">
                {cat.name}
              </h3>
              <span className="rubric-category-weight">{(cat.weight * 100).toFixed(0)}%</span>
            </header>
            <ul className="rubric-criteria-list">
              {cat.criteria.map((crit) => (
                <li key={crit.id}>
                  <span className="rubric-crit-id">{crit.id}</span>
                  <div>
                    <div className="rubric-crit-label">{crit.label}</div>
                    <p className="rubric-crit-desc">{crit.description}</p>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <h2 className="section-title" style={{ marginTop: '2.5rem' }}>
        Scope boundaries
      </h2>
      <ul className="prose-list">
               <li>
          Source engine: MySQL 8 (Docker). Three downloadable exports in the repository span a content-heavy schema, a commerce-shaped schema, and an operations/ERP-style schema (filenames in the repo; normal-form mix from simpler to more normalized).
        </li>
        <li>Targets: PostgreSQL 15 (pgLoader) and MongoDB 6 (MRM, mongify).</li>
        <li>Validation: automated checks (e.g. row counts, structural expectations) via the project analysis script.</li>
        <li>Threats to validity: single hardware profile, fixed tool versions, and GUI-driven steps for MRM — note these when generalizing beyond this benchmark.</li>
      </ul>

      <h2 className="section-title" style={{ marginTop: '2.5rem' }} id="quiz-scores">
        How the web quiz relates to rubric scores
      </h2>
      <div className="callout callout--info">
        <p>
          <strong>Quiz “compatibility” is not the weighted average.</strong> The six-question quiz awards points for priorities (target DB, FK importance,
          complexity, speed, UI preference, document modeling). The highest point total picks a <em>recommended</em> tool; the percentage shown is how
          much of that tool’s maximum quiz points you captured.
        </p>
        <p style={{ marginTop: '0.75rem' }}>
          The <strong>category scores</strong> (Schema, Data, Transform, Performance, Operational) and the <strong>overall 0–5 scores</strong>{' '}
          on the evaluator results and Compare pages come from the rubric applied to the benchmark runs — they are <strong>fixed empirical results</strong>, not
          recalculated from your answers.
        </p>
        <ul className="prose-list" style={{ marginTop: '0.75rem' }}>
          <li>
            See the same explanation on the <Link to="/evaluator">Evaluator</Link> results screen after the quiz.
          </li>
        </ul>
      </div>

      <h2 className="section-title" style={{ marginTop: '2.5rem' }}>
        Assistant scope (chat widget)
      </h2>
      <p className="page-lead" style={{ maxWidth: '720px' }}>
        When <code className="inline-code">OPENAI_API_KEY</code> is configured (see <code className="inline-code">web/.env</code>), the chat uses the
        OpenAI API via a small local server so your key is not exposed in the browser; replies follow a benchmark-grounded system prompt. If the API is
        unavailable, the widget falls back to short keyword rules. Conversations are not stored on a server beyond what the model provider retains per
        their policy. For methodology detail use this page and <Link to="/compare">Compare</Link> for published scores; for a guided pick use the{' '}
        <Link to="/evaluator">Evaluator</Link> quiz.
      </p>
    </div>
  );
}
