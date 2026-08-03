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
  METRIC_CARD_NUMBER_FONT_VARIANT,
  METRIC_CARD_NUMBER_MIN_WIDTH,
  METRIC_CARD_PADDING,
  METRIC_MONO_FONT,
  parseMetricValue,
} from '../../../foundation/tokens';

/** Hook-local `tOr`: catalogue value with an English floor, never a raw key. */
function useMetricsTranslation() {
  const i18n = useOptionalTranslation('components');
  const tOr = (key: string, floor: string): string => i18n?.tOr(key, floor) ?? floor;
  return { tOr };
}

function ChartRow({
  metric,
  index,
  maxValue,
  progressLabel,
}: {
  metric: MetricsProps['metrics'][0];
  index: number;
  maxValue: number;
  progressLabel: string;
}) {
  // Decimal-safe split (shared family helper): the previous parseInt +
  // Math.floor path truncated decimal metrics permanently — "4.8" rendered
  // as "4".
  const { numericValue, decimals, suffix } = parseMetricValue(metric.value);
  const rawValue = useSmoothCounter(0, numericValue, 1000, index * 100);
  const animatedValue = decimals > 0 ? rawValue.toFixed(decimals) : Math.floor(rawValue);
  const percentage = Math.min((numericValue / maxValue) * 100, 100);

  return (
    <Box
      className="metric-chart-row-v3"
      data-part="metric-row"
      data-positive={metric.positive}
      style={{
        padding: METRIC_CARD_PADDING,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Flex align="center" justify="between" style={{ marginBottom: 8, position: 'relative' }}>
        <Flex align="center" gap={10}>
          <Box
            data-part="metric-icon-box"
            style={{
              position: 'relative',
            }}
          >
            <metric.icon data-part="metric-icon" style={{ width: 14, height: 14 }} />
          </Box>
          <Stack spacing="none">
            <Text size="sm" weight="medium" data-part="metric-label" style={{ fontSize: 13 }}>
              {metric.label}
            </Text>
            <Flex align="center" gap={4}>
              {metric.positive ? (
                <TrendingUp data-part="trend-icon" style={{ width: 10, height: 10 }} />
              ) : (
                <TrendingDown data-part="trend-icon" style={{ width: 10, height: 10 }} />
              )}
              <Text size="xs" data-part="metric-change" style={{ fontFamily: METRIC_MONO_FONT, fontSize: 9 }}>
                {metric.change}
              </Text>
            </Flex>
          </Stack>
        </Flex>
        <Text
          data-part="metric-value"
          style={{
            fontSize: 22,
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
            // Runtime datum (share of the family max): the width is
            // data-driven geometry, so it stays inline by design. Its frame
            // and logical start anchor live in the skin.
            width: percentage + '%',
          }}
        />
      </Box>

      <Flex justify="between" align="center" data-part="progress-row">
        <Text size="xs" data-part="progress-label" style={{ fontFamily: METRIC_MONO_FONT, fontSize: 9 }}>
          {progressLabel}
        </Text>
        <Text
          size="xs"
          weight="bold"
          data-part="progress-percent"
          style={{ fontFamily: METRIC_MONO_FONT, fontSize: 9 }}
        >
          {Math.round(percentage)}%
        </Text>
      </Flex>
    </Box>
  );
}

export function MetricsChart({ metrics }: MetricsProps) {
  const { tOr } = useMetricsTranslation();
  const maxValue = Math.max(...metrics.map((m: KeyMetric) => parseMetricValue(m.value).numericValue), 1);

  return (
    <Box
      className="ds-metrics-chart"
      data-part="root"
    >
      <Flex
        align="center"
        justify="between"
        data-part="header"
      >
        <Flex align="center" gap={8}>
          <Box
            data-part="panel-icon-box"
          >
            <Activity data-part="panel-icon" style={{ width: 14, height: 14 }} />
          </Box>
          <Text weight="bold" size="sm" data-part="title">
            {tOr('metrics.chartTitle', 'Performance')}
          </Text>
        </Flex>
        <Flex align="center" gap={4} data-part="live-badge">
          <Box className="live-dot-chart" data-part="live-dot" />
          <Text size="xs" weight="bold" data-part="live-label" style={{ fontFamily: METRIC_MONO_FONT, fontSize: 9 }}>
            {tOr('metrics.live', 'LIVE')}
          </Text>
        </Flex>
      </Flex>

      <Box data-part="scroll-area" className="metrics-scroll">
        <Stack spacing="sm">
          {metrics.map((metric: KeyMetric, i: number) => (
            <ChartRow
              key={metric.label}
              metric={metric}
              index={i}
              maxValue={maxValue}
              progressLabel={tOr('metrics.progressLabel', 'Progress')}
            />
          ))}
        </Stack>
      </Box>
    </Box>
  );
}
