/**
 * @fileoverview Drawer Apollo Engine - Rottay Design System
 * @description Vanilla HTML/CSS implementation of the Drawer component.
 * A zero-dependency engine for maximum accessibility and control.
 *
 * @remarks
 * **Engine Overview:**
 * Apollo is the headless, zero-dependency engine that uses only vanilla
 * HTML, CSS, and React. It provides the smallest bundle size and maximum
 * control over styling and behavior.
 *
 * **Key Features:**
 * - Zero external dependencies (no UI library)
 * - Maximum accessibility control
 * - Smallest bundle footprint
 * - Full CSS custom property support
 * - Semantic HTML structure
 *
 * **When to Use Apollo:**
 * - When bundle size is critical
 * - For accessibility-focused applications
 * - When full styling control is needed
 * - For custom design systems built on Rottay
 * - When avoiding third-party UI libraries
 *
 * **Multi-Tenant Theming:**
 * Apollo heavily uses CSS custom properties for theming:
 * - `--rottay-color-background`: Drawer background
 * - `--rottay-color-border`: Border color
 * - `--rottay-color-text-secondary`: Close button color
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
 * <Drawer engine="apollo" open={open} onClose={onClose}>
 *   <p>Vanilla-styled drawer</p>
 * </Drawer>
 * ```
 *
 * @example With Custom CSS Variables
 * ```tsx
 * <div style={{
 *   '--rottay-color-background': '#1a1a2e',
 *   '--rottay-color-border': '#333',
 *   '--rottay-color-text-secondary': '#888'
 * }}>
 *   <Drawer engine="apollo" open={open} onClose={onClose}>
 *     Dark themed drawer
 *   </Drawer>
 * </div>
 * ```
 *
 * @see {@link DrawerProps} - Component props interface
 * @see {@link TitanDrawer} - Ant Design alternative
 * @see {@link HermesDrawer} - DaisyUI alternative
 * @module Drawer/Engines/Apollo
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
 * Size preset mappings for Apollo engine.
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
 * Apollo Engine implementation of the Drawer component.
 *
 * @description
 * Pure vanilla implementation using only HTML, CSS, and React.
 * Provides complete control over styling through CSS custom properties
 * and inline styles.
 *
 * @remarks
 * **Implementation Details:**
 * - Uses flexbox for layout structure
 * - Implements body scroll lock when open
 * - Custom keyboard handling for Escape key
 * - CSS custom properties for theming
 * - Semantic HTML with ARIA attributes
 *
 * **Accessibility Features:**
 * - `role="dialog"` on drawer container
 * - `aria-modal="true"` for modal behavior
 * - `aria-label="Close"` on close button
 * - Focus management via native browser behavior
 *
 * **CSS Custom Properties:**
 * | Property | Default | Description |
 * |----------|---------|-------------|
 * | `--rottay-color-background` | #fff | Drawer background |
 * | `--rottay-color-border` | #f0f0f0 | Border color |
 * | `--rottay-color-text-secondary` | #666 | Close button color |
 *
 * @param props - {@link DrawerProps}
 * @returns The rendered vanilla Drawer or empty fragment when closed
 *
 * @example
 * ```tsx
 * <ApolloDrawer
 *   open={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   placement="right"
 *   size="lg"
 *   title="Accessibility Settings"
 *   maskOpacity={0.6}
 * >
 *   <AccessibilityForm />
 * </ApolloDrawer>
 * ```
 */
export default function ApolloDrawer(props: DrawerProps): React.ReactElement {
  // ---------------------------------------------------------------------------
  // Props Destructuring
  // ---------------------------------------------------------------------------

  const {
    // Visibility
    open,

    // Layout
    placement = DRAWER_DEFAULTS.placement,
    size = DRAWER_DEFAULTS.size as DrawerSize,
    zIndex = DRAWER_DEFAULTS.zIndex,
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
    maskOpacity = DRAWER_DEFAULTS.maskOpacity,

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
  const drawerWidth = width || (isHorizontal ? SIZE_MAP[drawerSize] : '100vw');
  const drawerHeight = height || (!isHorizontal ? SIZE_MAP[drawerSize] : '100vh');

  // ---------------------------------------------------------------------------
  // Style Definitions
  // ---------------------------------------------------------------------------

  /**
   * Overlay/mask styles.
   * Covers the entire viewport with semi-transparent background.
   */
  const overlayStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: `rgba(0, 0, 0, ${maskOpacity})`,
    zIndex,
  };

  /**
   * Generate drawer container styles based on placement.
   * Uses CSS custom properties for tenant theming.
   */
  const getDrawerStyle = (): React.CSSProperties => {
    // Base styles with CSS custom property theming
    const baseStyle: React.CSSProperties = {
      position: 'fixed',
      backgroundColor: 'var(--rottay-color-background, #fff)',
      boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)',
      transition: 'transform 0.3s ease-in-out',
      overflowY: 'auto',
      zIndex: zIndex! + 1,
      display: 'flex',
      flexDirection: 'column',
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

  /**
   * Header section styles.
   * Fixed at top with title and close button.
   */
  const headerStyle: React.CSSProperties = {
    padding: '16px 24px',
    borderBottom: '1px solid var(--rottay-color-border, #f0f0f0)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexShrink: 0,
  };

  /**
   * Body section styles.
   * Scrollable content area that fills available space.
   */
  const bodyStyle: React.CSSProperties = {
    padding: '24px',
    flex: 1,
    overflowY: 'auto',
  };

  /**
   * Footer section styles.
   * Fixed at bottom with border separator.
   */
  const footerStyle: React.CSSProperties = {
    padding: '10px 16px',
    borderTop: '1px solid var(--rottay-color-border, #f0f0f0)',
    flexShrink: 0,
  };

  /**
   * Close button styles.
   * Minimal, accessible button with hover feedback.
   */
  const closeButtonStyle: React.CSSProperties = {
    background: 'transparent',
    border: 'none',
    fontSize: '20px',
    cursor: 'pointer',
    padding: '0',
    width: '24px',
    height: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--rottay-color-text-secondary, #666)',
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <>
      {/* Overlay/Mask - click to close if enabled */}
      {mask && (
        <div
          className="rottay-drawer-overlay"
          style={overlayStyle}
          onClick={closeOnOverlayClick ? handleClose : undefined}
        />
      )}

      {/* Drawer Container */}
      <div
        className={`rottay-drawer rottay-drawer-${placement} ${className}`}
        style={getDrawerStyle()}
        role="dialog"
        aria-modal="true"
      >
        {/* Header section */}
        {(title || closable) && (
          <div style={headerStyle}>
            {title && (
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 500 }}>
                {title}
              </h3>
            )}
            {closable && (
              <button
                style={closeButtonStyle}
                onClick={handleClose}
                aria-label="Close"
              >
                ✕
              </button>
            )}
          </div>
        )}

        {/* Body section - main content area */}
        <div style={bodyStyle}>{children}</div>

        {/* Footer section - action buttons */}
        {!hideFooter && footer && <div style={footerStyle}>{footer}</div>}
      </div>
    </>
  );
}
