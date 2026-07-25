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
} from "../../contracts";

// Compatibility export for consumers/tests that imported the runtime helper
// before it became the single contract-level normalization path.
export { resolveFlexGap } from "../../contracts";

/** Collects Flex props that require responsive CSS projection. */
export function collectFlexResponsiveEntries(
  props: FlexProps
): ResponsivePropEntry<any>[] {
  const entries: ResponsivePropEntry<any>[] = [];

  if (isResponsiveValue(props.direction)) {
    entries.push({ cssProperty: "flex-direction", value: props.direction });
  }
  if (isResponsiveValue(props.gap)) {
    entries.push({
      cssProperty: "gap",
      value: props.gap,
      resolve: resolveFlexGap,
    });
  }
  if (isResponsiveValue(props.wrap)) {
    entries.push({ cssProperty: "flex-wrap", value: props.wrap });
  }
  if (isResponsiveValue(props.justify)) {
    entries.push({
      cssProperty: "justify-content",
      value: props.justify,
      resolve: (value: FlexJustify) => FLEX_JUSTIFY_MAP[value],
    });
  }
  if (isResponsiveValue(props.align)) {
    entries.push({
      cssProperty: "align-items",
      value: props.align,
      resolve: (value: FlexAlign) => FLEX_ALIGN_MAP[value],
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
