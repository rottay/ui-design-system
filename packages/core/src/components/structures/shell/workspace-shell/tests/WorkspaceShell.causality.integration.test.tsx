/**
 * The workspace-shell family in a real browser: the palette plane its chrome
 * deriver declares in `consumes` moves the family's OWN computed paint against
 * a literal negative control.
 *
 * The deriver's channels are the LIVE field's two canvas colours and two mask
 * ramps, which only exist once a route opts the ParticleField out of
 * quarantine. What the quarantined default paints instead is the static field,
 * authored in the same skin from the same accent — so the probe measures the
 * plane on the surface a default render actually shows, and says so.
 */
import React from 'react';
import { Writable } from 'node:stream';
import { prerenderToNodeStream } from 'react-dom/static';

import { DesignSystemProvider } from '@/infrastructure/runtime/bootstrap';
import { firstPartyEngineVisual } from '@/infrastructure/compilers/runtime/theme';
import type { TenantConfig } from '@/foundation/contracts';
import { WorkspaceShell } from '..';
import { FIRST_PARTY_VERTICALS as VERTICALS, describeCausality } from '@tests/support/family-causality';

const TENANT: TenantConfig = {
  slug: 'workspace-shell-causality',
  name: 'Workspace shell causality',
  theme: 'base',
  locale: 'en',
  fallbackLocale: 'en',
  plan: 'enterprise',
  features: [],
  branding: { companyName: 'Workspace shell causality' },
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
        <WorkspaceShell variant="ai-field" fieldPattern="hybrid" intensity="medium">
          <p>Workspace content</p>
        </WorkspaceShell>
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

const ROOT = "#page #primary [data-part='root']";
const FIELD = "#page #primary [data-part='particle-field-static-fallback']";
const CONTENT = "#page #primary [data-part='content']";

describeCausality({
  family: 'workspace-shell',
  markup,
  targets: [
    // The field's own grain is mixed from the accent.
    { id: 'fieldGrain', selector: FIELD, property: 'background-image' },
    // The continuous surface's frame is the accent over the subtle rule.
    { id: 'shellFrame', selector: ROOT, property: 'border-top-color' },
    // The shell's corner is the card radius under the shape ramp.
    { id: 'shellRadius', selector: ROOT, property: 'border-top-left-radius' },
    // The content layer's stacking order is structural and on no plane at
    // all, so it is the control every arm below holds.
    { id: 'contentLayer', selector: CONTENT, property: 'z-index' },
  ],
  decisions: {
    // `consumes: palette.*` — one accent mixes the whole atmosphere.
    'palette.seeds': {
      value: { primary: '#2F6B9A' },
      moves: ['fieldGrain', 'shellFrame'],
      holds: 'contentLayer',
      in: VERTICALS,
    },
    // NOT in `consumes`: the shell's corner rides the shape ramp through the
    // card radius root, which the skin reads and the deriver states nothing about.
    'shape.radius-scale': {
      value: 1.2,
      moves: ['shellRadius'],
      holds: 'contentLayer',
      in: VERTICALS,
    },
  },
});
