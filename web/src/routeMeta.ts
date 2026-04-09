const siteName = 'Migration Tool Evaluator';

const defaultDesc =
  'Thesis decision-support prototype: compare pgLoader, MongoDB Relational Migrator, and mongify on real WordPress, WooCommerce, and ERPNext MySQL data.';

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
      'Compare MySQL→PostgreSQL and MySQL→MongoDB migration tools with empirical scores, scenario matrix, and a six-question evaluator grounded in thesis experiments.',
  },
  '/methodology': {
    title: pageTitle('Methodology'),
    description:
      'Weighted 35-criterion rubric across five categories, how quiz compatibility relates to thesis scores, and experiment scope.',
  },
  '/evidence': {
    title: pageTitle('Evidence'),
    description:
      'Pass/fail scenario matrix and weighted thesis scores for pgLoader, MRM, and mongify; links to repository artifacts.',
  },
  '/compare': {
    title: pageTitle('Compare tools'),
    description:
      'Side-by-side category scores and final weighted results from the thesis migration campaign on blog_db, ecommerce_db, and erp_db.',
  },
  '/evaluator': {
    title: pageTitle('Evaluator'),
    description:
      'Six-question quiz for a personalized tool pick; results show thesis category scores and compatibility match.',
  },
  '/reproducibility': {
    title: pageTitle('Reproduce experiments'),
    description:
      'Docker and Python commands from the thesis README to re-run migrations and scripts/analyze_migration.py.',
  },
};
