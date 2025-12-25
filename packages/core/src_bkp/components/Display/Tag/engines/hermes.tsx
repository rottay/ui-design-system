/**
 * Hermes Tag Engine
 *
 * DaisyUI badge implementation with unified TagProps.
 */

'use client';

import type { TagProps } from '../../../../types/components/tag';

// Map unified color to DaisyUI badge classes
const colorClasses: Record<string, string> = {
  default: 'badge-neutral',
  blue: 'badge-info',
  green: 'badge-success',
  red: 'badge-error',
  yellow: 'badge-warning',
  purple: 'badge-secondary',
  cyan: 'badge-info',
  orange: 'badge-warning',
  pink: 'badge-secondary',
  magenta: 'badge-secondary',
  geekblue: 'badge-primary',
  lime: 'badge-success',
  gold: 'badge-warning',
  volcano: 'badge-error',
};

/**
 * Hermes Tag - DaisyUI implementation with unified TagProps
 */
function HermesTag({
  children,
  className = '',
  style,
  color = 'default',
  closable,
  onClose,
  icon,
  bordered = true,
  id,
  'aria-label': ariaLabel,
}: TagProps) {
  // Get color class or use default
  const colorClass = colorClasses[color] || colorClasses.default;

  // Handle custom hex colors
  const customColorStyle =
    color && !colorClasses[color] && color.startsWith('#')
      ? {
          backgroundColor: `${color}20`,
          color: color,
          borderColor: `${color}60`,
        }
      : undefined;

  const handleClose = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    onClose?.(e);
  };

  const classes = [
    'badge',
    'gap-1',
    colorClass,
    bordered && 'badge-outline',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <span
      id={id}
      className={classes}
      style={customColorStyle ? { ...customColorStyle, ...style } : style}
      aria-label={ariaLabel}
    >
      {icon && <span className="inline-flex items-center">{icon}</span>}
      <span>{children}</span>
      {closable && (
        <button
          type="button"
          onClick={handleClose}
          className="btn btn-ghost btn-xs btn-circle ml-0.5 -mr-1"
          aria-label="Close tag"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-3 w-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </span>
  );
}

HermesTag.displayName = 'HermesTag';

export default HermesTag;
