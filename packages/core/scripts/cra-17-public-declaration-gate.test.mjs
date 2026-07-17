import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
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

import { auditPublicDeclarationClosures } from './cra-17-public-declaration-gate.mjs';

const CORE_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

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
      './marks': { types: './dist/marks.d.ts' },
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
      'dist/marks.d.ts': "export * from './public/marks/index';\n",
      'dist/pictograms.d.ts': "export * from './public/pictograms/index';\n",
      'dist/public/icons/index.d.ts': "export declare const Icon: import('react').ComponentType<{ size?: number }>;\n",
      'dist/public/marks/index.d.ts': "export interface MarkSource { readonly packageName: string }\n",
      'dist/public/pictograms/index.d.ts': "export declare const FeaturePictogram: import('react').ComponentType;\n",
      'dist/private/adapter.d.ts': "import type { LucideIcon } from 'lucide-react'; export declare const Private: LucideIcon;\n",
    });

    const result = auditPublicDeclarationClosures(root);
    assert.deepEqual(result.errors, []);
    assert.equal(result.files, 6);
    assert.deepEqual(Object.keys(result.entrypoints), ['./icons', './marks', './pictograms']);
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
      'dist/marks.d.ts': "export * from './missing/marks';\n",
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
    execFileSync(
      resolve(CORE_ROOT, 'node_modules/.bin/tsc'),
      [
        '--declaration',
        '--emitDeclarationOnly',
        '--outDir', declarationRoot,
        '--rootDir', resolve(CORE_ROOT, 'src'),
        '--target', 'ES2020',
        '--module', 'ESNext',
        '--moduleResolution', 'bundler',
        '--jsx', 'react-jsx',
        '--skipLibCheck',
        '--strict',
        resolve(CORE_ROOT, 'src/entrypoints/icons/index.ts'),
        resolve(CORE_ROOT, 'src/entrypoints/graphics/marks/index.ts'),
        resolve(CORE_ROOT, 'src/entrypoints/graphics/pictograms/index.ts'),
      ],
      { cwd: CORE_ROOT, encoding: 'utf8', stdio: 'pipe' },
    );

    const result = auditPublicDeclarationClosures(declarationRoot, {
      roots: {
        './icons': 'entrypoints/icons/index.d.ts',
        './marks': 'entrypoints/graphics/marks/index.d.ts',
        './pictograms': 'entrypoints/graphics/pictograms/index.d.ts',
      },
    });
    assert.deepEqual(result.errors, []);
    assert.ok(result.files >= 35, `expected a real public closure, found ${result.files} files`);

    const factory = await readFile(
      resolve(declarationRoot, 'graphics/icons/runtime/factory/index.d.ts'),
      'utf8',
    );
    const catalog = await readFile(
      resolve(declarationRoot, 'graphics/icons/presentation/catalog/action/index.d.ts'),
      'utf8',
    );
    assert.match(factory, /DSIconComponent/u);
    assert.match(catalog, /DSIconComponent/u);
    assert.doesNotMatch(`${factory}\n${catalog}`, /lucide|phosphor|hugeicons?|thesvg/iu);
  } finally {
    await rm(declarationRoot, { recursive: true, force: true });
  }
});
