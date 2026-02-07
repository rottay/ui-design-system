'use client';

/**
 * @fileoverview Collapse Rustic Engine - Rottay Design System
 * @description Rustic (Pure HTML/CSS) implementation of the Collapse compound component.
 * Uses inline CSS styles with React Context for state management.
 *
 * @remarks
 * The Rustic engine provides:
 * - Pure inline CSS with flexbox layout
 * - React Context for sharing state between Collapse and Panel
 * - Custom accordion logic with controlled/uncontrolled support
 * - CSS transitions for smooth expand/collapse (max-height animation)
 * - Ghost mode support with transparent backgrounds
 *
 * Implementation details:
 * - Uses CollapseContext to share activeKeys and toggleKey
 * - Panels have header with fafafa background, content with white
 * - Arrow icon uses transform: rotate(90deg) when active
 * - Content uses max-height transition for smooth animations
 *
 * This implementation is ideal for:
 * - Embedded applications without CSS framework dependencies
 * - Server-side rendering without CSS extraction
 * - Maximum browser compatibility scenarios
 *
 * @example Using Rustic Engine
 * ```tsx
 * import { Collapse } from '@rottay/design-system';
 *
 * // Pure inline CSS collapse
 * <Collapse engine="rustic" ghost>
 *   <Collapse.Panel engine="rustic" header="Section 1" panelKey="1">
 *     Self-contained styling
 *   </Collapse.Panel>
 * </Collapse>
 * ```
 *
 * @see {@link Collapse} - The main engine-aware component
 * @module Collapse/Engines/Rustic
 * @category Layout
 * @package @rottay/design-system
 */
import React, { useState, createContext, useContext, Children, cloneElement, isValidElement } from 'react';
import type { CollapseProps, CollapsePanelProps } from '../../types';
import { COLLAPSE_DEFAULTS } from '../../types';

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--ds-collapse-gap, 1px)',
  } as React.CSSProperties,
  panel: {
    border: '1px solid var(--ds-collapse-border-color, var(--ds-color-neutral-300, #d9d9d9))',
    borderRadius: 'var(--ds-collapse-radius, 4px)',
    overflow: 'hidden',
  } as React.CSSProperties,
  panelGhost: {
    border: 'none',
    backgroundColor: 'transparent',
  } as React.CSSProperties,
  panelDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  } as React.CSSProperties,
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--ds-collapse-header-gap, 8px)',
    padding: 'var(--ds-collapse-header-padding, 12px 16px)',
    backgroundColor: 'var(--ds-collapse-header-bg, var(--ds-color-neutral-50, #fafafa))',
    cursor: 'pointer',
    userSelect: 'none',
  } as React.CSSProperties,
  headerDisabled: {
    pointerEvents: 'none',
  } as React.CSSProperties,
  arrow: {
    transition: 'transform 0.2s',
    fontSize: 10,
  } as React.CSSProperties,
  arrowActive: {
    transform: 'rotate(90deg)',
  } as React.CSSProperties,
  headerContent: {
    flex: 1,
  } as React.CSSProperties,
  content: {
    overflow: 'hidden',
    transition: 'max-height 0.2s, padding 0.2s',
    backgroundColor: 'var(--ds-collapse-content-bg, #fff)',
  } as React.CSSProperties,
  contentActive: {
    maxHeight: 1000,
    padding: 'var(--ds-collapse-content-padding, 16px)',
  } as React.CSSProperties,
  contentInactive: {
    maxHeight: 0,
    padding: '0 16px',
  } as React.CSSProperties,
};

interface CollapseContextValue {
  activeKeys: string[];
  toggleKey: (key: string) => void;
  accordion: boolean;
  expandIconPosition: 'start' | 'end';
  bordered: boolean;
  ghost: boolean;
}

const CollapseContext = createContext<CollapseContextValue | null>(null);

export const Panel = React.forwardRef<HTMLDivElement, CollapsePanelProps & { index?: number }>(
  (props, ref) => {
    const {
      panelKey,
      header,
      disabled = false,
      showArrow = true,
      extra,
      children,
      className,
      style,
      index = 0,
    } = props;

    const context = useContext(CollapseContext);
    if (!context) return null;

    const key = panelKey ?? `panel-${index}`;
    const isActive = context.activeKeys.includes(key);

    const handleClick = () => {
      if (!disabled) {
        context.toggleKey(key);
      }
    };

    const arrowIcon = showArrow && (
      <span
        style={{
          ...styles.arrow,
          ...(isActive ? styles.arrowActive : {}),
        }}
      >
        ▶
      </span>
    );

    return (
      <div
        ref={ref}
        className={className}
        style={{
          ...styles.panel,
          ...(context.ghost ? styles.panelGhost : {}),
          ...(disabled ? styles.panelDisabled : {}),
          ...style,
        }}
      >
        <div
          style={{
            ...styles.header,
            ...(disabled ? styles.headerDisabled : {}),
          }}
          onClick={handleClick}
        >
          {context.expandIconPosition === 'start' && arrowIcon}
          <span style={styles.headerContent}>{header}</span>
          {extra}
          {context.expandIconPosition === 'end' && arrowIcon}
        </div>
        <div
          style={{
            ...styles.content,
            ...(isActive ? styles.contentActive : styles.contentInactive),
          }}
        >
          {children}
        </div>
      </div>
    );
  }
);
Panel.displayName = 'Collapse.Panel.Rustic';

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
      className,
      style,
    } = props;

    const normalizeKeys = (keys: string | string[] | undefined): string[] => {
      if (!keys) return [];
      return Array.isArray(keys) ? keys : [keys];
    };

    const [internalActiveKeys, setInternalActiveKeys] = useState<string[]>(
      normalizeKeys(defaultActiveKey)
    );

    const activeKeys = activeKey !== undefined ? normalizeKeys(activeKey) : internalActiveKeys;

    const toggleKey = (key: string) => {
      let newKeys: string[];

      if (accordion) {
        newKeys = activeKeys.includes(key) ? [] : [key];
      } else {
        newKeys = activeKeys.includes(key)
          ? activeKeys.filter((k) => k !== key)
          : [...activeKeys, key];
      }

      if (activeKey === undefined) {
        setInternalActiveKeys(newKeys);
      }
      onChange?.(accordion ? newKeys[0] ?? '' : newKeys);
    };

    const childArray = Children.toArray(children);

    return (
      <CollapseContext.Provider
        value={{ activeKeys, toggleKey, accordion, expandIconPosition, bordered, ghost }}
      >
        <div
          ref={ref}
          className={className}
          style={{
            ...styles.container,
            ...style,
          }}
        >
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
Collapse.displayName = 'Collapse.Rustic';

export default Collapse;
