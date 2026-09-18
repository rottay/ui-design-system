/**
 * The saved-views family in a real browser: every keypath the family deriver
 * declares in `consumes` is exercised against the family's OWN computed paint
 * with a negative control -- including the focus signature, which is measured
 * under REAL DOM focus rather than a stamped attribute -- and axe holds beyond
 * the pinned debt.
 */
import { createRequire } from 'node:module';
import { resolve as resolvePath } from 'node:path';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { EngineProvider } from '@/infrastructure/runtime/engines/composition/react/provider';
import type { SavedView } from '../contracts';
import ModernSavedViewsBar from '../engines/modern';
import {
  AXE_SCOPES,
  FIRST_PARTY_VERTICALS as VERTICALS,
  auditAxe,
  axeDebt,
  describeCausality,
  mountArm,
  resolvedBaseCss,
  seriousFindings,
} from '@tests/support/family-causality';

const noop = () => {};

const views: SavedView[] = [
  { id: 'all', name: 'All items', isDefault: true, config: { layout: 'table' } },
  { id: 'active', name: 'Active only', config: { filters: { status: 'active' } } },
];

const markup = renderToStaticMarkup(
  <EngineProvider defaultEngine="modern">
    <ModernSavedViewsBar
      views={views}
      activeViewId="all"
      onViewSelect={noop}
      onViewSave={noop}
      onViewDelete={noop}
      onViewRename={noop}
      onViewCreate={noop}
    />
  </EngineProvider>,
);

const ACTIVE = "[data-testid='view-tab-all']";
const MENU = `${ACTIVE} [data-part='menu-trigger']`;

describeCausality({
  family: 'saved-views',
  markup,
  targets: [
    { id: 'activeFill', selector: ACTIVE, property: 'background-color' },
    { id: 'pillPad', selector: ACTIVE, property: 'padding-top' },
    { id: 'pillSize', selector: ACTIVE, property: 'font-size' },
    { id: 'menuCorner', selector: MENU, property: 'border-top-left-radius' },
  ],
  decisions: {
    // `consumes: palette.*` -- the active pill's ground is the seeded primary.
    'palette.seeds': { value: { primary: '#2F6B9A' }, moves: ['activeFill'], holds: 'pillPad', in: VERTICALS },
    // `consumes: density` -- the pill rhythm rides the density-scaled ramp.
    'density.mode': { value: 'spacious', moves: ['pillPad'], holds: 'activeFill', in: VERTICALS },
    // `consumes: surfaces.radiusScale` -- the menu trigger's own corner.
    'shape.radius-scale': { value: 1.2, moves: ['menuCorner'], holds: 'pillPad', in: VERTICALS },
    // `consumes: typography.roles` -- the pill label is the family's type step.
    'typography.scale': { value: 1.08, moves: ['pillSize'], holds: 'activeFill', in: VERTICALS },
    // `consumes: surfaces.focusStyle` needs real focus to paint; measured below.
  },
});

// Measured contrast debt pinned by node identity; the fix is ink derivation, never an axe exclusion.
// Empty since the bithire-dark `pill-select` label stopped painting on the body's inherited
// ground: the mode block re-derives its own canvas now (`withModeCanvas`, 4f7d46751).
const AXE_DEBT: Record<string, Readonly<Record<string, readonly string[]>>> = {};

describe('saved-views accessibility', () => {
  it('carries no serious axe finding beyond the pinned debt', async () => {
    const measured: Record<string, Readonly<Record<string, readonly string[]>>> = {};
    for (const scope of AXE_SCOPES) {
      const debt = axeDebt(seriousFindings(await auditAxe({ ...scope, markup })));
      if (Object.keys(debt).length > 0) measured[`${scope.vertical} ${scope.theme}`] = debt;
    }
    expect(measured).toEqual(AXE_DEBT);
  }, 300_000);
});

/* ---------------------------------------------------------------------------
 * The focus signature, under real focus.
 *
 * The family paints its focus ring from `:focus-visible`, which no stamped
 * attribute produces: the probe gives the pill and the menu trigger real DOM
 * focus, asserts the element really holds it and really matches
 * `:focus-visible`, and reads the outline back. A ring that only appears when
 * a test writes `data-state` is not evidence that a keyboard user sees one.
 * ------------------------------------------------------------------------ */

function chromiumDriver(): { launch(): Promise<any> } {
  const required = createRequire(resolvePath(process.cwd(), 'package.json'));
  for (const specifier of ['playwright', '@playwright/test']) {
    try {
      const module = required(specifier) as { chromium?: { launch(): Promise<any> } };
      if (module.chromium) return module.chromium;
    } catch {
      // try the next driver
    }
  }
  throw new Error('saved-views causality: no Playwright chromium is resolvable');
}

interface FocusReading {
  readonly focused: boolean;
  readonly focusVisible: boolean;
  readonly outlineWidth: string;
  readonly outlineOffset: string;
  readonly pillPad: string;
}

const FOCUS_TARGETS = {
  pill: "[data-testid='view-tab-all'] [data-part='pill-select']",
  trigger: "[data-testid='view-tab-all'] [data-part='menu-trigger']",
} as const;

async function focusReadings(
  decisions: Readonly<Record<string, unknown>>,
): Promise<Record<keyof typeof FOCUS_TARGETS, FocusReading>> {
  const browser = await chromiumDriver().launch();
  try {
    const context = await browser.newContext();
    const page = await context.newPage();
    const arm = await mountArm('rottay', decisions as never);
    await page.setContent('<!doctype html><html><head></head><body></body></html>');
    await page.addStyleTag({ content: resolvedBaseCss() });
    await page.addStyleTag({ content: arm.css });
    return await page.evaluate(
      ({ rootAttributes, html, selectors }: { rootAttributes: Record<string, string>; html: string; selectors: Record<string, string> }) => {
        for (const [name, value] of Object.entries(rootAttributes)) {
          document.documentElement.setAttribute(name, value);
        }
        const host = document.createElement('div');
        host.setAttribute('style', 'background: var(--ds-color-bg-primary); color: var(--ds-color-text-primary); padding: 16px;');
        host.innerHTML = html;
        document.body.append(host);
        const pill = host.querySelector("[data-testid='view-tab-all']") as HTMLElement;
        const out: Record<string, unknown> = {};
        for (const [id, selector] of Object.entries(selectors)) {
          const element = host.querySelector(selector) as HTMLElement;
          element.focus();
          const computed = getComputedStyle(element);
          out[id] = {
            focused: document.activeElement === element,
            focusVisible: element.matches(':focus-visible'),
            outlineWidth: computed.outlineWidth,
            outlineOffset: computed.outlineOffset,
            pillPad: getComputedStyle(pill).paddingTop,
          };
          element.blur();
        }
        return out;
      },
      { rootAttributes: arm.rootAttributes, html: markup, selectors: FOCUS_TARGETS },
    ) as Record<keyof typeof FOCUS_TARGETS, FocusReading>;
  } finally {
    await browser.close();
  }
}

describe('saved-views declared consumes', () => {
  it('moves the real focus ring with the focus signature and holds the pill geometry', async () => {
    const base = await focusReadings({});
    const glow = await focusReadings({ 'states.focus-style': 'glow' });
    for (const id of ['pill', 'trigger'] as const) {
      // The reading is a real focus state, not a stamped attribute.
      expect(base[id].focused, `${id} really holds focus`).toBe(true);
      expect(base[id].focusVisible, `${id} really matches :focus-visible`).toBe(true);
      expect(glow[id].focused).toBe(true);
      // `consumes: surfaces.focusStyle` -- the family's own outline follows the signature.
      expect(glow[id].outlineWidth, `${id} outline width`).not.toBe(base[id].outlineWidth);
      expect(glow[id].outlineOffset, `${id} outline offset`).not.toBe(base[id].outlineOffset);
      // Negative control: the pill's rhythm is geometry, not focus.
      expect(glow[id].pillPad, `${id} control pillPad`).toBe(base[id].pillPad);
    }
  }, 180_000);
});
