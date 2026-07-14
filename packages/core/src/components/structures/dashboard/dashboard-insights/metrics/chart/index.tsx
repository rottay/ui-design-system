"use client";

import { useState } from "react";
import { Box, Text, Stack, Flex } from "@/components/primitives";
import { Activity, TrendingUp, TrendingDown } from "lucide-react";
import { useSmoothCounter } from "@/motion/hooks";
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
  METRIC_CARD_NUMBER_FONT_VARIANT,
  METRIC_CARD_NUMBER_MIN_WIDTH,
  METRIC_CARD_PADDING,
  METRIC_CARD_RADIUS,
  METRIC_CARD_SHADOW,
  METRIC_CARD_SHADOW_HOVER,
  METRIC_CARD_TREND_COLOR,
  METRIC_CARD_TREND_ERROR_COLOR,
  METRIC_CARD_TREND_WARNING_COLOR,
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
  METRIC_PANEL_SECTION_ALT_BG,
  METRIC_PANEL_RADIUS,
  METRIC_PANEL_SHADOW,
  METRIC_PANEL_TITLE_COLOR,
} from "../tokens";

function ChartRow({ metric, index, maxValue }: { metric: MetricsProps["metrics"][0]; index: number; maxValue: number }) {
  const numericValue = parseInt(metric.value.replace(/[^0-9.-]/g, "")) || 0;
  const suffix = metric.value.replace(/[0-9.-]/g, "");
  const animatedValue = Math.floor(useSmoothCounter(0, numericValue, 1000, index * 100));
  const [isHovered, setIsHovered] = useState(false);
  const percentage = Math.min((numericValue / maxValue) * 100, 100);
  const trendColor = metric.positive ? METRIC_CARD_TREND_COLOR : METRIC_CARD_TREND_ERROR_COLOR;
  const meterFill = metric.positive ? METRIC_CARD_METER_FILL_SUCCESS : METRIC_CARD_METER_FILL_ERROR;

  return (
    <Box
      className="metric-chart-row-v3"
      data-part="metric-row"
      data-positive={metric.positive}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ padding: METRIC_CARD_PADDING, background: METRIC_CARD_BG, border: `1px solid ${METRIC_CARD_BORDER}`, borderRadius: METRIC_CARD_RADIUS, boxShadow: METRIC_CARD_SHADOW, position: "relative", overflow: "hidden" }}
    >
      <Box data-part="accent-bar" style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: isHovered ? 4 : 3, background: meterFill, transition: "width 0.2s ease" }} />

      <Flex align="center" justify="between" style={{ marginBottom: 8, position: "relative" }}>
        <Flex align="center" gap={10}>
          <Box data-part="metric-icon-box" style={{ width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", background: METRIC_CARD_ICON_BG, border: `1px solid ${METRIC_CARD_ICON_BORDER}`, position: "relative" }}>
            <metric.icon data-part="metric-icon" style={{ width: 14, height: 14, color: METRIC_CARD_ICON_COLOR }} />
          </Box>
          <Stack spacing="none">
            <Text size="sm" weight="medium" data-part="metric-label" style={{ color: METRIC_CARD_LABEL_COLOR, fontSize: 13 }}>{metric.label}</Text>
            <Flex align="center" gap={4}>
              {metric.positive ? <TrendingUp data-part="trend-icon" style={{ width: 10, height: 10, color: trendColor }} /> : <TrendingDown data-part="trend-icon" style={{ width: 10, height: 10, color: trendColor }} />}
              <Text size="xs" data-part="metric-change" style={{ color: trendColor, fontFamily: METRIC_MONO_FONT, fontSize: 9 }}>{metric.change}</Text>
            </Flex>
          </Stack>
        </Flex>
        <Text data-part="metric-value" style={{ fontSize: 22, fontWeight: 800, color: isHovered ? METRIC_CARD_VALUE_HOVER_COLOR : METRIC_CARD_VALUE_COLOR, fontFamily: METRIC_MONO_FONT, letterSpacing: 0, minWidth: METRIC_CARD_NUMBER_MIN_WIDTH, textAlign: "right", fontVariantNumeric: METRIC_CARD_NUMBER_FONT_VARIANT, transition: "color 0.2s ease" }}>{animatedValue}{suffix}</Text>
      </Flex>

      <Box data-part="meter-track" style={{ height: METRIC_CARD_METER_HEIGHT, background: METRIC_CARD_METER_TRACK, border: `1px solid ${METRIC_CARD_METER_TRACK_BORDER}`, borderRadius: 999, position: "relative", overflow: "hidden" }}>
        <Box data-part="meter-fill" style={{ position: "absolute", top: 0, left: 0, height: "100%", width: percentage + "%", background: meterFill, borderRadius: 999, transition: "background 0.3s ease" }} />
      </Box>

      <Flex justify="between" align="center" style={{ marginTop: 4 }}>
        <Text size="xs" data-part="progress-label" style={{ color: METRIC_CARD_LABEL_COLOR, fontFamily: METRIC_MONO_FONT, fontSize: 9 }}>Progress</Text>
        <Text size="xs" weight="bold" data-part="progress-percent" style={{ color: metric.positive ? METRIC_CARD_TREND_COLOR : METRIC_CARD_TREND_WARNING_COLOR, fontFamily: METRIC_MONO_FONT, fontSize: 9 }}>{Math.round(percentage)}%</Text>
      </Flex>
    </Box>
  );
}

export function MetricsChart({ metrics }: MetricsProps) {
  const maxValue = Math.max(...metrics.map((m: KeyMetric) => parseInt(m.value.replace(/[^0-9.-]/g, "")) || 0), 1);

  return (
    <Box className="ds-metrics-chart" data-part="root" style={{ height: 415, padding: "16px", background: METRIC_PANEL_BG, border: `1px solid ${METRIC_PANEL_BORDER}`, borderRadius: METRIC_PANEL_RADIUS, boxShadow: METRIC_PANEL_SHADOW, position: "relative", overflow: "hidden", display: "flex", flexDirection: "column" }}>
      <Flex align="center" justify="between" data-part="header" style={{ paddingBottom: 12, marginBottom: 12, borderBottom: `1px solid ${METRIC_PANEL_BORDER}`, position: "relative" }}>
        <Flex align="center" gap={8}>
          <Box data-part="panel-icon-box" style={{ width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", background: METRIC_PANEL_ICON_BG, border: `1px solid ${METRIC_PANEL_ICON_BORDER}` }}>
            <Activity data-part="panel-icon" style={{ width: 14, height: 14, color: METRIC_CARD_ICON_COLOR }} />
          </Box>
          <Text weight="bold" size="sm" data-part="title" style={{ color: METRIC_PANEL_TITLE_COLOR }}>Performance</Text>
        </Flex>
        <Flex align="center" gap={4} data-part="live-badge" style={{ padding: "4px 8px", background: METRIC_PANEL_BADGE_BG, border: `1px solid ${METRIC_PANEL_BADGE_BORDER}` }}>
          <Box className="live-dot-chart" data-part="live-dot" style={{ width: 6, height: 6, borderRadius: "50%", background: METRIC_PANEL_BADGE_COLOR }} />
          <Text size="xs" weight="bold" data-part="live-label" style={{ color: METRIC_PANEL_BADGE_COLOR, fontFamily: METRIC_MONO_FONT, fontSize: 9 }}>LIVE</Text>
        </Flex>
      </Flex>

      <Box data-part="scroll-area" style={{ flex: 1, overflowY: "auto", minHeight: 0 }} className="metrics-scroll">
        <Stack spacing="sm">
          {metrics.map((metric: KeyMetric, i: number) => <ChartRow key={metric.label} metric={metric} index={i} maxValue={maxValue} />)}
        </Stack>
      </Box>

      <style>{`
        .metric-chart-row-v3 { animation: slideIn 0.4s ease-out both; transition: all 0.2s ease; }
        .metric-chart-row-v3:hover { background: ${METRIC_PANEL_SECTION_ALT_BG}; border-color: ${METRIC_CARD_BORDER_HOVER}; box-shadow: ${METRIC_CARD_SHADOW_HOVER}; transform: translateX(4px); }
        .live-dot-chart { animation: glow 2s ease-in-out infinite; }
        @keyframes slideIn { from { opacity: 0; transform: translateX(-10px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes glow { 0%, 100% { box-shadow: 0 0 3px ${METRIC_PANEL_BADGE_COLOR}, 0 0 6px ${METRIC_PANEL_BADGE_COLOR}; } 50% { box-shadow: 0 0 6px ${METRIC_PANEL_BADGE_COLOR}, 0 0 12px ${METRIC_PANEL_BADGE_COLOR}; } }
        .metrics-scroll { scrollbar-width: thin; scrollbar-color: ${METRIC_CARD_ICON_BORDER} transparent; }
        .metrics-scroll::-webkit-scrollbar { width: 4px; }
        .metrics-scroll::-webkit-scrollbar-track { background: transparent; }
        .metrics-scroll::-webkit-scrollbar-thumb { background: ${METRIC_CARD_ICON_BORDER}; border-radius: 2px; }
      `}</style>
    </Box>
  );
}
