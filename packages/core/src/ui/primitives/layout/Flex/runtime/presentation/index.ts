import type { CSSProperties } from "react";

import {
  isResponsiveValue,
  scalarOrUndefined,
} from "@/infrastructure/runtime/responsive/runtime/style-properties";
import type {
  FlexAlign,
  FlexDirection,
  FlexGap,
  FlexGapToken,
  FlexJustify,
  FlexProps,
  FlexWrap,
} from "../../contracts";
import { flexGapPresetSpelling, resolveFlexGapValue } from "../../contracts";

type FlexGapMode = "uniform" | "split";

export interface FlexPresentationAttributes {
  "data-direction"?: FlexDirection;
  "data-wrap"?: FlexWrap;
  "data-justify"?: FlexJustify;
  "data-align"?: FlexAlign;
  "data-inline"?: "true";
  "data-gap"?: FlexGapMode;
  /**
   * The preset spelling behind the gap, per axis. Present ONLY when the caller
   * named a rung; a numeric gap stamps nothing, which is what keeps exact
   * geometry out of reach of the rhythm rules in layout-primitives.css. The
   * split axes are stamped separately because `[column, row]` may mix a rung
   * with a measurement.
   */
  "data-gap-preset"?: FlexGapToken;
  "data-column-gap-preset"?: FlexGapToken;
  "data-row-gap-preset"?: FlexGapToken;
  "data-layout-motion"?: "rearrange";
}

type FlexParameterStyle = CSSProperties & {
  "--ds-flex-gap"?: string;
  "--ds-flex-column-gap"?: string;
  "--ds-flex-row-gap"?: string;
};

/**
 * Projects scalar Flex props to neutral attributes.
 * Omitted props stay omitted so the CSS default remains overrideable by every
 * white-label layer. Responsive props remain owned by the responsive runtime.
 */
export function resolveFlexAttributes(
  props: FlexProps
): FlexPresentationAttributes {
  const attributes: FlexPresentationAttributes = {};

  if (props.direction !== undefined && !isResponsiveValue(props.direction)) {
    attributes["data-direction"] = props.direction as FlexDirection;
  }
  if (props.wrap !== undefined && !isResponsiveValue(props.wrap)) {
    attributes["data-wrap"] = props.wrap as FlexWrap;
  }
  if (props.justify !== undefined && !isResponsiveValue(props.justify)) {
    attributes["data-justify"] = props.justify as FlexJustify;
  }
  if (props.align !== undefined && !isResponsiveValue(props.align)) {
    attributes["data-align"] = props.align as FlexAlign;
  }
  if (props.inline) {
    attributes["data-inline"] = "true";
  }

  if (props.gap !== undefined && !isResponsiveValue(props.gap)) {
    const scalarGap = props.gap as FlexGap;
    if (Array.isArray(scalarGap)) {
      attributes["data-gap"] = "split";
      attributes["data-column-gap-preset"] = flexGapPresetSpelling(scalarGap[0]);
      attributes["data-row-gap-preset"] = flexGapPresetSpelling(scalarGap[1]);
    } else {
      attributes["data-gap"] = "uniform";
      attributes["data-gap-preset"] = flexGapPresetSpelling(scalarGap);
    }
  }
  if (props.motion === "rearrange") {
    attributes["data-layout-motion"] = "rearrange";
  }

  return {
    "data-direction": attributes["data-direction"],
    "data-wrap": attributes["data-wrap"],
    "data-justify": attributes["data-justify"],
    "data-align": attributes["data-align"],
    "data-inline": attributes["data-inline"],
    "data-gap": attributes["data-gap"],
    "data-gap-preset": attributes["data-gap-preset"],
    "data-column-gap-preset": attributes["data-column-gap-preset"],
    "data-row-gap-preset": attributes["data-row-gap-preset"],
    "data-layout-motion": attributes["data-layout-motion"],
  };
}

/** Projects arbitrary scalar layout values through bounded custom properties. */
export function resolveFlexParameterStyle(
  props: FlexProps
): FlexParameterStyle | undefined {
  const style: FlexParameterStyle = {};

  if (props.gap !== undefined && !isResponsiveValue(props.gap)) {
    const scalarGap = props.gap as FlexGap;
    if (Array.isArray(scalarGap)) {
      style["--ds-flex-column-gap"] = resolveFlexGapValue(scalarGap[0]);
      style["--ds-flex-row-gap"] = resolveFlexGapValue(scalarGap[1]);
    } else {
      style["--ds-flex-gap"] = resolveFlexGapValue(scalarGap);
    }
  }

  if (props.flex !== undefined) {
    style.flex = props.flex;
  }
  const width = scalarOrUndefined<CSSProperties["width"]>(props.width);
  if (width !== undefined) {
    style.width = width;
  }
  const minWidth = scalarOrUndefined<CSSProperties["minWidth"]>(props.minWidth);
  if (minWidth !== undefined) {
    style.minWidth = minWidth;
  }
  const maxWidth = scalarOrUndefined<CSSProperties["maxWidth"]>(props.maxWidth);
  if (maxWidth !== undefined) {
    style.maxWidth = maxWidth;
  }
  const overflow = scalarOrUndefined<CSSProperties["overflow"]>(props.overflow);
  if (overflow !== undefined) {
    style.overflow = overflow;
  }
  if (props.motion === "rearrange") {
    style.transition = "var(--ds-transition-rearrange)";
  } else if (props.motion === "none") {
    style.transition = "none";
  }
  return Object.keys(style).length > 0 ? style : undefined;
}
