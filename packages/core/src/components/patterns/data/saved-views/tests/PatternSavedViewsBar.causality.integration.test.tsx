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
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { EngineProvider } from '@/infrastructure/runtime/engines/composition/react/provider';
import type { SavedView } from '../contracts';
import ModernSavedViewsBar from '../engines/modern';
import ModernInput from '../../../../primitives/inputs/input/engines/modern';
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
 * The pill and the menu trigger are composed Buttons, so the focus signature
 * they wear is the Button's: the probe gives each real DOM focus, asserts the
 * element really holds it and really matches `:focus-visible`, and reads the
 * signature back. A ring that only appears when a test writes `data-state` is
 * not evidence that a keyboard user sees one.
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
  readonly boxShadow: string;
  readonly outlineStyle: string;
  readonly outlineColor: string;
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
            boxShadow: computed.boxShadow,
            outlineStyle: computed.outlineStyle,
            outlineColor: computed.outlineColor,
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
  it('wears the tenant focus signature under real focus and holds the pill geometry', async () => {
    const base = await focusReadings({});
    const glow = await focusReadings({ 'states.focus-style': 'glow' });
    for (const id of ['pill', 'trigger'] as const) {
      // The reading is a real focus state, not a stamped attribute.
      expect(base[id].focused, `${id} really holds focus`).toBe(true);
      expect(base[id].focusVisible, `${id} really matches :focus-visible`).toBe(true);
      expect(glow[id].focused).toBe(true);
      // `consumes: surfaces.focusStyle` -- the signature is a shadow and moves with the decision.
      expect(base[id].boxShadow, `${id} base signature`).not.toBe('none');
      expect(glow[id].boxShadow, `${id} glow signature`).not.toBe('none');
      expect(glow[id].boxShadow, `${id} signature`).not.toBe(base[id].boxShadow);
      expect(glow[id].boxShadow, `${id} glow halo`).toContain('12px');
      // A solid outline would draw the same contour under every signature.
      for (const reading of [base[id], glow[id]]) {
        expect(
          reading.outlineStyle === 'none' || reading.outlineColor === 'rgba(0, 0, 0, 0)',
          `${id} paints no solid outline`,
        ).toBe(true);
      }
      // Negative control: the pill's rhythm is geometry, not focus.
      expect(glow[id].pillPad, `${id} control pillPad`).toBe(base[id].pillPad);
    }
  }, 180_000);
});

/* ---------------------------------------------------------------------------
 * The rename and create fields, under real focus.
 *
 * Both compose the unstyled DS Input, so the Input skin is their only focus
 * author: each must compute exactly what a plain unstyled Input computes, and
 * a tenant statement on the Input's own channel must reach them.
 * ------------------------------------------------------------------------ */

// P-88: the composed Input keeps its own root part, so each field's shell is
// reached through the class door (the caller class lands on the field wrapper).
const FIELD_TARGETS = {
  rename: '#rename .ds-saved-views__input > .ds-input-shell',
  create: '#create .ds-saved-views__create-input > .ds-input-shell',
  plain: '#plain input',
} as const;

const TENANT_INPUT_RING = '0 0 0 3px rgb(200, 0, 100)';

interface FieldReading {
  readonly focused: boolean;
  readonly boxShadow: string;
  readonly outlineStyle: string;
  readonly outlineWidth: string;
  readonly outlineColor: string;
  readonly outlineOffset: string;
}

/** The three fields as the engines render them; the focus stamp is left to the page. */
function fieldMarkup(): string {
  const props = {
    views,
    activeViewId: 'all',
    onViewSelect: noop,
    onViewRename: noop,
    onViewCreate: noop,
    allowRename: true,
    allowCreate: true,
  };
  const unstamped = (html: string) => html.replace(/ data-state="[^"]*focus[^"]*"/g, '');

  const renaming = render(
    <EngineProvider defaultEngine="modern">
      <ModernSavedViewsBar {...props} />
    </EngineProvider>,
  );
  act(() => {
    fireEvent.click(screen.getByLabelText('Active only options'));
  });
  act(() => {
    fireEvent.click(screen.getByText('Rename'));
  });
  const rename = unstamped(renaming.container.innerHTML);
  cleanup();

  const creating = render(
    <EngineProvider defaultEngine="modern">
      <ModernSavedViewsBar {...props} />
    </EngineProvider>,
  );
  act(() => {
    fireEvent.click(screen.getByTestId('create-view-button'));
  });
  const create = unstamped(creating.container.innerHTML);
  cleanup();

  const plain = renderToStaticMarkup(
    <EngineProvider defaultEngine="modern">
      <ModernInput variant="unstyled" size="sm" aria-label="Plain unstyled" value="" onChange={noop} />
    </EngineProvider>,
  );

  return `<section id="rename">${rename}</section><section id="create">${create}</section><section id="plain">${plain}</section>`;
}

async function fieldReadings(
  arms: Readonly<Record<string, { decisions: Readonly<Record<string, unknown>>; tenantRing?: string }>>,
): Promise<Record<string, Record<keyof typeof FIELD_TARGETS, FieldReading>>> {
  const html = fieldMarkup();
  const browser = await chromiumDriver().launch();
  try {
    const context = await browser.newContext();
    const out: Record<string, Record<keyof typeof FIELD_TARGETS, FieldReading>> = {};
    for (const [label, arm] of Object.entries(arms)) {
      const page = await context.newPage();
      const mounted = await mountArm('rottay', arm.decisions as never);
      await page.setContent('<!doctype html><html><head></head><body></body></html>');
      await page.addStyleTag({ content: resolvedBaseCss() });
      await page.addStyleTag({ content: mounted.css });
      out[label] = (await page.evaluate(
        ({ rootAttributes, html, selectors, tenantRing }: { rootAttributes: Record<string, string>; html: string; selectors: Record<string, string>; tenantRing: string | null }) => {
          for (const [name, value] of Object.entries(rootAttributes)) {
            document.documentElement.setAttribute(name, value);
          }
          const host = document.createElement('div');
          host.setAttribute('style', 'background: var(--ds-color-bg-primary); color: var(--ds-color-text-primary); padding: 24px;');
          if (tenantRing) host.style.setProperty('--ds-input-focus-ring', tenantRing);
          host.innerHTML = html;
          document.body.append(host);
          const readings: Record<string, unknown> = {};
          for (const [id, selector] of Object.entries(selectors)) {
            const element = host.querySelector(selector) as HTMLElement;
            element.focus();
            // The Input engine stamps `focused` on focus; static markup carries no React.
            element.setAttribute('data-state', 'focused focus-visible');
            document.getAnimations().forEach((animation) => animation.finish());
            const computed = getComputedStyle(element);
            readings[id] = {
              focused: document.activeElement === element,
              boxShadow: computed.boxShadow,
              outlineStyle: computed.outlineStyle,
              outlineWidth: computed.outlineWidth,
              outlineColor: computed.outlineColor,
              outlineOffset: computed.outlineOffset,
            };
            element.removeAttribute('data-state');
            element.blur();
          }
          return readings;
        },
        { rootAttributes: mounted.rootAttributes, html, selectors: FIELD_TARGETS, tenantRing: arm.tenantRing ?? null },
      )) as Record<keyof typeof FIELD_TARGETS, FieldReading>;
      await page.close();
    }
    return out;
  } finally {
    await browser.close();
  }
}

/** What the field paints as a focus indicator; an unpainted outline keeps the ink it inherits. */
function indicator(reading: FieldReading): Record<string, string> {
  return reading.outlineStyle === 'none'
    ? { boxShadow: reading.boxShadow, outlineStyle: 'none' }
    : {
        boxShadow: reading.boxShadow,
        outlineStyle: reading.outlineStyle,
        outlineWidth: reading.outlineWidth,
        outlineColor: reading.outlineColor,
        outlineOffset: reading.outlineOffset,
      };
}

describe('saved-views composed fields', () => {
  it('compute what a plain unstyled Input computes under every focus signature, and a tenant ring wins', async () => {
    const readings = await fieldReadings({
      ring: { decisions: {} },
      underline: { decisions: { 'states.focus-style': 'underline' } },
      glow: { decisions: { 'states.focus-style': 'glow' } },
      tenant: { decisions: { 'states.focus-style': 'glow' }, tenantRing: TENANT_INPUT_RING },
    });

    for (const [arm, fields] of Object.entries(readings)) {
      expect(fields.plain.focused, `${arm} plain really holds focus`).toBe(true);
      expect(fields.plain.boxShadow, `${arm} plain signature`).not.toBe('none');
      for (const id of ['rename', 'create'] as const) {
        expect(fields[id].focused, `${arm} ${id} really holds focus`).toBe(true);
        // One author: no family rule may add to or void what the Input paints.
        expect(indicator(fields[id]), `${arm} ${id} equals the plain unstyled Input`).toEqual(indicator(fields.plain));
        expect(
          fields[id].outlineStyle === 'none' || fields[id].outlineColor === 'rgba(0, 0, 0, 0)',
          `${arm} ${id} paints no solid outline`,
        ).toBe(true);
      }
    }

    const signatures = [readings.ring.create.boxShadow, readings.underline.create.boxShadow, readings.glow.create.boxShadow];
    expect(new Set(signatures).size, 'the three signatures differ').toBe(3);
    const colours = (shadow: string) => shadow.match(/(?:rgba?|color)\([^)]*\)/g) ?? [];
    const geometry = (shadow: string) => shadow.replace(/(?:rgba?|color)\([^)]*\)/g, '<colour>');
    expect(geometry(readings.underline.create.boxShadow)).toBe(
      '<colour> 0px -2px 0px 0px inset, <colour> 0px -3px 0px 0px inset',
    );
    expect(geometry(readings.glow.create.boxShadow)).toBe(
      '<colour> 0px 0px 0px 1px, <colour> 0px 0px 0px 1px inset, <colour> 0px 0px 12px 2px',
    );
    // The inner layer is the ground, never a second stroke of the focus colour.
    const [line, band] = colours(readings.underline.create.boxShadow);
    const [glowRing, hairline] = colours(readings.glow.create.boxShadow);
    expect(band).not.toBe(line);
    expect(hairline).toBe(band);
    expect(glowRing).toBe(line);

    // The Input's own tenant channel outranks the signature on the composed fields too.
    expect(readings.tenant.rename.boxShadow).toBe('rgb(200, 0, 100) 0px 0px 0px 3px');
    expect(readings.tenant.create.boxShadow).toBe('rgb(200, 0, 100) 0px 0px 0px 3px');
  }, 180_000);
});
