'use client';

/**
 * BhInterviewCopilot - Review Preset
 * Post-interview review showing copilot effectiveness, talk time analysis,
 * dimension coverage, whisper breakdown, and AI-generated recommendations.
 *
 * Personality-driven typography, glass-aware surfaces, entrance animations,
 * and full ARIA accessibility on all interactive elements.
 */

import { useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import type {
  BhInterviewCopilotProps,
  WhisperType,
  DimensionCoverage,
} from '../../core';
import {
  getWhisperTypeColors,
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
  createProgressBarStyle,
  createPersonalityAccentBar,
  createPersonalitySkeletonStyle,
  createDividerStyle,
  createMetadataGridStyle,
  createMetadataFieldStyle,
  createMetadataLabelStyle,
  createMetadataValueStyle,
  createStatValueStyle,
  createStatLabelStyle,
  getPersonalityTypography,
  getPersonalityBadgeRadius,
  getAccentAwareLayout,
  formatDate,
  formatPercent,
  ICON_SIZES,
} from '../../../helpers';
import {
  Sparkles,
  Clock,
  BarChart3,
  Target,
  Award,
  MessageSquare,
  Pin,
  Check,
  TrendingUp,
  AlertTriangle,
  Users,
  Lightbulb,
  Star,
  Activity,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Helpers                                                             */
/* ------------------------------------------------------------------ */

function getEffectivenessLevel(score: number): {
  label: string;
  variant: 'success' | 'warning' | 'error' | 'info';
} {
  if (score >= 80) return { label: 'Excellent', variant: 'success' };
  if (score >= 60) return { label: 'Good', variant: 'info' };
  if (score >= 40) return { label: 'Developing', variant: 'warning' };
  return { label: 'Needs Improvement', variant: 'error' };
}

function formatDurationMinutes(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins === 0) return `${secs}s`;
  return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
}

/* ------------------------------------------------------------------ */
/*  Preset                                                              */
/* ------------------------------------------------------------------ */

export const ReviewBhInterviewCopilot = createPreset<BhInterviewCopilotProps>({
  name: 'BhInterviewCopilot.Review',
  render: (ctx: PresetContext<BhInterviewCopilotProps>) => {
    const { primitives: { Box, Text }, props, tokens: t } = ctx;
    const isGlass = t.surface.useGlass;

    const {
      review,
      interviewTitle,
      candidateName,
      interviewerName,
      loading,
      className,
      style,
    } = props;

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

    const effectiveness = review ? getEffectivenessLevel(review.overallEffectiveness) : null;

    /* -- Loading state ------------------------------------------------ */
    if (loading) {
      return (
        <Box className={className} style={{
          display: 'flex', flexDirection: 'column' as const, gap: t.spacing[4],
          padding: `${t.spacing[6]}px`,
          ...createCardStyle(t, { elevation: 'sm', glass: isGlass }),
          ...style,
        }} role="status" aria-label="Loading review">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Box key={i} style={{ ...skeletonStyle, height: i === 1 ? 80 : 120, width: '100%' }} />
          ))}
        </Box>
      );
    }

    if (!review) {
      return (
        <Box className={className} style={{
          ...createCardStyle(t, { elevation: 'sm', glass: isGlass }),
          ...emptyStyle,
          ...style,
        }}>
          <Box style={createIconContainerStyle(t, { size: 48 })}>
            <Sparkles size={24} color={t.colors.neutral[300]} aria-hidden="true" />
          </Box>
          <Text style={{
            fontSize: t.typography.fontSize.sm,
            color: t.colors.neutral[400],
            marginTop: t.spacing[2],
          }}>
            No copilot review data available
          </Text>
        </Box>
      );
    }

    /* -- Render ------------------------------------------------------- */
    return (
      <div
        className={className}
        role="article"
        aria-label={interviewTitle ? `Copilot Review: ${interviewTitle}` : 'Copilot Review'}
        style={{
          ...createCardStyle(t, { elevation: 'md', padding: 0, glass: isGlass }),
          borderRadius: t.borderRadius.lg,
          overflow: 'hidden',
          ...entranceAnim.animate,
          transition: entranceAnim.transition,
          ...accentLayout.outer,
          ...style,
        }}
      >
        {/* Accent bar */}
        {accentBar && <Box style={accentBar} />}
        <Box style={accentLayout.inner}>

        {/* ============================================================ */}
        {/* HEADER                                                        */}
        {/* ============================================================ */}
        <Box style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: `${t.spacing[5]}px ${t.spacing[6]}px`,
          borderBottom: `1px solid ${t.colors.neutral[100]}`,
        }}>
          <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1] }}>
            <Text style={{
              fontSize: t.typography.fontSize.lg,
              fontWeight: personalityTypo.headingWeight,
              letterSpacing: personalityTypo.headingLetterSpacing,
              color: t.colors.neutral[900],
            }}>
              {interviewTitle ?? 'Copilot Review'}
            </Text>
            <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[3] }}>
              {candidateName && (
                <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[500] }}>
                  {candidateName}
                </Text>
              )}
              {interviewerName && (
                <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[400] }}>
                  Interviewer: {interviewerName}
                </Text>
              )}
              {review.interviewDate && (
                <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>
                  {formatDate(review.interviewDate)}
                </Text>
              )}
              {review.interviewDuration && (
                <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>
                  {formatDurationMinutes(review.interviewDuration)}
                </Text>
              )}
            </Box>
          </Box>
        </Box>

        {/* ============================================================ */}
        {/* EFFECTIVENESS SCORE                                           */}
        {/* ============================================================ */}
        <Box style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: `${t.spacing[6]}px ${t.spacing[6]}px`,
          borderBottom: `1px solid ${t.colors.neutral[100]}`,
          backgroundColor: isGlass ? undefined : t.colors.neutral[50],
        }}>
          <Box style={{
            display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: t.spacing[3],
          }}>
            {/* Large score display */}
            <Box style={{
              width: 100, height: 100, borderRadius: t.borderRadius.full,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              backgroundColor: t.colors.common.white,
              border: `4px solid ${
                effectiveness?.variant === 'success' ? t.colors.successScale[400] :
                effectiveness?.variant === 'info' ? t.colors.infoScale[400] :
                effectiveness?.variant === 'warning' ? t.colors.warningScale[400] :
                t.colors.errorScale[400]
              }`,
              boxShadow: t.shadows.md,
            }}>
              <Text style={{
                fontSize: t.typography.fontSize['2xl'],
                fontWeight: t.typography.fontWeight.bold,
                color: t.colors.neutral[900],
              }}>
                {Math.round(n(review.overallEffectiveness))}
              </Text>
            </Box>
            <Box style={{
              ...createBadgeStyle(t, effectiveness?.variant === 'success' ? 'success' :
                effectiveness?.variant === 'info' ? 'info' :
                effectiveness?.variant === 'warning' ? 'warning' : 'error'),
              borderRadius: badgeRadius,
            }}>
              <Text style={{ fontSize: t.typography.fontSize.xs }}>
                {effectiveness?.label}
              </Text>
            </Box>
            <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>
              Coaching Effectiveness Score
            </Text>
          </Box>
        </Box>

        {/* ============================================================ */}
        {/* TALK TIME ANALYSIS                                            */}
        {/* ============================================================ */}
        <Box style={{
          padding: `${t.spacing[5]}px ${t.spacing[6]}px`,
          borderBottom: `1px solid ${t.colors.neutral[100]}`,
        }}>
          <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], marginBottom: t.spacing[4] }}>
            <BarChart3 size={ICON_SIZES.section} color={t.colors.neutral[500]} aria-hidden="true" />
            <Text style={{
              fontSize: t.typography.fontSize.md,
              fontWeight: personalityTypo.headingWeight,
              color: t.colors.neutral[900],
            }}>
              Talk Time Analysis
            </Text>
          </Box>

          {/* Stacked horizontal bar */}
          <Box style={{
            display: 'flex', height: 32, borderRadius: t.borderRadius.md,
            overflow: 'hidden', backgroundColor: t.colors.neutral[100],
            marginBottom: t.spacing[3],
          }}>
            <Box style={{
              width: `${n(review.talkTimeAnalysis.interviewerPercent)}%`,
              backgroundColor: t.colors.primaryScale[400],
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              minWidth: review.talkTimeAnalysis.interviewerPercent > 10 ? 40 : 0,
            }}>
              {review.talkTimeAnalysis.interviewerPercent > 10 && (
                <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.common.white, fontWeight: t.typography.fontWeight.semibold }}>
                  {n(review.talkTimeAnalysis.interviewerPercent)}%
                </Text>
              )}
            </Box>
            <Box style={{
              width: `${n(review.talkTimeAnalysis.candidatePercent)}%`,
              backgroundColor: t.colors.successScale[400],
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              minWidth: review.talkTimeAnalysis.candidatePercent > 10 ? 40 : 0,
            }}>
              {review.talkTimeAnalysis.candidatePercent > 10 && (
                <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.common.white, fontWeight: t.typography.fontWeight.semibold }}>
                  {n(review.talkTimeAnalysis.candidatePercent)}%
                </Text>
              )}
            </Box>
            <Box style={{
              width: `${n(review.talkTimeAnalysis.silencePercent)}%`,
              backgroundColor: t.colors.neutral[300],
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              minWidth: review.talkTimeAnalysis.silencePercent > 10 ? 40 : 0,
            }}>
              {review.talkTimeAnalysis.silencePercent > 10 && (
                <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[700], fontWeight: t.typography.fontWeight.semibold }}>
                  {n(review.talkTimeAnalysis.silencePercent)}%
                </Text>
              )}
            </Box>
          </Box>

          {/* Legend + comparison */}
          <Box style={createMetadataGridStyle(t, { columns: 3 })}>
            <Box style={createMetadataFieldStyle(t, { withBackground: true })}>
              <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1] }}>
                <Box style={{ width: 8, height: 8, borderRadius: t.borderRadius.full, backgroundColor: t.colors.primaryScale[400] }} aria-hidden="true" />
                <Text style={createMetadataLabelStyle(t, { personality: personalityTypo })}>Interviewer</Text>
              </Box>
              <Text style={createMetadataValueStyle(t, { size: 'md', weight: 'semibold' })}>
                {n(review.talkTimeAnalysis.interviewerPercent)}%
              </Text>
              <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>
                Ideal: {review.talkTimeAnalysis.idealRange.min}-{review.talkTimeAnalysis.idealRange.max}%
              </Text>
            </Box>
            <Box style={createMetadataFieldStyle(t, { withBackground: true })}>
              <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1] }}>
                <Box style={{ width: 8, height: 8, borderRadius: t.borderRadius.full, backgroundColor: t.colors.successScale[400] }} aria-hidden="true" />
                <Text style={createMetadataLabelStyle(t, { personality: personalityTypo })}>Candidate</Text>
              </Box>
              <Text style={createMetadataValueStyle(t, { size: 'md', weight: 'semibold' })}>
                {n(review.talkTimeAnalysis.candidatePercent)}%
              </Text>
            </Box>
            <Box style={createMetadataFieldStyle(t, { withBackground: true })}>
              <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1] }}>
                <Box style={{ width: 8, height: 8, borderRadius: t.borderRadius.full, backgroundColor: t.colors.neutral[300] }} aria-hidden="true" />
                <Text style={createMetadataLabelStyle(t, { personality: personalityTypo })}>Silence</Text>
              </Box>
              <Text style={createMetadataValueStyle(t, { size: 'md', weight: 'semibold' })}>
                {n(review.talkTimeAnalysis.silencePercent)}%
              </Text>
            </Box>
          </Box>

          {/* Deviation indicator */}
          {review.talkTimeAnalysis.deviationFromIdeal !== 0 && (
            <Box style={{
              display: 'flex', alignItems: 'center', gap: t.spacing[2],
              marginTop: t.spacing[3],
              padding: `${t.spacing[2]}px ${t.spacing[3]}px`,
              borderRadius: t.borderRadius.md,
              backgroundColor: Math.abs(review.talkTimeAnalysis.deviationFromIdeal) > 15
                ? t.colors.warningScale[50] : t.colors.successScale[50],
              border: `1px solid ${Math.abs(review.talkTimeAnalysis.deviationFromIdeal) > 15
                ? t.colors.warningScale[200] : t.colors.successScale[200]}`,
            }}>
              <AlertTriangle size={ICON_SIZES.label} color={
                Math.abs(review.talkTimeAnalysis.deviationFromIdeal) > 15
                  ? t.colors.warningScale[500] : t.colors.successScale[500]
              } aria-hidden="true" />
              <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[700] }}>
                {review.talkTimeAnalysis.deviationFromIdeal > 0
                  ? `You spoke ${Math.abs(review.talkTimeAnalysis.deviationFromIdeal)}% more than ideal`
                  : `You spoke ${Math.abs(review.talkTimeAnalysis.deviationFromIdeal)}% less than ideal`
                }
              </Text>
            </Box>
          )}
        </Box>

        {/* ============================================================ */}
        {/* WHISPER ANALYSIS                                              */}
        {/* ============================================================ */}
        <Box style={{
          padding: `${t.spacing[5]}px ${t.spacing[6]}px`,
          borderBottom: `1px solid ${t.colors.neutral[100]}`,
        }}>
          <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], marginBottom: t.spacing[4] }}>
            <MessageSquare size={ICON_SIZES.section} color={t.colors.neutral[500]} aria-hidden="true" />
            <Text style={{
              fontSize: t.typography.fontSize.md,
              fontWeight: personalityTypo.headingWeight,
              color: t.colors.neutral[900],
            }}>
              Whisper Analysis
            </Text>
          </Box>

          {/* Stats row */}
          <Box style={{ display: 'flex', gap: t.spacing[4], marginBottom: t.spacing[4], flexWrap: 'wrap' as const }}>
            <Box style={createMetadataFieldStyle(t, { withBackground: true })}>
              <Text style={createStatValueStyle(t, { size: 'lg' })}>{review.whispersSent}</Text>
              <Text style={createStatLabelStyle(t, { personality: personalityTypo })}>Whispers Sent</Text>
            </Box>
            <Box style={createMetadataFieldStyle(t, { withBackground: true })}>
              <Text style={createStatValueStyle(t, { size: 'lg' })}>{review.whispersAcknowledged}</Text>
              <Text style={createStatLabelStyle(t, { personality: personalityTypo })}>Acknowledged</Text>
            </Box>
            <Box style={createMetadataFieldStyle(t, { withBackground: true })}>
              <Text style={createStatValueStyle(t, { size: 'lg' })}>
                {review.whispersSent > 0 ? Math.round((review.whispersAcknowledged / review.whispersSent) * 100) : 0}%
              </Text>
              <Text style={createStatLabelStyle(t, { personality: personalityTypo })}>Engagement Rate</Text>
            </Box>
          </Box>

          {/* Whisper type breakdown badges */}
          <Text style={{ ...sectionHeader, marginBottom: t.spacing[2] }}>By Type</Text>
          <Box style={{ display: 'flex', flexWrap: 'wrap' as const, gap: t.spacing[2], marginBottom: t.spacing[4] }}>
            {WHISPER_TYPES.map(wType => {
              const count = review.whisperTypeCounts[wType] ?? 0;
              if (count === 0) return null;
              const wc = whisperColors[wType];
              return (
                <Box key={wType} style={{
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                  padding: `${t.spacing[1]}px ${t.spacing[2]}px`,
                  borderRadius: badgeRadius,
                  backgroundColor: wc.bg,
                  border: `1px solid ${wc.border}`,
                }}>
                  <Text style={{ fontSize: t.typography.fontSize.xs, color: wc.text, fontWeight: t.typography.fontWeight.semibold }}>
                    {count}
                  </Text>
                  <Text style={{ fontSize: t.typography.fontSize.xs, color: wc.text }}>
                    {getWhisperTypeLabel(wType)}
                  </Text>
                </Box>
              );
            })}
          </Box>

          {/* Top whispers (pinned) */}
          {review.topWhispers.length > 0 && (
            <>
              <Text style={{ ...sectionHeader, marginBottom: t.spacing[2] }}>Most Impactful</Text>
              <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[2] }}>
                {review.topWhispers.map((whisper, idx) => {
                  const wc = whisperColors[whisper.type];
                  const whisperEntrance = createEntranceAnimation(t, { index: idx });
                  return (
                    <Box key={whisper.id} style={{
                      padding: `${t.spacing[3]}px ${t.spacing[4]}px`,
                      borderRadius: t.borderRadius.md,
                      backgroundColor: wc.bg,
                      border: `1px solid ${wc.border}`,
                      ...whisperEntrance.animate,
                    }}>
                      <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], marginBottom: t.spacing[1] }}>
                        {whisper.pinned && <Pin size={ICON_SIZES.inline} color={t.colors.primaryScale[500]} aria-hidden="true" />}
                        <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.semibold, color: wc.text }}>
                          {getWhisperTypeLabel(whisper.type)}
                        </Text>
                        {whisper.acknowledged && <Check size={ICON_SIZES.inline} color={t.colors.successScale[500]} aria-hidden="true" />}
                      </Box>
                      <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[700], lineHeight: t.typography.lineHeight.relaxed }}>
                        {whisper.content}
                      </Text>
                    </Box>
                  );
                })}
              </Box>
            </>
          )}
        </Box>

        {/* ============================================================ */}
        {/* DIMENSION COVERAGE                                            */}
        {/* ============================================================ */}
        {review.dimensionCoverage.length > 0 && (
          <Box style={{
            padding: `${t.spacing[5]}px ${t.spacing[6]}px`,
            borderBottom: `1px solid ${t.colors.neutral[100]}`,
          }}>
            <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], marginBottom: t.spacing[4] }}>
              <Target size={ICON_SIZES.section} color={t.colors.neutral[500]} aria-hidden="true" />
              <Text style={{
                fontSize: t.typography.fontSize.md,
                fontWeight: personalityTypo.headingWeight,
                color: t.colors.neutral[900],
              }}>
                Dimension Coverage
              </Text>
            </Box>

            <Box style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: t.spacing[3],
            }}>
              {review.dimensionCoverage.map((dim, idx) => {
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
                  <Box key={dim.dimensionCode} style={{
                    ...createMetadataFieldStyle(t, { withBackground: true }),
                    ...dimEntrance.animate,
                  }}>
                    <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text style={{
                        fontSize: t.typography.fontSize.sm,
                        fontWeight: t.typography.fontWeight.medium,
                        color: t.colors.neutral[800],
                      }}>
                        {dim.dimension}
                      </Text>
                      <Text style={{
                        fontSize: t.typography.fontSize.xs,
                        fontWeight: t.typography.fontWeight.semibold,
                        color: dim.coveragePercent >= 70 ? t.colors.successScale[600] :
                          dim.coveragePercent >= 40 ? t.colors.warningScale[600] : t.colors.errorScale[600],
                      }}>
                        {Math.round(n(dim.coveragePercent))}%
                      </Text>
                    </Box>
                    <Box style={{ ...progressStyles.track, marginTop: t.spacing[1] }}>
                      <Box style={progressStyles.fill} />
                    </Box>
                    {dim.suggestions.length > 0 && (
                      <Text style={{
                        fontSize: t.typography.fontSize.xs,
                        color: t.colors.neutral[400],
                        marginTop: t.spacing[1],
                        fontStyle: 'italic',
                      }}>
                        {dim.suggestions[0]}
                      </Text>
                    )}
                  </Box>
                );
              })}
            </Box>
          </Box>
        )}

        {/* ============================================================ */}
        {/* RECOMMENDATIONS                                               */}
        {/* ============================================================ */}
        {review.recommendations.length > 0 && (
          <Box style={{
            padding: `${t.spacing[5]}px ${t.spacing[6]}px`,
            borderBottom: `1px solid ${t.colors.neutral[100]}`,
          }}>
            <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], marginBottom: t.spacing[4] }}>
              <Lightbulb size={ICON_SIZES.section} color={t.colors.neutral[500]} aria-hidden="true" />
              <Text style={{
                fontSize: t.typography.fontSize.md,
                fontWeight: personalityTypo.headingWeight,
                color: t.colors.neutral[900],
              }}>
                Recommendations
              </Text>
            </Box>

            <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[2] }}>
              {review.recommendations.map((rec, idx) => {
                const recEntrance = createEntranceAnimation(t, { index: idx });
                return (
                  <Box key={idx} style={{
                    display: 'flex', alignItems: 'flex-start', gap: t.spacing[3],
                    padding: `${t.spacing[3]}px ${t.spacing[4]}px`,
                    borderRadius: t.borderRadius.md,
                    backgroundColor: t.colors.primaryScale[50],
                    border: `1px solid ${t.colors.primaryScale[100]}`,
                    ...recEntrance.animate,
                  }}>
                    <Box style={{
                      width: 20, height: 20, borderRadius: t.borderRadius.full,
                      backgroundColor: t.colors.primaryScale[100],
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0, marginTop: 2,
                    }}>
                      <Text style={{ fontSize: '10px', fontWeight: t.typography.fontWeight.bold, color: t.colors.primaryScale[600] }}>
                        {idx + 1}
                      </Text>
                    </Box>
                    <Text style={{
                      fontSize: t.typography.fontSize.sm,
                      color: t.colors.neutral[700],
                      lineHeight: t.typography.lineHeight.relaxed,
                    }}>
                      {rec}
                    </Text>
                  </Box>
                );
              })}
            </Box>
          </Box>
        )}

        {/* ============================================================ */}
        {/* INTERVIEWER SELF-SCORE                                        */}
        {/* ============================================================ */}
        {review.interviewerScore !== undefined && (
          <Box style={{
            padding: `${t.spacing[5]}px ${t.spacing[6]}px`,
          }}>
            <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], marginBottom: t.spacing[4] }}>
              <Star size={ICON_SIZES.section} color={t.colors.neutral[500]} aria-hidden="true" />
              <Text style={{
                fontSize: t.typography.fontSize.md,
                fontWeight: personalityTypo.headingWeight,
                color: t.colors.neutral[900],
              }}>
                Interviewer Self-Assessment
              </Text>
            </Box>

            <Box style={{
              display: 'flex', alignItems: 'center', gap: t.spacing[4],
              padding: `${t.spacing[4]}px`,
              borderRadius: t.borderRadius.md,
              backgroundColor: t.colors.neutral[50],
              border: `1px solid ${t.colors.neutral[100]}`,
            }}>
              <Box style={{
                width: 56, height: 56, borderRadius: t.borderRadius.full,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                backgroundColor: t.colors.common.white,
                border: `3px solid ${t.colors.primaryScale[300]}`,
                boxShadow: t.shadows.sm,
              }}>
                <Text style={{
                  fontSize: t.typography.fontSize.lg,
                  fontWeight: t.typography.fontWeight.bold,
                  color: t.colors.neutral[900],
                }}>
                  {review.interviewerScore}
                </Text>
              </Box>
              <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1] }}>
                <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.medium, color: t.colors.neutral[800] }}>
                  Overall Impression: {review.interviewerScore}/100
                </Text>
                {review.interviewerNotes && (
                  <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[500], fontStyle: 'italic' }}>
                    &ldquo;{review.interviewerNotes}&rdquo;
                  </Text>
                )}
              </Box>
            </Box>
          </Box>
        )}

        </Box>
      </div>
    );
  },
});
