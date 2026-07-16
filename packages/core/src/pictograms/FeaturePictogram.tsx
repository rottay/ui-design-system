import React, { forwardRef } from "react";

import { FEATURE_PICTOGRAM_ARTWORK } from "./artwork";
import { isFeaturePictogramName } from "./registry";
import type {
  FeaturePictogramProps,
  FeaturePictogramSize,
  FeaturePictogramTone,
} from "./types";

const SIZE_TOKENS = { sm: 32, md: 48, lg: 64, xl: 96 } as const;
const TONE_COLORS: Readonly<Record<FeaturePictogramTone, string>> = {
  brand: "var(--ds-color-primary, currentColor)",
  neutral: "currentColor",
  success: "var(--ds-color-success, currentColor)",
  warning: "var(--ds-color-warning, currentColor)",
  danger: "var(--ds-color-error, currentColor)",
  ai: "var(--ds-color-ai, var(--ds-color-primary, currentColor))",
};
const warnedInputs = new Set<string>();

function warnOnce(key: string, message: string): void {
  if (process.env.NODE_ENV === "production" || warnedInputs.has(key)) return;
  warnedInputs.add(key);
  console.warn(`[Rottay FeaturePictogram] ${message}`);
}

function resolveSize(size: FeaturePictogramSize): number | null {
  if (typeof size === "string") return SIZE_TOKENS[size] ?? null;
  return Number.isFinite(size) && size >= 32 && size <= 96 ? size : null;
}

/** Registered 32–96px explanatory artwork; never a functional control icon. */
export const FeaturePictogram = forwardRef<
  SVGSVGElement,
  FeaturePictogramProps
>(function FeaturePictogram(props, ref) {
  const {
    name,
    size = "lg",
    tone = "brand",
    label,
    decorative,
    className,
    style,
    id,
    "aria-describedby": ariaDescribedBy,
    "data-testid": testId,
  } = props;

  if (!isFeaturePictogramName(name)) {
    warnOnce(
      `unknown:${String(name)}`,
      `Unknown pictogram "${String(name)}"; rendered null.`
    );
    return null;
  }
  const resolvedSize = resolveSize(size);
  if (resolvedSize === null) {
    warnOnce(
      `size:${String(size)}`,
      `Size must be a token or a number from 32 through 96.`
    );
    return null;
  }
  const normalizedLabel = typeof label === "string" ? label.trim() : "";
  const isLabeled = normalizedLabel.length > 0;
  if (isLabeled === (decorative === true)) {
    warnOnce(
      `a11y:${name}:${String(label)}:${String(decorative)}`,
      `Pictogram "${name}" must have either a non-empty label or decorative={true}; rendered null.`
    );
    return null;
  }

  const Artwork = FEATURE_PICTOGRAM_ARTWORK[name];
  const resolvedTone = TONE_COLORS[tone] ? tone : "brand";

  return (
    <svg
      ref={ref}
      id={id}
      viewBox="0 0 96 96"
      width={resolvedSize}
      height={resolvedSize}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role={isLabeled ? "img" : undefined}
      aria-label={isLabeled ? normalizedLabel : undefined}
      aria-describedby={ariaDescribedBy}
      aria-hidden={isLabeled ? undefined : true}
      focusable="false"
      className={`rottay-feature-pictogram ${className ?? ""}`.trim()}
      style={{ color: TONE_COLORS[resolvedTone], ...style }}
      data-testid={testId}
      data-part="feature-pictogram"
      data-pictogram-name={name}
      data-pictogram-tone={resolvedTone}
      data-pictogram-source="rottay-original"
    >
      {isLabeled ? <title>{normalizedLabel}</title> : null}
      <Artwork />
    </svg>
  );
});

FeaturePictogram.displayName = "FeaturePictogram";
