import React, { forwardRef } from 'react';

import { TheSvgBrandMarkAdapter } from './adapters/thesvg-react';
import {
  getBrandVariantResolution,
  isBrandMarkName,
  isMarkVariant,
} from './registry';
import { resolveMarkAccessibility, warnMarkOnce } from './runtime';
import type { BrandMarkProps, MarkVariant } from './types';

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
    warnMarkOnce(`unknown-brand:${String(name)}`, `Unknown brand "${String(name)}"; rendered null.`);
    return null;
  }

  const accessibility = resolveMarkAccessibility(`brand:${name}`, label, decorative);
  if (!accessibility) return null;

  const requestedVariant: MarkVariant = isMarkVariant(variant) ? variant : 'color';
  if (!isMarkVariant(variant)) {
    warnMarkOnce(
      `variant:${name}:${String(variant)}`,
      `Unknown variant "${String(variant)}" for "${name}"; using "color".`,
    );
  }
  const resolution = getBrandVariantResolution(name, requestedVariant);

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

