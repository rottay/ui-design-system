/**
 * The file-manager family in a real browser: every keypath the family deriver
 * declares in `consumes` is exercised against the family's OWN computed paint
 * with a negative control, the reading direction is measured on the list that
 * actually mirrors, and axe holds beyond the pinned debt.
 */
import React from 'react';
import { Writable } from 'node:stream';
import { prerenderToNodeStream } from 'react-dom/static';
import { describe, expect, it } from 'vitest';

import { DesignSystemProvider } from '@/infrastructure/runtime/bootstrap';
import { firstPartyEngineVisual } from '@/infrastructure/compilers/runtime/theme';
import type { TenantConfig } from '@/foundation/contracts';
import ModernFileManager from '../engines/modern';
import type { FileItem, FolderItem } from '../contracts';
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

const FOLDERS: FolderItem[] = [
  { id: 'f1', name: 'Contracts', type: 'folder', modifiedAt: '2026-03-02T10:00:00.000Z' },
];
const FILES: FileItem[] = [
  {
    id: 'a1',
    name: 'offer-letter.pdf',
    type: 'file',
    mimeType: 'application/pdf',
    size: 512_000,
    modifiedAt: '2026-03-05T10:00:00.000Z',
  },
  {
    id: 'a2',
    name: 'headshot.png',
    type: 'file',
    mimeType: 'image/png',
    size: 128_000,
    modifiedAt: '2026-03-06T10:00:00.000Z',
  },
];

const TENANT: TenantConfig = {
  slug: 'file-manager-causality',
  name: 'File manager causality',
  theme: 'base',
  locale: 'en',
  fallbackLocale: 'en',
  plan: 'enterprise',
  features: [],
  branding: { companyName: 'File manager causality' },
};

/**
 * The family's own server markup, kept whole as the list-toolbar precedent
 * keeps it. Both view modes are mounted, because the list row and the grid
 * card are two different parts of the same anatomy and the probes read both.
 */
async function serverMarkup(viewMode: 'list' | 'grid'): Promise<string> {
  const { prelude } = await prerenderToNodeStream(
    <DesignSystemProvider
      tenantConfig={TENANT}
      forceEngine="modern"
      engineVisual={firstPartyEngineVisual('rottay', 'modern')}
      skipCssLoading
      ssrViewport="desktop"
    >
      <ModernFileManager
        files={FILES}
        folders={FOLDERS}
        currentPath={['Workspace']}
        viewMode={viewMode}
        selectedItems={['a1']}
        onNavigate={noop}
        onSelectionChange={noop}
        onViewModeChange={noop}
        onDelete={noop}
        onRename={noop}
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

const list = await serverMarkup('list');
const grid = await serverMarkup('grid');
const markup =
  `<div id="fm-list" style="inline-size:64rem">${list}</div>` +
  `<div id="fm-grid" style="inline-size:64rem">${grid}</div>`;

const ROOT = "#fm-list [data-part='root']";
const BODY = "#fm-list [data-part='body']";
const CONTENT = "#fm-list [data-part='content']";
const TABLE = "#fm-list [data-part='list-table']";
const ROW_SELECTED = "#fm-list [data-part='row'][data-selected='true']";
const LINK = "#fm-list [data-part='folder-link']";
const CARD = "#fm-grid [data-part='grid-card']";
const CARD_SELECTED = "#fm-grid [data-part='grid-card'][data-selected='true']";
const ITEM_NAME = "#fm-grid [data-part='item-name']";

describeCausality({
  family: 'file-manager',
  markup,
  targets: [
    { id: 'rowSelected', selector: ROW_SELECTED, property: 'background-color' },
    { id: 'cardSelected', selector: CARD_SELECTED, property: 'background-color' },
    { id: 'tableFont', selector: TABLE, property: 'font-size' },
    { id: 'nameFont', selector: ITEM_NAME, property: 'font-size' },
    { id: 'rootCorner', selector: ROOT, property: 'border-top-left-radius' },
    { id: 'contentCorner', selector: CONTENT, property: 'border-top-left-radius' },
    { id: 'rootShadow', selector: ROOT, property: 'box-shadow' },
    {
      id: 'cardFocus',
      selector: CARD,
      property: 'box-shadow',
      attributes: { 'data-state': 'focus-visible' },
    },
    { id: 'bodyPad', selector: BODY, property: 'padding-top' },
  ],
  decisions: {
    // `consumes: palette.*` -- the selected row and the selected grid card are
    // the family's two seeded signals.
    'palette.seeds': {
      value: { primary: '#2F6B9A' },
      moves: ['rowSelected', 'cardSelected'],
      holds: 'rootCorner',
      in: VERTICALS,
    },
    // `consumes: typography.roles` -- the list type step and the card caption
    // are the family's own text.
    'typography.scale': {
      value: 1.08,
      moves: ['tableFont', 'nameFont'],
      holds: 'rootCorner',
      in: VERTICALS,
    },
    // `consumes: surfaces.radiusScale` -- the card surface and the drop zone
    // close on two different rungs of the same ramp.
    'shape.radius-scale': {
      value: 1.2,
      moves: ['rootCorner', 'contentCorner'],
      holds: 'rowSelected',
      in: VERTICALS,
    },
    // `consumes: surfaces.elevation` -- the loaded root is the family's only
    // elevated part, and it reads the ramp directly.
    'surfaces.elevation-posture': {
      value: 'elevated',
      moves: ['rootShadow'],
      holds: 'rootCorner',
      in: VERTICALS,
    },
    // `consumes: states.focus` -- the grid card is a real roving tab stop, so
    // the focus signature is its own ring.
    'states.focus-style': {
      value: 'glow',
      moves: ['cardFocus'],
      holds: 'rootCorner',
      in: VERTICALS,
    },
    // `consumes: density` -- the body rhythm rides the density-scaled spacing
    // ramp.
    'density.mode': {
      value: 'spacious',
      moves: ['bodyPad'],
      holds: 'rootCorner',
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
 * DRAINED, by repair: the family's OWN quiet quantitative cells and column
 * headers -- four `th` and five `td` per light scope, nine rows in
 * `bithire light` and nine of `evnto light`'s twelve. They painted
 * `--ds-color-text-secondary`, a page role graded for a light canvas, and
 * measured 2.6:1 on the card ground (2.33:1 / 2.22:1 under the selected row's
 * tint). The skin now reads `--ds-file-manager-quiet-ink`, the family's own
 * weighted mix of the reading ink INTO the card ground the family itself
 * paints: 7.11:1 at rest and 6.37:1 / 6.08:1 under the selection tint, with
 * the name cell still at 17.9:1 so the quantitative columns stay deliberately
 * subordinate to the name. `bithire light` is therefore gone from this map
 * entirely. The same channel carries the dark scopes by construction -- the
 * cells move from 10.72:1 to 8.1:1 there, a declared paint change: quieter,
 * still far above the floor, and now produced by one mode-following formula
 * instead of a role that only happened to work in dark.
 *
 * DRAINED, by repair: every `*-delete` label, in BOTH scopes that carried
 * them. The ink was never the Button's: this family's own skin stated
 * `color: var(--ds-color-error)` on
 * `[data-part='item-action'][data-action='delete']` -- the FILL role used as
 * an ink -- and the ghost rest wash is `color-mix(currentColor 7%,
 * transparent)`, so that one statement also tinted the ground it was measured
 * against. `data-tone` measured null on every delete button in every scope,
 * which was the proof the Button's governed quiet-destructive recipe never
 * ran. The delete Button now asks for `danger` (keeping `variant='ghost'`, so
 * the quiet recipe runs rather than the solid one) and the statement is gone;
 * both legs of the pair were the family's, so both move together. The ink is
 * now `--ds-button-error-border`, and it only became usable once the error
 * ramp followed the mode: the regrade inverted the DS default's dark error
 * ramp, moved `--ds-color-error` to step 600 and took the quiet-danger ink to
 * step 700, which is what makes one declaration correct in six scopes. The
 * three labels measure 6.40/6.82 in `bithire dark` (was 2.59/2.74) and
 * 4.93/5.75 in `evnto light` (was 3.73/4.35), and the ungated scopes ride the
 * same channel: 4.93/5.75 rottay light, 7.37/7.31 rottay and evnto dark,
 * 9.58/10.69 bithire light. `evnto light` is therefore gone from this map
 * entirely, and a relapse in either scope reddens here. The neighbouring
 * `rename`, `folder-link`, crumb, name-cell and size-cell readings are
 * byte-identical in all six scopes -- the controls that prove the statement
 * carried nothing else.
 *
 * DRAINED, at the Card base: the `data-current` crumb in `rottay dark`
 * (1.07:1) was the Card component base, not the Breadcrumb.
 * `presentation/components/card/index.css` stated
 * `--ds-card-bg: var(--ds-color-white)` mode-blind in the `rottay-components`
 * layer, which outranks the theme's own `--ds-card-bg:
 * var(--ds-color-bg-elevated)` by layer ORDER -- byte for byte the defect the
 * input ground was repaired for, with bithire escaping again because its
 * unlayered artifact re-aliases the name. The crumb was only the tip axe could
 * see: the whole trail painted a white gradient in rottay and evnto dark, and
 * the Modern Card's own elevated/bordered grounds resolved white there too.
 * Both candidate paired inks were drilled and refuted (primary 72% into the
 * ground takes bithire dark to 2.00, text-primary 72% leaves rottay dark at
 * 1.05 and moves every light scope off 15.18); the ground repair landed at the
 * Card base and measures 14.63:1 in both broken scopes, byte-identical in the
 * other four. `rottay dark` is therefore gone from this map and must now
 * measure clean; a relapse reddens here.
 *
 * STANDING, and the only node left: `f1-name` belongs to neither arm. The
 * folder link reads `--ds-color-link`, and bithire's own artifact states a
 * blue (`#3f6ffd`) that measures 3.72:1 on its dark card. Registered on the
 * link channel; the danger repair leaves it byte-identical.
 *
 * DROPPED EARLIER BY IDENTITY: `rottay dark`'s folder-link label. That link
 * resolves `--ds-color-link`, which took the raw primary seed in every mode --
 * the DS's own near-black on a dark canvas. The sheet's dark scope now states
 * the ink that canvas can carry, so the node is measured clean; a relapse
 * reddens this pin.
 */
const AXE_DEBT: Record<string, Readonly<Record<string, readonly string[]>>> = {
  'bithire dark': {
    'color-contrast': [
      '#_R_2_-f1-name > span[data-state="visible"][data-part="content"] > span[data-part="label"]',
    ],
  },
};

describe('file-manager causality surface', () => {
  it('serves the anatomy every probe reads', () => {
    expect(list).toContain('data-part="root"');
    expect(list).toContain('data-part="body"');
    expect(list).toContain('data-part="content"');
    expect(list).toContain('data-part="list-table"');
    expect(list).toContain('data-part="row"');
    expect(list).toContain('data-part="folder-link"');
    expect(grid).toContain('data-part="grid-card"');
    expect(grid).toContain('data-part="item-name"');
    // The row and the card are stateful parts decided by the kernel: at rest
    // they carry NO `data-state`, so `[data-state]` never matches a resting
    // row and the skin's paired arms fall through to the platform pseudo-class.
    expect(list).not.toContain('data-part="row" data-state');
    expect(grid).not.toContain('data-part="grid-card" data-state');
  });

  /**
   * The folder link's resting and hover ink are the family's own channels, and
   * the deriver rests them on the link vocabulary rather than on a private
   * blue. The hover arm is paired with the kernel token, so stamping the state
   * moves the ink without a synthetic pointer.
   */
  it('moves the folder link from its resting channel to its hover channel', async () => {
    const readings = await measureArms({
      vertical: 'rottay',
      markup,
      arms: { base: {} },
      targets: [
        { id: 'resting', selector: LINK, property: 'color' },
        {
          id: 'hovered',
          selector: LINK,
          property: 'color',
          attributes: { 'data-state': 'hovered' },
        },
        {
          id: 'restingChannel',
          selector: ROOT,
          property: '--ds-file-manager-link-color',
        },
        {
          id: 'hoverChannel',
          selector: ROOT,
          property: '--ds-file-manager-link-hover-color',
        },
      ],
    });
    const r = readings.base!;
    // Both channels have a producer: the reads resolve to values, not nothing.
    expect(r.restingChannel!.trim()).not.toBe('');
    expect(r.hoverChannel!.trim()).not.toBe('');
    expect(r.hovered).not.toBe(r.resting);
  }, 120_000);

  /**
   * The list is a reading order, so its first column travels to the other edge
   * under `dir=rtl`. This is the reading the logical paddings and the
   * `text-align: start | end` cells exist for, measured rather than asserted
   * from the CSS text.
   */
  it('reads the list from the other edge under dir=rtl', async () => {
    const readings = await measureArms({
      vertical: 'rottay',
      markup,
      arms: { base: {} },
      targets: [
        { id: 'checkboxLeftLtr', selector: "#fm-list [data-part='checkbox']", property: '@rect.left' },
        {
          id: 'checkboxLeftRtl',
          selector: "#fm-list [data-part='checkbox']",
          property: '@rect.left',
          dir: 'rtl',
        },
      ],
    });
    const r = readings.base!;
    expect(Number(r.checkboxLeftRtl)).toBeGreaterThan(Number(r.checkboxLeftLtr));
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
