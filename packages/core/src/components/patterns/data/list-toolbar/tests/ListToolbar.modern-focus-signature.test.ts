/**
 * Every toolbar-owned control paints keyboard focus as a box-shadow read from
 * the governed focus channels (which resolve to the tenant signature
 * `--ds-focus-ring`), never as a solid or a suppressed outline, and keeps a
 * system-colour outline in forced colors, where the box-shadow is dropped.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

const SKIN = readFileSync(
  resolve(process.cwd(), 'src/foundation/tokens/css/runtime/engines/modern/skin/list-toolbar/index.css'),
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
const KEYBOARD = ":is([data-state~='focus-visible'], :focus-visible)";
const KEYBOARD_RULES = RULES.filter((rule) => rule.selector.includes('focus-visible'));

const CONTROLS = [
  ".ds-list-toolbar__icon-button[data-part='icon-button']",
  ".ds-list-toolbar__filter-trigger[data-part='filter-trigger']",
  ".ds-list-toolbar__filter-dropdown-item[data-part='filter-dropdown-item']",
  ".ds-list-toolbar__density-option[data-part='density-option']",
  ".ds-list-toolbar__mobile-overflow-item[data-part='mobile-overflow-item']",
  ".ds-list-toolbar__clear-all[data-part='clear-all']",
  ".ds-list-toolbar__primary-action[data-part='primary-action']",
  '.ds-list-toolbar__primary-action-mobile',
];

const CONTROL_FOCUS = `.ds-pattern-list-toolbar.ds-engine-modern :is(${CONTROLS.join(', ')}).ds-button[data-variant]${KEYBOARD}`;
const TRIGGER_FOCUS = `.ds-pattern-list-toolbar.ds-engine-modern .ds-list-toolbar__filter-trigger[data-part='filter-trigger'].ds-button[data-variant]${KEYBOARD}`;

function declarations(rule: SkinRule, property: string): string[] {
  return Array.from(rule.body.matchAll(new RegExp(`(?:^|[;\\s])${property}:\\s*([^;]+);`, 'g')), (match) => match[1]!.trim());
}

describe('list-toolbar -- every toolbar-owned control paints keyboard focus from the governed focus channels', () => {
  it('paints the focus channels on exactly the family focus targets', () => {
    const painted = KEYBOARD_RULES.filter((rule) => !rule.forced && declarations(rule, 'box-shadow').length > 0);
    expect(painted.map((rule) => rule.selector)).toEqual([CONTROL_FOCUS, TRIGGER_FOCUS]);
    expect(declarations(painted[0]!, 'box-shadow')).toEqual([
      'var(--ds-toolbar-control-focus-ring, var(--ds-material-control-focus-ring, var(--ds-focus-ring)))',
    ]);
    expect(declarations(painted[1]!, 'box-shadow')).toEqual(['var(--ds-filter-pill-focus-ring, var(--ds-focus-ring))']);
  });

  it('paints a focus channel nowhere else: the shell wears no signature while a control inside it holds focus', () => {
    const readers = RULES.filter((rule) => /-focus-ring\s*[,)]/.test(rule.body));
    expect(readers.map((rule) => rule.selector)).toEqual([CONTROL_FOCUS, TRIGGER_FOCUS]);
    expect(SKIN).not.toContain('--ds-toolbar-focus-ring');
    const within = RULES.filter((rule) => rule.selector.includes(':focus-within'));
    for (const rule of within) {
      expect(declarations(rule, 'box-shadow'), rule.selector).toEqual([]);
      expect(declarations(rule, 'outline'), rule.selector).toEqual([]);
    }
  });

  it('never draws or suppresses focus with a solid or absent outline outside forced colors', () => {
    const outlines = KEYBOARD_RULES.filter((rule) => !rule.forced).flatMap((rule) => declarations(rule, 'outline'));
    expect(outlines.length).toBeGreaterThan(0);
    for (const outline of outlines) {
      expect(outline).toMatch(/\bsolid transparent$/);
    }
    for (const rule of KEYBOARD_RULES) {
      expect(declarations(rule, 'outline-color'), rule.selector).toEqual([]);
    }
  });

  it('keeps a system-colour outline on every focus target in forced colors', () => {
    const forced = RULES.filter(
      (rule) => rule.forced && /outline: max\(2px, var\(--ds-focus-ring-width\)\) solid Highlight;/.test(rule.body),
    );
    expect(forced.map((rule) => rule.selector)).toEqual([CONTROL_FOCUS]);
    expect(forced[0]!.body).toMatch(/outline-offset: var\(--ds-focus-ring-offset\);/);
  });

  it('gives the forced-colors arm to every control whose resting rule clears the outline', () => {
    const cleared = RULES.filter((rule) => !rule.forced && declarations(rule, 'outline').includes('none'));
    expect(cleared.length).toBeGreaterThan(0);
    for (const rule of cleared) {
      const part = /\.ds-list-toolbar__[\w-]+/.exec(rule.selector)?.[0];
      expect(part, rule.selector).toBeDefined();
      expect(CONTROLS.some((control) => control.startsWith(part!)), rule.selector).toBe(true);
      expect(rule.selector, rule.selector).not.toContain('focus');
    }
  });

  it('leaves room for the indicator inside the two scrolling hosts that would clip it', () => {
    const clearance =
      'var(--ds-toolbar-rail-focus-clearance, max(0.25rem, calc(var(--ds-focus-ring-offset) + max(2px, var(--ds-focus-ring-width)))))';
    const rail = RULES.find(
      (rule) => rule.selector === ".ds-pattern-list-toolbar.ds-engine-modern .ds-list-toolbar__filter-rail[data-part='filter-rail']",
    );
    expect(declarations(rail!, 'padding')).toEqual([clearance]);
    expect(declarations(rail!, 'margin')).toEqual([`calc(${clearance} * -1)`]);
    const density = RULES.find((rule) => rule.selector === '.ds-list-toolbar__density-options');
    expect(declarations(density!, 'padding-inline')).toEqual([clearance]);
  });

  it('declares the forced-colors arm after every other forced-colors rule that clears the shadow', () => {
    const forced = RULES.filter((rule) => rule.forced);
    const arm = forced.findIndex((rule) => rule.selector === CONTROL_FOCUS);
    const lastShadowReset = forced.reduce(
      (last, rule, index) => (rule.selector !== CONTROL_FOCUS && /box-shadow: none;/.test(rule.body) ? index : last),
      -1,
    );
    expect(arm).toBeGreaterThan(lastShadowReset);
  });
});
