'use client';

import { Box, Text, Stack, Flex } from '@/ui/primitives';
import { Activity, TrendingUp, TrendingDown } from 'lucide-react';
import { useSmoothCounter } from '@/graphics/motion/react/runtime';
import type { MetricsProps, KeyMetric } from '../../../foundation/contracts';
import {
  METRIC_CARD_BG,
  METRIC_CARD_BORDER,
  METRIC_CARD_ICON_BG,
  METRIC_CARD_ICON_COLOR,
  METRIC_CARD_METER_FILL_ERROR,
  METRIC_CARD_METER_FILL_SUCCESS,
  METRIC_CARD_NUMBER_FONT_VARIANT,
  METRIC_CARD_NUMBER_MIN_WIDTH,
  METRIC_CARD_PADDING,
  METRIC_CARD_RADIUS,
  METRIC_CARD_SHADOW,
  METRIC_CARD_SHEEN,
  METRIC_CARD_TREND_COLOR,
  METRIC_CARD_TREND_ERROR_COLOR,
  METRIC_CARD_VALUE_COLOR,
  METRIC_MONO_FONT,
  METRIC_PANEL_BADGE_BG,
  METRIC_PANEL_BADGE_BORDER,
  METRIC_PANEL_BG,
  METRIC_PANEL_BORDER,
  METRIC_PANEL_ICON_BG,
  METRIC_PANEL_ICON_BORDER,
  METRIC_PANEL_RADIUS,
  METRIC_PANEL_SHADOW,
  METRIC_PANEL_TITLE_COLOR,
} from '../../../foundation/tokens';

function MetricRow({ metric, index }: { metric: MetricsProps['metrics'][0]; index: number }) {
  const numericValue = parseInt(metric.value.replace(/[^0-9.-]/g, '')) || 0;
  const suffix = metric.value.replace(/[0-9.-]/g, '');
  const animatedValue = Math.floor(useSmoothCounter(0, numericValue, 1000, index * 150));

  return (
    <Box
      className="metric-row-v3"
      data-part="metric-row"
      data-positive={metric.positive}
      style={{
        padding: METRIC_CARD_PADDING,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Box
        data-part="accent-bar"
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          transition: 'width 0.3s ease',
        }}
      />

      <Box
        className="row-shimmer"
        data-part="shimmer"
        style={{
          position: 'absolute',
          top: 0,
          left: '-100%',
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
        }}
      />

      <Flex align="center" justify="between" style={{ position: 'relative' }}>
        <Flex align="center" gap={14}>
          <Box
            className="metric-row-icon"
            data-part="metric-icon-box"
            style={{
              width: 40,
              height: 40,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
            }}
          >
            <metric.icon
              data-part="metric-icon"
              style={{
                width: 18,
                height: 18,
              }}
            />
          </Box>

          <Stack spacing="xs">
            <Text size="sm" weight="medium" data-part="metric-label">
              {metric.label}
            </Text>
            <Flex align="center" gap={6}>
              {metric.positive ? (
                <TrendingUp className="trend-icon" data-part="trend-icon" style={{ width: 12, height: 12 }} />
              ) : (
                <TrendingDown className="trend-icon" data-part="trend-icon" style={{ width: 12, height: 12 }} />
              )}
              <Text
                size="xs"
                weight="bold"
                data-part="metric-change"
                style={{
                  fontFamily: METRIC_MONO_FONT,
                }}
              >
                {metric.change}
              </Text>
            </Flex>
          </Stack>
        </Flex>

        <Box style={{ position: 'relative' }}>
          <Text
            className="metric-row-value"
            data-part="metric-value"
            style={{
              fontSize: 28,
              fontWeight: 800,
              fontFamily: METRIC_MONO_FONT,
              letterSpacing: 0,
              minWidth: METRIC_CARD_NUMBER_MIN_WIDTH,
              textAlign: 'right',
              fontVariantNumeric: METRIC_CARD_NUMBER_FONT_VARIANT,
            }}
          >
            {animatedValue}
            {suffix}
          </Text>
        </Box>
      </Flex>
    </Box>
  );
}

export function MetricsRows({ metrics }: MetricsProps) {
  return (
    <Box
      className="ds-metrics-rows"
      data-part="root"
      style={{
        height: 415,
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Flex
        align="center"
        justify="between"
        data-part="header"
        style={{
          paddingBottom: 12,
          marginBottom: 12,
          position: 'relative',
        }}
      >
        <Flex align="center" gap={10}>
          <Box
            className="header-icon"
            data-part="panel-icon-box"
            style={{
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Activity data-part="panel-icon" style={{ width: 16, height: 16 }} />
          </Box>
          <Text weight="bold" data-part="title">
            Key Metrics
          </Text>
        </Flex>
        <Box
          className="live-badge-v3"
          data-part="live-badge"
          style={{
            padding: '6px 12px',
          }}
        >
          <Flex align="center" gap={6}>
            <Box
              className="live-dot-v3"
              data-part="live-dot"
              style={{
                width: 8,
                height: 8,
              }}
            />
            <Text size="xs" weight="bold" data-part="live-label" style={{ fontFamily: METRIC_MONO_FONT }}>
              LIVE
            </Text>
          </Flex>
        </Box>
      </Flex>

      <Box
        data-part="scroll-area"
        style={{
          flex: 1,
          overflowY: 'auto',
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
    </Box>
  );
}
