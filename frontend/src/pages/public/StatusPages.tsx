import { Link } from 'react-router-dom';

export const Unauthorized = () => (
  <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-bone px-6 text-center dark:bg-ink">
    <span className="signal-dot text-coral-500" />
    <h1 className="font-display text-2xl font-semibold">You don't have access to this page</h1>
    <p className="max-w-sm text-sm text-ink/60 dark:text-bone/60">
      This area is restricted to a different account role. If that seems wrong, contact support.
    </p>
    <Link to="/" className="btn-primary mt-2">Back to home</Link>
  </div>
);

export const NotFound = () => (
  <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-bone px-6 text-center dark:bg-ink">
    <span className="font-mono text-sm text-mist-500">404</span>
    <h1 className="font-display text-2xl font-semibold">This trail goes cold</h1>
    <p className="max-w-sm text-sm text-ink/60 dark:text-bone/60">
      The page you're looking for doesn't exist or may have moved.
    </p>
    <Link to="/" className="btn-primary mt-2">Back to home</Link>
  </div>
);
