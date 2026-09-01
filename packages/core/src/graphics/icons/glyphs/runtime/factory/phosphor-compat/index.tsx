"use client";

/**
 * @fileoverview Internal compatibility adapter for pinned Phosphor SSR glyphs.
 *
 * This intentionally stays outside every public barrel. It lets the legacy
 * named-icon catalog adopt a Phosphor glyph later while retaining the stable
 * DSIconComponent/DSIconProps contract used by application imports today.
 */

import React, { forwardRef } from "react";
import type { ComponentType, RefAttributes, SVGProps } from "react";

import type {
  DSIconComponent,
  DSIconProps,
  IconSize,
} from "../../../foundation/contracts";

type PhosphorWeight =
  | "thin"
  | "light"
  | "regular"
  | "bold"
  | "fill"
  | "duotone";

/** Structural, internal-only shape of one local Phosphor SSR glyph. */
interface PhosphorSsrGlyphProps extends SVGProps<SVGSVGElement> {
  readonly size?: string | number;
  readonly color?: string;
  readonly weight?: PhosphorWeight;
  readonly mirrored?: boolean;
  readonly alt?: string;
}

/** Internal source contract; supplier declarations never cross public barrels. */
type PhosphorSsrGlyph = ComponentType<PhosphorSsrGlyphProps>;

const ICON_SIZE_MAP: Record<string, string> = {
  xs: "var(--ds-icon-xs-size, 12px)",
  sm: "var(--ds-icon-sm-size, 16px)",
  md: "var(--ds-icon-md-size, 20px)",
  lg: "var(--ds-icon-lg-size, 24px)",
  xl: "var(--ds-icon-xl-size, 32px)",
  "2xl": "var(--ds-icon-2xl-size, 48px)",
};

/**
 * Phosphor has discrete weights while the legacy named-icon API exposes a
 * continuous strokeWidth. These bands approximate its rendered thickness at
 * the shared 20px default: 0.75 -> thin, 1 -> light, 1.5 -> regular, 2+ ->
 * bold. Unresolvable CSS expressions retain the neutral regular weight.
 */
function resolvePhosphorWeight(
  strokeWidth: DSIconProps["strokeWidth"]
): PhosphorWeight {
  const numericWidth = resolveNumericStrokeWidth(strokeWidth);
  if (numericWidth === undefined) return "regular";
  if (numericWidth <= 0.75) return "thin";
  if (numericWidth <= 1.25) return "light";
  if (numericWidth <= 1.75) return "regular";
  return "bold";
}

function resolveNumericStrokeWidth(value: unknown): number | undefined {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : undefined;
  }

  if (typeof value !== "string") return undefined;
  const match = /^(-?(?:\d+\.?\d*|\.\d+))(?:px)?$/.exec(value.trim());
  return match ? Number(match[1]) : undefined;
}

function resolveSize(size: IconSize | string | undefined): string | number {
  if (typeof size === "number") return size;
  if (typeof size === "string") return ICON_SIZE_MAP[size] ?? size;
  return ICON_SIZE_MAP.md;
}

/**
 * Wraps one SSR glyph without leaking Phosphor's weight, mirrored, or alt
 * props through the named-icon compatibility API.
 */
export function createPhosphorCompatibilityIcon(
  SourceComponent: PhosphorSsrGlyph,
  displayName: string
): DSIconComponent {
  const DSIcon = forwardRef<SVGSVGElement, DSIconProps>((props, ref) => {
    const {
      size = "md",
      color = "currentColor",
      strokeWidth,
      absoluteStrokeWidth: _absoluteStrokeWidth,
      className = "",
      style,
      title,
      children,
      "aria-hidden": ariaHidden,
      "aria-label": ariaLabel,
      weight: _supplierWeight,
      mirrored: _supplierMirrored,
      alt: _supplierAlt,
      ...rest
    } = props as DSIconProps &
      Pick<PhosphorSsrGlyphProps, "weight" | "mirrored" | "alt">;

    const hasAccessibleName = Boolean(title || ariaLabel);
    const Glyph = SourceComponent;

    return React.createElement(
      Glyph,
      {
        ref,
        size: resolveSize(size),
        color,
        weight: resolvePhosphorWeight(strokeWidth),
        className: `rottay-icon ${className}`.trim(),
        style,
        ...rest,
        "aria-hidden": hasAccessibleName ? undefined : ariaHidden ?? true,
        "aria-label": ariaLabel ?? title,
        role: hasAccessibleName ? "img" : rest.role,
      } as PhosphorSsrGlyphProps & RefAttributes<SVGSVGElement>,
      title ? React.createElement("title", null, title) : undefined,
      children
    );
  });

  DSIcon.displayName = displayName;
  return DSIcon;
}
