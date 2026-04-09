import { Link } from 'react-router-dom';
import { compareCategoryRows, tools } from '../data/thesis';

export function Compare() {
  const pg = tools.pgloader;
  const mrm = tools.mrm;
  const mf = tools.mongify;

  function bestInRow(key: (typeof compareCategoryRows)[number]['key']): 'pg' | 'mrm' | 'mf' | null {
    const vals = [
      { id: 'pg' as const, v: pg[key] },
      { id: 'mrm' as const, v: mrm[key] },
      { id: 'mf' as const, v: mf[key] },
    ];
    const max = Math.max(...vals.map((x) => x.v));
    const leaders = vals.filter((x) => x.v === max);
    return leaders.length === 1 ? leaders[0]!.id : null;
  }

  return (
    <div className="section page-pad">
      <h1 className="page-title">Compare tools</h1>
      <p className="page-lead">Category scores and final weighted results from the thesis experiments.</p>

      <div className="tools-grid" style={{ marginTop: '1.5rem' }}>
        <div className="tool-card pgloader">
          <div className="tool-logo">pgL</div>
          <h3>{pg.name}</h3>
          <p className="tool-type">{pg.path}</p>
          <div className="tool-score">
            {pg.score} <span>/ 5.0</span>
          </div>
          <div className="tool-details">
            <div>✓ Strong schema + speed on PostgreSQL</div>
            <div>✓ 3/3 PASS in scenario matrix</div>
            <div>○ PostgreSQL target only</div>
          </div>
        </div>
        <div className="tool-card mrm">
          <div className="tool-logo">MRM</div>
          <h3>{mrm.name}</h3>
          <p className="tool-type">{mrm.path}</p>
          <div className="tool-score">
            {mrm.score} <span>/ 5.0</span>
          </div>
          <div className="tool-details">
            <div>✓ GUI mapping + audit trail</div>
            <div>✓ 3/3 PASS</div>
            <div>○ Heavier operational footprint</div>
          </div>
        </div>
        <div className="tool-card mongify">
          <div className="tool-logo">mfy</div>
          <h3>{mf.name}</h3>
          <p className="tool-type">{mf.path}</p>
          <div className="tool-score">
            {mf.score} <span>/ 5.0</span>
          </div>
          <div className="tool-details">
            <div>✓ Highest Mongo transform score</div>
            <div>○ 2/3 PASS (blog_db)</div>
            <div>○ Idempotency requires care</div>
          </div>
        </div>
      </div>

      <table className="comparison-table" style={{ marginTop: '2rem' }}>
        <thead>
          <tr>
            <th>Category</th>
            <th>Weight</th>
            <th>pgLoader</th>
            <th>MRM</th>
            <th>mongify</th>
          </tr>
        </thead>
        <tbody>
          {compareCategoryRows.map((r) => {
            const b = bestInRow(r.key);
            return (
              <tr key={r.key}>
                <td>{r.label}</td>
                <td>{r.weight}</td>
                <td className={b === 'pg' ? 'highlight-cell' : undefined}>{pg[r.key]}</td>
                <td className={b === 'mrm' ? 'highlight-cell' : undefined}>{mrm[r.key]}</td>
                <td className={b === 'mf' ? 'highlight-cell' : undefined}>{mf[r.key]}</td>
              </tr>
            );
          })}
          <tr style={{ background: 'rgba(61, 143, 111, 0.1)' }}>
            <td>
              <strong>Final (thesis)</strong>
            </td>
            <td>
              <strong>100%</strong>
            </td>
            <td>
              <strong style={{ color: 'var(--accent-primary)' }}>{pg.score}</strong>
            </td>
            <td>
              <strong style={{ color: 'var(--accent-primary)' }}>{mrm.score}</strong>
            </td>
            <td>
              <strong style={{ color: 'var(--accent-primary)' }}>{mf.score}</strong>
            </td>
          </tr>
        </tbody>
      </table>

      <div style={{ textAlign: 'center', marginTop: '2rem' }}>
        <Link to="/evaluator" className="btn btn-primary">
          Get a personalized recommendation →
        </Link>
      </div>
    </div>
  );
}
