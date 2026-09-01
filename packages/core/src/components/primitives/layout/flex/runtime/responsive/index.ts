/** Responsive style projection owned by the Flex primitive. */

import {
  isResponsiveValue,
  type ResponsivePropEntry,
} from "@/infrastructure/runtime/responsive/runtime/style-properties";
import {
  FLEX_ALIGN_MAP,
  FLEX_JUSTIFY_MAP,
  type FlexAlign,
  type FlexJustify,
  type FlexProps,
  resolveFlexGap,
  resolveFlexGapWithRhythm,
} from "../../contracts";

// Compatibility export for consumers/tests that imported the runtime helper
// before it became the single contract-level normalization path.
export { resolveFlexGap } from "../../contracts";

/**
 * Resolves a responsive `justify` value to CSS, guarded the same way
 * `resolveFlexGapValue` guards the gap token branch: a bare `FLEX_JUSTIFY_MAP[value]`
 * read is a lookup on a plain object literal, so an INHERITED member name
 * ("toString", "constructor") resolves through `Object.prototype` to a
 * FUNCTION rather than `undefined` -- a value the generated responsive CSS
 * text would then carry as its own `.toString()`. An own-property guard makes
 * the map a closed vocabulary; an unrecognized value fails closed to
 * `FLEX_DEFAULTS.justify` ("start"), not to whatever the lookup happened to
 * return.
 */
function resolveFlexJustifyValue(value: FlexJustify): string {
  return Object.prototype.hasOwnProperty.call(FLEX_JUSTIFY_MAP, value as string)
    ? FLEX_JUSTIFY_MAP[value]
    : FLEX_JUSTIFY_MAP.start;
}

/** Resolves a responsive `align` value to CSS with the identical own-property guard. */
function resolveFlexAlignValue(value: FlexAlign): string {
  return Object.prototype.hasOwnProperty.call(FLEX_ALIGN_MAP, value as string)
    ? FLEX_ALIGN_MAP[value]
    : FLEX_ALIGN_MAP.stretch;
}

/** Engine-scoped switches for the shared responsive projection. */
export interface FlexResponsiveOptions {
  /**
   * Project layout rhythm onto responsive PRESET gap axes.
   *
   * OFF by default and deliberately not a shared-runtime default: this
   * collector is the single projection for all three engines, and Classic and
   * Rustic are read-only — their emitted CSS must stay byte-identical. Only
   * the Modern engine opts in, so the rhythm reach stays inside the engine
   * that is being rescued.
   */
  rhythm?: boolean;
}

/** Collects Flex props that require responsive CSS projection. */
export function collectFlexResponsiveEntries(
  props: FlexProps,
  options: FlexResponsiveOptions = {}
): ResponsivePropEntry<any>[] {
  const entries: ResponsivePropEntry<any>[] = [];

  if (isResponsiveValue(props.direction)) {
    entries.push({ cssProperty: "flex-direction", value: props.direction });
  }
  if (isResponsiveValue(props.gap)) {
    entries.push({
      cssProperty: "gap",
      value: props.gap,
      // The generated breakpoint rule carries no `data-gap-preset`, so the
      // scaled rules in layout-primitives.css cannot reach it. Under Modern the
      // rung brings its own calc; every other engine keeps the exact text it
      // emitted before.
      resolve: options.rhythm ? resolveFlexGapWithRhythm : resolveFlexGap,
    });
  }
  if (isResponsiveValue(props.wrap)) {
    entries.push({ cssProperty: "flex-wrap", value: props.wrap });
  }
  if (isResponsiveValue(props.justify)) {
    entries.push({
      cssProperty: "justify-content",
      value: props.justify,
      resolve: resolveFlexJustifyValue,
    });
  }
  if (isResponsiveValue(props.align)) {
    entries.push({
      cssProperty: "align-items",
      value: props.align,
      resolve: resolveFlexAlignValue,
    });
  }

  const cssValueResolver = (value: string | number) =>
    typeof value === "number" ? `${value}px` : String(value);
  if (isResponsiveValue(props.width)) {
    entries.push({
      cssProperty: "width",
      value: props.width,
      resolve: cssValueResolver,
    });
  }
  if (isResponsiveValue(props.minWidth)) {
    entries.push({
      cssProperty: "min-width",
      value: props.minWidth,
      resolve: cssValueResolver,
    });
  }
  if (isResponsiveValue(props.maxWidth)) {
    entries.push({
      cssProperty: "max-width",
      value: props.maxWidth,
      resolve: cssValueResolver,
    });
  }
  if (isResponsiveValue(props.overflow)) {
    entries.push({ cssProperty: "overflow", value: props.overflow });
  }

  return entries;
}
