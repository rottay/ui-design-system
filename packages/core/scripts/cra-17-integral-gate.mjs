#!/usr/bin/env node

import { createHash } from 'node:crypto';
import {
  existsSync,
  readFileSync,
  readdirSync,
  realpathSync,
  statSync,
} from 'node:fs';
import { dirname, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

import { auditGraphicsPackaging } from './cra-17-packaging-license-gate.mjs';
import {
  auditPublicDeclarationClosures,
} from './cra-17-public-declaration-gate.mjs';

const SCRIPT_PATH = fileURLToPath(import.meta.url);
const DEFAULT_REPO_ROOT = resolve(dirname(SCRIPT_PATH), '../../..');
const EXPECTED_SUPPLIER = Object.freeze({
  name: 'Phosphor Icons',
  packageName: '@phosphor-icons/react',
  version: '2.1.10',
  license: 'MIT',
});
const EXPECTED_FACADES = Object.freeze([
  {
    assetClass: 'functional-icon',
    facade: 'Icon',
    subpath: './icons',
    entry: 'src/entrypoints/icons/index.ts',
    owner: 'src/graphics/icons/presentation/semantic-icon/index.tsx',
  },
  {
    assetClass: 'brand-mark',
    facade: 'BrandMark',
    subpath: './marks/brand',
    entry: 'src/entrypoints/graphics/marks/brand/index.ts',
    owner: 'src/graphics/brand-marks/presentation/brand-mark/index.tsx',
  },
  {
    assetClass: 'cloud-service-mark',
    facade: 'CloudServiceMark',
    subpath: './marks/cloud',
    entry: 'src/entrypoints/graphics/marks/cloud/index.ts',
    owner: 'src/graphics/brand-marks/presentation/cloud-service-mark/index.tsx',
  },
  {
    assetClass: 'feature-pictogram',
    facade: 'FeaturePictogram',
    subpath: './pictograms',
    entry: 'src/entrypoints/graphics/pictograms/index.ts',
    owner: 'src/graphics/pictograms/presentation/feature-pictogram/index.tsx',
  },
]);
const EXPECTED_BUNDLE_FIXTURES = Object.freeze({
  namedSemanticRole: {
    subpath: './icons/roles/action-add',
    exportName: 'ActionAddIcon',
  },
  bithirePreset: {
    subpath: './icons/presets/bithire',
    exportName: 'BitHireIconPreset',
  },
  dynamicIconFull: { subpath: './icons/full', exportName: 'Icon' },
  brandMark: { subpath: './marks/brand', exportName: 'BrandMark' },
  cloudServiceMark: {
    subpath: './marks/cloud',
    exportName: 'CloudServiceMark',
  },
  featurePictogram: {
    subpath: './pictograms',
    exportName: 'FeaturePictogram',
  },
});
const SOURCE_EXTENSIONS = /\.(?:cjs|css|js|json|jsx|mjs|ts|tsx)$/u;
const TEST_PATH = /(?:^|\/)(?:__tests__|tests|stories)(?:\/|$)|\.(?:spec|stories|test)\.[^.]+$/u;
const LUCIDE_TEXT = /lucide/iu;
const LUCIDE_RULE_PATH = /packages\/core\/src\/tooling\/eslint\//u;
const CONFIG_PATH = /(?:^|\/)(?:\.npmrc|package\.json|supplier-contract\.json|tsconfig(?:\.[^/]+)?\.json|(?:[^/]+\.)?config\.(?:cjs|js|json|mjs|ts))$/u;

function portable(path, root) {
  return relative(root, path).split(sep).join('/');
}

function sha256(value) {
  return createHash('sha256').update(value).digest('hex');
}

function same(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}

function readJson(path, errors, label) {
  if (!existsSync(path)) {
    errors.push(`${label} is missing: ${path}`);
    return null;
  }
  try {
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch (error) {
    errors.push(`${label} is not valid JSON: ${error.message}`);
    return null;
  }
}

function filesBelow(root, predicate = () => true) {
  if (!existsSync(root)) return [];
  const files = [];
  for (const entry of readdirSync(root, { withFileTypes: true })) {
    const path = resolve(root, entry.name);
    if (entry.isDirectory()) {
      if (['.next', 'dist', 'node_modules'].includes(entry.name)) continue;
      files.push(...filesBelow(path, predicate));
    } else if (entry.isFile() && predicate(path)) {
      files.push(path);
    }
  }
  return files;
}

function lineNumbers(source, pattern) {
  const lines = [];
  source.split(/\r?\n/u).forEach((line, index) => {
    if (pattern.test(line)) lines.push(index + 1);
  });
  return lines;
}

function addCheck(checks, name, errors, pending = [], details = {}) {
  checks[name] = {
    status: errors.length > 0 ? 'fail' : pending.length > 0 ? 'pending' : 'pass',
    errors,
    pending,
    ...details,
  };
}

export function auditNoLucideBoundary({ repoRoot, paths } = {}) {
  const root = resolve(repoRoot ?? DEFAULT_REPO_ROOT);
  const coreRoot = resolve(root, 'packages/core');
  const showroomRoot = resolve(root, 'packages/showroom');
  const discoveredPackageConfigs = filesBelow(
    resolve(root, 'packages'),
    (path) => CONFIG_PATH.test(path),
  );
  const exactPaths = [
    resolve(root, '.changeset/config.json'),
    resolve(root, '.npmrc'),
    resolve(root, 'package.json'),
    resolve(root, 'pnpm-lock.yaml'),
    resolve(root, 'pnpm-workspace.yaml'),
    resolve(coreRoot, 'package.json'),
    resolve(coreRoot, 'supplier-contract.json'),
    resolve(coreRoot, 'THIRD_PARTY_NOTICES.md'),
    resolve(coreRoot, 'provenance/graphics/pack-allowlist.json'),
    resolve(coreRoot, 'tsconfig.json'),
    resolve(coreRoot, 'vite.config.ts'),
    resolve(coreRoot, 'vitest.config.ts'),
    resolve(showroomRoot, 'package.json'),
    resolve(showroomRoot, 'next.config.ts'),
    resolve(showroomRoot, 'tsconfig.json'),
    ...discoveredPackageConfigs,
  ];
  const sourcePaths = [
    ...filesBelow(resolve(coreRoot, 'src'), (path) => SOURCE_EXTENSIONS.test(path)),
    ...filesBelow(resolve(showroomRoot, 'src'), (path) => SOURCE_EXTENSIONS.test(path)),
  ];
  const candidates = paths ?? [...exactPaths, ...sourcePaths];
  const violations = [];

  for (const path of [...new Set(candidates.map((candidate) => resolve(candidate)))].sort()) {
    if (!existsSync(path) || !statSync(path).isFile()) continue;
    const display = portable(path, root);
    if (TEST_PATH.test(display) || LUCIDE_RULE_PATH.test(display)) continue;
    const source = readFileSync(path, 'utf8');
    let scanned = source;
    if (display === 'packages/core/supplier-contract.json') {
      // Ruling R1a (2026-07-18): 'lucide-react' stays listed in the contract's
      // supplierPackages because the tracking feeds live governance/ban machinery
      // (app-side supplier audits, the runtime-alias expectation, the showroom
      // marketing exception). That single governance entry is the ONLY sanctioned
      // mention; a lucide token anywhere else in the contract (an entrypoint
      // wildcard claim or a symbol attribution) is supplier reintroduction and
      // must fail this boundary. Scan a copy with that one entry removed.
      try {
        const contract = JSON.parse(source);
        if (Array.isArray(contract.supplierPackages)) {
          contract.supplierPackages = contract.supplierPackages.filter(
            (name) => name !== 'lucide-react',
          );
        }
        scanned = JSON.stringify(contract, null, 2);
      } catch {
        scanned = source;
      }
    }
    if (!LUCIDE_TEXT.test(scanned)) continue;
    const lines = lineNumbers(source, LUCIDE_TEXT);
    violations.push({
      path: display,
      occurrences: lines.length,
      lines: lines.slice(0, 8),
    });
  }

  return violations;
}

function auditSupplierAndCatalog(repoRoot, errors) {
  const coreRoot = resolve(repoRoot, 'packages/core');
  const decisionPath = resolve(
    repoRoot,
    'test-artifacts/craft/cra-17/icon-supplier-decision.json',
  );
  const decision = readJson(decisionPath, errors, 'CRA17 supplier decision');
  const packageManifest = readJson(
    resolve(coreRoot, 'package.json'),
    errors,
    'core package manifest',
  );
  if (!decision || !packageManifest) return { canonicalRoles: 0, catalogRoles: 0 };

  if (decision.workOrder !== 'WO-CRA-17') errors.push('supplier decision workOrder must be WO-CRA-17');
  if (!same(decision.decision?.selectedSupplier, EXPECTED_SUPPLIER)) {
    errors.push(
      `selected supplier drifted; expected ${JSON.stringify(EXPECTED_SUPPLIER)}, ` +
      `found ${JSON.stringify(decision.decision?.selectedSupplier)}`,
    );
  }
  if (decision.decision?.visualSuperiorityClaim !== false) {
    errors.push('supplier decision must not claim unreviewed visual superiority');
  }
  for (const field of [
    'visualMatrixComplete',
    'workOrderComplete',
    'dsImp090Complete',
    'dsImp091Complete',
  ]) {
    if (decision.claimBoundaries?.[field] !== false) {
      errors.push(`supplier decision claimBoundaries.${field} must remain false`);
    }
  }
  if (
    packageManifest.devDependencies?.[EXPECTED_SUPPLIER.packageName]
    !== EXPECTED_SUPPLIER.version
  ) {
    errors.push(
      `${EXPECTED_SUPPLIER.packageName} must be development-pinned exactly to ` +
      `${EXPECTED_SUPPLIER.version}`,
    );
  }

  const adapter = readJson(
    resolve(
      coreRoot,
      'src/graphics/icons/foundation/semantic/adapters/phosphor-2.1.10.json',
    ),
    errors,
    'Phosphor adapter',
  );
  const corpus = readJson(
    resolve(coreRoot, 'src/graphics/icons/foundation/semantic/corpus/manifest.json'),
    errors,
    'semantic icon corpus',
  );
  if (!adapter || !corpus) return { canonicalRoles: 0, catalogRoles: 0 };

  if (
    adapter.packageName !== EXPECTED_SUPPLIER.packageName
    || adapter.packageVersion !== EXPECTED_SUPPLIER.version
  ) {
    errors.push('semantic adapter is not pinned to @phosphor-icons/react@2.1.10');
  }
  const adapterIds = (adapter.entries ?? []).map(({ id }) => id);
  const corpusIds = (corpus.entries ?? []).map(({ id }) => id);
  if (adapterIds.length === 0 || new Set(adapterIds).size !== adapterIds.length) {
    errors.push('semantic adapter ids must be a non-empty unique catalog');
  }
  if (corpusIds.length === 0 || new Set(corpusIds).size !== corpusIds.length) {
    errors.push('semantic corpus ids must be a non-empty unique catalog');
  }
  if (!same([...adapterIds].sort(), [...corpusIds].sort())) {
    errors.push('semantic corpus and Phosphor adapter id inventories drifted');
  }

  const categories = decision.canonicalCorpus?.categories;
  const canonicalRoles = Array.isArray(categories)
    ? categories.flatMap(({ roles }) => (Array.isArray(roles) ? roles : []))
    : [];
  if (decision.canonicalCorpus?.roleCount !== 40 || canonicalRoles.length !== 40) {
    errors.push('canonical optical corpus must contain exactly 40 roles');
  }
  if (new Set(canonicalRoles).size !== canonicalRoles.length) {
    errors.push('canonical optical corpus roles must be unique');
  }
  for (const role of canonicalRoles) {
    if (adapterIds.filter((id) => id === role).length !== 1) {
      errors.push(`canonical role ${role} must exist exactly once in the Phosphor adapter`);
    }
    if (corpusIds.filter((id) => id === role).length !== 1) {
      errors.push(`canonical role ${role} must exist exactly once in the semantic corpus`);
    }
  }

  return { canonicalRoles: canonicalRoles.length, catalogRoles: corpusIds.length };
}

function auditFacades(repoRoot, errors) {
  const coreRoot = resolve(repoRoot, 'packages/core');
  const packageManifest = readJson(
    resolve(coreRoot, 'package.json'),
    errors,
    'core package manifest',
  );
  if (!packageManifest) return { facades: 0 };

  for (const facade of EXPECTED_FACADES) {
    const definition = packageManifest.exports?.[facade.subpath];
    if (!definition) {
      errors.push(`${facade.subpath} public export is missing`);
    } else {
      for (const [condition, suffix] of [
        ['types', '.d.ts'],
        ['import', '.js'],
        ['require', '.cjs'],
      ]) {
        const target = definition[condition];
        if (typeof target !== 'string' || !target.endsWith(suffix)) {
          errors.push(`${facade.subpath}.${condition} must target ${suffix}`);
        }
      }
    }
    const entryPath = resolve(coreRoot, facade.entry);
    const ownerPath = resolve(coreRoot, facade.owner);
    if (!existsSync(entryPath)) errors.push(`${facade.facade} public entry is missing: ${facade.entry}`);
    if (!existsSync(ownerPath)) {
      errors.push(`${facade.facade} owner is missing: ${facade.owner}`);
    } else if (!new RegExp(`\\b${facade.facade}\\b`, 'u').test(readFileSync(ownerPath, 'utf8'))) {
      errors.push(`${facade.facade} owner does not declare the facade`);
    }
  }
  if (new Set(EXPECTED_FACADES.map(({ assetClass }) => assetClass)).size !== 4) {
    errors.push('the four public facades must own four distinct asset classes');
  }
  return { facades: EXPECTED_FACADES.length };
}

function auditPackaging(repoRoot, errors) {
  try {
    return auditGraphicsPackaging({ coreRoot: resolve(repoRoot, 'packages/core') });
  } catch (error) {
    errors.push(error.message);
    return null;
  }
}

function auditDeclarations(repoRoot, errors, pending) {
  const coreRoot = resolve(repoRoot, 'packages/core');
  if (!existsSync(resolve(coreRoot, 'dist'))) {
    pending.push('public declaration closure requires a fresh dist before final certification');
    return { entrypoints: 0, files: 0 };
  }
  const result = auditPublicDeclarationClosures(coreRoot);
  errors.push(...result.errors.map((error) => `public declarations: ${error}`));
  return {
    entrypoints: Object.keys(result.entrypoints).length,
    files: result.files,
  };
}

function auditBundleRetention(repoRoot, errors, pending) {
  const coreRoot = resolve(repoRoot, 'packages/core');
  const artifact = readJson(
    resolve(repoRoot, 'test-artifacts/craft/cra-17/bundle-retention.json'),
    errors,
    'CRA17 bundle retention artifact',
  );
  const packageManifest = readJson(
    resolve(coreRoot, 'package.json'),
    errors,
    'core package manifest',
  );
  const presetManifest = readJson(
    resolve(coreRoot, 'src/graphics/icons/foundation/semantic/presets/bithire/manifest.json'),
    errors,
    'BitHire icon preset manifest',
  );
  if (!artifact || !packageManifest || !presetManifest) return { fixtures: 0, formats: 0 };

  if (artifact.workOrder !== 'WO-CRA-17') errors.push('bundle retention workOrder must be WO-CRA-17');
  if (artifact.summary?.passed !== true || artifact.summary?.failingFormatFixtures !== 0) {
    errors.push('bundle retention summary must be green with zero failing formats');
  }
  if (artifact.reproducibility?.requiresExistingDist !== true) {
    errors.push('bundle retention must declare its existing-dist boundary');
  }
  if (artifact.producerVersion !== packageManifest.version) {
    pending.push(
      `bundle retention is stale: artifact ${String(artifact.producerVersion)}, ` +
      `package ${String(packageManifest.version)}`,
    );
  }

  const fixtures = artifact.fixtures ?? {};
  const actualFixtureNames = Object.keys(fixtures).sort();
  const expectedFixtureNames = Object.keys(EXPECTED_BUNDLE_FIXTURES).sort();
  if (!same(actualFixtureNames, expectedFixtureNames)) {
    errors.push(
      `bundle fixture inventory drifted; expected ${expectedFixtureNames.join(', ')}, ` +
      `found ${actualFixtureNames.join(', ')}`,
    );
  }
  let formats = 0;
  for (const [name, expected] of Object.entries(EXPECTED_BUNDLE_FIXTURES)) {
    const fixture = fixtures[name];
    if (!fixture) continue;
    if (
      fixture.publicSubpath !== expected.subpath
      || fixture.selectedExport !== expected.exportName
    ) {
      errors.push(`${name} does not retain ${expected.subpath}:${expected.exportName}`);
    }
    const formatNames = Object.keys(fixture.formats ?? {}).sort();
    if (!same(formatNames, ['cjs', 'esm'])) {
      errors.push(`${name} must retain independent ESM and CJS evidence`);
      continue;
    }
    for (const formatName of formatNames) {
      formats += 1;
      const format = fixture.formats[formatName];
      if (format.passed !== true) errors.push(`${name}.${formatName} bundle evidence is red`);
      if (format.groups?.lucideCompatibility !== 0) {
        errors.push(`${name}.${formatName} retains Lucide compatibility modules`);
      }
      const retained = Array.isArray(format.retainedModuleIds) ? format.retainedModuleIds : [];
      const external = Array.isArray(format.externalImports) ? format.externalImports : [];
      if ([...retained, ...external].some((value) => LUCIDE_TEXT.test(String(value)))) {
        errors.push(`${name}.${formatName} retains a Lucide module or external import`);
      }
      if (format.enforced === true && format.passed === true) {
        if (
          !Number.isFinite(format.gzipBytes)
          || !Number.isFinite(format.budgetGzipBytes)
          || format.gzipBytes > format.budgetGzipBytes
        ) {
          errors.push(`${name}.${formatName} exceeds its enforced gzip budget`);
        }
      }
    }
  }

  const expectedPresetCount = presetManifest.expectedCount;
  const presetLabel = fixtures.bithirePreset?.label ?? '';
  if (!new RegExp(`\\(${String(expectedPresetCount)} selected roles\\)`, 'u').test(presetLabel)) {
    pending.push(
      `BitHire bundle fixture is stale: expected current ${String(expectedPresetCount)}-role preset`,
    );
  }
  return { fixtures: actualFixtureNames.length, formats };
}

export function auditOpticalMatrix({ repoRoot } = {}) {
  const root = resolve(repoRoot ?? DEFAULT_REPO_ROOT);
  const errors = [];
  const pending = [];
  const decision = readJson(
    resolve(root, 'test-artifacts/craft/cra-17/icon-supplier-decision.json'),
    errors,
    'CRA17 supplier decision',
  );
  const matrixRoot = resolve(root, 'test-artifacts/craft/cra-17/optical-matrix');
  const manifest = readJson(
    resolve(matrixRoot, 'capture-manifest.json'),
    errors,
    'CRA17 optical matrix manifest',
  );
  if (!decision || !manifest) return { errors, pending, captures: 0, roleCells: 0 };

  const required = decision.requiredMatrix ?? {};
  for (const [decisionField, manifestField] of [
    ['sizesPx', 'sizesPx'],
    ['engines', 'engines'],
    ['colorSchemes', 'schemes'],
    ['formFactors', 'formFactors'],
  ]) {
    const manifestValue = manifestField === 'formFactors'
      ? [manifest.formFactor]
      : manifest[manifestField];
    if (!same(required[decisionField], manifestValue)) {
      errors.push(`optical matrix ${manifestField} drifted from the supplier decision`);
    }
  }
  const expectedTenantContexts = (required.brandContexts ?? []).map(({ id }) => (
    id === 'the-management' ? 'themanagementmiami' : id
  ));
  if (!same(expectedTenantContexts, manifest.tenantContexts)) {
    errors.push('optical matrix tenant contexts drifted from the supplier decision');
  }
  const roleCount = decision.canonicalCorpus?.roleCount;
  if (manifest.roleCount !== roleCount) errors.push('optical matrix roleCount drifted');
  const requiredRoleCells = roleCount
    * (required.sizesPx?.length ?? 0)
    * (required.engines?.length ?? 0)
    * (required.colorSchemes?.length ?? 0)
    * (required.formFactors?.length ?? 0)
    * (required.brandContexts?.length ?? 0);
  if (
    requiredRoleCells !== required.requiredRoleCells
    || manifest.requiredRoleCells !== requiredRoleCells
    || manifest.recordedRoleCells !== requiredRoleCells
  ) {
    errors.push(`optical matrix must record all ${String(requiredRoleCells)} required role cells`);
  }

  const captures = Array.isArray(manifest.captures) ? manifest.captures : [];
  const expectedCaptureCount = (required.engines?.length ?? 0)
    * (required.colorSchemes?.length ?? 0)
    * (required.formFactors?.length ?? 0)
    * (required.brandContexts?.length ?? 0);
  if (manifest.screenshotCount !== expectedCaptureCount || captures.length !== expectedCaptureCount) {
    errors.push(`optical matrix must contain exactly ${String(expectedCaptureCount)} captures`);
  }
  const keys = new Set();
  let recordedRoleCells = 0;
  for (const capture of captures) {
    const key = [capture.tenant, capture.engine, capture.theme].join('/');
    if (keys.has(key)) errors.push(`duplicate optical matrix capture ${key}`);
    keys.add(key);
    const expectedCells = roleCount * (required.sizesPx?.length ?? 0);
    if (capture.roleCells !== expectedCells) {
      errors.push(`${capture.file} must contain ${String(expectedCells)} role cells`);
    }
    recordedRoleCells += capture.roleCells ?? 0;
    const path = resolve(matrixRoot, capture.file ?? '');
    if (!existsSync(path) || !statSync(path).isFile()) {
      errors.push(`optical capture is missing: ${String(capture.file)}`);
      continue;
    }
    const bytes = readFileSync(path);
    if (bytes.length !== capture.bytes) errors.push(`${capture.file} byte count drifted`);
    if (sha256(bytes) !== capture.sha256) errors.push(`${capture.file} SHA-256 drifted`);
  }
  if (recordedRoleCells !== requiredRoleCells) {
    errors.push(`capture role-cell sum must equal ${String(requiredRoleCells)}`);
  }

  const review = manifest.sightedReview;
  if (review === 'pending' || review?.status === 'pending') {
    pending.push('sightedReview is pending; CRA17 is not completion-eligible');
  } else if (
    !review
    || review.status !== 'approved'
    || typeof review.reviewer !== 'string'
    || review.reviewer.trim().length === 0
    || !/^\d{4}-\d{2}-\d{2}$/u.test(review.reviewedOn ?? '')
    || review.verdict !== 'pass'
    || !same(
      [...(review.reviewedCaptures ?? [])].sort(),
      captures.map(({ file }) => file).sort(),
    )
  ) {
    errors.push(
      'sightedReview must be pending or a complete approved review with reviewer, ' +
      'reviewedOn, pass verdict, and the exact reviewed capture inventory',
    );
  }

  return {
    errors,
    pending,
    captures: captures.length,
    roleCells: recordedRoleCells,
  };
}

function auditRoadmapTruth(repoRoot, errors, pending, sightedPending) {
  const registry = readJson(
    resolve(repoRoot, 'roadmap/registry.json'),
    errors,
    'roadmap registry',
  );
  if (!registry) return { status: 'missing', phase: 'missing' };
  const workOrder = registry.workOrders?.find(({ id }) => id === 'WO-CRA-17');
  if (!workOrder) {
    errors.push('WO-CRA-17 is missing from roadmap registry');
    return { status: 'missing', phase: 'missing' };
  }
  if (sightedPending && workOrder.status === 'done') {
    errors.push('WO-CRA-17 cannot be done while sightedReview is pending');
  }
  if (workOrder.evidence && sightedPending) {
    errors.push('WO-CRA-17 cannot carry completion evidence while sightedReview is pending');
  }
  const traceability = registry.traceability?.['ds-improvements'];
  for (const sourceId of ['DS-IMP-090', 'DS-IMP-091']) {
    const source = traceability?.items?.find?.(({ id }) => id === sourceId)
      ?? traceability?.sourceItems?.find?.(({ id }) => id === sourceId)
      ?? traceability?.entries?.find?.(({ id }) => id === sourceId);
    if (source && source.authority !== 'WO-CRA-17') {
      errors.push(`${sourceId} authority must remain WO-CRA-17`);
    }
  }
  const phase = traceability?.phaseControls?.['2B'];
  if (phase?.claimState !== 'open' || phase?.ownerGo?.decision !== 'go') {
    pending.push('roadmap phase 2B remains locked without explicit owner GO');
  }
  return {
    workOrderStatus: workOrder.status,
    phase: phase?.claimState ?? 'unknown',
  };
}

export function resolveCra17GateDisposition({ mode, errors, pending }) {
  if (!['final', 'structural'].includes(mode)) {
    throw new Error(`unknown CRA17 gate mode: ${mode}`);
  }
  const structurallyPassed = errors.length === 0;
  const completionEligible = structurallyPassed && pending.length === 0;
  return {
    passed: mode === 'structural' ? structurallyPassed : completionEligible,
    structurallyPassed,
    completionEligible,
  };
}

export function auditCra17Integral({ repoRoot, mode = 'final' } = {}) {
  if (!['final', 'structural'].includes(mode)) {
    throw new Error(`unknown CRA17 gate mode: ${mode}`);
  }
  const root = resolve(repoRoot ?? DEFAULT_REPO_ROOT);
  const checks = {};

  const supplierErrors = [];
  const supplier = auditSupplierAndCatalog(root, supplierErrors);
  addCheck(checks, 'supplierAndCatalog', supplierErrors, [], supplier);

  const lucideViolations = auditNoLucideBoundary({ repoRoot: root });
  const lucideErrors = lucideViolations.map(({ path, occurrences, lines }) => (
    `${path} contains ${String(occurrences)} Lucide reference(s) at lines ${lines.join(', ')}`
  ));
  addCheck(checks, 'noLucideBoundary', lucideErrors, [], {
    filesWithViolations: lucideViolations.length,
  });

  const facadeErrors = [];
  const facades = auditFacades(root, facadeErrors);
  addCheck(checks, 'fourFacades', facadeErrors, [], facades);

  const packagingErrors = [];
  const packaging = auditPackaging(root, packagingErrors);
  addCheck(checks, 'provenanceAndLicenses', packagingErrors, [], {
    evidence: packaging,
  });

  const declarationErrors = [];
  const declarationPending = [];
  const declarations = auditDeclarations(root, declarationErrors, declarationPending);
  addCheck(
    checks,
    'publicDeclarations',
    declarationErrors,
    declarationPending,
    declarations,
  );

  const bundleErrors = [];
  const bundlePending = [];
  const bundle = auditBundleRetention(root, bundleErrors, bundlePending);
  addCheck(checks, 'bundleRetention', bundleErrors, bundlePending, bundle);

  const optical = auditOpticalMatrix({ repoRoot: root });
  addCheck(
    checks,
    'opticalMatrix',
    optical.errors,
    optical.pending,
    { captures: optical.captures, roleCells: optical.roleCells },
  );

  const roadmapErrors = [];
  const roadmapPending = [];
  const roadmap = auditRoadmapTruth(
    root,
    roadmapErrors,
    roadmapPending,
    optical.pending.length > 0,
  );
  addCheck(checks, 'roadmapTruth', roadmapErrors, roadmapPending, roadmap);

  const errors = Object.entries(checks).flatMap(([name, check]) => (
    check.errors.map((error) => `${name}: ${error}`)
  ));
  const pending = Object.entries(checks).flatMap(([name, check]) => (
    check.pending.map((item) => `${name}: ${item}`)
  ));
  const disposition = resolveCra17GateDisposition({ mode, errors, pending });

  return {
    schemaVersion: 1,
    workOrder: 'WO-CRA-17',
    mode,
    ...disposition,
    selectedSupplier: EXPECTED_SUPPLIER,
    checks,
    errors,
    pending,
    claimBoundaries: {
      workOrderComplete: false,
      sourceItemsClosed: [],
    },
  };
}

function runCli() {
  const mode = process.argv.includes('--structural') ? 'structural' : 'final';
  const result = auditCra17Integral({ mode });
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  if (!result.passed) {
    const kind = result.errors.length > 0 ? 'structural failures' : 'pending final evidence';
    throw new Error(
      `WO-CRA-17 integral gate is not ${mode === 'final' ? 'completion-eligible' : 'green'}: ` +
      `${String(result.errors.length)} error(s), ${String(result.pending.length)} pending item(s) ` +
      `(${kind})`,
    );
  }
}

const invokedAsScript = process.argv[1]
  && realpathSync(process.argv[1]) === realpathSync(SCRIPT_PATH);
if (invokedAsScript) {
  try {
    runCli();
  } catch (error) {
    process.stderr.write(`WO-CRA-17 integral gate: FAIL\n${error.stack ?? error.message}\n`);
    process.exitCode = 1;
  }
}
