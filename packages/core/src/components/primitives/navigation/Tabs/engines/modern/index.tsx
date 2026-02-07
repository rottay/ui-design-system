'use client';

/**
 * @fileoverview Tabs Modern Engine - Rottay Design System
 * @description DaisyUI/Tailwind implementation of the Tabs component.
 * Provides a lightweight, utility-first tabs experience.
 *
 * @remarks
 * The Modern engine uses DaisyUI's tab classes combined with Tailwind
 * utilities for styling. This results in a smaller bundle size compared
 * to Classic while maintaining visual consistency with the design system.
 *
 * Features provided by this engine:
 * - Utility-first styling with Tailwind
 * - Minimal JavaScript footprint
 * - Fast rendering and updates
 * - DaisyUI's accessible defaults
 * - Theme integration via CSS variables
 *
 * @example
 * ```tsx
 * // Use Modern engine
 * <Tabs engine="modern" items={items} />
 *
 * // Or set globally
 * <EngineProvider engine="modern">
 *   <Tabs items={items} />
 * </EngineProvider>
 * ```
 *
 * @see {@link Tabs} for the main component documentation
 * @see {@link TabsProps} for prop definitions
 *
 * @module Tabs/Engines/Modern
 * @category Navigation
 * @package @rottay/design-system
 */

import React, { useState } from 'react';
import type { TabsProps, TabItem, TabsType, TabsSize } from '../../types';
import { TABS_DEFAULTS } from '../../types';

// ============================================================================
// Style Mappings
// ============================================================================

/**
 * Maps Rottay tab types to DaisyUI classes.
 */
const TYPE_CLASSES = {
  line: 'tabs-bordered',
  card: 'tabs-boxed',
  pills: 'tabs-boxed',
};

/**
 * Maps Rottay sizes to DaisyUI size classes.
 */
const SIZE_CLASSES = {
  sm: 'tabs-sm',
  md: '',
  lg: 'tabs-lg',
};

// ============================================================================
// Component Implementation
// ============================================================================

/**
 * Modern engine implementation of Tabs.
 *
 * @description
 * Renders the Tabs component using DaisyUI classes and Tailwind utilities.
 * Manages tab state internally with controlled mode support.
 *
 * @remarks
 * - Uses DaisyUI's `tabs` component classes
 * - Handles both controlled and uncontrolled modes
 * - Renders content conditionally based on active tab
 * - Applies proper ARIA roles for accessibility
 *
 * @param props - {@link TabsProps}
 * @returns React element rendered with DaisyUI/Tailwind
 *
 * @example
 * ```tsx
 * <ModernTabs
 *   items={[
 *     { key: '1', label: 'Tab 1', children: <Content /> },
 *   ]}
 *   type="line"
 *   centered
 * />
 * ```
 */
export default function ModernTabs(props: TabsProps): React.ReactElement {
  const {
    items,
    activeKey,
    defaultActiveKey,
    type = TABS_DEFAULTS.type,
    size = TABS_DEFAULTS.size,
    centered = TABS_DEFAULTS.centered,
    onChange,
    className = '',
    style,
  } = props;

  // ============================================================================
  // State Management
  // ============================================================================

  /**
   * Internal state for uncontrolled mode.
   * Falls back to first item if no default provided.
   */
  const [active, setActive] = useState(activeKey || defaultActiveKey || items[0]?.key);

  /**
   * Handles tab selection.
   * Updates internal state in uncontrolled mode and calls onChange callback.
   */
  const handleChange = (key: string) => {
    if (!activeKey) setActive(key);
    onChange?.(key);
  };

  // ============================================================================
  // Derived Values
  // ============================================================================

  /** Current active key, preferring controlled value */
  const currentKey = activeKey || active;

  /** Currently active item for content rendering */
  const activeItem = items.find((item: TabItem) => item.key === currentKey);

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <div className={className} style={style}>
      {/* Tab List */}
      <div
        role="tablist"
        className={`tabs ${TYPE_CLASSES[type as TabsType]} ${SIZE_CLASSES[size as TabsSize]} ${centered ? 'justify-center' : ''}`}
      >
        {items.map((item: TabItem) => (
          <button
            key={item.key}
            role="tab"
            className={`tab ${item.key === currentKey ? 'tab-active' : ''}`}
            disabled={item.disabled}
            onClick={() => handleChange(item.key)}
          >
            {item.icon} {item.label}
          </button>
        ))}
      </div>

      {/* Tab Panel */}
      {activeItem?.children && (
        <div className="p-4">{activeItem.children}</div>
      )}
    </div>
  );
}
