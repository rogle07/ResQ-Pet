const COLOR_MAP: Record<string, string> = {
  pending: 'bg-brass-300/40 text-brass-600 dark:bg-brass-500/20 dark:text-brass-300',
  accepted: 'bg-moss-100 text-moss-700 dark:bg-moss-700/20 dark:text-moss-300',
  in_progress: 'bg-moss-100 text-moss-700 dark:bg-moss-700/20 dark:text-moss-300',
  completed: 'bg-moss-500 text-bone',
  cancelled: 'bg-mist-300/50 text-mist-700 dark:bg-mist-700/30 dark:text-mist-300',
  rejected: 'bg-coral-100 text-coral-600 dark:bg-coral-950/50 dark:text-coral-400',
  active: 'bg-moss-100 text-moss-700 dark:bg-moss-700/20 dark:text-moss-300',
  approved: 'bg-moss-500 text-bone',
  under_review: 'bg-brass-300/40 text-brass-600 dark:bg-brass-500/20 dark:text-brass-300',
  unclaimed: 'bg-brass-300/40 text-brass-600 dark:bg-brass-500/20 dark:text-brass-300',
  matched: 'bg-moss-100 text-moss-700 dark:bg-moss-700/20 dark:text-moss-300',
  claimed: 'bg-moss-500 text-bone',
  closed: 'bg-mist-300/50 text-mist-700 dark:bg-mist-700/30 dark:text-mist-300',
  critical: 'bg-coral-500 text-bone',
  high: 'bg-coral-100 text-coral-600 dark:bg-coral-950/50 dark:text-coral-400',
  medium: 'bg-brass-300/40 text-brass-600 dark:bg-brass-500/20 dark:text-brass-300',
  low: 'bg-mist-300/40 text-mist-700 dark:bg-mist-700/30 dark:text-mist-300',
};

const StatusBadge = ({ status }: { status: string }) => (
  <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium capitalize ${COLOR_MAP[status] || 'bg-mist-300/40 text-mist-700 dark:bg-mist-700/30 dark:text-mist-300'}`}>
    {status.replace('_', ' ')}
  </span>
);

export default StatusBadge;
