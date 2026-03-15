import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';
import type { DesignTokens } from '../../../../core/types/tokens';

export type WorkflowOverviewPreset = 'canvas' | 'list';

export type NodeType = 'source' | 'action' | 'destination';
export type NodeStatus = 'idle' | 'running' | 'success' | 'error' | 'warning';

export interface NodeAction {
  key: string;
  label: string;
  icon?: ReactNode;
}

export interface WorkflowNode {
  id: string;
  label: string;
  type: NodeType;
  status: NodeStatus;
  icon?: ReactNode;
  rowCount?: number;
  columnCount?: number;
  actions?: NodeAction[];
  position?: { x: number; y: number };
  description?: string;
}

export interface NodeConnection {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
}

export interface WorkflowTab {
  key: string;
  label: string;
  icon?: ReactNode;
  active?: boolean;
}

export interface WorkflowOverviewProps extends EngineAwareProps {
  preset?: WorkflowOverviewPreset;
  nodes: WorkflowNode[];
  connections: NodeConnection[];
  tabs?: WorkflowTab[];
  activeTab?: string;
  onTabChange?: (key: string) => void;
  onNodeClick?: (nodeId: string) => void;
  onNodeAction?: (nodeId: string, actionKey: string) => void;
  onAddNode?: () => void;
  title?: string;
  zoomLevel?: number;
  onZoomChange?: (level: number) => void;
  loading?: boolean;
  className?: string;
  style?: CSSProperties;
  // Interactive props
  onNodeMove?: (nodeId: string, position: { x: number; y: number }) => void;
  onConnectionCreate?: (sourceNodeId: string, targetNodeId: string) => void;
  onConnectionDelete?: (connectionId: string) => void;
  onNodeDelete?: (nodeId: string) => void;
  onNodeEdit?: (nodeId: string, label: string) => void;
  selectedNodeId?: string;
  onNodeSelect?: (nodeId: string | null) => void;
  pannable?: boolean;
  gridSnap?: number;
  onStepReorder?: (nodeId: string, newIndex: number) => void;
}

export const WORKFLOW_OVERVIEW_DEFAULTS: Partial<WorkflowOverviewProps> = {
  preset: 'canvas',
  zoomLevel: 100,
  title: 'Workflow',
};

export function getNodeStatusColors(tokens: DesignTokens) {
  return {
    idle: { color: tokens.colors.neutral[600], bgColor: tokens.colors.neutral[50], border: tokens.colors.neutral[200] },
    running: { color: tokens.colors.infoScale[700], bgColor: tokens.colors.infoScale[50], border: tokens.colors.infoScale[200] },
    success: { color: tokens.colors.successScale[700], bgColor: tokens.colors.successScale[50], border: tokens.colors.successScale[200] },
    error: { color: tokens.colors.errorScale[700], bgColor: tokens.colors.errorScale[50], border: tokens.colors.errorScale[200] },
    warning: { color: tokens.colors.warningScale[700], bgColor: tokens.colors.warningScale[50], border: tokens.colors.warningScale[200] },
  };
}

export function getNodeTypeColors(tokens: DesignTokens) {
  return {
    source: { color: tokens.colors.infoScale[700], bgColor: tokens.colors.infoScale[50], icon: tokens.colors.infoScale[500] },
    action: { color: tokens.colors.warningScale[700], bgColor: tokens.colors.warningScale[50], icon: tokens.colors.warningScale[500] },
    destination: { color: tokens.colors.successScale[700], bgColor: tokens.colors.successScale[50], icon: tokens.colors.successScale[500] },
  };
}

export function calculateConnectionPath(
  source: { x: number; y: number },
  target: { x: number; y: number },
  nodeWidth: number = 220,
  nodeHeight: number = 80,
): string {
  const startX = source.x + nodeWidth;
  const startY = source.y + nodeHeight / 2;
  const endX = target.x;
  const endY = target.y + nodeHeight / 2;
  const midX = (startX + endX) / 2;

  return `M ${startX} ${startY} C ${midX} ${startY}, ${midX} ${endY}, ${endX} ${endY}`;
}
