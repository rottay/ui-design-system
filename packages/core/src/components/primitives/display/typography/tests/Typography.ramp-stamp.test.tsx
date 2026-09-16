/**
 * The positive stamp and the guard chain it replaces must have the SAME domain.
 * The skin keys the tier ramp on `data-ramp='tier'`; it used to key it on
 * `:not([data-text-style]):not([data-ds-responsive])`. If the two ever diverge,
 * a render silently gains or loses the whole ramp, so the equivalence is
 * asserted case by case rather than argued.
 */
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { ModernHeading, ModernText, ModernParagraph, ModernLink } from '../engines/modern';
import type { TextSize } from '../contracts';

const RESPONSIVE = { xs: 'sm', lg: 'xl' } as unknown as TextSize;

const COMPOUNDS = {
  Heading: (props: Record<string, unknown>) => <ModernHeading {...props}>Aa</ModernHeading>,
  Text: (props: Record<string, unknown>) => <ModernText {...props}>Aa</ModernText>,
  Paragraph: (props: Record<string, unknown>) => <ModernParagraph {...props}>Aa</ModernParagraph>,
  Link: (props: Record<string, unknown>) => <ModernLink href="#" {...props}>Aa</ModernLink>,
} as const;

const CASES: ReadonlyArray<readonly [string, Record<string, unknown>]> = [
  ['default', {}],
  ['size=xs', { size: 'xs' }],
  ['size=3xl', { size: '3xl' }],
  ['textStyle', { textStyle: 'display' }],
  ['textStyle + size', { textStyle: 'caption', size: 'lg' }],
  ['responsive size', { size: RESPONSIVE }],
  ['responsive + textStyle', { size: RESPONSIVE, textStyle: 'body' }],
  ['fluid', { fluid: true, size: 'xl' }],
  ['truncate', { truncate: true }],
  ['clamp', { lineClamp: 2 }],
  ['align', { align: 'center' }],
  ['leading + tracking', { leading: 'tight', tracking: 'wide' }],
  ['lang=ar', { lang: 'ar', tracking: 'wide' }],
];

describe('the tier ramp stamp', () => {
  for (const [name, make] of Object.entries(COMPOUNDS)) {
    it.each(CASES)(`${name}: the stamp covers exactly what the guard chain covered — %s`, (_label, props) => {
      const html = renderToStaticMarkup(make(props));
      const guardChainApplies =
        !/data-text-style="/.test(html) && !/data-ds-responsive="/.test(html);
      const stamped = /data-ramp="tier"/.test(html);
      expect(stamped).toBe(guardChainApplies);
    });
  }
});
