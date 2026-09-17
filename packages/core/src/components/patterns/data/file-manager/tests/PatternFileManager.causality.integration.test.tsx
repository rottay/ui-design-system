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
 * Every finding is contrast, in two groups:
 *  - composed primitives the family does not paint: the ghost/link Buttons'
 *    own `label` part (rename/delete actions and the folder link) and the
 *    composed Breadcrumb's current crumb. Each primitive owns its own ink,
 *    and the family relays no colour into either;
 *  - the family's OWN quiet quantitative cells and column headers, which read
 *    `--ds-color-text-secondary` on the card ground by design (the size/date
 *    columns are deliberately subordinate to the name). That is this cut's
 *    named residue: a tone decision for the owner, not a skin literal a cut
 *    may invent.
 */
const AXE_DEBT: Record<string, Readonly<Record<string, readonly string[]>>> = {
  'bithire dark': {
    'color-contrast': [
      '#_R_2_-a1-delete > span[data-state="visible"][data-part="content"] > span[data-part="label"]',
      '#_R_2_-a2-delete > span[data-state="visible"][data-part="content"] > span[data-part="label"]',
      '#_R_2_-f1-delete > span[data-state="visible"][data-part="content"] > span[data-part="label"]',
      '#_R_2_-f1-name > span[data-state="visible"][data-part="content"] > span[data-part="label"]',
    ],
  },
  'bithire light': {
    'color-contrast': [
      'th:nth-child(2)',
      'th:nth-child(4)',
      'th:nth-child(5)',
      'th[data-part="column-size"]',
      'tr[data-part="row"]:nth-child(1) > td[data-part="date-cell"]',
      'tr[data-part="row"]:nth-child(3) > td[data-part="date-cell"]',
      'tr[data-part="row"]:nth-child(3) > td[data-part="size-cell"]',
      'tr[data-selected="true"][data-part="row"] > td[data-part="date-cell"]',
      'tr[data-selected="true"][data-part="row"] > td[data-part="size-cell"]',
    ],
  },
  'evnto light': {
    'color-contrast': [
      '#_R_2_-a1-delete > span[data-state="visible"][data-part="content"] > span[data-part="label"]',
      '#_R_2_-a2-delete > span[data-state="visible"][data-part="content"] > span[data-part="label"]',
      '#_R_2_-f1-delete > span[data-state="visible"][data-part="content"] > span[data-part="label"]',
      'th:nth-child(2)',
      'th:nth-child(4)',
      'th:nth-child(5)',
      'th[data-part="column-size"]',
      'tr[data-part="row"]:nth-child(1) > td[data-part="date-cell"]',
      'tr[data-part="row"]:nth-child(3) > td[data-part="date-cell"]',
      'tr[data-part="row"]:nth-child(3) > td[data-part="size-cell"]',
      'tr[data-selected="true"][data-part="row"] > td[data-part="date-cell"]',
      'tr[data-selected="true"][data-part="row"] > td[data-part="size-cell"]',
    ],
  },
  'rottay dark': {
    'color-contrast': [
      '#_R_2_-f1-name > span[data-state="visible"][data-part="content"] > span[data-part="label"]',
      '#fm-grid > .ds-pattern-file-manager.ds-engine-modern[data-loading="false"] > div[data-part="body"] > div[data-part="toolbar"] > div[data-part="breadcrumb"] > nav > ol > li[data-part="item"]:nth-child(3) > span[data-current="true"][aria-current="page"][data-part="crumb"] > span[title="Workspace"][data-part="label"]',
      '#fm-list > .ds-pattern-file-manager.ds-engine-modern[data-loading="false"] > div[data-part="body"] > div[data-part="toolbar"] > div[data-part="breadcrumb"] > nav > ol > li[data-part="item"]:nth-child(3) > span[data-current="true"][aria-current="page"][data-part="crumb"] > span[title="Workspace"][data-part="label"]',
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
