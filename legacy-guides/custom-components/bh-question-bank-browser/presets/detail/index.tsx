'use client';

/**
 * BhQuestionBankBrowser - Detail Preset
 * Full question detail view with text, metadata, follow-ups,
 * rubric guidance, effectiveness metrics, and related questions.
 */

import { useState, useMemo } from 'react';
import {
  ArrowLeft,
  Brain,
  Code2,
  Users,
  Heart,
  Star,
  Hash,
  Tag,
  Clock,
  Edit3,
  Trash2,
  ChevronRight,
  BarChart3,
  BookOpen,
  MessageSquare,
  Target,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createBadgeStyle,
  createProgressBarStyle,
  createSurfaceStyle,
  createEmptyStateStyle,
  createPersonalitySkeletonStyle,
  createPersonalitySectionHeaderStyle,
  createMetadataGridStyle,
  createMetadataFieldStyle,
  createMetadataLabelStyle,
  createMetadataValueStyle,
  createDividerStyle,
  getPersonalityTypography,
  getPersonalityBadgeRadius,
  clickableProps,
  listProps,
  listItemProps,
  formatDistanceToNow,
  ICON_SIZES,
} from '../../../helpers';
import type { BhQuestionBankBrowserProps, Question } from '../../core';

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function getDifficultyConfig(difficulty: Question['difficulty']): {
  label: string;
  color: 'success' | 'warning' | 'error';
} {
  switch (difficulty) {
    case 'easy':
      return { label: 'Easy', color: 'success' };
    case 'medium':
      return { label: 'Medium', color: 'warning' };
    case 'hard':
      return { label: 'Hard', color: 'error' };
    default:
      return { label: 'Unknown', color: 'warning' };
  }
}

function getTypeConfig(type: Question['type']): {
  label: string;
  icon: typeof Brain;
  color: 'primary' | 'info' | 'warning' | 'success';
} {
  switch (type) {
    case 'behavioral':
      return { label: 'Behavioral', icon: Brain, color: 'primary' };
    case 'technical':
      return { label: 'Technical', icon: Code2, color: 'info' };
    case 'situational':
      return { label: 'Situational', icon: Users, color: 'warning' };
    case 'cultural':
      return { label: 'Cultural', icon: Heart, color: 'success' };
    default:
      return { label: 'Other', icon: Brain, color: 'primary' };
  }
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export const DetailBhQuestionBankBrowser = createPreset<BhQuestionBankBrowserProps>(
  'DetailBhQuestionBankBrowser',
  ({ primitives, props, tokens }: PresetContext<BhQuestionBankBrowserProps>) => {
    const { Box, Text, Button } = primitives;

    const {
      selectedQuestion: question,
      data,
      loading = false,
      onSelectQuestion,
      onEditQuestion,
      onDeleteQuestion,
      className,
      style,
    } = props;

    const ptypo = getPersonalityTypography(tokens);
    const badgeRadius = getPersonalityBadgeRadius(tokens);

    // Related questions: same dimension, excluding current
    const relatedQuestions = useMemo(() => {
      if (!question || !data?.questions) return [];
      return data.questions
        .filter((q) => q.dimension === question.dimension && q.id !== question.id)
        .slice(0, 5);
    }, [question, data]);

    // ========================================================================
    // SKELETON LOADING
    // ========================================================================

    if (loading) {
      const skelStyle = createPersonalitySkeletonStyle(tokens);
      return (
        <Box className={className} style={{ ...style, padding: tokens.spacing[4] }}>
          <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[4] }}>
            <Box style={{ ...skelStyle, height: 32, width: 120 }} />
            <Box style={{ ...skelStyle, height: 80, width: '100%' }} />
            <Box style={{ display: 'flex', gap: tokens.spacing[2] }}>
              {[1, 2, 3].map((i) => (
                <Box key={i} style={{ ...skelStyle, height: 28, width: 80 }} />
              ))}
            </Box>
            <Box style={{ ...skelStyle, height: 200, width: '100%' }} />
            <Box style={{ ...skelStyle, height: 150, width: '100%' }} />
          </Box>
        </Box>
      );
    }

    // ========================================================================
    // NO QUESTION SELECTED
    // ========================================================================

    if (!question) {
      return (
        <Box className={className} style={{ ...style, padding: tokens.spacing[4] }}>
          <Box style={createEmptyStateStyle(tokens)}>
            <AlertCircle size={ICON_SIZES.illustration} style={{ color: tokens.colors.neutral[300], marginBottom: tokens.spacing[3] }} />
            <Text style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[600] }}>
              Question not found
            </Text>
            <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[400], marginTop: tokens.spacing[1] }}>
              Select a question from the library to view its details
            </Text>
          </Box>
        </Box>
      );
    }

    const diffCfg = getDifficultyConfig(question.difficulty);
    const typeCfg = getTypeConfig(question.type);
    const TypeIcon = typeCfg.icon;

    const effectivenessBar = createProgressBarStyle(tokens, {
      percent: question.effectiveness,
      color: question.effectiveness >= 70
        ? tokens.colors.successScale[500]
        : question.effectiveness >= 40
          ? tokens.colors.warningScale[500]
          : tokens.colors.errorScale[500],
    });

    // ========================================================================
    // MAIN RENDER
    // ========================================================================

    return (
      <Box className={className} style={{ ...style, display: 'flex', gap: tokens.spacing[5] }}>
        {/* Main Content */}
        <Box style={{ flex: 1, display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[4] }}>
          {/* Back Link */}
          <Box
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              cursor: 'pointer',
              color: tokens.colors.primaryScale[600],
              fontSize: tokens.typography.fontSize.sm,
              transition: `color ${tokens.motion.hover}`,
            }}
            onClick={() => onSelectQuestion?.('')}
            {...clickableProps(() => onSelectQuestion?.(''), 'Back to library')}
          >
            <ArrowLeft size={ICON_SIZES.section} />
            <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.primaryScale[600] }}>
              Back to Library
            </Text>
          </Box>

          {/* Question Text */}
          <Box style={{ ...createCardStyle(tokens), display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[3] }}>
            <Text style={{
              fontSize: tokens.typography.fontSize.xl,
              fontWeight: ptypo.headingWeight,
              color: tokens.colors.neutral[900],
              lineHeight: 1.6,
              letterSpacing: ptypo.headingLetterSpacing,
            }}>
              {question.text}
            </Text>

            {/* Badges Row */}
            <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], flexWrap: 'wrap' as const }}>
              <Box style={{ ...createBadgeStyle(tokens, typeCfg.color), borderRadius: badgeRadius, gap: 4 }}>
                <TypeIcon size={ICON_SIZES.inline} />
                {typeCfg.label}
              </Box>
              <Box style={{ ...createBadgeStyle(tokens, 'primary'), borderRadius: badgeRadius }}>
                {question.dimension}
              </Box>
              {question.competency && (
                <Box style={{ ...createBadgeStyle(tokens, 'secondary'), borderRadius: badgeRadius }}>
                  {question.competency}
                </Box>
              )}
              <Box style={{ ...createBadgeStyle(tokens, diffCfg.color), borderRadius: badgeRadius }}>
                {diffCfg.label}
              </Box>
            </Box>

            {/* Action buttons */}
            <Box style={{ display: 'flex', gap: tokens.spacing[2] }}>
              {onEditQuestion && (
                <Button onClick={() => onEditQuestion(question.id)}>
                  <Edit3 size={ICON_SIZES.section} />
                  Edit
                </Button>
              )}
              {onDeleteQuestion && (
                <Box
                  style={{
                    ...createBadgeStyle(tokens, 'error'),
                    borderRadius: badgeRadius,
                    cursor: 'pointer',
                    padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                    gap: 4,
                  }}
                  onClick={() => onDeleteQuestion(question.id)}
                  {...clickableProps(() => onDeleteQuestion(question.id), 'Delete question')}
                >
                  <Trash2 size={ICON_SIZES.label} />
                  <Text style={{ fontSize: tokens.typography.fontSize.sm }}>Delete</Text>
                </Box>
              )}
            </Box>
          </Box>

          {/* Metadata Grid */}
          <Box style={createMetadataGridStyle(tokens, { columns: 3, withBackground: true })}>
            <Box style={createMetadataFieldStyle(tokens)}>
              <Text style={createMetadataLabelStyle(tokens, { personality: ptypo })}>Dimension</Text>
              <Text style={createMetadataValueStyle(tokens)}>{question.dimension}</Text>
            </Box>
            <Box style={createMetadataFieldStyle(tokens)}>
              <Text style={createMetadataLabelStyle(tokens, { personality: ptypo })}>Competency</Text>
              <Text style={createMetadataValueStyle(tokens)}>{question.competency ?? 'General'}</Text>
            </Box>
            <Box style={createMetadataFieldStyle(tokens)}>
              <Text style={createMetadataLabelStyle(tokens, { personality: ptypo })}>Difficulty</Text>
              <Text style={createMetadataValueStyle(tokens)}>{diffCfg.label}</Text>
            </Box>
            <Box style={createMetadataFieldStyle(tokens)}>
              <Text style={createMetadataLabelStyle(tokens, { personality: ptypo })}>Type</Text>
              <Text style={createMetadataValueStyle(tokens)}>{typeCfg.label}</Text>
            </Box>
            <Box style={createMetadataFieldStyle(tokens)}>
              <Text style={createMetadataLabelStyle(tokens, { personality: ptypo })}>Created By</Text>
              <Text style={createMetadataValueStyle(tokens)}>{question.createdBy}</Text>
            </Box>
            <Box style={createMetadataFieldStyle(tokens)}>
              <Text style={createMetadataLabelStyle(tokens, { personality: ptypo })}>Last Updated</Text>
              <Text style={createMetadataValueStyle(tokens)}>
                {formatDistanceToNow(question.updatedAt, { addSuffix: true })}
              </Text>
            </Box>
          </Box>

          {/* Follow-Up Questions */}
          {question.followUps.length > 0 && (
            <Box style={{ ...createCardStyle(tokens), display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[3] }}>
              <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                <MessageSquare size={ICON_SIZES.section} style={{ color: tokens.colors.primaryScale[500] }} />
                <Text style={createPersonalitySectionHeaderStyle(tokens)}>
                  Follow-Up Questions
                </Text>
              </Box>
              <Box {...listProps('Follow-up questions')} style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[2] }}>
                {question.followUps.map((followUp, idx) => (
                  <Box
                    key={idx}
                    {...listItemProps()}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: tokens.spacing[2],
                      padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                      borderRadius: tokens.borderRadius.md,
                      backgroundColor: tokens.colors.neutral[50],
                    }}
                  >
                    <Box style={{
                      width: 20,
                      height: 20,
                      borderRadius: tokens.borderRadius.full,
                      backgroundColor: tokens.colors.primaryScale[100],
                      color: tokens.colors.primaryScale[700],
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: tokens.typography.fontSize.xs,
                      fontWeight: tokens.typography.fontWeight.semibold,
                      flexShrink: 0,
                    }}>
                      {idx + 1}
                    </Box>
                    <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[700], lineHeight: 1.5 }}>
                      {followUp}
                    </Text>
                  </Box>
                ))}
              </Box>
            </Box>
          )}

          {/* Rubric Guidance */}
          {question.rubricGuidance && (
            <Box style={{ ...createCardStyle(tokens), display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[3] }}>
              <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                <BookOpen size={ICON_SIZES.section} style={{ color: tokens.colors.infoScale[500] }} />
                <Text style={createPersonalitySectionHeaderStyle(tokens)}>
                  Rubric Guidance
                </Text>
              </Box>
              <Box style={{
                padding: tokens.spacing[3],
                borderRadius: tokens.borderRadius.md,
                backgroundColor: tokens.colors.infoScale[50],
                borderLeft: `3px solid ${tokens.colors.infoScale[400]}`,
              }}>
                <Text style={{
                  fontSize: tokens.typography.fontSize.sm,
                  color: tokens.colors.neutral[700],
                  lineHeight: 1.7,
                  whiteSpace: 'pre-wrap' as const,
                }}>
                  {question.rubricGuidance}
                </Text>
              </Box>
            </Box>
          )}

          {/* Effectiveness Metrics */}
          <Box style={{ ...createCardStyle(tokens), display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[3] }}>
            <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
              <BarChart3 size={ICON_SIZES.section} style={{ color: tokens.colors.successScale[500] }} />
              <Text style={createPersonalitySectionHeaderStyle(tokens)}>
                Effectiveness Metrics
              </Text>
            </Box>
            <Box style={createMetadataGridStyle(tokens, { columns: 3 })}>
              <Box style={{
                ...createMetadataFieldStyle(tokens, { withBackground: true }),
                alignItems: 'center',
              }}>
                <Star size={ICON_SIZES.feature} style={{ color: tokens.colors.warningScale[500] }} />
                <Text style={{ fontSize: tokens.typography.fontSize['2xl'], fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900] }}>
                  {question.effectiveness}%
                </Text>
                <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>
                  Effectiveness Score
                </Text>
              </Box>
              <Box style={{
                ...createMetadataFieldStyle(tokens, { withBackground: true }),
                alignItems: 'center',
              }}>
                <Hash size={ICON_SIZES.feature} style={{ color: tokens.colors.primaryScale[500] }} />
                <Text style={{ fontSize: tokens.typography.fontSize['2xl'], fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900] }}>
                  {question.usageCount}
                </Text>
                <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>
                  Times Used
                </Text>
              </Box>
              <Box style={{
                ...createMetadataFieldStyle(tokens, { withBackground: true }),
                alignItems: 'center',
              }}>
                <TrendingUp size={ICON_SIZES.feature} style={{ color: tokens.colors.successScale[500] }} />
                <Text style={{ fontSize: tokens.typography.fontSize['2xl'], fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900] }}>
                  --
                </Text>
                <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>
                  Avg Score Variance
                </Text>
              </Box>
            </Box>
            {/* Effectiveness bar */}
            <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
              <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], minWidth: 80 }}>
                Effectiveness
              </Text>
              <Box style={{ ...effectivenessBar.track, flex: 1 }}>
                <Box style={effectivenessBar.fill} />
              </Box>
              <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[600], minWidth: 40, textAlign: 'right' as const }}>
                {question.effectiveness}%
              </Text>
            </Box>
          </Box>

          {/* Tags */}
          {question.tags.length > 0 && (
            <Box style={{ ...createCardStyle(tokens), display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[2] }}>
              <Text style={createPersonalitySectionHeaderStyle(tokens)}>Tags</Text>
              <Box style={{ display: 'flex', flexWrap: 'wrap' as const, gap: tokens.spacing[1] }}>
                {question.tags.map((tag) => (
                  <Box
                    key={tag}
                    style={{ ...createBadgeStyle(tokens, 'secondary'), borderRadius: badgeRadius, gap: 4 }}
                  >
                    <Tag size={ICON_SIZES.inline} />
                    {tag}
                  </Box>
                ))}
              </Box>
            </Box>
          )}
        </Box>

        {/* Related Questions Sidebar */}
        <Box style={{ width: 300, flexShrink: 0 }}>
          <Box style={{ ...createCardStyle(tokens), display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[3], position: 'sticky' as const, top: tokens.spacing[4] }}>
            <Text style={createPersonalitySectionHeaderStyle(tokens)}>
              Related Questions
            </Text>

            {relatedQuestions.length === 0 && (
              <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[400] }}>
                No related questions found
              </Text>
            )}

            <Box {...listProps('Related questions')} style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[1] }}>
              {relatedQuestions.map((rq) => {
                const rqDiff = getDifficultyConfig(rq.difficulty);
                return (
                  <Box
                    key={rq.id}
                    {...listItemProps()}
                    style={{
                      padding: `${tokens.spacing[2]}px ${tokens.spacing[2]}px`,
                      borderRadius: tokens.borderRadius.md,
                      cursor: 'pointer',
                      transition: `background-color ${tokens.motion.hover}`,
                      display: 'flex',
                      flexDirection: 'column' as const,
                      gap: tokens.spacing[1],
                    }}
                    onClick={() => onSelectQuestion?.(rq.id)}
                    {...clickableProps(() => onSelectQuestion?.(rq.id), `View question: ${rq.text.slice(0, 40)}`)}
                  >
                    <Text style={{
                      fontSize: tokens.typography.fontSize.sm,
                      color: tokens.colors.neutral[700],
                      lineHeight: 1.4,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical' as any,
                      overflow: 'hidden' as const,
                    }}>
                      {rq.text}
                    </Text>
                    <Box style={{ display: 'flex', gap: tokens.spacing[1], alignItems: 'center' }}>
                      <Box style={{ ...createBadgeStyle(tokens, rqDiff.color), borderRadius: badgeRadius, padding: `1px ${tokens.spacing[1]}px`, fontSize: tokens.typography.fontSize.xs }}>
                        {rqDiff.label}
                      </Box>
                      <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>
                        {rq.effectiveness}% eff.
                      </Text>
                      <ChevronRight size={ICON_SIZES.inline} style={{ color: tokens.colors.neutral[400], marginLeft: 'auto' }} />
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </Box>
        </Box>
      </Box>
    );
  }
);

DetailBhQuestionBankBrowser.displayName = 'DetailBhQuestionBankBrowser';
