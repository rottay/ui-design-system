/**
 * @fileoverview StatsHeader — structures-tier "Pulse Cards" implementation.
 *
 * @description
 * Operational stat cards with counter animations, sparkline dots,
 * contextual insights, and gradient glow accents. Each card feels like
 * a live metric on an operations dashboard. Lives in `components/structures/`
 * because it is a structures family — a structural strip consumers
 * place above a data table or above dashboard content, not a generic
 * reusable pattern like `charts` or `data-table`.
 *
 * This implementation is engine-agnostic because it composes DS
 * primitives (Box, Flex, Text) which themselves resolve through the
 * engine system.
 *
 * @category Structures
 */

'use client';

import { useState } from 'react';
import type { CSSProperties } from 'react';

import { Box, Flex } from '../../../primitives/layout';
import { Text } from '../../../primitives/display';
import { useBreakpoints } from '../../../../hooks/responsive/useBreakpoints';
import { useSmoothCounter, useReducedMotion } from '../../../../motion/hooks';

import type { StatItem, StatsHeaderProps, AccentColor } from './types';

// ============================================================================
// ACCENT COLOR MAP
// ============================================================================

const ACCENT_CSS_VAR: Record<AccentColor, string> = {
  primary: 'var(--ds-color-primary)',
  success: 'var(--ds-color-success)',
  warning: 'var(--ds-color-warning)',
  error: 'var(--ds-color-error)',
  info: 'var(--ds-color-info)',
};

/**
 * Returns a CSS color string at the given opacity for the accent.
 * Uses color-mix to derive transparent variants from DS tokens.
 */
function accentAtOpacity(accent: AccentColor, opacity: number): string {
  const pct = Math.round(opacity * 100);
  return `color-mix(in srgb, ${ACCENT_CSS_VAR[accent]} ${pct}%, transparent)`;
}

// ============================================================================
// CHANGE COLORS
// ============================================================================

const CHANGE_COLORS: Record<'increase' | 'decrease' | 'neutral', string> = {
  increase: 'var(--ds-color-success)',
  decrease: 'var(--ds-color-error)',
  neutral: 'var(--ds-color-text-muted)',
};

// ============================================================================
// useCountUp (canonical: delegates to useSmoothCounter from motion/hooks)
// ============================================================================

function useCountUp(target: number, duration: number = 600): number {
  const reducedMotion = useReducedMotion();
  const animated = useSmoothCounter(0, target, reducedMotion ? 0 : duration);
  return reducedMotion ? target : Math.round(animated);
}

// ============================================================================
// KEYFRAMES
// ============================================================================

const KEYFRAMES = `
@keyframes pulse-card-skeleton {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 0.2; }
}
@keyframes pulse-dot-ping {
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.8); opacity: 0.4; }
  100% { transform: scale(1); opacity: 1; }
}
`;

// ============================================================================
// SKELETON
// ============================================================================

function SkeletonBar({ width, height }: { width: number; height: number }) {
  return (
    <Box
      data-part="skeleton-bar"
      style={{
        width,
        height,
        borderRadius: 4,
        background: 'var(--ds-color-bg-secondary)',
        animation: 'pulse-card-skeleton 1.5s ease-in-out infinite',
      }}
    />
  );
}

function SkeletonDots() {
  return (
    <Flex align="center" gap={6} style={{ marginTop: 14 }}>
      {Array.from({ length: 7 }).map((_, i) => (
        <Box
          key={`sk-dot-${i}`}
          data-part="skeleton-dot"
          style={{
            width: 4,
            height: 4,
            borderRadius: '50%',
            background: 'var(--ds-color-bg-secondary)',
            animation: 'pulse-card-skeleton 1.5s ease-in-out infinite',
            animationDelay: `${i * 80}ms`,
          }}
        />
      ))}
    </Flex>
  );
}

function SkeletonCard() {
  return (
    <Box
      data-part="skeleton-card"
      style={{
        flex: '1 1 0',
        minWidth: 0,
        padding: '20px 24px',
        background: 'var(--ds-color-bg-primary)',
        border: '1px solid color-mix(in srgb, var(--ds-color-text-primary) 6%, transparent)',
        borderRadius: 12,
        minHeight: 140,
        position: 'relative' as const,
        overflow: 'hidden',
      }}
    >
      <Flex direction="column" gap={12}>
        <SkeletonBar width={80} height={10} />
        <SkeletonBar width={120} height={28} />
        <SkeletonDots />
        <SkeletonBar width={100} height={10} />
      </Flex>
      {/* Skeleton gradient glow */}
      <Box
        data-part="skeleton-glow"
        style={{
          position: 'absolute' as const,
          bottom: 0,
          left: 0,
          right: 0,
          height: 40,
          background: 'linear-gradient(to top, color-mix(in srgb, var(--ds-color-text-primary) 3%, transparent), transparent)',
          pointerEvents: 'none' as const,
        }}
      />
    </Box>
  );
}

// ============================================================================
// SPARKLINE DOTS
// ============================================================================

function SparklineDots({
  dots,
  accent,
  hovered,
}: {
  dots: number[];
  accent: AccentColor;
  hovered: boolean;
}) {
  const reducedMotion = useReducedMotion();
  const maxVal = Math.max(...dots, 1);

  return (
    <Flex align="center" gap={6} style={{ marginTop: 14 }}>
      {dots.slice(0, 7).map((val, i) => {
        const normalized = val / maxVal;
        const opacity = 0.15 + normalized * 0.85;

        return (
          <Box
            key={`dot-${i}`}
            data-part="spark-dot"
            data-accent={accent}
            style={{
              width: 4,
              height: 4,
              borderRadius: '50%',
              background: ACCENT_CSS_VAR[accent],
              opacity,
              transition: 'transform 200ms ease, opacity 200ms ease',
              animation:
                hovered && !reducedMotion
                  ? `pulse-dot-ping 400ms ease ${i * 50}ms`
                  : 'none',
            }}
          />
        );
      })}
    </Flex>
  );
}

// ============================================================================
// CHANGE INDICATOR
// ============================================================================

/** Trending arrow icons rendered as lightweight inline SVGs. */
function TrendingUpIcon({ size = 13 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </svg>
  );
}

function TrendingDownIcon({ size = 13 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="22 17 13.5 8.5 8.5 13.5 2 7" />
      <polyline points="16 17 22 17 22 11" />
    </svg>
  );
}

function MinusIcon({ size = 13 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function ChangeIndicator({
  change,
  changeType = 'neutral',
  changeLabel,
  periodLabel,
}: {
  change: number;
  changeType?: 'increase' | 'decrease' | 'neutral';
  changeLabel?: string;
  periodLabel?: string;
}) {
  const color = CHANGE_COLORS[changeType];
  const sign = changeType === 'increase' ? '+' : '';
  const displayText = changeLabel ?? `${sign}${change}`;

  const IconComponent =
    changeType === 'increase'
      ? TrendingUpIcon
      : changeType === 'decrease'
        ? TrendingDownIcon
        : MinusIcon;

  return (
    <Flex direction="column" align="end" gap={2} data-part="change-indicator">
      <Flex align="center" gap={3} data-part="change-row" data-change={changeType} style={{ color }}>
        <IconComponent size={13} />
        <Text
          data-part="change-value"
          data-change={changeType}
          style={{
            fontSize: 13,
            fontWeight: 600,
            color,
            fontVariantNumeric: 'tabular-nums',
            lineHeight: 1,
          }}
        >
          {displayText}
        </Text>
      </Flex>
      {periodLabel && (
        <Text
          data-part="change-period"
          style={{
            fontSize: 10,
            fontWeight: 500,
            textTransform: 'uppercase' as const,
            letterSpacing: '0.04em',
            color: 'var(--ds-color-text-muted)',
            lineHeight: 1,
          }}
        >
          {periodLabel}
        </Text>
      )}
    </Flex>
  );
}

// ============================================================================
// PROGRESS BAR
// ============================================================================

function ProgressBar({ value, accent }: { value: number; accent: AccentColor }) {
  const clamped = Math.max(0, Math.min(100, value));

  return (
    <Box
      data-part="progress-track"
      style={{
        width: '100%',
        height: 3,
        borderRadius: 2,
        background: 'var(--ds-color-bg-secondary)',
        overflow: 'hidden',
        marginTop: 10,
      }}
    >
      <Box
        data-part="progress-fill"
        data-accent={accent}
        style={{
          width: `${clamped}%`,
          height: '100%',
          borderRadius: 2,
          background: ACCENT_CSS_VAR[accent],
          transition: 'width 400ms ease',
        }}
      />
    </Box>
  );
}

// ============================================================================
// STAT CARD
// ============================================================================

function StatCard({ stat, compact = false }: { stat: StatItem; compact?: boolean }) {
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);
  const accent = stat.accentColor ?? 'primary';
  const isNumeric = typeof stat.value === 'number';
  const numericTarget = isNumeric ? (stat.value as number) : 0;
  const animatedValue = useCountUp(numericTarget, 600);

  const displayValue = isNumeric
    ? animatedValue.toLocaleString()
    : stat.value;

  const isClickable = !!stat.onClick;

  const cardStyle: CSSProperties = {
    flex: '1 1 0',
    minWidth: 0,
    padding: compact ? '18px 18px' : '20px 24px',
    background: 'var(--ds-color-bg-primary)',
    border: '1px solid color-mix(in srgb, var(--ds-color-text-primary) 6%, transparent)',
    borderRadius: 12,
    transition: 'transform 200ms ease, box-shadow 200ms ease',
    position: 'relative',
    overflow: 'hidden',
    minHeight: compact ? 120 : 140,
    cursor: isClickable ? 'pointer' : 'default',
    ...(pressed
      ? {
          transform: 'scale(0.98)',
          boxShadow: '0 1px 3px color-mix(in srgb, var(--ds-color-text-primary) 2%, transparent)',
        }
      : hovered
        ? {
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 24px color-mix(in srgb, var(--ds-color-text-primary) 6%, transparent)',
          }
        : {
            transform: 'translateY(0)',
            boxShadow: '0 1px 3px color-mix(in srgb, var(--ds-color-text-primary) 2%, transparent)',
          }),
  };

  return (
    <Box
      data-part="stat-card"
      data-accent={accent}
      style={cardStyle}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setPressed(false); }}
      onMouseDown={() => { if (isClickable) setPressed(true); }}
      onMouseUp={() => setPressed(false)}
      onClick={stat.onClick}
    >
      {/* Label row: label left, icon right */}
      <Flex justify="between" align="center">
        <Text
          data-part="stat-label"
          style={{
            fontSize: 11,
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            color: 'var(--ds-color-text-muted)',
            lineHeight: 1.4,
          }}
        >
          {stat.label}
        </Text>
        {stat.icon && (
          <Box
            data-part="stat-icon"
            style={{
              color: 'var(--ds-color-text-muted)',
              opacity: 0.6,
              display: 'flex',
              alignItems: 'center',
              lineHeight: 0,
            }}
          >
            {stat.icon}
          </Box>
        )}
      </Flex>

      {/* Value row: value + prefix left, change right */}
      <Flex
        justify="between"
        align="baseline"
        style={{ marginTop: 10 }}
      >
        <Flex align="baseline" gap={4}>
          {stat.prefix && (
            <Text
              data-part="stat-prefix"
              style={{
                fontSize: 20,
                fontWeight: 500,
                color: 'var(--ds-color-text-secondary)',
                lineHeight: 1,
              }}
            >
              {stat.prefix}
            </Text>
          )}
          <Text
            data-part="stat-value"
            style={{
              fontSize: compact ? 28 : 36,
              fontWeight: 800,
              color: 'var(--ds-color-text-primary)',
              fontVariantNumeric: 'tabular-nums',
              lineHeight: 1,
            }}
          >
            {displayValue}
          </Text>
          {stat.suffix && (
            <Text
              data-part="stat-suffix"
              style={{
                fontSize: compact ? 12 : 14,
                fontWeight: 500,
                color: 'var(--ds-color-text-muted)',
                lineHeight: 1,
                marginLeft: 2,
              }}
            >
              {stat.suffix}
            </Text>
          )}
        </Flex>

        {stat.change !== undefined && (
          <ChangeIndicator
            change={stat.change}
            changeType={stat.changeType}
            changeLabel={stat.changeLabel}
            periodLabel={stat.periodLabel}
          />
        )}
      </Flex>

      {/* Sparkline dots */}
      {stat.sparkDots && stat.sparkDots.length > 0 && (
        <SparklineDots
          dots={stat.sparkDots}
          accent={accent}
          hovered={hovered}
        />
      )}

      {/* Progress bar (secondary, backwards compat) */}
      {stat.progress !== undefined && !stat.sparkDots && (
        <ProgressBar value={stat.progress} accent={accent} />
      )}

      {/* Contextual insight */}
      {stat.insight && (
        <Text
          data-part="stat-insight"
          style={{
            fontSize: 11,
            fontWeight: 400,
            fontStyle: 'italic',
            color: 'var(--ds-color-text-muted)',
            marginTop: 8,
            lineHeight: 1.4,
          }}
        >
          {stat.insight}
        </Text>
      )}

      {/* Gradient glow from bottom */}
      <Box
        data-part="card-glow"
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 40,
          background: `linear-gradient(to top, ${accentAtOpacity(accent, 0.06)}, transparent)`,
          pointerEvents: 'none',
        }}
      />
    </Box>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * StatsHeader - Pulse Cards
 *
 * Operational stat cards with counter animations, sparkline dots, contextual
 * insights, and gradient glow accents. Renders 3-5 cards in a responsive
 * horizontal row above data tables.
 *
 * This component is engine-agnostic: it uses DS primitives (Box, Flex, Text)
 * which themselves resolve through the engine system.
 */
function StatsHeaderImpl({ stats, loading = false }: StatsHeaderProps) {
  const { isMobile, isTablet } = useBreakpoints();
  const compact = isMobile || isTablet;
  const columns = isMobile ? 1 : isTablet ? 2 : Math.max(Math.min(stats.length, 4), 1);

  return (
    <Box className="ds-stats-header" data-part="root">
      <style dangerouslySetInnerHTML={{ __html: KEYFRAMES }} />
      <Box
        data-part="card-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
          gap: 12,
          width: '100%',
        }}
      >
        {loading
          ? Array.from({ length: stats.length || 4 }).map((_, i) => (
              <SkeletonCard key={`skeleton-${i}`} />
            ))
          : stats.map((stat) => <StatCard key={stat.key} stat={stat} compact={compact} />)}
      </Box>
    </Box>
  );
}

export default StatsHeaderImpl;
