'use client';

/**
 * BhProcessDesigner - Visual Preset
 * Connected node diagram showing stages as cards with connectors and detail panel.
 * Slite-inspired: generous whitespace, warm neutrals, soft shadows, minimal borders.
 */

import { useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createSectionHeaderStyle,
  createHoverStyle,
  createPanelHeaderStyle,
  createProgressBarStyle,
} from '../../../helpers';
import type { BhProcessDesignerProps, ProcessStage, ProcessTemplate, StageType } from '../../core';
import {
  Layers, Plus, Trash2, Clock, AlertTriangle, Target, ArrowDown,
  FileCheck, Phone, Code, Users, UserCheck, Award, Gift, Settings,
  Zap, GripVertical,
} from 'lucide-react';

const MOCK_TEMPLATE: ProcessTemplate = {
  id: 'tpl-1',
  name: 'Standard Engineering Hiring',
  description: 'Full-loop process for engineering roles with technical and behavioral rounds.',
  isActive: true,
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-15T00:00:00Z',
  stages: [
    { id: 'stg-1', name: 'Application Review', type: 'application_review', order: 1, isRequired: true, durationDays: 3, description: 'Resume and portfolio screening' },
    { id: 'stg-2', name: 'Phone Screen', type: 'phone_screen', order: 2, isRequired: true, durationDays: 5, interviewerCount: 1, description: '30-min introductory call' },
    { id: 'stg-3', name: 'Technical Interview', type: 'technical_interview', order: 3, isRequired: true, durationDays: 7, interviewerCount: 2, description: 'Live coding and system design', scoringRubrics: [{ id: 'sr-1', dimensionName: 'Problem Solving', weight: 40, maxScore: 10 }, { id: 'sr-2', dimensionName: 'Code Quality', weight: 30, maxScore: 10 }, { id: 'sr-3', dimensionName: 'Communication', weight: 30, maxScore: 10 }] },
    { id: 'stg-4', name: 'Onsite Interview', type: 'onsite_interview', order: 4, isRequired: true, durationDays: 10, interviewerCount: 4, description: 'Full-day onsite with team' },
    { id: 'stg-5', name: 'Offer', type: 'offer', order: 5, isRequired: true, durationDays: 5, description: 'Compensation package and negotiation' },
  ],
};

function getStageColor(type: StageType, tokens: any): string {
  const map: Record<StageType, string> = {
    application_review: tokens.colors.primaryScale[400],
    phone_screen: tokens.colors.infoScale[400],
    technical_interview: tokens.colors.warningScale[500],
    onsite_interview: tokens.colors.successScale[500],
    panel_review: tokens.colors.primaryScale[600],
    reference_check: tokens.colors.infoScale[600],
    offer: tokens.colors.successScale[600],
    custom: tokens.colors.neutral[500],
  };
  return map[type] || tokens.colors.neutral[500];
}

function getStageIcon(type: StageType, size: number = 16) {
  switch (type) {
    case 'application_review': return <FileCheck size={size} />;
    case 'phone_screen': return <Phone size={size} />;
    case 'technical_interview': return <Code size={size} />;
    case 'onsite_interview': return <Users size={size} />;
    case 'panel_review': return <UserCheck size={size} />;
    case 'reference_check': return <Award size={size} />;
    case 'offer': return <Gift size={size} />;
    default: return <Settings size={size} />;
  }
}

function getStageTypeLabel(type: StageType): string {
  return type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

export const VisualBhProcessDesigner = createPreset<BhProcessDesignerProps>({
  name: 'BhProcessDesigner.Visual',
  render: ({ primitives, props, tokens }: PresetContext<BhProcessDesignerProps>) => {
    const { Box, Flex, Stack, Text } = primitives;
    const isGlass = tokens.surface.useGlass && !!tokens.glass;

    const {
      template = MOCK_TEMPLATE, selectedStage, onStageSelect, onStageReorder,
      onStageAdd, onStageRemove, onStageUpdate, onTemplateUpdate,
      readOnly = false, className, style,
    } = props;

    const card = useMemo(() => createCardStyle(tokens, { elevation: 'sm', glass: isGlass }), [tokens, isGlass]);
    const hov = useMemo(() => createHoverStyle(tokens), [tokens]);
    const sectionHeader = useMemo(() => createSectionHeaderStyle(tokens), [tokens]);

    if (!template) {
      return (
        <Flex align="center" justify="center" direction="column" gap={8}
          className={className} style={{ ...card, padding: tokens.spacing[10], ...style }}>
          <Layers size={32} color={tokens.colors.neutral[300]} />
          <Text style={{ color: tokens.colors.neutral[400], fontSize: tokens.typography.fontSize.sm }}>
            No process template loaded
          </Text>
        </Flex>
      );
    }

    const stages = [...template.stages].sort((a, b) => a.order - b.order);
    const selectedStageData = stages.find(s => s.id === selectedStage);

    return (
      <Box className={className} style={{
        display: 'flex', flexDirection: 'column' as const,
        gap: tokens.spacing[5], ...style,
      }}>
        {/* ── Template Header ──────────────────────────── */}
        <Box style={{ ...card, padding: tokens.spacing[5] }}>
          <Flex align="center" justify="between">
            <Stack gap={2}>
              <Text style={{
                fontSize: tokens.typography.fontSize.xl || '1.25rem',
                fontWeight: tokens.typography.fontWeight.bold,
                color: tokens.colors.neutral[900],
              }}>
                {template.name}
              </Text>
              {template.description && (
                <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>
                  {template.description}
                </Text>
              )}
            </Stack>
            <Flex align="center" gap={8}>
              <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>
                {stages.length} stages
              </Text>
              <Box style={{
                padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                borderRadius: tokens.borderRadius.full,
                backgroundColor: template.isActive ? tokens.colors.successScale[50] : tokens.colors.neutral[100],
                color: template.isActive ? tokens.colors.successScale[700] : tokens.colors.neutral[500],
                fontSize: tokens.typography.fontSize.xs,
                fontWeight: tokens.typography.fontWeight.semibold,
                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${template.isActive ? tokens.colors.successScale[200] : tokens.colors.neutral[200]}`,
              }}>
                {template.isActive ? 'Active' : 'Draft'}
              </Box>
            </Flex>
          </Flex>
        </Box>

        {/* ── Flow + Detail ────────────────────────────── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: selectedStageData ? '1fr 380px' : '1fr',
          gap: tokens.spacing[5],
        }}>
          {/* Process Flow */}
          <Box style={{ ...card, padding: tokens.spacing[5] }}>
            <Flex align="center" gap={6} style={{ marginBottom: tokens.spacing[4] }}>
              <Layers size={14} color={tokens.colors.neutral[500]} />
              <Text style={{ ...sectionHeader, marginBottom: 0 }}>Process Flow</Text>
            </Flex>

            <Flex direction="column" align="center" gap={0}>
              {stages.map((stage, i) => {
                const isSelected = selectedStage === stage.id;
                const stageColor = getStageColor(stage.type, tokens);
                const hasKO = stage.knockoutRules && stage.knockoutRules.length > 0;
                const hasScoring = stage.scoringRubrics && stage.scoringRubrics.length > 0;

                return (
                  <Box key={stage.id} style={{
                    display: 'flex', flexDirection: 'column' as const,
                    alignItems: 'center', width: '100%', maxWidth: 420,
                  }}>
                    {/* Connector */}
                    {i > 0 && (
                      <Flex direction="column" align="center" style={{ padding: `${tokens.spacing[1]}px 0` }}>
                        <ArrowDown size={16} color={tokens.colors.neutral[300]} />
                      </Flex>
                    )}

                    {/* Stage Node */}
                    <Box onClick={() => onStageSelect?.(isSelected ? null : stage.id)}
                      style={{
                        ...hov, width: '100%',
                        padding: tokens.spacing[4],
                        borderRadius: tokens.borderRadius.lg,
                        border: `2px solid ${isSelected ? stageColor : tokens.colors.neutral[200]}`,
                        backgroundColor: isSelected ? stageColor + '08' : tokens.colors.common.white,
                        boxShadow: isSelected ? tokens.shadows.md : tokens.shadows.sm,
                        position: 'relative' as const,
                      }}>
                      {/* Stage number badge */}
                      <Box style={{
                        position: 'absolute' as const, top: -12, left: tokens.spacing[3],
                        width: 24, height: 24, borderRadius: tokens.borderRadius.full,
                        backgroundColor: stageColor, color: tokens.colors.common.white,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: tokens.typography.fontSize.xs,
                        fontWeight: tokens.typography.fontWeight.bold,
                      }}>
                        {i + 1}
                      </Box>

                      <Flex align="start" justify="between">
                        <Flex align="center" gap={8}>
                          <Box style={{
                            width: 32, height: 32, borderRadius: tokens.borderRadius.lg,
                            backgroundColor: stageColor + '15',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: stageColor, flexShrink: 0,
                          }}>
                            {getStageIcon(stage.type, 16)}
                          </Box>
                          <Stack gap={1}>
                            <Text style={{
                              fontSize: tokens.typography.fontSize.sm,
                              fontWeight: tokens.typography.fontWeight.bold,
                              color: tokens.colors.neutral[800],
                            }}>
                              {stage.name}
                            </Text>
                            <Text style={{
                              fontSize: tokens.typography.fontSize.xs,
                              color: stageColor,
                              fontWeight: tokens.typography.fontWeight.medium,
                            }}>
                              {getStageTypeLabel(stage.type)}
                            </Text>
                            {stage.description && (
                              <Text style={{
                                fontSize: tokens.typography.fontSize.xs,
                                color: tokens.colors.neutral[500],
                                marginTop: tokens.spacing[1],
                              }}>
                                {stage.description}
                              </Text>
                            )}
                          </Stack>
                        </Flex>

                        <Flex gap={4} style={{ flexShrink: 0 }}>
                          {stage.isRequired && (
                            <Box style={{
                              padding: `${tokens.spacing[0]}px ${tokens.spacing[2]}px`,
                              borderRadius: tokens.borderRadius.full,
                              backgroundColor: tokens.colors.errorScale[50],
                              color: tokens.colors.errorScale[600],
                              fontSize: tokens.typography.fontSize.xs,
                              fontWeight: tokens.typography.fontWeight.medium,
                            }}>
                              Required
                            </Box>
                          )}
                          {hasKO && (
                            <Flex align="center" gap={3} style={{
                              padding: `${tokens.spacing[0]}px ${tokens.spacing[2]}px`,
                              borderRadius: tokens.borderRadius.full,
                              backgroundColor: tokens.colors.warningScale[50],
                              color: tokens.colors.warningScale[700],
                              fontSize: tokens.typography.fontSize.xs,
                            }}>
                              <AlertTriangle size={10} />
                              <Text style={{ fontSize: 'inherit', color: 'inherit' }}>KO</Text>
                            </Flex>
                          )}
                          {hasScoring && (
                            <Box style={{
                              padding: `${tokens.spacing[0]}px ${tokens.spacing[2]}px`,
                              borderRadius: tokens.borderRadius.full,
                              backgroundColor: tokens.colors.primaryScale[50],
                              color: tokens.colors.primaryScale[700],
                              fontSize: tokens.typography.fontSize.xs,
                            }}>
                              Scored
                            </Box>
                          )}
                        </Flex>
                      </Flex>

                      {/* Meta row */}
                      <Flex gap={12} style={{ marginTop: tokens.spacing[2] }}>
                        {stage.durationDays && (
                          <Flex align="center" gap={3} style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>
                            <Clock size={10} />
                            <Text style={{ fontSize: 'inherit', color: 'inherit' }}>{stage.durationDays}d</Text>
                          </Flex>
                        )}
                        {stage.interviewerCount && (
                          <Flex align="center" gap={3} style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>
                            <Users size={10} />
                            <Text style={{ fontSize: 'inherit', color: 'inherit' }}>
                              {stage.interviewerCount} interviewer{stage.interviewerCount > 1 ? 's' : ''}
                            </Text>
                          </Flex>
                        )}
                        {stage.scoringRubrics && (
                          <Flex align="center" gap={3} style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>
                            <Target size={10} />
                            <Text style={{ fontSize: 'inherit', color: 'inherit' }}>
                              {stage.scoringRubrics.length} dimensions
                            </Text>
                          </Flex>
                        )}
                      </Flex>
                    </Box>

                    {/* Add button */}
                    {!readOnly && (
                      <Box onClick={() => onStageAdd?.(stage.id)} style={{
                        ...hov, marginTop: tokens.spacing[1],
                        width: 28, height: 28, borderRadius: tokens.borderRadius.full,
                        border: `2px dashed ${tokens.colors.neutral[300]}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: tokens.colors.neutral[400],
                        backgroundColor: tokens.colors.common.white,
                      }}>
                        <Plus size={14} />
                      </Box>
                    )}
                  </Box>
                );
              })}

              {/* Empty add */}
              {stages.length === 0 && !readOnly && (
                <Box
                  onClick={() => onStageAdd?.(null)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    ...hov, padding: tokens.spacing[5],
                    borderRadius: tokens.borderRadius.lg,
                    border: `2px dashed ${tokens.colors.neutral[300]}`,
                    color: tokens.colors.neutral[500],
                    fontSize: tokens.typography.fontSize.sm,
                    width: '100%', maxWidth: 420,
                  }}>
                  <Plus size={16} />
                  <Text style={{ fontSize: 'inherit', color: 'inherit' }}>Add First Stage</Text>
                </Box>
              )}
            </Flex>
          </Box>

          {/* ── Stage Detail Panel ─────────────────────── */}
          {selectedStageData && (
            <Box style={{ ...card, padding: tokens.spacing[5] }}>
              <Flex align="center" justify="between" style={{ marginBottom: tokens.spacing[4] }}>
                <Text style={{ ...sectionHeader, marginBottom: 0 }}>Stage Configuration</Text>
                {!readOnly && onStageRemove && (
                  <Box onClick={() => onStageRemove(selectedStageData.id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 4,
                      ...hov, padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                      borderRadius: tokens.borderRadius.md,
                      color: tokens.colors.errorScale[500],
                      fontSize: tokens.typography.fontSize.xs,
                      border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.errorScale[200]}`,
                    }}>
                    <Trash2 size={12} />
                    <Text style={{ fontSize: 'inherit', color: 'inherit' }}>Remove</Text>
                  </Box>
                )}
              </Flex>

              <Stack gap={16}>
                {/* Basic info */}
                <Stack gap={4}>
                  <Box>
                    <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], marginBottom: tokens.spacing[1] }}>Name</Text>
                    <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[800] }}>
                      {selectedStageData.name}
                    </Text>
                  </Box>
                  <Box>
                    <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], marginBottom: tokens.spacing[1] }}>Type</Text>
                    <Flex align="center" gap={6}>
                      <Box style={{
                        width: 24, height: 24, borderRadius: tokens.borderRadius.md,
                        backgroundColor: getStageColor(selectedStageData.type, tokens) + '15',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: getStageColor(selectedStageData.type, tokens),
                      }}>
                        {getStageIcon(selectedStageData.type, 12)}
                      </Box>
                      <Text style={{
                        fontSize: tokens.typography.fontSize.sm,
                        color: getStageColor(selectedStageData.type, tokens),
                        fontWeight: tokens.typography.fontWeight.medium,
                      }}>
                        {getStageTypeLabel(selectedStageData.type)}
                      </Text>
                    </Flex>
                  </Box>
                </Stack>

                {/* Scoring Rubrics */}
                {selectedStageData.scoringRubrics && selectedStageData.scoringRubrics.length > 0 && (
                  <Box>
                    <Flex align="center" gap={4} style={{ marginBottom: tokens.spacing[3] }}>
                      <Target size={12} color={tokens.colors.neutral[500]} />
                      <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>
                        Scoring Rubric ({selectedStageData.scoringRubrics.length} dimensions)
                      </Text>
                    </Flex>
                    <Stack gap={0}>
                      {selectedStageData.scoringRubrics.map(r => (
                        <Flex key={r.id} justify="between" align="center" style={{
                          padding: `${tokens.spacing[2]}px 0`,
                          borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
                        }}>
                          <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[700] }}>
                            {r.dimensionName}
                          </Text>
                          <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>
                            w:{r.weight} / max:{r.maxScore}
                          </Text>
                        </Flex>
                      ))}
                    </Stack>
                  </Box>
                )}

                {/* Knockout Rules */}
                {selectedStageData.knockoutRules && selectedStageData.knockoutRules.length > 0 && (
                  <Box>
                    <Flex align="center" gap={4} style={{ marginBottom: tokens.spacing[3] }}>
                      <AlertTriangle size={12} color={tokens.colors.warningScale[500]} />
                      <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>
                        Knockout Rules ({selectedStageData.knockoutRules.length})
                      </Text>
                    </Flex>
                    <Stack gap={4}>
                      {selectedStageData.knockoutRules.map(rule => (
                        <Box key={rule.id} style={{
                          padding: tokens.spacing[3],
                          borderRadius: tokens.borderRadius.lg,
                          backgroundColor: tokens.colors.warningScale[50],
                          border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.warningScale[100]}`,
                        }}>
                          <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.warningScale[800] }}>
                            {rule.field} {rule.operator.replace('_', ' ')} "{rule.value}" {'\u2192'} {rule.action}
                          </Text>
                        </Box>
                      ))}
                    </Stack>
                  </Box>
                )}

                {/* Automations */}
                {selectedStageData.automations && selectedStageData.automations.length > 0 && (
                  <Box>
                    <Flex align="center" gap={4} style={{ marginBottom: tokens.spacing[3] }}>
                      <Zap size={12} color={tokens.colors.neutral[500]} />
                      <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>
                        Automations
                      </Text>
                    </Flex>
                    <Stack gap={4}>
                      {selectedStageData.automations.map((auto, ai) => (
                        <Flex key={ai} align="center" gap={6} style={{
                          padding: tokens.spacing[2],
                          fontSize: tokens.typography.fontSize.xs,
                          color: tokens.colors.neutral[600],
                        }}>
                          <Zap size={10} color={tokens.colors.primaryScale[400]} />
                          <Text style={{ fontSize: 'inherit', color: 'inherit' }}>{auto}</Text>
                        </Flex>
                      ))}
                    </Stack>
                  </Box>
                )}
              </Stack>
            </Box>
          )}
        </div>
      </Box>
    );
  },
});
