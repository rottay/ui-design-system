/**
 * A focused detail-panel action keeps the Button's focus ring.
 *
 * The pattern lifts its primary action with an elevation shadow; that shadow
 * shares `box-shadow` with the ring, so a lift written as a plain replacement
 * erased the ring on keyboard focus. The lift composes after the ring and
 * steps aside where the scope's elevation lowers to `none` (the flat posture),
 * because a `none` layer invalidates the whole list and would drop the ring too.
 *
 * Measured in Chromium through the productive document door.
 */
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeAll, describe, expect, it } from 'vitest';

import ModernButton from '../../../../primitives/inputs/button/engines/modern';
import ModernDetailPanel from '../engines/modern';
import {
  FIRST_PARTY_VERTICALS as VERTICALS,
  mountArm,
  resolvedBaseCss,
  type ProbeDecisions,
  type ProbeVertical,
} from '@tests/support/family-causality';

type Mode = 'light' | 'dark';
type Variant = 'primary' | 'danger';

interface Reading {
  readonly panel: string;
  readonly ring: string;
  readonly lift: string;
  readonly focused: boolean;
}

const VARIANTS: readonly Variant[] = ['primary', 'danger'];

const panelMarkup = renderToStaticMarkup(
  <ModernDetailPanel
    data={{ id: 'record-1' }}
    title="Record"
    actions={[
      { key: 'save', label: 'Save', variant: 'primary', onClick: () => undefined },
      { key: 'remove', label: 'Remove', variant: 'danger', onClick: () => undefined },
    ]}
  />,
);

const referenceMarkup = VARIANTS.map((variant) =>
  renderToStaticMarkup(
    <span data-reference={variant}>
      <ModernButton variant={variant} size="sm">Reference</ModernButton>
    </span>,
  ),
).join('');

function chromium(): { launch(): Promise<any> } {
  const required = createRequire(resolve(process.cwd(), 'package.json'));
  for (const specifier of ['playwright', '@playwright/test']) {
    try {
      const module = required(specifier) as { chromium?: { launch(): Promise<any> } };
      if (module.chromium) return module.chromium;
    } catch {
      // try the next driver
    }
  }
  throw new Error('detail-panel focus-ring: no Playwright chromium is resolvable');
}

interface Case {
  readonly key: string;
  readonly vertical: ProbeVertical;
  readonly mode: Mode;
  readonly decisions: ProbeDecisions;
}

const CASES: readonly Case[] = [
  ...VERTICALS.flatMap((vertical) =>
    (['light', 'dark'] as const).map((mode) => ({ key: `${vertical} ${mode}`, vertical, mode, decisions: {} })),
  ),
  ...(['light', 'dark'] as const).map((mode) => ({
    key: `bithire ${mode} flat`,
    vertical: 'bithire' as ProbeVertical,
    mode,
    decisions: { 'surfaces.elevation-posture': 'flat' } as ProbeDecisions,
  })),
];

const readings: Record<string, Record<Variant, Reading>> = {};

beforeAll(async () => {
  const browser = await chromium().launch();
  try {
    const context = await browser.newContext();
    const base = resolvedBaseCss();
    for (const item of CASES) {
      const arm = await mountArm(item.vertical, item.decisions);
      const page = await context.newPage();
      try {
        await page.setContent('<!doctype html><html><head></head><body></body></html>');
        await page.addStyleTag({ content: base });
        await page.addStyleTag({ content: arm.css });
        readings[item.key] = await page.evaluate(
          ({ rootAttributes, mode, panel, reference, variants }: {
            rootAttributes: Record<string, string>;
            mode: Mode;
            panel: string;
            reference: string;
            variants: Variant[];
          }) => {
            for (const [name, value] of Object.entries(rootAttributes)) {
              document.documentElement.setAttribute(name, value);
            }
            document.documentElement.setAttribute('data-theme', mode);
            document.documentElement.classList.toggle('dark', mode === 'dark');
            const host = document.createElement('div');
            host.innerHTML = panel + reference;
            document.body.append(host);
            const probe = document.createElement('div');
            probe.style.boxShadow = 'var(--ds-elevation-2)';
            host.append(probe);
            const lift = getComputedStyle(probe).boxShadow;

            const focusShadow = (button: HTMLElement): { shadow: string; focused: boolean } => {
              button.setAttribute('data-state', 'focused focus-visible');
              button.focus();
              const shadow = getComputedStyle(button).boxShadow;
              const focused = document.activeElement === button;
              button.blur();
              button.removeAttribute('data-state');
              return { shadow, focused };
            };

            const out = {} as Record<Variant, { panel: string; ring: string; lift: string; focused: boolean }>;
            for (const variant of variants) {
              const action = host.querySelector<HTMLElement>(
                `[data-part='action-button'][data-variant='${variant}'] > .ds-button`,
              )!;
              const referenceButton = host.querySelector<HTMLElement>(`[data-reference='${variant}'] .ds-button`)!;
              const measured = focusShadow(action);
              const ring = focusShadow(referenceButton).shadow;
              out[variant] = { panel: measured.shadow, ring, lift, focused: measured.focused };
            }
            return out;
          },
          {
            rootAttributes: arm.rootAttributes,
            mode: item.mode,
            panel: panelMarkup,
            reference: referenceMarkup,
            variants: [...VARIANTS],
          },
        );
      } finally {
        await page.close();
      }
    }
  } finally {
    await browser.close();
  }
}, 120_000);

describe('DetailPanel focused actions keep the Button focus ring (Chromium)', () => {
  for (const item of CASES) {
    for (const variant of VARIANTS) {
      it(`${item.key}: the focused ${variant} action paints the ring`, () => {
        const reading = readings[item.key]![variant];
        expect(reading.focused).toBe(true);
        expect(reading.ring).not.toBe('none');
        expect(reading.panel.startsWith(reading.ring)).toBe(true);
      });
    }

    it(`${item.key}: the focused primary action keeps its lift beside the ring`, () => {
      const reading = readings[item.key]!.primary;
      if (reading.lift === 'none') {
        expect(reading.panel).toBe(reading.ring);
      } else {
        expect(reading.panel).toBe(`${reading.ring}, ${reading.lift}`);
      }
    });
  }

  it('the flat posture is exercised: elevation lowers to none there', () => {
    expect(readings['bithire light flat']!.primary.lift).toBe('none');
    expect(readings['bithire light']!.primary.lift).not.toBe('none');
  });
});
