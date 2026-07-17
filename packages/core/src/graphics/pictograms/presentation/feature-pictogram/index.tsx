import React, { forwardRef } from "react";

import {
  isGraphicAssetAdapterEnabled,
  reportGraphicAssetTelemetry,
} from '@/infrastructure/runtime/graphics/asset-governance/runtime/control';
import { FEATURE_PICTOGRAM_ARTWORK } from "./artwork";
import {
  isFeaturePictogramName,
  type FeaturePictogramProps,
  type FeaturePictogramTone,
} from '../../foundation/catalog';
import {
  resolveFeaturePictogramAccessibility,
  resolveFeaturePictogramSize,
  resolveFeaturePictogramTone,
  warnFeaturePictogramOnce,
} from '../../runtime/resolution';

const TONE_COLORS: Readonly<Record<FeaturePictogramTone, string>> = {
  brand: "var(--ds-color-primary, currentColor)",
  neutral: "currentColor",
  success: "var(--ds-color-success, currentColor)",
  warning: "var(--ds-color-warning, currentColor)",
  danger: "var(--ds-color-error, currentColor)",
  ai: "var(--ds-color-ai, var(--ds-color-primary, currentColor))",
};

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
    reportGraphicAssetTelemetry({
      code: 'unmapped-name',
      assetClass: 'feature-pictogram',
      assetKey: String(name),
      outcome: 'dropped',
    });
    warnFeaturePictogramOnce(
      `unknown:${String(name)}`,
      `Unknown pictogram "${String(name)}"; rendered null.`
    );
    return null;
  }
  const resolvedSize = resolveFeaturePictogramSize(size);
  if (resolvedSize === null) {
    reportGraphicAssetTelemetry({
      code: 'invalid-optical-input',
      assetClass: 'feature-pictogram',
      assetKey: name,
      outcome: 'dropped',
    });
    warnFeaturePictogramOnce(
      `size:${String(size)}`,
      `Size must be a token or a number from 32 through 96.`
    );
    return null;
  }
  const accessibility = resolveFeaturePictogramAccessibility(
    name,
    label,
    decorative,
  );
  if (accessibility === null) {
    reportGraphicAssetTelemetry({
      code: 'accessible-name-failure',
      assetClass: 'feature-pictogram',
      assetKey: name,
      outcome: 'dropped',
    });
    return null;
  }

  const Artwork = FEATURE_PICTOGRAM_ARTWORK[name];
  const resolvedTone = resolveFeaturePictogramTone(tone);
  if (resolvedTone !== tone) {
    reportGraphicAssetTelemetry({
      code: 'variant-fallback',
      assetClass: 'feature-pictogram',
      assetKey: name,
      outcome: 'fallback',
    });
  }
  if (!isGraphicAssetAdapterEnabled('feature-pictogram', name)) return null;
  const isLabeled = accessibility.label !== undefined;

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
      aria-label={accessibility.label}
      aria-describedby={ariaDescribedBy}
      aria-hidden={isLabeled ? undefined : true}
      focusable="false"
      className={`rottay-feature-pictogram ${className ?? ""}`.trim()}
      style={{ color: TONE_COLORS[resolvedTone], ...style }}
      data-testid={testId}
      data-part="feature-pictogram"
      data-asset-class="feature-pictogram"
      data-pictogram-name={name}
      data-pictogram-tone={resolvedTone}
      data-pictogram-directional="false"
      data-pictogram-source="rottay-original"
    >
      {isLabeled ? <title>{accessibility.label}</title> : null}
      <Artwork />
    </svg>
  );
});

FeaturePictogram.displayName = "FeaturePictogram";
