interface DashboardPlaceholderProps {
  title: string;
  description: string;
}

/**
 * Temporary content shell for role dashboard pages. Phase 6 replaces each of
 * these with fully built-out views (tables, forms, live maps, charts).
 */
const DashboardPlaceholder = ({ title, description }: DashboardPlaceholderProps) => (
  <div className="card">
    <h2 className="text-lg font-semibold text-slate-800 dark:text-bone">{title}</h2>
    <p className="mt-2 max-w-lg text-sm text-ink/60 dark:text-bone/60">{description}</p>
    <p className="mt-4 font-mono text-xs text-mist-500">— coming in Phase 6 —</p>
  </div>
);

export default DashboardPlaceholder;
