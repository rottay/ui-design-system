import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';
import type { DesignTokens } from '../../../../core/types/tokens';

export type GroupHierarchyTreePreset = 'tree' | 'org-chart' | 'flat';

export interface GroupNode {
  id: string;
  name: string;
  description?: string;
  parentId: string | null;
  memberCount: number;
  permissions: string[];
  children: GroupNode[];
  icon?: string;
  color?: string;
  metadata?: Record<string, unknown>;
}

export interface GroupHierarchyTreeProps extends EngineAwareProps {
  preset?: GroupHierarchyTreePreset;
  groups: GroupNode[];
  onSelectGroup?: (groupId: string) => void;
  onCreateGroup?: () => void;
  onEditGroup?: (groupId: string) => void;
  onDeleteGroup?: (groupId: string) => void;
  onMoveGroup?: (groupId: string, newParentId: string | null) => void;
  selectedGroupId?: string;
  expandedGroupIds?: string[];
  title?: string;
  subtitle?: string;
  loading?: boolean;
  className?: string;
  style?: CSSProperties;
}

export const GROUP_HIERARCHY_TREE_DEFAULTS: Partial<GroupHierarchyTreeProps> = {
  preset: 'tree',
  title: 'Group Hierarchy',
};

const depthScales = [
  'primaryScale',
  'infoScale',
  'successScale',
  'warningScale',
  'secondaryScale',
] as const;

export function getGroupDepthColor(tokens: DesignTokens, depth: number): string {
  const scaleKey = depthScales[depth % depthScales.length];
  return (tokens.colors as any)[scaleKey][500];
}

export function getGroupDepthBgColor(tokens: DesignTokens, depth: number): string {
  const scaleKey = depthScales[depth % depthScales.length];
  return (tokens.colors as any)[scaleKey][50];
}

export function getGroupDepthBorderColor(tokens: DesignTokens, depth: number): string {
  const scaleKey = depthScales[depth % depthScales.length];
  return (tokens.colors as any)[scaleKey][200];
}

export function flattenGroups(groups: GroupNode[], parentPath: string[] = []): Array<{ group: GroupNode; path: string[]; depth: number }> {
  const result: Array<{ group: GroupNode; path: string[]; depth: number }> = [];
  for (const group of groups) {
    const currentPath = [...parentPath, group.name];
    result.push({ group, path: currentPath, depth: parentPath.length });
    if (group.children.length > 0) {
      result.push(...flattenGroups(group.children, currentPath));
    }
  }
  return result;
}
