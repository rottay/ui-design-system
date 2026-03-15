/**
 * @fileoverview Affix Component Types - Rottay Design System
 * @description TypeScript type definitions for the Affix component.
 * Provides comprehensive typing for sticky positioning functionality.
 *
 * @remarks
 * These types support the multi-engine architecture of Rottay Design System,
 * ensuring consistent API across Classic (Ant Design), Modern (DaisyUI), and
 * Rustic (Vanilla) implementations.
 *
 * @example Type Usage
 * ```tsx
 * import type { AffixProps, AffixState } from '@rottay/design-system';
 *
 * const customAffixProps: AffixProps = {
 *   offsetTop: 64,
 *   onChange: (affixed) => console.log('Affixed:', affixed),
 *   children: <nav>Navigation</nav>,
 * };
 * ```
 *
 * @see {@link AffixProps} for component props
 * @see {@link AffixState} for internal state
 * @see {@link AFFIX_DEFAULTS} for default values
 *
 * @module Affix/Types
 * @category Navigation
 * @package @rottay/design-system
 */

import type { ReactNode, CSSProperties } from 'react';
import type { EngineName } from '../../../../types';

// ============================================================================
// Component Props Interface
// ============================================================================

/**
 * Props for the Affix component.
 *
 * @description
 * Configuration options for creating sticky positioned elements that fix
 * to the viewport when scrolling past a specified threshold.
 *
 * @remarks
 * The Affix component supports two modes of operation:
 * 1. **Top Affix Mode**: Element sticks to top when scrolling down (default)
 * 2. **Bottom Affix Mode**: Element sticks to bottom when scrolling up
 *
 * When `offsetBottom` is specified, `offsetTop` is ignored.
 *
 * @example Basic Props
 * ```tsx
 * <Affix
 *   offsetTop={64}
 *   onChange={(affixed) => setIsSticky(affixed)}
 *   zIndex={100}
 * >
 *   <header>Sticky Header</header>
 * </Affix>
 * ```
 *
 * @example Custom Target Container
 * ```tsx
 * <Affix
 *   offsetTop={0}
 *   target={() => document.getElementById('scroll-container')}
 * >
 *   <nav>Sticky Nav</nav>
 * </Affix>
 * ```
 */
export interface AffixProps {
  /**
   * Pixels from top of viewport to trigger affix.
   *
   * @description
   * The distance in pixels from the top of the viewport (or target container)
   * at which the element becomes affixed. The element will stick when its
   * top edge reaches this offset from the viewport top.
   *
   * @default 0
   *
   * @example
   * ```tsx
   * // Stick to top with 64px offset (below a fixed navbar)
   * <Affix offsetTop={64}>
   *   <div>Content</div>
   * </Affix>
   * ```
   */
  offsetTop?: number;

  /**
   * Pixels from bottom of viewport to trigger affix.
   *
   * @description
   * The distance in pixels from the bottom of the viewport at which the
   * element becomes affixed. When set, the element will stick when its
   * bottom edge reaches this offset from the viewport bottom.
   *
   * @remarks
   * When `offsetBottom` is specified, `offsetTop` is ignored and the
   * component operates in bottom affix mode.
   *
   * @example
   * ```tsx
   * // Stick to bottom with 20px offset
   * <Affix offsetBottom={20}>
   *   <footer>Action Bar</footer>
   * </Affix>
   * ```
   */
  offsetBottom?: number;

  /**
   * Target container to listen for scroll events.
   *
   * @description
   * A function that returns the scroll container element. This allows the
   * Affix to work within custom scrollable containers instead of the window.
   *
   * @default () => window
   *
   * @example
   * ```tsx
   * const containerRef = useRef<HTMLDivElement>(null);
   *
   * <div ref={containerRef} style={{ overflow: 'auto', height: 400 }}>
   *   <Affix target={() => containerRef.current}>
   *     <div>Sticky within container</div>
   *   </Affix>
   * </div>
   * ```
   */
  target?: () => Window | HTMLElement | null;

  /**
   * Callback when affixed state changes.
   *
   * @description
   * Called when the element transitions between affixed and non-affixed states.
   * Useful for triggering visual changes, analytics, or other side effects.
   *
   * @param affixed - Whether the element is currently affixed to the viewport
   *
   * @example
   * ```tsx
   * <Affix
   *   offsetTop={0}
   *   onChange={(affixed) => {
   *     console.log(affixed ? 'Header is now sticky' : 'Header is normal');
   *     setHeaderShadow(affixed);
   *   }}
   * >
   *   <header>Header</header>
   * </Affix>
   * ```
   */
  onChange?: (affixed: boolean) => void;

  /**
   * Content to be made sticky.
   *
   * @description
   * The child elements that will become sticky when the affix is triggered.
   * Can be any valid React node including elements, components, or fragments.
   */
  children: ReactNode;

  /**
   * Additional CSS class name.
   *
   * @description
   * Custom CSS class names to apply to the affix wrapper element.
   * Useful for applying custom styles or integrating with CSS frameworks.
   *
   * @example
   * ```tsx
   * <Affix className="my-sticky-nav" offsetTop={0}>
   *   <nav>Navigation</nav>
   * </Affix>
   * ```
   */
  className?: string;

  /**
   * Inline styles.
   *
   * @description
   * Custom inline styles to apply to the affix element.
   * These styles are merged with the component's computed styles.
   */
  style?: CSSProperties;

  /**
   * Override the default rendering engine.
   *
   * @description
   * Allows forcing a specific engine implementation regardless of the
   * EngineProvider context. Useful for testing or specific use cases.
   *
   * @default Inherited from EngineProvider or 'classic'
   *
   * @example
   * ```tsx
   * // Force Modern engine for Tailwind styling
   * <Affix engine="modern" offsetTop={0}>
   *   <nav>Navigation</nav>
   * </Affix>
   * ```
   */
  engine?: EngineName;

  /**
   * z-index for the affixed element.
   *
   * @description
   * The CSS z-index value to apply when the element is affixed.
   * Ensures the sticky element appears above other content.
   *
   * @default 10
   *
   * @example
   * ```tsx
   * // Higher z-index for modal overlays
   * <Affix zIndex={1000} offsetTop={0}>
   *   <div>High priority sticky content</div>
   * </Affix>
   * ```
   */
  zIndex?: number;
}

// ============================================================================
// Internal State Interface
// ============================================================================

/**
 * Internal state for affix calculations.
 *
 * @description
 * Represents the internal state used by the Affix component to manage
 * the sticky positioning behavior and track affixed status.
 *
 * @remarks
 * This interface is primarily used internally by engine implementations
 * but is exported for advanced use cases and custom implementations.
 *
 * @example
 * ```tsx
 * const [state, setState] = useState<AffixState>({
 *   affixed: false,
 *   fixedStyle: undefined,
 *   placeholderStyle: undefined,
 * });
 * ```
 */
export interface AffixState {
  /**
   * Whether the element is currently affixed.
   *
   * @description
   * True when the element has been fixed to the viewport, false when
   * it's in its normal document flow position.
   */
  affixed: boolean;

  /**
   * Fixed position styles when affixed.
   *
   * @description
   * CSS styles applied to the element when it's in the affixed state.
   * Includes position, top/bottom offset, left position, width, and z-index.
   */
  fixedStyle?: CSSProperties;

  /**
   * Placeholder dimensions.
   *
   * @description
   * CSS styles for the placeholder element that maintains the original
   * space when the affixed element is removed from document flow.
   * Prevents content jumping when the element becomes fixed.
   */
  placeholderStyle?: CSSProperties;
}

// ============================================================================
// Default Values
// ============================================================================

/**
 * Default values for Affix props.
 *
 * @description
 * Contains the default configuration values used by the Affix component
 * when specific props are not provided.
 *
 * @example
 * ```tsx
 * import { AFFIX_DEFAULTS } from '@rottay/design-system';
 *
 * console.log(AFFIX_DEFAULTS.offsetTop); // 0
 * console.log(AFFIX_DEFAULTS.zIndex);    // 10
 * ```
 */
export const AFFIX_DEFAULTS = {
  /**
   * Default offset from top in pixels.
   * Element sticks at the very top of the viewport by default.
   */
  offsetTop: 0,

  /**
   * Default z-index when affixed.
   * Ensures sticky element appears above normal content.
   */
  zIndex: 10,
} as const;
