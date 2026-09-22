/**
 * The global forced-colors floor.
 *
 * Its three jobs are the never-branded roles, structure survival where the DS
 * draws a boundary with background or shadow only, and forced-color-adjust
 * discipline. Everything else stays with the 220 per-family blocks, which is
 * what the layer and the specificity law below guarantee.
 */

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

import {
  code,
  declaredChannels,
  format,
  isZero,
  ruleSelectors,
  specificity,
  splitSelectorList,
} from '../support/selector';

const CSS_ROOT = 'src/foundation/tokens/css';

const read = (relative: string): string => readFileSync(resolve(process.cwd(), relative), 'utf8');

const floor = read(`${CSS_ROOT}/foundation/a11y/forced-colors/index.css`);
const entrypoint = read(`${CSS_ROOT}/facade/entrypoints/base/index.css`);

const selectors = ruleSelectors(floor);

describe('forced-colors floor', () => {
  it('computes to specificity (0,0,0) on every selector it declares', () => {
    expect(selectors.length, 'the floor declares no rule at all').toBeGreaterThanOrEqual(7);
    for (const selector of selectors) {
      for (const one of splitSelectorList(selector)) {
        expect(isZero(specificity(one)), `${one} is ${format(specificity(one))}, not (0,0,0)`).toBe(
          true,
        );
      }
    }
  });

  it('drill: the zeros come from :where(), not from a blind instrument', () => {
    // Same selectors with the device removed must measure non-zero, and the
    // instrument must reproduce the two numbers the root-guard class turns on.
    for (const selector of selectors) {
      for (const one of splitSelectorList(selector.replaceAll(':where(', ':is('))) {
        expect(isZero(specificity(one)), `${one} measured (0,0,0) without :where()`).toBe(false);
      }
    }
    expect(specificity('html[lang]:lang(ar)')).toEqual({ a: 0, b: 2, c: 1 });
    expect(
      specificity(
        ":is(html[data-tenant='bithire'], :where([data-ds-root][data-vertical='bithire']))",
      ),
    ).toEqual({ a: 0, b: 1, c: 1 });
  });

  it('states CSS properties, never --ds-* channels', () => {
    // A channel set in a global block propagates into every reader, including
    // the families that correctly opt out. Properties on roles do not.
    expect(declaredChannels(floor)).toEqual([]);
  });

  it('is fenced to the Modern engine on every selector', () => {
    for (const selector of selectors) {
      for (const one of splitSelectorList(selector)) {
        expect(
          one,
          'Classic and Rustic are frozen; new floor content must not reach them',
        ).toContain('[data-engine="modern"]');
      }
    }
  });

  it('declares nothing outside @media (forced-colors: active)', () => {
    const atRules = [...code(floor).matchAll(/@[a-z-]+[^{;]*/g)].map((match) => match[0].trim());
    expect(atRules).toEqual(['@media (forced-colors: active)']);
    expect(code(floor).trimStart().startsWith('@media (forced-colors: active)')).toBe(true);
  });

  it('is imported into the LOWEST paint layer, so every per-family block wins over it', () => {
    const importLine = entrypoint
      .split('\n')
      .find((line) => line.includes('foundation/a11y/forced-colors/index.css'));
    expect(importLine, 'the floor is not imported at all').toBeDefined();
    expect(importLine).toContain('layer(rottay-tokens)');

    const order = splitSelectorList(/@layer ([^;]+);/.exec(code(entrypoint))?.[1] ?? '');
    for (const above of ['rottay-components', 'rottay-engines', 'rottay-responsive']) {
      expect(order.indexOf('rottay-tokens'), `rottay-tokens must sit below ${above}`).toBeLessThan(
        order.indexOf(above),
      );
      expect(order.indexOf(above)).toBeGreaterThan(-1);
    }
  });

  it('maps the never-branded roles, and the two the tree under-serves most', () => {
    const body = code(floor);
    for (const keyword of ['Highlight', 'HighlightText', 'GrayText', 'LinkText', 'VisitedText']) {
      expect(body, `${keyword} is not mapped`).toContain(keyword);
    }
    expect(body).toMatch(/:where\(a\[href\]\)\s*\{\s*color:\s*LinkText/);
    expect(body).toMatch(/:where\(a\[href\]:visited\)\s*\{\s*color:\s*VisitedText/);
  });

  it('restates a hairline where background and shadow are discarded', () => {
    expect(code(floor)).toContain('border: 1px solid ButtonBorder');
    for (const role of ['dialog', '[role="menu"]', '[role="listbox"]', '[data-part="surface"]']) {
      expect(code(floor)).toContain(role);
    }
  });

  it('asserts forced-color-adjust: auto and opts nothing out itself', () => {
    // The property is inherited, so asserting `auto` at the root leaves the
    // named allowlist as the only place `none` may appear.
    expect(code(floor)).toMatch(
      /:where\(html\[data-engine="modern"\]\)\s*\{\s*forced-color-adjust:\s*auto/,
    );
    expect(code(floor)).not.toContain('forced-color-adjust: none');

    // The allowlist is real: charts and brand marks are where `none` lives.
    expect(read(`${CSS_ROOT}/presentation/components/mark/index.css`)).toContain(
      'forced-color-adjust: none',
    );
    expect(read(`${CSS_ROOT}/presentation/components/skin/chart-pie/index.css`)).toContain(
      'forced-color-adjust: none',
    );
  });

  it('does not restate brand, tone or elevation, which the mode discards by design', () => {
    const body = code(floor);
    for (const property of ['box-shadow', 'backdrop-filter', 'background-image', 'filter:']) {
      expect(body, `${property} is an opt-out, not floor content`).not.toContain(property);
    }
    for (const selector of ['chart', 'rottay-mark', 'pictogram']) {
      expect(body, `${selector} owns its own block`).not.toContain(selector);
    }
  });
});
