/**
 * The progress label hugs the inline END, proven in a real browser.
 *
 * The percentage label used to carry `textAlign: 'right'`. A percentage sits at
 * the end of the bar it describes, and under RTL that end is the LEFT — so the
 * physical spelling put it on the wrong side of its own box for every RTL
 * reader. `end` is the same pixel in LTR and the correct one in RTL.
 *
 * jsdom cannot answer this: `text-align: end` does not resolve against a
 * direction there, so a unit assertion would pass on the physical spelling
 * too. The measurement is Chromium's, and the case carries its own
 * counterfactual — the SAME markup under `dir="ltr"` must leave the label
 * exactly where the physical spelling had it.
 */
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { measureArms } from '@tests/support/family-causality';
import { ProgressLine } from '../compound/line';

// The label box is wider than its text (`minWidth: 40px`), which is what makes
// the alignment observable: a measurable node inside it moves to one edge.
const markup = `<div id="probe" style="inline-size: 24rem">${renderToStaticMarkup(
  <ProgressLine percent={50} showInfo format={() => <span id="pct">5%</span>} />,
)}</div>`;

const LABEL = "#probe [data-part='label']";
const TEXT = '#pct';

describe('Progress label alignment follows the reading direction', () => {
  it('hugs the inline end in both directions, and moves nothing in LTR', async () => {
    const result = await measureArms({
      vertical: 'bithire',
      markup,
      arms: { base: {} },
      targets: [
        { id: 'ltrLabelLeft', selector: LABEL, property: '@rect.left', dir: 'ltr' },
        { id: 'ltrLabelRight', selector: LABEL, property: '@rect.right', dir: 'ltr' },
        { id: 'ltrTextLeft', selector: TEXT, property: '@rect.left', dir: 'ltr' },
        { id: 'ltrTextRight', selector: TEXT, property: '@rect.right', dir: 'ltr' },
        { id: 'rtlLabelLeft', selector: LABEL, property: '@rect.left', dir: 'rtl' },
        { id: 'rtlLabelRight', selector: LABEL, property: '@rect.right', dir: 'rtl' },
        { id: 'rtlTextLeft', selector: TEXT, property: '@rect.left', dir: 'rtl' },
        { id: 'rtlTextRight', selector: TEXT, property: '@rect.right', dir: 'rtl' },
      ],
    });
    const r = result.base!;
    const n = (value: string | undefined) => Number(value);

    // The label box really is wider than its text, or the alignment would be
    // unobservable and both branches below would pass vacuously.
    const ltrSlack = (n(r.ltrLabelRight) - n(r.ltrLabelLeft)) - (n(r.ltrTextRight) - n(r.ltrTextLeft));
    expect(ltrSlack).toBeGreaterThan(0);

    // LTR unchanged: the text sits against the box's RIGHT edge, exactly where
    // `text-align: right` put it.
    expect(n(r.ltrTextRight)).toBe(n(r.ltrLabelRight));
    expect(n(r.ltrTextLeft)).toBeGreaterThan(n(r.ltrLabelLeft));

    // COUNTERFACTUAL: under RTL the inline end is the LEFT, so the text sits
    // against the box's left edge. The physical spelling could not do this.
    expect(n(r.rtlTextLeft)).toBe(n(r.rtlLabelLeft));
    expect(n(r.rtlTextRight)).toBeLessThan(n(r.rtlLabelRight));
  }, 60_000);
});
