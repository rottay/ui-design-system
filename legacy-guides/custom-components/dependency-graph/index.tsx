/**
 * DependencyGraph - Main Export
 * Automatically selects preset based on props
 */

import type { DependencyGraphProps } from './core';
import { DEPENDENCY_GRAPH_DEFAULTS } from './core';
import { DEPENDENCY_GRAPH_PRESETS } from './presets';

export { type DependencyGraphProps, type DependencyGraphPreset, type DependencyNode, type DependencyLink, type NodeStatus, type LinkType, type LinkLabel, type NodeAction, type FilterConfig, type DepGraphBreadcrumbItem, DEPENDENCY_GRAPH_DEFAULTS } from './core';
export * from './presets';

/**
 * DependencyGraph component
 * Renders the appropriate preset based on the preset prop
 */
export function DependencyGraph(props: DependencyGraphProps): React.ReactElement {
  const preset = props.preset ?? DEPENDENCY_GRAPH_DEFAULTS.preset ?? 'canvas';
  const PresetComponent = DEPENDENCY_GRAPH_PRESETS[preset];

  return <PresetComponent {...props} />;
}

DependencyGraph.displayName = 'DependencyGraph';

export { CanvasDependencyGraph, ListDependencyGraph } from './presets';
