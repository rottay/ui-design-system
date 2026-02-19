'use client';

/**
 * BhWorkflowAutomation - Builder Preset
 * Full visual rule builder with WHEN/IF/THEN blocks, toggle controls,
 * and action management. Personality-driven, glass-aware.
 */

import { useState, useMemo, useCallback } from 'react';
import {
  Zap, GitBranch, Play, Pause, Pencil, Trash2, Plus,
  Clock, ChevronRight, AlertTriangle, CheckCircle,
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
  formatDistanceToNow,
  createPersonalityAccentBar,

  createDividerStyle,
} from '../../../helpers';
import type { BhWorkflowAutomationProps, WorkflowRule } from '../../core';
import type { DesignTokens } from '../../../../../types';

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function getBlockColor(prefix: string, t: DesignTokens): { bg: string; border: string; text: string } {
  switch (prefix) {
    case 'WHEN': return { bg: t.colors.primaryScale[50], border: t.colors.primaryScale[200], text: t.colors.primaryScale[700] };
    case 'IF': return { bg: t.colors.warningScale[50], border: t.colors.warningScale[200], text: t.colors.warningScale[700] };
    case 'THEN': return { bg: t.colors.successScale[50], border: t.colors.successScale[200], text: t.colors.successScale[700] };
    default: return { bg: t.colors.neutral[50], border: t.colors.neutral[200], text: t.colors.neutral[700] };
  }
}

/* ================================================================== */
/*  Builder Preset                                                     */
/* ================================================================== */

export const BuilderBhWorkflowAutomation = createPreset<BhWorkflowAutomationProps>({
  name: 'BhWorkflowAutomation.Builder',
  render: (ctx: PresetContext<BhWorkflowAutomationProps>) => {
    const { primitives: { Box, Text }, props, tokens: t } = ctx;

    const isGlass = t.surface.useGlass;
    const badgeRadius = useMemo(() => getPersonalityBadgeRadius(t), [t]);
    const ptypo = useMemo(() => getPersonalityTypography(t), [t]);

    const {
      rules: rawRules = [],
      onRuleToggle,
      onRuleEdit,
      onRuleDelete,
      onAddRule,
      loading,
      className,
      style,
    } = props;

    const rules = Array.isArray(rawRules) ? rawRules : [];

    const [hoveredRule, setHoveredRule] = useState<string | null>(null);

    const card = useMemo(() => createCardStyle(t, { elevation: 'sm', glass: isGlass }), [t, isGlass]);
    const hoverStyles = useMemo(() => createCardHoverStyles(t), [t]);
    const entrance = useMemo(() => createEntranceAnimation(t), [t]);
    const sectionLabel = useMemo(() => createPersonalitySectionHeaderStyle(t), [t]);
    const accentBar = useMemo(() => createPersonalityAccentBar(t), [t]);

    const handleToggle = useCallback((id: string) => { onRuleToggle?.(id); }, [onRuleToggle]);
    const handleEdit = useCallback((id: string) => { onRuleEdit?.(id); }, [onRuleEdit]);
    const handleDelete = useCallback((id: string) => { onRuleDelete?.(id); }, [onRuleDelete]);

    const enabledCount = useMemo(() => rules.filter(r => r.enabled).length, [rules]);

    const animStyle = (index: number) => ({
      ...entrance.animate,
      transition: entrance.transition,
      transitionDelay: `${createStaggerDelay(t, index)}ms`,
    });

    const divider = useMemo(() => createDividerStyle(t), [t]);

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
        {accentBar && <Box style={accentBar} />}
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
                <Zap size={22} color={t.colors.primaryScale[600]} />
              </Box>
              <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1] }}>
                <Text style={{
                  fontSize: t.typography.fontSize.xl,
                  fontWeight: ptypo.headingWeight,
                  color: t.colors.neutral[900],
                  letterSpacing: ptypo.headingLetterSpacing,
                }}>
                  Workflow Automation
                </Text>
                <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[500]}}>
                  Configure automated rules for your hiring pipeline
                </Text>
              </Box>
            </Box>
            <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[3] }}>
              <Box style={{
                ...createBadgeStyle(t, 'success'),
                borderRadius: badgeRadius,
              }}>
                <Text style={{ fontSize: t.typography.fontSize.xs }}>{enabledCount} active</Text>
              </Box>
              <Box
                role="button"
                tabIndex={0}
                aria-label="Add new rule"
                onClick={() => onAddRule?.()}
                onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onAddRule?.(); } }}
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
                  Add Rule
                </Text>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Rules List */}
        <Box style={{ padding: t.spacing[7], flex: 1 }}>
          {rules.length === 0 && (
            <Box style={createEmptyStateStyle(t)}>
              <Zap size={32} style={{ marginBottom: t.spacing[2], opacity: 0.4 }} />
              <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[400] }}>
                No automation rules configured
              </Text>
            </Box>
          )}
          <Box style={{ display: 'flex', flexDirection: 'column', gap: t.spacing[4] }}>
            {rules.map((rule, i) => {
              const isHovered = hoveredRule === rule.id;
              return (
                <Box
                  key={rule.id}
                  style={{
                    ...card,
                    ...animStyle(i),
                    opacity: rule.enabled ? 1 : 0.7,
                    padding: 0,
                    overflow: 'hidden',
                  }}
                  onMouseEnter={() => setHoveredRule((rule.id ?? null))}
                  onMouseLeave={() => setHoveredRule(null)}
                >
                  {/* Rule header */}
                  <Box style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: `${t.spacing[3]}px ${t.spacing[4]}px`,
                    borderBottom: `1px solid ${t.colors.neutral[100]}`,
                    backgroundColor: rule.enabled ? t.colors.common.white : t.colors.neutral[50],
                  }}>
                    <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[3] }}>
                      <Box style={createIconContainerStyle(t, {
                        size: 32,
                        color: rule.enabled ? t.colors.successScale[50] : t.colors.neutral[100],
                      })}>
                        <GitBranch size={16} color={rule.enabled ? t.colors.successScale[600] : t.colors.neutral[400]} />
                      </Box>
                      <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1] }}>
                        <Text style={{
                          fontSize: t.typography.fontSize.sm,
                          fontWeight: t.typography.fontWeight.semibold,
                          color: t.colors.neutral[900],
                        }}>
                          {rule.name}
                        </Text>
                        {rule.lastTriggered && (
                          <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>
                            Last triggered {formatDistanceToNow(rule.lastTriggered, { addSuffix: true })}
                          </Text>
                        )}
                      </Box>
                    </Box>
                    <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
                      {/* Toggle */}
                      <Box
                        role="switch"
                        tabIndex={0}
                        aria-checked={rule.enabled}
                        aria-label={`Toggle rule: ${rule.name}`}
                        onClick={() => handleToggle((rule.id ?? ''))}
                        onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleToggle((rule.id ?? '')); } }}
                        style={{
                          width: 36, height: 20, borderRadius: t.borderRadius.full,
                          backgroundColor: rule.enabled ? t.colors.successScale[500] : t.colors.neutral[300],
                          position: 'relative', cursor: 'pointer',
                          transition: `background-color ${t.motion.hover}`,
                        }}
                      >
                        <Box style={{
                          width: 16, height: 16, borderRadius: t.borderRadius.full,
                          backgroundColor: t.colors.common.white,
                          position: 'absolute', top: 2,
                          left: rule.enabled ? 18 : 2,
                          transition: `left ${t.motion.hover}`,
                          boxShadow: t.shadows.sm,
                        }} />
                      </Box>
                      {/* Action buttons */}
                      {isHovered && (
                        <Box style={{ display: 'flex', gap: t.spacing[1] }}>
                          <Box
                            role="button"
                            tabIndex={0}
                            aria-label={`Edit rule: ${rule.name}`}
                            onClick={() => handleEdit((rule.id ?? ''))}
                            onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleEdit((rule.id ?? '')); } }}
                            style={{
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              width: 28, height: 28, borderRadius: t.borderRadius.md,
                              border: `1px solid ${t.colors.neutral[200]}`,
                              backgroundColor: t.colors.common.white,
                              cursor: 'pointer',
                              transition: `transform ${t.motion.hover}`,
                            }}
                          >
                            <Pencil size={13} color={t.colors.primaryScale[600]} />
                          </Box>
                          <Box
                            role="button"
                            tabIndex={0}
                            aria-label={`Delete rule: ${rule.name}`}
                            onClick={() => handleDelete((rule.id ?? ''))}
                            onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleDelete((rule.id ?? '')); } }}
                            style={{
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              width: 28, height: 28, borderRadius: t.borderRadius.md,
                              border: `1px solid ${t.colors.neutral[200]}`,
                              backgroundColor: t.colors.common.white,
                              cursor: 'pointer',
                              transition: `transform ${t.motion.hover}`,
                            }}
                          >
                            <Trash2 size={13} color={t.colors.errorScale[500]} />
                          </Box>
                        </Box>
                      )}
                    </Box>
                  </Box>

                  {/* Rule body - WHEN / IF / THEN blocks */}
                  <Box style={{ padding: `${t.spacing[3]}px ${t.spacing[4]}px`, display: 'flex', flexDirection: 'column', gap: t.spacing[2] }}>
                    {/* WHEN block */}
                    {(() => {
                      const colors = getBlockColor('WHEN', t);
                      return (
                        <Box style={{
                          display: 'flex', alignItems: 'center', gap: t.spacing[2],
                          padding: `${t.spacing[2]}px ${t.spacing[3]}px`,
                          borderRadius: t.borderRadius.md,
                          backgroundColor: colors.bg,
                          border: `1px solid ${colors.border}`,
                        }}>
                          <Box style={{
                            ...createBadgeStyle(t, 'primary'),
                            borderRadius: badgeRadius,
                            fontSize: t.typography.fontSize.xs,
                            fontWeight: t.typography.fontWeight.bold,
                          }}>
                            <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.bold }}>WHEN</Text>
                          </Box>
                          <Text style={{ fontSize: t.typography.fontSize.sm, color: colors.text }}>
                            {(rule.trigger ?? '').replace(/^WHEN\s*/i, '')}
                          </Text>
                        </Box>
                      );
                    })()}

                    {/* IF blocks */}
                    {(rule.conditions ?? []).map((cond, ci) => {
                      const colors = getBlockColor('IF', t);
                      return (
                        <Box key={ci} style={{
                          display: 'flex', alignItems: 'center', gap: t.spacing[2],
                          padding: `${t.spacing[2]}px ${t.spacing[3]}px`,
                          borderRadius: t.borderRadius.md,
                          backgroundColor: colors.bg,
                          border: `1px solid ${colors.border}`,
                          marginLeft: t.spacing[4],
                        }}>
                          <Box style={{
                            ...createBadgeStyle(t, 'warning'),
                            borderRadius: badgeRadius,
                          }}>
                            <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.bold }}>IF</Text>
                          </Box>
                          <Text style={{ fontSize: t.typography.fontSize.sm, color: colors.text }}>
                            {cond.replace(/^IF\s*/i, '')}
                          </Text>
                        </Box>
                      );
                    })}

                    {/* THEN blocks */}
                    {(rule.actions ?? []).map((action, ai) => {
                      const colors = getBlockColor('THEN', t);
                      return (
                        <Box key={ai} style={{
                          display: 'flex', alignItems: 'center', gap: t.spacing[2],
                          padding: `${t.spacing[2]}px ${t.spacing[3]}px`,
                          borderRadius: t.borderRadius.md,
                          backgroundColor: colors.bg,
                          border: `1px solid ${colors.border}`,
                          marginLeft: t.spacing[8],
                        }}>
                          <Box style={{
                            ...createBadgeStyle(t, 'success'),
                            borderRadius: badgeRadius,
                          }}>
                            <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.bold }}>THEN</Text>
                          </Box>
                          <Text style={{ fontSize: t.typography.fontSize.sm, color: colors.text }}>
                            {action.replace(/^THEN\s*/i, '')}
                          </Text>
                        </Box>
                      );
                    })}
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
