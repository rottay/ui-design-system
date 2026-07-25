/** Responsive style projection owned by the Box primitive. */

import {
  isResponsiveValue,
  type ResponsivePropEntry,
} from "@/infrastructure/runtime/responsive/runtime/style-properties";
import type { ResponsiveValue } from "@/foundation/contracts/kernel/responsive/values";
import { SPACING_MAP, type BoxProps, type BoxSpacing } from "../../contracts";

/** Resolves a Box spacing token to its CSS value. */
export function resolveBoxSpacing(value: BoxSpacing): string {
  if (value === "none") return "0";
  return SPACING_MAP[value] || "0";
}

/** Collects Box props that require responsive CSS projection. */
export function collectBoxResponsiveEntries(
  props: BoxProps
): ResponsivePropEntry<any>[] {
  const entries: ResponsivePropEntry<any>[] = [];
  const spacingResolver = (value: BoxSpacing) => resolveBoxSpacing(value);
  const cssValueResolver = (value: any) =>
    typeof value === "number" ? `${value}px` : String(value);

  const padding = props.padding ?? props.p;
  if (isResponsiveValue(padding)) {
    entries.push({
      cssProperty: "padding",
      value: padding,
      resolve: spacingResolver,
    });
  }

  const paddingX = props.paddingX ?? props.px;
  if (isResponsiveValue(paddingX)) {
    entries.push({
      cssProperty: "padding-left",
      value: paddingX,
      resolve: spacingResolver,
    });
    entries.push({
      cssProperty: "padding-right",
      value: paddingX,
      resolve: spacingResolver,
    });
  }

  const paddingY = props.paddingY ?? props.py;
  if (isResponsiveValue(paddingY)) {
    entries.push({
      cssProperty: "padding-top",
      value: paddingY,
      resolve: spacingResolver,
    });
    entries.push({
      cssProperty: "padding-bottom",
      value: paddingY,
      resolve: spacingResolver,
    });
  }

  const directionalPadding: Array<
    [string, ResponsiveValue<BoxSpacing> | undefined]
  > = [
    ["padding-top", props.paddingTop ?? props.pt],
    ["padding-right", props.paddingRight ?? props.pr],
    ["padding-bottom", props.paddingBottom ?? props.pb],
    ["padding-left", props.paddingLeft ?? props.pl],
    ["padding-inline", props.paddingInline],
    ["padding-block", props.paddingBlock],
    ["padding-inline-start", props.paddingInlineStart],
    ["padding-inline-end", props.paddingInlineEnd],
    ["padding-block-start", props.paddingBlockStart],
    ["padding-block-end", props.paddingBlockEnd],
  ];
  for (const [cssProperty, value] of directionalPadding) {
    if (isResponsiveValue(value)) {
      entries.push({ cssProperty, value, resolve: spacingResolver });
    }
  }

  const margin = props.margin ?? props.m;
  if (isResponsiveValue(margin)) {
    entries.push({
      cssProperty: "margin",
      value: margin,
      resolve: spacingResolver,
    });
  }

  const marginX = props.marginX ?? props.mx;
  if (isResponsiveValue(marginX)) {
    entries.push({
      cssProperty: "margin-left",
      value: marginX,
      resolve: spacingResolver,
    });
    entries.push({
      cssProperty: "margin-right",
      value: marginX,
      resolve: spacingResolver,
    });
  }

  const marginY = props.marginY ?? props.my;
  if (isResponsiveValue(marginY)) {
    entries.push({
      cssProperty: "margin-top",
      value: marginY,
      resolve: spacingResolver,
    });
    entries.push({
      cssProperty: "margin-bottom",
      value: marginY,
      resolve: spacingResolver,
    });
  }

  const directionalMargin: Array<
    [string, ResponsiveValue<BoxSpacing> | undefined]
  > = [
    ["margin-top", props.marginTop ?? props.mt],
    ["margin-right", props.marginRight ?? props.mr],
    ["margin-bottom", props.marginBottom ?? props.mb],
    ["margin-left", props.marginLeft ?? props.ml],
    ["margin-inline", props.marginInline],
    ["margin-block", props.marginBlock],
    ["margin-inline-start", props.marginInlineStart],
    ["margin-inline-end", props.marginInlineEnd],
    ["margin-block-start", props.marginBlockStart],
    ["margin-block-end", props.marginBlockEnd],
  ];
  for (const [cssProperty, value] of directionalMargin) {
    if (isResponsiveValue(value)) {
      entries.push({ cssProperty, value, resolve: spacingResolver });
    }
  }

  if (isResponsiveValue(props.display)) {
    entries.push({ cssProperty: "display", value: props.display });
  }

  const width = props.width ?? props.w;
  if (isResponsiveValue(width)) {
    entries.push({
      cssProperty: "width",
      value: width,
      resolve: cssValueResolver,
    });
  }

  const minWidth = props.minWidth ?? props.minW;
  if (isResponsiveValue(minWidth)) {
    entries.push({
      cssProperty: "min-width",
      value: minWidth,
      resolve: cssValueResolver,
    });
  }

  const maxWidth = props.maxWidth ?? props.maxW;
  if (isResponsiveValue(maxWidth)) {
    entries.push({
      cssProperty: "max-width",
      value: maxWidth,
      resolve: cssValueResolver,
    });
  }

  const height = props.height ?? props.h;
  if (isResponsiveValue(height)) {
    entries.push({
      cssProperty: "height",
      value: height,
      resolve: cssValueResolver,
    });
  }

  const minHeight = props.minHeight ?? props.minH;
  if (isResponsiveValue(minHeight)) {
    entries.push({
      cssProperty: "min-height",
      value: minHeight,
      resolve: cssValueResolver,
    });
  }

  const maxHeight = props.maxHeight ?? props.maxH;
  if (isResponsiveValue(maxHeight)) {
    entries.push({
      cssProperty: "max-height",
      value: maxHeight,
      resolve: cssValueResolver,
    });
  }

  if (isResponsiveValue(props.overflow)) {
    entries.push({ cssProperty: "overflow", value: props.overflow });
  }
  if (isResponsiveValue(props.overflowX)) {
    entries.push({ cssProperty: "overflow-x", value: props.overflowX });
  }
  if (isResponsiveValue(props.overflowY)) {
    entries.push({ cssProperty: "overflow-y", value: props.overflowY });
  }

  return entries;
}
