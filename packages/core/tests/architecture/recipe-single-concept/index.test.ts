/**
 * @fileoverview Fail-closed gate: under `src/components/patterns` the word "recipes" names one concept
 * (WO-RET-06 W-3b, F-84 remainder (b)).
 *
 * THE CONCEPT. The governed presentation recipe: the code-owned, finite visual variants per family,
 * selected by recipe profiles and by the Theme's `recipes` family. The other homonyms the fiche counted
 * are gone (the column helpers became `contract-builders`, the variant factory retired in W-1), and the
 * two prose misuses W-3b found were renamed. What may still say "recipes" here is one of three forms:
 *
 * 1. an import specifier of the recipe engine, `@/infrastructure/runtime/foundation/recipes/...`;
 * 2. the persisted Theme family key `recipes` (`'recipes'`, `recipes:` or `.recipes`), in a file that
 *    imports `Theme`, `FlatTheme` or the theme-draft transport;
 * 3. prose naming DataTable's recipe axis, at its two pinned sites.
 *
 * Any other occurrence fails, and the carrier count is pinned so growth needs a visible edit. The
 * mutation block at the bottom proves the classifier can fail.
 */

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, resolve, sep } from 'node:path';

import { describe, expect, it } from 'vitest';

const PACKAGE_ROOT = resolve(__dirname, '../../..');
const PATTERNS_ROOT = join(PACKAGE_ROOT, 'src/components/patterns');

const WORD = /recipes/gu;

/** Form 1: the recipe engine's import path. */
const ENGINE_SPECIFIER = /(['"])@\/infrastructure\/runtime\/foundation\/recipes\/[^'"]*\1/gu;

/** Form 2: the persisted Theme family key, in a file bound to the Theme or its draft transport. */
const THEME_KEY = /'recipes'|\brecipes:|\.recipes\b/gu;
const THEME_BINDING = /\bimport\b[^;]*\b(?:Theme|FlatTheme|projectThemeDraft|readThemeDraft|serializeThemeDraft|deserializeThemeDraft)\b[^;]*from/su;

/** Form 3: prose naming DataTable's recipe axis (`minimal | ruled | grid | zebra | editorial`), at its two sites. */
const DATA_TABLE_AXIS_SITES = new Set([
  'data/data-table/contracts/index.ts',
  'data/data-table/OWNERSHIP.md',
]);
const PROSE_LINE = /^\s*(?:\*|\/\/|-|[A-Za-z`(])/u;

/** The files expected to carry the word after W-3b; growth is a visible edit here. */
const EXPECTED_CARRIERS = 7;

function walk(root: string): string[] {
  const found: string[] = [];
  for (const entry of readdirSync(root)) {
    const absolute = join(root, entry);
    if (statSync(absolute).isDirectory()) found.push(...walk(absolute));
    else found.push(absolute);
  }
  return found;
}

/** The occurrences on one line that none of the three lawful forms accounts for. */
function unlawfulOccurrences(site: string, text: string): string[] {
  const themeBound = THEME_BINDING.test(text);
  const findings: string[] = [];
  text.split('\n').forEach((line, index) => {
    if (!WORD.test(line)) return;
    WORD.lastIndex = 0;
    let residue = line.replace(ENGINE_SPECIFIER, '');
    if (themeBound) residue = residue.replace(THEME_KEY, '');
    if (DATA_TABLE_AXIS_SITES.has(site) && PROSE_LINE.test(line)) residue = '';
    if (/recipes/u.test(residue)) findings.push(`${site}:${index + 1}: ${line.trim()}`);
  });
  return findings;
}

function carriers(): Array<{ site: string; text: string }> {
  expect(existsSync(PATTERNS_ROOT), `patterns root moved: ${PATTERNS_ROOT}`).toBe(true);
  return walk(PATTERNS_ROOT)
    .map((file) => ({ site: relative(PATTERNS_ROOT, file).split(sep).join('/'), text: readFileSync(file, 'utf8') }))
    .filter(({ text }) => /recipes/u.test(text));
}

describe('"recipes" under src/components/patterns names one concept', () => {
  it('admits only the three lawful forms', () => {
    expect(carriers().flatMap(({ site, text }) => unlawfulOccurrences(site, text))).toEqual([]);
  });

  it('pins the carrier count', () => {
    expect(carriers().map(({ site }) => site).sort()).toHaveLength(EXPECTED_CARRIERS);
  });
});

describe('the classifier can fail', () => {
  it('reports a misuse in prose, outside the pinned sites', () => {
    expect(unlawfulOccurrences('foundation/contract-builders/index.ts', '/** Type-safe recipes for composing. */')).toHaveLength(1);
  });

  it('reports the Theme key spelled in a file that is not bound to the Theme', () => {
    expect(unlawfulOccurrences('data/grid-view/tests/x.test.ts', "expect('recipes' in view).toBe(false);")).toHaveLength(1);
  });

  it('reports a second use on a line whose first use is lawful', () => {
    const line = "import { x } from '@/infrastructure/runtime/foundation/recipes/profiles'; // chart recipes";
    expect(unlawfulOccurrences('data/data-table/presentation/table/index.tsx', line)).toHaveLength(1);
  });

  it('admits each lawful form', () => {
    expect(unlawfulOccurrences('a.ts', "import { y } from '@/infrastructure/runtime/foundation/recipes/profiles';")).toEqual([]);
    const themed = "import type { FlatTheme } from '../themes';\nconst k = view.recipes.disposition;";
    expect(unlawfulOccurrences('b.test.ts', themed)).toEqual([]);
    expect(unlawfulOccurrences('data/data-table/contracts/index.ts', ' * Bounded DataTable presentation recipes.')).toEqual([]);
  });
});
