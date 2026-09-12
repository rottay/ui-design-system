import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import type { BrandTheme } from '@/foundation/contracts/composition/tenants/themes';
import { deriveMotionChannels } from '@/infrastructure/compilers/runtime/theme/runtime/lowering/runtime/derivation/motion';
import { buildLoweringContext } from '@/infrastructure/compilers/runtime/theme/runtime/lowering/runtime/pipeline';

/**
 * The view-transition recipes (list -> record morph, modal promote, tab panel
 * swap, page root) are gated by two statements and nothing else: the tenant's
 * `motion.character` decides the curve and travel, and a reduced-motion
 * preference removes them. Both are read from the recipes on disk.
 */
const TEST_DIR = dirname(fileURLToPath(import.meta.url));
const TRANSITIONS_CSS = readFileSync(
  resolve(TEST_DIR, '../../../../../../foundation/tokens/css/foundation/animations/transitions/index.css'),
  'utf8',
).replace(/\/\*[\s\S]*?\*\//g, (comment) => comment.replace(/[^\n]/g, ' '));

const CHARACTERS = ['mechanical', 'organic', 'playful'] as const;
const CHARACTER_EASES = ['--ds-motion-ease-enter', '--ds-motion-ease-exit', '--ds-motion-ease-move'];
const MOTION_DECLARATION = /(?:^|[\s;{])(animation|animation-timing-function)\s*:([^;}]*)/g;
const EASING_LITERAL = /cubic-bezier\s*\(|(?<![\w-])(?:ease(?:-in-out|-in|-out)?|linear|step-start|step-end)(?![\w-])|steps\s*\(/;

interface Rule {
  selectors: string[];
  body: string;
  guard: 'media' | 'seam' | null;
}

/** Flat rules with the reduced-motion context they sit in. */
function rules(css: string): Rule[] {
  const out: Rule[] = [];
  const reduceBlock = /@media\s*\(\s*prefers-reduced-motion:\s*reduce\s*\)\s*\{/g;
  const mediaRanges: Array<[number, number]> = [];
  for (const match of css.matchAll(reduceBlock)) {
    let depth = 1;
    let index = (match.index ?? 0) + match[0].length;
    for (; index < css.length && depth > 0; index += 1) {
      if (css[index] === '{') depth += 1;
      else if (css[index] === '}') depth -= 1;
    }
    mediaRanges.push([match.index ?? 0, index]);
  }
  for (const match of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const offset = match.index ?? 0;
    const prelude = match[1].trim().replace(/^@media[^{]*$/, '');
    if (!prelude.includes('::view-transition-')) continue;
    const selectors = prelude.split(/,(?![^(]*\))/).map((s) => s.replace(/\s+/g, ' ').trim());
    const inMedia = mediaRanges.some(([from, to]) => offset > from && offset < to);
    const seam = selectors.every((s) => s.startsWith("html[data-ds-motion='reduced']"));
    out.push({ selectors, body: match[2], guard: inMedia ? 'media' : seam ? 'seam' : null });
  }
  return out;
}

const RECIPES = rules(TRANSITIONS_CSS).filter((rule) => rule.guard === null);
const GUARDS = rules(TRANSITIONS_CSS).filter((rule) => rule.guard !== null);

function channelsFor(character: (typeof CHARACTERS)[number]): Record<string, string> {
  const theme = { id: 't', name: 'T', motion: { character } } as BrandTheme;
  const context = buildLoweringContext({ theme });
  return deriveMotionChannels(context.theme, context.expressive.expansion);
}

function resolveChannel(channels: Record<string, string>, name: string, seen: string[] = []): string {
  const value = channels[name];
  expect(value, `${name} is emitted by the motion family`).toBeDefined();
  const alias = /^var\((--[\w-]+)\)$/.exec(String(value).trim());
  if (!alias) return String(value);
  expect(seen, `${name} does not alias in a cycle`).not.toContain(alias[1]);
  return resolveChannel(channels, alias[1], [...seen, name]);
}

describe('view-transition recipes -- motion.character gate', () => {
  it('finds the list -> record, modal promote, tab panel and page root recipes', () => {
    const selectors = RECIPES.flatMap((rule) => rule.selectors).join('\n');
    for (const recipe of ['(*.ds-vt-record)', '(ds-vt-modal-promote)', '(*.ds-vt-tab-panel)', '(root)']) {
      expect(selectors, recipe).toContain(recipe);
    }
  });

  it('travels every recipe on a character-owned ease and never on a literal', () => {
    for (const rule of RECIPES) {
      const declarations = [...rule.body.matchAll(MOTION_DECLARATION)].map((match) => match[2]);
      if (declarations.length === 0) continue;
      const eases = declarations.flatMap((value) => value.match(/--ds-motion-ease-[\w-]+/g) ?? []);
      expect(eases.length, `${rule.selectors[0]} names an ease`).toBeGreaterThan(0);
      for (const ease of eases) expect(CHARACTER_EASES, rule.selectors[0]).toContain(ease);
      for (const value of declarations) expect(value, rule.selectors[0]).not.toMatch(EASING_LITERAL);
    }
  });

  it('gives each character its own curve and travel for every role the recipes read', () => {
    const resolved = CHARACTERS.map((character) => channelsFor(character));
    for (const role of [...CHARACTER_EASES, '--ds-motion-panel-offset']) {
      const values = resolved.map((channels) => resolveChannel(channels, role));
      expect(new Set(values).size, `${role}: ${values.join(' | ')}`).toBe(CHARACTERS.length);
    }
  });
});

describe('view-transition recipes -- reduced-motion gate', () => {
  it('neutralizes every recipe selector under prefers-reduced-motion', () => {
    const neutralized = new Set(
      GUARDS.filter((rule) => rule.guard === 'media' && /animation\s*:\s*none/.test(rule.body)).flatMap(
        (rule) => rule.selectors,
      ),
    );
    const wildcard = ['::view-transition-group(*)', '::view-transition-old(*)', '::view-transition-new(*)'];
    for (const selector of wildcard) expect(neutralized, selector).toContain(selector);
    for (const selector of RECIPES.flatMap((rule) => rule.selectors)) {
      const bare = selector.replace(/^:where\([^)]*\)\)/, '').replace(/^:where\([^)]*\)/, '');
      expect(neutralized, selector).toContain(bare);
    }
  });

  it('holds the same neutralization on the provider-owned reduced seam', () => {
    const seam = GUARDS.filter((rule) => rule.guard === 'seam' && /animation\s*:\s*none/.test(rule.body));
    expect(seam.flatMap((rule) => rule.selectors).sort()).toEqual(
      [
        "html[data-ds-motion='reduced']::view-transition-group(*)",
        "html[data-ds-motion='reduced']::view-transition-new(*)",
        "html[data-ds-motion='reduced']::view-transition-old(*)",
      ],
    );
  });
});
