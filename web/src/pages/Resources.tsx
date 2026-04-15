import { Link } from 'react-router-dom';

const DOC_LINKS = [
  {
    id: 'pgloader',
    name: 'pgLoader',
    subtitle: 'Documentation and learning resources',
    links: [
      { label: 'Official documentation', href: 'https://pgloader.readthedocs.io/' },
      { label: 'Project repository', href: 'https://github.com/dimitri/pgloader' },
    ],
    internal: { label: 'Scenario matrix & rubric', to: '/methodology#scenarios' as const },
  },
  {
    id: 'mrm',
    name: 'MongoDB Relational Migrator',
    subtitle: 'Documentation and learning resources',
    links: [
      { label: 'MongoDB Relational Migrator docs', href: 'https://www.mongodb.com/docs/relational-migrator/' },
      { label: 'MongoDB product hub', href: 'https://www.mongodb.com/products/relational-migrator' },
    ],
    internal: { label: 'Methodology & matrix', to: '/methodology' as const },
  },
  {
    id: 'mongify',
    name: 'mongify',
    subtitle: 'Documentation and learning resources',
    links: [
      { label: 'mongify on GitHub', href: 'https://github.com/anlek/mongify' },
      { label: 'Ruby gem page', href: 'https://rubygems.org/gems/mongify' },
    ],
    internal: { label: 'Scores & comparison', to: '/compare' as const },
  },
];

export function Resources() {
  return (
    <div className="section page-pad">
      <h1 className="page-title">Resources</h1>
      <p className="page-lead">
        Explore documentation and resources for each migration tool covered by this evaluator — plus in-app methodology and comparison pages; rerun steps live in the
        repository README.
      </p>

      <p className="section-subtitle" style={{ marginTop: '1.25rem', textAlign: 'center' }}>
        <Link to="/compare">pgLoader</Link>
        <span aria-hidden> · </span>
        <Link to="/compare">MRM</Link>
        <span aria-hidden> · </span>
        <Link to="/compare">mongify</Link>
      </p>

      <div className="features-grid" style={{ marginTop: '2rem' }}>
        {DOC_LINKS.map((tool) => (
          <div key={tool.id} className="feature-card">
            <h3 className="section-title" style={{ fontSize: '1.05rem', marginBottom: '0.35rem' }}>
              {tool.name}
            </h3>
            <p className="section-subtitle" style={{ marginBottom: '0.75rem' }}>
              {tool.subtitle}
            </p>
            <ul className="prose-list resources-link-list">
              {tool.links.map((l) => (
                <li key={l.href}>
                  <a href={l.href} target="_blank" rel="noopener noreferrer" className="artifact-link">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
            <p style={{ marginTop: '1rem' }}>
              <Link to={tool.internal.to} className="btn btn-secondary" style={{ width: '100%', textAlign: 'center', display: 'block' }}>
                {tool.internal.label} →
              </Link>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
