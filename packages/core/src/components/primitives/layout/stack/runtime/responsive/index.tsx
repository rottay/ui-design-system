/** Responsive rendering and style projection owned by the Stack primitive. */

import React, { type ReactNode } from "react";
import {
  isResponsiveValue,
  type ResponsivePropEntry,
} from "@/infrastructure/runtime/responsive/runtime/style-properties";
import {
  ALIGN_MAP,
  JUSTIFY_MAP,
  resolveSpacing,
  type StackAlign,
  type StackDirection,
  type StackJustify,
  stackSpacingPresetSpelling,
  type StackProps,
  type StackSpacing,
} from "../../contracts";

/**
 * Resolves Stack spacing to CSS.
 *
 * Delegates to the contract-level normalization rather than restating it. These
 * two were hand-copied twins, which is how the responsive path could have
 * drifted from the scalar one on unsafe input; one owner makes that impossible.
 * Kept as a named export because the engines import the resolver from here.
 */
export function resolveStackSpacing(value: StackSpacing | undefined): string {
  return resolveSpacing(value);
}

/**
 * Resolves a responsive `align` value to CSS, guarded the same way
 * `resolveFlexGapValue` guards the gap token branch: a bare `ALIGN_MAP[value]`
 * read is a lookup on a plain object literal, so an INHERITED member name
 * ("toString", "constructor") resolves through `Object.prototype` to a
 * FUNCTION rather than `undefined` -- a value the generated responsive CSS
 * text would then carry as its own `.toString()`. An own-property guard makes
 * the map a closed vocabulary; an unrecognized value fails closed to
 * `STACK_DEFAULTS.align` ("stretch"), not to whatever the lookup happened to
 * return.
 */
function resolveStackAlignValue(value: StackAlign): string {
  return Object.prototype.hasOwnProperty.call(ALIGN_MAP, value as string)
    ? ALIGN_MAP[value]
    : ALIGN_MAP.stretch;
}

/** Resolves a responsive `justify` value to CSS with the identical own-property guard. */
function resolveStackJustifyValue(value: StackJustify): string {
  return Object.prototype.hasOwnProperty.call(JUSTIFY_MAP, value as string)
    ? JUSTIFY_MAP[value]
    : JUSTIFY_MAP.start;
}

/**
 * The CLAMPED rhythm channel, read with the same `, 1` fallback the stylesheet
 * uses so an unset tenant leaves a rung byte-identical to the pre-rhythm
 * cascade. Reading the raw `--ds-rhythm-scale` would skip the 0.8..1.25 clamp.
 */
const RHYTHM_EFFECTIVE_SCALE = "var(--ds-rhythm-effective-scale, 1)";

/**
 * `resolveStackSpacing` with layout rhythm projected onto preset rungs only.
 *
 * The scalar path stamps `data-spacing` and lets layout-primitives.css scale
 * the rung where `--_ds-stack-gap-current` is assigned. The RESPONSIVE path
 * stamps no such attribute — the value changes per breakpoint — so its
 * generated rule matches none of those selectors and the rung must carry its
 * own `calc()`. Built on `resolveStackSpacing` itself, so the scaled and
 * unscaled outputs can differ by nothing except the wrapper.
 *
 * A number, `none` and an unrecognized string come back untouched: a caller's
 * measurement is exact geometry under rhythm exactly as under density.
 */
export function resolveStackSpacingWithRhythm(
  value: StackSpacing | undefined
): string {
  const resolved = resolveStackSpacing(value);
  return stackSpacingPresetSpelling(value) === undefined
    ? resolved
    : `calc(${resolved} * ${RHYTHM_EFFECTIVE_SCALE})`;
}

/** Resolves Stack direction and reverse state to CSS flex-direction. */
export function resolveStackDirection(
  direction: StackDirection,
  reverse: boolean
): "column" | "column-reverse" | "row" | "row-reverse" {
  if (direction === "vertical") {
    return reverse ? "column-reverse" : "column";
  }
  return reverse ? "row-reverse" : "row";
}

/** Engine-scoped switches for the shared responsive projection. */
export interface StackResponsiveOptions {
  /**
   * Project layout rhythm onto responsive PRESET spacing rungs.
   *
   * OFF by default and deliberately not a shared-runtime default: this
   * collector is the single projection for all three engines, and Classic and
   * Rustic are read-only — their emitted CSS must stay byte-identical. Only
   * the Modern engine opts in.
   */
  rhythm?: boolean;
}

/** Collects Stack props that require responsive CSS projection. */
export function collectStackResponsiveEntries(
  props: StackProps,
  options: StackResponsiveOptions = {}
): ResponsivePropEntry<any>[] {
  const entries: ResponsivePropEntry<any>[] = [];
  const reverse = props.reverse ?? false;
  const resolveSpacingEntry = options.rhythm
    ? resolveStackSpacingWithRhythm
    : resolveStackSpacing;

  if (isResponsiveValue(props.direction)) {
    entries.push({
      cssProperty: "flex-direction",
      value: props.direction,
      resolve: (value: StackDirection) => resolveStackDirection(value, reverse),
    });
    // With a divider interleaved, the hairline's centering margins must
    // follow the same per-breakpoint axis. The skin reads these root-declared
    // flags (custom properties inherit to the generated divider) because a
    // responsive direction stamps no data-direction attribute for the skin's
    // horizontal rule to select on. Reverse only flips order, never the axis.
    if (props.divider) {
      entries.push({
        cssProperty: "--_ds-stack-divider-gap-block",
        value: props.direction,
        resolve: (value: StackDirection) =>
          value === "horizontal"
            ? "var(--ds-stack-divider-inset, 0px)"
            : "calc(var(--_ds-stack-gap-current, 0px) / -2)",
      });
      entries.push({
        cssProperty: "--_ds-stack-divider-gap-inline",
        value: props.direction,
        resolve: (value: StackDirection) =>
          value === "horizontal"
            ? "calc(var(--_ds-stack-gap-current, 0px) / -2)"
            : "var(--ds-stack-divider-inset, 0px)",
      });
    }
  }

  const spacing = props.gap ?? props.spacing;
  if (isResponsiveValue(spacing)) {
    entries.push({
      cssProperty: "gap",
      value: spacing,
      resolve: resolveSpacingEntry,
    });
    // The divider mirror centers on --_ds-stack-gap-current; re-project it
    // with the SAME resolution as the gap entry so the hairline tracks the
    // responsive rhythm instead of the stale static (or default) preset.
    //
    // Both declarations carry the scale ONCE each, which is not a double
    // application: they are separate declarations of separate properties, and
    // the divider reads this channel plainly (`/ -2`) rather than re-scaling
    // it. The generated `gap` here is a literal value, not a read of this
    // channel, so nothing multiplies the factor twice along one arm.
    entries.push({
      cssProperty: "--_ds-stack-gap-current",
      value: spacing,
      resolve: resolveSpacingEntry,
    });
  }

  if (isResponsiveValue(props.align)) {
    entries.push({
      cssProperty: "align-items",
      value: props.align,
      resolve: resolveStackAlignValue,
    });
  }

  if (isResponsiveValue(props.justify)) {
    entries.push({
      cssProperty: "justify-content",
      value: props.justify,
      resolve: resolveStackJustifyValue,
    });
  }

  if (isResponsiveValue(props.wrap)) {
    entries.push({
      cssProperty: "flex-wrap",
      value: props.wrap,
      resolve: (value: boolean) => (value ? "wrap" : "nowrap"),
    });
  }

  return entries;
}

/** Interleaves optional divider content between Stack children. */
export function renderStackChildren(
  children: ReactNode,
  divider: ReactNode | undefined,
  _direction: StackDirection
): ReactNode {
  // `React.Children.toArray` already removes the empty React nodes we do not
  // render. Do not apply a truthiness filter here: numeric `0` and the empty
  // string are legitimate layout children and must keep their position when
  // dividers are interleaved.
  const childArray = React.Children.toArray(children);
  if (!divider || childArray.length <= 1) return childArray;

  return childArray.reduce<ReactNode[]>((accumulator, child, index) => {
    if (index === 0) return [child];

    const dividerElement = React.isValidElement(divider) ? (
      React.cloneElement(
        divider as React.ReactElement<Record<string, unknown>>,
        {
          key: `divider-${index}`,
          "aria-hidden": true,
          "data-part": "divider",
        }
      )
    ) : (
      <span
        key={`divider-${index}`}
        aria-hidden="true"
        className="rottay-stack-divider"
        data-part="divider"
      />
    );

    return [...accumulator, dividerElement, child];
  }, []);
}
