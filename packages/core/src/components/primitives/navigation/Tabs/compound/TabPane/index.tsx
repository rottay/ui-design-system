/**
 * @fileoverview TabPane Compound Component - Rottay Design System
 * @description A compound component for declarative tab content definition.
 * Used as a child of the Tabs component to define individual tab panels.
 *
 * @remarks
 * TabPane provides an alternative to the `items` prop approach, offering
 * a more declarative and JSX-native way to define tab content. This pattern
 * is familiar to users of other UI libraries and can improve code readability.
 *
 * The component works with all three engines (Titan, Hermes, Apollo) and
 * inherits tenant theming automatically through the parent Tabs component.
 *
 * @example Basic Usage
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
 * </Tabs>
 * ```
 *
 * @example With Disabled Tab
 * ```tsx
 * <Tabs defaultActiveKey="home">
 *   <Tabs.TabPane tab="Home" key="home">Home content</Tabs.TabPane>
 *   <Tabs.TabPane tab="Profile" key="profile">Profile content</Tabs.TabPane>
 *   <Tabs.TabPane tab="Admin" key="admin" disabled>
 *     Admin content (disabled)
 *   </Tabs.TabPane>
 * </Tabs>
 * ```
 *
 * @example Force Render Inactive Content
 * ```tsx
 * <Tabs defaultActiveKey="1">
 *   <Tabs.TabPane tab="Tab 1" key="1" forceRender>
 *     {/* This content is always in the DOM even when inactive *\/}
 *     <VideoPlayer />
 *   </Tabs.TabPane>
 * </Tabs>
 * ```
 *
 * @see {@link Tabs} for parent component documentation
 * @see {@link TabPaneProps} for prop definitions
 *
 * @module Tabs/Compound/TabPane
 * @category Navigation
 * @package @rottay/design-system
 */

'use client';

import React, { forwardRef } from 'react';
import type { ReactNode } from 'react';

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * Props for the TabPane compound component.
 *
 * @description
 * Defines the configuration options for individual tab panels
 * when using the compound component pattern.
 *
 * @example
 * ```tsx
 * const tabPaneProps: TabPaneProps = {
 *   tab: 'Settings',
 *   key: 'settings',
 *   disabled: false,
 *   forceRender: true,
 * };
 * ```
 */
export interface TabPaneProps {
  /**
   * Tab label displayed in the tab bar.
   * Can be a string or any React node.
   *
   * @example
   * ```tsx
   * // String label
   * <Tabs.TabPane tab="Home" key="home">...</Tabs.TabPane>
   *
   * // Node with icon
   * <Tabs.TabPane tab={<><HomeIcon /> Home</>} key="home">...</Tabs.TabPane>
   * ```
   */
  tab: ReactNode;

  /**
   * Unique key for the tab.
   * Used to identify the tab for active state management.
   */
  key?: string;

  /**
   * Tab content rendered in the panel area.
   * Only visible when this tab is active (unless forceRender is true).
   */
  children?: ReactNode;

  /**
   * Whether the tab is disabled and cannot be selected.
   * Disabled tabs are visually muted and non-interactive.
   * @default false
   */
  disabled?: boolean;

  /**
   * Force render content even when the tab is inactive.
   * Useful for content that needs to maintain state (e.g., video players).
   * @default false
   */
  forceRender?: boolean;

  /**
   * Custom close icon for closable tabs.
   * Only applicable when parent Tabs has closable functionality.
   */
  closeIcon?: ReactNode;

  /**
   * Additional CSS class name(s) to apply to the tab panel.
   * Merged with default styling classes.
   */
  className?: string;

  /**
   * Inline styles to apply to the tab panel.
   * Use CSS variables for theme-aware styling.
   */
  style?: React.CSSProperties;
}

// ============================================================================
// Component Implementation
// ============================================================================

/**
 * TabPane compound component for declarative tab content.
 *
 * @description
 * Renders an individual tab panel within the Tabs component.
 * This component is primarily used to define tab structure declaratively,
 * with the actual rendering logic handled by the parent Tabs component.
 *
 * @remarks
 * - Used as `Tabs.TabPane` in JSX
 * - Works with all engine implementations
 * - Supports ref forwarding for DOM access
 * - Content visibility managed by parent Tabs
 *
 * @param props - {@link TabPaneProps}
 * @param ref - Forwarded ref to the panel container
 * @returns React element representing the tab panel
 *
 * @example
 * ```tsx
 * <Tabs.TabPane tab="Profile" key="profile">
 *   <UserProfile userId={currentUser.id} />
 * </Tabs.TabPane>
 * ```
 */
export const TabPane = forwardRef<HTMLDivElement, TabPaneProps>(
  (props, ref) => {
    const { children, className = '', style = {} } = props;

    return (
      <div ref={ref} className={`rottay-tabs-tabpane ${className}`} style={style}>
        {children}
      </div>
    );
  }
);

// ============================================================================
// Display Name
// ============================================================================

/**
 * Display name for React DevTools.
 * Shows as "Tabs.TabPane" in component tree.
 */
TabPane.displayName = 'Tabs.TabPane';

// ============================================================================
// Default Export
// ============================================================================

export default TabPane;
