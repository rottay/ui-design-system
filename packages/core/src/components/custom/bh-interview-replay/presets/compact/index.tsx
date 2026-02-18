'use client';

/**
 * BhInterviewReplay - Compact Preset
 * Condensed transcript with timeline scrubber, speaker avatars,
 * evidence markers, confidence badges, and playback summary stats.
 * Personality-driven, glass-aware, accessible.
 */

import { useState, useMemo, useCallback } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import type { BhInterviewReplayProps, TranscriptEntry } from '../../core';
import { getSpeakerColors } from '../../core';
import {
  createCardStyle,
  createBadgeStyle,
  createCardHoverStyles,
  createEntranceAnimation,
  createStaggerDelay,
  createIconContainerStyle,
  createPersonalitySectionHeaderStyle,
  getPersonalityTypography,
  getPersonalityBadgeRadius,
  createPersonalityAccentBar,
  createEmptyStateStyle,
  getAccentAwareLayout,
  ICON_SIZES,
} from '../../../helpers';
import { MessageSquare, Bookmark, Users, Clock } from 'lucide-react';
import type { DesignTokens } from '../../../../../types';

/* Timeline scrubber bar */
function TimelineScrubber({ transcript, speakerColors, tokens, primitives }: {
  transcript: TranscriptEntry[]; speakerColors: ReturnType<typeof getSpeakerColors>; tokens: DesignTokens; primitives: any;
}) {
  const { Box } = primitives;
  const segments = useMemo(() => {
    if (transcript.length === 0) return [];
    const w = 100 / transcript.length;
    return transcript.map(e => ({ id: e.id, color: speakerColors[e.speaker]?.color ?? tokens.colors.neutral[400], width: `${w}%` }));
  }, [transcript, speakerColors, tokens]);

  return (
    <Box style={{ display: 'flex', height: 6, borderRadius: tokens.borderRadius.full, overflow: 'hidden' as const, background: tokens.colors.neutral[100] }}>
      {segments.map(seg => (
        <Box key={seg.id} style={{ width: seg.width, height: '100%', backgroundColor: seg.color, transition: `opacity ${tokens.motion.hover}` }} />
      ))}
    </Box>
  );
}

/* Transcript entry child component */
function EntryRow({ entry, speakerColors, tokens, onEntrySelect, primitives, index }: {
  entry: TranscriptEntry; speakerColors: ReturnType<typeof getSpeakerColors>; tokens: DesignTokens; onEntrySelect?: (id: string) => void; primitives: any; index: number;
}) {
  const { Box, Text } = primitives;
  const [hovered, setHovered] = useState(false);
  const sc = speakerColors[entry.speaker];
  const initial = (entry.speakerName || '').charAt(0).toUpperCase();
  const personalityTypo = useMemo(() => getPersonalityTypography(tokens), [tokens]);
  const badgeRadius = useMemo(() => getPersonalityBadgeRadius(tokens), [tokens]);
  const entryAnim = useMemo(() => createEntranceAnimation(tokens, { index }), [tokens, index]);
  const iconStyle = useMemo(() => createIconContainerStyle(tokens, { size: 24, color: sc.bgColor }), [tokens, sc.bgColor]);

  const durationStr = useMemo(() => {
    if (!entry.durationMs) return null;
    const s = Math.round(entry.durationMs / 1000);
    return s >= 60 ? `${Math.floor(s / 60)}m ${s % 60}s` : `${s}s`;
  }, [entry.durationMs]);

  const confidenceBadgeColor: 'success' | 'warning' | 'error' | null = entry.confidence !== undefined
    ? (entry.confidence >= 0.7 ? 'success' : entry.confidence >= 0.4 ? 'warning' : 'error')
    : null;

  const handleClick = useCallback(() => {
    onEntrySelect?.(entry.id);
  }, [onEntrySelect, entry.id]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onEntrySelect?.(entry.id);
    }
  }, [onEntrySelect, entry.id]);

  const handleMouseEnter = useCallback(() => setHovered(true), []);
  const handleMouseLeave = useCallback(() => setHovered(false), []);

  return (
    <Box
      role="button"
      tabIndex={0}
      aria-label={`${entry.speakerName} at ${entry.timestamp}: ${entry.text.substring(0, 60)}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        padding: `${tokens.spacing[3]}px ${tokens.spacing[5]}px`,
        borderBottom: `1px solid ${tokens.colors.neutral[100]}`,
        borderLeft: `3px solid ${sc.color}`,
        backgroundColor: hovered ? tokens.colors.neutral[50] : 'transparent',
        cursor: onEntrySelect ? 'pointer' : 'default',
        transition: `all ${tokens.motion.hover}`,
        ...entryAnim.animate,
      }}
    >
      <Box style={{ display: 'flex', gap: tokens.spacing[2], alignItems: 'flex-start' }}>
        <Box style={{ ...iconStyle, border: `1px solid ${sc.border}` }}>
          <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: sc.color, lineHeight: 1 }}>{initial}</Text>
        </Box>
        <Box style={{ flex: 1, minWidth: 0 }}>
          <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: tokens.spacing[1] }}>
            <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
              <Text style={{
                fontSize: tokens.typography.fontSize.xs,
                fontWeight: personalityTypo.headingWeight,
                color: sc.color,
                letterSpacing: personalityTypo.labelLetterSpacing,
                textTransform: personalityTypo.labelTransform,
              }}>{entry.speakerName}</Text>
              <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>{entry.timestamp}</Text>
              {durationStr && <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>({durationStr})</Text>}
            </Box>
            <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
              {entry.hasEvidence && (
                <Box style={{ ...createBadgeStyle(tokens, 'warning'), borderRadius: badgeRadius, padding: `0 ${tokens.spacing[1]}px` }}>
                  <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.warningScale[700] }}>Evidence</Text>
                </Box>
              )}
              {confidenceBadgeColor && (
                <Box style={{ ...createBadgeStyle(tokens, confidenceBadgeColor), borderRadius: badgeRadius, padding: `0 ${tokens.spacing[1]}px` }}>
                  <Text style={{ fontSize: tokens.typography.fontSize.xs }}>{Math.round(entry.confidence! * 100)}%</Text>
                </Box>
              )}
            </Box>
          </Box>
          <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[700], lineHeight: tokens.typography.lineHeight.relaxed }}>{entry.text}</Text>
        </Box>
      </Box>
    </Box>
  );
}

/* Main preset */
export const CompactBhInterviewReplay = createPreset<BhInterviewReplayProps>({
  name: 'BhInterviewReplay.Compact',
  render: ({ primitives, props, tokens }: PresetContext<BhInterviewReplayProps>) => {
    const { Box, Text } = primitives;
    const speakerColors = useMemo(() => getSpeakerColors(tokens), [tokens]);
    const personalityTypo = useMemo(() => getPersonalityTypography(tokens), [tokens]);
    const sectionHeaderStyle = useMemo(() => createPersonalitySectionHeaderStyle(tokens), [tokens]);
    const entranceAnim = useMemo(() => createEntranceAnimation(tokens, { index: 0 }), [tokens]);
    const accentBar = useMemo(() => createPersonalityAccentBar(tokens), [tokens]);
    const accentLayout = useMemo(() => getAccentAwareLayout(tokens), [tokens]);
    const badgeRadius = useMemo(() => getPersonalityBadgeRadius(tokens), [tokens]);
    const headerIconStyle = useMemo(() => createIconContainerStyle(tokens, { size: 32, color: tokens.colors.primaryScale[50] }), [tokens]);

    const isGlass = tokens.surface.useGlass && !!tokens.glass;

    const { transcript: rawTranscript = [], candidateName, jobTitle, onEntrySelect, loading, className, style } = props;

    const transcript = Array.isArray(rawTranscript) ? rawTranscript : [];

    const stats = useMemo(() => {
      const totalMs = transcript.reduce((s, e) => s + (e.durationMs ?? 0), 0);
      const totalSecs = Math.round(totalMs / 1000);
      const durationStr = totalMs > 0 ? `${Math.floor(totalSecs / 60)}m ${totalSecs % 60}s` : null;
      const speakers = [...new Set(transcript.map(e => e.speakerName))];
      const evidenceCount = transcript.filter(e => e.hasEvidence).length;
      return { durationStr, speakerCount: speakers.length, evidenceCount, entryCount: transcript.length };
    }, [transcript]);

    const cardStyle = useMemo(() => ({
      ...createCardStyle(tokens, { elevation: 'sm' as const, padding: 0, glass: isGlass }),
      borderRadius: tokens.borderRadius.lg,
      overflow: 'hidden' as const,
      ...entranceAnim.animate,
      transition: entranceAnim.transition,
    }), [tokens, isGlass, entranceAnim]);

    if (loading) {
      return (
        <Box className={className} style={{
          ...createEmptyStateStyle(tokens),
          ...style,
        }}>
          <Text style={{ color: tokens.colors.neutral[400], fontSize: tokens.typography.fontSize.sm }}>Loading transcript...</Text>
        </Box>
      );
    }

    return (
      <Box className={className} style={{ ...cardStyle, ...style }}>
        {/* Accent bar */}
        {accentBar && <Box style={accentBar} />}

        <Box style={accentLayout.inner}>

        {/* Header */}
        <Box style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: `${tokens.spacing[5]}px ${tokens.spacing[6]}px`,
          borderBottom: `1px solid ${tokens.colors.neutral[100]}`,
          backgroundColor: tokens.colors.neutral[50],
        }}>
          <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3] }}>
            <Box style={headerIconStyle}>
              <MessageSquare size={ICON_SIZES.section} color={tokens.colors.primaryScale[500]} />
            </Box>
            <Text style={{
              fontSize: tokens.typography.fontSize.md,
              fontWeight: personalityTypo.headingWeight,
              color: tokens.colors.neutral[900],
              letterSpacing: personalityTypo.headingLetterSpacing,
            }}>
              {candidateName ?? 'Transcript'}{jobTitle ? ` - ${jobTitle}` : ''}
            </Text>
          </Box>
          <Box style={{ ...createBadgeStyle(tokens, 'primary'), borderRadius: badgeRadius, padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px` }}>
            <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.primaryScale[700] }}>{stats.entryCount} entries</Text>
          </Box>
        </Box>

        {/* Summary stats bar */}
        <Box style={{
          display: 'flex', gap: tokens.spacing[4], alignItems: 'center',
          padding: `${tokens.spacing[3]}px ${tokens.spacing[6]}px`,
          borderBottom: `1px solid ${tokens.colors.neutral[100]}`,
        }}>
          {stats.durationStr && (
            <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
              <Clock size={ICON_SIZES.label} color={tokens.colors.primaryScale[500]} />
              <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[600] }}>{stats.durationStr}</Text>
            </Box>
          )}
          <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
            <Users size={ICON_SIZES.label} color={tokens.colors.secondaryScale[500]} />
            <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[600] }}>{stats.speakerCount} speakers</Text>
          </Box>
          {stats.evidenceCount > 0 && (
            <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
              <Bookmark size={ICON_SIZES.label} color={tokens.colors.warningScale[500]} />
              <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[600] }}>{stats.evidenceCount} evidence</Text>
            </Box>
          )}
        </Box>

        {/* Timeline scrubber */}
        <Box style={{
          padding: `${tokens.spacing[3]}px ${tokens.spacing[6]}px`,
          borderBottom: `1px solid ${tokens.colors.neutral[100]}`,
        }}>
          <Text style={sectionHeaderStyle}>Timeline</Text>
          <TimelineScrubber transcript={transcript} speakerColors={speakerColors} tokens={tokens} primitives={primitives} />
          <Box style={{ display: 'flex', gap: tokens.spacing[4], marginTop: tokens.spacing[2] }}>
            {(['candidate', 'interviewer', 'system'] as const).map(role => {
              const sc = speakerColors[role];
              const count = transcript.filter(e => e.speaker === role).length;
              if (count === 0) return null;
              return (
                <Box key={role} style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
                  <Box style={{ width: 8, height: 8, borderRadius: tokens.borderRadius.full, backgroundColor: sc.color }} />
                  <Text style={{
                    fontSize: tokens.typography.fontSize.xs,
                    color: tokens.colors.neutral[500],
                    textTransform: personalityTypo.labelTransform,
                    letterSpacing: personalityTypo.labelLetterSpacing,
                  }}>{role} ({count})</Text>
                </Box>
              );
            })}
          </Box>
        </Box>

        {/* Transcript entries */}
        <Box role="list" aria-label="Transcript entries" style={{ maxHeight: 400, overflowY: 'auto' as const }}>
          {transcript.map((entry, idx) => (
            <EntryRow key={entry.id} entry={entry} speakerColors={speakerColors} tokens={tokens} onEntrySelect={onEntrySelect} primitives={primitives} index={idx} />
          ))}
        </Box>
        </Box>
      </Box>
    );
  },
});
