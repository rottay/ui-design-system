'use client';

/**
 * BhInterviewReplay - Compact Preset
 * Condensed transcript-only view
 */

import { createPreset, PresetContext } from '../../../factory';
import type { BhInterviewReplayProps } from '../../core';
import { getSpeakerColors } from '../../core';
import {
  createCardStyle,
  createPanelHeaderStyle,
  createListItemStyle,
  createStatusDotStyle,
} from '../../../helpers';

export const CompactBhInterviewReplay = createPreset<BhInterviewReplayProps>({
  name: 'BhInterviewReplay.Compact',
  render: ({ primitives, props, tokens, engine }: PresetContext<BhInterviewReplayProps>) => {
    const { Box, Flex, Stack, Text } = primitives;
    const isGlass = engine === 'modern' && !!tokens.glass;
    const speakerColors = getSpeakerColors(tokens);

    const { transcript, candidateName, jobTitle, onEntrySelect, loading, className, style } = props;

    if (loading) {
      return (
        <Flex align="center" justify="center" style={{ padding: tokens.spacing[8], ...style }} className={className}>
          <Text style={{ color: tokens.colors.neutral[500], fontSize: tokens.typography.fontSize.xs }}>Loading...</Text>
        </Flex>
      );
    }

    return (
      <Box className={className} style={{ ...createCardStyle(tokens, { glass: isGlass, padding: 0 }), overflow: 'hidden', ...style }}>
        <Flex align="center" justify="between" style={createPanelHeaderStyle(tokens)}>
          <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[800] }}>
            {candidateName ?? 'Transcript'} {jobTitle ? `- ${jobTitle}` : ''}
          </Text>
          <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{transcript.length} entries</Text>
        </Flex>
        <Stack gap={0} style={{ maxHeight: 360, overflowY: 'auto' }}>
          {transcript.map(entry => {
            const sc = speakerColors[entry.speaker];
            return (
              <Box
                key={entry.id}
                onClick={() => onEntrySelect?.(entry.id)}
                style={createListItemStyle(tokens, { interactive: !!onEntrySelect })}
              >
                <Flex gap={6} align="center" style={{ marginBottom: 2 }}>
                  <Box style={createStatusDotStyle(tokens, sc.color)} />
                  <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: sc.color }}>{entry.speakerName}</Text>
                  <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>{entry.timestamp}</Text>
                </Flex>
                <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[700], paddingLeft: 14 }}>{entry.text}</Text>
              </Box>
            );
          })}
        </Stack>
      </Box>
    );
  },
});
