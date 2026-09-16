/**
 * The countdown's affix gap is LOGICAL, proven in a real browser.
 *
 * The prefix and suffix used to carry `marginRight: '4px'` and
 * `marginLeft: '4px'` — a physical, literal second copy of a rule this very
 * family already owns logically in its modern skin
 * (`[data-part='prefix'] { margin-inline-end: var(--ds-spacing-1) }`). The
 * compound now spells it the same way, so the gap follows the reading
 * direction instead of pinning to a side.
 *
 * jsdom cannot answer this: it does not resolve a logical margin against a
 * direction, so a unit assertion would pass on the physical spelling too. The
 * measurement is Chromium's, through the shared causality harness, and each
 * case carries its own counterfactual: the SAME markup under `dir="ltr"` must
 * put the gap on the other side and must not move a pixel of the LTR layout.
 */
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { measureArms } from '@tests/support/family-causality';
import { Countdown } from '../compound/countdown';

const markup = `<div id="probe">${renderToStaticMarkup(
  <Countdown title="Launch" value={0} format="mm:ss" prefix={<span>~</span>} suffix={<span>left</span>} />,
)}</div>`;

const PREFIX = "#probe [data-part='prefix']";
const SUFFIX = "#probe [data-part='suffix']";

describe('Countdown affix gap follows the reading direction', () => {
  it('puts the gap on the inline edge in both directions, and moves nothing in LTR', async () => {
    const result = await measureArms({
      vertical: 'bithire',
      markup,
      arms: { base: {} },
      targets: [
        { id: 'ltrPrefixEnd', selector: PREFIX, property: 'margin-right', dir: 'ltr' },
        { id: 'ltrPrefixStart', selector: PREFIX, property: 'margin-left', dir: 'ltr' },
        { id: 'ltrSuffixStart', selector: SUFFIX, property: 'margin-left', dir: 'ltr' },
        { id: 'ltrSuffixEnd', selector: SUFFIX, property: 'margin-right', dir: 'ltr' },
        { id: 'rtlPrefixEnd', selector: PREFIX, property: 'margin-left', dir: 'rtl' },
        { id: 'rtlPrefixStart', selector: PREFIX, property: 'margin-right', dir: 'rtl' },
        { id: 'rtlSuffixStart', selector: SUFFIX, property: 'margin-right', dir: 'rtl' },
        { id: 'rtlSuffixEnd', selector: SUFFIX, property: 'margin-left', dir: 'rtl' },
      ],
    });
    const r = result.base!;
    const gap = Number.parseFloat(r.ltrPrefixEnd!);

    // The ramp rung, not a literal: `--ds-spacing-1` is 0.25rem, and the root
    // rem carries the type scale, so the resolved gap is a positive length the
    // tenant can move — never the hardcoded 4px it replaced.
    expect(gap).toBeGreaterThan(0);

    // LTR is unchanged: the prefix's gap is on its right, the suffix's on its
    // left, exactly where the physical spelling put them.
    expect(Number.parseFloat(r.ltrPrefixEnd!)).toBe(gap);
    expect(Number.parseFloat(r.ltrPrefixStart!)).toBe(0);
    expect(Number.parseFloat(r.ltrSuffixStart!)).toBe(gap);
    expect(Number.parseFloat(r.ltrSuffixEnd!)).toBe(0);

    // COUNTERFACTUAL: under RTL the same gap lands on the opposite physical
    // edge. The physical spelling could not do this, which is the whole point.
    expect(Number.parseFloat(r.rtlPrefixEnd!)).toBe(gap);
    expect(Number.parseFloat(r.rtlPrefixStart!)).toBe(0);
    expect(Number.parseFloat(r.rtlSuffixStart!)).toBe(gap);
    expect(Number.parseFloat(r.rtlSuffixEnd!)).toBe(0);
  }, 60_000);
});
