/**
 * Collapse - Engine Router (Compound Component)
 *
 * This module exports the Collapse component with multi-engine support.
 * Collapse creates expandable/collapsible content panels, commonly used
 * for FAQs, settings, and grouped content.
 *
 * @module Collapse
 * @example
 * ```tsx
 * import { Collapse } from '@rottay/design-system';
 *
 * // Basic usage
 * <Collapse defaultActiveKey={['1']}>
 *   <Collapse.Panel header="Section 1" panelKey="1">
 *     Content for section 1
 *   </Collapse.Panel>
 *   <Collapse.Panel header="Section 2" panelKey="2">
 *     Content for section 2
 *   </Collapse.Panel>
 * </Collapse>
 *
 * // Accordion mode (only one panel open at a time)
 * <Collapse accordion>
 *   <Collapse.Panel header="FAQ 1" panelKey="1">Answer 1</Collapse.Panel>
 *   <Collapse.Panel header="FAQ 2" panelKey="2">Answer 2</Collapse.Panel>
 * </Collapse>
 *
 * // Controlled component
 * <Collapse activeKey={activeKey} onChange={setActiveKey}>
 *   <Collapse.Panel header="Panel" panelKey="1">Content</Collapse.Panel>
 * </Collapse>
 * ```
 */
import { createEngineComponent } from '../../../../system/engines/factory';
import type { CollapseProps, CollapsePanelProps } from './types';

export {
  type CollapseProps,
  type CollapsePanelProps,
  COLLAPSE_DEFAULTS,
} from './types';

const CollapseBase = createEngineComponent<CollapseProps>('Collapse', {
  titan: () => import('./engines/titan').then(m => ({ default: m.Collapse })),
  hermes: () => import('./engines/hermes').then(m => ({ default: m.Collapse })),
  apollo: () => import('./engines/apollo').then(m => ({ default: m.Collapse })),
});

const Panel = createEngineComponent<CollapsePanelProps>('Collapse.Panel', {
  titan: () => import('./engines/titan').then(m => ({ default: m.Panel })),
  hermes: () => import('./engines/hermes').then(m => ({ default: m.Panel })),
  apollo: () => import('./engines/apollo').then(m => ({ default: m.Panel })),
});

export const Collapse = Object.assign(CollapseBase, {
  Panel,
});

export default Collapse;
