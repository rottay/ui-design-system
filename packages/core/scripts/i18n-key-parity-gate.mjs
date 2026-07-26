#!/usr/bin/env node
/**
 * i18n-key-parity-gate — translation-catalog key parity law.
 *
 * The catalog under
 * `src/foundation/i18n/runtime/catalog/translations/locales/<locale>/*.json`
 * had NO mechanical guard: deleting 421 of Arabic's 423 leaf keys left the
 * whole suite green, because the only AR coverage asserts two keys by hand
 * (`src/tooling/testing/integration/i18n/tests/index.test.tsx`). A missing key
 * is not a crash -- `t()` silently walks the fallback chain and, when that
 * misses too, echoes the raw key into the UI -- so catalog rot is invisible
 * until a user sees `components.button.save` on a button.
 *
 * The reference key set is the UNION of every MANDATORY locale's leaf keys, so
 * the law is symmetric: a key that exists only in `es` is a hole in `en` and
 * `ar`, exactly as a key that exists only in `en` is a hole in the other two.
 * There is no privileged source language.
 *
 * Two enforcement classes, both read from the baseline:
 *   - MANDATORY (en, es, ar): 100% of the reference set. Any hole fails.
 *   - DECLARED-PARTIAL (fr, pt): shipping incomplete BY DECISION. Their
 *     shortfall does not fail the gate, but it is recorded per locale and is
 *     DECREASE-ONLY -- translating keys is always allowed, growing the hole
 *     never is. A partial locale that reaches parity, or one whose hole
 *     shrinks, reports a tighten opportunity instead of failing.
 *
 * A locale declared in `SUPPORTED_LOCALES` but classified in neither list
 * fails: adding a locale is a decision that must be made explicitly, not by
 * dropping a directory on disk.
 *
 * Two further ratchets close the holes a per-locale rule cannot see:
 *   - `referenceKeyCount` is an INCREASE-ONLY floor. Deleting a key from ONE
 *     mandatory locale is caught by the 100% rule, but deleting it from all
 *     three shrinks the union and would otherwise be invisible. Retiring a
 *     string is legitimate when its component is retired -- it just has to be
 *     re-seeded deliberately rather than happening by accident.
 *   - each partial locale carries a `present` FLOOR, so a locale cannot lose
 *     real translations while its `missing` ceiling still appears satisfied
 *     because the reference set shrank by the same amount.
 *
 * Leaf semantics match the runtime resolver
 * (`src/foundation/i18n/runtime/resolution/translation/index.ts`): only a
 * STRING resolves. A key that is a string in the reference but an object in a
 * target locale cannot be rendered, so it counts as missing, not as present.
 *
 * Usage:
 *   node scripts/i18n-key-parity-gate.mjs           # print the census
 *   node scripts/i18n-key-parity-gate.mjs --check   # exit 1 on any violation
 *   node scripts/i18n-key-parity-gate.mjs --seed    # (re)author the baseline
 */
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const CORE_ROOT = resolve(HERE, '..');
const CONTRACTS_PATH = join(CORE_ROOT, 'src/foundation/i18n/kernel/contracts/index.ts');
const LOCALES_ROOT = join(
  CORE_ROOT,
  'src/foundation/i18n/runtime/catalog/translations/locales'
);

function argValue(flag, fallback) {
  const index = process.argv.indexOf(flag);
  return index >= 0 && process.argv[index + 1] ? process.argv[index + 1] : fallback;
}

const BASELINE_PATH = argValue('--baseline', join(HERE, 'i18n-key-parity-gate.baseline.json'));
/** Overridable so a reviewer can reproduce a failure against a scratch copy of the catalog. */
const LOCALES_PATH = resolve(argValue('--locales-root', LOCALES_ROOT));

/** Namespaces the runtime aggregates into one `LocaleTranslations` object. */
export const NAMESPACES = ['common', 'components', 'errors', 'validation'];

/**
 * Reads `SUPPORTED_LOCALES` straight from the kernel contract rather than
 * duplicating it here, so a locale added to the type system cannot skip this
 * gate.
 */
export function readSupportedLocales(contractsPath = CONTRACTS_PATH) {
  const source = readFileSync(contractsPath, 'utf8');
  const match = source.match(/SUPPORTED_LOCALES\s*=\s*\[([^\]]*)\]\s*as const/);
  if (!match) {
    throw new Error(
      `i18n-key-parity-gate: could not read SUPPORTED_LOCALES from ${contractsPath}`
    );
  }
  const locales = [...match[1].matchAll(/['"]([a-z-]+)['"]/g)].map((entry) => entry[1]);
  if (locales.length === 0) {
    throw new Error('i18n-key-parity-gate: SUPPORTED_LOCALES parsed as empty');
  }
  return locales;
}

/** Flattens one namespace object to `namespace.a.b.c` leaf keys, string leaves only. */
function flattenNamespace(namespace, value, prefix, out, nonStringLeaves) {
  if (typeof value === 'string') {
    out.add(prefix);
    return;
  }
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    // Numbers, booleans, arrays and null cannot be returned by `t()`; record
    // them so a malformed catalog is visible rather than silently absent.
    nonStringLeaves.push(prefix);
    return;
  }
  for (const [childKey, childValue] of Object.entries(value)) {
    flattenNamespace(namespace, childValue, `${prefix}.${childKey}`, out, nonStringLeaves);
  }
}

/** Loads every namespace JSON for one locale and returns its flattened leaf-key set. */
export function loadLocaleKeys(locale, localesRoot = LOCALES_ROOT) {
  const directory = join(localesRoot, locale);
  const keys = new Set();
  const nonStringLeaves = [];
  const missingNamespaces = [];

  for (const namespace of NAMESPACES) {
    const file = join(directory, `${namespace}.json`);
    if (!existsSync(file)) {
      missingNamespaces.push(`${locale}/${namespace}.json`);
      continue;
    }
    let parsed;
    try {
      parsed = JSON.parse(readFileSync(file, 'utf8'));
    } catch (error) {
      throw new Error(`i18n-key-parity-gate: ${locale}/${namespace}.json is not valid JSON — ${error.message}`);
    }
    for (const [childKey, childValue] of Object.entries(parsed)) {
      flattenNamespace(namespace, childValue, `${namespace}.${childKey}`, keys, nonStringLeaves);
    }
  }

  return { keys, nonStringLeaves, missingNamespaces };
}

/** Locale directories physically present on disk (a locale can exist without being declared). */
export function readLocaleDirectories(localesRoot = LOCALES_ROOT) {
  return readdirSync(localesRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
}

export function loadBaseline(baselinePath = BASELINE_PATH) {
  if (!existsSync(baselinePath)) {
    throw new Error(
      `i18n-key-parity-gate: baseline missing at ${baselinePath}; run --seed to author it`
    );
  }
  return JSON.parse(readFileSync(baselinePath, 'utf8'));
}

/**
 * Pure evaluation over an already-loaded catalog, so the gate's own test can
 * drive it with synthetic fixtures instead of the real tree.
 */
export function evaluateParity({ supportedLocales, localeKeys, baseline }) {
  const mandatory = baseline.mandatoryLocales ?? [];
  const partial = baseline.declaredPartialLocales ?? {};

  const failures = [];
  const tightenOpportunities = [];

  const unclassified = supportedLocales.filter(
    (locale) => !mandatory.includes(locale) && !(locale in partial)
  );
  for (const locale of unclassified) {
    failures.push(
      `locale "${locale}" is declared in SUPPORTED_LOCALES but classified neither MANDATORY nor DECLARED-PARTIAL; add it to the baseline with a reason`
    );
  }
  for (const locale of [...mandatory, ...Object.keys(partial)]) {
    if (!supportedLocales.includes(locale)) {
      failures.push(
        `baseline classifies "${locale}" but SUPPORTED_LOCALES no longer declares it; remove the stale entry`
      );
    }
  }

  // Reference = union of the mandatory locales. No privileged source language.
  const reference = new Set();
  for (const locale of mandatory) {
    for (const key of localeKeys[locale]?.keys ?? []) reference.add(key);
  }
  const referenceKeys = [...reference].sort();

  const census = [];
  for (const locale of supportedLocales) {
    const entry = localeKeys[locale];
    if (!entry) {
      failures.push(`locale "${locale}" is declared but has no catalog directory on disk`);
      continue;
    }
    for (const namespaceFile of entry.missingNamespaces) {
      failures.push(`missing namespace file: ${namespaceFile}`);
    }
    for (const leaf of entry.nonStringLeaves) {
      failures.push(
        `${locale}: "${leaf}" is not a string; only string leaves can be returned by t()`
      );
    }

    const missing = referenceKeys.filter((key) => !entry.keys.has(key));
    const extra = [...entry.keys].filter((key) => !reference.has(key)).sort();
    const coverage = referenceKeys.length === 0
      ? 100
      : ((referenceKeys.length - missing.length) / referenceKeys.length) * 100;

    const classification = mandatory.includes(locale)
      ? 'mandatory'
      : locale in partial
        ? 'declared-partial'
        : 'unclassified';

    census.push({
      locale,
      classification,
      present: entry.keys.size,
      missing,
      extra,
      coverage,
    });

    if (classification === 'mandatory' && missing.length > 0) {
      failures.push(
        `MANDATORY locale "${locale}" is missing ${missing.length} key(s) of ${referenceKeys.length} (${coverage.toFixed(1)}% coverage)`
      );
    }

    if (classification === 'declared-partial') {
      const { missing: ceiling, present: floor } = partial[locale];
      if (typeof ceiling !== 'number') {
        failures.push(`baseline entry for "${locale}" has no numeric \`missing\` ceiling`);
      } else if (missing.length > ceiling) {
        failures.push(
          `DECLARED-PARTIAL locale "${locale}" grew: ${missing.length} missing key(s), ceiling is ${ceiling}. A partial locale may only shrink its hole — translate the new keys, or re-seed the baseline to accept the debt deliberately.`
        );
      } else if (missing.length < ceiling) {
        tightenOpportunities.push(
          `"${locale}" is at ${missing.length}/${ceiling} missing — run --seed to lower the ceiling`
        );
      }

      if (typeof floor !== 'number') {
        failures.push(`baseline entry for "${locale}" has no numeric \`present\` floor`);
      } else if (entry.keys.size < floor) {
        failures.push(
          `DECLARED-PARTIAL locale "${locale}" lost translations: ${entry.keys.size} key(s) present, floor is ${floor}. Shrinking the reference set does not license deleting real copy.`
        );
      }
    }

    // An "extra" key in a MANDATORY locale is already reported as a hole in its
    // siblings (the union includes it). In a partial locale it means a key the
    // mandatory set does not define at all: dead copy that no `t()` call can
    // reach through the reference contract.
    if (classification === 'declared-partial' && extra.length > 0) {
      failures.push(
        `locale "${locale}" defines ${extra.length} key(s) absent from every mandatory locale (dead copy): ${extra.slice(0, 5).join(', ')}${extra.length > 5 ? ', …' : ''}`
      );
    }
  }

  const referenceFloor = baseline.referenceKeyCount;
  if (typeof referenceFloor !== 'number') {
    failures.push('baseline has no numeric `referenceKeyCount` floor');
  } else if (referenceKeys.length < referenceFloor) {
    failures.push(
      `the mandatory key corpus SHRANK: ${referenceKeys.length} keys, floor is ${referenceFloor}. Deleting a string from every mandatory locale at once is invisible to the per-locale rule, so it must be re-seeded deliberately with a reason.`
    );
  } else if (referenceKeys.length > referenceFloor) {
    tightenOpportunities.push(
      `the mandatory key corpus grew to ${referenceKeys.length} (floor ${referenceFloor}) — run --seed to raise the floor`
    );
  }

  return {
    referenceKeyCount: referenceKeys.length,
    census,
    failures,
    tightenOpportunities,
    pass: failures.length === 0,
  };
}

export function runI18nKeyParityGate({
  contractsPath = CONTRACTS_PATH,
  localesRoot = LOCALES_ROOT,
  baselinePath = BASELINE_PATH,
} = {}) {
  const supportedLocales = readSupportedLocales(contractsPath);
  const baseline = loadBaseline(baselinePath);

  const localeKeys = {};
  for (const locale of supportedLocales) {
    if (!existsSync(join(localesRoot, locale))) continue;
    localeKeys[locale] = loadLocaleKeys(locale, localesRoot);
  }

  const undeclaredDirectories = readLocaleDirectories(localesRoot).filter(
    (name) => !supportedLocales.includes(name)
  );

  const result = evaluateParity({ supportedLocales, localeKeys, baseline });
  for (const name of undeclaredDirectories) {
    result.failures.push(
      `catalog directory "${name}" exists on disk but is not declared in SUPPORTED_LOCALES`
    );
  }
  result.pass = result.failures.length === 0;
  return result;
}

function seedBaseline(baselinePath) {
  const existing = existsSync(baselinePath)
    ? JSON.parse(readFileSync(baselinePath, 'utf8'))
    : { mandatoryLocales: [], declaredPartialLocales: {} };
  const supportedLocales = readSupportedLocales();
  const localeKeys = {};
  for (const locale of supportedLocales) {
    if (!existsSync(join(LOCALES_ROOT, locale))) continue;
    localeKeys[locale] = loadLocaleKeys(locale);
  }
  const result = evaluateParity({ supportedLocales, localeKeys, baseline: existing });

  const next = {
    _comment: existing._comment,
    referenceKeyCount: result.referenceKeyCount,
    mandatoryLocales: existing.mandatoryLocales,
    declaredPartialLocales: {},
  };
  for (const [locale, entry] of Object.entries(existing.declaredPartialLocales ?? {})) {
    const observed = result.census.find((row) => row.locale === locale);
    next.declaredPartialLocales[locale] = {
      missing: observed ? observed.missing.length : entry.missing,
      present: observed ? observed.present : entry.present,
      reason: entry.reason,
    };
  }
  writeFileSync(baselinePath, `${JSON.stringify(next, null, 2)}\n`);
  console.log(`[i18n-key-parity-gate] seeded ${baselinePath}`);
}

function main() {
  const mode = process.argv.includes('--seed')
    ? 'seed'
    : process.argv.includes('--check')
      ? 'check'
      : 'report';

  if (mode === 'seed') {
    seedBaseline(BASELINE_PATH);
    return;
  }

  const result = runI18nKeyParityGate({ localesRoot: LOCALES_PATH });

  console.log('[i18n-key-parity-gate]');
  console.log(`  reference keys (union of mandatory locales) : ${result.referenceKeyCount}`);
  for (const row of result.census) {
    const label = row.classification === 'mandatory' ? 'MANDATORY      ' : 'DECLARED-PARTIAL';
    console.log(
      `  ${row.locale.padEnd(3)} ${label} ${String(row.present).padStart(4)} present  ${String(row.missing.length).padStart(4)} missing  ${row.coverage.toFixed(1).padStart(5)}%`
    );
  }

  if (mode === 'report') {
    for (const row of result.census) {
      if (row.missing.length === 0) continue;
      console.log(`\n  ${row.locale} missing (${row.missing.length}):`);
      for (const key of row.missing.slice(0, 25)) console.log(`    - ${key}`);
      if (row.missing.length > 25) console.log(`    … and ${row.missing.length - 25} more`);
    }
  }

  for (const opportunity of result.tightenOpportunities) {
    console.log(`[i18n-key-parity-gate] tighten: ${opportunity}`);
  }

  if (result.failures.length > 0) {
    console.error('\n[i18n-key-parity-gate] FAIL:');
    for (const failure of result.failures) console.error(`  - ${failure}`);
    for (const row of result.census) {
      if (row.classification !== 'mandatory' || row.missing.length === 0) continue;
      console.error(`\n  ${row.locale} is missing:`);
      for (const key of row.missing.slice(0, 25)) console.error(`    - ${key}`);
      if (row.missing.length > 25) console.error(`    … and ${row.missing.length - 25} more`);
    }
    console.error(
      '\n  Fix by translating the listed keys into the failing locale, or — for a\n' +
      '  deliberate partial locale — classify it in i18n-key-parity-gate.baseline.json\n' +
      '  with a written reason. A mandatory locale has no baseline escape.'
    );
    if (mode === 'check') process.exit(1);
    return;
  }

  console.log('[i18n-key-parity-gate] OK — every mandatory locale is at 100% and no declared-partial locale grew.');
}

const invokedDirectly =
  process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (invokedDirectly) {
  try {
    main();
  } catch (error) {
    console.error(`[i18n-key-parity-gate] ${error.message}`);
    process.exit(1);
  }
}
