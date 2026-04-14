import { Link } from 'react-router-dom';
import { FRAMEWORK, RUBRIC_CATEGORIES } from '../data/thesis';

export function Methodology() {
  return (
    <div className="section page-pad">
      <h1 className="page-title">Methodology</h1>
      <p className="page-lead">
        The thesis compares three heterogeneous migration tools using a weighted rubric. Category weights and the full criterion list below match the published framework ({FRAMEWORK.criteriaCount} checks across five categories, 100%).
      </p>

      <h2 className="section-title" style={{ marginTop: '2.5rem' }}>
        Scoring structure
      </h2>
      <p className="section-subtitle">Weights sum to 100%</p>
      <table className="comparison-table" style={{ marginTop: '1rem' }}>
        <thead>
          <tr>
            <th>Category</th>
            <th>Weight</th>
            <th>Role</th>
          </tr>
        </thead>
        <tbody>
          {FRAMEWORK.categories.map((c) => (
            <tr key={c.name}>
              <td>{c.name}</td>
              <td>{(c.weight * 100).toFixed(0)}%</td>
              <td>{c.note}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 className="section-title rubric-anchor" style={{ marginTop: '2.5rem' }} id="rubric">
        Full rubric ({FRAMEWORK.criteriaCount} criteria)
      </h2>
      <p className="section-subtitle">Grouped by category — same labels used when deriving thesis scores</p>
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
          Source engine: MySQL 8 (Docker). Datasets: <code className="inline-code">blog_db</code> (WordPress, 1NF-oriented),{' '}
          <code className="inline-code">ecommerce_db</code> (WooCommerce, 2NF/3NF), <code className="inline-code">erp_db</code> (ERPNext, 3NF-oriented
          Doctypes — referential rules in Frappe, not necessarily MySQL <code className="inline-code">FOREIGN KEY</code> constraints).
        </li>
        <li>Targets: PostgreSQL 15 (pgLoader) and MongoDB 6 (MRM, mongify).</li>
        <li>Validation: automated checks (e.g. row counts, structural expectations) via the project analysis script.</li>
        <li>Threats to validity: single hardware profile, fixed tool versions, and GUI-driven steps for MRM — document these in your thesis.</li>
      </ul>

      <h2 className="section-title" style={{ marginTop: '2.5rem' }}>
        How the web quiz relates to thesis scores
      </h2>
      <div className="callout callout--info">
        <p>
          <strong>Quiz “compatibility” is not the weighted average.</strong> The six-question quiz awards points for priorities (target DB, FK importance,
          complexity, speed, UI preference, document modeling). The highest point total picks a <em>recommended</em> tool; the percentage shown is how
          much of that tool’s maximum quiz points you captured.
        </p>
        <p style={{ marginTop: '0.75rem' }}>
          The <strong>thesis category scores</strong> (Schema, Data, Transform, Performance, Operational) and the <strong>overall 0–5 scores</strong>{' '}
          on the evaluator results and Compare pages come from the rubric applied to experiments — they are <strong>fixed empirical results</strong>, not
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
        OpenAI API via a small local server so your key is not exposed in the browser; replies follow a thesis-grounded system prompt. If the API is
        unavailable, the widget falls back to short keyword rules. Conversations are not stored on a server beyond what the model provider retains per
        their policy. For methodology detail use this page and the <Link to="/evidence">Evidence</Link> tab; for a guided pick use the{' '}
        <Link to="/evaluator">Evaluator</Link> quiz.
      </p>
    </div>
  );
}
