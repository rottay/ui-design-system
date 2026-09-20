/**
 * The slider's disabled muting, in a real browser.
 *
 * Every muting rule already read `--ds-state-disabled-opacity`, but each was
 * headed by `[data-disabled='true']` alone — the component's prop echo. The
 * head pairs that echo with the anatomy kernel's token now, so the governed
 * disabled decision reaches the four parts it always painted, and the axis
 * probe can mount them. Paint is unchanged in both arms: neither attribute was
 * removed and the value was already on the channel.
 */
import React from 'react';
import { Writable } from 'node:stream';
import { prerenderToNodeStream } from 'react-dom/static';
import { describe, expect, it } from 'vitest';

import { Slider } from '..';
import { DesignSystemProvider } from '@/infrastructure/runtime/bootstrap';
import { firstPartyEngineVisual } from '@/infrastructure/compilers/runtime/theme';
import type { TenantConfig } from '@/foundation/contracts';
import {
  FIRST_PARTY_VERTICALS as VERTICALS,
  describeCausality,
  measureArms,
} from '@tests/support/family-causality';

const TENANT: TenantConfig = {
  slug: 'slider-disabled-causality',
  name: 'Slider disabled causality',
  theme: 'base',
  locale: 'en',
  fallbackLocale: 'en',
  plan: 'enterprise',
  features: [],
  branding: { companyName: 'Slider disabled causality' },
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
      <Slider range value={[20, 60]} step={25} dots marks={{ 0: '0', 50: '50', 100: '100' }} disabled />
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
const markup = `<div id="slider" style="inline-size:32rem">${rendered}</div>`;
/** The prop echo alone — the head the rules used to carry, and nothing else. */
const echoOnly = markup.replace(/ data-state="disabled"/gu, '');

const part = (name: string) => `#slider [data-part="${name}"]`;

describeCausality({
  family: 'slider-disabled',
  markup,
  targets: [
    { id: 'railOpacity', selector: part('rail'), property: 'opacity' },
    { id: 'trackOpacity', selector: part('track'), property: 'opacity' },
    { id: 'handleOpacity', selector: part('handle'), property: 'opacity' },
    { id: 'dotOpacity', selector: part('dot'), property: 'opacity' },
    // The rail's own measure is a stated number on no plane this arm touches.
    { id: 'railBlock', selector: part('rail'), property: 'block-size' },
  ],
  decisions: {
    // `subtle` rests the muting at 0.68 and `strong` at 0.5, so one decision
    // has to move all four muted parts at once.
    'states.emphasis': {
      value: 'subtle',
      moves: ['railOpacity', 'trackOpacity', 'handleOpacity', 'dotOpacity'],
      holds: 'railBlock',
      in: VERTICALS,
    },
  },
});

describe('slider disabled muting drill', () => {
  it('stamps both attributes on the root, so either head arm can reach the parts', () => {
    expect(rendered).toContain('data-disabled="true"');
    expect(rendered).toContain('data-state="disabled"');
  });

  it('paints identically from the prop echo alone, so the pairing moved no pixel', async () => {
    const targets = [
      { id: 'railOpacity', selector: part('rail'), property: 'opacity' },
      { id: 'dotOpacity', selector: part('dot'), property: 'opacity' },
    ];
    const [paired, echo] = await Promise.all([
      measureArms({ vertical: 'bithire', markup, arms: { base: {} }, targets }),
      measureArms({ vertical: 'bithire', markup: echoOnly, arms: { base: {} }, targets }),
    ]);
    expect(paired.base!.railOpacity).not.toMatch(/^<no match/u);
    expect(echo.base).toEqual(paired.base);
  }, 240_000);
});
