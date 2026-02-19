'use client';

/**
 * BhInterviewReplaySplit - Split Preset
 * Left: waveform visualization + playback controls.
 * Right: scrolling transcript with evidence markers highlighted.
 */

import { useState, useMemo, useCallback } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createBadgeStyle,
  createEntranceAnimation,
  createCardHoverStyles,
  getPersonalityTypography,
  getPersonalityBadgeRadius,
  createIconContainerStyle,
  createPersonalitySectionHeaderStyle,
  createStaggerDelay,
  createEmptyStateStyle,

  createPersonalityAccentBar,
  createDividerStyle,
  formatAbbreviated,
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
    case 'interviewer': return { bg: t.colors.primaryScale[50], color: t.colors.primaryScale[700], border: t.colors.primaryScale[200] };
    case 'candidate': return { bg: t.colors.successScale[50], color: t.colors.successScale[700], border: t.colors.successScale[200] };
    case 'system': return { bg: t.colors.neutral[50], color: t.colors.neutral[500], border: t.colors.neutral[200] };
  }
}

function getSeverityColor(severity: ReplayEvidenceMarker['severity'], t: DesignTokens) {
  switch (severity) {
    case 'positive': return { bg: t.colors.successScale[100], color: t.colors.successScale[700], fill: t.colors.successScale[500] };
    case 'negative': return { bg: t.colors.errorScale[100], color: t.colors.errorScale[700], fill: t.colors.errorScale[500] };
    case 'neutral':
    default: return { bg: t.colors.infoScale[100], color: t.colors.infoScale[700], fill: t.colors.infoScale[500] };
  }
}

// Generate pseudo-random waveform bars for visualization
function generateWaveformBars(count: number, seed: number): number[] {
  const bars: number[] = [];
  let val = seed;
  for (let i = 0; i < count; i++) {
    val = (val * 9301 + 49297) % 233280;
    bars.push(0.1 + (val / 233280) * 0.9);
  }
  return bars;
}

export const SplitBhInterviewReplaySplit = createPreset<BhInterviewReplaySplitProps>({
  name: 'BhInterviewReplaySplit.Split',
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
    const [localSpeed, setLocalSpeed] = useState(1);

    const currentTime = controlledTime ?? localTime;
    const isPlaying = controlledPlaying ?? localPlaying;
    const playbackSpeed = controlledSpeed ?? localSpeed;

    const handleSeek = useCallback((time: number) => {
      onSeek?.(time);
      if (controlledTime === undefined) setLocalTime(time);
    }, [onSeek, controlledTime]);

    const handlePlayPause = useCallback(() => {
      onPlayPause?.();
      if (controlledPlaying === undefined) setLocalPlaying(p => !p);
    }, [onPlayPause, controlledPlaying]);

    const handleSpeedChange = useCallback((speed: number) => {
      onSpeedChange?.(speed);
      if (controlledSpeed === undefined) setLocalSpeed(speed);
    }, [onSpeedChange, controlledSpeed]);

    const isGlass = t.surface.useGlass && !!t.glass;
    const cardBase = useMemo(() => createCardStyle(t, { elevation: 'sm', glass: isGlass }), [t, isGlass]);
    const ptypo = useMemo(() => getPersonalityTypography(t), [t]);
    const badgeRadius = useMemo(() => getPersonalityBadgeRadius(t), [t]);
    const sectionLabel = useMemo(() => createPersonalitySectionHeaderStyle(t), [t]);

    const waveformBars = useMemo(() => generateWaveformBars(120, 42), []);
    const progressPercent = useMemo(() => duration > 0 ? (currentTime / duration) * 100 : 0, [currentTime, duration]);

    // Current active segment
    const activeSegment = useMemo(() => {
      return transcript.find(seg => currentTime >= seg.startTime && currentTime <= seg.endTime);
    }, [transcript, currentTime]);

    // Evidence markers near current time
    const markersInView = useMemo(() => {
      return evidenceMarkers.filter(m => Math.abs(m.time - currentTime) < 30);
    }, [evidenceMarkers, currentTime]);
    const entrance = useMemo(() => createEntranceAnimation(t), [t]);
    const animStyle = (index: number) => ({
      ...entrance.animate,
      transition: entrance.transition,
      transitionDelay: `${createStaggerDelay(t, index)}ms`,
    });

    // Speed options
    const speedOptions = [0.5, 0.75, 1, 1.25, 1.5, 2];

    const hoverStyles = useMemo(() => createCardHoverStyles(t), [t]);

    if (loading) {
      return (
        <Box className={className} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: t.spacing[10], ...style }}>
          <Activity size={24} color={t.colors.neutral[300]} style={{ marginRight: t.spacing[3] }} />
          <Text style={{ color: t.colors.neutral[400], fontSize: t.typography.fontSize.sm }}>Loading replay...</Text>
        </Box>
      );
    }

    return (
      <Box className={className} style={{ display: 'flex', gap: t.spacing[4], height: '100%', minHeight: 400, ...style }}>
        {/* ==================== LEFT: Waveform + Controls ==================== */}
        <Box style={{ ...cardBase, flex: '0 0 45%', display: 'flex', flexDirection: 'column' as const, padding: 0, overflow: 'hidden' as const }}>
          {/* Header */}
          <Box style={{
            display: 'flex', alignItems: 'center', gap: t.spacing[2],
            padding: `${t.spacing[3]}px ${t.spacing[4]}px`,
            borderBottom: `${t.surface.borderWidth} ${t.surface.borderStyle} ${t.colors.neutral[200]}`,
          }}>
            <MessageCircle size={16} strokeWidth={1.5} style={{ color: t.colors.primaryScale[600] }} />
            <Text style={{ fontSize: t.typography.fontSize.md, fontWeight: ptypo.headingWeight, color: t.colors.neutral[900] }}>
              {candidateName ? `${candidateName} - Interview Replay` : 'Interview Replay'}
            </Text>
            {props.proctoringEnabled && (
              <Box style={{
                ...createBadgeStyle(t, props.proctoringFlags?.length ? 'warning' : 'success'),
                borderRadius: badgeRadius,
                fontSize: t.typography.fontSize.xs,
              }}>
                <Text style={{ fontSize: t.typography.fontSize.xs }}>
                  Proctored{props.proctoringFlags?.length ? ` (${props.proctoringFlags.length})` : ''}
                </Text>
              </Box>
            )}
            {props.tokenCost != null && (
              <Box style={{
                ...createBadgeStyle(t, 'info'),
                borderRadius: badgeRadius,
                fontSize: t.typography.fontSize.xs,
              }}>
                <Text style={{ fontSize: t.typography.fontSize.xs }}>${props.tokenCost.toFixed(2)}</Text>
              </Box>
            )}
            {props.candidateRating != null && (
              <Box style={{
                ...createBadgeStyle(t, 'warning'),
                borderRadius: badgeRadius,
                fontSize: t.typography.fontSize.xs,
              }}>
                <Text style={{ fontSize: t.typography.fontSize.xs }}>Rating: {props.candidateRating}/5</Text>
              </Box>
            )}
            {billingStatus && (
              <Box style={{
                ...createBadgeStyle(t, billingStatus === 'settled' ? 'success' : billingStatus === 'disputed' ? 'error' : 'secondary'),
                borderRadius: badgeRadius,
                fontSize: t.typography.fontSize.xs,
              }}>
                <Text style={{ fontSize: t.typography.fontSize.xs, textTransform: 'capitalize' as const }}>Billing: {billingStatus}</Text>
              </Box>
            )}
            {interview && (
              <Box style={{
                ...createBadgeStyle(t, 'primary'),
                borderRadius: badgeRadius,
                fontSize: t.typography.fontSize.xs,
              }}>
                <Text style={{ fontSize: t.typography.fontSize.xs }}>
                  {interview.interviewType ?? 'Interview'}{interview.status ? ` - ${interview.status}` : ''}
                </Text>
              </Box>
            )}
          </Box>

          {/* Waveform */}
          <Box style={{ padding: `${t.spacing[4]}px ${t.spacing[4]}px ${t.spacing[2]}px`, flex: 1 }}>
            <Box
              role="slider"
              tabIndex={0}
              aria-label="Seek through recording"
              aria-valuemin={0}
              aria-valuemax={duration}
              aria-valuenow={currentTime}
              onMouseEnter={(e: any) => { Object.assign(e.currentTarget.style, hoverStyles.hover); }}
              onMouseLeave={(e: any) => { Object.assign(e.currentTarget.style, hoverStyles.base); }}
              style={{ position: 'relative' as const, height: 80, cursor: 'pointer' }}
              onClick={(e: React.MouseEvent<HTMLDivElement>) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const pct = (e.clientX - rect.left) / rect.width;
                handleSeek(Math.max(0, Math.min(duration, pct * duration)));
              }}
            >
              {/* Waveform bars */}
              <svg width="100%" height={80} viewBox={`0 0 ${waveformBars.length} 80`} preserveAspectRatio="none" style={{ display: 'block' }}>
                {waveformBars.map((h, i) => {
                  const barPercent = (i / waveformBars.length) * 100;
                  const isPast = barPercent <= progressPercent;
                  const barHeight = h * 60;
                  return (
                    <rect
                      key={i}
                      x={i}
                      y={40 - barHeight / 2}
                      width={0.7}
                      height={barHeight}
                      rx={0.35}
                      fill={isPast ? t.colors.primaryScale[500] : t.colors.neutral[200]}
                    />
                  );
                })}
              </svg>

              {/* Evidence markers on waveform */}
              {evidenceMarkers.map(marker => {
                const markerPct = duration > 0 ? (marker.time / duration) * 100 : 0;
                const sc = getSeverityColor(marker.severity, t);
                return (
                  <Box
                    key={marker.id}
                    role="button"
                    tabIndex={0}
                    aria-label={`Evidence: ${marker.label}`}
                    onClick={(e: React.MouseEvent) => {
                      e.stopPropagation();
                      onEvidenceClick?.(marker.id);
                      handleSeek(marker.time);
                    }}
                    style={{
                      position: 'absolute' as const,
                      left: `${markerPct}%`,
                      top: 0,
                      width: 3,
                      height: '100%',
                      backgroundColor: sc.fill,
                      opacity: 0.6,
                      cursor: 'pointer',
                    }}
                  />
                );
              })}

              {/* Playhead */}
              <Box style={{
                position: 'absolute' as const,
                left: `${progressPercent}%`,
                top: 0,
                width: 2,
                height: '100%',
                backgroundColor: t.colors.primaryScale[600],
                transition: 'left 0.1s linear',
              }} />
            </Box>

            {/* Time display */}
            <Box style={{ display: 'flex', justifyContent: 'space-between', marginTop: t.spacing[1] }}>
              <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>{formatTime(currentTime)}</Text>
              <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>{formatTime(duration)}</Text>
            </Box>
          </Box>

          {/* Playback controls */}
          <Box style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: t.spacing[3],
            padding: `${t.spacing[3]}px ${t.spacing[4]}px`,
            borderTop: `${t.surface.borderWidth} ${t.surface.borderStyle} ${t.colors.neutral[200]}`,
          }}>
            {/* Rewind */}
            <Box
              role="button"
              tabIndex={0}
              aria-label="Rewind 10 seconds"
              onClick={() => handleSeek(Math.max(0, currentTime - 10))}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: 36, height: 36, borderRadius: t.borderRadius.md,
                backgroundColor: t.colors.neutral[100], color: t.colors.neutral[600],
                cursor: 'pointer', transition: `all ${t.motion.hover}`,
              }}
            >
              <SkipBack size={16} strokeWidth={1.5} />
            </Box>

            {/* Play/Pause */}
            <Box
              role="button"
              tabIndex={0}
              aria-label={isPlaying ? 'Pause' : 'Play'}
              onClick={handlePlayPause}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: 44, height: 44, borderRadius: t.borderRadius.full,
                backgroundColor: t.colors.primaryScale[600], color: t.colors.common.white,
                cursor: 'pointer', transition: `all ${t.motion.hover}`,
                boxShadow: t.shadows.md,
              }}
            >
              {isPlaying ? <Pause size={20} strokeWidth={2} /> : <Play size={20} strokeWidth={2} style={{ marginLeft: 2 }} />}
            </Box>

            {/* Forward */}
            <Box
              role="button"
              tabIndex={0}
              aria-label="Forward 10 seconds"
              onClick={() => handleSeek(Math.min(duration, currentTime + 10))}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: 36, height: 36, borderRadius: t.borderRadius.md,
                backgroundColor: t.colors.neutral[100], color: t.colors.neutral[600],
                cursor: 'pointer', transition: `all ${t.motion.hover}`,
              }}
            >
              <SkipForward size={16} strokeWidth={1.5} />
            </Box>

            {/* Speed selector */}
            <Box style={{ display: 'flex', gap: t.spacing[1], marginLeft: t.spacing[4] }}>
              {speedOptions.map(speed => (
                <Box
                  key={speed}
                  role="button"
                  tabIndex={0}
                  aria-label={`Speed ${speed}x`}
                  onClick={() => handleSpeedChange(speed)}
                  style={{
                    padding: `${t.spacing[1]}px ${t.spacing[2]}px`,
                    borderRadius: badgeRadius,
                    fontSize: t.typography.fontSize.xs,
                    fontWeight: playbackSpeed === speed ? t.typography.fontWeight.bold : t.typography.fontWeight.medium,
                    color: playbackSpeed === speed ? t.colors.primaryScale[700] : t.colors.neutral[500],
                    backgroundColor: playbackSpeed === speed ? t.colors.primaryScale[50] : 'transparent',
                    cursor: 'pointer',
                    transition: `all ${t.motion.hover}`,
                  }}
                >
                  <Text>{speed}x</Text>
                </Box>
              ))}
            </Box>
          </Box>

          {/* Evidence markers list */}
          {markersInView.length > 0 && (
            <Box style={{
              padding: `${t.spacing[2]}px ${t.spacing[4]}px`,
              borderTop: `${t.surface.borderWidth} ${t.surface.borderStyle} ${t.colors.neutral[100]}`,
              backgroundColor: t.colors.neutral[50],
            }}>
              <Text style={{ ...sectionLabel, marginBottom: t.spacing[1] }}>Nearby Evidence</Text>
              <Box style={{ display: 'flex', flexWrap: 'wrap' as const, gap: t.spacing[1] }}>
                {markersInView.map(marker => {
                  const sc = getSeverityColor(marker.severity, t);
                  return (
                    <Box
                      key={marker.id}
                      role="button"
                      tabIndex={0}
                      aria-label={marker.label}
                      onClick={() => { onEvidenceClick?.(marker.id); handleSeek(marker.time); }}
                      style={{
                        ...createBadgeStyle(t, marker.severity === 'positive' ? 'success' : marker.severity === 'negative' ? 'error' : 'info'),
                        borderRadius: badgeRadius,
                        cursor: 'pointer',
                      }}
                    >
                      <Flag size={10} strokeWidth={1.5} style={{ marginRight: t.spacing[1] }} />
                      <Text>{marker.label}</Text>
                    </Box>
                  );
                })}
              </Box>
            </Box>
          )}
        </Box>

        {/* ==================== RIGHT: Transcript ==================== */}
        <Box style={{ ...cardBase, flex: 1, display: 'flex', flexDirection: 'column' as const, padding: 0, overflow: 'hidden' as const }}>
          {/* Transcript header */}
          <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2],
            padding: `${t.spacing[3]}px ${t.spacing[4]}px`,
            borderBottom: `${t.surface.borderWidth} ${t.surface.borderStyle} ${t.colors.neutral[200]}`,
          }}>
            <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: ptypo.headingWeight, color: t.colors.neutral[900] }}>
              Transcript
            </Text>
            <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400], marginLeft: 'auto' }}>
              {transcript.length} segments
            </Text>
          </Box>

          {/* Scrolling transcript */}
          <Box style={{ flex: 1, overflow: 'auto' as const, padding: t.spacing[3] }}>
            <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[2] }}>
              {transcript.map((segment, i) => {
                const isActive = activeSegment?.id === segment.id;
                const sc = getSpeakerColor(segment.speaker, t);
                const hasEvidence = evidenceMarkers.some(m => m.time >= segment.startTime && m.time <= segment.endTime);

                // Find evidence markers for this segment
                const segmentMarkers = evidenceMarkers.filter(m => m.time >= segment.startTime && m.time <= segment.endTime);

                return (
                  <Box
                    key={segment.id}
                    role="button"
                    tabIndex={0}
                    aria-label={`${segment.speaker}: ${segment.text.substring(0, 40)}`}
                    onClick={() => handleSeek(segment.startTime)}
                    style={{
                      ...animStyle(i),
                      padding: `${t.spacing[2]}px ${t.spacing[3]}px`,
                      borderRadius: t.borderRadius.md,
                      backgroundColor: isActive ? sc.bg : 'transparent',
                      borderLeft: `3px solid ${isActive ? sc.border : 'transparent'}`,
                      cursor: 'pointer',
                      transition: `all ${t.motion.hover}`,
                    }}
                  >
                    {/* Speaker + time */}
                    <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], marginBottom: t.spacing[1] }}>
                      {segment.speaker === 'interviewer' ? (
                        <Bot size={12} strokeWidth={1.5} style={{ color: sc.color }} />
                      ) : segment.speaker === 'candidate' ? (
                        <User size={12} strokeWidth={1.5} style={{ color: sc.color }} />
                      ) : null}
                      <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.semibold, color: sc.color, textTransform: 'capitalize' as const }}>
                        {segment.speaker}
                      </Text>
                      <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400], marginLeft: 'auto' }}>
                        {formatTime(segment.startTime)}
                      </Text>
                    </Box>

                    {/* Text */}
                    <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[700], lineHeight: t.typography.lineHeight.relaxed, wordBreak: 'break-word' as const }}>
                      {segment.text}
                    </Text>

                    {/* Evidence markers for this segment */}
                    {segmentMarkers.length > 0 && (
                      <Box style={{ display: 'flex', flexWrap: 'wrap' as const, gap: t.spacing[1], marginTop: t.spacing[2] }}>
                        {segmentMarkers.map(marker => {
                          const msc = getSeverityColor(marker.severity, t);

                          return (
                            <Box
                              key={marker.id}
                              role="button"
                              tabIndex={0}
                              aria-label={marker.label}
                              onClick={(e: React.MouseEvent) => { e.stopPropagation(); onEvidenceClick?.(marker.id); }}
                              style={{
                                display: 'inline-flex', alignItems: 'center', gap: t.spacing[1],
                                padding: `0 ${t.spacing[2]}px`, borderRadius: badgeRadius,
                                backgroundColor: msc.bg, fontSize: t.typography.fontSize.xs, color: msc.color,
                                cursor: 'pointer',
                              }}
                            >
                              <Flag size={10} strokeWidth={1.5} />
                              <Text>{marker.label}</Text>
                            </Box>
                          );
                        })}
                      </Box>
                    )}
                  </Box>
                );
              })}
            </Box>
          </Box>
        </Box>
      </Box>
    );
  },
});
