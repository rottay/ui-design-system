'use client';

/**
 * @fileoverview Tabs -- tabbed interface for organizing content into switchable
 * sections, with line/card/pills styles and compound TabPane API.
 *
 * @example
 * ```tsx
 * import { Tabs } from '@rottay/design-system';
 *
 * // Items array API
 * <Tabs
 *   defaultActiveKey="1"
 *   type="line"
 *   items={[
 *     { key: '1', label: 'Profile', children: <ProfileContent /> },
 *     { key: '2', label: 'Settings', children: <SettingsContent /> },
 *   ]}
 * />
 *
 * // Compound component API
 * <Tabs defaultActiveKey="1">
 *   <Tabs.TabPane tab="Tab 1" key="1">Content 1</Tabs.TabPane>
 *   <Tabs.TabPane tab="Tab 2" key="2">Content 2</Tabs.TabPane>
 * </Tabs>
 * ```
 *
 * @module Tabs
 * @category Navigation
 */

import { createEngineComponent } from '../../../../runtime/engines/factory';
import type { TabsProps } from './Tabs.types';
import { TabPane } from './compound';

export {
  type TabsProps,
  type TabItem,
  type TabsType,
  type TabsSize,
  TABS_DEFAULTS,
} from './Tabs.types';

export { TabPane };
export type { TabPaneProps } from './compound';

// Assemble compound component: Tabs + Tabs.TabPane
export const Tabs = Object.assign(
  createEngineComponent<TabsProps>('Tabs', {
    /** Ant Design implementation - full-featured with animations */
    classic: () => import('./engines/classic'),
    /** DaisyUI/Tailwind implementation - utility-first styling */
    modern: () => import('./engines/modern'),
    /** Vanilla HTML/CSS implementation - zero dependencies */
    rustic: () => import('./engines/rustic'),
  }),
  {
    /** Declarative tab content panel; alternative to the items array approach. */
    TabPane,
  }
);
