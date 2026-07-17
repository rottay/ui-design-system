"use client";

import { useId, useMemo, type CSSProperties } from "react";

import { useResolvedChartGrammar } from "../grammar";
import type { ChartInteraction } from "../interaction/ChartInteraction";
import { useChartInteraction } from "../interaction/useChartInteraction";
import { useChartDimensions } from "../../hooks/use-chart-dimensions";
import {
  buildSvgPieGeometry,
  type ChartGeometryInsets,
  type SvgPieDatum,
} from "./ChartGeometry";
import { ChartRendererSurface } from "./ChartRendererSurface";

export interface SvgPieRendererProps {
  readonly data: readonly SvgPieDatum[];
  readonly ariaLabel: string;
  readonly ariaDescription?: string;
  readonly width?: number;
  readonly height?: number;
  /** Recompute radial geometry from the container width. Defaults to true. */
  readonly responsive?: boolean;
  readonly variant?: "pie" | "donut";
  readonly insets?: ChartGeometryInsets;
  readonly innerRadiusRatio?: number;
  readonly padAngle?: number;
  readonly cornerRadius?: number;
  readonly showLabels?: boolean;
  /** Hide labels below this share of the whole. Defaults to five percent. */
  readonly labelPercentageThreshold?: number;
  readonly centerLabel?: string;
  readonly centerValue?: string;
  readonly interaction?: ChartInteraction<SvgPieDatum>;
  readonly className?: string;
  readonly style?: CSSProperties;
}

/** React-owned semantic SVG pie/donut renderer. D3 only calculates arcs. */
export function SvgPieRenderer({
  data,
  ariaLabel,
  ariaDescription,
  width = 360,
  height = 360,
  responsive = true,
  variant = "pie",
  insets,
  innerRadiusRatio,
  padAngle,
  cornerRadius,
  showLabels = false,
  labelPercentageThreshold = 0.05,
  centerLabel,
  centerValue,
  interaction,
  className,
  style,
}: SvgPieRendererProps): React.ReactElement {
  const grammar = useResolvedChartGrammar();
  const { containerRef, dimensions } = useChartDimensions(
    width,
    height,
    responsive
  );
  const geometryWidth = responsive ? dimensions.width : width;
  const resolvedInnerRadiusRatio =
    innerRadiusRatio ?? (variant === "donut" ? 0.58 : 0);
  const grammarCornerRadius =
    grammar.marks === "human-rounded"
      ? 6
      : grammar.marks === "tactile-temporal"
      ? 3
      : 0;
  const resolvedCornerRadius = cornerRadius ?? grammarCornerRadius;
  const geometry = useMemo(
    () =>
      buildSvgPieGeometry({
        data,
        width: geometryWidth,
        height,
        insets,
        innerRadiusRatio: resolvedInnerRadiusRatio,
        padAngle,
        cornerRadius: resolvedCornerRadius,
      }),
    [
      data,
      geometryWidth,
      height,
      insets,
      padAngle,
      resolvedCornerRadius,
      resolvedInnerRadiusRatio,
    ]
  );
  const interactionItems = useMemo(
    () =>
      geometry.slices.map((slice, column) => {
        const percentageLabel = `${Number(
          (slice.percentage * 100).toFixed(1)
        )}%`;
        const label =
          slice.ariaLabel ??
          `${slice.label}: ${
            slice.valueLabel ?? slice.value
          } (${percentageLabel})`;
        const datum: SvgPieDatum = {
          id: slice.id,
          label: slice.label,
          value: slice.value,
          ...(slice.valueLabel === undefined
            ? {}
            : { valueLabel: slice.valueLabel }),
          ...(slice.ariaLabel === undefined
            ? {}
            : { ariaLabel: slice.ariaLabel }),
        };
        return {
          key: slice.id,
          label,
          datum,
          x: slice.centroidX,
          y: slice.centroidY,
          column,
        };
      }),
    [geometry.slices]
  );
  const interactionState = useChartInteraction({
    items: interactionItems,
    interaction,
    navigation: "horizontal",
  });
  const tooltipId = useId();
  const activeSlice = interactionState.activeKey
    ? geometry.slices.find((slice) => slice.id === interactionState.activeKey)
    : undefined;
  const tooltip =
    interactionState.activeDatum && interaction && interaction.mode !== "static"
      ? interaction.renderTooltip?.(interactionState.activeDatum)
      : undefined;
  const threshold = Number.isFinite(labelPercentageThreshold)
    ? Math.min(1, Math.max(0, labelPercentageThreshold))
    : 0.05;
  const showCenter = geometry.innerRadius > 0 && (centerLabel || centerValue);

  return (
    <ChartRendererSurface
      rendererId="svg.pie"
      ariaLabel={ariaLabel}
      ariaDescription={ariaDescription}
      width={geometry.width}
      height={geometry.height}
      responsive={responsive}
      empty={geometry.slices.length === 0}
      className={["ds-chart-renderer-pie", className].filter(Boolean).join(" ")}
      style={style}
      ownerRef={containerRef}
      interactionMode={interactionState.mode}
      interactionRootProps={interactionState.rootProps}
      tooltip={tooltip}
      tooltipId={tooltipId}
      tooltipKey={interactionState.activeKey ?? undefined}
      tooltipAnchor={
        activeSlice
          ? {
              x: activeSlice.centroidX,
              y: activeSlice.centroidY,
            }
          : undefined
      }
    >
      <g
        data-part="pie-plot"
        data-variant={geometry.innerRadius > 0 ? "donut" : "pie"}
        transform={`translate(${geometry.centerX} ${geometry.centerY})`}
      >
        {geometry.slices.map((slice, sliceIndex) => {
          const percentageLabel = `${Number(
            (slice.percentage * 100).toFixed(1)
          )}%`;
          const accessibleLabel =
            slice.ariaLabel ??
            `${slice.label}: ${
              slice.valueLabel ?? slice.value
            } (${percentageLabel})`;
          const datumProps = interactionState.getDatumProps(slice.id);
          const interactive = interactionState.mode !== "static";
          const actionable =
            interactionState.mode === "select" ||
            interactionState.mode === "drill";
          const markLabel =
            actionable && interaction && interaction.mode !== "static"
              ? `${accessibleLabel}. ${interaction.actionLabel}`
              : accessibleLabel;
          const relativeLabelX = slice.centroidX - geometry.centerX;
          const relativeLabelY = slice.centroidY - geometry.centerY;

          return (
            <g
              key={slice.id}
              data-part="pie-slice-mark"
              data-datum-id={slice.id}
              data-mark-index={sliceIndex % 5}
              data-series-index={sliceIndex % 10}
              data-chart-datum-key={datumProps["data-chart-datum-key"]}
              data-active={datumProps["data-active"]}
              data-focused={datumProps["data-focused"]}
              data-hovered={datumProps["data-hovered"]}
              data-pinned={datumProps["data-pinned"]}
              tabIndex={datumProps.tabIndex}
              role={interactive ? (actionable ? "button" : "img") : undefined}
              aria-label={markLabel}
              aria-describedby={
                datumProps["data-active"] &&
                tooltip !== undefined &&
                tooltip !== null &&
                tooltip !== false
                  ? tooltipId
                  : undefined
              }
            >
              {!interactive ? <title>{accessibleLabel}</title> : null}
              {interactive ? (
                <>
                  <path
                    data-part="interaction-target"
                    d={slice.path}
                    strokeWidth={12}
                    pointerEvents="all"
                    aria-hidden="true"
                  />
                  <path
                    data-part="interaction-halo"
                    d={slice.path}
                    aria-hidden="true"
                  />
                </>
              ) : null}
              <path
                data-part="pie-slice"
                d={slice.path}
                aria-hidden={interactive ? true : undefined}
              />
              {showLabels && slice.percentage >= threshold ? (
                <text
                  data-part="value-label"
                  x={relativeLabelX}
                  y={relativeLabelY}
                  textAnchor="middle"
                  dominantBaseline="central"
                  aria-hidden="true"
                >
                  {slice.valueLabel ?? percentageLabel}
                </text>
              ) : (
                <text
                  data-part="forced-color-value-label"
                  display="none"
                  x={relativeLabelX}
                  y={relativeLabelY}
                  textAnchor="middle"
                  dominantBaseline="central"
                  aria-hidden="true"
                >
                  {percentageLabel}
                </text>
              )}
            </g>
          );
        })}
        {showCenter ? (
          <text
            data-part="pie-center-label"
            textAnchor="middle"
            dominantBaseline="central"
            aria-hidden="true"
          >
            {centerValue ? (
              <tspan x="0" dy={centerLabel ? "-0.45em" : "0"}>
                {centerValue}
              </tspan>
            ) : null}
            {centerLabel ? (
              <tspan x="0" dy={centerValue ? "1.35em" : "0"}>
                {centerLabel}
              </tspan>
            ) : null}
          </text>
        ) : null}
      </g>
    </ChartRendererSurface>
  );
}
