import { useMemo } from 'react';
'use client';

/**
 * BhSkillGapMap - List Preset
 * Simple gap list without heatmap visualization
 */

import { createPreset, PresetContext } from '../../../factory';
import type { BhSkillGapMapProps } from '../../core';
import { getPriorityColors } from '../../core';
import {
  createCardStyle,
  createPanelHeaderStyle,
  createListItemStyle,
  createProgressBarStyle,
  createHoverStyle,
} from '../../../helpers';

export const ListBhSkillGapMap = createPreset<BhSkillGapMapProps>({
  name: 'BhSkillGapMap.List',
  render: ({ primitives, props, tokens, engine }: PresetContext<BhSkillGapMapProps>) => {
    const { Box, Flex, Stack, Text } = primitives;
    const isGlass = engine === 'modern' && !!tokens.glass;
    const priorityColors = getPriorityColors(tokens);

    const { gaps, onGapSelect, loading, className, style } = props;

    if (loading) {
      return (
        <Flex align="center" justify="center" style={{ padding: tokens.spacing[8], ...style }} className={className}>
          <Text style={{ color: tokens.colors.neutral[500], fontSize: tokens.typography.fontSize.xs }}>Loading...</Text>
        </Flex>
      );
    }

    return (
      <Box className={className} style={{ ...createCardStyle(tokens, { glass: isGlass, padding: 0 }), overflow: 'hidden', ...style }}>
        <Box style={createPanelHeaderStyle(tokens)}>
          <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[700] }}>
            Skill Gaps ({gaps.length})
          </Text>
        </Box>
        <Stack gap={0} style={{ maxHeight: 360, overflowY: 'auto' }}>
          {gaps.map(gap => {
            const pc = priorityColors[gap.priority];
            const pct = gap.requiredLevel > 0 ? Math.round((gap.currentLevel / gap.requiredLevel) * 100) : 0;
            const barColor = pct >= 70 ? tokens.colors.successScale[500] : pct >= 40 ? tokens.colors.warningScale[500] : tokens.colors.errorScale[500];
            const progressStyles = useMemo(() => createProgressBarStyle(tokens, { color: barColor, percent: pct }), [tokens, pct]);
            return (
              <Box key={gap.id} onClick={() => onGapSelect?.(gap.id)} style={createListItemStyle(tokens, { interactive: !!onGapSelect })}>
                <Flex justify="between" align="center" style={{ marginBottom: tokens.spacing[1] }}>
                  <Flex gap={6} align="center">
                    <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[700] }}>{gap.dimensionCode}</Text>
                    <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[800] }}>{gap.dimension}</Text>
                  </Flex>
                  <Box style={{ padding: `${tokens.spacing[0]}px ${tokens.spacing[1]}px`, borderRadius: tokens.borderRadius.full, background: pc.bgColor, border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${pc.border}` }}>
                    <Text style={{ fontSize: tokens.typography.fontSize.xs, color: pc.color, textTransform: 'capitalize' as const }}>{gap.priority}</Text>
                  </Box>
                </Flex>
                <Flex gap={8} align="center">
                  <Box style={{ flex: 1, ...progressStyles.track }}>
                    <div style={progressStyles.fill} />
                  </Box>
                  <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{gap.currentLevel}/{gap.requiredLevel}</Text>
                </Flex>
              </Box>
            );
          })}
        </Stack>
      </Box>
    );
  },
});
