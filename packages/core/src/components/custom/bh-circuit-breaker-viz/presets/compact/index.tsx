'use client';

/**
 * BhCircuitBreakerViz - Compact Preset
 * List view with status indicators for each circuit node.
 */

import { useState, useMemo, useCallback } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createBadgeStyle,
  createEntranceAnimation,
  getPersonalityTypography,
  getPersonalityBadgeRadius,
  createPersonalitySectionHeaderStyle,
  createStaggerDelay,
  formatDistanceToNow,
  createEmptyStateStyle,
} from '../../../helpers';
import type { BhCircuitBreakerVizProps, CircuitNode } from '../../core';
import type { DesignTokens } from '../../../../../types';
import { Zap, Server, Globe, Activity, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

function getStateColor(state: CircuitNode['state'], t: DesignTokens) {
  switch (state) {
    case 'closed': return { color: t.colors.successScale[600], bg: t.colors.successScale[100], label: 'Closed' };
    case 'open': return { color: t.colors.errorScale[600], bg: t.colors.errorScale[100], label: 'Open' };
    case 'half-open': return { color: t.colors.warningScale[600], bg: t.colors.warningScale[100], label: 'Half-Open' };
  }
}

function getStateIcon(state: CircuitNode['state'], size: number) {
  const iconProps = { size, strokeWidth: 1.5 };
  switch (state) {
    case 'closed': return <CheckCircle {...iconProps} />;
    case 'open': return <XCircle {...iconProps} />;
    case 'half-open': return <AlertTriangle {...iconProps} />;
  }
}

export const CompactBhCircuitBreakerViz = createPreset<BhCircuitBreakerVizProps>({
  name: 'BhCircuitBreakerViz.Compact',
  render: ({ primitives, props, tokens }: PresetContext<BhCircuitBreakerVizProps>) => {
    const { Box, Text } = primitives;
    const t = tokens;

    const MOCK_NODES: CircuitNode[] = [
      { id: 'cb-1', name: 'OpenAI', type: 'provider', state: 'closed', successCount: 12450, failureCount: 23, lastStateChange: new Date(Date.now() - 86400000) },
      { id: 'cb-2', name: 'GPT-4o', type: 'model', state: 'closed', successCount: 8920, failureCount: 12, lastStateChange: new Date(Date.now() - 172800000) },
      { id: 'cb-3', name: 'Anthropic', type: 'provider', state: 'half-open', successCount: 5670, failureCount: 89, lastStateChange: new Date(Date.now() - 3600000) },
      { id: 'cb-4', name: 'Scoring API', type: 'endpoint', state: 'open', successCount: 1100, failureCount: 340, lastStateChange: new Date(Date.now() - 1800000) },
    ];

    const {
      nodes = MOCK_NODES,
      onNodeClick,
      selectedNodeId: controlledSelected,
      loading = false,
      className,
      style,
    } = props;

    const [localSelected, setLocalSelected] = useState<string | null>(null);
    const selectedNodeId = controlledSelected ?? localSelected;

    const handleNodeClick = useCallback((id: string) => {
      onNodeClick?.(id);
      if (controlledSelected === undefined) setLocalSelected(id);
    }, [onNodeClick, controlledSelected]);

    const isGlass = t.surface.useGlass && !!t.glass;
    const cardBase = useMemo(() => createCardStyle(t, { elevation: 'sm', glass: isGlass }), [t, isGlass]);
    const ptypo = useMemo(() => getPersonalityTypography(t), [t]);
    const badgeRadius = useMemo(() => getPersonalityBadgeRadius(t), [t]);
    const sectionLabel = useMemo(() => createPersonalitySectionHeaderStyle(t), [t]);
    const emptyState = useMemo(() => createEmptyStateStyle(t), [t]);

    // Group nodes by state
    const groupedNodes = useMemo(() => {
      const groups: Record<string, CircuitNode[]> = { open: [], 'half-open': [], closed: [] };
      nodes.forEach(n => groups[n.state]?.push(n));
      return groups;
    }, [nodes]);

    if (loading) {
      return (
        <Box className={className} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: t.spacing[6], ...style }}>
          <Activity size={18} color={t.colors.neutral[300]} style={{ marginRight: t.spacing[2] }} />
          <Text style={{ color: t.colors.neutral[400], fontSize: t.typography.fontSize.sm }}>Loading...</Text>
        </Box>
      );
    }

    if (nodes.length === 0) {
      return (
        <Box className={className} style={{ ...emptyState, ...style }}>
          <Zap size={32} strokeWidth={1} style={{ color: t.colors.neutral[300], marginBottom: t.spacing[2] }} />
          <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[400] }}>No nodes configured</Text>
        </Box>
      );
    }

    // State summary counts
    const openCount = groupedNodes.open.length;
    const halfOpenCount = groupedNodes['half-open'].length;
    const closedCount = groupedNodes.closed.length;

    return (
      <Box className={className} style={{ ...cardBase, width: '100%', padding: 0, ...style }}>
        {/* Header with state summary */}
        <Box style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: `${t.spacing[3]}px ${t.spacing[4]}px`,
          borderBottom: `${t.surface.borderWidth} ${t.surface.borderStyle} ${t.colors.neutral[200]}`,
        }}>
          <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
            <Zap size={16} strokeWidth={1.5} style={{ color: t.colors.primaryScale[600] }} />
            <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: ptypo.headingWeight, color: t.colors.neutral[900] }}>
              Circuit Breakers
            </Text>
          </Box>
          <Box style={{ display: 'flex', gap: t.spacing[3] }}>
            {openCount > 0 && (
              <Box style={{ ...createBadgeStyle(t, 'error'), borderRadius: badgeRadius }}>
                <Text>{openCount} open</Text>
              </Box>
            )}
            {halfOpenCount > 0 && (
              <Box style={{ ...createBadgeStyle(t, 'warning'), borderRadius: badgeRadius }}>
                <Text>{halfOpenCount} half-open</Text>
              </Box>
            )}
            <Box style={{ ...createBadgeStyle(t, 'success'), borderRadius: badgeRadius }}>
              <Text>{closedCount} closed</Text>
            </Box>
          </Box>
        </Box>

        {/* Node list */}
        <Box style={{ display: 'flex', flexDirection: 'column' as const }}>
          {nodes.map((node, index) => {
            const sc = getStateColor(node.state, t);
            const isSelected = selectedNodeId === node.id;

            return (
              <Box
                key={node.id}
                role="button"
                tabIndex={0}
                aria-label={`${node.name}: ${sc.label}`}
                onClick={() => handleNodeClick(node.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: t.spacing[3],
                  padding: `${t.spacing[2]}px ${t.spacing[4]}px`,
                  borderBottom: index < nodes.length - 1
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
                {/* State icon */}
                <Box style={{ color: sc.color, flexShrink: 0 }}>
                  {getStateIcon(node.state, 16)}
                </Box>

                {/* Name + type */}
                <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1], flex: 1, minWidth: 0 }}>
                  <Text style={{
                    fontSize: t.typography.fontSize.sm, fontWeight: ptypo.headingWeight,
                    color: t.colors.neutral[900], display: 'block',
                  }}>
                    {node.name}
                  </Text>
                  <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500], textTransform: 'capitalize' as const }}>
                    {node.type}
                  </Text>
                </Box>

                {/* Failure/success counts */}
                <Box style={{ display: 'flex', gap: t.spacing[3], flexShrink: 0 }}>
                  <Box style={{ textAlign: 'right' as const, display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1] }}>
                    <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[900], fontWeight: t.typography.fontWeight.semibold }}>
                      {node.successCount}
                    </Text>
                    <Text style={{ fontSize: 9, color: t.colors.neutral[400], display: 'block' }}>ok</Text>
                  </Box>
                  <Box style={{ textAlign: 'right' as const, display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1] }}>
                    <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[900], fontWeight: t.typography.fontWeight.semibold }}>
                      {node.failureCount}
                    </Text>
                    <Text style={{ fontSize: 9, color: t.colors.neutral[400], display: 'block' }}>fail</Text>
                  </Box>
                </Box>

                {/* Time */}
                <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400], flexShrink: 0 }}>
                  {formatDistanceToNow(node.lastStateChange, { addSuffix: true })}
                </Text>
              </Box>
            );
          })}
        </Box>
      </Box>
    );
  },
});
