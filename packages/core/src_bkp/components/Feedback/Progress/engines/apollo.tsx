/**
 * Apollo Progress Engine
 *
 * Native HTML + Tailwind CSS progress implementation.
 * Zero external dependencies, minimal bundle size.
 */

'use client';

import type { ProgressProps } from '../../../../types/components/progress';
import { isGradientColor } from '../../../../types/components/progress';
import { cn } from '../../../../utils/cn';

/**
 * Apollo Progress - Native HTML + Tailwind implementation
 */
function ApolloProgress({
  percent = 0,
  type = 'line',
  status = 'normal',
  showInfo = true,
  strokeColor,
  trailColor,
  strokeWidth,
  size = 'default',
  format,
  children,
  className,
  style,
}: ProgressProps) {
  // Clamp percent between 0-100
  const clampedPercent = Math.min(100, Math.max(0, percent));

  // Determine status colors
  const getStatusColor = () => {
    if (status === 'success') return 'bg-green-500';
    if (status === 'exception') return 'bg-red-500';
    if (status === 'active') return 'bg-blue-600 animate-pulse';
    return 'bg-blue-500';
  };

  // Determine trail (background) color
  const getTrailColor = () => {
    if (trailColor) return trailColor;
    return '#f0f0f0';
  };

  // Determine stroke width based on size
  const getStrokeHeight = () => {
    if (strokeWidth) return `${strokeWidth}px`;
    return size === 'small' ? '6px' : '8px';
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
        <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
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
        <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
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

  // Get gradient style if strokeColor is a gradient
  const getBarStyle = () => {
    const baseStyle: React.CSSProperties = {};

    if (strokeColor) {
      if (isGradientColor(strokeColor)) {
        const direction = strokeColor.direction || 'to right';
        baseStyle.background = `linear-gradient(${direction}, ${strokeColor.from}, ${strokeColor.to})`;
      } else {
        baseStyle.backgroundColor = strokeColor;
      }
    }

    return baseStyle;
  };

  // Render line progress
  if (type === 'line') {
    return (
      <div className={cn('flex items-center gap-2', className)} style={style}>
        <div className="flex-1 relative overflow-hidden rounded-full" style={{ height: getStrokeHeight(), backgroundColor: getTrailColor() }}>
          <div
            className={cn('h-full transition-all duration-300 ease-out rounded-full', !strokeColor && getStatusColor())}
            style={{
              width: `${clampedPercent}%`,
              ...getBarStyle(),
            }}
          />
        </div>
        {showInfo && (
          <div className={cn('flex items-center gap-1', size === 'small' ? 'text-xs' : 'text-sm')}>
            {renderStatusIcon()}
            {!renderStatusIcon() && <span className="text-gray-600">{formatPercent()}</span>}
          </div>
        )}
      </div>
    );
  }

  // Render circle progress
  const circleSize = size === 'small' ? 80 : 120;
  const circleStrokeWidth = strokeWidth || (size === 'small' ? 6 : 8);
  const radius = (circleSize - circleStrokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clampedPercent / 100) * circumference;

  const getCircleStrokeColor = () => {
    if (strokeColor && !isGradientColor(strokeColor)) return strokeColor;
    if (status === 'success') return '#52c41a';
    if (status === 'exception') return '#ff4d4f';
    return '#1890ff';
  };

  return (
    <div className={cn('inline-flex items-center justify-center', className)} style={style}>
      <svg width={circleSize} height={circleSize} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={circleSize / 2}
          cy={circleSize / 2}
          r={radius}
          fill="none"
          stroke={getTrailColor()}
          strokeWidth={circleStrokeWidth}
        />
        {/* Progress circle */}
        <circle
          cx={circleSize / 2}
          cy={circleSize / 2}
          r={radius}
          fill="none"
          stroke={getCircleStrokeColor()}
          strokeWidth={circleStrokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-300 ease-out"
        />
      </svg>
      {showInfo && (
        <div className={cn('absolute flex flex-col items-center justify-center', size === 'small' ? 'text-xs' : 'text-sm')}>
          {renderStatusIcon() || <span className="text-gray-600 font-medium">{formatPercent()}</span>}
        </div>
      )}
    </div>
  );
}

ApolloProgress.displayName = 'ApolloProgress';

export default ApolloProgress;
