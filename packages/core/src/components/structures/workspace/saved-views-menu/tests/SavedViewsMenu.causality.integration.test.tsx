/**
 * The saved-views-menu family in a real browser (WO-FAM-08 B9).
 *
 * NO DERIVER, DELIBERATELY: the only names this skin read without a producer
 * were the three `--ds-saved-views-menu-panel-*` values the render MEASURES
 * against the viewport, and a measurement is not a decision -- they now carry
 * resting declarations on the family's own panel rule, the way virtual-list's
 * windowing channels do, so each read resolves to a value a theme can move and
 * the measured instance stamp outranks it. What is left unproduced is the
 * materials vocabulary, which another family owns.
 *
 * With no `consumes` list to discharge, this suite probes what actually reaches
 * the family's own paint, one decision per case with a negative control.
 *
 * MARKUP: the panel is portalled and mounts only while the menu is open, so the
 * suite opens the real menu in the DOM runner and keeps the family's own two
 * roots -- the anchor and the panel.
 */
import React from 'react';
import { describe, expect, it } from 'vitest';
import { fireEvent, waitFor } from '@testing-library/react';

import { SavedViewsMenu } from '../index';
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

const PANEL_SURFACE = ".ds-structure.ds-saved-views-menu-panel[data-part='panel']";

const VIEWS = [
  {
    key: 'all',
    label: 'All records',
    kind: 'system' as const,
    isSystem: true,
    isDefault: true,
    state: { query: '', density: 'comfortable' },
  },
  {
    key: 'mine',
    label: 'Assigned to me',
    kind: 'persona' as const,
    state: { scope: 'mine', filters: [{ key: 'owner', label: 'Owner', value: 'me' }] },
  },
  {
    key: 'recent',
    label: 'Recently touched',
    kind: 'custom' as const,
    state: { sort: { field: 'updatedAt', direction: 'desc' as const } },
  },
];

async function openMenuMarkup(): Promise<{ anchor: string; panel: string }> {
  const { container } = renderWithEngine(
    <SavedViewsMenu
      views={VIEWS}
      activeViewKey="mine"
      onViewSelect={() => undefined}
      onViewDelete={() => undefined}
      onViewSave={() => undefined}
      onSaveCurrentView={() => undefined}
      shareBaseUrl="https://app.example.com/records"
    />,
    'modern',
  );
  const trigger = await waitFor(() => {
    const node = container.querySelector('[data-part="trigger"]') as HTMLElement;
    expect(node).not.toBeNull();
    return node;
  });
  fireEvent.click(trigger);
  await waitForPortalContent(waitFor, PANEL_SURFACE, "[data-part='view-item']", 1);
  const anchorNode = container.querySelector('[data-part="anchor"]') as HTMLElement;
  const panelNode = document.querySelector(PANEL_SURFACE) as HTMLElement;
  return { anchor: anchorNode.outerHTML, panel: panelNode.outerHTML };
}

const { anchor, panel } = await openMenuMarkup();
const markup = `<div id="menu" style="inline-size:36rem">${anchor}${panel}</div>`;
/**
 * The same markup with the render's measured clamp removed. The DOM runner that
 * captured the markup lays nothing out, so its measurement is a zero-width
 * viewport reading; every case that reads a BOX rather than a colour measures
 * this one, where the panel takes the resting measure the skin declares.
 */
const restingMarkup = markup.replace(/style="[^"]*--ds-saved-views-menu-panel[^"]*"/u, '');

const ANCHOR = "#menu .ds-structure.ds-saved-views-menu[data-part='anchor']";
const TRIGGER = "#menu .ds-structure.ds-saved-views-menu[data-part='trigger']";
const PANEL = `#menu ${PANEL_SURFACE}`;
const HEADER = `${PANEL} [data-part='header']`;
const COUNT = `${PANEL} [data-part='count-pill']`;
const ACTIVE_ITEM = `${PANEL} [data-part='view-item'][data-active='true']`;
const RESTING_ITEM = `${PANEL} [data-part='view-item'][data-active='false']`;
const DELETE = `${PANEL} [data-part='delete']`;

describeCausality({
  family: 'saved-views-menu',
  markup,
  targets: [
    // The active view's tinted card is the family's own seeded signal.
    { id: 'activeGround', selector: ACTIVE_ITEM, property: 'background-image' },
    // The panel closes on the extra-large rung of the radius ramp.
    { id: 'panelCorner', selector: PANEL, property: 'border-top-left-radius' },
    // The pills are the family's OWN type step (Box, not a composed Text).
    { id: 'countSize', selector: COUNT, property: 'font-size' },
    // The trigger is a real tab stop: its ring is the focus signature.
    {
      id: 'triggerRing',
      selector: TRIGGER,
      property: 'box-shadow',
      attributes: { 'data-state': 'focus-visible' },
    },
    // The panel's entrance rides the disclosure role, which the dial bends.
    { id: 'panelMotion', selector: PANEL, property: 'animation-duration' },
    // The control: the header band's rhythm is a px constant this family owns
    // outright, so no decision in the catalog may move it.
    { id: 'headerPad', selector: HEADER, property: 'padding-top' },
  ],
  decisions: {
    'palette.seeds': {
      value: { primary: '#2F6B9A' },
      moves: ['activeGround'],
      holds: 'headerPad',
      in: VERTICALS,
    },
    'shape.radius-scale': {
      value: 1.2,
      moves: ['panelCorner'],
      holds: 'headerPad',
      in: VERTICALS,
    },
    'typography.scale': {
      value: 1.08,
      moves: ['countSize'],
      holds: 'headerPad',
      in: VERTICALS,
    },
    'states.focus-style': {
      value: 'glow',
      moves: ['triggerRing'],
      holds: 'headerPad',
      in: VERTICALS,
    },
    'motion.dial': {
      value: { durationScale: 1.3 },
      moves: ['panelMotion'],
      holds: 'headerPad',
      in: VERTICALS,
    },
  },
});

/**
 * Measured debt, pinned by node IDENTITY rather than by count: a repaired node,
 * a new node and a same-count swap all go red and must be re-adjudicated.
 * Registered, never excluded; a scope with no entry is a scope that must stay
 * clean.
 */
const AXE_DEBT: Record<string, Readonly<Record<string, readonly string[]>>> = {};

describe('saved-views-menu causality surface', () => {
  it('serves the anatomy every probe reads', () => {
    expect(anchor).toContain('data-part="trigger"');
    expect(panel).toContain('data-part="view-item"');
    expect(panel).toContain('data-part="view-item-select"');
    expect(panel).toContain('data-part="action-button"');
    expect(panel).toContain('data-part="delete"');
    // Every stateful part is decided by the kernel and carries NO `data-state`
    // at rest, so `[data-state]` never matches a resting node and each paired
    // arm falls through to the platform pseudo-class it stands beside (F-37).
    expect(/data-part="trigger"[^>]*data-state/u.test(anchor)).toBe(false);
    expect(/data-part="view-item"[^>]*data-state/u.test(panel)).toBe(false);
    expect(/data-part="view-item-select"[^>]*data-state/u.test(panel)).toBe(false);
    expect(/data-part="action-button"[^>]*data-state/u.test(panel)).toBe(false);
    expect(/data-part="delete"[^>]*data-state/u.test(panel)).toBe(false);
    // The measured viewport clamp is the ONLY thing that travels inline, and it
    // travels as the family's own channels rather than as paint.
    expect(panel).toContain('--ds-saved-views-menu-panel-top');
    expect(panel).toContain('--ds-saved-views-menu-panel-left');
    expect(panel).toContain('--ds-saved-views-menu-panel-width');
  });

  /**
   * The three measured channels, read back twice: at the resting declaration
   * the skin now owns (so the producer is real, not a `var()` fallback nobody
   * writes) and at the stamped instance (so the measurement still wins).
   */
  it('resolves the panel clamp from a real producer, and lets the measurement outrank it', async () => {
    const readings = await measureArms({
      vertical: 'rottay',
      markup: restingMarkup,
      arms: { base: {} },
      targets: [
        { id: 'restingTop', selector: PANEL, property: '--ds-saved-views-menu-panel-top' },
        { id: 'restingLeft', selector: PANEL, property: '--ds-saved-views-menu-panel-left' },
        { id: 'restingWidth', selector: PANEL, property: '--ds-saved-views-menu-panel-width' },
        { id: 'paintedWidth', selector: PANEL, property: 'width' },
      ],
    });
    const r = readings.base!;
    expect(r.restingTop.trim()).toBe('0');
    expect(r.restingLeft.trim()).toBe('0');
    expect(r.restingWidth.trim()).toBe('26.25rem');
    // 26.25rem resolved against the rottay root step the probe host renders
    // with (15px), which is the point of expressing the resting measure in rem:
    // it follows the type ramp while the stamped instance is a measured px.
    expect(r.paintedWidth).toBe('393.75px');

    const stamped = await measureArms({
      vertical: 'rottay',
      markup,
      arms: { base: {} },
      targets: [{ id: 'stampedWidth', selector: PANEL, property: '--ds-saved-views-menu-panel-width' }],
    });
    // The render measured a viewport and stamped it; the stamp is in px and the
    // resting declaration is in rem, so a stamp that failed to arrive would
    // read back as the resting value.
    expect(stamped.base!.stampedWidth.trim()).toMatch(/px$/u);
  }, 120_000);

  /**
   * F-37 in one reading: the resting view-item's wash and the delete
   * affordance's ink both arrive through `[data-state~='hovered']` on nodes no
   * pointer ever touched, because the kernel is the authority the skin reads.
   */
  it('paints the hover arms from the kernel state alone', async () => {
    const readings = await measureArms({
      vertical: 'rottay',
      markup,
      arms: { base: {} },
      targets: [
        { id: 'itemResting', selector: RESTING_ITEM, property: 'border-top-color' },
        {
          id: 'itemHovered',
          selector: RESTING_ITEM,
          property: 'border-top-color',
          attributes: { 'data-state': 'hovered' },
        },
        { id: 'deleteResting', selector: DELETE, property: 'color' },
        {
          id: 'deleteHovered',
          selector: DELETE,
          property: 'color',
          attributes: { 'data-state': 'hovered' },
        },
      ],
    });
    const r = readings.base!;
    expect(r.itemResting).not.toBe(r.itemHovered);
    expect(r.deleteResting).not.toBe(r.deleteHovered);
  }, 120_000);

  /**
   * The list reads in both directions from one set of rules: the family states
   * logical insets only, so a view row spans its panel identically under rtl.
   */
  /**
   * The row cluster is spelled logically, so one rule serves both reading
   * directions: the delete affordance's `margin-inline-end` lands on the
   * physical right in ltr and on the physical left in rtl, and the row keeps
   * exactly the same measure in both.
   */
  it('mirrors the row cluster under rtl from one set of rules', async () => {
    const readings = await measureArms({
      vertical: 'rottay',
      markup: restingMarkup,
      arms: { base: {} },
      targets: [
        { id: 'itemWidthLtr', selector: RESTING_ITEM, property: '@rect.width' },
        { id: 'deleteEndLtr', selector: DELETE, property: 'margin-right' },
        { id: 'deleteStartLtr', selector: DELETE, property: 'margin-left' },
        { id: 'itemWidthRtl', selector: RESTING_ITEM, property: '@rect.width', dir: 'rtl' },
        { id: 'deleteEndRtl', selector: DELETE, property: 'margin-right', dir: 'rtl' },
        { id: 'deleteStartRtl', selector: DELETE, property: 'margin-left', dir: 'rtl' },
      ],
    });
    const r = readings.base!;
    expect(Number(r.itemWidthLtr)).toBeGreaterThan(0);
    expect(r.itemWidthRtl).toBe(r.itemWidthLtr);
    expect(r.deleteEndLtr).toBe('8px');
    expect(r.deleteStartLtr).toBe('0px');
    // The same declaration, the other edge.
    expect(r.deleteStartRtl).toBe('8px');
    expect(r.deleteEndRtl).toBe('0px');
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
