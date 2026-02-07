/**
 * @fileoverview Rate Types - Rottay Design System
 * @description Type definitions for the Rate component.
 * Part of the Rottay Design System's feedback primitives collection.
 *
 * @remarks
 * This module defines the core TypeScript interfaces for the Rate component.
 * The types are designed to work across all three rendering engines (Classic,
 * Modern, Rustic) while providing a consistent API for developers.
 *
 * **Type Categories:**
 * - `RateSize`: Predefined size options for star icons
 * - `RateEngine`: Available rendering engine options
 * - `RateCharacterProps`: Props passed to custom character render functions
 * - `RateProps`: Main component props interface
 *
 * **Multi-Tenant Support:**
 * Props are designed to ensure compatibility with tenant theming and
 * engine switching, respecting CSS variables for colors and sizing.
 *
 * @example Type Usage
 * ```tsx
 * import type { RateProps, RateSize, RateCharacterProps } from '@rottay/design-system';
 *
 * // Custom rating wrapper with typed props
 * interface CustomRateProps extends RateProps {
 *   label?: string;
 * }
 *
 * // Type-safe size handling
 * const size: RateSize = 'lg';
 *
 * // Custom character render function
 * const renderCharacter = (props: RateCharacterProps) => {
 *   return props.index < props.value ? '★' : '☆';
 * };
 * ```
 *
 * @example Default Values Usage
 * ```tsx
 * import { RATE_DEFAULTS, RATE_SIZE_MAP } from '@rottay/design-system';
 *
 * // Access default configuration
 * console.log(RATE_DEFAULTS.count);     // 5
 * console.log(RATE_DEFAULTS.size);      // 'md'
 * console.log(RATE_DEFAULTS.allowHalf); // false
 *
 * // Access size mappings
 * console.log(RATE_SIZE_MAP.lg);        // 'var(--rate-lg-size)'
 * ```
 *
 * @see {@link RateProps} - Main component props
 * @see {@link RATE_DEFAULTS} - Default configuration values
 * @see {@link RATE_SIZE_MAP} - Size to CSS variable mappings
 * @module Rate/Types
 * @category Feedback
 * @package @rottay/design-system
 */

import type { ReactNode, CSSProperties, HTMLAttributes } from 'react';

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * Available size options for the Rate component.
 * Maps to CSS variables for consistent styling across engines.
 *
 * @type {string}
 *
 * | Value | CSS Variable | Typical Size |
 * |-------|-------------|--------------|
 * | `xs` | --rate-xs-size | 16px |
 * | `sm` | --rate-sm-size | 20px |
 * | `md` | --rate-md-size | 24px (default) |
 * | `lg` | --rate-lg-size | 32px |
 * | `xl` | --rate-xl-size | 40px |
 */
export type RateSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

/**
 * Available engine options for the Rate component.
 * Determines which rendering implementation is used.
 *
 * @type {string}
 *
 * | Value | Implementation | Use Case |
 * |-------|---------------|----------|
 * | `classic` | Ant Design Rate | Full-featured, enterprise apps |
 * | `modern` | DaisyUI/Tailwind | Utility-first styling |
 * | `rustic` | Vanilla HTML/CSS | Zero dependencies, max accessibility |
 */
export type RateEngine = 'classic' | 'modern' | 'rustic';

/**
 * Props passed to custom character render functions.
 * Allows dynamic rendering based on star position and current value.
 *
 * @interface RateCharacterProps
 *
 * @example
 * ```tsx
 * const renderCharacter = ({ index, value }: RateCharacterProps) => {
 *   if (index < value) {
 *     return <FilledStar />;
 *   }
 *   return <EmptyStar />;
 * };
 *
 * <Rate character={renderCharacter} />
 * ```
 */
export interface RateCharacterProps {
  /**
   * Current star index (0-based).
   * First star is index 0, second is 1, etc.
   */
  index: number;

  /**
   * Current display value of the rating.
   * Reflects either the selected value or hover preview value.
   */
  value: number;
}

// ============================================================================
// Props Interface
// ============================================================================

/**
 * Props for the Rate component.
 *
 * @interface RateProps
 * @extends {Omit<HTMLAttributes<HTMLDivElement>, 'onChange'>}
 *
 * @example Complete Usage
 * ```tsx
 * <Rate
 *   value={rating}
 *   onChange={setRating}
 *   count={5}
 *   allowHalf
 *   allowClear
 *   size="lg"
 *   character={<StarIcon />}
 *   tooltips={['Terrible', 'Bad', 'Normal', 'Good', 'Excellent']}
 *   activeColor="#facc15"
 *   inactiveColor="#d1d5db"
 *   keyboard
 *   autoFocus={false}
 * />
 * ```
 */
export interface RateProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  // ---------------------------------------------------------------------------
  // Value Control
  // ---------------------------------------------------------------------------

  /**
   * Current rating value (controlled mode).
   * When provided, component becomes controlled and requires `onChange`.
   * @example 3
   * @example 4.5 (with allowHalf)
   */
  value?: number;

  /**
   * Default rating value (uncontrolled mode).
   * Used as initial value when component mounts.
   * @default 0
   */
  defaultValue?: number;

  /**
   * Total number of stars to display.
   * @default 5
   */
  count?: number;

  // ---------------------------------------------------------------------------
  // Interaction Behavior
  // ---------------------------------------------------------------------------

  /**
   * Allow selection of half stars.
   * Enables 0.5 increments for more precise ratings.
   * @default false
   */
  allowHalf?: boolean;

  /**
   * Allow clearing the rating by clicking the same star.
   * When enabled, clicking the current value resets to 0.
   * @default true
   */
  allowClear?: boolean;

  /**
   * Whether the rating is disabled.
   * Prevents all user interaction and dims the appearance.
   * @default false
   */
  disabled?: boolean;

  /**
   * Whether the rating is read-only.
   * Displays value but prevents user interaction.
   * Use for displaying existing ratings without modification.
   * @default false
   */
  readOnly?: boolean;

  // ---------------------------------------------------------------------------
  // Event Callbacks
  // ---------------------------------------------------------------------------

  /**
   * Callback fired when the value changes.
   * Called with the new rating value after user interaction.
   * @param value - The new rating value
   */
  onChange?: (value: number) => void;

  /**
   * Callback fired when hovering over stars.
   * Useful for showing preview tooltips or dynamic feedback.
   * @param value - The hovered value (0 when not hovering)
   */
  onHoverChange?: (value: number) => void;

  // ---------------------------------------------------------------------------
  // Appearance
  // ---------------------------------------------------------------------------

  /**
   * Custom character/icon for each star.
   * Can be a ReactNode or a render function for dynamic characters.
   *
   * @example Static character
   * ```tsx
   * <Rate character={<HeartIcon />} />
   * ```
   *
   * @example Dynamic character
   * ```tsx
   * <Rate character={({ index }) => EMOJI_SCALE[index]} />
   * ```
   */
  character?: ReactNode | ((props: RateCharacterProps) => ReactNode);

  /**
   * Custom class name for the container.
   * Appended to the default 'rottay-rate' class.
   */
  className?: string;

  /**
   * Custom inline styles for the container.
   * Merged with component's calculated styles.
   */
  style?: CSSProperties;

  /**
   * Array of tooltips for each star.
   * Index corresponds to star position (0-based).
   * @example ['Terrible', 'Bad', 'Normal', 'Good', 'Excellent']
   */
  tooltips?: string[];

  /**
   * Size of the rate component.
   * Maps to CSS variables for consistent sizing.
   * @default 'md'
   */
  size?: RateSize;

  /**
   * Color of the active (filled) stars.
   * Overrides the default theme color.
   * @example '#facc15'
   * @example 'var(--brand-primary)'
   */
  activeColor?: string;

  /**
   * Color of the inactive (empty) stars.
   * Overrides the default theme color.
   * @example '#d1d5db'
   * @example 'var(--color-gray-300)'
   */
  inactiveColor?: string;

  // ---------------------------------------------------------------------------
  // Accessibility & Behavior
  // ---------------------------------------------------------------------------

  /**
   * Auto focus on mount.
   * Useful for modal forms where rating is primary action.
   * @default false
   */
  autoFocus?: boolean;

  /**
   * Enable keyboard navigation.
   * Arrow keys increase/decrease, Home/End for min/max.
   * @default true
   */
  keyboard?: boolean;

  /**
   * Direction of the rating (for RTL support).
   * Affects keyboard navigation and visual layout.
   * @default 'ltr'
   */
  direction?: 'ltr' | 'rtl';

  // ---------------------------------------------------------------------------
  // Engine Configuration
  // ---------------------------------------------------------------------------

  /**
   * Engine override for this component instance.
   * Overrides the global engine setting from EngineProvider.
   * @example 'classic' | 'modern' | 'rustic'
   */
  engine?: RateEngine;
}

// ============================================================================
// Default Values
// ============================================================================

/**
 * Default configuration values for the Rate component.
 * Used by engine implementations to ensure consistent behavior.
 *
 * @constant
 *
 * @example Accessing Defaults
 * ```tsx
 * import { RATE_DEFAULTS } from '@rottay/design-system';
 *
 * const MyRate = (props: RateProps) => {
 *   const count = props.count ?? RATE_DEFAULTS.count;
 *   const size = props.size ?? RATE_DEFAULTS.size;
 *   // ...
 * };
 * ```
 */
export const RATE_DEFAULTS: Required<Pick<RateProps,
  | 'count'
  | 'defaultValue'
  | 'allowHalf'
  | 'allowClear'
  | 'disabled'
  | 'readOnly'
  | 'keyboard'
  | 'size'
  | 'direction'
>> = {
  /** Default number of stars */
  count: 5,

  /** Default initial value (no stars selected) */
  defaultValue: 0,

  /** Half-star selection disabled by default */
  allowHalf: false,

  /** Clearing enabled by default */
  allowClear: true,

  /** Interactive by default */
  disabled: false,

  /** Editable by default */
  readOnly: false,

  /** Keyboard navigation enabled by default */
  keyboard: true,

  /** Medium size by default */
  size: 'md',

  /** Left-to-right direction by default */
  direction: 'ltr',
};

// ============================================================================
// Size Mapping
// ============================================================================

/**
 * Size mapping to CSS variable tokens.
 * Maps semantic size names to CSS custom properties.
 *
 * @constant
 *
 * @remarks
 * These CSS variables should be defined in your theme tokens:
 * ```css
 * :root {
 *   --rate-xs-size: 16px;
 *   --rate-sm-size: 20px;
 *   --rate-md-size: 24px;
 *   --rate-lg-size: 32px;
 *   --rate-xl-size: 40px;
 * }
 * ```
 *
 * @example Usage
 * ```tsx
 * import { RATE_SIZE_MAP } from '@rottay/design-system';
 *
 * const starStyle = {
 *   width: RATE_SIZE_MAP.lg,
 *   height: RATE_SIZE_MAP.lg,
 * };
 * ```
 */
export const RATE_SIZE_MAP: Record<RateSize, string> = {
  /** Extra small - 16px */
  xs: 'var(--rate-xs-size)',
  /** Small - 20px */
  sm: 'var(--rate-sm-size)',
  /** Medium (default) - 24px */
  md: 'var(--rate-md-size)',
  /** Large - 32px */
  lg: 'var(--rate-lg-size)',
  /** Extra large - 40px */
  xl: 'var(--rate-xl-size)',
};
