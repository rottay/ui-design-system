/**
 * AD-1 step: move each adopted extension value into its BrandTheme field.
 *
 * Values are written by character span from ts-object-index, never by pattern
 * match, and every write is verified by recompiling and diffing the compiled
 * variable map (see verify-migration.mjs).
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { indexObjectLiteral } from './ts-object-index.mjs';

const ROOT = '/private/tmp/rottay-design-platform-independent-audit-round-3';
const CORE = '/Users/daniel/Developer/Rottay/ui-design-system/packages/core';
const plan = JSON.parse(readFileSync(`${ROOT}/r1p/migration-plan.json`, 'utf-8'));

const THEME_FILES = {
  bithire: ['bithire', /export const bithireBrandTheme: BrandTheme = /],
  evnto: ['evnto', /export const evntoBrandTheme: BrandTheme = /],
  rottay: ['platform', /export const rottayBrandTheme: BrandTheme = /],
};

/** CSS-identical tidy of a value adopted from postcss (which keeps authored newlines). */
function tidy(value) {
  return value.replace(/\s+/g, ' ').replace(/\(\s+/g, '(').replace(/\s+\)/g, ')').trim();
}

function literalFor(value, existing) {
  const isNumeric = /^-?\d+(\.\d+)?$/.test(value);
  const existingUnquoted = !/^['"]/.test(existing);
  if (isNumeric && existingUnquoted) return value;
  const quote = value.includes('"') ? "'" : existing.startsWith("'") ? "'" : '"';
  if (value.includes(quote)) throw new Error(`cannot quote value: ${value}`);
  return `${quote}${value}${quote}`;
}

for (const [slug, [dir, declRegex]] of Object.entries(THEME_FILES)) {
  const sets = plan[slug].sets;
  if (sets.length === 0) {
    console.log(`${slug}: no TS field sets`);
    continue;
  }
  const file = `${CORE}/src/foundation/tokens/ts/presentation/brand-themes/${dir}/index.ts`;
  let src = readFileSync(file, 'utf-8');
  const spans = indexObjectLiteral(src, declRegex);

  const missing = sets.filter((s) => !spans.has(s.path));
  if (missing.length) {
    console.error(`${slug}: ${missing.length} path(s) absent from the authored file: ${missing.map((m) => m.path).join(', ')}`);
    process.exitCode = 1;
    continue;
  }

  // Apply back-to-front so earlier spans stay valid.
  const ordered = [...sets].sort((a, b) => spans.get(b.path).start - spans.get(a.path).start);
  for (const set of ordered) {
    const span = spans.get(set.path);
    const literal = literalFor(tidy(set.to), span.text);
    src = src.slice(0, span.start) + literal + src.slice(span.end);
  }
  writeFileSync(file, src);
  console.log(`${slug}: wrote ${sets.length} BrandTheme field(s) into ${dir}/index.ts`);
}
