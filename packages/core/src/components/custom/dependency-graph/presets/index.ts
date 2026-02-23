/**
 * DependencyGraph - All Presets
 */

import type { DependencyGraphPreset, DependencyGraphProps } from '../core';
import type { ComponentType } from 'react';
import { CanvasDependencyGraph } from './canvas';
import { ListDependencyGraph } from './list';

export { CanvasDependencyGraph } from './canvas';
export { ListDependencyGraph } from './list';

export const DEPENDENCY_GRAPH_PRESETS: Record<DependencyGraphPreset, ComponentType<DependencyGraphProps>> = {
  canvas: CanvasDependencyGraph,
  list: ListDependencyGraph,
};
