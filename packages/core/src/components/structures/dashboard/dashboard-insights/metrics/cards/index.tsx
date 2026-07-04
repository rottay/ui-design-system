"use client";

import { Box, Text, Stack, Flex, Grid } from "@/components/primitives";
import { Activity, TrendingUp, TrendingDown } from "lucide-react";
import { useSmoothCounter } from "@/motion/hooks";
import { DENSITY_PRESETS, resolveDensityStyleVars } from "@/tokens/ts/density";
import type { MetricsProps, KeyMetric } from "../../types";
import {
  METRIC_CARD_BG,
  METRIC_CARD_BORDER,
  METRIC_CARD_BORDER_HOVER,
  METRIC_CARD_ICON_BG,
  METRIC_CARD_ICON_BORDER,
  METRIC_CARD_ICON_COLOR,
  METRIC_CARD_LABEL_COLOR,
  METRIC_CARD_METER_HEIGHT,
  METRIC_CARD_METER_FILL_ERROR,
  METRIC_CARD_METER_FILL_SUCCESS,
  METRIC_CARD_METER_TRACK,
  METRIC_CARD_METER_TRACK_BORDER,
  METRIC_CARD_MIN_HEIGHT,
  METRIC_CARD_NUMBER_FONT_VARIANT,
  METRIC_CARD_NUMBER_MIN_WIDTH,
  METRIC_CARD_RADIUS,
  METRIC_CARD_SHADOW,
  METRIC_CARD_SHADOW_HOVER,
  METRIC_CARD_TREND_COLOR,
  METRIC_CARD_TREND_ERROR_BG,
  METRIC_CARD_TREND_ERROR_BORDER,
  METRIC_CARD_TREND_ERROR_COLOR,
  METRIC_CARD_VALUE_COLOR,
  METRIC_CARD_VALUE_HOVER_COLOR,
  METRIC_MONO_FONT,
  METRIC_PANEL_BADGE_BG,
  METRIC_PANEL_BADGE_BORDER,
  METRIC_PANEL_BADGE_COLOR,
  METRIC_PANEL_BG,
  METRIC_PANEL_BORDER,
  METRIC_PANEL_ICON_BG,
  METRIC_PANEL_ICON_BORDER,
  METRIC_PANEL_RADIUS,
  METRIC_PANEL_SHADOW,
  METRIC_PANEL_TITLE_COLOR,
} from "../tokens";

function MetricCard({ metric, index, cardPadding }: { metric: MetricsProps["metrics"][0]; index: number; cardPadding: string }) {
  const numericValue = parseInt(metric.value.replace(/[^0-9.-]/g, "")) || 0;
  const suffix = metric.value.replace(/[0-9.-]/g, "");
  const animatedValue = Math.floor(useSmoothCounter(0, numericValue, 1200, index * 200));
  const trendColor = metric.positive ? METRIC_CARD_TREND_COLOR : METRIC_CARD_TREND_ERROR_COLOR;
  const meterFill = metric.positive ? METRIC_CARD_METER_FILL_SUCCESS : METRIC_CARD_METER_FILL_ERROR;

  return (
    <Box
      className="metric-card-v3"
      style={{
        position: "relative",
        minHeight: METRIC_CARD_MIN_HEIGHT,
        padding: cardPadding,
        background: METRIC_CARD_BG,
        border: `1px solid ${METRIC_CARD_BORDER}`,
        borderRadius: METRIC_CARD_RADIUS,
        boxShadow: METRIC_CARD_SHADOW,
        overflow: "hidden",
      }}
    >
      <Box
        className="card-top-accent"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: meterFill,
        }}
      />

      <Stack spacing="sm" align="center" style={{ position: "relative" }}>
        <Box
          className="metric-icon-container"
          style={{
            width: 32,
            height: 32,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: METRIC_CARD_ICON_BG,
            border: `2px solid ${METRIC_CARD_ICON_BORDER}`,
            position: "relative",
          }}
        >
          <metric.icon
            className="metric-icon"
            style={{ width: 14, height: 14, color: METRIC_CARD_ICON_COLOR }}
          />
        </Box>

        <Box style={{ position: "relative" }}>
          <Text
            className="metric-value-v3"
            style={{
              fontSize: 24,
              fontWeight: 800,
              color: METRIC_CARD_VALUE_COLOR,
              fontFamily: METRIC_MONO_FONT,
              lineHeight: 1,
              letterSpacing: 0,
              minWidth: METRIC_CARD_NUMBER_MIN_WIDTH,
              textAlign: "center",
              fontVariantNumeric: METRIC_CARD_NUMBER_FONT_VARIANT,
              position: "relative",
            }}
          >
            {animatedValue}{suffix}
          </Text>
        </Box>

        <Text
          className="metric-label"
          size="xs"
          style={{
            color: METRIC_CARD_LABEL_COLOR,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            fontFamily: METRIC_MONO_FONT,
            fontSize: 10,
          }}
        >
          {metric.label}
        </Text>

        <Flex align="center" gap={8}>
          <Box
            className="change-badge"
            style={{
              padding: "4px 8px",
              background: metric.positive ? METRIC_PANEL_BADGE_BG : METRIC_CARD_TREND_ERROR_BG,
              border: `1px solid ${metric.positive ? METRIC_PANEL_BADGE_BORDER : METRIC_CARD_TREND_ERROR_BORDER}`,
            }}
          >
            <Flex align="center" gap={6}>
              {metric.positive ? (
                <TrendingUp className="trend-icon" style={{ width: 10, height: 10, color: trendColor }} />
              ) : (
                <TrendingDown className="trend-icon" style={{ width: 10, height: 10, color: trendColor }} />
              )}
              <Text
                size="xs"
                weight="bold"
                style={{ color: trendColor, fontFamily: METRIC_MONO_FONT }}
              >
                {metric.change}
              </Text>
            </Flex>
          </Box>
        </Flex>

        <Box style={{ width: "100%", height: METRIC_CARD_METER_HEIGHT, background: METRIC_CARD_METER_TRACK, border: `1px solid ${METRIC_CARD_METER_TRACK_BORDER}`, borderRadius: 999, overflow: "hidden", marginTop: 4 }}>
          <Box
            className="mini-progress"
            style={{
              height: "100%",
              width: "75%",
              borderRadius: 999,
              background: meterFill,
            }}
          />
        </Box>
      </Stack>
    </Box>
  );
}

export function MetricsCards({ metrics, density = "comfortable" }: MetricsProps) {
  // Density-resolved card padding (design-language §3): a tenant/brand
  // `--ds-metric-card-padding` override wins, else the density preset
  // (`1rem` comfortable / `0.75rem` compact) with a literal fallback.
  const cardPadding = `var(--ds-metric-card-padding, ${DENSITY_PRESETS[density].cardPadding})`;
  return (
    <Box
      style={{
        ...resolveDensityStyleVars(density),
        height: 415,
        padding: "16px",
        background: METRIC_PANEL_BG,
        border: `1px solid ${METRIC_PANEL_BORDER}`,
        borderRadius: METRIC_PANEL_RADIUS,
        boxShadow: METRIC_PANEL_SHADOW,
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Flex
        align="center"
        justify="between"
        style={{
          paddingBottom: 12,
          marginBottom: 12,
          borderBottom: `1px solid ${METRIC_PANEL_BORDER}`,
          position: "relative",
        }}
      >
        <Flex align="center" gap={10}>
          <Box
            className="header-icon"
            style={{
              width: 32,
              height: 32,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: METRIC_PANEL_ICON_BG,
              border: `1px solid ${METRIC_PANEL_ICON_BORDER}`,
            }}
          >
            <Activity style={{ width: 16, height: 16, color: METRIC_CARD_ICON_COLOR }} />
          </Box>
          <Text weight="bold" style={{ color: METRIC_PANEL_TITLE_COLOR }}>Key Metrics</Text>
        </Flex>
        <Box
          className="live-badge-v3"
          style={{ padding: "6px 12px", background: METRIC_PANEL_BADGE_BG, border: `1px solid ${METRIC_PANEL_BADGE_BORDER}` }}
        >
          <Flex align="center" gap={6}>
            <Box className="live-dot-v3" style={{ width: 8, height: 8, borderRadius: "50%", background: METRIC_PANEL_BADGE_COLOR }} />
            <Text size="xs" weight="bold" style={{ color: METRIC_PANEL_BADGE_COLOR, fontFamily: METRIC_MONO_FONT }}>LIVE</Text>
          </Flex>
        </Box>
      </Flex>

      <Box style={{ flex: 1, overflowY: "auto", minHeight: 0 }} className="metrics-scroll">
        <Grid columns={3} gap={10} style={{ position: "relative" }}>
          {metrics.map((metric: KeyMetric, i: number) => (
            <MetricCard key={metric.label} metric={metric} index={i} cardPadding={cardPadding} />
          ))}
        </Grid>
      </Box>

      <style>{`
        .metric-card-v3 { animation: cardEnter 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) both; transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1); }
        .metric-card-v3:hover { border-color: ${METRIC_CARD_BORDER_HOVER}; transform: translateY(-6px) scale(1.02); box-shadow: ${METRIC_CARD_SHADOW_HOVER}; }
        .metric-card-v3:hover .metric-value-v3 { color: ${METRIC_CARD_VALUE_HOVER_COLOR}; }
        .live-dot-v3 { animation: dotGlow 1.5s ease-in-out infinite; }
        @keyframes cardEnter { from { opacity: 0; transform: translateY(30px) scale(0.9); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes dotGlow { 0%, 100% { box-shadow: 0 0 4px ${METRIC_PANEL_BADGE_COLOR}, 0 0 8px ${METRIC_PANEL_BADGE_COLOR}; } 50% { box-shadow: 0 0 8px ${METRIC_PANEL_BADGE_COLOR}, 0 0 16px ${METRIC_PANEL_BADGE_COLOR}; } }
        .metrics-scroll { scrollbar-width: thin; scrollbar-color: ${METRIC_CARD_ICON_BORDER} transparent; }
        .metrics-scroll::-webkit-scrollbar { width: 4px; }
        .metrics-scroll::-webkit-scrollbar-track { background: transparent; }
        .metrics-scroll::-webkit-scrollbar-thumb { background: ${METRIC_CARD_ICON_BORDER}; border-radius: 2px; }
      `}</style>
    </Box>
  );
}
