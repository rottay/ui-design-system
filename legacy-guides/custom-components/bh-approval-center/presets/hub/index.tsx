'use client';

/**
 * BhApprovalCenter - Hub Preset
 * Full approval center with grouped items, stats summary,
 * and quick approve/reject actions.
 * Personality-driven, glass-aware.
 */

import { useState, useCallback, useMemo} from 'react';
import {
  Shield, CheckCircle, XCircle, Clock,
  Briefcase, DollarSign, FileText, Users,
  AlertTriangle, ChevronRight, Filter,
} from 'lucide-react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createBadgeStyle,
  createEntranceAnimation,
  createStaggerDelay,
  createIconContainerStyle,
  createPersonalityAccentBar,
  getAccentAwareLayout,
  createCardHoverStyles,
  getPersonalityTypography,
  getPersonalityBadgeRadius,
  createEmptyStateStyle,
  formatDistanceToNow,
  createPersonalitySectionHeaderStyle,

  createDividerStyle,
} from '../../../helpers';
import type { BhApprovalCenterProps, ApprovalItem } from '../../core';
import type { DesignTokens } from '../../../../../types';

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const ENTITY_CONFIG: Record<string, { label: string; icon: typeof Briefcase; color: (t: DesignTokens) => string; bg: (t: DesignTokens) => string }> = {
  offer: { label: 'Offers', icon: FileText, color: t => t.colors.successScale[600], bg: t => t.colors.successScale[50] },
  position: { label: 'Positions', icon: Briefcase, color: t => t.colors.primaryScale[600], bg: t => t.colors.primaryScale[50] },
  budget: { label: 'Budgets', icon: DollarSign, color: t => t.colors.warningScale[600], bg: t => t.colors.warningScale[50] },
  job: { label: 'Jobs', icon: Users, color: t => t.colors.infoScale[600], bg: t => t.colors.infoScale[50] },
  client: { label: 'Clients', icon: Users, color: t => t.colors.secondaryScale[600], bg: t => t.colors.secondaryScale[50] },
  impersonation_request: { label: 'Impersonation', icon: Shield, color: t => t.colors.errorScale[600], bg: t => t.colors.errorScale[50] },
};

function getPriorityConfig(priority: ApprovalItem['priority'] | undefined, t: DesignTokens) {
  switch (priority) {
    case 'high': return { label: 'High', badge: 'error' as const, color: t.colors.errorScale[600] };
    case 'medium': return { label: 'Medium', badge: 'warning' as const, color: t.colors.warningScale[600] };
    case 'low':
    default: return { label: 'Low', badge: 'secondary' as const, color: t.colors.neutral[500] };
  }
}

function groupItems(items: ApprovalItem[], groupBy: string): Record<string, ApprovalItem[]> {
  const groups: Record<string, ApprovalItem[]> = {};
  items.forEach(item => {
    const key = (item as any)[groupBy] as string;
    if (!groups[key]) groups[key] = [];
    groups[key].push(item);
  });
  return groups;
}

function getGroupLabel(key: string, groupBy: string): string {
  if (groupBy === 'entityType') return ENTITY_CONFIG[key]?.label ?? key;
  if (groupBy === 'priority') return `${(key || '').charAt(0).toUpperCase()}${(key || '').slice(1)} Priority`;
  if (groupBy === 'status') return (key || '').charAt(0).toUpperCase() + (key || '').slice(1);
  return key;
}

/* ================================================================== */
/*  Hub Preset                                                         */
/* ================================================================== */

export const HubBhApprovalCenter = createPreset<BhApprovalCenterProps>({
  name: 'BhApprovalCenter.Hub',
  render: (ctx: PresetContext<BhApprovalCenterProps>) => {
    const { primitives: { Box, Text }, props, tokens: t } = ctx;

    const isGlass = t.surface.useGlass;
    const ptypo = useMemo(() => getPersonalityTypography(t), [t]);
    const badgeRadius = useMemo(() => getPersonalityBadgeRadius(t), [t]);

    const {
      approvals: rawApprovals = [],
      groupBy = 'entityType',
      onApprovalClick,
      onApprove,
      onReject,
      selectedApprovalId,
      loading = false,
      className,
      style,
    } = props;

    const approvals = Array.isArray(rawApprovals) ? rawApprovals : [];

    const [hoveredId, setHoveredId] = useState<string | null>(null);

    const card = useMemo(() => createCardStyle(t, { elevation: 'md', glass: isGlass }), [t, isGlass]);
    const entrance = useMemo(() => createEntranceAnimation(t), [t]);
    const accentBar = useMemo(() => createPersonalityAccentBar(t), [t]);
    const accentLayout = useMemo(() => getAccentAwareLayout(t), [t]);
    const hoverStyles = useMemo(() => createCardHoverStyles(t), [t]);

    const animStyle = useCallback((index: number) => ({
      ...entrance.animate,
      transition: entrance.transition,
      transitionDelay: `${createStaggerDelay(t, index)}ms`,
    }), [entrance, t]);

    const stats = useMemo(() => ({
      pending: (approvals ?? []).filter(a => a.status === 'pending').length,
      approved: (approvals ?? []).filter(a => a.status === 'approved').length,
      rejected: (approvals ?? []).filter(a => a.status === 'rejected').length,
      highPriority: (approvals ?? []).filter(a => a.priority === 'high' && a.status === 'pending').length,
    }), [approvals]);

    const grouped = useMemo(() => groupItems(approvals, groupBy), [approvals, groupBy]);

    const handleClick = useCallback((id: string) => {
      onApprovalClick?.(id);
    }, [onApprovalClick]);

    const handleApprove = useCallback((e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      onApprove?.(id);
    }, [onApprove]);

    const handleReject = useCallback((e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      onReject?.(id);
    }, [onReject]);

    let globalIdx = 0;

    const divider = useMemo(() => createDividerStyle(t), [t]);

    return (
      <Box
        className={className}
        style={{ ...card, padding: 0, overflow: 'hidden', ...(accentBar ? accentLayout.outer : {}), ...style }}
      >
        {accentBar && <Box style={accentBar} />}

        <Box style={accentBar ? accentLayout.inner : {}}>
        {/* Header */}
        <Box style={{
          padding: `${t.spacing[5]}px ${t.spacing[6]}px`,
          borderBottom: `1px solid ${t.colors.neutral[100]}`,
        }}>
          <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[3] }}>
              <Box style={createIconContainerStyle(t, { size: 40, color: t.colors.primaryScale[50] })}>
                <Shield size={20} color={t.colors.primaryScale[600]} />
              </Box>
              <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1] }}>
                <Text style={{
                  fontSize: t.typography.fontSize.lg,
                  fontWeight: ptypo.headingWeight,
                  color: t.colors.neutral[900],
                  letterSpacing: ptypo.headingLetterSpacing,
                }}>
                  Approval Center
                </Text>
                <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>
                  {stats.pending} pending approvals
                </Text>
              </Box>
            </Box>

            {/* Stats */}
            <Box style={{ display: 'flex', gap: t.spacing[3] }}>
              {[
                { label: 'Pending', count: stats.pending, color: t.colors.warningScale[600], bg: t.colors.warningScale[50] },
                { label: 'Approved', count: stats.approved, color: t.colors.successScale[600], bg: t.colors.successScale[50] },
                { label: 'Rejected', count: stats.rejected, color: t.colors.errorScale[600], bg: t.colors.errorScale[50] },
              ].map(s => (
                <Box key={s.label} style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1],
                  textAlign: 'center' as const,
                  padding: `${t.spacing[1]}px ${t.spacing[3]}px`,
                  borderRadius: badgeRadius,
                  backgroundColor: s.bg,
                }}>
                  <Text style={{ fontSize: t.typography.fontSize.lg, fontWeight: t.typography.fontWeight.bold, color: t.colors.neutral[900] }}>{s.count}</Text>
                  <Text style={{ fontSize: t.typography.fontSize.xs, color: s.color }}>{s.label}</Text>
                </Box>
              ))}
            </Box>
          </Box>

          {stats.highPriority > 0 && (
            <Box style={{
              display: 'flex', alignItems: 'center', gap: t.spacing[2],
              marginTop: t.spacing[3], padding: `${t.spacing[2]}px ${t.spacing[3]}px`,
              borderRadius: t.borderRadius.md,
              backgroundColor: t.colors.errorScale[50],
              border: `1px solid ${t.colors.errorScale[200]}`,
            }}>
              <AlertTriangle size={14} color={t.colors.errorScale[600]} />
              <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.errorScale[700] }}>
                {stats.highPriority} high priority item{stats.highPriority !== 1 ? 's' : ''} requiring attention
              </Text>
            </Box>
          )}
        </Box>

        {/* Grouped content */}
        <Box style={{ padding: t.spacing[5] }}>
          {approvals.length === 0 && (
            <Box style={createEmptyStateStyle(t)}>
              <Shield size={32} style={{ marginBottom: t.spacing[2], opacity: 0.4 }} />
              <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[400] }}>
                No approvals to review
              </Text>
            </Box>
          )}

          {Object.entries(grouped).map(([key, items]) => {
            const entityCfg = ENTITY_CONFIG[key];
            const Icon = entityCfg?.icon ?? FileText;

            return (
              <Box key={key} style={{ marginBottom: t.spacing[5] }}>
                <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], marginBottom: t.spacing[3] }}>
                  <Icon size={14} color={entityCfg?.color(t) ?? t.colors.neutral[500]} />
                  <Text style={{
                    ...createPersonalitySectionHeaderStyle(t),
                    marginBottom: 0,
                    color: entityCfg?.color(t) ?? t.colors.neutral[500],
                  }}>
                    {getGroupLabel(key, groupBy)} ({items.length})
                  </Text>
                </Box>

                <Box style={{ display: 'flex', flexDirection: 'column', gap: t.spacing[2] }}>
                  {items.map((approval) => {
                    const priorityCfg = getPriorityConfig(approval.priority, t);
                    const isSelected = selectedApprovalId === approval.id;
                    const isHovered = hoveredId === approval.id;
                    const isPending = approval.status === 'pending';

                    return (
                      <Box
                        key={approval.id}
                        role="listitem"
                        tabIndex={0}
                        aria-label={`${approval.entityTitle}, ${priorityCfg.label} priority, ${approval.status}`}
                        onClick={() => handleClick((approval.id ?? ''))}
                        onMouseEnter={() => setHoveredId((approval.id ?? null))}
                        onMouseLeave={() => setHoveredId(null)}
                        onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleClick((approval.id ?? '')); } }}
                        style={{
                          ...animStyle(globalIdx++),
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          padding: `${t.spacing[3]}px ${t.spacing[4]}px`,
                          borderRadius: t.borderRadius.lg,
                          border: `1px solid ${isSelected ? t.colors.primaryScale[200] : t.colors.neutral[100]}`,
                          backgroundColor: isSelected ? t.colors.primaryScale[50] : isHovered ? t.colors.neutral[50] : t.colors.common.white,
                          cursor: 'pointer', transition: `all ${t.motion.hover}`,
                        }}
                      >
                        <Box style={{ flex: 1, minWidth: 0 }}>
                          <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], marginBottom: t.spacing[1] }}>
                            <Text style={{
                              fontSize: t.typography.fontSize.sm,
                              fontWeight: t.typography.fontWeight.medium,
                              color: t.colors.neutral[900],
                              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                            }}>
                              {approval.entityTitle ?? ''}
                            </Text>
                            <Box style={{ ...createBadgeStyle(t, priorityCfg.badge), borderRadius: badgeRadius, padding: `0 ${t.spacing[2]}px` }}>
                              <Text style={{ fontSize: t.typography.fontSize.xs }}>{priorityCfg.label}</Text>
                            </Box>
                          </Box>
                          <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[3] }}>
                            <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>
                              by {approval.requestedBy ?? ''}
                            </Text>
                            <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>
                              {approval.requestedAt ? formatDistanceToNow(approval.requestedAt, { addSuffix: true }) : ''}
                            </Text>
                          </Box>
                        </Box>

                        {/* Actions */}
                        <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], flexShrink: 0, marginLeft: t.spacing[3] }}>
                          {isPending && isHovered && onApprove && (
                            <Box
                              tabIndex={0}
                              role="button"
                              aria-label={`Approve ${approval.entityTitle}`}
                              onClick={(e: React.MouseEvent) => handleApprove(e, (approval.id ?? ''))}
                              onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); onApprove?.((approval.id ?? '')); } }}
                              style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                width: 28, height: 28, borderRadius: t.borderRadius.md,
                                backgroundColor: t.colors.successScale[50],
                                border: `1px solid ${t.colors.successScale[200]}`,
                                cursor: 'pointer',
                              }}
                            >
                              <CheckCircle size={14} color={t.colors.successScale[600]} />
                            </Box>
                          )}
                          {isPending && isHovered && onReject && (
                            <Box
                              tabIndex={0}
                              role="button"
                              aria-label={`Reject ${approval.entityTitle}`}
                              onClick={(e: React.MouseEvent) => handleReject(e, (approval.id ?? ''))}
                              onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); onReject?.((approval.id ?? '')); } }}
                              style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                width: 28, height: 28, borderRadius: t.borderRadius.md,
                                backgroundColor: t.colors.errorScale[50],
                                border: `1px solid ${t.colors.errorScale[200]}`,
                                cursor: 'pointer',
                              }}
                            >
                              <XCircle size={14} color={t.colors.errorScale[600]} />
                            </Box>
                          )}
                          {!isPending && (
                            <Box style={{
                              ...createBadgeStyle(t, approval.status === 'approved' ? 'success' : 'error'),
                              borderRadius: badgeRadius,
                            }}>
                              <Text style={{ fontSize: t.typography.fontSize.xs }}>
                                {approval.status === 'approved' ? 'Approved' : 'Rejected'}
                              </Text>
                            </Box>
                          )}
                          {isPending && !isHovered && (
                            <Clock size={14} color={t.colors.warningScale[400]} />
                          )}
                          <ChevronRight size={14} color={t.colors.neutral[300]} />
                        </Box>
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
