import React, { forwardRef } from 'react';

import {
  isGraphicAssetAdapterEnabled,
  reportGraphicAssetTelemetry,
} from '@/infrastructure/runtime/graphics/asset-governance/runtime/control';
import { TheSvgBrandMarkAdapter } from '../../runtime/adapters/thesvg-react/brand';
import {
  isBrandMarkName,
  isMarkVariant,
  type BrandMarkProps,
  type MarkVariant,
} from '../../foundation/catalog';
import {
  getBrandVariantResolution,
  resolveMarkAccessibility,
  warnMarkOnce,
} from '../../runtime/resolution';

/** Supplier-independent renderer for the fixed, compliance-audited brand corpus. */
export const BrandMark = forwardRef<SVGSVGElement, BrandMarkProps>(function BrandMark(props, ref) {
  const {
    name,
    variant = 'color',
    size = 'md',
    width,
    height,
    label,
    decorative,
    className,
    style,
    id,
    'aria-describedby': ariaDescribedBy,
    'data-testid': testId,
  } = props;

  if (!isBrandMarkName(name)) {
    reportGraphicAssetTelemetry({
      code: 'unmapped-name',
      assetClass: 'brand-mark',
      assetKey: String(name),
      outcome: 'dropped',
    });
    warnMarkOnce(`unknown-brand:${String(name)}`, `Unknown brand "${String(name)}"; rendered null.`);
    return null;
  }

  const accessibility = resolveMarkAccessibility(`brand:${name}`, label, decorative);
  if (!accessibility) {
    reportGraphicAssetTelemetry({
      code: 'accessible-name-failure',
      assetClass: 'brand-mark',
      assetKey: name,
      outcome: 'dropped',
    });
    return null;
  }

  const requestedVariant: MarkVariant = isMarkVariant(variant) ? variant : 'color';
  if (!isMarkVariant(variant)) {
    reportGraphicAssetTelemetry({
      code: 'variant-fallback',
      assetClass: 'brand-mark',
      assetKey: name,
      outcome: 'fallback',
    });
    warnMarkOnce(
      `variant:${name}:${String(variant)}`,
      `Unknown variant "${String(variant)}" for "${name}"; using "color".`,
    );
  }
  const resolution = getBrandVariantResolution(name, requestedVariant);

  if (!isGraphicAssetAdapterEnabled('brand-mark', name)) return null;

  return (
    <TheSvgBrandMarkAdapter
      ref={ref}
      name={name}
      resolvedVariant={resolution.resolved}
      sourceVariant={resolution.sourceVariant}
      size={size}
      width={width}
      height={height}
      label={accessibility.label}
      className={className}
      style={style}
      id={id}
      ariaDescribedBy={ariaDescribedBy}
      testId={testId}
    />
  );
});

BrandMark.displayName = 'BrandMark';
