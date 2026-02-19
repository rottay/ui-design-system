'use client';

/**
 * BhCostAnalyzer - Breakdown Preset
 * Slite-inspired per-model cost breakdown with generous whitespace,
 * warm neutrals, relative cost bars, percentage badges, inline trend
 * sparklines, provider color dots, and summary totals.
 */

import { useState, useMemo, useCallback } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import type { BhCostAnalyzerProps, ModelCost, ProviderCost } from '../../core';
import { formatCurrency, formatTokens } from '../../core';
import {
  createCardStyle, createBadgeStyle, createHoverStyle,
  createSectionHeaderStyle, createStatusDotStyle,
  createCardHoverStyles, createEntranceAnimation,
  createStaggerDelay,
  createPersonalitySectionHeaderStyle, getPersonalityTypography,
  getPersonalityBadgeRadius, createIconContainerStyle,
  createMetadataFieldStyle, ICON_SIZES,
  createPersonalityAccentBar,

  createDividerStyle,
  createEmptyStateStyle,
} from '../../../helpers';
import type { DesignTokens } from '../../../../../types';
import { DollarSign, TrendingUp, Layers, Activity } from 'lucide-react';

const PROVIDER_COLOR_KEYS = ['primary', 'secondary', 'success', 'warning', 'error', 'info'] as const;

function getProviderColor(index: number, tokens: DesignTokens): string {
  const key = PROVIDER_COLOR_KEYS[index % PROVIDER_COLOR_KEYS.length];
  const scale = tokens.colors[`${key}Scale` as keyof typeof tokens.colors] as Record<number, string> | undefined;
  return scale?.[500] ?? tokens.colors.primaryScale[500];
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
  const { Box, Text } = primitives;
  const [hovered, setHovered] = useState(false);
  const costPct = maxCost > 0 ? Math.round((model.totalCost / maxCost) * 100) : 0;
  const sharePct = totalCost > 0 ? ((model.totalCost / totalCost) * 100).toFixed(1) : '0.0';
  const provColor = providerColorMap[model.provider] ?? tokens.colors.primaryScale[500];

  return (
    <Box
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: `${tokens.spacing[4]}px ${tokens.spacing[5]}px`,
        borderBottom: `1px solid ${tokens.colors.neutral[100]}`,
        backgroundColor: hovered ? tokens.colors.neutral[50] : 'transparent',
        cursor: 'default',
        transition: `all ${tokens.motion.hover}`,
      }}
    >
      {/* Top row: model name, provider, sparkline, share badge */}
      <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: tokens.spacing[3] }}>
        <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3], flex: 2 }}>
          <Box style={{
            width: ICON_SIZES.inline, height: ICON_SIZES.inline, borderRadius: tokens.borderRadius.full,
            backgroundColor: provColor, flexShrink: 0,
          }} />
          <Text style={{
            fontSize: tokens.typography.fontSize.sm,
            fontWeight: tokens.typography.fontWeight.semibold,
            color: tokens.colors.neutral[900],
          }}>
            {model.modelName}
          </Text>
          <Text style={{
            fontSize: tokens.typography.fontSize.xs,
            color: tokens.colors.neutral[400],
            fontWeight: tokens.typography.fontWeight.medium,
          }}>
            {model.provider}
          </Text>
        </Box>
        <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3] }}>
          <MiniSparkline color={provColor} />
          <Box style={{
            ...createBadgeStyle(tokens, 'primary'),
            padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
          }}>
            <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.primaryScale[700] }}>{sharePct}%</Text>
          </Box>
        </Box>
      </Box>

      {/* Progress bar */}
      <Box style={{
        height: 6,
        borderRadius: tokens.borderRadius.full,
        backgroundColor: tokens.colors.neutral[100],
        overflow: 'hidden',
        marginBottom: tokens.spacing[3],
      }}>
        <Box style={{
          height: '100%',
          width: `${costPct}%`,
          borderRadius: tokens.borderRadius.full,
          backgroundColor: provColor,
          transition: `width ${tokens.motion.hover}`,
        }} />
      </Box>

      {/* Bottom row: cost, tokens, requests, avg cost */}
      <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text style={{
          fontSize: tokens.typography.fontSize.md,
          fontWeight: tokens.typography.fontWeight.bold,
          color: tokens.colors.neutral[900],
        }}>
          {formatCurrency(model.totalCost)}
        </Text>
        <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[4] }}>
          <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
            <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>Tokens</Text>
            <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[600] }}>{formatTokens(model.tokenCount)}</Text>
          </Box>
          <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
            <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>Requests</Text>
            <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[600] }}>{(model.requestCount || 0).toLocaleString()}</Text>
          </Box>
          <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
            <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>Avg</Text>
            <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[600] }}>{formatCurrency(model.avgCostPerRequest)}</Text>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

/* Main preset */
export const BreakdownBhCostAnalyzer = createPreset<BhCostAnalyzerProps>({
  name: 'BhCostAnalyzer.Breakdown',
  render: ({ primitives, props, tokens }: PresetContext<BhCostAnalyzerProps>) => {
    const { Box, Text } = primitives;
    const isGlass = tokens.surface.useGlass;
    const ptypo = useMemo(() => getPersonalityTypography(tokens), [tokens]);
    const badgeRadius = useMemo(() => getPersonalityBadgeRadius(tokens), [tokens]);
    const sectionLabel = useMemo(() => createPersonalitySectionHeaderStyle(tokens), [tokens]);
    const { providers: rawProviders = [], models: rawModels = [], loading, className, style } = props;

    const providers = Array.isArray(rawProviders) ? rawProviders : [];
    const models = Array.isArray(rawModels) ? rawModels : [];

    const { maxCost, totalCost, providerColorMap } = useMemo(() => {
      const max = models.reduce((m, v) => Math.max(m, v.totalCost), 0);
      const total = models.reduce((s, v) => s + v.totalCost, 0);
      const colorMap: Record<string, string> = {};
      [...new Set(models.map(m => m.provider))].forEach((p, i) => { colorMap[p] = getProviderColor(i, tokens); });
      return { maxCost: max, totalCost: total, providerColorMap: colorMap };
    }, [models, tokens]);

    const cardStyle = useMemo(() => ({
      ...createCardStyle(tokens, { elevation: 'sm', padding: 0, glass: isGlass }),
      overflow: 'hidden' as const,
      borderRadius: tokens.borderRadius.lg,
      border: `1px solid ${tokens.colors.neutral[100]}`,
      ...style,
    }), [tokens, style]);
    const entrance = useMemo(() => createEntranceAnimation(tokens), [tokens]);
    const accentBar = useMemo(() => createPersonalityAccentBar(tokens), [tokens]);
    const animStyle = (index: number) => ({
      ...entrance.animate,
      transition: entrance.transition,
      transitionDelay: `${createStaggerDelay(tokens, index)}ms`,
    });

    if (loading) {
      return (
        <Box className={className} style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexDirection: 'column' as const, gap: tokens.spacing[3],
          padding: `${tokens.spacing[10]}px ${tokens.spacing[6]}px`, ...style,
        }}>
          <Activity size={24} color={tokens.colors.neutral[300]} />
          <Text style={{ color: tokens.colors.neutral[400], fontSize: tokens.typography.fontSize.sm }}>Loading cost breakdown...</Text>
        </Box>
      );
    }

    return (
      <Box className={className} style={cardStyle}>
        {accentBar && <Box style={accentBar} />}
        {/* Header */}
        <Box style={{
          padding: `${tokens.spacing[5]}px ${tokens.spacing[6]}px`,
          borderBottom: `1px solid ${tokens.colors.neutral[100]}`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3] }}>
            <Box style={createIconContainerStyle(tokens, { size: 36, color: tokens.colors.primaryScale[50] })}>
              <Layers size={ICON_SIZES.section} color={tokens.colors.primaryScale[500]} />
            </Box>
            <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[1] }}>
              <Text style={{
                fontSize: tokens.typography.fontSize.md,
                fontWeight: tokens.typography.fontWeight.bold,
                color: tokens.colors.neutral[900],
              }}>
                Cost Breakdown
              </Text>
              <Text style={{
                fontSize: tokens.typography.fontSize.xs,
                color: tokens.colors.neutral[400],
                marginTop: tokens.spacing[1],
              }}>
                {models.length} models across {providers.length} providers
              </Text>
            </Box>
          </Box>
          <Box style={{ display: 'flex', alignItems: 'baseline', gap: tokens.spacing[1],
          }}>
            <Text style={{
              fontSize: tokens.typography.fontSize.xs,
              color: tokens.colors.neutral[400],
              fontWeight: tokens.typography.fontWeight.medium,
            }}>
              Total
            </Text>
            <Text style={{
              fontSize: tokens.typography.fontSize.xl,
              fontWeight: tokens.typography.fontWeight.bold,
              color: tokens.colors.primaryScale[600],
            }}>
              {formatCurrency(totalCost)}
            </Text>
          </Box>
        </Box>

        {/* Column headers */}
        <Box style={{
          padding: `${tokens.spacing[2]}px ${tokens.spacing[6]}px`,
          borderBottom: `1px solid ${tokens.colors.neutral[100]}`,
          backgroundColor: tokens.colors.neutral[50],
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <Text style={{
            ...createSectionHeaderStyle(tokens),
            marginBottom: 0, flex: 2,
          }}>Model / Provider</Text>
          <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[6] }}>
            <Text style={{ ...createSectionHeaderStyle(tokens), marginBottom: 0, textAlign: 'right' as const }}>Cost</Text>
            <Text style={{ ...createSectionHeaderStyle(tokens), marginBottom: 0, textAlign: 'right' as const }}>Share</Text>
          </Box>
        </Box>

        {/* Model rows */}
        <Box style={{ maxHeight: 440, overflowY: 'auto' as const }}>
          {models.map(m => (
            <ModelRow
              key={m.modelId}
              model={m}
              maxCost={maxCost}
              totalCost={totalCost}
              providerColorMap={providerColorMap}
              tokens={tokens}
              primitives={primitives}
            />
          ))}
        </Box>

        {/* Provider summary footer */}
        <Box style={{
          padding: `${tokens.spacing[4]}px ${tokens.spacing[6]}px`,
          borderTop: `1px solid ${tokens.colors.neutral[100]}`,
          backgroundColor: tokens.colors.neutral[50],
        }}>
          <Box style={{ display: 'flex', gap: tokens.spacing[5], flexWrap: 'wrap' as const, alignItems: 'center' }}>
            {providers.map(p => {
              const dotColor = providerColorMap[p.providerName] ?? tokens.colors.primaryScale[500];

              return (
                <Box key={p.providerId} style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                  <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[1],
                    width: 8, height: 8, borderRadius: tokens.borderRadius.full,
                    backgroundColor: dotColor, flexShrink: 0,
                  }} />
                  <Text style={{
                    fontSize: tokens.typography.fontSize.xs,
                    fontWeight: tokens.typography.fontWeight.medium,
                    color: tokens.colors.neutral[600],
                  }}>
                    {p.providerName}
                  </Text>
                  <Text style={{
                    fontSize: tokens.typography.fontSize.xs,
                    fontWeight: tokens.typography.fontWeight.bold,
                    color: tokens.colors.neutral[800],
                  }}>
                    {formatCurrency(p.totalCost)}
                  </Text>
                </Box>
              );
            })}
          </Box>
        </Box>
      </Box>
    );
  },
});
