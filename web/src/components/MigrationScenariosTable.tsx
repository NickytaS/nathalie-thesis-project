import { migrationScenarios } from '../data/thesis';

export function MigrationScenariosTable() {
  const totals = {
    pg: migrationScenarios.filter((r) => r.pgLoader.status === 'PASS').length,
    mrm: migrationScenarios.filter((r) => r.mrm.status === 'PASS').length,
    mfy: migrationScenarios.filter((r) => r.mongify.status === 'PASS').length,
  };
  const n = migrationScenarios.length;

  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            <th>Database</th>
            <th>System</th>
            <th>Normal form</th>
            <th className="num">Tables</th>
            <th className="num">Rows</th>
            <th className="num accent-pg">pgLoader</th>
            <th className="num accent-mrm">MRM</th>
            <th className="num accent-mfy">Mongify</th>
          </tr>
        </thead>
        <tbody>
          {migrationScenarios.map((row) => (
            <tr key={row.database}>
              <td>{row.database}</td>
              <td>{row.system}</td>
              <td>
                <span className={`nf ${row.normalForm.className}`}>{row.normalForm.label}</span>
              </td>
              <td className="num">{row.tables}</td>
              <td className="num">{row.rows.toLocaleString()}</td>
              {(['pgLoader', 'mrm', 'mongify'] as const).map((tool) => {
                const cell = row[tool];
                return (
                  <td key={tool} className="num">
                    <span className={cell.status === 'PASS' ? 'pass' : 'fail'}>{cell.status}</span>
                    <span className="sub">{cell.detail}</span>
                  </td>
                );
              })}
            </tr>
          ))}
          <tr className="total-row">
            <td colSpan={5}>Total</td>
            <td className="num strong accent-pg">
              {totals.pg}/{n} PASS
            </td>
            <td className="num strong accent-mrm">
              {totals.mrm}/{n} PASS
            </td>
            <td className="num strong accent-mfy">
              {totals.mfy}/{n} PASS
            </td>
          </tr>
        </tbody>
      </table>
      <p className="table-footnote">
        Mongify on blog_db: duplicate documents on re-run (idempotency) — collections not dropped before append.
      </p>
    </div>
  );
}
