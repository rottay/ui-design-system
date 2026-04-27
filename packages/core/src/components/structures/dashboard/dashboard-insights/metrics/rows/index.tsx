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
  METRIC_CARD_METER_FILL_ERROR,
  METRIC_CARD_METER_FILL_SUCCESS,
  METRIC_CARD_NUMBER_FONT_VARIANT,
  METRIC_CARD_NUMBER_MIN_WIDTH,
  METRIC_CARD_PADDING,
  METRIC_CARD_RADIUS,
  METRIC_CARD_SHADOW,
  METRIC_CARD_SHADOW_HOVER,
  METRIC_CARD_SHEEN,
  METRIC_CARD_TREND_COLOR,
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

function MetricRow({ metric, index }: { metric: MetricsProps["metrics"][0]; index: number }) {
  const numericValue = parseInt(metric.value.replace(/[^0-9.-]/g, "")) || 0;
  const suffix = metric.value.replace(/[0-9.-]/g, "");
  const animatedValue = Math.floor(useSmoothCounter(0, numericValue, 1000, index * 150));
  const [isHovered, setIsHovered] = useState(false);
  const trendColor = metric.positive ? METRIC_CARD_TREND_COLOR : METRIC_CARD_TREND_ERROR_COLOR;
  const meterFill = metric.positive ? METRIC_CARD_METER_FILL_SUCCESS : METRIC_CARD_METER_FILL_ERROR;

  return (
    <Box
      className="metric-row-v3"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        padding: METRIC_CARD_PADDING,
        background: METRIC_CARD_BG,
        border: `1px solid ${METRIC_CARD_BORDER}`,
        borderRadius: METRIC_CARD_RADIUS,
        boxShadow: METRIC_CARD_SHADOW,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <Box
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: isHovered ? 6 : 4,
          background: meterFill,
          transition: "width 0.3s ease",
        }}
      />

      <Box
        className="row-shimmer"
        style={{
          position: "absolute",
          top: 0,
          left: "-100%",
          width: "100%",
          height: "100%",
          background: METRIC_CARD_SHEEN,
          pointerEvents: "none",
        }}
      />

      <Flex align="center" justify="between" style={{ position: "relative" }}>
        <Flex align="center" gap={14}>
          <Box
            className="metric-row-icon"
            style={{
              width: 40,
              height: 40,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: METRIC_CARD_ICON_BG,
              border: `2px solid ${METRIC_CARD_ICON_BORDER}`,
              position: "relative",
            }}
          >
            <metric.icon
              style={{
                width: 18,
                height: 18,
                color: METRIC_CARD_ICON_COLOR,
              }}
            />
          </Box>

          <Stack spacing="xs">
            <Text
              size="sm"
              weight="medium"
              style={{ color: METRIC_CARD_VALUE_COLOR }}
            >
              {metric.label}
            </Text>
            <Flex align="center" gap={6}>
              {metric.positive ? (
                <TrendingUp
                  className="trend-icon"
                  style={{ width: 12, height: 12, color: trendColor }}
                />
              ) : (
                <TrendingDown
                  className="trend-icon"
                  style={{ width: 12, height: 12, color: trendColor }}
                />
              )}
              <Text
                size="xs"
                weight="bold"
                style={{
                  color: trendColor,
                  fontFamily: METRIC_MONO_FONT,
                }}
              >
                {metric.change}
              </Text>
            </Flex>
          </Stack>
        </Flex>

        <Box style={{ position: "relative" }}>
          <Text
            className="metric-row-value"
            style={{
              fontSize: 28,
              fontWeight: 800,
              color: METRIC_CARD_VALUE_COLOR,
              fontFamily: METRIC_MONO_FONT,
              letterSpacing: 0,
              minWidth: METRIC_CARD_NUMBER_MIN_WIDTH,
              textAlign: "right",
              fontVariantNumeric: METRIC_CARD_NUMBER_FONT_VARIANT,
            }}
          >
            {animatedValue}{suffix}
          </Text>
        </Box>
      </Flex>
    </Box>
  );
}

export function MetricsRows({ metrics }: MetricsProps) {
  return (
    <Box
      style={{
        height: 415,
        padding: "16px",
        background: METRIC_PANEL_BG,
        border: `1px solid ${METRIC_PANEL_BORDER}`,
        borderRadius: METRIC_PANEL_RADIUS,
        boxShadow: METRIC_PANEL_SHADOW,
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflow: "hidden",
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
          <Text weight="bold" style={{ color: METRIC_PANEL_TITLE_COLOR }}>
            Key Metrics
          </Text>
        </Flex>
        <Box
          className="live-badge-v3"
          style={{
            padding: "6px 12px",
            background: METRIC_PANEL_BADGE_BG,
            border: `1px solid ${METRIC_PANEL_BADGE_BORDER}`,
          }}
        >
          <Flex align="center" gap={6}>
            <Box
              className="live-dot-v3"
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: METRIC_PANEL_BADGE_COLOR,
              }}
            />
            <Text
              size="xs"
              weight="bold"
              style={{ color: METRIC_PANEL_BADGE_COLOR, fontFamily: METRIC_MONO_FONT }}
            >
              LIVE
            </Text>
          </Flex>
        </Box>
      </Flex>

      <Box
        style={{
          flex: 1,
          overflowY: "auto",
          minHeight: 0,
        }}
        className="metrics-scroll"
      >
        <Stack spacing="sm">
          {metrics.map((metric: KeyMetric, i: number) => (
            <MetricRow key={metric.label} metric={metric} index={i} />
          ))}
        </Stack>
      </Box>

      <style>{`
        .metric-row-v3 {
          animation: rowSlideIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .metric-row-v3:hover {
          border-color: ${METRIC_CARD_BORDER_HOVER};
          transform: translateX(6px);
          box-shadow: ${METRIC_CARD_SHADOW_HOVER};
        }
        .metric-row-v3:hover .metric-row-value {
          color: ${METRIC_CARD_VALUE_HOVER_COLOR};
        }
        .metric-row-v3:hover .row-shimmer {
          animation: shimmer 0.8s ease-in-out;
        }

        .live-dot-v3 {
          animation: dotGlow 1.5s ease-in-out infinite;
        }

        @keyframes rowSlideIn {
          from { opacity: 0; transform: translateX(-30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes shimmer {
          from { left: -100%; }
          to { left: 100%; }
        }
        @keyframes dotGlow {
          0%, 100% { box-shadow: 0 0 4px ${METRIC_PANEL_BADGE_COLOR}, 0 0 8px ${METRIC_PANEL_BADGE_COLOR}; }
          50% { box-shadow: 0 0 8px ${METRIC_PANEL_BADGE_COLOR}, 0 0 16px ${METRIC_PANEL_BADGE_COLOR}; }
        }

        .metrics-scroll {
          scrollbar-width: thin;
          scrollbar-color: ${METRIC_CARD_ICON_BORDER} transparent;
        }
        .metrics-scroll::-webkit-scrollbar { width: 4px; }
        .metrics-scroll::-webkit-scrollbar-track { background: transparent; }
        .metrics-scroll::-webkit-scrollbar-thumb { background: ${METRIC_CARD_ICON_BORDER}; border-radius: 2px; }
      `}</style>
    </Box>
  );
}
