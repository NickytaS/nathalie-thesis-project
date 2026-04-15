import { Link } from 'react-router-dom';
import { tools } from '../data/thesis';

export function Home() {
  const pg = tools.pgloader;
  const mrm = tools.mrm;
  const mf = tools.mongify;

  return (
    <>
      <section className="hero">
        <div className="floating-orb" aria-hidden />
        <div className="floating-orb-2" aria-hidden />
        <h1>
          Choose the right <span>migration tool</span>
        </h1>
        <p>
          Make confident decisions with data-driven insights. Compare <strong>pgLoader</strong>, <strong>MongoDB Relational Migrator (MRM)</strong>, and{' '}
          <strong>mongify</strong> based on your migration goals — using a transparent rubric and real exported workloads you can verify from this project.
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
        <h2 className="section-title">Why Migration Tool Evaluator?</h2>
        <p className="section-subtitle">
          Our decision-support platform combines research-backed evaluation with practical tools — so you can move from benchmark results to a clear tool choice without
          getting lost in raw logs on day one.
        </p>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon blue">◎</div>
            <h3>Smart recommendations</h3>
            <p>Get a personalized tool suggestion based on your priorities — aligned with the same empirical scores published across the site.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon green">▤</div>
            <h3>Data-driven insights</h3>
            <p>Side-by-side scores, a pass/fail matrix, and category breakdowns grounded in automated checks — not opinion-only rankings.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon orange">⚖</div>
            <h3>Proven methodology</h3>
            <p>A declared weighted framework and full rubric document exactly how each tool was judged, so you can defend or revisit the results.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon purple">↻</div>
            <h3>Comprehensive analysis</h3>
            <p>A focused six-question assessment captures your context quickly, while Methodology and Compare hold the full depth when you need it.</p>
          </div>
        </div>
      </section>

      <section className="section">
        <h2 className="section-title">Compared migration tools</h2>
        <p className="section-subtitle">
          In-depth comparison of three established MySQL migration paths — relational and document targets — evaluated on the same sources and scoring model.
        </p>
        <div className="tools-grid home-tools-grid" style={{ marginTop: '1.5rem' }}>
          <div className="tool-card pgloader">
            <div className="tool-logo">{pg.shortLogo}</div>
            <h3>{pg.name}</h3>
            <p className="tool-type">{pg.path}</p>
            <div className="tool-score">
              {pg.score} <span>/ 5.0</span>
            </div>
            <p className="home-tool-teaser">PostgreSQL target — strong schema fidelity and speed in our benchmark.</p>
          </div>
          <div className="tool-card mrm">
            <div className="tool-logo">{mrm.shortLogo}</div>
            <h3>{mrm.name}</h3>
            <p className="tool-type">{mrm.path}</p>
            <div className="tool-score">
              {mrm.score} <span>/ 5.0</span>
            </div>
            <p className="home-tool-teaser">MongoDB target — guided mapping and governance-friendly workflow.</p>
          </div>
          <div className="tool-card mongify">
            <div className="tool-logo">{mf.shortLogo}</div>
            <h3>{mf.name}</h3>
            <p className="tool-type">{mf.path}</p>
            <div className="tool-score">
              {mf.score} <span>/ 5.0</span>
            </div>
            <p className="home-tool-teaser">MongoDB target — CLI-oriented with strong document modeling; plan for clean re-runs.</p>
          </div>
        </div>
        <p className="framework-more" style={{ marginTop: '1.25rem', textAlign: 'center' }}>
          <Link to="/compare">Open full comparison →</Link>
        </p>
      </section>

      <section className="section">
        <div className="cta-section">
          <h2>Ready to find your perfect migration tool?</h2>
          <p>
            Take our six-question assessment and get a personalized recommendation in minutes — with fixed rubric scores shown for context. Deep dive anytime on{' '}
            <Link to="/methodology">Methodology</Link> or <Link to="/resources">Resources</Link>.
          </p>
          <div className="hero-buttons" style={{ marginTop: '0.25rem' }}>
            <Link to="/evaluator" className="btn btn-primary">
              Start evaluation
            </Link>
            <Link to="/compare" className="btn btn-secondary">
              Compare tools
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
