/**
 * The collapse family in a real browser: the reveal is the skin's grid track
 * and not an inline style, the rhythm answers spacing and density, the panel
 * answers the radius scale, the surfaces follow the mode, the reveal answers
 * the motion dial, reduced motion stops it, and the hover/press/focus paint is
 * reachable through the `data-state` the shared kernel stamps.
 */
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { Collapse, Panel } from '../engines/modern';
import {
  AXE_SCOPES,
  FIRST_PARTY_VERTICALS as VERTICALS,
  auditAxe,
  axeDebt,
  describeCausality,
  measureArms,
  seriousFindings,
} from '@tests/support/family-causality';

type CollapseProps = React.ComponentProps<typeof Collapse>;

function collapse(props: CollapseProps = {}, dir: 'ltr' | 'rtl' = 'ltr'): string {
  return renderToStaticMarkup(
    <div dir={dir} style={{ inlineSize: '32rem' }}>
      <Collapse {...props}>
        <Panel panelKey="one" header="First section">
          The body of the first section.
        </Panel>
      </Collapse>
    </div>,
  );
}

const markup = [
  `<div id="closed">${collapse()}</div>`,
  `<div id="open">${collapse({ defaultActiveKey: 'one' })}</div>`,
  `<div id="small">${collapse({ defaultActiveKey: 'one', size: 'sm' })}</div>`,
  `<div id="large">${collapse({ defaultActiveKey: 'one', size: 'lg' })}</div>`,
  `<div id="ghost">${collapse({ defaultActiveKey: 'one', ghost: true })}</div>`,
  `<div id="icon">${collapse({ collapsible: 'icon' })}</div>`,
].join('');

/**
 * The control that proves the one pinned finding is NOT this family's: a bare
 * paragraph on the same ground, with no collapse anywhere near it.
 */
const CONTROL = '<p id="control">Bare control paragraph</p>';

/**
 * MEASURED GAP, registered rather than forced.
 *
 * In bithire's dark mode the harness ground `--ds-color-bg-primary` stays
 * #FFFFFF while the ink follows the mode, so ANY text on it fails -- the
 * `#control` paragraph above fails at the same 1.1:1 with no collapse in the
 * tree. A ghost panel paints no surface of its own by contract, so its content
 * inherits that ground and fails with it. The fix belongs to whoever owns that
 * vertical's dark ground, and an axe exclusion would hide it.
 */
const AXE_DEBT: Record<string, Readonly<Record<string, readonly string[]>>> = {
  'bithire dark': {
    'color-contrast': [
      '#control',
      '.rottay-collapse--ghost > div[data-part="panel"][data-disabled="false"][data-expanded="true"]'
        + ' > .rottay-collapse-content[data-part="content"][data-expanded="true"]'
        + ' > .rottay-collapse-content-inner[data-part="content-inner"][data-expanded="true"]',
    ],
  },
};

const OPEN_TRACK = "#open [data-part='content']";
const OPEN_HEADER = "#open [data-part='header']";
const CLOSED_HEADER = "#closed [data-part='header']";

describeCausality({
  family: 'collapse',
  markup,
  targets: [
    { id: 'headerPad', selector: "#open [data-part='header-row']", property: 'padding-top' },
    { id: 'headerSize', selector: OPEN_HEADER, property: 'font-size' },
    { id: 'headerWeight', selector: OPEN_HEADER, property: 'font-weight' },
    { id: 'panelRadius', selector: "#open [data-part='panel']", property: 'border-top-left-radius' },
    { id: 'panelSurface', selector: "#open [data-part='panel']", property: 'background-color' },
    { id: 'duration', selector: OPEN_TRACK, property: 'transition-duration' },
    {
      id: 'ring',
      selector: CLOSED_HEADER,
      property: 'outline-color',
      attributes: { 'data-state': 'focus-visible' },
    },
  ],
  decisions: {
    'spacing.rhythm': { value: 'airy', moves: ['headerPad'], holds: 'duration', in: VERTICALS },
    'density.mode': { value: 'spacious', moves: ['headerPad'], holds: 'duration', in: VERTICALS },
    'typography.scale': { value: 1.08, moves: ['headerSize'], holds: 'duration', in: VERTICALS },
    'shape.radius-scale': { value: 1.2, moves: ['panelRadius'], holds: 'duration', in: VERTICALS },
    'motion.dial': { value: { durationScale: 1.35 }, moves: ['duration'], holds: 'headerPad', in: VERTICALS },
    'palette.seeds': { value: { primary: '#2F6B9A' }, moves: ['ring'], holds: 'headerPad', in: VERTICALS },
  },
});

describe('collapse reveal, rhythm and state paint', () => {
  it('reveals through the skin: the track opens, the inner fades in, and no element carries an inline style', async () => {
    const result = await measureArms({
      vertical: 'bithire',
      markup,
      arms: { base: {} },
      targets: [
        { id: 'closedTrack', selector: "#closed [data-part='content']", property: 'grid-template-rows' },
        { id: 'openTrack', selector: OPEN_TRACK, property: 'grid-template-rows' },
        { id: 'closedInner', selector: "#closed [data-part='content-inner']", property: 'opacity' },
        { id: 'openInner', selector: "#open [data-part='content-inner']", property: 'opacity' },
        { id: 'closedArrow', selector: "#closed [data-part='arrow']", property: 'transform' },
        { id: 'openArrow', selector: "#open [data-part='arrow']", property: 'transform' },
      ],
    });
    const r = result.base!;
    // The grid row track IS the reveal: 0fr computes to a zero-height row.
    expect(Number.parseFloat(r.closedTrack!)).toBe(0);
    expect(Number.parseFloat(r.openTrack!)).toBeGreaterThan(0);
    expect(r.closedInner).toBe('0');
    expect(r.openInner).toBe('1');
    // The chevron turns a quarter clockwise; `none` would mean the skin lost it.
    expect(r.closedArrow).toBe('matrix(1, 0, 0, 1, 0, 0)');
    expect(r.openArrow).toBe('matrix(0, 1, -1, 0, 0, 0)');
    // The reveal is proven by computed style, so nothing needs an inline one.
    expect(markup).not.toMatch(/style="[^"]*grid-template-rows/);
    expect(markup).not.toMatch(/<style/);
  }, 60_000);

  it('orders the size rungs and gives ghost its own rhythm', async () => {
    const result = await measureArms({
      vertical: 'rottay',
      markup,
      arms: { base: {} },
      targets: [
        { id: 'small', selector: "#small [data-part='header-row']", property: 'padding-top' },
        { id: 'medium', selector: "#open [data-part='header-row']", property: 'padding-top' },
        { id: 'large', selector: "#large [data-part='header-row']", property: 'padding-top' },
        { id: 'ghost', selector: "#ghost [data-part='header-row']", property: 'padding-top' },
        { id: 'smallContent', selector: "#small [data-part='content-inner']", property: 'padding-bottom' },
        { id: 'largeContent', selector: "#large [data-part='content-inner']", property: 'padding-bottom' },
        { id: 'closedContent', selector: "#closed [data-part='content-inner']", property: 'padding-bottom' },
      ],
    });
    const r = result.base!;
    const px = (value: string | undefined) => Number.parseFloat(value ?? '');
    expect(px(r.small)).toBeLessThan(px(r.medium));
    expect(px(r.medium)).toBeLessThan(px(r.large));
    // Ghost reproduces the former `ghost ? ghostPadding : defaultPadding`.
    expect(px(r.ghost)).toBeLessThan(px(r.medium));
    expect(px(r.smallContent)).toBeLessThan(px(r.largeContent));
    // A closed panel has no vertical content padding, so the 0fr track is flat.
    expect(px(r.closedContent)).toBe(0);
  }, 60_000);

  it('paints hover and press from the kernel stamp, not only from a pointer', async () => {
    const result = await measureArms({
      vertical: 'evnto',
      markup,
      arms: { base: {} },
      targets: [
        { id: 'idle', selector: CLOSED_HEADER, property: 'background-color' },
        {
          id: 'hovered',
          selector: CLOSED_HEADER,
          property: 'background-color',
          attributes: { 'data-state': 'hovered' },
        },
        {
          id: 'pressed',
          selector: CLOSED_HEADER,
          property: 'background-color',
          attributes: { 'data-state': 'pressed' },
        },
        {
          id: 'iconModeHover',
          selector: "#icon [data-part='header']",
          property: 'background-color',
          attributes: { 'data-state': 'hovered' },
        },
      ],
    });
    const r = result.base!;
    expect(r.hovered).not.toBe(r.idle);
    expect(r.pressed).not.toBe(r.idle);
    expect(r.pressed).not.toBe(r.hovered);
    // In `icon` mode the header is presentation: it must not paint a hover.
    expect(r.iconModeHover).toBe(r.idle);
  }, 60_000);

  it('stops the reveal for a reduced-motion reader', async () => {
    const result = await measureArms({
      vertical: 'bithire',
      markup,
      arms: { base: {} },
      environment: { reducedMotion: 'reduce' },
      targets: [
        { id: 'track', selector: OPEN_TRACK, property: 'transition-duration' },
        { id: 'inner', selector: "#open [data-part='content-inner']", property: 'transition-duration' },
        { id: 'arrow', selector: "#open [data-part='arrow']", property: 'transition-duration' },
        { id: 'openTrack', selector: OPEN_TRACK, property: 'grid-template-rows' },
      ],
    });
    const r = result.base!;
    // The personality clamp floors every duration at 1e-05s rather than 0s, so
    // a transition still fires and nothing waits on an event that never comes.
    for (const id of ['track', 'inner', 'arrow'] as const) {
      expect(Number.parseFloat(r[id]!), id).toBeLessThanOrEqual(0.0001);
    }
    // Nothing is hidden by stopping the motion: the panel is still open.
    expect(Number.parseFloat(r.openTrack!)).toBeGreaterThan(0);
  }, 60_000);

  it('gives a coarse pointer the physical touch floor on whichever element is the toggle', async () => {
    const result = await measureArms({
      vertical: 'rottay',
      markup,
      arms: { base: {} },
      environment: { touch: true },
      targets: [
        { id: 'header', selector: CLOSED_HEADER, property: 'min-block-size' },
        { id: 'arrow', selector: "#icon [data-part='arrow']", property: 'min-block-size' },
      ],
    });
    const r = result.base!;
    expect(Number.parseFloat(r.header!)).toBeGreaterThanOrEqual(44);
    expect(Number.parseFloat(r.arrow!)).toBeGreaterThanOrEqual(44);
  }, 60_000);

  it('mirrors the collapsed chevron under RTL and leaves the expanded turn alone', async () => {
    const mirrored = `<div id="closed">${collapse({}, 'rtl')}</div>`
      + `<div id="open">${collapse({ defaultActiveKey: 'one' }, 'rtl')}</div>`;
    const result = await measureArms({
      vertical: 'evnto',
      markup: mirrored,
      arms: { base: {} },
      targets: [
        { id: 'closed', selector: "#closed [data-part='arrow']", property: 'transform', dir: 'rtl' },
        { id: 'open', selector: "#open [data-part='arrow']", property: 'transform', dir: 'rtl' },
      ],
    });
    const r = result.base!;
    // The collapsed glyph points along the reading direction; the expanded one
    // points down, which is direction-neutral and must NOT be mirrored again.
    expect(r.closed).toBe('matrix(-1, 0, 0, 1, 0, 0)');
    expect(r.open).toBe('matrix(0, 1, -1, 0, 0, 0)');
  }, 60_000);

  it('carries no serious axe finding beyond the pinned harness ground', async () => {
    const measured: Record<string, Readonly<Record<string, readonly string[]>>> = {};
    for (const scope of AXE_SCOPES) {
      const debt = axeDebt(seriousFindings(await auditAxe({ ...scope, markup: markup + CONTROL })));
      if (Object.keys(debt).length > 0) measured[`${scope.vertical} ${scope.theme}`] = debt;
    }
    expect(measured).toEqual(AXE_DEBT);
  }, 180_000);
});
