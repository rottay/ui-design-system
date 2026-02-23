'use client';

/**
 * BhVoiceDebriefPlayer - Recorder Preset
 * Full recording interface for interview debriefs.
 *
 * Layout:
 * - Header: candidate name, interview title, date
 * - Audio waveform visualization (SVG bars, animated during recording)
 * - Record/Stop/Pause controls (large circular buttons)
 * - Recording timer (MM:SS format, red dot pulse when active)
 * - Mark Moment buttons: Highlight, Concern, Red Flag, Insight
 * - Real-time transcript feed (scrolling text with timestamps)
 * - Moment markers along a timeline bar
 * - Status indicator: "Recording..." with pulse, "Paused", "Ready"
 */

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Square,
  Pause,
  Play,
  Star,
  AlertTriangle,
  Flag,
  Lightbulb,
  HelpCircle,
  Clock,
  CircleDot,
  MessageSquare,
  Tag,
  ChevronDown,
  ChevronUp,
  Bookmark,
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
  createDividerStyle,
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
} from '../../core';

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const MOMENT_TYPES: Array<{
  value: KeyMoment['type'];
  label: string;
  color: 'success' | 'warning' | 'error' | 'info' | 'secondary';
  icon: typeof Star;
}> = [
  { value: 'highlight', label: 'Highlight', color: 'success', icon: Star },
  { value: 'concern', label: 'Concern', color: 'warning', icon: AlertTriangle },
  { value: 'red_flag', label: 'Red Flag', color: 'error', icon: Flag },
  { value: 'insight', label: 'Insight', color: 'info', icon: Lightbulb },
  { value: 'question', label: 'Question', color: 'secondary', icon: HelpCircle },
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function formatTimer(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function getMomentColor(type: KeyMoment['type']): 'success' | 'warning' | 'error' | 'info' | 'secondary' {
  switch (type) {
    case 'highlight': return 'success';
    case 'concern': return 'warning';
    case 'red_flag': return 'error';
    case 'insight': return 'info';
    case 'question': return 'secondary';
    default: return 'secondary';
  }
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export const RecorderBhVoiceDebriefPlayer = createPreset<BhVoiceDebriefPlayerProps>(
  'RecorderBhVoiceDebriefPlayer',
  ({ primitives: { Box, Text, Button, Input }, props, tokens }: PresetContext<BhVoiceDebriefPlayerProps>) => {
    const {
      recording,
      loading = false,
      onStartRecording,
      onStopRecording,
      onMarkMoment,
      onAddNote,
      isRecording = false,
      currentTime = 0,
      className,
      style,
    } = props;

    const [isPaused, setIsPaused] = useState(false);
    const [timerSeconds, setTimerSeconds] = useState(0);
    const [momentNote, setMomentNote] = useState('');
    const [showMomentInput, setShowMomentInput] = useState<KeyMoment['type'] | null>(null);
    const [expandTranscript, setExpandTranscript] = useState(true);
    const transcriptRef = useRef<HTMLDivElement>(null);
    const waveformBars = useMemo(() => Array.from({ length: 48 }, () => Math.random()), []);

    const ptypo = useMemo(() => getPersonalityTypography(tokens), [tokens]);
    const badgeRadius = useMemo(() => getPersonalityBadgeRadius(tokens), [tokens]);
    const pulseSpeed = useMemo(() => getPulseSpeed(tokens), [tokens]);
    const cardStyle = useMemo(() => createCardStyle(tokens), [tokens]);
    const dividerStyle = useMemo(() => createDividerStyle(tokens), [tokens]);
    const skeletonStyle = useMemo(() => createPersonalitySkeletonStyle(tokens), [tokens]);
    const entranceAnim = useMemo(() => createEntranceAnimation(tokens), [tokens]);

    // Timer effect
    useEffect(() => {
      if (!isRecording || isPaused) return;
      const interval = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
      return () => clearInterval(interval);
    }, [isRecording, isPaused]);

    // Auto-scroll transcript
    useEffect(() => {
      if (transcriptRef.current) {
        transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
      }
    }, [recording?.transcriptSegments?.length]);

    const handleMarkMoment = useCallback((type: KeyMoment['type']) => {
      if (showMomentInput === type) {
        if (onMarkMoment) {
          const label = MOMENT_TYPES.find((m) => m.value === type)?.label ?? type;
          onMarkMoment(type, label, momentNote || undefined);
        }
        setShowMomentInput(null);
        setMomentNote('');
      } else {
        setShowMomentInput(type);
      }
    }, [showMomentInput, momentNote, onMarkMoment]);

    const handleToggleRecording = useCallback(() => {
      if (isRecording) {
        onStopRecording?.();
        setTimerSeconds(0);
      } else {
        onStartRecording?.();
      }
    }, [isRecording, onStartRecording, onStopRecording]);

    const colorScale = useCallback((scale: string, shade: keyof import('../../../../../core/types').ColorScale) => {
      const key = `${scale}Scale` as keyof typeof tokens.colors;
      const scaleObj = tokens.colors[key] as import('../../../../../core/types').ColorScale | undefined;
      return scaleObj?.[shade] ?? tokens.colors.neutral?.[shade] ?? '#888';
    }, [tokens]);

    const status = isRecording ? (isPaused ? 'Paused' : 'Recording...') : 'Ready';
    const statusColor = isRecording
      ? (isPaused ? colorScale('warning', 600) : colorScale('error', 600))
      : colorScale('success', 600);

    const segments = recording?.transcriptSegments ?? [];
    const moments = recording?.keyMoments ?? [];

    // Loading skeleton
    if (loading) {
      return (
        <Box className={className} style={{ ...cardStyle, padding: tokens.spacing?.[6] ?? 24, ...style }}>
          <Box style={{ ...skeletonStyle, height: 24, width: '60%', marginBottom: 16 }} />
          <Box style={{ ...skeletonStyle, height: 120, width: '100%', marginBottom: 16 }} />
          <Box style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 16 }}>
            <Box style={{ ...skeletonStyle, height: 64, width: 64, borderRadius: tokens.borderRadius?.full ?? '50%' }} />
            <Box style={{ ...skeletonStyle, height: 64, width: 64, borderRadius: tokens.borderRadius?.full ?? '50%' }} />
          </Box>
          <Box style={{ ...skeletonStyle, height: 200, width: '100%' }} />
        </Box>
      );
    }

    return (
      <Box className={className} style={{ ...cardStyle, padding: 0, overflow: 'hidden', ...entranceAnim, ...style }}>
        {/* ============================================================ */}
        {/* HEADER: Interview Info                                        */}
        {/* ============================================================ */}
        <Box style={{
          padding: `${tokens.spacing?.[4] ?? 16}px ${tokens.spacing?.[6] ?? 24}px`,
          borderBottom: `1px solid ${tokens.colors.neutral?.[200] ?? '#e5e7eb'}`,
          background: tokens.colors.neutral?.[50] ?? '#f9fafb',
        }}>
          <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Text style={{
                fontSize: 18,
                color: tokens.colors.neutral?.[900] ?? '#111',
                margin: 0,
              }}>
                {recording?.candidateName ?? 'New Debrief'}
              </Text>
              <Text style={{
                fontSize: 14,
                color: tokens.colors.neutral?.[500] ?? '#6b7280',
                margin: 0,
                marginTop: 2,
              }}>
                {recording?.interviewTitle ?? 'Interview Debrief'}
                {recording?.recordedAt && ` - ${formatDate(recording.recordedAt)}`}
              </Text>
            </Box>
            {/* Status indicator */}
            <Box style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 14px',
              borderRadius: badgeRadius,
              background: isRecording && !isPaused
                ? `${colorScale('error', 50)}`
                : isPaused
                  ? `${colorScale('warning', 50)}`
                  : `${colorScale('success', 50)}`,
              border: `1px solid ${isRecording && !isPaused
                ? colorScale('error', 200)
                : isPaused
                  ? colorScale('warning', 200)
                  : colorScale('success', 200)}`,
            }}>
              {isRecording && !isPaused && (
                <Box style={{
                  width: 8,
                  height: 8,
                  borderRadius: tokens.borderRadius?.full ?? '50%',
                  background: colorScale('error', 500),
                  animation: `pulse ${pulseSpeed}ms ease-in-out infinite`,
                }} />
              )}
              <Text style={{
                fontSize: 13,
                fontWeight: tokens.typography?.fontWeight?.semibold ?? 600,
                color: statusColor,
                margin: 0,
              }}>
                {status}
              </Text>
            </Box>
          </Box>
        </Box>

        {/* ============================================================ */}
        {/* WAVEFORM VISUALIZATION                                        */}
        {/* ============================================================ */}
        <Box style={{
          padding: `${tokens.spacing?.[5] ?? 20}px ${tokens.spacing?.[6] ?? 24}px`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: tokens.colors.neutral?.[900] ?? '#111827',
          minHeight: 120,
        }}>
          <svg width="100%" height="80" viewBox="0 0 480 80" preserveAspectRatio="none">
            {waveformBars.map((h, i) => {
              const barHeight = isRecording && !isPaused
                ? 10 + h * 60 + Math.sin(Date.now() / 200 + i) * 10
                : 10 + h * 20;
              const barColor = isRecording && !isPaused
                ? colorScale('error', 400)
                : colorScale('primary', 400);
              return (
                <rect
                  key={i}
                  x={i * 10}
                  y={40 - barHeight / 2}
                  width={6}
                  height={barHeight}
                  rx={3}
                  fill={barColor}
                  opacity={isRecording ? 0.9 : 0.4}
                />
              );
            })}
          </svg>
        </Box>

        {/* ============================================================ */}
        {/* TIMER                                                         */}
        {/* ============================================================ */}
        <Box style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: `${tokens.spacing?.[3] ?? 12}px 0`,
          background: tokens.colors.neutral?.[50] ?? '#f9fafb',
          borderBottom: `1px solid ${tokens.colors.neutral?.[200] ?? '#e5e7eb'}`,
        }}>
          <Box style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Clock size={ICON_SIZES.label} color={tokens.colors.neutral?.[400] ?? '#9ca3af'} />
            <Text style={{
              fontFamily: 'monospace',
              fontSize: 28,
              fontWeight: tokens.typography?.fontWeight?.semibold ?? 600,
              color: isRecording ? colorScale('error', 600) : tokens.colors.neutral?.[700] ?? '#374151',
              margin: 0,
              letterSpacing: '0.05em',
            }}>
              {formatTimer(isRecording ? timerSeconds : (currentTime ?? 0))}
            </Text>
          </Box>
        </Box>

        {/* ============================================================ */}
        {/* RECORD CONTROLS                                               */}
        {/* ============================================================ */}
        <Box style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: tokens.spacing?.[5] ?? 20,
          padding: `${tokens.spacing?.[5] ?? 20}px 0`,
        }}>
          {/* Pause button (visible during recording) */}
          {isRecording && (
            <Box
              style={{
                width: 48,
                height: 48,
                borderRadius: tokens.borderRadius?.full ?? '50%',
                background: isPaused ? colorScale('warning', 100) : tokens.colors.neutral?.[100] ?? '#f3f4f6',
                border: `2px solid ${isPaused ? colorScale('warning', 300) : tokens.colors.neutral?.[300] ?? '#d1d5db'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 150ms ease',
              }}
              {...clickableProps(() => setIsPaused((prev) => !prev))}
            >
              {isPaused ? (
                <Play size={20} color={colorScale('warning', 700)} />
              ) : (
                <Pause size={20} color={tokens.colors.neutral?.[600] ?? '#4b5563'} />
              )}
            </Box>
          )}

          {/* Main Record/Stop button */}
          <Box
            style={{
              width: 72,
              height: 72,
              borderRadius: tokens.borderRadius?.full ?? '50%',
              background: isRecording ? colorScale('error', 500) : colorScale('error', 600),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: isRecording
                ? `0 0 0 6px ${colorScale('error', 100)}, 0 4px 12px ${colorScale('error', 200)}`
                : `0 4px 12px ${tokens.colors.neutral?.[300] ?? '#d1d5db'}`,
              transition: 'all 200ms ease',
            }}
            {...clickableProps(handleToggleRecording)}
          >
            {isRecording ? (
              <Square size={28} color={tokens.colors.common?.white ?? '#fff'} fill={tokens.colors.common?.white ?? '#fff'} />
            ) : (
              <Mic size={28} color={tokens.colors.common?.white ?? '#fff'} />
            )}
          </Box>
        </Box>

        {/* ============================================================ */}
        {/* MARK MOMENT BUTTONS                                           */}
        {/* ============================================================ */}
        <Box style={{
          padding: `0 ${tokens.spacing?.[6] ?? 24}px ${tokens.spacing?.[4] ?? 16}px`,
        }}>
          <Text style={{
            fontSize: 11,
            fontWeight: tokens.typography?.fontWeight?.semibold ?? 600,
            color: tokens.colors.neutral?.[400] ?? '#9ca3af',
            textTransform: 'uppercase' as const,
            letterSpacing: '0.05em',
            margin: 0,
            marginBottom: 8,
          }}>
            Mark Moment
          </Text>
          <Box style={{ display: 'flex', gap: 8, flexWrap: 'wrap' as const }}>
            {MOMENT_TYPES.map((mt) => {
              const Icon = mt.icon;
              const isActive = showMomentInput === mt.value;
              return (
                <Box key={mt.value} style={{ display: 'flex', flexDirection: 'column' as const, gap: 4 }}>
                  <Box
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '6px 12px',
                      borderRadius: badgeRadius,
                      background: isActive
                        ? colorScale(mt.color === 'secondary' ? 'primary' : mt.color, 100)
                        : tokens.colors.neutral?.[50] ?? '#f9fafb',
                      border: `1px solid ${isActive
                        ? colorScale(mt.color === 'secondary' ? 'primary' : mt.color, 300)
                        : tokens.colors.neutral?.[200] ?? '#e5e7eb'}`,
                      cursor: isRecording ? 'pointer' : 'default',
                      opacity: isRecording ? 1 : 0.5,
                      transition: 'all 150ms ease',
                    }}
                    {...(isRecording ? clickableProps(() => handleMarkMoment(mt.value)) : {})}
                  >
                    <Icon size={14} color={colorScale(mt.color === 'secondary' ? 'primary' : mt.color, 600)} />
                    <Text style={{
                      fontSize: 12,
                      fontWeight: tokens.typography?.fontWeight?.medium ?? 500,
                      color: colorScale(mt.color === 'secondary' ? 'primary' : mt.color, 700),
                      margin: 0,
                    }}>
                      {mt.label}
                    </Text>
                  </Box>
                  {isActive && (
                    <Input
                      value={momentNote}
                      onChange={(value: string) => setMomentNote(value)}
                      placeholder="Add note (optional)..."
                      style={{
                        fontSize: 12,
                        padding: '4px 8px',
                        borderRadius: tokens.borderRadius?.sm ?? 4,
                        border: `1px solid ${tokens.colors.neutral?.[200] ?? '#e5e7eb'}`,
                        width: 160,
                      }}
                    />
                  )}
                </Box>
              );
            })}
          </Box>
        </Box>

        {/* ============================================================ */}
        {/* MOMENT MARKERS TIMELINE                                       */}
        {/* ============================================================ */}
        {moments.length > 0 && (
          <Box style={{
            padding: `0 ${tokens.spacing?.[6] ?? 24}px ${tokens.spacing?.[4] ?? 16}px`,
          }}>
            <Box style={{
              position: 'relative' as const,
              height: 24,
              background: tokens.colors.neutral?.[100] ?? '#f3f4f6',
              borderRadius: tokens.borderRadius?.sm ?? 4,
              overflow: 'hidden',
            }}>
              {/* Progress indicator */}
              {isRecording && timerSeconds > 0 && (
                <Box style={{
                  position: 'absolute' as const,
                  top: 0,
                  left: 0,
                  height: '100%',
                  width: '100%',
                  background: `linear-gradient(90deg, ${colorScale('primary', 100)} 0%, transparent 100%)`,
                }} />
              )}
              {/* Moment markers */}
              {moments.map((moment, idx) => {
                const maxTime = isRecording ? timerSeconds : (recording?.duration ?? 1);
                const pos = maxTime > 0 ? (moment.timestamp / maxTime) * 100 : 0;
                const mColor = getMomentColor(moment.type);
                return (
                  <Box
                    key={idx}
                    style={{
                      position: 'absolute' as const,
                      left: `${Math.min(pos, 98)}%`,
                      top: 2,
                      width: 8,
                      height: 20,
                      borderRadius: 4,
                      background: colorScale(mColor === 'secondary' ? 'primary' : mColor, 500),
                      cursor: 'pointer',
                    }}
                    title={`${moment.label}${moment.notes ? ` - ${moment.notes}` : ''}`}
                  />
                );
              })}
            </Box>
          </Box>
        )}

        {/* ============================================================ */}
        {/* REAL-TIME TRANSCRIPT FEED                                     */}
        {/* ============================================================ */}
        <Box style={{
          borderTop: `1px solid ${tokens.colors.neutral?.[200] ?? '#e5e7eb'}`,
        }}>
          <Box
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: `${tokens.spacing?.[3] ?? 12}px ${tokens.spacing?.[6] ?? 24}px`,
              cursor: 'pointer',
            }}
            {...clickableProps(() => setExpandTranscript((prev) => !prev))}
          >
            <Box style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <MessageSquare size={ICON_SIZES.label} color={tokens.colors.neutral?.[500] ?? '#6b7280'} />
              <Text style={{
                fontSize: 13,
                fontWeight: tokens.typography?.fontWeight?.semibold ?? 600,
                color: tokens.colors.neutral?.[700] ?? '#374151',
                margin: 0,
              }}>
                Live Transcript
              </Text>
              {segments.length > 0 && (
                <Box style={{
                  ...createBadgeStyle(tokens, 'secondary'),
                  fontSize: 11,
                  padding: '1px 6px',
                }}>
                  {segments.length}
                </Box>
              )}
            </Box>
            {expandTranscript ? (
              <ChevronUp size={16} color={tokens.colors.neutral?.[400] ?? '#9ca3af'} />
            ) : (
              <ChevronDown size={16} color={tokens.colors.neutral?.[400] ?? '#9ca3af'} />
            )}
          </Box>

          {expandTranscript && (
            <div
              ref={transcriptRef}
              style={{
                maxHeight: 280,
                overflowY: 'auto' as const,
                padding: `0 ${tokens.spacing?.[6] ?? 24}px ${tokens.spacing?.[4] ?? 16}px`,
              }}
            >
              {segments.length === 0 ? (
                <Box style={{
                  ...createEmptyStateStyle(tokens),
                  padding: tokens.spacing?.[6] ?? 24,
                }}>
                  <MicOff size={24} color={tokens.colors.neutral?.[300] ?? '#d1d5db'} />
                  <Text style={{
                    fontSize: 13,
                    color: tokens.colors.neutral?.[400] ?? '#9ca3af',
                    margin: 0,
                    marginTop: 8,
                  }}>
                    {isRecording ? 'Waiting for speech...' : 'Start recording to see transcript'}
                  </Text>
                </Box>
              ) : (
                segments.map((seg, idx) => {
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
                        padding: '8px 0',
                        borderBottom: idx < segments.length - 1
                          ? `1px solid ${tokens.colors.neutral?.[100] ?? '#f3f4f6'}`
                          : 'none',
                        background: seg.isKeyMoment
                          ? colorScale('primary', 50)
                          : 'transparent',
                        borderLeft: seg.isKeyMoment
                          ? `3px solid ${colorScale('primary', 400)}`
                          : '3px solid transparent',
                        paddingLeft: 12,
                        borderRadius: seg.isKeyMoment ? tokens.borderRadius?.sm ?? 4 : 0,
                      }}
                    >
                      <Text style={{
                        fontFamily: 'monospace',
                        fontSize: 11,
                        color: tokens.colors.neutral?.[400] ?? '#9ca3af',
                        minWidth: 48,
                        margin: 0,
                        paddingTop: 2,
                      }}>
                        {formatTimer(seg.startTime)}
                      </Text>
                      <Box style={{ flex: 1 }}>
                        <Text style={{
                          fontSize: 11,
                          fontWeight: tokens.typography?.fontWeight?.semibold ?? 600,
                          color: tokens.colors.neutral?.[500] ?? '#6b7280',
                          margin: 0,
                          marginBottom: 2,
                        }}>
                          {seg.speaker}
                        </Text>
                        <Text style={{
                          fontSize: 13,
                          color: tokens.colors.neutral?.[800] ?? '#1f2937',
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
                })
              )}
            </div>
          )}
        </Box>
      </Box>
    );
  }
);
