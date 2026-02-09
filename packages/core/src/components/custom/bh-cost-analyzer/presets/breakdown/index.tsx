'use client';

/**
 * BhCostAnalyzer - Breakdown Preset
 * Premium per-model cost breakdown with relative cost bars, percentage badges,
 * inline trend sparklines, provider color dots, and summary totals.
 */

import { useState, useMemo } from 'react';
import { createPreset, PresetContext } from '../../../factory';
import type { BhCostAnalyzerProps, ModelCost } from '../../core';
import { formatCurrency, formatTokens } from '../../core';
import {
  createCardStyle, createPanelHeaderStyle, createListItemStyle, createBadgeStyle,
  createAccentBarStyle, createProgressBarStyle, createHoverStyle, getHoverTransform,
  getCardHoverShadow, createStatusDotStyle, createSectionHeaderStyle,
} from '../../../helpers';

const PROVIDER_COLOR_KEYS = ['primary', 'secondary', 'success', 'warning', 'error', 'info'] as const;

function getProviderColor(index: number, tokens: any): string {
  const key = PROVIDER_COLOR_KEYS[index % PROVIDER_COLOR_KEYS.length];
  return (tokens.colors as any)[`${key}Scale`]?.[500] ?? tokens.colors.primaryScale[500];
}

/* Inline sparkline (5-point SVG) */
function MiniSparkline({ color }: { color: string }) {
  const points = useMemo(() => {
    const pts = [0.4, 0.6, 0.35, 0.7, 0.55];
    return pts.map((v, i) => `${i * 10},${(1 - v) * 16}`).join(' ');
  }, []);
  return (
    <svg width={40} height={16} style={{ flexShrink: 0 }}>
      <polyline points={points} fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* Model row child component (hooks-safe) */
function ModelRow({ model, maxCost, totalCost, providerColorMap, tokens, primitives }: {
  model: ModelCost; maxCost: number; totalCost: number;
  providerColorMap: Record<string, string>; tokens: any; primitives: any;
}) {
  const { Box, Flex, Text } = primitives;
  const [hovered, setHovered] = useState(false);
  const costPct = maxCost > 0 ? Math.round((model.totalCost / maxCost) * 100) : 0;
  const sharePct = totalCost > 0 ? ((model.totalCost / totalCost) * 100).toFixed(1) : '0.0';
  const provColor = providerColorMap[model.provider] ?? tokens.colors.primaryScale[500];

  const progressStyles = useMemo(
    () => createProgressBarStyle(tokens, { color: provColor, percent: costPct }),
    [tokens, provColor, costPct],
  );
  const rowStyle = useMemo(() => ({
    ...createListItemStyle(tokens, { interactive: false }),
    padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
    ...(hovered ? { backgroundColor: tokens.colors.neutral[50], boxShadow: getCardHoverShadow(tokens), ...getHoverTransform(tokens) } : {}),
  }), [tokens, hovered]);

  return (
    <Box onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} style={rowStyle}>
      <Flex justify="between" align="center" style={{ marginBottom: tokens.spacing[1] }}>
        <Flex gap={6} align="center" style={{ flex: 2 }}>
          <Box style={createStatusDotStyle(tokens, provColor)} />
          <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[800] }}>
            {model.modelName}
          </Text>
          <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{model.provider}</Text>
        </Flex>
        <Flex gap={8} align="center">
          <MiniSparkline color={provColor} />
          <Box style={createBadgeStyle(tokens, 'primary')}>
            <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.primaryScale[700] }}>{sharePct}%</Text>
          </Box>
        </Flex>
      </Flex>
      <Box style={{ marginBottom: tokens.spacing[1], ...progressStyles.track }}>
        <div style={progressStyles.fill} />
      </Box>
      <Flex justify="between" align="center">
        <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[800] }}>
          {formatCurrency(model.totalCost)}
        </Text>
        <Flex gap={12} align="center">
          <Flex gap={4} align="center">
            <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>Tokens:</Text>
            <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[700] }}>{formatTokens(model.tokenCount)}</Text>
          </Flex>
          <Flex gap={4} align="center">
            <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>Reqs:</Text>
            <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[700] }}>{model.requestCount.toLocaleString()}</Text>
          </Flex>
          <Flex gap={4} align="center">
            <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>Avg:</Text>
            <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[700] }}>{formatCurrency(model.avgCostPerRequest)}</Text>
          </Flex>
        </Flex>
      </Flex>
    </Box>
  );
}

/* Main preset */
export const BreakdownBhCostAnalyzer = createPreset<BhCostAnalyzerProps>({
  name: 'BhCostAnalyzer.Breakdown',
  render: ({ primitives, props, tokens, engine }: PresetContext<BhCostAnalyzerProps>) => {
    const { Box, Flex, Stack, Text, Spinner } = primitives;
    const isGlass = engine === 'modern' && !!tokens.glass;
    const { providers, models = [], loading, className, style } = props;

    const { maxCost, totalCost, providerColorMap } = useMemo(() => {
      const max = models.reduce((m, v) => Math.max(m, v.totalCost), 0);
      const total = models.reduce((s, v) => s + v.totalCost, 0);
      const colorMap: Record<string, string> = {};
      [...new Set(models.map(m => m.provider))].forEach((p, i) => { colorMap[p] = getProviderColor(i, tokens); });
      return { maxCost: max, totalCost: total, providerColorMap: colorMap };
    }, [models, tokens]);

    const cardStyle = useMemo(() => ({
      ...createCardStyle(tokens, { glass: isGlass, padding: 0 }), overflow: 'hidden' as const, ...style,
    }), [tokens, isGlass, style]);

    const colHeaderStyle = useMemo(() => ({ ...createSectionHeaderStyle(tokens), marginBottom: 0 }), [tokens]);

    if (loading) {
      return (
        <Flex align="center" justify="center" direction="column" gap={8} style={{ padding: tokens.spacing[8], ...style }} className={className}>
          <Spinner size="sm" />
          <Text style={{ color: tokens.colors.neutral[500], fontSize: tokens.typography.fontSize.xs }}>Loading cost breakdown...</Text>
        </Flex>
      );
    }

    return (
      <Box className={className} style={cardStyle}>
        <div style={createAccentBarStyle(tokens, { position: 'top' })} />
        <Box style={createPanelHeaderStyle(tokens)}>
          <Flex justify="between" align="center">
            <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[700] }}>
              Cost Breakdown ({models.length} models)
            </Text>
            <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.primaryScale[600] }}>
              Total: {formatCurrency(totalCost)}
            </Text>
          </Flex>
        </Box>
        <Flex style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`, background: tokens.colors.neutral[50] }}>
          <Box style={{ flex: 2 }}><Text style={colHeaderStyle}>Model / Provider</Text></Box>
          <Box style={{ flex: 1, textAlign: 'right' as const }}><Text style={colHeaderStyle}>Cost</Text></Box>
          <Box style={{ flex: 1, textAlign: 'right' as const }}><Text style={colHeaderStyle}>Share</Text></Box>
        </Flex>
        <Stack gap={0} style={{ maxHeight: 400, overflowY: 'auto' as const }}>
          {models.map(m => (
            <ModelRow key={m.modelId} model={m} maxCost={maxCost} totalCost={totalCost} providerColorMap={providerColorMap} tokens={tokens} primitives={primitives} />
          ))}
        </Stack>
        <Box style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, borderTop: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`, background: tokens.colors.neutral[50] }}>
          <Flex gap={16} wrap="wrap" align="center">
            {providers.map(p => {
              const dotColor = providerColorMap[p.providerName] ?? tokens.colors.primaryScale[500];
              return (
                <Flex key={p.providerId} gap={6} align="center">
                  <Box style={createStatusDotStyle(tokens, dotColor)} />
                  <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[700] }}>{p.providerName}</Text>
                  <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[800] }}>{formatCurrency(p.totalCost)}</Text>
                </Flex>
              );
            })}
          </Flex>
        </Box>
      </Box>
    );
  },
});
