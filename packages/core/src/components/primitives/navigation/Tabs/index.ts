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
 * // Basic usage with items
 * <Tabs
 *   items={[
 *     { key: '1', label: 'Tab 1', children: <Content1 /> },
 *     { key: '2', label: 'Tab 2', children: <Content2 /> },
 *   ]}
 *   defaultActiveKey="1"
 * />
 *
 * // Alternative: compound component syntax
 * <Tabs defaultActiveKey="1">
 *   <Tabs.TabPane tab="Tab 1" key="1">Content 1</Tabs.TabPane>
 *   <Tabs.TabPane tab="Tab 2" key="2">Content 2</Tabs.TabPane>
 * </Tabs>
 * ```
 */
import { createEngineComponent } from '../../../../system/engines/factory';
import type { TabsProps } from './types';
import { TabPane } from './compound';

export { type TabsProps, type TabItem, type TabsType, type TabsSize, TABS_DEFAULTS } from './types';

export { BaseTabs } from './base';

export { TabPane };
export type { TabPaneProps } from './compound';

export const Tabs = Object.assign(
  createEngineComponent<TabsProps>('Tabs', {
    titan: () => import('./engines/titan'),
    hermes: () => import('./engines/hermes'),
    apollo: () => import('./engines/apollo'),
  }),
  {
    TabPane,
  }
);
