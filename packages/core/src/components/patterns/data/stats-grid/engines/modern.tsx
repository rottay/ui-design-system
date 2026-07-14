'use client';

/**
 * @fileoverview Modern engine for the StatsGrid pattern.
 *
 * Premium stat-card grid with:
 * - Clear number hierarchy (large bold value, muted label, colored trend)
 * - Fixed `columns`-count horizontal grid layout (shared with classic/rustic
 *   via resolveStatsGridColumns; the engine themes the tiles, not the layout)
 * - Animated value count-up with cubic ease-out
 * - Premium shimmer skeleton with card-shaped placeholders
 * - Mini SVG sparkline charts for trend visualization
 * - All styling via DS tokens -- zero hardcoded colors
 *
 * @example
 * <ModernStatsGrid
 *   stats={[{ key: 'users', label: 'Active Users', value: 1234, change: 5.2, changeType: 'increase' }]}
 *   columns={4}
 *   variant="glass"
 *   animate
 * />
 */

import React, { useState, useEffect } from 'react';
import { useBreakpoints } from '../../../../../hooks/responsive/useBreakpoints';
import { useTokens } from '../../../../../hooks/tokens';
import type { StatsGridProps } from '../StatsGrid.types';
import type { StatDef } from '../../../foundation/types';
import { resolveStatsGridMotion } from '../personality';
import { resolveStatsGridColumns } from '../layout';

/* ---------------------------------------------------------------------------
 * Sparkline
 * --------------------------------------------------------------------------- */

/**
 * Converts raw numeric data into SVG polyline coordinates for a mini sparkline.
 * Division-by-zero is guarded by `|| 1` when min equals max.
 */
function normalizeSparkline(data: number[], width = 80, height = 28): string {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  return data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - ((v - min) / range) * height;
      return `${x},${y}`;
    })
    .join(' ');
}

/** Tiny SVG sparkline chart with gradient fill beneath the line. */
function Sparkline({ data, color, id }: { data: number[]; color?: string; id: string }) {
  if (!data || data.length < 2) return null;
  const strokeColor = color || 'var(--ds-color-primary-500)';
  const points = normalizeSparkline(data);
  // Build closed polygon for gradient fill (line + bottom edge)
  const fillPoints = `0,28 ${points} 80,28`;
  const gradientId = `spark-grad-${id}`;

  return (
    <svg
      data-part="sparkline"
      viewBox="0 0 80 28"
      width={80}
      height={28}
      style={{ marginTop: 8, display: 'block', overflow: 'visible' }}
      aria-hidden="true"
    >
      <defs data-part="sparkline-defs">
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={strokeColor} stopOpacity={0.2} />
          <stop offset="100%" stopColor={strokeColor} stopOpacity={0} />
        </linearGradient>
      </defs>
      <polygon data-part="sparkline-area" points={fillPoints} fill={`url(#${gradientId})`} />
      <polyline
        data-part="sparkline-line"
        points={points}
        fill="none"
        stroke={strokeColor}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ---------------------------------------------------------------------------
 * Animated value hook
 * --------------------------------------------------------------------------- */

/**
 * Animates a numeric value from 0 to target using cubic ease-out.
 * String values pass through unchanged since formatted strings cannot be interpolated.
 */
function useAnimatedValue(
  target: number | string,
  animate?: boolean,
  duration = 600
): number | string {
  const [value, setValue] = useState<number | string>(
    animate && typeof target === 'number' ? 0 : target
  );

  useEffect(() => {
    if (!animate || typeof target !== 'number') {
      setValue(target);
      return;
    }
    const start = performance.now();
    let raf: number;
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(Math.round((target as number) * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, animate, duration]);

  return value;
}

/* ---------------------------------------------------------------------------
 * Variant styles (DS tokens only)
 * --------------------------------------------------------------------------- */

/** Maps variant names to DS token inline styles for card styling. */
const variantStyles: Record<NonNullable<StatsGridProps['variant']>, React.CSSProperties> = {
  default: {
    // Surface-tint (spec section 5, role 1) layered over the fill; collapses to
    // flat when --ds-effect-intensity is 0.
    backgroundColor: 'var(--ds-surface-card)',
    backgroundImage: 'var(--ds-gradient-surface)',
    boxShadow: 'var(--ds-elevation-1)',
    borderRadius: 'var(--ds-radius-lg)',
  },
  outlined: {
    backgroundColor: 'var(--ds-surface-card)',
    backgroundImage: 'var(--ds-gradient-surface)',
    border: '1px solid var(--ds-color-border)',
    borderRadius: 'var(--ds-radius-lg)',
  },
  filled: {
    backgroundColor: 'var(--ds-surface-inset)',
    backgroundImage: 'var(--ds-gradient-surface)',
    borderRadius: 'var(--ds-radius-lg)',
  },
  glass: {
    background: 'color-mix(in srgb, var(--ds-surface-card) 80%, transparent)',
    backdropFilter: 'blur(12px)',
    border: '1px solid color-mix(in srgb, var(--ds-color-border) 50%, transparent)',
    borderRadius: 'var(--ds-radius-lg)',
  },
};

/* ---------------------------------------------------------------------------
 * Trend indicator
 * --------------------------------------------------------------------------- */

/** Renders an arrow + percentage change in the appropriate semantic color. */
function TrendIndicator({ change, changeType }: { change: number; changeType?: StatDef['changeType'] }) {
  const style: React.CSSProperties =
    changeType === 'increase'
      ? { color: 'var(--ds-color-success)' }
      : changeType === 'decrease'
        ? { color: 'var(--ds-color-error)' }
        : { color: 'var(--ds-color-text-secondary)' };

  const arrow =
    changeType === 'increase' ? '\u2191' : changeType === 'decrease' ? '\u2193' : '';

  const bgStyle: React.CSSProperties =
    changeType === 'increase'
      ? { background: 'color-mix(in srgb, var(--ds-color-success) 10%, transparent)' }
      : changeType === 'decrease'
        ? { background: 'color-mix(in srgb, var(--ds-color-error) 10%, transparent)' }
        : { background: 'var(--ds-surface-panel)' };

  return (
    <span
      data-part="trend"
      data-change={changeType ?? 'neutral'}
      style={{
        ...style,
        ...bgStyle,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 2,
        padding: '2px 6px',
        borderRadius: 'var(--ds-radius-sm)',
        fontSize: 12,
        fontWeight: 500,
        lineHeight: 1,
      }}
    >
      {arrow} {Math.abs(change)}%
    </span>
  );
}

/* ---------------------------------------------------------------------------
 * StatCard
 * --------------------------------------------------------------------------- */

/**
 * Individual statistic card with clear number hierarchy:
 * - Label: small, muted, secondary text
 * - Value: large, bold, primary text
 * - Trend: color-coded pill with arrow + percentage
 * - Sparkline: optional mini chart area
 */
function StatCard({
  stat,
  sparkline,
  variant,
  animate,
  animationDuration,
  onClick,
}: {
  stat: StatDef;
  sparkline?: boolean;
  variant: StatsGridProps['variant'];
  animate?: boolean;
  animationDuration?: number;
  onClick?: () => void;
}) {
  const displayValue = useAnimatedValue(stat.value, animate, animationDuration);

  const cardStyle: React.CSSProperties = {
    ...variantStyles[variant || 'default'],
    padding: '20px 24px',
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    transition: 'box-shadow var(--ds-motion-normal) ease, transform var(--ds-motion-fast) ease',
    position: 'relative',
    overflow: 'hidden',
  };

  // Hover-like state handled via inline transitions (no Tailwind hover:)
  const interactiveStyle: React.CSSProperties = onClick
    ? { cursor: 'pointer' }
    : {};

  return (
    <div
      data-part="card"
      data-variant={variant || 'default'}
      data-interactive={onClick ? 'true' : 'false'}
      style={{ ...cardStyle, ...interactiveStyle }}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
      aria-label={onClick ? `${stat.label}: ${stat.value}` : undefined}
    >
      {/* Label row: icon + label */}
      <div data-part="label-row" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
        {stat.icon && (
          <span
            data-part="icon"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 32,
              height: 32,
              borderRadius: 'var(--ds-radius-md)',
              background: 'var(--ds-surface-panel)',
              color: stat.color || 'var(--ds-color-text-secondary)',
              fontSize: 16,
              flexShrink: 0,
            }}
          >
            {stat.icon}
          </span>
        )}
        <span
          data-part="label"
          style={{
            fontSize: 13,
            fontWeight: 500,
            color: 'var(--ds-color-text-secondary)',
            letterSpacing: '0.01em',
            lineHeight: 1.2,
          }}
        >
          {stat.label}
        </span>
      </div>

      {/* Value row: main value + trend */}
      <div data-part="value-row" style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
        <span
          className="ds-nums-tabular"
          data-part="value"
          style={{
            fontSize: 28,
            fontWeight: 700,
            color: stat.color || 'var(--ds-color-text-primary)',
            lineHeight: 1.1,
            letterSpacing: '-0.02em',
          }}
        >
          {stat.prefix}
          {displayValue}
          {stat.suffix && (
            <span
              data-part="suffix"
              style={{
                fontSize: 14,
                fontWeight: 400,
                color: 'var(--ds-color-text-secondary)',
                marginLeft: 4,
              }}
            >
              {stat.suffix}
            </span>
          )}
        </span>

        {stat.change != null && (
          <TrendIndicator change={stat.change} changeType={stat.changeType} />
        )}
      </div>

      {/* Description */}
      {stat.description && (
        <span
          data-part="description"
          style={{
            fontSize: 12,
            color: 'var(--ds-color-text-muted)',
            lineHeight: 1.4,
            marginTop: 2,
          }}
        >
          {stat.description}
        </span>
      )}

      {/* Sparkline chart area */}
      {sparkline && stat.sparklineData && (
        <Sparkline data={stat.sparklineData} color={stat.color} id={stat.key} />
      )}
    </div>
  );
}

/* ---------------------------------------------------------------------------
 * Loading skeleton
 * --------------------------------------------------------------------------- */

/** Inline keyframes for the shimmer animation. */
const shimmerKeyframes = `
@keyframes ds-stats-shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
`;

/** Premium loading skeleton with shimmer effect and proper card shapes. */
function LoadingSkeleton({ columns, gap }: { columns: number; gap: string | number }) {
  const shimmerBg: React.CSSProperties = {
    background: 'linear-gradient(90deg, var(--ds-surface-panel) 25%, var(--ds-surface-inset) 50%, var(--ds-surface-panel) 75%)',
    backgroundSize: '200% 100%',
    animation: 'ds-stats-shimmer 1.5s ease-in-out infinite',
    borderRadius: 'var(--ds-radius-sm)',
  };

  return (
    <>
      <style>{shimmerKeyframes}</style>
      <div
        className="ds-pattern-stats-grid ds-engine-modern ds-stats-grid-skeleton"
        data-part="root"
        data-loading="true"
        style={{
          display: 'grid',
          gridTemplateColumns: resolveStatsGridColumns(columns),
          gap,
        }}
      >
        {Array.from({ length: columns }).map((_, i) => (
          <div
            key={i}
            className="ds-stats-grid-skeleton__item"
            data-part="skeleton"
            style={{
              background: 'var(--ds-surface-card)',
              boxShadow: 'var(--ds-elevation-1)',
              borderRadius: 'var(--ds-radius-lg)',
              padding: '20px 24px',
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
            }}
          >
            {/* Label shimmer */}
            <div className="ds-stats-grid-skeleton__bar" data-part="skeleton-bar" data-kind="label" style={{ ...shimmerBg, width: '40%', height: 12 }} />
            {/* Value shimmer */}
            <div className="ds-stats-grid-skeleton__bar" data-part="skeleton-bar" data-kind="value" style={{ ...shimmerBg, width: '65%', height: 28 }} />
            {/* Trend shimmer */}
            <div className="ds-stats-grid-skeleton__bar" data-part="skeleton-bar" data-kind="trend" style={{ ...shimmerBg, width: '30%', height: 16 }} />
          </div>
        ))}
      </div>
    </>
  );
}

/* ---------------------------------------------------------------------------
 * ModernStatsGrid (main export)
 * --------------------------------------------------------------------------- */

/**
 * Modern engine for the StatsGrid pattern component.
 *
 * Renders a fixed `columns`-track CSS grid of premium stat cards styled
 * entirely with DS tokens. Supports columns, sparklines, variant styles,
 * animated count-up values, and custom renderStat slots.
 *
 * @param props - {@link StatsGridProps} controlling stats data, layout, animation, and callbacks.
 * @returns A grid of statistic cards.
 */
export default function ModernStatsGrid(props: StatsGridProps) {
  const tokens = useTokens();
  const { prefersReducedMotion } = useBreakpoints();
  const {
    stats,
    renderStat,
    columns = 4,
    sparkline,
    gap = '1rem',
    variant = 'default',
    animate,
    onStatClick,
    loading,
    className,
    style,
  } = props;

  // Resolve animation settings from the personality token system.
  // Respects user's prefers-reduced-motion OS preference.
  const motion = resolveStatsGridMotion(tokens.personality, prefersReducedMotion, animate);

  // Column axis is a component-layer concern shared by every engine
  // (Quiet Premium spec section 10): a fixed `columns`-track horizontal
  // grid, identical to classic/rustic. See resolveStatsGridColumns.
  const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: resolveStatsGridColumns(columns),
    gap,
    ...style,
  };

  // Show placeholder skeleton during data fetching to prevent layout shift.
  if (loading) return <LoadingSkeleton columns={columns} gap={gap} />;

  return (
    <div
      className={['ds-pattern-stats-grid', 'ds-engine-modern', className].filter(Boolean).join(' ')}
      data-part="root"
      data-loading="false"
      data-variant={variant}
      style={gridStyle}
    >
      {stats.map((stat) => {
        const defaultRender = (
          <StatCard
            key={stat.key}
            stat={stat}
            sparkline={sparkline}
            variant={variant}
            animate={motion.animate}
            animationDuration={motion.duration}
            onClick={onStatClick ? () => onStatClick(stat) : undefined}
          />
        );
        return (
          <React.Fragment key={stat.key}>
            {renderStat ? renderStat(stat, defaultRender) : defaultRender}
          </React.Fragment>
        );
      })}
    </div>
  );
}
