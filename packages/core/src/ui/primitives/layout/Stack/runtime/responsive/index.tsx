/** Responsive rendering and style projection owned by the Stack primitive. */

import React, { type ReactNode } from "react";
import {
  isResponsiveValue,
  type ResponsivePropEntry,
} from "@/infrastructure/runtime/responsive/runtime/style-properties";
import {
  ALIGN_MAP,
  JUSTIFY_MAP,
  SPACING_MAP,
  type StackAlign,
  type StackDirection,
  type StackJustify,
  type StackProps,
  type StackSpacing,
  type StackSpacingPreset,
} from "../../contracts";

/** Resolves Stack spacing to CSS. */
export function resolveStackSpacing(value: StackSpacing | undefined): string {
  if (value === undefined || value === "none") return "0";
  if (typeof value === "number") return `${value}px`;
  return SPACING_MAP[value as StackSpacingPreset] || "0";
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

/** Collects Stack props that require responsive CSS projection. */
export function collectStackResponsiveEntries(
  props: StackProps
): ResponsivePropEntry<any>[] {
  const entries: ResponsivePropEntry<any>[] = [];
  const reverse = props.reverse ?? false;

  if (isResponsiveValue(props.direction)) {
    entries.push({
      cssProperty: "flex-direction",
      value: props.direction,
      resolve: (value: StackDirection) => resolveStackDirection(value, reverse),
    });
  }

  const spacing = props.gap ?? props.spacing;
  if (isResponsiveValue(spacing)) {
    entries.push({
      cssProperty: "gap",
      value: spacing,
      resolve: resolveStackSpacing,
    });
  }

  if (isResponsiveValue(props.align)) {
    entries.push({
      cssProperty: "align-items",
      value: props.align,
      resolve: (value: StackAlign) => ALIGN_MAP[value],
    });
  }

  if (isResponsiveValue(props.justify)) {
    entries.push({
      cssProperty: "justify-content",
      value: props.justify,
      resolve: (value: StackJustify) => JUSTIFY_MAP[value],
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
