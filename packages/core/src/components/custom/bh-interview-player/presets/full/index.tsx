'use client';

/**
 * BhInterviewPlayer - Full Preset
 * Complete interview replay experience with audio player, transcript,
 * scorecard sidebar, notes panel, AI insights, and action bar
 */

import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createSurfaceStyle,
  createBadgeStyle,
  createHoverStyle,
  getHoverTransform,
} from '../../../helpers';
import type {
  BhInterviewPlayerProps,
  TranscriptLine,
  EvidenceHighlight,
  ScorecardDimension,
  AiInsight,
  TimestampedNote,
} from '../../core';
import {
  BH_INTERVIEW_PLAYER_DEFAULTS,
  getLevelColors,
  getInsightCategoryColors,
  formatTime,
  generateWaveformPoints,
  getDimensionScoreColor,
  getDimensionScoreGradient,
} from '../../core';
import type { DesignTokens } from '../../../../../core/types/tokens';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Download,
  Flag,
  RefreshCw,
  CheckCircle,
  ChevronRight,
  ChevronDown,
  MessageSquare,
  BarChart3,
  Lightbulb,
  AlertTriangle,
  Palette,
  Layers,
  Clock,
  User,
  Bot,
  Send,
  X,
  Shield,
  Star,
  Zap,
} from 'lucide-react';

// ============================================================================
// Constants
// ============================================================================

const WAVEFORM_WIDTH = 800;
const WAVEFORM_HEIGHT = 48;
const WAVEFORM_POINTS = 120;
const SCORE_RING_SIZE = 96;
const SCORE_RING_STROKE = 8;
const SPEED_OPTIONS = [0.5, 1, 1.5, 2];

export const FullBhInterviewPlayer = createPreset<BhInterviewPlayerProps>({
  name: 'BhInterviewPlayer.Full',
  render: ({ primitives, props, tokens, engine }: PresetContext<BhInterviewPlayerProps>) => {
    const { Box } = primitives;

    const {
      interviewInfo,
      transcript,
      scorecard,
      notes,
      insights,
      audioUrl,
      audioDuration,
      onAddNote,
      onApproveScore,
      onRequestRescore,
      onFlagForReview,
      onDownloadTranscript,
      className,
      style,
    } = props;

    // ==================================================================
    // State
    // ==================================================================

    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [playbackSpeed, setPlaybackSpeed] = useState(1);
    const [activeTranscriptLine, setActiveTranscriptLine] = useState<string | null>(null);
    const [showScorecard, setShowScorecard] = useState(true);
    const [showNotes, setShowNotes] = useState(false);
    const [highlightedEvidence, setHighlightedEvidence] = useState<string | null>(null);
    const [selectedDimension, setSelectedDimension] = useState<string | null>(null);
    const [noteInput, setNoteInput] = useState('');
    const [isMuted, setIsMuted] = useState(false);
    const [hoveredSpeed, setHoveredSpeed] = useState<number | null>(null);
    const [hoveredAction, setHoveredAction] = useState<string | null>(null);
    const [isDraggingSeek, setIsDraggingSeek] = useState(false);

    const transcriptRef = useRef<HTMLDivElement>(null);
    const seekBarRef = useRef<SVGSVGElement>(null);
    const audioRef = useRef<HTMLAudioElement>(null);

    // ==================================================================
    // Derived values
    // ==================================================================

    const levelColors = useMemo(() => getLevelColors(tokens), [tokens]);
    const insightColors = useMemo(() => getInsightCategoryColors(tokens), [tokens]);
    const waveformPoints = useMemo(
      () => generateWaveformPoints(WAVEFORM_WIDTH, WAVEFORM_HEIGHT, WAVEFORM_POINTS),
      [],
    );

    const progress = audioDuration > 0 ? currentTime / audioDuration : 0;
    const currentLevelColor = levelColors[scorecard.overallLevel];

    // ==================================================================
    // Audio Playback
    // ==================================================================

    useEffect(() => {
      if (!audioRef.current) return;
      audioRef.current.playbackRate = playbackSpeed;
    }, [playbackSpeed]);

    useEffect(() => {
      if (!audioRef.current) return;
      audioRef.current.muted = isMuted;
    }, [isMuted]);

    const togglePlay = useCallback(() => {
      if (!audioRef.current) {
        // Simulate playback when no audio URL
        setIsPlaying((prev) => !prev);
        return;
      }
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying((prev) => !prev);
    }, [isPlaying]);

    // Simulated playback timer when no audio element
    useEffect(() => {
      if (!audioUrl && isPlaying) {
        const interval = setInterval(() => {
          setCurrentTime((prev) => {
            const next = prev + 0.1 * playbackSpeed;
            if (next >= audioDuration) {
              setIsPlaying(false);
              return audioDuration;
            }
            return next;
          });
        }, 100);
        return () => clearInterval(interval);
      }
    }, [audioUrl, isPlaying, playbackSpeed, audioDuration]);

    // Audio element time update
    const handleAudioTimeUpdate = useCallback(() => {
      if (audioRef.current) {
        setCurrentTime(audioRef.current.currentTime);
      }
    }, []);

    const handleAudioEnded = useCallback(() => {
      setIsPlaying(false);
    }, []);

    // ==================================================================
    // Transcript Sync
    // ==================================================================

    useEffect(() => {
      const activeLine = transcript.reduce<TranscriptLine | null>((best, line) => {
        if (line.timestamp <= currentTime) {
          if (!best || line.timestamp > best.timestamp) return line;
        }
        return best;
      }, null);

      if (activeLine && activeLine.id !== activeTranscriptLine) {
        setActiveTranscriptLine(activeLine.id);
      }
    }, [currentTime, transcript, activeTranscriptLine]);

    // Auto-scroll transcript
    useEffect(() => {
      if (!transcriptRef.current || !activeTranscriptLine) return;
      const activeEl = transcriptRef.current.querySelector(
        `[data-line-id="${activeTranscriptLine}"]`,
      );
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, [activeTranscriptLine]);

    // ==================================================================
    // Seek
    // ==================================================================

    const handleSeek = useCallback(
      (clientX: number) => {
        if (!seekBarRef.current) return;
        const rect = seekBarRef.current.getBoundingClientRect();
        const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
        const newTime = ratio * audioDuration;
        setCurrentTime(newTime);
        if (audioRef.current) {
          audioRef.current.currentTime = newTime;
        }
      },
      [audioDuration],
    );

    const handleSeekMouseDown = useCallback(
      (e: React.MouseEvent) => {
        setIsDraggingSeek(true);
        handleSeek(e.clientX);
      },
      [handleSeek],
    );

    useEffect(() => {
      if (!isDraggingSeek) return;

      const handleMouseMove = (e: MouseEvent) => handleSeek(e.clientX);
      const handleMouseUp = () => setIsDraggingSeek(false);

      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }, [isDraggingSeek, handleSeek]);

    // ==================================================================
    // Transcript click-to-seek
    // ==================================================================

    const handleTranscriptLineClick = useCallback(
      (line: TranscriptLine) => {
        setCurrentTime(line.timestamp);
        if (audioRef.current) {
          audioRef.current.currentTime = line.timestamp;
        }
      },
      [],
    );

    // ==================================================================
    // Notes
    // ==================================================================

    const handleAddNote = useCallback(() => {
      if (!noteInput.trim() || !onAddNote) return;
      onAddNote(noteInput.trim(), currentTime);
      setNoteInput('');
    }, [noteInput, currentTime, onAddNote]);

    // ==================================================================
    // Glassmorphism support
    // ==================================================================

    const glassEnabled = tokens.surface.useGlass && !!tokens.glass;

    const containerStyle: React.CSSProperties = {
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      backgroundColor: tokens.colors.neutral[50],
      fontFamily: 'inherit',
      overflow: 'hidden',
      ...createSurfaceStyle(tokens, { elevation: 'lg', glass: glassEnabled }),
      ...style,
    };

    const panelCardStyle: React.CSSProperties = {
      ...createCardStyle(tokens, { elevation: 'sm', glass: glassEnabled }),
      overflow: 'hidden',
    };

    // ==================================================================
    // Render: Header
    // ==================================================================

    const renderHeader = () => {
      const statusBadgeColors: Record<string, { bg: string; text: string; border: string }> = {
        completed: {
          bg: tokens.colors.successScale[50],
          text: tokens.colors.successScale[700],
          border: tokens.colors.successScale[200],
        },
        in_progress: {
          bg: tokens.colors.infoScale[50],
          text: tokens.colors.infoScale[700],
          border: tokens.colors.infoScale[200],
        },
        pending: {
          bg: tokens.colors.warningScale[50],
          text: tokens.colors.warningScale[700],
          border: tokens.colors.warningScale[200],
        },
      };

      const statusStyle = statusBadgeColors[interviewInfo.status] || statusBadgeColors.completed;

      return (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: tokens.spacing[4],
            padding: `${tokens.spacing[4]}px ${tokens.spacing[5]}px`,
            borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
            backgroundColor: tokens.colors.common.white,
          }}
        >
          {/* Candidate Avatar */}
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: tokens.borderRadius.full,
              backgroundColor: tokens.colors.primaryScale[100],
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              flexShrink: 0,
              border: `2px solid ${tokens.colors.primaryScale[200]}`,
            }}
          >
            {interviewInfo.candidateAvatar ? (
              <img
                src={interviewInfo.candidateAvatar}
                alt={interviewInfo.candidateName}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <User size={24} color={tokens.colors.primaryScale[600]} />
            )}
          </div>

          {/* Candidate Info */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: tokens.typography.fontSize.lg,
                fontWeight: tokens.typography.fontWeight.semibold,
                color: tokens.colors.neutral[900],
                lineHeight: tokens.typography.lineHeight.tight,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {interviewInfo.candidateName}
            </div>
            <div
              style={{
                fontSize: tokens.typography.fontSize.sm,
                color: tokens.colors.neutral[500],
                marginTop: 2,
                display: 'flex',
                alignItems: 'center',
                gap: tokens.spacing[2],
                flexWrap: 'wrap',
              }}
            >
              <span>{interviewInfo.jobTitle}</span>
              <span style={{ color: tokens.colors.neutral[300] }}>|</span>
              {/* Stage badge */}
              <span
                style={{
                  ...createBadgeStyle(tokens, 'primary'),
                  padding: `${tokens.spacing[0]}px ${tokens.spacing[2]}px`,
                  fontSize: tokens.typography.fontSize.xs,
                }}
              >
                {interviewInfo.stageName}
              </span>
            </div>
          </div>

          {/* Date */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: tokens.spacing[1],
              fontSize: tokens.typography.fontSize.sm,
              color: tokens.colors.neutral[500],
            }}
          >
            <Clock size={14} color={tokens.colors.neutral[400]} />
            <span>{interviewInfo.date}</span>
          </div>

          {/* Duration */}
          <div
            style={{
              fontSize: tokens.typography.fontSize.sm,
              color: tokens.colors.neutral[500],
              paddingLeft: tokens.spacing[2],
            }}
          >
            {formatTime(interviewInfo.duration)}
          </div>

          {/* Status badge */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`,
              borderRadius: tokens.borderRadius.full,
              fontSize: tokens.typography.fontSize.xs,
              fontWeight: tokens.typography.fontWeight.medium,
              backgroundColor: statusStyle.bg,
              color: statusStyle.text,
              border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${statusStyle.border}`,
              textTransform: 'capitalize' as const,
            }}
          >
            {interviewInfo.status.replace(/_/g, ' ')}
          </div>
        </div>
      );
    };

    // ==================================================================
    // Render: Audio Player
    // ==================================================================

    const renderAudioPlayer = () => {
      const seekBarWidth = 100; // percentage
      const positionPercent = progress * 100;

      return (
        <div
          style={{
            padding: `${tokens.spacing[3]}px ${tokens.spacing[5]}px`,
            backgroundColor: tokens.colors.common.white,
            borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
          }}
        >
          {/* Hidden audio element */}
          {audioUrl && (
            <audio
              ref={audioRef}
              src={audioUrl}
              onTimeUpdate={handleAudioTimeUpdate}
              onEnded={handleAudioEnded}
              preload="metadata"
            />
          )}

          {/* Controls Row */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: tokens.spacing[3],
              marginBottom: tokens.spacing[2],
            }}
          >
            {/* Play/Pause */}
            <button
              onClick={togglePlay}
              style={{
                width: 40,
                height: 40,
                borderRadius: tokens.borderRadius.full,
                backgroundColor: tokens.colors.primaryScale[500],
                color: tokens.colors.common.white,
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                flexShrink: 0,
                transition: `all ${tokens.motion.hover}`,
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.backgroundColor =
                  tokens.colors.primaryScale[600];
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.backgroundColor =
                  tokens.colors.primaryScale[500];
              }}
            >
              {isPlaying ? <Pause size={18} /> : <Play size={18} style={{ marginLeft: 2 }} />}
            </button>

            {/* Seek Bar (SVG) */}
            <div style={{ flex: 1, position: 'relative' }}>
              <svg
                ref={seekBarRef}
                width="100%"
                height="8"
                style={{ cursor: 'pointer', display: 'block' }}
                onMouseDown={handleSeekMouseDown}
              >
                {/* Track background */}
                <rect
                  x="0"
                  y="1"
                  width="100%"
                  height="6"
                  rx="3"
                  fill={tokens.colors.neutral[200]}
                />
                {/* Progress fill */}
                <rect
                  x="0"
                  y="1"
                  width={`${positionPercent}%`}
                  height="6"
                  rx="3"
                  fill={tokens.colors.primaryScale[500]}
                />
                {/* Draggable position indicator */}
                <circle
                  cx={`${positionPercent}%`}
                  cy="4"
                  r="6"
                  fill={tokens.colors.common.white}
                  stroke={tokens.colors.primaryScale[500]}
                  strokeWidth="2"
                  style={{ filter: `drop-shadow(${tokens.shadows.sm})` }}
                />
              </svg>
            </div>

            {/* Time Display */}
            <div
              style={{
                fontSize: tokens.typography.fontSize.xs,
                fontWeight: tokens.typography.fontWeight.medium,
                color: tokens.colors.neutral[600],
                fontVariantNumeric: 'tabular-nums',
                whiteSpace: 'nowrap',
                minWidth: 80,
                textAlign: 'center',
              }}
            >
              {formatTime(currentTime)} / {formatTime(audioDuration)}
            </div>

            {/* Speed Selector */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: tokens.spacing[1],
                borderRadius: tokens.borderRadius.md,
                backgroundColor: tokens.colors.neutral[100],
                padding: `${tokens.spacing[1]}px ${tokens.spacing[1]}px`,
              }}
            >
              {SPEED_OPTIONS.map((speed) => (
                <button
                  key={speed}
                  onClick={() => setPlaybackSpeed(speed)}
                  onMouseEnter={() => setHoveredSpeed(speed)}
                  onMouseLeave={() => setHoveredSpeed(null)}
                  style={{
                    padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                    borderRadius: tokens.borderRadius.sm,
                    border: 'none',
                    fontSize: tokens.typography.fontSize.xs,
                    fontWeight:
                      playbackSpeed === speed
                        ? tokens.typography.fontWeight.semibold
                        : tokens.typography.fontWeight.normal,
                    backgroundColor:
                      playbackSpeed === speed
                        ? tokens.colors.primaryScale[500]
                        : hoveredSpeed === speed
                          ? tokens.colors.neutral[200]
                          : 'transparent',
                    color:
                      playbackSpeed === speed
                        ? tokens.colors.common.white
                        : tokens.colors.neutral[600],
                    cursor: 'pointer',
                    transition: `all ${tokens.motion.hover}`,
                    lineHeight: 1,
                  }}
                >
                  {speed}x
                </button>
              ))}
            </div>

            {/* Volume Toggle */}
            <button
              onClick={() => setIsMuted((prev) => !prev)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: isMuted ? tokens.colors.neutral[400] : tokens.colors.neutral[600],
                display: 'flex',
                alignItems: 'center',
                padding: tokens.spacing[1],
                borderRadius: tokens.borderRadius.sm,
                transition: `all ${tokens.motion.hover}`,
              }}
            >
              {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>
          </div>

          {/* Waveform Visualization */}
          <div
            style={{
              position: 'relative',
              height: WAVEFORM_HEIGHT,
              borderRadius: tokens.borderRadius.md,
              overflow: 'hidden',
              backgroundColor: tokens.colors.neutral[50],
              cursor: 'pointer',
            }}
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const ratio = (e.clientX - rect.left) / rect.width;
              const newTime = ratio * audioDuration;
              setCurrentTime(newTime);
              if (audioRef.current) {
                audioRef.current.currentTime = newTime;
              }
            }}
          >
            <svg
              width="100%"
              height={WAVEFORM_HEIGHT}
              viewBox={`0 0 ${WAVEFORM_WIDTH} ${WAVEFORM_HEIGHT}`}
              preserveAspectRatio="none"
            >
              {/* Waveform line - played portion */}
              <defs>
                <clipPath id="played-clip">
                  <rect
                    x="0"
                    y="0"
                    width={`${progress * WAVEFORM_WIDTH}`}
                    height={WAVEFORM_HEIGHT}
                  />
                </clipPath>
                <clipPath id="unplayed-clip">
                  <rect
                    x={`${progress * WAVEFORM_WIDTH}`}
                    y="0"
                    width={`${(1 - progress) * WAVEFORM_WIDTH}`}
                    height={WAVEFORM_HEIGHT}
                  />
                </clipPath>
              </defs>
              {/* Played (colored) waveform */}
              <polyline
                points={waveformPoints}
                fill="none"
                stroke={tokens.colors.primaryScale[400]}
                strokeWidth="2"
                clipPath="url(#played-clip)"
              />
              {/* Unplayed (gray) waveform */}
              <polyline
                points={waveformPoints}
                fill="none"
                stroke={tokens.colors.neutral[300]}
                strokeWidth="2"
                clipPath="url(#unplayed-clip)"
              />
              {/* Position indicator line */}
              <line
                x1={progress * WAVEFORM_WIDTH}
                y1="0"
                x2={progress * WAVEFORM_WIDTH}
                y2={WAVEFORM_HEIGHT}
                stroke={tokens.colors.primaryScale[500]}
                strokeWidth="2"
              />
            </svg>
          </div>
        </div>
      );
    };

    // ==================================================================
    // Render: Transcript Line with Evidence Highlights
    // ==================================================================

    const renderTranscriptText = (line: TranscriptLine) => {
      if (!line.evidenceHighlights || line.evidenceHighlights.length === 0) {
        return <span>{line.text}</span>;
      }

      // Sort highlights by startIdx
      const sorted = [...line.evidenceHighlights].sort((a, b) => a.startIdx - b.startIdx);
      const parts: React.ReactNode[] = [];
      let lastIdx = 0;

      sorted.forEach((highlight, i) => {
        if (highlight.startIdx > lastIdx) {
          parts.push(
            <span key={`text-${i}`}>{line.text.slice(lastIdx, highlight.startIdx)}</span>,
          );
        }

        const isHighlighted = highlightedEvidence === `${line.id}-${highlight.dimensionId}`;
        const isSelectedDim = selectedDimension === highlight.dimensionId;
        const dimScoreColor = getDimensionScoreColor(highlight.scoreContribution, tokens);

        parts.push(
          <span
            key={`ev-${i}`}
            style={{
              borderBottom: `2px solid ${dimScoreColor}`,
              backgroundColor:
                isHighlighted || isSelectedDim
                  ? tokens.colors.primaryScale[50]
                  : 'transparent',
              cursor: 'pointer',
              position: 'relative',
              transition: `all ${tokens.motion.hover}`,
              borderRadius: tokens.borderRadius.sm,
              padding: `0 ${tokens.spacing[0]}px`,
            }}
            onMouseEnter={() =>
              setHighlightedEvidence(`${line.id}-${highlight.dimensionId}`)
            }
            onMouseLeave={() => setHighlightedEvidence(null)}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedDimension(highlight.dimensionId);
              setShowScorecard(true);
            }}
          >
            {line.text.slice(highlight.startIdx, highlight.endIdx)}
            {/* Small score badge */}
            {(isHighlighted || isSelectedDim) && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  marginLeft: tokens.spacing[1],
                  padding: `0 ${tokens.spacing[1]}px`,
                  borderRadius: tokens.borderRadius.sm,
                  fontSize: '10px',
                  fontWeight: tokens.typography.fontWeight.semibold,
                  backgroundColor: dimScoreColor,
                  color: tokens.colors.common.white,
                  lineHeight: '16px',
                  verticalAlign: 'middle',
                }}
              >
                +{highlight.scoreContribution}
              </span>
            )}
          </span>,
        );

        lastIdx = highlight.endIdx;
      });

      if (lastIdx < line.text.length) {
        parts.push(<span key="text-end">{line.text.slice(lastIdx)}</span>);
      }

      return <>{parts}</>;
    };

    // ==================================================================
    // Render: Transcript Panel
    // ==================================================================

    const renderTranscript = () => (
      <div
        ref={transcriptRef}
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: `${tokens.spacing[4]}px ${tokens.spacing[5]}px`,
          display: 'flex',
          flexDirection: 'column',
          gap: tokens.spacing[3],
        }}
      >
        {transcript.map((line) => {
          const isActive = activeTranscriptLine === line.id;
          const isCandidate = line.speaker === 'candidate';

          return (
            <div
              key={line.id}
              data-line-id={line.id}
              onClick={() => handleTranscriptLineClick(line)}
              style={{
                display: 'flex',
                flexDirection: isCandidate ? 'row' : 'row-reverse',
                gap: tokens.spacing[2],
                cursor: 'pointer',
                transition: `all ${tokens.motion.hover}`,
                maxWidth: '85%',
                alignSelf: isCandidate ? 'flex-start' : 'flex-end',
              }}
            >
              {/* Speaker icon */}
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: tokens.borderRadius.full,
                  backgroundColor: isCandidate
                    ? tokens.colors.primaryScale[100]
                    : tokens.colors.neutral[100],
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  marginTop: tokens.spacing[1],
                }}
              >
                {isCandidate ? (
                  <User size={14} color={tokens.colors.primaryScale[600]} />
                ) : (
                  <Bot size={14} color={tokens.colors.neutral[600]} />
                )}
              </div>

              {/* Bubble */}
              <div
                style={{
                  padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                  borderRadius: tokens.borderRadius.lg,
                  backgroundColor: isActive
                    ? isCandidate
                      ? tokens.colors.primaryScale[50]
                      : tokens.colors.neutral[100]
                    : isCandidate
                      ? tokens.colors.common.white
                      : tokens.colors.neutral[50],
                  border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${
                    isActive
                      ? isCandidate
                        ? tokens.colors.primaryScale[200]
                        : tokens.colors.neutral[300]
                      : tokens.colors.neutral[200]
                  }`,
                  boxShadow: isActive ? tokens.shadows.sm : 'none',
                  transition: `all ${tokens.motion.hover}`,
                  flex: 1,
                  minWidth: 0,
                }}
              >
                {/* Speaker label + timestamp */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: tokens.spacing[1],
                    gap: tokens.spacing[2],
                  }}
                >
                  <span
                    style={{
                      fontSize: tokens.typography.fontSize.xs,
                      fontWeight: tokens.typography.fontWeight.semibold,
                      color: isCandidate
                        ? tokens.colors.primaryScale[600]
                        : tokens.colors.neutral[500],
                      textTransform: 'capitalize' as const,
                    }}
                  >
                    {line.speaker}
                  </span>
                  <span
                    style={{
                      fontSize: '10px',
                      color: tokens.colors.neutral[400],
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    {formatTime(line.timestamp)}
                  </span>
                </div>

                {/* Text with evidence highlights */}
                <div
                  style={{
                    fontSize: tokens.typography.fontSize.sm,
                    color: tokens.colors.neutral[800],
                    lineHeight: tokens.typography.lineHeight.relaxed,
                    wordBreak: 'break-word' as const,
                  }}
                >
                  {renderTranscriptText(line)}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );

    // ==================================================================
    // Render: Scorecard Sidebar
    // ==================================================================

    const renderScoreRing = () => {
      const radius = (SCORE_RING_SIZE - SCORE_RING_STROKE) / 2;
      const circumference = 2 * Math.PI * radius;
      const scorePercent = scorecard.overallScore / 100;
      const dashOffset = circumference * (1 - scorePercent);

      return (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: `${tokens.spacing[4]}px 0`,
          }}
        >
          <div style={{ position: 'relative', width: SCORE_RING_SIZE, height: SCORE_RING_SIZE }}>
            <svg
              width={SCORE_RING_SIZE}
              height={SCORE_RING_SIZE}
              viewBox={`0 0 ${SCORE_RING_SIZE} ${SCORE_RING_SIZE}`}
            >
              {/* Background ring */}
              <circle
                cx={SCORE_RING_SIZE / 2}
                cy={SCORE_RING_SIZE / 2}
                r={radius}
                fill="none"
                stroke={tokens.colors.neutral[100]}
                strokeWidth={SCORE_RING_STROKE}
              />
              {/* Score ring */}
              <circle
                cx={SCORE_RING_SIZE / 2}
                cy={SCORE_RING_SIZE / 2}
                r={radius}
                fill="none"
                stroke={currentLevelColor.ring}
                strokeWidth={SCORE_RING_STROKE}
                strokeDasharray={`${circumference}`}
                strokeDashoffset={dashOffset}
                strokeLinecap="round"
                transform={`rotate(-90 ${SCORE_RING_SIZE / 2} ${SCORE_RING_SIZE / 2})`}
                style={{ transition: `stroke-dashoffset ${tokens.motion.hover}` }}
              />
            </svg>
            {/* Center score text */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span
                style={{
                  fontSize: tokens.typography.fontSize['2xl'],
                  fontWeight: tokens.typography.fontWeight.bold,
                  color: tokens.colors.neutral[900],
                  lineHeight: 1,
                }}
              >
                {scorecard.overallScore}
              </span>
            </div>
          </div>

          {/* Level badge */}
          <div
            style={{
              marginTop: tokens.spacing[2],
              display: 'inline-flex',
              alignItems: 'center',
              padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`,
              borderRadius: tokens.borderRadius.full,
              fontSize: tokens.typography.fontSize.xs,
              fontWeight: tokens.typography.fontWeight.semibold,
              backgroundColor: currentLevelColor.bg,
              color: currentLevelColor.text,
              border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${currentLevelColor.border}`,
              textTransform: 'capitalize' as const,
            }}
          >
            {scorecard.overallLevel}
          </div>

          {/* Confidence */}
          <div
            style={{
              marginTop: tokens.spacing[1],
              fontSize: tokens.typography.fontSize.xs,
              color: tokens.colors.neutral[500],
            }}
          >
            Confidence: {Math.round(scorecard.confidence * 100)}%
          </div>
        </div>
      );
    };

    const renderDimensionBars = () => (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: tokens.spacing[3],
          padding: `0 ${tokens.spacing[3]}px ${tokens.spacing[3]}px`,
        }}
      >
        {scorecard.dimensions.map((dim) => {
          const gradient = getDimensionScoreGradient(dim.score, tokens);
          const isSelected = selectedDimension === dim.id;
          const confidenceSize = 8;

          return (
            <div
              key={dim.id}
              onClick={() =>
                setSelectedDimension(isSelected ? null : dim.id)
              }
              style={{
                padding: `${tokens.spacing[2]}px ${tokens.spacing[2]}px`,
                borderRadius: tokens.borderRadius.md,
                backgroundColor: isSelected
                  ? tokens.colors.primaryScale[50]
                  : 'transparent',
                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${
                  isSelected ? tokens.colors.primaryScale[200] : 'transparent'
                }`,
                cursor: 'pointer',
                transition: `all ${tokens.motion.hover}`,
              }}
            >
              {/* Dimension header */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: tokens.spacing[1],
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: tokens.spacing[1],
                    flex: 1,
                    minWidth: 0,
                  }}
                >
                  <span
                    style={{
                      fontSize: tokens.typography.fontSize.xs,
                      fontWeight: tokens.typography.fontWeight.medium,
                      color: tokens.colors.neutral[700],
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {dim.name}
                  </span>
                  {/* Knockout flag */}
                  {dim.isKnockout && (
                    <Shield
                      size={12}
                      color={
                        dim.knockoutTriggered
                          ? tokens.colors.errorScale[500]
                          : tokens.colors.neutral[400]
                      }
                    />
                  )}
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: tokens.spacing[1],
                  }}
                >
                  {/* Confidence indicator */}
                  <div
                    style={{
                      width: confidenceSize,
                      height: confidenceSize,
                      borderRadius: tokens.borderRadius.full,
                      backgroundColor:
                        dim.confidence >= 0.8
                          ? tokens.colors.successScale[400]
                          : dim.confidence >= 0.5
                            ? tokens.colors.warningScale[400]
                            : tokens.colors.errorScale[400],
                    }}
                    title={`Confidence: ${Math.round(dim.confidence * 100)}%`}
                  />

                  {/* Weight */}
                  <span
                    style={{
                      fontSize: '10px',
                      color: tokens.colors.neutral[400],
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    {dim.weight}w
                  </span>

                  {/* Score */}
                  <span
                    style={{
                      fontSize: tokens.typography.fontSize.xs,
                      fontWeight: tokens.typography.fontWeight.semibold,
                      color: getDimensionScoreColor(dim.score, tokens),
                      minWidth: 24,
                      textAlign: 'right',
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    {dim.score}
                  </span>
                </div>
              </div>

              {/* Score bar */}
              <div
                style={{
                  height: 6,
                  borderRadius: tokens.borderRadius.full,
                  backgroundColor: tokens.colors.neutral[100],
                  overflow: 'hidden',
                  position: 'relative',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${Math.min(100, dim.score)}%`,
                    borderRadius: tokens.borderRadius.full,
                    background: `linear-gradient(90deg, ${gradient.start}, ${gradient.end})`,
                    transition: `width ${tokens.motion.hover}`,
                  }}
                />
              </div>

              {/* Knockout triggered warning */}
              {dim.knockoutTriggered && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: tokens.spacing[1],
                    marginTop: tokens.spacing[1],
                    padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                    borderRadius: tokens.borderRadius.sm,
                    backgroundColor: tokens.colors.errorScale[50],
                    fontSize: '10px',
                    color: tokens.colors.errorScale[700],
                  }}
                >
                  <AlertTriangle size={10} />
                  Knockout triggered
                </div>
              )}
            </div>
          );
        })}
      </div>
    );

    const renderScorecard = () => {
      if (!showScorecard) return null;

      return (
        <div
          style={{
            width: 280,
            flexShrink: 0,
            borderLeft: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
            backgroundColor: tokens.colors.common.white,
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'auto',
          }}
        >
          {/* Scorecard header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: `${tokens.spacing[3]}px ${tokens.spacing[3]}px`,
              borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: tokens.spacing[2],
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.semibold,
                color: tokens.colors.neutral[800],
              }}
            >
              <BarChart3 size={16} color={tokens.colors.primaryScale[500]} />
              Scorecard
            </div>
            <button
              onClick={() => setShowScorecard(false)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: tokens.colors.neutral[400],
                display: 'flex',
                padding: tokens.spacing[1],
                borderRadius: tokens.borderRadius.sm,
              }}
            >
              <X size={14} />
            </button>
          </div>

          {renderScoreRing()}
          {renderDimensionBars()}
        </div>
      );
    };

    // ==================================================================
    // Render: Notes Panel
    // ==================================================================

    const renderNotes = () => {
      if (!showNotes) return null;

      return (
        <div
          style={{
            width: 300,
            flexShrink: 0,
            borderLeft: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
            backgroundColor: tokens.colors.common.white,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Notes header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: `${tokens.spacing[3]}px ${tokens.spacing[3]}px`,
              borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: tokens.spacing[2],
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.semibold,
                color: tokens.colors.neutral[800],
              }}
            >
              <MessageSquare size={16} color={tokens.colors.primaryScale[500]} />
              Notes ({notes.length})
            </div>
            <button
              onClick={() => setShowNotes(false)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: tokens.colors.neutral[400],
                display: 'flex',
                padding: tokens.spacing[1],
                borderRadius: tokens.borderRadius.sm,
              }}
            >
              <X size={14} />
            </button>
          </div>

          {/* Note input */}
          {onAddNote && (
            <div
              style={{
                padding: tokens.spacing[3],
                borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: tokens.spacing[2],
                }}
              >
                <div
                  style={{
                    flex: 1,
                    position: 'relative',
                  }}
                >
                  <input
                    type="text"
                    value={noteInput}
                    onChange={(e) => setNoteInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleAddNote();
                    }}
                    placeholder="Add a note..."
                    style={{
                      width: '100%',
                      padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                      borderRadius: tokens.borderRadius.md,
                      border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                      fontSize: tokens.typography.fontSize.sm,
                      color: tokens.colors.neutral[800],
                      backgroundColor: tokens.colors.neutral[50],
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
                <button
                  onClick={handleAddNote}
                  disabled={!noteInput.trim()}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: tokens.borderRadius.md,
                    backgroundColor: noteInput.trim()
                      ? tokens.colors.primaryScale[500]
                      : tokens.colors.neutral[200],
                    color: noteInput.trim()
                      ? tokens.colors.common.white
                      : tokens.colors.neutral[400],
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: noteInput.trim() ? 'pointer' : 'default',
                    flexShrink: 0,
                    transition: `all ${tokens.motion.hover}`,
                  }}
                >
                  <Send size={14} />
                </button>
              </div>
              <div
                style={{
                  fontSize: '10px',
                  color: tokens.colors.neutral[400],
                  marginTop: tokens.spacing[1],
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                at {formatTime(currentTime)}
              </div>
            </div>
          )}

          {/* Notes list */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: tokens.spacing[3],
              display: 'flex',
              flexDirection: 'column',
              gap: tokens.spacing[3],
            }}
          >
            {notes.length === 0 ? (
              <div
                style={{
                  textAlign: 'center',
                  padding: `${tokens.spacing[6]}px ${tokens.spacing[4]}px`,
                  color: tokens.colors.neutral[400],
                  fontSize: tokens.typography.fontSize.sm,
                }}
              >
                No notes yet
              </div>
            ) : (
              notes.map((note) => (
                <div
                  key={note.id}
                  style={{
                    padding: tokens.spacing[3],
                    borderRadius: tokens.borderRadius.md,
                    backgroundColor: tokens.colors.neutral[50],
                    border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: tokens.spacing[2],
                      marginBottom: tokens.spacing[2],
                    }}
                  >
                    {/* Author avatar */}
                    <div
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: tokens.borderRadius.full,
                        backgroundColor: tokens.colors.primaryScale[100],
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                        flexShrink: 0,
                      }}
                    >
                      {note.authorAvatar ? (
                        <img
                          src={note.authorAvatar}
                          alt={note.authorName}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                          }}
                        />
                      ) : (
                        <User size={12} color={tokens.colors.primaryScale[600]} />
                      )}
                    </div>
                    <span
                      style={{
                        fontSize: tokens.typography.fontSize.xs,
                        fontWeight: tokens.typography.fontWeight.medium,
                        color: tokens.colors.neutral[700],
                        flex: 1,
                      }}
                    >
                      {note.authorName}
                    </span>
                    <span
                      style={{
                        fontSize: '10px',
                        color: tokens.colors.neutral[400],
                        fontVariantNumeric: 'tabular-nums',
                      }}
                    >
                      {formatTime(note.timestamp)}
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: tokens.typography.fontSize.sm,
                      color: tokens.colors.neutral[800],
                      lineHeight: tokens.typography.lineHeight.relaxed,
                    }}
                  >
                    {note.content}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      );
    };

    // ==================================================================
    // Render: AI Insights
    // ==================================================================

    const insightIcons: Record<AiInsight['category'], React.ReactNode> = {
      strength: <Lightbulb size={16} />,
      concern: <AlertTriangle size={16} />,
      style: <Palette size={16} />,
      depth: <Layers size={16} />,
    };

    const renderInsights = () => {
      if (insights.length === 0) return null;

      return (
        <div
          style={{
            padding: `${tokens.spacing[3]}px ${tokens.spacing[5]}px`,
            borderTop: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
            backgroundColor: tokens.colors.common.white,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: tokens.spacing[2],
              marginBottom: tokens.spacing[3],
              fontSize: tokens.typography.fontSize.sm,
              fontWeight: tokens.typography.fontWeight.semibold,
              color: tokens.colors.neutral[800],
            }}
          >
            <Zap size={16} color={tokens.colors.primaryScale[500]} />
            AI Insights
          </div>

          <div
            style={{
              display: 'flex',
              gap: tokens.spacing[3],
              overflowX: 'auto',
              paddingBottom: tokens.spacing[1],
            }}
          >
            {insights.map((insight, idx) => {
              const catColor = insightColors[insight.category];

              return (
                <div
                  key={idx}
                  style={{
                    minWidth: 200,
                    maxWidth: 260,
                    padding: tokens.spacing[3],
                    borderRadius: tokens.borderRadius.lg,
                    backgroundColor: catColor.bg,
                    border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${catColor.border}`,
                    flexShrink: 0,
                    transition: `all ${tokens.motion.hover}`,
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: tokens.spacing[2],
                      marginBottom: tokens.spacing[2],
                    }}
                  >
                    <div style={{ color: catColor.icon }}>{insightIcons[insight.category]}</div>
                    <span
                      style={{
                        fontSize: tokens.typography.fontSize.xs,
                        fontWeight: tokens.typography.fontWeight.semibold,
                        color: catColor.text,
                        textTransform: 'capitalize' as const,
                      }}
                    >
                      {insight.category}
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: tokens.typography.fontSize.sm,
                      color: catColor.text,
                      lineHeight: tokens.typography.lineHeight.relaxed,
                    }}
                  >
                    {insight.text}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    };

    // ==================================================================
    // Render: Actions Bar
    // ==================================================================

    const actionButtons = [
      {
        key: 'approve',
        label: 'Approve Score',
        icon: <CheckCircle size={16} />,
        onClick: onApproveScore,
        color: 'success' as const,
      },
      {
        key: 'rescore',
        label: 'Request Re-score',
        icon: <RefreshCw size={16} />,
        onClick: onRequestRescore,
        color: 'info' as const,
      },
      {
        key: 'flag',
        label: 'Flag for Review',
        icon: <Flag size={16} />,
        onClick: onFlagForReview,
        color: 'warning' as const,
      },
      {
        key: 'download',
        label: 'Download Transcript',
        icon: <Download size={16} />,
        onClick: onDownloadTranscript,
        color: 'primary' as const,
      },
    ];

    const renderActionsBar = () => (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: `${tokens.spacing[3]}px ${tokens.spacing[5]}px`,
          borderTop: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
          backgroundColor: tokens.colors.common.white,
        }}
      >
        {/* Left: toggle buttons for panels */}
        <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
          <button
            onClick={() => setShowScorecard((prev) => !prev)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: tokens.spacing[1],
              padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
              borderRadius: tokens.borderRadius.md,
              border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${
                showScorecard
                  ? tokens.colors.primaryScale[200]
                  : tokens.colors.neutral[200]
              }`,
              backgroundColor: showScorecard
                ? tokens.colors.primaryScale[50]
                : tokens.colors.common.white,
              color: showScorecard
                ? tokens.colors.primaryScale[600]
                : tokens.colors.neutral[600],
              fontSize: tokens.typography.fontSize.xs,
              fontWeight: tokens.typography.fontWeight.medium,
              cursor: 'pointer',
              transition: `all ${tokens.motion.hover}`,
            }}
          >
            <BarChart3 size={14} />
            Scorecard
          </button>

          <button
            onClick={() => setShowNotes((prev) => !prev)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: tokens.spacing[1],
              padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
              borderRadius: tokens.borderRadius.md,
              border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${
                showNotes
                  ? tokens.colors.primaryScale[200]
                  : tokens.colors.neutral[200]
              }`,
              backgroundColor: showNotes
                ? tokens.colors.primaryScale[50]
                : tokens.colors.common.white,
              color: showNotes
                ? tokens.colors.primaryScale[600]
                : tokens.colors.neutral[600],
              fontSize: tokens.typography.fontSize.xs,
              fontWeight: tokens.typography.fontWeight.medium,
              cursor: 'pointer',
              transition: `all ${tokens.motion.hover}`,
            }}
          >
            <MessageSquare size={14} />
            Notes
          </button>
        </div>

        {/* Right: action buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
          {actionButtons.map((action) => {
            if (!action.onClick) return null;

            const scaleKey = `${action.color}Scale` as const;
            const scale = (tokens.colors as any)[scaleKey];
            const isHovered = hoveredAction === action.key;

            return (
              <button
                key={action.key}
                onClick={action.onClick}
                onMouseEnter={() => setHoveredAction(action.key)}
                onMouseLeave={() => setHoveredAction(null)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: tokens.spacing[1],
                  padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                  borderRadius: tokens.borderRadius.md,
                  border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${
                    isHovered ? scale[300] : scale[200]
                  }`,
                  backgroundColor: isHovered ? scale[100] : scale[50],
                  color: scale[700],
                  fontSize: tokens.typography.fontSize.xs,
                  fontWeight: tokens.typography.fontWeight.medium,
                  cursor: 'pointer',
                  transition: `all ${tokens.motion.hover}`,
                }}
              >
                {action.icon}
                {action.label}
              </button>
            );
          })}
        </div>
      </div>
    );

    // ==================================================================
    // Main Layout
    // ==================================================================

    return (
      <Box className={className} style={containerStyle}>
        {renderHeader()}
        {renderAudioPlayer()}

        {/* Main Content: Transcript + Side panels */}
        <div
          style={{
            display: 'flex',
            flex: 1,
            overflow: 'hidden',
          }}
        >
          {renderTranscript()}
          {renderScorecard()}
          {renderNotes()}
        </div>

        {renderInsights()}
        {renderActionsBar()}
      </Box>
    );
  },
});
