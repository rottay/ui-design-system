/**
 * GroupHierarchyTree - Main Export
 * Automatically selects preset based on props
 */

import type { GroupHierarchyTreeProps } from './core';
import { GROUP_HIERARCHY_TREE_DEFAULTS } from './core';
import { GROUP_HIERARCHY_TREE_PRESETS } from './presets';

export { type GroupHierarchyTreeProps, type GroupHierarchyTreePreset, type GroupNode, GROUP_HIERARCHY_TREE_DEFAULTS } from './core';
export * from './presets';

/**
 * GroupHierarchyTree component
 * Renders the appropriate preset based on the preset prop
 */
export function GroupHierarchyTree(props: GroupHierarchyTreeProps): React.ReactElement {
  const preset = props.preset ?? GROUP_HIERARCHY_TREE_DEFAULTS.preset ?? 'tree';
  const PresetComponent = GROUP_HIERARCHY_TREE_PRESETS[preset];

  return <PresetComponent {...props} />;
}

GroupHierarchyTree.displayName = 'GroupHierarchyTree';

export { TreeGroupHierarchyTree, OrgChartGroupHierarchyTree, FlatGroupHierarchyTree } from './presets';
