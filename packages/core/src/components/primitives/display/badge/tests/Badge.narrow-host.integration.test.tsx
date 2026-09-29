/**
 * A long-label badge never outgrows its container: the family's max inline
 * size is a ceiling for wide containers, and a container narrower than that
 * ceiling caps the badge at its own width.
 */
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import ModernBadge from '../engines/modern';
import { measureArms, type ProbeReadings, type ProbeTarget } from '@tests/support/family-causality';

const LONG = 'Review and approve the outstanding submissions for this quarter';
const UNBROKEN = 'Reconciliation_2026Q3_FINAL_v4_approved_by_committee_long_token';

const badge = (text: string, status: 'warning' | 'default') =>
  renderToStaticMarkup(<ModernBadge status={status} text={text} />);

const HOST = 256;
const markup = [
  `<div id="capped" style="inline-size:${HOST}px"><div style="min-inline-size:0;max-inline-size:min(280px, 100%)">${badge(LONG, 'warning')}</div></div>`,
  `<div id="bare" style="inline-size:${HOST}px">${badge(UNBROKEN, 'default')}</div>`,
  `<div id="wide" style="inline-size:960px">${badge(LONG, 'warning')}</div>`,
  `<div id="short" style="inline-size:${HOST}px">${badge('Approved', 'default')}</div>`,
].join('');

const targets: ProbeTarget[] = ['capped', 'bare', 'wide', 'short'].flatMap((id) => [
  { id: `${id}.host.right`, selector: `#${id}`, property: '@rect.right' },
  { id: `${id}.badge.right`, selector: `#${id} [data-part='root']`, property: '@rect.right' },
  { id: `${id}.badge.width`, selector: `#${id} [data-part='root']`, property: '@rect.width' },
]);

let readings: ProbeReadings;
const read = (id: string): number => Number(readings.base![id]);

describe('badge in a narrow host', () => {
  beforeAll(async () => {
    readings = await measureArms({ vertical: 'rottay', markup, arms: { base: {} }, targets });
  }, 120_000);

  it('stays inside a container narrower than its max inline size', () => {
    expect(read('capped.badge.right')).toBeLessThanOrEqual(read('capped.host.right'));
    expect(read('bare.badge.right')).toBeLessThanOrEqual(read('bare.host.right'));
  });

  it('keeps the family ceiling in a wide container', () => {
    expect(read('wide.badge.width')).toBeLessThan(960);
    expect(read('wide.badge.width')).toBeGreaterThan(HOST);
  });

  it('leaves a short badge at its content size', () => {
    expect(read('short.badge.width')).toBeLessThan(HOST / 2);
  });
});
