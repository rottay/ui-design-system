import type { CSSProperties } from "react";

import { isResponsiveValue } from "@/infrastructure/runtime/responsive/runtime/style-properties";
import type {
  StackAlign,
  StackDirection,
  StackJustify,
  StackProps,
  StackSpacingPreset,
} from "../../contracts";

type StackSpacingAttribute = StackSpacingPreset | "custom";

export interface StackPresentationAttributes {
  "data-direction"?: StackDirection;
  "data-align"?: StackAlign;
  "data-justify"?: StackJustify;
  "data-wrap"?: "true";
  "data-reverse"?: "true";
  "data-spacing"?: StackSpacingAttribute;
  "data-full-width"?: "true";
  "data-full-height"?: "true";
  "data-layout-motion"?: "rearrange";
}

type StackParameterStyle = CSSProperties & {
  "--ds-stack-gap"?: string;
};

export interface StackPresentation {
  attributes: StackPresentationAttributes;
  style?: StackParameterStyle;
}

/**
 * Projects scalar Stack props to neutral attributes. Preset spacing resolves
 * in CSS through the tenant spacing ramp; arbitrary numeric gaps use one
 * bounded custom property instead of owning the structural `gap` declaration.
 */
export function resolveStackPresentation(props: StackProps): StackPresentation {
  const attributes: StackPresentationAttributes = {};
  const style: StackParameterStyle = {};

  if (props.direction !== undefined && !isResponsiveValue(props.direction)) {
    attributes["data-direction"] = props.direction as StackDirection;
  }
  if (props.align !== undefined && !isResponsiveValue(props.align)) {
    attributes["data-align"] = props.align as StackAlign;
  }
  if (props.justify !== undefined && !isResponsiveValue(props.justify)) {
    attributes["data-justify"] = props.justify as StackJustify;
  }
  if (props.wrap === true) {
    attributes["data-wrap"] = "true";
  }
  if (props.reverse) {
    attributes["data-reverse"] = "true";
  }

  const spacing = props.gap ?? props.spacing;
  if (spacing !== undefined && !isResponsiveValue(spacing)) {
    if (typeof spacing === "number") {
      attributes["data-spacing"] = "custom";
      style["--ds-stack-gap"] = `${spacing}px`;
    } else {
      attributes["data-spacing"] = spacing as StackSpacingPreset;
    }
  }

  if (props.fullWidth) {
    attributes["data-full-width"] = "true";
  }
  if (props.fullHeight) {
    attributes["data-full-height"] = "true";
  }
  if (props.motion === "rearrange") {
    attributes["data-layout-motion"] = "rearrange";
    style.transition = "var(--ds-transition-rearrange)";
  } else if (props.motion === "none") {
    style.transition = "none";
  }
  if (props.style) {
    Object.assign(style, props.style);
  }

  return {
    attributes,
    style: Object.keys(style).length > 0 ? style : undefined,
  };
}
