import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import {
  mkdtemp,
  mkdir,
  readFile,
  rm,
  writeFile,
} from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, resolve } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

import { auditPublicDeclarationClosures } from './index.mjs';
import { packageRoot as findPackageRoot } from '../../../libraries/repo-root/index.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const CORE_ROOT = findPackageRoot(HERE);

async function sourceModuleExportNames(file, ancestors = new Set()) {
  assert.equal(ancestors.has(file), false, `Cyclic catalog declaration: ${file}`);
  const visited = new Set([...ancestors, file]);
  const source = ts.createSourceFile(file, await readFile(file, 'utf8'), ts.ScriptTarget.Latest, true);
  assert.equal(source.parseDiagnostics.length, 0, `Malformed catalog source: ${file}`);
  const names = [];
  for (const declaration of source.statements) {
    if (ts.isExportDeclaration(declaration)) {
      assert.ok(declaration.moduleSpecifier && ts.isStringLiteral(declaration.moduleSpecifier));
      const specifier = declaration.moduleSpecifier.text;
      assert.match(specifier, /^\.\.?\//u);
      assert.equal(declaration.isTypeOnly, false);
      const candidates = ['.ts', '.tsx', '/index.ts', '/index.tsx']
        .map((suffix) => resolve(dirname(file), `${specifier}${suffix}`)).filter(existsSync);
      assert.equal(candidates.length, 1, `Ambiguous or missing catalog owner: ${specifier}`);
      const available = await sourceModuleExportNames(candidates[0], visited);
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
      assert.ok(ts.isVariableStatement(declaration), `Unexpected catalog export: ${file}`);
      for (const binding of declaration.declarationList.declarations) {
        assert.ok(ts.isIdentifier(binding.name));
        names.push(binding.name.text);
      }
    }
  }
  assert.equal(new Set(names).size, names.length, `Duplicate catalog export: ${file}`);
  return names.sort();
}

async function writeFixture(root, files) {
  for (const [path, source] of Object.entries(files)) {
    const absolute = resolve(root, path);
    await mkdir(dirname(absolute), { recursive: true });
    await writeFile(absolute, source, 'utf8');
  }
}

function fixtureManifest() {
  return `${JSON.stringify({
    name: '@fixture/design-system',
    exports: {
      './icons': { types: './dist/icons.d.ts' },
      './icons/presets/bithire': { types: './dist/icons-preset-bithire.d.ts' },
      './icons/roles/*': { types: './dist/public/roles/*.d.ts' },
      './marks': { types: './dist/marks.d.ts' },
      './marks/brand': { types: './dist/marks-brand.d.ts' },
      './marks/cloud': { types: './dist/marks-cloud.d.ts' },
      './pictograms': { types: './dist/pictograms.d.ts' },
    },
  }, null, 2)}\n`;
}

test('audits the exact packed public declaration closure and ignores unreachable adapters', async () => {
  const root = await mkdtemp(resolve(tmpdir(), 'cra17-declarations-pass-'));
  try {
    await writeFixture(root, {
      'package.json': fixtureManifest(),
      'dist/icons.d.ts': "export * from './public/icons/index';\n",
      'dist/icons-preset-bithire.d.ts': "export * from './public/preset/index';\n",
      'dist/public/roles/action-add.d.ts': "export declare const ActionAddIcon: import('react').ComponentType;\n",
      'dist/marks.d.ts': "export * from './public/marks/index';\n",
      'dist/marks-brand.d.ts': "export declare const BrandMark: import('react').ComponentType;\n",
      'dist/marks-cloud.d.ts': "export declare const CloudServiceMark: import('react').ComponentType;\n",
      'dist/pictograms.d.ts': "export * from './public/pictograms/index';\n",
      'dist/public/icons/index.d.ts': "export declare const Icon: import('react').ComponentType<{ size?: number }>;\n",
      'dist/public/preset/index.d.ts': "export declare const BitHireIconPreset: import('react').ComponentType;\n",
      'dist/public/marks/index.d.ts': "export interface MarkSource { readonly packageName: string }\n",
      'dist/public/pictograms/index.d.ts': "export declare const FeaturePictogram: import('react').ComponentType;\n",
      'dist/private/adapter.d.ts': "import type { LucideIcon } from 'lucide-react'; export declare const Private: LucideIcon;\n",
    });

    const result = auditPublicDeclarationClosures(root);
    assert.deepEqual(result.errors, []);
    assert.equal(result.files, 11);
    assert.deepEqual(Object.keys(result.entrypoints), [
      './icons',
      './icons/presets/bithire',
      './icons/roles/action-add',
      './marks',
      './marks/brand',
      './marks/cloud',
      './pictograms',
    ]);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('rejects provider imports, identifiers, literals, and broken relative declaration edges', async () => {
  const root = await mkdtemp(resolve(tmpdir(), 'cra17-declarations-fail-'));
  try {
    await writeFixture(root, {
      'package.json': fixtureManifest(),
      'dist/icons.d.ts': "export * from './public/icons/index';\n",
      'dist/icons-preset-bithire.d.ts': "export declare const BitHireIconPreset: import('react').ComponentType;\n",
      'dist/public/roles/action-add.d.ts': "export declare const ActionAddIcon: import('react').ComponentType;\n",
      'dist/marks.d.ts': "export * from './missing/marks';\n",
      'dist/marks-brand.d.ts': "export declare const BrandMark: import('react').ComponentType;\n",
      'dist/marks-cloud.d.ts': "export declare const CloudServiceMark: import('react').ComponentType;\n",
      'dist/pictograms.d.ts': "export declare const source: '@thesvg/react';\n",
      'dist/public/icons/index.d.ts': "import type { LucideIcon } from 'lucide-react'; export declare const AddIcon: LucideIcon;\n",
    });

    const result = auditPublicDeclarationClosures(root);
    const errors = result.errors.join('\n');
    assert.match(errors, /supplier-owned identifier "LucideIcon"/u);
    assert.match(errors, /supplier name or package "lucide-react"/u);
    assert.match(errors, /supplier name or package "@thesvg\/react"/u);
    assert.match(errors, /relative declaration edge cannot resolve: \.\/missing\/marks/u);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('current icons, marks, and pictograms emit a supplier-free public declaration closure', async () => {
  const declarationRoot = await mkdtemp(resolve(tmpdir(), 'cra17-current-declarations-'));
  try {
    const emittedRoot = resolve(declarationRoot, 'emitted');
    const sourceFiles = [
      resolve(CORE_ROOT, 'src/entrypoints/icons/index.ts'),
      resolve(CORE_ROOT, 'src/entrypoints/icons/presets/bithire/index.ts'),
      resolve(CORE_ROOT, 'src/graphics/icons/semantic/generated/roles/action-add.ts'),
      resolve(CORE_ROOT, 'src/entrypoints/graphics/marks/index.ts'),
      resolve(CORE_ROOT, 'src/entrypoints/graphics/marks/brand/index.ts'),
      resolve(CORE_ROOT, 'src/entrypoints/graphics/marks/cloud/index.ts'),
      resolve(CORE_ROOT, 'src/entrypoints/graphics/pictograms/index.ts'),
    ];
    const configPath = resolve(declarationRoot, 'tsconfig.json');
    await writeFile(configPath, `${JSON.stringify({
      compilerOptions: {
        declaration: true,
        emitDeclarationOnly: true,
        outDir: emittedRoot,
        rootDir: resolve(CORE_ROOT, 'src'),
        baseUrl: CORE_ROOT,
        paths: {
          '@/*': ['src/*'],
          '@types/*': ['src/foundation/contracts/*'],
          '@ui/*': ['src/components/*'],
        },
        target: 'ES2020',
        module: 'ESNext',
        moduleResolution: 'bundler',
        jsx: 'react-jsx',
        types: ['node'],
        typeRoots: [resolve(CORE_ROOT, 'node_modules/@types')],
        skipLibCheck: true,
        strict: true,
      },
      files: sourceFiles,
    }, null, 2)}\n`, 'utf8');
    try {
      execFileSync(
        resolve(CORE_ROOT, 'node_modules/.bin/tsc'),
        ['--project', configPath],
        { cwd: CORE_ROOT, encoding: 'utf8', stdio: 'pipe' },
      );
    } catch (error) {
      throw new Error(
        `CRA17 declaration emission failed:\n${String(error.stdout ?? '')}` +
        `${String(error.stderr ?? '')}`,
        { cause: error },
      );
    }

    const result = auditPublicDeclarationClosures(emittedRoot, {
      roots: {
        './icons': 'entrypoints/icons/index.d.ts',
        './icons/presets/bithire': 'entrypoints/icons/presets/bithire/index.d.ts',
        './icons/roles/action-add': 'graphics/icons/semantic/generated/roles/action-add.d.ts',
        './marks': 'entrypoints/graphics/marks/index.d.ts',
        './marks/brand': 'entrypoints/graphics/marks/brand/index.d.ts',
        './marks/cloud': 'entrypoints/graphics/marks/cloud/index.d.ts',
        './pictograms': 'entrypoints/graphics/pictograms/index.d.ts',
      },
    });
    assert.deepEqual(result.errors, []);
    assert.ok(result.files >= 35, `expected a real public closure, found ${result.files} files`);

    const factory = await readFile(
      resolve(emittedRoot, 'graphics/icons/glyphs/runtime/factory/index.d.ts'),
      'utf8',
    );
    const alert = await readFile(
      resolve(emittedRoot, 'graphics/icons/glyphs/presentation/catalog/status/alert-icon/index.d.ts'),
      'utf8',
    );
    assert.match(factory, /DSIconComponent/u);
    assert.match(alert, /AlertIcon/u);
    assert.match(alert, /SvgIconProps/u);
    assert.doesNotMatch(`${factory}\n${alert}`, /lucide|phosphor|hugeicons?|thesvg/iu);
    assert.equal(existsSync(resolve(emittedRoot, 'graphics/icons/glyphs/presentation/catalog/action/index.d.ts')), false);

    const catalog = await sourceModuleExportNames(resolve(CORE_ROOT, 'src/graphics/icons/glyphs/presentation/catalog/index.ts'));
    assert.equal(catalog.length, 329);
    const retired = catalog.filter((name) => name !== 'AlertIcon');
    assert.equal(retired.length, 328);
    const publicDeclaration = resolve(emittedRoot, 'entrypoints/icons/index.d.ts');
    const publicProgram = ts.createProgram([publicDeclaration], {
      noEmit: true,
      skipLibCheck: true,
      module: ts.ModuleKind.ESNext,
      moduleResolution: ts.ModuleResolutionKind.Bundler,
    });
    const checker = publicProgram.getTypeChecker();
    const publicSource = publicProgram.getSourceFile(publicDeclaration);
    assert.ok(publicSource);
    const publicModule = checker.getSymbolAtLocation(publicSource);
    assert.ok(publicModule);
    const publicNames = checker.getExportsOfModule(publicModule).map((symbol) => symbol.name);
    assert.equal(publicNames.length, 56);
    for (const name of ['AlertIcon', 'createIcon', 'DSIconComponent', 'DSIconProps', 'BaseIcon', 'Icon', 'IconProps', 'ICON_NAMES', 'GENERATED_ICON_METADATA']) {
      assert.ok(publicNames.includes(name), `${name} must remain in the emitted public API`);
    }
    for (const name of retired) assert.equal(publicNames.includes(name), false, `${name} must be absent from the emitted public API`);
  } finally {
    await rm(declarationRoot, { recursive: true, force: true });
  }
});
