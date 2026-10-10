/**
 * The active-filters-bar chip in a real browser: the chip composes a Tag, and
 * the bar keeps it rail-blended through its class hook. The chip paints no
 * fill, frame or pill geometry of its own, so the label and the value read in
 * the rail's inks on the rail's ground in every first-party vertical.
 */
import React from 'react';
import { Writable } from 'node:stream';
import { prerenderToNodeStream } from 'react-dom/static';
import { describe, expect, it } from 'vitest';

import { DesignSystemProvider } from '@/infrastructure/runtime/bootstrap';
import { firstPartyEngineVisual } from '@/infrastructure/compilers/runtime/theme';
import type { TenantConfig } from '@/foundation/contracts';
import { ActiveFiltersBar } from '../index';
import type { ActiveFilter } from '../contracts';
import { FIRST_PARTY_VERTICALS as VERTICALS, measureArms } from '@tests/support/family-causality';

const noop = () => {};

const FILTERS: ActiveFilter[] = [
  { key: 'status', label: 'Status', value: 'Open' },
  { key: 'owner', label: 'Owner', value: 'Ada Lovelace', state: 'draft' },
  { key: 'due', label: 'Due', value: 'Not a date', state: 'invalid' },
];

const TENANT: TenantConfig = {
  slug: 'active-filters-bar-chip-ground',
  name: 'Active filters bar chip ground',
  theme: 'base',
  locale: 'en',
  fallbackLocale: 'en',
  plan: 'enterprise',
  features: [],
  branding: { companyName: 'Active filters bar chip ground' },
};

/** The family's own server markup, kept whole as the causality suite keeps it. */
async function serverMarkup(): Promise<string> {
  const { prelude } = await prerenderToNodeStream(
    <DesignSystemProvider
      tenantConfig={TENANT}
      forceEngine="modern"
      engineVisual={firstPartyEngineVisual('rottay', 'modern')}
      skipCssLoading
      ssrViewport="desktop"
    >
      <ActiveFiltersBar
        activeFilters={FILTERS}
        onRemoveFilter={noop}
        onClearAll={noop}
        onAddFilter={noop}
      />
    </DesignSystemProvider>,
  );
  let html = '';
  await new Promise<void>((resolve, reject) => {
    prelude
      .pipe(
        new Writable({
          write(chunk, _encoding, done) {
            html += chunk.toString();
            done();
          },
        }),
      )
      .on('finish', () => resolve())
      .on('error', reject);
  });
  return html;
}

const rail = await serverMarkup();
const markup = `<div id="rail" style="inline-size:64rem">${rail}</div>`;

const CHIP = '#rail .ds-active-filters-bar__chip';
const TRANSPARENT = 'rgba(0, 0, 0, 0)';

describe('active-filters-bar chip ground', () => {
  it('serves a composed Tag under the class hook', () => {
    expect(rail).toContain('ds-active-filters-bar__chip');
    expect(rail).toContain('rottay-tag-shell');
  });

  it.each(VERTICALS)('keeps the chip rail-blended under %s', async (vertical) => {
    const readings = await measureArms({
      vertical,
      markup,
      arms: { base: {} },
      targets: [
        { id: 'fill', selector: CHIP, property: 'background-color' },
        { id: 'wash', selector: CHIP, property: 'background-image' },
        { id: 'frame', selector: CHIP, property: 'border-top-width' },
        { id: 'corner', selector: CHIP, property: 'border-top-left-radius' },
        { id: 'elevation', selector: CHIP, property: 'box-shadow' },
        { id: 'inset', selector: CHIP, property: 'padding-left' },
        { id: 'chipInk', selector: CHIP, property: 'color' },
        { id: 'railInk', selector: "#rail [data-part='chips']", property: 'color' },
        { id: 'chipType', selector: CHIP, property: 'font-size' },
        { id: 'railType', selector: "#rail [data-part='chips']", property: 'font-size' },
      ],
    });
    const r = readings.base!;
    expect(r.fill).toBe(TRANSPARENT);
    expect(r.wash).toBe('none');
    expect(r.frame).toBe('0px');
    expect(r.corner).toBe('0px');
    expect(r.elevation).toBe('none');
    expect(r.inset).toBe('0px');
    // The chip states no ink or type step of its own: both arrive from the rail.
    expect(r.chipInk).toBe(r.railInk);
    expect(r.chipType).toBe(r.railType);
  }, 120_000);
});
