'use client';

/**
 * BhWorkflowStageEditor - Editor Preset
 * Full stage editor with drag handles, type indicators, action list,
 * and reordering controls. Personality-driven, glass-aware.
 */

import { useState, useMemo, useCallback, useEffect } from 'react';
import {
  GripVertical, Plus, Pencil, Trash2, ChevronUp, ChevronDown,
  User, Cpu, ShieldCheck, Layers,
} from 'lucide-react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createBadgeStyle,
  createCardHoverStyles,
  createEntranceAnimation,
  createStaggerDelay,
  createIconContainerStyle,
  createPersonalitySectionHeaderStyle,
  getPersonalityTypography,
  getPersonalityBadgeRadius,
  createEmptyStateStyle,
} from '../../../helpers';
import type { BhWorkflowStageEditorProps, WorkflowStage } from '../../core';
import type { DesignTokens } from '../../../../../types';

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */

const MOCK_STAGES: WorkflowStage[] = [
  { id: 'ws-1', name: 'Application Review', type: 'manual', order: 1, color: undefined, actions: ['Screen resume', 'Check qualifications'] },
  { id: 'ws-2', name: 'AI Screening', type: 'automated', order: 2, color: undefined, actions: ['Score resume', 'Match skills', 'Generate summary'] },
  { id: 'ws-3', name: 'Phone Screen', type: 'manual', order: 3, color: undefined, actions: ['Schedule call', 'Conduct screen', 'Rate candidate'] },
  { id: 'ws-4', name: 'Manager Approval', type: 'approval', order: 4, color: undefined, actions: ['Review profile', 'Approve/Reject'] },
  { id: 'ws-5', name: 'Technical Interview', type: 'manual', order: 5, color: undefined, actions: ['Send coding challenge', 'Conduct interview', 'Submit scorecard'] },
  { id: 'ws-6', name: 'Offer Generation', type: 'automated', order: 6, color: undefined, actions: ['Generate offer letter', 'Calculate compensation'] },
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function getStageTypeIcon(type: WorkflowStage['type']) {
  switch (type) {
    case 'manual': return User;
    case 'automated': return Cpu;
    case 'approval': return ShieldCheck;
    default: return User;
  }
}

function getStageTypeLabel(type: WorkflowStage['type']): string {
  switch (type) {
    case 'manual': return 'Manual';
    case 'automated': return 'Automated';
    case 'approval': return 'Approval';
    default: return String(type ?? '');
  }
}

function getStageTypeColor(type: WorkflowStage['type'], t: DesignTokens): { bg: string; text: string } {
  switch (type) {
    case 'manual': return { bg: t.colors.primaryScale[50], text: t.colors.primaryScale[600] };
    case 'automated': return { bg: t.colors.infoScale[50], text: t.colors.infoScale[600] };
    case 'approval': return { bg: t.colors.warningScale[50], text: t.colors.warningScale[600] };
    default: return { bg: t.colors.neutral[50], text: t.colors.neutral[600] };
  }
}

function getStageTypeBadgeKey(type: WorkflowStage['type']): 'primary' | 'info' | 'warning' {
  switch (type) {
    case 'manual': return 'primary';
    case 'automated': return 'info';
    case 'approval': return 'warning';
    default: return 'primary';
  }
}

/* ================================================================== */
/*  Editor Preset                                                      */
/* ================================================================== */

export const EditorBhWorkflowStageEditor = createPreset<BhWorkflowStageEditorProps>({
  name: 'BhWorkflowStageEditor.Editor',
  render: (ctx: PresetContext<BhWorkflowStageEditorProps>) => {
    const { primitives: { Box, Text }, props, tokens: t } = ctx;

    const isGlass = t.surface.useGlass;
    const badgeRadius = getPersonalityBadgeRadius(t);
    const ptypo = getPersonalityTypography(t);

    const {
      stages = MOCK_STAGES,
      onStageReorder,
      onStageEdit,
      onStageDelete,
      onAddStage,
      loading,
      className,
      style,
    } = props;

    const [hoveredStage, setHoveredStage] = useState<string | null>(null);

    const card = useMemo(() => createCardStyle(t, { elevation: 'sm', glass: isGlass }), [t, isGlass]);
    const hoverStyles = useMemo(() => createCardHoverStyles(t), [t]);
    const entrance = useMemo(() => createEntranceAnimation(t), [t]);

    const sortedStages = useMemo(() => [...stages].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)), [stages]);

    const handleMoveUp = useCallback((stageId: string, currentOrder: number) => {
      if (currentOrder > 1) onStageReorder?.(stageId, currentOrder - 1);
    }, [onStageReorder]);

    const handleMoveDown = useCallback((stageId: string, currentOrder: number) => {
      if (currentOrder < sortedStages.length) onStageReorder?.(stageId, currentOrder + 1);
    }, [onStageReorder, sortedStages.length]);

    const animStyle = (index: number) => ({
      ...entrance.animate,
      transition: entrance.transition,
      transitionDelay: `${createStaggerDelay(t, index)}ms`,
    });

    return (
      <Box
        className={className}
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          height: '100%',
          backgroundColor: t.colors.neutral[50],
          fontFamily: 'inherit',
          overflow: 'auto',
          ...style,
        }}
      >
        {/* Header */}
        <Box style={{
          padding: `${t.spacing[6]}px ${t.spacing[7]}px`,
          backgroundColor: t.colors.common.white,
          borderBottom: `1px solid ${t.colors.neutral[100]}`,
          ...(isGlass && t.glass ? { backdropFilter: t.glass.blur, WebkitBackdropFilter: t.glass.blur, backgroundColor: t.glass.bg } : {}),
        }}>
          <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[4] }}>
              <Box style={createIconContainerStyle(t, { size: 44, color: t.colors.primaryScale[50] })}>
                <Layers size={22} color={t.colors.primaryScale[600]} />
              </Box>
              <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1] }}>
                <Text style={{
                  fontSize: t.typography.fontSize.xl,
                  fontWeight: ptypo.headingWeight,
                  color: t.colors.neutral[900],
                  letterSpacing: ptypo.headingLetterSpacing,
                }}>
                  Workflow Stages
                </Text>
                <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[500]}}>
                  Configure and reorder your hiring pipeline stages
                </Text>
              </Box>
            </Box>
            <Box
              role="button"
              tabIndex={0}
              aria-label="Add new stage"
              onClick={() => onAddStage?.()}
              onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onAddStage?.(); } }}
              style={{
                display: 'flex', alignItems: 'center', gap: t.spacing[2],
                padding: `${t.spacing[2]}px ${t.spacing[3]}px`,
                borderRadius: t.borderRadius.md,
                backgroundColor: t.colors.primaryScale[600],
                color: t.colors.common.white,
                cursor: 'pointer',
                transition: `all ${t.motion.hover}`,
              }}
            >
              <Plus size={14} />
              <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.medium, color: t.colors.common.white }}>
                Add Stage
              </Text>
            </Box>
          </Box>
        </Box>

        {/* Stages List */}
        <Box style={{ padding: t.spacing[7], flex: 1 }}>
          {sortedStages.length === 0 && (
            <Box style={createEmptyStateStyle(t)}>
              <Layers size={32} style={{ marginBottom: t.spacing[2], opacity: 0.4 }} />
              <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[400] }}>
                No stages configured yet
              </Text>
            </Box>
          )}
          <Box style={{ display: 'flex', flexDirection: 'column', gap: t.spacing[3] }} role="list" aria-label="Pipeline stages">
            {sortedStages.map((stage, i) => {
              const isHovered = hoveredStage === stage.id;
              const typeColors = getStageTypeColor(stage.type, t);
              const TypeIcon = getStageTypeIcon(stage.type);
              return (
                <Box
                  key={stage.id}
                  role="listitem"
                  style={{
                    ...card,
                    ...animStyle(i),
                    display: 'flex',
                    alignItems: 'stretch',
                    padding: 0,
                    overflow: 'hidden',
                  }}
                  onMouseEnter={() => setHoveredStage((stage.id ?? null))}
                  onMouseLeave={() => setHoveredStage(null)}
                >
                  {/* Left color bar */}
                  <Box style={{
                    width: 4,
                    backgroundColor: stage.color || typeColors.text,
                    flexShrink: 0,
                  }} />

                  {/* Drag handle */}
                  <Box style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: `0 ${t.spacing[2]}px`,
                    color: t.colors.neutral[300],
                    cursor: 'grab',
                  }}>
                    <GripVertical size={16} />
                  </Box>

                  {/* Stage content */}
                  <Box style={{ flex: 1, padding: `${t.spacing[3]}px ${t.spacing[3]}px ${t.spacing[3]}px 0` }}>
                    <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], marginBottom: t.spacing[2] }}>
                      <Box style={createIconContainerStyle(t, { size: 28, color: typeColors.bg })}>
                        <TypeIcon size={14} color={typeColors.text} />
                      </Box>
                      <Text style={{
                        fontSize: t.typography.fontSize.sm,
                        fontWeight: t.typography.fontWeight.semibold,
                        color: t.colors.neutral[900],
                      }}>
                        {stage.name}
                      </Text>
                      <Box style={{
                        ...createBadgeStyle(t, getStageTypeBadgeKey(stage.type)),
                        borderRadius: badgeRadius,
                      }}>
                        <Text style={{ fontSize: t.typography.fontSize.xs }}>
                          {getStageTypeLabel(stage.type)}
                        </Text>
                      </Box>
                      <Text style={{
                        fontSize: t.typography.fontSize.xs,
                        color: t.colors.neutral[400],
                        marginLeft: 'auto',
                      }}>
                        Step {stage.order}
                      </Text>
                    </Box>
                    {/* Actions */}
                    <Box style={{ display: 'flex', flexWrap: 'wrap', gap: t.spacing[1] }}>
                      {(stage.actions ?? []).map((action, ai) => (
                        <Box key={ai} style={{
                          padding: `1px ${t.spacing[2]}px`,
                          borderRadius: badgeRadius,
                          backgroundColor: t.colors.neutral[100],
                          fontSize: t.typography.fontSize.xs,
                          color: t.colors.neutral[600],
                        }}>
                          <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[600] }}>
                            {action}
                          </Text>
                        </Box>
                      ))}
                    </Box>
                  </Box>

                  {/* Actions column */}
                  <Box style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    justifyContent: 'center', gap: t.spacing[1],
                    padding: `${t.spacing[2]}px ${t.spacing[3]}px`,
                    borderLeft: `1px solid ${t.colors.neutral[100]}`,
                    opacity: isHovered ? 1 : 0.3,
                    transition: `opacity ${t.motion.hover}`,
                  }}>
                    <Box
                      role="button" tabIndex={0}
                      aria-label={`Move ${stage.name} up`}
                      onClick={() => handleMoveUp((stage.id ?? ''), (stage.order ?? 0))}
                      onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleMoveUp((stage.id ?? ''), (stage.order ?? 0)); } }}
                      style={{ cursor: (stage.order ?? 0) > 1 ? 'pointer' : 'default', opacity: (stage.order ?? 0) > 1 ? 1 : 0.3 }}
                    >
                      <ChevronUp size={14} color={t.colors.neutral[500]} />
                    </Box>
                    <Box
                      role="button" tabIndex={0}
                      aria-label={`Edit ${stage.name}`}
                      onClick={() => onStageEdit?.((stage.id ?? ''))}
                      onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onStageEdit?.((stage.id ?? '')); } }}
                      style={{ cursor: 'pointer' }}
                    >
                      <Pencil size={13} color={t.colors.primaryScale[500]} />
                    </Box>
                    <Box
                      role="button" tabIndex={0}
                      aria-label={`Delete ${stage.name}`}
                      onClick={() => onStageDelete?.((stage.id ?? ''))}
                      onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onStageDelete?.((stage.id ?? '')); } }}
                      style={{ cursor: 'pointer' }}
                    >
                      <Trash2 size={13} color={t.colors.errorScale[500]} />
                    </Box>
                    <Box
                      role="button" tabIndex={0}
                      aria-label={`Move ${stage.name} down`}
                      onClick={() => handleMoveDown((stage.id ?? ''), (stage.order ?? 0))}
                      onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleMoveDown((stage.id ?? ''), (stage.order ?? 0)); } }}
                      style={{ cursor: (stage.order ?? 0) < sortedStages.length ? 'pointer' : 'default', opacity: (stage.order ?? 0) < sortedStages.length ? 1 : 0.3 }}
                    >
                      <ChevronDown size={14} color={t.colors.neutral[500]} />
                    </Box>
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Box>
      </Box>
    );
  },
});
