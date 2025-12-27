/**
 * Tabs - Engine Router
 *
 * This module exports the Tabs component with multi-engine support.
 * Tabs allow switching between different views or content sections.
 *
 * @module Tabs
 * @example
 * ```tsx
 * import { Tabs } from '@rottay/design-system';
 *
 * // Basic usage
 * <Tabs
 *   items={[
 *     { key: '1', label: 'Tab 1', children: <Content1 /> },
 *     { key: '2', label: 'Tab 2', children: <Content2 /> },
 *   ]}
 *   defaultActiveKey="1"
 * />
 *
 * // Card style
 * <Tabs type="card" items={items} />
 *
 * // Controlled
 * <Tabs activeKey={activeKey} onChange={setActiveKey} items={items} />
 * ```
 */
import { createEngineComponent } from '../../../../system/engines/factory';
import type { TabsProps } from './types';

export { type TabsProps, type TabItem, type TabsType, type TabsSize, TABS_DEFAULTS } from './types';


// Export base component
export { BaseTabs } from './base';

export const Tabs = createEngineComponent<TabsProps>('Tabs', {
  titan: () => import('./engines/titan'),
  hermes: () => import('./engines/hermes'),
  apollo: () => import('./engines/apollo'),
});
