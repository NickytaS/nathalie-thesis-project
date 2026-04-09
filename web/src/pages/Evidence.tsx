import { MigrationScenariosTable } from '../components/MigrationScenariosTable';
import { repoBlobUrl, repoPaths, tools } from '../data/thesis';

function ArtifactLink({ path, label }: { path: string; label: string }) {
  const href = repoBlobUrl(path);
  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className="artifact-link">
        {label}
      </a>
    );
  }
  return (
    <span className="artifact-path">
      <code className="inline-code">{path}</code>
    </span>
  );
}

export function Evidence() {
  return (
    <div className="section page-pad">
      <h1 className="page-title">Empirical evidence</h1>
      <p className="page-lead">
        Summary of pass/fail and parity checks from the migration campaign. Numeric scores on the Compare page come from the rubric applied to these
        observations.
      </p>

      <h2 className="section-title" style={{ marginTop: '2rem' }}>
        Scenario matrix
      </h2>
      <MigrationScenariosTable />

      <h2 className="section-title" style={{ marginTop: '2.5rem' }}>
        Repository artifacts
      </h2>
      <p className="page-lead" style={{ maxWidth: '720px' }}>
        These filenames match the thesis repository layout. If <code className="inline-code">VITE_REPO_BASE_URL</code> is set at build time (e.g. GitHub
        repository root), links open the corresponding files; otherwise copy the paths after cloning the repo.
      </p>
      <ul className="prose-list artifact-list">
        <li>
          Latest analysis log: <ArtifactLink path={repoPaths.latestResults} label={repoPaths.latestResults} />
        </li>
        <li>
          Written report: <ArtifactLink path={repoPaths.thesisReport} label={repoPaths.thesisReport} />
        </li>
        <li>
          Entry documentation: <ArtifactLink path={repoPaths.readme} label={repoPaths.readme} />
        </li>
      </ul>

      <h2 className="section-title" style={{ marginTop: '2.5rem' }}>
        Overall thesis scores (weighted)
      </h2>
      <div className="tools-grid" style={{ marginTop: '1rem' }}>
        {Object.values(tools).map((t) => (
          <div key={t.id} className={`tool-card ${t.id}`}>
            <div className="tool-logo">{t.shortLogo}</div>
            <h3>{t.name}</h3>
            <p className="tool-type">{t.path}</p>
            <div className="tool-score">
              {t.score} <span>/ 5.0</span>
            </div>
          </div>
        ))}
      </div>

      <h2 className="section-title" style={{ marginTop: '2.5rem' }}>
        Notable finding
      </h2>
      <p className="page-lead" style={{ maxWidth: '720px' }}>
        Mongify’s blog_db failure is explained by duplicate documents when the migration was executed again without clearing target collections — treat this
        as an operational precondition in any production plan.
      </p>
    </div>
  );
}
