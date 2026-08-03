'use client';

import { Box, Text, Stack, Flex } from '@/ui/primitives';
import {
  ActivityIcon as Activity,
  TrendingDownIcon as TrendingDown,
  TrendingUpIcon as TrendingUp,
} from '../../../../../../../graphics/icons';
import { useSmoothCounter } from '@/graphics/motion/react/runtime';
import { useOptionalTranslation } from '@/infrastructure/runtime/i18n';
import type { MetricsProps, KeyMetric } from '../../../foundation/contracts';
import {
  METRIC_CARD_PADDING,
  METRIC_CARD_NUMBER_FONT_VARIANT,
  METRIC_CARD_NUMBER_MIN_WIDTH,
  METRIC_MONO_FONT,
} from '../../../foundation/tokens';

/** Hook-local `tOr`: catalogue value with an English floor, never a raw key. */
function useMetricsTranslation() {
  const i18n = useOptionalTranslation('components');
  const tOr = (key: string, floor: string): string => i18n?.tOr(key, floor) ?? floor;
  return { tOr };
}

/**
 * Splits a display value like "18d" / "4.8%" into a countable number, its
 * decimal precision and its suffix. The counter animates the number; the
 * decimals are preserved (the previous parseInt + Math.floor path truncated
 * decimal metrics permanently — "4.8" rendered as "4").
 */
function parseMetricValue(value: string): { numericValue: number; decimals: number; suffix: string } {
  const numericText = value.replace(/[^0-9.-]/g, '');
  return {
    numericValue: parseFloat(numericText) || 0,
    decimals: (numericText.split('.')[1] ?? '').length,
    suffix: value.replace(/[0-9.-]/g, ''),
  };
}

function MetricRow({ metric, index }: { metric: MetricsProps['metrics'][0]; index: number }) {
  const { numericValue, decimals, suffix } = parseMetricValue(metric.value);
  const rawValue = useSmoothCounter(0, numericValue, 1000, index * 150);
  const animatedValue = decimals > 0 ? rawValue.toFixed(decimals) : Math.floor(rawValue);

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
        className="row-shimmer"
        data-part="shimmer"
      />

      <Flex align="center" justify="between" style={{ position: 'relative' }}>
        <Flex align="center" gap={14}>
          <Box
            className="metric-row-icon"
            data-part="metric-icon-box"
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
  const { tOr } = useMetricsTranslation();

  return (
    <Box
      className="ds-metrics-rows"
      data-part="root"
    >
      <Flex
        align="center"
        justify="between"
        data-part="header"
      >
        <Flex align="center" gap={10}>
          <Box
            className="header-icon"
            data-part="panel-icon-box"
          >
            <Activity data-part="panel-icon" style={{ width: 16, height: 16 }} />
          </Box>
          <Text weight="bold" data-part="title">
            {tOr('metrics.panelTitle', 'Key Metrics')}
          </Text>
        </Flex>
        <Box
          className="live-badge-v3"
          data-part="live-badge"
        >
          <Flex align="center" gap={6}>
            <Box
              className="live-dot-v3"
              data-part="live-dot"
            />
            <Text size="xs" weight="bold" data-part="live-label" style={{ fontFamily: METRIC_MONO_FONT }}>
              {tOr('metrics.live', 'LIVE')}
            </Text>
          </Flex>
        </Box>
      </Flex>

      <Box
        data-part="scroll-area"
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
