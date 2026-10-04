/**
 * The copy button and the keyboard-reachable scroll region paint keyboard focus
 * as the tenant signature `--ds-focus-ring`. The root clips the region, so its
 * signature rides an overlay hung from the root; forced colors keeps a
 * system-colour outline, drawn inside the clip on the region.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

const SKIN = readFileSync(
  resolve(process.cwd(), 'src/foundation/tokens/css/presentation/components/skin/code-block/index.css'),
  'utf8',
).replace(/\/\*[\s\S]*?\*\//g, '');

interface SkinRule {
  readonly selector: string;
  readonly body: string;
  readonly forced: boolean;
}

function normalise(text: string): string {
  return text.replace(/\s+/g, ' ').replace(/\( /g, '(').replace(/ \)/g, ')').trim();
}

/** Every style rule of the skin, with whether a forced-colors block holds it. */
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
          selector: prelude,
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
/** The selector list of every rule, split on its top-level commas only. */
const selectors = (rules: readonly SkinRule[]): string[] =>
  rules.flatMap((rule) => rule.selector.split(/,(?![^()]*\))/).map((selector) => selector.trim()));
const declares = (rule: SkinRule, declaration: string): boolean => rule.body.split(';').some((entry) => entry.trim() === declaration);

const ROOT = ".ds-code-block[data-part='root']";
const COPY = `${ROOT} [data-part='copy-button']:focus-visible`;
const SCROLL = `${ROOT} [data-part='scroll']:focus-visible`;
const OVERLAY = `${SCROLL}::before`;
const AUTHORED = RULES.filter((rule) => !rule.forced);
const FORCED = RULES.filter((rule) => rule.forced);

describe('code-block skin — keyboard focus wears the tenant focus signature', () => {
  it('paints the signature on the copy button and on the region overlay, and nowhere else', () => {
    expect(selectors(AUTHORED.filter((rule) => declares(rule, 'box-shadow: var(--ds-focus-ring)')))).toEqual([COPY, OVERLAY]);
    expect(AUTHORED.filter((rule) => rule.selector.includes(':focus-visible') && /box-shadow/.test(rule.body)).length).toBe(2);
  });

  it('hangs the region overlay from the root, inset by the signature reach, out of the pointer path', () => {
    expect(declares(AUTHORED.find((rule) => rule.selector === ROOT && /position/.test(rule.body))!, 'position: relative')).toBe(true);
    const overlay = AUTHORED.find((rule) => rule.selector === OVERLAY)!;
    for (const declaration of [
      'position: absolute',
      'inset: calc(var(--ds-focus-ring-offset) + var(--ds-focus-ring-width))',
      "content: ''",
      'pointer-events: none',
    ]) {
      expect(declares(overlay, declaration), declaration).toBe(true);
    }
  });

  it('never draws focus as a solid outline or a hand-built ring outside forced colors', () => {
    const focus = AUTHORED.filter((rule) => rule.selector.includes(':focus-visible'));
    expect(selectors(focus)).toEqual([COPY, SCROLL, OVERLAY]);
    for (const rule of focus) {
      expect(rule.body, rule.selector).not.toMatch(/--ds-focus-ring-color|--ds-color-primary|outline: none/);
    }
    for (const selector of [COPY, SCROLL]) {
      expect(focus.find((rule) => rule.selector === selector)!.body).toMatch(/outline: var\(--ds-focus-ring-width\) solid transparent/);
    }
  });

  it('keeps a system-colour outline in forced colors, inside the clip on the region', () => {
    const outlined = FORCED.filter((rule) => declares(rule, 'outline: 2px solid Highlight'));
    expect(selectors(outlined)).toEqual([COPY, SCROLL]);
    expect(declares(outlined[0]!, 'box-shadow: none')).toBe(true);
    expect(FORCED.filter((rule) => rule.selector === SCROLL && declares(rule, 'outline-offset: -2px')).length).toBe(1);
  });
});
