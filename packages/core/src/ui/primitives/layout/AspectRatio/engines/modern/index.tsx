/**
 * @fileoverview AspectRatio Modern Engine - Rottay Design System.
 * Token-driven implementation that leverages the native CSS `aspect-ratio`
 * property for a single-div solution (no padding-bottom hack). Requires
 * modern browser support (Chrome 88+, Firefox 89+, Safari 15+).
 *
 * @remarks
 * **When to use AspectRatio vs Box (kept in sync with the layout sisters):**
 * - **Box** is the polymorphic single-element escape hatch: you can give any
 *   Box an explicit height and an `overflow` policy.
 * - **AspectRatio** (this primitive) is the governed media frame: the height
 *   DERIVES from the inline size through the caller's `ratio` (data, never a
 *   painted literal), so embedded media (`img`, `video`, `iframe`, `canvas`)
 *   fills the frame without distortion — the skin's object-fit/object-position
 *   channels decide crop and focal point. If the content is not media-shaped,
 *   you wanted Box.
 * The engine projects only instance geometry (`--ds-aspect-ratio-instance-*`);
 * structure, material and motion live in the shared declarative skin
 * (`presentation/components/skin/layout-primitives.css`, AspectRatio section).
 *
 * @example
 * ```tsx
 * <ModernAspectRatio ratio={4 / 3} maxWidth="800px">
 *   <video src="/intro.mp4" />
 * </ModernAspectRatio>
 * ```
 *
 * @module ModernAspectRatio
 * @category Layout
 * @package @rottay/design-system
 */

"use client";

import React from "react";
import type { AspectRatioProps } from "../../contracts";
import { ASPECT_RATIO_DEFAULTS } from "../../contracts";

type AspectRatioInstanceStyle = React.CSSProperties & {
  "--ds-aspect-ratio-instance-ratio": string;
  "--ds-aspect-ratio-instance-max-width"?: string;
};

/**
 * Modern aspect ratio container using native CSS `aspect-ratio`.
 *
 * Unlike the Classic engine's three-layer padding-bottom trick, this uses a
 * single container div whose only inline declarations are the instance
 * geometry channels (`--ds-aspect-ratio-instance-ratio` and, when provided,
 * `--ds-aspect-ratio-instance-max-width`) plus the caller's own `style`.
 *
 * @param props - {@link AspectRatioProps} including ratio, maxWidth, children, and styling overrides.
 * @returns A React element wrapping children in a native aspect ratio container.
 */
const ModernAspectRatio = React.forwardRef<HTMLDivElement, AspectRatioProps>(
  (props, ref) => {
    const {
      ratio = ASPECT_RATIO_DEFAULTS.ratio,
      children,
      className = "",
      style,
      maxWidth,
      "data-testid": dataTestId,
      ...rest
    } = props;

    const ratioIsValid = Number.isFinite(ratio) && ratio > 0;
    const resolvedRatio = ratioIsValid ? ratio : ASPECT_RATIO_DEFAULTS.ratio;
    const resolvedMaxWidth =
      typeof maxWidth === "number"
        ? Number.isFinite(maxWidth) && maxWidth >= 0
          ? `${maxWidth}px`
          : undefined
        : maxWidth;

    // The instance only supplies geometry values. Structure, material and
    // reduced-motion behavior are centralized in the Modern skin.
    const containerStyle: AspectRatioInstanceStyle = {
      "--ds-aspect-ratio-instance-ratio": `${resolvedRatio}`,
      ...(resolvedMaxWidth
        ? { "--ds-aspect-ratio-instance-max-width": resolvedMaxWidth }
        : {}),
      ...style,
    };

    return (
      <div
        ref={ref}
        {...rest}
        className={`rottay-aspect-ratio rottay-aspect-ratio--modern ${className}`.trim()}
        style={containerStyle}
        data-testid={dataTestId}
        data-part="root"
        data-ratio={resolvedRatio}
        data-invalid-ratio={ratioIsValid ? undefined : "true"}
        data-component="aspect-ratio"
      >
        {children}
      </div>
    );
  }
);

ModernAspectRatio.displayName = "ModernAspectRatio";

export default ModernAspectRatio;
