'use client';

/**
 * @fileoverview Collapse Modern Engine - Rottay Design System.
 * Token-driven implementation using React Context for shared accordion
 * state between Collapse and Panel. No DaisyUI classes -- paint lives in
 * the modern skin (`collapse.css`); the engine keeps layout/token-channel
 * inline styles and a <style> block for the expand/collapse transition.
 *
 * Contract coverage (K3-C pass 1):
 * - `size` (`sm|md|lg`, legacy `small|middle|large` aliases) is normalized
 *   and stamped as `data-size` on the root; the skin owns the per-size
 *   header/content padding rhythm.
 * - `collapsible` (`header|icon|disabled`) gates the toggle affordance:
 *   `disabled` makes every header inert, `icon` moves the toggle role to
 *   the arrow alone.
 * - Headers are real keyboard controls: `role="button"`, `tabIndex`,
 *   Enter/Space toggle, `aria-expanded` + `aria-disabled`.
 *
 * Phase-B second pass:
 * - Header/content TYPOGRAPHY moved out of the inline styles into the skin
 *   (semantic font channels; the engine keeps zero paint).
 * - A collapsed panel's content is `aria-hidden` + `inert`: the grid 0fr
 *   track already hides it visually, and now it also leaves the tab order
 *   and the accessibility tree (focus can no longer land on invisible
 *   descendants).
 *
 * Phase-B second pass 2 (P2-18):
 * - The chevron renders with `mirrored={false}`: the semantic-icon facade
 *   auto-mirrors `NavigationForwardIcon` under RTL, which double-mirrored
 *   the skin's own RTL flip (and pointed the expanded 90-degree turn UP in
 *   RTL). The skin's `:dir(rtl)` rule is now the single mirror owner (Tree
 *   precedent).
 * - In `collapsible='icon'` mode the arrow IS the toggle button but had no
 *   accessible name (decorative glyph only): it now takes one from the
 *   header label via `aria-labelledby`.
 * - Disabled opacity/cursor and the header cursor policy/user-select moved
 *   from inline styles to the skin (keyed on data-disabled/data-collapsible);
 *   inline style is reserved for instance geometry (the 0fr/1fr track).
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
import React, { useState, createContext, useContext, Children, cloneElement, isValidElement, useId } from 'react';
import type { CollapseProps, CollapsePanelProps } from '../../contracts';
import { COLLAPSE_DEFAULTS } from '../../contracts';
import { NavigationForwardIcon } from '@/graphics/icons/presentation/semantic/generated/roles/navigation-forward';

/**
 * Collapse expand/collapse transition, expressed on `grid-template-rows`
 * (0fr -> 1fr). The previous pixel-bound-height technique required an
 * arbitrary upper bound and animated a non-linear timing curve near that
 * bound (most of the transition duration spent animating pixels the content
 * never reaches); the fr-unit track animates uniformly regardless of content
 * height and needs no bound. The `.rottay-collapse-content` element is the
 * grid row track; its `.rottay-collapse-content-inner` child needs
 * `min-height:0` because grid items default to `min-height:auto`, which
 * would keep the inner content's intrinsic height as a floor and prevent the
 * track from ever reaching 0fr.
 */
const COLLAPSE_STYLES = `
.rottay-collapse-content{display:grid;transition:grid-template-rows var(--ds-collapse-transition-duration,var(--ds-motion-normal)) var(--ds-collapse-transition-timing,var(--ds-motion-ease-out))}
.rottay-collapse-content-inner{min-height:0;overflow:hidden;transition:opacity var(--ds-collapse-transition-duration,var(--ds-motion-normal)) var(--ds-collapse-transition-timing,var(--ds-motion-ease-out)),padding var(--ds-collapse-transition-duration,var(--ds-motion-normal)) var(--ds-collapse-transition-timing,var(--ds-motion-ease-out))}
.rottay-collapse-arrow{display:inline-block;transition:var(--ds-collapse-icon-default-idle-transition,transform var(--ds-motion-normal) var(--ds-motion-ease-out))}
@media (prefers-reduced-motion: reduce){.rottay-collapse-content,.rottay-collapse-content-inner,.rottay-collapse-arrow{transition:none}}
`.trim();

/** Shared state between Collapse and its Panel children via React Context */
interface CollapseContextValue {
  activeKeys: string[];
  toggleKey: (key: string) => void;
  accordion: boolean;
  expandIconPosition: 'start' | 'end';
  bordered: boolean;
  ghost: boolean;
  collapsible: 'header' | 'icon' | 'disabled' | undefined;
}

const CollapseContext = createContext<CollapseContextValue | null>(null);

/** Normalize the canonical `sm|md|lg` scale plus the legacy antd aliases. */
export function normalizeCollapseSize(
  size: CollapseProps['size']
): 'sm' | 'md' | 'lg' {
  switch (size) {
    case 'sm':
    case 'small':
      return 'sm';
    case 'lg':
    case 'large':
      return 'lg';
    default:
      return 'md';
  }
}

/**
 * Modern Collapse Panel.
 *
 * Reads shared state from CollapseContext to determine active/inactive status.
 * Uses inline styles with DS tokens and a CSS transition class for smooth
 * expand/collapse animations. The `index` prop is injected by the parent
 * Collapse via `cloneElement` to generate fallback keys.
 *
 * @param props - {@link CollapsePanelProps} with an optional injected `index`.
 * @returns A styled collapsible panel, or null if rendered outside a Collapse.
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
    const reactId = useId();
    if (!context) return null;

    // Use explicit panelKey when provided, otherwise derive from render index
    const key = panelKey ?? `panel-${index}`;
    const isActive = context.activeKeys.includes(key);
    // APG accordion: the toggle points at the region it controls.
    const contentId = `collapse-content-${reactId.replace(/:/g, '')}`;
    // The header label's id doubles as the accessible-name source for the
    // arrow when `collapsible='icon'` makes the arrow the toggle button.
    const labelId = `collapse-label-${reactId.replace(/:/g, '')}`;

    // `collapsible='disabled'` renders every header inert; a disabled panel is
    // inert on its own. `collapsible='icon'` moves the toggle affordance to
    // the arrow alone (the header keeps no button role in that mode).
    const inert = disabled || context.collapsible === 'disabled';
    const iconOnly = context.collapsible === 'icon';

    const handleClick = () => {
      if (!inert && !iconOnly) {
        context.toggleKey(key);
      }
    };

    const handleKeyDown = (event: React.KeyboardEvent) => {
      if (inert || iconOnly) return;
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        context.toggleKey(key);
      }
    };

    const handleArrowClick = (event: React.MouseEvent) => {
      if (!iconOnly || inert) return;
      event.stopPropagation();
      context.toggleKey(key);
    };

    const handleArrowKeyDown = (event: React.KeyboardEvent) => {
      if (!iconOnly || inert) return;
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        event.stopPropagation();
        context.toggleKey(key);
      }
    };

    // Arrow indicator rotates 90deg when panel is expanded (skin-owned). In
    // `collapsible='icon'` mode the arrow IS the toggle control, so it carries
    // the button role + expanded state AND takes its accessible name from the
    // header label (aria-labelledby -- the glyph alone is decorative, so the
    // button would otherwise have no name); otherwise it is decorative and
    // the header owns the toggle semantics. The glyph is the governed
    // semantic forward chevron (no unicode arrows). `mirrored={false}` opts
    // out of the icon facade's RTL auto-mirror: the skin's `:dir(rtl)` flip
    // is the single mirror owner, and the 90deg expansion turn must rotate a
    // right-pointing glyph to land pointing down in BOTH directions (Tree
    // precedent; the facade's mirror made it point up in RTL).
    const arrowIcon = showArrow && (
      <span
        className="rottay-collapse-arrow"
        data-part="arrow"
        data-expanded={isActive ? 'true' : 'false'}
        aria-hidden={iconOnly && !inert ? undefined : true}
        {...(iconOnly && !inert
          ? {
              role: 'button',
              tabIndex: 0,
              'aria-expanded': isActive,
              'aria-controls': contentId,
              'aria-labelledby': labelId,
              onClick: handleArrowClick,
              onKeyDown: handleArrowKeyDown,
            }
          : {})}
      >
        <NavigationForwardIcon decorative mirrored={false} size={12} />
      </span>
    );

    return (
      <div
        ref={ref}
        className={className || undefined}
        data-part="panel"
        data-expanded={isActive ? 'true' : 'false'}
        data-disabled={disabled ? 'true' : 'false'}
        style={style}
      >
        {/* Header row: the TOGGLE (data-part='header', role=button) and the
            extra actions slot are SIBLINGS inside a plain layout row — an
            interactive extra must never nest inside the button (axe
            nested-interactive; K3-C pass-2 remediation). Padding rhythm is
            skin-owned on the row (collapse.css, keyed on data-size/--ghost);
            paint never lives here. */}
        <div
          data-part="header-row"
          style={{ display: 'flex', alignItems: 'center' }}
        >
          <div
            style={{
              flex: '1 1 auto',
              minWidth: 0,
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--ds-collapse-header-gap, var(--ds-spacing-2))',
            }}
            onClick={handleClick}
            {...(iconOnly
              ? {}
              : {
                  role: 'button',
                  tabIndex: inert ? -1 : 0,
                  'aria-expanded': isActive,
                  'aria-controls': contentId,
                  'aria-disabled': inert ? true : undefined,
                  onKeyDown: handleKeyDown,
                })}
            data-part="header"
            data-expanded={isActive ? 'true' : 'false'}
            data-disabled={disabled ? 'true' : 'false'}
            data-collapsible={context.collapsible ?? 'header'}
          >
            {context.expandIconPosition === 'start' && arrowIcon}
            <span data-part="label" id={labelId} style={{ flex: 1 }}>{header}</span>
            {context.expandIconPosition === 'end' && arrowIcon}
          </div>
          {extra && <span data-part="extra">{extra}</span>}
        </div>
        {/* Content area: the outer element is the grid-template-rows track
            (0fr collapsed / 1fr expanded); the inner element carries
            min-height:0 (see COLLAPSE_STYLES) plus the opacity/padding fade
            so the whole reveal reads as one motion. While collapsed the
            region is also aria-hidden + inert: invisible content must leave
            the tab order and the accessibility tree, not just the viewport. */}
        <div
          className="rottay-collapse-content"
          data-part="content"
          data-expanded={isActive ? 'true' : 'false'}
          id={contentId}
          aria-hidden={isActive ? undefined : true}
          inert={isActive ? undefined : true}
          style={{
            gridTemplateRows: isActive ? '1fr' : '0fr',
          }}
        >
          <div
            className="rottay-collapse-content-inner"
            data-part="content-inner"
            data-expanded={isActive ? 'true' : 'false'}
            style={{
              opacity: isActive ? 1 : 0,
            }}
          >
            {children}
          </div>
        </div>
      </div>
    );
  }
);
Panel.displayName = 'Collapse.Panel.Modern';

/**
 * Modern Collapse container.
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
      collapsible,
      size = COLLAPSE_DEFAULTS.size,
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
        value={{ activeKeys, toggleKey, accordion, expandIconPosition, bordered, ghost, collapsible }}
      >
        {/* Inject transition styles -- safe static string */}
        <style dangerouslySetInnerHTML={{ __html: COLLAPSE_STYLES }} />
        <div
          ref={ref}
          className={`rottay-collapse${ghost ? ' rottay-collapse--ghost' : ''}${!bordered ? ' rottay-collapse--borderless' : ''} ${className}`.trim() || undefined}
          data-part="root"
          data-size={normalizeCollapseSize(size)}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--ds-spacing-1)',
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
Collapse.displayName = 'Collapse.Modern';

export default Collapse;
