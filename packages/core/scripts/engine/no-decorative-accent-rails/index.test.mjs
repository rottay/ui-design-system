import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { dirname, extname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { packageRoot as findPackageRoot } from '../../lib/repo-root/index.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const coreRoot = findPackageRoot(HERE);
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

function escapeForRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Returns the body of the ONE top-level rule the selector opens, and fails if
 * the selector opens zero or more than one. Multi-line selectors and wrapped
 * declarations are whitespace-normalized first, so the selector is written the
 * way it reads rather than the way it happens to be line-wrapped.
 *
 * `(?:^|\})` anchors to a top-level rule: `tr[data-row-index]:focus-visible`
 * also appears as one arm of the `forced-colors` comma list, and that arm is a
 * different contract. A permissive match would read the wrong body and could
 * report a ring that the base rule does not paint.
 */
function soleRuleBody(css, selector, label) {
  const flattened = css.replace(/\s+/g, ' ');
  const pattern = new RegExp(
    `(?:^|\\})\\s*${escapeForRegExp(selector)}\\s*\\{([^{}]*)\\}`,
    'g'
  );
  const bodies = [...flattened.matchAll(pattern)].map((match) => match[1].trim());
  assert.equal(bodies.length, 1, `${label}: expected exactly one top-level rule for ${selector}`);
  return bodies[0];
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

test('legacy compatibility is inert while functional affordances remain available without edge rails', () => {
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

  // Panel separation must use a complete boundary. A one-sided rail is the
  // decorative treatment prohibited by this contract, even when it was once
  // described as structural.
  const previewRailRule = workspaceSkin.match(
    /\[data-part=["']preview-rail["']\]\s*\{([\s\S]*?)\}/,
  )?.[1] ?? '';
  assert.match(previewRailRule, /\bborder:\s*1px solid/);
  // Every one-sided spelling is banned, not just the two that happened to be
  // removed: the physical pair, the logical pair, and the `-width`/`-style`/
  // `-color` longhands each reconstruct the same rail on their own.
  assert.doesNotMatch(
    previewRailRule,
    /\bborder-(?:left|right|inline-start|inline-end)(?:-(?:width|style|color))?\s*:/,
  );

  // The focused row is TWO rules, and each carries a different half of the
  // contract. The <tr> owns the tint and kills the native outline; it must not
  // own the ring, because a box-shadow on a <tr> does not render under
  // border-collapse -- asserting the ring there passed on a rule that painted
  // nothing.
  const focusedRowSelector =
    '.ds-engine-modern:where(.ds-pattern-data-table) tr[data-row-index]:focus-visible';
  const focusedRowRule = soleRuleBody(tableInteractions, focusedRowSelector, 'focused row');
  assert.match(focusedRowRule, /background-color:\s*var\(\s*--ds-table-row-bg-selected/);
  assert.match(focusedRowRule, /outline:\s*none;/);
  assert.doesNotMatch(focusedRowRule, /box-shadow/);

  // The cell owns the ring, and it is a FULL boundary: one declaration, an
  // even `inset 0 0 0 1px` on all four edges. Exact equality is the point --
  // a rail spelling such as `inset 3px 0 0 0` is a valid box-shadow with a
  // valid `inset` prefix, so only the exact geometry separates the ring the
  // contract allows from the decorative edge it prohibits.
  const focusedCellRule = soleRuleBody(
    tableInteractions,
    `${focusedRowSelector} > td`,
    'focused cell ring',
  );
  const focusedCellShadows = focusedCellRule.match(/box-shadow:[^;]*;/g) ?? [];
  assert.equal(focusedCellShadows.length, 1, 'the focused cell paints exactly one ring');
  assert.equal(
    focusedCellShadows[0],
    'box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--ds-color-primary) 48%, transparent);',
  );

  assert.match(tableInteractions, /td\[data-cell-dirty=["']true["']\]::before/);
});
