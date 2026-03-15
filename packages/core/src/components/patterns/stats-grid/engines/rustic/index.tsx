'use client';

/**
 * StatsGrid - Rustic Engine (Pure inline styles with CSS vars)
 */

import React, { useState, useEffect } from 'react';
import { useBreakpoints } from '../../../../../core/hooks/responsive/useBreakpoints';
import { useTokens } from '../../../../../core/hooks/tokens';
import type { StatsGridProps } from '../../types';
import type { StatDef } from '../../../types';
import { resolveStatsGridMotion } from '../../personality';

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
    <svg viewBox="0 0 80 30" width={80} height={30} style={{ display: 'block', marginTop: 8 }}>
      <polyline
        points={normalizeSparkline(data)}
        fill="none"
        stroke={color || 'var(--ds-color-primary)'}
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

const variantStyles: Record<NonNullable<StatsGridProps['variant']>, React.CSSProperties> = {
  default: {
    background: 'var(--ds-stats-grid-card-bg, var(--ds-color-bg-elevated))',
    border: '1px solid var(--ds-stats-grid-card-border, var(--ds-color-border))',
    borderRadius: 'var(--ds-radius-md, 8px)',
  },
  outlined: {
    background: 'transparent',
    border: '2px solid var(--ds-stats-grid-card-border, var(--ds-color-border))',
    borderRadius: 'var(--ds-radius-md, 8px)',
  },
  filled: {
    background: 'var(--ds-stats-grid-card-filled-bg, var(--ds-color-bg-secondary))',
    border: 'none',
    borderRadius: 'var(--ds-radius-md, 8px)',
  },
  glass: {
    background: 'var(--ds-stats-grid-card-glass-bg, var(--ds-color-alpha-white-50))',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    border: '1px solid var(--ds-stats-grid-card-glass-border, var(--ds-color-alpha-white-20))',
    borderRadius: 'var(--ds-radius-md, 8px)',
  },
};

const RUSTIC_EASING = 'cubic-bezier(0.16, 1, 0.3, 1)';
const RUSTIC_DURATION = 'var(--ds-personality-animation-entrance-duration, 300ms)';

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
      ? 'var(--ds-stats-grid-trend-positive, var(--ds-color-success))'
      : stat.changeType === 'decrease'
        ? 'var(--ds-stats-grid-trend-negative, var(--ds-color-error))'
        : 'var(--ds-stats-grid-trend-neutral, var(--ds-color-text-muted))';

  const arrow =
    stat.changeType === 'increase' ? '\u2191' : stat.changeType === 'decrease' ? '\u2193' : '';

  return (
    <div
      style={{
        ...variantStyles[variant || 'default'],
        padding: 'var(--ds-card-body-padding, 16px)',
        cursor: onClick ? 'pointer' : undefined,
        boxShadow: 'var(--ds-card-shadow, none)',
        transition: `box-shadow ${RUSTIC_DURATION} ${RUSTIC_EASING}, transform ${RUSTIC_DURATION} ${RUSTIC_EASING}, background-color ${RUSTIC_DURATION} ${RUSTIC_EASING}`,
      }}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
      onFocus={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = '0 0 0 2px var(--ds-color-bg-primary, #fff), 0 0 0 4px var(--ds-color-primary-400, #818cf8)';
      }}
      onBlur={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = 'var(--ds-card-shadow, none)';
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.boxShadow = 'var(--ds-card-shadow-hover, var(--ds-shadow-lg))';
        el.style.transform = 'var(--ds-card-hover-transform, translateY(-2px) scale(1))';
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.boxShadow = 'var(--ds-card-shadow, none)';
        el.style.transform = 'translateY(0) scale(1)';
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
        {stat.icon && <span style={{ fontSize: 16 }}>{stat.icon}</span>}
        <span
          style={{
            fontSize: 13,
            fontWeight: 500,
            color: 'var(--ds-stats-grid-label-color, var(--ds-color-text-secondary))',
            textTransform: 'var(--ds-typography-label-transform, none)' as React.CSSProperties['textTransform'],
            letterSpacing: 'var(--ds-typography-heading-letter-spacing, normal)',
          }}
        >
          {stat.label}
        </span>
      </div>
      <div
        style={{
          fontSize: 28,
          fontWeight: 'var(--ds-typography-heading-font-weight, 700)' as unknown as number,
          color: stat.color || 'var(--ds-stats-grid-value-color, var(--ds-color-text-primary))',
          lineHeight: 1.2,
          letterSpacing: '-0.02em',
        }}
      >
        {stat.prefix}
        {displayValue}
        {stat.suffix && (
          <span style={{ fontSize: 14, fontWeight: 400, marginLeft: 4 }}>{stat.suffix}</span>
        )}
      </div>
      {stat.change != null && (
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 3,
            fontSize: 12,
            fontWeight: 600,
            color: changeColor,
            marginTop: 6,
            padding: '2px 6px',
            borderRadius: 'var(--ds-radius-sm, 4px)',
            background: stat.changeType === 'increase'
              ? 'var(--ds-color-success-50, rgba(16,185,129,0.08))'
              : stat.changeType === 'decrease'
                ? 'var(--ds-color-error-50, rgba(239,68,68,0.08))'
                : 'transparent',
            transition: `transform ${RUSTIC_DURATION} ${RUSTIC_EASING}`,
          }}
        >
          {arrow && <span style={{ fontSize: 13, lineHeight: 1 }}>{arrow}</span>}
          {Math.abs(stat.change)}%
        </div>
      )}
      {stat.description && (
        <div
          style={{
            fontSize: 12,
            color: 'var(--ds-stats-grid-description-color, var(--ds-color-text-muted))',
            marginTop: 2,
          }}
        >
          {stat.description}
        </div>
      )}
      {sparkline && stat.sparklineData && <Sparkline data={stat.sparklineData} color={stat.color} />}
    </div>
  );
}

function LoadingSkeleton({
  columns,
  gap,
  animation,
}: {
  columns: number;
  gap: string | number;
  animation: 'pulse' | 'wave';
}) {
  const pulseStyle: React.CSSProperties = {
    background: 'var(--ds-stats-grid-skeleton-bg, var(--ds-color-bg-tertiary))',
    borderRadius: 4,
    animation:
      animation === 'wave'
        ? 'wave 1.4s ease-in-out infinite'
        : 'pulse 1.5s ease-in-out infinite',
    backgroundImage:
      animation === 'wave'
        ? 'var(--ds-stats-grid-skeleton-wave-gradient)'
        : undefined,
    backgroundSize: animation === 'wave' ? '200% 100%' : undefined,
  };
  return (
    <>
      <style>{`@keyframes pulse { 0%, 100% { opacity: 1 } 50% { opacity: 0.4 } } @keyframes wave { 0% { background-position: 100% 50%; } 100% { background-position: 0 50%; } }`}</style>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${columns}, 1fr)`, gap }}>
        {Array.from({ length: columns }).map((_, i) => (
          <div
            key={i}
            style={{
              ...variantStyles.default,
              padding: 16,
            }}
          >
            <div style={{ ...pulseStyle, width: '50%', height: 12, marginBottom: 8 }} />
            <div style={{ ...pulseStyle, width: '70%', height: 24, marginBottom: 6 }} />
            <div style={{ ...pulseStyle, width: '30%', height: 10 }} />
          </div>
        ))}
      </div>
    </>
  );
}

export default function RusticStatsGrid(props: StatsGridProps) {
  const tokens = useTokens();
  const { prefersReducedMotion } = useBreakpoints();
  const {
    stats,
    renderStat,
    columns = 4,
    sparkline,
    gap = 'var(--ds-card-body-padding, 16px)' as unknown as number,
    variant = 'default',
    animate,
    onStatClick,
    loading,
    className,
    style,
  } = props;
  const motion = resolveStatsGridMotion(tokens.personality, prefersReducedMotion, animate);

  if (loading) return <LoadingSkeleton columns={columns} gap={gap} animation={motion.skeletonAnimation} />;

  return (
    <div
      className={className}
      style={{
        display: 'grid',
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
