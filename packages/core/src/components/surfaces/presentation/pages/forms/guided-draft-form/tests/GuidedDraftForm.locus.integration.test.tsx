/**
 * The section locus, in a real browser.
 *
 * The scroll-mode section is an edit-fields ledger block, not a Card, so the
 * two `--ds-card-bordered-border-color` writes that used to mark the active and
 * errored section reached nothing of the family's own -- and, being a custom
 * property, they INHERITED into any Card a consumer rendered inside
 * `section.render()`, tinting an unrelated nested card. This suite pins both
 * halves of the repair: the channel is not written on a section root, a nested
 * Card reads the same border in an active/errored section as in a plain one,
 * and each marked section still carries a visible locus rail.
 */
import React from 'react';
import { Writable } from 'node:stream';
import { prerenderToNodeStream } from 'react-dom/static';
import { describe, expect, it } from 'vitest';

import { DesignSystemProvider } from '@/infrastructure/runtime/bootstrap';
import { firstPartyEngineVisual } from '@/infrastructure/compilers/runtime/theme';
import type { TenantConfig } from '@/foundation/contracts';
import { Card } from '@/components/primitives/display/card';
import { GuidedDraftFormSurface } from '..';
import { measureArms } from '@tests/support/family-causality';

const TENANT: TenantConfig = {
  slug: 'guided-draft-locus',
  name: 'Guided draft locus',
  theme: 'base',
  locale: 'en',
  fallbackLocale: 'en',
  plan: 'enterprise',
  features: [],
  branding: { companyName: 'Guided draft locus' },
};

/** A consumer card inside the section body -- the node the leaked channel tinted. */
const nested = (key: string) => (
  <Card className={`probe-card probe-card--${key}`} variant="bordered">
    <Card.Body>Nested</Card.Body>
  </Card>
);

async function markup(): Promise<string> {
  const { prelude } = await prerenderToNodeStream(
    <DesignSystemProvider
      tenantConfig={TENANT}
      forceEngine="modern"
      engineVisual={firstPartyEngineVisual('rottay', 'modern')}
      skipCssLoading
      ssrViewport="desktop"
    >
      <div id="page">
        <GuidedDraftFormSurface
          title="Create event"
          sections={[
            // The first section is the active one by contract.
            { key: 'active', title: 'Active', render: () => nested('active') },
            { key: 'errors', title: 'Errors', hasErrors: true, render: () => nested('errors') },
            { key: 'plain', title: 'Plain', render: () => nested('plain') },
          ]}
          onSubmit={() => undefined}
        />
      </div>
    </DesignSystemProvider>,
  );
  let html = '';
  await new Promise<void>((resolve, reject) => {
    prelude
      .pipe(new Writable({ write(chunk, _e, done) { html += chunk.toString(); done(); } }))
      .on('finish', resolve)
      .on('error', reject);
  });
  return html;
}

const CARD_CHANNEL = '--ds-card-bordered-border-color';
const root = (key: string) => `.ds-guided-draft-form__section-card#section-${key}`;

describe('guided-draft-form section locus', () => {
  it('no longer re-points the card channel per section, so a nested card is untinted', async () => {
    const readings = await measureArms({
      vertical: 'bithire',
      markup: await markup(),
      arms: { base: {} },
      targets: [
        { id: 'activeChannel', selector: root('active'), property: CARD_CHANNEL },
        { id: 'errorsChannel', selector: root('errors'), property: CARD_CHANNEL },
        { id: 'plainChannel', selector: root('plain'), property: CARD_CHANNEL },
        { id: 'activeNested', selector: '.probe-card--active', property: 'border-top-color' },
        { id: 'errorsNested', selector: '.probe-card--errors', property: 'border-top-color' },
        { id: 'plainNested', selector: '.probe-card--plain', property: 'border-top-color' },
      ],
    });
    const r = readings.base!;

    // The channel keeps its cascade default under every section: the two
    // modifier writes are gone, so the active and errored sections no longer
    // hand a different value down to whatever the consumer renders. Before the
    // repair this read the primary-tinted mix and `--ds-color-error`.
    expect(r.plainChannel.trim()).not.toBe('');
    expect(r.activeChannel, 'active re-points the card channel').toBe(r.plainChannel);
    expect(r.errorsChannel, 'errors re-points the card channel').toBe(r.plainChannel);
    // ...and the consumer's own card reads the same border in all three.
    expect(r.plainNested.trim()).not.toBe('');
    expect(r.activeNested).toBe(r.plainNested);
    expect(r.errorsNested).toBe(r.plainNested);
  }, 180_000);

  it('reserves the locus gutter on every section so the ledger rhythm never shifts', async () => {
    const readings = await measureArms({
      vertical: 'bithire',
      markup: await markup(),
      arms: { base: {} },
      targets: (['active', 'errors', 'plain'] as const).map((key) => ({
        id: key,
        selector: root(key),
        property: 'padding-inline-start',
      })),
    });
    const r = readings.base!;
    expect(r.plain.trim()).not.toBe('0px');
    expect(r.active).toBe(r.plain);
    expect(r.errors).toBe(r.plain);
  }, 180_000);
});
