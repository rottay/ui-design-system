/**
 * The table-toolbar family in a real browser.
 *
 * This family owns NO chrome deriver: every channel its skin reads already has
 * a producer -- the shared `--ds-toolbar-*` region vocabulary, the `--ds-input-*`
 * relays it hands the composed Input, and the cascade roots -- so a deriver
 * here would be a second owner of another family's channels. The decisions
 * below are therefore probed against the family's OWN computed paint through
 * those channels, each with a negative control, and the relay is proven to
 * REACH the primitive rather than to exist in the file.
 */
import React from 'react';
import { Writable } from 'node:stream';
import { prerenderToNodeStream } from 'react-dom/static';
import { describe, expect, it } from 'vitest';

import { DesignSystemProvider } from '@/infrastructure/runtime/bootstrap';
import { firstPartyEngineVisual } from '@/infrastructure/compilers/runtime/theme';
import type { TenantConfig } from '@/foundation/contracts';
import { TableToolbar } from '../index';
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

const TENANT: TenantConfig = {
  slug: 'table-toolbar-causality',
  name: 'Table toolbar causality',
  theme: 'base',
  locale: 'en',
  fallbackLocale: 'en',
  plan: 'enterprise',
  features: [],
  branding: { companyName: 'Table toolbar causality' },
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
      <TableToolbar
        search=""
        onSearchChange={noop}
        isFiltered
        onResetFilters={noop}
        filters={<button type="button">Status</button>}
        actions={<button type="button">Export</button>}
        primaryAction={{ label: 'New record', onClick: noop }}
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

const toolbar = await serverMarkup();
const markup = `<div id="toolbar" style="inline-size:80rem">${toolbar}</div>`;

const ROOT = "#toolbar [data-part='root']";
const LEFT = "#toolbar [data-part='left']";
const FIELD = "#toolbar [data-part='search-field']";
/** The Input's SHELL: the caller's `search-input` part replaces the
    primitive's own root part (P-79), and the shell is what the primitive
    paints. */
const SHELL = "#toolbar [data-part='search-input']";
const ICON = "#toolbar [data-part='search-icon']";
const DIVIDER = "#toolbar [data-part='divider']";
const PRIMARY = "#toolbar [data-part='primary-action']";

describeCausality({
  family: 'table-toolbar',
  markup,
  targets: [
    // The search relay reaches the composed Input's own paint: the toolbar
    // states the channel, the primitive resolves it in its own layer.
    { id: 'fieldGround', selector: SHELL, property: 'background-color' },
    { id: 'fieldType', selector: SHELL, property: 'font-size' },
    { id: 'glyphInk', selector: ICON, property: 'color' },
    { id: 'primaryCorner', selector: PRIMARY, property: 'border-top-left-radius' },
    { id: 'rootPad', selector: ROOT, property: 'padding-top' },
    { id: 'seam', selector: LEFT, property: 'padding-right' },
    // The divider's measure is a stated number, so it is the control every
    // arm holds.
    { id: 'dividerWidth', selector: DIVIDER, property: 'inline-size' },
  ],
  decisions: {
    // The toolbar speaks the SUPPORTING step rather than the Input's own
    // default, so the type ramp reaches the control through the relay.
    'typography.scale': {
      value: 1.08,
      moves: ['fieldType'],
      holds: 'dividerWidth',
      in: VERTICALS,
    },
    // The band's own padding and its section seam ride the density plane.
    'density.mode': {
      value: 'spacious',
      moves: ['rootPad', 'seam'],
      holds: 'dividerWidth',
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
 * The one finding is the composed ghost Button's own `label` part under
 * bithire dark -- the reset affordance. The toolbar relays no colour into it
 * and paints none of its chrome; the primitive owns its ink.
 */
const AXE_DEBT: Record<string, Readonly<Record<string, readonly string[]>>> = {
  'bithire dark': {
    'color-contrast': [
      '.ds-button--ghost > span[data-part="content"][data-state="visible"] > span[data-part="label"]',
    ],
  },
};

describe('table-toolbar causality surface', () => {
  it('serves the anatomy every probe reads', () => {
    for (const part of [
      'root',
      'row',
      'left',
      'spacer',
      'controls',
      'filters',
      'clear-filters',
      'actions',
      'divider',
      'search-field',
      'search-input',
      'search-icon',
      'primary-action',
    ]) {
      expect(toolbar, part).toContain(`data-part="${part}"`);
    }
  });

  /**
   * The family paints NOTHING on the primitive it composes -- this file is
   * `rottay-components` and the Input skin is `rottay-engines`, a later layer.
   * The relay is the whole mechanism, so it is measured where it lands: move
   * the toolbar's control channel and the primitive's own ground moves with
   * it, while the untouched sibling holds.
   */
  it('relays the field ground into the primitive instead of painting it', async () => {
    const readings = await measureArms({
      vertical: 'rottay',
      markup: `${markup}<style>#toolbar [data-part='search-field']{--ds-toolbar-control-bg:#123456;}</style>`,
      arms: { base: {} },
      targets: [
        { id: 'relayed', selector: SHELL, property: 'background-color' },
        { id: 'channel', selector: FIELD, property: '--ds-input-bg' },
        { id: 'glyphSize', selector: ICON, property: 'inline-size' },
      ],
    });
    const r = readings.base!;
    // The relay reaches the primitive's own paint, not just the field node.
    expect(r.relayed).toBe('rgb(18, 52, 86)');
    expect(r.channel!.trim()).toBe('#123456');
    expect(r.glyphSize).not.toBe('0px');
  }, 120_000);

  /**
   * The executable inventory of the decisions that reach this band only
   * through the primitives it composes. The toolbar's OWN paint is a neutral
   * region and a hairline: its ground, its control ground, its glyph ink and
   * its divider rest on the vertical's fixed neutral tokens, which neither
   * palette arm moves, and it owns no radius of its own. What carries the
   * brand across the band is the composed Button, whose corner DOES follow the
   * radius ramp -- so the inert readings are recorded here rather than
   * borrowed into a causal arm that would claim more than the cascade does.
   */
  it('takes colour and radius through the primitives it composes, not its own paint', async () => {
    const readings = await measureArms({
      vertical: 'rottay',
      markup,
      arms: {
        base: {},
        seeded: { 'palette.seeds': { primary: '#2F6B9A' } },
        warmed: { 'palette.neutral-temperature': 'warm' },
        rounded: { 'shape.radius-scale': 1.2 },
      },
      targets: [
        { id: 'ground', selector: SHELL, property: 'background-color' },
        { id: 'glyph', selector: ICON, property: 'color' },
        { id: 'divider', selector: DIVIDER, property: 'background-image' },
        { id: 'channel', selector: FIELD, property: '--ds-input-bg' },
        { id: 'primaryCorner', selector: PRIMARY, property: 'border-top-left-radius' },
      ],
    });
    const base = readings.base!;
    // The relay reaches the primitive: the channel resolves to a value.
    expect(base.channel!.trim()).not.toBe('');
    for (const arm of ['seeded', 'warmed'] as const) {
      expect(readings[arm]!.ground, arm).toBe(base.ground);
      expect(readings[arm]!.glyph, arm).toBe(base.glyph);
      expect(readings[arm]!.divider, arm).toBe(base.divider);
    }
    // The composed action still follows the radius ramp.
    expect(readings.rounded!.primaryCorner).not.toBe(base.primaryCorner);
  }, 120_000);

  /**
   * The section seam is a LOGICAL padding, so it changes sides under
   * `dir=rtl`. This is the reading `padding-inline-end` exists for, measured
   * rather than asserted from the CSS text.
   */
  it('moves the section seam to the other edge under dir=rtl', async () => {
    const readings = await measureArms({
      vertical: 'rottay',
      markup,
      arms: { base: {} },
      targets: [
        { id: 'rightLtr', selector: LEFT, property: 'padding-right' },
        { id: 'leftLtr', selector: LEFT, property: 'padding-left' },
        { id: 'rightRtl', selector: LEFT, property: 'padding-right', dir: 'rtl' },
        { id: 'leftRtl', selector: LEFT, property: 'padding-left', dir: 'rtl' },
      ],
    });
    const r = readings.base!;
    expect(r.rightLtr).not.toBe('0px');
    expect(r.leftLtr).toBe('0px');
    expect(r.leftRtl).not.toBe('0px');
    expect(r.rightRtl).toBe('0px');
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
