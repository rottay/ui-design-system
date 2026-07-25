'use client';

/**
 * @fileoverview Tabs Rustic Engine - Rottay Design System
 * @description Pure HTML/CSS implementation of the Tabs component.
 * Provides a zero-dependency, fully accessible tabs experience.
 *
 * @remarks
 * The Rustic engine uses vanilla HTML and CSS, making it ideal for:
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
import { arrayValueAt } from '@/foundation/kernel/collections';
import type { TabsProps, TabItem, TabsSize } from '../../contracts';
import { TABS_DEFAULTS } from '../../contracts';
import { isResponsiveValue, generateResponsiveCSS, type ResponsivePropEntry } from '@/infrastructure/runtime/responsive/runtime/style-properties';
import type { ResponsiveValue } from '@/foundation/contracts/kernel/responsive/values';
import { useMotionRecipePresentation } from '@/infrastructure/runtime/foundation/motion/composition/react/preference/recipe';

function scalarOrUndefined<T>(value: ResponsiveValue<T> | undefined): T | undefined {
  if (value === undefined || value === null) return undefined;
  if (isResponsiveValue(value)) return undefined;
  return value as T;
}

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
    size: sizeProp = TABS_DEFAULTS.size,
    centered = TABS_DEFAULTS.centered,
    onChange,
    className,
    style,
  } = props;
  const compatibleType =
    type === 'underline'
      ? 'line'
      : type === 'contained' || type === 'segmented'
        ? 'card'
        : type;
  // Strip colons from generated IDs because colons are invalid in
  // CSS selectors and break aria-controls / aria-labelledby references
  const tabsId = useId().replace(/:/g, '');

  // Responsive size handling
  const responsiveEntries: ResponsivePropEntry<any>[] = [];
  const sizeIsResponsive = isResponsiveValue(sizeProp);

  if (sizeIsResponsive) {
    responsiveEntries.push({
      cssProperty: 'padding',
      value: sizeProp,
      resolve: (v: TabsSize) => (SIZE_STYLES[v as keyof typeof SIZE_STYLES] || SIZE_STYLES.md).padding,
    } as ResponsivePropEntry<any>);
    responsiveEntries.push({
      cssProperty: 'font-size',
      value: sizeProp,
      resolve: (v: TabsSize) => (SIZE_STYLES[v as keyof typeof SIZE_STYLES] || SIZE_STYLES.md).fontSize,
    } as ResponsivePropEntry<any>);
  }

  const needsResponsiveCSS = responsiveEntries.length > 0;
  const responsiveElementId = needsResponsiveCSS ? `tabs-${tabsId}` : '';
  const responsive = needsResponsiveCSS
    ? generateResponsiveCSS(responsiveElementId, responsiveEntries)
    : null;

  const size = scalarOrUndefined(sizeProp) ?? (TABS_DEFAULTS.size as TabsSize);
  // Ref map for imperative focus management during keyboard navigation
  const tabRefs = useRef<Map<string, HTMLButtonElement | null>>(new Map());

  // ============================================================================
  // State Management
  // ============================================================================

  /**
   * Internal state for uncontrolled mode.
   * Falls back to first item if no default provided.
   */
  const [active, setActive] = useState(activeKey || defaultActiveKey || arrayValueAt(items, 0)?.key);

  // state.change recipe (motion canon): the panel's entrance fade resolves its
  // timing from the stamped `--ds-recipe-*` variables. Under reduced motion
  // the resolver returns the settled state and no animation is declared.
  const stateMotion = useMotionRecipePresentation('state.change');
  const motionIsFinal = stateMotion.recipe.state === 'final';

  /**
   * Handles tab selection.
   * Updates internal state in uncontrolled mode and calls onChange callback.
   */
  const handleChange = (key: string) => {
    if (!activeKey) setActive(key);
    onChange?.(key);
  };

  // Filter disabled items out of the keyboard navigation cycle.
  // This follows the roving tabindex pattern from WAI-ARIA tabs spec.
  const enabledItems = items.filter((item) => !item.disabled);

  const focusAndActivate = useCallback(
    (key: string) => {
      handleChange(key);
      tabRefs.current.get(key)?.focus();
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
          nextKey = arrayValueAt(enabledItems, (enabledIndex + 1) % enabledItems.length)?.key;
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
          nextKey = arrayValueAt(enabledItems, (enabledIndex - 1 + enabledItems.length) % enabledItems.length)?.key;
          break;
        case 'Home':
          nextKey = arrayValueAt(enabledItems, 0)?.key;
          break;
        case 'End':
          nextKey = arrayValueAt(enabledItems, -1)?.key;
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
  const getTabStyle = (disabled?: boolean): React.CSSProperties => ({
    ...SIZE_STYLES[size as TabsSize],
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    // Negative margin pulls the active border over the container's bottom border
    marginBottom: compatibleType === 'line' ? '-1px' : undefined,
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  });

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <div
      className={`rottay-tabs rottay-tabs--rustic ${className}`.trim()}
      style={{ ...stateMotion.variables, ...style }}
      data-part="root"
      {...stateMotion.attributes}
      data-variant={compatibleType}
    >
      {responsive && responsive.css && (
        <style dangerouslySetInnerHTML={{ __html: responsive.css }} />
      )}
      {/* Tab List */}
      <div role="tablist" data-part="tab-list" style={tabListStyle} {...(responsive ? responsive.attrs : {})}>
        {items.map((item: TabItem) => (
          <button
            key={item.key}
            ref={(node) => {
              tabRefs.current.set(item.key, node);
            }}
            id={`tabs-tab-${tabsId}-${item.key}`}
            role="tab"
            data-part="tab-button"
            data-selected={item.key === currentKey}
            data-disabled={item.disabled || undefined}
            aria-selected={item.key === currentKey}
            aria-controls={`tabs-panel-${tabsId}-${item.key}`}
            tabIndex={item.key === currentKey ? 0 : -1}
            style={getTabStyle(item.disabled)}
            disabled={item.disabled}
            onClick={() => handleChange(item.key)}
            onKeyDown={(event) => handleKeyDown(event, item.key)}
          >
            {item.icon} {item.label}
            {item.badge !== undefined && item.badge !== null && (
              <span data-part="tab-badge" aria-label={item.badgeAriaLabel}>
                {item.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Panel */}
      {activeItem?.children && (
        <div
          id={`tabs-panel-${tabsId}-${activeItem.key}`}
          role="tabpanel"
          data-part="tab-panel"
          aria-labelledby={`tabs-tab-${tabsId}-${activeItem.key}`}
          tabIndex={0}
          style={{
            padding: '1rem',
            animation: motionIsFinal
              ? undefined
              : 'ds-tabs-fade-in var(--ds-recipe-enter, var(--ds-motion-fast, 120ms)) var(--ds-recipe-curve, var(--ds-motion-ease-out, ease-out))',
          }}
        >
          {activeItem.children}
        </div>
      )}
    </div>
  );
}
