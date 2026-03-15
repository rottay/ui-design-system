/**
 * GroupHierarchyTree - All Presets
 */

import type { GroupHierarchyTreePreset, GroupHierarchyTreeProps } from '../core';
import type { ComponentType } from 'react';
import { TreeGroupHierarchyTree } from './tree';
import { OrgChartGroupHierarchyTree } from './org-chart';
import { FlatGroupHierarchyTree } from './flat';

export { TreeGroupHierarchyTree } from './tree';
export { OrgChartGroupHierarchyTree } from './org-chart';
export { FlatGroupHierarchyTree } from './flat';

export const GROUP_HIERARCHY_TREE_PRESETS: Record<GroupHierarchyTreePreset, ComponentType<GroupHierarchyTreeProps>> = {
  tree: TreeGroupHierarchyTree,
  'org-chart': OrgChartGroupHierarchyTree,
  flat: FlatGroupHierarchyTree,
};
