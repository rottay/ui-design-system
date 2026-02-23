'use client';

/**
 * BhVoiceDebriefPlayer - Review Preset
 * Full playback and review interface for recorded interview debriefs.
 *
 * Layout:
 * - Audio player bar: play/pause, scrub timeline, speed controls (0.5x-2x), volume
 * - Waveform display with color-coded segments (sentiment: green/gray/red regions)
 * - Key moments timeline: clickable markers along the waveform
 * - Transcript panel: scrollable text synced with playback, current segment highlighted
 * - Sentiment chart: SVG line graph showing sentiment score over time
 * - Summary section (AI-generated)
 * - Tags and notes editor
 * - Export button (transcript, summary, moments)
 * - Share with team option
 */

import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  SkipBack,
  SkipForward,
  Download,
  Share2,
  Star,
  AlertTriangle,
  Flag,
  Lightbulb,
  HelpCircle,
  Clock,
  Tag,
  FileText,
  MessageSquare,
  BarChart3,
  ChevronDown,
  ChevronUp,
  Edit3,
  Plus,
  X,
  Bookmark,
  Zap,
  TrendingUp,
  TrendingDown,
  Minus,
} from 'lucide-react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createCardHoverStyles,
  createBadgeStyle,
  createIconContainerStyle,
  createPersonalitySectionHeaderStyle,
  createEntranceAnimation,
  createPersonalitySkeletonStyle,
  createProgressBarStyle,
  createEmptyStateStyle,
  createFilterPillStyle,
  createDividerStyle,
  createListItemStyle,
  createPanelHeaderStyle,
  getPersonalityTypography,
  getPersonalityBadgeRadius,
  getPulseSpeed,
  clickableProps,
  ICON_SIZES,
  numericValue,
} from '../../../helpers';
import type {
  BhVoiceDebriefPlayerProps,
  TranscriptSegment,
  KeyMoment,
  SentimentTimeline,
} from '../../core';

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const SPEED_OPTIONS = [0.5, 0.75, 1, 1.25, 1.5, 2];

const EXPORT_OPTIONS: Array<{ value: 'transcript' | 'summary' | 'moments' | 'full'; label: string; icon: typeof FileText }> = [
  { value: 'transcript', label: 'Transcript', icon: FileText },
  { value: 'summary', label: 'Summary', icon: Zap },
  { value: 'moments', label: 'Key Moments', icon: Bookmark },
  { value: 'full', label: 'Full Report', icon: Download },
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function getMomentIcon(type: KeyMoment['type']): typeof Star {
  switch (type) {
    case 'highlight': return Star;
    case 'concern': return AlertTriangle;
    case 'red_flag': return Flag;
    case 'insight': return Lightbulb;
    case 'question': return HelpCircle;
    default: return Bookmark;
  }
}

function getMomentColorKey(type: KeyMoment['type']): string {
  switch (type) {
    case 'highlight': return 'success';
    case 'concern': return 'warning';
    case 'red_flag': return 'error';
    case 'insight': return 'info';
    case 'question': return 'primary';
    default: return 'primary';
  }
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export const ReviewBhVoiceDebriefPlayer = createPreset<BhVoiceDebriefPlayerProps>(
  'ReviewBhVoiceDebriefPlayer',
  ({ primitives: { Box, Text, Button, Input }, props, tokens }: PresetContext<BhVoiceDebriefPlayerProps>) => {
    const {
      recording,
      loading = false,
      onAddNote,
      onExport,
      currentTime = 0,
      className,
      style,
    } = props;

    const [isPlaying, setIsPlaying] = useState(false);
    const [playbackTime, setPlaybackTime] = useState(currentTime);
    const [playbackSpeed, setPlaybackSpeed] = useState(1);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const [showExportMenu, setShowExportMenu] = useState(false);
    const [activeTab, setActiveTab] = useState<'transcript' | 'sentiment' | 'moments'>('transcript');
    const [noteText, setNoteText] = useState('');
    const [tagInput, setTagInput] = useState('');
    const transcriptScrollRef = useRef<HTMLDivElement>(null);

    const ptypo = useMemo(() => getPersonalityTypography(tokens), [tokens]);
    const badgeRadius = useMemo(() => getPersonalityBadgeRadius(tokens), [tokens]);
    const cardStyle = useMemo(() => createCardStyle(tokens), [tokens]);
    const dividerStyle = useMemo(() => createDividerStyle(tokens), [tokens]);
    const skeletonStyle = useMemo(() => createPersonalitySkeletonStyle(tokens), [tokens]);
    const entranceAnim = useMemo(() => createEntranceAnimation(tokens), [tokens]);
    const panelHeaderStyle = useMemo(() => createPanelHeaderStyle(tokens), [tokens]);

    const colorScale = useCallback((scale: string, shade: keyof import('../../../../../core/types').ColorScale) => {
      const key = `${scale}Scale` as keyof typeof tokens.colors;
      const scaleObj = tokens.colors[key] as import('../../../../../core/types').ColorScale | undefined;
      return scaleObj?.[shade] ?? tokens.colors.neutral?.[shade] ?? '#888';
    }, [tokens]);

    const duration = recording?.duration ?? 0;
    const segments = recording?.transcriptSegments ?? [];
    const moments = recording?.keyMoments ?? [];
    const sentimentData = recording?.sentiment ?? [];
    const tags = recording?.tags ?? [];

    // Find current segment
    const currentSegmentIdx = useMemo(() => {
      return segments.findIndex(
        (s) => playbackTime >= s.startTime && playbackTime < s.endTime
      );
    }, [segments, playbackTime]);

    // Auto-scroll transcript to current segment
    useEffect(() => {
      if (currentSegmentIdx >= 0 && transcriptScrollRef.current) {
        const el = transcriptScrollRef.current.children[currentSegmentIdx] as HTMLElement;
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    }, [currentSegmentIdx]);

    const handleSeek = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const ratio = (e.clientX - rect.left) / rect.width;
      setPlaybackTime(Math.max(0, Math.min(duration, ratio * duration)));
    }, [duration]);

    const handleExport = useCallback((format: 'transcript' | 'summary' | 'moments' | 'full') => {
      onExport?.(format);
      setShowExportMenu(false);
    }, [onExport]);

    // Loading skeleton
    if (loading) {
      return (
        <Box className={className} style={{ ...cardStyle, padding: tokens.spacing?.[6] ?? 24, ...style }}>
          <Box style={{ ...skeletonStyle, height: 24, width: '50%', marginBottom: 16 }} />
          <Box style={{ ...skeletonStyle, height: 60, width: '100%', marginBottom: 16 }} />
          <Box style={{ ...skeletonStyle, height: 120, width: '100%', marginBottom: 16 }} />
          <Box style={{ ...skeletonStyle, height: 300, width: '100%' }} />
        </Box>
      );
    }

    if (!recording) {
      return (
        <Box className={className} style={{ ...cardStyle, ...createEmptyStateStyle(tokens), ...style }}>
          <FileText size={32} color={tokens.colors.neutral?.[300] ?? '#d1d5db'} />
          <Text style={{ fontSize: tokens.typography.fontSize.md, color: tokens.colors.neutral?.[500] ?? '#6b7280', marginTop: 12 }}>
            No recording selected
          </Text>
        </Box>
      );
    }

    return (
      <Box className={className} style={{ ...cardStyle, padding: 0, overflow: 'hidden', ...entranceAnim, ...style }}>
        {/* ============================================================ */}
        {/* HEADER                                                        */}
        {/* ============================================================ */}
        <Box style={{
          padding: `${tokens.spacing?.[4] ?? 16}px ${tokens.spacing?.[6] ?? 24}px`,
          borderBottom: `1px solid ${tokens.colors.neutral?.[200] ?? '#e5e7eb'}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <Box>
            <Text style={{
              fontSize: 18,
              color: tokens.colors.neutral?.[900] ?? '#111',
              margin: 0,
            }}>
              {recording.candidateName}
            </Text>
            <Text style={{
              fontSize: 13,
              color: tokens.colors.neutral?.[500] ?? '#6b7280',
              margin: 0,
              marginTop: 2,
            }}>
              {recording.interviewTitle} - Recorded by {recording.recordedBy}
            </Text>
          </Box>
          <Box style={{ display: 'flex', gap: 8, position: 'relative' as const }}>
            <Box
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 12px',
                borderRadius: badgeRadius,
                background: tokens.colors.neutral?.[50] ?? '#f9fafb',
                border: `1px solid ${tokens.colors.neutral?.[200] ?? '#e5e7eb'}`,
                cursor: 'pointer',
              }}
              {...clickableProps(() => setShowExportMenu((p) => !p))}
            >
              <Download size={14} color={tokens.colors.neutral?.[600] ?? '#4b5563'} />
              <Text style={{ fontSize: 12, color: tokens.colors.neutral?.[700] ?? '#374151', margin: 0 }}>
                Export
              </Text>
            </Box>
            <Box
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 12px',
                borderRadius: badgeRadius,
                background: colorScale('primary', 50),
                border: `1px solid ${colorScale('primary', 200)}`,
                cursor: 'pointer',
              }}
              {...clickableProps(() => {})}
            >
              <Share2 size={14} color={colorScale('primary', 600)} />
              <Text style={{ fontSize: 12, color: colorScale('primary', 700), margin: 0 }}>
                Share
              </Text>
            </Box>
            {/* Export dropdown */}
            {showExportMenu && (
              <Box style={{
                position: 'absolute' as const,
                top: '100%',
                right: 0,
                marginTop: 4,
                background: tokens.colors.common?.white ?? '#fff',
                border: `1px solid ${tokens.colors.neutral?.[200] ?? '#e5e7eb'}`,
                borderRadius: tokens.borderRadius?.md ?? 6,
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                zIndex: 10,
                minWidth: 160,
                overflow: 'hidden',
              }}>
                {EXPORT_OPTIONS.map((opt) => {
                  const Icon = opt.icon;
                  return (
                    <Box
                      key={opt.value}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '8px 14px',
                        cursor: 'pointer',
                        transition: 'background 100ms ease',
                      }}
                      {...clickableProps(() => handleExport(opt.value))}
                    >
                      <Icon size={14} color={tokens.colors.neutral?.[500] ?? '#6b7280'} />
                      <Text style={{ fontSize: 13, color: tokens.colors.neutral?.[700] ?? '#374151', margin: 0 }}>
                        {opt.label}
                      </Text>
                    </Box>
                  );
                })}
              </Box>
            )}
          </Box>
        </Box>

        {/* ============================================================ */}
        {/* WAVEFORM WITH SENTIMENT                                       */}
        {/* ============================================================ */}
        <Box style={{
          padding: `${tokens.spacing?.[4] ?? 16}px ${tokens.spacing?.[6] ?? 24}px`,
          background: tokens.colors.neutral?.[900] ?? '#111827',
          cursor: 'pointer',
        }}>
          <div onClick={handleSeek} style={{ position: 'relative', height: 64 }}>
            <svg width="100%" height="64" viewBox={`0 0 ${duration > 0 ? duration : 100} 64`} preserveAspectRatio="none">
              {/* Sentiment color background */}
              {segments.map((seg, idx) => {
                const x = seg.startTime;
                const w = seg.endTime - seg.startTime;
                const fill = seg.sentiment === 'positive'
                  ? colorScale('success', 400)
                  : seg.sentiment === 'negative'
                    ? colorScale('error', 400)
                    : tokens.colors.neutral?.[500] ?? '#6b7280';
                return (
                  <rect
                    key={idx}
                    x={x}
                    y={0}
                    width={w}
                    height={64}
                    fill={fill}
                    opacity={0.15}
                  />
                );
              })}
              {/* Waveform bars */}
              {Array.from({ length: Math.max(Math.floor(duration / 2), 10) }, (_, i) => {
                const t = (i / Math.max(Math.floor(duration / 2), 10)) * duration;
                const barH = 10 + Math.sin(i * 0.7) * 20 + Math.cos(i * 0.3) * 15;
                const isPast = t <= playbackTime;
                return (
                  <rect
                    key={i}
                    x={t}
                    y={32 - barH / 2}
                    width={Math.max(1, duration / Math.max(Math.floor(duration / 2), 10) - 0.5)}
                    height={barH}
                    rx={1}
                    fill={isPast ? colorScale('primary', 400) : tokens.colors.neutral?.[500] ?? '#6b7280'}
                    opacity={isPast ? 0.9 : 0.3}
                  />
                );
              })}
            </svg>
            {/* Key moment markers */}
            {moments.map((m, idx) => {
              const pos = duration > 0 ? (m.timestamp / duration) * 100 : 0;
              const mColor = getMomentColorKey(m.type);
              return (
                <Box
                  key={idx}
                  style={{
                    position: 'absolute' as const,
                    left: `${Math.min(pos, 98)}%`,
                    top: 0,
                    width: 3,
                    height: '100%',
                    background: colorScale(mColor, 400),
                    opacity: 0.8,
                  }}
                  title={m.label}
                />
              );
            })}
            {/* Playhead */}
            {duration > 0 && (
              <Box style={{
                position: 'absolute' as const,
                left: `${(playbackTime / duration) * 100}%`,
                top: 0,
                width: 2,
                height: '100%',
                background: tokens.colors.common?.white ?? '#fff',
              }} />
            )}
          </div>
        </Box>

        {/* ============================================================ */}
        {/* AUDIO PLAYER CONTROLS                                         */}
        {/* ============================================================ */}
        <Box style={{
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          padding: `${tokens.spacing?.[3] ?? 12}px ${tokens.spacing?.[6] ?? 24}px`,
          borderBottom: `1px solid ${tokens.colors.neutral?.[200] ?? '#e5e7eb'}`,
          background: tokens.colors.neutral?.[50] ?? '#f9fafb',
        }}>
          {/* Skip back */}
          <Box
            style={{ cursor: 'pointer', display: 'flex' }}
            {...clickableProps(() => setPlaybackTime((t) => Math.max(0, t - 10)))}
          >
            <SkipBack size={18} color={tokens.colors.neutral?.[600] ?? '#4b5563'} />
          </Box>
          {/* Play/Pause */}
          <Box
            style={{
              width: 36,
              height: 36,
              borderRadius: tokens.borderRadius?.full ?? '50%',
              background: colorScale('primary', 600),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
            {...clickableProps(() => setIsPlaying((p) => !p))}
          >
            {isPlaying ? (
              <Pause size={16} color={tokens.colors.common?.white ?? '#fff'} />
            ) : (
              <Play size={16} color={tokens.colors.common?.white ?? '#fff'} style={{ marginLeft: 2 }} />
            )}
          </Box>
          {/* Skip forward */}
          <Box
            style={{ cursor: 'pointer', display: 'flex' }}
            {...clickableProps(() => setPlaybackTime((t) => Math.min(duration, t + 10)))}
          >
            <SkipForward size={18} color={tokens.colors.neutral?.[600] ?? '#4b5563'} />
          </Box>

          {/* Time display */}
          <Text style={{
            fontFamily: 'monospace',
            fontSize: 13,
            color: tokens.colors.neutral?.[600] ?? '#4b5563',
            margin: 0,
            minWidth: 90,
          }}>
            {formatTime(playbackTime)} / {formatTime(duration)}
          </Text>

          {/* Spacer */}
          <Box style={{ flex: 1 }} />

          {/* Speed control */}
          <Box style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {SPEED_OPTIONS.map((spd) => (
              <Box
                key={spd}
                style={{
                  padding: '2px 8px',
                  borderRadius: badgeRadius,
                  background: playbackSpeed === spd
                    ? colorScale('primary', 100)
                    : 'transparent',
                  border: `1px solid ${playbackSpeed === spd
                    ? colorScale('primary', 300)
                    : 'transparent'}`,
                  cursor: 'pointer',
                }}
                {...clickableProps(() => setPlaybackSpeed(spd))}
              >
                <Text style={{
                  fontSize: 11,
                  fontWeight: playbackSpeed === spd
                    ? (tokens.typography?.fontWeight?.semibold ?? 600)
                    : (tokens.typography?.fontWeight?.normal ?? 400),
                  color: playbackSpeed === spd
                    ? colorScale('primary', 700)
                    : tokens.colors.neutral?.[500] ?? '#6b7280',
                  margin: 0,
                }}>
                  {spd}x
                </Text>
              </Box>
            ))}
          </Box>

          {/* Volume */}
          <Box
            style={{ cursor: 'pointer', display: 'flex' }}
            {...clickableProps(() => setIsMuted((m) => !m))}
          >
            {isMuted ? (
              <VolumeX size={18} color={tokens.colors.neutral?.[400] ?? '#9ca3af'} />
            ) : (
              <Volume2 size={18} color={tokens.colors.neutral?.[600] ?? '#4b5563'} />
            )}
          </Box>
        </Box>

        {/* ============================================================ */}
        {/* TAB BAR                                                       */}
        {/* ============================================================ */}
        <Box style={{
          display: 'flex',
          borderBottom: `1px solid ${tokens.colors.neutral?.[200] ?? '#e5e7eb'}`,
        }}>
          {([
            { key: 'transcript' as const, label: 'Transcript', icon: MessageSquare },
            { key: 'sentiment' as const, label: 'Sentiment', icon: BarChart3 },
            { key: 'moments' as const, label: `Moments (${moments.length})`, icon: Bookmark },
          ]).map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <Box
                key={tab.key}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  padding: '10px 0',
                  cursor: 'pointer',
                  borderBottom: isActive
                    ? `2px solid ${colorScale('primary', 600)}`
                    : '2px solid transparent',
                  transition: 'border-color 150ms ease',
                }}
                {...clickableProps(() => setActiveTab(tab.key))}
              >
                <Icon size={14} color={isActive ? colorScale('primary', 600) : tokens.colors.neutral?.[400] ?? '#9ca3af'} />
                <Text style={{
                  fontSize: 13,
                  fontWeight: isActive
                    ? (tokens.typography?.fontWeight?.semibold ?? 600)
                    : (tokens.typography?.fontWeight?.normal ?? 400),
                  color: isActive ? colorScale('primary', 700) : tokens.colors.neutral?.[500] ?? '#6b7280',
                  margin: 0,
                }}>
                  {tab.label}
                </Text>
              </Box>
            );
          })}
        </Box>

        {/* ============================================================ */}
        {/* TAB CONTENT                                                   */}
        {/* ============================================================ */}
        <div
          ref={activeTab === 'transcript' ? transcriptScrollRef : undefined}
          style={{
            maxHeight: 360,
            overflowY: 'auto' as const,
            padding: `${tokens.spacing?.[4] ?? 16}px ${tokens.spacing?.[6] ?? 24}px`,
          }}
        >
          {/* TRANSCRIPT TAB */}
          {activeTab === 'transcript' && segments.map((seg, idx) => {
            const isCurrent = idx === currentSegmentIdx;
            const sentimentColor = seg.sentiment === 'positive'
              ? colorScale('success', 500)
              : seg.sentiment === 'negative'
                ? colorScale('error', 500)
                : tokens.colors.neutral?.[400] ?? '#9ca3af';
            return (
              <Box
                key={idx}
                style={{
                  display: 'flex',
                  gap: 12,
                  padding: '8px 12px',
                  marginBottom: 2,
                  borderRadius: tokens.borderRadius?.sm ?? 4,
                  background: isCurrent
                    ? colorScale('primary', 50)
                    : 'transparent',
                  borderLeft: isCurrent
                    ? `3px solid ${colorScale('primary', 500)}`
                    : seg.isKeyMoment
                      ? `3px solid ${colorScale('warning', 400)}`
                      : '3px solid transparent',
                  cursor: 'pointer',
                  transition: 'background 100ms ease',
                }}
                {...clickableProps(() => setPlaybackTime(seg.startTime))}
              >
                <Text style={{
                  fontFamily: 'monospace',
                  fontSize: 11,
                  color: tokens.colors.neutral?.[400] ?? '#9ca3af',
                  minWidth: 48,
                  margin: 0,
                  paddingTop: 2,
                }}>
                  {formatTime(seg.startTime)}
                </Text>
                <Box style={{ flex: 1 }}>
                  <Text style={{
                    fontSize: 11,
                    fontWeight: tokens.typography?.fontWeight?.semibold ?? 600,
                    color: isCurrent ? colorScale('primary', 700) : tokens.colors.neutral?.[500] ?? '#6b7280',
                    margin: 0,
                    marginBottom: 2,
                  }}>
                    {seg.speaker}
                  </Text>
                  <Text style={{
                    fontSize: 13,
                    color: isCurrent ? tokens.colors.neutral?.[900] ?? '#111' : tokens.colors.neutral?.[700] ?? '#374151',
                    margin: 0,
                    lineHeight: 1.5,
                  }}>
                    {seg.text}
                  </Text>
                </Box>
                <Box style={{
                  width: 4,
                  borderRadius: 2,
                  background: sentimentColor,
                  minHeight: 20,
                  opacity: 0.6,
                }} />
              </Box>
            );
          })}

          {/* SENTIMENT TAB */}
          {activeTab === 'sentiment' && (
            <Box>
              {sentimentData.length > 0 ? (
                <svg width="100%" height="200" viewBox={`0 0 ${duration > 0 ? duration : 100} 200`} preserveAspectRatio="none">
                  {/* Grid lines */}
                  <line x1={0} y1={100} x2={duration} y2={100} stroke={tokens.colors.neutral?.[200] ?? '#e5e7eb'} strokeWidth={1} strokeDasharray="4 4" />
                  <line x1={0} y1={50} x2={duration} y2={50} stroke={tokens.colors.neutral?.[100] ?? '#f3f4f6'} strokeWidth={0.5} strokeDasharray="2 4" />
                  <line x1={0} y1={150} x2={duration} y2={150} stroke={tokens.colors.neutral?.[100] ?? '#f3f4f6'} strokeWidth={0.5} strokeDasharray="2 4" />
                  {/* Sentiment line */}
                  <polyline
                    fill="none"
                    stroke={colorScale('primary', 500)}
                    strokeWidth={2}
                    points={sentimentData
                      .map((d) => `${d.timestamp},${200 - (d.score + 1) * 100}`)
                      .join(' ')}
                  />
                  {/* Filled area below */}
                  <polygon
                    fill={colorScale('primary', 100)}
                    opacity={0.3}
                    points={`0,200 ${sentimentData
                      .map((d) => `${d.timestamp},${200 - (d.score + 1) * 100}`)
                      .join(' ')} ${duration},200`}
                  />
                  {/* Moment markers */}
                  {moments.map((m, idx) => {
                    const mColor = getMomentColorKey(m.type);
                    return (
                      <circle
                        key={idx}
                        cx={m.timestamp}
                        cy={100}
                        r={4}
                        fill={colorScale(mColor, 500)}
                        stroke={tokens.colors.common?.white ?? '#fff'}
                        strokeWidth={2}
                      />
                    );
                  })}
                </svg>
              ) : (
                <Box style={{ ...createEmptyStateStyle(tokens), padding: 40 }}>
                  <BarChart3 size={24} color={tokens.colors.neutral?.[300] ?? '#d1d5db'} />
                  <Text style={{ fontSize: 13, color: tokens.colors.neutral?.[400] ?? '#9ca3af', margin: 0, marginTop: 8 }}>
                    No sentiment data available
                  </Text>
                </Box>
              )}
            </Box>
          )}

          {/* MOMENTS TAB */}
          {activeTab === 'moments' && (
            <Box>
              {moments.length === 0 ? (
                <Box style={{ ...createEmptyStateStyle(tokens), padding: 40 }}>
                  <Bookmark size={24} color={tokens.colors.neutral?.[300] ?? '#d1d5db'} />
                  <Text style={{ fontSize: 13, color: tokens.colors.neutral?.[400] ?? '#9ca3af', margin: 0, marginTop: 8 }}>
                    No key moments marked
                  </Text>
                </Box>
              ) : moments.map((m, idx) => {
                const mColor = getMomentColorKey(m.type);
                const Icon = getMomentIcon(m.type);
                return (
                  <Box
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 12,
                      padding: '10px 12px',
                      borderRadius: tokens.borderRadius?.md ?? 6,
                      border: `1px solid ${tokens.colors.neutral?.[100] ?? '#f3f4f6'}`,
                      marginBottom: 8,
                      cursor: 'pointer',
                      transition: 'background 100ms ease',
                    }}
                    {...clickableProps(() => setPlaybackTime(m.timestamp))}
                  >
                    <Box style={{
                      ...createIconContainerStyle(tokens, { size: 32, color: colorScale(mColor, 50) }),
                      width: 32,
                      height: 32,
                      borderRadius: tokens.borderRadius?.md ?? 6,
                      flexShrink: 0,
                    }}>
                      <Icon size={16} />
                    </Box>
                    <Box style={{ flex: 1 }}>
                      <Box style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                        <Text style={{
                          fontSize: 13,
                          fontWeight: tokens.typography?.fontWeight?.semibold ?? 600,
                          color: tokens.colors.neutral?.[800] ?? '#1f2937',
                          margin: 0,
                        }}>
                          {m.label}
                        </Text>
                        <Text style={{
                          fontFamily: 'monospace',
                          fontSize: 11,
                          color: tokens.colors.neutral?.[400] ?? '#9ca3af',
                          margin: 0,
                        }}>
                          {formatTime(m.timestamp)}
                        </Text>
                      </Box>
                      {m.notes && (
                        <Text style={{
                          fontSize: 12,
                          color: tokens.colors.neutral?.[500] ?? '#6b7280',
                          margin: 0,
                          lineHeight: 1.4,
                        }}>
                          {m.notes}
                        </Text>
                      )}
                    </Box>
                  </Box>
                );
              })}
            </Box>
          )}
        </div>

        {/* ============================================================ */}
        {/* SUMMARY SECTION                                               */}
        {/* ============================================================ */}
        {recording.summary && (
          <Box style={{
            padding: `${tokens.spacing?.[4] ?? 16}px ${tokens.spacing?.[6] ?? 24}px`,
            borderTop: `1px solid ${tokens.colors.neutral?.[200] ?? '#e5e7eb'}`,
          }}>
            <Box style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <Zap size={14} color={colorScale('primary', 500)} />
              <Text style={{
                fontSize: 12,
                fontWeight: tokens.typography?.fontWeight?.semibold ?? 600,
                color: tokens.colors.neutral?.[700] ?? '#374151',
                margin: 0,
              }}>
                AI Summary
              </Text>
            </Box>
            <Text style={{
              fontSize: 13,
              color: tokens.colors.neutral?.[600] ?? '#4b5563',
              margin: 0,
              lineHeight: 1.6,
              background: tokens.colors.neutral?.[50] ?? '#f9fafb',
              padding: 12,
              borderRadius: tokens.borderRadius?.md ?? 6,
              border: `1px solid ${tokens.colors.neutral?.[100] ?? '#f3f4f6'}`,
            }}>
              {recording.summary}
            </Text>
          </Box>
        )}

        {/* ============================================================ */}
        {/* TAGS                                                          */}
        {/* ============================================================ */}
        <Box style={{
          padding: `${tokens.spacing?.[3] ?? 12}px ${tokens.spacing?.[6] ?? 24}px`,
          borderTop: `1px solid ${tokens.colors.neutral?.[200] ?? '#e5e7eb'}`,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          flexWrap: 'wrap' as const,
        }}>
          <Tag size={14} color={tokens.colors.neutral?.[400] ?? '#9ca3af'} />
          {tags.map((tag, idx) => (
            <Box
              key={idx}
              style={{
                ...createBadgeStyle(tokens, 'secondary'),
                fontSize: 11,
                padding: '2px 8px',
              }}
            >
              {tag}
            </Box>
          ))}
          {tags.length === 0 && (
            <Text style={{
              fontSize: 12,
              color: tokens.colors.neutral?.[400] ?? '#9ca3af',
              margin: 0,
            }}>
              No tags
            </Text>
          )}
        </Box>
      </Box>
    );
  }
);
