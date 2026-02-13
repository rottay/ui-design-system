'use client';

/**
 * BhInterviewPlayer - Full Preset
 * Slite-inspired complete interview replay with audio player,
 * chat-style transcript, scorecard sidebar, notes, AI insights, and actions.
 */

import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createBadgeStyle,
  createCardStyle,
  createCardHoverStyles,
  createEntranceAnimation,
  createStaggerDelay,
  createIconContainerStyle,
  createPersonalitySectionHeaderStyle,
  getPersonalityTypography,
  getPersonalityBadgeRadius,
  createPersonalityAccentBar,
} from '../../../helpers';
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
    const t = tokens;
    const isGlass = t.surface.useGlass;
    const bdr = `${t.surface.borderWidth} ${t.surface.borderStyle}`;

    const ptypo = useMemo(() => getPersonalityTypography(t), [t]);
    const badgeRadius = useMemo(() => getPersonalityBadgeRadius(t), [t]);
    const entrance = useMemo(() => createEntranceAnimation(t), [t]);
    const accentBar = useMemo(() => createPersonalityAccentBar(t), [t]);
    const sectionLabel = useMemo(() => createPersonalitySectionHeaderStyle(t), [t]);


    const glassCard = useMemo(() =>
      isGlass && t.glass ? { backdropFilter: t.glass.blur, WebkitBackdropFilter: t.glass.blur, backgroundColor: t.glass.bg, border: `${bdr} ${t.glass.border}` } : {},
      [isGlass, t, bdr]
    );

    const handleKeyNav = useCallback((e: React.KeyboardEvent, action: () => void) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); action(); }
    }, []);

    const animStyle = useCallback((index: number) => ({
      ...entrance.animate,
      transition: entrance.transition,
      transitionDelay: `${createStaggerDelay(t, index)}ms`,
    }), [entrance, t]);

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

    const levelColors = useMemo(() => getLevelColors(t), [t]);
    const insightColors = useMemo(() => getInsightCategoryColors(t), [t]);
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
      completed: { bg: t.colors.successScale[50], text: t.colors.successScale[700], border: t.colors.successScale[200] },
      in_progress: { bg: t.colors.infoScale[50], text: t.colors.infoScale[700], border: t.colors.infoScale[200] },
      pending: { bg: t.colors.warningScale[50], text: t.colors.warningScale[700], border: t.colors.warningScale[200] },
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
        const clr = getDimensionScoreColor(hl.scoreContribution, t);

        parts.push(
          <Box
            key={`ev-${i}`}
            style={{
              borderBottom: `2px solid ${clr}`,
              backgroundColor: isHl || isSel ? t.colors.primaryScale[50] : 'transparent',
              cursor: 'pointer', borderRadius: t.borderRadius.sm,
              padding: `0 ${t.spacing[0]}px`, transition: `all ${t.motion.hover}`,
              display: 'inline',
            }}
            onMouseEnter={() => setHighlightedEvidence(`${line.id}-${hl.dimensionId}`)}
            onMouseLeave={() => setHighlightedEvidence(null)}
            onClick={(e: React.MouseEvent) => { e.stopPropagation(); setSelectedDimension(hl.dimensionId); setShowScorecard(true); }}
          >
            {line.text.slice(hl.startIdx, hl.endIdx)}
            {(isHl || isSel) && (
              <Text style={{
                display: 'inline-flex', alignItems: 'center', marginLeft: t.spacing[1],
                padding: `0 ${t.spacing[1]}px`, borderRadius: t.borderRadius.sm,
                fontSize: '10px', fontWeight: t.typography.fontWeight.semibold,
                backgroundColor: clr, color: t.colors.common.white, lineHeight: '16px', verticalAlign: 'middle',
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
        backgroundColor: t.colors.neutral[50], overflow: 'hidden', ...style,
      }}>
        {/* Header */}
        <Box style={{
          display: 'flex', alignItems: 'center', gap: t.spacing[4],
          padding: `${t.spacing[4]}px ${t.spacing[5]}px`,
          borderBottom: `${bdr} ${t.colors.neutral[100]}`,
          backgroundColor: t.colors.common.white,
        }}>
          <Box style={{
            width: 48, height: 48, borderRadius: t.borderRadius.full,
            backgroundColor: t.colors.primaryScale[100],
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            overflow: 'hidden', flexShrink: 0, border: `${bdr} ${t.colors.primaryScale[200]}`,
            backgroundImage: interviewInfo.candidateAvatar ? `url(${interviewInfo.candidateAvatar})` : 'none',
            backgroundSize: 'cover', backgroundPosition: 'center',
          }}>
            {!interviewInfo.candidateAvatar && <User size={24} color={t.colors.primaryScale[600]} />}
          </Box>
          <Box style={{ flex: 1, minWidth: 0 }}>
            <Text style={{
              fontSize: t.typography.fontSize.lg, fontWeight: ptypo.headingWeight,
              color: t.colors.neutral[900], lineHeight: t.typography.lineHeight.tight,
              letterSpacing: ptypo.headingLetterSpacing,
              whiteSpace: 'nowrap' as const, overflow: 'hidden' as const, textOverflow: 'ellipsis',
            }}>{interviewInfo.candidateName}</Text>
            <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], marginTop: t.spacing[1], flexWrap: 'wrap' as const }}>
              <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[500] }}>{interviewInfo.jobTitle}</Text>
              <Text style={{ color: t.colors.neutral[300], fontSize: t.typography.fontSize.sm }}>|</Text>
              <Text style={{ ...createBadgeStyle(t, 'primary'), padding: `${t.spacing[0]}px ${t.spacing[2]}px`, fontSize: t.typography.fontSize.xs }}>{interviewInfo.stageName}</Text>
            </Box>
          </Box>
          <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1], fontSize: t.typography.fontSize.sm, color: t.colors.neutral[500] }}>
            <Clock size={14} color={t.colors.neutral[400]} />
            <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[500] }}>{interviewInfo.date}</Text>
          </Box>
          <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[500], paddingLeft: t.spacing[2] }}>{formatTime(interviewInfo.duration)}</Text>
          <Box style={{
            display: 'inline-flex', alignItems: 'center',
            padding: `${t.spacing[1]}px ${t.spacing[3]}px`, borderRadius: t.borderRadius.full,
            fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.medium,
            backgroundColor: statusStyle.bg, color: statusStyle.text,
            border: `${bdr} ${statusStyle.border}`, textTransform: 'capitalize' as const,
          }}>
            <Text style={{ fontSize: t.typography.fontSize.xs, color: statusStyle.text }}>{interviewInfo.status.replace(/_/g, ' ')}</Text>
          </Box>
        </Box>

        {/* Audio Player */}
        <Box style={{
          padding: `${t.spacing[3]}px ${t.spacing[5]}px`,
          backgroundColor: t.colors.common.white,
          borderBottom: `${bdr} ${t.colors.neutral[100]}`,
        }}>
          {audioUrl && <audio ref={audioRef} src={audioUrl} onTimeUpdate={handleAudioTimeUpdate} onEnded={handleAudioEnded} preload="metadata" />}
          <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[3], marginBottom: t.spacing[2] }}>
            {/* Play/Pause */}
            <Box
              role="button"
              tabIndex={0}
              aria-label={isPlaying ? 'Pause playback' : 'Play interview'}
              onClick={togglePlay}
              onKeyDown={(e: React.KeyboardEvent) => handleKeyNav(e, togglePlay)}
              style={{
                width: 40, height: 40, borderRadius: t.borderRadius.full,
                backgroundColor: t.colors.primaryScale[500], color: t.colors.common.white,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', flexShrink: 0, transition: `all ${t.motion.hover}`, outline: 'none',
              }}
            >
              {isPlaying ? <Pause size={18} /> : <Play size={18} style={{ marginLeft: 2 }} />}
            </Box>

            {/* Seek Bar */}
            <Box style={{ flex: 1, position: 'relative' as const }}>
              <svg ref={seekBarRef} width="100%" height="8" style={{ cursor: 'pointer', display: 'block' }} onMouseDown={handleSeekMouseDown}>
                <rect x="0" y="1" width="100%" height="6" rx="3" fill={t.colors.neutral[200]} />
                <rect x="0" y="1" width={`${positionPercent}%`} height="6" rx="3" fill={t.colors.primaryScale[500]} />
                <circle cx={`${positionPercent}%`} cy="4" r="6" fill={t.colors.common.white} stroke={t.colors.primaryScale[500]} strokeWidth="2" style={{ filter: `drop-shadow(${t.shadows.sm})` }} />
              </svg>
            </Box>

            {/* Time */}
            <Text style={{
              fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.medium,
              color: t.colors.neutral[600], fontVariantNumeric: 'tabular-nums',
              whiteSpace: 'nowrap' as const, minWidth: 80, textAlign: 'center' as const,
            }}>{formatTime(currentTime)} / {formatTime(audioDuration)}</Text>

            {/* Speed */}
            <Box style={{
              display: 'flex', alignItems: 'center', gap: t.spacing[1],
              borderRadius: t.borderRadius.md, backgroundColor: t.colors.neutral[100],
              padding: `${t.spacing[1]}px`,
            }}>
              {SPEED_OPTIONS.map(speed => (
                <Box key={speed}
                  role="button"
                  tabIndex={0}
                  aria-label={`Set playback speed to ${speed}x`}
                  aria-pressed={playbackSpeed === speed}
                  onClick={() => setPlaybackSpeed(speed)}
                  onKeyDown={(e: React.KeyboardEvent) => handleKeyNav(e, () => setPlaybackSpeed(speed))}
                  onMouseEnter={() => setHoveredSpeed(speed)} onMouseLeave={() => setHoveredSpeed(null)}
                  style={{
                    padding: `${t.spacing[1]}px ${t.spacing[2]}px`, borderRadius: t.borderRadius.sm,
                    fontSize: t.typography.fontSize.xs, cursor: 'pointer', transition: `all ${t.motion.hover}`, lineHeight: 1, outline: 'none',
                    fontWeight: playbackSpeed === speed ? t.typography.fontWeight.semibold : t.typography.fontWeight.normal,
                    backgroundColor: playbackSpeed === speed ? t.colors.primaryScale[500] : hoveredSpeed === speed ? t.colors.neutral[200] : 'transparent',
                    color: playbackSpeed === speed ? t.colors.common.white : t.colors.neutral[600],
                  }}>
                  <Text style={{
                    fontSize: t.typography.fontSize.xs,
                    color: playbackSpeed === speed ? t.colors.common.white : t.colors.neutral[600],
                  }}>{speed}x</Text>
                </Box>
              ))}
            </Box>

            {/* Volume */}
            <Box
              role="button"
              tabIndex={0}
              aria-label={isMuted ? 'Unmute audio' : 'Mute audio'}
              onClick={() => setIsMuted(p => !p)}
              onKeyDown={(e: React.KeyboardEvent) => handleKeyNav(e, () => setIsMuted(p => !p))}
              style={{
                cursor: 'pointer', display: 'flex', alignItems: 'center',
                padding: t.spacing[1], borderRadius: t.borderRadius.sm,
                color: isMuted ? t.colors.neutral[400] : t.colors.neutral[600], outline: 'none',
              }}
            >
              {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </Box>
          </Box>

          {/* Waveform */}
          <Box style={{
            position: 'relative' as const, height: WAVEFORM_HEIGHT,
            borderRadius: t.borderRadius.md, overflow: 'hidden',
            backgroundColor: t.colors.neutral[50], cursor: 'pointer',
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
              <polyline points={waveformPoints} fill="none" stroke={t.colors.primaryScale[400]} strokeWidth="2" clipPath="url(#played-clip)" />
              <polyline points={waveformPoints} fill="none" stroke={t.colors.neutral[300]} strokeWidth="2" clipPath="url(#unplayed-clip)" />
              <line x1={progress * WAVEFORM_WIDTH} y1="0" x2={progress * WAVEFORM_WIDTH} y2={WAVEFORM_HEIGHT} stroke={t.colors.primaryScale[500]} strokeWidth="2" />
            </svg>
          </Box>
        </Box>

        {/* Main Content */}
        <Box style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {/* Transcript */}
          <div ref={transcriptRef} style={{
            flex: 1, overflowY: 'auto' as const,
            padding: `${t.spacing[4]}px ${t.spacing[5]}px`,
            display: 'flex', flexDirection: 'column' as const, gap: t.spacing[3],
          }} role="region" aria-label="Interview transcript">
            {transcript.map(line => {
              const isActive = activeTranscriptLine === line.id;
              const isCandidate = line.speaker === 'candidate';
              return (
                <Box key={line.id} data-line-id={line.id} onClick={() => handleTranscriptLineClick(line)}
                  style={{
                    display: 'flex', flexDirection: isCandidate ? 'row' as const : 'row-reverse' as const,
                    gap: t.spacing[2], cursor: 'pointer', maxWidth: '85%',
                    alignSelf: isCandidate ? 'flex-start' : 'flex-end',
                    transition: `all ${t.motion.hover}`,
                  }}>
                  <Box style={{
                    width: 28, height: 28, borderRadius: t.borderRadius.full,
                    backgroundColor: isCandidate ? t.colors.primaryScale[100] : t.colors.neutral[100],
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0, marginTop: t.spacing[1],
                  }}>
                    {isCandidate ? <User size={14} color={t.colors.primaryScale[600]} /> : <Bot size={14} color={t.colors.neutral[600]} />}
                  </Box>
                  <Box style={{
                    padding: `${t.spacing[2]}px ${t.spacing[3]}px`, borderRadius: t.borderRadius.lg,
                    backgroundColor: isActive
                      ? (isCandidate ? t.colors.primaryScale[50] : t.colors.neutral[100])
                      : (isCandidate ? t.colors.common.white : t.colors.neutral[50]),
                    border: `${bdr} ${isActive
                      ? (isCandidate ? t.colors.primaryScale[200] : t.colors.neutral[300])
                      : t.colors.neutral[100]}`,
                    boxShadow: isActive ? t.shadows.sm : 'none',
                    transition: `all ${t.motion.hover}`, flex: 1, minWidth: 0,
                  }}>
                    <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: t.spacing[1], gap: t.spacing[2] }}>
                      <Text style={{
                        fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.semibold,
                        color: isCandidate ? t.colors.primaryScale[600] : t.colors.neutral[500],
                        textTransform: 'capitalize' as const,
                      }}>{line.speaker}</Text>
                      <Text style={{ fontSize: '10px', color: t.colors.neutral[400], fontVariantNumeric: 'tabular-nums' }}>{formatTime(line.timestamp)}</Text>
                    </Box>
                    <Box style={{
                      fontSize: t.typography.fontSize.sm, color: t.colors.neutral[800],
                      lineHeight: t.typography.lineHeight.relaxed, wordBreak: 'break-word' as const,
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
              borderLeft: `${bdr} ${t.colors.neutral[100]}`,
              backgroundColor: t.colors.common.white,
              display: 'flex', flexDirection: 'column' as const, overflowY: 'auto' as const,
            }}>
              <Box style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: `${t.spacing[3]}px`, borderBottom: `${bdr} ${t.colors.neutral[100]}`,
              }}>
                <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
                  <BarChart3 size={16} color={t.colors.primaryScale[500]} />
                  <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[800] }}>Scorecard</Text>
                </Box>
                <Box role="button" tabIndex={0} aria-label="Close scorecard panel" onClick={() => setShowScorecard(false)} onKeyDown={(e: React.KeyboardEvent) => handleKeyNav(e, () => setShowScorecard(false))} style={{ cursor: 'pointer', display: 'flex', padding: t.spacing[1], borderRadius: t.borderRadius.sm, color: t.colors.neutral[400], outline: 'none' }}>
                  <X size={14} />
                </Box>
              </Box>

              {/* Score Ring */}
              {(() => {
                const radius = (SCORE_RING_SIZE - SCORE_RING_STROKE) / 2;
                const circumference = 2 * Math.PI * radius;
                const dashOffset = circumference * (1 - scorecard.overallScore / 100);
                return (
                  <Box style={{ display: 'flex', flexDirection: 'column' as const, alignItems: 'center', padding: `${t.spacing[4]}px 0` }}>
                    <Box style={{ position: 'relative' as const, width: SCORE_RING_SIZE, height: SCORE_RING_SIZE }}>
                      <svg width={SCORE_RING_SIZE} height={SCORE_RING_SIZE} viewBox={`0 0 ${SCORE_RING_SIZE} ${SCORE_RING_SIZE}`}>
                        <circle cx={SCORE_RING_SIZE / 2} cy={SCORE_RING_SIZE / 2} r={radius} fill="none" stroke={t.colors.neutral[100]} strokeWidth={SCORE_RING_STROKE} />
                        <circle cx={SCORE_RING_SIZE / 2} cy={SCORE_RING_SIZE / 2} r={radius} fill="none" stroke={currentLevelColor.ring} strokeWidth={SCORE_RING_STROKE}
                          strokeDasharray={`${circumference}`} strokeDashoffset={dashOffset} strokeLinecap="round"
                          transform={`rotate(-90 ${SCORE_RING_SIZE / 2} ${SCORE_RING_SIZE / 2})`}
                          style={{ transition: `stroke-dashoffset ${t.motion.hover}` }} />
                      </svg>
                      <Box style={{ position: 'absolute' as const, inset: 0, display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'center' }}>
                        <Text style={{ fontSize: t.typography.fontSize['2xl'], fontWeight: t.typography.fontWeight.bold, color: t.colors.neutral[900], lineHeight: 1 }}>{scorecard.overallScore}</Text>
                      </Box>
                    </Box>
                    <Box style={{
                      marginTop: t.spacing[2], display: 'inline-flex', alignItems: 'center',
                      padding: `${t.spacing[1]}px ${t.spacing[3]}px`, borderRadius: t.borderRadius.full,
                      fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.semibold,
                      backgroundColor: currentLevelColor.bg, color: currentLevelColor.text,
                      border: `${bdr} ${currentLevelColor.border}`, textTransform: 'capitalize' as const,
                    }}>
                      <Text style={{ fontSize: t.typography.fontSize.xs, color: currentLevelColor.text }}>{scorecard.overallLevel}</Text>
                    </Box>
                    <Text style={{ marginTop: t.spacing[1], fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>
                      Confidence: {Math.round(scorecard.confidence * 100)}%
                    </Text>
                  </Box>
                );
              })()}

              {/* Dimension Bars */}
              <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[3], padding: `0 ${t.spacing[3]}px ${t.spacing[3]}px` }}>
                {scorecard.dimensions.map(dim => {
                  const gradient = getDimensionScoreGradient(dim.score, t);
                  const isSel = selectedDimension === dim.id;
                  return (
                    <Box key={dim.id} onClick={() => setSelectedDimension(isSel ? null : dim.id)} style={{
                      padding: `${t.spacing[2]}px`, borderRadius: t.borderRadius.md,
                      backgroundColor: isSel ? t.colors.primaryScale[50] : 'transparent',
                      border: `${bdr} ${isSel ? t.colors.primaryScale[200] : 'transparent'}`,
                      cursor: 'pointer', transition: `all ${t.motion.hover}`,
                    }}>
                      <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: t.spacing[1] }}>
                        <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1], flex: 1, minWidth: 0 }}>
                          <Text style={{
                            fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.medium,
                            color: t.colors.neutral[700], whiteSpace: 'nowrap' as const,
                            overflow: 'hidden' as const, textOverflow: 'ellipsis',
                          }}>{dim.name}</Text>
                          {dim.isKnockout && <Shield size={12} color={dim.knockoutTriggered ? t.colors.errorScale[500] : t.colors.neutral[400]} />}
                        </Box>
                        <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1] }}>
                          <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1],
                            width: 8, height: 8, borderRadius: t.borderRadius.full,
                            backgroundColor: dim.confidence >= 0.8 ? t.colors.successScale[400] : dim.confidence >= 0.5 ? t.colors.warningScale[400] : t.colors.errorScale[400],
                          }} title={`Confidence: ${Math.round(dim.confidence * 100)}%`} />
                          <Text style={{ fontSize: '10px', color: t.colors.neutral[400], fontVariantNumeric: 'tabular-nums' }}>{dim.weight}w</Text>
                          <Text style={{
                            fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.semibold,
                            color: getDimensionScoreColor(dim.score, t), minWidth: 24,
                            textAlign: 'right' as const, fontVariantNumeric: 'tabular-nums',
                          }}>{dim.score}</Text>
                        </Box>
                      </Box>
                      <Box style={{ height: 6, borderRadius: t.borderRadius.full, backgroundColor: t.colors.neutral[100], overflow: 'hidden', position: 'relative' as const }}>
                        <Box style={{
                          height: '100%', width: `${Math.min(100, dim.score)}%`, borderRadius: t.borderRadius.full,
                          background: `linear-gradient(90deg, ${gradient.start}, ${gradient.end})`,
                          transition: `width ${t.motion.hover}`,
                        }} />
                      </Box>
                      {dim.knockoutTriggered && (
                        <Box style={{
                          display: 'flex', alignItems: 'center', gap: t.spacing[1], marginTop: t.spacing[1],
                          padding: `${t.spacing[1]}px ${t.spacing[2]}px`, borderRadius: t.borderRadius.sm,
                          backgroundColor: t.colors.errorScale[50], fontSize: '10px', color: t.colors.errorScale[700],
                        }}>
                          <AlertTriangle size={10} />
                          <Text style={{ fontSize: '10px', color: t.colors.errorScale[700] }}>Knockout triggered</Text>
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
              borderLeft: `${bdr} ${t.colors.neutral[100]}`,
              backgroundColor: t.colors.common.white,
              display: 'flex', flexDirection: 'column' as const,
            }}>
              <Box style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: `${t.spacing[3]}px`, borderBottom: `${bdr} ${t.colors.neutral[100]}`,
              }}>
                <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
                  <MessageSquare size={16} color={t.colors.primaryScale[500]} />
                  <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[800] }}>Notes ({notes.length})</Text>
                </Box>
                <Box role="button" tabIndex={0} aria-label="Close notes panel" onClick={() => setShowNotes(false)} onKeyDown={(e: React.KeyboardEvent) => handleKeyNav(e, () => setShowNotes(false))} style={{ cursor: 'pointer', display: 'flex', padding: t.spacing[1], borderRadius: t.borderRadius.sm, color: t.colors.neutral[400], outline: 'none' }}>
                  <X size={14} />
                </Box>
              </Box>

              {onAddNote && (
                <Box style={{ padding: t.spacing[3], borderBottom: `${bdr} ${t.colors.neutral[100]}` }}>
                  <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
                    <Box style={{ flex: 1 }}>
                      <input
                        type="text"
                        value={noteInput}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNoteInput(e.target.value)}
                        onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => { if (e.key === 'Enter') handleAddNote(); }}
                        placeholder="Add a note..."
                        aria-label="Add a note"
                        style={{
                          width: '100%', padding: `${t.spacing[2]}px ${t.spacing[3]}px`,
                          borderRadius: t.borderRadius.md, border: `${bdr} ${t.colors.neutral[200]}`,
                          fontSize: t.typography.fontSize.sm, color: t.colors.neutral[800],
                          backgroundColor: t.colors.neutral[50], outline: 'none', boxSizing: 'border-box' as const,
                        }}
                        onFocus={(e: React.FocusEvent<HTMLInputElement>) => { e.currentTarget.style.boxShadow = `0 0 0 2px ${t.colors.primaryScale[100]}`; e.currentTarget.style.borderColor = t.colors.primaryScale[400]; }}
                        onBlur={(e: React.FocusEvent<HTMLInputElement>) => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = t.colors.neutral[200]; }}
                      />
                    </Box>
                    <Box
                      role="button"
                      tabIndex={0}
                      aria-label="Send note"
                      onClick={handleAddNote}
                      onKeyDown={(e: React.KeyboardEvent) => handleKeyNav(e, handleAddNote)}
                      style={{
                        width: 32, height: 32, borderRadius: t.borderRadius.md,
                        backgroundColor: noteInput.trim() ? t.colors.primaryScale[500] : t.colors.neutral[200],
                        color: noteInput.trim() ? t.colors.common.white : t.colors.neutral[400],
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: noteInput.trim() ? 'pointer' : 'default', flexShrink: 0,
                        transition: `all ${t.motion.hover}`, outline: 'none',
                      }}
                    ><Send size={14} /></Box>
                  </Box>
                  <Text style={{ fontSize: '10px', color: t.colors.neutral[400], marginTop: t.spacing[1], fontVariantNumeric: 'tabular-nums' }}>at {formatTime(currentTime)}</Text>
                </Box>
              )}

              <Box style={{ flex: 1, overflowY: 'auto' as const, padding: t.spacing[3], display: 'flex', flexDirection: 'column' as const, gap: t.spacing[3] }}>
                {notes.length === 0 ? (
                  <Text style={{ textAlign: 'center' as const, padding: `${t.spacing[6]}px ${t.spacing[4]}px`, color: t.colors.neutral[400], fontSize: t.typography.fontSize.sm }}>No notes yet</Text>
                ) : notes.map(note => (
                  <Box key={note.id} style={{
                    padding: t.spacing[3], borderRadius: t.borderRadius.md,
                    backgroundColor: t.colors.neutral[50], border: `${bdr} ${t.colors.neutral[100]}`,
                  }}>
                    <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], marginBottom: t.spacing[2] }}>
                      <Box style={{
                        width: 24, height: 24, borderRadius: t.borderRadius.full,
                        backgroundColor: t.colors.primaryScale[100],
                        display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0,
                        backgroundImage: note.authorAvatar ? `url(${note.authorAvatar})` : 'none',
                        backgroundSize: 'cover', backgroundPosition: 'center',
                      }}>
                        {!note.authorAvatar && <User size={12} color={t.colors.primaryScale[600]} />}
                      </Box>
                      <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.medium, color: t.colors.neutral[700], flex: 1 }}>{note.authorName}</Text>
                      <Text style={{ fontSize: '10px', color: t.colors.neutral[400], fontVariantNumeric: 'tabular-nums' }}>{formatTime(note.timestamp)}</Text>
                    </Box>
                    <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[800], lineHeight: t.typography.lineHeight.relaxed }}>{note.content}</Text>
                  </Box>
                ))}
              </Box>
            </Box>
          )}
        </Box>

        {/* AI Insights */}
        {insights.length > 0 && (
          <Box style={{
            padding: `${t.spacing[3]}px ${t.spacing[5]}px`,
            borderTop: `${bdr} ${t.colors.neutral[100]}`,
            backgroundColor: t.colors.common.white,
          }}>
            <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], marginBottom: t.spacing[3] }}>
              <Zap size={16} color={t.colors.primaryScale[500]} />
              <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[800] }}>AI Insights</Text>
            </Box>
            <Box style={{ display: 'flex', gap: t.spacing[3], overflowX: 'auto' as const, paddingBottom: t.spacing[1] }}>
              {insights.map((insight, idx) => {
                const cat = insightColors[insight.category];
                return (
                  <Box key={idx} style={{
                    minWidth: 200, maxWidth: 260, padding: t.spacing[3],
                    borderRadius: t.borderRadius.lg, backgroundColor: cat.bg,
                    border: `${bdr} ${cat.border}`, flexShrink: 0,
                  }}>
                    <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], marginBottom: t.spacing[2] }}>
                      <Box style={{ color: cat.icon }}>{insightIcons[insight.category]}</Box>
                      <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.semibold, color: cat.text, textTransform: 'capitalize' as const }}>{insight.category}</Text>
                    </Box>
                    <Text style={{ fontSize: t.typography.fontSize.sm, color: cat.text, lineHeight: t.typography.lineHeight.relaxed }}>{insight.text}</Text>
                  </Box>
                );
              })}
            </Box>
          </Box>
        )}

        {/* Actions Bar */}
        <Box style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: `${t.spacing[3]}px ${t.spacing[5]}px`,
          borderTop: `${bdr} ${t.colors.neutral[100]}`,
          backgroundColor: t.colors.common.white,
        }}>
          <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
            {[{ key: 'scorecard', label: 'Scorecard', icon: <BarChart3 size={14} />, active: showScorecard, toggle: () => setShowScorecard(p => !p) },
              { key: 'notes', label: 'Notes', icon: <MessageSquare size={14} />, active: showNotes, toggle: () => setShowNotes(p => !p) },
            ].map(btn => (
              <Box key={btn.key}
                role="button"
                tabIndex={0}
                aria-label={`Toggle ${btn.label} panel`}
                aria-pressed={btn.active}
                onClick={btn.toggle}
                onKeyDown={(e: React.KeyboardEvent) => handleKeyNav(e, btn.toggle)}
                style={{
                  display: 'flex', alignItems: 'center', gap: t.spacing[1],
                  padding: `${t.spacing[2]}px ${t.spacing[3]}px`, borderRadius: t.borderRadius.md,
                  border: `${bdr} ${btn.active ? t.colors.primaryScale[200] : t.colors.neutral[100]}`,
                  backgroundColor: btn.active ? t.colors.primaryScale[50] : t.colors.common.white,
                  color: btn.active ? t.colors.primaryScale[600] : t.colors.neutral[600],
                  fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.medium,
                  cursor: 'pointer', transition: `all ${t.motion.hover}`, outline: 'none',
                }}
              >
                {btn.icon}
                <Text style={{ fontSize: t.typography.fontSize.xs, color: btn.active ? t.colors.primaryScale[600] : t.colors.neutral[600] }}>{btn.label}</Text>
              </Box>
            ))}
          </Box>

          <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
            {actionButtons.map(action => {
              if (!action.onClick) return null;
              const scale = (t.colors as any)[`${action.color}Scale`];
              const isHov = hoveredAction === action.key;
              return (
                <Box key={action.key}
                  role="button"
                  tabIndex={0}
                  aria-label={action.label}
                  onClick={action.onClick}
                  onKeyDown={(e: React.KeyboardEvent) => handleKeyNav(e, action.onClick!)}
                  onMouseEnter={() => setHoveredAction(action.key)} onMouseLeave={() => setHoveredAction(null)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: t.spacing[1],
                    padding: `${t.spacing[2]}px ${t.spacing[3]}px`, borderRadius: t.borderRadius.md,
                    border: `${bdr} ${isHov ? scale[300] : scale[200]}`,
                    backgroundColor: isHov ? scale[100] : scale[50], color: scale[700],
                    fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.medium,
                    cursor: 'pointer', transition: `all ${t.motion.hover}`, outline: 'none',
                  }}
                >
                  {action.icon}
                  <Text style={{ fontSize: t.typography.fontSize.xs, color: scale[700] }}>{action.label}</Text>
                </Box>
              );
            })}
          </Box>
        </Box>
      </Box>
    );
  },
});
