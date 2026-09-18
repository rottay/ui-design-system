/**
 * The wizard-surface family in a real browser: the ruled alert the skin paints
 * on the stamped anatomy moves with the decision planes that already reach it,
 * the alert's stated geometry holds its negative control, and axe holds on the
 * server-rendered page.
 *
 * The family's own chrome derivers are deliberately NOT registered yet (the DT
 * integrates `derivation/index.ts` after this lot), so the productive compile
 * does not emit `--ds-wizard-surface-*`: every probe below targets paint that
 * resolves through already-registered planes (`--ds-color-error`,
 * `--ds-edge-emphasis-width`, the spacing ramp). The family-channel probe
 * lands with DT registration; until then the deriver's resting values are
 * asserted directly, beside the skin-fallback equality the deriver suite pins.
 */
import React from 'react';
import { Writable } from 'node:stream';
import { prerenderToNodeStream } from 'react-dom/static';
import { describe, expect, it } from 'vitest';

import { DesignSystemProvider } from '@/infrastructure/runtime/bootstrap';
import { firstPartyEngineVisual } from '@/infrastructure/compilers/runtime/theme';
import type { TenantConfig } from '@/foundation/contracts';
import { WizardSurface } from '..';
import { deriveWizardSurfaceChannels } from '@/infrastructure/compilers/runtime/theme/runtime/lowering/runtime/derivation/chrome/wizard-surface';
import {
  AXE_SCOPES,
  FIRST_PARTY_VERTICALS as VERTICALS,
  auditAxe,
  axeDebt,
  describeCausality,
  seriousFindings,
} from '@tests/support/family-causality';

const TENANT: TenantConfig = {
  slug: 'wizard-surface-causality',
  name: 'Wizard surface causality',
  theme: 'base',
  locale: 'en',
  fallbackLocale: 'en',
  plan: 'enterprise',
  features: [],
  branding: { companyName: 'Wizard surface causality' },
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
      <WizardSurface
        config={{
          visual: {},
          presentation: {
            chrome: { title: 'Setup flow' },
            description: 'Work through the setup steps.',
            error: 'The setup could not be validated.',
            aside: 'Step-aware help',
          },
          behavior: {
            steps: [
              {
                key: 'review',
                title: 'Review',
                content: 'Review the setup',
              },
            ],
            submitAction: {
              id: 'complete-setup',
              label: 'Complete setup',
              onClick: () => undefined,
            },
          },
        }}
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

const rendered = await serverMarkup();
const markup = `<div id="page" style="inline-size:64rem">${rendered}</div>`;

const BANNER = "#page .ds-wizard [data-part='error-banner']";

describeCausality({
  family: 'wizard-surface',
  markup,
  targets: [
    // The ruled alert's emphasis edge ink: the registered status-seed plane
    // reaches `--ds-color-error`.
    { id: 'errorEdge', selector: BANNER, property: 'border-inline-start-color' },
    // The recessed error ground the banner reads.
    { id: 'errorGround', selector: BANNER, property: 'background-color' },
    // The alert's optical padding rides the spacing ramp.
    { id: 'errorPad', selector: BANNER, property: 'padding-top' },
    // The emphasis width is a stated edge role on none of the probed planes:
    // the negative control every arm below holds.
    { id: 'edgeWidth', selector: BANNER, property: 'border-inline-start-width' },
  ],
  decisions: {
    // `palette.status-seeds` -- seeding the error ramp moves the alert's edge
    // ink; the stated edge width and the spacing-ramp padding hold.
    'palette.status-seeds': {
      value: { error: '#B7791F' },
      moves: ['errorEdge'],
      holds: 'edgeWidth',
      in: VERTICALS,
    },
    // `density.mode` -- the spacing ramp the alert's padding rides.
    'density.mode': {
      value: 'spacious',
      moves: ['errorPad'],
      holds: 'edgeWidth',
      in: VERTICALS,
    },
  },
});

/**
 * Measured debt, pinned by node IDENTITY rather than by count: a repaired node, a
 * new node and a same-count swap all go red and must be re-adjudicated.
 */
const AXE_DEBT: Record<string, Readonly<Record<string, readonly string[]>>> = {};

describe('wizard-surface causality surface', () => {
  it('serves the anatomy every probe reads', () => {
    for (const part of ['root', 'description', 'error-banner']) {
      expect(rendered, part).toContain(`data-part="${part}"`);
    }
    // The ruled alert replaced the retired error card frame.
    expect(rendered).not.toContain('ds-wizard__error-card');
  });

  it('rests every family channel at the single value the skin reads it with', () => {
    // Asserted through the deriver, not the compile: registration is DT-serialized
    // after this lot, so the productive door does not emit these names yet.
    // The description margin's value STRING chained to the produced zero rung;
    // it still resolves to 0, so no pixel moved.
    expect(deriveWizardSurfaceChannels()).toEqual({
      '--ds-wizard-surface-description-margin-block-end': 'var(--ds-spacing-0, 0)',
      '--ds-wizard-surface-error-banner-padding':
        'calc(var(--ds-spacing-3, 12px) * var(--ds-rhythm-effective-scale, 1))',
    });
  });

  it('carries no serious axe finding beyond the pinned debt', async () => {
    const measured: Record<string, Readonly<Record<string, readonly string[]>>> = {};
    for (const scope of AXE_SCOPES) {
      const debt = axeDebt(seriousFindings(await auditAxe({ ...scope, markup })));
      if (Object.keys(debt).length > 0) measured[`${scope.vertical} ${scope.theme}`] = debt;
    }
    expect(measured).toEqual(AXE_DEBT);
  }, 300_000);
});
