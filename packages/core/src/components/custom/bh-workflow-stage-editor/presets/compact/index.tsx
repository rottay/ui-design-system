'use client';

/**
 * BhWorkflowStageEditor - Compact Preset
 * Condensed pipeline stage list for sidebar placement.
 */

import { useMemo } from 'react';
import {
  Layers, User, Cpu, ShieldCheck, ChevronRight,
} from 'lucide-react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createBadgeStyle,
  createEntranceAnimation,
  createIconContainerStyle,
  getPersonalityTypography,
  getPersonalityBadgeRadius,
  createEmptyStateStyle,
} from '../../../helpers';
import type { BhWorkflowStageEditorProps, WorkflowStage } from '../../core';
import type { DesignTokens } from '../../../../../types';

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function getStageTypeColor(type: WorkflowStage['type'], t: DesignTokens): string {
  switch (type) {
    case 'manual': return t.colors.primaryScale[500];
    case 'automated': return t.colors.infoScale[500];
    case 'approval': return t.colors.warningScale[500];
    default: return t.colors.neutral[500];
  }
}

/* ================================================================== */
/*  Compact Preset                                                     */
/* ================================================================== */

export const CompactBhWorkflowStageEditor = createPreset<BhWorkflowStageEditorProps>({
  name: 'BhWorkflowStageEditor.Compact',
  render: (ctx: PresetContext<BhWorkflowStageEditorProps>) => {
    const { primitives: { Box, Text }, props, tokens: t } = ctx;

    const isGlass = t.surface.useGlass;
    const ptypo = getPersonalityTypography(t);

    const {
      stages: rawStages = [],
      onStageEdit,
      className,
      style,
    } = props;

    const stages = Array.isArray(rawStages) ? rawStages : [];

    const card = useMemo(() => createCardStyle(t, { elevation: 'sm', glass: isGlass }), [t, isGlass]);
    const entrance = useMemo(() => createEntranceAnimation(t), [t]);

    const sortedStages = useMemo(() => [...stages].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)), [stages]);

    const animStyle = useMemo(() => ({
      ...entrance.animate,
      transition: entrance.transition,
    }), [entrance]);

    return (
      <Box
        className={className}
        style={{
          ...card,
          width: '100%',
          padding: 0,
          overflow: 'hidden',
          ...animStyle,
          ...style,
        }}
      >
        {/* Header */}
        <Box style={{
          padding: `${t.spacing[3]}px ${t.spacing[4]}px`,
          borderBottom: `1px solid ${t.colors.neutral[100]}`,
          backgroundColor: t.colors.neutral[50],
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
            <Layers size={16} color={t.colors.primaryScale[500]} />
            <Text style={{
              fontSize: t.typography.fontSize.sm,
              fontWeight: ptypo.headingWeight,
              color: t.colors.neutral[800],
            }}>
              Stages
            </Text>
          </Box>
          <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>
            {sortedStages.length} steps
          </Text>
        </Box>

        {/* Stage list */}
        <Box role="list" aria-label="Pipeline stages">
          {sortedStages.length === 0 && (
            <Box style={{ ...createEmptyStateStyle(t), padding: t.spacing[4] }}>
              <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>
                No stages
              </Text>
            </Box>
          )}
          {sortedStages.map((stage, i) => (
            <Box
              key={stage.id}
              role="listitem"
              tabIndex={0}
              aria-label={`Stage ${stage.order}: ${stage.name}`}
              onClick={() => onStageEdit?.((stage.id ?? ''))}
              onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onStageEdit?.((stage.id ?? '')); } }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: t.spacing[2],
                padding: `${t.spacing[2]}px ${t.spacing[4]}px`,
                borderBottom: `1px solid ${t.colors.neutral[50]}`,
                cursor: 'pointer',
                backgroundColor: t.colors.common.white,
                borderLeft: `3px solid ${getStageTypeColor(stage.type, t)}`,
                transition: `background-color ${t.motion.hover}`,
              }}
            >
              <Text style={{
                fontSize: t.typography.fontSize.xs,
                fontWeight: t.typography.fontWeight.bold,
                color: t.colors.neutral[300],
                width: 16,
                textAlign: 'center',
              }}>
                {stage.order}
              </Text>
              <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1], flex: 1, minWidth: 0 }}>
                <Text style={{
                  fontSize: t.typography.fontSize.xs,
                  fontWeight: t.typography.fontWeight.medium,
                  color: t.colors.neutral[800],
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}>
                  {stage.name}
                </Text>
                <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>
                  {stage.type} / {(stage.actions ?? []).length} action{(stage.actions ?? []).length !== 1 ? 's' : ''}
                </Text>
              </Box>
              <ChevronRight size={12} color={t.colors.neutral[300]} />
            </Box>
          ))}
        </Box>
      </Box>
    );
  },
});
