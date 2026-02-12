'use client';

/**
 * BhCostAnalyzer - Breakdown Preset
 * Slite-inspired per-model cost breakdown with generous whitespace,
 * warm neutrals, relative cost bars, percentage badges, inline trend
 * sparklines, provider color dots, and summary totals.
 */

import { useState, useMemo } from 'react';
import { createPreset, PresetContext } from '../../../factory';
import type { BhCostAnalyzerProps, ModelCost, ProviderCost } from '../../core';
import { formatCurrency, formatTokens } from '../../core';
import {
  createCardStyle, createBadgeStyle, createHoverStyle,
  createSectionHeaderStyle, createStatusDotStyle,
} from '../../../helpers';
import { DollarSign, TrendingUp, Layers, Activity } from 'lucide-react';

const MOCK_PROVIDERS: ProviderCost[] = [
  { providerId: 'openai', providerName: 'OpenAI', totalCost: 4280.50, tokenCount: 12400000, requestCount: 8420, share: 62.3, trend: 'up' as const, trendValue: 8.2 },
  { providerId: 'anthropic', providerName: 'Anthropic', totalCost: 1850.25, tokenCount: 5200000, requestCount: 3150, share: 26.9, trend: 'down' as const, trendValue: 3.1 },
];

const MOCK_MODELS: ModelCost[] = [
  { modelId: 'gpt4o', modelName: 'GPT-4o', provider: 'OpenAI', totalCost: 2840.30, tokenCount: 8200000, requestCount: 5600, avgCostPerRequest: 0.507 },
  { modelId: 'gpt4o-mini', modelName: 'GPT-4o Mini', provider: 'OpenAI', totalCost: 1440.20, tokenCount: 4200000, requestCount: 2820, avgCostPerRequest: 0.511 },
  { modelId: 'claude-sonnet', modelName: 'Claude 3.5 Sonnet', provider: 'Anthropic', totalCost: 1250.15, tokenCount: 3500000, requestCount: 2100, avgCostPerRequest: 0.595 },
  { modelId: 'claude-haiku', modelName: 'Claude 3 Haiku', provider: 'Anthropic', totalCost: 600.10, tokenCount: 1700000, requestCount: 1050, avgCostPerRequest: 0.572 },
];

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
            width: 10, height: 10, borderRadius: tokens.borderRadius.full,
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
          transition: `width 0.3s ease`,
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
            <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[600] }}>{model.requestCount.toLocaleString()}</Text>
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
    const { providers = MOCK_PROVIDERS, models = MOCK_MODELS, loading, className, style } = props;

    const { maxCost, totalCost, providerColorMap } = useMemo(() => {
      const max = models.reduce((m, v) => Math.max(m, v.totalCost), 0);
      const total = models.reduce((s, v) => s + v.totalCost, 0);
      const colorMap: Record<string, string> = {};
      [...new Set(models.map(m => m.provider))].forEach((p, i) => { colorMap[p] = getProviderColor(i, tokens); });
      return { maxCost: max, totalCost: total, providerColorMap: colorMap };
    }, [models, tokens]);

    const cardStyle = useMemo(() => ({
      ...createCardStyle(tokens, { elevation: 'sm', padding: 0 }),
      overflow: 'hidden' as const,
      borderRadius: tokens.borderRadius.lg,
      border: `1px solid ${tokens.colors.neutral[100]}`,
      ...style,
    }), [tokens, style]);

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
        {/* Header */}
        <Box style={{
          padding: `${tokens.spacing[5]}px ${tokens.spacing[6]}px`,
          borderBottom: `1px solid ${tokens.colors.neutral[100]}`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3] }}>
            <Box style={{
              width: 36, height: 36, borderRadius: tokens.borderRadius.lg,
              backgroundColor: tokens.colors.primaryScale[50],
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Layers size={18} color={tokens.colors.primaryScale[500]} />
            </Box>
            <Box>
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
                marginTop: 2,
              }}>
                {models.length} models across {providers.length} providers
              </Text>
            </Box>
          </Box>
          <Box style={{
            display: 'flex', alignItems: 'baseline', gap: tokens.spacing[1],
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
          <Box style={{ display: 'flex', gap: tokens.spacing[6] }}>
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
                  <Box style={{
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
