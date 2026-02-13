'use client';

/**
 * BhAgentVersionHistory - Timeline Preset
 * Vertical timeline with version cards, status badges, metrics.
 */

import { useState, useMemo, useCallback } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createBadgeStyle,
  createEntranceAnimation,
  createCardHoverStyles,
  getPersonalityTypography,
  getPersonalityBadgeRadius,
  createIconContainerStyle,
  createPersonalitySectionHeaderStyle,
  createStaggerDelay,
  formatDistanceToNow,
  createEmptyStateStyle,
  createProgressBarStyle,
} from '../../../helpers';
import type { BhAgentVersionHistoryProps, AgentVersion } from '../../core';
import type { DesignTokens } from '../../../../../types';
import { GitBranch, RotateCcw, CheckCircle, Archive, FileEdit, Activity, Star, BarChart3, User } from 'lucide-react';

function getVersionStatusInfo(status: AgentVersion['status'], t: DesignTokens) {
  switch (status) {
    case 'active': return { bg: t.colors.successScale[100], color: t.colors.successScale[700], badgeColor: 'success' as const, label: 'Active' };
    case 'deprecated': return { bg: t.colors.neutral[100], color: t.colors.neutral[500], badgeColor: 'secondary' as const, label: 'Deprecated' };
    case 'draft': return { bg: t.colors.warningScale[100], color: t.colors.warningScale[700], badgeColor: 'warning' as const, label: 'Draft' };
  }
}

export const TimelineBhAgentVersionHistory = createPreset<BhAgentVersionHistoryProps>({
  name: 'BhAgentVersionHistory.Timeline',
  render: ({ primitives, props, tokens }: PresetContext<BhAgentVersionHistoryProps>) => {
    const { Box, Text } = primitives;
    const t = tokens;

    const {
      versions = [],
      agentName,
      selectedVersionId: controlledSelected,
      onVersionClick,
      onRollback,
      loading = false,
      className,
      style,
    } = props;

    const [localSelected, setLocalSelected] = useState<string | null>(null);
    const selectedVersionId = controlledSelected ?? localSelected;

    const handleVersionClick = useCallback((id: string) => {
      onVersionClick?.(id);
      if (controlledSelected === undefined) setLocalSelected(id);
    }, [onVersionClick, controlledSelected]);

    const isGlass = t.surface.useGlass && !!t.glass;
    const cardBase = useMemo(() => createCardStyle(t, { elevation: 'sm', glass: isGlass }), [t, isGlass]);
    const hoverStyles = useMemo(() => createCardHoverStyles(t), [t]);
    const entrance = useMemo(() => createEntranceAnimation(t), [t]);
    const ptypo = useMemo(() => getPersonalityTypography(t), [t]);
    const badgeRadius = useMemo(() => getPersonalityBadgeRadius(t), [t]);
    const sectionLabel = useMemo(() => createPersonalitySectionHeaderStyle(t), [t]);
    const emptyState = useMemo(() => createEmptyStateStyle(t), [t]);


    // Sort versions by date descending
    const sortedVersions = useMemo(() => {
      return [...versions].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }, [versions]);

    if (loading) {
      return (
        <Box className={className} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: t.spacing[10], ...style }}>
          <Activity size={24} color={t.colors.neutral[300]} style={{ marginRight: t.spacing[3] }} />
          <Text style={{ color: t.colors.neutral[400], fontSize: t.typography.fontSize.sm }}>Loading version history...</Text>
        </Box>
      );
    }

    return (
      <Box className={className} style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[4], ...style }}>
        {/* Header */}
        <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
          <GitBranch size={20} strokeWidth={1.5} style={{ color: t.colors.primaryScale[600] }} />
          <Text style={{ fontSize: t.typography.fontSize.lg, fontWeight: ptypo.headingWeight, letterSpacing: ptypo.headingLetterSpacing, color: t.colors.neutral[900] }}>
            {agentName ? `${agentName} - Version History` : 'Version History'}
          </Text>
          <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[400], marginLeft: 'auto' }}>
            {sortedVersions.length} version{sortedVersions.length !== 1 ? 's' : ''}
          </Text>
        </Box>

        {/* Timeline */}
        {sortedVersions.length === 0 ? (
          <Box style={emptyState}>
            <GitBranch size={48} strokeWidth={1} style={{ color: t.colors.neutral[300], marginBottom: t.spacing[3] }} />
            <Text style={{ fontSize: t.typography.fontSize.lg, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[500] }}>
              No versions yet
            </Text>
          </Box>
        ) : (
          <Box style={{ position: 'relative' as const, paddingLeft: t.spacing[6] }}>
            {/* Timeline line */}
            <Box style={{
              position: 'absolute' as const,
              left: 11,
              top: 0,
              bottom: 0,
              width: 2,
              backgroundColor: t.colors.neutral[200],
            }} />

            {sortedVersions.map((version, index) => {
              const statusInfo = getVersionStatusInfo(version.status, t);
              const isSelected = selectedVersionId === version.id;
              const staggerDelay = createStaggerDelay(t, index);
              const isActive = version.status === 'active';

              return (
                <Box
                  key={version.id}
                  style={{
                    position: 'relative' as const,
                    marginBottom: t.spacing[4],
                    ...entrance.animate,
                    transition: entrance.transition,
                    transitionDelay: `${staggerDelay}ms`,
                  }}
                >
                  {/* Timeline dot */}
                  <Box style={{
                    position: 'absolute' as const,
                    left: -t.spacing[6] + 4,
                    top: t.spacing[4],
                    width: isActive ? 16 : 12,
                    height: isActive ? 16 : 12,
                    borderRadius: t.borderRadius.full,
                    backgroundColor: isActive ? t.colors.primaryScale[500] : statusInfo.color,
                    border: `2px solid ${t.colors.common.white}`,
                    boxShadow: t.shadows.sm,
                    zIndex: 1,
                  }} />

                  {/* Version card */}
                  <Box
                    role="button"
                    tabIndex={0}
                    aria-label={`Version ${version.version}`}
                    onClick={() => handleVersionClick(version.id)}
                    onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => {
                      Object.assign(e.currentTarget.style, hoverStyles.hover);
                    }}
                    onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => {
                      e.currentTarget.style.transform = 'none';
                      e.currentTarget.style.boxShadow = t.shadows.sm;
                    }}
                    style={{
                      ...cardBase,
                      ...hoverStyles.base,
                      padding: t.spacing[4],
                      borderLeft: isSelected ? `3px solid ${t.colors.primaryScale[500]}` : `3px solid transparent`,
                    }}
                  >
                    {/* Version header */}
                    <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], marginBottom: t.spacing[2] }}>
                      <Text style={{ fontSize: t.typography.fontSize.md, fontWeight: ptypo.headingWeight, color: t.colors.neutral[900] }}>
                        v{version.version}
                      </Text>
                      <Box style={{ ...createBadgeStyle(t, statusInfo.badgeColor), borderRadius: badgeRadius }}>
                        <Text>{statusInfo.label}</Text>
                      </Box>
                      <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400], marginLeft: 'auto' }}>
                        {formatDistanceToNow(version.createdAt, { addSuffix: true })}
                      </Text>
                    </Box>

                    {/* Change description */}
                    <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[600], lineHeight: t.typography.lineHeight.relaxed, display: 'block', marginBottom: t.spacing[3] }}>
                      {version.changeDescription}
                    </Text>

                    {/* Author */}
                    <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], marginBottom: t.spacing[3] }}>
                      <User size={14} strokeWidth={1.5} style={{ color: t.colors.neutral[400] }} />
                      <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>
                        {version.author}
                      </Text>
                    </Box>

                    {/* Metrics */}
                    {version.metrics && (
                      <Box style={{ display: 'flex', gap: t.spacing[4], marginBottom: t.spacing[3] }}>
                        <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1] }}>
                          <Star size={14} strokeWidth={1.5} style={{ color: t.colors.warningScale[500] }} />
                          <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[600] }}>
                            Score: {version.metrics.avgScore.toFixed(1)}
                          </Text>
                        </Box>
                        <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1] }}>
                          <BarChart3 size={14} strokeWidth={1.5} style={{ color: t.colors.primaryScale[500] }} />
                          <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[600] }}>
                            Completion: {version.metrics.completionRate.toFixed(0)}%
                          </Text>
                        </Box>
                      </Box>
                    )}

                    {/* Rollback button (only for non-active versions) */}
                    {onRollback && version.status !== 'active' && (
                      <Box
                        role="button"
                        tabIndex={0}
                        aria-label={`Rollback to version ${version.version}`}
                        onClick={(e: React.MouseEvent) => { e.stopPropagation(); onRollback(version.id); }}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: t.spacing[1],
                          padding: `${t.spacing[1]}px ${t.spacing[3]}px`,
                          borderRadius: t.borderRadius.md,
                          border: `${t.surface.borderWidth} ${t.surface.borderStyle} ${t.colors.neutral[200]}`,
                          backgroundColor: t.colors.common.white,
                          color: t.colors.neutral[600],
                          fontSize: t.typography.fontSize.xs,
                          fontWeight: t.typography.fontWeight.medium,
                          cursor: 'pointer',
                          transition: `all ${t.motion.hover}`,
                        }}
                      >
                        <RotateCcw size={12} strokeWidth={1.5} />
                        <Text>Rollback</Text>
                      </Box>
                    )}
                  </Box>
                </Box>
              );
            })}
          </Box>
        )}
      </Box>
    );
  },
});
