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
 * Enhancements:
 * - Type-aware styling: 'line' gets sliding border-bottom indicator,
 *   'card' gets rounded-top bg, 'pills' gets full rounded
 * - Explicit transition-colors duration-200 on all tabs
 * - Hover underline for line type
 * - Active indicator animation with smooth transitions
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

import React, { useCallback, useId, useRef, useState, useEffect } from 'react';
import type { TabsProps, TabItem, TabsType, TabsSize } from '../Tabs.types';
import { TABS_DEFAULTS } from '../Tabs.types';

// ============================================================================
// Style Mappings
// ============================================================================

/**
 * Maps Rottay tab types to DaisyUI classes.
 */
// DaisyUI provides `tabs-bordered` (underline) and `tabs-boxed` (filled background).
// Both "card" and "pills" map to `tabs-boxed` since DaisyUI has no distinct pill
// variant. The visual difference between card/pills is achieved via the inline
// type-specific styles returned by `getTabTypeStyle()` below.
const TYPE_CLASSES: Record<string, string> = {
  line: 'tabs-bordered',
  card: 'tabs-boxed',
  pills: 'tabs-boxed',
};

/**
 * Maps Rottay sizes to DaisyUI size classes.
 */
const SIZE_CLASSES: Record<string, string> = {
  sm: 'tabs-sm',
  md: '',
  lg: 'tabs-lg',
};

// ============================================================================
// Type-specific styling
// ============================================================================

/**
 * Get type-specific styles for individual tab buttons.
 */
function getTabTypeStyle(
  type: string,
  isActive: boolean,
  isHovered: boolean,
): React.CSSProperties {
  const base: React.CSSProperties = {
    transition: 'color 0.2s ease, background-color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease',
  };

  switch (type) {
    case 'line':
      return {
        ...base,
        borderBottom: isActive
          ? '2px solid var(--ds-tabs-active-color, oklch(var(--p)))'
          : isHovered
            ? '2px solid var(--ds-tabs-hover-color, oklch(var(--p) / 0.4))'
            : '2px solid transparent',
        borderRadius: 0,
        paddingBottom: '8px',
        marginBottom: '-1px',
        color: isActive
          ? 'var(--ds-tabs-active-color, oklch(var(--p)))'
          : undefined,
      };

    case 'card':
      return {
        ...base,
        borderRadius: isActive ? '8px 8px 0 0' : '8px 8px 0 0',
        backgroundColor: isActive
          ? 'var(--ds-tabs-active-bg, oklch(var(--b1)))'
          : isHovered
            ? 'var(--ds-tabs-hover-bg, oklch(var(--b2)))'
            : 'transparent',
        boxShadow: isActive
          ? '0 -1px 3px rgba(0, 0, 0, 0.06)'
          : 'none',
        fontWeight: isActive ? 600 : 400,
      };

    case 'pills':
      return {
        ...base,
        borderRadius: '9999px',
        backgroundColor: isActive
          ? 'var(--ds-tabs-active-bg, oklch(var(--p)))'
          : isHovered
            ? 'var(--ds-tabs-hover-bg, oklch(var(--b2)))'
            : 'transparent',
        color: isActive
          ? 'var(--ds-tabs-active-color, oklch(var(--pc)))'
          : undefined,
        fontWeight: isActive ? 500 : 400,
        padding: '4px 16px',
      };

    default:
      return base;
  }
}

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
 * - Type-aware styling for line, card, and pills variants
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
  // useId() generates IDs containing colons which break CSS selectors and
  // aria-* attribute references, so we strip them for safe DOM id usage
  const tabsId = useId().replace(/:/g, '');
  // Ref map for imperative focus management during keyboard navigation
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  // Tracked hover state enables type-specific hover styles (e.g., underline preview)
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);

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

  // Filter out disabled items so keyboard navigation only cycles through
  // actionable tabs, following the WAI-ARIA tabs roving tabindex pattern
  const enabledItems = items.filter((item) => !item.disabled);

  const focusAndActivate = useCallback(
    (key: string) => {
      handleChange(key);
      tabRefs.current[key]?.focus();
    },
    [tabRefs]
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLButtonElement>, key: string) => {
      const enabledIndex = enabledItems.findIndex((item) => item.key === key);

      if (enabledIndex === -1) return;

      let nextKey: string | undefined;

      switch (event.key) {
        case 'ArrowRight':
        case 'ArrowDown':
          nextKey = enabledItems[(enabledIndex + 1) % enabledItems.length]?.key;
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
          nextKey = enabledItems[(enabledIndex - 1 + enabledItems.length) % enabledItems.length]?.key;
          break;
        case 'Home':
          nextKey = enabledItems[0]?.key;
          break;
        case 'End':
          nextKey = enabledItems[enabledItems.length - 1]?.key;
          break;
        default:
          return;
      }

      if (!nextKey) return;

      event.preventDefault();
      focusAndActivate(nextKey);
    },
    [enabledItems, focusAndActivate]
  );

  // ============================================================================
  // Derived Values
  // ============================================================================

  /** Current active key, preferring controlled value */
  const currentKey = activeKey || active;

  /** Currently active item for content rendering */
  const activeItem = items.find((item: TabItem) => item.key === currentKey);

  // For pills, we omit tabs-boxed from the container class because DaisyUI's
  // boxed style adds a background that conflicts with the pill button appearance.
  // The pill styling is applied per-button via getTabTypeStyle() instead.
  const tabListClass = type === 'pills'
    ? `tabs ${SIZE_CLASSES[size as TabsSize]} ${centered ? 'justify-center' : ''}`
    : `tabs ${TYPE_CLASSES[type as TabsType]} ${SIZE_CLASSES[size as TabsSize]} ${centered ? 'justify-center' : ''}`;

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <div className={className} style={style}>
      {/* Tab List */}
      <div
        role="tablist"
        aria-orientation="horizontal"
        className={tabListClass}
        style={{ position: 'relative' }}
      >
        {items.map((item: TabItem) => {
          const isActive = item.key === currentKey;
          const isHovered = item.key === hoveredKey;
          const typeStyle = getTabTypeStyle(type || 'line', isActive, isHovered && !item.disabled);

          return (
            <button
              key={item.key}
              ref={(node) => {
                tabRefs.current[item.key] = node;
              }}
              id={`tabs-tab-${tabsId}-${item.key}`}
              role="tab"
              aria-selected={isActive}
              aria-controls={`tabs-panel-${tabsId}-${item.key}`}
              tabIndex={isActive ? 0 : -1}
              className={`tab ${isActive ? 'tab-active' : ''}`}
              disabled={item.disabled}
              onClick={() => handleChange(item.key)}
              onKeyDown={(event) => handleKeyDown(event, item.key)}
              onMouseEnter={() => setHoveredKey(item.key)}
              onMouseLeave={() => setHoveredKey(null)}
              style={{
                ...typeStyle,
                opacity: item.disabled ? 0.5 : 1,
                cursor: item.disabled ? 'not-allowed' : 'pointer',
              }}
            >
              {item.icon} {item.label}
            </button>
          );
        })}
      </div>

      {/* Tab Panel */}
      {activeItem?.children && (
        <div
          id={`tabs-panel-${tabsId}-${activeItem.key}`}
          role="tabpanel"
          aria-labelledby={`tabs-tab-${tabsId}-${activeItem.key}`}
          tabIndex={0}
          className="p-4"
          style={{
            animation: 'rottay-tabs-fade-in 0.2s ease-out',
          }}
        >
          {activeItem.children}
        </div>
      )}

      {/* Injected keyframe for the panel fade-in animation. Using
          dangerouslySetInnerHTML because React does not support @keyframes
          in inline style objects. The animation is scoped by its unique name. */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes rottay-tabs-fade-in {
          from { opacity: 0; transform: translateY(2px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />
    </div>
  );
}
