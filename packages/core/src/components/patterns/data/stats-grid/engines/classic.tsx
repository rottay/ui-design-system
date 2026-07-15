'use client';

/**
 * @fileoverview Classic (Ant Design) engine for the StatsGrid pattern.
 *
 * Displays a responsive CSS-grid of statistic cards using Ant Design's Card
 * and Statistic primitives. Each card can optionally render an animated
 * numeric counter, a percentage-change indicator with directional arrows,
 * a mini SVG sparkline, and a description line. The animation behavior
 * is resolved through the personality/motion system so it can be suppressed
 * for users who prefer reduced motion.
 *
 * @example
 * <ClassicStatsGrid
 *   stats={[{ key: 'revenue', label: 'Revenue', value: 42500, prefix: '$', change: 12, changeType: 'increase' }]}
 *   columns={3}
 *   sparkline
 *   animate
 * />
 */

import React, { useState, useEffect } from 'react';
import { Card, Statistic } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import { useBreakpoints } from '../../../../../hooks/responsive/useBreakpoints';
import { useTokens } from '../../../../../hooks/tokens';
import type { StatsGridProps } from '../StatsGrid.types';
import type { StatDef } from '../../../foundation/types';
import { resolveStatsGridMotion } from '../personality';
import { resolveStatsGridColumns } from '../layout';

/**
 * Maps raw data values to SVG polyline coordinate pairs.
 *
 * The range guard (`|| 1`) prevents division by zero when all values are
 * identical, producing a flat horizontal line instead of NaN coordinates.
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

/** Tiny SVG line chart rendered below a stat value to show trend direction. */
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

/**
 * Animates a numeric value from 0 to the target using a cubic ease-out curve.
 *
 * String values (e.g. "$1,234") are passed through unchanged because
 * interpolating formatted strings would require parsing the format. The
 * animation runs via requestAnimationFrame for frame-perfect rendering.
 */
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
    const from = 0;
    // requestAnimationFrame loop with cubic ease-out for smooth deceleration.
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(Math.round(from + (target - from) * eased));
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target, animate]);

  return value;
}

/**
 * Individual statistic card using Ant Design's Card + Statistic primitives.
 *
 * Variant styles (outlined, filled, glass) are applied via inline CSS so they
 * can reference DS tokens. The glass variant uses backdrop-filter blur for a
 * frosted-glass effect.
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

  const changeColor =
    stat.changeType === 'increase'
      ? 'var(--ds-color-success)'
      : stat.changeType === 'decrease'
        ? 'var(--ds-color-error)'
        : undefined;

  const cardStyle: React.CSSProperties = {
    cursor: onClick ? 'pointer' : undefined,
    minWidth: 0,
    overflow: 'hidden',
    ...(variant === 'outlined'
      ? { border: '1px solid var(--ds-stats-grid-card-border, var(--ds-color-border))' }
      : variant === 'filled'
        ? { background: 'var(--ds-stats-grid-card-filled-bg, var(--ds-color-bg-secondary))' }
        : variant === 'glass'
          ? {
              background: 'var(--ds-stats-grid-card-glass-bg, var(--ds-color-alpha-white-50))',
              backdropFilter: 'blur(12px)',
              border: '1px solid var(--ds-stats-grid-card-glass-border, var(--ds-color-alpha-white-20))',
            }
          : {}),
  };

  const prefix = (
    <>
      {stat.icon && <span style={{ marginRight: 8 }}>{stat.icon}</span>}
      {stat.prefix}
    </>
  );

  return (
    <Card style={cardStyle} onClick={onClick} hoverable={!!onClick} size="small">
      <Statistic
        title={stat.label}
        value={displayValue}
        prefix={prefix}
        suffix={stat.suffix}
        valueStyle={{
          color: stat.color,
          maxWidth: '100%',
          overflowWrap: 'anywhere',
        }}
        valueRender={(node) => <span className="ds-nums-tabular">{node}</span>}
      />
      {stat.change != null && (
        <div style={{ fontSize: 12, color: changeColor, marginTop: 4 }}>
          {stat.changeType === 'increase' && <ArrowUpOutlined />}
          {stat.changeType === 'decrease' && <ArrowDownOutlined />}
          {' '}
          {Math.abs(stat.change)}%
        </div>
      )}
      {stat.description && (
        <div style={{ fontSize: 12, color: 'var(--ds-stats-grid-description-color, var(--ds-color-text-muted))', marginTop: 2 }}>
          {stat.description}
        </div>
      )}
      {sparkline && stat.sparklineData && <Sparkline data={stat.sparklineData} color={stat.color} />}
    </Card>
  );
}

/** Skeleton placeholder grid rendered while stat data is being fetched. */
function LoadingSkeleton({
  columns,
  gap,
  viewport,
}: {
  columns: number;
  gap: string | number;
  viewport: 'phone' | 'tablet' | 'desktop';
}) {
  return (
    <div
      style={{
        display: 'grid',
        width: '100%',
        minWidth: 0,
        gridTemplateColumns: resolveStatsGridColumns(columns, viewport),
        gap,
      }}
    >
      {Array.from({ length: columns }).map((_, i) => (
        <Card key={i} loading size="small" />
      ))}
    </div>
  );
}

/**
 * Classic (Ant Design) engine for the StatsGrid pattern component.
 *
 * Lays out StatCard instances in a CSS grid whose column count is controlled
 * by the `columns` prop. Animation is gated by the personality token system
 * and the user's `prefers-reduced-motion` media query via `resolveStatsGridMotion`.
 *
 * @param props - {@link StatsGridProps} controlling stats data, layout, animation, and callbacks.
 * @returns A grid of statistic cards rendered with Ant Design primitives.
 */
export default function ClassicStatsGrid(props: StatsGridProps) {
  const tokens = useTokens();
  const { isMobile, isTablet, prefersReducedMotion } = useBreakpoints();
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
  // Resolve animation settings from the personality system. This merges the
  // explicit `animate` prop with the personality defaults and reduced-motion pref.
  const motion = resolveStatsGridMotion(tokens.personality, prefersReducedMotion, animate);
  const viewport = isMobile ? 'phone' : isTablet ? 'tablet' : 'desktop';

  if (loading) {
    return <LoadingSkeleton columns={columns} gap={gap} viewport={viewport} />;
  }

  return (
    <div
      className={className}
      style={{
        display: 'grid',
        width: '100%',
        minWidth: 0,
        boxSizing: 'border-box',
        gridTemplateColumns: resolveStatsGridColumns(columns, viewport),
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
