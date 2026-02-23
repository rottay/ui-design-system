'use client';

/**
 * BhQuestionAbTest - Detail Preset
 * Shows a single experiment with full variant comparison, live metrics,
 * assignment history, and action controls.
 */

import { useState, useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createCardHoverStyles,
  createEntranceAnimation,
  createStaggerDelay,
  createBadgeStyle,
  createEmptyStateStyle,
  createPersonalitySectionHeaderStyle,
  createPersonalitySkeletonStyle,
  createProgressBarStyle,
  createDividerStyle,
  getPersonalityTypography,
  getPersonalityBadgeRadius,
  createPersonalityAccentBar,
  createMetadataGridStyle,
  createMetadataFieldStyle,
  createMetadataLabelStyle,
  createMetadataValueStyle,
  ICON_SIZES,
  clickableProps,
  formatDate,
  formatScore,
} from '../../../helpers';
import type { BhQuestionAbTestProps, ExperimentData, QuestionVariant, AssignmentRecord } from '../../core';
import {
  getExperimentStatusConfig,
  getConfidenceDisplay,
  getSampleProgress,
  formatExperimentScore,
  getLeadingVariant,
} from '../../core';
import type { DesignTokens } from '../../../../../types';
import {
  FlaskConical,
  Trophy,
  Users,
  Target,
  Play,
  Pause,
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronUp,
  Clock,
  FileText,
  BarChart3,
  ArrowLeft,
  AlertCircle,
  Star,
  Lightbulb,
} from 'lucide-react';

/* ---------------------------------------------------------------------------
 * Sub-components
 * -------------------------------------------------------------------------*/

let _Box: any;
let _Text: any;

function VariantDetailPanel({
  variant,
  index,
  isWinner,
  isLeading,
  tokens: t,
}: {
  variant: QuestionVariant;
  index: number;
  isWinner: boolean;
  isLeading: boolean;
  tokens: DesignTokens;
}) {
  const Box = _Box;
  const Text = _Text;
  const br = getPersonalityBadgeRadius(t);

  const letterLabel = String.fromCharCode(65 + index);
  const headerColor = variant.isControl ? t.colors.primaryScale : t.colors.secondaryScale;

  return (
    <Box style={{
      flex: 1,
      display: 'flex', flexDirection: 'column' as const,
      borderRadius: t.borderRadius.lg,
      border: `2px solid ${isWinner ? t.colors.successScale[300] : isLeading ? t.colors.successScale[200] : t.colors.neutral[200]}`,
      overflow: 'hidden',
      backgroundColor: t.colors.common.white,
    }}>
      {/* Variant header */}
      <Box style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: `${t.spacing[3]}px ${t.spacing[4]}px`,
        backgroundColor: isWinner ? t.colors.successScale[50] : t.colors.neutral[50],
        borderBottom: `1px solid ${isWinner ? t.colors.successScale[200] : t.colors.neutral[200]}`,
      }}>
        <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
          <Box style={{
            width: 28, height: 28, borderRadius: br,
            backgroundColor: headerColor[100],
            color: headerColor[700],
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.bold,
          }}>
            {letterLabel}
          </Box>
          <Text style={{
            fontSize: t.typography.fontSize.sm,
            fontWeight: t.typography.fontWeight.semibold,
            color: t.colors.neutral[900],
          }}>
            {variant.label}
          </Text>
        </Box>
        <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
          {variant.isControl && (
            <Box style={{ ...createBadgeStyle(t, 'info'), borderRadius: br }}>
              <Text style={{ fontSize: t.typography.fontSize.xs }}>Control</Text>
            </Box>
          )}
          {isWinner && (
            <Box style={{ ...createBadgeStyle(t, 'success'), borderRadius: br, display: 'flex', alignItems: 'center', gap: 4 }}>
              <Trophy size={ICON_SIZES.inline} />
              <Text style={{ fontSize: t.typography.fontSize.xs }}>Winner</Text>
            </Box>
          )}
          {isLeading && !isWinner && (
            <Box style={{ ...createBadgeStyle(t, 'success'), borderRadius: br }}>
              <Text style={{ fontSize: t.typography.fontSize.xs }}>Leading</Text>
            </Box>
          )}
        </Box>
      </Box>

      {/* Question text */}
      <Box style={{ padding: `${t.spacing[4]}px`, borderBottom: `1px solid ${t.colors.neutral[100]}` }}>
        <Text style={{
          fontSize: t.typography.fontSize.xs,
          fontWeight: t.typography.fontWeight.semibold,
          color: t.colors.neutral[500],
          textTransform: 'uppercase' as const,
          letterSpacing: '0.05em',
          marginBottom: t.spacing[2],
        }}>
          Question
        </Text>
        <Box style={{
          padding: `${t.spacing[3]}px`,
          borderRadius: t.borderRadius.md,
          backgroundColor: t.colors.neutral[50],
          border: `1px solid ${t.colors.neutral[100]}`,
        }}>
          <Text style={{
            fontSize: t.typography.fontSize.sm,
            color: t.colors.neutral[800],
            lineHeight: 1.6,
            fontStyle: 'italic' as const,
          }}>
            &ldquo;{variant.questionText}&rdquo;
          </Text>
        </Box>
      </Box>

      {/* Metrics */}
      <Box style={{ padding: `${t.spacing[4]}px`, display: 'flex', flexDirection: 'column' as const, gap: t.spacing[3] }}>
        <Box style={createMetadataGridStyle(t, { columns: 2 })}>
          <Box style={createMetadataFieldStyle(t)}>
            <Text style={createMetadataLabelStyle(t)}>Average Score</Text>
            <Text style={{
              fontSize: t.typography.fontSize.xl,
              fontWeight: t.typography.fontWeight.bold,
              color: t.colors.neutral[900],
            }}>
              {variant.sampleSize > 0 ? formatExperimentScore(variant.avgScore) : '--'}
            </Text>
          </Box>
          <Box style={createMetadataFieldStyle(t)}>
            <Text style={createMetadataLabelStyle(t)}>Sample Size</Text>
            <Text style={{
              fontSize: t.typography.fontSize.xl,
              fontWeight: t.typography.fontWeight.bold,
              color: t.colors.neutral[900],
            }}>
              {variant.sampleSize}
            </Text>
          </Box>
        </Box>

        {variant.stdDev != null && variant.sampleSize > 0 && (
          <Box style={createMetadataGridStyle(t, { columns: 2 })}>
            <Box style={createMetadataFieldStyle(t)}>
              <Text style={createMetadataLabelStyle(t)}>Std Deviation</Text>
              <Text style={createMetadataValueStyle(t)}>{variant.stdDev.toFixed(2)}</Text>
            </Box>
            {variant.conversionRate != null && (
              <Box style={createMetadataFieldStyle(t)}>
                <Text style={createMetadataLabelStyle(t)}>Conversion Rate</Text>
                <Text style={createMetadataValueStyle(t)}>{(variant.conversionRate * 100).toFixed(1)}%</Text>
              </Box>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
}

function AssignmentHistoryTable({
  assignments,
  tokens: t,
}: {
  assignments: AssignmentRecord[];
  tokens: DesignTokens;
}) {
  const Box = _Box;
  const Text = _Text;
  const br = getPersonalityBadgeRadius(t);

  if (assignments.length === 0) {
    return (
      <Box style={{
        ...createEmptyStateStyle(t),
        padding: `${t.spacing[6]}px`,
      }}>
        <Users size={ICON_SIZES.hero} style={{ color: t.colors.neutral[300], marginBottom: t.spacing[2] }} />
        <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[400] }}>
          No assignments yet
        </Text>
      </Box>
    );
  }

  return (
    <Box style={{ display: 'flex', flexDirection: 'column' as const, overflow: 'hidden' }}>
      {/* Header row */}
      <Box style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr 100px 80px',
        gap: t.spacing[3], padding: `${t.spacing[2]}px ${t.spacing[3]}px`,
        backgroundColor: t.colors.neutral[50],
        borderBottom: `1px solid ${t.colors.neutral[200]}`,
      }}>
        {['Candidate', 'Variant', 'Score', 'Date'].map(header => (
          <Text key={header} style={{
            fontSize: t.typography.fontSize.xs,
            fontWeight: t.typography.fontWeight.semibold,
            color: t.colors.neutral[500],
            textTransform: 'uppercase' as const,
            letterSpacing: '0.05em',
          }}>
            {header}
          </Text>
        ))}
      </Box>
      {/* Rows */}
      <Box style={{ maxHeight: 240, overflow: 'auto' }}>
        {assignments.map((a, i) => (
          <Box key={`${a.interviewId}-${i}`} style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr 100px 80px',
            gap: t.spacing[3], padding: `${t.spacing[2]}px ${t.spacing[3]}px`,
            borderBottom: `1px solid ${t.colors.neutral[100]}`,
            transition: `background-color ${t.motion.hover}`,
          }}>
            <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[800] }}>
              {a.candidateName ?? a.candidateId.slice(0, 8)}
            </Text>
            <Box style={{
              ...createBadgeStyle(t, 'primary'),
              borderRadius: br, alignSelf: 'flex-start',
            }}>
              <Text style={{ fontSize: t.typography.fontSize.xs }}>{a.variantLabel}</Text>
            </Box>
            <Text style={{
              fontSize: t.typography.fontSize.sm,
              fontWeight: t.typography.fontWeight.semibold,
              color: a.score != null ? t.colors.neutral[900] : t.colors.neutral[400],
            }}>
              {a.score != null ? formatScore(a.score) : '--'}
            </Text>
            <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>
              {formatDate(a.assignedAt, { month: 'short', day: 'numeric' })}
            </Text>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

/* ---------------------------------------------------------------------------
 * Detail Preset
 * -------------------------------------------------------------------------*/

export const DetailBhQuestionAbTest = createPreset<BhQuestionAbTestProps>({
  name: 'BhQuestionAbTest.Detail',
  render: ({ primitives, props, tokens: t }: PresetContext<BhQuestionAbTestProps>) => {
    const { Box, Text } = primitives;
    _Box = Box;
    _Text = Text;

    const br = useMemo(() => getPersonalityBadgeRadius(t), [t]);
    const ptypo = useMemo(() => getPersonalityTypography(t), [t]);
    const statusConfig = useMemo(() => getExperimentStatusConfig(t), [t]);
    const entrance = useMemo(() => createEntranceAnimation(t), [t]);
    const accentBar = useMemo(() => createPersonalityAccentBar(t), [t]);
    const skeleton = useMemo(() => createPersonalitySkeletonStyle(t), [t]);

    const {
      selectedExperiment: experiment,
      onCompleteExperiment,
      onStatusChange,
      assignments: rawAssignments = [],
      loading = false,
      className,
      style,
    } = props;

    const assignments = Array.isArray(rawAssignments) ? rawAssignments : [];

    const [selectedWinner, setSelectedWinner] = useState<string | null>(null);
    const [showAssignments, setShowAssignments] = useState(true);

    // Loading state
    if (loading || !experiment) {
      return (
        <Box className={className} style={{
          display: 'flex', flexDirection: 'column' as const, gap: t.spacing[5],
          height: '100%', ...style,
        }}>
          <Box style={{ display: 'flex', gap: t.spacing[3] }}>
            <Box style={{ ...skeleton, width: 200, height: 24 }} />
            <Box style={{ ...skeleton, width: 80, height: 24, borderRadius: t.borderRadius.full }} />
          </Box>
          <Box style={{ display: 'flex', gap: t.spacing[4] }}>
            <Box style={{ ...skeleton, flex: 1, height: 300, borderRadius: t.borderRadius.lg }} />
            <Box style={{ ...skeleton, flex: 1, height: 300, borderRadius: t.borderRadius.lg }} />
          </Box>
          <Box style={{ ...skeleton, width: '100%', height: 200, borderRadius: t.borderRadius.lg }} />
        </Box>
      );
    }

    const sc = statusConfig[experiment.status];
    const leader = getLeadingVariant(experiment);
    const { text: confidenceText, color: confidenceColor, percent: confidencePercent } = getConfidenceDisplay(t, experiment.statisticalSignificance);
    const samplePercent = getSampleProgress(experiment.currentSampleSize, experiment.minimumSampleSize);

    return (
      <Box className={className} style={{
        display: 'flex', flexDirection: 'column' as const, gap: t.spacing[5],
        height: '100%', overflow: 'auto', ...style,
      }}>
        {accentBar && <Box style={accentBar} />}

        {/* Header */}
        <Box style={{
          ...createCardStyle(t, { elevation: 'sm' }),
          padding: `${t.spacing[5]}px`,
          display: 'flex', flexDirection: 'column' as const, gap: t.spacing[4],
          ...entrance.animate, transition: entrance.transition,
        }}>
          <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[2] }}>
              <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
                <FlaskConical size={ICON_SIZES.feature} style={{ color: t.colors.primaryScale[600] }} />
                <Text style={{
                  fontSize: t.typography.fontSize.xl,
                  fontWeight: ptypo.headingWeight,
                  color: t.colors.neutral[900],
                  letterSpacing: ptypo.headingLetterSpacing,
                }}>
                  {experiment.name}
                </Text>
                <Box style={{
                  padding: `${t.spacing[1]}px ${t.spacing[2]}px`,
                  borderRadius: br,
                  backgroundColor: sc.bgColor,
                  color: sc.color,
                  border: `1px solid ${sc.borderColor}`,
                  fontSize: t.typography.fontSize.xs,
                  fontWeight: t.typography.fontWeight.semibold,
                }}>
                  <Text style={{ fontSize: t.typography.fontSize.xs }}>{sc.label}</Text>
                </Box>
              </Box>
              <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[500] }}>
                {experiment.competency}
                {experiment.rubricName ? ` | ${experiment.rubricName}` : ''}
                {experiment.dimensionName ? ` | ${experiment.dimensionName}` : ''}
              </Text>
              {experiment.description && (
                <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[600], marginTop: t.spacing[1] }}>
                  {experiment.description}
                </Text>
              )}
            </Box>

            {/* Action buttons */}
            <Box style={{ display: 'flex', gap: t.spacing[2] }}>
              {experiment.status === 'running' && onStatusChange && (
                <Box
                  onClick={() => onStatusChange(experiment.id, 'paused')}
                  {...clickableProps(() => onStatusChange(experiment.id, 'paused'), 'Pause experiment')}
                  style={{
                    display: 'flex', alignItems: 'center', gap: t.spacing[1],
                    padding: `${t.spacing[2]}px ${t.spacing[3]}px`,
                    borderRadius: t.borderRadius.md,
                    border: `1px solid ${t.colors.warningScale[300]}`,
                    backgroundColor: t.colors.warningScale[50],
                    color: t.colors.warningScale[700],
                    fontSize: t.typography.fontSize.xs,
                    fontWeight: t.typography.fontWeight.semibold,
                    cursor: 'pointer',
                    transition: `all ${t.motion.hover}`,
                  }}
                >
                  <Pause size={ICON_SIZES.label} />
                  <Text style={{ fontSize: t.typography.fontSize.xs }}>Pause</Text>
                </Box>
              )}
              {experiment.status === 'paused' && onStatusChange && (
                <Box
                  onClick={() => onStatusChange(experiment.id, 'running')}
                  {...clickableProps(() => onStatusChange(experiment.id, 'running'), 'Resume experiment')}
                  style={{
                    display: 'flex', alignItems: 'center', gap: t.spacing[1],
                    padding: `${t.spacing[2]}px ${t.spacing[3]}px`,
                    borderRadius: t.borderRadius.md,
                    border: `1px solid ${t.colors.successScale[300]}`,
                    backgroundColor: t.colors.successScale[50],
                    color: t.colors.successScale[700],
                    fontSize: t.typography.fontSize.xs,
                    fontWeight: t.typography.fontWeight.semibold,
                    cursor: 'pointer',
                    transition: `all ${t.motion.hover}`,
                  }}
                >
                  <Play size={ICON_SIZES.label} />
                  <Text style={{ fontSize: t.typography.fontSize.xs }}>Resume</Text>
                </Box>
              )}
              {(experiment.status === 'running' || experiment.status === 'paused') && onStatusChange && (
                <Box
                  onClick={() => onStatusChange(experiment.id, 'cancelled')}
                  {...clickableProps(() => onStatusChange(experiment.id, 'cancelled'), 'Cancel experiment')}
                  style={{
                    display: 'flex', alignItems: 'center', gap: t.spacing[1],
                    padding: `${t.spacing[2]}px ${t.spacing[3]}px`,
                    borderRadius: t.borderRadius.md,
                    border: `1px solid ${t.colors.errorScale[300]}`,
                    backgroundColor: t.colors.common.white,
                    color: t.colors.errorScale[600],
                    fontSize: t.typography.fontSize.xs,
                    fontWeight: t.typography.fontWeight.semibold,
                    cursor: 'pointer',
                    transition: `all ${t.motion.hover}`,
                  }}
                >
                  <XCircle size={ICON_SIZES.label} />
                  <Text style={{ fontSize: t.typography.fontSize.xs }}>Cancel</Text>
                </Box>
              )}
            </Box>
          </Box>

          {/* Hypothesis */}
          {experiment.hypothesis && (
            <Box style={{
              display: 'flex', alignItems: 'flex-start', gap: t.spacing[2],
              padding: `${t.spacing[3]}px`,
              borderRadius: t.borderRadius.md,
              backgroundColor: t.colors.infoScale[50],
              border: `1px solid ${t.colors.infoScale[200]}`,
            }}>
              <Lightbulb size={ICON_SIZES.section} style={{ color: t.colors.infoScale[600], flexShrink: 0, marginTop: 2 }} />
              <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1] }}>
                <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.semibold, color: t.colors.infoScale[700] }}>
                  Hypothesis
                </Text>
                <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.infoScale[800] }}>
                  {experiment.hypothesis}
                </Text>
              </Box>
            </Box>
          )}

          {/* Progress summary */}
          <Box style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: t.spacing[4] }}>
            <Box style={createMetadataFieldStyle(t, { withBackground: true })}>
              <Text style={createMetadataLabelStyle(t, { personality: ptypo })}>Total Samples</Text>
              <Text style={{ fontSize: t.typography.fontSize.lg, fontWeight: t.typography.fontWeight.bold, color: t.colors.neutral[900] }}>
                {experiment.currentSampleSize}
              </Text>
            </Box>
            <Box style={createMetadataFieldStyle(t, { withBackground: true })}>
              <Text style={createMetadataLabelStyle(t, { personality: ptypo })}>Target</Text>
              <Text style={{ fontSize: t.typography.fontSize.lg, fontWeight: t.typography.fontWeight.bold, color: t.colors.neutral[900] }}>
                {experiment.minimumSampleSize}
              </Text>
            </Box>
            <Box style={createMetadataFieldStyle(t, { withBackground: true })}>
              <Text style={createMetadataLabelStyle(t, { personality: ptypo })}>Progress</Text>
              <Text style={{ fontSize: t.typography.fontSize.lg, fontWeight: t.typography.fontWeight.bold, color: samplePercent >= 100 ? t.colors.successScale[600] : t.colors.primaryScale[600] }}>
                {samplePercent}%
              </Text>
            </Box>
            <Box style={createMetadataFieldStyle(t, { withBackground: true })}>
              <Text style={createMetadataLabelStyle(t, { personality: ptypo })}>Significance</Text>
              <Text style={{ fontSize: t.typography.fontSize.lg, fontWeight: t.typography.fontWeight.bold, color: confidenceColor }}>
                {confidenceText}
              </Text>
            </Box>
          </Box>
        </Box>

        {/* Winner announcement for completed experiments */}
        {experiment.status === 'completed' && experiment.winnerVariantId && (
          <Box style={{
            ...createCardStyle(t, { elevation: 'md' }),
            display: 'flex', alignItems: 'center', gap: t.spacing[4],
            padding: `${t.spacing[5]}px`,
            backgroundColor: t.colors.successScale[50],
            border: `2px solid ${t.colors.successScale[300]}`,
          }}>
            <Box style={{
              width: 48, height: 48, borderRadius: t.borderRadius.full,
              backgroundColor: t.colors.successScale[100],
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <Trophy size={ICON_SIZES.feature} style={{ color: t.colors.successScale[600] }} />
            </Box>
            <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1] }}>
              <Text style={{ fontSize: t.typography.fontSize.md, fontWeight: t.typography.fontWeight.bold, color: t.colors.successScale[800] }}>
                Experiment Complete
              </Text>
              <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.successScale[700] }}>
                Winner: {experiment.variants.find(v => v.id === experiment.winnerVariantId)?.label ?? 'Unknown'} with an average score of{' '}
                {formatExperimentScore(experiment.variants.find(v => v.id === experiment.winnerVariantId)?.avgScore ?? 0)}
              </Text>
            </Box>
          </Box>
        )}

        {/* Variant comparison side-by-side */}
        <Box style={{ display: 'flex', gap: t.spacing[4] }}>
          {experiment.variants.map((variant, idx) => (
            <VariantDetailPanel
              key={variant.id}
              variant={variant}
              index={idx}
              isWinner={experiment.winnerVariantId === variant.id}
              isLeading={leader?.id === variant.id && experiment.variants.length > 1 && variant.sampleSize > 0}
              tokens={t}
            />
          ))}
        </Box>

        {/* Complete experiment section */}
        {(experiment.status === 'running' || experiment.status === 'paused') && onCompleteExperiment && (
          <Box style={{
            ...createCardStyle(t, { elevation: 'sm' }),
            padding: `${t.spacing[5]}px`,
            display: 'flex', flexDirection: 'column' as const, gap: t.spacing[3],
          }}>
            <Text style={{
              fontSize: t.typography.fontSize.sm,
              fontWeight: t.typography.fontWeight.semibold,
              color: t.colors.neutral[900],
            }}>
              Complete Experiment
            </Text>
            <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[500] }}>
              Select the winning variant to conclude this experiment:
            </Text>
            <Box style={{ display: 'flex', gap: t.spacing[3] }}>
              {experiment.variants.map((variant, idx) => {
                const isSelected = selectedWinner === variant.id;
                return (
                  <Box
                    key={variant.id}
                    onClick={() => setSelectedWinner(variant.id)}
                    {...clickableProps(() => setSelectedWinner(variant.id), `Select ${variant.label} as winner`)}
                    style={{
                      flex: 1,
                      display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: t.spacing[2],
                      padding: `${t.spacing[3]}px`,
                      borderRadius: t.borderRadius.lg,
                      border: `2px solid ${isSelected ? t.colors.successScale[400] : t.colors.neutral[200]}`,
                      backgroundColor: isSelected ? t.colors.successScale[50] : t.colors.common.white,
                      cursor: 'pointer',
                      transition: `all ${t.motion.hover}`,
                    }}
                  >
                    {isSelected && <CheckCircle size={ICON_SIZES.section} style={{ color: t.colors.successScale[500] }} />}
                    <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.semibold, color: isSelected ? t.colors.successScale[700] : t.colors.neutral[700] }}>
                      {variant.label}
                    </Text>
                    <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>
                      Avg: {variant.sampleSize > 0 ? formatExperimentScore(variant.avgScore) : '--'}
                    </Text>
                  </Box>
                );
              })}
            </Box>
            {selectedWinner && (
              <Box
                onClick={() => onCompleteExperiment(experiment.id, selectedWinner)}
                {...clickableProps(() => onCompleteExperiment(experiment.id, selectedWinner), 'Confirm and complete experiment')}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: t.spacing[2],
                  padding: `${t.spacing[3]}px`,
                  borderRadius: t.borderRadius.lg,
                  backgroundColor: t.colors.successScale[600],
                  color: t.colors.common.white,
                  fontSize: t.typography.fontSize.sm,
                  fontWeight: t.typography.fontWeight.semibold,
                  cursor: 'pointer',
                  transition: `all ${t.motion.hover}`,
                  width: '100%',
                }}
              >
                <CheckCircle size={ICON_SIZES.section} />
                <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.semibold, color: t.colors.common.white }}>
                  Complete Experiment
                </Text>
              </Box>
            )}
          </Box>
        )}

        {/* Assignment history */}
        <Box style={{
          ...createCardStyle(t, { elevation: 'sm' }),
          overflow: 'hidden',
        }}>
          <Box
            onClick={() => setShowAssignments(!showAssignments)}
            {...clickableProps(() => setShowAssignments(!showAssignments), 'Toggle assignment history')}
            style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: `${t.spacing[4]}px`,
              borderBottom: showAssignments ? `1px solid ${t.colors.neutral[100]}` : 'none',
              cursor: 'pointer',
            }}
          >
            <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
              <Users size={ICON_SIZES.section} style={{ color: t.colors.neutral[500] }} />
              <Text style={{
                fontSize: t.typography.fontSize.sm,
                fontWeight: t.typography.fontWeight.semibold,
                color: t.colors.neutral[900],
              }}>
                Assignment History
              </Text>
              <Box style={{
                ...createBadgeStyle(t, 'secondary'),
                borderRadius: br,
              }}>
                <Text style={{ fontSize: t.typography.fontSize.xs }}>{assignments.length}</Text>
              </Box>
            </Box>
            {showAssignments
              ? <ChevronUp size={ICON_SIZES.section} style={{ color: t.colors.neutral[400] }} />
              : <ChevronDown size={ICON_SIZES.section} style={{ color: t.colors.neutral[400] }} />
            }
          </Box>
          {showAssignments && (
            <AssignmentHistoryTable assignments={assignments} tokens={t} />
          )}
        </Box>

        {/* Dates footer */}
        <Box style={{ display: 'flex', gap: t.spacing[4], padding: `0 ${t.spacing[1]}px` }}>
          <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>
            Created: {formatDate(experiment.createdAt)}
          </Text>
          {experiment.startedAt && (
            <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>
              Started: {formatDate(experiment.startedAt)}
            </Text>
          )}
          {experiment.completedAt && (
            <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>
              Completed: {formatDate(experiment.completedAt)}
            </Text>
          )}
        </Box>
      </Box>
    );
  },
});
