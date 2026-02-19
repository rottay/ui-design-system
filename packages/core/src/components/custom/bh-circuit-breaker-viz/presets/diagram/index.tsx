'use client';

/**
 * BhCircuitBreakerViz - Diagram Preset
 * Visual node layout with colored circles per circuit state and connection lines.
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
  createPersonalityAccentBar,
} from '../../../helpers';
import type { BhCircuitBreakerVizProps, CircuitNode } from '../../core';
import type { DesignTokens } from '../../../../../types';
import { Zap, Server, Globe, Activity, AlertTriangle, CheckCircle, CircleDot } from 'lucide-react';

function getStateColor(state: CircuitNode['state'], t: DesignTokens) {
  switch (state) {
    case 'closed': return { fill: t.colors.successScale[500], bg: t.colors.successScale[100], color: t.colors.successScale[700], label: 'Closed' };
    case 'open': return { fill: t.colors.errorScale[500], bg: t.colors.errorScale[100], color: t.colors.errorScale[700], label: 'Open' };
    case 'half-open': return { fill: t.colors.warningScale[500], bg: t.colors.warningScale[100], color: t.colors.warningScale[700], label: 'Half-Open' };
  }
}

function getTypeIcon(type: CircuitNode['type'], size: number) {
  const iconProps = { size, strokeWidth: 1.5 };
  switch (type) {
    case 'provider': return <Server {...iconProps} />;
    case 'model': return <Zap {...iconProps} />;
    case 'endpoint': return <Globe {...iconProps} />;
  }
}

export const DiagramBhCircuitBreakerViz = createPreset<BhCircuitBreakerVizProps>({
  name: 'BhCircuitBreakerViz.Diagram',
  render: ({ primitives, props, tokens }: PresetContext<BhCircuitBreakerVizProps>) => {
    const { Box, Text } = primitives;
    const t = tokens;

    const MOCK_NODES: CircuitNode[] = [
      { id: 'cb-1', name: 'OpenAI', type: 'provider', state: 'closed', successCount: 12450, failureCount: 23, lastStateChange: new Date(Date.now() - 86400000) },
      { id: 'cb-2', name: 'GPT-4o', type: 'model', state: 'closed', successCount: 8920, failureCount: 12, lastStateChange: new Date(Date.now() - 172800000) },
      { id: 'cb-3', name: 'Anthropic', type: 'provider', state: 'half-open', successCount: 5670, failureCount: 89, lastStateChange: new Date(Date.now() - 3600000) },
      { id: 'cb-4', name: 'Claude 3.5', type: 'model', state: 'half-open', successCount: 3210, failureCount: 67, lastStateChange: new Date(Date.now() - 7200000) },
      { id: 'cb-5', name: 'Scoring API', type: 'endpoint', state: 'open', successCount: 1100, failureCount: 340, lastStateChange: new Date(Date.now() - 1800000) },
      { id: 'cb-6', name: 'Gemini Pro', type: 'model', state: 'closed', successCount: 4500, failureCount: 8, lastStateChange: new Date(Date.now() - 259200000) },
    ];

    const MOCK_CONNECTIONS = [
      { from: 'cb-1', to: 'cb-2', requestsPerMin: 120 },
      { from: 'cb-3', to: 'cb-4', requestsPerMin: 45 },
      { from: 'cb-2', to: 'cb-5', requestsPerMin: 80 },
      { from: 'cb-4', to: 'cb-5', requestsPerMin: 30 },
    ];

    const {
      nodes: rawNodes = MOCK_NODES,
      connections: rawConnections = MOCK_CONNECTIONS,
      onNodeClick,
      selectedNodeId: controlledSelected,
      loading = false,
      className,
      style,
    } = props;

    const nodes = Array.isArray(rawNodes) ? rawNodes : MOCK_NODES;
    const connections = Array.isArray(rawConnections) ? rawConnections : MOCK_CONNECTIONS;

    const [localSelected, setLocalSelected] = useState<string | null>(null);
    const selectedNodeId = controlledSelected ?? localSelected;

    const handleNodeClick = useCallback((id: string) => {
      onNodeClick?.(id);
      if (controlledSelected === undefined) setLocalSelected(id);
    }, [onNodeClick, controlledSelected]);

    const isGlass = t.surface.useGlass && !!t.glass;
    const cardBase = useMemo(() => createCardStyle(t, { elevation: 'sm', glass: isGlass }), [t, isGlass]);
    const hoverStyles = useMemo(() => createCardHoverStyles(t), [t]);
    const ptypo = useMemo(() => getPersonalityTypography(t), [t]);
    const badgeRadius = useMemo(() => getPersonalityBadgeRadius(t), [t]);
    const entrance = useMemo(() => createEntranceAnimation(t), [t]);
    const animStyle = (index: number) => ({
      ...entrance.animate,
      transition: entrance.transition,
      transitionDelay: `${createStaggerDelay(t, index)}ms`,
    });
    const sectionLabel = useMemo(() => createPersonalitySectionHeaderStyle(t), [t]);
    const emptyState = useMemo(() => createEmptyStateStyle(t), [t]);
    const accentBar = useMemo(() => createPersonalityAccentBar(t), [t]);


    const selectedNode = useMemo(() => nodes.find(n => n.id === selectedNodeId), [nodes, selectedNodeId]);

    // Arrange nodes in a grid layout for the SVG diagram
    const nodePositions = useMemo(() => {
      const cols = Math.ceil(Math.sqrt(nodes.length));
      const spacing = 140;
      const paddingX = 80;
      const paddingY = 60;
      return nodes.map((node, i) => ({
        ...node,
        x: paddingX + (i % cols) * spacing,
        y: paddingY + Math.floor(i / cols) * spacing,
      }));
    }, [nodes]);

    const svgWidth = useMemo(() => {
      const cols = Math.ceil(Math.sqrt(nodes.length));
      return Math.max(400, cols * 140 + 160);
    }, [nodes]);

    const svgHeight = useMemo(() => {
      const cols = Math.ceil(Math.sqrt(nodes.length));
      const rows = Math.ceil(nodes.length / cols);
      return Math.max(300, rows * 140 + 120);
    }, [nodes]);

    if (loading) {
      return (
        <Box className={className} style={{ ...animStyle(0), display: 'flex', alignItems: 'center', justifyContent: 'center', padding: t.spacing[10], ...style }}>
          <Activity size={24} color={t.colors.neutral[300]} style={{ marginRight: t.spacing[3] }} />
          <Text style={{ color: t.colors.neutral[400], fontSize: t.typography.fontSize.sm }}>Loading circuit diagram...</Text>
        </Box>
      );
    }

    if (nodes.length === 0) {
      return (
        <Box className={className} style={{ ...emptyState, ...style }}>
          <Zap size={48} strokeWidth={1} style={{ color: t.colors.neutral[300], marginBottom: t.spacing[3] }} />
          <Text style={{ fontSize: t.typography.fontSize.lg, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[500] }}>
            No circuit nodes configured
          </Text>
        </Box>
      );
    }

    return (
      <Box className={className} style={{ display: 'flex', width: '100%', gap: t.spacing[4], ...style }}>
        {accentBar && <Box style={accentBar} />}
        {/* Diagram area */}
        <Box style={{ ...cardBase, flex: 1, padding: t.spacing[4], overflow: 'auto' as const }}>
          <Text style={{ ...sectionLabel }}>Circuit Breaker Topology</Text>

          {/* Legend */}
          <Box style={{ display: 'flex', gap: t.spacing[4], marginBottom: t.spacing[4] }}>
            {(['closed', 'open', 'half-open'] as const).map(state => {
              const sc = getStateColor(state, t);
              return (
                <Box key={state} style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1] }}>
                  <Box style={{ width: 10, height: 10, borderRadius: t.borderRadius.full, backgroundColor: sc.fill }} />
                  <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[600] }}>{sc.label}</Text>
                </Box>
              );
            })}
          </Box>

          {/* SVG Diagram */}
          <svg width="100%" height={svgHeight} viewBox={`0 0 ${svgWidth} ${svgHeight}`} style={{ display: 'block' }}>
            {/* Connection lines */}
            {connections.map((conn, i) => {
              const from = nodePositions.find(n => n.id === conn.from);
              const to = nodePositions.find(n => n.id === conn.to);
              if (!from || !to) return null;
              return (
                <g key={`conn-${i}`}>
                  <line
                    x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                    stroke={t.colors.neutral[200]}
                    strokeWidth={Math.max(1, Math.min(4, conn.requestsPerMin / 50))}
                    strokeDasharray={conn.requestsPerMin < 10 ? '4,4' : 'none'}
                  />
                  <text
                    x={(from.x + to.x) / 2} y={(from.y + to.y) / 2 - 6}
                    fill={t.colors.neutral[400]}
                    fontSize={10}
                    textAnchor="middle"
                  >
                    {conn.requestsPerMin} req/min
                  </text>
                </g>
              );
            })}

            {/* Node circles */}
            {nodePositions.map(node => {
              const sc = getStateColor(node.state, t);
              const isSelected = selectedNodeId === node.id;
              const radius = node.type === 'provider' ? 30 : node.type === 'model' ? 24 : 20;

              return (
                <g
                  key={node.id}
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleNodeClick(node.id)}
                >
                  {/* Outer ring for selected */}
                  {isSelected && (
                    <circle cx={node.x} cy={node.y} r={radius + 6}
                      fill="none" stroke={t.colors.primaryScale[400]} strokeWidth={2}
                      strokeDasharray="4,2"
                    />
                  )}
                  {/* Node circle */}
                  <circle cx={node.x} cy={node.y} r={radius}
                    fill={sc.bg} stroke={sc.fill} strokeWidth={2}
                  />
                  {/* Pulsing ring for open state */}
                  {node.state === 'open' && (
                    <circle cx={node.x} cy={node.y} r={radius + 3}
                      fill="none" stroke={sc.fill} strokeWidth={1} opacity={0.5}
                    >
                      <animate attributeName="r" from={String(radius + 2)} to={String(radius + 10)} dur="2s" repeatCount="indefinite" />
                      <animate attributeName="opacity" from="0.5" to="0" dur="2s" repeatCount="indefinite" />
                    </circle>
                  )}
                  {/* Node label */}
                  <text x={node.x} y={node.y + radius + 16}
                    fill={t.colors.neutral[700]}
                    fontSize={11}
                    fontWeight={600}
                    textAnchor="middle"
                  >
                    {node.name}
                  </text>
                  {/* State label */}
                  <text x={node.x} y={node.y + 4}
                    fill={sc.color}
                    fontSize={9}
                    fontWeight={600}
                    textAnchor="middle"
                  >
                    {node.state.toUpperCase()}
                  </text>
                </g>
              );
            })}
          </svg>
        </Box>

        {/* Detail panel */}
        {selectedNode && (
          <Box style={{ ...cardBase, width: 280, padding: t.spacing[4], flexShrink: 0 }}>
            <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], marginBottom: t.spacing[4] }}>
              <Box style={createIconContainerStyle(t, { size: 36, color: getStateColor(selectedNode.state, t).bg })}>
                {getTypeIcon(selectedNode.type, 18)}
              </Box>
              <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1] }}>
                <Text style={{ fontSize: t.typography.fontSize.md, fontWeight: ptypo.headingWeight, color: t.colors.neutral[900], display: 'block' }}>
                  {selectedNode.name}
                </Text>
                <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500], textTransform: 'capitalize' as const }}>
                  {selectedNode.type}
                </Text>
              </Box>
            </Box>

            {/* State badge */}
            <Box style={{ marginBottom: t.spacing[3] }}>
              <Box style={{
                ...createBadgeStyle(t, selectedNode.state === 'closed' ? 'success' : selectedNode.state === 'open' ? 'error' : 'warning'),
                borderRadius: badgeRadius,
              }}>
                <Text>{getStateColor(selectedNode.state, t).label}</Text>
              </Box>
            </Box>

            {/* Stats */}
            <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[3] }}>
              <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1] }}>
                <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500], display: 'block', marginBottom: t.spacing[1] }}>
                  Successes
                </Text>
                <Text style={{ fontSize: t.typography.fontSize.lg, fontWeight: t.typography.fontWeight.bold, color: t.colors.neutral[900] }}>
                  {(selectedNode.successCount ?? 0).toLocaleString()}
                </Text>
              </Box>
              <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1] }}>
                <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500], display: 'block', marginBottom: t.spacing[1] }}>
                  Failures
                </Text>
                <Text style={{ fontSize: t.typography.fontSize.lg, fontWeight: t.typography.fontWeight.bold, color: t.colors.neutral[900] }}>
                  {(selectedNode.failureCount ?? 0).toLocaleString()}
                </Text>
              </Box>
              <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1] }}>
                <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500], display: 'block', marginBottom: t.spacing[1] }}>
                  Last State Change
                </Text>
                <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[700] }}>
                  {formatDistanceToNow(selectedNode.lastStateChange, { addSuffix: true })}
                </Text>
              </Box>
            </Box>
          </Box>
        )}
      </Box>
    );
  },
});
