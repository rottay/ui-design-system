/**
 * The default toolbar adapts to a narrow calendar: when navigation and the
 * view controls cannot share one line, the view controls wrap below instead
 * of being pushed past the calendar's edge, where a clipping card hides them.
 */
import React from 'react';
import { Writable } from 'node:stream';
import { prerenderToNodeStream } from 'react-dom/static';

import { DesignSystemProvider } from '@/infrastructure/runtime/bootstrap';
import { firstPartyEngineVisual } from '@/infrastructure/compilers/runtime/theme';
import type { TenantConfig } from '@/foundation/contracts';
import ModernCalendarView from '../engines/modern';
import { measureArms, type ProbeReadings, type ProbeTarget } from '@tests/support/family-causality';

const noop = () => {};

const TENANT: TenantConfig = {
  slug: 'calendar-view-narrow-host',
  name: 'Calendar view narrow host',
  theme: 'base',
  locale: 'en',
  fallbackLocale: 'en',
  plan: 'enterprise',
  features: [],
  branding: { companyName: 'Calendar view narrow host' },
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
      <ModernCalendarView
        events={[]}
        currentDate={new Date(2026, 8, 15)}
        onDateChange={noop}
        onDateClick={noop}
        onEventClick={noop}
        onViewChange={noop}
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

const calendar = await serverMarkup();
const HOSTS = { narrow: 181, medium: 221, wide: 960 } as const;
const markup = Object.entries(HOSTS)
  .map(([id, size]) => `<div id="${id}" style="inline-size:${size}px;overflow:hidden">${calendar}</div>`)
  .join('');

const targets: ProbeTarget[] = Object.keys(HOSTS).flatMap((id) => [
  { id: `${id}.host.right`, selector: `#${id}`, property: '@rect.right' },
  { id: `${id}.toolbar.right`, selector: `#${id} [data-part='toolbar']`, property: '@rect.right' },
  { id: `${id}.navigation.right`, selector: `#${id} [data-part='navigation']`, property: '@rect.right' },
  { id: `${id}.navigation.top`, selector: `#${id} [data-part='navigation']`, property: '@rect.top' },
  { id: `${id}.navigation.bottom`, selector: `#${id} [data-part='navigation']`, property: '@rect.bottom' },
  { id: `${id}.controls.right`, selector: `#${id} [data-part='view-controls']`, property: '@rect.right' },
  { id: `${id}.controls.top`, selector: `#${id} [data-part='view-controls']`, property: '@rect.top' },
]);

let readings: ProbeReadings;
const read = (id: string): number => Number(readings.base![id]);

describe('calendar-view toolbar in a narrow host', () => {
  beforeAll(async () => {
    readings = await measureArms({ vertical: 'rottay', markup, arms: { base: {} }, targets });
  }, 120_000);

  it('keeps the view controls inside a narrow calendar', () => {
    for (const id of ['narrow', 'medium']) {
      expect(read(`${id}.controls.right`), id).toBeLessThanOrEqual(read(`${id}.host.right`));
      expect(read(`${id}.navigation.right`), id).toBeLessThanOrEqual(read(`${id}.host.right`));
    }
  });

  it('wraps the view controls below the navigation when they cannot share a line', () => {
    expect(read('narrow.controls.top')).toBeGreaterThanOrEqual(read('narrow.navigation.bottom'));
  });

  it('keeps one toolbar line when the calendar is wide', () => {
    expect(read('wide.controls.top')).toBeLessThan(read('wide.navigation.bottom'));
    expect(read('wide.controls.right')).toBeLessThanOrEqual(read('wide.toolbar.right'));
    expect(read('wide.controls.right')).toBeGreaterThan(read('wide.toolbar.right') - 8);
  });
});
