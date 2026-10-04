/**
 * The link and the two keyboard-reachable scroll regions paint keyboard focus as
 * the tenant signature `--ds-focus-ring`, behind the family's raw escape hatch
 * `--ds-markdown-focus-ring`, and keep a system-colour outline in forced colors.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

const SKIN = readFileSync(
  resolve(process.cwd(), 'src/foundation/tokens/css/presentation/components/skin/markdown-view/index.css'),
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

const ROOT = ".ds-markdown-view[data-part='root']";
const LINK = `${ROOT} a[data-part='link']:focus-visible`;
const TABLE = `${ROOT} [data-part='table-wrapper']:focus-visible`;
const FENCE = `${ROOT} [data-part='code-block-pre']:focus-visible`;
const SIGNATURE = 'box-shadow: var(--ds-markdown-focus-ring, var(--ds-focus-ring))';
const AUTHORED = RULES.filter((rule) => !rule.forced);
const FORCED = RULES.filter((rule) => rule.forced);

describe('markdown-view skin — keyboard focus wears the tenant focus signature', () => {
  it('paints the signature on the link and both scroll regions, and nowhere else', () => {
    expect(selectors(AUTHORED.filter((rule) => declares(rule, SIGNATURE)))).toEqual([LINK, TABLE, FENCE]);
    expect(selectors(AUTHORED.filter((rule) => /box-shadow/.test(rule.body)))).toEqual([LINK, TABLE, FENCE]);
  });

  it('never draws focus as a solid outline or a hand-built ring outside forced colors', () => {
    const focus = AUTHORED.filter((rule) => rule.selector.includes(':focus-visible'));
    expect(selectors(focus)).toEqual([LINK, TABLE, FENCE]);
    for (const rule of focus) {
      expect(rule.body, rule.selector).toMatch(/outline: var\(--ds-focus-ring-width\) solid transparent/);
      expect(rule.body, rule.selector).not.toMatch(/--ds-focus-ring-color|--ds-color-primary|outline: none/);
    }
  });

  it('keeps a system-colour outline on every focus target in forced colors', () => {
    const outlined = FORCED.filter((rule) => declares(rule, 'outline: 2px solid Highlight'));
    expect(selectors(outlined)).toEqual([LINK, TABLE, FENCE]);
    for (const rule of outlined) expect(declares(rule, 'box-shadow: none'), rule.selector).toBe(true);
  });
});
