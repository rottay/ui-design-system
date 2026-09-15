#!/usr/bin/env node
/**
 * foundation-defaults — the foundation's own colour declarations, projected
 * into TypeScript so the compiler can resolve a reference the CASCADE resolves.
 *
 * WHY IT EXISTS. D6-2c-i moved every chromatic default out of the authored
 * themes and into the foundation stylesheet ("every chromatic value is a preset
 * decision or a CSS default"). The runtime is fine: the browser loads
 * `foundation/themes/default/index.css` beside the artifact and
 * `var(--ds-color-neutral-100)` resolves. The COMPILER is not: the admission
 * contrast floor measures the compiled variable map, that map no longer carries
 * those defaults, and a pair whose ink resolves through one reads as
 * unverifiable. Measured on the sidebar tone: 9 of 9 (vertical x tone)
 * admitted before the move, 3 of 9 after -- refused by FORM, not by ratio.
 *
 * ONE SOURCE, PROJECTED -- NEVER A SECOND TABLE. The stylesheet is the source;
 * this producer reads it and writes the module, and `--check` fails if the two
 * disagree. A hand-copied map is the defect class this programme has already
 * paid for once, and it is what this file exists to make unnecessary.
 *
 * SCOPE: the `--ds-color-*` family AND ITS TRANSITIVE CLOSURE. The contrast
 * floor measures colour, so the colour family is the seed -- but the family
 * does not close on itself: measured, `--ds-color-*` defaults reference
 * channels outside it (`var(--ds-surface-panel-bg)`), and a projection that
 * stopped at the family would leave exactly those references unresolvable,
 * which is the defect this producer exists to remove. So the closure is
 * COMPUTED: seed with the family, then pull in every declared channel a kept
 * value references, to a fixed point. Derived, never hand-picked.
 *
 * TWO SCOPES, EFFECTIVE PER MODE. `:root` is the light scope and the dark
 * selector group overrides it. The dark map is emitted as a DELTA and composed
 * at import time, because the effective dark value of a channel the dark scope
 * does not restate is its light value -- which is exactly how the cascade
 * answers, and copying the whole map twice would say it a second way.
 *
 * Usage:
 *   node scripts/generate/tokens/foundation-defaults/index.mjs            writes
 *   node scripts/generate/tokens/foundation-defaults/index.mjs --check    verifies
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { packageRoot as findPackageRoot } from '../../../libraries/repo-root/index.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
export const CORE_ROOT = findPackageRoot(HERE);

export const SOURCE_PATH = 'src/foundation/tokens/css/foundation/themes/default/index.css';
export const OUT_PATH = 'src/foundation/tokens/ts/foundation/base/declared-defaults/index.ts';

/** The first dark selector of the group that overrides `:root`. */
export const DARK_SELECTOR = ":root[data-theme='dark']";

/** The seed family: what the contrast floor is asked about. */
const COLOR_CHANNEL = /^--ds-color-[a-z0-9-]+$/;

/** Every `--ds-*` declaration of one scope, last write winning. */
export function allDeclarations(css) {
  const out = new Map();
  for (const match of css.matchAll(/(--ds-[a-z0-9-]+)\s*:\s*([^;}]+)[;}]/gi)) {
    out.set(match[1], match[2].replace(/\s+/gu, ' ').trim());
  }
  return out;
}

/** The channels one value reads. */
export const referencesOf = (value) =>
  [...value.matchAll(/var\(\s*(--ds-[a-z0-9-]+)/g)].map((match) => match[1]);

/**
 * The colour family plus every declared channel it resolves through.
 *
 * Fixed point rather than one hop: a colour default may reference a surface
 * channel that itself references another, and a projection that stopped early
 * would reintroduce the unresolvable reference by a different name.
 */
export function closure(declared) {
  const kept = new Set([...declared.keys()].filter((channel) => COLOR_CHANNEL.test(channel)));
  const queue = [...kept];
  while (queue.length > 0) {
    const value = declared.get(queue.pop());
    if (value === undefined) continue;
    for (const reference of referencesOf(value)) {
      if (kept.has(reference) || !declared.has(reference)) continue;
      kept.add(reference);
      queue.push(reference);
    }
  }
  return kept;
}

/** The kept declarations of one scope, in the closure computed for the sheet. */
export function colorDeclarations(css, kept = null) {
  const declared = allDeclarations(css);
  const keep = kept ?? closure(declared);
  const out = new Map();
  for (const [channel, value] of declared) {
    if (keep.has(channel)) out.set(channel, value);
  }
  return out;
}

/** The light scope, and the dark scope as a DELTA over it. */
export function readScopes(css) {
  const darkStart = css.indexOf(DARK_SELECTOR);
  if (darkStart < 0) {
    throw new Error(`foundation-defaults: ${SOURCE_PATH} declares no ${DARK_SELECTOR} scope`);
  }
  /* The closure is computed over the WHOLE sheet, so the two scopes keep the
   * same channel set and a dark-only reference cannot fall out of the light
   * map it resolves through. */
  const kept = closure(allDeclarations(css));
  const light = colorDeclarations(css.slice(0, darkStart), kept);
  const dark = colorDeclarations(css.slice(darkStart), kept);
  const delta = new Map();
  for (const [channel, value] of dark) {
    if (light.get(channel) !== value) delta.set(channel, value);
  }
  return { light, darkDelta: delta };
}

const entries = (map) =>
  [...map.entries()]
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([channel, value]) => `  ${JSON.stringify(channel)}: ${JSON.stringify(value)},`)
    .join('\n');

export function render({ light, darkDelta }) {
  return `/**
 * @fileoverview GENERATED -- do not edit. The foundation's own \`--ds-color-*\`
 * declarations, so the compiler can resolve a reference the cascade resolves.
 *
 * Source: \`${SOURCE_PATH}\`
 * Regenerate: \`node scripts/generate/tokens/foundation-defaults/index.mjs\`
 *
 * The admission contrast floor measures the COMPILED variable map. Since the
 * neutral doctrine moved every chromatic default into the stylesheet, a pair
 * whose ink resolves through one of these channels is invisible to that map --
 * so the floor refused by form instead of by ratio. These are the same bytes
 * the runtime loads, projected, never a second hand-written table.
 *
 * @module Foundation/Tokens/Base/DeclaredDefaults
 * @category Foundation
 * @package @rottay/design-system
 */

/** The colour closure the foundation declares in its light (\`:root\`) scope. */
export const FOUNDATION_COLOR_DEFAULTS_LIGHT: Readonly<Record<string, string>> =
  Object.freeze({
${entries(light)}
  });

/** Only what the dark scope RESTATES; everything else keeps its light value. */
export const FOUNDATION_COLOR_DEFAULTS_DARK_DELTA: Readonly<
  Record<string, string>
> = Object.freeze({
${entries(darkDelta)}
  });

/** The effective declaration set per mode, composed the way the cascade does. */
export const FOUNDATION_COLOR_DEFAULTS: Readonly<
  Record<"light" | "dark", Readonly<Record<string, string>>>
> = Object.freeze({
  light: FOUNDATION_COLOR_DEFAULTS_LIGHT,
  dark: Object.freeze({
    ...FOUNDATION_COLOR_DEFAULTS_LIGHT,
    ...FOUNDATION_COLOR_DEFAULTS_DARK_DELTA,
  }),
});
`;
}

export function build(coreRoot = CORE_ROOT) {
  const css = readFileSync(join(coreRoot, SOURCE_PATH), 'utf8');
  const scopes = readScopes(css);
  if (scopes.light.size === 0) {
    throw new Error('foundation-defaults: the light scope declares no colour channel — the reader stopped reading');
  }
  return render(scopes);
}

function main(argv) {
  const check = argv.includes('--check');
  const text = build();
  const target = join(CORE_ROOT, OUT_PATH);
  if (!check) {
    writeFileSync(target, text);
    console.log(`foundation-defaults: wrote ${OUT_PATH}`);
    return 0;
  }
  let current = null;
  try { current = readFileSync(target, 'utf8'); } catch { current = null; }
  if (current !== text) {
    console.error(
      `foundation-defaults: FAIL — ${OUT_PATH} does not match ${SOURCE_PATH}. `
      + 'Run `node scripts/generate/tokens/foundation-defaults/index.mjs`.',
    );
    return 1;
  }
  console.log('foundation-defaults: up to date');
  return 0;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  process.exit(main(process.argv.slice(2)));
}
