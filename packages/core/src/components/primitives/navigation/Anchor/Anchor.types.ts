/**
 * @fileoverview Anchor Types - Rottay Design System
 * @description Type definitions for the Anchor component and its compound components.
 * Part of the Rottay Design System's navigation primitives collection.
 *
 * @remarks
 * This module defines the core TypeScript interfaces for the Anchor component.
 * The types are designed to work across all three rendering engines (Classic,
 * Modern, Rustic) while providing a consistent API for developers.
 *
 * **Type Categories:**
 * - `AnchorProps`: Main anchor container props interface
 * - `AnchorLinkProps`: Individual link item props interface
 * - `ANCHOR_DEFAULTS`: Default configuration values
 *
 * **Multi-Tenant Support:**
 * Props are designed to ensure compatibility with tenant theming
 * and engine switching across all implementations.
 *
 * @example Type Usage
 * ```tsx
 * import type { AnchorProps, AnchorLinkProps } from '@rottay/design-system';
 *
 * // Custom anchor wrapper with typed props
 * interface CustomAnchorProps extends AnchorProps {
 *   customTitle?: string;
 * }
 *
 * // Type-safe link props
 * const linkConfig: AnchorLinkProps = {
 *   href: '#section-1',
 *   title: 'Section 1',
 * };
 * ```
 *
 * @example Default Values Usage
 * ```tsx
 * import { ANCHOR_DEFAULTS } from '@rottay/design-system';
 *
 * // Access default configuration
 * console.log(ANCHOR_DEFAULTS.offsetTop);  // 0
 * console.log(ANCHOR_DEFAULTS.bounds);     // 5
 * console.log(ANCHOR_DEFAULTS.direction);  // 'vertical'
 * console.log(ANCHOR_DEFAULTS.affix);      // true
 * ```
 *
 * @see {@link AnchorProps} - Main component props
 * @see {@link AnchorLinkProps} - Link component props
 * @see {@link ANCHOR_DEFAULTS} - Default configuration values
 * @module Anchor/Types
 * @category Navigation
 * @package @rottay/design-system
 */

import type { ReactNode, CSSProperties } from 'react';

// ============================================================================
// Link Props Interface
// ============================================================================

/**
 * Props for the Anchor.Link component.
 *
 * @interface AnchorLinkProps
 *
 * @example Basic Link
 * ```tsx
 * <Anchor.Link href="#section" title="Section Title" />
 * ```
 *
 * @example Link with Nested Children
 * ```tsx
 * <Anchor.Link href="#parent" title="Parent Section">
 *   <Anchor.Link href="#child-1" title="Child 1" />
 *   <Anchor.Link href="#child-2" title="Child 2" />
 * </Anchor.Link>
 * ```
 *
 * @example External Link
 * ```tsx
 * <Anchor.Link
 *   href="https://example.com"
 *   title="External Resource"
 *   target="_blank"
 * />
 * ```
 */
export interface AnchorLinkProps {
  // ---------------------------------------------------------------------------
  // Required Props
  // ---------------------------------------------------------------------------

  /**
   * Target element href (anchor ID or URL).
   * For page sections, use format: `#section-id`
   * @example '#introduction'
   * @example '#features-list'
   */
  href: string;

  /**
   * Link title/label displayed to the user.
   * Can be a string or custom React elements.
   * @example "Getting Started"
   * @example <><Icon name="book" /> Documentation</>
   */
  title: ReactNode;

  // ---------------------------------------------------------------------------
  // Optional Props
  // ---------------------------------------------------------------------------

  /**
   * Target attribute for external links.
   * Use '_blank' to open in new tab.
   * @example '_blank'
   * @example '_self'
   */
  target?: string;

  /**
   * Whether to replace the current URL in browser history.
   * When true, clicking back won't return to previous scroll position.
   * @default false
   */
  replace?: boolean;

  /**
   * Nested link children for hierarchical navigation.
   * Creates indented sub-navigation under this link.
   */
  children?: ReactNode;

  /**
   * Custom CSS class name for additional styling.
   * Appended to the default link classes.
   */
  className?: string;

  /**
   * Custom inline styles.
   * Merged with default link styles.
   */
  style?: CSSProperties;
}

// ============================================================================
// Anchor Props Interface
// ============================================================================

/**
 * Props for the Anchor component.
 *
 * @interface AnchorProps
 *
 * @example Complete Usage
 * ```tsx
 * <Anchor
 *   getContainer={() => document.getElementById('scroll-container')!}
 *   activeKey="#current-section"
 *   offsetTop={80}
 *   bounds={5}
 *   direction="vertical"
 *   affix={true}
 *   onChange={(key) => console.log('Active:', key)}
 *   onClick={(e, link) => console.log('Clicked:', link.href)}
 * >
 *   <Anchor.Link href="#section-1" title="Section 1" />
 *   <Anchor.Link href="#section-2" title="Section 2" />
 * </Anchor>
 * ```
 */
export interface AnchorProps {
  // ---------------------------------------------------------------------------
  // Scroll Configuration
  // ---------------------------------------------------------------------------

  /**
   * Function that returns the scrollable container element.
   * Defaults to window if not specified.
   * @example () => document.getElementById('content')!
   * @example () => containerRef.current!
   */
  getContainer?: () => HTMLElement | Window;

  /**
   * Currently active link href (controlled mode).
   * When set, overrides automatic scroll-based detection.
   * @example '#introduction'
   */
  activeKey?: string;

  /**
   * Offset from top when calculating active link position.
   * Useful when you have a fixed header.
   * @default 0
   */
  offsetTop?: number;

  /**
   * Offset from bottom when scrolling to sections.
   * @default undefined
   */
  offsetBottom?: number;

  /**
   * Pixel tolerance for active link detection.
   * Higher values make detection more forgiving.
   * @default 5
   */
  bounds?: number;

  // ---------------------------------------------------------------------------
  // Appearance
  // ---------------------------------------------------------------------------

  /**
   * Whether to show the ink indicator when affix is off.
   * The ink shows which link is currently active.
   * @default false
   */
  showInkInFixed?: boolean;

  /**
   * Navigation direction.
   * - 'vertical': Traditional sidebar style (default)
   * - 'horizontal': Tab-like horizontal layout
   * @default 'vertical'
   */
  direction?: 'vertical' | 'horizontal';

  /**
   * Whether to affix (stick) the anchor to the viewport.
   * When true, anchor becomes sticky during scroll.
   * @default true
   */
  affix?: boolean;

  // ---------------------------------------------------------------------------
  // Event Handlers
  // ---------------------------------------------------------------------------

  /**
   * Callback fired when the active link changes.
   * Called during scroll when a new section becomes active.
   * @param activeKey - The href of the newly active link
   */
  onChange?: (activeKey: string) => void;

  /**
   * Callback fired when a link is clicked.
   * Allows custom handling or preventing default scroll behavior.
   * @param e - React mouse event
   * @param link - Object containing title and href of clicked link
   */
  onClick?: (e: React.MouseEvent, link: { title: ReactNode; href: string }) => void;

  // ---------------------------------------------------------------------------
  // Children & Styling
  // ---------------------------------------------------------------------------

  /**
   * Anchor.Link children that make up the navigation.
   */
  children?: ReactNode;

  /**
   * Custom CSS class name for the anchor container.
   */
  className?: string;

  /**
   * Custom inline styles for the anchor container.
   */
  style?: CSSProperties;
}

// ============================================================================
// Default Values
// ============================================================================

/**
 * Default configuration values for the Anchor component.
 * Used by engine implementations to ensure consistent behavior.
 *
 * @constant
 *
 * @example Accessing Defaults
 * ```tsx
 * import { ANCHOR_DEFAULTS } from '@rottay/design-system';
 *
 * const MyAnchor = (props: AnchorProps) => {
 *   const offsetTop = props.offsetTop ?? ANCHOR_DEFAULTS.offsetTop;
 *   const direction = props.direction ?? ANCHOR_DEFAULTS.direction;
 *   // ...
 * };
 * ```
 */
export const ANCHOR_DEFAULTS = {
  /** Default offset from top of container */
  offsetTop: 0,

  /** Default pixel tolerance for active detection */
  bounds: 5,

  /** Default navigation direction */
  direction: 'vertical' as const,

  /** Anchor is affixed by default */
  affix: true,
};
