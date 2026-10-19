/**
 * The linked value is the family's own keyboard indicator: its wrapper paints
 * the tenant signature `--ds-focus-ring` behind the kernel state twin and keeps
 * a system-colour outline in forced colors. The field's focus-within keyline
 * and border are a container cue, not the indicator, and stay as they were.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

const SKIN = readFileSync(
  resolve(process.cwd(), 'src/foundation/tokens/css/presentation/components/skin/record/index.css'),
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
const PARTS = ['field', 'field-grid', 'field-link-body'] as const;

/**
 * A selector as its part arm reads it: each own-block class door of a named
 * part -- the fold `:is([data-part='p'], .ds-record__p)` or the pair arm's
 * `.ds-record__p` -- reads back as `[data-part='p']`. Any other drift (a widened
 * `:is()`, a foreign block's class, a dropped compound) is left as written.
 */
function asPartSelector(selector: string): string {
  let read = selector;
  for (const part of PARTS) {
    const token = `[data-part='${part}']`;
    read = read
      .replace(new RegExp(`:is\\(\\[data-part=(['"])${part}\\1\\],\\s*\\.ds-record__${part}\\)`, 'g'), token)
      .replace(new RegExp(`\\.ds-record__${part}(?![\\w-])`, 'g'), token);
  }
  return read;
}

/** A rule's selector list, split on its top-level commas only and read through its class doors. */
const selectors = (rule: SkinRule): string[] => [
  ...new Set(rule.selector.split(/,(?![^()]*\))/).map((selector) => asPartSelector(selector.trim()))),
];
const readsAs = (rule: SkinRule, selector: string): boolean => {
  const read = selectors(rule);
  return read.length === 1 && read[0] === selector;
};
const declares = (rule: SkinRule, declaration: string): boolean => rule.body.split(';').some((entry) => entry.trim() === declaration);

const FIELD = ".ds-structure.ds-record[data-part='field']";
const LINK = `${FIELD} [data-part='field-link-body']:is([data-state~='focus-visible'], :focus-within)`;
const CELL = `.ds-structure.ds-record[data-part='field-grid'] > ${FIELD}:is([data-state~='focused'], :focus-within)`;
const AUTHORED = RULES.filter((rule) => !rule.forced);
const FORCED = RULES.filter((rule) => rule.forced);

describe('record skin — the linked value wears the tenant focus signature', () => {
  it('paints the signature on the link wrapper, and nowhere else', () => {
    const signed = AUTHORED.filter((rule) => declares(rule, 'box-shadow: var(--ds-focus-ring)'));
    expect(signed.flatMap(selectors)).toEqual([LINK]);
    expect(declares(signed[0]!, 'outline: var(--ds-focus-ring-width) solid transparent')).toBe(true);
    expect(declares(signed[0]!, 'outline-offset: var(--ds-focus-ring-offset)')).toBe(true);
    expect(signed[0]!.body).not.toMatch(/--ds-focus-ring-color|--ds-color-primary/);
  });

  it('keeps a system-colour outline on the link in forced colors', () => {
    const forced = FORCED.filter((rule) => readsAs(rule, LINK));
    expect(forced.length).toBe(1);
    expect(declares(forced[0]!, 'outline: 2px solid Highlight')).toBe(true);
    expect(declares(forced[0]!, 'outline-offset: 2px')).toBe(true);
  });

  it('leaves the ledger cell its inset focus-within keyline: a container cue, not the signature', () => {
    const cell = AUTHORED.filter((rule) => readsAs(rule, CELL));
    expect(cell.length).toBe(1);
    expect(cell[0]!.body).toMatch(/^box-shadow: inset 0 0 0 var\(--ds-focus-ring-width, 2px\)/);
  });
});
