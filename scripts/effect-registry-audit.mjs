#!/usr/bin/env node

import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DEFAULT_PROVENANCE_ROOT = resolve(
  REPO_ROOT,
  'packages/core/provenance/effects',
);
const DEFAULT_REGISTRY_SOURCE = resolve(
  REPO_ROOT,
  'packages/core/src/infrastructure/runtime/effects/runtime/registry/index.ts',
);
const requireFromCore = createRequire(resolve(REPO_ROOT, 'packages/core/package.json'));
const ts = requireFromCore('typescript');

const EXPECTED_SOURCES = Object.freeze({
  'react-bits': Object.freeze({
    repository: 'https://github.com/DavidHDev/react-bits',
    revision: '271b49c3ba1db60686e53c8c9a28b7583d5477d5',
    licenseId: 'LicenseRef-MIT-Commons-Clause-1.0',
    licenseSha256: 'f4c33af6739191537738662d223b68d77bc226f4b57ea883e16481d8cc5c73c9',
    licensePathAtRevision: 'LICENSE.md',
    adoptionBoundary: 'restricted-reference-only',
  }),
  'motion-primitives': Object.freeze({
    repository: 'https://github.com/ibelick/motion-primitives',
    revision: '92586e62a951eb9b6bfd1cc7c8a4e6e2ab6ba17d',
    licenseId: 'MIT',
    licenseSha256: 'f668f5ef3635eb906f10b1eea9a32e449eb6e1a183ab6879ef6d56c0980dd2f3',
    licensePathAtRevision: 'LICENCE.md',
    adoptionBoundary: 'reference-only',
  }),
  magicui: Object.freeze({
    repository: 'https://github.com/magicuidesign/magicui',
    revision: '61f1aa5aa28dafa459e7d011e46ce2392b22ee24',
    licenseId: 'MIT',
    licenseSha256: '0147b84235ed916b8b4e89c1f80655351c5afe7d211b629be61f553a227b34ba',
    licensePathAtRevision: 'LICENSE.md',
    adoptionBoundary: 'reference-only',
  }),
  'cult-ui': Object.freeze({
    repository: 'https://github.com/nolly-studio/cult-ui',
    revision: 'a3308bad8496b036adf2fbd29d50b877fb3c5987',
    licenseId: 'MIT',
    licenseSha256: 'd0470e1591e3b0f38e13719d20ef872ee68adbc5fa1a843e0a761ef5bdd5cc63',
    licensePathAtRevision: 'LICENSE.md',
    adoptionBoundary: 'reference-only',
  }),
});

const AUTHORIZED_CERTIFIED_SOURCES = Object.freeze({
  'rottay-ui-design-system': Object.freeze({
    repository: 'https://github.com/rottay/ui-design-system',
    revision: '8015fabaf5fccca7c38c663971b9da2cce8843ab',
    licenseId: 'MIT',
    licenseSha256: '44576d15c34e9b97b6ccc17352b96ddee2d85ff22dcea7e30ab63e05cd5b27e3',
    licensePathAtRevision: 'LICENSE',
    adoptionBoundary: 'first-party-source',
  }),
});

const EXPECTED_LEDGER_SOURCES = Object.freeze({
  ...EXPECTED_SOURCES,
  ...AUTHORIZED_CERTIFIED_SOURCES,
});

const AUTHORIZED_CERTIFICATION = Object.freeze({
  id: 'particle-field',
  tier: 'lab',
  observed: Object.freeze({
    renderer: 'canvas2d',
    loop: 'while-live',
    lazy: true,
  }),
  pauseWhenOffscreen: true,
  pauseWhenPageHidden: true,
  runtimeControl: 'provider-and-instance',
  telemetry: Object.freeze([
    'ds.effect.resolution',
    'ds.effect.transition',
    'particle-field.raf-state',
  ]),
  provenance: Object.freeze({
    verification: 'verified',
    usage: 'source',
    repository: 'https://github.com/rottay/ui-design-system',
    revision: '8015fabaf5fccca7c38c663971b9da2cce8843ab',
    licensePathAtRevision: 'LICENSE',
    licenseId: 'MIT',
    licenseSha256: '44576d15c34e9b97b6ccc17352b96ddee2d85ff22dcea7e30ab63e05cd5b27e3',
    sourceCopied: false,
  }),
  budget: Object.freeze({
    status: 'measured',
    bundleBudgetGzipBytes: 16_384,
    maxLayers: 1,
    maxContinuousLoops: 1,
    evidence: 'packages/core/scripts/analyze-bundle.mjs --effects',
  }),
});

function sha256(bytes) {
  return createHash('sha256').update(bytes).digest('hex');
}

function isInside(parent, candidate) {
  const path = relative(parent, candidate);
  return path !== '..' && !path.startsWith(`..${sep}`) && !path.startsWith(sep);
}

function stableKeys(value) {
  return Object.keys(value).sort();
}

function unwrapExpression(node) {
  let current = node;
  while (
    current
    && (
      ts.isAsExpression(current)
      || ts.isSatisfiesExpression(current)
      || ts.isParenthesizedExpression(current)
    )
  ) {
    current = current.expression;
  }
  return current;
}

function staticPropertyName(name) {
  if (ts.isIdentifier(name) || ts.isStringLiteral(name)) return name.text;
  return null;
}

function staticValue(node) {
  const value = unwrapExpression(node);
  if (ts.isStringLiteral(value) || ts.isNoSubstitutionTemplateLiteral(value)) {
    return value.text;
  }
  if (value.kind === ts.SyntaxKind.TrueKeyword) return true;
  if (value.kind === ts.SyntaxKind.FalseKeyword) return false;
  if (ts.isNumericLiteral(value)) return Number(value.text);
  if (ts.isObjectLiteralExpression(value)) return staticObject(value);
  if (ts.isArrayLiteralExpression(value)) {
    const result = [];
    for (const element of value.elements) {
      const item = staticValue(element);
      if (item === undefined) return undefined;
      result.push(item);
    }
    return result;
  }
  return undefined;
}

function staticObject(node) {
  const value = unwrapExpression(node);
  if (!ts.isObjectLiteralExpression(value)) return null;
  const result = {};
  for (const property of value.properties) {
    if (!ts.isPropertyAssignment(property)) continue;
    const name = staticPropertyName(property.name);
    if (!name) continue;
    const propertyValue = staticValue(property.initializer);
    if (propertyValue !== undefined) result[name] = propertyValue;
  }
  return result;
}

function findStaticArray(sourceFile, variableName) {
  for (const statement of sourceFile.statements) {
    if (!ts.isVariableStatement(statement)) continue;
    for (const declaration of statement.declarationList.declarations) {
      if (!ts.isIdentifier(declaration.name) || declaration.name.text !== variableName) continue;
      let initializer = unwrapExpression(declaration.initializer);
      if (initializer && ts.isCallExpression(initializer)) {
        initializer = unwrapExpression(initializer.arguments[0]);
      }
      if (!initializer || !ts.isArrayLiteralExpression(initializer)) return null;
      return initializer.elements.map(staticObject).filter(Boolean);
    }
  }
  return null;
}

function auditRegistrySource(errors, registrySourcePath) {
  if (!existsSync(registrySourcePath)) {
    errors.push(`effect registry source is missing: ${registrySourcePath}`);
    return { registrySources: 0, certifiedDefinitions: 0 };
  }

  const sourceFile = ts.createSourceFile(
    registrySourcePath,
    readFileSync(registrySourcePath, 'utf8'),
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
  );
  const research = findStaticArray(sourceFile, 'EFFECT_RESEARCH_PROVENANCE');
  const definitions = findStaticArray(sourceFile, 'DEFINITIONS');
  if (!research) errors.push('EFFECT_RESEARCH_PROVENANCE must remain a static audited array');
  if (!definitions) errors.push('DEFINITIONS must remain a static audited array');

  const records = research ?? [];
  if (records.length !== Object.keys(EXPECTED_SOURCES).length) {
    errors.push(
      `registry research inventory drifted; expected ${Object.keys(EXPECTED_SOURCES).length}, found ${records.length}`,
    );
  }
  for (const [sourceId, expected] of Object.entries(EXPECTED_SOURCES)) {
    const record = records.find((candidate) => candidate.repository === expected.repository);
    if (!record) {
      errors.push(`registry research provenance is missing ${sourceId}`);
      continue;
    }
    for (const field of [
      'repository',
      'revision',
      'licenseId',
      'licenseSha256',
      'licensePathAtRevision',
    ]) {
      if (record[field] !== expected[field]) {
        errors.push(
          `registry ${sourceId}.${field} drifted; expected ${expected[field]}, found ${String(record[field])}`,
        );
      }
    }
    if (record.verification !== 'verified') {
      errors.push(`registry ${sourceId}.verification must equal verified`);
    }
    if (record.usage !== 'reference-only' || record.sourceCopied !== false) {
      errors.push(`registry ${sourceId} must remain reference-only and copy-free`);
    }
    const expectedRestriction = expected.adoptionBoundary === 'restricted-reference-only'
      ? 'restricted-reference'
      : undefined;
    if (record.restriction !== expectedRestriction) {
      errors.push(
        `registry ${sourceId}.restriction drifted; expected ${String(expectedRestriction)}, found ${String(record.restriction)}`,
      );
    }
  }

  const certified = (definitions ?? []).filter((definition) => definition.admission === 'certified');
  if (certified.length !== 1) {
    errors.push(`registry must contain exactly one certified definition; found ${certified.length}`);
  }
  const unauthorized = certified.filter(({ id }) => id !== AUTHORIZED_CERTIFICATION.id);
  if (unauthorized.length > 0) {
    errors.push(
      `certified definitions require an audited authorized-source ledger: ${unauthorized.map(({ id }) => id).join(', ')}`,
    );
  }

  const authorized = certified.find(({ id }) => id === AUTHORIZED_CERTIFICATION.id);
  if (!authorized) {
    errors.push(`registry must retain the authorized ${AUTHORIZED_CERTIFICATION.id} certification`);
  } else {
    for (const field of ['tier', 'pauseWhenOffscreen', 'pauseWhenPageHidden']) {
      if (authorized[field] !== AUTHORIZED_CERTIFICATION[field]) {
        errors.push(
          `registry ${authorized.id}.${field} drifted; expected ${AUTHORIZED_CERTIFICATION[field]}, found ${String(authorized[field])}`,
        );
      }
    }
    if (JSON.stringify(authorized.observed) !== JSON.stringify(AUTHORIZED_CERTIFICATION.observed)) {
      errors.push(`registry ${authorized.id}.observed runtime drifted`);
    }
    if (JSON.stringify(authorized.telemetry) !== JSON.stringify(AUTHORIZED_CERTIFICATION.telemetry)) {
      errors.push(`registry ${authorized.id}.telemetry contract drifted`);
    }
    if (authorized.runtimeControl !== AUTHORIZED_CERTIFICATION.runtimeControl) {
      errors.push(
        `registry ${authorized.id}.runtimeControl drifted; expected ${AUTHORIZED_CERTIFICATION.runtimeControl}, found ${String(authorized.runtimeControl)}`,
      );
    }
    if (Object.hasOwn(authorized, 'killSwitch')) {
      errors.push(`registry ${authorized.id} must not restore an app-specific killSwitch`);
    }

    const provenance = authorized.provenance;
    if (!Array.isArray(provenance) || provenance.length !== 1) {
      errors.push(`registry ${authorized.id}.provenance must contain exactly one authorized source`);
    } else {
      const source = provenance[0];
      const expected = AUTHORIZED_CERTIFICATION.provenance;
      if (
        !source
        || JSON.stringify(stableKeys(source)) !== JSON.stringify(stableKeys(expected))
      ) {
        errors.push(`registry ${authorized.id}.provenance shape drifted`);
      } else {
        for (const [field, expectedValue] of Object.entries(expected)) {
          if (source[field] !== expectedValue) {
            errors.push(
              `registry ${authorized.id}.provenance.${field} drifted; expected ${expectedValue}, found ${String(source[field])}`,
            );
          }
        }
      }
    }

    const budget = authorized.budget;
    const expectedBudget = AUTHORIZED_CERTIFICATION.budget;
    if (
      !budget
      || JSON.stringify(stableKeys(budget)) !== JSON.stringify(stableKeys(expectedBudget))
    ) {
      errors.push(`registry ${authorized.id}.budget shape drifted`);
    } else {
      for (const [field, expectedValue] of Object.entries(expectedBudget)) {
        if (budget[field] !== expectedValue) {
          errors.push(
            `registry ${authorized.id}.budget.${field} drifted; expected ${expectedValue}, found ${String(budget[field])}`,
          );
        }
      }
    }
  }

  return {
    registrySources: records.length,
    certifiedDefinitions: certified.length,
  };
}

export function auditEffectProvenance(
  provenanceRoot = DEFAULT_PROVENANCE_ROOT,
  registrySourcePath = DEFAULT_REGISTRY_SOURCE,
) {
  const errors = [];
  const ledgerPath = resolve(provenanceRoot, 'sources.json');
  if (!existsSync(ledgerPath)) {
    throw new Error(`effect provenance ledger is missing: ${ledgerPath}`);
  }

  const ledger = JSON.parse(readFileSync(ledgerPath, 'utf8'));
  if (ledger.schemaVersion !== 1) errors.push('schemaVersion must equal 1');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(ledger.verifiedAt ?? '')) {
    errors.push('verifiedAt must be an ISO calendar date');
  }

  const sources = ledger.sources ?? {};
  const expectedIds = stableKeys(EXPECTED_LEDGER_SOURCES);
  const actualIds = stableKeys(sources);
  if (JSON.stringify(actualIds) !== JSON.stringify(expectedIds)) {
    errors.push(
      `source inventory drifted; expected ${expectedIds.join(', ')}, found ${actualIds.join(', ')}`,
    );
  }

  const referencedLicenses = new Set();
  for (const [sourceId, expected] of Object.entries(EXPECTED_LEDGER_SOURCES)) {
    const source = sources[sourceId];
    if (!source || typeof source !== 'object') continue;

    for (const [field, expectedValue] of Object.entries(expected)) {
      if (field === 'licensePathAtRevision') continue;
      if (source[field] !== expectedValue) {
        errors.push(
          `${sourceId}.${field} drifted; expected ${expectedValue}, found ${String(source[field])}`,
        );
      }
    }
    if (source.sourceCopied !== false) {
      errors.push(`${sourceId}.sourceCopied must remain false`);
    }
    if (!/^[a-f0-9]{40}$/.test(source.revision ?? '')) {
      errors.push(`${sourceId}.revision must be a full 40-character Git hash`);
    }

    const licensePath = resolve(provenanceRoot, source.licenseFile ?? '');
    if (!isInside(provenanceRoot, licensePath)) {
      errors.push(`${sourceId}.licenseFile escapes the provenance directory`);
      continue;
    }
    if (!existsSync(licensePath)) {
      errors.push(`${sourceId}.licenseFile is missing: ${source.licenseFile}`);
      continue;
    }
    referencedLicenses.add(relative(provenanceRoot, licensePath));
    const actualHash = sha256(readFileSync(licensePath));
    if (actualHash !== source.licenseSha256) {
      errors.push(
        `${sourceId} license hash drifted; expected ${source.licenseSha256}, found ${actualHash}`,
      );
    }
  }

  const licenseDirectory = resolve(provenanceRoot, 'licenses');
  const archivedLicenses = readdirSync(licenseDirectory)
    .map((file) => `licenses/${file}`)
    .sort();
  const orphanedLicenses = archivedLicenses.filter(
    (file) => !referencedLicenses.has(file),
  );
  if (orphanedLicenses.length > 0) {
    errors.push(`unreferenced archived licenses: ${orphanedLicenses.join(', ')}`);
  }

  const registry = auditRegistrySource(errors, registrySourcePath);

  if (errors.length > 0) {
    throw new Error(`EffectRegistry provenance audit failed:\n- ${errors.join('\n- ')}`);
  }

  return {
    schemaVersion: ledger.schemaVersion,
    sources: actualIds.length,
    archivedLicenses: archivedLicenses.length,
    sourceCopied: 0,
    registrySources: registry.registrySources,
    certifiedDefinitions: registry.certifiedDefinitions,
  };
}

const invokedPath = process.argv[1] ? resolve(process.argv[1]) : '';
if (invokedPath === fileURLToPath(import.meta.url)) {
  const rootArgumentIndex = process.argv.indexOf('--provenance-root');
  const provenanceRoot = rootArgumentIndex >= 0
    ? resolve(process.argv[rootArgumentIndex + 1] ?? '')
    : DEFAULT_PROVENANCE_ROOT;
  process.stdout.write(`${JSON.stringify(
    auditEffectProvenance(provenanceRoot),
    null,
    2,
  )}\n`);
}
