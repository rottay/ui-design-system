import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtemp, readFile, readdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, resolve } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import {
  EXPECTED_COMPAT_V3_IDS,
  ICON_PACK_COUNTS,
  buildGeneratedFiles,
  checkGeneratedFiles,
  componentNameForId,
  loadAndValidateManifests,
  roleFileName,
  validateAdapterManifest,
  validateCorpusManifest,
  validateIconPresetManifest,
  validateLocalPhosphor,
} from './generate-semantic-icons.mjs';

const CORE_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const ICON_OWNER_ROOT = resolve(CORE_ROOT, 'src/graphics/icons');
const CORPUS_PATH = resolve(
  ICON_OWNER_ROOT,
  'foundation/semantic/corpus/manifest.json',
);
const ADAPTER_PATH = resolve(
  ICON_OWNER_ROOT,
  'foundation/semantic/adapters/phosphor-2.1.10.json',
);
const BITHIRE_PRESET_PATH = resolve(
  ICON_OWNER_ROOT,
  'foundation/semantic/presets/bithire/manifest.json',
);

async function readJson(path) {
  return JSON.parse(await readFile(path, 'utf8'));
}

async function listFiles(root, current = root) {
  const entries = await readdir(current, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const path = resolve(current, entry.name);
    if (entry.isDirectory()) files.push(...await listFiles(root, path));
    if (entry.isFile()) files.push(path);
  }
  return files;
}

test('authored corpus is the exact 263-role v6 governed set', async () => {
  const corpus = validateCorpusManifest(await readJson(CORPUS_PATH));
  assert.equal(corpus.entries.length, 263);
  for (const [pack, count] of Object.entries(ICON_PACK_COUNTS)) {
    assert.equal(corpus.entries.filter((entry) => entry.pack === pack).length, count);
  }
  assert.equal(corpus.entries.filter(({ status }) => status === 'stable').length, 50);
  assert.equal(corpus.entries.filter(({ status }) => status === 'candidate').length, 213);
  assert.equal(corpus.entries.filter(({ since }) => since === 4).length, 76);
  assert.equal(corpus.entries.filter(({ since }) => since === 5).length, 135);
  assert.equal(corpus.entries.filter(({ since }) => since === 6).length, 2);
  assert.deepEqual(
    corpus.entries.filter(({ status }) => status === 'stable').map(({ id }) => id),
    EXPECTED_COMPAT_V3_IDS,
  );
  assert.equal(new Set(corpus.entries.map(({ id }) => id)).size, 263);
  assert.equal(new Set(corpus.entries.map(({ componentName }) => componentName)).size, 263);
  for (const entry of corpus.entries) {
    assert.equal(entry.componentName, componentNameForId(entry.id));
    assert.equal(roleFileName(entry.id), `${entry.id.replaceAll('.', '-')}.ts`);
  }
});

test('Phosphor 2.1.10 adapter is ordered, exhaustive, and locally resolvable', async () => {
  const corpus = validateCorpusManifest(await readJson(CORPUS_PATH));
  const adapter = validateAdapterManifest(await readJson(ADAPTER_PATH), corpus);
  const result = await validateLocalPhosphor(adapter);
  assert.deepEqual(result, { checked: 263, packageVersion: '2.1.10' });
  assert.deepEqual(adapter.entries.map(({ id }) => id), corpus.entries.map(({ id }) => id));
  assert.equal(new Set(adapter.entries.map(({ module }) => module)).size, 263);
  assert.equal(new Set(adapter.entries.map(({ exportName }) => exportName)).size, 263);
});

test('BitHire preset is the exact bounded productive Icon inventory', async () => {
  const corpus = validateCorpusManifest(await readJson(CORPUS_PATH));
  const preset = validateIconPresetManifest(await readJson(BITHIRE_PRESET_PATH), corpus);
  assert.equal(preset.names.length, 46);
  assert.equal(new Set(preset.names).size, 46);
  assert.deepEqual(preset.names, [...preset.names].sort());
  assert.deepEqual(
    preset.names.filter((name) => name.startsWith('bithire.')),
    [
      'bithire.candidate',
      'bithire.evidence',
      'bithire.interview',
      'bithire.job',
      'bithire.offer',
      'bithire.pipeline',
    ],
  );
});

test('generated facade and role adapters derive exhaustively from the corpus manifests', async () => {
  const { corpus, adapter, bithirePreset } = await loadAndValidateManifests();
  const files = buildGeneratedFiles(corpus, adapter, bithirePreset);
  const facade = files.get('facade-map/index.tsx');

  assert.match(facade, /satisfies Record<GeneratedIconName, SemanticIconComponent>/u);
  for (const pack of Object.keys(ICON_PACK_COUNTS)) {
    assert.match(facade, new RegExp(`\\.\\.\\.${pack.toUpperCase()}_ICON_COMPONENTS`, 'u'));
  }
  assert.doesNotMatch(facade, /@phosphor|window|document|navigator/iu);

  for (const [index, corpusEntry] of corpus.entries.entries()) {
    const adapterEntry = adapter.entries[index];
    const roleSource = files.get(`roles/${roleFileName(corpusEntry.id)}`);
    assert.ok(
      roleSource.includes(
        `import { ${adapterEntry.exportName} as SsrGlyph } from ${JSON.stringify(adapterEntry.module)};`,
      ),
      corpusEntry.id,
    );
  }
});

test('generation is deterministic and emits bounded per-role and pack outputs', async () => {
  const { corpus, adapter, bithirePreset } = await loadAndValidateManifests();
  const first = buildGeneratedFiles(corpus, adapter, bithirePreset);
  const second = buildGeneratedFiles(
    structuredClone(corpus),
    structuredClone(adapter),
    structuredClone(bithirePreset),
  );
  assert.deepEqual([...first], [...second]);
  assert.equal(first.size, 274);
  assert.equal([...first.keys()].filter((path) => path.startsWith('roles/')).length, 263);
  assert.match(
    first.get('roles/action-add.ts'),
    /import \{ PlusIcon as SsrGlyph \} from "@phosphor-icons\/react\/dist\/ssr\/Plus";/u,
  );
  assert.match(first.get('roles/action-add.ts'), /\/\* @__PURE__ \*\/ createSemanticIcon\(SsrGlyph/u);
  assert.doesNotMatch(first.get('roles/action-add.ts'), /export \{ PlusIcon/u);
  assert.match(first.get('packs/foundation.tsx'), /"action\.add": ActionAddIcon/u);
  assert.match(first.get('packs/foundation.tsx'), /export const FoundationIcon = \/\* @__PURE__ \*\/ forwardRef/u);
  assert.doesNotMatch(first.get('packs/foundation.tsx'), /bithire\.|Phosphor|@phosphor/u);
  assert.match(first.get('packs/bithire.tsx'), /"bithire\.candidate": BithireCandidateIcon/u);
  assert.match(first.get('packs/bithire.tsx'), /export const BithireIcon = \/\* @__PURE__ \*\/ forwardRef/u);
  assert.doesNotMatch(first.get('packs/bithire.tsx'), /"action\.|Phosphor|@phosphor/u);
  assert.match(first.get('packs/identity.tsx'), /"security\.alert": SecurityAlertIcon/u);
  assert.match(first.get('packs/identity.tsx'), /export const IdentityIcon = \/\* @__PURE__ \*\/ forwardRef/u);
  assert.match(first.get('packs/identity.tsx'), /\/\* @__PURE__ \*\/ Object\.freeze/u);
  assert.match(first.get('packs/identity.tsx'), /\/\* @__PURE__ \*\/ forwardRef/u);
  assert.doesNotMatch(first.get('packs/identity.tsx'), /"analytics\.|"billing\.|Phosphor|@phosphor/u);
  assert.match(first.get('packs/intelligence.tsx'), /"ai\.agent": AiAgentIcon/u);
  assert.match(first.get('packs/intelligence.tsx'), /export const IntelligenceIcon = \/\* @__PURE__ \*\/ forwardRef/u);
  assert.doesNotMatch(first.get('packs/intelligence.tsx'), /"security\.|"commerce\.|Phosphor|@phosphor/u);
  assert.match(first.get('packs/operations.tsx'), /"workflow\.branch": WorkflowBranchIcon/u);
  assert.match(first.get('packs/operations.tsx'), /export const OperationsIcon = \/\* @__PURE__ \*\/ forwardRef/u);
  assert.doesNotMatch(first.get('packs/operations.tsx'), /"identity\.|"analytics\.|Phosphor|@phosphor/u);
  assert.match(first.get('phosphor-adapter.ts'), /packageVersion: "2\.1\.10"/u);
  assert.match(first.get('facade-map/index.tsx'), /resolveGeneratedIcon/u);
  assert.match(first.get('presets/bithire/index.tsx'), /export const BitHireIconPreset/u);
  assert.match(first.get('presets/bithire/index.tsx'), /"bithire\.candidate": BithireCandidateIcon/u);
  assert.doesNotMatch(first.get('presets/bithire/index.tsx'), /"action\.add"|Phosphor|@phosphor/u);
  assert.doesNotMatch(first.get('index.ts'), /phosphor|supplier/iu);
});

test('generated public source and declarations expose only supplier-free component types', async () => {
  const { corpus, adapter, bithirePreset } = await loadAndValidateManifests();
  const files = buildGeneratedFiles(corpus, adapter, bithirePreset);
  const publicSources = [
    files.get('index.ts'),
    files.get('corpus.ts'),
    files.get('packs/index.ts'),
    files.get('packs/foundation.tsx'),
    files.get('packs/bithire.tsx'),
    files.get('packs/identity.tsx'),
    files.get('packs/intelligence.tsx'),
    files.get('packs/operations.tsx'),
    files.get('presets/bithire/index.tsx'),
    files.get('facade-map/index.tsx'),
    await readFile(resolve(ICON_OWNER_ROOT, 'runtime/semantic/create-icon/index.tsx'), 'utf8'),
  ];
  for (const source of publicSources) {
    assert.doesNotMatch(source, /@phosphor|Phosphor(?:Icon|IconWeight)|LucideIcon/iu);
  }

  for (const [path, source] of files) {
    if (!path.startsWith('roles/')) continue;
    assert.equal(source.match(/from "@phosphor-icons\/react\/dist\/ssr\//gu)?.length, 1);
    assert.match(source, /\/\* @__PURE__ \*\/ createSemanticIcon\(SsrGlyph/u);
    assert.doesNotMatch(source, /import type .*phosphor|Phosphor(?:Icon|IconWeight)|LucideIcon|export \{ .*Icon as/iu);
  }

  const declarationRoot = await mkdtemp(resolve(tmpdir(), 'rottay-semantic-icon-declarations-'));
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
        resolve(ICON_OWNER_ROOT, 'presentation/semantic/generated/index.ts'),
        resolve(ICON_OWNER_ROOT, 'presentation/semantic/generated/presets/bithire/index.tsx'),
        resolve(ICON_OWNER_ROOT, 'presentation/semantic-icon/index.tsx'),
      ],
      { cwd: CORE_ROOT, encoding: 'utf8', stdio: 'pipe' },
    );
    const declarationFiles = (await listFiles(resolve(declarationRoot, 'graphics/icons')))
      .filter((path) => path.endsWith('.d.ts'));
    assert.ok(declarationFiles.length >= 272);
    for (const path of declarationFiles) {
      const declaration = await readFile(path, 'utf8');
      assert.doesNotMatch(declaration, /@phosphor|Phosphor(?:Icon|IconWeight)|LucideIcon/iu, path);
    }
  } finally {
    await rm(declarationRoot, { recursive: true, force: true });
  }
});

test('a named pack import tree-shakes to one exact supplier glyph', () => {
  const bundle = execFileSync(
    resolve(CORE_ROOT, 'node_modules/.bin/esbuild'),
    [
      '--bundle',
      '--format=esm',
      '--platform=browser',
      '--loader=ts',
      '--sourcefile=semantic-icon-tree-shake-fixture.ts',
      '--external:react',
      '--external:react/jsx-runtime',
      '--external:@phosphor-icons/react/*',
    ],
    {
      cwd: CORE_ROOT,
      encoding: 'utf8',
      input: 'import { SecurityAlertIcon } from "./src/entrypoints/icons/identity/index.ts"; console.log(SecurityAlertIcon);',
      stdio: ['pipe', 'pipe', 'pipe'],
    },
  );
  const supplierModules = [...bundle.matchAll(/@phosphor-icons\/react\/dist\/ssr\/[A-Za-z0-9]+/gu)]
    .map((match) => match[0]);
  assert.deepEqual(supplierModules, ['@phosphor-icons/react/dist/ssr/ShieldWarning']);
  assert.match(bundle, /data-icon-name/u);
  assert.doesNotMatch(bundle, /IdentityDirectoryIcon|IDENTITY_ICON_COMPONENTS/u);
});

test('the canonical Icon facade reaches all 263 roles through SSR-only supplier entries', () => {
  const bundle = execFileSync(
    resolve(CORE_ROOT, 'node_modules/.bin/esbuild'),
    [
      '--bundle',
      '--format=esm',
      '--platform=node',
      '--loader=ts',
      '--sourcefile=semantic-icon-facade-fixture.ts',
      '--external:react',
      '--external:react/jsx-runtime',
      '--external:@phosphor-icons/react/*',
    ],
    {
      cwd: CORE_ROOT,
      encoding: 'utf8',
      input: 'import { Icon } from "./src/entrypoints/icons/index.ts"; console.log(Icon);',
      stdio: ['pipe', 'pipe', 'pipe'],
    },
  );
  const supplierModules = [...bundle.matchAll(/@phosphor-icons\/react\/dist\/ssr\/[A-Za-z0-9]+/gu)]
    .map((match) => match[0]);

  assert.equal(supplierModules.length, 263);
  assert.equal(new Set(supplierModules).size, 263);
  assert.doesNotMatch(bundle, /@phosphor-icons\/react\/dist\/(?!ssr\/)/u);
});

test('BitHire preset retains only its 46 selected supplier glyphs', () => {
  const bundle = execFileSync(
    resolve(CORE_ROOT, 'node_modules/.bin/esbuild'),
    [
      '--bundle',
      '--format=esm',
      '--platform=node',
      '--loader=ts',
      '--sourcefile=bithire-icon-preset-fixture.ts',
      '--external:react',
      '--external:react/jsx-runtime',
      '--external:@phosphor-icons/react/*',
    ],
    {
      cwd: CORE_ROOT,
      encoding: 'utf8',
      input: 'import { BitHireIconPreset } from "./src/entrypoints/icons/presets/bithire/index.ts"; console.log(BitHireIconPreset);',
      stdio: ['pipe', 'pipe', 'pipe'],
    },
  );
  const supplierModules = [...bundle.matchAll(/@phosphor-icons\/react\/dist\/ssr\/[A-Za-z0-9]+/gu)]
    .map((match) => match[0]);
  assert.equal(supplierModules.length, 46);
  assert.equal(new Set(supplierModules).size, 46);
  assert.doesNotMatch(bundle, /ActionAddIcon|IDENTITY_ICON_COMPONENTS|OPERATIONS_ICON_COMPONENTS/u);
});

test('closed schemas reject drift, duplicates, and adapter-order mismatches', async () => {
  const corpus = await readJson(CORPUS_PATH);
  const adapter = await readJson(ADAPTER_PATH);

  const unknownField = structuredClone(corpus);
  unknownField.entries[0].supplierGlyph = 'Plus';
  assert.throws(() => validateCorpusManifest(unknownField), /not allowed by the schema/u);

  const wrongComponent = structuredClone(corpus);
  wrongComponent.entries[0].componentName = 'AddIcon';
  assert.throws(() => validateCorpusManifest(wrongComponent), /derived deterministically/u);

  const duplicate = structuredClone(corpus);
  duplicate.entries[44] = structuredClone(duplicate.entries[0]);
  duplicate.entries[44].status = 'candidate';
  duplicate.entries[44].since = 4;
  assert.throws(() => validateCorpusManifest(duplicate), /IDs must be unique/u);

  const reorderedAdapter = structuredClone(adapter);
  [reorderedAdapter.entries[0], reorderedAdapter.entries[1]] = [
    reorderedAdapter.entries[1],
    reorderedAdapter.entries[0],
  ];
  assert.throws(() => validateAdapterManifest(reorderedAdapter, corpus), /must match corpus order/u);
});

test('--check oracle sees no stale or unexpected generated files', async () => {
  const { corpus, adapter, bithirePreset } = await loadAndValidateManifests();
  assert.deepEqual(
    await checkGeneratedFiles(buildGeneratedFiles(corpus, adapter, bithirePreset)),
    [],
  );
});
