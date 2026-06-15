import type { Status } from '../types';
import { STATUS_LABELS, STATUS_COLORS } from '../types';

interface StatusBadgeProps {
  status: Status;
  size?: 'sm' | 'md';
}

export const StatusBadge = ({ status, size = 'md' }: StatusBadgeProps) => {
  const color = STATUS_COLORS[status];
  const label = STATUS_LABELS[status];
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm';

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full ${sizeClasses}`}
      style={{
        backgroundColor: `${color}20`,
        color: color,
        border: `1px solid ${color}40`,
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full mr-1.5"
        style={{ backgroundColor: color }}
      />
      {label}
    </span>
  );
};
