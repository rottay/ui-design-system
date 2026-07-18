import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { dirname, extname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const coreRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const sourceRoots = [
  'src/ui/surfaces',
  'src/ui/structures/dashboard',
  'src/ui/structures/headers',
  'src/ui/patterns/customization/tenant-preview',
].map((path) => join(coreRoot, path));
const cssRoots = [
  'src/foundation/tokens/css/presentation/components/skin',
  'src/foundation/tokens/css/runtime/engines',
].map((path) => join(coreRoot, path));
const personalityPath = join(coreRoot, 'src/foundation/tokens/css/runtime/personality.css');
const compatibilitySkinPath = join(
  coreRoot,
  'src/foundation/tokens/css/presentation/components/skin/surface-accent-bar.css'
);

function collectFiles(directory, extensions) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'tests' || entry.name === '__tests__') return [];
      return collectFiles(path, extensions);
    }
    return extensions.has(extname(entry.name)) ? [path] : [];
  });
}

function withoutComments(source) {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '');
}

test('production anatomy renders no decorative accent-strip parts', () => {
  const forbiddenPart = /data-part\s*=\s*["'](?:accent-bar|top-accent|title-accent|insight-accent)["']/;

  for (const path of sourceRoots.flatMap((root) => collectFiles(root, new Set(['.ts', '.tsx'])))) {
    assert.doesNotMatch(
      withoutComments(readFileSync(path, 'utf8')),
      forbiddenPart,
      `${relative(coreRoot, path)} renders a decorative accent strip`
    );
  }
});

test('surface and engine skins do not paint named or tone-only edge rails', () => {
  for (const path of cssRoots.flatMap((root) => collectFiles(root, new Set(['.css'])))) {
    if (path === compatibilitySkinPath) continue;
    const css = withoutComments(readFileSync(path, 'utf8'));

    assert.doesNotMatch(
      css,
      /\[data-part=['"](?:accent-bar|top-accent|title-accent|insight-accent)['"]\]/,
      `${relative(coreRoot, path)} paints a named decorative accent strip`
    );
  }

  const chartSkin = withoutComments(
    readFileSync(
      join(coreRoot, 'src/foundation/tokens/css/presentation/components/skin/chart-foundation.css'),
      'utf8'
    )
  );
  assert.doesNotMatch(chartSkin, /border-inline-start\s*:/);

  for (const path of [
    'src/foundation/tokens/css/presentation/components/skin/notification-surface.css',
    'src/foundation/tokens/css/runtime/engines/rustic/skin/alert.css',
    'src/foundation/tokens/css/runtime/engines/rustic/skin/callout.css',
    'src/foundation/tokens/css/runtime/engines/rustic/skin/notification.css',
  ]) {
    assert.doesNotMatch(
      withoutComments(readFileSync(join(coreRoot, path), 'utf8')),
      /border-left(?:-width|-style)?\s*:\s*(?:[3-9]px|solid)/,
      `${path} reintroduces a feedback edge rail`
    );
  }
});

test('legacy compatibility is inert while functional lines remain available', () => {
  const compatibilitySkin = withoutComments(readFileSync(compatibilitySkinPath, 'utf8'));
  const personality = withoutComments(readFileSync(personalityPath, 'utf8'));
  const workspaceSkin = withoutComments(
    readFileSync(
      join(coreRoot, 'src/foundation/tokens/css/presentation/components/skin/collection-workspace.css'),
      'utf8'
    )
  );
  const tableInteractions = withoutComments(
    readFileSync(
      join(coreRoot, 'src/foundation/tokens/css/presentation/components/skin/data-table-interactions.css'),
      'utf8'
    )
  );

  assert.match(compatibilitySkin, /display:\s*none/);
  assert.doesNotMatch(compatibilitySkin, /\b(?:background|border|animation|box-shadow)\s*:/);
  assert.doesNotMatch(personality, /border-left-(?:width|style)\s*:/);

  // These are structural or state-bearing, not ornamental: panel separation,
  // keyboard focus, and dirty-cell state must survive this prohibition.
  assert.match(workspaceSkin, /\[data-part='preview-rail'\][\s\S]*?border-left:\s*2px/);
  assert.match(tableInteractions, /tr\[data-row-index\]:focus-visible[\s\S]*?inset 3px 0 0 0/);
  assert.match(tableInteractions, /td\[data-cell-dirty='true'\]::before/);
});
