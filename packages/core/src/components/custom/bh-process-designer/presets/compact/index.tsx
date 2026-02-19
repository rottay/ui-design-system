'use client';

/**
 * BhProcessDesigner - Compact Preset
 * Condensed list view of process stages with inline editing.
 * Personality-driven, glass-aware. Only uses Box and Text primitives.
 */

import { useMemo, useCallback } from 'react';
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
  createListItemStyle,
  createPanelHeaderStyle,
  getPersonalityTypography,
  getPersonalityBadgeRadius,
} from '../../../helpers';
import type { BhProcessDesignerProps, ProcessTemplate, StageType } from '../../core';
import type { DesignTokens } from '../../../../../types';
import {
  Layers, Plus, X, Clock, AlertTriangle, Target,
  FileCheck, Phone, Code, Users, UserCheck, Award, Gift, Settings,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */

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

function getStageIcon(type: StageType, size: number = 14) {
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
/*  Compact Preset                                                     */
/* ================================================================== */

export const CompactBhProcessDesigner = createPreset<BhProcessDesignerProps>({
  name: 'BhProcessDesigner.Compact',
  render: (ctx: PresetContext<BhProcessDesignerProps>) => {
    const { primitives: { Box, Text }, props, tokens: t } = ctx;

    const isGlass = t.surface.useGlass && !!t.glass;
    const badgeRadius = getPersonalityBadgeRadius(t);
    const ptypo = getPersonalityTypography(t);

    const {
      template: rawTemplate = {} as Partial<ProcessTemplate>, selectedStage, onStageSelect, onStageAdd, onStageRemove,
      readOnly = false, className, style,
    } = props;

    const template = Array.isArray(rawTemplate) ? rawTemplate : ({} as Partial<ProcessTemplate>);

    const card = useMemo(() => createCardStyle(t, { elevation: 'sm', glass: isGlass }), [t, isGlass]);
    const entrance = useMemo(() => createEntranceAnimation(t), [t]);
    const accentBar = useMemo(() => createPersonalityAccentBar(t), [t]);
    const accentLayout = useMemo(() => getAccentAwareLayout(t), [t]);

    const handleStageSelect = useCallback((stageId: string | null) => {
      onStageSelect?.(stageId);
    }, [onStageSelect]);

    const handleStageAdd = useCallback((afterId: string | null) => {
      onStageAdd?.(afterId);
    }, [onStageAdd]);

    const handleStageRemove = useCallback((stageId: string, e: React.MouseEvent) => {
      e.stopPropagation();
      onStageRemove?.(stageId);
    }, [onStageRemove]);

    const animStyle = useMemo(() => ({
      ...entrance.animate,
      transition: entrance.transition,
    }), [entrance]);

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
          <Layers size={24} color={t.colors.neutral[300]} />
          <Text style={{ color: t.colors.neutral[400], fontSize: t.typography.fontSize.sm, marginTop: t.spacing[2] }}>
            No process template loaded
          </Text>
        </Box>
      );
    }

    const stages = useMemo(
      () => [...(template.stages ?? [])].sort((a, b) => a.order - b.order),
      [template.stages],
    );

    return (
      <Box
        className={className}
        role="region"
        aria-label="Process designer compact"
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          gap: t.spacing[5],
          ...animStyle,
          ...style,
        }}
      >
        {/* Header */}
        <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1] }}>
            <Text style={{
              fontSize: t.typography.fontSize.lg,
              fontWeight: ptypo.headingWeight,
              color: t.colors.neutral[900],
              letterSpacing: ptypo.headingLetterSpacing,
              display: 'block',
            }}>
              {template.name}
            </Text>
            {template.description && (
              <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>
                {template.description}
              </Text>
            )}
          </Box>
          <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[3] }}>
            <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>
              {stages.length} stage{stages.length !== 1 ? 's' : ''}
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

        {/* Stages List */}
        <Box style={{ ...card, padding: 0, overflow: 'hidden', ...accentLayout.outer }}>
          {accentBar && <Box style={accentBar} />}
          <Box style={accentLayout.inner}>
          <Box style={createPanelHeaderStyle(t)}>
            <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
              <Layers size={14} color={t.colors.neutral[500]} />
              <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[700] }}>
                Stages ({stages.length})
              </Text>
            </Box>
          </Box>

          <Box role="list" aria-label="Process stages">
            {stages.map((stage, i) => {
              const isSelected = selectedStage === stage.id;
              const stageColor = getStageColor(stage.type, t);

              return (
                <Box
                  key={stage.id}
                  role="listitem"
                  tabIndex={0}
                  aria-label={`${stage.name} - ${getStageTypeLabel(stage.type)}${isSelected ? ' (selected)' : ''}`}
                  onClick={() => handleStageSelect(isSelected ? null : stage.id)}
                  onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleStageSelect(isSelected ? null : stage.id); } }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: t.spacing[3],
                    ...createListItemStyle(t, { active: isSelected, interactive: true }),
                    padding: `${t.spacing[3]}px ${t.spacing[4]}px`,
                  }}
                >
                  {/* Order + icon */}
                  <Box style={{
                    ...createIconContainerStyle(t, { size: 32, color: stageColor }),
                    color: t.colors.common.white,
                    flexShrink: 0,
                  }}>
                    {getStageIcon(stage.type, 14)}
                  </Box>

                  {/* Stage info */}
                  <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1], flex: 1, minWidth: 0 }}>
                    <Text style={{
                      fontSize: t.typography.fontSize.sm,
                      fontWeight: t.typography.fontWeight.semibold,
                      color: t.colors.neutral[800],
                      display: 'block',
                    }}>
                      {stage.name}
                    </Text>
                    <Text style={{ fontSize: t.typography.fontSize.xs, color: stageColor }}>
                      {getStageTypeLabel(stage.type)}
                    </Text>
                  </Box>

                  {/* Badges */}
                  <Box style={{ display: 'flex', gap: t.spacing[1], alignItems: 'center', flexShrink: 0 }}>
                    {stage.isRequired && (
                      <Box style={{ ...createBadgeStyle(t, 'error'), borderRadius: badgeRadius }}>
                        <Text style={{ fontSize: t.typography.fontSize.xs }}>Required</Text>
                      </Box>
                    )}
                    {stage.knockoutRules && stage.knockoutRules.length > 0 && (
                      <Box style={{ ...createBadgeStyle(t, 'warning'), borderRadius: badgeRadius, display: 'inline-flex', alignItems: 'center', gap: t.spacing[1] }}>
                        <AlertTriangle size={10} />
                        <Text style={{ fontSize: t.typography.fontSize.xs }}>
                          {stage.knockoutRules.length} KO
                        </Text>
                      </Box>
                    )}
                    {stage.scoringRubrics && stage.scoringRubrics.length > 0 && (
                      <Box style={{ ...createBadgeStyle(t, 'primary'), borderRadius: badgeRadius, display: 'inline-flex', alignItems: 'center', gap: t.spacing[1] }}>
                        <Target size={10} />
                        <Text style={{ fontSize: t.typography.fontSize.xs }}>
                          {stage.scoringRubrics.length} dim
                        </Text>
                      </Box>
                    )}
                    {stage.durationDays && (
                      <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1] }}>
                        <Clock size={10} color={t.colors.neutral[400]} />
                        <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>{stage.durationDays}d</Text>
                      </Box>
                    )}
                  </Box>

                  {/* Remove */}
                  {!readOnly && onStageRemove && (
                    <Box
                      tabIndex={0}
                      role="button"
                      aria-label={`Remove ${stage.name}`}
                      onClick={(e: React.MouseEvent) => handleStageRemove(stage.id, e)}
                      onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); onStageRemove(stage.id); } }}
                      style={{
                        width: 24, height: 24, borderRadius: t.borderRadius.full,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: t.colors.neutral[400], flexShrink: 0,
                        cursor: 'pointer',
                        transition: `all ${t.motion.hover}`,
                      }}
                    >
                      <X size={14} />
                    </Box>
                  )}
                </Box>
              );
            })}

            {/* Add stage */}
            {!readOnly && (
              <Box
                tabIndex={0}
                role="button"
                aria-label="Add new stage"
                onClick={() => handleStageAdd(stages.length > 0 ? stages[stages.length - 1].id : null)}
                onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleStageAdd(stages.length > 0 ? stages[stages.length - 1].id : null); } }}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  padding: t.spacing[3],
                  color: t.colors.neutral[500],
                  fontSize: t.typography.fontSize.sm,
                  borderTop: `${t.surface.borderWidth} dashed ${t.colors.neutral[200]}`,
                  cursor: 'pointer',
                  transition: `all ${t.motion.hover}`,
                }}
              >
                <Plus size={14} />
                <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[500] }}>Add Stage</Text>
              </Box>
            )}

            {stages.length === 0 && (
              <Box style={createEmptyStateStyle(t)}>
                <Layers size={24} color={t.colors.neutral[300]} />
                <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[400], marginTop: t.spacing[2] }}>
                  No stages defined
                </Text>
              </Box>
            )}
          </Box>
          </Box>
        </Box>
      </Box>
    );
  },
});
