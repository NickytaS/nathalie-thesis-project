import { Link } from 'react-router-dom';
import { MigrationScenariosTable } from '../components/MigrationScenariosTable';
import { FRAMEWORK } from '../data/thesis';

export function Home() {
  return (
    <>
      <section className="hero">
        <div className="floating-orb" aria-hidden />
        <div className="floating-orb-2" aria-hidden />
        <div className="hero-label">Thesis research</div>
        <h1>
          Performance and data fidelity evaluation
          <br />
          of <span>database migration tools</span>
        </h1>
        <p>
          Comparative study of MySQL → PostgreSQL and MySQL → MongoDB migrations using real WordPress, WooCommerce, and ERPNext datasets.
          Weighted scoring over {FRAMEWORK.criteriaCount} criteria.
        </p>
        <div className="hero-buttons">
          <Link to="/evaluator" className="btn btn-primary">
            Start evaluation
          </Link>
          <Link to="/compare" className="btn btn-secondary">
            Compare tools
          </Link>
        </div>
      </section>

      <section className="section">
        <h2 className="section-title">Why this site exists</h2>
        <p className="section-subtitle">
          Transparent reporting of experiments — 9 migration scenarios (3 tools × 3 databases), reproducible via Docker and scripts in this repo
        </p>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon blue">◎</div>
            <h3>Decision support</h3>
            <p>Six-question quiz maps your priorities to a tool, grounded in empirical scores from the thesis.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon green">▤</div>
            <h3>Real datasets</h3>
            <p>68 tables and 2,108 rows across blog_db, ecommerce_db, and erp_db — not synthetic micro-benchmarks only.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon orange">⚖</div>
            <h3>Weighted framework</h3>
            <p>Five categories with declared weights; category scores trace back to observations and automated checks.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon purple">↻</div>
            <h3>Reproducibility</h3>
            <p>Commands and paths to re-run migrations and analysis are documented on the Reproduce page.</p>
          </div>
        </div>
      </section>

      <section className="section">
        <h2 className="section-title">Nine migration scenarios</h2>
        <p className="section-subtitle">Each tool ran against each database; outcomes below match the thesis experiment log</p>
        <MigrationScenariosTable />
      </section>

      <section className="section">
        <h2 className="section-title">Evaluation framework</h2>
        <p className="section-subtitle">{FRAMEWORK.criteriaCount} criteria across five weighted categories</p>
        <div className="framework-cards">
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
        <p className="framework-formula">
          Final score = Σ (category score × weight). pgLoader uses MongoDB transformation criteria only where applicable; see methodology
          for normalization details.
        </p>
        <p className="framework-more">
          <Link to="/methodology#rubric">Full rubric: all {FRAMEWORK.criteriaCount} criteria →</Link>
        </p>
      </section>

      <section className="section">
        <div className="cta-section">
          <h2>Try the quiz</h2>
          <p>Get a recommendation aligned with your target engine, schema complexity, and operational preferences.</p>
          <Link to="/evaluator" className="btn btn-primary">
            Open evaluator →
          </Link>
        </div>
      </section>
    </>
  );
}
