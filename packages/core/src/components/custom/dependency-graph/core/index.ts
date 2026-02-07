import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';
import type { DesignTokens } from '../../../../core/types/tokens';

export type DependencyGraphPreset = 'canvas' | 'list';

export type NodeStatus = 'to-do' | 'in-progress' | 'done' | 'blocked';

export type LinkType = 'blocks' | 'is-blocked-by' | 'relates-to' | 'duplicates' | 'clones';

export interface LinkLabel {
  offsetValue: number;
  offsetUnit: 'd' | 'w' | 'm';
  approximate?: boolean;
}

export interface NodeAction {
  key: string;
  label: string;
  icon?: ReactNode;
  destructive?: boolean;
}

export interface DependencyNode {
  id: string;
  taskId: string;
  title: string;
  status: NodeStatus;
  startDate?: string;
  endDate?: string;
  project?: string;
  assignee?: string;
  position?: { x: number; y: number };
  actions?: NodeAction[];
  tags?: string[];
}

export interface DependencyLink {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
  type: LinkType;
  label?: LinkLabel;
  critical?: boolean;
}

export interface FilterConfig {
  key: string;
  label: string;
  options?: string[];
  value?: string;
}

export interface DepGraphBreadcrumbItem {
  key: string;
  label: string;
  onClick?: () => void;
}

export interface DependencyGraphProps extends EngineAwareProps {
  preset?: DependencyGraphPreset;
  nodes: DependencyNode[];
  links: DependencyLink[];
  breadcrumbs?: DepGraphBreadcrumbItem[];
  filters?: FilterConfig[];
  onFilterChange?: (filterKey: string, value: string) => void;
  selectedNodeId?: string;
  onNodeSelect?: (nodeId: string | null) => void;
  onNodeClick?: (nodeId: string) => void;
  onNodeAction?: (nodeId: string, actionKey: string) => void;
  onLinkClick?: (linkId: string) => void;
  onAddDependency?: () => void;
  zoomLevel?: number;
  onZoomChange?: (level: number) => void;
  onZoomFit?: () => void;
  onZoomReset?: () => void;
  hasUnsavedChanges?: boolean;
  onSave?: () => void;
  title?: string;
  loading?: boolean;
  className?: string;
  style?: CSSProperties;
  // Interactive props
  onNodeMove?: (nodeId: string, position: { x: number; y: number }) => void;
  onLinkCreate?: (sourceNodeId: string, targetNodeId: string) => void;
  onLinkDelete?: (linkId: string) => void;
  onNodeDelete?: (nodeId: string) => void;
  pannable?: boolean;
  gridSnap?: number;
}

export const DEPENDENCY_GRAPH_DEFAULTS: Partial<DependencyGraphProps> = {
  preset: 'canvas',
  zoomLevel: 100,
  title: 'Dependencies',
  hasUnsavedChanges: false,
};

export function getNodeStatusColors(tokens: DesignTokens) {
  return {
    'to-do': {
      dot: tokens.colors.neutral[400],
      color: tokens.colors.neutral[700],
      bgColor: tokens.colors.neutral[100],
      border: tokens.colors.neutral[200],
    },
    'in-progress': {
      dot: tokens.colors.infoScale[500],
      color: tokens.colors.infoScale[700],
      bgColor: tokens.colors.infoScale[50],
      border: tokens.colors.infoScale[200],
    },
    'done': {
      dot: tokens.colors.successScale[500],
      color: tokens.colors.successScale[700],
      bgColor: tokens.colors.successScale[50],
      border: tokens.colors.successScale[200],
    },
    'blocked': {
      dot: tokens.colors.errorScale[500],
      color: tokens.colors.errorScale[700],
      bgColor: tokens.colors.errorScale[50],
      border: tokens.colors.errorScale[200],
    },
  };
}

export function getNodeStatusLabel(status: NodeStatus): string {
  const labels: Record<NodeStatus, string> = {
    'to-do': 'TO DO',
    'in-progress': 'IN PROGRESS',
    'done': 'DONE',
    'blocked': 'BLOCKED',
  };
  return labels[status];
}

export function getLinkColors(tokens: DesignTokens) {
  return {
    normal: {
      stroke: tokens.colors.neutral[300],
      labelColor: tokens.colors.neutral[600],
      labelBg: tokens.colors.common.white,
    },
    critical: {
      stroke: tokens.colors.errorScale[400],
      labelColor: tokens.colors.errorScale[700],
      labelBg: tokens.colors.errorScale[50],
    },
  };
}

export function getLinkTypeLabel(type: LinkType): string {
  const labels: Record<LinkType, string> = {
    'blocks': 'blocks',
    'is-blocked-by': 'is blocked by',
    'relates-to': 'relates to',
    'duplicates': 'duplicates',
    'clones': 'clones',
  };
  return labels[type];
}

export function formatLinkLabel(type: LinkType, label?: LinkLabel): string {
  const typeLabel = getLinkTypeLabel(type);
  if (!label) return typeLabel;

  const unitLabels: Record<string, string> = { d: 'd', w: 'w', m: 'm' };
  const prefix = label.approximate ? '~' : '+';
  return `${typeLabel} (${prefix}${label.offsetValue}${unitLabels[label.offsetUnit]})`;
}

export function calculateConnectionPath(
  source: { x: number; y: number },
  target: { x: number; y: number },
  nodeWidth: number = 280,
  nodeHeight: number = 100,
): string {
  const startX = source.x + nodeWidth;
  const startY = source.y + nodeHeight / 2;
  const endX = target.x;
  const endY = target.y + nodeHeight / 2;
  const midX = (startX + endX) / 2;

  return `M ${startX} ${startY} C ${midX} ${startY}, ${midX} ${endY}, ${endX} ${endY}`;
}

export function calculateArrowHead(
  target: { x: number; y: number },
  nodeHeight: number = 100,
  arrowSize: number = 8,
): string {
  const tipX = target.x;
  const tipY = target.y + nodeHeight / 2;
  const x1 = tipX - arrowSize;
  const y1 = tipY - arrowSize / 2;
  const x2 = tipX - arrowSize;
  const y2 = tipY + arrowSize / 2;

  return `${tipX},${tipY} ${x1},${y1} ${x2},${y2}`;
}

export function calculateLinkLabelPosition(
  source: { x: number; y: number },
  target: { x: number; y: number },
  nodeWidth: number = 280,
  nodeHeight: number = 100,
): { x: number; y: number } {
  const startX = source.x + nodeWidth;
  const startY = source.y + nodeHeight / 2;
  const endX = target.x;
  const endY = target.y + nodeHeight / 2;

  return {
    x: (startX + endX) / 2,
    y: (startY + endY) / 2,
  };
}

export function calculateCanvasBounds(
  nodes: DependencyNode[],
  nodeWidth: number = 280,
  nodeHeight: number = 100,
  padding: number = 80,
): { width: number; height: number } {
  if (nodes.length === 0) {
    return { width: 800, height: 400 };
  }

  const maxX = Math.max(...nodes.map(n => (n.position?.x ?? 0) + nodeWidth + padding), 800);
  const maxY = Math.max(...nodes.map(n => (n.position?.y ?? 0) + nodeHeight + padding), 400);

  return { width: maxX, height: maxY };
}
