/**
 * The list-toolbar family in a real browser: every keypath the toolbar deriver
 * declares in `consumes` is exercised against the family's OWN computed paint
 * with a negative control -- including the focus signature, which is measured
 * under REAL DOM focus rather than a stamped attribute -- and axe holds beyond
 * the pinned debt.
 */
import React from 'react';
import { prerenderToNodeStream } from 'react-dom/static';
import { describe, expect, it } from 'vitest';

import { DesignSystemProvider } from '@/infrastructure/runtime/bootstrap';
import { firstPartyEngineVisual } from '@/infrastructure/compilers/runtime/theme';
import type { TenantConfig } from '@/foundation/contracts';
import ModernListToolbar from '../engines/modern';
import {
  AXE_SCOPES,
  FIRST_PARTY_VERTICALS as VERTICALS,
  auditAxe,
  axeDebt,
  describeCausality,
  mountArm,
  resolveChromium,
  resolvedBaseCss,
  seriousFindings,
} from '@tests/support/family-causality';

const noop = () => {};

const TENANT: TenantConfig = {
  slug: 'list-toolbar-causality',
  name: 'List toolbar causality',
  theme: 'base',
  locale: 'en',
  fallbackLocale: 'en',
  plan: 'enterprise',
  features: [],
  branding: { companyName: 'List toolbar causality' },
};

async function desktopMarkup(): Promise<string> {
  const { prelude } = await prerenderToNodeStream(
    <DesignSystemProvider
      tenantConfig={TENANT}
      forceEngine="modern"
      engineVisual={firstPartyEngineVisual('rottay', 'modern')}
      skipCssLoading
      ssrViewport="desktop"
    >
      <ModernListToolbar
        title="Candidates"
        totalCount={42}
        search=""
        onSearchChange={noop}
        filterPills={[
          {
            key: 'status',
            label: 'Status',
            value: 'active',
            options: [
              { label: 'All', value: 'all' },
              { label: 'Active', value: 'active' },
            ],
          },
        ]}
        activeFilters={{ status: 'active' }}
        activeFilterCount={1}
        onFilterChange={noop}
        onClearFilters={noop}
        viewMode="list"
        onViewModeChange={noop}
        density="comfortable"
        onDensityChange={noop}
        primaryAction={{ label: 'Add candidate', onClick: noop }}
      />
    </DesignSystemProvider>,
  );
  let html = '';
  for await (const chunk of prelude) html += String(chunk);
  return html;
}

const markup = await desktopMarkup();

const SHELL = ".ds-pattern-list-toolbar[data-part='root']";
const ROW = '.ds-list-toolbar__main-row';
const TRIGGER = '.ds-list-toolbar__filter-trigger';
const TITLE = '.ds-list-toolbar__title';

describeCausality({
  family: 'list-toolbar',
  markup,
  targets: [
    { id: 'triggerInk', selector: TRIGGER, property: 'color' },
    { id: 'rowPad', selector: ROW, property: 'padding-left' },
    { id: 'shellCorner', selector: SHELL, property: 'border-top-left-radius' },
    { id: 'titleSize', selector: TITLE, property: 'font-size' },
  ],
  decisions: {
    // `consumes: palette.*` -- the filter trigger's ink is the seeded primary.
    'palette.seeds': { value: { primary: '#2F6B9A' }, moves: ['triggerInk'], holds: 'rowPad', in: VERTICALS },
    // The toolbar deriver does not declare `density`; the row rhythm is covered anyway.
    'density.mode': { value: 'spacious', moves: ['rowPad'], holds: 'triggerInk', in: VERTICALS },
    // `consumes: surfaces.radiusScale` -- the shell's own corner.
    'shape.radius-scale': { value: 1.2, moves: ['shellCorner'], holds: 'rowPad', in: VERTICALS },
    // `consumes: typography.roles` -- the toolbar title is the family's type step.
    'typography.scale': { value: 1.08, moves: ['titleSize'], holds: 'shellCorner', in: VERTICALS },
    // `consumes: surfaces.focusStyle` needs real focus to paint; measured below.
  },
});

/* ---------------------------------------------------------------------------
 * The focus signature, under real focus.
 *
 * The focused control carries the signature and the shell around it wears
 * none, so the probe focuses the filter trigger for real, waits for the
 * transition to land, and reads the trigger's and the shell's box-shadow back.
 * A ring read at t=0 is the transition's start, not the family's paint.
 * ------------------------------------------------------------------------ */

function chromiumDriver() {
  return resolveChromium();
}

interface FocusReading {
  readonly focused: boolean;
  readonly focusVisible: boolean;
  readonly focusWithin: boolean;
  readonly restRing: string;
  readonly focusRing: string;
  readonly shellRest: string;
  readonly shellFocus: string;
  readonly rowPad: string;
}

async function focusReading(
  decisions: Readonly<Record<string, unknown>>,
): Promise<FocusReading> {
  const browser = await chromiumDriver().launch();
  try {
    const context = await browser.newContext();
    const page = await context.newPage();
    const arm = await mountArm('rottay', decisions as never);
    await page.setContent('<!doctype html><html><head></head><body></body></html>');
    await page.addStyleTag({ content: resolvedBaseCss() });
    await page.addStyleTag({ content: arm.css });
    return (await page.evaluate(
      async ({ rootAttributes, html, shell, trigger, row }: {
        rootAttributes: Record<string, string>;
        html: string;
        shell: string;
        trigger: string;
        row: string;
      }) => {
        for (const [name, value] of Object.entries(rootAttributes)) {
          document.documentElement.setAttribute(name, value);
        }
        const host = document.createElement('div');
        host.setAttribute('style', 'background: var(--ds-color-bg-primary); color: var(--ds-color-text-primary); padding: 16px;');
        host.innerHTML = html;
        document.body.append(host);
        const root = host.querySelector(shell) as HTMLElement;
        const control = host.querySelector(trigger) as HTMLElement;
        const restRing = getComputedStyle(control).boxShadow;
        const shellRest = getComputedStyle(root).boxShadow;
        control.focus();
        // The ring crosses on the family's motion channel; read where it lands.
        await new Promise((settle) => setTimeout(settle, 900));
        return {
          focused: document.activeElement === control,
          focusVisible: control.matches(':focus-visible'),
          focusWithin: root.matches(':focus-within'),
          restRing,
          focusRing: getComputedStyle(control).boxShadow,
          shellRest,
          shellFocus: getComputedStyle(root).boxShadow,
          rowPad: getComputedStyle(host.querySelector(row) as HTMLElement).paddingLeft,
        };
      },
      { rootAttributes: arm.rootAttributes, html: markup, shell: SHELL, trigger: TRIGGER, row: ROW },
    )) as FocusReading;
  } finally {
    await browser.close();
  }
}

describe('list-toolbar declared consumes', () => {
  it('moves the focused control ring with the focus signature, leaves the shell unpainted and holds the row geometry', async () => {
    const base = await focusReading({});
    const glow = await focusReading({ 'states.focus-style': 'glow' });
    // The reading is a real focus state, not a stamped attribute.
    expect(base.focused, 'the filter trigger really holds focus').toBe(true);
    expect(base.focusVisible, 'the filter trigger really matches :focus-visible').toBe(true);
    expect(base.focusWithin, 'the shell really matches :focus-within').toBe(true);
    // The control really changes under focus: the probe is not reading a resting value.
    expect(base.focusRing).not.toBe(base.restRing);
    // `consumes: surfaces.focusStyle` -- the focused control's ring follows the signature.
    expect(glow.focusRing).not.toBe(base.focusRing);
    // One indicator: the shell keeps its resting shadow while a control inside it holds focus.
    expect(base.shellFocus).toBe(base.shellRest);
    expect(glow.shellFocus).toBe(glow.shellRest);
    // Negative control: the row rhythm is geometry, not focus.
    expect(glow.rowPad).toBe(base.rowPad);
  }, 180_000);
});

const AXE_DEBT: Record<string, Readonly<Record<string, readonly string[]>>> = {};

describe('list-toolbar accessibility', () => {
  it('renders the desktop row the probes read', () => {
    expect(markup).toContain('data-container-layout="full"');
    expect(markup).toContain('data-part="main-row"');
  });

  it('carries no serious axe finding beyond the pinned debt', async () => {
    const measured: Record<string, Readonly<Record<string, readonly string[]>>> = {};
    for (const scope of AXE_SCOPES) {
      const debt = axeDebt(seriousFindings(await auditAxe({ ...scope, markup })));
      if (Object.keys(debt).length > 0) measured[`${scope.vertical} ${scope.theme}`] = debt;
    }
    expect(measured).toEqual(AXE_DEBT);
  }, 300_000);
});
