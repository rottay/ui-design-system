'use client';

/**
 * BhInterviewCopilot - Sidebar Preset
 * Live coaching sidebar displayed during active interviews.
 * Shows real-time AI whispers, talk time gauge, dimension coverage,
 * and quick action controls.
 *
 * Personality-driven typography, glass-aware surfaces, entrance animations,
 * and full ARIA accessibility on all interactive elements.
 */

import { useState, useMemo, useCallback, useRef } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import type {
  BhInterviewCopilotProps,
  Whisper,
  WhisperType,
  CopilotSessionStatus,
  DimensionCoverage,
} from '../../core';
import {
  getWhisperTypeColors,
  getPriorityColors,
  getWhisperTypeLabel,
  WHISPER_TYPES,
  n,
} from '../../core';
import {
  createCardStyle,
  createSurfaceStyle,
  createBadgeStyle,
  createCardHoverStyles,
  createEntranceAnimation,
  createIconContainerStyle,
  createPersonalitySectionHeaderStyle,
  createEmptyStateStyle,
  createFilterPillStyle,
  createProgressBarStyle,
  createPersonalityAccentBar,
  createPersonalitySkeletonStyle,
  createDividerStyle,
  getPersonalityTypography,
  getPersonalityBadgeRadius,
  getAccentAwareLayout,
  getPulseSpeed,
  formatDistanceToNow,
  clickableProps,
  ICON_SIZES,
} from '../../../helpers';
import {
  MessageSquare,
  Check,
  Pin,
  PauseCircle,
  PlayCircle,
  Sparkles,
  Clock,
  Users,
  Mic,
  Volume2,
  VolumeX,
  Activity,
  Target,
  AlertTriangle,
  Shield,
  ArrowRight,
  HelpCircle,
  Heart,
  BarChart3,
  Settings,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Helpers                                                             */
/* ------------------------------------------------------------------ */

function getWhisperIcon(type: WhisperType) {
  const iconMap: Record<WhisperType, typeof MessageSquare> = {
    question_suggestion: HelpCircle,
    behavioral_cue: Activity,
    follow_up: ArrowRight,
    pacing_alert: Clock,
    bias_warning: Shield,
    dimension_coverage: Target,
    encouragement: Heart,
  };
  return iconMap[type] ?? MessageSquare;
}

function formatTimestamp(ts: Date | string): string {
  const date = typeof ts === 'string' ? new Date(ts) : ts;
  if (isNaN(date.getTime())) return '--';
  return formatDistanceToNow(date, { addSuffix: true });
}

function formatElapsedTime(startedAt: Date | string): string {
  const start = typeof startedAt === 'string' ? new Date(startedAt) : startedAt;
  if (isNaN(start.getTime())) return '00:00';
  const elapsed = Math.floor((Date.now() - start.getTime()) / 1000);
  const minutes = Math.floor(elapsed / 60);
  const seconds = elapsed % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

/* ------------------------------------------------------------------ */
/*  Preset                                                              */
/* ------------------------------------------------------------------ */

export const SidebarBhInterviewCopilot = createPreset<BhInterviewCopilotProps>({
  name: 'BhInterviewCopilot.Sidebar',
  render: (ctx: PresetContext<BhInterviewCopilotProps>) => {
    const { primitives: { Box, Text }, props, tokens: t } = ctx;
    const isGlass = t.surface.useGlass;

    const {
      session,
      dimensionCoverage: rawDimensionCoverage = [],
      onAcknowledgeWhisper,
      onPinWhisper,
      onTogglePause,
      onAdjustSensitivity,
      interviewTitle,
      candidateName,
      loading,
      className,
      style,
    } = props;

    /* -- State -------------------------------------------------------- */
    const [sensitivity, setSensitivity] = useState<'low' | 'medium' | 'high'>('medium');
    const [whisperFilter, setWhisperFilter] = useState<WhisperType | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    /* -- Computed values ---------------------------------------------- */
    const whispers = useMemo(() => {
      const items = session?.whispers ?? [];
      const filtered = whisperFilter
        ? items.filter(w => w.type === whisperFilter)
        : items;
      return [...filtered].sort((a, b) => {
        const ta = typeof a.timestamp === 'string' ? new Date(a.timestamp).getTime() : a.timestamp.getTime();
        const tb = typeof b.timestamp === 'string' ? new Date(b.timestamp).getTime() : b.timestamp.getTime();
        return tb - ta;
      });
    }, [session?.whispers, whisperFilter]);

    const talkTime = session?.talkTimeData ?? {
      interviewerPercent: 0,
      candidatePercent: 0,
      silencePercent: 100,
      idealRange: { min: 20, max: 40 },
    };

    const dimensionCoverage = Array.isArray(rawDimensionCoverage) ? rawDimensionCoverage : [];
    const sessionStatus: CopilotSessionStatus = session?.status ?? 'active';
    const isActive = sessionStatus === 'active';
    const isPaused = sessionStatus === 'paused';

    /* -- Token-based styles ------------------------------------------- */
    const personalityTypo = useMemo(() => getPersonalityTypography(t), [t]);
    const badgeRadius = useMemo(() => getPersonalityBadgeRadius(t), [t]);
    const cardHover = useMemo(() => createCardHoverStyles(t), [t]);
    const accentBar = useMemo(() => createPersonalityAccentBar(t), [t]);
    const accentLayout = useMemo(() => getAccentAwareLayout(t), [t]);
    const entranceAnim = useMemo(() => createEntranceAnimation(t), [t]);
    const sectionHeader = useMemo(() => createPersonalitySectionHeaderStyle(t), [t]);
    const emptyStyle = useMemo(() => createEmptyStateStyle(t), [t]);
    const dividerStyle = useMemo(() => createDividerStyle(t), [t]);
    const skeletonStyle = useMemo(() => createPersonalitySkeletonStyle(t), [t]);
    const whisperColors = useMemo(() => getWhisperTypeColors(t), [t]);
    const priorityColors = useMemo(() => getPriorityColors(t), [t]);
    const pulseSpeed = useMemo(() => getPulseSpeed(t), [t]);

    /* -- Callbacks ---------------------------------------------------- */
    const handleAcknowledge = useCallback((whisperId: string, e: React.MouseEvent) => {
      e.stopPropagation();
      onAcknowledgeWhisper?.(whisperId);
    }, [onAcknowledgeWhisper]);

    const handlePin = useCallback((whisperId: string, pinned: boolean, e: React.MouseEvent) => {
      e.stopPropagation();
      onPinWhisper?.(whisperId, pinned);
    }, [onPinWhisper]);

    const handleSensitivity = useCallback((level: 'low' | 'medium' | 'high') => {
      setSensitivity(level);
      onAdjustSensitivity?.(level);
    }, [onAdjustSensitivity]);

    /* -- Loading state ------------------------------------------------ */
    if (loading) {
      return (
        <Box className={className} style={{
          display: 'flex', flexDirection: 'column' as const, gap: t.spacing[4],
          padding: `${t.spacing[6]}px`,
          ...createCardStyle(t, { elevation: 'sm', glass: isGlass }),
          ...style,
        }} role="status" aria-label="Loading copilot">
          {[1, 2, 3, 4, 5].map(i => (
            <Box key={i} style={{ ...skeletonStyle, height: i === 1 ? 48 : i === 2 ? 80 : 64, width: '100%' }} />
          ))}
        </Box>
      );
    }

    /* -- Render ------------------------------------------------------- */
    return (
      <div
        ref={scrollRef}
        className={className}
        role="complementary"
        aria-label={interviewTitle ? `AI Copilot: ${interviewTitle}` : 'AI Copilot'}
        style={{
          ...createCardStyle(t, { elevation: 'md', padding: 0, glass: isGlass }),
          borderRadius: t.borderRadius.lg,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column' as const,
          height: '100%',
          ...entranceAnim.animate,
          transition: entranceAnim.transition,
          ...accentLayout.outer,
          ...style,
        }}
      >
        {/* Accent bar */}
        {accentBar && <Box style={accentBar} />}
        <Box style={{ ...accentLayout.inner, display: 'flex', flexDirection: 'column' as const, height: '100%' }}>

        {/* ============================================================ */}
        {/* HEADER                                                        */}
        {/* ============================================================ */}
        <Box style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: `${t.spacing[4]}px ${t.spacing[5]}px`,
          borderBottom: `1px solid ${t.colors.neutral[100]}`,
        }}>
          <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[3] }}>
            <Box style={{
              ...createIconContainerStyle(t, { size: 36 }),
            }}>
              <Sparkles size={ICON_SIZES.feature} color={t.colors.primaryScale[500]} aria-hidden="true" />
            </Box>
            <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1] }}>
              <Text style={{
                fontSize: t.typography.fontSize.md,
                fontWeight: personalityTypo.headingWeight,
                letterSpacing: personalityTypo.headingLetterSpacing,
                color: t.colors.neutral[900],
              }}>
                AI Copilot
              </Text>
              {interviewTitle && (
                <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>
                  {interviewTitle}
                </Text>
              )}
            </Box>
          </Box>

          <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
            {/* Session status badge */}
            <Box style={{
              ...createBadgeStyle(t, isActive ? 'success' : isPaused ? 'warning' : 'secondary'),
              borderRadius: badgeRadius,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
            }}>
              {isActive && (
                <Box style={{
                  width: 6, height: 6, borderRadius: t.borderRadius.full,
                  backgroundColor: t.colors.successScale[500],
                  animation: pulseSpeed !== 'paused' ? `pulse ${pulseSpeed} ease-in-out infinite` : 'none',
                }} aria-hidden="true" />
              )}
              <Text style={{ fontSize: t.typography.fontSize.xs }}>
                {isActive ? 'Live' : isPaused ? 'Paused' : 'Ended'}
              </Text>
            </Box>

            {/* Timer */}
            {session?.startedAt && (
              <Text style={{
                fontSize: t.typography.fontSize.xs,
                color: t.colors.neutral[500],
                fontFamily: 'monospace',
              }}>
                {formatElapsedTime(session.startedAt)}
              </Text>
            )}
          </Box>
        </Box>

        {/* ============================================================ */}
        {/* TALK TIME GAUGE                                               */}
        {/* ============================================================ */}
        <Box
          aria-label="Talk time breakdown"
          style={{
            padding: `${t.spacing[4]}px ${t.spacing[5]}px`,
            borderBottom: `1px solid ${t.colors.neutral[100]}`,
          }}
        >
          <Text style={sectionHeader}>Talk Time</Text>

          {/* Stacked horizontal bar */}
          <Box style={{
            display: 'flex', height: 24, borderRadius: t.borderRadius.md,
            overflow: 'hidden', backgroundColor: t.colors.neutral[100],
            marginBottom: t.spacing[2],
          }}>
            {/* Interviewer */}
            <Box style={{
              width: `${n(talkTime.interviewerPercent)}%`,
              backgroundColor: t.colors.primaryScale[400],
              transition: `width ${t.motion.hover}`,
              minWidth: talkTime.interviewerPercent > 0 ? 2 : 0,
            }} aria-label={`Interviewer: ${n(talkTime.interviewerPercent)}%`} />
            {/* Candidate */}
            <Box style={{
              width: `${n(talkTime.candidatePercent)}%`,
              backgroundColor: t.colors.successScale[400],
              transition: `width ${t.motion.hover}`,
              minWidth: talkTime.candidatePercent > 0 ? 2 : 0,
            }} aria-label={`Candidate: ${n(talkTime.candidatePercent)}%`} />
            {/* Silence */}
            <Box style={{
              width: `${n(talkTime.silencePercent)}%`,
              backgroundColor: t.colors.neutral[200],
              transition: `width ${t.motion.hover}`,
              minWidth: talkTime.silencePercent > 0 ? 2 : 0,
            }} aria-label={`Silence: ${n(talkTime.silencePercent)}%`} />
          </Box>

          {/* Ideal zone indicator */}
          <Box style={{
            position: 'relative' as const,
            height: 4,
            borderRadius: t.borderRadius.full,
            backgroundColor: t.colors.neutral[100],
            marginBottom: t.spacing[3],
          }}>
            <Box style={{
              position: 'absolute' as const,
              left: `${talkTime.idealRange.min}%`,
              width: `${talkTime.idealRange.max - talkTime.idealRange.min}%`,
              height: '100%',
              backgroundColor: t.colors.successScale[200],
              borderRadius: t.borderRadius.full,
            }} />
            {/* Interviewer position marker */}
            <Box style={{
              position: 'absolute' as const,
              left: `${Math.min(100, Math.max(0, n(talkTime.interviewerPercent)))}%`,
              top: -3,
              width: 10, height: 10,
              borderRadius: t.borderRadius.full,
              backgroundColor: talkTime.interviewerPercent >= talkTime.idealRange.min && talkTime.interviewerPercent <= talkTime.idealRange.max
                ? t.colors.successScale[500]
                : t.colors.warningScale[500],
              border: `2px solid ${t.colors.common.white}`,
              transform: 'translateX(-50%)',
              transition: `left ${t.motion.hover}`,
            }} aria-hidden="true" />
          </Box>

          {/* Legend */}
          <Box style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' as const, gap: t.spacing[2] }}>
            <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1] }}>
              <Box style={{ width: 8, height: 8, borderRadius: t.borderRadius.full, backgroundColor: t.colors.primaryScale[400] }} aria-hidden="true" />
              <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[600] }}>
                You {n(talkTime.interviewerPercent)}%
              </Text>
            </Box>
            <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1] }}>
              <Box style={{ width: 8, height: 8, borderRadius: t.borderRadius.full, backgroundColor: t.colors.successScale[400] }} aria-hidden="true" />
              <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[600] }}>
                Candidate {n(talkTime.candidatePercent)}%
              </Text>
            </Box>
            <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1] }}>
              <Box style={{ width: 8, height: 8, borderRadius: t.borderRadius.full, backgroundColor: t.colors.neutral[200] }} aria-hidden="true" />
              <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[600] }}>
                Silence {n(talkTime.silencePercent)}%
              </Text>
            </Box>
          </Box>
        </Box>

        {/* ============================================================ */}
        {/* WHISPER FEED                                                  */}
        {/* ============================================================ */}
        <Box style={{
          flex: 1, overflowY: 'auto' as const,
          padding: `${t.spacing[4]}px ${t.spacing[5]}px`,
        }}>
          <Box style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginBottom: t.spacing[3],
          }}>
            <Text style={sectionHeader}>Whispers ({whispers.length})</Text>

            {/* Type filter pills */}
            <Box style={{ display: 'flex', gap: t.spacing[1], flexWrap: 'wrap' as const }}>
              <Box
                {...clickableProps(() => setWhisperFilter(null), 'Show all whispers')}
                onClick={() => setWhisperFilter(null)}
                style={createFilterPillStyle(t, { active: whisperFilter === null })}
              >
                <Text style={{ fontSize: t.typography.fontSize.xs }}>All</Text>
              </Box>
            </Box>
          </Box>

          {/* Whisper list */}
          <Box role="list" aria-label="Coaching whispers" style={{
            display: 'flex', flexDirection: 'column' as const, gap: t.spacing[3],
          }}>
            {whispers.map((whisper, idx) => {
              const wColors = whisperColors[whisper.type];
              const pColor = priorityColors[whisper.priority];
              const WhisperIcon = getWhisperIcon(whisper.type);
              const whisperEntrance = createEntranceAnimation(t, { index: idx });

              return (
                <Box
                  key={whisper.id}
                  role="listitem"
                  aria-label={`${getWhisperTypeLabel(whisper.type)}: ${whisper.content.slice(0, 80)}`}
                  style={{
                    padding: `${t.spacing[3]}px ${t.spacing[4]}px`,
                    borderRadius: t.borderRadius.lg,
                    backgroundColor: whisper.acknowledged ? t.colors.neutral[50] : wColors.bg,
                    borderLeft: `3px solid ${pColor}`,
                    border: `1px solid ${whisper.acknowledged ? t.colors.neutral[200] : wColors.border}`,
                    borderLeftWidth: 3,
                    borderLeftColor: pColor,
                    transition: `all ${t.motion.hover}`,
                    opacity: whisper.acknowledged ? 0.7 : 1,
                    ...whisperEntrance.animate,
                  }}
                >
                  {/* Top row: type badge + timestamp */}
                  <Box style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    marginBottom: t.spacing[2],
                  }}>
                    <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
                      <WhisperIcon size={ICON_SIZES.label} color={wColors.icon} aria-hidden="true" />
                      <Text style={{
                        fontSize: t.typography.fontSize.xs,
                        fontWeight: t.typography.fontWeight.semibold,
                        color: wColors.text,
                      }}>
                        {getWhisperTypeLabel(whisper.type)}
                      </Text>
                      {whisper.dimension && (
                        <Box style={{
                          ...createBadgeStyle(t, 'secondary'),
                          borderRadius: badgeRadius,
                          padding: `0px ${t.spacing[1]}px`,
                        }}>
                          <Text style={{ fontSize: '10px' }}>{whisper.dimension}</Text>
                        </Box>
                      )}
                    </Box>
                    <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>
                      {formatTimestamp(whisper.timestamp)}
                    </Text>
                  </Box>

                  {/* Content */}
                  <Text style={{
                    fontSize: t.typography.fontSize.sm,
                    color: whisper.acknowledged ? t.colors.neutral[500] : t.colors.neutral[800],
                    lineHeight: t.typography.lineHeight.relaxed,
                    marginBottom: t.spacing[2],
                  }}>
                    {whisper.content}
                  </Text>

                  {/* Action buttons */}
                  <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
                    {/* Acknowledge button */}
                    {!whisper.acknowledged && onAcknowledgeWhisper && (
                      <Box
                        role="button"
                        tabIndex={0}
                        aria-label="Acknowledge whisper"
                        onClick={(e: React.MouseEvent) => handleAcknowledge(whisper.id, e)}
                        onKeyDown={(e: React.KeyboardEvent) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            e.stopPropagation();
                            onAcknowledgeWhisper(whisper.id);
                          }
                        }}
                        style={{
                          ...createBadgeStyle(t, 'success'),
                          borderRadius: badgeRadius,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          transition: `all ${t.motion.hover}`,
                        }}
                      >
                        <Check size={ICON_SIZES.inline} aria-hidden="true" />
                        <Text style={{ fontSize: t.typography.fontSize.xs }}>Got it</Text>
                      </Box>
                    )}

                    {whisper.acknowledged && (
                      <Box style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <Check size={ICON_SIZES.inline} color={t.colors.successScale[500]} aria-hidden="true" />
                        <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.successScale[600] }}>
                          Acknowledged
                        </Text>
                      </Box>
                    )}

                    {/* Pin button */}
                    {onPinWhisper && (
                      <Box
                        role="button"
                        tabIndex={0}
                        aria-label={whisper.pinned ? 'Unpin whisper' : 'Pin whisper'}
                        aria-pressed={whisper.pinned}
                        onClick={(e: React.MouseEvent) => handlePin(whisper.id, !whisper.pinned, e)}
                        onKeyDown={(e: React.KeyboardEvent) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            e.stopPropagation();
                            onPinWhisper(whisper.id, !whisper.pinned);
                          }
                        }}
                        style={{
                          ...createBadgeStyle(t, whisper.pinned ? 'primary' : 'secondary'),
                          borderRadius: badgeRadius,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          transition: `all ${t.motion.hover}`,
                        }}
                      >
                        <Pin size={ICON_SIZES.inline} aria-hidden="true" />
                        <Text style={{ fontSize: t.typography.fontSize.xs }}>
                          {whisper.pinned ? 'Pinned' : 'Pin'}
                        </Text>
                      </Box>
                    )}

                    {/* Confidence indicator */}
                    {whisper.confidence !== undefined && (
                      <Text style={{
                        fontSize: t.typography.fontSize.xs,
                        color: t.colors.neutral[400],
                        marginLeft: 'auto',
                      }}>
                        {Math.round(n(whisper.confidence) * 100)}% conf.
                      </Text>
                    )}
                  </Box>
                </Box>
              );
            })}

            {/* Empty state */}
            {whispers.length === 0 && (
              <Box style={emptyStyle}>
                <Box style={createIconContainerStyle(t, { size: 48 })}>
                  <Sparkles size={24} color={t.colors.neutral[300]} aria-hidden="true" />
                </Box>
                <Text style={{
                  fontSize: t.typography.fontSize.sm,
                  color: t.colors.neutral[400],
                  marginTop: t.spacing[2],
                }}>
                  {isActive ? 'Listening... Whispers will appear as the interview progresses' : 'No whispers in this session'}
                </Text>
              </Box>
            )}
          </Box>
        </Box>

        {/* ============================================================ */}
        {/* DIMENSION COVERAGE                                            */}
        {/* ============================================================ */}
        {dimensionCoverage.length > 0 && (
          <Box style={{
            padding: `${t.spacing[4]}px ${t.spacing[5]}px`,
            borderTop: `1px solid ${t.colors.neutral[100]}`,
          }}>
            <Text style={sectionHeader}>Dimension Coverage</Text>
            <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[2] }}>
              {dimensionCoverage.map((dim, idx) => {
                const progressStyles = createProgressBarStyle(t, {
                  color: dim.coveragePercent >= 70
                    ? t.colors.successScale[500]
                    : dim.coveragePercent >= 40
                      ? t.colors.warningScale[500]
                      : t.colors.errorScale[400],
                  percent: dim.coveragePercent,
                });
                const dimEntrance = createEntranceAnimation(t, { index: idx });

                return (
                  <Box key={dim.dimensionCode} style={{ ...dimEntrance.animate }}>
                    <Box style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      marginBottom: t.spacing[1],
                    }}>
                      <Text style={{
                        fontSize: t.typography.fontSize.xs,
                        color: t.colors.neutral[700],
                        fontWeight: t.typography.fontWeight.medium,
                      }}>
                        {dim.dimension}
                      </Text>
                      <Text style={{
                        fontSize: t.typography.fontSize.xs,
                        color: t.colors.neutral[500],
                      }}>
                        {Math.round(n(dim.coveragePercent))}%
                      </Text>
                    </Box>
                    <Box style={progressStyles.track}>
                      <Box style={progressStyles.fill} />
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </Box>
        )}

        {/* ============================================================ */}
        {/* QUICK ACTIONS                                                 */}
        {/* ============================================================ */}
        <Box style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: `${t.spacing[3]}px ${t.spacing[5]}px`,
          borderTop: `1px solid ${t.colors.neutral[100]}`,
          backgroundColor: isGlass ? undefined : t.colors.neutral[50],
          ...createSurfaceStyle(t, { elevation: 'sm', glass: isGlass }),
          borderRadius: 0,
          border: 'none',
        }}>
          {/* Pause/Resume */}
          {onTogglePause && (isActive || isPaused) && (
            <Box
              role="button"
              tabIndex={0}
              aria-label={isPaused ? 'Resume copilot' : 'Pause copilot'}
              onClick={() => onTogglePause()}
              onKeyDown={(e: React.KeyboardEvent) => {
                if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onTogglePause(); }
              }}
              style={{
                ...createBadgeStyle(t, isPaused ? 'success' : 'warning'),
                borderRadius: badgeRadius,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              {isPaused ? (
                <PlayCircle size={ICON_SIZES.label} aria-hidden="true" />
              ) : (
                <PauseCircle size={ICON_SIZES.label} aria-hidden="true" />
              )}
              <Text style={{ fontSize: t.typography.fontSize.xs }}>
                {isPaused ? 'Resume' : 'Pause'}
              </Text>
            </Box>
          )}

          {/* Sensitivity adjuster */}
          {onAdjustSensitivity && (
            <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1] }}>
              <Settings size={ICON_SIZES.label} color={t.colors.neutral[400]} aria-hidden="true" />
              {(['low', 'medium', 'high'] as const).map(level => (
                <Box
                  key={level}
                  role="button"
                  tabIndex={0}
                  aria-label={`Set sensitivity to ${level}`}
                  aria-pressed={sensitivity === level}
                  onClick={() => handleSensitivity(level)}
                  onKeyDown={(e: React.KeyboardEvent) => {
                    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleSensitivity(level); }
                  }}
                  style={createFilterPillStyle(t, { active: sensitivity === level })}
                >
                  <Text style={{ fontSize: t.typography.fontSize.xs, textTransform: 'capitalize' as const }}>
                    {level}
                  </Text>
                </Box>
              ))}
            </Box>
          )}
        </Box>

        </Box>
      </div>
    );
  },
});
