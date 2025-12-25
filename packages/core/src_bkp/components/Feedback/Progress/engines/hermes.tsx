/**
 * Hermes Progress Engine
 *
 * DaisyUI progress implementation using native progress element.
 */

'use client';

import type { ProgressProps } from '../../../../types/components/progress';
import { isGradientColor } from '../../../../types/components/progress';
import { cn } from '../../../../utils/cn';

/**
 * Hermes Progress - DaisyUI implementation
 */
function HermesProgress({
  percent = 0,
  type = 'line',
  status = 'normal',
  showInfo = true,
  strokeColor,
  trailColor,
  size = 'default',
  format,
  children,
  className,
  style,
}: ProgressProps) {
  // Clamp percent between 0-100
  const clampedPercent = Math.min(100, Math.max(0, percent));

  // Determine DaisyUI color class based on status
  const getStatusClass = () => {
    if (status === 'success') return 'progress-success';
    if (status === 'exception') return 'progress-error';
    if (status === 'active') return 'progress-info';
    return 'progress-primary';
  };

  // Determine size class
  const getSizeClass = () => {
    return size === 'small' ? 'progress-sm' : '';
  };

  // Format percentage display
  const formatPercent = () => {
    if (children) return children;
    if (format) return format(clampedPercent);
    return `${clampedPercent}%`;
  };

  // Render status icon
  const renderStatusIcon = () => {
    if (status === 'success') {
      return (
        <svg className="w-4 h-4 text-success" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clipRule="evenodd"
          />
        </svg>
      );
    }
    if (status === 'exception') {
      return (
        <svg className="w-4 h-4 text-error" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
            clipRule="evenodd"
          />
        </svg>
      );
    }
    return null;
  };

  // Custom styles for strokeColor
  const getCustomStyle = (): React.CSSProperties & { '--progress-color'?: string } => {
    const customStyle: React.CSSProperties & { '--progress-color'?: string } = { ...style };

    if (strokeColor) {
      if (isGradientColor(strokeColor)) {
        const direction = strokeColor.direction || 'to right';
        customStyle.background = `linear-gradient(${direction}, ${strokeColor.from}, ${strokeColor.to})`;
      } else {
        // Override the progress bar color using CSS variable
        customStyle['--progress-color'] = strokeColor;
      }
    }

    if (trailColor) {
      customStyle.backgroundColor = trailColor;
    }

    return customStyle;
  };

  // DaisyUI only supports line progress with native progress element
  if (type === 'circle') {
    // Fallback to a simple radial progress for circle type
    const circleSize = size === 'small' ? 80 : 120;
    const percentage = Math.round(clampedPercent);

    return (
      <div className={cn('inline-flex items-center justify-center', className)} style={style}>
        <div
          className={cn('radial-progress', getStatusClass())}
          style={{ '--value': percentage, '--size': `${circleSize}px` } as React.CSSProperties}
          role="progressbar"
          aria-valuenow={percentage}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          {showInfo && (
            <span className={cn('text-center', size === 'small' ? 'text-xs' : 'text-sm')}>
              {renderStatusIcon() || formatPercent()}
            </span>
          )}
        </div>
      </div>
    );
  }

  // Line progress
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <progress
        className={cn('progress', getStatusClass(), getSizeClass(), 'flex-1')}
        value={clampedPercent}
        max={100}
        style={getCustomStyle()}
      />
      {showInfo && (
        <div className={cn('flex items-center gap-1', size === 'small' ? 'text-xs' : 'text-sm')}>
          {renderStatusIcon()}
          {!renderStatusIcon() && <span className="opacity-60">{formatPercent()}</span>}
        </div>
      )}
    </div>
  );
}

HermesProgress.displayName = 'HermesProgress';

export default HermesProgress;
