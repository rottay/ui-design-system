/**
 * @fileoverview Drawer Classic Engine - Rottay Design System
 * @description Ant Design implementation of the Drawer component.
 * The primary, full-featured engine for enterprise applications.
 *
 * @remarks
 * **Engine Overview:**
 * Classic is the default engine in the Rottay Design System, built on
 * Ant Design. It provides the most complete feature set including:
 * - Smooth slide-in/slide-out animations
 * - Native keyboard handling (Escape to close)
 * - Focus trapping for accessibility
 * - RTL (Right-to-Left) support
 *
 * **When to Use Classic:**
 * - Enterprise applications requiring full feature set
 * - Projects already using Ant Design
 * - When bundle size is not a primary concern
 *
 * **Multi-Tenant Theming:**
 * Classic drawers inherit Ant Design's theme tokens which can be
 * customized per tenant via the ConfigProvider or CSS variables.
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
 * // Classic is the default engine
 * <Drawer open={open} onClose={onClose} title="Settings">
 *   <p>Drawer content</p>
 * </Drawer>
 * ```
 *
 * @example Explicit Engine Selection
 * ```tsx
 * <Drawer engine="classic" open={open} onClose={onClose}>
 *   <p>Explicitly using Classic engine</p>
 * </Drawer>
 * ```
 *
 * @example With All Placements
 * ```tsx
 * <Drawer placement="left" open={leftOpen} onClose={closeLeft}>...</Drawer>
 * <Drawer placement="right" open={rightOpen} onClose={closeRight}>...</Drawer>
 * <Drawer placement="top" open={topOpen} onClose={closeTop}>...</Drawer>
 * <Drawer placement="bottom" open={bottomOpen} onClose={closeBottom}>...</Drawer>
 * ```
 *
 * @see {@link DrawerProps} - Component props interface
 * @see {@link ModernDrawer} - DaisyUI alternative
 * @see {@link RusticDrawer} - Vanilla alternative
 * @see {@link https://ant.design/components/drawer} - Ant Design Drawer docs
 * @module Drawer/Engines/Classic
 * @category Feedback
 * @package @rottay/design-system
 */

import React from 'react';
import { Drawer as AntDrawer } from 'antd';
import type { DrawerProps, DrawerSize } from '../Drawer.types';
import { DRAWER_DEFAULTS } from '../Drawer.types';

// ============================================================================
// Constants
// ============================================================================

/**
 * Size preset mappings for Classic engine.
 * Maps semantic size names to pixel/percentage values.
 *
 * @remarks
 * These values are used for both width (left/right placement)
 * and height (top/bottom placement) depending on the drawer orientation.
 *
 * @internal
 */
const SIZE_MAP: Record<DrawerSize, number | string> = {
  /** Compact drawer for simple actions */
  sm: 256,
  /** Standard drawer for forms (default) */
  md: 378,
  /** Large drawer for complex content */
  lg: 520,
  /** Extra large for multi-section layouts */
  xl: 736,
  /** Full viewport width/height */
  full: '100%',
};

// ============================================================================
// Component
// ============================================================================

/**
 * Classic Engine implementation of the Drawer component.
 *
 * @description
 * Wraps Ant Design's Drawer component with Rottay's standardized props API.
 * Provides enterprise-grade drawer functionality with full accessibility support.
 *
 * @remarks
 * **Key Features:**
 * - Animated transitions (configurable via Ant Design)
 * - Focus management and keyboard navigation
 * - Body scroll locking when open
 * - Portal rendering to document.body
 *
 * **Prop Mappings to Ant Design:**
 * | Rottay Prop | Ant Design Prop |
 * |-------------|-----------------|
 * | open | open |
 * | onClose | onClose |
 * | closeOnOverlayClick | maskClosable |
 * | closeOnEscape | keyboard |
 * | closable | closable |
 *
 * @param props - {@link DrawerProps}
 * @returns The rendered Ant Design Drawer
 *
 * @example
 * ```tsx
 * <ClassicDrawer
 *   open={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   placement="right"
 *   size="lg"
 *   title="User Settings"
 *   footer={<Button onClick={save}>Save Changes</Button>}
 * >
 *   <SettingsForm />
 * </ClassicDrawer>
 * ```
 */
export default function ClassicDrawer(props: DrawerProps): React.ReactElement {
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
    zIndex = DRAWER_DEFAULTS.zIndex,

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
    className,
    style,
  } = props;

  // ---------------------------------------------------------------------------
  // Event Handlers
  // ---------------------------------------------------------------------------

  /**
   * Unified close handler.
   * Calls both onClose and onOpenChange callbacks for flexibility.
   */
  const handleClose = () => {
    onClose?.();
    onOpenChange?.(false);
  };

  // ---------------------------------------------------------------------------
  // Size Calculations
  // ---------------------------------------------------------------------------

  // Determine if drawer is horizontal (left/right) or vertical (top/bottom)
  const drawerSize = size as DrawerSize;
  const isHorizontal = placement === 'left' || placement === 'right';

  // Use custom dimensions if provided, otherwise use size preset
  const drawerWidth = width || (isHorizontal ? SIZE_MAP[drawerSize] : undefined);
  const drawerHeight = height || (!isHorizontal ? SIZE_MAP[drawerSize] : undefined);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <AntDrawer
      // Visibility
      open={open}

      // Layout
      placement={placement}
      width={drawerWidth}
      height={drawerHeight}
      zIndex={zIndex}

      // Content
      title={title}
      footer={hideFooter ? null : footer}

      // Behavior - map Rottay props to Ant Design props
      onClose={handleClose}
      closable={closable}
      maskClosable={closeOnOverlayClick}
      keyboard={closeOnEscape}

      // Overlay
      mask={mask}

      // Styling
      className={className}
      style={style}
    >
      {children}
    </AntDrawer>
  );
}
