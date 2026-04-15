const siteName = 'Migration Tool Evaluator';

const defaultDesc =
  'Migration Tool Evaluator — compare pgLoader, MongoDB Relational Migrator, and mongify on realistic MySQL exports with a transparent rubric and reproducible runs.';

export const defaultPageMeta = {
  title: siteName,
  description: defaultDesc,
};

export function pageTitle(page: string): string {
  return `${page} · ${siteName}`;
}

/** Per-route document title and meta description (SEO / unfurls). */
export const routeMetaMap: Record<string, { title: string; description: string }> = {
  '/': {
    title: siteName,
    description:
      'Compare MySQL→PostgreSQL and MySQL→MongoDB migration tools with empirical scores, a clear rubric, and a short guided evaluator.',
  },
  '/methodology': {
    title: pageTitle('Methodology'),
    description:
      'Weighted 40-criterion rubric, workload matrix, how quiz compatibility relates to fixed scores, and experiment scope.',
  },
  '/compare': {
    title: pageTitle('Compare tools'),
    description:
      'Side-by-side category scores and final weighted results from the same migration campaign on all tested workloads.',
  },
  '/comparison': {
    title: pageTitle('Compare tools'),
    description:
      'Interactive comparison: charts, category heatmap, and optional weight sliders on top of the benchmark rubric scores.',
  },
  '/results': {
    title: pageTitle('Your results'),
    description:
      'Quiz recommendation with fixed rubric scores for pgLoader, MongoDB Relational Migrator, and mongify after completing the evaluator.',
  },
  '/login': {
    title: pageTitle('Log in'),
    description: 'Sign-in placeholder for the Migration Tool Evaluator; the site works without accounts using session-only quiz results.',
  },
  '/evaluator': {
    title: pageTitle('Evaluator'),
    description:
      'Short quiz for a personalized tool pick; results show fixed rubric scores and a compatibility-style match.',
  },
  '/resources': {
    title: pageTitle('Resources'),
    description:
      'Official documentation links for pgLoader, MongoDB Relational Migrator, and mongify, plus links into this project’s methodology and comparison pages.',
  },
  '/help': {
    title: pageTitle('Help Center'),
    description:
      'FAQs: what Migration Tool Evaluator is, which tools are compared, how recommendations are generated, and chat accuracy.',
  },
};
