/**
 * Hermes Card Engine
 *
 * DaisyUI Card implementation with adapter for unified props.
 * Implements unified CardProps interface.
 */

'use client';

import type { CardProps } from '../../../../types/components/card';

// Utility function for classNames
function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * Hermes Card - DaisyUI implementation with unified CardProps
 */
function HermesCard({
  title,
  children,
  className,
  onClick,
  header,
  footer,
  extra,
  cover,
  bordered = true,
  hoverable,
  loading,
  size = 'medium',
}: CardProps) {
  const sizeClasses = {
    small: 'card-compact',
    medium: '',
    large: '',
  }[size];

  const classes = cn(
    'card bg-base-100',
    bordered && 'card-bordered',
    sizeClasses,
    hoverable && 'hover:shadow-lg transition-shadow cursor-pointer',
    !bordered && 'shadow-xl',
    className
  );

  return (
    <div className={classes} onClick={onClick}>
      {cover && <figure>{cover}</figure>}

      <div className="card-body">
        {(header || title || extra) && (
          <div className="flex items-center justify-between">
            {header || (title && <h2 className="card-title">{title}</h2>)}
            {extra && <div className="text-sm">{extra}</div>}
          </div>
        )}

        {loading ? (
          <div className="space-y-3 animate-pulse">
            <div className="h-4 bg-base-300 rounded w-3/4"></div>
            <div className="h-4 bg-base-300 rounded w-1/2"></div>
          </div>
        ) : (
          children
        )}

        {footer && <div className="card-actions justify-end mt-4">{footer}</div>}
      </div>
    </div>
  );
}

HermesCard.displayName = 'HermesCard';

export default HermesCard;
