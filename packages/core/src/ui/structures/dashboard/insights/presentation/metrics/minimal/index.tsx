'use client';

import { Box, Text, Stack, Flex } from '@/ui/primitives';
import {
  ActivityIcon as Activity,
  ChevronRightIcon as ChevronRight,
  TrendingDownIcon as TrendingDown,
  TrendingUpIcon as TrendingUp,
} from '../../../../../../../graphics/icons';
import { useSmoothCounter } from '@/graphics/motion/react/runtime';
import { useOptionalTranslation } from '@/infrastructure/runtime/i18n';
import type { MetricsProps, KeyMetric } from '../../../foundation/contracts';
import {
  METRIC_CARD_METER_HEIGHT,
  METRIC_CARD_NUMBER_FONT_VARIANT,
  METRIC_CARD_NUMBER_MIN_WIDTH,
  METRIC_CARD_PADDING,
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

function MetricRow({
  metric,
  index,
  maxValue,
}: {
  metric: MetricsProps['metrics'][0];
  index: number;
  maxValue: number;
}) {
  const { numericValue, decimals, suffix } = parseMetricValue(metric.value);
  const rawValue = useSmoothCounter(0, numericValue, 1000, index * 150);
  const animatedValue = decimals > 0 ? rawValue.toFixed(decimals) : Math.floor(rawValue);
  const percentage = Math.min((numericValue / maxValue) * 100, 100);

  return (
    <Box
      className="minimal-metric-row"
      data-part="metric-row"
      data-positive={metric.positive}
      style={{
        padding: METRIC_CARD_PADDING,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Flex align="center" gap={16} style={{ position: 'relative' }}>
        <Box
          data-part="metric-icon-box"
        >
          <metric.icon data-part="metric-icon" style={{ width: 22, height: 22 }} />
        </Box>

        <Box style={{ flex: 1, minWidth: 0 }}>
          <Flex align="center" justify="between" style={{ marginBottom: 8 }}>
            <Stack spacing="none">
              <Text size="sm" weight="medium" data-part="metric-label">
                {metric.label}
              </Text>
              <Flex align="center" gap={6}>
                {metric.positive ? (
                  <TrendingUp data-part="trend-icon" style={{ width: 12, height: 12 }} />
                ) : (
                  <TrendingDown data-part="trend-icon" style={{ width: 12, height: 12 }} />
                )}
                <Text size="xs" data-part="metric-change" style={{ fontFamily: METRIC_MONO_FONT }}>
                  {metric.change}
                </Text>
              </Flex>
            </Stack>
            <Text
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
          </Flex>
          <Box
            data-part="meter-track"
          >
            <Box
              data-part="meter-fill"
              style={{
                width: percentage + '%',
              }}
            />
          </Box>
        </Box>

        <ChevronRight
          data-part="metric-chevron"
          style={{
            width: 16,
            height: 16,
            flexShrink: 0,
          }}
        />
      </Flex>
    </Box>
  );
}

export function MetricsMinimal({ metrics }: MetricsProps) {
  const { tOr } = useMetricsTranslation();
  const maxValue = Math.max(...metrics.map((m: KeyMetric) => parseMetricValue(m.value).numericValue), 1);

  return (
    <Box
      className="ds-metrics-minimal"
      data-part="root"
    >
      <Flex
        align="center"
        justify="between"
        data-part="header"
      >
        <Flex align="center" gap={10}>
          <Box
            data-part="panel-icon-box"
          >
            <Activity data-part="panel-icon" style={{ width: 16, height: 16 }} />
          </Box>
          <Stack spacing="none">
            <Text weight="bold" data-part="title">
              {tOr('metrics.panelTitle', 'Key Metrics')}
            </Text>
            <Text size="xs" data-part="subtitle" style={{ fontFamily: METRIC_MONO_FONT, fontSize: 9 }}>
              {tOr('metrics.realtimeData', 'REAL-TIME DATA')}
            </Text>
          </Stack>
        </Flex>
        <Box data-part="live-badge">
          <Flex align="center" gap={6}>
            <Box className="live-dot" data-part="live-dot" />
            <Text size="xs" weight="bold" data-part="live-label" style={{ fontFamily: METRIC_MONO_FONT }}>
              {tOr('metrics.live', 'LIVE')}
            </Text>
          </Flex>
        </Box>
      </Flex>

      <Box data-part="scroll-area" className="metrics-scroll">
        <Stack spacing="sm">
          {metrics.map((metric: KeyMetric, i: number) => (
            <MetricRow key={metric.label} metric={metric} index={i} maxValue={maxValue} />
          ))}
        </Stack>
      </Box>
    </Box>
  );
}
