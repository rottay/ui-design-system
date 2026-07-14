"use client";

/**
 * @fileoverview Rustic (Vanilla CSS) engine for the StatsGrid pattern.
 *
 * Zero-dependency implementation whose paint lives in the rustic skin and
 * references `--ds-*` CSS custom properties. Compared to Classic and Modern,
 * this variant adds richer interactive feedback (hover lift, focus ring,
 * trend-badge background tints) and supports both "pulse" and "wave" skeleton
 * animations via namespaced skin keyframes. All transitions use
 * personality-aware easing and duration tokens for consistent motion behavior
 * across the design system.
 *
 * @example
 * <RusticStatsGrid
 *   stats={[{ key: 'orders', label: 'Orders', value: 892, change: -3.1, changeType: 'decrease' }]}
 *   columns={2}
 *   variant="filled"
 *   animate
 * />
 */

import React, { useState, useEffect } from "react";
import { useBreakpoints } from "../../../../../hooks/responsive/useBreakpoints";
import { useTokens } from "../../../../../hooks/tokens";
import type { StatsGridProps } from "../StatsGrid.types";
import type { StatDef } from "../../../foundation/types";
import { resolveStatsGridMotion } from "../personality";
import { resolveStatsGridColumns } from "../layout";

/**
 * Maps raw data values to SVG polyline coordinates for a mini sparkline.
 * Guards against division-by-zero when all values are identical via `|| 1`.
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
    .join(" ");
}

/** Tiny SVG sparkline chart rendered below a stat value to visualize trends. */
function Sparkline({ data, color }: { data: number[]; color?: string }) {
  if (!data || data.length < 2) return null;
  return (
    <svg
      data-part="sparkline"
      viewBox="0 0 80 30"
      width={80}
      height={30}
      style={{ display: "block", marginTop: 8 }}
    >
      <polyline
        data-part="sparkline-line"
        points={normalizeSparkline(data)}
        fill="none"
        stroke={color || "var(--ds-color-primary)"}
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
  const [value, setValue] = useState<number | string>(
    animate && typeof target === "number" ? 0 : target
  );

  useEffect(() => {
    if (!animate || typeof target !== "number") {
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

/**
 * Individual stat card using structural inline styles and DS-token skin rules.
 *
 * Hover/focus handlers preserve their historical last-event-wins behavior by
 * exposing behavioral state as data attributes. The skin owns the paint.
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
  variant: StatsGridProps["variant"];
  animate?: boolean;
  animationDuration?: number;
  onClick?: () => void;
}) {
  const displayValue = useAnimatedValue(stat.value, animate, animationDuration);

  // Unicode arrows provide a lightweight trend indicator without icon imports.
  const arrow =
    stat.changeType === "increase"
      ? "\u2191"
      : stat.changeType === "decrease"
      ? "\u2193"
      : "";

  return (
    <div
      className="ds-stats-grid__card"
      data-part="card"
      data-variant={variant || "default"}
      data-interactive={onClick ? "true" : "false"}
      style={
        {
          "--ds-stats-grid-accent": stat.color,
          padding: "var(--ds-card-body-padding, 20px)",
          cursor: onClick ? "pointer" : undefined,
        } as React.CSSProperties
      }
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === "Enter" && onClick() : undefined}
      onFocus={(e) => {
        e.currentTarget.dataset.shadowState = "focus";
      }}
      onBlur={(e) => {
        e.currentTarget.dataset.shadowState = "rest";
      }}
      onMouseEnter={(e) => {
        e.currentTarget.dataset.shadowState = "hover";
        e.currentTarget.dataset.transformState = "hover";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.dataset.shadowState = "rest";
        e.currentTarget.dataset.transformState = "rest";
      }}
    >
      <div
        data-part="label-row"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 4,
        }}
      >
        {stat.icon && (
          <span
            className="ds-stats-grid__icon"
            data-part="icon"
            style={{ fontSize: 16 }}
          >
            {stat.icon}
          </span>
        )}
        <span
          className="ds-stats-grid__label"
          data-part="label"
          style={{
            fontSize: 13,
            fontWeight: 500,
            textTransform:
              "var(--ds-typography-label-transform, none)" as React.CSSProperties["textTransform"],
            letterSpacing:
              "var(--ds-typography-heading-letter-spacing, normal)",
          }}
        >
          {stat.label}
        </span>
      </div>
      <div
        className="ds-nums-tabular ds-stats-grid__value"
        data-part="value"
        style={{
          fontSize: 28,
          fontWeight:
            "var(--ds-typography-heading-font-weight, 700)" as unknown as number,
          lineHeight: 1.2,
          letterSpacing: "-0.02em",
        }}
      >
        {stat.prefix}
        {displayValue}
        {stat.suffix && (
          <span
            className="ds-stats-grid__suffix"
            data-part="suffix"
            style={{ fontSize: 14, fontWeight: 400, marginLeft: 4 }}
          >
            {stat.suffix}
          </span>
        )}
      </div>
      {/* Trend badge: pill-shaped indicator with a tinted background
           matching the trend direction (green for up, red for down). */}
      {stat.change != null && (
        <div
          className="ds-stats-grid__trend"
          data-part="trend"
          data-change={stat.changeType ?? "neutral"}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 3,
            fontSize: 12,
            fontWeight: 600,
            marginTop: 6,
            padding: "2px 6px",
          }}
        >
          {arrow && (
            <span
              data-part="trend-icon"
              style={{ fontSize: 13, lineHeight: 1 }}
            >
              {arrow}
            </span>
          )}
          {Math.abs(stat.change)}%
        </div>
      )}
      {stat.description && (
        <div
          className="ds-stats-grid__description"
          data-part="description"
          style={{
            fontSize: 12,
            marginTop: 2,
          }}
        >
          {stat.description}
        </div>
      )}
      {sparkline && stat.sparklineData && (
        <Sparkline data={stat.sparklineData} color={stat.color} />
      )}
    </div>
  );
}

/**
 * Loading skeleton that supports both "pulse" (opacity fade) and "wave"
 * (gradient sweep) animations via namespaced skin keyframes. The animation
 * type is resolved from the personality token system.
 */
function LoadingSkeleton({
  columns,
  gap,
  animation,
}: {
  columns: number;
  gap: string | number;
  animation: "pulse" | "wave";
}) {
  return (
    <>
      <div
        className="ds-pattern-stats-grid ds-engine-rustic"
        data-part="root"
        data-loading="true"
        data-skeleton-animation={animation}
        style={{
          display: "grid",
          gridTemplateColumns: resolveStatsGridColumns(columns),
          gap,
        }}
      >
        {Array.from({ length: columns }).map((_, i) => (
          <div
            key={i}
            data-part="skeleton"
            style={{
              padding: 16,
            }}
          >
            <div
              data-part="skeleton-bar"
              data-kind="label"
              style={{ width: "50%", height: 12, marginBottom: 8 }}
            />
            <div
              data-part="skeleton-bar"
              data-kind="value"
              style={{ width: "70%", height: 24, marginBottom: 6 }}
            />
            <div
              data-part="skeleton-bar"
              data-kind="trend"
              style={{ width: "30%", height: 10 }}
            />
          </div>
        ))}
      </div>
    </>
  );
}

/**
 * Rustic (Vanilla CSS) engine for the StatsGrid pattern component.
 *
 * Zero-dependency implementation referencing `--ds-*` tokens. Compared to
 * the Classic and Modern engines this variant provides richer interactive
 * feedback (hover lift, focus ring, colored trend badges) while remaining
 * completely framework-independent.
 *
 * @param props - {@link StatsGridProps} controlling stats data, layout, animation, and callbacks.
 * @returns A grid of statistic cards styled by the rustic skin and DS tokens.
 */
export default function RusticStatsGrid(props: StatsGridProps) {
  const tokens = useTokens();
  const { prefersReducedMotion } = useBreakpoints();
  const {
    stats,
    renderStat,
    columns = 4,
    sparkline,
    gap = "var(--ds-card-body-padding, 20px)" as unknown as number,
    variant = "default",
    animate,
    onStatClick,
    loading,
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

  // Show placeholder skeleton during data fetching to prevent layout shift.
  // The skeleton animation style (pulse vs wave) comes from personality tokens.
  if (loading)
    return (
      <LoadingSkeleton
        columns={columns}
        gap={gap}
        animation={motion.skeletonAnimation}
      />
    );

  return (
    <div
      className={["ds-pattern-stats-grid", "ds-engine-rustic", className]
        .filter(Boolean)
        .join(" ")}
      data-part="root"
      data-loading="false"
      data-variant={variant}
      style={{
        display: "grid",
        gridTemplateColumns: resolveStatsGridColumns(columns),
        gap,
        ...style,
      }}
    >
      {stats.map((stat, index) => {
        // Fall back to label+index key when stat.key is not provided,
        // ensuring stable React keys even for dynamically generated stats.
        const statKey = stat.key ?? `${stat.label ?? "stat"}-${index}`;
        // Build the default card first, then allow consumers to override
        // via renderStat while still receiving the default as a fallback.
        const defaultRender = (
          <StatCard
            key={statKey}
            stat={stat}
            sparkline={sparkline}
            variant={variant}
            animate={motion.animate}
            animationDuration={motion.duration}
            onClick={onStatClick ? () => onStatClick(stat) : undefined}
          />
        );
        return (
          <React.Fragment key={statKey}>
            {renderStat ? renderStat(stat, defaultRender) : defaultRender}
          </React.Fragment>
        );
      })}
    </div>
  );
}
