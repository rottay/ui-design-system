/**
 * The page-shell family in a real browser: the decisions its chrome deriver
 * declares in `consumes` move the family's OWN computed paint against a
 * literal negative control.
 *
 * Every produced channel is asserted in the deriver's unit suite at exactly
 * the fallback its skin already read, so each probe below holds on both sides
 * of registration: a tenant decision moves the family's paint through the
 * cascade roots the family already read, and producing the name changes WHO
 * can reach the value, not what it rests at.
 */
import React from 'react';
import { Writable } from 'node:stream';
import { prerenderToNodeStream } from 'react-dom/static';

import { DesignSystemProvider } from '@/infrastructure/runtime/bootstrap';
import { firstPartyEngineVisual } from '@/infrastructure/compilers/runtime/theme';
import type { TenantConfig } from '@/foundation/contracts';
import ModernPageShell from '../engines/modern';
import { FIRST_PARTY_VERTICALS as VERTICALS, describeCausality } from '@tests/support/family-causality';

const TENANT: TenantConfig = {
  slug: 'page-shell-causality',
  name: 'Page shell causality',
  theme: 'base',
  locale: 'en',
  fallbackLocale: 'en',
  plan: 'enterprise',
  features: [],
  branding: { companyName: 'Page shell causality' },
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
        <ModernPageShell
          title="Users"
          eyebrow="Directory"
          icon={<span>I</span>}
          subtitle="Manage tenant users"
          metadata={<span>12 records</span>}
          breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Users' }]}
          actions={<button type="button">Add</button>}
          tabs={[
            { key: 'all', label: 'All', content: <span>all</span> },
            { key: 'archived', label: 'Archived', content: <span>archived</span> },
          ]}
          activeTab="all"
        >
          <p>Page content</p>
        </ModernPageShell>
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
const TILE = "#page #primary [data-part='header-icon']";
const CRUMBS = "#page #primary [data-part='breadcrumb']";

describeCausality({
  family: 'page-shell',
  markup,
  targets: [
    // `--ds-page-header-radius` rests on the shape ramp's largest corner.
    { id: 'panelRadius', selector: HEADER, property: 'border-top-left-radius' },
    // `--ds-page-header-icon-radius` rests one rung below it.
    { id: 'tileRadius', selector: TILE, property: 'border-top-left-radius' },
    // `--ds-page-header-shadow` rests on the toolbar elevation.
    { id: 'panelShadow', selector: HEADER, property: 'box-shadow' },
    // The panel's inline room is the spacing ramp under the density dial.
    // Skin-owned, not deriver-owned: the arm proves the family is alive on a
    // plane its deriver deliberately does not claim.
    { id: 'panelPad', selector: HEADER, property: 'padding-left' },
    // The breadcrumb pill's block room is a stated literal (`4px 9px`) on no
    // plane at all, so it is the control every arm below holds.
    { id: 'crumbPad', selector: CRUMBS, property: 'padding-top' },
  ],
  decisions: {
    // `consumes: shape.*` — the panel's corner and its tile's corner.
    'shape.radius-scale': {
      value: 1.2,
      moves: ['panelRadius', 'tileRadius'],
      holds: 'crumbPad',
      in: VERTICALS,
    },
    // `consumes: surfaces.*` — the panel's resting lift.
    'surfaces.elevation-posture': {
      value: 'flat',
      moves: ['panelShadow'],
      holds: 'crumbPad',
      in: VERTICALS,
    },
    // NOT in `consumes`, and measured rather than assumed: the room the skin
    // declares rides the density dial, so the family is causal on a plane its
    // deriver states nothing about.
    'density.mode': {
      value: 'spacious',
      moves: ['panelPad'],
      holds: 'crumbPad',
      in: VERTICALS,
    },
  },
});
