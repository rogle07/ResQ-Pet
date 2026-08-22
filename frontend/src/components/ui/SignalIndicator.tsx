import type { ReactNode } from 'react';

type SignalStatus = 'safe' | 'idle' | 'lost';

const STATUS_COLOR: Record<SignalStatus, string> = {
  safe: 'text-moss-500',
  idle: 'text-brass-500',
  lost: 'text-coral-500',
};

const STATUS_LABEL: Record<SignalStatus, string> = {
  safe: 'Safe',
  idle: 'Idle',
  lost: 'Lost',
};

interface SignalIndicatorProps {
  status: SignalStatus;
  children?: ReactNode;
  showLabel?: boolean;
}

/**
 * The app's signature visual motif: a pulsing signal ring representing a pet's
 * live tracking state. Color and pulse speed carry real meaning (see index.css).
 */
const SignalIndicator = ({ status, children, showLabel = true }: SignalIndicatorProps) => {
  return (
    <span className="inline-flex items-center gap-2">
      <span className={`signal-dot ${STATUS_COLOR[status]}`} />
      {children ?? (showLabel && <span className="text-sm font-medium">{STATUS_LABEL[status]}</span>)}
    </span>
  );
};

export default SignalIndicator;
