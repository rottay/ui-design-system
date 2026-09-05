import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { orphanedImports, transformRootLayout } from '../index.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const CODEMOD_ROOT = path.resolve(HERE, '..');
const FIXTURES = path.join(CODEMOD_ROOT, 'fixtures');
const CORE_ROOT = path.resolve(CODEMOD_ROOT, '../../../..');
const TRIO = ['ssr', 'contracts', 'artifact-resolution'];

const BITHIRE_OPTIONS = {
  vertical: 'bithire',
  artifact: 'runtimeArtifact',
  document: 'runtimeDocument',
  themeMode: 'configuredTheme',
  locale: 'lang',
};

function fixture(...segments) {
  return fs.readFileSync(path.join(FIXTURES, ...segments), 'utf8');
}

test("app-bithire's real root layout mounts through one call after the transform", () => {
  const before = fixture('app-bithire', 'layout.input.tsx');
  const { source, operations } = transformRootLayout(before, BITHIRE_OPTIONS);

  assert.deepEqual(operations.slice().sort(), [
    'mount-call',
    'projection-reference',
    'server-import',
    'style-elements',
  ]);

  // One call, and it is the only source of the root scope and the style element.
  assert.equal(source.match(/mountTenantTheme\(/g).length, 1);
  assert.match(source, /const \{ rootAttributes, styleElements \} = await mountTenantTheme\(/);
  assert.match(source, /styleElements\.map\(\(element\) => \(/);

  // The app no longer assembles either half by hand.
  assert.equal(source.includes('resolveDocumentRootAttributes'), false);
  assert.equal(source.includes('data-digest={'), false);
  assert.equal(source.includes('data-compiler={'), false);
  assert.equal(source.includes('__html: runtimeArtifact.css'), false);

  // And the trio symbol that only served the hand-written element is reported.
  assert.deepEqual(
    orphanedImports(source).map((entry) => entry.name),
    ['RUNTIME_TENANT_THEME_STYLE_ID'],
  );
});

test('the transform is idempotent by refusal, never by a second rewrite', () => {
  const once = transformRootLayout(fixture('app-bithire', 'layout.input.tsx'), BITHIRE_OPTIONS).source;
  assert.throws(
    () => transformRootLayout(once, BITHIRE_OPTIONS),
    /expected exactly one resolveDocumentRootAttributes\(\.\.\.\) call to replace, found 0/,
  );
});

test('a layout that is not async is refused rather than half-migrated', () => {
  const source = fixture('app-bithire', 'layout.input.tsx').replace(
    'export default async function RootLayout',
    'export default function RootLayout',
  );
  assert.throws(
    () => transformRootLayout(source, BITHIRE_OPTIONS),
    /must be `async` before it can await mountTenantTheme/,
  );
});

test('an artifact with no document expression is refused by name', () => {
  assert.throws(
    () => transformRootLayout(fixture('app-bithire', 'layout.input.tsx'), {
      ...BITHIRE_OPTIONS,
      document: undefined,
    }),
    /only `documentThemeIntent` can name a tenant-authored one/,
  );
});

test('a second hand-written artifact style element is refused rather than guessed', () => {
  const source = fixture('app-bithire', 'layout.input.tsx').replace(
    '      </head>',
    '        <style dangerouslySetInnerHTML={{ __html: "" }} />\n      </head>',
  );
  assert.throws(
    () => transformRootLayout(source, BITHIRE_OPTIONS),
    /expected exactly one hand-written tenant-theme <style> element, found 2/,
  );
});

test('a bundled-only layout migrates to the static intent with no artifact option', () => {
  const { source } = transformRootLayout(fixture('compile', 'layout.tsx'), {
    vertical: 'bithire',
    themeMode: 'configuredTheme',
    locale: 'lang',
  });
  assert.match(source, /await mountTenantTheme\(\n {4}staticThemeIntent\("bithire"\)/);
  // The named import list, not the prose: the fixture's own comment names the
  // producer this arm deliberately does not use.
  assert.equal(/^ {2}documentThemeIntent,$/m.test(source), false);
  assert.equal(source.includes('artifact: '), false);
});

/**
 * The acceptance gate: the codemod applied over a copy of app-bithire's trio
 * COMPILES. The trio files are verbatim copies; the layout is the mount block
 * that imports them. Both are typechecked against the design system's real
 * `entrypoints/server` source, not against a stub and not against `dist`.
 */
test('the transformed layout and a copy of the app-bithire trio typecheck', { timeout: 600000 }, () => {
  const workspace = fs.mkdtempSync(path.join(os.tmpdir(), 'mount-tenant-theme-'));
  const appSrc = path.join(workspace, 'src');
  const trioRoot = path.join(appSrc, 'core/lib/theme/runtime-tenant-theme');

  for (const unit of TRIO) {
    fs.mkdirSync(path.join(trioRoot, unit), { recursive: true });
    fs.writeFileSync(
      path.join(trioRoot, unit, 'index.ts'),
      fixture('app-bithire', 'trio', unit, 'index.ts'),
    );
  }

  const { source } = transformRootLayout(fixture('compile', 'layout.tsx'), BITHIRE_OPTIONS);
  fs.mkdirSync(path.join(appSrc, 'app'), { recursive: true });
  fs.writeFileSync(path.join(appSrc, 'app/layout.tsx'), source);

  const tsconfig = path.join(workspace, 'tsconfig.json');
  fs.writeFileSync(tsconfig, JSON.stringify({
    compilerOptions: {
      target: 'ES2022',
      lib: ['dom', 'dom.iterable', 'ES2022'],
      strict: true,
      noEmit: true,
      module: 'esnext',
      moduleResolution: 'bundler',
      resolveJsonModule: true,
      esModuleInterop: true,
      skipLibCheck: true,
      jsx: 'react-jsx',
      typeRoots: [path.join(CORE_ROOT, 'node_modules/@types')],
      paths: {
        // The app's `@/` first, the design system's own `@/` as the fallback the
        // core sources resolve through. One project, two alias namespaces.
        '@/*': [path.join(appSrc, '*'), path.join(CORE_ROOT, 'src/*')],
        '@ui/*': [path.join(CORE_ROOT, 'src/components/*')],
        '@types/*': [path.join(CORE_ROOT, 'src/foundation/contracts/*')],
        '@rottay/design-system': [path.join(CORE_ROOT, 'src/index.ts')],
        '@rottay/design-system/server': [path.join(CORE_ROOT, 'src/entrypoints/server/index.ts')],
      },
    },
    include: [path.join(appSrc, '**/*.ts'), path.join(appSrc, '**/*.tsx')],
  }, null, 2));

  let diagnostics = '';
  try {
    execFileSync(
      process.execPath,
      [path.join(CORE_ROOT, 'node_modules/typescript/bin/tsc'), '--noEmit', '-p', tsconfig],
      { cwd: workspace, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] },
    );
  } catch (error) {
    diagnostics = `${error.stdout ?? ''}${error.stderr ?? ''}`;
  }
  // Only diagnostics in the APP files are this gate's subject. The design
  // system's own sources are compiled here because the trio consumes them, but
  // their health is `pnpm typecheck`'s question, not this codemod's -- and a
  // concurrent edit inside the DS must not be reported as a broken migration.
  // Matched on the workspace's unique directory name: `tsc` reports paths
  // relative to its cwd, and on macOS that relative path walks out through
  // `/private/var`, so a `src/`-prefix filter would silently match nothing and
  // report a green for a layout that does not compile.
  const marker = path.basename(workspace);
  const appDiagnostics = diagnostics
    .split('\n')
    .filter((line) => line.includes(`${marker}/src/`))
    .join('\n');
  assert.equal(appDiagnostics.trim(), '', appDiagnostics);
  fs.rmSync(workspace, { recursive: true, force: true });
});
