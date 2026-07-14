'use client';

import { Box, Text, Stack, Flex, Grid } from '@/components/primitives';
import { Activity, TrendingUp, TrendingDown } from 'lucide-react';
import { useSmoothCounter } from '@/motion/hooks';
import { DENSITY_PRESETS, resolveDensityStyleVars } from '@/tokens/ts/base/density';
import type { MetricsProps, KeyMetric } from '../../types';
import {
  METRIC_CARD_BG,
  METRIC_CARD_BORDER,
  METRIC_CARD_ICON_BG,
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
  METRIC_CARD_TREND_COLOR,
  METRIC_CARD_TREND_ERROR_BG,
  METRIC_CARD_TREND_ERROR_BORDER,
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
} from '../tokens';

function MetricCard({
  metric,
  index,
  cardPadding,
}: {
  metric: MetricsProps['metrics'][0];
  index: number;
  cardPadding: string;
}) {
  const numericValue = parseInt(metric.value.replace(/[^0-9.-]/g, '')) || 0;
  const suffix = metric.value.replace(/[0-9.-]/g, '');
  const animatedValue = Math.floor(useSmoothCounter(0, numericValue, 1200, index * 200));

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
      <Box
        className="card-top-accent"
        data-part="top-accent"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 3,
        }}
      />

      <Stack spacing="sm" align="center" style={{ position: 'relative' }}>
        <Box
          className="metric-icon-container"
          data-part="metric-icon-box"
          style={{
            width: 32,
            height: 32,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
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

        <Flex align="center" gap={8}>
          <Box
            className="change-badge"
            data-part="change-badge"
            style={{
              padding: '4px 8px',
            }}
          >
            <Flex align="center" gap={6}>
              {metric.positive ? (
                <TrendingUp className="trend-icon" data-part="trend-icon" style={{ width: 10, height: 10 }} />
              ) : (
                <TrendingDown className="trend-icon" data-part="trend-icon" style={{ width: 10, height: 10 }} />
              )}
              <Text size="xs" weight="bold" data-part="metric-change" style={{ fontFamily: METRIC_MONO_FONT }}>
                {metric.change}
              </Text>
            </Flex>
          </Box>
        </Flex>

        <Box
          data-part="meter-track"
          style={{
            width: '100%',
            height: METRIC_CARD_METER_HEIGHT,
            overflow: 'hidden',
            marginTop: 4,
          }}
        >
          <Box
            className="mini-progress"
            data-part="meter-fill"
            style={{
              height: '100%',
              width: '75%',
            }}
          />
        </Box>
      </Stack>
    </Box>
  );
}

export function MetricsCards({ metrics, density = 'comfortable' }: MetricsProps) {
  // Density-resolved card padding (design-language §3): a tenant/brand
  // `--ds-metric-card-padding` override wins, else the density preset
  // (`1rem` comfortable / `0.75rem` compact) with a literal fallback.
  const cardPadding = `var(--ds-metric-card-padding, ${DENSITY_PRESETS[density].cardPadding})`;
  return (
    <Box
      className="ds-metrics-cards"
      data-part="root"
      style={{
        ...resolveDensityStyleVars(density),
        height: 415,
        padding: '16px',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
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
        <Box className="live-badge-v3" data-part="live-badge" style={{ padding: '6px 12px' }}>
          <Flex align="center" gap={6}>
            <Box className="live-dot-v3" data-part="live-dot" style={{ width: 8, height: 8 }} />
            <Text size="xs" weight="bold" data-part="live-label" style={{ fontFamily: METRIC_MONO_FONT }}>
              LIVE
            </Text>
          </Flex>
        </Box>
      </Flex>

      <Box data-part="scroll-area" style={{ flex: 1, overflowY: 'auto', minHeight: 0 }} className="metrics-scroll">
        <Grid columns={3} gap={10} style={{ position: 'relative' }}>
          {metrics.map((metric: KeyMetric, i: number) => (
            <MetricCard key={metric.label} metric={metric} index={i} cardPadding={cardPadding} />
          ))}
        </Grid>
      </Box>
    </Box>
  );
}
