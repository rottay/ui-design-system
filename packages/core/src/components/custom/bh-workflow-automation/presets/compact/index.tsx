'use client';

/**
 * BhWorkflowAutomation - Compact Preset
 * Condensed automation rule list with toggle controls.
 * Designed for sidebar or widget placement.
 */

import { useState, useMemo, useCallback, useEffect } from 'react';
import {
  Zap, GitBranch, Play, Pause, ChevronRight,
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
  formatDistanceToNow,
} from '../../../helpers';
import type { BhWorkflowAutomationProps, WorkflowRule } from '../../core';
import type { DesignTokens } from '../../../../../types';

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */

const MOCK_RULES: WorkflowRule[] = [
  { id: 'wr-1', name: 'Auto-reject low scores', trigger: 'WHEN candidate score < 30', conditions: ['IF no interview scheduled'], actions: ['THEN send rejection email'], enabled: true, lastTriggered: new Date(Date.now() - 3600000) },
  { id: 'wr-2', name: 'Fast-track top candidates', trigger: 'WHEN candidate score > 85', conditions: ['IF position is urgent'], actions: ['THEN schedule interview'], enabled: true },
  { id: 'wr-3', name: 'Follow-up reminder', trigger: 'WHEN no response after 3 days', conditions: ['IF candidate in active pipeline'], actions: ['THEN send follow-up email'], enabled: false },
];

/* ================================================================== */
/*  Compact Preset                                                     */
/* ================================================================== */

export const CompactBhWorkflowAutomation = createPreset<BhWorkflowAutomationProps>({
  name: 'BhWorkflowAutomation.Compact',
  render: (ctx: PresetContext<BhWorkflowAutomationProps>) => {
    const { primitives: { Box, Text }, props, tokens: t } = ctx;

    const isGlass = t.surface.useGlass;
    const badgeRadius = getPersonalityBadgeRadius(t);
    const ptypo = getPersonalityTypography(t);

    const {
      rules = MOCK_RULES,
      onRuleToggle,
      onRuleEdit,
      className,
      style,
    } = props;


    const card = useMemo(() => createCardStyle(t, { elevation: 'sm', glass: isGlass }), [t, isGlass]);
    const entrance = useMemo(() => createEntranceAnimation(t), [t]);

    const handleToggle = useCallback((id: string) => { onRuleToggle?.(id); }, [onRuleToggle]);

    const enabledCount = useMemo(() => rules.filter(r => r.enabled).length, [rules]);

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
            <Zap size={16} color={t.colors.primaryScale[500]} />
            <Text style={{
              fontSize: t.typography.fontSize.sm,
              fontWeight: ptypo.headingWeight,
              color: t.colors.neutral[800],
            }}>
              Automation
            </Text>
          </Box>
          <Box style={{
            ...createBadgeStyle(t, 'success'),
            borderRadius: badgeRadius,
            padding: `1px ${t.spacing[2]}px`,
          }}>
            <Text style={{ fontSize: t.typography.fontSize.xs }}>{enabledCount} active</Text>
          </Box>
        </Box>

        {/* Rules list */}
        <Box role="list" aria-label="Automation rules">
          {rules.length === 0 && (
            <Box style={{ ...createEmptyStateStyle(t), padding: t.spacing[4] }}>
              <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>
                No rules
              </Text>
            </Box>
          )}
          {rules.map((rule) => (
            <Box
              key={rule.id}
              role="listitem"
              tabIndex={0}
              aria-label={`Rule: ${rule.name}, ${rule.enabled ? 'enabled' : 'disabled'}`}
              onClick={() => onRuleEdit?.((rule.id ?? ''))}
              onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onRuleEdit?.((rule.id ?? '')); } }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: t.spacing[2],
                padding: `${t.spacing[2]}px ${t.spacing[4]}px`,
                borderBottom: `1px solid ${t.colors.neutral[50]}`,
                cursor: 'pointer',
                backgroundColor: t.colors.common.white,
                opacity: rule.enabled ? 1 : 0.6,
                transition: `background-color ${t.motion.hover}`,
              }}
            >
              <Box style={{
                width: 8, height: 8, borderRadius: t.borderRadius.full, flexShrink: 0,
                backgroundColor: rule.enabled ? t.colors.successScale[500] : t.colors.neutral[300],
              }} />
              <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1], flex: 1, minWidth: 0 }}>
                <Text style={{
                  fontSize: t.typography.fontSize.xs,
                  fontWeight: t.typography.fontWeight.medium,
                  color: t.colors.neutral[800],
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}>
                  {rule.name}
                </Text>
                <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>
                  {(rule.conditions ?? []).length} condition{(rule.conditions ?? []).length !== 1 ? 's' : ''} / {(rule.actions ?? []).length} action{(rule.actions ?? []).length !== 1 ? 's' : ''}
                </Text>
              </Box>
              <Box
                role="switch"
                tabIndex={0}
                aria-checked={rule.enabled}
                aria-label={`Toggle ${rule.name}`}
                onClick={(e: React.MouseEvent) => { e.stopPropagation(); handleToggle((rule.id ?? '')); }}
                onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); handleToggle((rule.id ?? '')); } }}
                style={{
                  width: 28, height: 16, borderRadius: t.borderRadius.full,
                  backgroundColor: rule.enabled ? t.colors.successScale[500] : t.colors.neutral[300],
                  position: 'relative', cursor: 'pointer', flexShrink: 0,
                  transition: `background-color ${t.motion.hover}`,
                }}
              >
                <Box style={{
                  width: 12, height: 12, borderRadius: t.borderRadius.full,
                  backgroundColor: t.colors.common.white,
                  position: 'absolute', top: 2,
                  left: rule.enabled ? 14 : 2,
                  transition: `left ${t.motion.hover}`,
                }} />
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
    );
  },
});
