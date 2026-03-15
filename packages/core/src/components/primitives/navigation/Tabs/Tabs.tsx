'use client';

/**
 * @fileoverview Tabs Component - Rottay Design System
 * @description A tabbed interface component for organizing and switching between content sections.
 * Part of the Rottay Design System's navigation primitives collection.
 *
 * @remarks
 * The Tabs component is built on Rottay's multi-engine architecture, allowing
 * seamless rendering across Classic (Ant Design), Modern (DaisyUI), and Rustic
 * (Vanilla) engines. This ensures consistent behavior while adapting to your
 * project's styling framework.
 *
 * Multi-tenant theming is fully supported - tabs styling automatically adapts
 * to your tenant's brand colors, spacing, and typography tokens.
 *
 * @example Basic Usage with Items Array
 * ```tsx
 * import { Tabs } from '@rottay/design-system';
 *
 * function MyComponent() {
 *   return (
 *     <Tabs
 *       items={[
 *         { key: '1', label: 'Profile', children: <ProfileContent /> },
 *         { key: '2', label: 'Settings', children: <SettingsContent /> },
 *         { key: '3', label: 'Notifications', children: <NotificationsContent /> },
 *       ]}
 *       defaultActiveKey="1"
 *     />
 *   );
 * }
 * ```
 *
 * @example With Compound Components
 * ```tsx
 * import { Tabs } from '@rottay/design-system';
 *
 * <Tabs defaultActiveKey="1">
 *   <Tabs.TabPane tab="Tab 1" key="1">
 *     Content for tab 1
 *   </Tabs.TabPane>
 *   <Tabs.TabPane tab="Tab 2" key="2">
 *     Content for tab 2
 *   </Tabs.TabPane>
 *   <Tabs.TabPane tab="Tab 3" key="3" disabled>
 *     Disabled tab content
 *   </Tabs.TabPane>
 * </Tabs>
 * ```
 *
 * @example Different Tab Types
 * ```tsx
 * // Line style (default)
 * <Tabs type="line" items={items} />
 *
 * // Card style
 * <Tabs type="card" items={items} />
 *
 * // Pills style
 * <Tabs type="pills" items={items} />
 * ```
 *
 * @example With Icons and Controlled State
 * ```tsx
 * import { Tabs } from '@rottay/design-system';
 * import { UserIcon, SettingsIcon } from '@rottay/icons';
 *
 * function ControlledTabs() {
 *   const [activeKey, setActiveKey] = useState('profile');
 *
 *   return (
 *     <Tabs
 *       activeKey={activeKey}
 *       onChange={setActiveKey}
 *       items={[
 *         { key: 'profile', label: 'Profile', icon: <UserIcon /> },
 *         { key: 'settings', label: 'Settings', icon: <SettingsIcon /> },
 *       ]}
 *     />
 *   );
 * }
 * ```
 *
 * @example Multi-Tenant Theming
 * ```tsx
 * // Tabs automatically inherit tenant theme
 * <ThemeProvider tenant="acme-corp">
 *   <Tabs items={items}>
 *     {/* Uses ACME Corp's brand colors and styling *\/}
 *   </Tabs>
 * </ThemeProvider>
 * ```
 *
 * @example Engine Override
 * ```tsx
 * // Force a specific rendering engine
 * <Tabs engine="modern" items={items}>
 *   {/* Renders with DaisyUI/Tailwind styling *\/}
 * </Tabs>
 * ```
 *
 * @example Centered Tabs with Different Sizes
 * ```tsx
 * // Small centered tabs
 * <Tabs size="sm" centered items={items} />
 *
 * // Medium (default)
 * <Tabs size="md" items={items} />
 *
 * // Large tabs
 * <Tabs size="lg" items={items} />
 * ```
 *
 * @see {@link TabsProps} for complete prop documentation
 * @see {@link TabItem} for tab item configuration
 * @see {@link TabPane} for compound component usage
 *
 * @module Tabs
 * @category Navigation
 * @package @rottay/design-system
 */

import { createEngineComponent } from '../../../../core/engines/factory';
import type { TabsProps } from './Tabs.types';
import { TabPane } from './compound';

// ============================================================================
// Type Exports
// ============================================================================

export {
  type TabsProps,
  type TabItem,
  type TabsType,
  type TabsSize,
  TABS_DEFAULTS,
} from './Tabs.types';

// ============================================================================
// Base Component Export
// ============================================================================


// ============================================================================
// Compound Component Exports
// ============================================================================

export { TabPane };
export type { TabPaneProps } from './compound';

// ============================================================================
// Main Component
// ============================================================================

/**
 * Tabs component with multi-engine support and compound components.
 *
 * @description
 * A tabbed navigation interface for organizing content into sections. Ideal for:
 * - Organizing related content into sections
 * - Settings and configuration panels
 * - Dashboard navigation
 * - Form wizards and multi-step processes
 * - Profile pages with multiple views
 *
 * @remarks
 * - Supports three visual styles: line, card, and pills
 * - Three size variants: sm, md, lg
 * - Optional centered alignment
 * - Controlled and uncontrolled modes
 * - Full keyboard navigation support
 * - Fully accessible with ARIA attributes
 * - Adapts to tenant theming automatically
 *
 * @param props - {@link TabsProps}
 * @returns React component with TabPane compound component
 *
 * @example
 * ```tsx
 * <Tabs
 *   items={[
 *     { key: '1', label: 'Tab 1', children: <Content1 /> },
 *     { key: '2', label: 'Tab 2', children: <Content2 /> },
 *   ]}
 *   defaultActiveKey="1"
 *   type="line"
 *   size="md"
 * />
 * ```
 */
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
    /**
     * TabPane compound component for declarative tab content.
     * Alternative to the items array approach.
     * @see {@link TabPane}
     */
    TabPane,
  }
);
