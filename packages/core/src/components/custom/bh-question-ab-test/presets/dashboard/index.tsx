'use client';

/**
 * BhQuestionAbTest - Dashboard Preset
 * Lists experiments as cards with status badges, variant comparison,
 * statistical significance indicators, and filtering controls.
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
  createFilterPillStyle,
  createProgressBarStyle,
  getPersonalityTypography,
  getPersonalityBadgeRadius,
  createPersonalityAccentBar,
  createDividerStyle,
  ICON_SIZES,
  clickableProps,
  formatDate,
} from '../../../helpers';
import type { BhQuestionAbTestProps, ExperimentData } from '../../core';
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
  Plus,
  Search,
  ChevronRight,
  Trophy,
  Users,
  BarChart3,
  Target,
  Beaker,
  FileText,
  AlertCircle,
} from 'lucide-react';

/* ---------------------------------------------------------------------------
 * Sub-components
 * -------------------------------------------------------------------------*/

let _Box: any;
let _Text: any;

function ConfidenceMeter({
  significance,
  tokens: t,
}: {
  significance: number | null | undefined;
  tokens: DesignTokens;
}) {
  const Box = _Box;
  const Text = _Text;
  const { text, color, percent } = getConfidenceDisplay(t, significance);
  const progressStyles = createProgressBarStyle(t, { color, percent });

  return (
    <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1], width: '100%' }}>
      <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>
          Statistical Significance
        </Text>
        <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.semibold, color }}>
          {text}
        </Text>
      </Box>
      <Box style={progressStyles.track}>
        <Box style={progressStyles.fill} />
      </Box>
    </Box>
  );
}

function SampleProgressBar({
  current,
  minimum,
  tokens: t,
}: {
  current: number;
  minimum: number;
  tokens: DesignTokens;
}) {
  const Box = _Box;
  const Text = _Text;
  const percent = getSampleProgress(current, minimum);
  const color = percent >= 100 ? t.colors.successScale[500] : t.colors.primaryScale[500];
  const progressStyles = createProgressBarStyle(t, { color, percent });

  return (
    <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1], width: '100%' }}>
      <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>
          Samples
        </Text>
        <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.medium, color: t.colors.neutral[700] }}>
          {current} / {minimum}
        </Text>
      </Box>
      <Box style={progressStyles.track}>
        <Box style={progressStyles.fill} />
      </Box>
    </Box>
  );
}

function VariantComparisonCard({
  experiment,
  tokens: t,
}: {
  experiment: ExperimentData;
  tokens: DesignTokens;
}) {
  const Box = _Box;
  const Text = _Text;
  const br = getPersonalityBadgeRadius(t);
  const leader = getLeadingVariant(experiment);

  return (
    <Box style={{
      display: 'flex', gap: t.spacing[3],
      padding: `${t.spacing[3]}px`,
      borderRadius: t.borderRadius.md,
      backgroundColor: t.colors.neutral[50],
      border: `1px solid ${t.colors.neutral[100]}`,
    }}>
      {experiment.variants.map((variant, idx) => {
        const isLeading = leader?.id === variant.id && experiment.variants.length > 1 && variant.sampleSize > 0;
        return (
          <Box key={variant.id} style={{
            flex: 1, display: 'flex', flexDirection: 'column' as const, gap: t.spacing[2],
            padding: `${t.spacing[3]}px`,
            borderRadius: t.borderRadius.md,
            backgroundColor: t.colors.common.white,
            border: `1px solid ${isLeading ? t.colors.successScale[200] : t.colors.neutral[100]}`,
          }}>
            <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1] }}>
                <Box style={{
                  width: 20, height: 20, borderRadius: br,
                  backgroundColor: variant.isControl ? t.colors.primaryScale[50] : t.colors.secondaryScale[50],
                  color: variant.isControl ? t.colors.primaryScale[700] : t.colors.secondaryScale[700],
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.bold,
                }}>
                  {String.fromCharCode(65 + idx)}
                </Box>
                <Text style={{
                  fontSize: t.typography.fontSize.xs,
                  fontWeight: t.typography.fontWeight.semibold,
                  color: t.colors.neutral[800],
                }}>
                  {variant.label}
                </Text>
              </Box>
              {variant.isControl && (
                <Box style={{
                  ...createBadgeStyle(t, 'info'),
                  borderRadius: br,
                  padding: `0 ${t.spacing[2]}px`,
                }}>
                  <Text style={{ fontSize: t.typography.fontSize.xs }}>Control</Text>
                </Box>
              )}
              {isLeading && !variant.isControl && (
                <Trophy size={ICON_SIZES.label} style={{ color: t.colors.successScale[500] }} />
              )}
            </Box>
            <Text style={{
              fontSize: t.typography.fontSize.xs,
              color: t.colors.neutral[600],
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical' as any,
              overflow: 'hidden',
              lineHeight: 1.4,
            }}>
              {variant.questionText}
            </Text>
            <Box style={{ display: 'flex', gap: t.spacing[3], marginTop: 'auto' }}>
              <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1] }}>
                <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>
                  Avg Score
                </Text>
                <Text style={{
                  fontSize: t.typography.fontSize.md,
                  fontWeight: t.typography.fontWeight.bold,
                  color: t.colors.neutral[900],
                }}>
                  {variant.sampleSize > 0 ? formatExperimentScore(variant.avgScore) : '--'}
                </Text>
              </Box>
              <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1] }}>
                <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>
                  Samples
                </Text>
                <Text style={{
                  fontSize: t.typography.fontSize.md,
                  fontWeight: t.typography.fontWeight.bold,
                  color: t.colors.neutral[900],
                }}>
                  {variant.sampleSize}
                </Text>
              </Box>
            </Box>
          </Box>
        );
      })}
    </Box>
  );
}

function SkeletonCard({ tokens: t, index }: { tokens: DesignTokens; index: number }) {
  const Box = _Box;
  const skeleton = createPersonalitySkeletonStyle(t);
  const entrance = createEntranceAnimation(t, { index });

  return (
    <Box style={{
      ...createCardStyle(t, { elevation: 'sm' }),
      padding: `${t.spacing[5]}px`,
      display: 'flex', flexDirection: 'column' as const, gap: t.spacing[4],
      ...entrance.animate, transition: entrance.transition,
    }}>
      <Box style={{ display: 'flex', justifyContent: 'space-between' }}>
        <Box style={{ ...skeleton, width: 160, height: 16 }} />
        <Box style={{ ...skeleton, width: 60, height: 20, borderRadius: t.borderRadius.full }} />
      </Box>
      <Box style={{ ...skeleton, width: '100%', height: 12 }} />
      <Box style={{ display: 'flex', gap: t.spacing[3] }}>
        <Box style={{ ...skeleton, flex: 1, height: 80, borderRadius: t.borderRadius.md }} />
        <Box style={{ ...skeleton, flex: 1, height: 80, borderRadius: t.borderRadius.md }} />
      </Box>
      <Box style={{ ...skeleton, width: '100%', height: 6, borderRadius: t.borderRadius.full }} />
    </Box>
  );
}

/* ---------------------------------------------------------------------------
 * Dashboard Preset
 * -------------------------------------------------------------------------*/

export const DashboardBhQuestionAbTest = createPreset<BhQuestionAbTestProps>({
  name: 'BhQuestionAbTest.Dashboard',
  render: ({ primitives, props, tokens: t }: PresetContext<BhQuestionAbTestProps>) => {
    const { Box, Text } = primitives;
    _Box = Box;
    _Text = Text;

    const br = useMemo(() => getPersonalityBadgeRadius(t), [t]);
    const ptypo = useMemo(() => getPersonalityTypography(t), [t]);
    const statusConfig = useMemo(() => getExperimentStatusConfig(t), [t]);
    const hoverStyles = useMemo(() => createCardHoverStyles(t), [t]);
    const entrance = useMemo(() => createEntranceAnimation(t), [t]);
    const accentBar = useMemo(() => createPersonalityAccentBar(t), [t]);
    const sectionHeaderStyle = useMemo(() => createPersonalitySectionHeaderStyle(t), [t]);
    const divider = useMemo(() => createDividerStyle(t), [t]);

    const animStyle = (index: number) => ({
      ...entrance.animate,
      transition: entrance.transition,
      transitionDelay: `${createStaggerDelay(t, index)}ms`,
    });

    const {
      experiments: rawExperiments = [],
      onExperimentSelect,
      onCreateExperiment,
      statusFilter: sfp,
      onStatusFilterChange,
      rubricFilter,
      onRubricFilterChange,
      loading = false,
      className,
      style,
    } = props;

    const experiments = Array.isArray(rawExperiments) ? rawExperiments : [];

    const [iStatusFilter, setIStatusFilter] = useState<string>('all');
    const [iSearchTerm, setISearchTerm] = useState('');

    const statusFilter = sfp ?? iStatusFilter;

    const statusOptions = [
      { value: 'all', label: 'All' },
      { value: 'draft', label: 'Draft' },
      { value: 'running', label: 'Running' },
      { value: 'paused', label: 'Paused' },
      { value: 'completed', label: 'Completed' },
    ];

    const filtered = useMemo(() => {
      let result = experiments;
      if (statusFilter !== 'all') {
        result = result.filter(e => e.status === statusFilter);
      }
      if (iSearchTerm.trim()) {
        const term = iSearchTerm.toLowerCase();
        result = result.filter(e =>
          e.name.toLowerCase().includes(term) ||
          e.competency.toLowerCase().includes(term)
        );
      }
      return result;
    }, [experiments, statusFilter, iSearchTerm]);

    // Summary stats
    const runningCount = experiments.filter(e => e.status === 'running').length;
    const completedCount = experiments.filter(e => e.status === 'completed').length;
    const totalSamples = experiments.reduce((sum, e) => sum + e.currentSampleSize, 0);

    return (
      <Box className={className} style={{
        display: 'flex', flexDirection: 'column' as const, gap: t.spacing[5],
        height: '100%', ...style,
      }}>
        {accentBar && <Box style={accentBar} />}

        {/* Header */}
        <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1] }}>
            <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
              <FlaskConical size={ICON_SIZES.feature} style={{ color: t.colors.primaryScale[600] }} />
              <Text style={{
                fontSize: t.typography.fontSize.xl,
                fontWeight: ptypo.headingWeight,
                color: t.colors.neutral[900],
                letterSpacing: ptypo.headingLetterSpacing,
              }}>
                Question A/B Testing
              </Text>
            </Box>
            <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[500] }}>
              Run controlled experiments to find the best interview question phrasings
            </Text>
          </Box>
          {onCreateExperiment && (
            <Box
              onClick={onCreateExperiment}
              {...clickableProps(onCreateExperiment, 'Create new experiment')}
              style={{
                display: 'flex', alignItems: 'center', gap: t.spacing[2],
                padding: `${t.spacing[2]}px ${t.spacing[4]}px`,
                borderRadius: t.borderRadius.lg,
                backgroundColor: t.colors.primaryScale[600],
                color: t.colors.common.white,
                fontSize: t.typography.fontSize.sm,
                fontWeight: t.typography.fontWeight.semibold,
                cursor: 'pointer',
                transition: `all ${t.motion.hover}`,
              }}
            >
              <Plus size={ICON_SIZES.section} />
              <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.semibold, color: t.colors.common.white }}>
                New Experiment
              </Text>
            </Box>
          )}
        </Box>

        {/* Summary stats */}
        <Box style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: t.spacing[4] }}>
          {[
            { label: 'Total Experiments', value: String(experiments.length), icon: <Beaker size={ICON_SIZES.section} style={{ color: t.colors.primaryScale[500] }} />, bgColor: t.colors.primaryScale[50] },
            { label: 'Running', value: String(runningCount), icon: <FlaskConical size={ICON_SIZES.section} style={{ color: t.colors.successScale[500] }} />, bgColor: t.colors.successScale[50] },
            { label: 'Completed', value: String(completedCount), icon: <Trophy size={ICON_SIZES.section} style={{ color: t.colors.warningScale[500] }} />, bgColor: t.colors.warningScale[50] },
            { label: 'Total Samples', value: String(totalSamples), icon: <Users size={ICON_SIZES.section} style={{ color: t.colors.infoScale[500] }} />, bgColor: t.colors.infoScale[50] },
          ].map((stat, i) => (
            <Box key={stat.label} style={{
              ...createCardStyle(t, { elevation: 'sm' }),
              ...animStyle(i),
              display: 'flex', alignItems: 'center', gap: t.spacing[3],
              padding: `${t.spacing[4]}px`,
            }}>
              <Box style={{
                width: 36, height: 36, borderRadius: br,
                backgroundColor: stat.bgColor,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                {stat.icon}
              </Box>
              <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1] }}>
                <Text style={{
                  fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500],
                  textTransform: ptypo.labelTransform, letterSpacing: ptypo.labelLetterSpacing,
                }}>
                  {stat.label}
                </Text>
                <Text style={{
                  fontSize: t.typography.fontSize.lg,
                  fontWeight: t.typography.fontWeight.bold,
                  color: t.colors.neutral[900],
                }}>
                  {stat.value}
                </Text>
              </Box>
            </Box>
          ))}
        </Box>

        {/* Filters */}
        <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[3] }}>
          {/* Search */}
          <Box style={{
            display: 'flex', alignItems: 'center', gap: t.spacing[2],
            padding: `${t.spacing[2]}px ${t.spacing[3]}px`,
            borderRadius: t.borderRadius.md,
            border: `1px solid ${t.colors.neutral[200]}`,
            backgroundColor: t.colors.common.white,
            flex: 1, maxWidth: 320,
          }}>
            <Search size={ICON_SIZES.section} style={{ color: t.colors.neutral[400] }} />
            <input
              type="text"
              placeholder="Search experiments..."
              value={iSearchTerm}
              onChange={e => setISearchTerm(e.target.value)}
              style={{
                border: 'none', outline: 'none', backgroundColor: 'transparent',
                fontSize: t.typography.fontSize.sm, color: t.colors.neutral[900],
                width: '100%',
              }}
            />
          </Box>

          {/* Status filter pills */}
          <Box style={{ display: 'flex', gap: t.spacing[1] }}>
            {statusOptions.map(opt => {
              const active = statusFilter === opt.value;
              return (
                <Box
                  key={opt.value}
                  onClick={() => { onStatusFilterChange?.(opt.value); if (!sfp) setIStatusFilter(opt.value); }}
                  {...clickableProps(
                    () => { onStatusFilterChange?.(opt.value); if (!sfp) setIStatusFilter(opt.value); },
                    `Filter: ${opt.label}`
                  )}
                  style={createFilterPillStyle(t, { active })}
                >
                  <Text style={{ fontSize: t.typography.fontSize.xs }}>{opt.label}</Text>
                </Box>
              );
            })}
          </Box>
        </Box>

        {/* Experiment cards */}
        <Box style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' as const, gap: t.spacing[4] }}>
          {loading ? (
            <>
              {Array.from({ length: 3 }).map((_, i) => (
                <SkeletonCard key={i} tokens={t} index={i} />
              ))}
            </>
          ) : filtered.length === 0 ? (
            <Box style={createEmptyStateStyle(t)}>
              <FlaskConical size={ICON_SIZES.illustration} style={{ color: t.colors.neutral[300], marginBottom: t.spacing[3] }} />
              <Text style={{ fontSize: t.typography.fontSize.md, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[500], marginBottom: t.spacing[1] }}>
                {experiments.length === 0 ? 'No experiments yet' : 'No experiments match your filters'}
              </Text>
              <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[400] }}>
                {experiments.length === 0
                  ? 'Create your first A/B test to start optimizing interview questions'
                  : 'Try adjusting your search or filter criteria'}
              </Text>
            </Box>
          ) : (
            filtered.map((experiment, index) => {
              const sc = statusConfig[experiment.status];
              const leader = getLeadingVariant(experiment);

              return (
                <Box
                  key={experiment.id}
                  onClick={() => onExperimentSelect?.(experiment.id)}
                  {...clickableProps(
                    () => onExperimentSelect?.(experiment.id),
                    `View experiment: ${experiment.name}`
                  )}
                  onMouseEnter={(e: any) => { Object.assign(e.currentTarget.style, hoverStyles.hover); }}
                  onMouseLeave={(e: any) => { Object.assign(e.currentTarget.style, hoverStyles.base); }}
                  style={{
                    ...createCardStyle(t, { elevation: 'sm', interactive: true }),
                    ...animStyle(index),
                    display: 'flex', flexDirection: 'column' as const, gap: t.spacing[3],
                    padding: `${t.spacing[5]}px`,
                  }}
                >
                  {/* Card header */}
                  <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1], flex: 1 }}>
                      <Text style={{
                        fontSize: t.typography.fontSize.md,
                        fontWeight: t.typography.fontWeight.semibold,
                        color: t.colors.neutral[900],
                      }}>
                        {experiment.name}
                      </Text>
                      <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
                        <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>
                          {experiment.competency}
                        </Text>
                        {experiment.rubricName && (
                          <>
                            <Box style={{ width: 3, height: 3, borderRadius: t.borderRadius.full, backgroundColor: t.colors.neutral[300] }} />
                            <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>
                              {experiment.rubricName}
                            </Text>
                          </>
                        )}
                        {experiment.dimensionName && (
                          <>
                            <Box style={{ width: 3, height: 3, borderRadius: t.borderRadius.full, backgroundColor: t.colors.neutral[300] }} />
                            <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>
                              {experiment.dimensionName}
                            </Text>
                          </>
                        )}
                      </Box>
                    </Box>
                    <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
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
                      <ChevronRight size={ICON_SIZES.section} style={{ color: t.colors.neutral[300] }} />
                    </Box>
                  </Box>

                  {/* Variant comparison */}
                  <VariantComparisonCard experiment={experiment} tokens={t} />

                  {/* Footer: Progress + Stats */}
                  <Box style={{ display: 'flex', gap: t.spacing[4], alignItems: 'flex-end' }}>
                    <Box style={{ flex: 1 }}>
                      <SampleProgressBar
                        current={experiment.currentSampleSize}
                        minimum={experiment.minimumSampleSize}
                        tokens={t}
                      />
                    </Box>
                    <Box style={{ flex: 1 }}>
                      <ConfidenceMeter
                        significance={experiment.statisticalSignificance}
                        tokens={t}
                      />
                    </Box>
                    <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1], flexShrink: 0 }}>
                      <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>
                        {formatDate(experiment.createdAt)}
                      </Text>
                    </Box>
                  </Box>

                  {/* Winner announcement for completed experiments */}
                  {experiment.status === 'completed' && experiment.winnerVariantId && (
                    <Box style={{
                      display: 'flex', alignItems: 'center', gap: t.spacing[2],
                      padding: `${t.spacing[2]}px ${t.spacing[3]}px`,
                      borderRadius: t.borderRadius.md,
                      backgroundColor: t.colors.successScale[50],
                      border: `1px solid ${t.colors.successScale[200]}`,
                    }}>
                      <Trophy size={ICON_SIZES.section} style={{ color: t.colors.successScale[600] }} />
                      <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.semibold, color: t.colors.successScale[700] }}>
                        Winner: {experiment.variants.find(v => v.id === experiment.winnerVariantId)?.label ?? 'Unknown'}
                      </Text>
                    </Box>
                  )}
                </Box>
              );
            })
          )}
        </Box>
      </Box>
    );
  },
});
