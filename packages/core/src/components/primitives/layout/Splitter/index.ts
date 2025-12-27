/**
 * Splitter - Engine Router (Compound Component)
 *
 * This module exports the Splitter component with multi-engine support.
 * Splitter creates resizable panel layouts with a draggable gutter
 * between panels.
 *
 * @module Splitter
 * @example
 * ```tsx
 * import { Splitter } from '@rottay/design-system';
 *
 * // Horizontal split
 * <Splitter layout="horizontal">
 *   <Splitter.Panel defaultSize={30}>Sidebar</Splitter.Panel>
 *   <Splitter.Panel>Main Content</Splitter.Panel>
 * </Splitter>
 *
 * // Vertical split with constraints
 * <Splitter layout="vertical">
 *   <Splitter.Panel min={100} max={300}>Top</Splitter.Panel>
 *   <Splitter.Panel collapsible>Bottom</Splitter.Panel>
 * </Splitter>
 *
 * // With resize callbacks
 * <Splitter onResize={handleResize} onResizeEnd={handleResizeEnd}>
 *   <Splitter.Panel>Panel 1</Splitter.Panel>
 *   <Splitter.Panel>Panel 2</Splitter.Panel>
 * </Splitter>
 * ```
 */
import { createEngineComponent } from '../../../../system/engines/factory';
import type { SplitterProps, SplitterPanelProps } from './types';

export {
  type SplitterProps,
  type SplitterPanelProps,
  SPLITTER_DEFAULTS,
} from './types';

const SplitterBase = createEngineComponent<SplitterProps>('Splitter', {
  titan: () => import('./engines/titan').then(m => ({ default: m.Splitter })),
  hermes: () => import('./engines/hermes').then(m => ({ default: m.Splitter })),
  apollo: () => import('./engines/apollo').then(m => ({ default: m.Splitter })),
});

const Panel = createEngineComponent<SplitterPanelProps>('Splitter.Panel', {
  titan: () => import('./engines/titan').then(m => ({ default: m.Panel })),
  hermes: () => import('./engines/hermes').then(m => ({ default: m.Panel })),
  apollo: () => import('./engines/apollo').then(m => ({ default: m.Panel })),
});

export const Splitter = Object.assign(SplitterBase, {
  Panel,
});

export default Splitter;
