'use client';

/**
 * StatsGrid - Classic Engine (Ant Design)
 */

import React, { useState, useEffect } from 'react';
import { Card, Statistic } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
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
    const from = 0;
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
        valueStyle={{ color: stat.color }}
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

function LoadingSkeleton({ columns, gap }: { columns: number; gap: string | number }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${columns}, 1fr)`, gap }}>
      {Array.from({ length: columns }).map((_, i) => (
        <Card key={i} loading size="small" />
      ))}
    </div>
  );
}

export default function ClassicStatsGrid(props: StatsGridProps) {
  const tokens = useTokens();
  const { prefersReducedMotion } = useBreakpoints();
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
  const motion = resolveStatsGridMotion(tokens.personality, prefersReducedMotion, animate);

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
