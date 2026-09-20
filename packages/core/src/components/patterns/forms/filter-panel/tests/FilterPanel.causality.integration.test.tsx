/**
 * The filter-panel family in a real browser: every keypath the family deriver
 * declares in `consumes` is exercised against the family's OWN computed paint
 * with a negative control -- including the two that only a real pointer or a
 * portal-rendered part can reach -- and axe holds beyond the pinned debt.
 */
import { createRequire } from 'node:module';
import { resolve as resolvePath } from 'node:path';
import React from 'react';
import { prerenderToNodeStream } from 'react-dom/static';
import { describe, expect, it } from 'vitest';

import { EngineProvider } from '@/infrastructure/runtime/engines/composition/react/provider';
import type { FilterDef } from '../contracts';
import ModernFilterPanel from '../engines/modern';
import {
  AXE_SCOPES,
  FIRST_PARTY_VERTICALS as VERTICALS,
  auditAxe,
  axeDebt,
  describeCausality,
  measureArms,
  mountArm,
  resolvedBaseCss,
  seriousFindings,
} from '@tests/support/family-causality';

const FILTERS: FilterDef[] = [
  { key: 'query', label: 'Query', type: 'text', placeholder: 'Search' },
  {
    key: 'status',
    label: 'Status',
    type: 'select',
    options: [
      { value: 'draft', label: 'Draft' },
      { value: 'live', label: 'Live' },
    ],
  },
  { key: 'capacity', label: 'Capacity', type: 'number-range' },
];

async function panelMarkup(): Promise<string> {
  const { prelude } = await prerenderToNodeStream(
    <EngineProvider defaultEngine="modern">
      <ModernFilterPanel filters={FILTERS} values={{}} onChange={() => {}} />
    </EngineProvider>,
  );
  let html = '';
  for await (const chunk of prelude) html += String(chunk);
  return html;
}

const markup = await panelMarkup();

const ROOT = '.ds-pattern-filter-panel';
const FIELDS = `${ROOT} [data-part='fields']`;
const LABEL = `${ROOT} [data-part='field-label']`;
const CONTENT = `${ROOT} [data-part='content']`;

describeCausality({
  family: 'filter-panel',
  markup,
  targets: [
    { id: 'fieldsGap', selector: FIELDS, property: 'row-gap' },
    { id: 'labelSize', selector: LABEL, property: 'font-size' },
    { id: 'labelInk', selector: LABEL, property: 'color' },
    { id: 'collapseDuration', selector: CONTENT, property: 'transition-duration' },
  ],
  decisions: {
    // `consumes: density` -- the field rhythm rides the density-scaled spacing ramp.
    'density.mode': { value: 'spacious', moves: ['fieldsGap'], holds: 'labelInk', in: VERTICALS },
    // `consumes: typography.roles` -- the field label is the family's own type step.
    'typography.scale': { value: 1.08, moves: ['labelSize'], holds: 'labelInk', in: VERTICALS },
    // The collapse cadence binds `--ds-motion-disclosure`, which is the calm rung
    // multiplied by the dial, so the tenant's durationScale reaches it.
    'motion.dial': { value: { durationScale: 1.35 }, moves: ['collapseDuration'], holds: 'fieldsGap', in: VERTICALS },
    // `consumes: palette.*` and `consumes: surfaces.radiusScale` are reached by
    // paint no static, resting mount can show; both are measured below.
  },
});

/**
 * Measured contrast debt pinned by node identity; the fix is ink derivation,
 * never an axe exclusion.
 *
 * `bithire dark` had eight rows -- the three field labels, the placeholder, the
 * range separator, the search input and both range inputs -- and they DRAINED:
 * that scope's dark block now re-derives its own canvas ground instead of
 * inheriting the light body's, so the quiet inks and the transparent control
 * chrome are read against the ground they were designed for. Dropped by
 * identity, not waived: with no entry the scope must measure clean, and a
 * relapse reddens here. The light scopes keep their own rows.
 */
const AXE_DEBT: Record<string, Readonly<Record<string, readonly string[]>>> = {
  'bithire light': {
    'color-contrast': [
      'div[data-part="field-row"]:nth-child(1) > span[data-part="field-label"]',
      'div[data-part="field-row"]:nth-child(2) > span[data-part="field-label"]',
      'div[data-part="field-row"]:nth-child(3) > span[data-part="field-label"]',
      'span[data-part="placeholder"]',
      'span[data-part="range-separator"]',
    ],
  },
  'evnto light': {
    'color-contrast': [
      'div[data-part="field-row"]:nth-child(1) > span[data-part="field-label"]',
      'div[data-part="field-row"]:nth-child(2) > span[data-part="field-label"]',
      'div[data-part="field-row"]:nth-child(3) > span[data-part="field-label"]',
      'span[data-part="placeholder"]',
      'span[data-part="range-separator"]',
    ],
  },
  'rottay dark': { 'color-contrast': ['#input-_R_9d_', 'input[placeholder="Max"]', 'input[placeholder="Min"]'] },
};

describe('filter-panel accessibility', () => {
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
 * The two declared keypaths whose paint is not in the resting mount.
 *
 * The panel's own resting ink (`field-label`, `range-separator`) reads the
 * vertical's neutral roles, which no palette decision moves. The family's one
 * seeded reading is the reset affordance's pointer treatment, so the palette
 * probe drives a REAL hover and reads the ink back. The family's one radius
 * reading is the option-icon-badge, which the engine hands to the composed
 * Select and which therefore renders inside that primitive's PORTAL: no
 * server-rendered mount contains it, so the radius probe reads the channel the
 * badge rule resolves on the family's own root instead of a painted box, and
 * says so rather than borrowing the corner of a composed primitive.
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
  throw new Error('filter-panel causality: no Playwright chromium is resolvable');
}

/** The panel with its reset affordance painted, which the resting mount omits. */
async function resetAffordanceMarkup(): Promise<string> {
  const { prelude } = await prerenderToNodeStream(
    <EngineProvider defaultEngine="modern">
      <ModernFilterPanel
        filters={FILTERS}
        values={{ query: 'abc' }}
        onChange={() => {}}
        onReset={() => {}}
        showReset
      />
    </EngineProvider>,
  );
  let html = '';
  for await (const chunk of prelude) html += String(chunk);
  return html;
}

const resetMarkup = await resetAffordanceMarkup();

const RESET = "#probe-host [data-part='reset-button']";
const RESET_LABEL = "#probe-host [data-part='field-label']";

/** `color` at rest and under a real pointer hover, for one compiled arm. */
async function inkUnderHover(decisions: Readonly<Record<string, unknown>>) {
  const browser = await chromiumDriver().launch();
  try {
    const context = await browser.newContext();
    const page = await context.newPage();
    const arm = await mountArm('rottay', decisions as never);
    await page.setContent('<!doctype html><html><head></head><body></body></html>');
    await page.addStyleTag({ content: resolvedBaseCss() });
    await page.addStyleTag({ content: arm.css });
    await page.evaluate(
      ({ rootAttributes, html }: { rootAttributes: Record<string, string>; html: string }) => {
        for (const [name, value] of Object.entries(rootAttributes)) {
          document.documentElement.setAttribute(name, value);
        }
        const host = document.createElement('div');
        host.id = 'probe-host';
        host.setAttribute('style', 'background: var(--ds-color-bg-primary); color: var(--ds-color-text-primary); padding: 16px;');
        host.innerHTML = html;
        document.body.append(host);
      },
      { rootAttributes: arm.rootAttributes, html: resetMarkup },
    );
    const inkOf = (selector: string) =>
      page.evaluate((sel: string) => getComputedStyle(document.querySelector(sel)!).color, selector);
    const rest = await inkOf(RESET);
    await page.hover(RESET);
    /* The composed ghost Button paints hover from the kernel state, which React
       stamps on pointer enter -- and this probe injects prerendered markup with
       no React behind it. So the real pointer stays (it is what a user does) and
       the stamp React would have written is applied alongside it. */
    await page.evaluate((sel: string) => {
      document.querySelector(sel)!.setAttribute('data-state', 'hovered');
    }, RESET);
    // The reset ink crosses on the family's motion channel; read the landing value.
    await page.waitForTimeout(600);
    return { rest, hovered: await inkOf(RESET), control: await inkOf(RESET_LABEL) };
  } finally {
    await browser.close();
  }
}

describe('filter-panel declared consumes', () => {
  it('moves the reset affordance ink with the status palette under a real hover', async () => {
    const base = await inkUnderHover({});
    const seeded = await inkUnderHover({ 'palette.status-seeds': { error: '#8A2F2F' } });
    // The affordance really changes under the pointer: the probe is not reading a resting value.
    expect(base.hovered).not.toBe(base.rest);
    // `consumes: palette.*` -- the seeded error ramp paints the family's own hover ink.
    expect(seeded.hovered).not.toBe(base.hovered);
    // Negative control: the panel's neutral field ink is untouched by the seed.
    expect(seeded.control).toBe(base.control);
  }, 180_000);

  it('carries surfaces.radiusScale to the badge rung, whose only painted part is portal-rendered', async () => {
    const readings = await measureArms({
      vertical: 'rottay',
      markup,
      arms: { base: {}, radius: { 'shape.radius-scale': 1.2 }, density: { 'density.mode': 'spacious' } },
      targets: [
        // The rung the option-icon-badge rule resolves, read on the family's own root.
        { id: 'badgeRung', selector: ROOT, property: '--ds-radius-md' },
        { id: 'fieldsGap', selector: FIELDS, property: 'row-gap' },
        { id: 'labelInk', selector: LABEL, property: 'color' },
        { id: 'contentMax', selector: `${ROOT} [data-part='content']`, property: 'max-block-size' },
      ],
    });
    const base = readings.base!;
    // The decision reaches the rung the family reads...
    expect(readings.radius!.badgeRung).not.toBe(base.badgeRung);
    // ...and nothing else in the resting panel: the painted reader is the
    // portal-rendered badge, which is why this is pinned rather than probed.
    for (const id of ['fieldsGap', 'labelInk', 'contentMax'] as const) {
      expect(readings.radius![id], `shape.radius-scale must not move ${id}`).toBe(base[id]);
    }
    // The control decision moves the family's geometry and leaves the rung alone.
    expect(readings.density!.fieldsGap).not.toBe(base.fieldsGap);
    expect(readings.density!.badgeRung).toBe(base.badgeRung);
  }, 180_000);
});
