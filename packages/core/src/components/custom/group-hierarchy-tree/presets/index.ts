/**
 * GroupHierarchyTree - All Presets
 */

import type { GroupHierarchyTreePreset } from '../core';
import { TreeGroupHierarchyTree } from './tree';
import { OrgChartGroupHierarchyTree } from './org-chart';
import { FlatGroupHierarchyTree } from './flat';

export { TreeGroupHierarchyTree } from './tree';
export { OrgChartGroupHierarchyTree } from './org-chart';
export { FlatGroupHierarchyTree } from './flat';

export const GROUP_HIERARCHY_TREE_PRESETS: Record<GroupHierarchyTreePreset, React.ComponentType<any>> = {
  tree: TreeGroupHierarchyTree,
  'org-chart': OrgChartGroupHierarchyTree,
  flat: FlatGroupHierarchyTree,
};
