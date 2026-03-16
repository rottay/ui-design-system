'use client';

/**
 * @fileoverview Collapse Modern Engine - Rottay Design System.
 * Tailwind/DaisyUI implementation using React Context for shared accordion
 * state between Collapse and Panel. Supports controlled and uncontrolled
 * modes with CSS transition animations (max-height + rotate).
 *
 * @example
 * ```tsx
 * <Collapse engine="modern" accordion>
 *   <Collapse.Panel engine="modern" header="FAQ 1" panelKey="1">
 *     Answer to FAQ 1
 *   </Collapse.Panel>
 * </Collapse>
 * ```
 *
 * @module Collapse/Engines/Modern
 * @category Layout
 * @package @rottay/design-system
 */
import React, { useState, createContext, useContext, Children, cloneElement, isValidElement } from 'react';
import type { CollapseProps, CollapsePanelProps } from '../Collapse.types';
import { COLLAPSE_DEFAULTS } from '../Collapse.types';

/** Shared state between Collapse and its Panel children via React Context */
interface CollapseContextValue {
  activeKeys: string[];
  toggleKey: (key: string) => void;
  accordion: boolean;
  expandIconPosition: 'start' | 'end';
  bordered: boolean;
  ghost: boolean;
}

const CollapseContext = createContext<CollapseContextValue | null>(null);

/**
 * Modern (Tailwind) Collapse Panel.
 *
 * Reads shared state from CollapseContext to determine active/inactive status.
 * Uses DaisyUI's `collapse` class structure with Tailwind transition utilities
 * for smooth expand/collapse animations. The `index` prop is injected by the
 * parent Collapse via `cloneElement` to generate fallback keys.
 *
 * @param props - {@link CollapsePanelProps} with an optional injected `index`.
 * @returns A Tailwind-styled collapsible panel, or null if rendered outside a Collapse.
 */
export const Panel = React.forwardRef<HTMLDivElement, CollapsePanelProps & { index?: number }>(
  (props, ref) => {
    const {
      panelKey,
      header,
      disabled = false,
      showArrow = true,
      extra,
      children,
      className = '',
      style,
      index = 0,
    } = props;

    // Panel requires a parent Collapse to provide context; bail if orphaned
    const context = useContext(CollapseContext);
    if (!context) return null;

    // Use explicit panelKey when provided, otherwise derive from render index
    const key = panelKey ?? `panel-${index}`;
    const isActive = context.activeKeys.includes(key);

    const handleClick = () => {
      if (!disabled) {
        context.toggleKey(key);
      }
    };

    // Arrow indicator rotates 90deg when panel is expanded
    const arrowIcon = showArrow && (
      <span
        className={`transition-transform duration-200 ${isActive ? 'rotate-90' : ''}`}
      >
        ▶
      </span>
    );

    return (
      <div
        ref={ref}
        className={`collapse ${context.bordered ? 'border border-base-300' : ''} ${
          context.ghost ? 'bg-transparent' : 'bg-base-100'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
        style={style}
      >
        {/* Header row: icon position controlled by expandIconPosition context */}
        <div
          className={`collapse-title flex items-center gap-2 cursor-pointer ${
            disabled ? 'pointer-events-none' : ''
          }`}
          onClick={handleClick}
        >
          {context.expandIconPosition === 'start' && arrowIcon}
          <span className="flex-1">{header}</span>
          {extra && <span className="ml-auto">{extra}</span>}
          {context.expandIconPosition === 'end' && arrowIcon}
        </div>
        {/* Content area animated via max-height transition */}
        <div
          className={`collapse-content overflow-hidden transition-all duration-200 ${
            isActive ? 'max-h-screen py-4' : 'max-h-0'
          }`}
        >
          {children}
        </div>
      </div>
    );
  }
);
Panel.displayName = 'Collapse.Panel.Modern';

/**
 * Modern (Tailwind) Collapse container.
 *
 * Manages accordion state (controlled or uncontrolled) and shares it with
 * Panel children via CollapseContext. Each child is cloned with an injected
 * `index` prop so panels without an explicit `panelKey` can derive one.
 *
 * @param props - {@link CollapseProps} with accordion, bordered, ghost, and onChange.
 * @returns A flex-column container providing collapse context to child panels.
 */
export const Collapse = React.forwardRef<HTMLDivElement, CollapseProps>(
  (props, ref) => {
    const {
      activeKey,
      defaultActiveKey,
      accordion = COLLAPSE_DEFAULTS.accordion,
      bordered = COLLAPSE_DEFAULTS.bordered,
      ghost = false,
      expandIconPosition = COLLAPSE_DEFAULTS.expandIconPosition,
      onChange,
      children,
      className = '',
      style,
    } = props;

    // Normalize single string keys to arrays for uniform handling
    const normalizeKeys = (keys: string | string[] | undefined): string[] => {
      if (!keys) return [];
      return Array.isArray(keys) ? keys : [keys];
    };

    // Internal state for uncontrolled mode; ignored when activeKey is provided
    const [internalActiveKeys, setInternalActiveKeys] = useState<string[]>(
      normalizeKeys(defaultActiveKey)
    );

    // Controlled mode: use prop value; uncontrolled: use internal state
    const activeKeys = activeKey !== undefined ? normalizeKeys(activeKey) : internalActiveKeys;

    const toggleKey = (key: string) => {
      let newKeys: string[];

      // In accordion mode only one panel can be open at a time
      if (accordion) {
        newKeys = activeKeys.includes(key) ? [] : [key];
      } else {
        newKeys = activeKeys.includes(key)
          ? activeKeys.filter((k) => k !== key)
          : [...activeKeys, key];
      }

      // Only update internal state in uncontrolled mode
      if (activeKey === undefined) {
        setInternalActiveKeys(newKeys);
      }
      // Accordion mode reports a single string; multi mode reports an array
      onChange?.(accordion ? newKeys[0] ?? '' : newKeys);
    };

    const childArray = Children.toArray(children);

    return (
      <CollapseContext.Provider
        value={{ activeKeys, toggleKey, accordion, expandIconPosition, bordered, ghost }}
      >
        <div
          ref={ref}
          className={`flex flex-col gap-1 ${className}`}
          style={style}
        >
          {/* Inject index into each Panel child for fallback key generation */}
          {childArray.map((child, index) =>
            isValidElement(child)
              ? cloneElement(child as React.ReactElement<CollapsePanelProps & { index?: number }>, { index })
              : child
          )}
        </div>
      </CollapseContext.Provider>
    );
  }
);
Collapse.displayName = 'Collapse.Modern';

export default Collapse;
