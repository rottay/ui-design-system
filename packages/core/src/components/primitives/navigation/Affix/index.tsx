/**
 * @fileoverview Affix Component - Rottay Design System
 * @description A sticky positioning component that fixes elements to the viewport when scrolling.
 * Part of the Rottay Design System's navigation primitives collection.
 *
 * @remarks
 * The Affix component is built on Rottay's multi-engine architecture, allowing
 * seamless rendering across Titan (Ant Design), Hermes (DaisyUI), and Apollo
 * (Vanilla) engines. This ensures consistent behavior while adapting to your
 * project's styling framework.
 *
 * Multi-tenant theming is fully supported - affix styling automatically adapts
 * to your tenant's brand colors, spacing, and typography tokens.
 *
 * @example Basic Usage - Sticky Header
 * ```tsx
 * import { Affix } from '@rottay/design-system';
 *
 * function StickyHeader() {
 *   return (
 *     <Affix offsetTop={0}>
 *       <header className="header">
 *         <nav>Navigation Menu</nav>
 *       </header>
 *     </Affix>
 *   );
 * }
 * ```
 *
 * @example Sticky Sidebar Navigation
 * ```tsx
 * import { Affix } from '@rottay/design-system';
 *
 * function SidebarNav() {
 *   return (
 *     <aside className="sidebar">
 *       <Affix offsetTop={80}>
 *         <nav>
 *           <ul>
 *             <li>Section 1</li>
 *             <li>Section 2</li>
 *             <li>Section 3</li>
 *           </ul>
 *         </nav>
 *       </Affix>
 *     </aside>
 *   );
 * }
 * ```
 *
 * @example With onChange Callback
 * ```tsx
 * import { Affix, Button } from '@rottay/design-system';
 *
 * function StickyToolbar() {
 *   const [isSticky, setIsSticky] = useState(false);
 *
 *   return (
 *     <Affix offsetTop={0} onChange={(affixed) => setIsSticky(affixed)}>
 *       <div className={`toolbar ${isSticky ? 'toolbar--sticky' : ''}`}>
 *         <Button>Action 1</Button>
 *         <Button>Action 2</Button>
 *       </div>
 *     </Affix>
 *   );
 * }
 * ```
 *
 * @example Bottom Affix - Fixed Footer
 * ```tsx
 * import { Affix } from '@rottay/design-system';
 *
 * function StickyFooter() {
 *   return (
 *     <Affix offsetBottom={0}>
 *       <footer className="footer">
 *         <p>Copyright 2025 - All rights reserved</p>
 *       </footer>
 *     </Affix>
 *   );
 * }
 * ```
 *
 * @example Custom Scroll Container
 * ```tsx
 * import { Affix } from '@rottay/design-system';
 *
 * function ScrollablePanel() {
 *   const containerRef = useRef<HTMLDivElement>(null);
 *
 *   return (
 *     <div ref={containerRef} className="scroll-container">
 *       <Affix offsetTop={0} target={() => containerRef.current}>
 *         <div className="sticky-header">Panel Header</div>
 *       </Affix>
 *       <div className="content">Scrollable content...</div>
 *     </div>
 *   );
 * }
 * ```
 *
 * @example Multi-Tenant Theming
 * ```tsx
 * // Affix automatically inherits tenant theme
 * <ThemeProvider tenant="acme-corp">
 *   <Affix offsetTop={0}>
 *     {/* Uses ACME Corp's brand colors and styling *\/}
 *     <header>Themed Header</header>
 *   </Affix>
 * </ThemeProvider>
 * ```
 *
 * @example Engine Override
 * ```tsx
 * // Force a specific rendering engine
 * <Affix engine="hermes" offsetTop={20}>
 *   {/* Renders with DaisyUI/Tailwind styling *\/}
 *   <nav>Navigation</nav>
 * </Affix>
 * ```
 *
 * @see {@link AffixProps} for complete prop documentation
 * @see {@link AffixState} for internal state interface
 * @see {@link AFFIX_DEFAULTS} for default prop values
 *
 * @module Affix
 * @category Navigation
 * @package @rottay/design-system
 */

import { createEngineComponent } from '../../../../core/engines/factory';
import type { AffixProps } from './types';

// ============================================================================
// Type Exports
// ============================================================================

export type { AffixProps, AffixState } from './types';
export { AFFIX_DEFAULTS } from './types';

// ============================================================================
// Base Component Export
// ============================================================================

import React, { forwardRef } from 'react';

/**
 * BaseAffix - A simple sticky positioning component.
 *
 * @description
 * Base implementation of the Affix component using CSS sticky positioning.
 * Can be used directly or extended for custom implementations.
 *
 * @example
 * ```tsx
 * import { BaseAffix } from '@rottay/design-system';
 *
 * <BaseAffix offsetTop={0}>
 *   <header>Sticky Header</header>
 * </BaseAffix>
 * ```
 */
export const BaseAffix = forwardRef<HTMLDivElement, AffixProps>(
  (props, ref) => {
    const {
      offsetTop = 0,
      offsetBottom,
      children,
      className = '',
      style = {},
      zIndex = 10,
    } = props;

    const stickyStyle: React.CSSProperties = {
      position: 'sticky',
      zIndex,
      ...(offsetBottom !== undefined
        ? { bottom: offsetBottom }
        : { top: offsetTop }
      ),
      ...style,
    };

    return (
      <div
        ref={ref}
        className={`rottay-affix ${className}`}
        style={stickyStyle}
      >
        {children}
      </div>
    );
  }
);

BaseAffix.displayName = 'BaseAffix';

// ============================================================================
// Main Component
// ============================================================================

/**
 * Affix component with multi-engine support for sticky positioning.
 *
 * @description
 * A positioning component that makes elements stick to the viewport when scrolling.
 * Ideal for:
 * - Sticky headers and navigation bars
 * - Fixed sidebars and table of contents
 * - Floating action buttons and toolbars
 * - Bottom action bars and footers
 * - Scroll-aware UI elements
 *
 * @remarks
 * - Supports both top and bottom offset positioning
 * - Provides onChange callback for detecting affix state changes
 * - Allows custom scroll container targets
 * - Uses CSS sticky positioning with JavaScript fallback
 * - Automatically handles viewport resize
 * - Adapts to tenant theming automatically
 *
 * @param props - {@link AffixProps}
 * @returns React component that sticks to viewport when scrolling
 *
 * @example
 * ```tsx
 * <Affix offsetTop={64} onChange={(affixed) => console.log(affixed)}>
 *   <nav className="main-nav">Navigation Content</nav>
 * </Affix>
 * ```
 */
export const Affix = createEngineComponent<AffixProps>('Affix', {
  /** Ant Design implementation - full-featured with native Affix support */
  titan: () => import('./engines/titan'),
  /** DaisyUI/Tailwind implementation - utility-first styling */
  hermes: () => import('./engines/hermes'),
  /** Vanilla HTML/CSS implementation - zero dependencies */
  apollo: () => import('./engines/apollo'),
});

export default Affix;
