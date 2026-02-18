'use client';

/**
 * BhInterviewReplayEnhanced - Compact Preset
 * Stacked layout: mini playback bar at top, waveform, evidence pills,
 * then transcript below. Personality-driven, glass-aware, accessible.
 */

import { useState, useMemo, useCallback } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
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
} from '../../../helpers';
import type {
  BhInterviewReplayEnhancedProps,
  TranscriptSegment,
  EvidenceMarker,
} from '../../core';
import type { DesignTokens } from '../../../../../types';
import {
  Play, Pause, Gauge, User, Bot,
  Bookmark, Clock, Headphones,
} from 'lucide-react';

const SPEED_OPTIONS = [0.5, 1, 1.5, 2];

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function getSpeakerColor(speaker: 'interviewer' | 'candidate', t: DesignTokens) {
  return speaker === 'interviewer'
    ? { color: t.colors.primaryScale[600], bg: t.colors.primaryScale[50], label: 'Interviewer', icon: Bot }
    : { color: t.colors.secondaryScale?.[600] ?? t.colors.successScale[600], bg: t.colors.secondaryScale?.[50] ?? t.colors.successScale[50], label: 'Candidate', icon: User };
}

/* ------------------------------------------------------------------ */
/*  Preset                                                             */
/* ------------------------------------------------------------------ */

export const CompactBhInterviewReplayEnhanced = createPreset<BhInterviewReplayEnhancedProps>({
  name: 'BhInterviewReplayEnhanced.Compact',
  render: ({ primitives, props, tokens }: PresetContext<BhInterviewReplayEnhancedProps>) => {
    const { Box, Text } = primitives;
    const t = tokens;

    const {
      candidateName = 'Sarah Chen',
      interviewTitle = 'Technical Interview',
      duration: durationProp = 160,
      currentTime: currentTimeProp,
      isPlaying: isPlayingProp,
      playbackSpeed: speedProp,
      transcript: rawTranscript = [],
      evidenceMarkers: rawEvidenceMarkers = [],
      waveformData: rawWaveformData = undefined,
      onPlay, onPause, onSeek, onSpeedChange,
      onEvidenceClick, onTranscriptSegmentClick,
      billingStatus,
      interview,
      loading, className, style,
    } = props;

    const transcript = Array.isArray(rawTranscript) ? rawTranscript : [];
    const evidenceMarkers = Array.isArray(rawEvidenceMarkers) ? rawEvidenceMarkers : [];
    const waveformData = Array.isArray(rawWaveformData) ? rawWaveformData : [] as number[];

    const [internalTime, setInternalTime] = useState(currentTimeProp ?? 35);
    const [internalPlaying, setInternalPlaying] = useState(isPlayingProp ?? false);
    const [internalSpeed, setInternalSpeed] = useState(speedProp ?? 1);

    const currentTime = currentTimeProp ?? internalTime;
    const isPlaying = isPlayingProp ?? internalPlaying;
    const playbackSpeed = speedProp ?? internalSpeed;
    const duration = durationProp;

    const personalityTypo = useMemo(() => getPersonalityTypography(t), [t]);
    const badgeRadius = useMemo(() => getPersonalityBadgeRadius(t), [t]);
    const sectionHeaderStyle = useMemo(() => createPersonalitySectionHeaderStyle(t), [t]);
    const entranceAnim = useMemo(() => createEntranceAnimation(t, { index: 0 }), [t]);
    const accentBar = useMemo(() => createPersonalityAccentBar(t), [t]);
    const accentLayout = useMemo(() => getAccentAwareLayout(t), [t]);
    const isGlass = t.surface.useGlass && !!t.glass;

    const cardStyle = useMemo(() => ({
      ...createCardStyle(t, { elevation: 'sm', padding: 0, glass: isGlass }),
      borderRadius: t.borderRadius.lg,
      overflow: 'hidden' as const,
      ...entranceAnim.animate,
      transition: entranceAnim.transition,
    }), [t, isGlass, entranceAnim]);

    const activeSegmentId = useMemo(() => {
      const seg = transcript.find(s => currentTime >= s.startTime && currentTime < s.endTime);
      return seg?.id ?? null;
    }, [transcript, currentTime]);

    const progressFraction = useMemo(() => duration > 0 ? currentTime / duration : 0, [currentTime, duration]);

    const handlePlayPause = useCallback(() => {
      if (isPlaying) { setInternalPlaying(false); onPause?.(); }
      else { setInternalPlaying(true); onPlay?.(); }
    }, [isPlaying, onPlay, onPause]);

    const handlePlayPauseKeyDown = useCallback((e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handlePlayPause(); }
    }, [handlePlayPause]);

    const handleSeek = useCallback((time: number) => {
      const clamped = Math.max(0, Math.min(duration, time));
      setInternalTime(clamped);
      onSeek?.(clamped);
    }, [duration, onSeek]);

    const handleWaveformClick = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const fraction = (e.clientX - rect.left) / rect.width;
      handleSeek(fraction * duration);
    }, [duration, handleSeek]);

    const handleSpeedChange = useCallback((speed: number) => {
      setInternalSpeed(speed);
      onSpeedChange?.(speed);
    }, [onSpeedChange]);

    const handleEvidenceClick = useCallback((markerId: string) => {
      const marker = evidenceMarkers.find(m => m.id === markerId);
      if (marker) handleSeek(marker.time);
      onEvidenceClick?.(markerId);
    }, [evidenceMarkers, handleSeek, onEvidenceClick]);

    const handleSegmentClick = useCallback((segmentId: string) => {
      const seg = transcript.find(s => s.id === segmentId);
      if (seg) handleSeek(seg.startTime);
      onTranscriptSegmentClick?.(segmentId);
    }, [transcript, handleSeek, onTranscriptSegmentClick]);

    const waveW = 500;
    const waveH = 48;
    const barWidth = useMemo(() => waveformData.length > 0 ? waveW / waveformData.length : 3, [waveformData]);

    if (loading) {
      return (
        <Box className={className} style={{ ...createEmptyStateStyle(t), ...style }}>
          <Text style={{ color: t.colors.neutral[400], fontSize: t.typography.fontSize.sm }}>Loading replay...</Text>
        </Box>
      );
    }

    return (
      <Box className={className} style={{ ...cardStyle, ...style }}>
        {accentBar && <Box style={accentBar} />}

        <Box style={accentLayout.inner}>

        {/* Mini playback bar at top */}
        <Box style={{
          display: 'flex', alignItems: 'center', gap: t.spacing[3],
          padding: `${t.spacing[3]}px ${t.spacing[5]}px`,
          borderBottom: `1px solid ${t.colors.neutral[100]}`,
          backgroundColor: t.colors.neutral[50],
        }}>
          {/* Play/Pause */}
          <Box
            role="button" tabIndex={0}
            aria-label={isPlaying ? 'Pause' : 'Play'}
            onClick={handlePlayPause}
            onKeyDown={handlePlayPauseKeyDown}
            style={{
              width: 28, height: 28, borderRadius: t.borderRadius.full,
              backgroundColor: t.colors.primaryScale[600],
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', transition: `all ${t.motion.hover}`, flexShrink: 0,
            }}
          >
            {isPlaying
              ? <Pause size={12} color={t.colors.common.white} />
              : <Play size={12} color={t.colors.common.white} style={{ marginLeft: 1 }} />
            }
          </Box>

          <Box style={{ flex: 1, minWidth: 0 }}>
            <Box style={{ display: 'flex', justifyContent: 'space-between', marginBottom: t.spacing[1] }}>
              <Text style={{
                fontSize: t.typography.fontSize.sm,
                fontWeight: personalityTypo.headingWeight,
                color: t.colors.neutral[900],
                letterSpacing: personalityTypo.headingLetterSpacing,
              }}>
                {candidateName}
              </Text>
              <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400], fontFamily: 'monospace' }}>
                {formatTime(currentTime)} / {formatTime(duration)}
              </Text>
            </Box>
            {/* Progress bar */}
            <Box style={{ height: 4, backgroundColor: t.colors.neutral[100], borderRadius: t.borderRadius.full, overflow: 'hidden' as const }}>
              <Box style={{ height: '100%', width: `${progressFraction * 100}%`, backgroundColor: t.colors.primaryScale[500], transition: `width ${t.motion.hover}`, borderRadius: t.borderRadius.full }} />
            </Box>
          </Box>

          {/* Billing + Interview badges */}
          {billingStatus && (
            <Box style={{
              ...createBadgeStyle(t, billingStatus === 'settled' ? 'success' : billingStatus === 'disputed' ? 'error' : 'secondary'),
              borderRadius: badgeRadius,
              padding: `0 ${t.spacing[1]}px`,
              flexShrink: 0,
            }}>
              <Text style={{ fontSize: t.typography.fontSize.xs, textTransform: 'capitalize' as const }}>{billingStatus}</Text>
            </Box>
          )}
          {interview && (
            <Box style={{
              ...createBadgeStyle(t, 'primary'),
              borderRadius: badgeRadius,
              padding: `0 ${t.spacing[1]}px`,
              flexShrink: 0,
            }}>
              <Text style={{ fontSize: t.typography.fontSize.xs }}>
                {interview.interviewType ?? 'Interview'}
              </Text>
            </Box>
          )}

          {/* Speed selector */}
          <Box style={{ display: 'flex', alignItems: 'center', gap: 2, flexShrink: 0 }}>
            {SPEED_OPTIONS.map(spd => {
              const isActive = playbackSpeed === spd;
              return (
                <Box
                  key={spd} role="button" tabIndex={0}
                  aria-label={`Speed ${spd}x`} aria-pressed={isActive}
                  onClick={() => handleSpeedChange(spd)}
                  onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleSpeedChange(spd); } }}
                  style={{
                    padding: `0 ${t.spacing[1]}px`, borderRadius: badgeRadius,
                    backgroundColor: isActive ? t.colors.primaryScale[50] : 'transparent',
                    cursor: 'pointer', transition: `all ${t.motion.hover}`,
                  }}
                >
                  <Text style={{
                    fontSize: t.typography.fontSize.xs,
                    fontWeight: isActive ? t.typography.fontWeight.semibold : t.typography.fontWeight.normal,
                    color: isActive ? t.colors.primaryScale[700] : t.colors.neutral[500],
                  }}>{spd}x</Text>
                </Box>
              );
            })}
          </Box>
        </Box>

        {/* Evidence pills */}
        <Box style={{
          display: 'flex', gap: t.spacing[1], flexWrap: 'wrap' as const,
          padding: `${t.spacing[2]}px ${t.spacing[5]}px`,
          borderBottom: `1px solid ${t.colors.neutral[100]}`,
        }}>
          {evidenceMarkers.map(em => {
            const isNear = Math.abs(currentTime - em.time) < 5;
            return (
              <Box
                key={em.id}
                role="button" tabIndex={0}
                aria-label={`Evidence: ${em.label} at ${formatTime(em.time)}`}
                onClick={() => handleEvidenceClick(em.id)}
                onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleEvidenceClick(em.id); } }}
                style={{
                  display: 'flex', alignItems: 'center', gap: t.spacing[1],
                  padding: `0 ${t.spacing[2]}px`, borderRadius: badgeRadius,
                  backgroundColor: isNear ? t.colors.warningScale[100] : t.colors.neutral[50],
                  border: `1px solid ${isNear ? t.colors.warningScale[300] : t.colors.neutral[200]}`,
                  cursor: 'pointer', transition: `all ${t.motion.hover}`,
                }}
              >
                <Bookmark size={8} color={isNear ? t.colors.warningScale[600] : t.colors.neutral[400]} />
                <Text style={{ fontSize: t.typography.fontSize.xs, color: isNear ? t.colors.warningScale[700] : t.colors.neutral[600] }}>
                  {em.label}
                </Text>
              </Box>
            );
          })}
        </Box>

        {/* Waveform */}
        <Box style={{ padding: `${t.spacing[2]}px ${t.spacing[5]}px`, borderBottom: `1px solid ${t.colors.neutral[100]}` }}>
          <svg
            viewBox={`0 0 ${waveW} ${waveH}`}
            width="100%"
            height={waveH}
            style={{ cursor: 'pointer', borderRadius: t.borderRadius.md }}
            aria-label="Waveform. Click to seek."
            role="slider"
            aria-valuenow={Math.round(currentTime)}
            aria-valuemin={0}
            aria-valuemax={Math.round(duration)}
            onClick={handleWaveformClick}
          >
            <rect x="0" y="0" width={waveW} height={waveH} fill={t.colors.neutral[50]} rx={3} />
            {waveformData.map((amp, i) => {
              const x = i * barWidth;
              const barH = amp * (waveH - 6);
              const yTop = (waveH - barH) / 2;
              const isPast = (i / waveformData.length) <= progressFraction;
              return (
                <rect key={i} x={x + 0.5} y={yTop} width={Math.max(1, barWidth - 1)} height={barH} rx={1}
                  fill={isPast ? t.colors.primaryScale[400] : t.colors.neutral[200]}
                />
              );
            })}
            {evidenceMarkers.map(em => {
              const x = (em.time / duration) * waveW;
              return <circle key={em.id} cx={x} cy={waveH - 5} r={3} fill={t.colors.warningScale[500]} stroke={t.colors.common.white} strokeWidth={1} />;
            })}
            <line x1={progressFraction * waveW} y1={0} x2={progressFraction * waveW} y2={waveH} stroke={t.colors.primaryScale[600]} strokeWidth={1.5} />
          </svg>
        </Box>

        {/* Transcript */}
        <Box role="list" aria-label="Transcript" style={{ maxHeight: 300, overflowY: 'auto' as const }}>
          {transcript.map((seg, idx) => {
            const sc = getSpeakerColor(seg.speaker, t);
            const isActive = seg.id === activeSegmentId;
            const Icon = sc.icon;
            const segAnim = createEntranceAnimation(t, { index: idx });

            return (
              <Box
                key={seg.id}
                role="listitem"
                tabIndex={0}
                aria-label={`${sc.label}: ${seg.text.substring(0, 50)}...`}
                aria-current={isActive ? 'true' : undefined}
                onClick={() => handleSegmentClick(seg.id)}
                onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleSegmentClick(seg.id); } }}
                style={{
                  display: 'flex', gap: t.spacing[2], alignItems: 'flex-start',
                  padding: `${t.spacing[2]}px ${t.spacing[5]}px`,
                  borderBottom: `1px solid ${t.colors.neutral[50]}`,
                  borderLeft: isActive ? `3px solid ${sc.color}` : '3px solid transparent',
                  backgroundColor: isActive ? sc.bg : 'transparent',
                  cursor: 'pointer', transition: `all ${t.motion.hover}`,
                  ...segAnim.animate,
                }}
              >
                <Box style={{ ...createIconContainerStyle(t, { size: 20, color: sc.bg }), flexShrink: 0, marginTop: t.spacing[1] }}>
                  <Icon size={10} color={sc.color} />
                </Box>
                <Box style={{ flex: 1, minWidth: 0 }}>
                  <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1], marginBottom: t.spacing[1] }}>
                    <Text style={{
                      fontSize: t.typography.fontSize.xs, fontWeight: personalityTypo.headingWeight,
                      color: sc.color, letterSpacing: personalityTypo.labelLetterSpacing,
                      textTransform: personalityTypo.labelTransform,
                    }}>
                      {sc.label}
                    </Text>
                    <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400], fontFamily: 'monospace' }}>
                      {formatTime(seg.startTime)}
                    </Text>
                    {seg.confidence !== undefined && (
                      <Box style={{
                        ...createBadgeStyle(t, seg.confidence >= 0.9 ? 'success' : 'warning'),
                        borderRadius: badgeRadius, padding: `0 ${t.spacing[1]}px`,
                      }}>
                        <Text style={{ fontSize: t.typography.fontSize.xs }}>{Math.round(seg.confidence * 100)}%</Text>
                      </Box>
                    )}
                  </Box>
                  <Text style={{
                    fontSize: t.typography.fontSize.sm, color: t.colors.neutral[700],
                    lineHeight: t.typography.lineHeight.relaxed,
                    wordBreak: 'break-word' as const,
                  }}>
                    {seg.text}
                  </Text>
                </Box>
              </Box>
            );
          })}
        </Box>
        </Box>
      </Box>
    );
  },
});
