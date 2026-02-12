'use client';

/**
 * BhProcessDesigner - Compact Preset
 * Condensed list view of process stages with inline editing.
 * Slite-inspired: generous whitespace, warm neutrals, soft shadows, minimal borders.
 */

import { useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createSectionHeaderStyle,
  createHoverStyle,
  createBadgeStyle,
  createListItemStyle,
  createPanelHeaderStyle,
} from '../../../helpers';
import type { BhProcessDesignerProps, ProcessTemplate, StageType } from '../../core';
import {
  Layers, Plus, X, Clock, AlertTriangle, Target,
  FileCheck, Phone, Code, Users, UserCheck, Award, Gift, Settings,
} from 'lucide-react';

const MOCK_TEMPLATE: ProcessTemplate = {
  id: 'tpl-1',
  name: 'Standard Engineering Hiring',
  description: 'Full-loop process for engineering roles.',
  isActive: true,
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-15T00:00:00Z',
  stages: [
    { id: 'stg-1', name: 'Application Review', type: 'application_review', order: 1, isRequired: true, durationDays: 3 },
    { id: 'stg-2', name: 'Phone Screen', type: 'phone_screen', order: 2, isRequired: true, durationDays: 5, interviewerCount: 1 },
    { id: 'stg-3', name: 'Technical Interview', type: 'technical_interview', order: 3, isRequired: true, durationDays: 7, interviewerCount: 2 },
    { id: 'stg-4', name: 'Onsite Interview', type: 'onsite_interview', order: 4, isRequired: true, durationDays: 10, interviewerCount: 4 },
    { id: 'stg-5', name: 'Offer', type: 'offer', order: 5, isRequired: true, durationDays: 5 },
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
  return type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

export const CompactBhProcessDesigner = createPreset<BhProcessDesignerProps>({
  name: 'BhProcessDesigner.Compact',
  render: ({ primitives, props, tokens }: PresetContext<BhProcessDesignerProps>) => {
    const { Box, Flex, Stack, Text } = primitives;
    const isGlass = tokens.surface.useGlass && !!tokens.glass;

    const {
      template = MOCK_TEMPLATE, selectedStage, onStageSelect, onStageAdd, onStageRemove,
      readOnly = false, className, style,
    } = props;

    const card = useMemo(() => createCardStyle(tokens, { elevation: 'sm', glass: isGlass }), [tokens, isGlass]);
    const hov = useMemo(() => createHoverStyle(tokens), [tokens]);

    if (!template) {
      return (
        <Box className={className} style={{
          ...card, padding: tokens.spacing[8],
          textAlign: 'center' as const, ...style,
        }}>
          <Layers size={24} color={tokens.colors.neutral[300]} style={{ marginBottom: tokens.spacing[2] }} />
          <Text style={{ color: tokens.colors.neutral[400], fontSize: tokens.typography.fontSize.sm }}>
            No process template loaded
          </Text>
        </Box>
      );
    }

    const stages = [...template.stages].sort((a, b) => a.order - b.order);

    return (
      <Box className={className} style={{
        display: 'flex', flexDirection: 'column' as const,
        gap: tokens.spacing[5], ...style,
      }}>
        {/* ── Header ───────────────────────────────────── */}
        <Flex align="center" justify="between">
          <Stack gap={2}>
            <Text style={{
              fontSize: tokens.typography.fontSize.lg || '1.125rem',
              fontWeight: tokens.typography.fontWeight.bold,
              color: tokens.colors.neutral[900],
            }}>
              {template.name}
            </Text>
            {template.description && (
              <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>
                {template.description}
              </Text>
            )}
          </Stack>
          <Flex align="center" gap={8}>
            <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>
              {stages.length} stage{stages.length !== 1 ? 's' : ''}
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

        {/* ── Stages List ──────────────────────────────── */}
        <Box style={{ ...card, padding: 0, overflow: 'hidden' }}>
          <Box style={createPanelHeaderStyle(tokens)}>
            <Flex align="center" gap={6}>
              <Layers size={14} color={tokens.colors.neutral[500]} />
              <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[700] }}>
                Stages ({stages.length})
              </Text>
            </Flex>
          </Box>

          <Stack gap={0}>
            {stages.map((stage, i) => {
              const isSelected = selectedStage === stage.id;
              const stageColor = getStageColor(stage.type, tokens);

              return (
                <Box key={stage.id}
                  onClick={() => onStageSelect?.(isSelected ? null : stage.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    ...createListItemStyle(tokens, { active: isSelected, interactive: true }),
                    padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
                  }}>
                  {/* Order + icon */}
                  <Box style={{
                    width: 32, height: 32, borderRadius: tokens.borderRadius.full,
                    backgroundColor: stageColor, color: tokens.colors.common.white,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    {getStageIcon(stage.type, 14)}
                  </Box>

                  {/* Stage info */}
                  <Stack gap={1} style={{ flex: 1, minWidth: 0 }}>
                    <Text style={{
                      fontSize: tokens.typography.fontSize.sm,
                      fontWeight: tokens.typography.fontWeight.semibold,
                      color: tokens.colors.neutral[800],
                    }}>
                      {stage.name}
                    </Text>
                    <Text style={{ fontSize: tokens.typography.fontSize.xs, color: stageColor }}>
                      {getStageTypeLabel(stage.type)}
                    </Text>
                  </Stack>

                  {/* Badges */}
                  <Flex gap={6} align="center" style={{ flexShrink: 0 }}>
                    {stage.isRequired && (
                      <Box style={{
                        padding: `${tokens.spacing[0]}px ${tokens.spacing[2]}px`,
                        borderRadius: tokens.borderRadius.full,
                        backgroundColor: tokens.colors.errorScale[50],
                        color: tokens.colors.errorScale[600],
                        fontSize: tokens.typography.fontSize.xs,
                        fontWeight: tokens.typography.fontWeight.medium,
                        border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.errorScale[200]}`,
                      }}>
                        Required
                      </Box>
                    )}
                    {stage.knockoutRules && stage.knockoutRules.length > 0 && (
                      <Flex align="center" gap={3} style={{
                        padding: `${tokens.spacing[0]}px ${tokens.spacing[2]}px`,
                        borderRadius: tokens.borderRadius.full,
                        backgroundColor: tokens.colors.warningScale[50],
                        color: tokens.colors.warningScale[700],
                        fontSize: tokens.typography.fontSize.xs,
                      }}>
                        <AlertTriangle size={10} />
                        <Text style={{ fontSize: 'inherit', color: 'inherit' }}>
                          {stage.knockoutRules.length} KO
                        </Text>
                      </Flex>
                    )}
                    {stage.scoringRubrics && stage.scoringRubrics.length > 0 && (
                      <Flex align="center" gap={3} style={{
                        padding: `${tokens.spacing[0]}px ${tokens.spacing[2]}px`,
                        borderRadius: tokens.borderRadius.full,
                        backgroundColor: tokens.colors.primaryScale[50],
                        color: tokens.colors.primaryScale[700],
                        fontSize: tokens.typography.fontSize.xs,
                      }}>
                        <Target size={10} />
                        <Text style={{ fontSize: 'inherit', color: 'inherit' }}>
                          {stage.scoringRubrics.length} dim
                        </Text>
                      </Flex>
                    )}
                    {stage.durationDays && (
                      <Flex align="center" gap={3} style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>
                        <Clock size={10} />
                        <Text style={{ fontSize: 'inherit', color: 'inherit' }}>{stage.durationDays}d</Text>
                      </Flex>
                    )}
                  </Flex>

                  {/* Remove */}
                  {!readOnly && onStageRemove && (
                    <Box onClick={(e: any) => { e.stopPropagation(); onStageRemove(stage.id); }}
                      style={{
                        ...hov, width: 24, height: 24, borderRadius: tokens.borderRadius.full,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: tokens.colors.neutral[400], flexShrink: 0,
                      }}>
                      <X size={14} />
                    </Box>
                  )}
                </Box>
              );
            })}

            {/* Add stage */}
            {!readOnly && (
              <Box
                onClick={() => onStageAdd?.(stages.length > 0 ? stages[stages.length - 1].id : null)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  ...hov, padding: tokens.spacing[3],
                  color: tokens.colors.neutral[500],
                  fontSize: tokens.typography.fontSize.sm,
                  borderTop: `${tokens.surface.borderWidth} dashed ${tokens.colors.neutral[200]}`,
                }}>
                <Plus size={14} />
                <Text style={{ fontSize: 'inherit', color: 'inherit' }}>Add Stage</Text>
              </Box>
            )}
          </Stack>
        </Box>
      </Box>
    );
  },
});
