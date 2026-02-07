/**
 * DependencyGraph - All Presets
 */

import type { DependencyGraphPreset } from '../core';
import { CanvasDependencyGraph } from './canvas';
import { ListDependencyGraph } from './list';

export { CanvasDependencyGraph } from './canvas';
export { ListDependencyGraph } from './list';

export const DEPENDENCY_GRAPH_PRESETS: Record<DependencyGraphPreset, React.ComponentType<any>> = {
  canvas: CanvasDependencyGraph,
  list: ListDependencyGraph,
};
