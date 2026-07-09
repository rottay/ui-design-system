'use client';

/**
 * @fileoverview Collapse Rustic Engine - Rottay Design System.
 * Pure inline CSS implementation using React Context for accordion state.
 * All styles are defined in a static `styles` object with CSS custom property
 * fallbacks (e.g., `--ds-collapse-border-color`), making it embeddable in
 * third-party apps without CSS framework dependencies.
 *
 * @example
 * ```tsx
 * <Collapse engine="rustic" ghost>
 *   <Collapse.Panel engine="rustic" header="Section 1" panelKey="1">
 *     Self-contained inline styling, zero external CSS
 *   </Collapse.Panel>
 * </Collapse>
 * ```
 *
 * @module Collapse/Engines/Rustic
 * @category Layout
 * @package @rottay/design-system
 */
import React, { useState, createContext, useContext, Children, cloneElement, isValidElement } from 'react';
import type { CollapseProps, CollapsePanelProps } from '../Collapse.types';
import { COLLAPSE_DEFAULTS } from '../Collapse.types';

/**
 * Static style objects used throughout the Rustic Collapse.
 * CSS custom properties (--ds-collapse-*) provide tenant-level overrides
 * while the hardcoded fallback values ensure sensible defaults.
 */
const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--ds-collapse-gap, 1px)',
  } as React.CSSProperties,
  panel: {
    border: '1px solid var(--ds-collapse-border-color, var(--ds-color-neutral-300, #d9d9d9))',
    borderRadius: 'var(--ds-collapse-radius, 12px)',
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
  // maxHeight of 1000px is an arbitrary upper bound for the transition;
  // actual content will scroll if it exceeds this value
  contentActive: {
    maxHeight: 1000,
    padding: 'var(--ds-collapse-content-padding, 16px)',
  } as React.CSSProperties,
  contentInactive: {
    maxHeight: 0,
    padding: '0 16px',
  } as React.CSSProperties,
};

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
 * Rustic (vanilla CSS) Collapse Panel.
 *
 * Reads shared state from CollapseContext. All visual styles are composed
 * from the static `styles` object by merging ghost/disabled/active overrides.
 * Arrow rotation uses an inline `transform` transition.
 *
 * @param props - {@link CollapsePanelProps} with an optional injected `index`.
 * @returns A self-styled collapsible panel, or null if rendered outside a Collapse.
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

    // Arrow rotates 90deg when expanded via inline transform style
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
          // Ghost mode strips border and background for a minimal look
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
        {/* Content animated via max-height transition between 0 and 1000px */}
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

/**
 * Rustic (vanilla CSS) Collapse container.
 *
 * Manages controlled/uncontrolled accordion state and distributes it to
 * Panel children via CollapseContext. The container uses `styles.container`
 * (flexbox column with a 1px gap) as its base layout.
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
      className,
      style,
    } = props;

    // Normalize keys to a consistent array format
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
          className={className}
          style={{
            ...styles.container,
            ...style,
          }}
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
Collapse.displayName = 'Collapse.Rustic';

export default Collapse;
