"use client";

/**
 * @fileoverview Space Modern Engine - Rottay Design System
 * @description Modern (DaisyUI/Tailwind) implementation of the Space component.
 * Uses Tailwind CSS utility classes with inline gap styles.
 *
 * @remarks
 * The Modern engine generates:
 * - `inline-flex` for inline display
 * - `flex-row` or `flex-col` based on direction
 * - `flex-wrap` when wrapping is enabled
 * - `items-*` classes for alignment
 * - Inline `gap` style for spacing (supports all size formats)
 *
 * Split separators are handled by inserting elements between children.
 *
 * @example Using Modern Engine
 * ```tsx
 * import { Space } from '@rottay/design-system';
 *
 * // Generates: class="inline-flex flex-row items-center flex-wrap"
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
import { SPACE_DEFAULTS, SPACE_SIZE_MAP } from "../../contracts";
import { toLegacySize } from "../../../../../../foundation/contracts/kernel/common";

function safeGap(value: number): string {
  return Number.isFinite(value) && value >= 0 ? `${value}px` : "0px";
}

type SpaceInstanceStyle = React.CSSProperties & {
  "--ds-space-instance-gap": string;
};

/**
 * Modern engine implementation of the Space component.
 * Builds Tailwind utility classes for flex layout while using inline `gap`
 * styles for spacing, since Tailwind's gap utilities cannot accept dynamic
 * pixel values or CSS variable tokens at runtime.
 *
 * @param props - Space configuration (size, direction, wrap, align, split)
 * @returns A plain div with Tailwind classes and inline gap style
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

    const classes = ["rottay-space", "rottay-space--modern"];

    // Resolve the gap as an inline CSS value rather than a Tailwind class because
    // the size prop can be a number, an array tuple, or a CSS variable token string --
    // none of which map cleanly to static Tailwind gap-* classes.
    let gapValue: string;
    if (typeof size === "number") {
      gapValue = safeGap(size);
    } else if (Array.isArray(size)) {
      // CSS gap shorthand: row-gap first, then column-gap
      gapValue = `${safeGap(size[1])} ${safeGap(size[0])}`;
    } else {
      // SPACE_SIZE_MAP is keyed by the legacy 'small' | 'middle' | 'large' spelling;
      // toLegacySize resolves either spelling to it.
      const legacySize = toLegacySize(size);
      gapValue = SPACE_SIZE_MAP[legacySize || "small"] || SPACE_SIZE_MAP.small;
    }

    const customStyle: SpaceInstanceStyle = {
      "--ds-space-instance-gap": gapValue,
      ...style,
    };

    const combinedClassName = [classes.join(" "), className]
      .filter(Boolean)
      .join(" ");

    // When a split separator is provided, interleave it between each child.
    // Otherwise pass children through unmodified to avoid unnecessary array conversion.
    const childArray = Children.toArray(children);
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
                className="rottay-space-separator"
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
