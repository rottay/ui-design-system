'use client';

/**
 * @fileoverview Drawer Modern Engine - Rottay Design System
 * @description DaisyUI/Tailwind implementation of the Drawer component.
 * A lightweight, utility-first alternative to the Classic engine.
 *
 * @remarks
 * **Engine Overview:**
 * Modern is the utility-first engine built on DaisyUI and Tailwind CSS.
 * It provides a smaller bundle size compared to Classic while maintaining
 * core drawer functionality.
 *
 * **Key Features:**
 * - Utility-first styling with Tailwind
 * - Smaller bundle size than Ant Design
 * - DaisyUI component tokens
 * - Custom keyboard and scroll handling
 *
 * **When to Use Modern:**
 * - Projects using Tailwind CSS
 * - When bundle size is a concern
 * - Landing pages and marketing sites
 * - When DaisyUI theme is preferred
 *
 * **Multi-Tenant Theming:**
 * Modern uses DaisyUI's color system with CSS custom properties.
 * Tenant themes can override:
 * - `--b1`: Base background color
 * - `--base-300`: Border color
 * - Other DaisyUI tokens
 *
 * **Size Mapping:**
 * | Size | Width/Height |
 * |------|-------------|
 * | sm | 256px |
 * | md | 378px |
 * | lg | 520px |
 * | xl | 736px |
 * | full | 100% |
 *
 * @example Basic Usage
 * ```tsx
 * import { Drawer } from '@rottay/design-system';
 *
 * <Drawer engine="modern" open={open} onClose={onClose}>
 *   <p>Tailwind-styled drawer</p>
 * </Drawer>
 * ```
 *
 * @example Global Engine Configuration
 * ```tsx
 * import { EngineProvider, Drawer } from '@rottay/design-system';
 *
 * <EngineProvider engine="modern">
 *   <App>
 *     <Drawer open={open} onClose={onClose}>
 *       All drawers use Modern engine
 *     </Drawer>
 *   </App>
 * </EngineProvider>
 * ```
 *
 * @see {@link DrawerProps} - Component props interface
 * @see {@link ClassicDrawer} - Ant Design alternative
 * @see {@link RusticDrawer} - Vanilla alternative
 * @see {@link https://daisyui.com/components/drawer} - DaisyUI Drawer docs
 * @module Drawer/Engines/Modern
 * @category Feedback
 * @package @rottay/design-system
 */

import React, { useEffect } from 'react';
import type { DrawerProps, DrawerSize } from '../../types';
import { DRAWER_DEFAULTS } from '../../types';

// ============================================================================
// Constants
// ============================================================================

/**
 * Size preset mappings for Modern engine.
 * Uses string pixel values for CSS compatibility.
 *
 * @internal
 */
const SIZE_MAP: Record<DrawerSize, string> = {
  /** Compact drawer for simple actions */
  sm: '256px',
  /** Standard drawer for forms (default) */
  md: '378px',
  /** Large drawer for complex content */
  lg: '520px',
  /** Extra large for multi-section layouts */
  xl: '736px',
  /** Full viewport width/height */
  full: '100%',
};

// ============================================================================
// Component
// ============================================================================

/**
 * Modern Engine implementation of the Drawer component.
 *
 * @description
 * Custom drawer implementation using DaisyUI classes and Tailwind utilities.
 * Provides a lightweight alternative to Ant Design with smaller bundle size.
 *
 * @remarks
 * **Implementation Details:**
 * - Uses `useEffect` for keyboard event handling
 * - Implements body scroll lock when drawer is open
 * - Custom CSS for positioning and animations
 * - DaisyUI button classes for close button
 *
 * **CSS Classes Used:**
 * - `drawer`, `drawer-overlay`: Container classes
 * - `btn`, `btn-sm`, `btn-circle`, `btn-ghost`: Close button
 * - `text-lg`, `font-bold`: Typography
 * - `flex`, `items-center`, `justify-between`: Layout
 * - `p-6`, `mb-4`, `mt-6`, `pt-4`: Spacing
 * - `border-t`, `border-base-300`: Borders
 *
 * **Accessibility:**
 * - Close button has `aria-label="Close"`
 * - Escape key handling for keyboard users
 *
 * @param props - {@link DrawerProps}
 * @returns The rendered DaisyUI Drawer or empty fragment when closed
 *
 * @example
 * ```tsx
 * <ModernDrawer
 *   open={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   placement="right"
 *   size="lg"
 *   title="Filter Options"
 * >
 *   <FilterForm />
 * </ModernDrawer>
 * ```
 */
export default function ModernDrawer(props: DrawerProps): React.ReactElement {
  // ---------------------------------------------------------------------------
  // Props Destructuring
  // ---------------------------------------------------------------------------

  const {
    // Visibility
    open,

    // Layout
    placement = DRAWER_DEFAULTS.placement,
    size = DRAWER_DEFAULTS.size as DrawerSize,
    width,
    height,

    // Content
    title,
    children,
    footer,
    hideFooter,

    // Behavior
    onClose,
    onOpenChange,
    closable = DRAWER_DEFAULTS.closable,
    closeOnOverlayClick = DRAWER_DEFAULTS.closeOnOverlayClick,
    closeOnEscape = DRAWER_DEFAULTS.closeOnEscape,

    // Overlay
    mask = DRAWER_DEFAULTS.mask,

    // Styling
    className = '',
    style,
  } = props;

  // ---------------------------------------------------------------------------
  // Event Handlers
  // ---------------------------------------------------------------------------

  /**
   * Unified close handler.
   * Calls both onClose and onOpenChange callbacks.
   */
  const handleClose = () => {
    onClose?.();
    onOpenChange?.(false);
  };

  // ---------------------------------------------------------------------------
  // Keyboard Handling
  // ---------------------------------------------------------------------------

  /**
   * Effect: Handle Escape key press to close drawer.
   * Only active when drawer is open and closeOnEscape is true.
   */
  useEffect(() => {
    if (!open || !closeOnEscape) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [open, closeOnEscape]);

  // ---------------------------------------------------------------------------
  // Body Scroll Lock
  // ---------------------------------------------------------------------------

  /**
   * Effect: Lock body scroll when drawer is open.
   * Prevents background content from scrolling while drawer is visible.
   */
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    // Cleanup on unmount
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  // ---------------------------------------------------------------------------
  // Early Return
  // ---------------------------------------------------------------------------

  // Don't render anything when closed
  if (!open) return <></>;

  // ---------------------------------------------------------------------------
  // Size Calculations
  // ---------------------------------------------------------------------------

  const drawerSize = size as DrawerSize;
  const isHorizontal = placement === 'left' || placement === 'right';
  const drawerWidth = width || (isHorizontal ? SIZE_MAP[drawerSize] : '100%');
  const drawerHeight = height || (!isHorizontal ? SIZE_MAP[drawerSize] : '100%');

  // ---------------------------------------------------------------------------
  // Style Generation
  // ---------------------------------------------------------------------------

  /**
   * Generate drawer container styles based on placement.
   * Positions the drawer on the appropriate edge of the viewport.
   */
  const getDrawerStyle = (): React.CSSProperties => {
    // Base styles shared across all placements
    const baseStyle: React.CSSProperties = {
      position: 'fixed',
      backgroundColor: 'var(--ds-drawer-bg, var(--ds-color-bg-elevated, #ffffff))',
      boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)',
      transition: 'transform 0.3s ease-in-out',
      overflowY: 'auto',
      ...style,
    };

    // Placement-specific positioning
    switch (placement) {
      case 'left':
        return {
          ...baseStyle,
          top: 0,
          left: 0,
          width: drawerWidth,
          height: '100vh',
        };
      case 'right':
        return {
          ...baseStyle,
          top: 0,
          right: 0,
          width: drawerWidth,
          height: '100vh',
        };
      case 'top':
        return {
          ...baseStyle,
          top: 0,
          left: 0,
          width: '100vw',
          height: drawerHeight,
        };
      case 'bottom':
        return {
          ...baseStyle,
          bottom: 0,
          left: 0,
          width: '100vw',
          height: drawerHeight,
        };
      default:
        return baseStyle;
    }
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <>
      {/* Overlay/Mask */}
      {mask && (
        <div
          className="drawer-overlay fixed inset-0 bg-black bg-opacity-50"
          style={{ zIndex: DRAWER_DEFAULTS.zIndex }}
          onClick={closeOnOverlayClick ? handleClose : undefined}
        />
      )}

      {/* Drawer Container */}
      <div
        className={`drawer ${className}`}
        style={{
          ...getDrawerStyle(),
          zIndex: (DRAWER_DEFAULTS.zIndex || 1000) + 1,
        }}
      >
        {/* Inner content wrapper with padding */}
        <div className="p-6">
          {/* Header with title and close button */}
          {(title || closable) && (
            <div className="flex items-center justify-between mb-4">
              {title && <h3 className="text-lg font-bold">{title}</h3>}
              {closable && (
                <button
                  className="btn btn-sm btn-circle btn-ghost"
                  onClick={handleClose}
                  aria-label="Close"
                >
                  ✕
                </button>
              )}
            </div>
          )}

          {/* Main content area */}
          <div className="drawer-content">{children}</div>

          {/* Footer section */}
          {!hideFooter && footer && (
            <div className="drawer-footer mt-6 pt-4 border-t border-base-300">
              {footer}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
