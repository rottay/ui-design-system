/**
 * Every ADMITTED primary seed paints a focus ring its own canvas can show.
 *
 * The seed domain is open: `palette.seeds` admits `#FFFFFF`, and a ring taken
 * raw from that seed measured 1.00:1 on a white canvas -- a focused control
 * with no visible focus, reached through the supported customization door. The
 * pale non-extreme `#BBBBBB` measured 1.9198:1 the same way.
 *
 * The ring now resolves against the ground the scope actually renders on: the
 * preferred colour when it clears WCAG 2.2's 3:1 non-text floor (1.4.11), and
 * otherwise the nearest stop of the seed's OWN ramp, which is the same hue at
 * the lightness that ground can carry. So this suite asserts both halves: the
 * counterexamples clear the floor, and the six first-party cells are untouched.
 *
 * Measured in Chromium through the productive `documentThemeIntent ->
 * compileThemeIntent` door, like every other causality suite here.
 */
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeAll, describe, expect, it } from 'vitest';

import ModernButton from '../engines/modern';
import {
  FIRST_PARTY_VERTICALS as VERTICALS,
  mountArm,
  resolvedBaseCss,
  type ProbeDecisions,
  type ProbeVertical,
} from '@tests/support/family-causality';

/** WCAG 2.2 1.4.11: a focus indicator owes its own canvas 3:1. */
const RING_FLOOR = 3;

type Mode = 'light' | 'dark';

interface Reading {
  readonly ring: string;
  readonly ground: string;
  readonly ratio: number;
  readonly focused: boolean;
}

const markup = renderToStaticMarkup(<ModernButton variant="primary">Save changes</ModernButton>);

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
  throw new Error('focus-customization: no Playwright chromium is resolvable');
}

function luminance(color: string): number {
  const [r, g, b] = (color.match(/[\d.]+/g) ?? ['0', '0', '0']).slice(0, 3).map(Number).map((value) => {
    const channel = value / 255;
    return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r! + 0.7152 * g! + 0.0722 * b!;
}

function ratioOf(a: string, b: string): number {
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (light! + 0.05) / (dark! + 0.05);
}

interface Case {
  readonly key: string;
  readonly vertical: ProbeVertical;
  readonly mode: Mode;
  readonly decisions: ProbeDecisions;
}

const SEEDS = {
  white: { 'palette.seeds': { primary: '#FFFFFF' } },
  pale: { 'palette.seeds': { primary: '#BBBBBB' } },
} as const;

const CASES: readonly Case[] = [
  ...VERTICALS.flatMap((vertical) =>
    (['light', 'dark'] as const).map((mode) => ({ key: `${vertical} ${mode}`, vertical, mode, decisions: {} })),
  ),
  ...(['light', 'dark'] as const).flatMap((mode) =>
    (Object.keys(SEEDS) as (keyof typeof SEEDS)[]).map((seed) => ({
      key: `bithire ${mode} ${seed}`,
      vertical: 'bithire' as ProbeVertical,
      mode,
      decisions: SEEDS[seed] as ProbeDecisions,
    })),
  ),
];

const readings: Record<string, Reading> = {};

beforeAll(async () => {
  const browser = await chromium().launch();
  try {
    const context = await browser.newContext();
    const base = resolvedBaseCss();
    for (const item of CASES) {
      // Admission runs inside `mountArm`; a refused seed would throw here and
      // the suite would say so rather than silently skipping the case.
      const arm = await mountArm(item.vertical, item.decisions);
      const page = await context.newPage();
      try {
        await page.setContent('<!doctype html><html><head></head><body></body></html>');
        await page.addStyleTag({ content: base });
        await page.addStyleTag({ content: arm.css });
        const result = await page.evaluate(
          ({ rootAttributes, mode, html }: { rootAttributes: Record<string, string>; mode: Mode; html: string }) => {
            for (const [name, value] of Object.entries(rootAttributes)) {
              document.documentElement.setAttribute(name, value);
            }
            document.documentElement.setAttribute('data-theme', mode);
            document.documentElement.classList.toggle('dark', mode === 'dark');
            const host = document.createElement('div');
            host.setAttribute('style', 'background: var(--ds-color-bg-primary); color: var(--ds-color-text-primary); padding: 16px;');
            host.innerHTML = html;
            document.body.append(host);
            const button = host.querySelector('button')!;
            // The declared focus state the skin paints from, plus real DOM focus.
            button.setAttribute('data-state', 'focus-visible');
            button.focus();
            const shadow = getComputedStyle(button).boxShadow;
            const layers = shadow.match(/rgba?\([^)]+\)/g) ?? [];
            return {
              ring: layers.at(-1) ?? '',
              // The ACTUAL ground the scope resolved, read back off the host --
              // never a hardcoded white or black.
              ground: getComputedStyle(host).backgroundColor,
              focused: document.activeElement === button,
            };
          },
          { rootAttributes: arm.rootAttributes, mode: item.mode, html: markup },
        );
        expect(result.ring, `${item.key}: the ring has a reading`).not.toBe('');
        readings[item.key] = { ...result, ratio: ratioOf(result.ring, result.ground) };
      } finally {
        await page.close();
      }
    }
  } finally {
    await browser.close();
  }
}, 300_000);

/**
 * The N1 cells, as measured on the tree that closed it.
 *
 * `bithire dark` moved 5.02 -> 3.28 when that scope's dark block stopped
 * inheriting the light body's ground. The old figure was the ring `#3563EF`
 * measured against an inherited `#FFFFFF` -- a canvas a dark block never owns;
 * the cell now reads `#2A55E0` (the dark ramp's own 400 stop, re-derived
 * against the real ground) on `#0A0A0A`. The ring is adjacent to that ground,
 * not to the button's fill: the shadow's inner layer is a `bg-primary` spacer.
 * 3.2754 clears RING_FLOOR with margin, and the two dark counterexample cells
 * below prove the floor still MOVES a failing seed here, so this stop stands
 * as a compliant colour left as authored rather than as a waiver.
 */
const FIRST_PARTY_RATIOS: Readonly<Record<string, number>> = {
  'rottay light': 17.18,
  'rottay dark': 7.42,
  'bithire light': 5.55,
  'bithire dark': 3.28,
  'evnto light': 17.18,
  'evnto dark': 7.42,
};

describe('the focus ring clears its own floor on every admitted seed', () => {
  it('keeps the six first-party vertical x mode cells at their measured ratios', () => {
    for (const [key, expected] of Object.entries(FIRST_PARTY_RATIOS)) {
      const reading = readings[key]!;
      expect(reading.ratio, `${key}: ${reading.ring} on ${reading.ground}`).toBeCloseTo(expected, 1);
    }
  });

  it('clears 3:1 for both audited counterexample seeds, in both modes', () => {
    for (const key of ['bithire light white', 'bithire light pale', 'bithire dark white', 'bithire dark pale']) {
      const reading = readings[key]!;
      expect(reading.focused, `${key}: the button really holds focus`).toBe(true);
      expect(
        reading.ratio,
        `${key}: ${reading.ring} on ${reading.ground}`,
      ).toBeGreaterThanOrEqual(RING_FLOOR);
    }
  });

  it('moves a failing seed OFF the raw seed rather than waiving the floor', () => {
    // The derivation mutant the floor has to bite on: white-on-white cannot be
    // solved by painting the seed, so the ring must be a different colour AND
    // clear the floor. A waiver would pass the row above and fail this one.
    const white = readings['bithire light white']!;
    expect(white.ring).not.toBe('rgb(255, 255, 255)');
    expect(white.ground).toBe('rgb(255, 255, 255)');
    expect(white.ratio).toBeGreaterThanOrEqual(RING_FLOOR);

    const pale = readings['bithire light pale']!;
    expect(pale.ring).not.toBe('rgb(187, 187, 187)');
    expect(pale.ratio).toBeGreaterThanOrEqual(RING_FLOOR);
  });

  it('leaves a compliant seed exactly as authored', () => {
    // The other direction: the floor must not repaint a seed that already
    // clears it, or every tenant would lose its brand ring to the ramp.
    expect(readings['bithire light']!.ring).toBe('rgb(47, 91, 232)');
  });
});
