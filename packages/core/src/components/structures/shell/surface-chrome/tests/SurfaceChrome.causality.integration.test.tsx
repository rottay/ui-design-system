/**
 * The surface-chrome family in a real browser: the density plane its chrome
 * deriver declares in `consumes` moves the family's OWN computed paint against
 * a literal negative control.
 */
import React from 'react';
import { Writable } from 'node:stream';
import { prerenderToNodeStream } from 'react-dom/static';

import { DesignSystemProvider } from '@/infrastructure/runtime/bootstrap';
import { firstPartyEngineVisual } from '@/infrastructure/compilers/runtime/theme';
import type { TenantConfig } from '@/foundation/contracts';
import { SurfaceSectionCard, SurfaceTabbedLabel } from '..';
import { FIRST_PARTY_VERTICALS as VERTICALS, describeCausality } from '@tests/support/family-causality';

const TENANT: TenantConfig = {
  slug: 'surface-chrome-causality',
  name: 'Surface chrome causality',
  theme: 'base',
  locale: 'en',
  fallbackLocale: 'en',
  plan: 'enterprise',
  features: [],
  branding: { companyName: 'Surface chrome causality' },
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
      <div id="primary">
        <SurfaceSectionCard
          eyebrow="Context"
          icon={<span>I</span>}
          title="Billing"
          description="Plans and invoices"
          actions={<button type="button">Edit</button>}
        >
          <p>Section body</p>
        </SurfaceSectionCard>
        <SurfaceTabbedLabel view={{ label: 'Open', badge: <span>4</span> }} />
      </div>
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
const markup = `<div id="page" style="inline-size:64rem">${rendered}</div>`;

const HEADER = "#page #primary [data-part='header']";
const BODY = "#page #primary [data-part='section-content']";
const LABEL = "#page #primary [data-part='tab-label']";

describeCausality({
  family: 'surface-chrome',
  markup,
  targets: [
    // The header's room and the body's room ride the spacing ramp.
    { id: 'headerPad', selector: HEADER, property: 'padding-left' },
    { id: 'bodyPad', selector: BODY, property: 'padding-left' },
    // `--ds-section-card-tab-label-gap` rests on the same ramp.
    { id: 'labelGap', selector: LABEL, property: 'column-gap' },
    // The header's minimum band is a stated literal on no plane at all, so it
    // is the control every arm below holds.
    { id: 'headerBand', selector: HEADER, property: 'min-height' },
  ],
  decisions: {
    // `consumes: density` — the rooms of the chrome, including the tab label's.
    'density.mode': {
      value: 'spacious',
      moves: ['headerPad', 'bodyPad', 'labelGap'],
      holds: 'headerBand',
      in: VERTICALS,
    },
  },
});
