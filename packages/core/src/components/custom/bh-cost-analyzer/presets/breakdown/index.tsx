'use client';

/**
 * BhCostAnalyzer - Breakdown Preset
 * Detailed per-model cost breakdown table
 */

import { createPreset, PresetContext } from '../../../factory';
import type { BhCostAnalyzerProps } from '../../core';
import { formatCurrency, formatTokens } from '../../core';
import {
  createCardStyle,
  createPanelHeaderStyle,
  createListItemStyle,
  createSectionHeaderStyle,
  createStatusDotStyle,
} from '../../../helpers';

export const BreakdownBhCostAnalyzer = createPreset<BhCostAnalyzerProps>({
  name: 'BhCostAnalyzer.Breakdown',
  render: ({ primitives, props, tokens, engine }: PresetContext<BhCostAnalyzerProps>) => {
    const { Box, Flex, Stack, Text } = primitives;
    const isGlass = engine === 'modern' && !!tokens.glass;

    const { providers, models = [], loading, className, style } = props;

    if (loading) {
      return (
        <Flex align="center" justify="center" style={{ padding: tokens.spacing[8], ...style }} className={className}>
          <Text style={{ color: tokens.colors.neutral[500], fontSize: tokens.typography.fontSize.xs }}>Loading...</Text>
        </Flex>
      );
    }

    const colHeaderStyle = {
      ...createSectionHeaderStyle(tokens),
      marginBottom: 0,
    };

    return (
      <Box className={className} style={{ ...createCardStyle(tokens, { glass: isGlass, padding: 0 }), overflow: 'hidden', ...style }}>
        <Box style={createPanelHeaderStyle(tokens)}>
          <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[700] }}>
            Cost Breakdown ({models.length} models)
          </Text>
        </Box>
        {/* Table header */}
        <Flex style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`, background: tokens.colors.neutral[50] }}>
          <Box style={{ flex: 2 }}><Text style={colHeaderStyle}>Model</Text></Box>
          <Box style={{ flex: 1 }}><Text style={colHeaderStyle}>Provider</Text></Box>
          <Box style={{ flex: 1, textAlign: 'right' as const }}><Text style={colHeaderStyle}>Cost</Text></Box>
          <Box style={{ flex: 1, textAlign: 'right' as const }}><Text style={colHeaderStyle}>Tokens</Text></Box>
          <Box style={{ flex: 1, textAlign: 'right' as const }}><Text style={colHeaderStyle}>Avg/Req</Text></Box>
        </Flex>
        <Stack gap={0} style={{ maxHeight: 400, overflowY: 'auto' }}>
          {models.map(m => (
            <Flex key={m.modelId} align="center" style={createListItemStyle(tokens, { interactive: false })}>
              <Box style={{ flex: 2 }}><Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[800] }}>{m.modelName}</Text></Box>
              <Box style={{ flex: 1 }}><Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[600] }}>{m.provider}</Text></Box>
              <Box style={{ flex: 1, textAlign: 'right' as const }}><Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[800] }}>{formatCurrency(m.totalCost)}</Text></Box>
              <Box style={{ flex: 1, textAlign: 'right' as const }}><Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[600] }}>{formatTokens(m.tokenCount)}</Text></Box>
              <Box style={{ flex: 1, textAlign: 'right' as const }}><Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[600] }}>{formatCurrency(m.avgCostPerRequest)}</Text></Box>
            </Flex>
          ))}
        </Stack>
        {/* Provider summary footer */}
        <Box style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, borderTop: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`, background: tokens.colors.neutral[50] }}>
          <Flex gap={16} wrap="wrap">
            {providers.map(p => (
              <Flex key={p.providerId} gap={6} align="center">
                <Box style={createStatusDotStyle(tokens, tokens.colors.primaryScale[500])} />
                <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[600] }}>{p.providerName}: {formatCurrency(p.totalCost)}</Text>
              </Flex>
            ))}
          </Flex>
        </Box>
      </Box>
    );
  },
});
