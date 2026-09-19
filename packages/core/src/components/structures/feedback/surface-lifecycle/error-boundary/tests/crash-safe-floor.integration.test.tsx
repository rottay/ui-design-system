/**
 * The crash-safe fallback in a real browser, under R4's behaviour arms.
 *
 * The floor exists for one situation: the design system itself is the thing
 * that failed. So every probe below removes something the boundary is supposed
 * to survive without -- the stylesheet, the providers, both -- and measures
 * what the user is actually left with: a legible message in either mode, a
 * retry control a keyboard can reach and press, and no stray literal once the
 * governed channels are back.
 */
import React from 'react';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { mountArm, resolvedBaseCss } from '@tests/support/family-causality';
import { DefaultSurfaceErrorFallback } from '..';

const ROOT = ".ds-surface-lifecycle-error[data-part='root']";
const ACTION = ".ds-surface-lifecycle-error [data-part='action']";

/** The floor's literals, per mode, as the browser reports them. */
const LIGHT = {
  background: 'rgb(254, 242, 242)',
  foreground: 'rgb(153, 27, 27)',
  border: 'rgb(252, 165, 165)',
} as const;
const DARK = {
  background: 'rgb(42, 18, 21)',
  foreground: 'rgb(252, 168, 165)',
  border: 'rgb(140, 58, 66)',
} as const;

/**
 * The boundary's own markup with NO provider in the tree: no DesignSystemProvider,
 * no I18nProvider, no tenant. React 19 renders no error boundary on the server,
 * so the fallback is mounted directly; the catch path is covered by the unit suite.
 */
const MARKUP = renderToStaticMarkup(
  <DefaultSurfaceErrorFallback
    surfaceName="billing"
    error={new Error('quota exceeded')}
    onRetry={() => undefined}
  />,
);

function channels(value: string): readonly number[] {
  const parts = value.match(/[\d.]+/g);
  if (!parts || parts.length < 3) throw new Error(`not an rgb colour: ${value}`);
  return parts.slice(0, 3).map(Number);
}

/** WCAG 2 relative-luminance contrast, computed from what the browser painted. */
function contrast(a: string, b: string): number {
  const luminance = (value: string) =>
    channels(value).reduce((total, part, index) => {
      const srgb = part / 255;
      const linear = srgb <= 0.03928 ? srgb / 12.92 : ((srgb + 0.055) / 1.055) ** 2.4;
      return total + linear * [0.2126, 0.7152, 0.0722][index];
    }, 0);
  const [high, low] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (high + 0.05) / (low + 0.05);
}

interface ProbePage {
  setContent(html: string): Promise<void>;
  addStyleTag(options: { content: string }): Promise<unknown>;
  evaluate<R, A>(fn: (arg: A) => R, arg: A): Promise<R>;
  keyboard: { press(key: string): Promise<void> };
  close(): Promise<void>;
}

interface ProbeBrowser {
  newPage(): Promise<ProbePage>;
  close(): Promise<void>;
}

function chromium(): { launch(): Promise<ProbeBrowser> } {
  const require = createRequire(resolve(import.meta.dirname, '../../../../../../../package.json'));
  for (const specifier of ['playwright', '@playwright/test']) {
    try {
      const module = require(specifier) as { chromium?: { launch(): Promise<ProbeBrowser> } };
      if (module.chromium) return module.chromium;
    } catch {
      // try the next specifier
    }
  }
  throw new Error('crash-safe floor: no Playwright chromium is resolvable');
}

interface Reading {
  readonly background: string;
  readonly foreground: string;
  readonly border: string;
  readonly actionTag: string;
  readonly actionType: string;
  readonly role: string;
  readonly text: string;
  readonly focusedAfterTab: string;
  readonly activatedByEnter: boolean;
  readonly focusOutline: string;
  /** The root's inline style text, verbatim, as the browser parsed it. */
  readonly inlineStyle: string;
}

interface ProbeOptions {
  readonly colorScheme: 'light' | 'dark';
  /** Empty for the failure-mode arms: the stylesheet is the thing that failed. */
  readonly stylesheets?: readonly string[];
  readonly rootAttributes?: Readonly<Record<string, string>>;
}

async function measure({ colorScheme, stylesheets = [], rootAttributes = {} }: ProbeOptions): Promise<Reading> {
  const browser = await chromium().launch();
  try {
    const page = await browser.newPage();
    await page.setContent('<!doctype html><html><head></head><body></body></html>');
    for (const content of stylesheets) await page.addStyleTag({ content });

    return await page.evaluate(
      async ({ markup, scheme, attributes, rootSelector, actionSelector }) => {
        for (const [name, value] of Object.entries(attributes)) {
          document.documentElement.setAttribute(name, value);
        }
        // The HOST declares its colour scheme. This is not the DS stylesheet.
        document.documentElement.style.colorScheme = scheme;
        document.body.innerHTML = markup;

        const root = document.querySelector(rootSelector) as HTMLElement;
        const action = document.querySelector(actionSelector) as HTMLElement;
        const style = getComputedStyle(root);

        // A produced channel computes in whatever space it was authored in
        // (oklab, color(srgb), ...). Round-trip every reading through a canvas
        // so the arms compare, and the contrast maths runs on, sRGB bytes.
        const context = document.createElement('canvas').getContext('2d')!;
        const toRgb = (value: string): string => {
          context.clearRect(0, 0, 1, 1);
          context.fillStyle = value;
          context.fillRect(0, 0, 1, 1);
          const [r, g, b] = context.getImageData(0, 0, 1, 1).data;
          return `rgb(${r}, ${g}, ${b})`;
        };

        let activatedByEnter = false;
        action.addEventListener('click', () => {
          activatedByEnter = true;
        });
        action.focus();
        const focused = document.activeElement as HTMLElement | null;
        const focusStyle = focused ? getComputedStyle(focused) : null;
        action.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));

        return {
          background: toRgb(style.backgroundColor),
          foreground: toRgb(style.color),
          border: toRgb(style.borderTopColor),
          actionTag: action.tagName,
          actionType: action.getAttribute('type') ?? '',
          role: root.getAttribute('role') ?? '',
          text: root.textContent ?? '',
          focusedAfterTab: focused?.getAttribute('data-part') ?? focused?.tagName ?? '',
          activatedByEnter,
          focusOutline: focusStyle ? `${focusStyle.outlineStyle} ${focusStyle.outlineWidth}` : '',
          inlineStyle: root.getAttribute('style') ?? '',
        };
      },
      { markup: MARKUP, scheme: colorScheme, attributes: rootAttributes, rootSelector: ROOT, actionSelector: ACTION },
    );
  } finally {
    await browser.close();
  }
}

/** Tab-reachability and real Enter activation, measured by the driver itself. */
async function keyboardWalk(): Promise<{ focusedAfterTab: string; activatedByEnter: boolean }> {
  const browser = await chromium().launch();
  try {
    const page = await browser.newPage();
    await page.setContent('<!doctype html><html><head></head><body></body></html>');
    await page.evaluate(({ markup, actionSelector }) => {
      document.body.innerHTML = markup;
      (window as unknown as { __activated: boolean }).__activated = false;
      document.querySelector(actionSelector)?.addEventListener('click', () => {
        (window as unknown as { __activated: boolean }).__activated = true;
      });
    }, { markup: MARKUP, actionSelector: ACTION });

    await page.keyboard.press('Tab');
    const focusedAfterTab = await page.evaluate(
      () => document.activeElement?.getAttribute('data-part') ?? document.activeElement?.tagName ?? '',
      null,
    );
    await page.keyboard.press('Enter');
    const activatedByEnter = await page.evaluate(
      () => (window as unknown as { __activated: boolean }).__activated,
      null,
    );
    return { focusedAfterTab, activatedByEnter };
  } finally {
    await browser.close();
  }
}

describe('crash-safe fallback: stylesheet and providers absent', () => {
  it('is readable in light mode with no stylesheet at all', async () => {
    const reading = await measure({ colorScheme: 'light' });

    expect(reading.background).toBe(LIGHT.background);
    expect(reading.foreground).toBe(LIGHT.foreground);
    expect(reading.border).toBe(LIGHT.border);
    // AAA for body text, computed from what the browser actually painted.
    expect(contrast(reading.foreground, reading.background)).toBeGreaterThanOrEqual(7);
    // A delineating edge: visibly distinct from the ground it frames.
    expect(contrast(reading.border, reading.background)).toBeGreaterThanOrEqual(1.5);
  }, 60000);

  it('is readable in dark mode: the per-mode pair is why it is light-dark()', async () => {
    const reading = await measure({ colorScheme: 'dark' });

    expect(reading.background).toBe(DARK.background);
    expect(reading.foreground).toBe(DARK.foreground);
    expect(reading.border).toBe(DARK.border);
    expect(contrast(reading.foreground, reading.background)).toBeGreaterThanOrEqual(7);
    expect(contrast(reading.border, reading.background)).toBeGreaterThanOrEqual(1.5);
    // A light-only fallback would have painted the light ground here, at the
    // 1.7-2.5:1 the spec rejects. Both halves of the pair are load-bearing.
    expect(reading.background).not.toBe(LIGHT.background);
    expect(contrast(DARK.foreground, LIGHT.background)).toBeLessThan(3);
  }, 60000);

  it('carries the three named properties on its root, and nothing more', async () => {
    const reading = await measure({ colorScheme: 'light' });
    const declared = reading.inlineStyle
      .split(/;(?![^(]*\))/)
      .map((declaration) => declaration.split(':')[0]?.trim())
      .filter(Boolean);

    expect(declared.sort()).toEqual(['background-color', 'border', 'color']);
    for (const channel of ['-bg', '-color', '-border']) {
      expect(reading.inlineStyle).toContain(`var(--ds-surface-lifecycle-error${channel},`);
    }
    // Both halves of the documented per-mode pair, once per property.
    expect(reading.inlineStyle.match(/light-dark\(/g)).toHaveLength(3);
  }, 60000);

  it('announces the failure with no i18n provider and no stylesheet', async () => {
    const reading = await measure({ colorScheme: 'light' });

    expect(reading.role).toBe('alert');
    expect(reading.text).toContain('billing encountered an error');
    expect(reading.text).toContain('quota exceeded');
    expect(reading.text).toContain('Try again');
  }, 60000);

  it('keeps retry focusable and keyboard-operable with nothing loaded', async () => {
    const reading = await measure({ colorScheme: 'light' });
    const walk = await keyboardWalk();

    // Retry is a real button, so the UA gives it focus and Enter activation
    // without any stylesheet or provider to supply them.
    expect(reading.actionTag).toBe('BUTTON');
    expect(reading.actionType).toBe('button');
    expect(reading.focusedAfterTab).toBe('action');
    expect(reading.focusOutline).not.toMatch(/^none/);
    expect(walk.focusedAfterTab).toBe('action');
    expect(walk.activatedByEnter).toBe(true);
  }, 60000);
});

describe('crash-safe fallback: healthy tree', () => {
  it('lets a governed channel override reach the boundary, so no literal renders', async () => {
    const override = `:root {
      --ds-surface-lifecycle-error-bg: rgb(1, 2, 3);
      --ds-surface-lifecycle-error-color: rgb(4, 5, 6);
      --ds-surface-lifecycle-error-border: rgb(7, 8, 9);
    }`;
    const reading = await measure({ colorScheme: 'light', stylesheets: [override] });

    expect(reading.background).toBe('rgb(1, 2, 3)');
    expect(reading.foreground).toBe('rgb(4, 5, 6)');
    expect(reading.border).toBe('rgb(7, 8, 9)');
    const painted = [reading.background, reading.foreground, reading.border];
    for (const literal of [...Object.values(LIGHT), ...Object.values(DARK)]) {
      expect(painted).not.toContain(literal);
    }
  }, 60000);

  it('paints from the compiled first-party artifact, not the floor', async () => {
    const arm = await mountArm('rottay', {});
    const reading = await measure({
      colorScheme: 'light',
      stylesheets: [resolvedBaseCss(), arm.css],
      rootAttributes: arm.rootAttributes,
    });

    // The productive door produces the family's channels, so the floor's
    // literals are unreachable in a tree that still has its stylesheet.
    expect(reading.background).not.toBe(LIGHT.background);
    expect(reading.foreground).not.toBe(LIGHT.foreground);
    expect(reading.border).not.toBe(LIGHT.border);
    expect(contrast(reading.foreground, reading.background)).toBeGreaterThanOrEqual(4.5);
  }, 60000);
});
