'use client';

/**
 * @fileoverview Drawer Rustic Engine - Rottay Design System
 * @description Vanilla HTML/CSS implementation of the Drawer component.
 * A zero-dependency engine for maximum accessibility and control.
 *
 * @remarks
 * **Engine Overview:**
 * Rustic is the headless, zero-dependency engine that uses only vanilla
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
 * **When to Use Rustic:**
 * - When bundle size is critical
 * - For accessibility-focused applications
 * - When full styling control is needed
 * - For custom design systems built on Rottay
 * - When avoiding third-party UI libraries
 *
 * **Multi-Tenant Theming:**
 * Rustic uses CSS custom properties for theming:
 * - `--ds-drawer-bg`: Drawer background
 * - `--ds-drawer-border-color`: Border color
 * - `--ds-drawer-close-color`: Close button color
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
 * <Drawer engine="rustic" open={open} onClose={onClose}>
 *   <p>Vanilla-styled drawer</p>
 * </Drawer>
 * ```
 *
 * @example With Custom CSS Variables
 * ```tsx
 * <div style={{
 *   '--ds-drawer-bg': '#1a1a2e',
 *   '--ds-drawer-border-color': '#333',
 *   '--ds-drawer-close-color': '#888'
 * }}>
 *   <Drawer engine="rustic" open={open} onClose={onClose}>
 *     Dark themed drawer
 *   </Drawer>
 * </div>
 * ```
 *
 * @see {@link DrawerProps} - Component props interface
 * @see {@link ClassicDrawer} - Ant Design alternative
 * @see {@link ModernDrawer} - DaisyUI alternative
 * @module Drawer/Engines/Rustic
 * @category Feedback
 * @package @rottay/design-system
 */

import React, { useEffect, useId } from 'react';
import type { DrawerProps, DrawerSize } from '../../contracts';
import { DRAWER_DEFAULTS } from '../../contracts';

// ============================================================================
// Constants
// ============================================================================

/**
 * Size preset mappings for Rustic engine.
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
 * Rustic Engine implementation of the Drawer component.
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
 * | `--ds-drawer-bg` | #fff | Drawer background |
 * | `--ds-drawer-border-color` | #f0f0f0 | Border color |
 * | `--ds-drawer-close-color` | #666 | Close button color |
 * | `--ds-drawer-shadow` | 0 8px 30px rgba(0, 0, 0, 0.12) | Box shadow |
 * | `--ds-drawer-header-padding` | 16px 24px | Header padding |
 * | `--ds-drawer-body-padding` | 24px | Body padding |
 * | `--ds-drawer-footer-padding` | 10px 16px | Footer padding |
 *
 * @param props - {@link DrawerProps}
 * @returns The rendered vanilla Drawer or empty fragment when closed
 *
 * @example
 * ```tsx
 * <RusticDrawer
 *   open={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   placement="right"
 *   size="lg"
 *   title="Accessibility Settings"
 *   maskOpacity={0.6}
 * >
 *   <AccessibilityForm />
 * </RusticDrawer>
 * ```
 */
export default function RusticDrawer(props: DrawerProps): React.ReactElement {
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
    id,
    'data-testid': dataTestId,
    'aria-label': ariaLabel,
    'aria-describedby': ariaDescribedBy,
  } = props;
  const generatedTitleId = useId();
  const titleId = `${id || generatedTitleId}-title`;

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
  // Horizontal drawers (left/right) use width for sizing; vertical drawers
  // (top/bottom) use height. The opposite dimension always fills the viewport.
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
  // The scrim alpha is per-instance, so it rides a hatch the skin composes into
  // rgba(). No backdrop-filter is set here or in the rustic skin: this engine's
  // blur comes from personality.css's `.rottay-drawer-overlay` rule, which stays
  // the only declaration on that channel.
  const overlayStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    '--ds-drawer-overlay-opacity': maskOpacity,
    zIndex,
  } as React.CSSProperties;

  /**
   * Generate drawer container styles based on placement.
   * Uses CSS custom properties for tenant theming.
   */
  const getDrawerStyle = (): React.CSSProperties => {
    // Base styles with CSS custom property theming
    const baseStyle: React.CSSProperties = {
      position: 'fixed',
      // This transition never fires: the panel is positioned with top/left/right/
      // bottom and `transform` is never assigned, so there is no transform delta
      // to interpolate. Kept as-is -- it is also what suppresses personality.css's
      // `.rottay-drawer { transition: transform ... }` on this engine.
      transition: 'var(--ds-drawer-transition, transform 0.3s ease-in-out)',
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
    padding: 'var(--ds-drawer-header-padding, 16px 24px)',
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
    padding: 'var(--ds-drawer-body-padding, 24px)',
    flex: 1,
    overflowY: 'auto',
  };

  /**
   * Footer section styles.
   * Fixed at bottom with border separator.
   */
  const footerStyle: React.CSSProperties = {
    padding: 'var(--ds-drawer-footer-padding, 10px 16px)',
    flexShrink: 0,
  };

  /**
   * Close button styles.
   */
  const closeButtonStyle: React.CSSProperties = {
    fontSize: 'var(--ds-drawer-close-size, 20px)',
    cursor: 'pointer',
    padding: '0',
    width: '24px',
    height: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <>
      {/* Overlay/Mask - click to close if enabled */}
      {mask && (
        <div
          data-part="backdrop"
          className="rottay-drawer-overlay rottay-drawer-backdrop--rustic"
          style={overlayStyle}
          onClick={closeOnOverlayClick ? handleClose : undefined}
        />
      )}

      {/* Drawer Container */}
      <div
        id={id}
        data-testid={dataTestId}
        data-part="surface"
        data-placement={placement}
        data-open={open ? 'true' : 'false'}
        className={`rottay-drawer rottay-drawer-${placement} rottay-drawer--rustic ${className}`}
        style={getDrawerStyle()}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        aria-labelledby={!ariaLabel && title ? titleId : undefined}
        aria-describedby={ariaDescribedBy}
      >
        {/* Header section */}
        {(title || closable) && (
          <div data-part="header" style={headerStyle}>
            {title && (
              <h3 id={titleId} data-part="title" style={{ margin: 0, fontSize: '16px', fontWeight: 500 }}>
                {title}
              </h3>
            )}
            {closable && (
              <button
                data-part="close-button"
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
        <div data-part="body" style={bodyStyle}>{children}</div>

        {/* Footer section - action buttons */}
        {!hideFooter && footer && <div data-part="footer" style={footerStyle}>{footer}</div>}
      </div>
    </>
  );
}
