/**
 * @fileoverview Tabs Compound Components - Rottay Design System
 * @description Exports all compound components for the Tabs component.
 * Provides declarative tab content definition as an alternative to the items prop.
 *
 * @remarks
 * Compound components offer a more declarative API for defining tabs,
 * allowing developers to compose tab content directly as children.
 * This approach can be more intuitive for simpler use cases.
 *
 * @example
 * ```tsx
 * import { Tabs } from '@rottay/design-system';
 *
 * <Tabs defaultActiveKey="1">
 *   <Tabs.TabPane tab="Home" key="1">
 *     Home content goes here
 *   </Tabs.TabPane>
 *   <Tabs.TabPane tab="Profile" key="2">
 *     Profile content goes here
 *   </Tabs.TabPane>
 * </Tabs>
 * ```
 *
 * @see {@link TabPane} for individual tab pane documentation
 *
 * @module Tabs/Compound
 * @category Navigation
 * @package @rottay/design-system
 */

// ============================================================================
// Compound Component Exports
// ============================================================================

export { TabPane } from './TabPane';
export type { TabPaneProps } from './TabPane';
