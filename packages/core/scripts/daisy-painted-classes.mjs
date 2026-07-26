#!/usr/bin/env node
/**
 * Generate and verify `lib/daisy-painted-classes.json` -- the class vocabulary
 * behind `daisy.classConsumers`, derived from the INSTALLED DaisyUI package.
 *
 * WHY THIS EXISTS
 * ---------------
 * The predecessor was a hand-maintained array of 25 names in the counter
 * itself, annotated "verified against the `daisyui@5.5.19` package source". It
 * was not. It omitted `timeline-box`, `timeline-end`, `timeline-vertical`,
 * `link-hover` and `loading-spinner` -- every one of them painted by the pinned
 * version, and every one of them rendered by a file the ratchet was therefore
 * scoring as clean. A hand-list cannot be verified by reading it; the only
 * defence is to derive it, and to fail when the derivation stops matching.
 *
 * This is the same discipline `daisy-projection-contract.test.mjs` applies to
 * the theme-variable contract: pin the version, derive the truth from the
 * package, and refuse to run when the version moves.
 *
 * WHERE THE TRUTH LIVES
 * ---------------------
 * `daisyui/components/<name>/object.js` and `daisyui/utilities/<name>/object.js`
 * default-export the exact nested rule objects the plugin hands to Tailwind's
 * `addComponents`/`addUtilities`. They ARE the emitted CSS, one step before it
 * is serialized -- not documentation about it. `base/` is excluded: it styles
 * bare elements and `:root`, and contributes no component class.
 *
 * WHAT COUNTS AS PAINTED
 * ----------------------
 * A class is painted when the package declares at least one CSS property under
 * a selector that POSITIVELY matches it. Two halves, both load-bearing:
 *
 *   - "declares a property" excludes a selector that only nests other
 *     selectors. `.timeline` both declares (`position: relative`) and nests, so
 *     it is painted for the first reason, not the second.
 *
 *   - "positively" excludes everything inside `:not(...)`. This is the whole
 *     reason `disabled` is not in the manifest: the pinned version mentions
 *     `.disabled` exactly twice, both times inside
 *     `li:not(.menu-title, .disabled)` in the `.menu` rule. DaisyUI never
 *     paints `.disabled`; it paints things that are NOT `.disabled`. Harvesting
 *     class tokens without stripping negations puts `disabled` in the
 *     vocabulary, and `disabled` is an ordinary state class three modern-engine
 *     primitives render for their own reasons -- three false consumers from one
 *     missing `:not` rule.
 *
 * STANDALONE VS CONTEXTUAL
 * ------------------------
 * `paints` records whether the class is painted by a rule that needs no other
 * class present (`standalone`) or only ever inside one (`contextual`, with the
 * required ancestors listed). `.loading-spinner` sets `mask-image` on its own,
 * so it is standalone; `.pika-single .is-today .pika-button` paints nothing
 * without its ancestors, so `is-today` is contextual.
 *
 * Both count as consumption. The ratchet measures COUPLING to DaisyUI's class
 * contract, not pixels: a contextual class is still Daisy vocabulary in a
 * Rottay-native engine, and the ancestor that completes it can be supplied by a
 * parent component, a consuming app, or a future edit. `paints` is recorded so
 * the distinction is visible rather than assumed.
 *
 * BASES
 * -----
 * `base` is the longest proper `-`-separated prefix of the class that is itself
 * a painted class (`loading-spinner` -> `loading`, `timeline-box` ->
 * `timeline`, `radial-progress` -> none, since `radial` paints nothing). The
 * counter uses it to flag a modifier rendered WITHOUT its base -- the shape all
 * three `loading-spinner` consumers have -- so that case can never be silent.
 *
 * USAGE
 *   node scripts/daisy-painted-classes.mjs            # verify (exit 1 on drift)
 *   node scripts/daisy-painted-classes.mjs --check    # same, explicit
 *   node scripts/daisy-painted-classes.mjs --write    # regenerate the manifest
 */
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));

export const MANIFEST_PATH = join(here, 'lib/daisy-painted-classes.json');

/**
 * The version this manifest was derived from. A DaisyUI upgrade renames,
 * removes and adds painted classes, so the manifest is only meaningful next to
 * the version it came from: moving the dependency without regenerating would
 * leave the ratchet measuring a vocabulary that no longer ships.
 *
 * Kept identical to `daisy-projection-contract.test.mjs`'s pin on purpose --
 * both contracts describe the same installed package, and one moving without
 * the other is itself a defect.
 */
export const PINNED_DAISY_VERSION = '5.5.19';

/** Package subtrees whose `object.js` files declare component/utility classes. */
const CLASS_BEARING_GROUPS = ['components', 'utilities'];

/** A class token in a selector: `.foo`, `.foo-bar`, `.-foo`. */
const CLASS_TOKEN = /\.(-?[A-Za-z_][A-Za-z0-9_-]*)/g;

/** The daisyui package root, resolved from this package's dependency graph. */
export function daisyPackageDir(from = import.meta.url) {
  return dirname(createRequire(from).resolve('daisyui/package.json'));
}

/** The installed daisyui version. */
export function installedDaisyVersion(from = import.meta.url) {
  return createRequire(from)('daisyui/package.json').version;
}

/**
 * Drop every `:not(...)` group, parens balanced, so the classes left are the
 * ones the rule actually selects. `:where(...)` and `:is(...)` are KEPT: they
 * match, they merely change specificity.
 */
function withoutNegations(selector) {
  let out = '';
  for (let index = 0; index < selector.length; index += 1) {
    if (!selector.startsWith(':not(', index)) {
      out += selector[index];
      continue;
    }
    let depth = 0;
    let cursor = index + 4;
    for (; cursor < selector.length; cursor += 1) {
      if (selector[cursor] === '(') depth += 1;
      else if (selector[cursor] === ')') {
        depth -= 1;
        if (depth === 0) break;
      }
    }
    index = cursor;
  }
  return out;
}

/** The classes a selector positively matches. */
function positiveClasses(selector) {
  return [...withoutNegations(selector).matchAll(CLASS_TOKEN)].map((match) => match[1]);
}

/**
 * Does this rule body declare a CSS property, as opposed to only nesting other
 * selectors? At-rules (`@layer daisyui.l1.l2.l3`, `@media print`) wrap the
 * declarations of the rule they sit in, so they are transparent here.
 */
function declaresProperties(body) {
  for (const [key, value] of Object.entries(body)) {
    if (typeof value === 'string' || typeof value === 'number') return true;
    if (key.startsWith('@') && value && typeof value === 'object' && declaresProperties(value))
      return true;
  }
  return false;
}

/**
 * Walk one component/utility object, recording every painted class and the
 * ancestor classes its painting rules required.
 */
function harvestObject(body, inherited, painted) {
  for (const [key, value] of Object.entries(body)) {
    if (typeof value !== 'object' || value === null) continue;
    if (key.startsWith('@')) {
      harvestObject(value, inherited, painted);
      continue;
    }
    const own = positiveClasses(key);
    const chain = own.length ? [...new Set([...inherited, ...own])] : inherited;
    if (own.length && declaresProperties(value)) {
      for (const name of own) {
        const context = chain.filter((other) => other !== name).sort();
        const entry = painted.get(name);
        if (!entry) painted.set(name, { contexts: [context] });
        else entry.contexts.push(context);
      }
    }
    harvestObject(value, chain, painted);
  }
}

/** Derive the painted-class inventory from the installed daisyui package. */
export async function derivePaintedClasses(from = import.meta.url) {
  const packageDir = daisyPackageDir(from);
  const painted = new Map();
  const sources = [];

  for (const group of CLASS_BEARING_GROUPS) {
    for (const entry of readdirSync(join(packageDir, group)).sort()) {
      if (entry.endsWith('.css')) continue;
      const object = join(packageDir, group, entry, 'object.js');
      let module;
      try {
        module = await import(object);
      } catch {
        continue;
      }
      sources.push(`${group}/${entry}`);
      harvestObject(module.default, [], painted);
    }
  }

  const names = [...painted.keys()].sort();
  const isPainted = new Set(names);
  const classes = {};
  for (const name of names) {
    const { contexts } = painted.get(name);
    // Standalone when SOME painting rule required no other class.
    const standalone = contexts.some((context) => context.length === 0);
    const requires = standalone
      ? []
      : [...new Set(contexts.map((context) => context.join(' ')))].sort();

    // The longest `-`-separated prefix that is itself painted.
    let base = null;
    const parts = name.split('-');
    for (let cut = parts.length - 1; cut >= 1; cut -= 1) {
      const candidate = parts.slice(0, cut).join('-');
      if (isPainted.has(candidate)) {
        base = candidate;
        break;
      }
    }

    classes[name] = { paints: standalone ? 'standalone' : 'contextual', base, requires };
  }

  return { version: installedDaisyVersion(from), sources, classes };
}

/** The manifest as written on disk. */
export function readManifest() {
  return JSON.parse(readFileSync(MANIFEST_PATH, 'utf8'));
}

/** Every painted class name, as a `Set` -- the counter's vocabulary. */
export function paintedClassNames(manifest = readManifest()) {
  return new Set(Object.keys(manifest.classes));
}

/**
 * The manifest a derivation produces, in the exact on-disk shape. Split out so
 * `--check` compares the same bytes `--write` would emit.
 */
function serialize(derived) {
  return `${JSON.stringify(
    {
      $comment:
        'GENERATED by scripts/daisy-painted-classes.mjs from the installed daisyui package. Do not hand-edit: run `node scripts/daisy-painted-classes.mjs --write`.',
      daisyuiVersion: derived.version,
      pinnedVersion: PINNED_DAISY_VERSION,
      derivedFrom: derived.sources,
      classCount: Object.keys(derived.classes).length,
      classes: derived.classes,
    },
    null,
    2,
  )}\n`;
}

/**
 * Verify the manifest against the installed package. Returns the failures, so
 * the CLI and the test report the identical diagnosis.
 */
export async function checkManifest(from = import.meta.url) {
  const failures = [];
  const installed = installedDaisyVersion(from);
  if (installed !== PINNED_DAISY_VERSION) {
    failures.push(
      `daisyui version moved: installed ${installed}, manifest pinned to ${PINNED_DAISY_VERSION}. ` +
        'Re-derive the painted-class vocabulary against the new version and move the pin deliberately: ' +
        'node scripts/daisy-painted-classes.mjs --write',
    );
    return failures;
  }

  const derived = await derivePaintedClasses(from);
  const onDisk = readFileSync(MANIFEST_PATH, 'utf8');
  if (serialize(derived) !== onDisk) {
    const manifest = JSON.parse(onDisk);
    const before = new Set(Object.keys(manifest.classes));
    const after = new Set(Object.keys(derived.classes));
    const added = [...after].filter((name) => !before.has(name));
    const removed = [...before].filter((name) => !after.has(name));
    failures.push(
      'lib/daisy-painted-classes.json no longer matches the installed daisyui package' +
        (added.length ? `\n  + ${added.join(' ')}` : '') +
        (removed.length ? `\n  - ${removed.join(' ')}` : '') +
        '\n  regenerate: node scripts/daisy-painted-classes.mjs --write',
    );
  }
  return failures;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  if (process.argv.includes('--write')) {
    const derived = await derivePaintedClasses();
    writeFileSync(MANIFEST_PATH, serialize(derived));
    const standalone = Object.values(derived.classes).filter(
      (entry) => entry.paints === 'standalone',
    ).length;
    console.log(
      `daisy-painted-classes: wrote ${Object.keys(derived.classes).length} classes ` +
        `(${standalone} standalone, ${Object.keys(derived.classes).length - standalone} contextual) ` +
        `from daisyui@${derived.version}`,
    );
  } else {
    const failures = await checkManifest();
    if (failures.length) {
      for (const failure of failures) console.error(`daisy-painted-classes: ${failure}`);
      process.exit(1);
    }
    const manifest = readManifest();
    console.log(
      `daisy-painted-classes OK (${manifest.classCount} classes, daisyui@${manifest.daisyuiVersion})`,
    );
  }
}
