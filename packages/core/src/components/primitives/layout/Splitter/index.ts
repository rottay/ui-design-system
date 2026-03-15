'use client';

/**
 * @fileoverview Splitter Component - Rottay Design System
 * @description A resizable panel layout component with draggable gutters between panels.
 * Creates split-view interfaces for code editors, file explorers, comparison views,
 * and other applications requiring adjustable pane sizes.
 * Part of the Rottay Design System's layout primitives collection.
 *
 * @remarks
 * The Splitter component provides:
 * - Horizontal and vertical split layouts
 * - Draggable gutters for resizing panels
 * - Minimum and maximum size constraints per panel
 * - Collapsible panels
 * - Resize callbacks for state synchronization
 * - Percentage-based sizing
 *
 * Key features:
 * - Compound component pattern (Splitter.Panel)
 * - Smooth drag-to-resize with mouse events
 * - Constraint validation (min/max sizes)
 * - Multiple panels support
 *
 * This component supports the Rottay multi-engine architecture:
 * - **Classic**: Wraps Ant Design Splitter with full feature parity
 * - **Modern**: Tailwind CSS implementation with custom drag handling
 * - **Rustic**: Pure CSS flexbox with inline styles and drag logic
 *
 * @example Basic Horizontal Split
 * ```tsx
 * import { Splitter } from '@rottay/design-system';
 *
 * <Splitter layout="horizontal">
 *   <Splitter.Panel defaultSize={30}>
 *     <nav>Sidebar navigation</nav>
 *   </Splitter.Panel>
 *   <Splitter.Panel>
 *     <main>Main content area</main>
 *   </Splitter.Panel>
 * </Splitter>
 * ```
 *
 * @example Vertical Split
 * ```tsx
 * import { Splitter } from '@rottay/design-system';
 *
 * <Splitter layout="vertical" style={{ height: '100vh' }}>
 *   <Splitter.Panel defaultSize={60}>
 *     <div>Code editor</div>
 *   </Splitter.Panel>
 *   <Splitter.Panel>
 *     <div>Console output</div>
 *   </Splitter.Panel>
 * </Splitter>
 * ```
 *
 * @example With Size Constraints
 * ```tsx
 * import { Splitter } from '@rottay/design-system';
 *
 * <Splitter layout="horizontal">
 *   <Splitter.Panel min={150} max={400} defaultSize={25}>
 *     Sidebar (min 150px, max 400px)
 *   </Splitter.Panel>
 *   <Splitter.Panel min={200}>
 *     Main content (min 200px)
 *   </Splitter.Panel>
 * </Splitter>
 * ```
 *
 * @example Three-Panel Layout
 * ```tsx
 * import { Splitter } from '@rottay/design-system';
 *
 * <Splitter layout="horizontal">
 *   <Splitter.Panel defaultSize={20}>Left panel</Splitter.Panel>
 *   <Splitter.Panel defaultSize={60}>Center panel</Splitter.Panel>
 *   <Splitter.Panel defaultSize={20}>Right panel</Splitter.Panel>
 * </Splitter>
 * ```
 *
 * @example With Resize Callbacks
 * ```tsx
 * import { Splitter } from '@rottay/design-system';
 *
 * function ResizablePanels() {
 *   const handleResize = (sizes: number[]) => {
 *     console.log('Current sizes:', sizes);
 *   };
 *
 *   const handleResizeEnd = (sizes: number[]) => {
 *     localStorage.setItem('panelSizes', JSON.stringify(sizes));
 *   };
 *
 *   return (
 *     <Splitter
 *       layout="horizontal"
 *       onResize={handleResize}
 *       onResizeEnd={handleResizeEnd}
 *     >
 *       <Splitter.Panel>Panel 1</Splitter.Panel>
 *       <Splitter.Panel>Panel 2</Splitter.Panel>
 *     </Splitter>
 *   );
 * }
 * ```
 *
 * @example Engine Override
 * ```tsx
 * import { Splitter } from '@rottay/design-system';
 *
 * // Force Modern (Tailwind) implementation
 * <Splitter engine="modern" layout="vertical">
 *   <Splitter.Panel engine="modern">Top</Splitter.Panel>
 *   <Splitter.Panel engine="modern">Bottom</Splitter.Panel>
 * </Splitter>
 * ```
 *
 * @see {@link Layout} - For page-level layout with header/footer/sider
 * @see {@link Flex} - For flexible box layouts
 * @see {@link Grid} - For grid-based layouts
 *
 * @module Splitter
 * @category Layout
 * @package @rottay/design-system
 */
import { createEngineComponent } from '../../../../engines/factory';
import type { SplitterProps, SplitterPanelProps } from './Splitter.types';

export {
  type SplitterProps,
  type SplitterPanelProps,
  SPLITTER_DEFAULTS,
} from './Splitter.types';

const SplitterBase = createEngineComponent<SplitterProps>('Splitter', {
  classic: () => import('./engines/classic').then(m => ({ default: m.Splitter })),
  modern: () => import('./engines/modern').then(m => ({ default: m.Splitter })),
  rustic: () => import('./engines/rustic').then(m => ({ default: m.Splitter })),
});

const Panel = createEngineComponent<SplitterPanelProps>('Splitter.Panel', {
  classic: () => import('./engines/classic').then(m => ({ default: m.Panel })),
  modern: () => import('./engines/modern').then(m => ({ default: m.Panel })),
  rustic: () => import('./engines/rustic').then(m => ({ default: m.Panel })),
});

export const Splitter = Object.assign(SplitterBase, {
  Panel,
});

export default Splitter;
