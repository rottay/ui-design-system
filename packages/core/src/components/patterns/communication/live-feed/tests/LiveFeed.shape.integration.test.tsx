/**
 * The new-items badge's corner in a real browser: a pill that answers to the
 * pill rung and not to the radius dial.
 *
 * The skin used to paint this corner as a bare `9999px`. The literal and
 * `var(--ds-radius-full)` are byte-equal in all three verticals, so the wire is
 * measured both ways: the resting corner is the pill, and `shape.radius-scale`
 * leaves it there because `--ds-radius-full` is deliberately off the four-rung
 * dial (`--ds-radius-{sm,md,lg,xl}`).
 */
import React from 'react';
import { Writable } from 'node:stream';
import { prerenderToNodeStream } from 'react-dom/static';
import { describe, expect, it } from 'vitest';

import { DesignSystemProvider } from '@/infrastructure/runtime/bootstrap';
import { firstPartyEngineVisual } from '@/infrastructure/compilers/runtime/theme';
import type { TenantConfig } from '@/foundation/contracts';
import ModernLiveFeed from '../engines/modern';
import { FIRST_PARTY_VERTICALS, measureArms } from '@tests/support/family-causality';

interface Entry {
  id: string;
  label: string;
}

const TENANT: TenantConfig = {
  slug: 'live-feed-shape',
  name: 'Live feed shape',
  theme: 'base',
  locale: 'en',
  fallbackLocale: 'en',
  plan: 'enterprise',
  features: [],
  branding: { companyName: 'Live feed shape' },
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
      <ModernLiveFeed<Entry>
        items={[{ id: 'a', label: 'Panel confirmed' }]}
        renderItem={(entry) => <span>{entry.label}</span>}
        newItemsCount={3}
        onShowNewItems={() => {}}
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

const feed = await serverMarkup();
const markup = `<div id="feed">${feed}</div>`;
const BADGE = "#feed [data-part='badge']";

describe('live-feed shape', () => {
  it('serves the badge the corner probe reads', () => {
    expect(feed).toContain('data-part="badge"');
  });

  it('rests the badge on the pill rung and holds it against the radius dial', async () => {
    for (const vertical of FIRST_PARTY_VERTICALS) {
      const readings = await measureArms({
        vertical,
        markup,
        arms: { base: {}, tight: { 'shape.radius-scale': 0.8 }, wide: { 'shape.radius-scale': 1.2 } },
        targets: [
          { id: 'badgeCorner', selector: BADGE, property: 'border-top-left-radius' },
          { id: 'pillRung', selector: BADGE, property: '--ds-radius-full' },
          { id: 'dialRung', selector: BADGE, property: '--ds-radius-lg' },
        ],
      });
      const { base, tight, wide } = readings as Record<string, Record<string, string>>;
      // The corner IS the pill rung, which is what makes the wire byte-equal to
      // the literal it replaced.
      expect(base!.pillRung!.trim()).toBe('9999px');
      expect(base!.badgeCorner).toBe('9999px');
      // The dial genuinely moves in this vertical, and the badge ignores it.
      expect(tight!.dialRung).not.toBe(wide!.dialRung);
      expect(tight!.badgeCorner).toBe('9999px');
      expect(wide!.badgeCorner).toBe('9999px');
    }
  }, 300_000);
});
