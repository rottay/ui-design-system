'use client';

/**
 * @fileoverview Tabs Modern Engine - Rottay Design System
 * @description Premium token-driven tabs with sliding indicator, refined states,
 * and badge/icon support. Linear/Vercel/Stripe quality.
 *
 * @remarks
 * The Modern engine uses CSS custom property tokens for all visual decisions.
 * No DaisyUI classes - all styling is inline via design tokens.
 *
 * **Tab Types:**
 * - `line`: Bottom border indicator (default). Sliding animated underline.
 * - `card`: Rounded tab buttons with bg fill + elevation when active.
 * - `pills`: Pill-shaped buttons with bg fill when active.
 *
 * **Sizes:**
 * - `sm`: text-xs, 32px height
 * - `md`: text-sm, 36px height
 * - `lg`: text-base, 40px height
 *
 * @module Tabs/Engines/Modern
 * @category Navigation
 * @package @rottay/design-system
 */

import React, { useCallback, useId, useLayoutEffect, useRef, useState } from 'react';
import { arrayValueAt } from '@/foundation/kernel/collections';
import type { TabsProps, TabItem, TabsSize } from '../../contracts';
import { TABS_DEFAULTS } from '../../contracts';
import {
  isResponsiveValue,
  generateResponsiveCSS,
  type ResponsivePropEntry,
} from '@/infrastructure/runtime/responsive/runtime/style-properties';
import type { ResponsiveValue } from '@/foundation/contracts/kernel/responsive/values';

// ============================================================================
// Constants
// ============================================================================

const TRANSITION_FAST = [
  'color var(--ds-motion-fast) var(--ds-motion-ease-out)',
  'background-color var(--ds-motion-fast) var(--ds-motion-ease-out)',
  'border-color var(--ds-motion-fast) var(--ds-motion-ease-out)',
  'box-shadow var(--ds-motion-fast) var(--ds-motion-ease-out)',
  'opacity var(--ds-motion-fast) var(--ds-motion-ease-out)',
].join(', ');

const SIZE_CONFIG: Record<
  string,
  {
    height: string;
    fontSize: string;
    padding: string;
    iconSize: string;
    badgeFontSize: string;
  }
> = {
  sm: {
    height: 'var(--ds-tabs-sm-height, 32px)',
    fontSize: 'var(--ds-font-size-xs, 12px)',
    padding: 'var(--ds-spacing-2, 8px) var(--ds-spacing-3, 12px)',
    iconSize: 'var(--ds-tabs-sm-icon-size, 14px)',
    badgeFontSize: 'var(--ds-font-size-2xs, 10px)',
  },
  md: {
    height: 'var(--ds-tabs-md-height, 36px)',
    fontSize: 'var(--ds-font-size-sm, 14px)',
    padding: 'var(--ds-spacing-2, 8px) var(--ds-spacing-4, 16px)',
    iconSize: 'var(--ds-tabs-md-icon-size, 16px)',
    badgeFontSize: 'var(--ds-font-size-2xs, 11px)',
  },
  lg: {
    height: 'var(--ds-tabs-lg-height, 40px)',
    fontSize: 'var(--ds-font-size-base, 15px)',
    padding: 'var(--ds-spacing-2, 8px) var(--ds-spacing-4, 16px)',
    iconSize: 'var(--ds-tabs-lg-icon-size, 18px)',
    badgeFontSize: 'var(--ds-font-size-2xs, 11px)',
  },
};

// ============================================================================
// Helpers
// ============================================================================

function scalarOrUndefined<T>(value: ResponsiveValue<T> | undefined): T | undefined {
  if (value === undefined || value === null) return undefined;
  if (isResponsiveValue(value)) return undefined;
  return value as T;
}

// ============================================================================
// Indicator position type
// ============================================================================

interface IndicatorPos {
  left: number;
  width: number;
}

// ============================================================================
// Tab item style by type
// ============================================================================

function getTabItemStyle(type: string, isActive: boolean, isDisabled: boolean, sizeKey: string): React.CSSProperties {
  const sizeStyle = SIZE_CONFIG[sizeKey] || SIZE_CONFIG.md;
  const base: React.CSSProperties = {
    transition: TRANSITION_FAST,
    height: sizeStyle.height,
    padding: sizeStyle.padding,
    fontSize: sizeStyle.fontSize,
    lineHeight: '1',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    whiteSpace: 'nowrap' as const,
    position: 'relative' as const,
    userSelect: 'none' as const,
    flexShrink: 0,
    cursor: isDisabled ? 'not-allowed' : 'pointer',
    opacity: isDisabled ? 0.4 : 1,
  };

  switch (type) {
    case 'line': {
      return {
        ...base,
        paddingBottom: 'var(--ds-tabs-line-padding-bottom, 10px)',
        marginBottom: '-1px',
        fontWeight: isActive ? 500 : 400,
      };
    }

    case 'card':
    case 'pills': {
      return {
        ...base,
        fontWeight: isActive ? 500 : 400,
      };
    }

    default:
      return base;
  }
}

// ============================================================================
// Badge sub-component (inline)
// ============================================================================

function TabBadge({ children, sizeKey }: { children: React.ReactNode; sizeKey: string }): React.ReactElement {
  const sizeStyle = SIZE_CONFIG[sizeKey] || SIZE_CONFIG.md;
  return (
    <span
      data-part="tab-badge"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: '18px',
        height: '18px',
        padding: '0 6px',
        fontSize: sizeStyle.badgeFontSize,
        fontWeight: 500,
        lineHeight: '1',
        letterSpacing: '0.01em',
      }}
    >
      {children}
    </span>
  );
}

// ============================================================================
// Label parser -- detects label+badge pattern
// ============================================================================

/**
 * If the label is a string like "Groups 4" where the last token is a number,
 * we split it into the text label and a badge. Otherwise, render as-is.
 */
function parseLabel(label: React.ReactNode, sizeKey: string): React.ReactNode {
  if (typeof label === 'string') {
    const match = label.match(/^(.+?)\s+(\d+)$/);
    if (match) {
      return (
        <>
          {match[1]}
          <TabBadge sizeKey={sizeKey}>{match[2]}</TabBadge>
        </>
      );
    }
  }
  return label;
}

// ============================================================================
// Component
// ============================================================================

/**
 * Modern engine Tabs component using token-driven inline styles.
 * Premium quality: sliding indicator, refined states, badge/icon support.
 *
 * @param props - {@link TabsProps}
 * @returns React element
 */
export default function ModernTabs(props: TabsProps): React.ReactElement {
  const {
    items,
    activeKey,
    defaultActiveKey,
    type = TABS_DEFAULTS.type,
    size: sizeProp = TABS_DEFAULTS.size,
    centered = TABS_DEFAULTS.centered,
    onChange,
    className = '',
    style,
  } = props;

  const tabsId = useId().replace(/:/g, '');

  // Responsive size handling
  const responsiveEntries: ResponsivePropEntry<any>[] = [];
  const sizeIsResponsive = isResponsiveValue(sizeProp);

  if (sizeIsResponsive) {
    const TABS_SIZE_STYLES: Record<string, { padding: string; fontSize: string }> = {
      sm: {
        padding: 'var(--ds-spacing-2, 8px) var(--ds-spacing-3, 12px)',
        fontSize: 'var(--ds-font-size-xs, 12px)',
      },
      md: {
        padding: 'var(--ds-spacing-2, 8px) var(--ds-spacing-4, 16px)',
        fontSize: 'var(--ds-font-size-sm, 14px)',
      },
      lg: {
        padding: 'var(--ds-spacing-2, 8px) var(--ds-spacing-4, 16px)',
        fontSize: 'var(--ds-font-size-base, 15px)',
      },
    };
    responsiveEntries.push({
      cssProperty: 'padding',
      value: sizeProp,
      resolve: (v: TabsSize) => (TABS_SIZE_STYLES[v as keyof typeof TABS_SIZE_STYLES] || TABS_SIZE_STYLES.md).padding,
    } as ResponsivePropEntry<any>);
    responsiveEntries.push({
      cssProperty: 'font-size',
      value: sizeProp,
      resolve: (v: TabsSize) => (TABS_SIZE_STYLES[v as keyof typeof TABS_SIZE_STYLES] || TABS_SIZE_STYLES.md).fontSize,
    } as ResponsivePropEntry<any>);
  }

  const needsResponsiveCSS = responsiveEntries.length > 0;
  const responsiveElementId = needsResponsiveCSS ? `tabs-${tabsId}` : '';
  const responsive = needsResponsiveCSS ? generateResponsiveCSS(responsiveElementId, responsiveEntries) : null;

  const size = scalarOrUndefined(sizeProp) ?? (TABS_DEFAULTS.size as TabsSize);
  const tabListRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Map<string, HTMLButtonElement | null>>(new Map());
  const [indicatorPos, setIndicatorPos] = useState<IndicatorPos | null>(null);

  // ============================================================================
  // State Management
  // ============================================================================

  const [active, setActive] = useState(activeKey || defaultActiveKey || arrayValueAt(items, 0)?.key);

  const handleChange = (key: string) => {
    if (!activeKey) setActive(key);
    onChange?.(key);
  };

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

  const currentKey = activeKey || active;
  const activeItem = items.find((item: TabItem) => item.key === currentKey);

  // ============================================================================
  // Sliding indicator measurement (line type only)
  // ============================================================================

  useLayoutEffect(() => {
    if (type !== 'line' || !currentKey) {
      setIndicatorPos(null);
      return;
    }

    const activeTab = tabRefs.current.get(currentKey);
    const tabList = tabListRef.current;
    if (!activeTab || !tabList) {
      setIndicatorPos(null);
      return;
    }

    const tabListRect = tabList.getBoundingClientRect();
    const activeRect = activeTab.getBoundingClientRect();

    setIndicatorPos({
      left: activeRect.left - tabListRect.left + tabList.scrollLeft,
      width: activeRect.width,
    });
  }, [currentKey, type, items]);

  // ============================================================================
  // Container styles by type
  // ============================================================================

  const tabListStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'flex-end',
    gap: type === 'line' ? '4px' : '4px',
    position: 'relative',
    overflowX: 'auto',
    overflowY: 'hidden',
    WebkitOverflowScrolling: 'touch',
    scrollbarWidth: 'none',
    ...(type === 'card' && {
      padding: '4px',
      alignItems: 'center',
      gap: '2px',
    }),
    ...(type === 'pills' && {
      padding: '4px',
      gap: '4px',
      alignItems: 'center',
    }),
    ...(centered && {
      justifyContent: 'center',
    }),
  };

  // ============================================================================
  // Sliding indicator style
  // ============================================================================

  // Compositor-only (transform-only) glide: the indicator's own box stays a
  // fixed 1px wide; `scaleX` (from a `left`-anchored transform-origin)
  // supplies the visual width instead of transitioning the `width` property,
  // which the engine-token-audit.mjs compositor-only counter flags as a
  // layout-property animation.
  // The `transform` is the one genuinely RUNTIME paint value in this family: it
  // is measured from `getBoundingClientRect()` on every active-tab change, so it
  // cannot be enumerated as CSS states and stays inline (contract-exempt).
  const indicatorStyle: React.CSSProperties | null =
    type === 'line' && indicatorPos
      ? {
          position: 'absolute',
          bottom: 0,
          left: 0,
          height: '2px',
          width: '1px',
          transformOrigin: 'left',
          transform: `translateX(${indicatorPos.left}px) scaleX(${indicatorPos.width})`,
          transition: 'transform var(--ds-motion-normal) var(--ds-motion-ease-out)',
          pointerEvents: 'none',
        }
      : null;

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <div
      className={`rottay-tabs rottay-tabs--modern ${className}`.trim()}
      style={style}
      data-part="root"
      data-variant={type || 'line'}
    >
      {responsive && responsive.css && <style dangerouslySetInnerHTML={{ __html: responsive.css }} />}

      {/* Tab List */}
      <div
        ref={tabListRef}
        role="tablist"
        aria-orientation="horizontal"
        data-tabs-id={tabsId}
        data-part="tab-list"
        style={tabListStyle}
        {...(responsive ? responsive.attrs : {})}
      >
        {items.map((item: TabItem) => {
          const isActive = item.key === currentKey;
          const isDisabled = !!item.disabled;
          const itemStyle = getTabItemStyle(type || 'line', isActive, isDisabled, size as string);

          return (
            <button
              key={item.key}
              ref={(node) => {
                tabRefs.current.set(item.key, node);
              }}
              id={`tabs-tab-${tabsId}-${item.key}`}
              role="tab"
              data-part="tab-button"
              data-selected={isActive}
              data-disabled={isDisabled || undefined}
              aria-selected={isActive}
              aria-controls={`tabs-panel-${tabsId}-${item.key}`}
              tabIndex={isActive ? 0 : -1}
              disabled={item.disabled}
              onClick={() => handleChange(item.key)}
              onKeyDown={(event) => handleKeyDown(event, item.key)}
              style={itemStyle}
            >
              {item.icon && (
                <span
                  data-part="icon"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: (SIZE_CONFIG[size as string] || SIZE_CONFIG.md).iconSize,
                    height: (SIZE_CONFIG[size as string] || SIZE_CONFIG.md).iconSize,
                    flexShrink: 0,
                  }}
                >
                  {item.icon}
                </span>
              )}
              {parseLabel(item.label, size as string)}
            </button>
          );
        })}

        {/* Sliding indicator for line type */}
        {indicatorStyle && <span data-part="indicator" style={indicatorStyle} aria-hidden="true" />}
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
            padding: 'var(--ds-spacing-4, 16px) 0 0 0',
            animation: 'ds-tabs-fade-in var(--ds-motion-fast) var(--ds-motion-ease-out)',
          }}
        >
          {activeItem.children}
        </div>
      )}
    </div>
  );
}
