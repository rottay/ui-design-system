'use client';

/**
 * BhInterviewReplaySplit - Compact Preset
 * Single column transcript with inline evidence markers, mini playback controls.
 */

import { useState, useMemo, useCallback } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createBadgeStyle,
  getPersonalityTypography,
  getPersonalityBadgeRadius,
  createPersonalitySectionHeaderStyle,
  createEmptyStateStyle,
  createEntranceAnimation,
  createStaggerDelay,
} from '../../../helpers';
import type { BhInterviewReplaySplitProps, ReplayTranscriptSegment, ReplayEvidenceMarker } from '../../core';
import type { DesignTokens } from '../../../../../types';
import { Play, Pause, SkipForward, SkipBack, Activity, Flag, User, Bot, MessageCircle } from 'lucide-react';

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function getSpeakerColor(speaker: ReplayTranscriptSegment['speaker'], t: DesignTokens) {
  switch (speaker) {
    case 'interviewer': return { color: t.colors.primaryScale[700], label: 'AI' };
    case 'candidate': return { color: t.colors.successScale[700], label: 'Candidate' };
    case 'system': return { color: t.colors.neutral[500], label: 'System' };
  }
}

function getSeverityBadge(severity: ReplayEvidenceMarker['severity']): 'success' | 'error' | 'info' {
  switch (severity) {
    case 'positive': return 'success';
    case 'negative': return 'error';
    case 'neutral':
    default: return 'info';
  }
}

export const CompactBhInterviewReplaySplit = createPreset<BhInterviewReplaySplitProps>({
  name: 'BhInterviewReplaySplit.Compact',
  render: ({ primitives, props, tokens }: PresetContext<BhInterviewReplaySplitProps>) => {
    const { Box, Text } = primitives;
    const t = tokens;

    const {
      transcript: rawTranscript = [],
      evidenceMarkers: rawEvidenceMarkers = [],
      duration,
      currentTime: controlledTime,
      isPlaying: controlledPlaying,
      playbackSpeed: controlledSpeed,
      onSeek,
      onPlayPause,
      onSpeedChange,
      onEvidenceClick,
      candidateName,
      billingStatus,
      interview,
      loading = false,
      className,
      style,
    } = props;

    const transcript = Array.isArray(rawTranscript) ? rawTranscript : [];
    const evidenceMarkers = Array.isArray(rawEvidenceMarkers) ? rawEvidenceMarkers : [];

    const [localTime, setLocalTime] = useState(0);
    const [localPlaying, setLocalPlaying] = useState(false);

    const currentTime = controlledTime ?? localTime;
    const isPlaying = controlledPlaying ?? localPlaying;
    const playbackSpeed = controlledSpeed ?? 1;

    const handleSeek = useCallback((time: number) => {
      onSeek?.(time);
      if (controlledTime === undefined) setLocalTime(time);
    }, [onSeek, controlledTime]);

    const handlePlayPause = useCallback(() => {
      onPlayPause?.();
      if (controlledPlaying === undefined) setLocalPlaying(p => !p);
    }, [onPlayPause, controlledPlaying]);

    const isGlass = t.surface.useGlass && !!t.glass;
    const cardBase = useMemo(() => createCardStyle(t, { elevation: 'sm', glass: isGlass }), [t, isGlass]);
    const ptypo = useMemo(() => getPersonalityTypography(t), [t]);
    const badgeRadius = useMemo(() => getPersonalityBadgeRadius(t), [t]);

    const progressPercent = useMemo(() => duration > 0 ? (currentTime / duration) * 100 : 0, [currentTime, duration]);
    const activeSegment = useMemo(() => {
      return transcript.find(seg => currentTime >= seg.startTime && currentTime <= seg.endTime);
    }, [transcript, currentTime]);
    const entrance = useMemo(() => createEntranceAnimation(t), [t]);
    const animStyle = (index: number) => ({
      ...entrance.animate,
      transition: entrance.transition,
      transitionDelay: `${createStaggerDelay(t, index)}ms`,
    });

    if (loading) {
      return (
        <Box className={className} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: t.spacing[6], ...style }}>
          <Activity size={18} color={t.colors.neutral[300]} style={{ marginRight: t.spacing[2] }} />
          <Text style={{ color: t.colors.neutral[400], fontSize: t.typography.fontSize.sm }}>Loading...</Text>
        </Box>
      );
    }

    return (
      <Box className={className} style={{ ...cardBase, padding: 0, display: 'flex', flexDirection: 'column' as const, ...style }}>
        {/* Header with mini controls */}
        <Box style={{
          display: 'flex', alignItems: 'center', gap: t.spacing[2],
          padding: `${t.spacing[2]}px ${t.spacing[3]}px`,
          borderBottom: `${t.surface.borderWidth} ${t.surface.borderStyle} ${t.colors.neutral[200]}`,
        }}>
          <MessageCircle size={14} strokeWidth={1.5} style={{ color: t.colors.primaryScale[600] }} />
          <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: ptypo.headingWeight, color: t.colors.neutral[900], flex: 1 }}>
            {candidateName || 'Replay'}
          </Text>
          {billingStatus && (
            <Box style={{
              ...createBadgeStyle(t, billingStatus === 'settled' ? 'success' : billingStatus === 'disputed' ? 'error' : 'secondary'),
              borderRadius: badgeRadius,
              padding: `0 ${t.spacing[1]}px`,
            }}>
              <Text style={{ fontSize: t.typography.fontSize.xs, textTransform: 'capitalize' as const }}>{billingStatus}</Text>
            </Box>
          )}
          {interview && (
            <Box style={{
              ...createBadgeStyle(t, 'primary'),
              borderRadius: badgeRadius,
              padding: `0 ${t.spacing[1]}px`,
            }}>
              <Text style={{ fontSize: t.typography.fontSize.xs }}>
                {interview.interviewType ?? 'Interview'}
              </Text>
            </Box>
          )}

          {/* Mini controls */}
          <Box
            role="button"
            tabIndex={0}
            aria-label="Rewind"
            onClick={() => handleSeek(Math.max(0, currentTime - 10))}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 24, height: 24, cursor: 'pointer', color: t.colors.neutral[500] }}
          >
            <SkipBack size={12} strokeWidth={1.5} />
          </Box>
          <Box
            role="button"
            tabIndex={0}
            aria-label={isPlaying ? 'Pause' : 'Play'}
            onClick={handlePlayPause}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 28, height: 28, borderRadius: t.borderRadius.full,
              backgroundColor: t.colors.primaryScale[600], color: t.colors.common.white,
              cursor: 'pointer',
            }}
          >
            {isPlaying ? <Pause size={12} strokeWidth={2} /> : <Play size={12} strokeWidth={2} style={{ marginLeft: 1 }} />}
          </Box>
          <Box
            role="button"
            tabIndex={0}
            aria-label="Forward"
            onClick={() => handleSeek(Math.min(duration, currentTime + 10))}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 24, height: 24, cursor: 'pointer', color: t.colors.neutral[500] }}
          >
            <SkipForward size={12} strokeWidth={1.5} />
          </Box>
          <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>
            {formatTime(currentTime)} / {formatTime(duration)}
          </Text>
        </Box>

        {/* Progress bar */}
        <Box
          role="slider"
          tabIndex={0}
          aria-label="Seek"
          aria-valuemin={0}
          aria-valuemax={duration}
          aria-valuenow={currentTime}
          style={{ height: 4, backgroundColor: t.colors.neutral[100], cursor: 'pointer', position: 'relative' as const }}
          onClick={(e: React.MouseEvent<HTMLDivElement>) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const pct = (e.clientX - rect.left) / rect.width;
            handleSeek(Math.max(0, Math.min(duration, pct * duration)));
          }}
        >
          <Box style={{ height: '100%', width: `${progressPercent}%`, backgroundColor: t.colors.primaryScale[500], transition: 'width 0.1s linear' }} />
          {/* Evidence markers on progress bar */}
          {evidenceMarkers.map(marker => {
            const pct = duration > 0 ? (marker.time / duration) * 100 : 0;
            const severityColor = marker.severity === 'positive' ? t.colors.successScale[500] : marker.severity === 'negative' ? t.colors.errorScale[500] : t.colors.infoScale[500];
            return (
              <Box key={marker.id} style={{
                position: 'absolute' as const, left: `${pct}%`, top: -1, width: 3, height: 6,
                backgroundColor: severityColor, borderRadius: t.borderRadius.sm,
              }} />
            );
          })}
        </Box>

        {/* Transcript list */}
        <Box style={{ flex: 1, overflow: 'auto' as const, padding: t.spacing[2] }}>
          <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1] }}>
            {transcript.map(segment => {
              const isActive = activeSegment?.id === segment.id;
              const sc = getSpeakerColor(segment.speaker, t);
              const segmentMarkers = evidenceMarkers.filter(m => m.time >= segment.startTime && m.time <= segment.endTime);

              return (
                <Box
                  key={segment.id}
                  role="button"
                  tabIndex={0}
                  aria-label={`${segment.speaker} at ${formatTime(segment.startTime)}`}
                  onClick={() => handleSeek(segment.startTime)}
                  style={{
                    padding: `${t.spacing[1]}px ${t.spacing[2]}px`,
                    borderRadius: t.borderRadius.sm,
                    backgroundColor: isActive ? t.colors.primaryScale[50] : 'transparent',
                    cursor: 'pointer',
                    transition: `background-color ${t.motion.hover}`,
                  }}
                >
                  <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1], marginBottom: t.spacing[1] }}>
                    {segment.speaker === 'interviewer' ? (
                      <Bot size={10} strokeWidth={1.5} style={{ color: sc.color }} />
                    ) : segment.speaker === 'candidate' ? (
                      <User size={10} strokeWidth={1.5} style={{ color: sc.color }} />
                    ) : null}
                    <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.semibold, color: sc.color }}>
                      {sc.label}
                    </Text>
                    <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400], marginLeft: 'auto' }}>
                      {formatTime(segment.startTime)}
                    </Text>
                  </Box>
                  <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[700], lineHeight: t.typography.lineHeight.relaxed, wordBreak: 'break-word' as const }}>
                    {segment.text}
                  </Text>

                  {/* Inline evidence markers */}
                  {segmentMarkers.length > 0 && (
                    <Box style={{ display: 'flex', flexWrap: 'wrap' as const, gap: t.spacing[1], marginTop: t.spacing[1] }}>
                      {segmentMarkers.map(marker => (
                        <Box
                          key={marker.id}
                          role="button"
                          tabIndex={0}
                          aria-label={marker.label}
                          onClick={(e: React.MouseEvent) => { e.stopPropagation(); onEvidenceClick?.(marker.id); }}
                          style={{
                            ...createBadgeStyle(t, getSeverityBadge(marker.severity)),
                            borderRadius: badgeRadius,
                            fontSize: t.typography.fontSize.xs,
                            padding: `0 ${t.spacing[1]}px`,
                            cursor: 'pointer',
                          }}
                        >
                          <Flag size={8} strokeWidth={1.5} style={{ marginRight: 2 }} />
                          <Text>{marker.label}</Text>
                        </Box>
                      ))}
                    </Box>
                  )}
                </Box>
              );
            })}
          </Box>
        </Box>
      </Box>
    );
  },
});
