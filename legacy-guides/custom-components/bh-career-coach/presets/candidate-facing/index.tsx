'use client';

/**
 * BhCareerCoach - Candidate Facing Preset
 * The main career coach view for rejected candidates.
 * Empathetic, encouraging design that turns rejection into growth.
 *
 * Sections:
 * 1. Welcome / Greeting
 * 2. Overall Assessment (strengths + areas for development)
 * 3. Skill Gap Visualization (horizontal bar comparison)
 * 4. Development Plan (prioritized, actionable)
 * 5. Learning Resources (categorized by skill)
 * 6. Feedback Section
 */

import { useState, useMemo, useCallback } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createBadgeStyle,
  createProgressBarStyle,
  createCardHoverStyles,
  createEntranceAnimation,
  createStaggerDelay,
  createPersonalityAccentBar,
  createPersonalitySectionHeaderStyle,
  createPersonalitySkeletonStyle,
  createDividerStyle,
  createEmptyStateStyle,
  createErrorContainerStyle,
  createIconContainerStyle,
  getPersonalityTypography,
  getPersonalityBadgeRadius,
  getCardPadding,
  ICON_SIZES,
} from '../../../helpers';
import type { BhCareerCoachProps, CareerSkillGap, CareerStrength, DevelopmentPlanItem, LearningResource, FeedbackRating } from '../../core';
import {
  getSeverityConfig,
  getPriorityConfig,
  getResourceTypeConfig,
  getScoreLevelColor,
  getScoreLevelLabel,
  sortByPriority,
  groupResourcesBySkill,
} from '../../core';
import type { DesignTokens } from '../../../../../core/types/tokens';
import {
  Sparkles, TrendingUp, Target, BookOpen, Star,
  ChevronRight, ChevronDown, ExternalLink, Clock,
  Award, Zap, ArrowRight, CheckCircle, AlertCircle,
  MessageSquare, ThumbsUp, Play, FileText, Book,
  GraduationCap, RefreshCw, Heart,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Module-level refs                                                   */
/* ------------------------------------------------------------------ */

let _Box: any;
let _Text: any;

/* ------------------------------------------------------------------ */
/*  Sub-Components                                                      */
/* ------------------------------------------------------------------ */

function SkeletonBlock({ tokens: t, width, height }: { tokens: DesignTokens; width?: string; height?: number }) {
  const skeletonStyle = createPersonalitySkeletonStyle(t);
  return (
    <_Box style={{ ...skeletonStyle, width: width || '100%', height: height || 16, marginBottom: t.spacing[2] }} />
  );
}

function SkeletonCard({ tokens: t }: { tokens: DesignTokens }) {
  const cardStyle = createCardStyle(t, { elevation: 'sm' });
  const padding = getCardPadding(t);
  return (
    <_Box style={{ ...cardStyle, padding, display: 'flex', flexDirection: 'column' as const, gap: t.spacing[3] }}>
      <SkeletonBlock tokens={t} width="60%" height={20} />
      <SkeletonBlock tokens={t} width="100%" height={12} />
      <SkeletonBlock tokens={t} width="80%" height={12} />
      <SkeletonBlock tokens={t} width="40%" height={12} />
    </_Box>
  );
}

function LoadingSkeleton({ tokens: t }: { tokens: DesignTokens }) {
  return (
    <_Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[4] }}>
      <SkeletonCard tokens={t} />
      <SkeletonCard tokens={t} />
      <SkeletonCard tokens={t} />
      <SkeletonCard tokens={t} />
    </_Box>
  );
}

function ScoreBar({ label, current, target, tokens: t }: {
  label: string;
  current: number;
  target: number;
  tokens: DesignTokens;
}) {
  const Box = _Box;
  const Text = _Text;
  const currentColor = getScoreLevelColor(t, current);
  const targetColor = t.colors.neutral[300];
  const barHeight = 8;

  return (
    <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1], marginBottom: t.spacing[3] }}>
      <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.medium, color: t.colors.neutral[700] }}>
          {label}
        </Text>
        <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
          <Text style={{ fontSize: t.typography.fontSize.xs, color: currentColor, fontWeight: t.typography.fontWeight.semibold }}>
            {current}
          </Text>
          <ArrowRight size={ICON_SIZES.inline} color={t.colors.neutral[400]} />
          <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500], fontWeight: t.typography.fontWeight.medium }}>
            {target}
          </Text>
        </Box>
      </Box>
      <Box style={{ position: 'relative' as const, height: barHeight, borderRadius: t.borderRadius.full, backgroundColor: t.colors.neutral[100], overflow: 'hidden' as const }}>
        {/* Target level indicator (background) */}
        <Box style={{
          position: 'absolute' as const, top: 0, left: 0,
          width: `${Math.min(100, target)}%`, height: '100%',
          backgroundColor: targetColor, borderRadius: t.borderRadius.full,
        }} />
        {/* Current level (foreground) */}
        <Box style={{
          position: 'absolute' as const, top: 0, left: 0,
          width: `${Math.min(100, current)}%`, height: '100%',
          backgroundColor: currentColor, borderRadius: t.borderRadius.full,
          transition: 'width 0.8s ease',
        }} />
      </Box>
    </Box>
  );
}

function StarRating({ rating, onRate, tokens: t }: {
  rating: number;
  onRate: (star: FeedbackRating) => void;
  tokens: DesignTokens;
}) {
  const Box = _Box;
  const [hovered, setHovered] = useState(0);

  return (
    <Box style={{ display: 'flex', gap: t.spacing[1] }}>
      {([1, 2, 3, 4, 5] as FeedbackRating[]).map((star) => {
        const filled = star <= (hovered || rating);
        return (
          <Box
            key={star}
            onClick={() => onRate(star)}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            style={{ cursor: 'pointer', transition: `transform ${t.motion.hover}` }}
            role="button"
            tabIndex={0}
            aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
          >
            <Star
              size={ICON_SIZES.hero}
              fill={filled ? t.colors.warningScale[400] : 'none'}
              color={filled ? t.colors.warningScale[400] : t.colors.neutral[300]}
            />
          </Box>
        );
      })}
    </Box>
  );
}

function ResourceTypeIcon({ type, tokens: t }: { type: string; tokens: DesignTokens }) {
  const size = ICON_SIZES.section;
  switch (type) {
    case 'course': return <GraduationCap size={size} />;
    case 'video': return <Play size={size} />;
    case 'article': return <FileText size={size} />;
    case 'book': return <Book size={size} />;
    case 'practice': return <Target size={size} />;
    default: return <BookOpen size={size} />;
  }
}

/* ------------------------------------------------------------------ */
/*  Preset                                                              */
/* ------------------------------------------------------------------ */

export const CandidateFacingBhCareerCoach = createPreset<BhCareerCoachProps>({
  name: 'BhCareerCoach.CandidateFacing',
  render: ({ primitives, props, tokens: t }: PresetContext<BhCareerCoachProps>) => {
    const { Box, Text } = primitives;
    _Box = Box;
    _Text = Text;

    const {
      data,
      loading = false,
      error,
      onRetry,
      onSubmitFeedback,
      className,
      style,
    } = props;

    // ---- State ----
    const [activeSection, setActiveSection] = useState<string | null>(null);
    const [feedbackRating, setFeedbackRating] = useState<FeedbackRating | 0>(0);
    const [feedbackComments, setFeedbackComments] = useState('');
    const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

    // ---- Derived ----
    const ptypo = getPersonalityTypography(t);
    const cardPadding = getCardPadding(t);
    const badgeRadius = getPersonalityBadgeRadius(t);
    const hoverStyles = createCardHoverStyles(t);
    const dividerStyle = createDividerStyle(t);
    const sectionHeaderStyle = createPersonalitySectionHeaderStyle(t);
    const severityConfig = useMemo(() => getSeverityConfig(t), [t]);
    const priorityConfig = useMemo(() => getPriorityConfig(t), [t]);
    const resourceTypeConfig = useMemo(() => getResourceTypeConfig(t), [t]);
    const sortedPlan = useMemo(() => data ? sortByPriority(data.developmentPlan) : [], [data]);
    const groupedResources = useMemo(() => data ? groupResourcesBySkill(data.skillGaps) : {}, [data]);

    // ---- Entrance animations ----
    const entrance = useCallback((index: number) => {
      const anim = createEntranceAnimation(t, { index });
      return {
        style: { ...anim.initial, ...anim.animate, transition: anim.transition },
      };
    }, [t]);

    // ---- Handlers ----
    const handleFeedbackSubmit = useCallback(() => {
      if (feedbackRating > 0 && onSubmitFeedback) {
        onSubmitFeedback({
          rating: feedbackRating as FeedbackRating,
          comments: feedbackComments || undefined,
        });
        setFeedbackSubmitted(true);
      }
    }, [feedbackRating, feedbackComments, onSubmitFeedback]);

    const toggleSection = useCallback((section: string) => {
      setActiveSection(prev => prev === section ? null : section);
    }, []);

    // ---- Loading ----
    if (loading) {
      return (
        <Box className={className} style={{ ...style, display: 'flex', flexDirection: 'column' as const, gap: t.spacing[4] }}>
          <LoadingSkeleton tokens={t} />
        </Box>
      );
    }

    // ---- Error ----
    if (error) {
      const errorStyle = createErrorContainerStyle(t);
      return (
        <Box className={className} style={{ ...style }}>
          <Box style={errorStyle}>
            <AlertCircle size={ICON_SIZES.illustration} color={t.colors.errorScale[400]} />
            <Text style={{ fontSize: t.typography.fontSize.lg, fontWeight: t.typography.fontWeight.semibold, color: t.colors.errorScale[700], marginTop: t.spacing[3] }}>
              Something went wrong
            </Text>
            <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.errorScale[600], marginTop: t.spacing[1] }}>
              {error}
            </Text>
            {onRetry && (
              <Box
                onClick={onRetry}
                role="button"
                tabIndex={0}
                style={{
                  marginTop: t.spacing[4],
                  padding: `${t.spacing[2]}px ${t.spacing[4]}px`,
                  backgroundColor: t.colors.errorScale[600],
                  color: t.colors.common.white,
                  borderRadius: t.borderRadius.md,
                  fontSize: t.typography.fontSize.sm,
                  fontWeight: t.typography.fontWeight.medium,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: t.spacing[2],
                  border: 'none',
                }}
              >
                <RefreshCw size={ICON_SIZES.label} />
                <Text style={{ color: t.colors.common.white, fontSize: t.typography.fontSize.sm }}>Try Again</Text>
              </Box>
            )}
          </Box>
        </Box>
      );
    }

    // ---- No Data ----
    if (!data) {
      const emptyStyle = createEmptyStateStyle(t);
      return (
        <Box className={className} style={{ ...style }}>
          <Box style={emptyStyle}>
            <Sparkles size={ICON_SIZES.illustration} color={t.colors.neutral[300]} />
            <Text style={{ fontSize: t.typography.fontSize.lg, color: t.colors.neutral[500], marginTop: t.spacing[3] }}>
              No career coaching data available
            </Text>
          </Box>
        </Box>
      );
    }

    // ---- Accent bar ----
    const accentBar = createPersonalityAccentBar(t);

    // ====================================================================
    //  RENDER
    // ====================================================================
    return (
      <Box className={className} style={{ ...style, display: 'flex', flexDirection: 'column' as const, gap: t.spacing[5] }}>

        {/* ============================================================ */}
        {/*  SECTION 1: Welcome Greeting                                  */}
        {/* ============================================================ */}
        <Box style={{ ...createCardStyle(t, { elevation: 'md' }), padding: cardPadding, overflow: 'hidden' as const, position: 'relative' as const, ...entrance(0).style }}>
          {accentBar && <Box style={{ ...accentBar, position: 'absolute' as const, top: 0, left: 0 }} />}
          <Box style={{ display: 'flex', alignItems: 'flex-start', gap: t.spacing[4], paddingTop: accentBar ? t.spacing[2] : 0 }}>
            <Box style={{
              ...createIconContainerStyle(t, { size: 56, color: t.colors.primaryScale[50] }),
            }}>
              <Heart size={ICON_SIZES.hero} color={t.colors.primaryScale[500]} />
            </Box>
            <Box style={{ flex: 1, display: 'flex', flexDirection: 'column' as const, gap: t.spacing[2] }}>
              <Text style={{
                fontSize: t.typography.fontSize['2xl'],
                fontWeight: ptypo.headingWeight,
                color: t.colors.neutral[900],
                letterSpacing: ptypo.headingLetterSpacing,
                lineHeight: 1.3,
              }}>
                Hi {data.candidateFirstName}, here is your career development plan
              </Text>
              <Text style={{
                fontSize: t.typography.fontSize.md,
                color: t.colors.neutral[600],
                lineHeight: 1.6,
              }}>
                Based on your interview for <Text as="span" style={{ fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[700] }}>{data.jobTitle}</Text> at <Text as="span" style={{ fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[700] }}>{data.companyName}</Text>, we have put together personalized recommendations to help you grow in your career.
              </Text>
              <Text style={{
                fontSize: t.typography.fontSize.sm,
                color: t.colors.neutral[500],
                lineHeight: 1.5,
                fontStyle: 'italic' as const,
              }}>
                {data.overallFeedback}
              </Text>
            </Box>
          </Box>
        </Box>

        {/* ============================================================ */}
        {/*  SECTION 2: Strengths                                         */}
        {/* ============================================================ */}
        <Box style={{ ...createCardStyle(t, { elevation: 'sm' }), padding: cardPadding, ...entrance(1).style }}>
          <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], marginBottom: t.spacing[4] }}>
            <Box style={createIconContainerStyle(t, { size: 36, color: t.colors.successScale[50] })}>
              <Award size={ICON_SIZES.feature} color={t.colors.successScale[500]} />
            </Box>
            <Text style={{
              fontSize: t.typography.fontSize.lg,
              fontWeight: ptypo.headingWeight,
              color: t.colors.neutral[900],
              letterSpacing: ptypo.headingLetterSpacing,
            }}>
              Your Strengths
            </Text>
          </Box>
          <Text style={{
            fontSize: t.typography.fontSize.sm,
            color: t.colors.neutral[500],
            marginBottom: t.spacing[3],
          }}>
            These are the areas where you demonstrated strong performance. Keep building on these.
          </Text>
          <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[3] }}>
            {data.strengths.map((strength, idx) => (
              <Box
                key={idx}
                style={{
                  display: 'flex',
                  gap: t.spacing[3],
                  padding: t.spacing[3],
                  borderRadius: t.borderRadius.md,
                  backgroundColor: t.colors.successScale[50],
                  border: `1px solid ${t.colors.successScale[200]}`,
                }}
              >
                <Box style={{
                  width: 32, height: 32, borderRadius: t.borderRadius.full,
                  backgroundColor: t.colors.successScale[100],
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <CheckCircle size={ICON_SIZES.section} color={t.colors.successScale[600]} />
                </Box>
                <Box style={{ flex: 1, display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1] }}>
                  <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.semibold, color: t.colors.successScale[800] }}>
                      {strength.dimension}
                    </Text>
                    <Box style={{
                      padding: `${t.spacing[1]}px ${t.spacing[2]}px`,
                      borderRadius: badgeRadius,
                      backgroundColor: t.colors.successScale[100],
                      border: `1px solid ${t.colors.successScale[300]}`,
                    }}>
                      <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.semibold, color: t.colors.successScale[700] }}>
                        {getScoreLevelLabel(strength.level)} ({strength.level}/100)
                      </Text>
                    </Box>
                  </Box>
                  <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[700], lineHeight: 1.5 }}>
                    {strength.description}
                  </Text>
                  {strength.evidence && (
                    <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500], fontStyle: 'italic' as const, lineHeight: 1.4, marginTop: t.spacing[1] }}>
                      &ldquo;{strength.evidence}&rdquo;
                    </Text>
                  )}
                </Box>
              </Box>
            ))}
          </Box>
        </Box>

        {/* ============================================================ */}
        {/*  SECTION 3: Skill Gap Visualization                           */}
        {/* ============================================================ */}
        <Box style={{ ...createCardStyle(t, { elevation: 'sm' }), padding: cardPadding, ...entrance(2).style }}>
          <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], marginBottom: t.spacing[4] }}>
            <Box style={createIconContainerStyle(t, { size: 36, color: t.colors.primaryScale[50] })}>
              <Target size={ICON_SIZES.feature} color={t.colors.primaryScale[500]} />
            </Box>
            <Text style={{
              fontSize: t.typography.fontSize.lg,
              fontWeight: ptypo.headingWeight,
              color: t.colors.neutral[900],
              letterSpacing: ptypo.headingLetterSpacing,
            }}>
              Areas for Growth
            </Text>
          </Box>
          <Text style={{
            fontSize: t.typography.fontSize.sm,
            color: t.colors.neutral[500],
            marginBottom: t.spacing[4],
          }}>
            These areas represent opportunities for your professional development. The bars show your current level compared to what is typically expected.
          </Text>

          {/* Legend */}
          <Box style={{ display: 'flex', gap: t.spacing[4], marginBottom: t.spacing[4], flexWrap: 'wrap' as const }}>
            <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1] }}>
              <Box style={{ width: 12, height: 8, borderRadius: t.borderRadius.sm, backgroundColor: t.colors.primaryScale[500] }} />
              <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>Your level</Text>
            </Box>
            <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1] }}>
              <Box style={{ width: 12, height: 8, borderRadius: t.borderRadius.sm, backgroundColor: t.colors.neutral[300] }} />
              <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>Target level</Text>
            </Box>
          </Box>

          {/* Skill gap bars */}
          {data.skillGaps.map((gap, idx) => (
            <Box key={idx}>
              <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], marginBottom: t.spacing[1] }}>
                <Box style={{
                  padding: `2px ${t.spacing[2]}px`,
                  borderRadius: badgeRadius,
                  backgroundColor: severityConfig[gap.gapSeverity].bgColor,
                  border: `1px solid ${severityConfig[gap.gapSeverity].borderColor}`,
                }}>
                  <Text style={{ fontSize: 10, fontWeight: t.typography.fontWeight.medium, color: severityConfig[gap.gapSeverity].color }}>
                    {severityConfig[gap.gapSeverity].label}
                  </Text>
                </Box>
              </Box>
              <ScoreBar
                label={gap.dimension}
                current={gap.currentLevel}
                target={gap.targetLevel}
                tokens={t}
              />
            </Box>
          ))}
        </Box>

        {/* ============================================================ */}
        {/*  SECTION 4: Development Plan                                  */}
        {/* ============================================================ */}
        <Box style={{ ...createCardStyle(t, { elevation: 'sm' }), padding: cardPadding, ...entrance(3).style }}>
          <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], marginBottom: t.spacing[4] }}>
            <Box style={createIconContainerStyle(t, { size: 36, color: t.colors.warningScale[50] })}>
              <TrendingUp size={ICON_SIZES.feature} color={t.colors.warningScale[500]} />
            </Box>
            <Text style={{
              fontSize: t.typography.fontSize.lg,
              fontWeight: ptypo.headingWeight,
              color: t.colors.neutral[900],
              letterSpacing: ptypo.headingLetterSpacing,
            }}>
              Your Development Roadmap
            </Text>
          </Box>
          <Text style={{
            fontSize: t.typography.fontSize.sm,
            color: t.colors.neutral[500],
            marginBottom: t.spacing[4],
          }}>
            A prioritized plan to help you build the skills that matter most. Start with the high-priority items and work your way through.
          </Text>

          <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[3] }}>
            {sortedPlan.map((item, idx) => {
              const pConfig = priorityConfig[item.priority];
              const isExpanded = activeSection === `plan-${idx}`;

              return (
                <Box
                  key={idx}
                  style={{
                    borderRadius: t.borderRadius.md,
                    border: `1px solid ${t.colors.neutral[200]}`,
                    overflow: 'hidden' as const,
                    ...hoverStyles.base,
                  }}
                >
                  {/* Header (clickable) */}
                  <Box
                    onClick={() => toggleSection(`plan-${idx}`)}
                    role="button"
                    tabIndex={0}
                    aria-expanded={isExpanded}
                    style={{
                      display: 'flex', alignItems: 'center', gap: t.spacing[3],
                      padding: `${t.spacing[3]}px ${t.spacing[4]}px`,
                      cursor: 'pointer',
                      backgroundColor: isExpanded ? t.colors.neutral[50] : t.colors.common.white,
                      transition: `background-color ${t.motion.hover}`,
                    }}
                  >
                    <Box style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      width: 28, height: 28, borderRadius: t.borderRadius.full,
                      backgroundColor: pConfig.bgColor,
                      border: `1px solid ${pConfig.borderColor}`,
                      flexShrink: 0,
                    }}>
                      <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.bold, color: pConfig.color }}>
                        {idx + 1}
                      </Text>
                    </Box>
                    <Box style={{ flex: 1, minWidth: 0 }}>
                      <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[800] }}>
                        {item.skill}
                      </Text>
                      <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], marginTop: 2 }}>
                        <Box style={{
                          padding: `1px ${t.spacing[1]}px`,
                          borderRadius: badgeRadius,
                          backgroundColor: pConfig.bgColor,
                          border: `1px solid ${pConfig.borderColor}`,
                        }}>
                          <Text style={{ fontSize: 10, fontWeight: t.typography.fontWeight.medium, color: pConfig.color }}>
                            {pConfig.label}
                          </Text>
                        </Box>
                        <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>
                          {item.currentLevel} &rarr; {item.targetLevel}
                        </Text>
                        <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>
                          &middot; {item.timeline}
                        </Text>
                      </Box>
                    </Box>
                    {isExpanded
                      ? <ChevronDown size={ICON_SIZES.section} color={t.colors.neutral[400]} />
                      : <ChevronRight size={ICON_SIZES.section} color={t.colors.neutral[400]} />
                    }
                  </Box>

                  {/* Expanded content */}
                  {isExpanded && (
                    <Box style={{
                      padding: `${t.spacing[3]}px ${t.spacing[4]}px`,
                      borderTop: `1px solid ${t.colors.neutral[100]}`,
                      backgroundColor: t.colors.neutral[50],
                    }}>
                      {/* Progress bar */}
                      <Box style={{ marginBottom: t.spacing[3] }}>
                        <Box style={{ display: 'flex', justifyContent: 'space-between', marginBottom: t.spacing[1] }}>
                          <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>Current progress</Text>
                          <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>{item.currentLevel}/{item.targetLevel}</Text>
                        </Box>
                        {(() => {
                          const pct = item.targetLevel > 0 ? (item.currentLevel / item.targetLevel) * 100 : 0;
                          const barStyles = createProgressBarStyle(t, { percent: pct });
                          return (
                            <Box style={barStyles.track}>
                              <Box style={barStyles.fill} />
                            </Box>
                          );
                        })()}
                      </Box>

                      {/* Action items */}
                      <Text style={{ ...sectionHeaderStyle, marginBottom: t.spacing[2] }}>Action Steps</Text>
                      <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[2] }}>
                        {item.actions.map((action, aIdx) => (
                          <Box key={aIdx} style={{ display: 'flex', alignItems: 'flex-start', gap: t.spacing[2] }}>
                            <Box style={{
                              width: 6, height: 6, borderRadius: t.borderRadius.full,
                              backgroundColor: t.colors.primaryScale[400],
                              marginTop: 6, flexShrink: 0,
                            }} />
                            <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[700], lineHeight: 1.5 }}>
                              {action}
                            </Text>
                          </Box>
                        ))}
                      </Box>
                    </Box>
                  )}
                </Box>
              );
            })}
          </Box>
        </Box>

        {/* ============================================================ */}
        {/*  SECTION 5: Learning Resources                                */}
        {/* ============================================================ */}
        <Box style={{ ...createCardStyle(t, { elevation: 'sm' }), padding: cardPadding, ...entrance(4).style }}>
          <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], marginBottom: t.spacing[4] }}>
            <Box style={createIconContainerStyle(t, { size: 36, color: t.colors.infoScale[50] })}>
              <BookOpen size={ICON_SIZES.feature} color={t.colors.infoScale[500]} />
            </Box>
            <Text style={{
              fontSize: t.typography.fontSize.lg,
              fontWeight: ptypo.headingWeight,
              color: t.colors.neutral[900],
              letterSpacing: ptypo.headingLetterSpacing,
            }}>
              Recommended Resources
            </Text>
          </Box>
          <Text style={{
            fontSize: t.typography.fontSize.sm,
            color: t.colors.neutral[500],
            marginBottom: t.spacing[4],
          }}>
            Curated learning materials to help you develop in your growth areas.
          </Text>

          {/* Resources grouped by skill */}
          {Object.entries(groupedResources).map(([skill, resources], groupIdx) => (
            <Box key={groupIdx} style={{ marginBottom: t.spacing[4] }}>
              <Text style={{
                fontSize: t.typography.fontSize.sm,
                fontWeight: t.typography.fontWeight.semibold,
                color: t.colors.neutral[700],
                marginBottom: t.spacing[2],
              }}>
                {skill}
              </Text>
              <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[2] }}>
                {resources.map((resource, rIdx) => {
                  const rtConfig = resourceTypeConfig[resource.type] || resourceTypeConfig.article;
                  return (
                    <a
                      key={rIdx}
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'flex', alignItems: 'center', gap: t.spacing[3],
                        padding: t.spacing[3],
                        borderRadius: t.borderRadius.md,
                        border: `1px solid ${t.colors.neutral[200]}`,
                        backgroundColor: t.colors.common.white,
                        textDecoration: 'none',
                        cursor: 'pointer',
                        ...hoverStyles.base,
                      }}
                      onMouseEnter={(e: any) => { Object.assign(e.currentTarget.style, hoverStyles.hover); }}
                      onMouseLeave={(e: any) => { Object.assign(e.currentTarget.style, hoverStyles.base); }}
                    >
                      <Box style={{
                        ...createIconContainerStyle(t, { size: 36, color: rtConfig.bgColor }),
                      }}>
                        <ResourceTypeIcon type={resource.type} tokens={t} />
                      </Box>
                      <Box style={{ flex: 1, minWidth: 0 }}>
                        <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.medium, color: t.colors.neutral[800] }}>
                          {resource.title}
                        </Text>
                        <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], marginTop: 2 }}>
                          <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>
                            {resource.provider}
                          </Text>
                          <Box style={{
                            padding: `1px ${t.spacing[1]}px`,
                            borderRadius: badgeRadius,
                            backgroundColor: rtConfig.bgColor,
                          }}>
                            <Text style={{ fontSize: 10, fontWeight: t.typography.fontWeight.medium, color: rtConfig.color }}>
                              {rtConfig.label}
                            </Text>
                          </Box>
                          {resource.estimatedHours != null && (
                            <Box style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <Clock size={ICON_SIZES.inline} color={t.colors.neutral[400]} />
                              <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>
                                {resource.estimatedHours}h
                              </Text>
                            </Box>
                          )}
                        </Box>
                      </Box>
                      <ExternalLink size={ICON_SIZES.label} color={t.colors.neutral[300]} />
                    </a>
                  );
                })}
              </Box>
            </Box>
          ))}

          {/* Top-level resources (not from gaps) */}
          {data.resources.length > 0 && Object.keys(groupedResources).length > 0 && (
            <Box style={dividerStyle} />
          )}
          {data.resources.length > 0 && (
            <Box style={{ marginTop: Object.keys(groupedResources).length > 0 ? t.spacing[4] : 0 }}>
              <Text style={{
                fontSize: t.typography.fontSize.sm,
                fontWeight: t.typography.fontWeight.semibold,
                color: t.colors.neutral[700],
                marginBottom: t.spacing[2],
              }}>
                General Resources
              </Text>
              <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[2] }}>
                {data.resources.map((resource, rIdx) => {
                  const rtConfig = resourceTypeConfig[resource.type] || resourceTypeConfig.article;
                  return (
                    <a
                      key={rIdx}
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'flex', alignItems: 'center', gap: t.spacing[3],
                        padding: t.spacing[3],
                        borderRadius: t.borderRadius.md,
                        border: `1px solid ${t.colors.neutral[200]}`,
                        backgroundColor: t.colors.common.white,
                        textDecoration: 'none',
                        cursor: 'pointer',
                        ...hoverStyles.base,
                      }}
                      onMouseEnter={(e: any) => { Object.assign(e.currentTarget.style, hoverStyles.hover); }}
                      onMouseLeave={(e: any) => { Object.assign(e.currentTarget.style, hoverStyles.base); }}
                    >
                      <Box style={createIconContainerStyle(t, { size: 36, color: rtConfig.bgColor })}>
                        <ResourceTypeIcon type={resource.type} tokens={t} />
                      </Box>
                      <Box style={{ flex: 1, minWidth: 0 }}>
                        <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.medium, color: t.colors.neutral[800] }}>
                          {resource.title}
                        </Text>
                        <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], marginTop: 2 }}>
                          <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>{resource.provider}</Text>
                          <Box style={{ padding: `1px ${t.spacing[1]}px`, borderRadius: badgeRadius, backgroundColor: rtConfig.bgColor }}>
                            <Text style={{ fontSize: 10, fontWeight: t.typography.fontWeight.medium, color: rtConfig.color }}>{rtConfig.label}</Text>
                          </Box>
                          {resource.estimatedHours != null && (
                            <Box style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <Clock size={ICON_SIZES.inline} color={t.colors.neutral[400]} />
                              <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>{resource.estimatedHours}h</Text>
                            </Box>
                          )}
                        </Box>
                      </Box>
                      <ExternalLink size={ICON_SIZES.label} color={t.colors.neutral[300]} />
                    </a>
                  );
                })}
              </Box>
            </Box>
          )}
        </Box>

        {/* ============================================================ */}
        {/*  SECTION 6: Feedback                                          */}
        {/* ============================================================ */}
        <Box style={{ ...createCardStyle(t, { elevation: 'sm' }), padding: cardPadding, ...entrance(5).style }}>
          <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], marginBottom: t.spacing[3] }}>
            <Box style={createIconContainerStyle(t, { size: 36, color: t.colors.secondaryScale[50] })}>
              <MessageSquare size={ICON_SIZES.feature} color={t.colors.secondaryScale[500]} />
            </Box>
            <Text style={{
              fontSize: t.typography.fontSize.lg,
              fontWeight: ptypo.headingWeight,
              color: t.colors.neutral[900],
              letterSpacing: ptypo.headingLetterSpacing,
            }}>
              Was this helpful?
            </Text>
          </Box>

          {feedbackSubmitted ? (
            <Box style={{
              display: 'flex', flexDirection: 'column' as const, alignItems: 'center',
              padding: `${t.spacing[6]}px ${t.spacing[4]}px`,
              textAlign: 'center' as const,
            }}>
              <ThumbsUp size={ICON_SIZES.hero} color={t.colors.successScale[500]} />
              <Text style={{
                fontSize: t.typography.fontSize.md, fontWeight: t.typography.fontWeight.semibold,
                color: t.colors.neutral[800], marginTop: t.spacing[2],
              }}>
                Thank you for your feedback!
              </Text>
              <Text style={{
                fontSize: t.typography.fontSize.sm, color: t.colors.neutral[500], marginTop: t.spacing[1],
              }}>
                Your input helps us improve the experience for everyone.
              </Text>
            </Box>
          ) : (
            <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[3] }}>
              <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[500] }}>
                We would love to know if this career development plan was useful to you.
              </Text>

              {/* Star rating */}
              <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1] }}>
                <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500], fontWeight: t.typography.fontWeight.medium }}>
                  Rate your experience
                </Text>
                <StarRating rating={feedbackRating} onRate={setFeedbackRating} tokens={t} />
              </Box>

              {/* Optional comments */}
              <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1] }}>
                <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500], fontWeight: t.typography.fontWeight.medium }}>
                  Any additional thoughts? (optional)
                </Text>
                <div style={{
                  width: '100%',
                }}>
                  <textarea
                    value={feedbackComments}
                    onChange={(e) => setFeedbackComments(e.target.value)}
                    placeholder="Share your thoughts..."
                    rows={3}
                    style={{
                      width: '100%',
                      padding: t.spacing[3],
                      borderRadius: t.borderRadius.md,
                      border: `1px solid ${t.colors.neutral[300]}`,
                      backgroundColor: t.colors.common.white,
                      fontSize: t.typography.fontSize.sm,
                      color: t.colors.neutral[700],
                      resize: 'vertical' as const,
                      fontFamily: 'inherit',
                      outline: 'none',
                      boxSizing: 'border-box' as const,
                    }}
                  />
                </div>
              </Box>

              {/* Submit button */}
              <Box style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Box
                  onClick={handleFeedbackSubmit}
                  role="button"
                  tabIndex={0}
                  style={{
                    padding: `${t.spacing[2]}px ${t.spacing[4]}px`,
                    backgroundColor: feedbackRating > 0 ? t.colors.primaryScale[600] : t.colors.neutral[300],
                    color: t.colors.common.white,
                    borderRadius: t.borderRadius.md,
                    fontSize: t.typography.fontSize.sm,
                    fontWeight: t.typography.fontWeight.medium,
                    cursor: feedbackRating > 0 ? 'pointer' : 'not-allowed',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: t.spacing[2],
                    border: 'none',
                    transition: `all ${t.motion.hover}`,
                    opacity: feedbackRating > 0 ? 1 : 0.6,
                  }}
                >
                  <Text style={{ color: t.colors.common.white, fontSize: t.typography.fontSize.sm }}>Submit Feedback</Text>
                </Box>
              </Box>
            </Box>
          )}
        </Box>

        {/* ============================================================ */}
        {/*  SECTION 7: Talent Pool CTA (if available)                    */}
        {/* ============================================================ */}
        {data.talentPoolOptIn && !data.talentPoolOptIn.optedIn && (
          <Box style={{
            ...createCardStyle(t, { elevation: 'md' }),
            padding: cardPadding,
            background: `linear-gradient(135deg, ${t.colors.primaryScale[50]}, ${t.colors.secondaryScale[50]})`,
            border: `1px solid ${t.colors.primaryScale[200]}`,
            ...entrance(6).style,
          }}>
            <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], marginBottom: t.spacing[2] }}>
              <Sparkles size={ICON_SIZES.feature} color={t.colors.primaryScale[500]} />
              <Text style={{
                fontSize: t.typography.fontSize.lg,
                fontWeight: ptypo.headingWeight,
                color: t.colors.primaryScale[800],
                letterSpacing: ptypo.headingLetterSpacing,
              }}>
                Stay in Touch
              </Text>
            </Box>
            <Text style={{
              fontSize: t.typography.fontSize.sm,
              color: t.colors.neutral[600],
              lineHeight: 1.6,
              marginBottom: t.spacing[3],
            }}>
              {data.talentPoolOptIn.description}
            </Text>
            <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1], marginBottom: t.spacing[3] }}>
              {data.talentPoolOptIn.benefits.map((benefit, idx) => (
                <Box key={idx} style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
                  <CheckCircle size={ICON_SIZES.label} color={t.colors.primaryScale[500]} />
                  <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[700] }}>{benefit}</Text>
                </Box>
              ))}
            </Box>
          </Box>
        )}
      </Box>
    );
  },
});
