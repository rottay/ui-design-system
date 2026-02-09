'use client';

/**
 * BhInterviewReplay - Compact Preset
 * Premium condensed transcript with timeline scrubber, speaker avatars,
 * evidence markers, confidence badges, and playback summary stats.
 */

import { useState, useMemo } from 'react';
import { createPreset, PresetContext } from '../../../factory';
import type { BhInterviewReplayProps, TranscriptEntry } from '../../core';
import { getSpeakerColors } from '../../core';
import {
  createCardStyle, createPanelHeaderStyle, createListItemStyle, createBadgeStyle,
  createAccentBarStyle, createHoverStyle, getHoverTransform, getCardHoverShadow,
  createStatusDotStyle, createSectionHeaderStyle,
} from '../../../helpers';

/* Timeline scrubber bar */
function TimelineScrubber({ transcript, speakerColors, tokens, primitives }: {
  transcript: TranscriptEntry[]; speakerColors: ReturnType<typeof getSpeakerColors>; tokens: any; primitives: any;
}) {
  const { Flex } = primitives;
  const segments = useMemo(() => {
    if (transcript.length === 0) return [];
    const w = 100 / transcript.length;
    return transcript.map(e => ({ id: e.id, color: speakerColors[e.speaker]?.color ?? tokens.colors.neutral[400], width: `${w}%` }));
  }, [transcript, speakerColors, tokens]);

  return (
    <Flex style={{ height: 6, borderRadius: tokens.borderRadius.full, overflow: 'hidden' as const, background: tokens.colors.neutral[100] }}>
      {segments.map(seg => (
        <div key={seg.id} style={{ width: seg.width, height: '100%', backgroundColor: seg.color, transition: `opacity ${tokens.motion.hover}` }} />
      ))}
    </Flex>
  );
}

/* Transcript entry child component (hooks-safe) */
function EntryRow({ entry, speakerColors, tokens, onEntrySelect, primitives }: {
  entry: TranscriptEntry; speakerColors: ReturnType<typeof getSpeakerColors>; tokens: any; onEntrySelect?: (id: string) => void; primitives: any;
}) {
  const { Box, Flex, Text } = primitives;
  const [hovered, setHovered] = useState(false);
  const sc = speakerColors[entry.speaker];
  const initial = entry.speakerName.charAt(0).toUpperCase();

  const rowStyle = useMemo(() => ({
    ...createListItemStyle(tokens, { interactive: !!onEntrySelect }),
    borderLeft: `3px solid ${sc.color}`,
    ...(hovered ? { backgroundColor: tokens.colors.neutral[50], boxShadow: getCardHoverShadow(tokens), ...getHoverTransform(tokens) } : {}),
  }), [tokens, onEntrySelect, sc.color, hovered]);

  const avatarStyle = useMemo(() => ({
    width: 24, height: 24, borderRadius: tokens.borderRadius.full,
    backgroundColor: sc.bgColor, border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${sc.border}`,
    display: 'flex' as const, alignItems: 'center' as const, justifyContent: 'center' as const, flexShrink: 0,
  }), [tokens, sc]);

  const durationStr = useMemo(() => {
    if (!entry.durationMs) return null;
    const s = Math.round(entry.durationMs / 1000);
    return s >= 60 ? `${Math.floor(s / 60)}m ${s % 60}s` : `${s}s`;
  }, [entry.durationMs]);

  const confidenceBadgeColor: 'success' | 'warning' | 'error' | null = entry.confidence !== undefined
    ? (entry.confidence >= 0.7 ? 'success' : entry.confidence >= 0.4 ? 'warning' : 'error')
    : null;

  const confidenceTextColor = entry.confidence !== undefined
    ? (entry.confidence >= 0.7 ? tokens.colors.successScale[700] : entry.confidence >= 0.4 ? tokens.colors.warningScale[700] : tokens.colors.errorScale[700])
    : undefined;

  return (
    <Box onClick={() => onEntrySelect?.(entry.id)} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} style={rowStyle}>
      <Flex gap={8} align="start">
        <Box style={avatarStyle}>
          <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: sc.color, lineHeight: 1 }}>{initial}</Text>
        </Box>
        <Box style={{ flex: 1, minWidth: 0 }}>
          <Flex justify="between" align="center" style={{ marginBottom: tokens.spacing[1] }}>
            <Flex gap={6} align="center">
              <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: sc.color }}>{entry.speakerName}</Text>
              <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>{entry.timestamp}</Text>
              {durationStr && <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>({durationStr})</Text>}
            </Flex>
            <Flex gap={4} align="center">
              {entry.hasEvidence && (
                <Box style={{ ...createBadgeStyle(tokens, 'warning'), padding: `0 ${tokens.spacing[1]}px` }}>
                  <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.warningScale[700] }}>Evidence</Text>
                </Box>
              )}
              {confidenceBadgeColor && (
                <Box style={{ ...createBadgeStyle(tokens, confidenceBadgeColor), padding: `0 ${tokens.spacing[1]}px` }}>
                  <Text style={{ fontSize: tokens.typography.fontSize.xs, color: confidenceTextColor }}>{Math.round(entry.confidence! * 100)}%</Text>
                </Box>
              )}
            </Flex>
          </Flex>
          <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[700], lineHeight: 1.5 }}>{entry.text}</Text>
        </Box>
      </Flex>
    </Box>
  );
}

/* Main preset */
export const CompactBhInterviewReplay = createPreset<BhInterviewReplayProps>({
  name: 'BhInterviewReplay.Compact',
  render: ({ primitives, props, tokens, engine }: PresetContext<BhInterviewReplayProps>) => {
    const { Box, Flex, Stack, Text, Spinner } = primitives;
    const isGlass = tokens.surface.useGlass && !!tokens.glass;
    const speakerColors = getSpeakerColors(tokens);
    const { transcript, candidateName, jobTitle, onEntrySelect, loading, className, style } = props;

    const stats = useMemo(() => {
      const totalMs = transcript.reduce((s, e) => s + (e.durationMs ?? 0), 0);
      const totalSecs = Math.round(totalMs / 1000);
      const durationStr = totalMs > 0 ? `${Math.floor(totalSecs / 60)}m ${totalSecs % 60}s` : null;
      const speakers = [...new Set(transcript.map(e => e.speakerName))];
      const evidenceCount = transcript.filter(e => e.hasEvidence).length;
      return { durationStr, speakerCount: speakers.length, evidenceCount, entryCount: transcript.length };
    }, [transcript]);

    const cardStyle = useMemo(() => ({
      ...createCardStyle(tokens, { glass: isGlass, padding: 0 }), overflow: 'hidden' as const, ...style,
    }), [tokens, isGlass, style]);

    if (loading) {
      return (
        <Flex align="center" justify="center" direction="column" gap={8} style={{ padding: tokens.spacing[8], ...style }} className={className}>
          <Spinner size="sm" />
          <Text style={{ color: tokens.colors.neutral[500], fontSize: tokens.typography.fontSize.xs }}>Loading transcript...</Text>
        </Flex>
      );
    }

    return (
      <Box className={className} style={cardStyle}>
        <div style={createAccentBarStyle(tokens, { position: 'top' })} />
        <Flex align="center" justify="between" style={createPanelHeaderStyle(tokens)}>
          <Box>
            <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[800] }}>
              {candidateName ?? 'Transcript'}{jobTitle ? ` - ${jobTitle}` : ''}
            </Text>
          </Box>
          <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{stats.entryCount} entries</Text>
        </Flex>

        {/* Summary stats bar */}
        <Flex gap={12} align="center" style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}` }}>
          {stats.durationStr && (
            <Flex gap={4} align="center">
              <Box style={createStatusDotStyle(tokens, tokens.colors.primaryScale[500])} />
              <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[600] }}>{stats.durationStr}</Text>
            </Flex>
          )}
          <Flex gap={4} align="center">
            <Box style={createStatusDotStyle(tokens, tokens.colors.secondaryScale[500])} />
            <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[600] }}>{stats.speakerCount} speakers</Text>
          </Flex>
          {stats.evidenceCount > 0 && (
            <Flex gap={4} align="center">
              <Box style={createStatusDotStyle(tokens, tokens.colors.warningScale[500])} />
              <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[600] }}>{stats.evidenceCount} evidence</Text>
            </Flex>
          )}
        </Flex>

        {/* Timeline scrubber */}
        <Box style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}` }}>
          <Text style={{ ...createSectionHeaderStyle(tokens), marginBottom: tokens.spacing[1] }}>Timeline</Text>
          <TimelineScrubber transcript={transcript} speakerColors={speakerColors} tokens={tokens} primitives={primitives} />
          <Flex gap={12} style={{ marginTop: tokens.spacing[1] }}>
            {(['candidate', 'interviewer', 'system'] as const).map(role => {
              const sc = speakerColors[role];
              const count = transcript.filter(e => e.speaker === role).length;
              if (count === 0) return null;
              return (
                <Flex key={role} gap={4} align="center">
                  <Box style={createStatusDotStyle(tokens, sc.color)} />
                  <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], textTransform: 'capitalize' as const }}>{role} ({count})</Text>
                </Flex>
              );
            })}
          </Flex>
        </Box>

        {/* Transcript entries */}
        <Stack gap={0} style={{ maxHeight: 400, overflowY: 'auto' as const }}>
          {transcript.map(entry => (
            <EntryRow key={entry.id} entry={entry} speakerColors={speakerColors} tokens={tokens} onEntrySelect={onEntrySelect} primitives={primitives} />
          ))}
        </Stack>
      </Box>
    );
  },
});
