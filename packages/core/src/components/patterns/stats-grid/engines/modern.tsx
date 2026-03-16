'use client';

/**
 * @fileoverview Modern (DaisyUI/Tailwind) engine for the StatsGrid pattern.
 *
 * Implements the same stat-card grid as the Classic engine but using DaisyUI
 * utility classes and Tailwind CSS. Cards are composed from `card`, `card-body`,
 * and `glass` DaisyUI classes. The loading skeleton uses Tailwind's
 * `animate-pulse` for a CSS-only shimmer effect without additional JS.
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
import { useBreakpoints } from '../../../../hooks/responsive/useBreakpoints';
import { useTokens } from '../../../../hooks/tokens';
import type { StatsGridProps } from '../StatsGrid.types';
import type { StatDef } from '../../types';
import { resolveStatsGridMotion } from '../personality';

/**
 * Converts raw numeric data into SVG polyline coordinates for a mini sparkline.
 * Division-by-zero is guarded by `|| 1` when min equals max.
 */
function normalizeSparkline(data: number[], width = 80, height = 30): string {
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

/** Tiny SVG sparkline chart rendered below a stat value to visualize trends. */
function Sparkline({ data, color }: { data: number[]; color?: string }) {
  if (!data || data.length < 2) return null;
  return (
    <svg viewBox="0 0 80 30" width={80} height={30} className="mt-2">
      <polyline
        points={normalizeSparkline(data)}
        fill="none"
        stroke={color || 'var(--ds-color-primary-500)'}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Animates a numeric value from 0 to target using cubic ease-out.
 * String values pass through unchanged since formatted strings cannot be interpolated.
 */
function useAnimatedValue(
  target: number | string,
  animate?: boolean,
  duration = 600
): number | string {
  // Start at 0 when animating numbers; strings pass through immediately
  // since they cannot be numerically interpolated.
  const [value, setValue] = useState<number | string>(animate && typeof target === 'number' ? 0 : target);

  useEffect(() => {
    if (!animate || typeof target !== 'number') {
      setValue(target);
      return;
    }
    const start = performance.now();
    const tick = (now: number) => {
      // Normalize progress to [0,1] then apply cubic ease-out
      // for a fast-start, smooth-deceleration feel.
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(Math.round((target as number) * eased));
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target, animate]);

  return value;
}

/** Maps variant names to DaisyUI/Tailwind class combinations for card styling. */
const variantClasses: Record<NonNullable<StatsGridProps['variant']>, string> = {
  default: 'card bg-base-100 shadow-sm',
  outlined: 'card border border-base-300',
  filled: 'card bg-base-200',
  glass: 'card glass',
};

/**
 * Individual statistic card using DaisyUI card classes.
 *
 * Includes keyboard accessibility (Enter to activate) and ARIA role="button"
 * when clickable, making it screen-reader friendly.
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

  // Map trend direction to semantic DaisyUI color classes.
  // Neutral changes use reduced opacity for visual de-emphasis.
  const changeColor =
    stat.changeType === 'increase'
      ? 'text-success'
      : stat.changeType === 'decrease'
        ? 'text-error'
        : 'text-base-content/60';

  // Unicode arrows provide a lightweight trend indicator without icon imports.
  const arrow =
    stat.changeType === 'increase' ? '\u2191' : stat.changeType === 'decrease' ? '\u2193' : '';

  return (
    <div
      className={`${variantClasses[variant || 'default']} card-body p-4 ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
    >
      <div className="flex items-center gap-2">
        {stat.icon && <span className="text-lg">{stat.icon}</span>}
        <span className="text-sm font-medium opacity-60">{stat.label}</span>
      </div>
      <div className="stat-value text-2xl font-bold" style={{ color: stat.color }}>
        {stat.prefix}
        {displayValue}
        {stat.suffix && <span className="text-base font-normal ml-1">{stat.suffix}</span>}
      </div>
      {stat.change != null && (
        <div className={`text-xs font-medium ${changeColor}`}>
          {arrow} {Math.abs(stat.change)}%
        </div>
      )}
      {stat.description && <div className="text-xs opacity-50">{stat.description}</div>}
      {sparkline && stat.sparklineData && <Sparkline data={stat.sparklineData} color={stat.color} />}
    </div>
  );
}

/** CSS-only loading skeleton using Tailwind's animate-pulse utility. */
function LoadingSkeleton({ columns, gap }: { columns: number; gap: string | number }) {
  return (
    <div
      className="grid"
      style={{ gridTemplateColumns: `repeat(${columns}, 1fr)`, gap }}
    >
      {Array.from({ length: columns }).map((_, i) => (
        <div key={i} className="card bg-base-100 shadow-sm card-body p-4 animate-pulse">
          <div className="h-3 bg-base-300 rounded w-1/2 mb-2" />
          <div className="h-6 bg-base-300 rounded w-3/4 mb-1" />
          <div className="h-2 bg-base-300 rounded w-1/3" />
        </div>
      ))}
    </div>
  );
}

/**
 * Modern (DaisyUI/Tailwind) engine for the StatsGrid pattern component.
 *
 * Renders a CSS grid of stat cards styled with DaisyUI utility classes.
 * Supports the same props as the Classic engine -- columns, sparklines,
 * variant, animation, and custom renderStat slot -- but without any Ant
 * Design dependency.
 *
 * @param props - {@link StatsGridProps} controlling stats data, layout, animation, and callbacks.
 * @returns A grid of statistic cards styled with DaisyUI/Tailwind.
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

  // Show placeholder skeleton during data fetching to prevent layout shift.
  if (loading) return <LoadingSkeleton columns={columns} gap={gap} />;

  return (
    <div
      className={`grid ${className || ''}`}
      style={{
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap,
        ...style,
      }}
    >
      {stats.map((stat) => {
        // Build the default card first, then allow consumers to override
        // via renderStat while still receiving the default as a fallback.
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
