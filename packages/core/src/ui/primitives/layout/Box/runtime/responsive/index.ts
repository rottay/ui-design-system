/** Responsive style projection owned by the Box primitive. */

import {
  isResponsiveValue,
  type ResponsivePropEntry,
} from '@/infrastructure/runtime/responsive/runtime/style-properties';
import { SPACING_MAP, type BoxProps, type BoxSpacing } from '../../contracts';

/** Resolves a Box spacing token to its CSS value. */
export function resolveBoxSpacing(value: BoxSpacing): string {
  if (value === 'none') return '0';
  return SPACING_MAP[value] || '0';
}

/** Collects Box props that require responsive CSS projection. */
export function collectBoxResponsiveEntries(
  props: BoxProps,
): ResponsivePropEntry<any>[] {
  const entries: ResponsivePropEntry<any>[] = [];
  const spacingResolver = (value: BoxSpacing) => resolveBoxSpacing(value);
  const cssValueResolver = (value: any) =>
    typeof value === 'number' ? `${value}px` : String(value);

  const padding = props.padding ?? props.p;
  if (isResponsiveValue(padding)) {
    entries.push({ cssProperty: 'padding', value: padding, resolve: spacingResolver });
  }

  const paddingX = props.paddingX ?? props.px;
  if (isResponsiveValue(paddingX)) {
    entries.push({ cssProperty: 'padding-left', value: paddingX, resolve: spacingResolver });
    entries.push({ cssProperty: 'padding-right', value: paddingX, resolve: spacingResolver });
  }

  const paddingY = props.paddingY ?? props.py;
  if (isResponsiveValue(paddingY)) {
    entries.push({ cssProperty: 'padding-top', value: paddingY, resolve: spacingResolver });
    entries.push({ cssProperty: 'padding-bottom', value: paddingY, resolve: spacingResolver });
  }

  const margin = props.margin ?? props.m;
  if (isResponsiveValue(margin)) {
    entries.push({ cssProperty: 'margin', value: margin, resolve: spacingResolver });
  }

  const marginX = props.marginX ?? props.mx;
  if (isResponsiveValue(marginX)) {
    entries.push({ cssProperty: 'margin-left', value: marginX, resolve: spacingResolver });
    entries.push({ cssProperty: 'margin-right', value: marginX, resolve: spacingResolver });
  }

  const marginY = props.marginY ?? props.my;
  if (isResponsiveValue(marginY)) {
    entries.push({ cssProperty: 'margin-top', value: marginY, resolve: spacingResolver });
    entries.push({ cssProperty: 'margin-bottom', value: marginY, resolve: spacingResolver });
  }

  if (isResponsiveValue(props.display)) {
    entries.push({ cssProperty: 'display', value: props.display });
  }

  const width = props.width ?? props.w;
  if (isResponsiveValue(width)) {
    entries.push({ cssProperty: 'width', value: width, resolve: cssValueResolver });
  }

  const minWidth = props.minWidth ?? props.minW;
  if (isResponsiveValue(minWidth)) {
    entries.push({ cssProperty: 'min-width', value: minWidth, resolve: cssValueResolver });
  }

  const maxWidth = props.maxWidth ?? props.maxW;
  if (isResponsiveValue(maxWidth)) {
    entries.push({ cssProperty: 'max-width', value: maxWidth, resolve: cssValueResolver });
  }

  return entries;
}
