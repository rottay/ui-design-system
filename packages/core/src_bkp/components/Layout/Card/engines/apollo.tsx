/**
 * Apollo Card Engine
 *
 * Native HTML + Tailwind CSS card implementation.
 * Implements unified CardProps interface.
 */

'use client';

import type { CardProps } from '../../../../types/components/card';

// Utility function for classNames
function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * Apollo Card - Native HTML + Tailwind implementation with unified CardProps
 */
function ApolloCard({
  title,
  children,
  className,
  onClick,
  header,
  footer,
  extra,
  cover,
  bordered = true,
  bodyPadding = true,
  hoverable = false,
  loading = false,
  size = 'medium',
  bodyStyle,
  headerStyle,
}: CardProps) {
  const sizeStyles = {
    small: { header: 'px-3 py-2', body: 'p-3' },
    medium: { header: 'px-4 py-3', body: 'p-4' },
    large: { header: 'px-5 py-4', body: 'p-5' },
  }[size];

  const cardClasses = cn(
    'bg-white rounded-lg overflow-hidden',
    bordered && 'border border-gray-200',
    hoverable && 'transition-shadow duration-200 hover:shadow-lg cursor-pointer',
    !bordered && 'shadow-sm',
    className
  );

  const headerClasses = cn(
    'flex items-center justify-between',
    sizeStyles.header,
    'border-b border-gray-200'
  );

  const bodyClasses = cn(bodyPadding && sizeStyles.body);

  return (
    <div className={cardClasses} onClick={onClick}>
      {cover && <div className="w-full">{cover}</div>}

      {(header || title || extra) && (
        <div className={headerClasses} style={headerStyle}>
          {header || (title && <div className="font-medium text-gray-900">{title}</div>)}
          {extra && <div className="text-sm">{extra}</div>}
        </div>
      )}

      <div className={bodyClasses} style={bodyStyle}>
        {loading ? (
          <div className="space-y-3 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        ) : (
          children
        )}
      </div>

      {footer && (
        <div className="flex border-t border-gray-200 px-4 py-3">{footer}</div>
      )}
    </div>
  );
}

ApolloCard.displayName = 'ApolloCard';

export default ApolloCard;
