'use client';

/**
 * BhProcessDesigner - Visual Preset
 * Connected node diagram showing stages as cards with connectors and detail panel.
 * Personality-driven, glass-aware. Only uses Box and Text primitives.
 */

import { useState, useMemo, useCallback, useEffect } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createBadgeStyle,
  createCardHoverStyles,
  createEntranceAnimation,
  createStaggerDelay,
  createIconContainerStyle,
  createPersonalitySectionHeaderStyle,
  createPersonalityAccentBar,
  getAccentAwareLayout,
  createEmptyStateStyle,
  createHoverStyle,
  createProgressBarStyle,
  getPersonalityTypography,
  getPersonalityBadgeRadius,
} from '../../../helpers';
import type { BhProcessDesignerProps, ProcessStage, ProcessTemplate, StageType } from '../../core';
import type { DesignTokens } from '../../../../../types';
import {
  Layers, Plus, Trash2, Clock, AlertTriangle, Target, ArrowDown,
  FileCheck, Phone, Code, Users, UserCheck, Award, Gift, Settings,
  Zap, GripVertical,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */

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

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function getStageColor(type: StageType, t: DesignTokens): string {
  const map: Record<StageType, string> = {
    application_review: t.colors.primaryScale[400],
    phone_screen: t.colors.infoScale[400],
    technical_interview: t.colors.warningScale[500],
    onsite_interview: t.colors.successScale[500],
    panel_review: t.colors.primaryScale[600],
    reference_check: t.colors.infoScale[600],
    offer: t.colors.successScale[600],
    custom: t.colors.neutral[500],
  };
  return map[type] || t.colors.neutral[500];
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
  return (type || '').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

/* ================================================================== */
/*  Visual Preset                                                      */
/* ================================================================== */

export const VisualBhProcessDesigner = createPreset<BhProcessDesignerProps>({
  name: 'BhProcessDesigner.Visual',
  render: (ctx: PresetContext<BhProcessDesignerProps>) => {
    const { primitives: { Box, Text }, props, tokens: t } = ctx;

    const isGlass = t.surface.useGlass && !!t.glass;
    const badgeRadius = getPersonalityBadgeRadius(t);
    const ptypo = getPersonalityTypography(t);

    const {
      template: rawTemplate = MOCK_TEMPLATE, selectedStage, onStageSelect, onStageReorder,
      onStageAdd, onStageRemove, onStageUpdate, onTemplateUpdate,
      readOnly = false, className, style,
    } = props;

    const template = Array.isArray(rawTemplate) ? rawTemplate : MOCK_TEMPLATE;


    const card = useMemo(() => createCardStyle(t, { elevation: 'sm', glass: isGlass }), [t, isGlass]);
    const hoverStyles = useMemo(() => createCardHoverStyles(t), [t]);
    const entrance = useMemo(() => createEntranceAnimation(t), [t]);
    const sectionLabel = useMemo(() => createPersonalitySectionHeaderStyle(t), [t]);
    const accentBar = useMemo(() => createPersonalityAccentBar(t), [t]);
    const accentLayout = useMemo(() => getAccentAwareLayout(t), [t]);

    const handleStageSelect = useCallback((stageId: string | null) => {
      onStageSelect?.(stageId);
    }, [onStageSelect]);

    const handleStageAdd = useCallback((afterId: string | null) => {
      onStageAdd?.(afterId);
    }, [onStageAdd]);

    const handleStageRemove = useCallback((stageId: string) => {
      onStageRemove?.(stageId);
    }, [onStageRemove]);

    const animStyle = useCallback((index: number) => ({
      ...entrance.animate,
      transition: entrance.transition,
      transitionDelay: `${createStaggerDelay(t, index)}ms`,
    }), [entrance, t]);

    if (!template) {
      return (
        <Box
          className={className}
          role="region"
          aria-label="Process designer"
          style={{
            ...card,
            ...createEmptyStateStyle(t),
            ...style,
          }}
        >
          <Layers size={32} color={t.colors.neutral[300]} />
          <Text style={{ color: t.colors.neutral[400], fontSize: t.typography.fontSize.sm, marginTop: t.spacing[2] }}>
            No process template loaded
          </Text>
        </Box>
      );
    }

    const stages = useMemo(
      () => [...template.stages].sort((a, b) => a.order - b.order),
      [template.stages],
    );
    const selectedStageData = useMemo(
      () => stages.find(s => s.id === selectedStage),
      [stages, selectedStage],
    );

    return (
      <Box
        className={className}
        role="region"
        aria-label="Process designer"
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          gap: t.spacing[5],
          ...style,
        }}
      >
        {/* Template Header */}
        <Box style={{ ...card, padding: t.spacing[5], ...accentLayout.outer, ...animStyle(0) }}>
          {accentBar && <Box style={accentBar} />}
          <Box style={{ ...accentLayout.inner }}>
          <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1] }}>
              <Text style={{
                fontSize: t.typography.fontSize.xl,
                fontWeight: ptypo.headingWeight,
                color: t.colors.neutral[900],
                letterSpacing: ptypo.headingLetterSpacing,
                display: 'block',
              }}>
                {template.name}
              </Text>
              {template.description && (
                <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[500] }}>
                  {template.description}
                </Text>
              )}
            </Box>
            <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[3] }}>
              <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>
                {stages.length} stages
              </Text>
              <Box style={{
                ...createBadgeStyle(t, template.isActive ? 'success' : 'secondary'),
                borderRadius: badgeRadius,
              }}>
                <Text style={{ fontSize: t.typography.fontSize.xs }}>
                  {template.isActive ? 'Active' : 'Draft'}
                </Text>
              </Box>
            </Box>
          </Box>
          </Box>
        </Box>

        {/* Flow + Detail */}
        <Box style={{
          display: 'grid',
          gridTemplateColumns: selectedStageData ? '1fr 380px' : '1fr',
          gap: t.spacing[5],
        }}>
          {/* Process Flow */}
          <Box style={{ ...card, padding: t.spacing[5], ...animStyle(1) }}>
            <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], marginBottom: t.spacing[4] }}>
              <Layers size={14} color={t.colors.neutral[500]} />
              <Text style={{ ...sectionLabel, marginBottom: 0 }}>Process Flow</Text>
            </Box>

            <Box style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }} role="list" aria-label="Process stages">
              {stages.map((stage, i) => {
                const isSelected = selectedStage === stage.id;
                const stageColor = getStageColor(stage.type, t);
                const hasKO = stage.knockoutRules && stage.knockoutRules.length > 0;
                const hasScoring = stage.scoringRubrics && stage.scoringRubrics.length > 0;

                return (
                  <Box key={stage.id} role="listitem" style={{
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', width: '100%', maxWidth: 420,
                  }}>
                    {/* Connector */}
                    {i > 0 && (
                      <Box style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: `${t.spacing[1]}px 0` }}>
                        <ArrowDown size={16} color={t.colors.neutral[300]} />
                      </Box>
                    )}

                    {/* Stage Node */}
                    <Box
                      tabIndex={0}
                      role="button"
                      aria-label={`${stage.name} - ${getStageTypeLabel(stage.type)}${isSelected ? ' (selected)' : ''}`}
                      aria-pressed={isSelected}
                      onClick={() => handleStageSelect(isSelected ? null : stage.id)}
                      onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleStageSelect(isSelected ? null : stage.id); } }}
                      style={{
                        ...hoverStyles.base,
                        width: '100%',
                        padding: t.spacing[4],
                        borderRadius: t.borderRadius.lg,
                        border: `2px solid ${isSelected ? stageColor : t.colors.neutral[200]}`,
                        backgroundColor: isSelected ? t.colors.primaryScale[50] : t.colors.common.white,
                        boxShadow: isSelected ? t.shadows.md : t.shadows.sm,
                        position: 'relative',
                        cursor: 'pointer',
                        transition: `all ${t.motion.hover}`,
                      }}
                    >
                      {/* Stage number badge */}
                      <Box style={{
                        position: 'absolute', top: -12, left: t.spacing[3],
                        ...createIconContainerStyle(t, { size: 24, color: stageColor }),
                        color: t.colors.common.white,
                        fontSize: t.typography.fontSize.xs,
                        fontWeight: t.typography.fontWeight.bold,
                      }}>
                        {i + 1}
                      </Box>

                      <Box style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                        <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
                          <Box style={createIconContainerStyle(t, { size: 32, color: stageColor + '15' })}>
                            {getStageIcon(stage.type, 16)}
                          </Box>
                          <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1] }}>
                            <Text style={{
                              fontSize: t.typography.fontSize.sm,
                              fontWeight: t.typography.fontWeight.bold,
                              color: t.colors.neutral[800],
                              display: 'block',
                            }}>
                              {stage.name}
                            </Text>
                            <Text style={{
                              fontSize: t.typography.fontSize.xs,
                              color: stageColor,
                              fontWeight: t.typography.fontWeight.medium,
                            }}>
                              {getStageTypeLabel(stage.type)}
                            </Text>
                            {stage.description && (
                              <Text style={{
                                fontSize: t.typography.fontSize.xs,
                                color: t.colors.neutral[500],
                                marginTop: t.spacing[1],
                              }}>
                                {stage.description}
                              </Text>
                            )}
                          </Box>
                        </Box>

                        <Box style={{ display: 'flex', gap: t.spacing[1], flexShrink: 0 }}>
                          {stage.isRequired && (
                            <Box style={{ ...createBadgeStyle(t, 'error'), borderRadius: badgeRadius }}>
                              <Text style={{ fontSize: t.typography.fontSize.xs }}>Required</Text>
                            </Box>
                          )}
                          {hasKO && (
                            <Box style={{ ...createBadgeStyle(t, 'warning'), borderRadius: badgeRadius, display: 'inline-flex', alignItems: 'center', gap: t.spacing[1] }}>
                              <AlertTriangle size={10} />
                              <Text style={{ fontSize: t.typography.fontSize.xs }}>KO</Text>
                            </Box>
                          )}
                          {hasScoring && (
                            <Box style={{ ...createBadgeStyle(t, 'primary'), borderRadius: badgeRadius }}>
                              <Text style={{ fontSize: t.typography.fontSize.xs }}>Scored</Text>
                            </Box>
                          )}
                        </Box>
                      </Box>

                      {/* Meta row */}
                      <Box style={{ display: 'flex', gap: t.spacing[3], marginTop: t.spacing[2] }}>
                        {stage.durationDays && (
                          <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1], fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>
                            <Clock size={10} />
                            <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>{stage.durationDays}d</Text>
                          </Box>
                        )}
                        {stage.interviewerCount && (
                          <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1], fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>
                            <Users size={10} />
                            <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>
                              {stage.interviewerCount} interviewer{stage.interviewerCount > 1 ? 's' : ''}
                            </Text>
                          </Box>
                        )}
                        {stage.scoringRubrics && (
                          <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1], fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>
                            <Target size={10} />
                            <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>
                              {stage.scoringRubrics.length} dimensions
                            </Text>
                          </Box>
                        )}
                      </Box>
                    </Box>

                    {/* Add button */}
                    {!readOnly && (
                      <Box
                        tabIndex={0}
                        role="button"
                        aria-label={`Add stage after ${stage.name}`}
                        onClick={() => handleStageAdd(stage.id)}
                        onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleStageAdd(stage.id); } }}
                        style={{
                          marginTop: t.spacing[1],
                          width: 28, height: 28, borderRadius: t.borderRadius.full,
                          border: `2px dashed ${t.colors.neutral[300]}`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: t.colors.neutral[400],
                          backgroundColor: t.colors.common.white,
                          cursor: 'pointer',
                          transition: `all ${t.motion.hover}`,
                        }}
                      >
                        <Plus size={14} />
                      </Box>
                    )}
                  </Box>
                );
              })}

              {/* Empty add */}
              {stages.length === 0 && !readOnly && (
                <Box
                  tabIndex={0}
                  role="button"
                  aria-label="Add first stage"
                  onClick={() => handleStageAdd(null)}
                  onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleStageAdd(null); } }}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    padding: t.spacing[5],
                    borderRadius: t.borderRadius.lg,
                    border: `2px dashed ${t.colors.neutral[300]}`,
                    color: t.colors.neutral[500],
                    fontSize: t.typography.fontSize.sm,
                    width: '100%', maxWidth: 420,
                    cursor: 'pointer',
                    transition: `all ${t.motion.hover}`,
                  }}
                >
                  <Plus size={16} />
                  <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[500] }}>Add First Stage</Text>
                </Box>
              )}
            </Box>
          </Box>

          {/* Stage Detail Panel */}
          {selectedStageData && (
            <Box style={{ ...card, padding: t.spacing[5], ...animStyle(2) }}>
              <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: t.spacing[4] }}>
                <Text style={{ ...sectionLabel, marginBottom: 0 }}>Stage Configuration</Text>
                {!readOnly && onStageRemove && (
                  <Box
                    tabIndex={0}
                    role="button"
                    aria-label={`Remove stage ${selectedStageData.name}`}
                    onClick={() => handleStageRemove(selectedStageData.id)}
                    onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleStageRemove(selectedStageData.id); } }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 4,
                      padding: `${t.spacing[1]}px ${t.spacing[2]}px`,
                      borderRadius: t.borderRadius.md,
                      color: t.colors.errorScale[500],
                      fontSize: t.typography.fontSize.xs,
                      border: `${t.surface.borderWidth} ${t.surface.borderStyle} ${t.colors.errorScale[200]}`,
                      cursor: 'pointer',
                      transition: `all ${t.motion.hover}`,
                    }}
                  >
                    <Trash2 size={12} />
                    <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.errorScale[500] }}>Remove</Text>
                  </Box>
                )}
              </Box>

              <Box style={{ display: 'flex', flexDirection: 'column', gap: t.spacing[4] }}>
                {/* Basic info */}
                <Box style={{ display: 'flex', flexDirection: 'column', gap: t.spacing[3] }}>
                  <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1] }}>
                    <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500], marginBottom: t.spacing[1], display: 'block', textTransform: ptypo.labelTransform, letterSpacing: ptypo.labelLetterSpacing }}>Name</Text>
                    <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[800] }}>
                      {selectedStageData.name}
                    </Text>
                  </Box>
                  <Box>
                    <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500], marginBottom: t.spacing[1], display: 'block', textTransform: ptypo.labelTransform, letterSpacing: ptypo.labelLetterSpacing }}>Type</Text>
                    <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
                      <Box style={createIconContainerStyle(t, { size: 24, color: getStageColor(selectedStageData.type, t) + '15' })}>
                        {getStageIcon(selectedStageData.type, 12)}
                      </Box>
                      <Text style={{
                        fontSize: t.typography.fontSize.sm,
                        color: getStageColor(selectedStageData.type, t),
                        fontWeight: t.typography.fontWeight.medium,
                      }}>
                        {getStageTypeLabel(selectedStageData.type)}
                      </Text>
                    </Box>
                  </Box>
                </Box>

                {/* Scoring Rubrics */}
                {selectedStageData.scoringRubrics && selectedStageData.scoringRubrics.length > 0 && (
                  <Box>
                    <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1], marginBottom: t.spacing[3] }}>
                      <Target size={12} color={t.colors.neutral[500]} />
                      <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>
                        Scoring Rubric ({selectedStageData.scoringRubrics.length} dimensions)
                      </Text>
                    </Box>
                    <Box style={{ display: 'flex', flexDirection: 'column' }}>
                      {selectedStageData.scoringRubrics.map(r => (
                        <Box key={r.id} style={{
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                          padding: `${t.spacing[2]}px 0`,
                          borderBottom: `${t.surface.borderWidth} ${t.surface.borderStyle} ${t.colors.neutral[100]}`,
                        }}>
                          <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[700] }}>
                            {r.dimensionName}
                          </Text>
                          <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>
                            w:{r.weight} / max:{r.maxScore}
                          </Text>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                )}

                {/* Knockout Rules */}
                {selectedStageData.knockoutRules && selectedStageData.knockoutRules.length > 0 && (
                  <Box>
                    <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1], marginBottom: t.spacing[3] }}>
                      <AlertTriangle size={12} color={t.colors.warningScale[500]} />
                      <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>
                        Knockout Rules ({selectedStageData.knockoutRules.length})
                      </Text>
                    </Box>
                    <Box style={{ display: 'flex', flexDirection: 'column', gap: t.spacing[2] }}>
                      {selectedStageData.knockoutRules.map(rule => (
                        <Box key={rule.id} style={{
                          padding: t.spacing[3],
                          borderRadius: t.borderRadius.lg,
                          backgroundColor: t.colors.warningScale[50],
                          border: `${t.surface.borderWidth} ${t.surface.borderStyle} ${t.colors.warningScale[100]}`,
                        }}>
                          <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.warningScale[800] }}>
                            {rule.field} {rule.operator.replace('_', ' ')} "{rule.value}" {'\u2192'} {rule.action}
                          </Text>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                )}

                {/* Automations */}
                {selectedStageData.automations && selectedStageData.automations.length > 0 && (
                  <Box>
                    <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1], marginBottom: t.spacing[3] }}>
                      <Zap size={12} color={t.colors.neutral[500]} />
                      <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>
                        Automations
                      </Text>
                    </Box>
                    <Box style={{ display: 'flex', flexDirection: 'column', gap: t.spacing[2] }}>
                      {selectedStageData.automations.map((auto, ai) => (
                        <Box key={ai} style={{
                          display: 'flex', alignItems: 'center', gap: t.spacing[2],
                          padding: t.spacing[2],
                        }}>
                          <Zap size={10} color={t.colors.primaryScale[400]} />
                          <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[600] }}>{auto}</Text>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                )}
              </Box>
            </Box>
          )}
        </Box>
      </Box>
    );
  },
});
