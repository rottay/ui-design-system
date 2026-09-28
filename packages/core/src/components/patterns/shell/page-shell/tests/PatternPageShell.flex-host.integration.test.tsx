/**
 * The page-shell root is an inline-size container, so it has no content-based
 * inline size: it must fill its host whether that host is a block box or a
 * column flex container (Stack), and still centre under a caller `maxWidth`.
 */
import React from 'react';
import { Writable } from 'node:stream';
import { prerenderToNodeStream } from 'react-dom/static';

import { DesignSystemProvider } from '@/infrastructure/runtime/bootstrap';
import { firstPartyEngineVisual } from '@/infrastructure/compilers/runtime/theme';
import type { TenantConfig } from '@/foundation/contracts';
import ModernPageShell from '../engines/modern';
import { measureArms, type ProbeReadings, type ProbeTarget } from '@tests/support/family-causality';

const TENANT: TenantConfig = {
  slug: 'page-shell-flex-host',
  name: 'Page shell flex host',
  theme: 'base',
  locale: 'en',
  fallbackLocale: 'en',
  plan: 'enterprise',
  features: [],
  branding: { companyName: 'Page shell flex host' },
};

async function serverMarkup(maxWidth?: number): Promise<string> {
  const { prelude } = await prerenderToNodeStream(
    <DesignSystemProvider
      tenantConfig={TENANT}
      forceEngine="modern"
      engineVisual={firstPartyEngineVisual('rottay', 'modern')}
      skipCssLoading
      ssrViewport="desktop"
    >
      <ModernPageShell
        title="Users"
        subtitle="Manage tenant users"
        maxWidth={maxWidth}
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Settings', href: '/settings' }, { label: 'Users' }]}
        back={{ label: 'Settings', onClick: () => undefined }}
        actions={<button type="button">Add User</button>}
        tabs={[
          { key: 'all', label: 'All', content: <span>All records</span> },
          { key: 'archived', label: 'Archived', content: <span>Archived records</span> },
        ]}
        activeTab="all"
      >
        <p>Tab-driven body</p>
      </ModernPageShell>
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

const HOST_INLINE_SIZE = 1024;
const BLOCK_HOST = `display:block;inline-size:${HOST_INLINE_SIZE}px`;
const FLEX_HOST = `display:flex;flex-direction:column;align-items:stretch;inline-size:${HOST_INLINE_SIZE}px`;

const shell = await serverMarkup();
const measured = await serverMarkup(600);

const hosts = {
  block: shell,
  flex: shell,
  flexMeasured: measured,
};
const markup = Object.entries(hosts)
  .map(([id, html]) => `<div id="${id}" style="${id === 'block' ? BLOCK_HOST : FLEX_HOST}">${html}</div>`)
  .join('');

const targets: ProbeTarget[] = Object.keys(hosts).flatMap((id) => [
  { id: `${id}.host.left`, selector: `#${id}`, property: '@rect.left' },
  { id: `${id}.root.width`, selector: `#${id} [data-part='root']`, property: '@rect.width' },
  { id: `${id}.root.left`, selector: `#${id} [data-part='root']`, property: '@rect.left' },
  { id: `${id}.crumb.width`, selector: `#${id} [data-part='breadcrumb']`, property: '@rect.width' },
  { id: `${id}.crumb.height`, selector: `#${id} [data-part='breadcrumb']`, property: '@rect.height' },
  { id: `${id}.tabs.width`, selector: `#${id} [data-part='tabs']`, property: '@rect.width' },
  { id: `${id}.tab.width`, selector: `#${id} [data-part='tab'][data-active='false']`, property: '@rect.width' },
  { id: `${id}.tab.height`, selector: `#${id} [data-part='tab'][data-active='false']`, property: '@rect.height' },
]);

let readings: ProbeReadings;
const read = (id: string): number => Number(readings.base![id]);

describe('page-shell root in a column flex host', () => {
  beforeAll(async () => {
    readings = await measureArms({ vertical: 'rottay', markup, arms: { base: {} }, targets });
  }, 120_000);

  it('fills a block host', () => {
    expect(read('block.root.width')).toBe(HOST_INLINE_SIZE);
  });

  it('fills a column flex host exactly as it fills a block host', () => {
    expect(read('flex.root.width')).toBe(HOST_INLINE_SIZE);
    for (const part of ['crumb.width', 'crumb.height', 'tabs.width', 'tab.width', 'tab.height']) {
      expect(read(`flex.${part}`), part).toBe(read(`block.${part}`));
    }
  });

  it('keeps the breadcrumb pill and the inactive tab at their content size', () => {
    expect(read('flex.crumb.width')).toBeGreaterThan(read('flex.crumb.height') * 4);
    expect(read('flex.tab.width')).toBeGreaterThan(read('flex.tab.height'));
    expect(read('flex.tabs.width')).toBeGreaterThan(HOST_INLINE_SIZE / 2);
  });

  it('honours a caller maxWidth and centres the measured root in a flex host', () => {
    expect(read('flexMeasured.root.width')).toBe(600);
    const offset = read('flexMeasured.root.left') - read('flexMeasured.host.left');
    expect(offset).toBe((HOST_INLINE_SIZE - 600) / 2);
  });
});
