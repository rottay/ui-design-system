/**
 * The public dot channel governs the thumb whenever it is authored. Only an
 * unauthored dot on the canonical primary or error fill takes that fill's
 * paired ink -- the ink the state glyph on the same track already reads -- so
 * the dark leg's light primary carries a dark thumb above the 3:1 floor.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

import { contrastRatio } from '@/foundation/kernel/color/contrast';
import { deriveToggleChannels } from '@/infrastructure/compilers/runtime/theme/runtime/lowering/runtime/derivation/chrome/toggle';

const read = (path: string) => readFileSync(resolve(process.cwd(), path), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');

const SKIN = read('src/foundation/tokens/css/runtime/engines/modern/skin/toggle/index.css');
const THEME = read('src/foundation/tokens/css/foundation/themes/default/index.css');
const PRESENTATION = read('src/foundation/tokens/css/presentation/components/toggle/index.css');

const NON_TEXT_FLOOR = 3;
const THUMB = ".ds-toggle.ds-toggle--modern [data-part='thumb']";
const TRACK_CHECKED = ".ds-toggle.ds-toggle--modern[data-checked='true'] [data-part='track']";
const TRACK_ERROR = ".ds-toggle.ds-toggle--modern[data-error='true'][data-error='true'] [data-part='track']";
const DOT_UNAUTHORED = 'style(--ds-toggle-dot-bg: var(--ds-color-white))';

interface Rule {
  readonly selector: string;
  readonly body: string;
  readonly container: string | undefined;
}

/** Every style rule with the at-rule prelude that holds it, if any. */
function rules(css: string): Rule[] {
  const out: Rule[] = [];
  const open: string[] = [];
  let start = 0;
  for (let index = 0; index < css.length; index += 1) {
    if (css[index] === '{') {
      open.push(css.slice(start, index).replace(/\s+/g, ' ').trim());
      start = index + 1;
    } else if (css[index] === '}') {
      const prelude = open.pop() ?? '';
      if (!prelude.startsWith('@')) out.push({ selector: prelude, body: css.slice(start, index), container: open.find((at) => at.startsWith('@')) });
      start = index + 1;
    }
  }
  return out;
}

const props = (body: string) => new Map(Array.from(body.matchAll(/([\w-]+)\s*:\s*([^;]+);/g), (match) => [match[1]!, match[2]!.trim()]));

const SKIN_RULES = rules(SKIN);
function skinRule(selector: string, container?: string): Map<string, string> {
  const rule = SKIN_RULES.find((candidate) => candidate.selector === selector && candidate.container === container);
  expect(rule, `${container ?? ''} ${selector}`).toBeDefined();
  return props(rule!.body);
}

const THEME_RULES = rules(THEME);
const BASE = props(THEME_RULES.find((rule) => rule.selector === ':root' && !rule.container)!.body);
const DARK = props(THEME_RULES.find((rule) => rule.selector.includes("html[data-theme='dark']"))!.body);
const MODES = { light: BASE, dark: new Map([...BASE, ...DARK]) } as const;

function resolveColor(mode: Map<string, string>, value: string, seen: string[] = []): string {
  const reference = /^var\((--[\w-]+)\)$/.exec(value);
  if (!reference) return value;
  expect(seen, `cycle through ${reference[1]}`).not.toContain(reference[1]);
  const next = mode.get(reference[1]!);
  expect(next, `${reference[1]} is declared`).toBeDefined();
  return resolveColor(mode, next!, [...seen, reference[1]!]);
}

/** The canonical fill each paired arm guards on, and the glyph ink that fill already carries. */
const PAIRS = [
  { fill: 'var(--ds-color-primary)', glyph: ".ds-toggle.ds-toggle--modern [data-part='state-icon'][data-on='true']" },
  { fill: 'var(--ds-color-error)', glyph: ".ds-toggle.ds-toggle--modern[data-error='true'] [data-part='state-icon']" },
] as const;
const containerFor = (fill: string) => `@container ${DOT_UNAUTHORED} and style(--_ds-toggle-fill: ${fill})`;

describe('toggle -- the thumb keeps the public dot channel and pairs only an unauthored dot', () => {
  it('reads the public dot channel first on every track', () => {
    expect(skinRule(THUMB).get('background-color')).toBe('var(--ds-toggle-dot-bg, var(--ds-surface-control, var(--ds-color-text-on-primary)))');
    expect(SKIN).not.toMatch(/--_ds-toggle-dot/);
  });

  it('pairs the thumb only under an unauthored dot and the canonical fill, with the ink the glyph reads there', () => {
    const paired = SKIN_RULES.filter((rule) => rule.selector === THUMB && rule.container?.startsWith('@container'));
    expect(paired.map((rule) => rule.container)).toEqual(PAIRS.map((pair) => containerFor(pair.fill)));
    for (const pair of PAIRS) {
      expect(skinRule(THUMB, containerFor(pair.fill)).get('background-color')).toBe(skinRule(pair.glyph).get('color'));
    }
  });

  it('guards on the dot default the presentation row and no compiled tenant restates', () => {
    expect(props(PRESENTATION).get('--ds-toggle-dot-bg')).toBe('var(--ds-color-white)');
    expect(deriveToggleChannels()).not.toHaveProperty('--ds-toggle-dot-bg');
  });

  it('guards on the fills the skin and every compiled tenant resolve when no track is authored', () => {
    expect(skinRule(TRACK_CHECKED).get('--_ds-toggle-fill')).toBe('var(--ds-toggle-track-bg-checked, var(--ds-color-primary))');
    expect(skinRule(TRACK_ERROR).get('--_ds-toggle-fill')).toBe('var(--ds-toggle-error-track-bg, var(--ds-color-error))');
    const derived = deriveToggleChannels();
    expect(derived['--ds-toggle-track-bg-checked']).toBe(PAIRS[0].fill);
    expect(derived['--ds-toggle-error-track-bg']).toBe(PAIRS[1].fill);
  });

  it.each(Object.keys(MODES) as Array<keyof typeof MODES>)('clears the non-text floor on both paired fills in %s', (key) => {
    const mode = MODES[key];
    for (const pair of PAIRS) {
      const ink = skinRule(THUMB, containerFor(pair.fill)).get('background-color')!;
      const ratio = contrastRatio(resolveColor(mode, pair.fill), resolveColor(mode, ink));
      expect(ratio, `${ink} on ${pair.fill} (${key})`).toBeGreaterThanOrEqual(NON_TEXT_FLOOR);
    }
  });
});
