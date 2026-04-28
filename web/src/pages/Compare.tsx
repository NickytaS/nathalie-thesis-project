import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  compareCategoryRows,
  tools,
  weightedScoreFromPercents,
  type ToolProfile,
} from '../data/thesis';

const DEFAULT_PCTS = [30, 30, 10, 20, 10];

const TOOL_COLORS = ['#3d8f6f', '#b8a3ff', '#ffb04a'] as const;

const SHORT_LABELS = ['Schema', 'Data', 'Transform', 'Perf', 'Ops'];

function heatClass(v: number): string {
  if (v >= 4.2) return 'heatmap-cell heatmap-cell--high';
  if (v >= 3.2) return 'heatmap-cell heatmap-cell--mid';
  return 'heatmap-cell heatmap-cell--low';
}

function CategoryRadar({ profiles }: { profiles: ToolProfile[] }) {
  const cx = 100;
  const cy = 100;
  const rMax = 58;
  const n = 5;
  const angles = useMemo(
    () => Array.from({ length: n }, (_, i) => (-Math.PI / 2 + (i * 2 * Math.PI) / n) as number),
    [],
  );

  function ringPoints(r: number): string {
    return angles
      .map((ang) => `${cx + r * Math.cos(ang)},${cy + r * Math.sin(ang)}`)
      .join(' ');
  }

  function toolPolygon(tool: ToolProfile): string {
    return angles
      .map((ang, i) => {
        const key = compareCategoryRows[i]!.key;
        const score = tool[key];
        const rr = (score / 5) * rMax;
        return `${cx + rr * Math.cos(ang)},${cy + rr * Math.sin(ang)}`;
      })
      .join(' ');
  }

  const labelR = rMax + 22;
  return (
    <svg className="compare-radar-svg" viewBox="0 0 220 220" aria-label="Radar chart of category scores (0–5)">
      <g opacity={0.35}>
        <polygon points={ringPoints(rMax)} fill="none" stroke="var(--border-color)" strokeWidth={1} />
        <polygon points={ringPoints(rMax * 0.5)} fill="none" stroke="var(--border-color)" strokeDasharray="4 4" />
      </g>
      {profiles.map((t, ti) => (
        <polygon
          key={t.id}
          points={toolPolygon(t)}
          fill={TOOL_COLORS[ti]}
          fillOpacity={0.18}
          stroke={TOOL_COLORS[ti]}
          strokeWidth={1.4}
        />
      ))}
      {angles.map((ang, i) => {
        const lx = cx + labelR * Math.cos(ang);
        const ly = cy + labelR * Math.sin(ang);
        return (
          <text
            key={SHORT_LABELS[i]}
            x={lx}
            y={ly}
            textAnchor="middle"
            dominantBaseline="middle"
            className="compare-radar-label"
          >
            {SHORT_LABELS[i]}
          </text>
        );
      })}
    </svg>
  );
}

export function Compare() {
  const pg = tools.pgloader;
  const mrm = tools.mrm;
  const mf = tools.mongify;
  const profiles = [pg, mrm, mf];

  const [pcts, setPcts] = useState<number[]>(() => [...DEFAULT_PCTS]);

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

  const totalPct = pcts.reduce((a, b) => a + b, 0);
  const weightsValid = totalPct === 100;

  const customScores = weightsValid
    ? {
        pg: weightedScoreFromPercents(pg, pcts),
        mrm: weightedScoreFromPercents(mrm, pcts),
        mf: weightedScoreFromPercents(mf, pcts),
      }
    : null;

  const barMax = 5;
  const pieTotal = pg.score + mrm.score + mf.score;
  const pieSegs = [
    { tool: pg, pct: (pg.score / pieTotal) * 100, color: TOOL_COLORS[0] },
    { tool: mrm, pct: (mrm.score / pieTotal) * 100, color: TOOL_COLORS[1] },
    { tool: mf, pct: (mf.score / pieTotal) * 100, color: TOOL_COLORS[2] },
  ];
  let pieAcc = 0;
  const pieGradient = pieSegs
    .map((s) => {
      const start = pieAcc;
      pieAcc += s.pct;
      return `${s.color} ${start}% ${pieAcc}%`;
    })
    .join(', ');

  function setPct(i: number, v: number) {
    setPcts((prev) => {
      const next = [...prev];
      next[i] = Math.max(0, Math.min(100, v));
      return next;
    });
  }

  return (
    <div className="section page-pad">
      <h1 className="page-title">Compare tools</h1>
      <p className="page-lead">Category scores and final weighted results from the benchmark runs.</p>

      <div className="tools-grid" style={{ marginTop: '1.5rem' }}>
        <div className="tool-card pgloader">
          <h3>{pg.name}</h3>
          <p className="tool-type">{pg.path}</p>
          <div className="tool-score">
            {pg.score} <span>/ 5.0</span>
          </div>
          <div className="tool-details">
            <div>{'\u2713'} Strong schema + speed on PostgreSQL</div>
            <div>{'\u2713'} 3/3 PASS in scenario matrix</div>
            <div>○ PostgreSQL target only</div>
          </div>
        </div>
        <div className="tool-card mrm">
          <h3>{mrm.name}</h3>
          <p className="tool-type">{mrm.path}</p>
          <div className="tool-score">
            {mrm.score} <span>/ 5.0</span>
          </div>
          <div className="tool-details">
            <div>{'\u2713'} GUI mapping + audit trail</div>
            <div>{'\u2713'} 3/3 PASS</div>
            <div>○ Heavier operational footprint</div>
          </div>
        </div>
        <div className="tool-card mongify">
          <h3>{mf.name}</h3>
          <p className="tool-type">{mf.path}</p>
          <div className="tool-score">
            {mf.score} <span>/ 5.0</span>
          </div>
          <div className="tool-details">
            <div>{'\u2713'} Highest Mongo transform score</div>
            <div>○ 2/3 PASS (one workload)</div>
            <div>○ Idempotency requires care</div>
          </div>
        </div>
      </div>

      <div className="compare-dashboard compare-panel" style={{ marginTop: '2.25rem' }}>
        <h2 className="compare-dashboard__title">Interactive comparison dashboard</h2>
        <p className="compare-dashboard__lead">
          Explore the same rubric categories visually. Sliders re-weight categories for a hypothetical overall (category scores are still the fixed benchmark
          values; only the weights change).
        </p>

        <div className="compare-charts-grid">
          <div className="compare-chart-card">
            <h3 className="compare-chart-card__title">Category radar</h3>
            <CategoryRadar profiles={profiles} />
          </div>
          <div className="compare-chart-card">
            <h3 className="compare-chart-card__title">Overall score (rubric)</h3>
            <div className="compare-bar-list" role="img" aria-label="Bar chart of overall scores">
              {profiles.map((t, i) => (
                <div key={t.id} className="compare-bar-row">
                  <span className="compare-bar-name">{t.shortLogo}</span>
                  <div className="compare-bar-track">
                    <div
                      className="compare-bar-fill"
                      style={{
                        width: `${(t.score / barMax) * 100}%`,
                        background: TOOL_COLORS[i],
                      }}
                    />
                  </div>
                  <span className="compare-bar-val">{t.score.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="compare-chart-card">
            <h3 className="compare-chart-card__title">Score distribution</h3>
            <div className="compare-pie-wrap">
              <div className="compare-pie" style={{ background: `conic-gradient(${pieGradient})` }} />
              <ul className="compare-pie-legend">
                {pieSegs.map((s) => (
                  <li key={s.tool.id}>
                    <span className="compare-pie-dot" style={{ background: s.color }} />
                    {s.tool.name}: {Math.round(s.pct)}%
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="compare-weights">
          <div className="compare-weights__head">
            <h3 className="compare-chart-card__title" style={{ marginBottom: 0 }}>
              Adjust category weights
            </h3>
            <button type="button" className="btn btn-secondary compare-reset-btn" onClick={() => setPcts([...DEFAULT_PCTS])}>
              Reset
            </button>
          </div>
          {compareCategoryRows.map((row, i) => (
            <label key={row.key} className="weight-row">
              <span className="weight-row__label">{row.label}</span>
              <input
                type="range"
                min={0}
                max={100}
                value={pcts[i]}
                onChange={(e) => setPct(i, Number(e.target.value))}
                className="weight-slider"
              />
              <span className="weight-row__pct">{pcts[i]}%</span>
            </label>
          ))}
          <p className={`weight-total ${weightsValid ? '' : 'weight-total--bad'}`}>
            Total weight: {totalPct}% {weightsValid ? '(100% — custom overall below matches these weights)' : '(should be 100%)'}
          </p>
        </div>

        {customScores && (
          <div className="compare-custom-scores">
            <h3 className="compare-chart-card__title">Weighted overall (custom weights)</h3>
            <div className="weighted-score-cards">
              <div className="weighted-score-card" style={{ borderColor: TOOL_COLORS[0] }}>
                <span className="weighted-score-card__name">{pg.name}</span>
                <span className="weighted-score-card__val">{customScores.pg.toFixed(2)}</span>
              </div>
              <div className="weighted-score-card" style={{ borderColor: TOOL_COLORS[1] }}>
                <span className="weighted-score-card__name">{mrm.name}</span>
                <span className="weighted-score-card__val">{customScores.mrm.toFixed(2)}</span>
              </div>
              <div className="weighted-score-card" style={{ borderColor: TOOL_COLORS[2] }}>
                <span className="weighted-score-card__name">{mf.name}</span>
                <span className="weighted-score-card__val">{customScores.mf.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}

        <h3 className="compare-chart-card__title" style={{ marginTop: '1.75rem' }}>
          Criteria heatmap
        </h3>
        <div className="heatmap-scroll">
          <table className="heatmap-table">
            <thead>
              <tr>
                <th>Tool</th>
                {compareCategoryRows.map((r, i) => (
                  <th key={r.key}>{SHORT_LABELS[i]}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {profiles.map((t, ti) => (
                <tr key={t.id}>
                  <th scope="row">
                    <span className="heatmap-tool" style={{ color: TOOL_COLORS[ti] }}>
                      {t.name}
                    </span>
                  </th>
                  {compareCategoryRows.map((r) => (
                    <td key={r.key} className={heatClass(t[r.key])}>
                      {t[r.key].toFixed(1)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
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
              <strong>Final (weighted)</strong>
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
