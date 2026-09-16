"use client";

/**
 * @fileoverview Space Modern Engine - Rottay Design System
 * @description Modern, token-driven implementation of the Space component.
 * The engine stamps the rung decision (`data-size`) and the anatomy
 * (`data-direction`/`data-align`/`data-wrap`); the Modern skin
 * (`runtime/engines/modern/skin/space/index.css`) owns layout, alignment and
 * motion through the `--ds-space-*` channels. Only exact geometry -- a number
 * or a `[column, row]` pair -- travels inline, on `--ds-space-gap`.
 *
 * @remarks
 * **When to use Space vs Stack (kept in sync with the layout sisters):**
 * - **Stack** is the modern one-dimensional rhythm: spacing presets on the
 *   `--ds-spacing-*` ramp with density scaling, optional hairline dividers,
 *   full width semantics.
 * - **Space** is the legacy inline variant of the same idea: `inline-flex`
 *   with the `--ds-space-{small,middle,large}-size` presets (compat aliases
 *   of the ramp), `align` including `baseline`, optional `split` separators
 *   interleaved between children. New code should reach for Stack; Space
 *   stays for API compatibility.
 * - **Box/flex/Grid** cover single-element escape hatch, explicit axis and
 *   two-dimensional tracks respectively.
 *
 * Split separators are handled by inserting elements between children.
 *
 * @example Using Modern Engine
 * ```tsx
 * import { Space } from '@rottay/design-system';
 *
 * <Space engine="modern" size="middle" wrap>
 *   <Tag>Tag 1</Tag>
 *   <Tag>Tag 2</Tag>
 * </Space>
 * ```
 *
 * @see {@link Space} - The main engine-aware component
 * @module Space/Engines/Modern
 * @category Layout
 * @package @rottay/design-system
 */
import React, { Children } from "react";
import type { SpaceProps } from "../../contracts";
import { SPACE_DEFAULTS } from "../../contracts";

function safeGap(value: number): string {
  return Number.isFinite(value) && value >= 0 ? `${value}px` : "0px";
}

// `toArray` counts a fragment as ONE child, so its members would share a
// single separator; flattening restores per-member separation.
function flattenFragments(node: React.ReactNode): React.ReactNode[] {
  return Children.toArray(node).flatMap((child) => {
    if (
      !React.isValidElement<{ children?: React.ReactNode }>(child) ||
      child.type !== React.Fragment
    ) {
      return [child];
    }
    return flattenFragments(child.props.children).map((member, index) =>
      React.isValidElement<Record<string, unknown>>(member)
        ? React.cloneElement(member, { key: `${String(child.key)}-${index}` })
        : member
    );
  });
}

type SpaceInstanceStyle = React.CSSProperties & {
  "--ds-space-gap"?: string;
};

/**
 * Modern engine implementation of the Space component.
 * A named rung is stamped, never resolved here: the skin maps `data-size` onto
 * the rhythm-aware rungs the deriver produces. A number or an array tuple is
 * exact geometry, so it -- and only it -- is projected inline onto the same
 * `--ds-space-gap` channel.
 *
 * @param props - Space configuration (size, direction, wrap, align, split)
 * @returns A div stamped with the space anatomy and the instance gap channel
 */
export const Space = React.forwardRef<HTMLDivElement, SpaceProps>(
  (props, ref) => {
    const {
      size = SPACE_DEFAULTS.size,
      direction = SPACE_DEFAULTS.direction,
      wrap = SPACE_DEFAULTS.wrap,
      align = SPACE_DEFAULTS.align,
      split,
      children,
      className,
      style,
      ...rest
    } = props;

    const classes = ["ds-space", "ds-space--modern"];

    // Exact geometry only. A preset spelling resolves through the cascade, and
    // a spelling no rung rule enumerates falls closed to the declared rung the
    // deriver rests `--ds-space-gap` on.
    let gapValue: string | undefined;
    if (typeof size === "number") {
      gapValue = safeGap(size);
    } else if (Array.isArray(size)) {
      // CSS gap shorthand: row-gap first, then column-gap
      gapValue = `${safeGap(size[1])} ${safeGap(size[0])}`;
    }

    const customStyle: SpaceInstanceStyle = {
      ...(gapValue === undefined ? {} : { "--ds-space-gap": gapValue }),
      ...style,
    };

    const combinedClassName = [classes.join(" "), className]
      .filter(Boolean)
      .join(" ");

    // When a split separator is provided, interleave it between each child.
    // Otherwise pass children through unmodified to avoid unnecessary array conversion.
    const childArray = flattenFragments(children);
    const renderedChildren = split
      ? childArray.map((child, index) => (
          <React.Fragment
            key={
              React.isValidElement(child) && child.key != null
                ? child.key
                : index
            }
          >
            {child}
            {index < childArray.length - 1 && (
              <span
                aria-hidden="true"
                role="presentation"
                data-part="separator"
                className="ds-space-separator"
              >
                {split}
              </span>
            )}
          </React.Fragment>
        ))
      : children;

    return (
      <div
        ref={ref}
        {...rest}
        className={combinedClassName}
        style={customStyle}
        data-part="root"
        data-direction={direction}
        data-align={align}
        data-wrap={wrap || undefined}
        data-size={Array.isArray(size) ? size.join(":") : size}
        data-with-split={split ? "true" : "false"}
        data-component="space"
      >
        {renderedChildren}
      </div>
    );
  }
);

Space.displayName = "Space.Modern";

export default Space;
