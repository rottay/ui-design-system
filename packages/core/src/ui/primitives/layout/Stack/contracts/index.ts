/**
 * @fileoverview Stack Types - Rottay Design System
 * @description Type definitions for the Stack layout primitive component.
 * Provides comprehensive typing for direction, spacing, alignment, and layout properties.
 *
 * @remarks
 * The Stack component uses flexbox under the hood, exposing a simplified API
 * that maps to common flexbox patterns. The type system ensures valid combinations
 * of direction, alignment, and justification values.
 *
 * Key features:
 * - **Direction**: `vertical` (column) or `horizontal` (row)
 * - **Spacing presets**: Design token-based gap values
 * - **Alignment**: Cross-axis item alignment (align-items)
 * - **Justification**: Main-axis item distribution (justify-content)
 * - **Dividers**: Automatic or custom separators between items
 *
 * @example Type Usage
 * ```tsx
 * import type { StackProps, StackDirection, StackSpacing } from '@rottay/design-system';
 *
 * // Create a custom stack variant
 * interface FormStackProps extends Partial<StackProps> {
 *   error?: boolean;
 * }
 *
 * // Use types for custom hooks
 * const direction: StackDirection = 'horizontal';
 * const spacing: StackSpacing = 'lg'; // or number like 24
 * ```
 *
 * @see {@link Stack} - The main Stack component
 * @module Stack/Types
 * @category Layout
 * @package @rottay/design-system
 */

import type {
  CSSProperties,
  ElementType,
  HTMLAttributes,
  ReactNode,
} from "react";
import type {
  EngineAwareProps,
  WithChildrenProps,
  BaseComponentProps,
} from "../../../../../foundation/contracts";
import type { ResponsiveValue } from "@/foundation/contracts/kernel/responsive/values";

/**
 * Direction of the stack layout
 * @default 'vertical'
 */
export type StackDirection = "vertical" | "horizontal";

/**
 * Alignment of items along the cross axis
 * @description
 * - 'start': Items are aligned to the start of the cross axis
 * - 'center': Items are centered along the cross axis
 * - 'end': Items are aligned to the end of the cross axis
 * - 'stretch': Items are stretched to fill the cross axis
 * - 'baseline': Items are aligned along their baselines
 */
export type StackAlign = "start" | "center" | "end" | "stretch" | "baseline";

/**
 * Justification of items along the main axis
 * @description
 * - 'start': Items are packed toward the start of the main axis
 * - 'center': Items are centered along the main axis
 * - 'end': Items are packed toward the end of the main axis
 * - 'space-between': Items are evenly distributed with first/last items at edges
 * - 'space-around': Items are evenly distributed with equal space around them
 * - 'space-evenly': Items are evenly distributed with equal space between them
 */
export type StackJustify =
  | "start"
  | "center"
  | "end"
  | "space-between"
  | "space-around"
  | "space-evenly";

/**
 * Predefined spacing values based on design tokens
 */
export type StackSpacingPreset =
  | "none"
  | "xs"
  | "sm"
  | "md"
  | "lg"
  | "xl"
  | "2xl"
  | "3xl"
  | "4xl";

/**
 * Spacing value - can be a preset string or a number (in pixels)
 */
export type StackSpacing = StackSpacingPreset | number;

/** Token-driven transition for intentional layout rearrangement. */
export type StackMotion = "none" | "rearrange";

/**
 * Props for the Stack component.
 * A layout primitive that stacks elements vertically or horizontally
 * with configurable spacing and alignment.
 */
export interface StackProps
  extends EngineAwareProps,
    WithChildrenProps,
    BaseComponentProps,
    Omit<HTMLAttributes<HTMLElement>, "style" | "className" | "dir"> {
  /**
   * The HTML element or React component to render as
   * @default 'div'
   */
  as?: ElementType;

  /**
   * The direction of the stack layout. Accepts a responsive object.
   * @default 'vertical'
   */
  direction?: ResponsiveValue<StackDirection>;

  /**
   * Spacing between stack items. Accepts a responsive object.
   * Can be a preset string (xs, sm, md, lg, xl, 2xl, 3xl, 4xl) or a number in pixels.
   * @default 'md'
   */
  spacing?: ResponsiveValue<StackSpacing>;

  /**
   * Alias for spacing prop (for consistency with CSS gap). Accepts a responsive object.
   */
  gap?: ResponsiveValue<StackSpacing>;

  /**
   * Alignment of items along the cross axis. Accepts a responsive object.
   * @default 'stretch'
   */
  align?: ResponsiveValue<StackAlign>;

  /**
   * Justification of items along the main axis. Accepts a responsive object.
   * @default 'start'
   */
  justify?: ResponsiveValue<StackJustify>;

  /**
   * Whether items should wrap to the next line when they overflow. Accepts a responsive object.
   * @default false
   */
  wrap?: ResponsiveValue<boolean>;

  /**
   * Optional divider element to render between stack items.
   * Can be a boolean (uses default divider) or a custom ReactNode.
   * @default undefined
   */
  divider?: ReactNode;

  /**
   * Whether to reverse the order of items
   * @default false
   */
  reverse?: boolean;

  /**
   * Whether the stack should take up the full width of its container
   * @default false
   */
  fullWidth?: boolean;

  /**
   * Whether the stack should take up the full height of its container
   * @default false
   */
  fullHeight?: boolean;

  /** Animate deliberate structural rearrangement through the global motion tokens. */
  motion?: StackMotion;

  /**
   * Inline styles to apply to the stack
   */
  style?: CSSProperties;

  /**
   * Additional CSS class name(s)
   */
  className?: string;
}

/**
 * Default values for Stack props
 */
export const STACK_DEFAULTS: Required<
  Pick<
    StackProps,
    | "as"
    | "direction"
    | "align"
    | "justify"
    | "spacing"
    | "wrap"
    | "reverse"
    | "fullWidth"
    | "fullHeight"
  >
> = {
  as: "div",
  direction: "vertical",
  align: "stretch",
  justify: "start",
  spacing: "md",
  wrap: false,
  reverse: false,
  fullWidth: false,
  fullHeight: false,
};

/**
 * Spacing value mapping — resolves through DS CSS custom properties so
 * tenant overrides can adjust the spacing scale.
 */
export const SPACING_MAP: Record<StackSpacingPreset, string> = {
  none: "0",
  xs: "var(--ds-spacing-1, 0.25rem)", // 4px
  sm: "var(--ds-spacing-2, 0.5rem)", // 8px
  md: "var(--ds-spacing-4, 1rem)", // 16px
  lg: "var(--ds-spacing-6, 1.5rem)", // 24px
  xl: "var(--ds-spacing-8, 2rem)", // 32px
  "2xl": "var(--ds-spacing-10, 2.5rem)", // 40px
  "3xl": "var(--ds-spacing-12, 3rem)", // 48px
  "4xl": "var(--ds-spacing-16, 4rem)", // 64px
};

/**
 * Alignment value mapping to CSS flexbox values
 */
export const ALIGN_MAP: Record<StackAlign, string> = {
  start: "flex-start",
  center: "center",
  end: "flex-end",
  stretch: "stretch",
  baseline: "baseline",
};

/**
 * Justification value mapping to CSS flexbox values
 */
export const JUSTIFY_MAP: Record<StackJustify, string> = {
  start: "flex-start",
  center: "center",
  end: "flex-end",
  "space-between": "space-between",
  "space-around": "space-around",
  "space-evenly": "space-evenly",
};

/**
 * Converts a spacing value to its CSS equivalent.
 * Accepts preset names or numeric pixel values.
 *
 * @example
 * ```tsx
 * import { resolveSpacing } from '@rottay/design-system';
 *
 * resolveSpacing('md');      // '1rem' (16px)
 * resolveSpacing('xl');      // '2rem' (32px)
 * resolveSpacing(24);        // '24px'
 * resolveSpacing(undefined); // '0'
 * resolveSpacing('none');    // '0'
 *
 * // Usage in component styles
 * const stackStyle = {
 *   gap: resolveSpacing(spacing)
 * };
 * ```
 *
 * Values can arrive from JavaScript, persisted preferences, or arithmetic even
 * when TypeScript authoring is strict. Negative and non-finite spacings
 * collapse to zero instead of leaking `NaNpx`, `Infinitypx`, or invalid
 * negative CSS -- the identical guard `resolveFlexGapValue` already applies, so
 * the two families in this group stop disagreeing about what an unsafe number
 * means. A finite non-negative number is untouched and still produces the exact
 * `${value}px` string it always did.
 *
 * @param value - Spacing value: preset name ('xs', 'sm', 'md', etc.) or number in pixels
 * @returns CSS-compatible spacing value string
 */
export function resolveSpacing(value: StackSpacing | undefined): string {
  if (value === undefined || value === "none") return "0";
  if (typeof value === "number") {
    return Number.isFinite(value) && value >= 0 ? `${value}px` : "0px";
  }
  // `|| "0"` alone leaks a prototype-inherited name: `SPACING_MAP` is a plain
  // object literal, so `"toString"` resolves to a truthy FUNCTION and `||`
  // never reaches its fallback. The own-property guard is what makes this a
  // closed vocabulary rather than a lookup -- same law as `resolveFlexGapValue`.
  return Object.prototype.hasOwnProperty.call(SPACING_MAP, value as string)
    ? SPACING_MAP[value] || "0"
    : "0";
}

/** A rung on the shared spacing ramp: every `SPACING_MAP` key except `none`. */
export type StackSpacingRhythmPreset = Exclude<StackSpacingPreset, "none">;

/**
 * The preset spelling behind a spacing value, or `undefined` when it is a
 * number (exact geometry), `none` (zero has no room to scale) or an
 * unrecognized string.
 *
 * The scalable set is DERIVED from `SPACING_MAP` — the single enumeration the
 * `[data-spacing="..."]` rules in layout-primitives.css already key on — so
 * there is no second list to keep in agreement with it. The twin of
 * `flexGapPresetSpelling`, and the same law: a rung may be scaled by layout
 * rhythm, a measurement never is.
 *
 * OWN-PROPERTY GUARD, not the `in` operator. `in` walks the WHOLE prototype
 * chain, so `"toString" in SPACING_MAP` is `true` -- `SPACING_MAP` is a plain
 * object literal and inherits every `Object.prototype` member name. The old
 * `value in SPACING_MAP` read therefore returned an inherited key such as
 * `"toString"` or `"constructor"` AS IF it were a declared rung, handing
 * `resolveStackSpacingWithRhythm` (Stack/runtime/responsive/index.tsx) a
 * spelling that is not one of the eight the stylesheet enumerates. The
 * resolved magnitude stayed safe either way (`resolveSpacing` already
 * own-property-guards `SPACING_MAP` itself and falls back to `"0"`), but the
 * RESPONSIVE path would then wrap that safe `"0"` in a needless
 * `calc(0 * var(--ds-rhythm-effective-scale, 1))` instead of leaving it
 * exactly `"0"` -- a hostile string masquerading as a scalable rung, and a
 * live break of the doc-stated law that "a caller's measurement is exact
 * geometry under rhythm exactly as under density." `Object.prototype.hasOwnProperty.call`
 * closes the vocabulary to exactly `SPACING_MAP`'s own keys, the identical
 * guard `resolveSpacing` above and `resolveFlexGapValue`/`flexGapPresetSpelling`
 * already apply.
 */
export function stackSpacingPresetSpelling(
  value: StackSpacing | undefined
): StackSpacingRhythmPreset | undefined {
  if (value === undefined || typeof value === "number" || value === "none") {
    return undefined;
  }
  return Object.prototype.hasOwnProperty.call(SPACING_MAP, value as string)
    ? (value as StackSpacingRhythmPreset)
    : undefined;
}
