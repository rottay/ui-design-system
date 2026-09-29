import assert from 'node:assert/strict';
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { test } from 'node:test';

import {
  evaluateAdoption,
  evaluateParity,
  findUserVisibleLiterals,
  loadLocaleKeys,
  measureAdoption,
  measureArgumentlessToLocale,
  moduleI18nFacts,
  pureReExportTargets,
  readSupportedLocales,
  runI18nKeyParityGate,
} from './index.mjs';

/** Writes `files` ({relativePath: text}) under a fresh temp root and returns it. */
function plant(files) {
  const root = mkdtempSync(join(tmpdir(), 'i18n-adoption-'));
  for (const [path, text] of Object.entries(files)) {
    mkdirSync(dirname(join(root, path)), { recursive: true });
    writeFileSync(join(root, path), text);
  }
  return root;
}

const ADOPTION_BASELINE = {
  adoption: { modernFloor: { adopted: 1, total: 2 }, modernTargetPercent: 90 },
  argumentlessToLocale: { ceiling: 1 },
};

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

test('adoption counts index.tsx entrypoints naming a translation hook, with a Modern slice, outside tests/', (t) => {
  const root = plant({
    'patterns/a/engines/modern/index.tsx': "const { t } = useOptionalTranslation('components');",
    'patterns/b/engines/modern/index.tsx': 'export const B = () => null;',
    'patterns/b/engines/classic/index.tsx': "const { t } = useTranslation('components');",
    'patterns/b/engines/modern/tests/index.tsx': "useTranslation('components');",
    'patterns/b/engines/modern/helpers.tsx': "useTranslation('components');",
  });
  t.after(() => rmSync(root, { recursive: true, force: true }));

  const adoption = measureAdoption(root);
  assert.deepEqual(adoption.all, { adopted: 2, total: 3 });
  assert.deepEqual(adoption.modern, { adopted: 1, total: 2 });
  assert.deepEqual(adoption.modernUnadopted, ['patterns/b/engines/modern/index.tsx']);
});

test('a planted Modern entrypoint without a translation hook drops the share below the floor and fails', (t) => {
  const root = plant({
    'a/engines/modern/index.tsx': "useOptionalTranslation('components');",
    'b/engines/modern/index.tsx': 'export {};',
    'c/engines/modern/index.tsx': 'export {};',
  });
  t.after(() => rmSync(root, { recursive: true, force: true }));

  const result = evaluateAdoption({ adoption: measureAdoption(root), toLocaleSites: [], baseline: ADOPTION_BASELINE });
  assert.match(result.failures.join('\n'), /Modern i18n adoption FELL: 1\/3 \(33\.3%\), floor is 1\/2/);
});

test('a Modern share above the floor reports a tighten opportunity and the target verdict, not a failure', () => {
  const result = evaluateAdoption({
    adoption: {
      all: { adopted: 9, total: 10 },
      modern: { adopted: 9, total: 10 },
      modernUnadopted: [],
      modernTextCarrying: { adopted: 9, total: 10 },
    },
    toLocaleSites: ['a.ts:1'],
    baseline: ADOPTION_BASELINE,
  });
  assert.deepEqual(result.failures, []);
  assert.equal(result.targetMet, true);
  assert.match(result.tightenOpportunities.join('\n'), /Modern adoption rose to 9\/10 \(floor 1\/2\)/);
});

test('argument-less toLocale*() lines are counted outside tests/, and a call carrying a locale is not', (t) => {
  const root = plant({
    'a/index.tsx': 'const x = total.toLocaleString();\nconst y = total.toLocaleString(locale);',
    'b/index.ts': "name.toLocaleUpperCase('ar-SA');\ndate.toLocaleDateString();",
    'b/tests/index.test.ts': 'date.toLocaleTimeString();',
  });
  t.after(() => rmSync(root, { recursive: true, force: true }));

  assert.deepEqual(measureArgumentlessToLocale(root), ['a/index.tsx:1', 'b/index.ts:2']);
});

test('a planted argument-less toLocale*() past the ceiling fails', (t) => {
  const root = plant({ 'a/index.tsx': 'a.toLocaleString();\nb.toLocaleDateString();' });
  t.after(() => rmSync(root, { recursive: true, force: true }));

  const result = evaluateAdoption({
    adoption: {
      all: { adopted: 1, total: 2 },
      modern: { adopted: 1, total: 2 },
      modernUnadopted: [],
      modernTextCarrying: { adopted: 1, total: 2 },
    },
    toLocaleSites: measureArgumentlessToLocale(root),
    baseline: ADOPTION_BASELINE,
  });
  assert.match(result.failures.join('\n'), /argument-less toLocale\*\(\) GREW: 2 line\(s\), ceiling is 1/);
});

test('the real tree holds the adoption floor and the toLocale ceiling', () => {
  const result = runI18nKeyParityGate();
  assert.ok(result.adoption.modern.total > 0 && result.adoption.all.total >= result.adoption.modern.total);
  assert.ok(result.toLocaleSites.every((site) => !site.includes('/tests/')));
  assert.equal(result.pass, true, result.failures.join('\n'));
});

test('user-visible literals: JSX text, text attributes and rendered branches count; comments, classes, symbols and t() fallbacks do not', () => {
  const source = [
    '/** <Button title="Doc example">Doc text</Button> */',
    'export const A = ({ busy, i18n, label }) => (',
    '  <Box className="ds-a" data-part="root" aria-label="Close panel">',
    '    Hello world',
    '    {busy ? "Saving" : label}',
    '    {i18n?.t("components.a.done") ?? "Done"}',
    '    {i18n?.tOr("components.a.x", "Fallback")}',
    '    <Input placeholder={label ?? "Search"} title={`Page ${1}`} />',
    '    {" · "}&nbsp;×',
    '  </Box>',
    ');',
  ].join('\n');
  assert.deepEqual(findUserVisibleLiterals(source), [
    '3:Close panel',
    '4:Hello world',
    '5:Saving',
    '8:Search',
    '8:Page',
  ]);
});

test('a pure re-export is measured through its target; a file declaring its own code is not a re-export', (t) => {
  const root = plant({
    'a/runtime/rendering/index.tsx': "const i18n = useOptionalTranslation('common');\nexport default () => <Text>{i18n.t('x')}</Text>;",
    'a/engines/modern/index.tsx': "/** alias */\nexport { default } from '../../runtime/rendering';",
    'b/runtime/rendering/index.tsx': 'export default () => <Text>Plain copy</Text>;',
    'b/engines/modern/index.tsx': "export { default } from '../../runtime/rendering';",
    'c/engines/modern/index.tsx': "export { default } from '../../runtime/rendering';\nexport const extra = 1;",
  });
  t.after(() => rmSync(root, { recursive: true, force: true }));

  assert.deepEqual(pureReExportTargets("export { default } from './x';\nexport * from './y';"), ['./x', './y']);
  assert.equal(pureReExportTargets("export { default } from 'pkg';"), null);
  const a = moduleI18nFacts(join(root, 'a/engines/modern/index.tsx'));
  assert.equal(a.hook, true);
  assert.deepEqual(a.reExportOf, [join(root, 'a/runtime/rendering/index.tsx')]);
  const b = moduleI18nFacts(join(root, 'b/engines/modern/index.tsx'));
  assert.equal(b.hook, false);
  assert.deepEqual(b.literals, ['1:Plain copy']);
  assert.equal(moduleI18nFacts(join(root, 'c/engines/modern/index.tsx')).reExportOf, null);
});

test('text-carrying adoption excludes text-free files, follows re-exports and lists hardcoded and residual copy', (t) => {
  const root = plant({
    'r/runtime/rendering/index.tsx': "useOptionalTranslation('common');",
    'r/engines/modern/index.tsx': "export { default } from '../../runtime/rendering';",
    'adopted/engines/modern/index.tsx': "const i18n = useOptionalTranslation('common');\nexport const A = () => <Text aria-label=\"Left over\">{i18n.t('k')}</Text>;",
    'hardcoded/engines/modern/index.tsx': 'export const H = () => <Text>Only English</Text>;',
    'silent/engines/modern/index.tsx': 'export const S = ({ children }) => <Box>{children}</Box>;',
  });
  t.after(() => rmSync(root, { recursive: true, force: true }));

  const adoption = measureAdoption(root);
  assert.deepEqual(adoption.modern, { adopted: 1, total: 4 });
  assert.deepEqual(adoption.modernFollowed, { adopted: 2, total: 4 });
  assert.deepEqual(adoption.modernReExports, ['r/engines/modern/index.tsx']);
  const carrying = adoption.modernTextCarrying;
  assert.deepEqual([carrying.adopted, carrying.total, carrying.withoutText], [2, 3, 1]);
  assert.deepEqual(carrying.hardcoded, [{ path: 'hardcoded/engines/modern/index.tsx', literals: ['1:Only English'] }]);
  assert.deepEqual(carrying.residual, [{ path: 'adopted/engines/modern/index.tsx', literals: ['2:Left over'] }]);
});

test('the 90% target verdict reads off the text-carrying measure, not the hook-mention share', () => {
  const result = evaluateAdoption({
    adoption: {
      all: { adopted: 1, total: 10 },
      modern: { adopted: 1, total: 10 },
      modernUnadopted: [],
      modernTextCarrying: { adopted: 1, total: 1 },
    },
    toLocaleSites: ['a.ts:1'],
    baseline: ADOPTION_BASELINE,
  });
  assert.equal(result.targetMet, true);
});

test('drill: a hardcoded label planted in a text-free Modern file of a copy of the real tree moves the text-carrying measure by one', (t) => {
  const componentsRoot = resolve(dirname(new URL(import.meta.url).pathname), '../../../src/components');
  const copy = mkdtempSync(join(tmpdir(), 'i18n-drill-'));
  t.after(() => rmSync(copy, { recursive: true, force: true }));
  cpSync(componentsRoot, copy, { recursive: true });

  const before = measureAdoption(copy).modernTextCarrying;
  const target = 'primitives/display/kbd/engines/modern/index.tsx';
  assert.ok(!before.hardcoded.some((row) => row.path === target), 'the drill target must start text-free');
  const planted = readFileSync(join(copy, target), 'utf8') + '\nexport const Drill = () => <Box aria-label="Planted label" />;\n';
  writeFileSync(join(copy, target), planted);

  const after = measureAdoption(copy).modernTextCarrying;
  assert.equal(after.total, before.total + 1);
  assert.equal(after.adopted, before.adopted);
  assert.equal(after.withoutText, before.withoutText - 1);
  assert.deepEqual(after.hardcoded.find((row) => row.path === target)?.literals.at(-1)?.split(':')[1], 'Planted label');
});
