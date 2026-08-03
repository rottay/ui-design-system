/**
 * @fileoverview StatsHeader — structures-tier "Pulse Cards" implementation.
 *
 * @description
 * Operational stat cards above dashboard content. COMPOSITION LAW (S04):
 * the metric core (label, value, prefix/suffix, count-up) is the certified
 * Statistic primitive — the same composition stats-grid PT16 landed, so the
 * hand-rolled useCountUp, the inline value typography and the bespoke
 * label/affix spans are retired. The loading placeholder is the Skeleton
 * primitive; the back-compat progress meter is the Progress primitive (the
 * per-stat accent reaches it through its own `strokeColor` channel). The
 * trend icons are the governed semantic roles (`data-trend` /
 * `data-trend-down`), never raw inline SVG.
 *
 * What the pattern keeps: the card chrome + glow (5-token `data-accent`
 * consumer channels), the sparkline dots (decorative pattern-owned data
 * viz, aria-hidden, hover ping in CSS), the change indicator (signed value
 * + period, pattern-owned like stats-grid's trend pill), the insight line,
 * and the container-query responsive frame (no JS breakpoints left).
 *
 * @category Structures
 */

'use client';

import type { CSSProperties } from 'react';

import { Box, Flex } from '../../../../../primitives/layout';
import { Statistic, Text } from '../../../../../primitives/display';
import { Progress, Skeleton } from '../../../../../primitives/feedback';
import { DataTrendIcon } from '@/graphics/icons/presentation/semantic/generated/roles/data-trend';
import { DataTrendDownIcon } from '@/graphics/icons/presentation/semantic/generated/roles/data-trend-down';

import type { StatItem, StatsHeaderProps, AccentColor } from '../../contracts';

// ============================================================================
// SPARKLINE DOTS (pattern-owned decorative data viz — hover ping is CSS-owned)
// ============================================================================

function SparklineDots({ dots, accent }: { dots: number[]; accent: AccentColor }) {
  const maxVal = Math.max(...dots, 1);

  return (
    <Flex align="center" gap={6} data-part="spark-dots" aria-hidden="true">
      {dots.slice(0, 7).map((val, i) => {
        const normalized = val / maxVal;
        const opacity = 0.15 + normalized * 0.85;

        return (
          <Box
            key={`dot-${i}`}
            data-part="spark-dot"
            data-accent={accent}
            data-dot-index={i}
            style={{
              /* runtime instance channel — the skin owns the declaration */
              '--_ds-stats-header-spark-dot-opacity': opacity,
            } as CSSProperties}
          />
        );
      })}
    </Flex>
  );
}

// ============================================================================
// CHANGE INDICATOR (pattern-owned pill; the icon is the state shape)
// ============================================================================

/**
 * Signed change value with the governed trend icon and the optional period
 * line. The icon carries the direction (never colour alone); the skin's
 * `data-change` channels carry the tint. Neutral renders no icon, same as
 * the stats-grid trend pill.
 */
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
  const sign = changeType === 'increase' ? '+' : '';
  const displayText = changeLabel ?? `${sign}${change}`;

  const TrendIcon =
    changeType === 'increase' ? DataTrendIcon : changeType === 'decrease' ? DataTrendDownIcon : null;

  return (
    <Flex direction="column" align="end" gap={2} data-part="change-indicator">
      <Flex align="center" gap={3} data-part="change-row" data-change={changeType}>
        {TrendIcon && <TrendIcon decorative size={13} />}
        <Text data-part="change-value" data-change={changeType}>
          {displayText}
        </Text>
      </Flex>
      {periodLabel && (
        <Text data-part="change-period">
          {periodLabel}
        </Text>
      )}
    </Flex>
  );
}

// ============================================================================
// STAT CARD
// ============================================================================

function StatCard({ stat }: { stat: StatItem }) {
  const accent = stat.accentColor ?? 'primary';
  const isClickable = !!stat.onClick;

  return (
    <Box
      data-part="stat-card"
      data-accent={accent}
      data-clickable={isClickable}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={
        isClickable
          ? (e) => {
              if (e.key !== 'Enter' && e.key !== ' ') return;
              e.preventDefault();
              stat.onClick?.();
            }
          : undefined
      }
      onClick={stat.onClick}
    >
      {/* Top row: the composed metric + the pattern's change pill + the
          corner icon. */}
      <div data-part="stat-top">
        <div data-part="statistic">
          {/* The value's editorial scale is drained to the skin, which owns
              the `--ds-stats-header-value-font-size/-font-weight` channels
              (the compact container cut retunes the size channel). */}
          <Statistic
            title={stat.label}
            value={stat.value}
            prefix={stat.prefix}
            suffix={stat.suffix}
            animateValue
            countFrom={0}
          />
        </div>
        {stat.change !== undefined && (
          <ChangeIndicator
            change={stat.change}
            changeType={stat.changeType}
            changeLabel={stat.changeLabel}
            periodLabel={stat.periodLabel}
          />
        )}
        {stat.icon && (
          <Box data-part="stat-icon" aria-hidden="true">
            {stat.icon}
          </Box>
        )}
      </div>

      {/* Sparkline dots (pattern-owned decorative data viz) */}
      {stat.sparkDots && stat.sparkDots.length > 0 && (
        <SparklineDots dots={stat.sparkDots} accent={accent} />
      )}

      {/* Progress meter (secondary, backwards compat): the composed Progress
          primitive; the per-stat accent rides its strokeColor channel. */}
      {stat.progress !== undefined && !stat.sparkDots && (
        <div data-part="stat-progress" data-accent={accent}>
          <Progress
            percent={Math.max(0, Math.min(100, stat.progress))}
            showInfo={false}
            strokeColor={`var(--ds-color-${accent})`}
          />
        </div>
      )}

      {/* Contextual insight */}
      {stat.insight && (
        <Text data-part="stat-insight">
          {stat.insight}
        </Text>
      )}

      {/* Gradient glow from bottom (decorative) */}
      <Box data-part="card-glow" aria-hidden="true" />
    </Box>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * StatsHeader - Pulse Cards
 *
 * Operational stat cards composed on the Statistic / Skeleton / Progress
 * primitives. The responsive frame is container-driven: the root is the
 * `ds-stats-header` container and the skin owns the 1/2/N-column cuts; the
 * engine only publishes the wide-column count on a quoted channel.
 */
function StatsHeaderImpl({ stats, loading = false }: StatsHeaderProps) {
  return (
    <Box
      className="ds-stats-header"
      data-part="root"
      data-loading={loading ? 'true' : 'false'}
      aria-busy={loading || undefined}
      style={{
        '--ds-stats-header-columns': Math.max(Math.min(stats.length, 4), 1),
      } as CSSProperties}
    >
      <div data-part="card-grid">
        {loading
          ? Array.from({ length: stats.length || 4 }).map((_, i) => (
              <Box data-part="skeleton-card" key={`skeleton-${i}`}>
                {/* The composed Skeleton mirrors the metric (title + value +
                    supporting lines); its paint is skeleton.css's. */}
                <Skeleton title paragraph={{ rows: 2 }} />
              </Box>
            ))
          : stats.map((stat) => <StatCard key={stat.key} stat={stat} />)}
      </div>
    </Box>
  );
}

export default StatsHeaderImpl;
