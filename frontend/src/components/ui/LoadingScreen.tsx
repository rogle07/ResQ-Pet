const LoadingScreen = () => (
  <div className="flex min-h-screen items-center justify-center bg-bone dark:bg-ink">
    <div className="flex items-center gap-3 text-moss-600 dark:text-moss-300">
      <span className="signal-dot text-moss-500" />
      <span className="font-mono text-sm tracking-wide">locating signal…</span>
    </div>
  </div>
);

export default LoadingScreen;
