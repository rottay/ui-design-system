'use client';

/**
 * BhAgentVersionHistory - Compact Preset
 * Condensed list view of agent versions.
 */

import { useState, useMemo, useCallback } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createBadgeStyle,
  getPersonalityTypography,
  getPersonalityBadgeRadius,
  formatDistanceToNow,
  createEmptyStateStyle,
} from '../../../helpers';
import type { BhAgentVersionHistoryProps, AgentVersion } from '../../core';
import type { DesignTokens } from '../../../../../types';
import { GitBranch, RotateCcw, Activity } from 'lucide-react';

function getVersionStatusBadge(status: AgentVersion['status'] | undefined): 'success' | 'secondary' | 'warning' {
  switch (status) {
    case 'active': return 'success';
    case 'deprecated': return 'secondary';
    case 'draft':
    default: return 'warning';
  }
}

function getStatusLabel(status: AgentVersion['status'] | undefined): string {
  switch (status) {
    case 'active': return 'Active';
    case 'deprecated': return 'Deprecated';
    case 'draft':
    default: return 'Draft';
  }
}

export const CompactBhAgentVersionHistory = createPreset<BhAgentVersionHistoryProps>({
  name: 'BhAgentVersionHistory.Compact',
  render: ({ primitives, props, tokens }: PresetContext<BhAgentVersionHistoryProps>) => {
    const { Box, Text } = primitives;
    const t = tokens;

    const {
      versions: rawVersions = [],
      agentName,
      selectedVersionId: controlledSelected,
      onVersionClick,
      onRollback,
      loading = false,
      className,
      style,
    } = props;

    const versions = Array.isArray(rawVersions) ? rawVersions : [];

    const [localSelected, setLocalSelected] = useState<string | null>(null);
    const selectedVersionId = controlledSelected ?? localSelected;

    const handleVersionClick = useCallback((id: string) => {
      onVersionClick?.(id);
      if (controlledSelected === undefined) setLocalSelected(id);
    }, [onVersionClick, controlledSelected]);

    const isGlass = t.surface.useGlass && !!t.glass;
    const cardBase = useMemo(() => createCardStyle(t, { elevation: 'sm', glass: isGlass }), [t, isGlass]);
    const ptypo = useMemo(() => getPersonalityTypography(t), [t]);
    const badgeRadius = useMemo(() => getPersonalityBadgeRadius(t), [t]);
    const emptyState = useMemo(() => createEmptyStateStyle(t), [t]);

    const sortedVersions = useMemo(() => {
      return [...versions].sort((a, b) => (b.createdAt?.getTime?.() ?? 0) - (a.createdAt?.getTime?.() ?? 0));
    }, [versions]);

    if (loading) {
      return (
        <Box className={className} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: t.spacing[6], ...style }}>
          <Activity size={18} color={t.colors.neutral[300]} style={{ marginRight: t.spacing[2] }} />
          <Text style={{ color: t.colors.neutral[400], fontSize: t.typography.fontSize.sm }}>Loading...</Text>
        </Box>
      );
    }

    return (
      <Box className={className} style={{ ...cardBase, padding: 0, ...style }}>
        {/* Header */}
        <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2],
          padding: `${t.spacing[2]}px ${t.spacing[3]}px`,
          borderBottom: `${t.surface.borderWidth} ${t.surface.borderStyle} ${t.colors.neutral[200]}`,
        }}>
          <GitBranch size={14} strokeWidth={1.5} style={{ color: t.colors.primaryScale[600] }} />
          <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: ptypo.headingWeight, color: t.colors.neutral[900] }}>
            {agentName ? `${agentName} Versions` : 'Versions'}
          </Text>
          <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400], marginLeft: 'auto' }}>
            {sortedVersions.length}
          </Text>
        </Box>

        {/* Version list */}
        {sortedVersions.length === 0 ? (
          <Box style={{ ...emptyState, padding: t.spacing[4] }}>
            <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[400] }}>No versions</Text>
          </Box>
        ) : (
          <Box style={{ display: 'flex', flexDirection: 'column' as const }}>
            {sortedVersions.map((version, index) => {
              const isSelected = selectedVersionId === version.id;

              return (
                <Box
                  key={version.id}
                  role="button"
                  tabIndex={0}
                  aria-label={`Version ${version.version}`}
                  onClick={() => handleVersionClick(version.id)}
                  onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleVersionClick(version.id); } }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: t.spacing[2],
                    padding: `${t.spacing[2]}px ${t.spacing[3]}px`,
                    borderBottom: index < sortedVersions.length - 1
                      ? `${t.surface.borderWidth} ${t.surface.borderStyle} ${t.colors.neutral[100]}`
                      : 'none',
                    cursor: 'pointer',
                    backgroundColor: isSelected ? t.colors.primaryScale[50] : 'transparent',
                    borderLeft: isSelected ? `3px solid ${t.colors.primaryScale[500]}` : '3px solid transparent',
                    transition: `all ${t.motion.hover}`,
                  }}
                  onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => {
                    if (!isSelected) e.currentTarget.style.backgroundColor = t.colors.neutral[50];
                  }}
                  onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => {
                    if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  {/* Version number */}
                  <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[900], width: 50, flexShrink: 0 }}>
                    v{version.version}
                  </Text>

                  {/* Status badge */}
                  <Box style={{ ...createBadgeStyle(t, getVersionStatusBadge(version.status)), borderRadius: badgeRadius, flexShrink: 0 }}>
                    <Text>{getStatusLabel(version.status)}</Text>
                  </Box>

                  {/* Description */}
                  <Text style={{
                    flex: 1, fontSize: t.typography.fontSize.xs, color: t.colors.neutral[600],
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const, minWidth: 0,
                  }}>
                    {version.changeDescription}
                  </Text>

                  {/* Metrics */}
                  {version.metrics && (
                    <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400], flexShrink: 0 }}>
                      {(version.metrics.avgScore ?? 0).toFixed(1)} avg
                    </Text>
                  )}

                  {/* Time */}
                  <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400], flexShrink: 0 }}>
                    {formatDistanceToNow(version.createdAt, { addSuffix: true })}
                  </Text>

                  {/* Rollback button */}
                  {onRollback && version.status !== 'active' && (
                    <Box
                      role="button"
                      tabIndex={0}
                      aria-label={`Rollback to v${version.version}`}
                      onClick={(e: React.MouseEvent) => { e.stopPropagation(); onRollback(version.id); }}
                      onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); onRollback(version.id); } }}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        width: 24, height: 24, borderRadius: t.borderRadius.md,
                        border: `${t.surface.borderWidth} ${t.surface.borderStyle} ${t.colors.neutral[200]}`,
                        backgroundColor: t.colors.common.white, color: t.colors.neutral[500],
                        cursor: 'pointer', flexShrink: 0,
                        transition: `all ${t.motion.hover}`,
                      }}
                    >
                      <RotateCcw size={12} strokeWidth={1.5} />
                    </Box>
                  )}
                </Box>
              );
            })}
          </Box>
        )}
      </Box>
    );
  },
});
