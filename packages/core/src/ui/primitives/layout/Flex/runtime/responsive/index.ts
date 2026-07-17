/** Responsive style projection owned by the Flex primitive. */

import {
  isResponsiveValue,
  type ResponsivePropEntry,
} from '@/infrastructure/runtime/responsive/runtime/style-properties';
import {
  FLEX_ALIGN_MAP,
  FLEX_JUSTIFY_MAP,
  type FlexAlign,
  type FlexJustify,
  type FlexProps,
} from '../../contracts';

/** Resolves a numeric or column/row tuple gap to CSS. */
export function resolveFlexGap(gap: number | [number, number]): string {
  if (Array.isArray(gap)) {
    return `${gap[0]}px ${gap[1]}px`;
  }
  return `${gap}px`;
}

/** Collects Flex props that require responsive CSS projection. */
export function collectFlexResponsiveEntries(
  props: FlexProps,
): ResponsivePropEntry<any>[] {
  const entries: ResponsivePropEntry<any>[] = [];

  if (isResponsiveValue(props.direction)) {
    entries.push({ cssProperty: 'flex-direction', value: props.direction });
  }
  if (isResponsiveValue(props.gap)) {
    entries.push({ cssProperty: 'gap', value: props.gap, resolve: resolveFlexGap });
  }
  if (isResponsiveValue(props.wrap)) {
    entries.push({ cssProperty: 'flex-wrap', value: props.wrap });
  }
  if (isResponsiveValue(props.justify)) {
    entries.push({
      cssProperty: 'justify-content',
      value: props.justify,
      resolve: (value: FlexJustify) => FLEX_JUSTIFY_MAP[value],
    });
  }
  if (isResponsiveValue(props.align)) {
    entries.push({
      cssProperty: 'align-items',
      value: props.align,
      resolve: (value: FlexAlign) => FLEX_ALIGN_MAP[value],
    });
  }

  return entries;
}
