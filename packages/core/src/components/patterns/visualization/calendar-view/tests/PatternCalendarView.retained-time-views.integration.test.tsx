import React from 'react';
import { Writable } from 'node:stream';
import { prerenderToNodeStream } from 'react-dom/static';
import { beforeAll, describe, expect, it } from 'vitest';

import { DesignSystemProvider } from '@/infrastructure/runtime/bootstrap';
import { firstPartyEngineVisual } from '@/infrastructure/compilers/runtime/theme';
import type { TenantConfig } from '@/foundation/contracts';
import { measureArms, type ProbeReadings, type ProbeTarget } from '@tests/support/family-causality';
import ModernCalendarView from '../engines/modern';

const CURRENT = new Date(2026, 2, 18);
const TENANT: TenantConfig = {
  slug: 'calendar-retained-views', name: 'Calendar retained views', theme: 'base',
  locale: 'en', fallbackLocale: 'en', plan: 'enterprise', features: [],
  branding: { companyName: 'Calendar retained views' },
};
const EVENTS = [
  { id: 'long', title: 'Long meeting', start: new Date(2026, 2, 18, 1, 30), end: new Date(2026, 2, 18, 3) },
  { id: 'overlap', title: 'Overlap', start: new Date(2026, 2, 18, 1, 45), end: new Date(2026, 2, 18, 2, 15) },
  { id: 'next', title: 'Adjacent meeting', start: new Date(2026, 2, 18, 3), end: new Date(2026, 2, 18, 4) },
  { id: 'point', title: 'Late point', start: new Date(2026, 2, 18, 23, 50) },
  { id: 'short', title: 'Late short', start: new Date(2026, 2, 18, 23, 52), end: new Date(2026, 2, 18, 23, 55) },
  { id: 'midnight', title: 'Midnight finish', start: new Date(2026, 2, 18, 23, 57), end: new Date(2026, 2, 19) },
];

async function markup(view: 'week' | 'day', prefix: string): Promise<string> {
  const { prelude } = await prerenderToNodeStream(
    <DesignSystemProvider
      tenantConfig={TENANT} forceEngine="modern"
      engineVisual={firstPartyEngineVisual('rottay', 'modern')}
      skipCssLoading ssrViewport="desktop"
    >
      <ModernCalendarView events={EVENTS} currentDate={CURRENT} view={view} onEventClick={() => undefined} />
    </DesignSystemProvider>,
    { identifierPrefix: prefix },
  );
  let html = '';
  await new Promise<void>((resolve, reject) => {
    prelude.pipe(new Writable({ write(chunk, _encoding, done) { html += chunk.toString(); done(); } }))
      .on('finish', () => resolve()).on('error', reject);
  });
  return html;
}

const day = await markup('day', 'calendar-day');
const week = await markup('week', 'calendar-week');
const narrow = await markup('week', 'calendar-narrow');
const scene = `<section id="day" style="inline-size:600px">${day}</section><section id="week" style="inline-size:1120px">${week}</section><section id="narrow" style="inline-size:320px">${narrow}</section>`;
const targets: ProbeTarget[] = [];
for (const id of ['day', 'week']) {
  for (const [name, selector] of [
    ['long', '.ds-pattern-calendar-view__event[aria-label="Long meeting"]'],
    ['overlap', '.ds-pattern-calendar-view__event[aria-label="Overlap"]'],
    ['next', '.ds-pattern-calendar-view__event[aria-label="Adjacent meeting"]'],
    ['point', '.ds-pattern-calendar-view__event[aria-label="Late point"]'],
    ['short', '.ds-pattern-calendar-view__event[aria-label="Late short"]'],
    ['midnight', '.ds-pattern-calendar-view__event[aria-label="Midnight finish"]'],
    ['hour23', '[data-date="2026-03-18"][data-hour="23"][data-occurrence="0"]'],
    ['hour1', '[data-date="2026-03-18"][data-hour="1"][data-occurrence="0"]'],
    ['hour3', '[data-date="2026-03-18"][data-hour="3"][data-occurrence="0"]'],
  ]) {
    for (const edge of ['top', 'bottom', 'left', 'right', 'width']) targets.push({ id: `${id}.${name}.${edge}`, selector: `#${id} ${selector}`, property: `@rect.${edge}` });
  }
}
targets.push(
  { id: 'narrow.host.width', selector: '#narrow', property: '@rect.width' },
  { id: 'narrow.grid.width', selector: '#narrow [role="grid"]', property: '@rect.width' },
  { id: 'narrow.grid.overflow', selector: '#narrow [role="grid"]', property: 'overflow-x' },
);
let readings: ProbeReadings;
let touchReadings: ProbeReadings;
function read(id: string, touch = false): number {
  const value = Number((touch ? touchReadings : readings).base?.[id]);
  expect(Number.isFinite(value), `${id} must resolve to an actual box`).toBe(true);
  return value;
}

describe('CalendarView Modern retained view geometry in Chromium', () => {
  beforeAll(async () => {
    readings = await measureArms({ vertical: 'rottay', markup: scene, arms: { base: {} }, targets });
    touchReadings = await measureArms({ vertical: 'rottay', markup: scene, arms: { base: {} }, targets, environment: { touch: true } });
  }, 120_000);

  it.each(['day', 'week'])('positions the %s event at half past its starting hour and at its end boundary', (view) => {
    const top = read(`${view}.hour1.top`);
    const height = read(`${view}.hour1.bottom`) - top;
    expect(height).toBeGreaterThan(30);
    expect(Math.abs(read(`${view}.long.top`) - (top + height / 2))).toBeLessThanOrEqual(3);
    expect(Math.abs(read(`${view}.long.bottom`) - read(`${view}.hour3.top`))).toBeLessThanOrEqual(4);
  });

  it.each(['day', 'week'])('keeps overlapping %s entries beside each other and returns an adjacent entry to full width', (view) => {
    expect(read(`${view}.long.right`)).toBeLessThanOrEqual(read(`${view}.overlap.left`) + 2);
    expect(read(`${view}.overlap.top`)).toBeLessThan(read(`${view}.long.bottom`));
    expect(read(`${view}.overlap.bottom`)).toBeGreaterThan(read(`${view}.long.top`));
    expect(read(`${view}.next.width`)).toBeGreaterThan(read(`${view}.long.width`) * 1.8);
    expect(read(`${view}.long.width`)).toBeGreaterThan(20);
  });

  it.each([
    ['day', false], ['week', false], ['day', true], ['week', true],
  ] as const)('contains minimum late-day %s footprints inside midnight with touch=%s', (view, touch) => {
    const top = read(`${view}.hour23.top`, touch);
    const bottom = read(`${view}.hour23.bottom`, touch);
    for (const name of ['point', 'short', 'midnight']) {
      const entryTop = read(`${view}.${name}.top`, touch);
      const entryBottom = read(`${view}.${name}.bottom`, touch);
      expect(entryTop).toBeGreaterThanOrEqual(top - 1);
      expect(entryBottom).toBeLessThanOrEqual(bottom + 1);
      expect(entryBottom - entryTop).toBeGreaterThanOrEqual(touch ? 44 : 24);
      expect(read(`${view}.${name}.width`, touch)).toBeGreaterThan(20);
    }
    expect(read(`${view}.point.right`, touch)).toBeLessThanOrEqual(read(`${view}.short.left`, touch) + 2);
    expect(read(`${view}.short.right`, touch)).toBeLessThanOrEqual(read(`${view}.midnight.left`, touch) + 2);
  });

  it('bounds a narrow week inside its host with its own horizontal scrollport', () => {
    expect(read('narrow.grid.width')).toBeLessThanOrEqual(read('narrow.host.width'));
    expect(readings.base?.['narrow.grid.overflow']).toBe('auto');
  });
});
