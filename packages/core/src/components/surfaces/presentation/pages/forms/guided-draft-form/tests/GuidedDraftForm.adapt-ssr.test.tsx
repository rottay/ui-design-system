/**
 * The viewport posture is resolved on the server: a phone REQUEST renders the
 * stacked composition and the dropdown nav in the server markup itself, from
 * the request's viewport hint, while the live media of the rendering machine
 * says desktop. The container posture is absent on the server by contract, so
 * the stamp carries the viewport token alone.
 */
import React, { Suspense } from 'react';
import { Writable } from 'node:stream';
import { prerenderToNodeStream } from 'react-dom/static';
import { afterEach, describe, expect, it } from 'vitest';

import { mockMatchMedia } from '@tests/support/browser/match-media';
import { DesignSystemProvider } from '@/infrastructure/runtime/bootstrap';
import { firstPartyEngineVisual } from '@/infrastructure/compilers/runtime/theme';
import { resetResponsiveMediaStore } from '@/infrastructure/runtime/responsive/runtime/media-snapshot';
import type { DocumentViewportHint } from '@/infrastructure/runtime/foundation/root-attributes/ssr';
import type { TenantConfig } from '@/foundation/contracts';
import { GuidedDraftFormSurface } from '..';

const TENANT: TenantConfig = {
  slug: 'guided-draft-adapt-ssr',
  name: 'Guided draft adapt SSR',
  theme: 'base',
  locale: 'en',
  fallbackLocale: 'en',
  plan: 'enterprise',
  features: ['testing'],
  branding: { companyName: 'Guided draft adapt SSR' },
};

async function serverMarkup(ssrViewport: DocumentViewportHint): Promise<string> {
  const { prelude } = await prerenderToNodeStream(
    <DesignSystemProvider
      tenantConfig={TENANT}
      forceEngine="modern"
      engineVisual={firstPartyEngineVisual('rottay', 'modern')}
      skipCssLoading
      ssrViewport={ssrViewport}
    >
      <Suspense fallback={<div>Loading...</div>}>
        <GuidedDraftFormSurface
          title="Create event"
          sections={[
            { key: 'info', title: 'Basic info', render: () => <div>Info fields</div> },
            { key: 'schedule', title: 'Schedule', render: () => <div>Schedule fields</div> },
          ]}
          onSubmit={() => undefined}
        />
      </Suspense>
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
      .on('finish', resolve)
      .on('error', reject);
  });
  return html;
}

afterEach(() => {
  resetResponsiveMediaStore();
});

describe('GuidedDraftFormSurface adapt -- server-resolved viewport posture', () => {
  it('renders a phone request stacked, with the dropdown nav, in the server markup', async () => {
    mockMatchMedia(1440);
    const html = await serverMarkup('phone');

    expect(html).toContain('data-posture="phone"');
    // No container token: the box is never measured on the server.
    expect(html).not.toContain('data-posture="phone compact"');
    expect(html).toContain('data-layout="stacked"');
    expect(html).toContain('data-layout="dropdown"');
    expect(html).not.toContain('data-layout="sidebar"');
  });

  it('renders the same declaration with the sidebar composition for a desktop request', async () => {
    mockMatchMedia(390);
    const html = await serverMarkup('desktop');

    expect(html).toContain('data-posture="desktop"');
    expect(html).toContain('data-layout="sidebar"');
    expect(html).not.toContain('data-layout="dropdown"');
  });

  it('serves the ledger anatomy, and no card frame, from the server', async () => {
    mockMatchMedia(1440);
    const html = await serverMarkup('desktop');

    expect(html).toContain('ds-guided-draft-form__section-card');
    expect(html).toContain('ds-edit-fields');
    expect(html).toContain('data-part="section-card-header"');
    expect(html).toContain('data-part="grid"');
  });
});
