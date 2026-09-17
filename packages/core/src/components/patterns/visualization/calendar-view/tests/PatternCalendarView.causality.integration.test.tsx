/**
 * The calendar-view family in a real browser: every keypath the family deriver
 * declares in `consumes` is exercised against the family's OWN computed paint
 * with a negative control, the reading direction is measured on the grid that
 * actually mirrors, and axe holds beyond the pinned debt.
 */
import React from 'react';
import { Writable } from 'node:stream';
import { prerenderToNodeStream } from 'react-dom/static';
import { describe, expect, it } from 'vitest';

import { DesignSystemProvider } from '@/infrastructure/runtime/bootstrap';
import { firstPartyEngineVisual } from '@/infrastructure/compilers/runtime/theme';
import type { TenantConfig } from '@/foundation/contracts';
import ModernCalendarView from '../engines/modern';
import {
  AXE_SCOPES,
  FIRST_PARTY_VERTICALS as VERTICALS,
  auditAxe,
  axeDebt,
  describeCausality,
  measureArms,
  seriousFindings,
} from '@tests/support/family-causality';

const noop = () => {};

/** A fixed month, so the probe reads the same grid on every run. */
const MONTH = new Date(2026, 2, 15);
const day = (d: number) => new Date(2026, 2, d);

const EVENTS = [
  { id: 'e1', title: 'Kickoff', start: day(3) },
  { id: 'e2', title: 'Retro', start: day(3) },
  { id: 'e3', title: 'Release window', start: day(10), color: 'var(--ds-color-info)' },
];

const TENANT: TenantConfig = {
  slug: 'calendar-view-causality',
  name: 'Calendar view causality',
  theme: 'base',
  locale: 'en',
  fallbackLocale: 'en',
  plan: 'enterprise',
  features: [],
  branding: { companyName: 'Calendar view causality' },
};

/** The family's own server markup, kept whole as the list-toolbar precedent keeps it. */
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
        events={EVENTS}
        currentDate={MONTH}
        onDateChange={noop}
        onDateClick={noop}
        onEventClick={noop}
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
const markup = `<div id="calendar" style="inline-size:64rem">${calendar}</div>`;

const GRID = "#calendar [data-part='grid']";
const WEEKDAY = "#calendar [data-part='weekday']";
const TITLE = "#calendar [data-part='month-title']";
const CELL = "#calendar [data-part='day-cell'][data-empty='false']";
const SELECTED = "#calendar [data-part='day-cell'][data-selected='true']";
const EVENT = "#calendar [data-part='event']";

describeCausality({
  family: 'calendar-view',
  markup,
  targets: [
    // The event chip rests on the family's own accent channel, which the
    // deriver chains to the seeded primary; the selected day's inset frame is
    // the same ramp reached a second way, as a SHAPE rather than as a fill.
    { id: 'eventGround', selector: EVENT, property: 'background-color' },
    { id: 'selectedFrame', selector: SELECTED, property: 'box-shadow' },
    { id: 'titleFont', selector: TITLE, property: 'font-size' },
    { id: 'weekdayFont', selector: WEEKDAY, property: 'font-size' },
    { id: 'gridCorner', selector: GRID, property: 'border-top-left-radius' },
    { id: 'eventCorner', selector: EVENT, property: 'border-top-left-radius' },
    {
      id: 'focusRing',
      selector: CELL,
      property: 'outline-width',
      attributes: { 'data-state': 'focus-visible' },
    },
    { id: 'weekdayPad', selector: WEEKDAY, property: 'padding-top' },
    { id: 'cellPad', selector: CELL, property: 'padding-top' },
  ],
  decisions: {
    // `consumes: palette.*` -- the chip accent and the date-label ink both
    // resolve from the seeded ramp.
    'palette.seeds': {
      value: { primary: '#2F6B9A' },
      moves: ['eventGround', 'selectedFrame'],
      holds: 'gridCorner',
      in: VERTICALS,
    },
    // `consumes: typography.roles` -- the month title and the weekday row are
    // the family's own text.
    'typography.scale': {
      value: 1.08,
      moves: ['titleFont', 'weekdayFont'],
      holds: 'gridCorner',
      in: VERTICALS,
    },
    // `consumes: surfaces.radiusScale` -- the grid frame and the event chip
    // close on two different rungs of the same ramp.
    'shape.radius-scale': {
      value: 1.2,
      moves: ['gridCorner', 'eventCorner'],
      holds: 'eventGround',
      in: VERTICALS,
    },
    // `consumes: states.focus` -- a day cell is a real roving tab stop, so the
    // focus signature is the width of its own inset ring.
    'states.focus-style': {
      value: 'glow',
      moves: ['focusRing'],
      holds: 'gridCorner',
      in: VERTICALS,
    },
    // `consumes: density` -- the weekday row and the cell rhythm ride the
    // density-scaled spacing ramp.
    'density.mode': {
      value: 'spacious',
      moves: ['weekdayPad', 'cellPad'],
      holds: 'gridCorner',
      in: VERTICALS,
    },
  },
});

/**
 * Measured debt, pinned by node IDENTITY rather than by count: a repaired
 * node, a new node and a same-count swap all go red and must be
 * re-adjudicated. Registered, never excluded; a scope with no entry is a
 * scope that must stay clean.
 *
 * Every finding is contrast, in three groups, and the groups are NOT the same
 * kind of debt:
 *  - composed primitives the family does not paint: the Select surface and the
 *    ghost "Today" Button label under bithire dark (`#_R_2_`, `select`, the
 *    Button's own label part). Each primitive owns its own ink;
 *  - the family's OWN weekday header under the two light scopes
 *    (`--ds-color-text-secondary` on `--ds-surface-inset`) -- this cut's named
 *    residue, a tone decision for the owner rather than a cut edit;
 *  - the family's OWN event chip where the on-primary ink and the seeded
 *    accent land too close (evnto light, rottay dark, and the chip that states
 *    `var(--ds-color-info)` in evnto light). The chip reads by TITLE TEXT
 *    inside its accent, so the fix is a readable-ink relation on the accent
 *    channel, which is a derivation question and not a skin literal.
 */
const AXE_DEBT: Record<string, Readonly<Record<string, readonly string[]>>> = {
  'bithire dark': {
    'color-contrast': [
      '#_R_2_',
      'button[data-action="today"] > span[data-part="content"][data-state="visible"] > span[data-part="label"]',
      'select',
    ],
  },
  'bithire light': {
    'color-contrast': [
      'div[data-part="weekday"][role="columnheader"]:nth-child(1)',
      'div[data-part="weekday"][role="columnheader"]:nth-child(2)',
      'div[data-part="weekday"][role="columnheader"]:nth-child(3)',
      'div[data-part="weekday"][role="columnheader"]:nth-child(4)',
      'div[data-part="weekday"][role="columnheader"]:nth-child(5)',
      'div[data-part="weekday"][role="columnheader"]:nth-child(6)',
      'div[data-part="weekday"][role="columnheader"]:nth-child(7)',
    ],
  },
  'evnto light': {
    'color-contrast': [
      'div[data-part="week-row"][role="row"]:nth-child(2) > div[data-last-column="false"][data-empty="false"][role="gridcell"]:nth-child(3) > div[role="button"][data-part="event"]:nth-child(2)',
      'div[data-part="weekday"][role="columnheader"]:nth-child(1)',
      'div[data-part="weekday"][role="columnheader"]:nth-child(2)',
      'div[data-part="weekday"][role="columnheader"]:nth-child(3)',
      'div[data-part="weekday"][role="columnheader"]:nth-child(4)',
      'div[data-part="weekday"][role="columnheader"]:nth-child(5)',
      'div[data-part="weekday"][role="columnheader"]:nth-child(6)',
      'div[data-part="weekday"][role="columnheader"]:nth-child(7)',
      'div[role="button"][data-part="event"]:nth-child(3)',
    ],
  },
  'rottay dark': {
    'color-contrast': [
      'div[data-part="week-row"][role="row"]:nth-child(3) > div[data-last-column="false"][data-empty="false"][role="gridcell"]:nth-child(3) > div[role="button"][data-part="event"]',
    ],
  },
};

describe('calendar-view causality surface', () => {
  it('serves the anatomy every probe reads', () => {
    expect(calendar).toContain('data-part="root"');
    expect(calendar).toContain('data-part="grid"');
    expect(calendar).toContain('data-part="weekday"');
    expect(calendar).toContain('data-part="month-title"');
    expect(calendar).toContain('data-part="day-cell"');
    expect(calendar).toContain('data-part="date-label"');
    expect(calendar).toContain('data-part="event"');
    // The day cell and the event chip are stateful parts decided by the
    // kernel: at rest they carry NO `data-state`, so `[data-state]` never
    // matches a resting cell and the skin's paired arms fall through to the
    // platform pseudo-class.
    expect(calendar).not.toContain('data-part="day-cell" data-state');
    expect(calendar).not.toContain('data-part="event" data-state');
  });

  /**
   * An event that states no colour stamps NO channel, so the derived resting
   * accent stays the theme's; an event that states one outranks it exactly as
   * an inline declaration outranks the theme root.
   */
  it('stamps the accent channel only for an event that states a colour', async () => {
    // Two of the three events state no colour; the third does.
    expect(calendar.match(/--ds-calendar-view-event-accent/g)).toHaveLength(1);
    const readings = await measureArms({
      vertical: 'rottay',
      markup,
      arms: { base: {}, seeded: { 'palette.seeds': { primary: '#2F6B9A' } } },
      targets: [
        { id: 'themed', selector: EVENT, property: 'background-color' },
        {
          id: 'stated',
          selector: "#calendar [data-part='event'][style]",
          property: 'background-color',
        },
        {
          id: 'channel',
          selector: "#calendar [data-part='root']",
          property: '--ds-calendar-view-event-accent',
        },
      ],
    });
    // The channel has a producer: the read resolves to a value, not to nothing.
    expect(readings.base!.channel!.trim()).not.toBe('');
    // The theme's chip follows the palette; the caller's chip does not.
    expect(readings.seeded!.themed).not.toBe(readings.base!.themed);
    expect(readings.seeded!.stated).toBe(readings.base!.stated);
  }, 120_000);

  /**
   * The seven-column grid is the reading order itself, so the first weekday
   * and the first cell travel to the other edge under `dir=rtl`. This is the
   * reading the logical borders and the `text-align: end` label exist for,
   * measured rather than asserted from the CSS text.
   */
  it('reads the month from the other edge under dir=rtl', async () => {
    const readings = await measureArms({
      vertical: 'rottay',
      markup,
      arms: { base: {} },
      targets: [
        { id: 'weekdayLeftLtr', selector: WEEKDAY, property: '@rect.left' },
        { id: 'weekdayLeftRtl', selector: WEEKDAY, property: '@rect.left', dir: 'rtl' },
        { id: 'gridLeft', selector: GRID, property: '@rect.left' },
      ],
    });
    const r = readings.base!;
    expect(Number(r.weekdayLeftRtl)).toBeGreaterThan(Number(r.weekdayLeftLtr));
  }, 120_000);

  it('carries no serious axe finding beyond the pinned debt', async () => {
    const measured: Record<string, Readonly<Record<string, readonly string[]>>> = {};
    for (const scope of AXE_SCOPES) {
      const debt = axeDebt(seriousFindings(await auditAxe({ ...scope, markup })));
      if (Object.keys(debt).length > 0) measured[`${scope.vertical} ${scope.theme}`] = debt;
    }
    expect(measured).toEqual(AXE_DEBT);
  }, 300_000);
});
