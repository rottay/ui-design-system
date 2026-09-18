/**
 * The kanban-board family in a real browser: every keypath the family deriver
 * declares in `consumes` is exercised against the family's OWN computed paint
 * with a negative control, the reading direction is measured on the affordance
 * that actually mirrors, and axe holds beyond the pinned debt.
 */
import React from 'react';
import { Writable } from 'node:stream';
import { prerenderToNodeStream } from 'react-dom/static';
import { describe, expect, it } from 'vitest';

import { DesignSystemProvider } from '@/infrastructure/runtime/bootstrap';
import { firstPartyEngineVisual } from '@/infrastructure/compilers/runtime/theme';
import type { TenantConfig } from '@/foundation/contracts';
import ModernKanbanBoard from '../engines/modern';
import {
  AXE_SCOPES,
  FIRST_PARTY_VERTICALS as VERTICALS,
  auditAxe,
  axeDebt,
  describeCausality,
  measureArms,
  seriousFindings,
} from '@tests/support/family-causality';

interface Story {
  id: string;
  title: string;
}

const noop = () => {};

const COLUMNS = [
  {
    id: 'backlog',
    title: 'Backlog',
    color: 'var(--ds-color-info)',
    items: [
      { id: 'story-1', title: 'Draft the offer letter' },
      { id: 'story-2', title: 'Schedule the panel' },
    ],
  },
  {
    id: 'doing',
    title: 'In progress',
    limit: 1,
    items: [{ id: 'story-3', title: 'Review the take-home' }],
  },
  { id: 'done', title: 'Done', items: [] as Story[] },
];

const TENANT: TenantConfig = {
  slug: 'kanban-board-causality',
  name: 'Kanban board causality',
  theme: 'base',
  locale: 'en',
  fallbackLocale: 'en',
  plan: 'enterprise',
  features: [],
  branding: { companyName: 'Kanban board causality' },
};

/**
 * The family's own server markup, kept whole as the list-toolbar precedent keeps
 * it. `columnGap` is optional so the suite can measure the board that states no
 * layout number (the theme's board) against the board that states one.
 */
async function serverMarkup(columnGap?: number | string): Promise<string> {
  const { prelude } = await prerenderToNodeStream(
    <DesignSystemProvider
      tenantConfig={TENANT}
      forceEngine="modern"
      engineVisual={firstPartyEngineVisual('rottay', 'modern')}
      skipCssLoading
      ssrViewport="desktop"
    >
      <ModernKanbanBoard<Story>
        columns={COLUMNS}
        itemKey={(story) => story.id}
        renderCard={(story) => <span>{story.title}</span>}
        onItemMove={noop}
        onItemClick={noop}
        onAddItem={noop}
        toolbar={<span>Board toolbar</span>}
        {...(columnGap === undefined ? {} : { columnGap })}
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

const board = await serverMarkup();
const markup = `<div id="board" style="inline-size:64rem">${board}</div>`;
/** The same board, stating its own column gap: the per-instance stamp. */
const stampedMarkup = `<div id="stamped" style="inline-size:64rem">${await serverMarkup(48)}</div>`;

const BOARD = "#board [data-part='board']";
const HEADER = "#board [data-part='column-header']";
const TITLE = "#board [data-part='column-title']";
const BODY = "#board [data-part='column-body']";
const CARD = "#board [data-part='card']";
const CARD_CONTENT = "#board [data-part='card-content']";

describeCausality({
  family: 'kanban-board',
  markup,
  targets: [
    // The drop target and the focus ring are the family's two seeded signals.
    { id: 'dropGround', selector: BODY, property: 'background-color', attributes: { 'data-dropping': 'true' } },
    { id: 'dropRing', selector: BODY, property: 'box-shadow', attributes: { 'data-dropping': 'true' } },
    { id: 'focusInk', selector: CARD, property: 'outline-color', attributes: { 'data-state': 'focus-visible' } },
    { id: 'focusRing', selector: CARD, property: 'outline-width', attributes: { 'data-state': 'focus-visible' } },
    { id: 'titleFont', selector: TITLE, property: 'font-size' },
    { id: 'cardCorner', selector: CARD, property: 'border-top-left-radius' },
    { id: 'headerCorner', selector: HEADER, property: 'border-top-left-radius' },
    { id: 'cardShadow', selector: CARD, property: 'box-shadow' },
    { id: 'headerPad', selector: HEADER, property: 'padding-top' },
    { id: 'cardPad', selector: CARD_CONTENT, property: 'padding-top' },
    // The board's own column gap, on the channel the deriver rests at
    // `var(--ds-spacing-4)`: a board that states no `columnGap` leaves it to
    // the theme, so density reaches it.
    { id: 'boardGap', selector: BOARD, property: 'column-gap' },
  ],
  decisions: {
    // `consumes: palette.*` -- the drop ground, the drop ring and the card's
    // focus ink all resolve from the seeded ramp.
    'palette.seeds': {
      value: { primary: '#2F6B9A' },
      moves: ['dropGround', 'dropRing', 'focusInk'],
      holds: 'cardCorner',
      in: VERTICALS,
    },
    // `consumes: typography.roles` -- the column title is the family's own text.
    'typography.scale': {
      value: 1.08,
      moves: ['titleFont'],
      holds: 'cardCorner',
      in: VERTICALS,
    },
    // `consumes: surfaces.radiusScale` -- the card and the column header close
    // on two different rungs of the same ramp.
    'shape.radius-scale': {
      value: 1.2,
      moves: ['cardCorner', 'headerCorner'],
      holds: 'focusInk',
      in: VERTICALS,
    },
    // `consumes: surfaces.elevation` -- the card at rest is the family's only
    // elevated part, and it reads the ramp directly.
    'surfaces.elevation-posture': {
      value: 'elevated',
      moves: ['cardShadow'],
      holds: 'cardCorner',
      in: VERTICALS,
    },
    // `consumes: states.focus` -- the card is a real tab stop, so the focus
    // signature is the width of its own ring.
    'states.focus-style': {
      value: 'glow',
      moves: ['focusRing'],
      holds: 'cardCorner',
      in: VERTICALS,
    },
    // `consumes: density` -- the column header, the card body rhythm and the
    // board's own column gap ride the density-scaled spacing ramp.
    'density.mode': {
      value: 'spacious',
      moves: ['headerPad', 'cardPad', 'boardGap'],
      holds: 'cardCorner',
      in: VERTICALS,
    },
  },
});

/**
 * Measured debt, pinned by node IDENTITY rather than by count: a repaired node,
 * a new node and a same-count swap all go red and must be re-adjudicated.
 *
 * Every finding is contrast, and every offending node is content the family
 * does NOT own: the composed Empty's description in an empty column (`p`) and
 * the composed Badge's danger-tone WIP count at the limit (`span[title='1 /
 * 1']`). The board states no ground of its own beneath a caller slot, and the
 * Empty and Badge primitives own their own ink. Registered, never excluded; a
 * scope with no entry is a scope that must stay clean.
 *
 * `bithire dark` held a fourth node, the caller's toolbar slot, whose ground
 * the mode-canvas derivation repaired; it leaves the map by identity.
 */
const AXE_DEBT: Record<string, Readonly<Record<string, readonly string[]>>> = {
  'bithire light': {
    'color-contrast': ['p'],
  },
  'evnto light': {
    'color-contrast': ['p'],
  },
  'rottay dark': {
    'color-contrast': ['span[title="1 / 1"]'],
  },
};

describe('kanban-board causality surface', () => {
  it('serves the anatomy every probe reads', () => {
    expect(board).toContain('data-part="root"');
    expect(board).toContain('data-part="board"');
    expect(board).toContain('data-part="column-header"');
    expect(board).toContain('data-part="column-title"');
    expect(board).toContain('data-part="column-body"');
    expect(board).toContain('data-part="card"');
    expect(board).toContain('data-part="card-content"');
    // The card is a stateful part decided by the kernel: at rest it carries NO
    // `data-state`, so `[data-state]` never matches a resting card, and the
    // skin's paired arms fall through to the platform pseudo-class.
    expect(board).toContain('data-part="card"');
    expect(board).not.toContain('data-part="card" data-state');
    // A board that states no layout number stamps NO layout channel: an
    // unconditional stamp would shadow the derived resting floor on every
    // render and take these two channels away from the theme.
    expect(board).not.toContain('--ds-kanban-board-column-gap');
    expect(board).not.toContain('--ds-kanban-board-column-min-width');
    expect(stampedMarkup).toContain('--ds-kanban-board-column-gap:48px');
  });

  /**
   * The per-instance stamp outranks the theme, exactly as an inline
   * declaration outranks the theme root -- and only the board that states a
   * number is stamped, so the other one still answers to density.
   */
  it('lets a caller-stated columnGap outrank the theme', async () => {
    const readings = await measureArms({
      vertical: 'rottay',
      markup: `${markup}${stampedMarkup}`,
      arms: { base: {}, spacious: { 'density.mode': 'spacious' } },
      targets: [
        { id: 'themedGap', selector: BOARD, property: 'column-gap' },
        { id: 'stampedGap', selector: "#stamped [data-part='board']", property: 'column-gap' },
      ],
    });
    const base = readings.base!;
    const spacious = readings.spacious!;
    // The theme's board rests on the density-scaled spacing ramp and moves
    // with it. Under this vertical's own density that resting gap measures
    // 15px rather than the 16px the engine used to stamp inline on every
    // render, which is the point of the channel: the rhythm is the tenant's.
    expect(base.themedGap).toBe('15px');
    expect(spacious.themedGap).not.toBe(base.themedGap);
    // The caller's number wins in both arms.
    expect(base.stampedGap).toBe('48px');
    expect(spacious.stampedGap).toBe('48px');
  }, 120_000);

  /**
   * The scroll affordance is a PHYSICAL gradient, so the family owes a mirror
   * rather than a logical property. This is the reading the `:dir(rtl)` arms of
   * the skin exist for, measured rather than asserted from the CSS text.
   */
  it('mirrors the clipped-edge fade under dir=rtl', async () => {
    const readings = await measureArms({
      vertical: 'rottay',
      markup,
      arms: { base: {} },
      targets: [
        {
          id: 'startFadeLtr',
          selector: BOARD,
          property: 'mask-image',
          attributes: { 'data-scrollable-start': 'true' },
        },
        {
          id: 'startFadeRtl',
          selector: BOARD,
          property: 'mask-image',
          attributes: { 'data-scrollable-start': 'true' },
          dir: 'rtl',
        },
        { id: 'boardLeft', selector: BOARD, property: '@rect.left' },
        { id: 'titleLeftLtr', selector: TITLE, property: '@rect.left' },
        { id: 'titleLeftRtl', selector: TITLE, property: '@rect.left', dir: 'rtl' },
      ],
    });
    const r = readings.base!;
    // The fade exists in both directions and runs the other way in each.
    expect(r.startFadeLtr).toContain('gradient');
    expect(r.startFadeRtl).toContain('gradient');
    expect(r.startFadeRtl).not.toBe(r.startFadeLtr);
    // The first column's title follows the reading order to the other edge.
    expect(Number(r.titleLeftRtl)).toBeGreaterThan(Number(r.titleLeftLtr));
  }, 120_000);

  /**
   * The column state accent is consumer config DATA riding the family channel,
   * and the family's own resting floor is `transparent` -- a column that states
   * no colour states no strip, rather than inheriting a neighbour's.
   */
  it('carries the column accent on the family channel, transparent at rest', async () => {
    const readings = await measureArms({
      vertical: 'rottay',
      markup,
      arms: { base: {} },
      targets: [
        { id: 'accentChannel', selector: "#board [data-part='root']", property: '--ds-kanban-board-column-accent' },
        { id: 'accentedStrip', selector: HEADER, property: 'border-block-start-color' },
        {
          id: 'restingStrip',
          selector: "#board [data-part='column']:last-child [data-part='column-header']",
          property: 'border-block-start-color',
        },
      ],
    });
    const r = readings.base!;
    // The channel has a producer: the read resolves to a value, not to nothing.
    expect(r.accentChannel.trim()).toBe('transparent');
    expect(r.restingStrip).toBe('rgba(0, 0, 0, 0)');
    expect(r.accentedStrip).not.toBe(r.restingStrip);
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
