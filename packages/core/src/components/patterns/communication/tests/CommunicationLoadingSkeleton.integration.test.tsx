/**
 * The loading state of the activity log and the comment thread in a real
 * browser: each composed Skeleton row lays out as the Skeleton's own flex
 * wrapper (avatar beside the title and lines), the geometry the loaded item
 * takes, instead of stacking the avatar above them as a block.
 */
import React from 'react';
import { Writable } from 'node:stream';
import { prerenderToNodeStream } from 'react-dom/static';

import { DesignSystemProvider } from '@/infrastructure/runtime/bootstrap';
import { firstPartyEngineVisual } from '@/infrastructure/compilers/runtime/theme';
import type { TenantConfig } from '@/foundation/contracts';
import ModernActivityLog from '../activity-log/engines/modern';
import ModernCommentThread from '../comment-thread/engines/modern';
import { measureArms, type ProbeReadings, type ProbeTarget } from '@tests/support/family-causality';

const TENANT: TenantConfig = {
  slug: 'communication-loading-skeleton',
  name: 'Communication loading skeleton',
  theme: 'base',
  locale: 'en',
  fallbackLocale: 'en',
  plan: 'enterprise',
  features: [],
  branding: { companyName: 'Communication loading skeleton' },
};

async function serverMarkup(ui: React.ReactElement): Promise<string> {
  const { prelude } = await prerenderToNodeStream(
    <DesignSystemProvider
      tenantConfig={TENANT}
      forceEngine="modern"
      engineVisual={firstPartyEngineVisual('rottay', 'modern')}
      skipCssLoading
      ssrViewport="desktop"
    >
      {ui}
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

const activityLog = await serverMarkup(<ModernActivityLog activities={[]} loading />);
const commentThread = await serverMarkup(<ModernCommentThread comments={[]} loading />);
const markup = `<div id="activity-log" style="inline-size:640px">${activityLog}</div><div id="comment-thread" style="inline-size:640px">${commentThread}</div>`;

const row = (host: string) => `#${host} [data-part='skeleton-list'] > .rottay-skeleton-wrapper:first-of-type`;
const targetsFor = (host: string): ProbeTarget[] => [
  { id: `${host}.display`, selector: row(host), property: 'display' },
  { id: `${host}.avatar.right`, selector: `${row(host)} > [data-part='avatar']`, property: '@rect.right' },
  { id: `${host}.avatar.top`, selector: `${row(host)} > [data-part='avatar']`, property: '@rect.top' },
  { id: `${host}.content.left`, selector: `${row(host)} > [data-part='content']`, property: '@rect.left' },
  { id: `${host}.content.top`, selector: `${row(host)} > [data-part='content']`, property: '@rect.top' },
];

let readings: ProbeReadings;
const read = (id: string) => readings.base![id];

describe('communication loading skeletons in a real browser', () => {
  beforeAll(async () => {
    readings = await measureArms({
      vertical: 'rottay',
      markup,
      arms: { base: {} },
      targets: [...targetsFor('activity-log'), ...targetsFor('comment-thread')],
    });
  }, 120_000);

  it.each(['activity-log', 'comment-thread'])('%s lays each loading row out as the flex Skeleton wrapper', (host) => {
    expect(read(`${host}.display`)).toBe('flex');
    // Side by side: the title and lines start beside the avatar, on its row.
    expect(Number(read(`${host}.content.left`))).toBeGreaterThanOrEqual(Number(read(`${host}.avatar.right`)));
    expect(Number(read(`${host}.content.top`))).toBe(Number(read(`${host}.avatar.top`)));
  });
});
