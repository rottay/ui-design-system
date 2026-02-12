'use client';

/**
 * BhInterviewPlayer - Full Preset
 * Slite-inspired complete interview replay with audio player,
 * chat-style transcript, scorecard sidebar, notes, AI insights, and actions.
 */

import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import { createBadgeStyle, createCardStyle } from '../../../helpers';
import type {
  BhInterviewPlayerProps,
  TranscriptLine,
  AiInsight,
} from '../../core';
import {
  getLevelColors,
  getInsightCategoryColors,
  formatTime,
  generateWaveformPoints,
  getDimensionScoreColor,
  getDimensionScoreGradient,
} from '../../core';
import {
  Play, Pause, Volume2, VolumeX, Download, Flag, RefreshCw,
  CheckCircle, MessageSquare, BarChart3, Lightbulb, AlertTriangle,
  Palette, Layers, Clock, User, Bot, Send, X, Shield, Zap,
} from 'lucide-react';

const WAVEFORM_WIDTH = 800;
const WAVEFORM_HEIGHT = 48;
const WAVEFORM_POINTS = 120;
const SCORE_RING_SIZE = 96;
const SCORE_RING_STROKE = 8;
const SPEED_OPTIONS = [0.5, 1, 1.5, 2];

export const FullBhInterviewPlayer = createPreset<BhInterviewPlayerProps>({
  name: 'BhInterviewPlayer.Full',
  render: ({ primitives, props, tokens }: PresetContext<BhInterviewPlayerProps>) => {
    const { Box, Text } = primitives;

    const {
      interviewInfo, transcript, scorecard, notes, insights,
      audioUrl, audioDuration,
      onAddNote, onApproveScore, onRequestRescore, onFlagForReview, onDownloadTranscript,
      className, style,
    } = props;

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

    const levelColors = useMemo(() => getLevelColors(tokens), [tokens]);
    const insightColors = useMemo(() => getInsightCategoryColors(tokens), [tokens]);
    const waveformPoints = useMemo(
      () => generateWaveformPoints(WAVEFORM_WIDTH, WAVEFORM_HEIGHT, WAVEFORM_POINTS), [],
    );

    const progress = audioDuration > 0 ? currentTime / audioDuration : 0;
    const currentLevelColor = levelColors[scorecard.overallLevel];

    // Audio playback
    useEffect(() => { if (audioRef.current) audioRef.current.playbackRate = playbackSpeed; }, [playbackSpeed]);
    useEffect(() => { if (audioRef.current) audioRef.current.muted = isMuted; }, [isMuted]);

    const togglePlay = useCallback(() => {
      if (!audioRef.current) { setIsPlaying(p => !p); return; }
      if (isPlaying) audioRef.current.pause(); else audioRef.current.play();
      setIsPlaying(p => !p);
    }, [isPlaying]);

    useEffect(() => {
      if (!audioUrl && isPlaying) {
        const interval = setInterval(() => {
          setCurrentTime(prev => {
            const next = prev + 0.1 * playbackSpeed;
            if (next >= audioDuration) { setIsPlaying(false); return audioDuration; }
            return next;
          });
        }, 100);
        return () => clearInterval(interval);
      }
    }, [audioUrl, isPlaying, playbackSpeed, audioDuration]);

    const handleAudioTimeUpdate = useCallback(() => {
      if (audioRef.current) setCurrentTime(audioRef.current.currentTime);
    }, []);
    const handleAudioEnded = useCallback(() => setIsPlaying(false), []);

    // Transcript sync
    useEffect(() => {
      const activeLine = transcript.reduce<TranscriptLine | null>((best, line) => {
        if (line.timestamp <= currentTime && (!best || line.timestamp > best.timestamp)) return line;
        return best;
      }, null);
      if (activeLine && activeLine.id !== activeTranscriptLine) setActiveTranscriptLine(activeLine.id);
    }, [currentTime, transcript, activeTranscriptLine]);

    useEffect(() => {
      if (!transcriptRef.current || !activeTranscriptLine) return;
      const el = transcriptRef.current.querySelector(`[data-line-id="${activeTranscriptLine}"]`);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, [activeTranscriptLine]);

    // Seek
    const handleSeek = useCallback((clientX: number) => {
      if (!seekBarRef.current) return;
      const rect = seekBarRef.current.getBoundingClientRect();
      const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      const t = ratio * audioDuration;
      setCurrentTime(t);
      if (audioRef.current) audioRef.current.currentTime = t;
    }, [audioDuration]);

    const handleSeekMouseDown = useCallback((e: React.MouseEvent) => {
      setIsDraggingSeek(true); handleSeek(e.clientX);
    }, [handleSeek]);

    useEffect(() => {
      if (!isDraggingSeek) return;
      const move = (e: MouseEvent) => handleSeek(e.clientX);
      const up = () => setIsDraggingSeek(false);
      window.addEventListener('mousemove', move);
      window.addEventListener('mouseup', up);
      return () => { window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up); };
    }, [isDraggingSeek, handleSeek]);

    const handleTranscriptLineClick = useCallback((line: TranscriptLine) => {
      setCurrentTime(line.timestamp);
      if (audioRef.current) audioRef.current.currentTime = line.timestamp;
    }, []);

    const handleAddNote = useCallback(() => {
      if (!noteInput.trim() || !onAddNote) return;
      onAddNote(noteInput.trim(), currentTime);
      setNoteInput('');
    }, [noteInput, currentTime, onAddNote]);

    const positionPercent = progress * 100;

    const statusBadgeColors: Record<string, { bg: string; text: string; border: string }> = {
      completed: { bg: tokens.colors.successScale[50], text: tokens.colors.successScale[700], border: tokens.colors.successScale[200] },
      in_progress: { bg: tokens.colors.infoScale[50], text: tokens.colors.infoScale[700], border: tokens.colors.infoScale[200] },
      pending: { bg: tokens.colors.warningScale[50], text: tokens.colors.warningScale[700], border: tokens.colors.warningScale[200] },
    };
    const statusStyle = statusBadgeColors[interviewInfo.status] || statusBadgeColors.completed;

    const insightIcons: Record<AiInsight['category'], React.ReactNode> = {
      strength: <Lightbulb size={16} />, concern: <AlertTriangle size={16} />,
      style: <Palette size={16} />, depth: <Layers size={16} />,
    };

    const actionButtons = [
      { key: 'approve', label: 'Approve Score', icon: <CheckCircle size={16} />, onClick: onApproveScore, color: 'success' },
      { key: 'rescore', label: 'Request Re-score', icon: <RefreshCw size={16} />, onClick: onRequestRescore, color: 'info' },
      { key: 'flag', label: 'Flag for Review', icon: <Flag size={16} />, onClick: onFlagForReview, color: 'warning' },
      { key: 'download', label: 'Download Transcript', icon: <Download size={16} />, onClick: onDownloadTranscript, color: 'primary' },
    ];

    // Evidence highlight renderer
    const renderTranscriptText = (line: TranscriptLine) => {
      if (!line.evidenceHighlights || line.evidenceHighlights.length === 0) {
        return <Text>{line.text}</Text>;
      }
      const sorted = [...line.evidenceHighlights].sort((a, b) => a.startIdx - b.startIdx);
      const parts: React.ReactNode[] = [];
      let lastIdx = 0;

      sorted.forEach((hl, i) => {
        if (hl.startIdx > lastIdx) parts.push(<Text key={`t-${i}`}>{line.text.slice(lastIdx, hl.startIdx)}</Text>);
        const isHl = highlightedEvidence === `${line.id}-${hl.dimensionId}`;
        const isSel = selectedDimension === hl.dimensionId;
        const clr = getDimensionScoreColor(hl.scoreContribution, tokens);

        parts.push(
          <Box
            key={`ev-${i}`}
            style={{
              borderBottom: `2px solid ${clr}`,
              backgroundColor: isHl || isSel ? tokens.colors.primaryScale[50] : 'transparent',
              cursor: 'pointer', borderRadius: tokens.borderRadius.sm,
              padding: `0 ${tokens.spacing[0]}px`, transition: `all ${tokens.motion.hover}`,
              display: 'inline',
            }}
            onMouseEnter={() => setHighlightedEvidence(`${line.id}-${hl.dimensionId}`)}
            onMouseLeave={() => setHighlightedEvidence(null)}
            onClick={(e: React.MouseEvent) => { e.stopPropagation(); setSelectedDimension(hl.dimensionId); setShowScorecard(true); }}
          >
            {line.text.slice(hl.startIdx, hl.endIdx)}
            {(isHl || isSel) && (
              <Text style={{
                display: 'inline-flex', alignItems: 'center', marginLeft: tokens.spacing[1],
                padding: `0 ${tokens.spacing[1]}px`, borderRadius: tokens.borderRadius.sm,
                fontSize: '10px', fontWeight: tokens.typography.fontWeight.semibold,
                backgroundColor: clr, color: tokens.colors.common.white, lineHeight: '16px', verticalAlign: 'middle',
              }}>+{hl.scoreContribution}</Text>
            )}
          </Box>,
        );
        lastIdx = hl.endIdx;
      });

      if (lastIdx < line.text.length) parts.push(<Text key="end">{line.text.slice(lastIdx)}</Text>);
      return <>{parts}</>;
    };

    return (
      <Box className={className} style={{
        display: 'flex', flexDirection: 'column' as const, height: '100%',
        backgroundColor: tokens.colors.neutral[50], overflow: 'hidden', ...style,
      }}>
        {/* Header */}
        <Box style={{
          display: 'flex', alignItems: 'center', gap: tokens.spacing[4],
          padding: `${tokens.spacing[4]}px ${tokens.spacing[5]}px`,
          borderBottom: `1px solid ${tokens.colors.neutral[100]}`,
          backgroundColor: tokens.colors.common.white,
        }}>
          <Box style={{
            width: 48, height: 48, borderRadius: tokens.borderRadius.full,
            backgroundColor: tokens.colors.primaryScale[100],
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            overflow: 'hidden', flexShrink: 0, border: `1px solid ${tokens.colors.primaryScale[200]}`,
          }}>
            {interviewInfo.candidateAvatar
              ? <img src={interviewInfo.candidateAvatar} alt={interviewInfo.candidateName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <User size={24} color={tokens.colors.primaryScale[600]} />}
          </Box>
          <Box style={{ flex: 1, minWidth: 0 }}>
            <Text style={{
              fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.semibold,
              color: tokens.colors.neutral[900], lineHeight: tokens.typography.lineHeight.tight,
              whiteSpace: 'nowrap' as const, overflow: 'hidden' as const, textOverflow: 'ellipsis',
            }}>{interviewInfo.candidateName}</Text>
            <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], marginTop: 2, flexWrap: 'wrap' as const }}>
              <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>{interviewInfo.jobTitle}</Text>
              <Text style={{ color: tokens.colors.neutral[300], fontSize: tokens.typography.fontSize.sm }}>|</Text>
              <Text style={{ ...createBadgeStyle(tokens, 'primary'), padding: `${tokens.spacing[0]}px ${tokens.spacing[2]}px`, fontSize: tokens.typography.fontSize.xs }}>{interviewInfo.stageName}</Text>
            </Box>
          </Box>
          <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1], fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>
            <Clock size={14} color={tokens.colors.neutral[400]} />
            <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>{interviewInfo.date}</Text>
          </Box>
          <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500], paddingLeft: tokens.spacing[2] }}>{formatTime(interviewInfo.duration)}</Text>
          <Box style={{
            display: 'inline-flex', alignItems: 'center',
            padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`, borderRadius: tokens.borderRadius.full,
            fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.medium,
            backgroundColor: statusStyle.bg, color: statusStyle.text,
            border: `1px solid ${statusStyle.border}`, textTransform: 'capitalize' as const,
          }}>
            <Text style={{ fontSize: tokens.typography.fontSize.xs, color: statusStyle.text }}>{interviewInfo.status.replace(/_/g, ' ')}</Text>
          </Box>
        </Box>

        {/* Audio Player */}
        <Box style={{
          padding: `${tokens.spacing[3]}px ${tokens.spacing[5]}px`,
          backgroundColor: tokens.colors.common.white,
          borderBottom: `1px solid ${tokens.colors.neutral[100]}`,
        }}>
          {audioUrl && <audio ref={audioRef} src={audioUrl} onTimeUpdate={handleAudioTimeUpdate} onEnded={handleAudioEnded} preload="metadata" />}
          <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3], marginBottom: tokens.spacing[2] }}>
            {/* Play/Pause */}
            <Box onClick={togglePlay} style={{
              width: 40, height: 40, borderRadius: tokens.borderRadius.full,
              backgroundColor: tokens.colors.primaryScale[500], color: tokens.colors.common.white,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', flexShrink: 0, transition: `all ${tokens.motion.hover}`,
            }}>
              {isPlaying ? <Pause size={18} /> : <Play size={18} style={{ marginLeft: 2 }} />}
            </Box>

            {/* Seek Bar */}
            <Box style={{ flex: 1, position: 'relative' as const }}>
              <svg ref={seekBarRef} width="100%" height="8" style={{ cursor: 'pointer', display: 'block' }} onMouseDown={handleSeekMouseDown}>
                <rect x="0" y="1" width="100%" height="6" rx="3" fill={tokens.colors.neutral[200]} />
                <rect x="0" y="1" width={`${positionPercent}%`} height="6" rx="3" fill={tokens.colors.primaryScale[500]} />
                <circle cx={`${positionPercent}%`} cy="4" r="6" fill={tokens.colors.common.white} stroke={tokens.colors.primaryScale[500]} strokeWidth="2" style={{ filter: `drop-shadow(${tokens.shadows.sm})` }} />
              </svg>
            </Box>

            {/* Time */}
            <Text style={{
              fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.medium,
              color: tokens.colors.neutral[600], fontVariantNumeric: 'tabular-nums',
              whiteSpace: 'nowrap' as const, minWidth: 80, textAlign: 'center' as const,
            }}>{formatTime(currentTime)} / {formatTime(audioDuration)}</Text>

            {/* Speed */}
            <Box style={{
              display: 'flex', alignItems: 'center', gap: tokens.spacing[1],
              borderRadius: tokens.borderRadius.md, backgroundColor: tokens.colors.neutral[100],
              padding: `${tokens.spacing[1]}px`,
            }}>
              {SPEED_OPTIONS.map(speed => (
                <Box key={speed} onClick={() => setPlaybackSpeed(speed)}
                  onMouseEnter={() => setHoveredSpeed(speed)} onMouseLeave={() => setHoveredSpeed(null)}
                  style={{
                    padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`, borderRadius: tokens.borderRadius.sm,
                    fontSize: tokens.typography.fontSize.xs, cursor: 'pointer', transition: `all ${tokens.motion.hover}`, lineHeight: 1,
                    fontWeight: playbackSpeed === speed ? tokens.typography.fontWeight.semibold : tokens.typography.fontWeight.normal,
                    backgroundColor: playbackSpeed === speed ? tokens.colors.primaryScale[500] : hoveredSpeed === speed ? tokens.colors.neutral[200] : 'transparent',
                    color: playbackSpeed === speed ? tokens.colors.common.white : tokens.colors.neutral[600],
                  }}>
                  <Text style={{
                    fontSize: tokens.typography.fontSize.xs,
                    color: playbackSpeed === speed ? tokens.colors.common.white : tokens.colors.neutral[600],
                  }}>{speed}x</Text>
                </Box>
              ))}
            </Box>

            {/* Volume */}
            <Box onClick={() => setIsMuted(p => !p)} style={{
              cursor: 'pointer', display: 'flex', alignItems: 'center',
              padding: tokens.spacing[1], borderRadius: tokens.borderRadius.sm,
              color: isMuted ? tokens.colors.neutral[400] : tokens.colors.neutral[600],
            }}>
              {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </Box>
          </Box>

          {/* Waveform */}
          <Box style={{
            position: 'relative' as const, height: WAVEFORM_HEIGHT,
            borderRadius: tokens.borderRadius.md, overflow: 'hidden',
            backgroundColor: tokens.colors.neutral[50], cursor: 'pointer',
          }} onClick={(e: React.MouseEvent) => {
            const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
            const t = ((e.clientX - rect.left) / rect.width) * audioDuration;
            setCurrentTime(t);
            if (audioRef.current) audioRef.current.currentTime = t;
          }}>
            <svg width="100%" height={WAVEFORM_HEIGHT} viewBox={`0 0 ${WAVEFORM_WIDTH} ${WAVEFORM_HEIGHT}`} preserveAspectRatio="none">
              <defs>
                <clipPath id="played-clip"><rect x="0" y="0" width={`${progress * WAVEFORM_WIDTH}`} height={WAVEFORM_HEIGHT} /></clipPath>
                <clipPath id="unplayed-clip"><rect x={`${progress * WAVEFORM_WIDTH}`} y="0" width={`${(1 - progress) * WAVEFORM_WIDTH}`} height={WAVEFORM_HEIGHT} /></clipPath>
              </defs>
              <polyline points={waveformPoints} fill="none" stroke={tokens.colors.primaryScale[400]} strokeWidth="2" clipPath="url(#played-clip)" />
              <polyline points={waveformPoints} fill="none" stroke={tokens.colors.neutral[300]} strokeWidth="2" clipPath="url(#unplayed-clip)" />
              <line x1={progress * WAVEFORM_WIDTH} y1="0" x2={progress * WAVEFORM_WIDTH} y2={WAVEFORM_HEIGHT} stroke={tokens.colors.primaryScale[500]} strokeWidth="2" />
            </svg>
          </Box>
        </Box>

        {/* Main Content */}
        <Box style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {/* Transcript */}
          <div ref={transcriptRef} style={{
            flex: 1, overflowY: 'auto' as const,
            padding: `${tokens.spacing[4]}px ${tokens.spacing[5]}px`,
            display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[3],
          }}>
            {transcript.map(line => {
              const isActive = activeTranscriptLine === line.id;
              const isCandidate = line.speaker === 'candidate';
              return (
                <Box key={line.id} data-line-id={line.id} onClick={() => handleTranscriptLineClick(line)}
                  style={{
                    display: 'flex', flexDirection: isCandidate ? 'row' as const : 'row-reverse' as const,
                    gap: tokens.spacing[2], cursor: 'pointer', maxWidth: '85%',
                    alignSelf: isCandidate ? 'flex-start' : 'flex-end',
                    transition: `all ${tokens.motion.hover}`,
                  }}>
                  <Box style={{
                    width: 28, height: 28, borderRadius: tokens.borderRadius.full,
                    backgroundColor: isCandidate ? tokens.colors.primaryScale[100] : tokens.colors.neutral[100],
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0, marginTop: tokens.spacing[1],
                  }}>
                    {isCandidate ? <User size={14} color={tokens.colors.primaryScale[600]} /> : <Bot size={14} color={tokens.colors.neutral[600]} />}
                  </Box>
                  <Box style={{
                    padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, borderRadius: tokens.borderRadius.lg,
                    backgroundColor: isActive
                      ? (isCandidate ? tokens.colors.primaryScale[50] : tokens.colors.neutral[100])
                      : (isCandidate ? tokens.colors.common.white : tokens.colors.neutral[50]),
                    border: `1px solid ${isActive
                      ? (isCandidate ? tokens.colors.primaryScale[200] : tokens.colors.neutral[300])
                      : tokens.colors.neutral[100]}`,
                    boxShadow: isActive ? tokens.shadows.sm : 'none',
                    transition: `all ${tokens.motion.hover}`, flex: 1, minWidth: 0,
                  }}>
                    <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: tokens.spacing[1], gap: tokens.spacing[2] }}>
                      <Text style={{
                        fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold,
                        color: isCandidate ? tokens.colors.primaryScale[600] : tokens.colors.neutral[500],
                        textTransform: 'capitalize' as const,
                      }}>{line.speaker}</Text>
                      <Text style={{ fontSize: '10px', color: tokens.colors.neutral[400], fontVariantNumeric: 'tabular-nums' }}>{formatTime(line.timestamp)}</Text>
                    </Box>
                    <Box style={{
                      fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[800],
                      lineHeight: tokens.typography.lineHeight.relaxed, wordBreak: 'break-word' as const,
                    }}>
                      {renderTranscriptText(line)}
                    </Box>
                  </Box>
                </Box>
              );
            })}
          </div>

          {/* Scorecard Sidebar */}
          {showScorecard && (
            <Box style={{
              width: 280, flexShrink: 0,
              borderLeft: `1px solid ${tokens.colors.neutral[100]}`,
              backgroundColor: tokens.colors.common.white,
              display: 'flex', flexDirection: 'column' as const, overflowY: 'auto' as const,
            }}>
              <Box style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: `${tokens.spacing[3]}px`, borderBottom: `1px solid ${tokens.colors.neutral[100]}`,
              }}>
                <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                  <BarChart3 size={16} color={tokens.colors.primaryScale[500]} />
                  <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[800] }}>Scorecard</Text>
                </Box>
                <Box onClick={() => setShowScorecard(false)} style={{ cursor: 'pointer', display: 'flex', padding: tokens.spacing[1], borderRadius: tokens.borderRadius.sm, color: tokens.colors.neutral[400] }}>
                  <X size={14} />
                </Box>
              </Box>

              {/* Score Ring */}
              {(() => {
                const radius = (SCORE_RING_SIZE - SCORE_RING_STROKE) / 2;
                const circumference = 2 * Math.PI * radius;
                const dashOffset = circumference * (1 - scorecard.overallScore / 100);
                return (
                  <Box style={{ display: 'flex', flexDirection: 'column' as const, alignItems: 'center', padding: `${tokens.spacing[4]}px 0` }}>
                    <Box style={{ position: 'relative' as const, width: SCORE_RING_SIZE, height: SCORE_RING_SIZE }}>
                      <svg width={SCORE_RING_SIZE} height={SCORE_RING_SIZE} viewBox={`0 0 ${SCORE_RING_SIZE} ${SCORE_RING_SIZE}`}>
                        <circle cx={SCORE_RING_SIZE / 2} cy={SCORE_RING_SIZE / 2} r={radius} fill="none" stroke={tokens.colors.neutral[100]} strokeWidth={SCORE_RING_STROKE} />
                        <circle cx={SCORE_RING_SIZE / 2} cy={SCORE_RING_SIZE / 2} r={radius} fill="none" stroke={currentLevelColor.ring} strokeWidth={SCORE_RING_STROKE}
                          strokeDasharray={`${circumference}`} strokeDashoffset={dashOffset} strokeLinecap="round"
                          transform={`rotate(-90 ${SCORE_RING_SIZE / 2} ${SCORE_RING_SIZE / 2})`}
                          style={{ transition: `stroke-dashoffset ${tokens.motion.hover}` }} />
                      </svg>
                      <Box style={{ position: 'absolute' as const, inset: 0, display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'center' }}>
                        <Text style={{ fontSize: tokens.typography.fontSize['2xl'], fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], lineHeight: 1 }}>{scorecard.overallScore}</Text>
                      </Box>
                    </Box>
                    <Box style={{
                      marginTop: tokens.spacing[2], display: 'inline-flex', alignItems: 'center',
                      padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`, borderRadius: tokens.borderRadius.full,
                      fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold,
                      backgroundColor: currentLevelColor.bg, color: currentLevelColor.text,
                      border: `1px solid ${currentLevelColor.border}`, textTransform: 'capitalize' as const,
                    }}>
                      <Text style={{ fontSize: tokens.typography.fontSize.xs, color: currentLevelColor.text }}>{scorecard.overallLevel}</Text>
                    </Box>
                    <Text style={{ marginTop: tokens.spacing[1], fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>
                      Confidence: {Math.round(scorecard.confidence * 100)}%
                    </Text>
                  </Box>
                );
              })()}

              {/* Dimension Bars */}
              <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[3], padding: `0 ${tokens.spacing[3]}px ${tokens.spacing[3]}px` }}>
                {scorecard.dimensions.map(dim => {
                  const gradient = getDimensionScoreGradient(dim.score, tokens);
                  const isSel = selectedDimension === dim.id;
                  return (
                    <Box key={dim.id} onClick={() => setSelectedDimension(isSel ? null : dim.id)} style={{
                      padding: `${tokens.spacing[2]}px`, borderRadius: tokens.borderRadius.md,
                      backgroundColor: isSel ? tokens.colors.primaryScale[50] : 'transparent',
                      border: `1px solid ${isSel ? tokens.colors.primaryScale[200] : 'transparent'}`,
                      cursor: 'pointer', transition: `all ${tokens.motion.hover}`,
                    }}>
                      <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: tokens.spacing[1] }}>
                        <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1], flex: 1, minWidth: 0 }}>
                          <Text style={{
                            fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.medium,
                            color: tokens.colors.neutral[700], whiteSpace: 'nowrap' as const,
                            overflow: 'hidden' as const, textOverflow: 'ellipsis',
                          }}>{dim.name}</Text>
                          {dim.isKnockout && <Shield size={12} color={dim.knockoutTriggered ? tokens.colors.errorScale[500] : tokens.colors.neutral[400]} />}
                        </Box>
                        <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
                          <Box style={{
                            width: 8, height: 8, borderRadius: tokens.borderRadius.full,
                            backgroundColor: dim.confidence >= 0.8 ? tokens.colors.successScale[400] : dim.confidence >= 0.5 ? tokens.colors.warningScale[400] : tokens.colors.errorScale[400],
                          }} title={`Confidence: ${Math.round(dim.confidence * 100)}%`} />
                          <Text style={{ fontSize: '10px', color: tokens.colors.neutral[400], fontVariantNumeric: 'tabular-nums' }}>{dim.weight}w</Text>
                          <Text style={{
                            fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold,
                            color: getDimensionScoreColor(dim.score, tokens), minWidth: 24,
                            textAlign: 'right' as const, fontVariantNumeric: 'tabular-nums',
                          }}>{dim.score}</Text>
                        </Box>
                      </Box>
                      <Box style={{ height: 6, borderRadius: tokens.borderRadius.full, backgroundColor: tokens.colors.neutral[100], overflow: 'hidden', position: 'relative' as const }}>
                        <Box style={{
                          height: '100%', width: `${Math.min(100, dim.score)}%`, borderRadius: tokens.borderRadius.full,
                          background: `linear-gradient(90deg, ${gradient.start}, ${gradient.end})`,
                          transition: `width ${tokens.motion.hover}`,
                        }} />
                      </Box>
                      {dim.knockoutTriggered && (
                        <Box style={{
                          display: 'flex', alignItems: 'center', gap: tokens.spacing[1], marginTop: tokens.spacing[1],
                          padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`, borderRadius: tokens.borderRadius.sm,
                          backgroundColor: tokens.colors.errorScale[50], fontSize: '10px', color: tokens.colors.errorScale[700],
                        }}>
                          <AlertTriangle size={10} />
                          <Text style={{ fontSize: '10px', color: tokens.colors.errorScale[700] }}>Knockout triggered</Text>
                        </Box>
                      )}
                    </Box>
                  );
                })}
              </Box>
            </Box>
          )}

          {/* Notes Panel */}
          {showNotes && (
            <Box style={{
              width: 300, flexShrink: 0,
              borderLeft: `1px solid ${tokens.colors.neutral[100]}`,
              backgroundColor: tokens.colors.common.white,
              display: 'flex', flexDirection: 'column' as const,
            }}>
              <Box style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: `${tokens.spacing[3]}px`, borderBottom: `1px solid ${tokens.colors.neutral[100]}`,
              }}>
                <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                  <MessageSquare size={16} color={tokens.colors.primaryScale[500]} />
                  <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[800] }}>Notes ({notes.length})</Text>
                </Box>
                <Box onClick={() => setShowNotes(false)} style={{ cursor: 'pointer', display: 'flex', padding: tokens.spacing[1], borderRadius: tokens.borderRadius.sm, color: tokens.colors.neutral[400] }}>
                  <X size={14} />
                </Box>
              </Box>

              {onAddNote && (
                <Box style={{ padding: tokens.spacing[3], borderBottom: `1px solid ${tokens.colors.neutral[100]}` }}>
                  <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                    <Box style={{ flex: 1 }}>
                      <input type="text" value={noteInput} onChange={e => setNoteInput(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') handleAddNote(); }}
                        placeholder="Add a note..."
                        style={{
                          width: '100%', padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                          borderRadius: tokens.borderRadius.md, border: `1px solid ${tokens.colors.neutral[200]}`,
                          fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[800],
                          backgroundColor: tokens.colors.neutral[50], outline: 'none', boxSizing: 'border-box' as const,
                        }}
                        onFocus={e => { e.currentTarget.style.boxShadow = `0 0 0 2px ${tokens.colors.primaryScale[100]}`; e.currentTarget.style.borderColor = tokens.colors.primaryScale[400]; }}
                        onBlur={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = tokens.colors.neutral[200]; }}
                      />
                    </Box>
                    <Box onClick={handleAddNote} style={{
                      width: 32, height: 32, borderRadius: tokens.borderRadius.md,
                      backgroundColor: noteInput.trim() ? tokens.colors.primaryScale[500] : tokens.colors.neutral[200],
                      color: noteInput.trim() ? tokens.colors.common.white : tokens.colors.neutral[400],
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: noteInput.trim() ? 'pointer' : 'default', flexShrink: 0,
                      transition: `all ${tokens.motion.hover}`,
                    }}><Send size={14} /></Box>
                  </Box>
                  <Text style={{ fontSize: '10px', color: tokens.colors.neutral[400], marginTop: tokens.spacing[1], fontVariantNumeric: 'tabular-nums' }}>at {formatTime(currentTime)}</Text>
                </Box>
              )}

              <Box style={{ flex: 1, overflowY: 'auto' as const, padding: tokens.spacing[3], display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[3] }}>
                {notes.length === 0 ? (
                  <Text style={{ textAlign: 'center' as const, padding: `${tokens.spacing[6]}px ${tokens.spacing[4]}px`, color: tokens.colors.neutral[400], fontSize: tokens.typography.fontSize.sm }}>No notes yet</Text>
                ) : notes.map(note => (
                  <Box key={note.id} style={{
                    padding: tokens.spacing[3], borderRadius: tokens.borderRadius.md,
                    backgroundColor: tokens.colors.neutral[50], border: `1px solid ${tokens.colors.neutral[100]}`,
                  }}>
                    <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], marginBottom: tokens.spacing[2] }}>
                      <Box style={{
                        width: 24, height: 24, borderRadius: tokens.borderRadius.full,
                        backgroundColor: tokens.colors.primaryScale[100],
                        display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0,
                      }}>
                        {note.authorAvatar
                          ? <img src={note.authorAvatar} alt={note.authorName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          : <User size={12} color={tokens.colors.primaryScale[600]} />}
                      </Box>
                      <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[700], flex: 1 }}>{note.authorName}</Text>
                      <Text style={{ fontSize: '10px', color: tokens.colors.neutral[400], fontVariantNumeric: 'tabular-nums' }}>{formatTime(note.timestamp)}</Text>
                    </Box>
                    <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[800], lineHeight: tokens.typography.lineHeight.relaxed }}>{note.content}</Text>
                  </Box>
                ))}
              </Box>
            </Box>
          )}
        </Box>

        {/* AI Insights */}
        {insights.length > 0 && (
          <Box style={{
            padding: `${tokens.spacing[3]}px ${tokens.spacing[5]}px`,
            borderTop: `1px solid ${tokens.colors.neutral[100]}`,
            backgroundColor: tokens.colors.common.white,
          }}>
            <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], marginBottom: tokens.spacing[3] }}>
              <Zap size={16} color={tokens.colors.primaryScale[500]} />
              <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[800] }}>AI Insights</Text>
            </Box>
            <Box style={{ display: 'flex', gap: tokens.spacing[3], overflowX: 'auto' as const, paddingBottom: tokens.spacing[1] }}>
              {insights.map((insight, idx) => {
                const cat = insightColors[insight.category];
                return (
                  <Box key={idx} style={{
                    minWidth: 200, maxWidth: 260, padding: tokens.spacing[3],
                    borderRadius: tokens.borderRadius.lg, backgroundColor: cat.bg,
                    border: `1px solid ${cat.border}`, flexShrink: 0,
                  }}>
                    <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], marginBottom: tokens.spacing[2] }}>
                      <Box style={{ color: cat.icon }}>{insightIcons[insight.category]}</Box>
                      <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: cat.text, textTransform: 'capitalize' as const }}>{insight.category}</Text>
                    </Box>
                    <Text style={{ fontSize: tokens.typography.fontSize.sm, color: cat.text, lineHeight: tokens.typography.lineHeight.relaxed }}>{insight.text}</Text>
                  </Box>
                );
              })}
            </Box>
          </Box>
        )}

        {/* Actions Bar */}
        <Box style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: `${tokens.spacing[3]}px ${tokens.spacing[5]}px`,
          borderTop: `1px solid ${tokens.colors.neutral[100]}`,
          backgroundColor: tokens.colors.common.white,
        }}>
          <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
            {[{ key: 'scorecard', label: 'Scorecard', icon: <BarChart3 size={14} />, active: showScorecard, toggle: () => setShowScorecard(p => !p) },
              { key: 'notes', label: 'Notes', icon: <MessageSquare size={14} />, active: showNotes, toggle: () => setShowNotes(p => !p) },
            ].map(btn => (
              <Box key={btn.key} onClick={btn.toggle} style={{
                display: 'flex', alignItems: 'center', gap: tokens.spacing[1],
                padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, borderRadius: tokens.borderRadius.md,
                border: `1px solid ${btn.active ? tokens.colors.primaryScale[200] : tokens.colors.neutral[100]}`,
                backgroundColor: btn.active ? tokens.colors.primaryScale[50] : tokens.colors.common.white,
                color: btn.active ? tokens.colors.primaryScale[600] : tokens.colors.neutral[600],
                fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.medium,
                cursor: 'pointer', transition: `all ${tokens.motion.hover}`,
              }}>
                {btn.icon}
                <Text style={{ fontSize: tokens.typography.fontSize.xs, color: btn.active ? tokens.colors.primaryScale[600] : tokens.colors.neutral[600] }}>{btn.label}</Text>
              </Box>
            ))}
          </Box>

          <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
            {actionButtons.map(action => {
              if (!action.onClick) return null;
              const scale = (tokens.colors as any)[`${action.color}Scale`];
              const isHov = hoveredAction === action.key;
              return (
                <Box key={action.key} onClick={action.onClick}
                  onMouseEnter={() => setHoveredAction(action.key)} onMouseLeave={() => setHoveredAction(null)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: tokens.spacing[1],
                    padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, borderRadius: tokens.borderRadius.md,
                    border: `1px solid ${isHov ? scale[300] : scale[200]}`,
                    backgroundColor: isHov ? scale[100] : scale[50], color: scale[700],
                    fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.medium,
                    cursor: 'pointer', transition: `all ${tokens.motion.hover}`,
                  }}>
                  {action.icon}
                  <Text style={{ fontSize: tokens.typography.fontSize.xs, color: scale[700] }}>{action.label}</Text>
                </Box>
              );
            })}
          </Box>
        </Box>
      </Box>
    );
  },
});
