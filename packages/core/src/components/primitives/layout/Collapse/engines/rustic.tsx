'use client';

/**
 * @fileoverview Collapse Rustic Engine - Rottay Design System.
 * Pure inline CSS implementation using React Context for accordion state.
 * Layout-only styles stay in the static `styles` object below; painted
 * chrome (border, background, arrow rotation) lives in
 * `engines/rustic/skin/collapse.css`, keyed on this file's `data-part`
 * anatomy, with CSS custom property fallbacks (e.g., `--ds-collapse-border-
 * color`) for tenant-level overrides.
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

// `context.ghost` has no DOM signal on this engine (see collapse.css's header),
// so the border channel -- the one place ghost actually changes the resolved
// value -- rides this custom property instead of a data-* attribute.
type PanelBorderStyle = React.CSSProperties & Record<'--ds-collapse-panel-border', string>;

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
  // border-radius + rest background live in engines/rustic/skin/collapse.css,
  // keyed on [data-part='panel']. `overflow` stays inline (not a paint channel).
  panel: {
    overflow: 'hidden',
  } as React.CSSProperties,
  panelDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  } as React.CSSProperties,
  // Background lives in the skin (see collapse.css header for why the
  // ghost/bordered branches need no conditional there). Everything else
  // (layout, cursor) stays inline.
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--ds-collapse-header-gap, 8px)',
    padding: 'var(--ds-collapse-header-padding, 12px 16px)',
    cursor: 'pointer',
    userSelect: 'none',
  } as React.CSSProperties,
  headerDisabled: {
    pointerEvents: 'none',
  } as React.CSSProperties,
  // Rotation lives in the skin, keyed on [data-part='arrow'][data-expanded].
  arrow: {
    transition: 'transform var(--ds-motion-normal) var(--ds-motion-ease-out)',
    fontSize: 10,
  } as React.CSSProperties,
  headerContent: {
    flex: 1,
  } as React.CSSProperties,
  // Outer grid-row track (0fr collapsed / 1fr expanded, see contentTrackActive/
  // contentTrackInactive) replaces the previous pixel-bound height technique,
  // which needed an arbitrary upper bound (1000px) and animated a non-linear
  // curve near that bound. The fr-unit track animates uniformly regardless of
  // content height and needs no bound.
  contentTrack: {
    display: 'grid',
    transition: 'grid-template-rows var(--ds-motion-normal) var(--ds-motion-ease-out)',
  } as React.CSSProperties,
  contentTrackActive: {
    gridTemplateRows: '1fr',
  } as React.CSSProperties,
  contentTrackInactive: {
    gridTemplateRows: '0fr',
  } as React.CSSProperties,
  // The inner wrapper needs min-height:0 -- grid items default to
  // min-height:auto, which would floor the track at the content's intrinsic
  // height and prevent it from ever reaching 0fr. Background lives in the
  // skin, keyed on [data-part='content-inner'].
  contentInner: {
    minHeight: 0,
    overflow: 'hidden',
    transition: 'padding var(--ds-motion-normal) var(--ds-motion-ease-out)',
  } as React.CSSProperties,
  contentInnerActive: {
    padding: 'var(--ds-collapse-content-padding, 16px)',
  } as React.CSSProperties,
  contentInnerInactive: {
    padding: '0 16px',
  } as React.CSSProperties,
};

/**
 * The transitions above are inline styles (rustic stays framework-free), so
 * they cannot be reached by a plain CSS class rule for the reduced-motion
 * override. This is the one injected `<style>` block in the file, scoped to
 * two class hooks added purely for this media query.
 */
const RUSTIC_REDUCED_MOTION_STYLES = `
@media (prefers-reduced-motion: reduce){.rottay-collapse-content-track,.rottay-collapse-arrow{transition:none}}
`.trim();

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
 * Reads shared state from CollapseContext. Layout comes from the static
 * `styles` object; border/background/arrow-rotation paint lives in
 * `engines/rustic/skin/collapse.css`, keyed on `data-part`/`data-expanded`/
 * `data-disabled`.
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

    // Rotation on expand lives in engines/rustic/skin/collapse.css, keyed on
    // [data-part='arrow'][data-expanded='true'].
    const arrowIcon = showArrow && (
      <span
        className="rottay-collapse-arrow"
        data-part="arrow"
        style={styles.arrow}
      >
        ▶
      </span>
    );

    return (
      <div
        ref={ref}
        className={className}
        data-part="panel"
        data-expanded={isActive ? 'true' : 'false'}
        data-disabled={disabled ? 'true' : 'false'}
        style={{
          ...styles.panel,
          // Ghost mode strips the border to `none`; radius + background stay
          // fixed regardless (see collapse.css). No DOM signal exists for
          // `ghost` on this engine, so the resolved value rides this custom
          // property -- the skin only supplies its `var()` fallback.
          '--ds-collapse-panel-border': context.ghost
            ? 'none'
            : '1px solid var(--ds-collapse-border-color, var(--ds-color-neutral-300, #d9d9d9))',
          ...(disabled ? styles.panelDisabled : {}),
          ...style,
        } as PanelBorderStyle}
      >
        <div
          style={{
            ...styles.header,
            ...(disabled ? styles.headerDisabled : {}),
          }}
          onClick={handleClick}
          data-part="header"
          data-expanded={isActive ? 'true' : 'false'}
          data-disabled={disabled ? 'true' : 'false'}
        >
          {context.expandIconPosition === 'start' && arrowIcon}
          <span data-part="label" style={styles.headerContent}>{header}</span>
          {extra}
          {context.expandIconPosition === 'end' && arrowIcon}
        </div>
        {/* Content: outer div is the grid-row track, inner div carries
            min-height:0 + the padding fade. See contentTrack/contentInner in
            the styles object above. */}
        <div
          className="rottay-collapse-content-track"
          data-part="content"
          data-expanded={isActive ? 'true' : 'false'}
          style={{
            ...styles.contentTrack,
            ...(isActive ? styles.contentTrackActive : styles.contentTrackInactive),
          }}
        >
          <div
            data-part="content-inner"
            data-expanded={isActive ? 'true' : 'false'}
            style={{
              ...styles.contentInner,
              ...(isActive ? styles.contentInnerActive : styles.contentInnerInactive),
            }}
          >
            {children}
          </div>
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
        {/* Inject the reduced-motion override -- safe static string */}
        <style dangerouslySetInnerHTML={{ __html: RUSTIC_REDUCED_MOTION_STYLES }} />
        <div
          ref={ref}
          className={`rottay-collapse-shell rottay-collapse-shell--rustic ${className ?? ''}`.trim()}
          data-part="root"
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
