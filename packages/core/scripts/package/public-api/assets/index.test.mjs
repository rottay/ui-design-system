import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import test from 'node:test';
import ts from 'typescript';

const require = createRequire(import.meta.url);

const ROLE_SUBPATH = '@rottay/design-system/icons/roles/action-add';
const PRESET_SUBPATH = '@rottay/design-system/icons/presets/bithire';
const ICONS_SUBPATH = '@rottay/design-system/icons';
const MARKS_SUBPATH = '@rottay/design-system/marks';
// `AlertIcon`, the last preserved catalog helper, retired from `./icons` (WO-RET-06 W-1): the whole catalog is private.
const PRESERVED_CATALOG_HELPERS = [];
const ALERT_OWNER = '../../graphics/icons/glyphs/presentation/catalog/status/alert-icon';

function sourceStatements(url) {
  return ts.createSourceFile(url.pathname, readFileSync(url, 'utf8'), ts.ScriptTarget.Latest, true).statements;
}

function catalogModuleUrl(specifier, owner) {
  assert.ok(specifier.startsWith('./') || specifier.startsWith('../'), `Unexpected catalog supplier reexport: ${specifier}`);
  const candidates = ['.ts', '.tsx', '/index.ts', '/index.tsx']
    .map((suffix) => new URL(`${specifier}${suffix}`, owner)).filter((url) => existsSync(url));
  assert.equal(candidates.length, 1, `Ambiguous or missing catalog owner: ${specifier}`);
  return candidates[0];
}

function moduleExportNames(owner, ancestors = new Set()) {
  assert.equal(ancestors.has(owner.href), false, `Cyclic catalog reexport: ${owner.pathname}`);
  const visited = new Set([...ancestors, owner.href]);
  const names = [];
  for (const declaration of sourceStatements(owner)) {
    if (ts.isExportDeclaration(declaration)) {
      assert.ok(declaration.moduleSpecifier && ts.isStringLiteral(declaration.moduleSpecifier));
      assert.equal(declaration.isTypeOnly, false);
      const available = moduleExportNames(catalogModuleUrl(declaration.moduleSpecifier.text, owner), visited);
      if (!declaration.exportClause) names.push(...available);
      else {
        assert.ok(ts.isNamedExports(declaration.exportClause));
        for (const binding of declaration.exportClause.elements) {
          assert.equal(binding.isTypeOnly, false);
          assert.ok(available.includes((binding.propertyName ?? binding.name).text));
          names.push(binding.name.text);
        }
      }
    } else if (ts.isExportAssignment(declaration) || declaration.modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword)) {
      assert.ok(ts.isVariableStatement(declaration), `Unexpected catalog export in ${owner.pathname}`);
      for (const binding of declaration.declarationList.declarations) {
        assert.ok(ts.isIdentifier(binding.name));
        names.push(binding.name.text);
      }
    }
  }
  assert.equal(new Set(names).size, names.length);
  return names.sort();
}

function catalogExportNames() {
  return moduleExportNames(new URL('../../../../src/graphics/icons/glyphs/presentation/catalog/index.ts', import.meta.url));
}

function retiredCatalogExportNames() {
  const names = catalogExportNames();
  assert.equal(names.length, 329);
  assert.deepEqual(names.filter((name) => PRESERVED_CATALOG_HELPERS.includes(name)), PRESERVED_CATALOG_HELPERS);
  const retired = names.filter((name) => !PRESERVED_CATALOG_HELPERS.includes(name));
  assert.equal(retired.length, 329);
  return retired;
}

test('canonical icons public source excludes the catalog and retains existing helper contracts', () => {
  const entry = new URL('../../../../src/entrypoints/icons/index.ts', import.meta.url);
  const exported = new Set();
  for (const statement of sourceStatements(entry)) {
    assert.ok(ts.isExportDeclaration(statement));
    assert.ok(statement.exportClause && ts.isNamedExports(statement.exportClause), 'Public icons require explicit named exports');
    assert.ok(ts.isStringLiteral(statement.moduleSpecifier));
    assert.notEqual(statement.moduleSpecifier.text, '../../graphics/icons');
    if (statement.moduleSpecifier.text.includes('/glyphs/presentation/catalog')) {
      assert.equal(statement.moduleSpecifier.text, ALERT_OWNER);
      assert.deepEqual(statement.exportClause.elements.map((binding) => binding.name.text), PRESERVED_CATALOG_HELPERS);
    }
    for (const binding of statement.exportClause.elements) exported.add(binding.name.text);
  }

  const catalog = retiredCatalogExportNames();
  for (const name of catalog) assert.equal(exported.has(name), false, `${name} must remain private`);
  for (const name of [
    'createIcon', 'BaseIcon', 'ICON_SIZE_MAP', 'ICON_SIZE_TOKENS', 'IconSizeToken',
    'DSIconComponent', 'DSIconProps', 'DSIconSourceComponent', 'IconSize', 'SvgIconProps', 'IconComponent',
    'Icon', 'IconProps', 'ICON_NAMES', 'ICON_CORPUS', 'getIconCorpusEntry', 'isIconName',
    'GENERATED_ICON_NAMES', 'GENERATED_ICON_METADATA', 'ICON_PROVENANCE', 'installGraphicAssetRuntimeControl',
  ]) assert.equal(exported.has(name), true, `${name} must stay public`);
});

test('canonical icons omit every vendor-named glyph in emitted ESM and CJS', async () => {
  const catalog = retiredCatalogExportNames();
  for (const module of [await import(ICONS_SUBPATH), require(ICONS_SUBPATH)]) {
    for (const name of catalog) assert.equal(name in module, false, `${name} must not be a public export`);
    for (const name of ['createIcon', 'BaseIcon', 'ICON_SIZE_MAP', 'ICON_SIZE_TOKENS']) {
      assert.equal(name in module, true, `${name} must stay public`);
    }
  }
});

test('generated role wildcard resolves to one exact public component in ESM and CJS', async () => {
  const esm = await import(ROLE_SUBPATH);
  const cjs = require(ROLE_SUBPATH);
  assert.deepEqual(Object.keys(esm).sort(), ['ActionAddIcon']);
  assert.deepEqual(Object.keys(cjs).sort(), ['ActionAddIcon']);
});

test('BitHire preset is bounded to its exact 104-role application inventory', async () => {
  const esm = await import(PRESET_SUBPATH);
  const cjs = require(PRESET_SUBPATH);
  assert.equal(esm.BITHIRE_PRESET_ICON_NAMES.length, 104);
  assert.equal(cjs.BITHIRE_PRESET_ICON_NAMES.length, 104);
  assert.deepEqual(esm.BITHIRE_PRESET_ICON_NAMES, cjs.BITHIRE_PRESET_ICON_NAMES);
  assert.equal(new Set(esm.BITHIRE_PRESET_ICON_NAMES).size, 104);
  assert.equal(typeof esm.BitHireIconPreset, 'object');
  assert.equal(typeof cjs.BitHireIconPreset, 'object');
});

test('canonical icons keep the complete role inventory and metadata in ESM and CJS', async () => {
  const esm = await import(ICONS_SUBPATH);
  const cjs = require(ICONS_SUBPATH);
  assert.equal(esm.ICON_NAMES.length, 282);
  assert.equal(cjs.ICON_NAMES.length, 282);
  assert.deepEqual(esm.ICON_NAMES, cjs.ICON_NAMES);
  assert.deepEqual(esm.GENERATED_ICON_METADATA, cjs.GENERATED_ICON_METADATA);
  assert.equal(esm.GENERATED_ICON_NAMES.length, 282);
  assert.equal(cjs.GENERATED_ICON_NAMES.length, 282);
  assert.equal(typeof esm.Icon, 'object');
  assert.equal(typeof cjs.Icon, 'object');
  assert.equal(typeof esm.getIconCorpusEntry, 'function');
  assert.equal(typeof cjs.getIconCorpusEntry, 'function');
  assert.equal(typeof esm.installGraphicAssetRuntimeControl, 'function');
  assert.equal(typeof cjs.installGraphicAssetRuntimeControl, 'function');
  assert.deepEqual(esm.GRAPHIC_ASSET_TELEMETRY_CODES, cjs.GRAPHIC_ASSET_TELEMETRY_CODES);
});

test('the aggregate marks door carries both mark facades', async () => {
  const esm = await import(MARKS_SUBPATH);
  const cjs = require(MARKS_SUBPATH);

  assert.equal(typeof esm.BrandMark, 'object');
  assert.equal(typeof cjs.BrandMark, 'object');
  assert.equal(typeof esm.CloudServiceMark, 'object');
  assert.equal(typeof cjs.CloudServiceMark, 'object');
});

test('class-specific mark doors do not expose the other renderer', async () => {
  for (const [subpath, present, absent] of [
    [MARKS_SUBPATH + '/brand', 'BrandMark', 'CloudServiceMark'],
    [MARKS_SUBPATH + '/cloud', 'CloudServiceMark', 'BrandMark'],
  ]) {
    for (const module of [await import(subpath), require(subpath)]) {
      assert.equal(typeof module[present], 'object');
      assert.equal(absent in module, false);
    }
  }
});
