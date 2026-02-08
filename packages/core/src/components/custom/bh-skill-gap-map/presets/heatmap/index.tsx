'use client';

/**
 * BhSkillGapMap - Heatmap Preset
 * Visual dimension heatmap showing candidate scores as colored cells
 */

import {useState, useMemo} from 'react';
import { createPreset, PresetContext } from '../../../factory';
import type { BhSkillGapMapProps, GapPriority } from '../../core';
import { getPriorityColors, getScoreColor, getScoreBgColor } from '../../core';
import {
  createCardStyle,
  createPanelHeaderStyle,
  createListItemStyle,
  createSectionHeaderStyle,
  createFilterPillStyle,
  createProgressBarStyle,
  createStatusDotStyle,
  createAccentBarStyle,
} from '../../../helpers';

export const HeatmapBhSkillGapMap = createPreset<BhSkillGapMapProps>({
  name: 'BhSkillGapMap.Heatmap',
  render: ({ primitives, props, tokens, engine }: PresetContext<BhSkillGapMapProps>) => {
    const { Box, Flex, Stack, Text, Grid } = primitives;
    const isGlass = engine === 'modern' && !!tokens.glass;
    const priorityColors = getPriorityColors(tokens);

    const {
      gaps,
      heatmapData = [],
      summary,
      dimensions = [],
      candidates = [],
      selectedGapId: selectedGapIdProp,
      onGapSelect,
      priorityFilter: priorityFilterProp,
      onPriorityFilterChange,
      loading,
      className,
      style,
    } = props;

    const [internalSelectedId, setInternalSelectedId] = useState(selectedGapIdProp ?? '');
    const [internalPriorityFilter, setInternalPriorityFilter] = useState<GapPriority[]>([]);

    const selectedGapId = selectedGapIdProp ?? internalSelectedId;
    const activePriorityFilter = priorityFilterProp ?? internalPriorityFilter;

    const handleGapSelect = (id: string) => {
      setInternalSelectedId(id);
      onGapSelect?.(id);
    };

    const togglePriority = (p: GapPriority) => {
      const next = activePriorityFilter.includes(p) ? activePriorityFilter.filter(x => x !== p) : [...activePriorityFilter, p];
      setInternalPriorityFilter(next);
      onPriorityFilterChange?.(next);
    };

    const filteredGaps = activePriorityFilter.length > 0
      ? gaps.filter(g => activePriorityFilter.includes(g.priority))
      : gaps;

    const uniqueDimensions = dimensions.length > 0 ? dimensions : [...new Set(heatmapData.map(c => c.dimension))];
    const uniqueCandidates = candidates.length > 0 ? candidates : [...new Set(heatmapData.map(c => c.candidate))];
    const selectedGap = gaps.find(g => g.id === selectedGapId);

    const priorityOptions: GapPriority[] = ['critical', 'high', 'medium', 'low'];

    if (loading) {
      return (
        <Flex align="center" justify="center" style={{ padding: tokens.spacing[8], ...style }} className={className}>
          <Text style={{ color: tokens.colors.neutral[500] }}>Loading skill gap data...</Text>
        </Flex>
      );
    }

    return (
      <Box className={className} style={{ ...style }}>
        {/* Summary */}
        {summary && (
          <Grid columns={{ xs: 2, sm: 4 }} gap={12} style={{ marginBottom: tokens.spacing[4] }}>
            {[
              { label: 'Total Gaps', value: summary.totalGaps, color: tokens.colors.neutral[800] },
              { label: 'Critical', value: summary.criticalGaps, color: tokens.colors.errorScale[600] },
              { label: 'Avg Gap Size', value: summary.averageGapSize.toFixed(1), color: tokens.colors.neutral[800] },
              { label: 'Most Common', value: summary.mostCommonDimension, color: tokens.colors.neutral[800] },
            ].map(stat => (
              <Box key={stat.label} style={{ ...createCardStyle(tokens), overflow: 'hidden' }}>
                <div style={createAccentBarStyle(tokens, { position: 'top' })} />
                <Text style={createSectionHeaderStyle(tokens)}>{stat.label}</Text>
                <Text style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.semibold, color: stat.color }}>{stat.value}</Text>
              </Box>
            ))}
          </Grid>
        )}

        {/* Priority Filters */}
        <Flex gap={6} style={{ marginBottom: tokens.spacing[3] }} wrap="wrap">
          <Text style={{ ...createSectionHeaderStyle(tokens), alignSelf: 'center', marginBottom: 0 }}>Priority:</Text>
          {priorityOptions.map(p => {
            const pc = priorityColors[p];
            const isActive = activePriorityFilter.includes(p);
            return (
              <Box
                key={p}
                onClick={() => togglePriority(p)}
                style={{
                  ...createFilterPillStyle(tokens, { active: isActive }),
                  ...(isActive ? { backgroundColor: pc.bgColor, borderColor: pc.border, color: pc.color } : {}),
                }}
              >
                <Text style={{ fontSize: tokens.typography.fontSize.xs, color: isActive ? pc.color : tokens.colors.neutral[600], textTransform: 'capitalize' as const }}>{p}</Text>
              </Box>
            );
          })}
        </Flex>

        {/* Heatmap Grid */}
        {heatmapData.length > 0 && uniqueDimensions.length > 0 && uniqueCandidates.length > 0 && (
          <Box style={{ ...createCardStyle(tokens, { glass: isGlass, padding: 0 }), overflow: 'auto', marginBottom: tokens.spacing[4] }}>
            <Box style={createPanelHeaderStyle(tokens)}>
              <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[700] }}>
                Dimension Heatmap
              </Text>
            </Box>
            <Box style={{ overflowX: 'auto', padding: tokens.spacing[3] }}>
              {/* Header row */}
              <Flex gap={4} style={{ marginBottom: tokens.spacing[1] }}>
                <Box style={{ minWidth: 100 }} />
                {uniqueDimensions.map(dim => (
                  <Box key={dim} style={{ minWidth: 70, textAlign: 'center' as const }}>
                    <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], fontWeight: tokens.typography.fontWeight.semibold }}>{dim}</Text>
                  </Box>
                ))}
              </Flex>
              {/* Candidate rows */}
              {uniqueCandidates.map(cand => (
                <Flex key={cand} gap={4} style={{ marginBottom: 2 }}>
                  <Box style={{ minWidth: 100, paddingTop: tokens.spacing[1] }}>
                    <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[700] }}>{cand}</Text>
                  </Box>
                  {uniqueDimensions.map(dim => {
                    const cell = heatmapData.find(c => c.candidate === cand && c.dimension === dim);
                    const score = cell?.score ?? 0;
                    const maxScore = cell?.maxScore ?? 100;
                    return (
                      <Box
                        key={`${cand}-${dim}`}
                        style={{
                          minWidth: 70, height: 32, borderRadius: tokens.borderRadius.sm,
                          background: getScoreBgColor(score, maxScore, tokens),
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
                          transition: `all ${tokens.motion.hover}`,
                        }}
                      >
                        <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: getScoreColor(score, maxScore, tokens) }}>
                          {score}
                        </Text>
                      </Box>
                    );
                  })}
                </Flex>
              ))}
            </Box>
          </Box>
        )}

        {/* Gap List */}
        <Box style={{ ...createCardStyle(tokens, { glass: isGlass, padding: 0 }), overflow: 'hidden' }}>
          <Box style={createPanelHeaderStyle(tokens)}>
            <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[700] }}>
              Skill Gaps ({filteredGaps.length})
            </Text>
          </Box>
          <Stack gap={0} style={{ maxHeight: 320, overflowY: 'auto' }}>
            {filteredGaps.map(gap => {
              const pc = priorityColors[gap.priority];
              const isSelected = selectedGapId === gap.id;
              const pct = gap.requiredLevel > 0 ? Math.round((gap.currentLevel / gap.requiredLevel) * 100) : 0;
              const barColor = pct >= 80 ? tokens.colors.successScale[500] : pct >= 50 ? tokens.colors.warningScale[500] : tokens.colors.errorScale[500];
              const progressStyles = useMemo(() => createProgressBarStyle(tokens, { color: barColor, percent: pct }), [tokens, pct]);
              return (
                <Box key={gap.id} onClick={() => handleGapSelect(gap.id)} style={createListItemStyle(tokens, { active: isSelected, interactive: true })}>
                  <Flex justify="between" align="center" style={{ marginBottom: tokens.spacing[1] }}>
                    <Flex gap={8} align="center">
                      <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[800] }}>{gap.dimension}</Text>
                      <Box style={{ padding: `${tokens.spacing[0]}px ${tokens.spacing[1]}px`, borderRadius: tokens.borderRadius.full, background: pc.bgColor, border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${pc.border}` }}>
                        <Text style={{ fontSize: tokens.typography.fontSize.xs, color: pc.color, textTransform: 'capitalize' as const }}>{gap.priority}</Text>
                      </Box>
                    </Flex>
                    <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{gap.candidateCount} candidates</Text>
                  </Flex>
                  <Flex gap={8} align="center">
                    <Box style={{ flex: 1, ...progressStyles.track }}>
                      <div style={progressStyles.fill} />
                    </Box>
                    <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[600] }}>{gap.currentLevel}/{gap.requiredLevel}</Text>
                  </Flex>
                  {isSelected && gap.recommendation && (
                    <Box style={{ marginTop: tokens.spacing[2], padding: tokens.spacing[2], borderRadius: tokens.borderRadius.md, background: tokens.colors.infoScale[50], border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.infoScale[200]}` }}>
                      <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.infoScale[700] }}>{gap.recommendation}</Text>
                    </Box>
                  )}
                </Box>
              );
            })}
          </Stack>
        </Box>
      </Box>
    );
  },
});
