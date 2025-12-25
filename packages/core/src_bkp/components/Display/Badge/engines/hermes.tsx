/**
 * Hermes Badge Engine
 *
 * DaisyUI badge implementation with unified BadgeProps.
 */

'use client';

import type { BadgeProps, BadgeStatus } from '../../../../types/components/badge';
import { getDisplayCount } from '../../../../types/components/badge';

// Map status to DaisyUI badge color classes
const statusClasses: Record<BadgeStatus, string> = {
  success: 'badge-success',
  processing: 'badge-info',
  default: 'badge-ghost',
  error: 'badge-error',
  warning: 'badge-warning',
};

// Map size to DaisyUI size classes
const sizeClasses = {
  small: 'badge-xs',
  default: 'badge-sm',
};

/**
 * Hermes Badge - DaisyUI implementation with unified BadgeProps
 */
function HermesBadge({
  children,
  text,
  className = '',
  style,
  color,
  status = 'default',
  count,
  showZero = false,
  overflowCount = 99,
  dot = false,
  size = 'default',
  offset,
  title,
}: BadgeProps) {
  const sizeClass = sizeClasses[size] || sizeClasses.default;

  // Determine if badge should be shown
  const shouldShowBadge = () => {
    if (dot) return true;
    if (count === undefined || count === null) return false;
    const numCount = typeof count === 'number' ? count : 0;
    return numCount > 0 || showZero;
  };

  // Get badge color class
  const getColorClass = () => {
    if (color) {
      // DaisyUI doesn't support arbitrary colors well, use inline style
      return '';
    }
    return statusClasses[status] || statusClasses.default;
  };

  // Get custom color style
  const getCustomColorStyle = () => {
    if (color) {
      return { backgroundColor: color, borderColor: color };
    }
    return {};
  };

  // Calculate offset positioning
  const getOffsetStyle = () => {
    if (!offset) return {};
    return {
      transform: `translate(${offset[0]}px, ${offset[1]}px)`,
    };
  };

  // Render standalone badge (no children)
  if (!children) {
    // Standalone status badge with text (indicator with label)
    if (text) {
      const classes = ['inline-flex items-center gap-2', className].filter(Boolean).join(' ');

      return (
        <span className={classes} style={style} title={title}>
          <span
            className={`badge ${dot ? 'badge-xs' : sizeClass} ${getColorClass()}`}
            style={getCustomColorStyle()}
          >
            {!dot && (text || '')}
          </span>
          {dot && <span className="text-sm">{text}</span>}
        </span>
      );
    }

    // Standalone count or dot badge
    if (shouldShowBadge()) {
      const displayCount = !dot && typeof count === 'number'
        ? getDisplayCount(count, overflowCount)
        : count;

      const classes = [
        'badge',
        dot ? 'badge-xs w-2 h-2 p-0' : sizeClass,
        getColorClass(),
        className,
      ]
        .filter(Boolean)
        .join(' ');

      return (
        <span
          className={classes}
          style={{ ...getCustomColorStyle(), ...style }}
          title={title}
        >
          {!dot && displayCount}
        </span>
      );
    }

    return null;
  }

  // Render badge with children (indicator mode)
  return (
    <div className={`indicator ${className}`} style={style}>
      {shouldShowBadge() && (
        <span
          className={`indicator-item badge ${
            dot ? 'badge-xs w-2 h-2 p-0' : sizeClass
          } ${getColorClass()}`}
          style={{
            ...getCustomColorStyle(),
            ...getOffsetStyle(),
          }}
          title={title}
        >
          {!dot && (
            <>
              {typeof count === 'number' ? getDisplayCount(count, overflowCount) : count}
            </>
          )}
        </span>
      )}
      {children}
    </div>
  );
}

HermesBadge.displayName = 'HermesBadge';

export default HermesBadge;
