/**
 * The Tag's two focus stops, the clickable shell and the close control, wear
 * the tenant focus signature wherever `--ds-focus-ring` reaches, whether or not
 * the tag facade channel does, and keep a system-colour outline no thinner than
 * 2px in forced colors, where the box-shadow is dropped.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

const SKIN = readFileSync(
  resolve(process.cwd(), 'src/foundation/tokens/css/runtime/engines/modern/skin/tag/index.css'),
  'utf8',
).replace(/\/\*[\s\S]*?\*\//g, '');

interface SkinRule {
  readonly selectors: readonly string[];
  readonly body: string;
  readonly forced: boolean;
}

function normalise(text: string): string {
  return text.replace(/\s+/g, ' ').replace(/\( /g, '(').replace(/ \)/g, ')').trim();
}

function skinRules(css: string): SkinRule[] {
  const rules: SkinRule[] = [];
  const open: string[] = [];
  let start = 0;
  for (let index = 0; index < css.length; index += 1) {
    const char = css[index];
    if (char === '{') {
      open.push(normalise(css.slice(start, index)));
      start = index + 1;
    } else if (char === '}') {
      const prelude = open.pop() ?? '';
      if (!prelude.startsWith('@')) {
        rules.push({
          selectors: prelude.split(/,\s*(?![^(]*\))/).map((selector) => selector.trim()),
          body: normalise(css.slice(start, index)),
          forced: open.some((at) => at.includes('forced-colors: active')),
        });
      }
      start = index + 1;
    }
  }
  return rules;
}

const RULES = skinRules(SKIN);
const FOCUS = ":is([data-state~='focus-visible'], :focus-visible)";
const SHELL_FOCUS = `.rottay-tag-shell.rottay-tag-shell--modern[data-part='root'][data-clickable='true']${FOCUS}`;
const CLOSE_FOCUS = `.rottay-tag-shell.rottay-tag-shell--modern > [data-part='close']${FOCUS}`;

function declaration(rule: SkinRule, property: string): string | undefined {
  return new RegExp(`(?:^|[;\\s])${property}:\\s*([^;]+);`).exec(rule.body)?.[1]?.trim();
}

function focusRule(selector: string, forced: boolean): SkinRule {
  const found = RULES.filter((rule) => rule.forced === forced && rule.selectors.includes(selector));
  expect(found, `${selector} (forced: ${String(forced)})`).toHaveLength(1);
  return found[0]!;
}

/** The fallback a `var(--channel, <fallback>)` paint leaves when the channel is absent. */
function fallbackOf(paint: string | undefined, channel: string): string {
  const head = `var(${channel}, `;
  expect(paint?.startsWith(head) && paint.endsWith(')'), `${channel} leads the paint: ${String(paint)}`).toBe(true);
  return (paint ?? '').slice(head.length, -1);
}

describe('tag -- both focus stops wear the tenant focus signature', () => {
  it.each([
    ['shell', SHELL_FOCUS, '--ds-tag-focus-ring'],
    ['close', CLOSE_FOCUS, '--ds-tag-close-focus-ring'],
  ])('the %s falls back to the governed ring, never straight to a literal', (_part, selector, channel) => {
    const fallback = fallbackOf(declaration(focusRule(selector, false), 'box-shadow'), channel);
    expect(fallback).toMatch(/^var\(--ds-focus-ring, .+\)$/);
  });

  it('keeps the close literal only as the floor under the governed ring', () => {
    const fallback = fallbackOf(declaration(focusRule(CLOSE_FOCUS, false), 'box-shadow'), '--ds-tag-close-focus-ring');
    expect(fallback).toBe('var(--ds-focus-ring, 0 0 0 2px color-mix(in srgb, currentColor 26%, transparent))');
  });

  it.each([
    ['shell', SHELL_FOCUS],
    ['close', CLOSE_FOCUS],
  ])('floors the %s outline at 2px of Highlight in forced colors and drops the shadow', (_part, selector) => {
    const rule = focusRule(selector, true);
    expect(declaration(rule, 'outline')).toBe('max(2px, var(--ds-focus-ring-width, 2px)) solid Highlight');
    expect(declaration(rule, 'outline-offset')).toBe('var(--ds-focus-ring-offset, 2px)');
    expect(declaration(rule, 'box-shadow')).toBe('none');
  });
});
