"use client";

/**
 * @fileoverview Modern engine for the StatsGrid pattern.
 *
 * Premium stat-card grid with:
 * - Clear number hierarchy (large bold value, muted label, colored trend)
 * - Fixed `columns`-count horizontal grid layout (shared with classic/rustic
 *   via resolveStatsGridColumns; the engine themes the tiles, not the layout)
 * - Animated value count-up with cubic ease-out
 * - Premium shimmer skeleton with card-shaped placeholders
 * - Mini SVG sparkline charts for trend visualization
 * - All styling via DS tokens -- zero hardcoded colors
 *
 * @example
 * <ModernStatsGrid
 *   stats={[{ key: 'users', label: 'Active Users', value: 1234, change: 5.2, changeType: 'increase' }]}
 *   columns={4}
 *   variant="glass"
 *   animate
 * />
 */

import React, { useState, useEffect } from "react";
import { useBreakpoints } from "@/infrastructure/runtime/responsive/composition/react/provider/breakpoint-state";
import { useTokens } from '@/infrastructure/runtime/theming/composition/react/tokens';
import type { StatsGridProps } from "../../contracts";
import type { StatDef } from "../../../../../../foundation/contracts/runtime/components/patterns/core";
import { resolveStatsGridMotion } from "../../foundation/personality";
import { resolveStatsGridColumns } from "../../foundation/layout";

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

/** Tiny SVG sparkline chart with gradient fill beneath the line. */
function Sparkline({
  data,
  color,
  id,
}: {
  data: number[];
  color?: string;
  id: string;
}) {
  if (!data || data.length < 2) return null;
  const strokeColor = color || "var(--ds-color-primary-500)";
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
      style={{ marginTop: 8, display: "block", overflow: "visible" }}
      aria-hidden="true"
    >
      <defs data-part="sparkline-defs">
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={strokeColor} stopOpacity={0.2} />
          <stop offset="100%" stopColor={strokeColor} stopOpacity={0} />
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
        stroke={strokeColor}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ---------------------------------------------------------------------------
 * Animated value hook
 * --------------------------------------------------------------------------- */

/**
 * Animates a numeric value from 0 to target using cubic ease-out.
 * String values pass through unchanged since formatted strings cannot be interpolated.
 */
function useAnimatedValue(
  target: number | string,
  animate?: boolean,
  duration = 600
): number | string {
  const [value, setValue] = useState<number | string>(
    animate && typeof target === "number" ? 0 : target
  );

  useEffect(() => {
    if (!animate || typeof target !== "number") {
      setValue(target);
      return;
    }
    const start = performance.now();
    let raf: number;
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(Math.round((target as number) * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, animate, duration]);

  return value;
}

/* ---------------------------------------------------------------------------
 * Trend indicator
 * --------------------------------------------------------------------------- */

/** Renders an arrow + percentage change in the appropriate semantic color. */
function TrendIndicator({
  change,
  changeType,
}: {
  change: number;
  changeType?: StatDef["changeType"];
}) {
  const arrow =
    changeType === "increase"
      ? "\u2191"
      : changeType === "decrease"
      ? "\u2193"
      : "";

  return (
    <span
      className="ds-stats-grid__trend"
      data-part="trend"
      data-change={changeType ?? "neutral"}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 2,
        padding: "2px 6px",
        fontSize: 12,
        fontWeight: 500,
        lineHeight: 1,
      }}
    >
      {arrow} {Math.abs(change)}%
    </span>
  );
}

/* ---------------------------------------------------------------------------
 * StatCard
 * --------------------------------------------------------------------------- */

/**
 * Individual statistic card with clear number hierarchy:
 * - Label: small, muted, secondary text
 * - Value: large, bold, primary text
 * - Trend: color-coded pill with arrow + percentage
 * - Sparkline: optional mini chart area
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

  const cardStyle: React.CSSProperties = {
    "--ds-stats-grid-accent": stat.color,
    padding: "20px 24px",
    display: "flex",
    flexDirection: "column",
    gap: 4,
    position: "relative",
    minWidth: 0,
    overflow: "hidden",
  } as React.CSSProperties;

  // Interactivity remains behavioral; the transition itself lives in the skin.
  const interactiveStyle: React.CSSProperties = onClick
    ? { cursor: "pointer" }
    : {};

  return (
    <div
      className="ds-stats-grid__card"
      data-part="card"
      data-variant={variant || "default"}
      data-interactive={onClick ? "true" : "false"}
      style={{ ...cardStyle, ...interactiveStyle }}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === "Enter" && onClick() : undefined}
      aria-label={onClick ? `${stat.label}: ${stat.value}` : undefined}
    >
      {/* Label row: icon + label */}
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
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 32,
              height: 32,
              fontSize: 16,
              flexShrink: 0,
            }}
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
            letterSpacing: "0.01em",
            lineHeight: 1.2,
          }}
        >
          {stat.label}
        </span>
      </div>

      {/* Value row: main value + trend */}
      <div
        data-part="value-row"
        style={{
          display: "flex",
          alignItems: "baseline",
          gap: 10,
          flexWrap: "wrap",
        }}
      >
        <span
          className="ds-nums-tabular ds-stats-grid__value"
          data-part="value"
          style={{
            fontSize: 28,
            fontWeight: 700,
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
            maxWidth: "100%",
            overflowWrap: "anywhere",
          }}
        >
          {stat.prefix}
          {displayValue}
          {stat.suffix && (
            <span
              className="ds-stats-grid__suffix"
              data-part="suffix"
              style={{
                fontSize: 14,
                fontWeight: 400,
                marginLeft: 4,
              }}
            >
              {stat.suffix}
            </span>
          )}
        </span>

        {stat.change != null && (
          <TrendIndicator change={stat.change} changeType={stat.changeType} />
        )}
      </div>

      {/* Description */}
      {stat.description && (
        <span
          className="ds-stats-grid__description"
          data-part="description"
          style={{
            fontSize: 12,
            lineHeight: 1.4,
            marginTop: 2,
          }}
        >
          {stat.description}
        </span>
      )}

      {/* Sparkline chart area */}
      {sparkline && stat.sparklineData && (
        <Sparkline data={stat.sparklineData} color={stat.color} id={stat.key} />
      )}
    </div>
  );
}

/* ---------------------------------------------------------------------------
 * Loading skeleton
 * --------------------------------------------------------------------------- */

/** Premium loading skeleton with shimmer effect and proper card shapes. */
function LoadingSkeleton({
  columns,
  gap,
  viewport,
}: {
  columns: number;
  gap: string | number;
  viewport: "phone" | "tablet" | "desktop";
}) {
  return (
    <>
      <div
        className="ds-pattern-stats-grid ds-engine-modern ds-stats-grid-skeleton"
        data-part="root"
        data-loading="true"
        style={{
          display: "grid",
          width: "100%",
          minWidth: 0,
          gridTemplateColumns: resolveStatsGridColumns(columns, viewport),
          gap,
        }}
      >
        {Array.from({ length: columns }).map((_, i) => (
          <div
            key={i}
            className="ds-stats-grid-skeleton__item"
            data-part="skeleton"
            style={{
              padding: "20px 24px",
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            {/* Label shimmer */}
            <div
              className="ds-stats-grid-skeleton__bar"
              data-part="skeleton-bar"
              data-kind="label"
              style={{ width: "40%", height: 12 }}
            />
            {/* Value shimmer */}
            <div
              className="ds-stats-grid-skeleton__bar"
              data-part="skeleton-bar"
              data-kind="value"
              style={{ width: "65%", height: 28 }}
            />
            {/* Trend shimmer */}
            <div
              className="ds-stats-grid-skeleton__bar"
              data-part="skeleton-bar"
              data-kind="trend"
              style={{ width: "30%", height: 16 }}
            />
          </div>
        ))}
      </div>
    </>
  );
}

/* ---------------------------------------------------------------------------
 * ModernStatsGrid (main export)
 * --------------------------------------------------------------------------- */

/**
 * Modern engine for the StatsGrid pattern component.
 *
 * Renders a fixed `columns`-track CSS grid of premium stat cards styled
 * entirely with DS tokens. Supports columns, sparklines, variant styles,
 * animated count-up values, and custom renderStat slots.
 *
 * @param props - {@link StatsGridProps} controlling stats data, layout, animation, and callbacks.
 * @returns A grid of statistic cards.
 */
export default function ModernStatsGrid(props: StatsGridProps) {
  const tokens = useTokens();
  const { isMobile, isTablet, prefersReducedMotion } = useBreakpoints();
  const {
    stats,
    renderStat,
    columns = 4,
    sparkline,
    gap = "1rem",
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
  const viewport = isMobile ? "phone" : isTablet ? "tablet" : "desktop";

  // Column axis is a component-layer concern shared by every engine
  // (Quiet Premium spec section 10): one track on phone, up to two on tablet,
  // and the caller's `columns` ceiling on desktop.
  const gridStyle: React.CSSProperties = {
    display: "grid",
    width: "100%",
    minWidth: 0,
    boxSizing: "border-box",
    gridTemplateColumns: resolveStatsGridColumns(columns, viewport),
    gap,
    ...style,
  };

  // Show placeholder skeleton during data fetching to prevent layout shift.
  if (loading) {
    return <LoadingSkeleton columns={columns} gap={gap} viewport={viewport} />;
  }

  return (
    <div
      className={["ds-pattern-stats-grid", "ds-engine-modern", className]
        .filter(Boolean)
        .join(" ")}
      data-part="root"
      data-loading="false"
      data-variant={variant}
      style={gridStyle}
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
