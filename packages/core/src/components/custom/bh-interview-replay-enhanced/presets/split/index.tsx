'use client';

/**
 * BhInterviewReplayEnhanced - Split Preset
 * Side-by-side waveform visualization + synced transcript panel.
 * Evidence markers on waveform, playback controls with speed selector,
 * highlighted active segment. Personality-driven, glass-aware, accessible.
 */

import { useState, useMemo, useCallback, useRef } from 'react';
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

  createDividerStyle,
  formatAbbreviated,
} from '../../../helpers';
import type {
  BhInterviewReplayEnhancedProps,
  TranscriptSegment,
  EvidenceMarker,
} from '../../core';
import type { DesignTokens } from '../../../../../types';
import {
  Play, Pause, SkipBack, SkipForward, Gauge,
  User, Bot, Bookmark, Clock, Headphones,
} from 'lucide-react';

const SPEED_OPTIONS = [0.5, 1, 1.5, 2];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function getSpeakerColor(speaker: 'interviewer' | 'candidate', t: DesignTokens) {
  return speaker === 'interviewer'
    ? { color: t.colors.primaryScale[600], bg: t.colors.primaryScale[50], border: t.colors.primaryScale[200], label: 'Interviewer', icon: Bot }
    : { color: t.colors.secondaryScale?.[600] ?? t.colors.successScale[600], bg: t.colors.secondaryScale?.[50] ?? t.colors.successScale[50], border: t.colors.secondaryScale?.[200] ?? t.colors.successScale[200], label: 'Candidate', icon: User };
}

/* ------------------------------------------------------------------ */
/*  Preset                                                             */
/* ------------------------------------------------------------------ */

export const SplitBhInterviewReplayEnhanced = createPreset<BhInterviewReplayEnhancedProps>({
  name: 'BhInterviewReplayEnhanced.Split',
  render: ({ primitives, props, tokens }: PresetContext<BhInterviewReplayEnhancedProps>) => {
    const { Box, Text } = primitives;
    const t = tokens;

    const {
      candidateName = 'Sarah Chen',
      interviewTitle = 'Senior Backend Engineer - Technical Interview',
      duration: durationProp = 230,
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

    const transcriptRef = useRef<HTMLDivElement>(null);

    // Personality & helpers
    const personalityTypo = useMemo(() => getPersonalityTypography(t), [t]);
    const badgeRadius = useMemo(() => getPersonalityBadgeRadius(t), [t]);
    const sectionHeaderStyle = useMemo(() => createPersonalitySectionHeaderStyle(t), [t]);
    const cardHover = useMemo(() => createCardHoverStyles(t), [t]);
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

    // Active transcript segment
    const activeSegmentId = useMemo(() => {
      const seg = transcript.find(s => currentTime >= s.startTime && currentTime < s.endTime);
      return seg?.id ?? null;
    }, [transcript, currentTime]);

    // Playback position as fraction
    const progressFraction = useMemo(() => duration > 0 ? currentTime / duration : 0, [currentTime, duration]);

    // Handlers
    const handlePlayPause = useCallback(() => {
      if (isPlaying) {
        setInternalPlaying(false);
        onPause?.();
      } else {
        setInternalPlaying(true);
        onPlay?.();
      }
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

    const handleSkipBack = useCallback(() => { handleSeek(currentTime - 10); }, [currentTime, handleSeek]);
    const handleSkipForward = useCallback(() => { handleSeek(currentTime + 10); }, [currentTime, handleSeek]);

    const handleSkipBackKeyDown = useCallback((e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleSkipBack(); }
    }, [handleSkipBack]);
    const handleSkipForwardKeyDown = useCallback((e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleSkipForward(); }
    }, [handleSkipForward]);

    // Waveform dimensions
    const waveW = 600;
    const waveH = 80;
    const barWidth = useMemo(() => waveformData.length > 0 ? waveW / waveformData.length : 3, [waveformData]);
    const entrance = useMemo(() => createEntranceAnimation(t), [t]);
    const animStyle = (index: number) => ({
      ...entrance.animate,
      transition: entrance.transition,
      transitionDelay: `${createStaggerDelay(t, index)}ms`,
    });

    // Loading state
    if (loading) {
      const hoverStyles = useMemo(() => createCardHoverStyles(t), [t]);
      const divider = useMemo(() => createDividerStyle(t), [t]);
    const sectionHdr = useMemo(() => createPersonalitySectionHeaderStyle(t), [t]);
    const ptypo = useMemo(() => getPersonalityTypography(t), [t]);

      return (
        <Box className={className} style={{ ...createEmptyStateStyle(t), ...style }}>
          <Text style={{ color: t.colors.neutral[400], fontSize: t.typography.fontSize.sm }}>Loading enhanced replay...</Text>
        </Box>
      );
    }

    return (
      <Box className={className} style={{ ...cardStyle, ...style }}>
        {accentBar && <Box style={accentBar} />}

        <Box style={accentLayout.inner}>

        {/* Header */}
        <Box style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: `${t.spacing[4]}px ${t.spacing[6]}px`,
          borderBottom: `1px solid ${t.colors.neutral[100]}`,
          backgroundColor: t.colors.neutral[50],
        }}>
          <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[3] }}>
            <Box style={createIconContainerStyle(t, { size: 36, color: t.colors.primaryScale[50] })}>
              <Headphones size={18} color={t.colors.primaryScale[600]} />
            </Box>
            <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1] }}>
              <Text style={{
                fontSize: t.typography.fontSize.md,
                fontWeight: personalityTypo.headingWeight,
                color: t.colors.neutral[900],
                letterSpacing: personalityTypo.headingLetterSpacing,
              }}>
                {candidateName}
              </Text>
              <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>
                {interviewTitle}
              </Text>
            </Box>
          </Box>
          <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
            <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1] }}>
              <Clock size={12} color={t.colors.neutral[400]} />
              <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>
                {formatTime(duration)}
              </Text>
            </Box>
            <Box style={{
              ...createBadgeStyle(t, 'primary'), borderRadius: badgeRadius,
              padding: `0 ${t.spacing[2]}px`,
            }}>
              <Text style={{ fontSize: t.typography.fontSize.xs }}>{evidenceMarkers.length} evidence</Text>
            </Box>
            {props.proctoringEnabled && (
              <Box style={{
                ...createBadgeStyle(t, props.proctoringFlags?.length ? 'warning' : 'success'),
                borderRadius: badgeRadius,
                padding: `0 ${t.spacing[2]}px`,
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
                padding: `0 ${t.spacing[2]}px`,
              }}>
                <Text style={{ fontSize: t.typography.fontSize.xs }}>${props.tokenCost.toFixed(2)}</Text>
              </Box>
            )}
            {props.candidateRating != null && (
              <Box style={{
                ...createBadgeStyle(t, 'warning'),
                borderRadius: badgeRadius,
                padding: `0 ${t.spacing[2]}px`,
              }}>
                <Text style={{ fontSize: t.typography.fontSize.xs }}>Rating: {props.candidateRating}/5</Text>
              </Box>
            )}
            {billingStatus && (
              <Box style={{
                ...createBadgeStyle(t, billingStatus === 'settled' ? 'success' : billingStatus === 'disputed' ? 'error' : 'secondary'),
                borderRadius: badgeRadius,
                padding: `0 ${t.spacing[2]}px`,
              }}>
                <Text style={{ fontSize: t.typography.fontSize.xs, textTransform: 'capitalize' as const }}>Billing: {billingStatus}</Text>
              </Box>
            )}
            {interview && (
              <Box style={{
                ...createBadgeStyle(t, 'primary'),
                borderRadius: badgeRadius,
                padding: `0 ${t.spacing[2]}px`,
              }}>
                <Text style={{ fontSize: t.typography.fontSize.xs }}>
                  {interview.interviewType ?? 'Interview'}{interview.status ? ` - ${interview.status}` : ''}
                </Text>
              </Box>
            )}
          </Box>
        </Box>

        {/* Split Layout */}
        <Box style={{ display: 'flex', minHeight: 480 }}>
          {/* Left: Waveform + Controls */}
          <Box style={{
            flex: 1, display: 'flex', flexDirection: 'column' as const,
            borderRight: `1px solid ${t.colors.neutral[100]}`,
          }}>
            {/* Evidence markers as pills above waveform */}
            <Box style={{ display: 'flex', gap: t.spacing[1], flexWrap: 'wrap' as const,
              padding: `${t.spacing[3]}px ${t.spacing[5]}px ${t.spacing[1]}px`,
            }}>
              {evidenceMarkers.map(em => {
                const isActive = Math.abs(currentTime - em.time) < 5;
                return (
                  <Box
                    key={em.id}
                    role="button"
                    tabIndex={0}
                    aria-label={`Evidence: ${em.label} at ${formatTime(em.time)}`}
                    onClick={() => handleEvidenceClick(em.id)}
                    onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleEvidenceClick(em.id); } }}
                    onMouseEnter={(e: React.MouseEvent<HTMLElement>) => { Object.assign(e.currentTarget.style, hoverStyles.hover); }}
                    onMouseLeave={(e: React.MouseEvent<HTMLElement>) => { Object.assign(e.currentTarget.style, hoverStyles.base); }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: t.spacing[1],
                      padding: `0 ${t.spacing[2]}px`, borderRadius: badgeRadius,
                      backgroundColor: isActive ? t.colors.warningScale[100] : t.colors.neutral[50],
                      border: `1px solid ${isActive ? t.colors.warningScale[400] : t.colors.neutral[200]}`,
                      cursor: 'pointer', transition: `all ${t.motion.hover}`,
                    }}
                  >
                    <Bookmark size={10} color={isActive ? t.colors.warningScale[600] : t.colors.neutral[400]} />
                    <Text style={{ fontSize: t.typography.fontSize.xs, color: isActive ? t.colors.warningScale[700] : t.colors.neutral[600] }}>
                      {em.label}
                    </Text>
                    {em.score !== undefined && (
                      <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.semibold, color: isActive ? t.colors.warningScale[700] : t.colors.neutral[500] }}>
                        {em.score}/10
                      </Text>
                    )}
                  </Box>
                );
              })}
            </Box>

            {/* SVG Waveform */}
            <Box style={{ padding: `${t.spacing[2]}px ${t.spacing[5]}px`, flex: 1, display: 'flex', alignItems: 'center' }}>
              <svg
                viewBox={`0 0 ${waveW} ${waveH}`}
                width="100%"
                height={waveH}
                style={{ cursor: 'pointer', borderRadius: t.borderRadius.md }}
                aria-label="Waveform visualization. Click to seek."
                role="slider"
                aria-valuenow={Math.round(currentTime)}
                aria-valuemin={0}
                aria-valuemax={Math.round(duration)}
                onClick={handleWaveformClick}
              >
                {/* Background */}
                <rect x="0" y="0" width={waveW} height={waveH} fill={t.colors.neutral[50]} rx={4} />

                {/* Waveform bars */}
                {waveformData.map((amp, i) => {
                  const x = i * barWidth;
                  const barH = amp * (waveH - 8);
                  const yTop = (waveH - barH) / 2;
                  const fraction = i / waveformData.length;
                  const isPast = fraction <= progressFraction;
                  return (
                    <rect
                      key={i}
                      x={x + 0.5}
                      y={yTop}
                      width={Math.max(1, barWidth - 1)}
                      height={barH}
                      rx={1}
                      fill={isPast ? t.colors.primaryScale[400] : t.colors.neutral[200]}
                    />
                  );
                })}

                {/* Evidence marker dots on waveform */}
                {evidenceMarkers.map(em => {
                  const x = (em.time / duration) * waveW;
                  return (
                    <circle
                      key={em.id}
                      cx={x}
                      cy={waveH - 6}
                      r={4}
                      fill={t.colors.warningScale[500]}
                      stroke={t.colors.common.white}
                      strokeWidth={1.5}
                    />
                  );
                })}

                {/* Playhead */}
                <line
                  x1={progressFraction * waveW}
                  y1={0}
                  x2={progressFraction * waveW}
                  y2={waveH}
                  stroke={t.colors.primaryScale[600]}
                  strokeWidth={2}
                />
              </svg>
            </Box>

            {/* Playback Controls */}
            <Box style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: `${t.spacing[3]}px ${t.spacing[5]}px`,
              borderTop: `1px solid ${t.colors.neutral[100]}`,
              backgroundColor: t.colors.common.white,
            }}>
              <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[3] }}>
                {/* Skip back */}
                <Box
                  role="button" tabIndex={0}
                  aria-label="Skip back 10 seconds"
                  onClick={handleSkipBack}
                  onKeyDown={handleSkipBackKeyDown}
                  style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                >
                  <SkipBack size={16} color={t.colors.neutral[600]} />
                </Box>
                {/* Play/Pause */}
                <Box
                  role="button" tabIndex={0}
                  aria-label={isPlaying ? 'Pause' : 'Play'}
                  onClick={handlePlayPause}
                  onKeyDown={handlePlayPauseKeyDown}
                  style={{
                    width: 36, height: 36, borderRadius: t.borderRadius.full,
                    backgroundColor: t.colors.primaryScale[600],
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', transition: `all ${t.motion.hover}`,
                  }}
                >
                  {isPlaying
                    ? <Pause size={16} color={t.colors.common.white} />
                    : <Play size={16} color={t.colors.common.white} style={{ marginLeft: 2 }} />
                  }
                </Box>
                {/* Skip forward */}
                <Box
                  role="button" tabIndex={0}
                  aria-label="Skip forward 10 seconds"
                  onClick={handleSkipForward}
                  onKeyDown={handleSkipForwardKeyDown}
                  style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                >
                  <SkipForward size={16} color={t.colors.neutral[600]} />
                </Box>
              </Box>

              {/* Time display */}
              <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1] }}>
                <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.medium, color: t.colors.neutral[900], fontFamily: 'monospace' }}>
                  {formatTime(currentTime)}
                </Text>
                <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[400] }}>/</Text>
                <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[500], fontFamily: 'monospace' }}>
                  {formatTime(duration)}
                </Text>
              </Box>

              {/* Speed selector */}
              <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1] }}>
                <Gauge size={12} color={t.colors.neutral[400]} />
                {SPEED_OPTIONS.map(spd => {
                  const isActive = playbackSpeed === spd;
                  return (
                    <Box
                      key={spd}
                      role="button" tabIndex={0}
                      aria-label={`Set playback speed to ${spd}x`}
                      aria-pressed={isActive}
                      onClick={() => handleSpeedChange(spd)}
                      onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleSpeedChange(spd); } }}
                      style={{
                        padding: `${t.spacing[0]}px ${t.spacing[2]}px`, borderRadius: badgeRadius,
                        backgroundColor: isActive ? t.colors.primaryScale[50] : 'transparent',
                        border: `1px solid ${isActive ? t.colors.primaryScale[300] : t.colors.neutral[200]}`,
                        cursor: 'pointer', transition: `all ${t.motion.hover}`,
                      }}
                    >
                      <Text style={{
                        fontSize: t.typography.fontSize.xs,
                        fontWeight: isActive ? t.typography.fontWeight.semibold : t.typography.fontWeight.normal,
                        color: isActive ? t.colors.primaryScale[700] : t.colors.neutral[600],
                      }}>
                        {spd}x
                      </Text>
                    </Box>
                  );
                })}
              </Box>
            </Box>

            {/* Progress bar */}
            <Box style={{
              height: 4, backgroundColor: t.colors.neutral[100],
              overflow: 'hidden' as const,
            }}>
              <Box style={{
                height: '100%', width: `${progressFraction * 100}%`,
                backgroundColor: t.colors.primaryScale[500],
                transition: `width ${t.motion.hover}`,
              }} />
            </Box>
          </Box>

          {/* Right: Transcript */}
          <Box style={{
            width: 380, flexShrink: 0, minWidth: 0,
            display: 'flex', flexDirection: 'column' as const, overflow: 'hidden',
          }}>
            {/* Transcript header */}
            <Box style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: `${t.spacing[3]}px ${t.spacing[5]}px`,
              borderBottom: `1px solid ${t.colors.neutral[100]}`,
              backgroundColor: t.colors.common.white,
            }}>
              <Text style={sectionHeaderStyle}>Transcript</Text>
              <Box style={{ display: 'flex', gap: t.spacing[2] }}>
                {(['interviewer', 'candidate'] as const).map(role => {
                  const sc = getSpeakerColor(role, t);
                  const count = transcript.filter(s => s.speaker === role).length;
                  return (
                    <Box key={role} style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1] }}>
                      <Box style={{ width: 8, height: 8, borderRadius: t.borderRadius.full, backgroundColor: sc.color }} />
                      <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>
                        {sc.label} ({count})
                      </Text>
                    </Box>
                  );
                })}
              </Box>
            </Box>

            {/* Transcript segments */}
            <div
              ref={transcriptRef}
              role="list"
              aria-label="Interview transcript"
              style={{ flex: 1, overflowY: 'auto' as const }}
            >
              {transcript.map((seg, idx) => {
                const sc = getSpeakerColor(seg.speaker, t);
                const isActive = seg.id === activeSegmentId;
                const Icon = sc.icon;
                const segAnim = createEntranceAnimation(t, { index: idx });
                const segEvidence = evidenceMarkers.filter(m => m.time >= seg.startTime && m.time < seg.endTime);

                return (
                  <Box
                    key={seg.id}
                    role="listitem"
                    tabIndex={0}
                    aria-label={`${sc.label} from ${formatTime(seg.startTime)} to ${formatTime(seg.endTime)}: ${seg.text.substring(0, 60)}...`}
                    aria-current={isActive ? 'true' : undefined}
                    onClick={() => handleSegmentClick(seg.id)}
                    onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleSegmentClick(seg.id); } }}
                    style={{
                      ...animStyle(idx),
                      padding: `${t.spacing[3]}px ${t.spacing[5]}px`,
                      borderBottom: `1px solid ${t.colors.neutral[50]}`,
                      borderLeft: isActive ? `3px solid ${sc.color}` : '3px solid transparent',
                      backgroundColor: isActive ? sc.bg : 'transparent',
                      cursor: 'pointer',
                      transition: `all ${t.motion.hover}`,
                      ...segAnim.animate,
                    }}
                  >
                    {/* Speaker + timestamp row */}
                    <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], marginBottom: t.spacing[1] }}>
                      <Box style={createIconContainerStyle(t, { size: 22, color: sc.bg })}>
                        <Icon size={11} color={sc.color} />
                      </Box>
                      <Text style={{
                        fontSize: t.typography.fontSize.xs,
                        fontWeight: personalityTypo.headingWeight,
                        color: sc.color,
                        letterSpacing: personalityTypo.labelLetterSpacing,
                        textTransform: personalityTypo.labelTransform,
                      }}>
                        {sc.label}
                      </Text>
                      <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400], fontFamily: 'monospace' }}>
                        {formatTime(seg.startTime)}
                      </Text>
                      {seg.confidence !== undefined && (
                        <Box style={{
                          ...createBadgeStyle(t, seg.confidence >= 0.9 ? 'success' : seg.confidence >= 0.7 ? 'warning' : 'error'),
                          borderRadius: badgeRadius,
                          padding: `0 ${t.spacing[1]}px`,
                        }}>
                          <Text style={{ fontSize: t.typography.fontSize.xs }}>
                            {Math.round(seg.confidence * 100)}%
                          </Text>
                        </Box>
                      )}
                    </Box>

                    {/* Text */}
                    <Text style={{
                      fontSize: t.typography.fontSize.sm, color: t.colors.neutral[800],
                      lineHeight: t.typography.lineHeight.relaxed,
                      paddingLeft: 30,
                      wordBreak: 'break-word' as const,
                    }}>
                      {seg.text}
                    </Text>

                    {/* Inline evidence */}
                    {segEvidence.length > 0 && (
                      <Box style={{ display: 'flex', gap: t.spacing[1], flexWrap: 'wrap' as const, paddingLeft: 30, marginTop: t.spacing[1] }}>
                        {segEvidence.map(ev => (
                          <Box key={ev.id} style={{ display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: t.spacing[1],
                            padding: `0 ${t.spacing[2]}px`, borderRadius: badgeRadius,
                            backgroundColor: t.colors.warningScale[50],
                            border: `1px solid ${t.colors.warningScale[200]}`,
                          }}>
                            <Bookmark size={8} color={t.colors.warningScale[500]} />
                            <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.warningScale[700] }}>
                              {ev.dimensionName}
                            </Text>
                            {ev.score !== undefined && (
                              <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.semibold, color: t.colors.warningScale[700] }}>
                                {ev.score}/10
                              </Text>
                            )}
                          </Box>
                        ))}
                      </Box>
                    )}
                  </Box>
                );
              })}
            </div>
          </Box>
        </Box>
        </Box>
      </Box>
    );
  },
});
