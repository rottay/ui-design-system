/**
 * The trigger, the view-select row, the active-card actions and the delete
 * affordance paint keyboard focus as the tenant signature `--ds-focus-ring`,
 * each behind the kernel state twin, and keep a system-colour outline in
 * forced colors.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

const SKIN = readFileSync(
  resolve(process.cwd(), 'src/foundation/tokens/css/presentation/components/skin/saved-views-menu/index.css'),
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

const KEYBOARD = ":is([data-state~='focus-visible'], :focus-visible)";
const PANEL = '.ds-structure.ds-saved-views-menu-panel';
const TARGETS = [
  `.ds-structure.ds-saved-views-menu[data-part='trigger']${KEYBOARD}`,
  `.ds-structure.ds-saved-views-menu.ds-saved-views-menu__trigger${KEYBOARD}`,
  `${PANEL} [data-part='view-item-select']${KEYBOARD}`,
  `${PANEL} [data-part='action-button']${KEYBOARD}`,
  `${PANEL} .ds-saved-views-menu-panel__action-button${KEYBOARD}`,
  `${PANEL} [data-part='delete']${KEYBOARD}`,
];
const AUTHORED = RULES.filter((rule) => !rule.forced);
const FORCED = RULES.filter((rule) => rule.forced);

describe('saved-views-menu skin — keyboard focus wears the tenant focus signature', () => {
  it('paints the signature on exactly the four tab stops', () => {
    expect(selectors(AUTHORED.filter((rule) => declares(rule, 'box-shadow: var(--ds-focus-ring)')))).toEqual(TARGETS);
  });

  it('never draws focus as a solid outline or a hand-built ring outside forced colors', () => {
    const focus = AUTHORED.filter((rule) => rule.selector.includes('focus-visible'));
    expect(selectors(focus)).toEqual(TARGETS);
    for (const rule of focus) {
      expect(declares(rule, 'outline: var(--ds-focus-ring-width) solid transparent'), rule.selector).toBe(true);
      expect(declares(rule, 'outline-offset: var(--ds-focus-ring-offset)'), rule.selector).toBe(true);
      expect(rule.body, rule.selector).not.toMatch(/--ds-focus-ring-color|--ds-color-primary|--ds-color-danger|inset/);
    }
  });

  it('keeps a system-colour outline on every tab stop in forced colors', () => {
    const outlined = FORCED.filter((rule) => declares(rule, 'outline: 2px solid Highlight'));
    expect(selectors(outlined).sort()).toEqual([...TARGETS].sort());
    for (const rule of outlined) expect(declares(rule, 'box-shadow: none'), rule.selector).toBe(true);
  });
});
