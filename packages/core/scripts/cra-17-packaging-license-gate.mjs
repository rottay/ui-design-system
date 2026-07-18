#!/usr/bin/env node

import { createHash } from 'node:crypto';
import {
  existsSync,
  readFileSync,
  readdirSync,
} from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT_PATH = fileURLToPath(import.meta.url);
const DEFAULT_CORE_ROOT = resolve(dirname(SCRIPT_PATH), '..');
const DEFAULT_MANIFEST_PATH = resolve(
  DEFAULT_CORE_ROOT,
  'provenance/graphics/pack-allowlist.json',
);
const VALID_LICENSES = new Set([
  'MIT',
  'ISC',
  'CC0-1.0',
  'CC-BY-ND-2.0',
  'LicenseRef-Rottay-Original-Product-Asset-1.0',
]);
const AWS_LICENSE = 'CC-BY-ND-2.0';
const AWS_LICENSE_URL = 'https://creativecommons.org/licenses/by-nd/2.0/';
const AWS_TRADEMARK_URL = 'https://aws.amazon.com/trademark-guidelines/';
const AWS_RENDERING_POLICY =
  'pinned-upstream-component-existing-optical-variants-only';
const LOCAL_ARTWORK_TAGS = new Set([
  'circle',
  'ellipse',
  'g',
  'line',
  'path',
  'polygon',
  'polyline',
  'rect',
  'svg',
]);

function sha256(value) {
  return createHash('sha256').update(value).digest('hex');
}

function isInside(parent, candidate) {
  const path = relative(parent, candidate);
  return path !== '..' && !path.startsWith(`..${sep}`) && !path.startsWith(sep);
}

function stable(values) {
  return [...values].sort((left, right) => left.localeCompare(right));
}

function same(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}

function compare(errors, label, expected, actual) {
  if (!same(expected, actual)) {
    errors.push(
      `${label} drifted; expected ${JSON.stringify(expected)}, found ${JSON.stringify(actual)}`,
    );
  }
}

function normalizeLicenseText(value) {
  return value.replace(/^---$/gmu, '').replace(/\s+/gu, ' ').trim();
}

function packageNameFromSpecifier(specifier) {
  if (
    specifier.startsWith('.')
    || specifier.startsWith('/')
    || specifier.startsWith('@/')
  ) return null;
  if (specifier.startsWith('@')) return specifier.split('/').slice(0, 2).join('/');
  return specifier.split('/')[0];
}

function sourceFiles(root) {
  const files = [];
  if (!existsSync(root)) return files;
  for (const entry of readdirSync(root, { withFileTypes: true })) {
    const path = resolve(root, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'tests' || entry.name === '__tests__') continue;
      files.push(...sourceFiles(path));
      continue;
    }
    if (!/\.(?:ts|tsx)$/u.test(entry.name)) continue;
    if (/\.(?:test|spec|stories)\.(?:ts|tsx)$/u.test(entry.name)) continue;
    files.push(path);
  }
  return files;
}

function sourceFile(ts, path) {
  return ts.createSourceFile(
    path,
    readFileSync(path, 'utf8'),
    ts.ScriptTarget.Latest,
    true,
    path.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  );
}

function portableRelativePath(root, path) {
  return relative(root, path).split(sep).join('/');
}

/**
 * Keeps the source ownership of every third-party import.  The graphics gate
 * used to need only a module list because all functional glyphs belonged to
 * the generated semantic corpus.  Named compatibility exports are a second,
 * intentionally bounded consumer of the same supplier, so provenance must
 * retain both the module and the declared owner tree.
 */
function importRecords(ts, paths, root) {
  const imports = [];
  for (const path of paths) {
    const file = sourceFile(ts, path);
    for (const statement of file.statements) {
      if (!ts.isImportDeclaration(statement)) continue;
      if (!ts.isStringLiteral(statement.moduleSpecifier)) continue;
      imports.push({
        sourcePath: portableRelativePath(root, path),
        module: statement.moduleSpecifier.text,
      });
    }
  }
  return imports;
}

function importSpecifiers(ts, paths) {
  const imports = [];
  for (const path of paths) {
    const file = sourceFile(ts, path);
    for (const statement of file.statements) {
      if (!ts.isImportDeclaration(statement)) continue;
      if (!ts.isStringLiteral(statement.moduleSpecifier)) continue;
      imports.push(statement.moduleSpecifier.text);
    }
  }
  return imports;
}

function stableImportRecords(records) {
  return [...records]
    .map(({ sourcePath, module }) => ({ sourcePath, module }))
    .sort(
      (left, right) =>
        left.sourcePath.localeCompare(right.sourcePath) || left.module.localeCompare(right.module),
    );
}

function importInventoryFingerprint(records) {
  return sha256(JSON.stringify(stableImportRecords(records)));
}

function unwrap(ts, node) {
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

function staticString(ts, node) {
  const value = unwrap(ts, node);
  if (value && (ts.isStringLiteral(value) || ts.isNoSubstitutionTemplateLiteral(value))) {
    return value.text;
  }
  return null;
}

function staticStringArray(ts, path, variableName) {
  const file = sourceFile(ts, path);
  for (const statement of file.statements) {
    if (!ts.isVariableStatement(statement)) continue;
    for (const declaration of statement.declarationList.declarations) {
      if (!ts.isIdentifier(declaration.name) || declaration.name.text !== variableName) continue;
      let value = unwrap(ts, declaration.initializer);
      if (value && ts.isCallExpression(value)) value = unwrap(ts, value.arguments[0]);
      if (!value || !ts.isArrayLiteralExpression(value)) return null;
      const result = value.elements.map((element) => staticString(ts, element));
      return result.every((entry) => entry !== null) ? result : null;
    }
  }
  return null;
}

function staticCalls(ts, path, functionName) {
  const file = sourceFile(ts, path);
  const calls = [];
  function visit(node) {
    if (
      ts.isCallExpression(node)
      && ts.isIdentifier(node.expression)
      && node.expression.text === functionName
    ) {
      calls.push(node.arguments.map((argument) => staticString(ts, argument)));
    }
    ts.forEachChild(node, visit);
  }
  visit(file);
  return calls;
}

function catalogFingerprint(raw) {
  const variants = Object.fromEntries(
    Object.entries(raw.variants ?? {}).sort(([left], [right]) => left.localeCompare(right)),
  );
  return sha256(JSON.stringify({
    slug: raw.slug,
    title: raw.title,
    license: raw.license,
    url: raw.url,
    svg: raw.svg,
    variants,
  }));
}

function auditCloudAdapter(ts, path, errors) {
  if (!existsSync(path)) {
    errors.push(`cloud adapter is missing: ${path}`);
    return;
  }
  const file = sourceFile(ts, path);
  function visit(node) {
    if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
      const tag = node.tagName.getText(file).toLowerCase();
      if (LOCAL_ARTWORK_TAGS.has(tag)) {
        errors.push(`AWS adapter contains local artwork element <${tag}>`);
      }
      for (const attribute of node.attributes.properties) {
        if (!ts.isJsxAttribute(attribute)) continue;
        const name = attribute.name.getText(file);
        if (name === 'transform' || name === 'dangerouslySetInnerHTML') {
          errors.push(`AWS adapter applies prohibited ${name} artwork mutation`);
        }
      }
    }
    ts.forEachChild(node, visit);
  }
  visit(file);
}

function installedPackageManifest(coreRoot, packageName) {
  return resolve(coreRoot, 'node_modules', ...packageName.split('/'), 'package.json');
}

export function auditGraphicsPackaging(options = {}) {
  const coreRoot = resolve(options.coreRoot ?? DEFAULT_CORE_ROOT);
  const manifestPath = resolve(options.manifestPath ?? DEFAULT_MANIFEST_PATH);
  const manifestRoot = dirname(manifestPath);
  const packagePath = resolve(coreRoot, 'package.json');
  const graphicsRoot = resolve(options.graphicsRoot ?? resolve(coreRoot, 'src/graphics'));
  const cloudAdapterPath = resolve(
    options.cloudAdapterPath
      ?? resolve(
        graphicsRoot,
        'brand-marks/runtime/adapters/thesvg-react/cloud-service/index.tsx',
      ),
  );
  const errors = [];

  if (!existsSync(manifestPath)) {
    throw new Error(`CRA17 graphics packaging manifest is missing: ${manifestPath}`);
  }
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  const providers = Array.isArray(manifest.providers) ? manifest.providers : [];
  const assetClasses = manifest.assetClasses ?? {};
  const brandMarks = Array.isArray(assetClasses.brandMark) ? assetClasses.brandMark : [];
  const cloudMarks = Array.isArray(assetClasses.cloudServiceMark)
    ? assetClasses.cloudServiceMark
    : [];
  const pictograms = assetClasses.featurePictogram ?? {};
  const functionalIcons = assetClasses.functionalIcon ?? {};
  const runtimeAllowlist = new Set(
    Array.isArray(manifest.runtimePackageAllowlist)
      ? manifest.runtimePackageAllowlist
      : [],
  );

  if (manifest.schemaVersion !== 1) errors.push('schemaVersion must equal 1');
  if (!existsSync(packagePath)) errors.push(`package manifest is missing: ${packagePath}`);

  const requireFromCore = createRequire(packagePath);
  const ts = requireFromCore('typescript');
  const packageManifest = existsSync(packagePath)
    ? JSON.parse(readFileSync(packagePath, 'utf8'))
    : {};
  const noticePath = resolve(options.noticePath ?? resolve(coreRoot, manifest.notice?.path ?? ''));
  if (manifest.notice?.path !== 'THIRD_PARTY_NOTICES.md') {
    errors.push('notice.path must equal THIRD_PARTY_NOTICES.md');
  }
  if (!isInside(coreRoot, noticePath)) errors.push('notice.path escapes the package root');
  const notice = existsSync(noticePath) ? readFileSync(noticePath, 'utf8') : '';
  if (!notice) errors.push(`packaged notice is missing: ${noticePath}`);
  if (notice && sha256(notice) !== manifest.notice?.sha256) {
    errors.push(
      `THIRD_PARTY_NOTICES hash drifted; expected ${String(manifest.notice?.sha256)}, found ${sha256(notice)}`,
    );
  }

  const packageFiles = packageManifest.files ?? [];
  if (!packageFiles.includes('THIRD_PARTY_NOTICES.md')) {
    errors.push('package files must include THIRD_PARTY_NOTICES.md');
  }
  if (!packageFiles.includes('provenance/graphics/**')) {
    errors.push('package files must include provenance/graphics/**');
  }
  const scripts = packageManifest.scripts ?? {};
  if (!/cra-17-packaging-license-gate\.mjs/u.test(scripts['cra17:licenses'] ?? '')) {
    errors.push('scripts.cra17:licenses must invoke the CRA17 packaging license gate');
  }
  for (const lifecycle of ['prepack', 'prebuild', 'lint']) {
    if (!/cra17:licenses/u.test(scripts[lifecycle] ?? '')) {
      errors.push(`scripts.${lifecycle} must invoke cra17:licenses`);
    }
  }

  const providerNames = providers.map((provider) => provider.packageName);
  if (new Set(providerNames).size !== providerNames.length) {
    errors.push('provider packageName values must be unique');
  }
  const providerIds = providers.map((provider) => provider.id);
  if (new Set(providerIds).size !== providerIds.length) {
    errors.push('provider id values must be unique');
  }

  const referencedLicenses = new Set();
  for (const provider of providers) {
    for (const field of [
      'id',
      'packageName',
      'version',
      'license',
      'source',
      'licenseFile',
      'licenseSha256',
      'usage',
    ]) {
      if (typeof provider[field] !== 'string' || provider[field].length === 0) {
        errors.push(`provider ${String(provider.id)}.${field} must be a non-empty string`);
      }
    }
    if (!VALID_LICENSES.has(provider.license)) {
      errors.push(`provider ${provider.id} uses unregistered license ${String(provider.license)}`);
    }
    const licensePath = resolve(manifestRoot, provider.licenseFile ?? '');
    if (!isInside(manifestRoot, licensePath)) {
      errors.push(`provider ${provider.id}.licenseFile escapes the manifest root`);
    } else if (!existsSync(licensePath)) {
      errors.push(`provider ${provider.id} license file is missing: ${provider.licenseFile}`);
    } else {
      referencedLicenses.add(relative(manifestRoot, licensePath));
      const licenseBytes = readFileSync(licensePath);
      if (sha256(licenseBytes) !== provider.licenseSha256) {
        errors.push(`provider ${provider.id} license hash drifted`);
      }
      if (
        notice
        && !normalizeLicenseText(notice).includes(
          normalizeLicenseText(licenseBytes.toString('utf8')),
        )
      ) {
        errors.push(`notice does not reproduce the ${provider.id} license text`);
      }
    }

    const installedPath = installedPackageManifest(coreRoot, provider.packageName ?? '');
    if (!existsSync(installedPath)) {
      errors.push(`registered provider is not installed: ${provider.packageName}`);
    } else {
      const installed = JSON.parse(readFileSync(installedPath, 'utf8'));
      if (installed.version !== provider.version) {
        errors.push(
          `provider ${provider.id} version drifted; expected ${provider.version}, found ${installed.version}`,
        );
      }
      if (installed.license !== provider.license) {
        errors.push(
          `provider ${provider.id} license drifted; expected ${provider.license}, found ${installed.license}`,
        );
      }
    }
    for (const token of [
      `${provider.packageName}@${provider.version}`,
      provider.license,
      provider.source,
    ]) {
      if (notice && !notice.includes(token)) {
        errors.push(`notice is missing provider token ${token}`);
      }
    }
  }

  const licenseDirectory = resolve(manifestRoot, 'licenses');
  const archivedLicenses = existsSync(licenseDirectory)
    ? readdirSync(licenseDirectory).map((file) => `licenses/${file}`)
    : [];
  const orphanedLicenses = archivedLicenses.filter(
    (file) => !referencedLicenses.has(file),
  );
  if (orphanedLicenses.length > 0) {
    errors.push(`unregistered archived licenses: ${orphanedLicenses.join(', ')}`);
  }

  const graphicsFiles = sourceFiles(graphicsRoot);
  const graphicsImportRecords = importRecords(ts, graphicsFiles, coreRoot);
  const imports = graphicsImportRecords.map(({ module }) => module);
  const discoveredProviders = stable(new Set(
    imports
      .map(packageNameFromSpecifier)
      .filter(Boolean)
      .filter((packageName) => !runtimeAllowlist.has(packageName)),
  ));
  const productionProviders = stable(
    providers
      .filter((provider) => provider.usage !== 'provenance-catalog-only')
      .map((provider) => provider.packageName),
  );
  compare(
    errors,
    'packaged graphics provider allowlist',
    productionProviders,
    discoveredProviders,
  );

  const knownProviderNames = new Set(providers.map(({ packageName }) => packageName));
  const semanticSourceRootValue = functionalIcons.semanticSourceRoot;
  const semanticSourceRoot =
    typeof semanticSourceRootValue === 'string' && semanticSourceRootValue.length > 0
      ? resolve(coreRoot, semanticSourceRootValue)
      : null;
  if (
    !semanticSourceRoot ||
    !isInside(coreRoot, semanticSourceRoot) ||
    !existsSync(semanticSourceRoot)
  ) {
    errors.push(
      `functional icon semantic source root is missing: ${String(semanticSourceRootValue)}`,
    );
  }

  const compatibilityCatalog = functionalIcons.compatibilityCatalog ?? {};
  const compatibilityCatalogRootValue = compatibilityCatalog.rootPath;
  const compatibilityCatalogRoot =
    typeof compatibilityCatalogRootValue === 'string' && compatibilityCatalogRootValue.length > 0
      ? resolve(coreRoot, compatibilityCatalogRootValue)
      : null;
  if (
    !compatibilityCatalogRoot ||
    !isInside(coreRoot, compatibilityCatalogRoot) ||
    !existsSync(compatibilityCatalogRoot)
  ) {
    errors.push(
      `functional icon compatibility catalog root is missing: ${String(
        compatibilityCatalogRootValue,
      )}`,
    );
  }
  if (
    semanticSourceRoot &&
    compatibilityCatalogRoot &&
    (isInside(semanticSourceRoot, compatibilityCatalogRoot) ||
      isInside(compatibilityCatalogRoot, semanticSourceRoot))
  ) {
    errors.push('functional icon semantic and compatibility source roots must not overlap');
  }

  const compatibilityProviderValues = compatibilityCatalog.providers;
  if (!Array.isArray(compatibilityProviderValues)) {
    errors.push('functional icon compatibility catalog providers must be an array');
  }
  const compatibilityProviders = Array.isArray(compatibilityProviderValues)
    ? compatibilityProviderValues.filter(
        (provider) => typeof provider === 'string' && provider.length > 0,
      )
    : [];
  if (
    compatibilityProviders.length !== (compatibilityProviderValues?.length ?? 0) ||
    compatibilityProviders.length === 0
  ) {
    errors.push(
      'functional icon compatibility catalog providers must contain non-empty package names',
    );
  }
  if (new Set(compatibilityProviders).size !== compatibilityProviders.length) {
    errors.push('functional icon compatibility catalog providers must be unique');
  }
  if (!same(compatibilityProviders, stable(compatibilityProviders))) {
    errors.push('functional icon compatibility catalog providers must be sorted');
  }
  for (const provider of compatibilityProviders) {
    if (!knownProviderNames.has(provider)) {
      errors.push(
        `functional icon compatibility catalog provider is not covered by the allowlist: ${provider}`,
      );
    }
  }

  const expectedCompatibilityImportEntries = compatibilityCatalog.expectedImportEntries;
  if (
    !Number.isInteger(expectedCompatibilityImportEntries) ||
    expectedCompatibilityImportEntries < 1
  ) {
    errors.push(
      'functional icon compatibility catalog expectedImportEntries must be a positive integer',
    );
  }
  const expectedCompatibilityInventoryHash = compatibilityCatalog.importInventorySha256;
  if (
    typeof expectedCompatibilityInventoryHash !== 'string' ||
    !/^[a-f0-9]{64}$/u.test(expectedCompatibilityInventoryHash)
  ) {
    errors.push(
      'functional icon compatibility catalog importInventorySha256 must be a SHA-256 hex digest',
    );
  }

  const semanticImportRecords =
    semanticSourceRoot && existsSync(semanticSourceRoot)
      ? importRecords(ts, sourceFiles(semanticSourceRoot), coreRoot)
      : [];
  const compatibilityImportRecords =
    compatibilityCatalogRoot && existsSync(compatibilityCatalogRoot)
      ? importRecords(ts, sourceFiles(compatibilityCatalogRoot), coreRoot)
      : [];
  const semanticProviderImports = semanticImportRecords.filter(({ module }) =>
    knownProviderNames.has(packageNameFromSpecifier(module)),
  );
  const semanticFunctionalImports = semanticProviderImports.filter(
    ({ module }) => packageNameFromSpecifier(module) === functionalIcons.provider,
  );
  const semanticUnexpectedProviderImports = semanticProviderImports.filter(
    ({ module }) => packageNameFromSpecifier(module) !== functionalIcons.provider,
  );
  if (semanticUnexpectedProviderImports.length > 0) {
    errors.push(
      `functional icon semantic corpus imports a non-semantic provider: ${JSON.stringify(
        stableImportRecords(semanticUnexpectedProviderImports),
      )}`,
    );
  }

  const compatibilityProviderSet = new Set(compatibilityProviders);
  const compatibilityDeclaredProviderImports = compatibilityImportRecords.filter(({ module }) =>
    compatibilityProviderSet.has(packageNameFromSpecifier(module)),
  );
  const importedCompatibilityProviders = new Set(
    compatibilityDeclaredProviderImports.map(({ module }) => packageNameFromSpecifier(module)),
  );
  for (const provider of compatibilityProviders) {
    if (!importedCompatibilityProviders.has(provider)) {
      errors.push(`functional icon compatibility catalog declares an unused provider: ${provider}`);
    }
  }
  const compatibilityUndeclaredProviderImports = compatibilityImportRecords.filter(({ module }) => {
    const packageName = packageNameFromSpecifier(module);
    return knownProviderNames.has(packageName) && !compatibilityProviderSet.has(packageName);
  });
  if (compatibilityUndeclaredProviderImports.length > 0) {
    errors.push(
      `functional icon compatibility catalog imports an undeclared provider: ${JSON.stringify(
        stableImportRecords(compatibilityUndeclaredProviderImports),
      )}`,
    );
  }

  const iconRegistryPath = resolve(coreRoot, functionalIcons.registryPath ?? '');
  if (!isInside(coreRoot, iconRegistryPath) || !existsSync(iconRegistryPath)) {
    errors.push(`functional icon registry is missing: ${functionalIcons.registryPath}`);
  } else {
    const registryBytes = readFileSync(iconRegistryPath);
    const registry = JSON.parse(registryBytes.toString('utf8'));
    if (sha256(registryBytes) !== functionalIcons.registrySha256) {
      errors.push('functional icon registry hash drifted');
    }
    if (
      registry.packageName !== functionalIcons.provider
      || registry.packageVersion
        !== providers.find(({ packageName }) => packageName === functionalIcons.provider)?.version
    ) {
      errors.push('functional icon registry provider/version is not covered by the allowlist');
    }
    if (registry.entries?.length !== functionalIcons.expectedEntries) {
      errors.push(
        `functional icon registry expected ${functionalIcons.expectedEntries} entries, found ${String(registry.entries?.length)}`,
      );
    }
    const registeredModules = stable((registry.entries ?? []).map((entry) => entry.module));
    const importedModules = stable(semanticFunctionalImports.map(({ module }) => module));
    compare(errors, 'functional icon module inventory', registeredModules, importedModules);
  }

  // A canonical source-path/module serialization makes catalogue additions,
  // removals and supplier substitutions reviewable without treating its
  // compatibility modules as semantic-role modules.
  const actualCompatibilityInventory = stableImportRecords(compatibilityDeclaredProviderImports);
  if (actualCompatibilityInventory.length !== expectedCompatibilityImportEntries) {
    errors.push(
      `functional icon compatibility catalog expected ${String(
        expectedCompatibilityImportEntries,
      )} imports, found ${String(actualCompatibilityInventory.length)}`,
    );
  }
  const actualCompatibilityInventoryHash = importInventoryFingerprint(actualCompatibilityInventory);
  if (actualCompatibilityInventoryHash !== expectedCompatibilityInventoryHash) {
    errors.push(
      `functional icon compatibility catalog import inventory hash drifted; expected ${String(
        expectedCompatibilityInventoryHash,
      )}, found ${actualCompatibilityInventoryHash}`,
    );
  }

  const functionalSupplierPackages = new Set([functionalIcons.provider, ...compatibilityProviders]);
  const functionalSupplierImports = graphicsImportRecords.filter(({ module }) =>
    functionalSupplierPackages.has(packageNameFromSpecifier(module)),
  );
  const classifiedFunctionalSupplierImports = [
    ...semanticFunctionalImports,
    ...compatibilityDeclaredProviderImports,
  ];
  compare(
    errors,
    'functional icon supplier source boundary',
    stableImportRecords(functionalSupplierImports),
    stableImportRecords(classifiedFunctionalSupplierImports),
  );

  const markCatalogPath = resolve(
    graphicsRoot,
    'brand-marks/foundation/catalog/index.ts',
  );
  const markProvenancePath = resolve(
    graphicsRoot,
    'brand-marks/runtime/provenance/index.ts',
  );
  const pictogramCatalogPath = resolve(
    graphicsRoot,
    'pictograms/foundation/catalog/index.ts',
  );
  const pictogramProvenancePath = resolve(
    graphicsRoot,
    'pictograms/runtime/provenance/index.ts',
  );
  const brandAdapterPath = resolve(
    graphicsRoot,
    'brand-marks/runtime/adapters/thesvg-react/brand/index.tsx',
  );

  compare(
    errors,
    'BrandMark inventory',
    staticStringArray(ts, markCatalogPath, 'BRAND_MARK_NAMES') ?? [],
    brandMarks.map(({ name }) => name),
  );
  compare(
    errors,
    'CloudServiceMark provider inventory',
    staticStringArray(ts, markCatalogPath, 'CLOUD_PROVIDERS') ?? [],
    stable(new Set(cloudMarks.map(({ provider }) => provider))),
  );
  compare(
    errors,
    'CloudServiceMark service inventory',
    staticStringArray(ts, markCatalogPath, 'CLOUD_SERVICES') ?? [],
    cloudMarks.map(({ service }) => service),
  );
  compare(
    errors,
    'FeaturePictogram inventory',
    staticStringArray(ts, pictogramCatalogPath, 'FEATURE_PICTOGRAM_NAMES') ?? [],
    pictograms.entries ?? [],
  );

  const brandCalls = staticCalls(ts, markProvenancePath, 'brand').map((args) => ({
    name: args[0],
    slug: args[1],
    title: args[2],
    license: args[3],
    sourceUrl: args[4],
  }));
  const cloudCalls = staticCalls(ts, markProvenancePath, 'cloud').map((args) => ({
    service: args[0],
    slug: args[1],
    title: args[2],
    sourceUrl: args[3],
  }));
  compare(
    errors,
    'BrandMark runtime provenance',
    brandMarks.map(({ name, slug, title, license, sourceUrl }) => ({
      name,
      slug,
      title,
      license,
      sourceUrl,
    })),
    brandCalls,
  );
  compare(
    errors,
    'CloudServiceMark runtime provenance',
    cloudMarks.map(({ service, slug, title, sourceUrl }) => ({
      service,
      slug,
      title,
      sourceUrl,
    })),
    cloudCalls,
  );

  if (existsSync(markProvenancePath)) {
    const provenanceSource = readFileSync(markProvenancePath, 'utf8');
    for (const token of [
      "license: 'CC-BY-ND-2.0'",
      "provider: 'aws'",
      "packageName: 'thesvg'",
      "version: '3.2.6'",
      "packageName: '@thesvg/react'",
      "version: '3.2.7'",
      'do not grant trademark permission',
    ]) {
      if (!provenanceSource.includes(token)) {
        errors.push(`runtime mark provenance is missing governed token ${token}`);
      }
    }
  }

  const brandImports = importSpecifiers(ts, [brandAdapterPath]).filter((specifier) =>
    specifier.startsWith('@thesvg/react/'));
  const cloudImports = importSpecifiers(ts, [cloudAdapterPath]).filter((specifier) =>
    specifier.startsWith('@thesvg/react/'));
  compare(errors, 'BrandMark renderer modules', stable(brandMarks.map(({ module }) => module)), stable(brandImports));
  compare(errors, 'CloudServiceMark renderer modules', stable(cloudMarks.map(({ module }) => module)), stable(cloudImports));

  for (const asset of [...brandMarks, ...cloudMarks]) {
    if (!VALID_LICENSES.has(asset.license)) {
      errors.push(`${asset.slug} uses unregistered license ${String(asset.license)}`);
    }
    try {
      const raw = requireFromCore(`thesvg/${asset.slug}`);
      for (const [field, expected] of [
        ['slug', asset.slug],
        ['title', asset.title],
        ['license', asset.license],
        ['url', asset.sourceUrl],
      ]) {
        if (raw[field] !== expected) {
          errors.push(
            `${asset.slug} catalog ${field} drifted; expected ${expected}, found ${String(raw[field])}`,
          );
        }
      }
      if (catalogFingerprint(raw) !== asset.sourceSha256) {
        errors.push(`${asset.slug} source artwork fingerprint drifted`);
      }
    } catch (error) {
      errors.push(`${asset.slug} source catalog could not be loaded: ${error.message}`);
    }
    for (const token of [asset.title, asset.slug, asset.license, asset.sourceUrl]) {
      if (notice && !notice.includes(token)) {
        errors.push(`notice is missing asset token ${token}`);
      }
    }
  }

  if (cloudMarks.length !== 4) {
    errors.push(`AWS CC-BY-ND inventory must contain exactly 4 assets; found ${cloudMarks.length}`);
  }
  for (const asset of cloudMarks) {
    if (
      asset.provider !== 'aws'
      || asset.author !== 'Amazon Web Services, Inc.'
      || asset.license !== AWS_LICENSE
      || asset.modified !== false
      || asset.derivativesAllowed !== false
      || asset.renderingPolicy !== AWS_RENDERING_POLICY
      || asset.trademarkGuidance !== AWS_TRADEMARK_URL
    ) {
      errors.push(`${asset.slug} violates the governed AWS no-derivatives/trademark policy`);
    }
  }
  for (const token of [
    AWS_LICENSE_URL,
    AWS_TRADEMARK_URL,
    'without local edits to path geometry, color, font, or artwork elements',
    'does not create or distribute adapted artwork',
    'No AWS trademark permission',
  ]) {
    if (notice && !notice.includes(token)) errors.push(`AWS notice is missing ${token}`);
  }
  auditCloudAdapter(ts, cloudAdapterPath, errors);

  const artworkPath = resolve(coreRoot, pictograms.artworkPath ?? '');
  if (!isInside(coreRoot, artworkPath) || !existsSync(artworkPath)) {
    errors.push(`FeaturePictogram artwork is missing: ${pictograms.artworkPath}`);
  } else if (sha256(readFileSync(artworkPath)) !== pictograms.artworkSha256) {
    errors.push('FeaturePictogram artwork hash drifted');
  }
  if (
    pictograms.source !== 'rottay-original'
    || pictograms.license !== 'LicenseRef-Rottay-Original-Product-Asset-1.0'
    || pictograms.rightsHolder !== 'Rottay'
    || pictograms.distribution !== 'internal-and-bundled-product'
  ) {
    errors.push('FeaturePictogram source/license policy drifted');
  }
  if (existsSync(pictogramProvenancePath)) {
    const provenanceSource = readFileSync(pictogramProvenancePath, 'utf8');
    for (const token of [
      'source: "rottay-original"',
      'license: "LicenseRef-Rottay-Original-Product-Asset-1.0"',
      'rightsHolder: "Rottay"',
      'distribution: "internal-and-bundled-product"',
      'supplier: null',
      'rendering: "local-svg-ssr"',
    ]) {
      if (!provenanceSource.includes(token)) {
        errors.push(`runtime FeaturePictogram provenance is missing ${token}`);
      }
    }
  } else {
    errors.push(`FeaturePictogram provenance is missing: ${pictogramProvenancePath}`);
  }
  for (const token of pictograms.entries ?? []) {
    if (notice && !notice.includes(token)) {
      errors.push(`notice is missing FeaturePictogram ${token}`);
    }
  }

  if (errors.length > 0) {
    throw new Error(`CRA17 graphics packaging/license gate failed:\n- ${errors.join('\n- ')}`);
  }

  return {
    schemaVersion: manifest.schemaVersion,
    providers: providers.length,
    functionalIcons: functionalIcons.expectedEntries,
    functionalIconCompatibilityImports: actualCompatibilityInventory.length,
    brandMarks: brandMarks.length,
    cloudServiceMarks: cloudMarks.length,
    featurePictograms: pictograms.entries.length,
    notice: relative(coreRoot, noticePath),
    archivedLicenses: archivedLicenses.length,
  };
}

const invokedPath = process.argv[1] ? resolve(process.argv[1]) : '';
if (invokedPath === SCRIPT_PATH) {
  process.stdout.write(`${JSON.stringify(auditGraphicsPackaging(), null, 2)}\n`);
}
