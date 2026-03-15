'use client';

/**
 * StatsGrid - Modern Engine (DaisyUI / Tailwind)
 */

import React, { useState, useEffect } from 'react';
import { useBreakpoints } from '../../../../hooks/responsive/useBreakpoints';
import { useTokens } from '../../../../hooks/tokens';
import type { StatsGridProps } from '../StatsGrid.types';
import type { StatDef } from '../../types';
import { resolveStatsGridMotion } from '../personality';

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

function useAnimatedValue(
  target: number | string,
  animate?: boolean,
  duration = 600
): number | string {
  const [value, setValue] = useState<number | string>(animate && typeof target === 'number' ? 0 : target);

  useEffect(() => {
    if (!animate || typeof target !== 'number') {
      setValue(target);
      return;
    }
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(Math.round((target as number) * eased));
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target, animate]);

  return value;
}

const variantClasses: Record<NonNullable<StatsGridProps['variant']>, string> = {
  default: 'card bg-base-100 shadow-sm',
  outlined: 'card border border-base-300',
  filled: 'card bg-base-200',
  glass: 'card glass',
};

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

  const changeColor =
    stat.changeType === 'increase'
      ? 'text-success'
      : stat.changeType === 'decrease'
        ? 'text-error'
        : 'text-base-content/60';

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
  const motion = resolveStatsGridMotion(tokens.personality, prefersReducedMotion, animate);

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
