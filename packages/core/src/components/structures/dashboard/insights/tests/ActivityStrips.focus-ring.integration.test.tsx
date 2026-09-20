/**
 * The four activity strips' view-all ring, in a real browser.
 *
 * Each strip's skin already drew that ring from `--ds-focus-ring-width` and
 * `--ds-focus-ring-offset`; the rule was keyed on `:focus-visible` alone, so no
 * DOM token could reach it and the tenant's focus decision stopped at the
 * anchor. The shared `NavLinkAnchor` stamps the kernel token now, the skins
 * pair it with the pseudo-class, and this reads the PAINT that pairing lets in.
 *
 * `NavLinkAnchor.focus-stamp` drills the producer; the markup below stamps it
 * because a static probe never acquires focus.
 */
import React from 'react';
import { Writable } from 'node:stream';
import { prerenderToNodeStream } from 'react-dom/static';

import { DesignSystemProvider } from '@/infrastructure/runtime/bootstrap';
import { firstPartyEngineVisual } from '@/infrastructure/compilers/runtime/theme';
import type { TenantConfig } from '@/foundation/contracts';
import { ActivityCards, ActivityCompact, ActivityTicker, ActivityTimeline } from '../presentation';
import type { ActivityItem } from '../foundation/contracts';
import { describe, expect, it } from 'vitest';

import {
  FIRST_PARTY_VERTICALS as VERTICALS,
  describeCausality,
  measureArms,
} from '@tests/support/family-causality';

const ITEMS: ActivityItem[] = [
  { text: 'Deployed release', time: '2m', type: 'success' },
  { text: 'Report generated', time: '12m', type: 'info' },
];

const TENANT: TenantConfig = {
  slug: 'activity-strips-causality',
  name: 'Activity strips causality',
  theme: 'base',
  locale: 'en',
  fallbackLocale: 'en',
  plan: 'enterprise',
  features: [],
  branding: { companyName: 'Activity strips causality' },
};

async function serverMarkup(): Promise<string> {
  const { prelude } = await prerenderToNodeStream(
    <DesignSystemProvider
      tenantConfig={TENANT}
      forceEngine="modern"
      engineVisual={firstPartyEngineVisual('rottay', 'modern')}
      skipCssLoading
      ssrViewport="desktop"
    >
      <ActivityCards items={ITEMS} viewAllHref="/all" />
      <ActivityCompact items={ITEMS} viewAllHref="/all" />
      <ActivityTicker items={ITEMS} viewAllHref="/all" />
      <ActivityTimeline items={ITEMS} viewAllHref="/all" />
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

const rendered = await serverMarkup();
// The keyboard arm, stamped rather than simulated. Every strip's anchor and the
// ticker's own two controls carry the token the skins pair with the pseudo.
const stamped = rendered
  .replace(/class="view-all-anchor"/gu, 'class="view-all-anchor" data-state="focus-visible"')
  .replace(/data-part="nav-button"/gu, 'data-part="nav-button" data-state="focus-visible"')
  .replace(/data-part="ticker-dot"/gu, 'data-part="ticker-dot" data-state="focus-visible"');
const markup = `<div id="strips" style="inline-size:64rem">${stamped}</div>`;

/* Scoped by each strip's own root class rather than a wrapper id: the prelude
   parks a suspended subtree (the ticker's chevron icons, and with them its two
   nav buttons) in a hidden reveal block outside every wrapper, so an id scope
   would silently read nothing. `nav-button` is therefore unreachable in a
   static prelude at all; its stamp is drilled in
   `ActivityTicker.focus-stamp` and its paint is measured by the fleet run. */
const anchor = (strip: string) => `.ds-activity-${strip} .view-all-anchor`;
const DOT = '.ds-activity-ticker [data-part="ticker-dot"]';
// The badge's corner is a stated percentage on no plane this arm touches.
const CONTROL = '.ds-activity-cards [data-part="badge"]';

describeCausality({
  family: 'activity-strips',
  markup,
  targets: [
    { id: 'cardsWidth', selector: anchor('cards'), property: 'outline-width' },
    { id: 'cardsOffset', selector: anchor('cards'), property: 'outline-offset' },
    { id: 'compactWidth', selector: anchor('compact'), property: 'outline-width' },
    { id: 'tickerWidth', selector: anchor('ticker'), property: 'outline-width' },
    { id: 'timelineWidth', selector: anchor('timeline'), property: 'outline-width' },
    { id: 'dotWidth', selector: DOT, property: 'outline-width' },
    { id: 'dotOffset', selector: DOT, property: 'outline-offset' },
    { id: 'badgeRadius', selector: CONTROL, property: 'border-top-left-radius' },
  ],
  decisions: {
    // `ring` rests 2px/2px; `glow` states 1px/0px. Every strip reads the same
    // two roots, so one decision has to move all seven readings at once.
    'states.focus-style': {
      value: 'glow',
      moves: [
        'cardsWidth',
        'cardsOffset',
        'compactWidth',
        'tickerWidth',
        'timelineWidth',
        'dotWidth',
        'dotOffset',
      ],
      holds: 'badgeRadius',
      in: VERTICALS,
    },
  },
});

/**
 * The drill the arm above rests on: without the kernel token in the DOM the
 * same decision reaches nothing. It fails loudly if a later lot drops the
 * stamp, or if the ring ever starts painting at rest.
 */
describe('activity-strips focus ring drill', () => {
  it('MUTATION DRILL: the unstamped markup holds the ring against the decision', async () => {
    const unstamped = `<div id="strips" style="inline-size:64rem">${rendered}</div>`;
    const readings = await measureArms({
      vertical: 'rottay',
      markup: unstamped,
      arms: { base: {}, glow: { 'states.focus-style': 'glow' } },
      targets: [
        { id: 'cardsWidth', selector: anchor('cards'), property: 'outline-width' },
        { id: 'cardsStyle', selector: anchor('cards'), property: 'outline-style' },
      ],
    });
    // The probe found the node -- this is a held reading, not a missing one.
    expect(readings.base!.cardsWidth).not.toMatch(/^<no match/u);
    expect(readings.base!.cardsStyle).toBe('none');
    expect(readings.glow!.cardsWidth).toBe(readings.base!.cardsWidth);
    expect(readings.glow!.cardsStyle).toBe('none');
  }, 240_000);

  it('the stamped twin is the only difference between the two markups', () => {
    expect(rendered).not.toContain('data-state="focus-visible"');
    expect(stamped.replace(/ data-state="focus-visible"/gu, '')).toBe(rendered);
  });
});
