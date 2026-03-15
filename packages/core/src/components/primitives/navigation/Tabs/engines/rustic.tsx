'use client';

/**
 * @fileoverview Tabs Rustic Engine - Rottay Design System
 * @description Pure HTML/CSS implementation of the Tabs component.
 * Provides a zero-dependency, fully accessible tabs experience.
 *
 * @remarks
 * The Rustic engine uses only vanilla HTML and CSS, making it ideal for:
 * - Projects that need minimal dependencies
 * - Server-side rendering scenarios
 * - Maximum accessibility compliance
 * - Custom styling requirements
 *
 * Features provided by this engine:
 * - Zero external dependencies
 * - Full keyboard navigation
 * - ARIA-compliant markup
 * - CSS variable integration for theming
 * - Inline styles for easy customization
 *
 * @example
 * ```tsx
 * // Use Rustic engine for zero dependencies
 * <Tabs engine="rustic" items={items} />
 *
 * // Ideal for accessibility-focused projects
 * <EngineProvider engine="rustic">
 *   <Tabs items={items} />
 * </EngineProvider>
 * ```
 *
 * @see {@link Tabs} for the main component documentation
 * @see {@link TabsProps} for prop definitions
 *
 * @module Tabs/Engines/Rustic
 * @category Navigation
 * @package @rottay/design-system
 */

import React, { useCallback, useId, useRef, useState } from 'react';
import type { TabsProps, TabItem, TabsSize } from '../Tabs.types';
import { TABS_DEFAULTS } from '../Tabs.types';

// ============================================================================
// Style Constants
// ============================================================================

/**
 * Size-specific styles for tab buttons.
 * Maps Rottay size variants to padding and font size values.
 */
const SIZE_STYLES = {
  sm: { padding: '0.25rem 0.75rem', fontSize: '0.875rem' },
  md: { padding: '0.5rem 1rem', fontSize: '1rem' },
  lg: { padding: '0.75rem 1.25rem', fontSize: '1.125rem' },
};

// ============================================================================
// Component Implementation
// ============================================================================

/**
 * Rustic engine implementation of Tabs.
 *
 * @description
 * Renders the Tabs component using pure HTML and inline styles.
 * Provides full functionality without external CSS frameworks.
 *
 * @remarks
 * - Uses CSS variables for theme integration
 * - Implements proper ARIA roles and attributes
 * - Handles both controlled and uncontrolled modes
 * - Styles adapt to type and size props
 *
 * @param props - {@link TabsProps}
 * @returns React element rendered with vanilla HTML/CSS
 *
 * @example
 * ```tsx
 * <RusticTabs
 *   items={[
 *     { key: '1', label: 'Tab 1', children: <Content /> },
 *   ]}
 *   type="line"
 *   size="md"
 * />
 * ```
 */
export default function RusticTabs(props: TabsProps): React.ReactElement {
  const {
    items,
    activeKey,
    defaultActiveKey,
    type = TABS_DEFAULTS.type,
    size = TABS_DEFAULTS.size,
    centered = TABS_DEFAULTS.centered,
    onChange,
    className,
    style,
  } = props;
  const tabsId = useId().replace(/:/g, '');
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});

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

  // ============================================================================
  // Style Definitions
  // ============================================================================

  /**
   * Styles for the tab list container.
   * Uses CSS variables for theming and flexbox for layout.
   */
  const tabListStyle: React.CSSProperties = {
    display: 'flex',
    gap: 'var(--ds-tabs-gap, 0.25rem)',
    borderBottom: type === 'line' ? '1px solid var(--ds-tabs-border-color, var(--ds-color-neutral-200, #e5e5e5))' : undefined,
    justifyContent: centered ? 'center' : 'flex-start',
  };

  /**
   * Generates styles for individual tab buttons.
   * Adapts based on active state, disabled state, and type.
   *
   * @param isActive - Whether this tab is currently active
   * @param disabled - Whether this tab is disabled
   * @returns CSSProperties for the tab button
   */
  const getTabStyle = (isActive: boolean, disabled?: boolean): React.CSSProperties => ({
    ...SIZE_STYLES[size as TabsSize],
    border: 'none',
    background: isActive ? 'var(--ds-tabs-active-bg, var(--ds-color-primary-500, #0066CC))' : 'transparent',
    color: isActive ? 'var(--ds-tabs-active-color, white)' : 'inherit',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    borderRadius: type === 'card' || type === 'pills' ? 'var(--ds-tabs-radius, 0.375rem)' : '0',
    borderBottom: type === 'line' && isActive ? '2px solid var(--ds-tabs-active-border, var(--ds-color-primary-500, #0066CC))' : undefined,
    marginBottom: type === 'line' ? '-1px' : undefined,
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  });

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <div className={className} style={style}>
      {/* Tab List */}
      <div role="tablist" style={tabListStyle}>
        {items.map((item: TabItem) => (
          <button
            key={item.key}
            ref={(node) => {
              tabRefs.current[item.key] = node;
            }}
            id={`tabs-tab-${tabsId}-${item.key}`}
            role="tab"
            aria-selected={item.key === currentKey}
            aria-controls={`tabs-panel-${tabsId}-${item.key}`}
            tabIndex={item.key === currentKey ? 0 : -1}
            style={getTabStyle(item.key === currentKey, item.disabled)}
            disabled={item.disabled}
            onClick={() => handleChange(item.key)}
            onKeyDown={(event) => handleKeyDown(event, item.key)}
          >
            {item.icon} {item.label}
          </button>
        ))}
      </div>

      {/* Tab Panel */}
      {activeItem?.children && (
        <div
          id={`tabs-panel-${tabsId}-${activeItem.key}`}
          role="tabpanel"
          aria-labelledby={`tabs-tab-${tabsId}-${activeItem.key}`}
          tabIndex={0}
          style={{ padding: '1rem' }}
        >
          {activeItem.children}
        </div>
      )}
    </div>
  );
}
