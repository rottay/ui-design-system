"use client";

import { useState } from "react";
import { Box, Text, Stack, Flex } from "@/components/primitives";
import { Activity, TrendingUp, TrendingDown, ChevronRight } from "lucide-react";
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
  METRIC_PANEL_BODY_COLOR,
  METRIC_PANEL_BORDER,
  METRIC_PANEL_ICON_BG,
  METRIC_PANEL_ICON_BORDER,
  METRIC_PANEL_SECTION_ALT_BG,
  METRIC_PANEL_RADIUS,
  METRIC_PANEL_SHADOW,
  METRIC_PANEL_TITLE_COLOR,
} from "../tokens";

function MetricRow({ metric, index, maxValue }: { metric: MetricsProps["metrics"][0]; index: number; maxValue: number }) {
  const numericValue = parseInt(metric.value.replace(/[^0-9.-]/g, "")) || 0;
  const suffix = metric.value.replace(/[0-9.-]/g, "");
  const animatedValue = Math.floor(useSmoothCounter(0, numericValue, 1000, index * 150));
  const [isHovered, setIsHovered] = useState(false);
  const percentage = Math.min((numericValue / maxValue) * 100, 100);
  const trendColor = metric.positive ? METRIC_CARD_TREND_COLOR : METRIC_CARD_TREND_ERROR_COLOR;
  const iconColor = metric.positive ? METRIC_CARD_TREND_COLOR : METRIC_CARD_TREND_WARNING_COLOR;
  const meterFill = metric.positive ? METRIC_CARD_METER_FILL_SUCCESS : METRIC_CARD_METER_FILL_ERROR;

  return (
    <Box
      className="minimal-metric-row"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ padding: METRIC_CARD_PADDING, background: METRIC_CARD_BG, border: `1px solid ${METRIC_CARD_BORDER}`, borderRadius: METRIC_CARD_RADIUS, boxShadow: METRIC_CARD_SHADOW, position: "relative", overflow: "hidden", cursor: "pointer" }}
    >
      <Box style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: isHovered ? 4 : 3, background: meterFill, transition: "width 0.2s ease" }} />

      <Flex align="center" gap={16} style={{ position: "relative" }}>
        <Box style={{ width: 48, height: 48, display: "flex", alignItems: "center", justifyContent: "center", background: METRIC_CARD_ICON_BG, border: `1px solid ${METRIC_CARD_ICON_BORDER}`, flexShrink: 0, transition: "transform 0.3s ease", transform: isHovered ? "scale(1.05)" : "scale(1)" }}>
          <metric.icon style={{ width: 22, height: 22, color: iconColor }} />
        </Box>

        <Box style={{ flex: 1, minWidth: 0 }}>
          <Flex align="center" justify="between" style={{ marginBottom: 8 }}>
            <Stack spacing="none">
              <Text size="sm" weight="medium" style={{ color: METRIC_CARD_LABEL_COLOR }}>{metric.label}</Text>
              <Flex align="center" gap={6}>
                {metric.positive ? <TrendingUp style={{ width: 12, height: 12, color: trendColor }} /> : <TrendingDown style={{ width: 12, height: 12, color: trendColor }} />}
                <Text size="xs" style={{ color: trendColor, fontFamily: METRIC_MONO_FONT }}>{metric.change}</Text>
              </Flex>
            </Stack>
            <Text style={{ fontSize: 28, fontWeight: 800, color: isHovered ? METRIC_CARD_VALUE_HOVER_COLOR : METRIC_CARD_VALUE_COLOR, fontFamily: METRIC_MONO_FONT, letterSpacing: 0, minWidth: METRIC_CARD_NUMBER_MIN_WIDTH, textAlign: "right", fontVariantNumeric: METRIC_CARD_NUMBER_FONT_VARIANT, transition: "color 0.2s ease" }}>{animatedValue}{suffix}</Text>
          </Flex>
          <Box style={{ height: METRIC_CARD_METER_HEIGHT, background: METRIC_CARD_METER_TRACK, border: `1px solid ${METRIC_CARD_METER_TRACK_BORDER}`, borderRadius: 999, position: "relative", overflow: "hidden" }}>
            <Box style={{ position: "absolute", top: 0, left: 0, height: "100%", width: percentage + "%", background: meterFill, borderRadius: 999, transition: "background 0.3s ease" }} />
          </Box>
        </Box>

        <ChevronRight style={{ width: 16, height: 16, color: METRIC_CARD_ICON_COLOR, opacity: isHovered ? 1 : 0, transform: isHovered ? "translateX(0)" : "translateX(-8px)", transition: "all 0.3s ease", flexShrink: 0 }} />
      </Flex>
    </Box>
  );
}

export function MetricsMinimal({ metrics }: MetricsProps) {
  const maxValue = Math.max(...metrics.map((m: KeyMetric) => parseInt(m.value.replace(/[^0-9.-]/g, "")) || 0), 1);

  return (
    <Box style={{ height: 415, padding: "16px", background: METRIC_PANEL_BG, border: `1px solid ${METRIC_PANEL_BORDER}`, borderRadius: METRIC_PANEL_RADIUS, boxShadow: METRIC_PANEL_SHADOW, position: "relative", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <Flex align="center" justify="between" style={{ paddingBottom: 12, marginBottom: 12, borderBottom: `1px solid ${METRIC_PANEL_BORDER}`, position: "relative" }}>
        <Flex align="center" gap={10}>
          <Box style={{ width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", background: METRIC_PANEL_ICON_BG, border: `1px solid ${METRIC_PANEL_ICON_BORDER}` }}>
            <Activity style={{ width: 16, height: 16, color: METRIC_CARD_ICON_COLOR }} />
          </Box>
          <Stack spacing="none">
            <Text weight="bold" style={{ color: METRIC_PANEL_TITLE_COLOR }}>Key Metrics</Text>
            <Text size="xs" style={{ color: METRIC_PANEL_BODY_COLOR, fontFamily: METRIC_MONO_FONT, fontSize: 9 }}>REAL-TIME DATA</Text>
          </Stack>
        </Flex>
        <Box style={{ padding: "6px 12px", background: METRIC_PANEL_BADGE_BG, border: `1px solid ${METRIC_PANEL_BADGE_BORDER}` }}>
          <Flex align="center" gap={6}>
            <Box className="live-dot" style={{ width: 8, height: 8, borderRadius: "50%", background: METRIC_PANEL_BADGE_COLOR }} />
            <Text size="xs" weight="bold" style={{ color: METRIC_PANEL_BADGE_COLOR, fontFamily: METRIC_MONO_FONT }}>LIVE</Text>
          </Flex>
        </Box>
      </Flex>

      <Box style={{ flex: 1, overflowY: "auto", minHeight: 0 }} className="metrics-scroll">
        <Stack spacing="sm">
          {metrics.map((metric: KeyMetric, i: number) => <MetricRow key={metric.label} metric={metric} index={i} maxValue={maxValue} />)}
        </Stack>
      </Box>

      <style>{`
        .minimal-metric-row { animation: slideIn 0.4s ease-out both; transition: all 0.2s ease; }
        .minimal-metric-row:hover { background: ${METRIC_PANEL_SECTION_ALT_BG}; border-color: ${METRIC_CARD_BORDER_HOVER}; box-shadow: ${METRIC_CARD_SHADOW_HOVER}; transform: translateX(4px); }
        .live-dot { animation: glow 2s ease-in-out infinite; }
        @keyframes slideIn { from { opacity: 0; transform: translateX(-10px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes glow { 0%, 100% { box-shadow: 0 0 4px ${METRIC_PANEL_BADGE_COLOR}, 0 0 8px ${METRIC_PANEL_BADGE_COLOR}; } 50% { box-shadow: 0 0 8px ${METRIC_PANEL_BADGE_COLOR}, 0 0 16px ${METRIC_PANEL_BADGE_COLOR}; } }
        .metrics-scroll { scrollbar-width: thin; scrollbar-color: ${METRIC_CARD_ICON_BORDER} transparent; }
        .metrics-scroll::-webkit-scrollbar { width: 4px; }
        .metrics-scroll::-webkit-scrollbar-track { background: transparent; }
        .metrics-scroll::-webkit-scrollbar-thumb { background: ${METRIC_CARD_ICON_BORDER}; border-radius: 2px; }
      `}</style>
    </Box>
  );
}
