/**
 * A feed in a narrow card keeps every item inside the card: the item header
 * wraps and its long pieces shrink, so an item's content never outgrows the
 * timeline track and spills past the clipping edge.
 */
import React from 'react';
import { Writable } from 'node:stream';
import { prerenderToNodeStream } from 'react-dom/static';

import { DesignSystemProvider } from '@/infrastructure/runtime/bootstrap';
import { firstPartyEngineVisual } from '@/infrastructure/compilers/runtime/theme';
import type { TenantConfig } from '@/foundation/contracts';
import ModernActivityLog from '../engines/modern';
import type { Activity } from '../contracts';
import { measureArms, type ProbeReadings, type ProbeTarget } from '@tests/support/family-causality';

const TENANT: TenantConfig = {
  slug: 'activity-log-narrow-host',
  name: 'Activity log narrow host',
  theme: 'base',
  locale: 'en',
  fallbackLocale: 'en',
  plan: 'enterprise',
  features: [],
  branding: { companyName: 'Activity log narrow host' },
};

const ACTIVITIES: Activity[] = [
  { id: 'a1', user: { name: 'Priya Nair' }, action: 'Updated the Q3 roadmap', timestamp: '2026-07-10T14:32:00Z' },
  {
    id: 'a2',
    user: { name: 'System' },
    action: 'Automation rule "Escalate SLA breach" triggered',
    timestamp: '2026-07-09T09:12:00Z',
  },
];

async function serverMarkup(): Promise<string> {
  const { prelude } = await prerenderToNodeStream(
    <DesignSystemProvider
      tenantConfig={TENANT}
      forceEngine="modern"
      engineVisual={firstPartyEngineVisual('rottay', 'modern')}
      skipCssLoading
      ssrViewport="desktop"
    >
      <ModernActivityLog activities={ACTIVITIES} onActivityClick={() => undefined} />
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

const HOST = 211;
const feed = await serverMarkup();
const markup = `<div id="host" style="inline-size:${HOST}px;overflow:hidden">${feed}</div><div id="wide" style="inline-size:960px">${feed}</div>`;
const LONG_ITEM = "#host [data-part='item']:nth-child(2)";

const targets: ProbeTarget[] = [
  { id: 'host.left', selector: '#host', property: '@rect.left' },
  { id: 'host.right', selector: '#host', property: '@rect.right' },
  { id: 'content.left', selector: `${LONG_ITEM} > [data-part='content']`, property: '@rect.left' },
  { id: 'content.right', selector: `${LONG_ITEM} > [data-part='content']`, property: '@rect.right' },
  { id: 'content.width', selector: `${LONG_ITEM} > [data-part='content']`, property: '@rect.width' },
  { id: 'header.width', selector: `${LONG_ITEM} [data-part='item-header']`, property: '@rect.width' },
  { id: 'badge.width', selector: `${LONG_ITEM} [data-part='badge']`, property: '@rect.width' },
  { id: 'badge.left', selector: `${LONG_ITEM} [data-part='badge']`, property: '@rect.left' },
  { id: 'badge.right', selector: `${LONG_ITEM} [data-part='badge']`, property: '@rect.right' },
  { id: 'wide.badge.width', selector: "#wide [data-part='item']:nth-child(2) [data-part='badge']", property: '@rect.width' },
  { id: 'wide.tag.width', selector: "#wide [data-part='item']:nth-child(2) [data-part='badge'] > *", property: '@rect.width' },
];

let readings: ProbeReadings;
const read = (id: string): number => Number(readings.base![id]);

describe('activity-log in a narrow card', () => {
  beforeAll(async () => {
    readings = await measureArms({ vertical: 'rottay', markup, arms: { base: {} }, targets });
  }, 120_000);

  it('keeps a long item inside the card', () => {
    expect(read('content.left')).toBeGreaterThanOrEqual(read('host.left'));
    expect(read('content.right')).toBeLessThanOrEqual(read('host.right'));
  });

  it('keeps the action badge inside the card', () => {
    expect(read('badge.left')).toBeGreaterThanOrEqual(read('host.left'));
    expect(read('badge.right')).toBeLessThanOrEqual(read('host.right'));
  });

  it('leaves the badge at the tag\'s own bound when the card has room', () => {
    expect(read('wide.badge.width')).toBe(read('wide.tag.width'));
    expect(read('wide.badge.width')).toBeGreaterThan(read('badge.width'));
  });
});
