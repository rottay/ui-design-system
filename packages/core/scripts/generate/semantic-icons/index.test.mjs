import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, resolve } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import {
  EXPECTED_COMPAT_CORPUS_IDS,
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
} from './index.mjs';
import { packageRoot as findPackageRoot } from '../../libraries/repo-root/index.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const CORE_ROOT = findPackageRoot(HERE);
const ICON_OWNER_ROOT = resolve(CORE_ROOT, 'src/graphics/icons');
const SEMANTIC_ROOT = resolve(ICON_OWNER_ROOT, 'semantic');
const CORPUS_PATH = resolve(
  SEMANTIC_ROOT,
  'sources/corpus/manifest.json',
);
const ADAPTER_PATH = resolve(
  SEMANTIC_ROOT,
  'sources/adapters/phosphor-2.1.10.json',
);
const BITHIRE_PRESET_PATH = resolve(
  SEMANTIC_ROOT,
  'sources/presets/bithire/manifest.json',
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

test('authored corpus is the exact 282-role v6 governed set', async () => {
  const corpus = validateCorpusManifest(await readJson(CORPUS_PATH));
  assert.equal(corpus.entries.length, 282);
  for (const [pack, count] of Object.entries(ICON_PACK_COUNTS)) {
    assert.equal(corpus.entries.filter((entry) => entry.pack === pack).length, count);
  }
  assert.equal(corpus.entries.filter(({ status }) => status === 'stable').length, 50);
  assert.equal(corpus.entries.filter(({ status }) => status === 'candidate').length, 232);
  assert.equal(corpus.entries.filter(({ since }) => since === 4).length, 76);
  assert.equal(corpus.entries.filter(({ since }) => since === 5).length, 137);
  assert.equal(corpus.entries.filter(({ since }) => since === 6).length, 19);
  assert.deepEqual(
    corpus.entries.filter(({ status }) => status === 'stable').map(({ id }) => id),
    EXPECTED_COMPAT_CORPUS_IDS,
  );
  assert.equal(new Set(corpus.entries.map(({ id }) => id)).size, 282);
  assert.equal(new Set(corpus.entries.map(({ componentName }) => componentName)).size, 282);
  for (const entry of corpus.entries) {
    assert.equal(entry.componentName, componentNameForId(entry.id));
    assert.equal(roleFileName(entry.id), `${entry.id.replaceAll('.', '-')}.ts`);
  }
});

test('Phosphor 2.1.10 adapter is ordered, exhaustive, and locally resolvable', async () => {
  const corpus = validateCorpusManifest(await readJson(CORPUS_PATH));
  const adapter = validateAdapterManifest(await readJson(ADAPTER_PATH), corpus);
  const result = await validateLocalPhosphor(adapter);
  assert.deepEqual(result, { checked: 282, packageVersion: '2.1.10' });
  assert.deepEqual(adapter.entries.map(({ id }) => id), corpus.entries.map(({ id }) => id));
  assert.equal(new Set(adapter.entries.map(({ module }) => module)).size, 282);
  assert.equal(new Set(adapter.entries.map(({ exportName }) => exportName)).size, 282);
});

test('BitHire preset is the exact bounded productive Icon inventory', async () => {
  const corpus = validateCorpusManifest(await readJson(CORPUS_PATH));
  const preset = validateIconPresetManifest(await readJson(BITHIRE_PRESET_PATH), corpus);
  assert.equal(preset.names.length, 104);
  assert.equal(new Set(preset.names).size, 104);
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
  assert.equal(first.size, 290);
  assert.equal([...first.keys()].filter((path) => path.startsWith('roles/')).length, 282);
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
  assert.match(first.get('facade-map/index.tsx'), /resolveGeneratedIcon/u);
  assert.match(first.get('presets/bithire/index.tsx'), /export const BitHireIconPreset/u);
  assert.match(first.get('presets/bithire/index.tsx'), /"bithire\.candidate": BithireCandidateIcon/u);
  assert.match(first.get('presets/bithire/index.tsx'), /"action\.add": ActionAddIcon/u);
  assert.match(first.get('presets/bithire/index.tsx'), /Object\.keys\(\s*BITHIRE_PRESET_ICON_COMPONENTS/u);
  assert.equal(
    first.get('presets/bithire/index.tsx').match(/"action\.add"/gu)?.length,
    1,
  );
  assert.doesNotMatch(first.get('presets/bithire/index.tsx'), /Phosphor|@phosphor/u);
});

test('generated public source and declarations expose only supplier-free component types', async () => {
  const { corpus, adapter, bithirePreset } = await loadAndValidateManifests();
  const files = buildGeneratedFiles(corpus, adapter, bithirePreset);
  const publicSources = [
    files.get('corpus.ts'),
    files.get('packs/foundation.tsx'),
    files.get('packs/bithire.tsx'),
    files.get('packs/identity.tsx'),
    files.get('packs/intelligence.tsx'),
    files.get('packs/operations.tsx'),
    files.get('presets/bithire/index.tsx'),
    files.get('facade-map/index.tsx'),
    await readFile(resolve(SEMANTIC_ROOT, 'runtime/create-icon/index.tsx'), 'utf8'),
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
    const declarationOut = resolve(declarationRoot, 'declarations');
    const declarationProject = resolve(declarationRoot, 'tsconfig.json');
    const declarationEnvironment = resolve(declarationRoot, 'environment.d.ts');
    await writeFile(
      declarationEnvironment,
      'declare const process: { readonly env: { readonly NODE_ENV?: string } };\n',
    );
    await writeFile(declarationProject, JSON.stringify({
      compilerOptions: {
        baseUrl: resolve(CORE_ROOT, 'src'),
        declaration: true,
        emitDeclarationOnly: true,
        jsx: 'react-jsx',
        module: 'ESNext',
        moduleResolution: 'bundler',
        outDir: declarationOut,
        paths: { '@/*': ['*'] },
        rootDir: resolve(CORE_ROOT, 'src'),
        skipLibCheck: true,
        strict: true,
        target: 'ES2020',
      },
      files: [
        declarationEnvironment,
        resolve(SEMANTIC_ROOT, 'generated/corpus/index.ts'),
        resolve(SEMANTIC_ROOT, 'generated/presets/bithire/index.tsx'),
        resolve(SEMANTIC_ROOT, 'presentation/icon/index.tsx'),
      ],
    }));
    try {
      execFileSync(
        resolve(CORE_ROOT, 'node_modules/.bin/tsc'),
        ['--project', declarationProject],
        { cwd: CORE_ROOT, encoding: 'utf8', stdio: 'pipe' },
      );
    } catch (error) {
      assert.fail(error.stdout?.toString() || error.stderr?.toString() || error.message);
    }
    const declarationFiles = (await listFiles(resolve(declarationOut, 'graphics/icons')))
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

test('the canonical Icon facade reaches all 282 roles through SSR-only supplier entries', () => {
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

  assert.equal(supplierModules.length, 282);
  assert.equal(new Set(supplierModules).size, 282);
  assert.doesNotMatch(bundle, /@phosphor-icons\/react\/dist\/(?!ssr\/)/u);
});

test('BitHire preset retains only its 104 selected supplier glyphs', () => {
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
  assert.equal(supplierModules.length, 104);
  assert.equal(new Set(supplierModules).size, 104);
  assert.doesNotMatch(bundle, /FOUNDATION_ICON_COMPONENTS|IDENTITY_ICON_COMPONENTS|OPERATIONS_ICON_COMPONENTS/u);
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

test('role modules omit redundant componentName and default autoMirror while corpus metadata stays full', async () => {
  const { corpus, adapter, bithirePreset } = await loadAndValidateManifests();
  const files = buildGeneratedFiles(corpus, adapter, bithirePreset);

  assert.equal(
    files.get('roles/action-add.ts'),
    '// Generated by scripts/generate/semantic-icons/index.mjs. Do not edit.\n\n'
      + 'import { PlusIcon as SsrGlyph } from "@phosphor-icons/react/dist/ssr/Plus";\n\n'
      + "import { createSemanticIcon } from '../../runtime/create-icon';\n\n"
      + '/** action.add: Create or append a new item. */\n'
      + 'export const ActionAddIcon = /* @__PURE__ */ createSemanticIcon(SsrGlyph, {\n'
      + '  name: "action.add",\n'
      + '  defaultRole: "control",\n'
      + '});\n',
  );
  assert.equal(
    files.get('roles/navigation-forward.ts'),
    '// Generated by scripts/generate/semantic-icons/index.mjs. Do not edit.\n\n'
      + 'import { ArrowRightIcon as SsrGlyph } from "@phosphor-icons/react/dist/ssr/ArrowRight";\n\n'
      + "import { createSemanticIcon } from '../../runtime/create-icon';\n\n"
      + '/** navigation.forward: Navigate to the logically next destination. */\n'
      + 'export const NavigationForwardIcon = /* @__PURE__ */ createSemanticIcon(SsrGlyph, {\n'
      + '  name: "navigation.forward",\n'
      + '  defaultRole: "navigation",\n'
      + '  autoMirror: true,\n'
      + '});\n',
  );
  assert.equal(
    files.get('roles/status-success.ts'),
    '// Generated by scripts/generate/semantic-icons/index.mjs. Do not edit.\n\n'
      + 'import { CheckCircleIcon as SsrGlyph } from "@phosphor-icons/react/dist/ssr/CheckCircle";\n\n'
      + "import { createSemanticIcon } from '../../runtime/create-icon';\n\n"
      + '/** status.success: Indicate successful completion. */\n'
      + 'export const StatusSuccessIcon = /* @__PURE__ */ createSemanticIcon(SsrGlyph, {\n'
      + '  name: "status.success",\n'
      + '  defaultRole: "status",\n'
      + '  defaultTone: "success",\n'
      + '});\n',
  );

  for (const entry of corpus.entries) {
    const roleSource = files.get(`roles/${roleFileName(entry.id)}`);
    assert.ok(
      roleSource.includes(
        `export const ${entry.componentName} = /* @__PURE__ */ createSemanticIcon(SsrGlyph, {`,
      ),
      entry.id,
    );
    assert.ok(roleSource.includes(`name: ${JSON.stringify(entry.id)},`), entry.id);
    assert.ok(roleSource.includes(`defaultRole: ${JSON.stringify(entry.defaultRole)},`), entry.id);
    assert.doesNotMatch(roleSource, /componentName/u, entry.id);
    if (entry.defaultTone) {
      assert.ok(roleSource.includes(`defaultTone: ${JSON.stringify(entry.defaultTone)},`), entry.id);
    } else {
      assert.doesNotMatch(roleSource, /defaultTone/u, entry.id);
    }
    if (entry.autoMirror) {
      assert.ok(roleSource.includes('autoMirror: true,'), entry.id);
      assert.doesNotMatch(roleSource, /autoMirror: false/u, entry.id);
    } else {
      assert.doesNotMatch(roleSource, /autoMirror/u, entry.id);
    }
  }

  const corpusSource = files.get('corpus.ts');
  assert.equal(corpusSource.match(/componentName: "/gu)?.length, 282);
  assert.equal(corpusSource.match(/autoMirror: (?:true|false),/gu)?.length, 282);
  for (const entry of corpus.entries) {
    assert.ok(corpusSource.includes(`componentName: ${JSON.stringify(entry.componentName)}`), entry.id);
    assert.ok(corpusSource.includes(`autoMirror: ${entry.autoMirror}`), entry.id);
  }
});

test('--check oracle sees no stale or unexpected generated files', async () => {
  const { corpus, adapter, bithirePreset } = await loadAndValidateManifests();
  assert.deepEqual(
    await checkGeneratedFiles(buildGeneratedFiles(corpus, adapter, bithirePreset)),
    [],
  );
});
