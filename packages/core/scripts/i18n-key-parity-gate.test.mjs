import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  evaluateParity,
  loadLocaleKeys,
  readSupportedLocales,
  runI18nKeyParityGate,
} from './i18n-key-parity-gate.mjs';

/** Builds the `localeKeys` shape `evaluateParity` consumes from plain key lists. */
function catalog(entries) {
  return Object.fromEntries(
    Object.entries(entries).map(([locale, keys]) => [
      locale,
      { keys: new Set(keys), nonStringLeaves: [], missingNamespaces: [] },
    ])
  );
}

const BASELINE = {
  referenceKeyCount: 3,
  mandatoryLocales: ['en', 'es', 'ar'],
  declaredPartialLocales: {
    fr: { missing: 1, present: 2, reason: 'declared partial' },
  },
};

const FULL = ['common.yes', 'common.no', 'components.button.save'];

test('a complete catalog passes', () => {
  const result = evaluateParity({
    supportedLocales: ['en', 'es', 'ar', 'fr'],
    localeKeys: catalog({ en: FULL, es: FULL, ar: FULL, fr: FULL.slice(0, 2) }),
    baseline: BASELINE,
  });
  assert.equal(result.pass, true, result.failures.join('\n'));
});

test('gutting a mandatory locale fails — the regression this gate exists for', () => {
  const result = evaluateParity({
    supportedLocales: ['en', 'es', 'ar', 'fr'],
    localeKeys: catalog({ en: FULL, es: FULL, ar: ['common.yes'], fr: FULL.slice(0, 2) }),
    baseline: BASELINE,
  });
  assert.equal(result.pass, false);
  assert.match(result.failures.join('\n'), /MANDATORY locale "ar" is missing 2 key\(s\) of 3/);
});

test('a key present in only one mandatory locale is a hole in the other two', () => {
  // No privileged source language: the reference is the union, so a key that
  // exists only in Spanish fails English and Arabic rather than passing.
  const result = evaluateParity({
    supportedLocales: ['en', 'es', 'ar', 'fr'],
    localeKeys: catalog({ en: FULL, es: [...FULL, 'common.maybe'], ar: FULL, fr: [] }),
    baseline: BASELINE,
  });
  assert.equal(result.pass, false);
  const joined = result.failures.join('\n');
  assert.match(joined, /MANDATORY locale "en" is missing 1 key\(s\)/);
  assert.match(joined, /MANDATORY locale "ar" is missing 1 key\(s\)/);
});

test('a declared-partial locale does not fail merely for being incomplete', () => {
  const result = evaluateParity({
    supportedLocales: ['en', 'es', 'ar', 'fr'],
    localeKeys: catalog({ en: FULL, es: FULL, ar: FULL, fr: ['common.yes', 'common.no'] }),
    baseline: BASELINE,
  });
  assert.equal(result.pass, true, result.failures.join('\n'));
  assert.equal(result.census.find((row) => row.locale === 'fr').missing.length, 1);
});

test('a declared-partial locale that grows its hole fails', () => {
  const result = evaluateParity({
    supportedLocales: ['en', 'es', 'ar', 'fr'],
    localeKeys: catalog({ en: FULL, es: FULL, ar: FULL, fr: ['common.yes'] }),
    baseline: BASELINE,
  });
  assert.equal(result.pass, false);
  assert.match(result.failures.join('\n'), /"fr" grew: 2 missing key\(s\), ceiling is 1/);
});

test('a declared-partial locale that shrinks its hole reports a tighten opportunity, not a failure', () => {
  const result = evaluateParity({
    supportedLocales: ['en', 'es', 'ar', 'fr'],
    localeKeys: catalog({ en: FULL, es: FULL, ar: FULL, fr: FULL }),
    baseline: BASELINE,
  });
  assert.equal(result.pass, true, result.failures.join('\n'));
  assert.match(result.tightenOpportunities.join('\n'), /"fr" is at 0\/1 missing/);
});

test('deleting a key from EVERY mandatory locale at once still fails via the corpus floor', () => {
  // The per-locale rule cannot see this: the union shrinks with the locales, so
  // all three read as 100%. Only the increase-only corpus floor catches it.
  const shrunk = FULL.slice(0, 2);
  const result = evaluateParity({
    supportedLocales: ['en', 'es', 'ar', 'fr'],
    localeKeys: catalog({ en: shrunk, es: shrunk, ar: shrunk, fr: shrunk.slice(0, 1) }),
    baseline: BASELINE,
  });
  assert.equal(result.pass, false);
  assert.match(result.failures.join('\n'), /mandatory key corpus SHRANK: 2 keys, floor is 3/);
});

test('a partial locale losing real copy fails even when its missing ceiling still holds', () => {
  // Reference shrinks by one AND fr deletes one translation: `missing` stays at
  // its ceiling, so only the `present` floor exposes the deletion.
  const shrunk = FULL.slice(0, 2);
  const result = evaluateParity({
    supportedLocales: ['en', 'es', 'ar', 'fr'],
    localeKeys: catalog({ en: shrunk, es: shrunk, ar: shrunk, fr: ['common.yes'] }),
    baseline: { ...BASELINE, referenceKeyCount: 2 },
  });
  assert.equal(result.pass, false);
  assert.match(result.failures.join('\n'), /"fr" lost translations: 1 key\(s\) present, floor is 2/);
});

test('an unclassified supported locale fails instead of being silently ignored', () => {
  const result = evaluateParity({
    supportedLocales: ['en', 'es', 'ar', 'fr', 'de'],
    localeKeys: catalog({ en: FULL, es: FULL, ar: FULL, fr: FULL.slice(0, 2), de: [] }),
    baseline: BASELINE,
  });
  assert.equal(result.pass, false);
  assert.match(result.failures.join('\n'), /"de" is declared in SUPPORTED_LOCALES but classified neither/);
});

test('a stale baseline entry for an undeclared locale fails', () => {
  const result = evaluateParity({
    supportedLocales: ['en', 'es', 'ar'],
    localeKeys: catalog({ en: FULL, es: FULL, ar: FULL }),
    baseline: BASELINE,
  });
  assert.equal(result.pass, false);
  assert.match(result.failures.join('\n'), /baseline classifies "fr" but SUPPORTED_LOCALES no longer declares it/);
});

test('a non-string leaf fails: only strings can be returned by t()', () => {
  const result = evaluateParity({
    supportedLocales: ['en', 'es', 'ar', 'fr'],
    localeKeys: {
      ...catalog({ en: FULL, es: FULL, ar: FULL, fr: FULL.slice(0, 2) }),
      ar: { keys: new Set(FULL), nonStringLeaves: ['components.pagination.total'], missingNamespaces: [] },
    },
    baseline: BASELINE,
  });
  assert.equal(result.pass, false);
  assert.match(result.failures.join('\n'), /"components\.pagination\.total" is not a string/);
});

test('the real catalog is green and the declared locale set is the one on disk', () => {
  const supported = readSupportedLocales();
  assert.deepEqual([...supported].sort(), ['ar', 'en', 'es', 'fr', 'pt']);

  const result = runI18nKeyParityGate();
  assert.equal(result.pass, true, result.failures.join('\n'));
  for (const row of result.census) {
    if (row.classification !== 'mandatory') continue;
    assert.equal(row.missing.length, 0, `${row.locale} is not at parity`);
  }
});

test('the real Arabic catalog resolves real strings, not placeholders', () => {
  const { keys, nonStringLeaves } = loadLocaleKeys('ar');
  assert.equal(nonStringLeaves.length, 0);
  assert.ok(keys.has('components.button.save'));
});
