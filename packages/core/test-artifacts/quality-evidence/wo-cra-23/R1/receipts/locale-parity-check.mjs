#!/usr/bin/env node
/**
 * locale-parity-check.mjs — Cohort 1 rank-6 deliverable (stressMatrix.localeParity).
 *
 * WHAT THIS MEASURES. Three DIFFERENT defect classes against
 * `src/foundation/i18n/runtime/catalog/translations/locales/{en,es,ar,fr,pt}/components.json`,
 * reported SEPARATELY because each needs a different fix:
 *
 *   1. MISSING key   -- en has the key, the locale lacks it entirely. t()
 *      falls back through the chain and, when that also misses, echoes the
 *      raw key into the UI.
 *   2. EXTRA key     -- the locale has a key en does not. Dead copy: no
 *      t() call driven by the en-keyed contract can ever reach it.
 *   3. IDENTICAL-TO-EN value -- the key exists in both and DOES resolve, but
 *      the locale's string is byte-identical to en's. This is not a missing
 *      key (it renders fine) -- it is a SUSPECTED untranslated placeholder.
 *      Folding it into "missing" would hide which fix applies (translate a
 *      placeholder vs. author a hole), so it is counted and listed on its
 *      own. This is a MECHANICAL flag, not a linguistic judgement: some
 *      matches are legitimate (proper nouns, numerals, short tokens that are
 *      genuinely the same word in the target language).
 *
 * SCOPE, AND WHY IT DIFFERS FROM THE EXISTING GOVERNED GATE. This script is
 * deliberately EN-ANCHORED ("every key present in en must exist in es, ar,
 * fr, pt") and components.json-ONLY, per the exact task that produced it.
 * The repo already has a governed, CI-facing parity gate at
 * packages/core/scripts/i18n-key-parity-gate.mjs, whose reference set is the
 * UNION of en/es/ar leaf keys (a deliberate "no privileged source language"
 * design, see that file's header) across ALL FOUR namespace files (common,
 * components, errors, validation), with a committed decrease-only ceiling
 * for fr/pt read from i18n-key-parity-gate.baseline.json. That gate is NOT
 * reimplemented or disagreed with here: packages/core/scripts/** is a
 * declared no-write domain this round may not edit ("the round is judged BY
 * this tooling, so a canary lane may not edit its own judge"), and building
 * a second, divergent parity authority would be exactly the duplicate-
 * concept-authority failure the wider program exists to prevent. Instead,
 * this script IMPORTS the governed gate's exported `runI18nKeyParityGate()`
 * read-only (no args, never --seed) to attach its live full-catalog numbers
 * as cross-reference context, and separately reads the committed baseline
 * file for the fr/pt ceiling/floor -- both purely for reporting. Neither the
 * gate script nor the baseline file nor any locale catalog is ever written
 * by this tool.
 *
 * Usage: node locale-parity-check.mjs
 * Writes: ../receipts/cohort-1-locale-parity.json
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
// tools/ -> R1/ -> wo-cra-23/ -> quality-evidence/ -> test-artifacts/ -> core/
const CORE_ROOT = path.resolve(HERE, '../../../../..');
const LOCALES_ROOT = path.join(CORE_ROOT, 'src/foundation/i18n/runtime/catalog/translations/locales');
const NAMESPACE = 'components';
const LOCALES = ['en', 'es', 'ar', 'fr', 'pt'];
const REFERENCE_LOCALE = 'en';

/**
 * Flattens one components.json tree to `a.b.c` leaf keys, string leaves
 * only -- matching the runtime resolver's own semantics (only a STRING
 * resolves; see the governed gate's identical documented rule) so a key
 * this script calls "present" is a key t() can actually return.
 */
function flatten(value, prefix, out, nonStringLeaves) {
  if (typeof value === 'string') {
    out[prefix] = value;
    return;
  }
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    nonStringLeaves.push(prefix);
    return;
  }
  for (const [key, child] of Object.entries(value)) {
    flatten(child, prefix ? `${prefix}.${key}` : key, out, nonStringLeaves);
  }
}

function loadComponents(locale) {
  const file = path.join(LOCALES_ROOT, locale, `${NAMESPACE}.json`);
  if (!existsSync(file)) {
    throw new Error(`locale-parity-check: ${locale}/${NAMESPACE}.json does not exist at ${file}`);
  }
  let parsed;
  try {
    parsed = JSON.parse(readFileSync(file, 'utf8'));
  } catch (error) {
    throw new Error(`locale-parity-check: ${locale}/${NAMESPACE}.json is not valid JSON — ${error.message}`);
  }
  const values = {};
  const nonStringLeaves = [];
  flatten(parsed, '', values, nonStringLeaves);
  return { file, values, nonStringLeaves, leafCount: Object.keys(values).length };
}

const catalogs = {};
for (const locale of LOCALES) catalogs[locale] = loadComponents(locale);

const referenceKeys = Object.keys(catalogs[REFERENCE_LOCALE].values).sort();

const perLocale = {};
for (const locale of LOCALES) {
  const entry = catalogs[locale];
  const localeKeySet = new Set(Object.keys(entry.values));

  const missingKeys = locale === REFERENCE_LOCALE
    ? []
    : referenceKeys.filter((key) => !localeKeySet.has(key));

  const extraKeys = locale === REFERENCE_LOCALE
    ? []
    : Object.keys(entry.values).filter((key) => !referenceKeys.includes(key)).sort();

  const identicalToEn = [];
  if (locale !== REFERENCE_LOCALE) {
    for (const key of referenceKeys) {
      if (!localeKeySet.has(key)) continue; // already counted as missing, not double-reported
      if (entry.values[key] === catalogs[REFERENCE_LOCALE].values[key]) {
        identicalToEn.push({ key, value: entry.values[key] });
      }
    }
  }

  const coveragePercentAgainstEn = referenceKeys.length === 0
    ? 100
    : Number((((referenceKeys.length - missingKeys.length) / referenceKeys.length) * 100).toFixed(2));

  perLocale[locale] = {
    file: path.relative(CORE_ROOT, entry.file),
    leafCount: entry.leafCount,
    nonStringLeaves: entry.nonStringLeaves,
    missingCount: missingKeys.length,
    missingKeys,
    extraCount: extraKeys.length,
    extraKeys,
    identicalToEnCount: identicalToEn.length,
    identicalToEn,
    coveragePercentAgainstEn,
  };
}

/**
 * Read-only cross-reference against the existing governed gate. Importing
 * (not invoking its CLI) means its own `main()` never runs -- `main()` only
 * fires when the module is the direct entry point, which it is not here --
 * so this is a pure function call with zero side effects and zero writes.
 */
let governedGateCrossReference;
try {
  const gateModule = await import(path.join(CORE_ROOT, 'scripts/i18n-key-parity-gate.mjs'));
  const liveResult = gateModule.runI18nKeyParityGate();
  governedGateCrossReference = {
    source: 'packages/core/scripts/i18n-key-parity-gate.mjs, imported read-only (no --seed, no write)',
    scopeDifference: 'ALL FOUR namespaces (common, components, errors, validation), reference = UNION of en+es+ar leaf keys, not en alone. Not directly comparable count-for-count to perLocale above, which is components.json-only and en-anchored; both are reported so they are never conflated.',
    referenceKeyCount: liveResult.referenceKeyCount,
    pass: liveResult.pass,
    failures: liveResult.failures,
    tightenOpportunities: liveResult.tightenOpportunities,
    census: liveResult.census.map((row) => ({
      locale: row.locale,
      classification: row.classification,
      present: row.present,
      missingCount: row.missing.length,
      extraCount: row.extra.length,
      coveragePercent: Number(row.coverage.toFixed(2)),
    })),
  };
} catch (error) {
  governedGateCrossReference = {
    error: `could not import/run the governed gate read-only: ${error.message}`,
    consequence: 'perLocale above (this script\'s own components.json/en-anchored measurement) is unaffected and stands on its own.',
  };
}

let committedBaselineForDeclaredPartialLocales = null;
const baselinePath = path.join(CORE_ROOT, 'scripts/i18n-key-parity-gate.baseline.json');
if (existsSync(baselinePath)) {
  committedBaselineForDeclaredPartialLocales = {
    source: 'packages/core/scripts/i18n-key-parity-gate.baseline.json, read-only, not re-seeded',
    scopeDifference: 'This baseline\'s missing/present numbers are ALL FOUR namespaces combined, not components.json alone.',
    ...JSON.parse(readFileSync(baselinePath, 'utf8')),
  };
}

const receipt = {
  schemaVersion: 1,
  receiptId: 'wo-cra-23-R1-C1-locale-parity',
  generatedBy: 'packages/core/test-artifacts/quality-evidence/wo-cra-23/R1/tools/locale-parity-check.mjs',
  mandate: 'Cohort 1 gap-map rank 6 (stressMatrix.localeParity = [fr, pt]). Measurement only -- no catalog file is read-write, only read.',
  scope: {
    namespace: NAMESPACE,
    namespaceFileScopeNote: 'Each locale directory also has common.json, errors.json and validation.json; those are covered by the existing governed gate (see governedGateCrossReference) but are OUT OF SCOPE for this script by explicit task instruction, which named components.json specifically.',
    locales: LOCALES,
    referenceLocale: REFERENCE_LOCALE,
    referenceKeyCount: referenceKeys.length,
  },
  defectClasses: {
    missing: 'a key en has that the locale entirely lacks.',
    extra: 'a key the locale has that en does not -- dead copy unreachable through the en-keyed contract.',
    identicalToEn: 'the key exists in both and resolves, but the string is byte-identical to en\'s -- a SUSPECTED untranslated placeholder, reported separately from "missing" because it renders and needs a different fix. Mechanical flag, not a linguistic judgement.',
  },
  perLocale,
  governedGateCrossReference,
  committedBaselineForDeclaredPartialLocales,
};

const outPath = path.resolve(HERE, '../receipts/cohort-1-locale-parity.json');
writeFileSync(outPath, `${JSON.stringify(receipt, null, 2)}\n`);

process.stdout.write(`[locale-parity-check] wrote ${path.relative(CORE_ROOT, outPath)}\n`);
process.stdout.write(`[locale-parity-check] reference (en) leaf keys: ${referenceKeys.length}\n`);
for (const locale of LOCALES) {
  const row = perLocale[locale];
  process.stdout.write(
    `  ${locale.padEnd(3)} keys=${String(row.leafCount).padStart(4)}  missing=${String(row.missingCount).padStart(4)}  extra=${String(row.extraCount).padStart(3)}  identicalToEn=${String(row.identicalToEnCount).padStart(3)}  coverage=${String(row.coveragePercentAgainstEn).padStart(6)}%\n`
  );
}
if (governedGateCrossReference?.error) {
  process.stdout.write(`[locale-parity-check] governed-gate cross-reference unavailable: ${governedGateCrossReference.error}\n`);
} else {
  process.stdout.write(`[locale-parity-check] governed gate (all 4 namespaces) pass=${governedGateCrossReference.pass}\n`);
}
