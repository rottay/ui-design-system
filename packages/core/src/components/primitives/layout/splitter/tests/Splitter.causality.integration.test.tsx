/**
 * The splitter family in a real browser: the rail sits on the tenant's material
 * surface, its size answers density, its tints answer the palette, its focus
 * ring answers the focus decision, its transition answers the motion dial, the
 * measured share reaches the panel through one channel, and a locked boundary
 * paints its own quieter posture.
 */
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import ModernSplitter, { Panel } from '../engines/modern';
import {
  AXE_SCOPES,
  FIRST_PARTY_VERTICALS as VERTICALS,
  auditAxe,
  axeDebt,
  describeCausality,
  measureArms,
  seriousFindings,
} from '@tests/support/family-causality';

/**
 * REGISTERED, not worked around: the panels are passed as direct children
 * rather than inside a fragment because `Children.toArray` counts a fragment as
 * ONE child, so `<Splitter>{cond && <><Panel/><Panel/></>}</Splitter>` renders
 * no gutter at all and every panel falls back to an equal share. Space and Stack
 * flatten fragments for exactly this reason; Splitter does not, and changing how
 * it reads its children reaches the sizes and constraint arrays, so it is a
 * follow-up rather than a line in this cut.
 */
function splitter(
  props: React.ComponentProps<typeof ModernSplitter>,
  layout: 'horizontal' | 'vertical' = 'horizontal',
  lockLeading = false,
): string {
  return renderToStaticMarkup(
    <div style={{ inlineSize: '40rem', blockSize: '20rem' }}>
      <ModernSplitter {...props} layout={layout}>
        <Panel defaultSize={60} resizable={!lockLeading}>
          Leading
        </Panel>
        <Panel defaultSize={40}>Trailing</Panel>
      </ModernSplitter>
    </div>,
  );
}

const markup = [
  `<div id="row">${splitter({}, 'horizontal')}</div>`,
  `<div id="column">${splitter({}, 'vertical')}</div>`,
  `<div id="locked">${splitter({}, 'horizontal', true)}</div>`,
].join('');

const GUTTER = "#row [data-part='gutter']";
const LEAD = "#row [data-part='panel']";

/**
 * NOT this family's debt: the panels show the caller's own text, and in
 * bithire's dark mode the harness ground `--ds-color-bg-primary` stays #FFFFFF
 * while the ink follows the mode, so any text in that scope fails the contrast
 * floor. A bare `<p>` with no splitter fails identically (measured control).
 */
const AXE_DEBT: Record<string, Readonly<Record<string, readonly string[]>>> = {
  'bithire dark': {
    'color-contrast': [
      '#locked > div > .ds-splitter.ds-splitter--modern[data-part="root"] > div[data-part="panel"]:nth-child(1)',
      '#locked > div > .ds-splitter.ds-splitter--modern[data-part="root"] > div[data-part="panel"]:nth-child(3)',
      '#row > div > .ds-splitter.ds-splitter--modern[data-part="root"] > div[data-part="panel"]:nth-child(1)',
      '#row > div > .ds-splitter.ds-splitter--modern[data-part="root"] > div[data-part="panel"]:nth-child(3)',
      '.ds-splitter.ds-splitter--modern[data-orientation="vertical"] > div[data-part="panel"]:nth-child(1)',
      '.ds-splitter.ds-splitter--modern[data-orientation="vertical"] > div[data-part="panel"]:nth-child(3)',
    ],
  },
};

describeCausality({
  family: 'splitter',
  markup,
  // The hover tint and the ring are read as CHANNELS on the gutter, not as a
  // painted `background`/`outline`: both rules are gated on a state this probe
  // cannot enter (`:hover`, `:focus-visible`) because the gutter's interaction
  // state is the platform's, not the kernel's -- the same ResizeHandle
  // limitation the skin header states. The resting rail is not a target either:
  // it is the tenant's own material panel surface, which no palette decision
  // moves by design.
  targets: [
    { id: 'railHover', selector: GUTTER, property: '--ds-splitter-gutter-bg-hover' },
    { id: 'railSize', selector: GUTTER, property: 'inline-size' },
    { id: 'ring', selector: GUTTER, property: '--ds-focus-ring-width' },
    { id: 'duration', selector: GUTTER, property: 'transition-duration' },
  ],
  decisions: {
    'palette.seeds': { value: { primary: '#2F6B9A' }, moves: ['railHover'], holds: 'railSize', in: VERTICALS },
    'density.mode': { value: 'spacious', moves: ['railSize'], holds: 'railHover', in: VERTICALS },
    'states.focus-style': { value: 'glow', moves: ['ring'], holds: 'railSize', in: VERTICALS },
    'motion.dial': { value: { durationScale: 1.35 }, moves: ['duration'], holds: 'railSize', in: VERTICALS },
  },
});

describe('splitter share, orientation and locked posture', () => {
  it('spends the measured share on the panel through one channel', async () => {
    const result = await measureArms({
      vertical: 'bithire',
      markup,
      arms: { base: {} },
      targets: [
        { id: 'leadGrow', selector: LEAD, property: 'flex-grow' },
        { id: 'leadBasis', selector: LEAD, property: 'flex-basis' },
        { id: 'leadShare', selector: LEAD, property: '--ds-splitter-panel-grow' },
        { id: 'leadWidth', selector: LEAD, property: '@rect.width' },
        { id: 'gutterWidth', selector: GUTTER, property: '@rect.width' },
      ],
    });
    const r = result.base!;
    expect(r.leadGrow).toBe('60');
    expect(r.leadBasis).toBe('0%');
    expect(r.leadShare!.trim()).toBe('60');
    // 60 of 100 shares of the space the two gutters leave over.
    expect(Number(r.leadWidth)).toBeGreaterThan(Number(r.gutterWidth));
  }, 60_000);

  it('turns the rail and its grip with the orientation', async () => {
    const result = await measureArms({
      vertical: 'rottay',
      markup,
      arms: { base: {} },
      targets: [
        { id: 'rowCursor', selector: GUTTER, property: 'cursor' },
        { id: 'rowWidth', selector: GUTTER, property: '@rect.width' },
        { id: 'columnCursor', selector: "#column [data-part='gutter']", property: 'cursor' },
        { id: 'columnHeight', selector: "#column [data-part='gutter']", property: '@rect.height' },
        { id: 'rowDirection', selector: "#row [data-part='root']", property: 'flex-direction' },
        { id: 'columnDirection', selector: "#column [data-part='root']", property: 'flex-direction' },
      ],
    });
    const r = result.base!;
    expect(r.rowCursor).toBe('col-resize');
    expect(r.columnCursor).toBe('row-resize');
    expect(r.rowDirection).toBe('row');
    expect(r.columnDirection).toBe('column');
    expect(Number(r.rowWidth)).toBe(Number(r.columnHeight));
  }, 60_000);

  it('gives a locked boundary a neutral cursor and its own quieter grip', async () => {
    const result = await measureArms({
      vertical: 'evnto',
      markup,
      arms: { base: {} },
      targets: [
        { id: 'lockedCursor', selector: "#locked [data-part='gutter']", property: 'cursor' },
        { id: 'liveCursor', selector: GUTTER, property: 'cursor' },
        { id: 'lockedGrip', selector: "#locked [data-part='gutter']", property: '--ds-splitter-gutter-grip-color-locked' },
        { id: 'liveGrip', selector: GUTTER, property: '--ds-splitter-gutter-grip-color' },
        { id: 'lockedResizable', selector: "#locked [data-part='gutter']", property: '--ds-splitter-gutter-size' },
      ],
    });
    const r = result.base!;
    expect(r.lockedCursor).toBe('default');
    expect(r.liveCursor).toBe('col-resize');
    // Two channels, so a tenant that moves the live grip keeps the distinction.
    expect(r.lockedGrip!.trim()).not.toBe(r.liveGrip!.trim());
    expect(r.lockedResizable!.trim().length).toBeGreaterThan(0);
  }, 60_000);

  it('carries no serious axe finding beyond the pinned ground debt', async () => {
    const measured: Record<string, Readonly<Record<string, readonly string[]>>> = {};
    for (const scope of AXE_SCOPES) {
      const debt = axeDebt(seriousFindings(await auditAxe({ ...scope, markup })));
      if (Object.keys(debt).length > 0) measured[`${scope.vertical} ${scope.theme}`] = debt;
    }
    expect(measured).toEqual(AXE_DEBT);
  }, 180_000);
});
