'use client';

/**
 * @fileoverview Layout Modern Engine - Rottay Design System
 * @description Modern (token-driven) implementation of the Layout compound component.
 * Uses Tailwind CSS utility classes for styling with DS token theme integration.
 *
 * @remarks
 * The Modern engine stamps anatomy (class pairs + data parts); the modern
 * skin (`layout.css`) owns structure and paint:
 * - flex column with full-viewport min block size for the main layout
 * - row direction at the `md` breakpoint when hasSider is true
 * - `var(--ds-surface-inset)` for header/footer backgrounds
 * - `var(--ds-surface-card)` or `var(--ds-surface-panel)` for sider based on theme
 * - Custom collapsible sidebar with controlled/uncontrolled state
 *
 * @example Using Modern Engine
 * ```tsx
 * import { Layout } from '@rottay/design-system';
 *
 * // Tailwind-styled layout
 * <Layout engine="modern" hasSider>
 *   <Layout.Sider engine="modern" theme="dark" collapsible>
 *     Navigation
 *   </Layout.Sider>
 *   <Layout>
 *     <Layout.Header engine="modern">Header</Layout.Header>
 *     <Layout.Content engine="modern">Content</Layout.Content>
 *   </Layout>
 * </Layout>
 * ```
 *
 * @see {@link Layout} - The main engine-aware component
 * @module Layout/Engines/Modern
 * @category Layout
 * @package @rottay/design-system
 */
import React, { useEffect, useState } from 'react';
import type {
  LayoutProps,
  LayoutHeaderProps,
  LayoutSiderProps,
  LayoutContentProps,
  LayoutFooterProps,
} from '../../contracts';
import { LAYOUT_DEFAULTS } from '../../contracts';
import { useOptionalTranslation } from '@/infrastructure/runtime/i18n';
import { NavigationBackIcon } from '@/graphics/icons/presentation/semantic/generated/roles/navigation-back';
import { NavigationForwardIcon } from '@/graphics/icons/presentation/semantic/generated/roles/navigation-forward';

/**
 * Viewport widths for the sider `breakpoint` contract prop, in the canonical
 * Ant-parity ladder the contract's names come from (the Classic engine
 * defers to Ant's own Sider for the same values). Used only by the modern
 * engine's auto-collapse listener.
 */
const SIDER_BREAKPOINT_WIDTHS: Record<string, number> = {
  xs: 480,
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200,
  xxl: 1600,
};

/**
 * Modern Layout shell.
 *
 * Structure (flex direction, min block size, responsive row with sider) is
 * skin-owned (`layout.css`), keyed on the class pair + `data-has-sider` --
 * the engine stamps anatomy only. Historically these were Tailwind
 * utilities (`flex flex-col min-h-screen`, `md:flex-row`); K3-C drained
 * them so the skin is the single owner of the shell's structure.
 *
 * @param props - Layout container props (hasSider, className, style).
 * @returns A ref-forwarding div stamped with the layout anatomy.
 */
export const Layout = React.forwardRef<HTMLDivElement, LayoutProps>(
  (props, ref) => {
    const { hasSider, children, className = '', style } = props;
    return (
      <div
        ref={ref}
        className={`rottay-layout rottay-layout--modern ${className}`}
        style={style}
        data-part="root"
        data-has-sider={hasSider ? 'true' : 'false'}
      >
        {children}
      </div>
    );
  }
);
Layout.displayName = 'Layout.Modern';

/**
 * Modern Header. Alignment and padding rhythm are skin-owned (`layout.css`);
 * height stays inline to support both pixel and string values.
 *
 * @param props - Header props (height, className, style).
 * @returns A ref-forwarding semantic `<header>` element.
 */
export const Header = React.forwardRef<HTMLElement, LayoutHeaderProps>(
  (props, ref) => {
    const { height = LAYOUT_DEFAULTS.headerHeight, children, className = '', style } = props;
    return (
      <header
        ref={ref}
        className={`rottay-layout-header rottay-layout-header--modern ${className}`}
        style={{ height: typeof height === 'number' ? `${height}px` : height, ...style }}
        data-part="header"
      >
        {children}
      </header>
    );
  }
);
Header.displayName = 'Layout.Header.Modern';

/**
 * Modern Sider with controlled/uncontrolled collapse support.
 *
 * Uses DS token styles (`--ds-surface-panel` for dark, `--ds-surface-card` for light)
 * and a CSS width transition for smooth collapse animation. Supports both
 * controlled (`collapsed` prop) and uncontrolled (`defaultCollapsed`) modes
 * following React's standard controlled-component pattern.
 *
 * @param props - Sider props (width, collapsible, collapsed, theme, etc.)
 * @returns A ref-forwarding semantic `<aside>` element.
 */
export const Sider = React.forwardRef<HTMLElement, LayoutSiderProps>(
  (props, ref) => {
    const {
      width = LAYOUT_DEFAULTS.siderWidth,
      collapsedWidth = LAYOUT_DEFAULTS.siderCollapsedWidth,
      collapsed: controlledCollapsed,
      defaultCollapsed = false,
      collapsible = false,
      breakpoint,
      onCollapse,
      trigger,
      theme = 'light',
      children,
      className = '',
      style,
    } = props;

    // Internal state for uncontrolled mode; ignored when `collapsed` is provided
    const [internalCollapsed, setInternalCollapsed] = useState(defaultCollapsed);
    // Controlled prop takes priority over internal state
    const isCollapsed = controlledCollapsed ?? internalCollapsed;

    // Contract `breakpoint`: auto-collapse when the viewport shrinks past the
    // named ladder rung (crossing only -- never auto-expands, and the initial
    // match collapses silently without firing onCollapse, Ant parity).
    useEffect(() => {
      if (!breakpoint || typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
        return undefined;
      }
      const px = SIDER_BREAKPOINT_WIDTHS[breakpoint];
      if (!px) return undefined;
      const mq = window.matchMedia(`(max-width: ${px - 0.02}px)`);
      let wasMatching = mq.matches;
      if (wasMatching && controlledCollapsed === undefined) {
        setInternalCollapsed(true);
      }
      const handleChange = () => {
        if (mq.matches && !wasMatching) {
          wasMatching = true;
          if (controlledCollapsed === undefined) {
            setInternalCollapsed(true);
          }
          onCollapse?.(true);
        } else if (!mq.matches) {
          wasMatching = false;
        }
      };
      mq.addEventListener('change', handleChange);
      return () => mq.removeEventListener('change', handleChange);
    }, [breakpoint, controlledCollapsed, onCollapse]);

    /* Localized trigger name (components catalog, English floor; the catalog
       keys are a pending coordinator request — the tOr fallback is the
       documented floor until they land). */
    const translation = useOptionalTranslation('components');

    const handleToggle = () => {
      const newCollapsed = !isCollapsed;
      // Only update internal state in uncontrolled mode
      if (controlledCollapsed === undefined) {
        setInternalCollapsed(newCollapsed);
      }
      onCollapse?.(newCollapsed);
    };

    const currentWidth = isCollapsed ? collapsedWidth : width;
    // DS tokens: surface-panel for dark sidebar, surface-card for light.
    // Width stays inline (runtime value); shrink/overflow/collapse transition
    // and the trigger chrome are skin-owned (`layout.css`).
    const collapseLabel = translation?.tOr('layout.collapse_sidebar', 'Collapse sidebar') ?? 'Collapse sidebar';
    const expandLabel = translation?.tOr('layout.expand_sidebar', 'Expand sidebar') ?? 'Expand sidebar';
    return (
      <aside
        ref={ref}
        className={`rottay-layout-sider rottay-layout-sider--modern ${className}`}
        style={{
          width: typeof currentWidth === 'number' ? `${currentWidth}px` : currentWidth,
          ...style,
        }}
        data-part="sider"
        data-theme={theme}
        data-collapsed={isCollapsed ? 'true' : 'false'}
      >
        {children}
        {collapsible && (
          <button
            type="button"
            onClick={handleToggle}
            data-part="trigger"
            data-collapsed={isCollapsed ? 'true' : 'false'}
            aria-label={isCollapsed ? expandLabel : collapseLabel}
            aria-expanded={!isCollapsed}
          >
            {trigger ?? (
              /* Governed semantic icons (pre-flag 11: no unicode glyphs). The
                 directional meaning mirrors in RTL via the skin's `[dir='rtl']`
                 rule on this part: back = collapse toward the sider edge,
                 forward = expand away from it. */
              <span data-part="trigger-icon" aria-hidden="true">
                {isCollapsed ? (
                  <NavigationForwardIcon decorative size={14} />
                ) : (
                  <NavigationBackIcon decorative size={14} />
                )}
              </span>
            )}
          </button>
        )}
      </aside>
    );
  }
);
Sider.displayName = 'Layout.Sider.Modern';

/**
 * Modern Content area -- a flex-growing `<main>`. Growth, padding rhythm and
 * scroll behavior are skin-owned (`layout.css`); the engine stamps anatomy
 * only. `rottay-layout-content--modern` was minted in K3-C so the skin can
 * address this engine's content without touching rustic's.
 *
 * @param props - Content props (className, style).
 * @returns A ref-forwarding semantic `<main>` element.
 */
export const Content = React.forwardRef<HTMLElement, LayoutContentProps>(
  (props, ref) => {
    const { children, className = '', style } = props;
    return (
      <main ref={ref} className={`rottay-layout-content rottay-layout-content--modern ${className}`} style={style} data-part="content">
        {children}
      </main>
    );
  }
);
Content.displayName = 'Layout.Content.Modern';

/**
 * Modern Footer using DS token surface-inset background.
 * Shrink-proof so it stays at its natural height even in flex overflow;
 * padding rhythm and shrink behavior are skin-owned (`layout.css`).
 *
 * @param props - Footer props (className, style).
 * @returns A ref-forwarding semantic `<footer>` element.
 */
export const Footer = React.forwardRef<HTMLElement, LayoutFooterProps>(
  (props, ref) => {
    const { children, className = '', style } = props;
    return (
      <footer ref={ref} className={`rottay-layout-footer rottay-layout-footer--modern ${className}`} style={style} data-part="footer">
        {children}
      </footer>
    );
  }
);
Footer.displayName = 'Layout.Footer.Modern';

export default Layout;
