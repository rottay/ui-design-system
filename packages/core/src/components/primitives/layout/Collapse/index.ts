'use client';

/**
 * @fileoverview Collapse Component - Rottay Design System
 * @description An expandable/collapsible panel component for organizing content
 * into toggleable sections. Commonly used for FAQs, settings panels, sidebars,
 * and any UI requiring progressive disclosure of information.
 * Part of the Rottay Design System's layout primitives collection.
 *
 * @remarks
 * The Collapse component provides:
 * - Multiple expandable panels with headers
 * - Accordion mode (single panel open at a time)
 * - Controlled and uncontrolled state management
 * - Customizable expand icon position
 * - Ghost mode (transparent background)
 * - Bordered and borderless variants
 * - Size variants (small, middle, large)
 *
 * Key features:
 * - Compound component pattern (Collapse.Panel)
 * - Smooth expand/collapse animations
 * - Keyboard accessible
 * - Disable individual panels
 *
 * This component supports the Rottay multi-engine architecture:
 * - **Classic**: Wraps Ant Design Collapse with full feature parity
 * - **Modern**: Tailwind CSS implementation with custom state management
 * - **Rustic**: Pure CSS with inline styles and transitions
 *
 * @example Basic Usage
 * ```tsx
 * import { Collapse } from '@rottay/design-system';
 *
 * <Collapse defaultActiveKey={['1']}>
 *   <Collapse.Panel header="Section 1" panelKey="1">
 *     Content for section 1
 *   </Collapse.Panel>
 *   <Collapse.Panel header="Section 2" panelKey="2">
 *     Content for section 2
 *   </Collapse.Panel>
 * </Collapse>
 * ```
 *
 * @example Accordion Mode
 * ```tsx
 * import { Collapse } from '@rottay/design-system';
 *
 * // Only one panel can be open at a time
 * <Collapse accordion defaultActiveKey="faq1">
 *   <Collapse.Panel header="What is React?" panelKey="faq1">
 *     React is a JavaScript library for building user interfaces.
 *   </Collapse.Panel>
 *   <Collapse.Panel header="What is TypeScript?" panelKey="faq2">
 *     TypeScript is a typed superset of JavaScript.
 *   </Collapse.Panel>
 *   <Collapse.Panel header="What is Vite?" panelKey="faq3">
 *     Vite is a fast build tool for modern web projects.
 *   </Collapse.Panel>
 * </Collapse>
 * ```
 *
 * @example Controlled Component
 * ```tsx
 * import { useState } from 'react';
 * import { Collapse } from '@rottay/design-system';
 *
 * function ControlledCollapse() {
 *   const [activeKeys, setActiveKeys] = useState<string[]>(['panel1']);
 *
 *   return (
 *     <Collapse activeKey={activeKeys} onChange={setActiveKeys}>
 *       <Collapse.Panel header="Panel 1" panelKey="panel1">
 *         Content 1
 *       </Collapse.Panel>
 *       <Collapse.Panel header="Panel 2" panelKey="panel2">
 *         Content 2
 *       </Collapse.Panel>
 *     </Collapse>
 *   );
 * }
 * ```
 *
 * @example Ghost Mode (No Background)
 * ```tsx
 * import { Collapse } from '@rottay/design-system';
 *
 * <Collapse ghost bordered={false}>
 *   <Collapse.Panel header="Minimal Panel" panelKey="1">
 *     Clean, minimal appearance
 *   </Collapse.Panel>
 * </Collapse>
 * ```
 *
 * @example With Extra Content and Disabled Panel
 * ```tsx
 * import { Collapse, Button } from '@rottay/design-system';
 *
 * <Collapse>
 *   <Collapse.Panel
 *     header="Settings"
 *     panelKey="settings"
 *     extra={<Button size="small">Edit</Button>}
 *   >
 *     Settings content
 *   </Collapse.Panel>
 *   <Collapse.Panel
 *     header="Disabled Section"
 *     panelKey="disabled"
 *     disabled
 *   >
 *     This content is not accessible
 *   </Collapse.Panel>
 * </Collapse>
 * ```
 *
 * @example Engine Override
 * ```tsx
 * import { Collapse } from '@rottay/design-system';
 *
 * // Force Modern (Tailwind) implementation
 * <Collapse engine="modern" accordion>
 *   <Collapse.Panel engine="modern" header="Panel 1" panelKey="1">
 *     Content
 *   </Collapse.Panel>
 * </Collapse>
 * ```
 *
 * @see {@link Splitter} - For resizable panel layouts
 * @see {@link Tabs} - For tabbed content navigation
 * @see {@link Card} - For card-based content sections
 *
 * @module Collapse
 * @category Layout
 * @package @rottay/design-system
 */
import { createEngineComponent } from '../../../../engines/factory';
import type { CollapseProps, CollapsePanelProps } from './types';

export {
  type CollapseProps,
  type CollapsePanelProps,
  COLLAPSE_DEFAULTS,
} from './types';

const CollapseBase = createEngineComponent<CollapseProps>('Collapse', {
  classic: () => import('./engines/classic').then(m => ({ default: m.Collapse })),
  modern: () => import('./engines/modern').then(m => ({ default: m.Collapse })),
  rustic: () => import('./engines/rustic').then(m => ({ default: m.Collapse })),
});

const Panel = createEngineComponent<CollapsePanelProps>('Collapse.Panel', {
  classic: () => import('./engines/classic').then(m => ({ default: m.Panel })),
  modern: () => import('./engines/modern').then(m => ({ default: m.Panel })),
  rustic: () => import('./engines/rustic').then(m => ({ default: m.Panel })),
});

export const Collapse = Object.assign(CollapseBase, {
  Panel,
});

export default Collapse;
