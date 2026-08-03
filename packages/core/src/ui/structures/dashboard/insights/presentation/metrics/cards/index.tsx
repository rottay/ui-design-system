'use client';

import type { CSSProperties } from 'react';
import { Box, Text, Stack, Flex, Grid } from '@/ui/primitives';
import {
  ActivityIcon as Activity,
  TrendingDownIcon as TrendingDown,
  TrendingUpIcon as TrendingUp,
} from '../../../../../../../graphics/icons';
import { useSmoothCounter } from '@/graphics/motion/react/runtime';
import { useOptionalTranslation } from '@/infrastructure/runtime/i18n';
import { DENSITY_PRESETS } from '@/foundation/tokens/ts/foundation/base/density';
import type { MetricsProps, KeyMetric } from '../../../foundation/contracts';
import {
  METRIC_CARD_MIN_HEIGHT,
  METRIC_CARD_NUMBER_FONT_VARIANT,
  METRIC_CARD_NUMBER_MIN_WIDTH,
  METRIC_MONO_FONT,
  parseMetricValue,
} from '../../../foundation/tokens';

/** Hook-local `tOr`: catalogue value with an English floor, never a raw key. */
function useMetricsTranslation() {
  const i18n = useOptionalTranslation('components');
  const tOr = (key: string, floor: string): string => i18n?.tOr(key, floor) ?? floor;
  return { tOr };
}

function MetricCard({
  metric,
  index,
  cardPadding,
}: {
  metric: MetricsProps['metrics'][0];
  index: number;
  cardPadding: string;
}) {
  // Decimal-safe split (shared family helper): the previous parseInt +
  // Math.floor path truncated decimal metrics permanently — "4.8" rendered
  // as "4".
  const { numericValue, decimals, suffix } = parseMetricValue(metric.value);
  const rawValue = useSmoothCounter(0, numericValue, 1200, index * 200);
  const animatedValue = decimals > 0 ? rawValue.toFixed(decimals) : Math.floor(rawValue);
  // The meter honours the contract's `progress` (0–100, clamped); the 75%
  // floor is the pre-contract render, preserved when the datum is absent.
  const progress = Math.min(Math.max(metric.progress ?? 75, 0), 100);

  return (
    <Box
      className="metric-card-v3"
      data-part="metric-card"
      data-positive={metric.positive}
      style={{
        position: 'relative',
        minHeight: METRIC_CARD_MIN_HEIGHT,
        padding: cardPadding,
        overflow: 'hidden',
      }}
    >
      <Stack spacing="sm" align="center" data-part="body">
        <Box
          className="metric-icon-container"
          data-part="metric-icon-box"
          style={{
            position: 'relative',
          }}
        >
          <metric.icon className="metric-icon" data-part="metric-icon" style={{ width: 14, height: 14 }} />
        </Box>

        <Box style={{ position: 'relative' }}>
          <Text
            className="metric-value-v3"
            data-part="metric-value"
            style={{
              fontSize: 24,
              fontWeight: 800,
              fontFamily: METRIC_MONO_FONT,
              lineHeight: 1,
              letterSpacing: 0,
              minWidth: METRIC_CARD_NUMBER_MIN_WIDTH,
              textAlign: 'center',
              fontVariantNumeric: METRIC_CARD_NUMBER_FONT_VARIANT,
              position: 'relative',
            }}
          >
            {animatedValue}
            {suffix}
          </Text>
        </Box>

        <Text
          className="metric-label"
          data-part="metric-label"
          size="xs"
          style={{
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            fontFamily: METRIC_MONO_FONT,
            fontSize: 10,
          }}
        >
          {metric.label}
        </Text>

        <Box data-part="footer">
          <Flex align="center" gap={8}>
            <Box className="change-badge" data-part="change-badge">
              <Flex align="center" gap={6}>
                {metric.positive ? (
                  <TrendingUp className="trend-icon" data-part="trend-icon" />
                ) : (
                  <TrendingDown className="trend-icon" data-part="trend-icon" />
                )}
                <Text size="xs" weight="bold" data-part="metric-change">
                  {metric.change}
                </Text>
              </Flex>
            </Box>
          </Flex>

          <Box data-part="meter-track">
            <Box
              className="mini-progress"
              data-part="meter-fill"
              // Runtime datum (contract `progress`, 75% floor): width is the
              // sole instance-driven geometry retained inline.
              style={{ width: `${progress}%` }}
            />
          </Box>
        </Box>
      </Stack>
    </Box>
  );
}

export function MetricsCards({ metrics, density = 'comfortable' }: MetricsProps) {
  const { tOr } = useMetricsTranslation();
  // Density-resolved card padding (design-language §3): a tenant/brand
  // `--ds-metric-card-padding` override wins, else the density preset
  // (`1rem` comfortable / `0.75rem` compact) with a literal fallback.
  const densityPreset = density === 'compact' ? DENSITY_PRESETS.compact : DENSITY_PRESETS.comfortable;
  const cardPadding = `var(--ds-metric-card-padding, ${densityPreset.cardPadding})`;
  return (
    <Box
      className="ds-metrics-cards"
      data-part="root"
      style={{
        // Runtime density wiring stays inline (the density suite pins these
        // three channels on the panel root). The static frame (block size,
        // padding, flex column, position, overflow) lives in the skin, riding
        // the private proto channel documented there.
        '--ds-density-cell-padding': densityPreset.cellPadding,
        '--ds-density-card-padding': densityPreset.cardPadding,
        '--ds-density-local-factor': String(densityPreset.modeFactor),
      } as CSSProperties}
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
        <Box className="live-badge-v3" data-part="live-badge">
          <Flex align="center" gap={6}>
            <Box className="live-dot-v3" data-part="live-dot" />
            <Text size="xs" weight="bold" data-part="live-label" style={{ fontFamily: METRIC_MONO_FONT }}>
              {tOr('metrics.live', 'LIVE')}
            </Text>
          </Flex>
        </Box>
      </Flex>

      <Box data-part="scroll-area" className="metrics-scroll">
        {/* Intrinsic tracks: cards reflow 3→2→1 by available inline size
            instead of pinning a desktop-born 3-up that overflows narrow
            embeddings; each card keeps a legible 10rem floor. */}
        <Grid data-part="cards-grid" columns="repeat(auto-fit, minmax(min(100%, 10rem), 1fr))" gap={10}>
          {metrics.map((metric: KeyMetric, i: number) => (
            <MetricCard key={metric.label} metric={metric} index={i} cardPadding={cardPadding} />
          ))}
        </Grid>
      </Box>
    </Box>
  );
}
