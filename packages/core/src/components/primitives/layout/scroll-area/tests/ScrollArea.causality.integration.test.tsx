/**
 * The scroll-area family in a real browser: the keyboard ring the region paints
 * is GEOMETRY the focus decision moves, read under the kernel's own stamp
 * rather than through a channel, and the resting region is untouched by it.
 */
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import ModernScrollArea from '../engines/modern';
import {
  AXE_SCOPES,
  FIRST_PARTY_VERTICALS as VERTICALS,
  auditAxe,
  axeDebt,
  describeCausality,
  measureArms,
  seriousFindings,
} from '@tests/support/family-causality';

const markup = `<div id="host" style="inline-size:24rem">${renderToStaticMarkup(
  <ModernScrollArea maxHeight={160} orientation="vertical" aria-label="Release notes">
    <p>The region is taller than its bound, so it really scrolls.</p>
    <p style={{ blockSize: '24rem' }}>Overflow</p>
  </ModernScrollArea>,
)}</div>`;

const ROOT = "#host [data-part='root']";

/**
 * `focus-visible` is the kernel's own token, so stamping it is reproducing what
 * `useInteractionState` serializes, not fabricating a state: the engine runs
 * the region through the kernel and the skin's arm pairs that token with the
 * platform pseudo-class.
 */
const FOCUSED = { 'data-state': 'focus-visible' } as const;

describeCausality({
  family: 'scroll-area',
  markup,
  targets: [
    { id: 'ringWidth', selector: ROOT, property: 'outline-width', attributes: FOCUSED },
    { id: 'ringOffset', selector: ROOT, property: 'outline-offset', attributes: FOCUSED },
    { id: 'ringInk', selector: ROOT, property: 'outline-color', attributes: FOCUSED },
    // The control: the scrollbar rail is a closed size enum no tenant decision
    // reaches, so a decision that moves it has escaped its own group.
    { id: 'railSize', selector: ROOT, property: '--ds-scroll-area-scrollbar-size' },
  ],
  decisions: {
    'states.focus-style': {
      value: 'glow',
      moves: ['ringWidth', 'ringOffset'],
      holds: 'railSize',
      in: VERTICALS,
    },
    'palette.seeds': {
      value: { primary: '#2F6B9A' },
      moves: ['ringInk'],
      holds: 'railSize',
      in: VERTICALS,
    },
  },
});

describe('scroll-area focus ring', () => {
  /**
   * The state arm is the only thing that paints the ring. At rest the kernel
   * serializes nothing, so `[data-state]` cannot match and the region carries
   * the platform's own outline -- which is what makes the twin free at rest.
   */
  it('paints no ring at rest and a governed one under the stamp', async () => {
    const readings = await measureArms({
      vertical: 'bithire',
      markup,
      arms: { base: {} },
      targets: [
        { id: 'restWidth', selector: ROOT, property: 'outline-width' },
        { id: 'restStyle', selector: ROOT, property: 'outline-style' },
        { id: 'stampedWidth', selector: ROOT, property: 'outline-width', attributes: FOCUSED },
        { id: 'stampedStyle', selector: ROOT, property: 'outline-style', attributes: FOCUSED },
        { id: 'stampedOffset', selector: ROOT, property: 'outline-offset', attributes: FOCUSED },
      ],
    });
    const r = readings.base!;
    expect(r.restStyle).toBe('none');
    expect(r.stampedStyle).toBe('solid');
    // A non-vacuity floor: the ring is a real measured length, not an empty
    // reading that would make every comparison above pass by accident.
    expect(Number.parseFloat(r.stampedWidth!)).toBeGreaterThan(0);
    expect(r.stampedWidth).not.toBe(r.restWidth);
    expect(r.stampedOffset!.endsWith('px')).toBe(true);
  }, 60_000);

  it('carries no serious axe finding', async () => {
    const measured: Record<string, Readonly<Record<string, readonly string[]>>> = {};
    for (const scope of AXE_SCOPES) {
      const debt = axeDebt(seriousFindings(await auditAxe({ ...scope, markup })));
      if (Object.keys(debt).length > 0) measured[`${scope.vertical} ${scope.theme}`] = debt;
    }
    expect(measured).toEqual({});
  }, 180_000);
});
