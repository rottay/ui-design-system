/**
 * The column-menu family in a real browser (WO-FAM-08 B9).
 *
 * Every keypath `derivation/chrome/column-menu` declares in `consumes` is
 * exercised against the family's OWN computed paint with a negative control,
 * and each of the forty channels the deriver now writes is read back where it
 * LANDS rather than where it is declared: a `var()` that used to resolve to its
 * literal fallback and a `var()` that resolves to a produced value look the
 * same in the file and are not the same in the cascade.
 *
 * MARKUP: the panel is Popover content, so it exists only while the menu is
 * open. The suite therefore opens the real menu in the DOM runner and takes the
 * governed surface's own outerHTML -- the family's markup, not a hand-written
 * stand-in for it.
 */
import React from 'react';
import { describe, expect, it } from 'vitest';
import { fireEvent, waitFor } from '@testing-library/react';

import { ColumnMenu } from '../index';
import { renderWithEngine } from '@tests/support/engine';
import { waitForPortalContent } from '@tests/support/skin-reachability';
import {
  AXE_SCOPES,
  FIRST_PARTY_VERTICALS as VERTICALS,
  auditAxe,
  axeDebt,
  describeCausality,
  measureArms,
  seriousFindings,
} from '@tests/support/family-causality';

const SURFACE = ".ds-structure.ds-column-menu-panel[data-part='surface']";

/**
 * The full-surface fixture: every optional prop is supplied, because `actions`,
 * `groups`, `pinnedColumns` and `columnWidths` each gate a whole region of the
 * panel and an omitted one takes its rules out of the measurement.
 */
async function openPanelMarkup(): Promise<string> {
  const { container } = renderWithEngine(
    <ColumnMenu
      columns={[
        { key: 'name', title: 'Name', group: 'core' },
        { key: 'email', title: 'Email', group: 'core' },
        { key: 'notes', title: 'Notes' },
      ]}
      visibleColumns={['name', 'notes']}
      onColumnsChange={() => undefined}
      onReset={() => undefined}
      actions={[
        { key: 'edit', title: 'Edit' },
        { key: 'delete', title: 'Delete', locked: true },
      ]}
      visibleActions={['edit']}
      onVisibleActionsChange={() => undefined}
      pinnedColumns={{ left: ['name'], right: [] }}
      onPinChange={() => undefined}
      columnWidths={{ name: 200 }}
      onColumnResize={() => undefined}
      groups={[{ key: 'core', label: 'Core', columns: ['name', 'email'] }]}
    />,
    'modern',
  );
  const control = await waitFor(() => {
    const node = container.querySelector('[data-part="control"]') as HTMLElement;
    expect(node).not.toBeNull();
    return node;
  });
  fireEvent.click(control);
  const surface = await waitForPortalContent(waitFor, SURFACE, '[data-part="row"]', 1);
  return surface.outerHTML;
}

const panel = await openPanelMarkup();
const markup = `<div id="menu" style="inline-size:36rem">${panel}</div>`;

const SCOPE = `#menu ${SURFACE}`;
const HEADER = `${SCOPE} [data-part='header']`;
const TITLE = `${SCOPE} [data-part='header-title']`;
const BODY = `${SCOPE} [data-part='scroll-region']`;
const ROW = `${SCOPE} [data-part='row']`;
/** A row NOT in the stamped visible/draft state: the one the hover arm paints. */
const RESTING_ROW = `${SCOPE} [data-part='row'][data-visible='false']`;
const COUNT = `${SCOPE} [data-part='count-pill']`;
const PANEL = `${SCOPE} [data-part='panel']`;

describeCausality({
  family: 'column-menu',
  markup,
  targets: [
    // `surfaces.radiusScale`: the panel and the row close on two rungs of one
    // ramp, both through the family's own channels.
    { id: 'panelCorner', selector: SCOPE, property: 'border-top-left-radius' },
    { id: 'rowCorner', selector: ROW, property: 'border-top-left-radius' },
    // `palette.*`: the header wash is the family's only seeded ground at rest.
    { id: 'headerWash', selector: HEADER, property: 'background-color' },
    // `typography.roles`: the panel title is the family's own type step.
    { id: 'titleSize', selector: TITLE, property: 'font-size' },
    // `motion.*`: the row's state changes read the dial-bent feedback role.
    { id: 'rowMotion', selector: ROW, property: 'transition-duration' },
    // The control: the scroll region's rhythm is a px constant behind a family
    // channel, so no decision in the catalog may move it.
    { id: 'bodyPad', selector: BODY, property: 'padding-top' },
  ],
  decisions: {
    'palette.seeds': {
      value: { primary: '#2F6B9A' },
      moves: ['headerWash'],
      holds: 'bodyPad',
      in: VERTICALS,
    },
    'shape.radius-scale': {
      value: 1.2,
      moves: ['panelCorner', 'rowCorner'],
      holds: 'bodyPad',
      in: VERTICALS,
    },
    'typography.scale': {
      value: 1.08,
      moves: ['titleSize'],
      holds: 'bodyPad',
      in: VERTICALS,
    },
    'motion.dial': {
      value: { durationScale: 1.3 },
      moves: ['rowMotion'],
      holds: 'bodyPad',
      in: VERTICALS,
    },
  },
});

/**
 * Measured debt, pinned by node IDENTITY rather than by count: a repaired node,
 * a new node and a same-count swap all go red and must be re-adjudicated.
 * Registered, never excluded; a scope with no entry is a scope that must stay
 * clean.
 *
 * Every remaining finding is contrast on ONE part: the row caption, which inks
 * with `--ds-column-menu-description-color` resting on `--ds-color-text-muted`
 * over the panel's own recessed ground. It is a token-pair finding, not a
 * family one -- moving either side is a palette decision this cut did not take.
 * The two dark scopes and the rottay light scope are clean.
 *
 * REPAIRED BY THIS CUT, not pinned: the five `label` findings. The visibility
 * checkbox of every column row and of every action row rendered with no
 * accessible name at all, so a screen reader announced five unnamed checkboxes
 * in a panel whose whole purpose is choosing between them. Each now carries the
 * name of the thing it toggles.
 */
const AXE_DEBT: Record<string, Readonly<Record<string, readonly string[]>>> = {
  'bithire light': {
    'color-contrast': [
      '.rottay-box.rottay-box--modern[data-part="action-row-copy"] > .font-normal[data-part="description"][data-visible="true"]',
      '.rottay-box.rottay-box--modern[data-part="action-row-copy"] > .font-normal[data-visible="false"][data-part="description"]',
      '.rottay-flex[data-direction="column"][data-part="root"] > div[data-part="row"][data-drag-target="false"][data-dragging="false"] > div[data-part="row-content"][data-justify="between"][data-align="center"] > .rottay-flex[data-part="row-main"][data-align="center"] > .rottay-box.rottay-box--modern[data-part="row-copy"] > .rottay-flex[data-part="row-meta"][data-align="center"] > .font-normal[data-part="description"][data-visible="true"]',
      '.rottay-flex[data-part="row-meta"][data-align="center"] > .font-normal[data-visible="false"][data-part="description"]',
      'div[data-part="group-content"] > div[data-part="row"][data-drag-target="false"][data-dragging="false"]:nth-child(1) > div[data-part="row-content"][data-justify="between"][data-align="center"] > .rottay-flex[data-part="row-main"][data-align="center"] > .rottay-box.rottay-box--modern[data-part="row-copy"] > .rottay-flex[data-part="row-meta"][data-align="center"] > .font-normal[data-part="description"][data-visible="true"]',
    ],
  },
  'evnto light': {
    'color-contrast': [
      '.rottay-box.rottay-box--modern[data-part="action-row-copy"] > .font-normal[data-part="description"][data-visible="true"]',
      '.rottay-flex[data-direction="column"][data-part="root"] > div[data-part="row"][data-drag-target="false"][data-dragging="false"] > div[data-part="row-content"][data-justify="between"][data-align="center"] > .rottay-flex[data-part="row-main"][data-align="center"] > .rottay-box.rottay-box--modern[data-part="row-copy"] > .rottay-flex[data-part="row-meta"][data-align="center"] > .font-normal[data-part="description"][data-visible="true"]',
      '.rottay-flex[data-part="row-meta"][data-align="center"] > .font-normal[data-visible="false"][data-part="description"]',
      'div[data-part="group-content"] > div[data-part="row"][data-drag-target="false"][data-dragging="false"]:nth-child(1) > div[data-part="row-content"][data-justify="between"][data-align="center"] > .rottay-flex[data-part="row-main"][data-align="center"] > .rottay-box.rottay-box--modern[data-part="row-copy"] > .rottay-flex[data-part="row-meta"][data-align="center"] > .font-normal[data-part="description"][data-visible="true"]',
    ],
  },
};

describe('column-menu causality surface', () => {
  it('serves the anatomy every probe reads', () => {
    expect(panel).toContain('data-part="panel"');
    expect(panel).toContain('data-part="header"');
    expect(panel).toContain('data-part="row"');
    expect(panel).toContain('data-part="action-row"');
    expect(panel).toContain('data-part="count-pill"');
    // The rows and the panel are stateful parts decided by the kernel: at rest
    // they carry NO `data-state`, so `[data-state]` never matches a resting row
    // and the skin's paired arms fall through to the platform pseudo-class.
    // (Composed primitives inside the panel stamp their own; these three
    // assertions read the family's OWN parts.)
    expect(/data-part="panel"[^>]*data-state/u.test(panel)).toBe(false);
    expect(/data-part="row"[^>]*data-state/u.test(panel)).toBe(false);
    expect(/data-part="action-row"[^>]*data-state/u.test(panel)).toBe(false);
    // And nothing paints from the TSX: the family carries no inline visual
    // value of its own.
    expect(panel).not.toContain('style="background');
  });

  /**
   * The deriver's whole point: a channel with a producer resolves to a value a
   * theme can move, and a channel without one resolves to the literal in the
   * `var()` fallback. Both spellings read identically in the file, so the only
   * honest proof is reading the custom property itself off the element.
   */
  it('resolves the family channels from the deriver, not from their fallbacks', async () => {
    const readings = await measureArms({
      vertical: 'rottay',
      markup,
      arms: { base: {} },
      targets: [
        { id: 'panelInline', selector: SCOPE, property: '--ds-column-menu-panel-inline-size' },
        { id: 'rowPad', selector: SCOPE, property: '--ds-column-menu-row-padding' },
        { id: 'countRadius', selector: SCOPE, property: '--ds-column-menu-count-radius' },
        { id: 'rowMotionChannel', selector: SCOPE, property: '--ds-column-menu-row-motion-duration' },
        { id: 'focusOutline', selector: SCOPE, property: '--ds-column-menu-panel-focus-outline' },
        // And the paint those channels land on.
        { id: 'countCorner', selector: COUNT, property: 'border-top-left-radius' },
        { id: 'rowPadTop', selector: ROW, property: 'padding-top' },
        { id: 'panelOutline', selector: PANEL, property: 'outline-style' },
      ],
    });
    const r = readings.base!;
    // Produced, not fallen back on.
    expect(r.panelInline.trim()).toBe('432px');
    expect(r.rowPad.trim()).toBe('13px 15px');
    expect(r.countRadius.trim()).not.toBe('');
    expect(r.rowMotionChannel.trim()).not.toBe('');
    expect(r.focusOutline.trim()).not.toBe('');
    // The count pill is a pill: the full-radius rung resolves to a real number.
    expect(r.countCorner).not.toBe('0px');
    // The row padding lands on the row CONTENT, never on the row frame.
    expect(r.rowPadTop).toBe('0px');
    // At rest the panel has no ring: the focus arm is a state, not a default.
    expect(r.panelOutline).toBe('none');
  }, 120_000);

  /**
   * F-37 in one reading: the row's hover wash arrives through
   * `[data-state~='hovered']` on a row no pointer ever touched, because the
   * kernel -- not the platform -- is the authority the skin reads.
   */
  it('paints the hover arm from the kernel state alone', async () => {
    const readings = await measureArms({
      vertical: 'rottay',
      markup,
      arms: { base: {} },
      targets: [
        { id: 'resting', selector: RESTING_ROW, property: 'border-top-color' },
        {
          id: 'hovered',
          selector: RESTING_ROW,
          property: 'border-top-color',
          attributes: { 'data-state': 'hovered' },
        },
      ],
    });
    const r = readings.base!;
    expect(r.resting).not.toBe(r.hovered);
  }, 120_000);

  /**
   * The panel's rhythm is logical: the header's own padding mirrors under
   * `dir=rtl` while the panel keeps its measure, so the same rule serves both
   * reading directions instead of a mirrored copy.
   */
  it('keeps the row on the same span in both reading directions', async () => {
    const readings = await measureArms({
      vertical: 'rottay',
      markup,
      arms: { base: {} },
      targets: [
        { id: 'panelLeftLtr', selector: SCOPE, property: '@rect.left' },
        { id: 'rowLeftLtr', selector: ROW, property: '@rect.left' },
        { id: 'rowWidthLtr', selector: ROW, property: '@rect.width' },
        { id: 'panelLeftRtl', selector: SCOPE, property: '@rect.left', dir: 'rtl' },
        { id: 'rowLeftRtl', selector: ROW, property: '@rect.left', dir: 'rtl' },
        { id: 'rowWidthRtl', selector: ROW, property: '@rect.width', dir: 'rtl' },
      ],
    });
    const r = readings.base!;
    expect(Number(r.rowWidthLtr)).toBeGreaterThan(0);
    // The row spans its scroll region identically in both directions: the
    // family states no physical inset of its own.
    expect(r.rowWidthRtl).toBe(r.rowWidthLtr);
    expect(Number(r.rowLeftLtr) - Number(r.panelLeftLtr)).toBe(
      Number(r.rowLeftRtl) - Number(r.panelLeftRtl),
    );
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
