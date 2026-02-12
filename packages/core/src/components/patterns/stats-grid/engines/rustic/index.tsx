'use client';

/**
 * StatsGrid - Rustic Engine (Pure inline styles with CSS vars)
 */

import React, { useState, useEffect } from 'react';
import type { StatsGridProps } from '../../types';
import type { StatDef } from '../../../types';

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
        stroke={color || 'var(--ds-color-primary, #6366f1)'}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function useAnimatedValue(target: number | string, animate?: boolean): number | string {
  const [value, setValue] = useState<number | string>(animate && typeof target === 'number' ? 0 : target);

  useEffect(() => {
    if (!animate || typeof target !== 'number') {
      setValue(target);
      return;
    }
    const duration = 600;
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
    background: 'var(--ds-color-bg-primary, #fff)',
    border: '1px solid var(--ds-color-border, #e5e7eb)',
    borderRadius: 'var(--ds-radius-md, 8px)',
  },
  outlined: {
    background: 'transparent',
    border: '2px solid var(--ds-color-border, #e5e7eb)',
    borderRadius: 'var(--ds-radius-md, 8px)',
  },
  filled: {
    background: 'var(--ds-color-bg-secondary, #f3f4f6)',
    border: 'none',
    borderRadius: 'var(--ds-radius-md, 8px)',
  },
  glass: {
    background: 'rgba(255,255,255,0.5)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    border: '1px solid rgba(255,255,255,0.25)',
    borderRadius: 'var(--ds-radius-md, 8px)',
  },
};

function StatCard({
  stat,
  sparkline,
  variant,
  animate,
  onClick,
}: {
  stat: StatDef;
  sparkline?: boolean;
  variant: StatsGridProps['variant'];
  animate?: boolean;
  onClick?: () => void;
}) {
  const displayValue = useAnimatedValue(stat.value, animate);

  const changeColor =
    stat.changeType === 'increase'
      ? 'var(--ds-color-success, #16a34a)'
      : stat.changeType === 'decrease'
        ? 'var(--ds-color-error, #dc2626)'
        : 'var(--ds-color-text-muted, #9ca3af)';

  const arrow =
    stat.changeType === 'increase' ? '\u2191' : stat.changeType === 'decrease' ? '\u2193' : '';

  return (
    <div
      style={{
        ...variantStyles[variant || 'default'],
        padding: 16,
        cursor: onClick ? 'pointer' : undefined,
        transition: 'box-shadow 0.15s ease',
      }}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
      onMouseEnter={(e) => {
        if (onClick) (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = 'none';
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
        {stat.icon && <span style={{ fontSize: 16 }}>{stat.icon}</span>}
        <span
          style={{
            fontSize: 13,
            fontWeight: 500,
            color: 'var(--ds-color-text-muted, #6b7280)',
          }}
        >
          {stat.label}
        </span>
      </div>
      <div
        style={{
          fontSize: 24,
          fontWeight: 700,
          color: stat.color || 'var(--ds-color-text-primary, #111827)',
          lineHeight: 1.2,
        }}
      >
        {stat.prefix}
        {displayValue}
        {stat.suffix && (
          <span style={{ fontSize: 14, fontWeight: 400, marginLeft: 4 }}>{stat.suffix}</span>
        )}
      </div>
      {stat.change != null && (
        <div style={{ fontSize: 12, fontWeight: 500, color: changeColor, marginTop: 4 }}>
          {arrow} {Math.abs(stat.change)}%
        </div>
      )}
      {stat.description && (
        <div
          style={{
            fontSize: 12,
            color: 'var(--ds-color-text-muted, #9ca3af)',
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

function LoadingSkeleton({ columns, gap }: { columns: number; gap: string | number }) {
  const pulseStyle: React.CSSProperties = {
    background: 'var(--ds-color-bg-secondary, #e5e7eb)',
    borderRadius: 4,
    animation: 'pulse 1.5s ease-in-out infinite',
  };
  return (
    <>
      <style>{`@keyframes pulse { 0%, 100% { opacity: 1 } 50% { opacity: 0.4 } }`}</style>
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
  const {
    stats,
    renderStat,
    columns = 4,
    sparkline,
    gap = 16,
    variant = 'default',
    animate,
    onStatClick,
    loading,
    className,
    style,
  } = props;

  if (loading) return <LoadingSkeleton columns={columns} gap={gap} />;

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
            animate={animate}
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
