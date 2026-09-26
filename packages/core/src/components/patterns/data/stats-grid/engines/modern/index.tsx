"use client";

/**
 * @fileoverview Modern engine for the StatsGrid pattern.
 *
 * Premium stat-card grid with:
 * - Clear number hierarchy (large bold value, muted label, colored trend)
 * - The adaptive layout kit's auto-fit recipe (WO-FAM-12): the root IS the
 *   Grid primitive with `autoFit`, so the tracks come from the card footprint
 *   channels and the container's compact posture takes one column. The engine
 *   makes no viewport decision of its own (classic/rustic keep the shared
 *   `resolveStatsGridColumns` ladder; Modern no longer calls it)
 * - `adapt` resolved at the postures in force, stamped as `data-posture`
 * - Animated value count-up with cubic ease-out
 * - Loading state derived from the grid's own `data-part` anatomy by the shared
 *   `AnatomySkeleton` renderer (never a hand-built skeleton)
 * - Mini SVG sparkline charts painted by the skin through the per-stat
 *   `--ds-stats-grid-accent` channel (roles, never local literals)
 * - Quiet loading/empty/error states on the same root frame
 * - All styling via DS tokens -- zero hardcoded colors
 *
 * @example
 * <ModernStatsGrid
 *   stats={[{ key: 'users', label: 'Active Users', value: 1234, change: 5.2, changeType: 'increase' }]}
 *   minItem="lg"
 *   variant="glass"
 *   animate
 * />
 */

import React, { useMemo, useRef } from "react";
import { useBreakpoints } from "@/infrastructure/runtime/responsive";
import { useAdaptation } from "@/infrastructure/runtime/adaptation";
import { useTokens } from '@/infrastructure/runtime/theming/composition/react/tokens';
import { useOptionalTranslation } from '@/infrastructure/runtime/i18n';
import ModernStatistic from '../../../../../primitives/display/statistic/engines/modern';
import { VisuallyHidden } from '../../../../../primitives/foundation';
import { Grid } from '../../../../../primitives/layout/grid';
import { GAP_MAP, type GridGap } from '../../../../../primitives/layout/grid/contracts';
import { AnatomySkeleton } from '../../../../../primitives/feedback/skeleton';
import { DataTrendIcon } from '@/graphics/icons/semantic/generated/roles/data-trend';
import { DataTrendDownIcon } from '@/graphics/icons/semantic/generated/roles/data-trend-down';
import { StatusErrorIcon } from '@/graphics/icons/semantic/generated/roles/status-error';
import type { StatsGridAdaptation, StatsGridProps } from "../../contracts";
import type { StatDef } from "../../../../../../foundation/contracts/runtime/components/patterns/core";
import { resolveStatsGridMotion } from "../../foundation/personality";

/* ---------------------------------------------------------------------------
 * Gap
 * --------------------------------------------------------------------------- */

const isGridGap = (gap: string): gap is GridGap =>
  Object.prototype.hasOwnProperty.call(GAP_MAP, gap);

/**
 * A number or a Grid rung reaches the primitive as its own `gap`; any other
 * CSS length rides the grid's gap channel. Unstated, the grid's rung paints.
 */
function gridGap(gap: number | string | undefined): {
  gap?: number | GridGap;
  channel?: React.CSSProperties;
} {
  if (gap === undefined) return {};
  if (typeof gap === "number" || isGridGap(gap)) return { gap };
  return { channel: { "--ds-grid-gap": gap } as React.CSSProperties };
}

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
    .join(" ");
}

/**
 * Tiny SVG sparkline chart with gradient fill beneath the line.
 *
 * Painting is skin-owned: the polyline stroke and the gradient stops read the
 * per-stat `--ds-stats-grid-accent` channel (falling back to the primary
 * ramp). An SVG presentation attribute cannot resolve `var()`, so the former
 * attribute-based fallback painted an ungoverned black whenever a stat had no
 * explicit `color` -- moving paint to the skin fixed that and made the accent
 * channel the single source of truth. Geometry stays in the viewBox; the skin
 * stretches the svg to the card's inline size while
 * `vector-effect="non-scaling-stroke"` keeps the stroke weight honest.
 */
function Sparkline({ data, id }: { data: number[]; id: string }) {
  if (!data || data.length < 2) return null;
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
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs data-part="sparkline-defs">
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop data-part="sparkline-stop" data-kind="head" offset="0%" />
          <stop data-part="sparkline-stop" data-kind="tail" offset="100%" />
        </linearGradient>
      </defs>
      <polygon
        data-part="sparkline-area"
        points={fillPoints}
        fill={`url(#${gradientId})`}
      />
      <polyline
        data-part="sparkline-line"
        points={points}
        fill="none"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

/* ---------------------------------------------------------------------------
 * Trend indicator (pattern-owned anatomy; the Statistic primitive carries
 * label/value/affix and the count-up, the pattern keeps its trend pill)
 * --------------------------------------------------------------------------- */

/**
 * Renders the governed trend icon + percentage change in the appropriate
 * semantic tint. The icon is the state shape (never a Unicode arrow and never
 * color alone); the tint comes from the skin's data-change channels. The
 * direction is also spelled out for assistive tech through a visually-hidden
 * localized word (reusing the catalog keys of the composed Statistic
 * primitive), so the pill never rides hue or glyph alone.
 */
function TrendIndicator({
  change,
  changeType,
}: {
  change: number;
  changeType?: StatDef["changeType"];
}) {
  const i18n = useOptionalTranslation('components');
  const tOr = (key: string, fallback: string): string => {
    const resolved = i18n?.t(key);
    if (!resolved || resolved === key || resolved === `components.${key}`) return fallback;
    return resolved;
  };
  const TrendIcon =
    changeType === "increase"
      ? DataTrendIcon
      : changeType === "decrease"
      ? DataTrendDownIcon
      : null;
  const direction =
    changeType === "increase"
      ? tOr('statistic.trendPositive', 'Increasing')
      : changeType === "decrease"
      ? tOr('statistic.trendNegative', 'Decreasing')
      : tOr('statistic.trendNeutral', 'No change');

  return (
    <span
      className="ds-stats-grid__trend"
      data-part="trend"
      data-change={changeType ?? "neutral"}
    >
      {TrendIcon && <TrendIcon size={12} decorative />}
      <VisuallyHidden>{direction}</VisuallyHidden>
      {Math.abs(change)}%
    </span>
  );
}

/* ---------------------------------------------------------------------------
 * StatCard
 * --------------------------------------------------------------------------- */

/**
 * Individual statistic card. The metric anatomy (title eyebrow, value,
 * prefix/suffix, count-up animation) COMPOSES the certified Statistic
 * primitive; the pattern keeps only its own surface (card + variants), the
 * icon, the trend pill, the description and the sparkline.
 */
function StatCard({
  stat,
  sparkline,
  variant,
  animate,
  onClick,
}: {
  stat: StatDef;
  sparkline?: boolean;
  variant: StatsGridProps["variant"];
  animate?: boolean;
  onClick?: () => void;
}) {
  const cardStyle: React.CSSProperties = {
    "--ds-stats-grid-accent": stat.color,
  } as React.CSSProperties;

  // Interactivity stays behavioral (data-interactive); the cursor and the
  // transition live in the skin. No hand-concatenated aria-label: the
  // accessible name is computed from the full card content (label, the
  // trend's visually-hidden localized direction, value, description), which
  // is strictly richer and always localized, unlike the former
  // `${label}: ${value}` string that dropped the trend and the description.
  return (
    <div
      className="ds-stats-grid__card"
      data-part="card"
      data-variant={variant || "default"}
      data-interactive={onClick ? "true" : "false"}
      style={cardStyle}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              // Button role contract: Enter AND Space activate (Space scrolls
              // the page without preventDefault).
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
    >
      {/* Header row: pattern icon + the composed metric + the pattern's
          trend pill on the far end. */}
      <div data-part="label-row">
        {stat.icon && (
          <span
            className="ds-stats-grid__icon"
            data-part="icon"
          >
            {stat.icon}
          </span>
        )}
        <div data-part="statistic">
          <ModernStatistic
            title={stat.label}
            value={stat.value}
            prefix={stat.prefix}
            suffix={stat.suffix}
            animateValue={animate}
            countFrom={0}
            valueStyle={{
              fontSize: "var(--ds-stats-grid-value-font-size, 1.75rem)",
              fontWeight: "var(--ds-stats-grid-value-font-weight, 700)",
              lineHeight: 1.1,
              letterSpacing: "var(--ds-stats-grid-value-letter-spacing, -0.02em)",
              maxWidth: "100%",
              overflowWrap: "anywhere",
            }}
          />
        </div>
        {stat.change != null && (
          <TrendIndicator change={stat.change} changeType={stat.changeType} />
        )}
      </div>

      {/* Description */}
      {stat.description && (
        <span
          className="ds-stats-grid__description"
          data-part="description"
        >
          {stat.description}
        </span>
      )}

      {/* Sparkline chart area (paint is skin-owned via the accent channel) */}
      {sparkline && stat.sparklineData && (
        <Sparkline data={stat.sparklineData} id={stat.key} />
      )}
    </div>
  );
}

/* ---------------------------------------------------------------------------
 * Loading anatomy
 * --------------------------------------------------------------------------- */

/**
 * One placeholder stat card, stamped with the parts a loaded card stamps
 * (card > label-row > statistic > title + value, and the trend pill). With no
 * data there is no copy to measure, so the skin gives these parts their
 * loading footprint; the shared renderer reads them and draws the bones.
 */
function PlaceholderStatCard({ variant }: { variant: StatsGridProps["variant"] }) {
  return (
    <div
      className="ds-stats-grid__card"
      data-part="card"
      data-variant={variant || "default"}
      data-interactive="false"
    >
      <div data-part="label-row">
        <div data-part="statistic">
          <div data-part="title" />
          <div data-part="value" />
        </div>
        <span className="ds-stats-grid__trend" data-part="trend" />
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------------
 * ModernStatsGrid (main export)
 * --------------------------------------------------------------------------- */

/**
 * Modern engine for the StatsGrid pattern component.
 *
 * Renders an auto-fit grid of premium stat cards styled entirely with DS
 * tokens. Supports the card footprint preset, sparklines, variant styles,
 * animated count-up values, a quiet error posture, and custom renderStat
 * slots.
 *
 * @param props - {@link StatsGridProps} controlling stats data, layout, animation, and callbacks.
 * @returns A grid of statistic cards.
 */
export default function ModernStatsGrid(props: StatsGridProps) {
  const tokens = useTokens();
  // Motion preference only: the layout makes no viewport decision here.
  const { prefersReducedMotion } = useBreakpoints();
  // Component-owned strings with the English floor (echo-guarded): the empty
  // state reuses the catalog's generic `empty.description` ("No data"); the
  // error notice is channel-ahead-of-catalog (`statsGrid.error.description`,
  // proposed) with its English floor until the coordinator merges the key.
  const i18n = useOptionalTranslation('components');
  const tOr = (key: string, fallback: string): string => {
    const resolved = i18n?.t(key);
    if (!resolved || resolved === key || resolved === `components.${key}`) return fallback;
    return resolved;
  };
  const {
    stats,
    renderStat,
    columns = 4,
    minItem,
    templateColumns,
    adapt,
    sparkline,
    gap,
    variant = "default",
    animate,
    onStatClick,
    loading,
    error,
    className,
    style,
  } = props;

  // Resolve animation settings from the personality token system.
  // Respects user's prefers-reduced-motion OS preference.
  const motion = resolveStatsGridMotion(
    tokens.personality,
    prefersReducedMotion,
    animate
  );
  // The posture this grid is actually in, resolved through the shared runtime.
  const rootRef = useRef<HTMLDivElement | null>(null);
  const adaptationBase = useMemo<StatsGridAdaptation>(() => ({ minItem }), [minItem]);
  const { adaptation, postureAttribute } = useAdaptation<StatsGridAdaptation>(adapt, {
    base: adaptationBase,
    containerRef: rootRef,
  });
  const resolvedGap = gridGap(gap);
  const rootClassName = ["ds-pattern-stats-grid", "ds-engine-modern", className]
    .filter(Boolean)
    .join(" ");
  const gridStyle = { ...resolvedGap.channel, ...style } as React.CSSProperties;

  // The column axis is the adaptive layout kit's (WO-FAM-12): the Grid
  // primitive's auto-fit recipe sizes the tracks from the card footprint
  // channels and the compact posture takes one column. `columns` no longer
  // decides tracks here; an explicit `templateColumns` (or the caller's
  // `style.gridTemplateColumns`) still wins.
  const renderGrid = (loadingState: boolean, children: React.ReactNode) => (
    <Grid
      ref={rootRef}
      autoFit
      minItem={adaptation.minItem}
      templateColumns={templateColumns}
      gap={resolvedGap.gap}
      className={rootClassName}
      data-part="root"
      data-loading={loadingState ? "true" : "false"}
      data-variant={variant}
      data-posture={postureAttribute}
      style={gridStyle}
    >
      {children}
    </Grid>
  );

  // The loading state is this grid's OWN anatomy, read by the shared
  // renderer: `columns` placeholder cards stamped with the parts a loaded card
  // stamps. The renderer wraps the family root, so the bones are measured
  // against the real grid -- same track model, same gap, same posture.
  if (loading) {
    return (
      <AnatomySkeleton>
        {renderGrid(
          true,
          Array.from({ length: Math.max(1, columns) }).map((_, index) => (
            <PlaceholderStatCard key={index} variant={variant} />
          ))
        )}
      </AnatomySkeleton>
    );
  }

  // Failed fetch: a single quiet notice on the same root frame (never a blank
  // grid or a stack of broken cards). role="status" announces the swap
  // politely and the governed status icon carries the state shape, so the
  // error never rides color alone.
  if (error) {
    return (
      <div
        ref={rootRef}
        className={rootClassName}
        data-part="root"
        data-loading="false"
        data-error="true"
        data-variant={variant}
        data-posture={postureAttribute}
        style={style}
      >
        <div data-part="error" role="status">
          <StatusErrorIcon size={16} decorative />
          {tOr('statsGrid.error.description', 'Unable to load data')}
        </div>
      </div>
    );
  }

  // Empty collection: a single quiet state block on the same root (never an
  // accidental blank grid; no domain copy — the generic catalog empty copy).
  if (stats.length === 0) {
    return (
      <div
        ref={rootRef}
        className={rootClassName}
        data-part="root"
        data-loading="false"
        data-variant={variant}
        data-posture={postureAttribute}
        style={style}
      >
        <div data-part="empty">{tOr('empty.description', 'No data')}</div>
      </div>
    );
  }

  return renderGrid(
    false,
    <>
      {stats.map((stat) => {
        const defaultRender = (
          <StatCard
            key={stat.key}
            stat={stat}
            sparkline={sparkline}
            variant={variant}
            animate={motion.animate}
            onClick={onStatClick ? () => onStatClick(stat) : undefined}
          />
        );
        return (
          <React.Fragment key={stat.key}>
            {renderStat ? renderStat(stat, defaultRender) : defaultRender}
          </React.Fragment>
        );
      })}
    </>
  );
}
