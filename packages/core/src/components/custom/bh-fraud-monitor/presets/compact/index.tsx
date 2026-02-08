'use client';

/**
 * BhFraudMonitor - Compact Preset
 * Condensed event list for sidebar/card usage
 */

import { createPreset, PresetContext } from '../../../factory';
import type { BhFraudMonitorProps } from '../../core';
import { getSeverityColors, getEventTypeLabel } from '../../core';
import {
  createCardStyle,
  createPanelHeaderStyle,
  createListItemStyle,
  createHoverStyle,
  createStatusDotStyle,
} from '../../../helpers';

export const CompactBhFraudMonitor = createPreset<BhFraudMonitorProps>({
  name: 'BhFraudMonitor.Compact',
  render: ({ primitives, props, tokens, engine }: PresetContext<BhFraudMonitorProps>) => {
    const { Box, Flex, Stack, Text } = primitives;
    const isGlass = engine === 'modern' && !!tokens.glass;
    const sevColors = getSeverityColors(tokens);

    const { events, onEventSelect, loading, className, style } = props;

    if (loading) {
      return (
        <Flex align="center" justify="center" style={{ padding: tokens.spacing[6], ...style }} className={className}>
          <Text style={{ color: tokens.colors.neutral[500], fontSize: tokens.typography.fontSize.xs }}>Loading...</Text>
        </Flex>
      );
    }

    const criticalCount = events.filter(e => e.severity === 'critical').length;
    const highCount = events.filter(e => e.severity === 'high').length;

    return (
      <Box className={className} style={{ ...createCardStyle(tokens, { glass: isGlass, padding: 0 }), overflow: 'hidden', ...style }}>
        <Flex align="center" justify="between" style={createPanelHeaderStyle(tokens)}>
          <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[700] }}>
            Fraud Events ({events.length})
          </Text>
          <Flex gap={6}>
            {criticalCount > 0 && (
              <Flex gap={4} align="center" style={{ padding: `${tokens.spacing[0]}px ${tokens.spacing[1]}px`, borderRadius: tokens.borderRadius.full, background: sevColors.critical.bgColor, border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${sevColors.critical.border}` }}>
                <Box style={createStatusDotStyle(tokens, sevColors.critical.dot)} />
                <Text style={{ fontSize: tokens.typography.fontSize.xs, color: sevColors.critical.color }}>{criticalCount} critical</Text>
              </Flex>
            )}
            {highCount > 0 && (
              <Flex gap={4} align="center" style={{ padding: `${tokens.spacing[0]}px ${tokens.spacing[1]}px`, borderRadius: tokens.borderRadius.full, background: sevColors.high.bgColor, border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${sevColors.high.border}` }}>
                <Box style={createStatusDotStyle(tokens, sevColors.high.dot)} />
                <Text style={{ fontSize: tokens.typography.fontSize.xs, color: sevColors.high.color }}>{highCount} high</Text>
              </Flex>
            )}
          </Flex>
        </Flex>
        <Stack gap={0} style={{ maxHeight: 280, overflowY: 'auto' }}>
          {events.slice(0, 10).map(ev => {
            const sc = sevColors[ev.severity];
            return (
              <Box
                key={ev.id}
                onClick={() => onEventSelect?.(ev.id)}
                style={{
                  ...createListItemStyle(tokens, { interactive: !!onEventSelect }),
                  borderLeft: `3px solid ${sc.dot}`,
                }}
              >
                <Flex justify="between" align="center">
                  <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[800] }}>{getEventTypeLabel(ev.type)}</Text>
                  <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>{ev.timestamp}</Text>
                </Flex>
              </Box>
            );
          })}
        </Stack>
      </Box>
    );
  },
});
