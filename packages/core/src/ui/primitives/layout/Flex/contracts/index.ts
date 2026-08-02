/**
 * @fileoverview Flex Types - Rottay Design System
 * @description Type definitions for the Flex layout component.
 * Provides comprehensive typing for flexbox direction, alignment, justification, and wrapping.
 *
 * @remarks
 * The Flex component uses CSS Flexbox terminology directly, making it intuitive
 * for developers familiar with CSS. The type system ensures valid combinations
 * of flexbox properties while providing helpful documentation.
 *
 * Key type mappings:
 * - `FlexDirection`: Maps to CSS flex-direction (row, column, row-reverse, column-reverse)
 * - `FlexWrap`: Maps to CSS flex-wrap (nowrap, wrap, wrap-reverse)
 * - `FlexJustify`: Maps to CSS justify-content with shorthand names
 * - `FlexAlign`: Maps to CSS align-items with shorthand names
 *
 * @example Type Usage
 * ```tsx
 * import type { FlexProps, FlexDirection, FlexJustify } from '@rottay/design-system';
 *
 * // Create a custom flex wrapper
 * interface CardRowProps extends Partial<FlexProps> {
 *   title: string;
 * }
 *
 * // Use types for state management
 * const [direction, setDirection] = useState<FlexDirection>('row');
 * const [justify, setJustify] = useState<FlexJustify>('between');
 * ```
 *
 * @see {@link Flex} - The main Flex component
 * @module Flex/Types
 * @category Layout
 * @package @rottay/design-system
 */

import type { ReactNode, CSSProperties, AriaRole, HTMLAttributes } from "react";
import type { BaseComponentProps } from "@/foundation/contracts/kernel/common";
import type { ResponsiveValue } from "@/foundation/contracts/kernel/responsive/values";

export type FlexDirection = "row" | "row-reverse" | "column" | "column-reverse";
export type FlexWrap = "nowrap" | "wrap" | "wrap-reverse";
export type FlexJustify =
  | "start"
  | "end"
  | "center"
  | "between"
  | "around"
  | "evenly";
export type FlexAlign = "start" | "end" | "center" | "baseline" | "stretch";
export type FlexGapToken =
  | "none"
  | "xs"
  | "sm"
  | "md"
  | "lg"
  | "xl"
  | "2xl"
  | "3xl"
  | "4xl";
export type FlexGapValue = FlexGapToken | number;
export type FlexGap = FlexGapValue | [FlexGapValue, FlexGapValue];
export type FlexMotion = "none" | "rearrange";

export interface FlexProps
  extends BaseComponentProps,
    Omit<
      HTMLAttributes<HTMLDivElement>,
      "style" | "className" | "children" | "role" | "dir"
    > {
  /** Flex direction. Accepts a responsive object for breakpoint-aware values. */
  direction?: ResponsiveValue<FlexDirection>;
  /** Flex wrap behavior. Accepts a responsive object for breakpoint-aware values. */
  wrap?: ResponsiveValue<FlexWrap>;
  /** Justify content alignment. Accepts a responsive object for breakpoint-aware values. */
  justify?: ResponsiveValue<FlexJustify>;
  /** Align items alignment. Accepts a responsive object for breakpoint-aware values. */
  align?: ResponsiveValue<FlexAlign>;
  /** Gap between items: token/px value or [column, row]. Accepts a responsive object. */
  gap?: ResponsiveValue<FlexGap>;
  /** Flex property value */
  flex?: string | number;
  /** Use inline-flex instead of flex */
  inline?: boolean;
  /** Flex content */
  children?: ReactNode;
  /** Additional CSS classes */
  className?: string;
  /** Inline styles */
  style?: CSSProperties;
  /** Rendering engine override */
  engine?: "classic" | "modern" | "rustic";
  /** Semantic landmark or grouping role forwarded to the owned root element. */
  role?: AriaRole;
  /** Width of the flex formatting context. */
  width?: ResponsiveValue<CSSProperties["width"]>;
  /** Minimum width. Modern defaults to min-inline-size: 0 for safe nesting. */
  minWidth?: ResponsiveValue<CSSProperties["minWidth"]>;
  /** Maximum width of the flex formatting context. */
  maxWidth?: ResponsiveValue<CSSProperties["maxWidth"]>;
  /** Overflow policy. */
  overflow?: ResponsiveValue<CSSProperties["overflow"]>;
  /** Token-driven transition for deliberate layout rearrangement. */
  motion?: FlexMotion;
}

export const FLEX_DEFAULTS: Partial<FlexProps> = {
  direction: "row",
  wrap: "nowrap",
  justify: "start",
  align: "stretch",
  inline: false,
};

/** CSS justify-content mapping */
export const FLEX_JUSTIFY_MAP: Record<FlexJustify, string> = {
  start: "flex-start",
  end: "flex-end",
  center: "center",
  between: "space-between",
  around: "space-around",
  evenly: "space-evenly",
};

/** CSS align-items mapping */
export const FLEX_ALIGN_MAP: Record<FlexAlign, string> = {
  start: "flex-start",
  end: "flex-end",
  center: "center",
  baseline: "baseline",
  stretch: "stretch",
};

/** Gap token mapping kept on the shared tenant spacing ramp. */
export const FLEX_GAP_MAP: Record<FlexGapToken, string> = {
  none: "0",
  xs: "var(--ds-spacing-1, 0.25rem)",
  sm: "var(--ds-spacing-2, 0.5rem)",
  md: "var(--ds-spacing-4, 1rem)",
  lg: "var(--ds-spacing-6, 1.5rem)",
  xl: "var(--ds-spacing-8, 2rem)",
  "2xl": "var(--ds-spacing-10, 2.5rem)",
  "3xl": "var(--ds-spacing-12, 3rem)",
  "4xl": "var(--ds-spacing-16, 4rem)",
};

/**
 * Resolves one public gap value into deterministic CSS.
 *
 * Values can arrive from JavaScript, persisted preferences, or arithmetic even
 * when TypeScript authoring is strict. Negative and non-finite gaps collapse
 * to zero instead of leaking `NaNpx`, `Infinitypx`, or invalid negative CSS.
 */
export function resolveFlexGapValue(value: FlexGapValue): string {
  if (typeof value !== "number") return FLEX_GAP_MAP[value];
  return Number.isFinite(value) && value >= 0 ? `${value}px` : "0px";
}

/**
 * The gap spellings that layout rhythm may scale.
 *
 * A preset names a RUNG on the shared spacing ramp, so the tenant
 * `appearance.rhythm` axis is entitled to size the room it asks for. A number
 * is exact geometry and is never scaled -- the same law Stack declares for its
 * `custom` rung and Space for its raw sizes. `none` is deliberately absent: a
 * caller who asks for zero room means zero, and 0 has nothing to scale.
 *
 * The CSS side keys on these exact strings (layout-primitives.css), so this
 * array is the single source of the enumeration. Adding a rung here without
 * adding its selector there leaves the new rung unscaled, which the census
 * drill in the no-loss suite reports.
 */
export const FLEX_GAP_RHYTHM_PRESETS = [
  "xs",
  "sm",
  "md",
  "lg",
  "xl",
  "2xl",
  "3xl",
  "4xl",
] as const satisfies readonly FlexGapToken[];

/**
 * The preset spelling a gap value carries, or undefined when it is a number
 * (exact geometry) or `none`. Callers stamp the result on the DOM so CSS can
 * tell a rung from a measurement -- the distinction the single
 * `--ds-flex-gap` channel cannot express on its own.
 */
export function flexGapPresetSpelling(
  value: FlexGapValue | undefined
): FlexGapToken | undefined {
  if (value === undefined || typeof value === "number") return undefined;
  return (FLEX_GAP_RHYTHM_PRESETS as readonly string[]).includes(value)
    ? value
    : undefined;
}

/** Resolves the public `[column, row]` tuple into CSS `row column` order. */
export function resolveFlexGap(gap: FlexGap): string {
  if (Array.isArray(gap)) {
    return `${resolveFlexGapValue(gap[1])} ${resolveFlexGapValue(gap[0])}`;
  }
  return resolveFlexGapValue(gap);
}
