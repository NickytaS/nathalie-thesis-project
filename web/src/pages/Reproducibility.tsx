import { CopyCodeBlock } from '../components/CopyCodeBlock';
import { repoPaths } from '../data/thesis';

const composeUp = 'docker-compose up -d';
const analyze = 'python scripts/analyze_migration.py';

export function Reproducibility() {
  return (
    <div className="section page-pad">
      <h1 className="page-title">Reproduce the experiments</h1>
      <p className="page-lead">
        Commands and paths match the repository <code className="inline-code">{repoPaths.readme}</code>. Run from the <strong>project root</strong>{' '}
        (parent of <code className="inline-code">scripts/</code> and <code className="inline-code">docker-compose.yml</code>).
      </p>

      <h2 className="section-title" style={{ marginTop: '2rem' }}>
        Prerequisites
      </h2>
      <ul className="prose-list">
        <li>
          <strong>Docker Desktop</strong> (or compatible engine) running — used for MySQL, PostgreSQL, and MongoDB as in the thesis setup.
        </li>
        <li>
          <strong>Python 3</strong> with dependencies from your environment (e.g. <code className="inline-code">mysql-connector-python</code>,{' '}
          <code className="inline-code">psycopg2</code>, <code className="inline-code">pymongo</code>) for <code className="inline-code">{repoPaths.analyzeScript}</code>.
        </li>
      </ul>

      <h2 className="section-title" style={{ marginTop: '2rem' }}>
        Commands
      </h2>
      <CopyCodeBlock label="Start databases" code={composeUp} id="cmd-compose" />
      <CopyCodeBlock label="Run automated analysis" code={analyze} id="cmd-analyze" />

      <p className="page-lead" style={{ marginTop: '1.5rem' }}>
        Outputs are written to <code className="inline-code">{repoPaths.latestResults}</code> and the narrative report{' '}
        <code className="inline-code">{repoPaths.thesisReport}</code>. Tool configs live under <code className="inline-code">{repoPaths.pgloaderConfig}</code> and{' '}
        <code className="inline-code">{repoPaths.mongifyConfig}</code>.
      </p>
    </div>
  );
}
