/**
 * A segmented control narrower than its options adapts: the track wraps its
 * options onto further rows inside the container, so every option stays
 * visible, instead of scrolling the options past the track's edge.
 */
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import ModernSegmented from '../engines/modern';
import { measureArms, type ProbeReadings, type ProbeTarget } from '@tests/support/family-causality';

const OPTIONS = [
  { label: 'New', value: 'new' },
  { label: 'Screen', value: 'screen' },
  { label: 'Review', value: 'review' },
  { label: 'Offer', value: 'offer' },
  { label: 'Closed', value: 'closed' },
];
const LONG = [{ label: 'An option label far longer than any narrow container can hold on one line', value: 'long' }];

const five = renderToStaticMarkup(<ModernSegmented ariaLabel="Stage" options={OPTIONS} defaultValue="review" />);
const single = renderToStaticMarkup(<ModernSegmented ariaLabel="Only" options={LONG} defaultValue="long" />);

const HOSTS = { narrow: [180, five], wide: [960, five], long: [180, single] } as const;
const markup = Object.entries(HOSTS)
  .map(([id, [size, html]]) => `<div id="${id}" style="inline-size:${size}px">${html}</div>`)
  .join('');

const option = (id: string, n: number) => `#${id} [data-part='option']:nth-of-type(${n})`;

const targets: ProbeTarget[] = [
  ...Object.keys(HOSTS).flatMap((id) => [
    { id: `${id}.host.right`, selector: `#${id}`, property: '@rect.right' },
    { id: `${id}.root.left`, selector: `#${id} [role='radiogroup']`, property: '@rect.left' },
    { id: `${id}.root.right`, selector: `#${id} [role='radiogroup']`, property: '@rect.right' },
  ]),
  ...['narrow', 'wide'].flatMap((id) =>
    [1, 2, 3, 4, 5].flatMap((n) => [
      { id: `${id}.option${n}.left`, selector: option(id, n), property: '@rect.left' },
      { id: `${id}.option${n}.right`, selector: option(id, n), property: '@rect.right' },
      { id: `${id}.option${n}.top`, selector: option(id, n), property: '@rect.top' },
    ]),
  ),
  { id: 'long.option1.right', selector: option('long', 1), property: '@rect.right' },
];

let readings: ProbeReadings;
const read = (id: string): number => Number(readings.base![id]);

describe('segmented in a narrow host', () => {
  beforeAll(async () => {
    readings = await measureArms({ vertical: 'rottay', markup, arms: { base: {} }, targets });
  }, 120_000);

  it('keeps the track inside its container', () => {
    for (const id of Object.keys(HOSTS)) {
      expect(read(`${id}.root.right`), id).toBeLessThanOrEqual(read(`${id}.host.right`));
    }
  });

  it('keeps every option visible inside the track', () => {
    for (const n of [1, 2, 3, 4, 5]) {
      expect(read(`narrow.option${n}.left`), `option ${n}`).toBeGreaterThanOrEqual(read('narrow.root.left'));
      expect(read(`narrow.option${n}.right`), `option ${n}`).toBeLessThanOrEqual(read('narrow.root.right'));
    }
    expect(read('long.option1.right')).toBeLessThanOrEqual(read('long.root.right'));
  });

  it('wraps onto a further row when the options cannot share one', () => {
    expect(read('narrow.option5.top')).toBeGreaterThan(read('narrow.option1.top'));
  });

  it('keeps one row when the container has room', () => {
    for (const n of [2, 3, 4, 5]) {
      expect(read(`wide.option${n}.top`), `option ${n}`).toBe(read('wide.option1.top'));
    }
  });
});
