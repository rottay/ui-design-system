import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { packageRoot as findPackageRoot } from '../../lib/repo-root/index.mjs';

/**
 * Private-runtime boundary drill.
 *
 * The defect this exists to prevent has a concrete history: the deterministic
 * adaptive placement solver used to live at
 * `ui/patterns/data/widget-board/runtime/solver`, so DashboardSurface — a
 * completely different owner — had to import another FAMILY's internal runtime
 * branch to place its own sections. Nothing failed, because the target was a
 * legal `folder/index.ts`; the tree simply grew a private dependency that no
 * gate could see. Shared capability must be shared BY DECLARATION (a support
 * owner such as `ui/patterns/runtime/*`), never by reaching through a
 * neighbour's implementation.
 *
 * The rule, stated once:
 *
 *   A UI family owner (`ui/<tier>/<group>/<family>`) may not import another
 *   family owner's private implementation branch — `runtime/`, `policy/` or
 *   `composition/`. Those branches hold the family's own decisions and state.
 *
 * What stays reachable is deliberate, because the tree already composes across
 * owners through it every day: the owner's root index, plus its `contracts/`,
 * `foundation/`, `engines/`, `presentation/`, `compound/`, `facade/` and
 * `public/` branches. A modern pattern engine composing a sibling primitive's
 * `engines/modern` implementation is the house style, not debt, and this drill
 * must not pretend otherwise — a drill that flags 597 sanctioned edges teaches
 * people to disable it.
 *
 * Support territory is exempt as a TARGET: `foundation`, `runtime`, `tooling`,
 * `facade`, `composition`, `presentation`, `common` and `tests` groups exist to
 * be consumed by other owners (`ui/patterns/runtime/virtualization`,
 * `ui/surfaces/foundation/common/test-utils`, and now
 * `ui/patterns/runtime/adaptive-layout`). Those owners carry no component
 * inventory row precisely because they are shared support, so an edge into one
 * of them is the sanctioned outcome this rule pushes people toward.
 *
 * The scanner is pure over a virtual file set (relative path -> source text)
 * and resolves specifiers against that set alone. That is what makes the
 * planted-negative test below exercise the SAME code path as the real-tree
 * scan instead of a lookalike.
 */

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const coreRoot = findPackageRoot(scriptDirectory);
const uiRoot = path.join(coreRoot, 'src/ui');

/**
 * Groups that are shared support by declaration. A group directly below a UI
 * tier with one of these names is not a component family, holds no inventory
 * row, and is therefore a legitimate destination for any owner.
 */
const UI_SUPPORT_GROUPS = new Set([
  'common',
  'composition',
  'facade',
  'foundation',
  'presentation',
  'runtime',
  'tests',
  'tooling',
]);

/**
 * A family owner's own decision/state branches. `runtime` is the historical
 * offender; `policy` and `composition` are included because they carry the
 * same kind of private reasoning and would be the next place a shortcut lands.
 */
const PRIVATE_IMPLEMENTATION_BRANCHES = new Set([
  'composition',
  'policy',
  'runtime',
]);

/**
 * Pre-existing crossings, recorded rather than hidden. This list is
 * DECREASE-ONLY: an entry may be deleted when the edge is genuinely retired,
 * and a new one may never be added to make a red drill green. The second
 * assertion below fails when a registered entry disappears from the tree, so
 * the list cannot rot into a permanent excuse.
 *
 * Both entries predate this drill and belong to other owners:
 * - tree-view's modern engine drives the Tree primitive's private behavior
 *   hook instead of a declared support owner;
 * - the connected command palette reads the command-palette pattern's private
 *   application-command runtime instead of a shared command contract.
 */
const REGISTERED_DEBT = new Set([
  'ui/patterns/visualization/tree-view/engines/modern/index.tsx -> ui/primitives/display/Tree/runtime/tree-behavior/index.ts',
  'ui/structures/workspace/connected-command-palette/index.tsx -> ui/patterns/navigation/command-palette/runtime/application-commands/index.ts',
]);

const MODULE_EXTENSIONS = ['.ts', '.tsx'];
const SPECIFIER_PATTERN =
  /(?:^|\n)\s*(?:import|export)[\s\S]*?from\s*['"]([^'"]+)['"]/g;

function toPosix(value) {
  return value.split(path.sep).join('/');
}

function segmentsOf(value) {
  return value.split('/').filter(Boolean);
}

/**
 * A UI owner is `ui/<tier>/<group>/<family>`, the same four-segment identity
 * `core-structure-audit`'s `isUiCapabilityOwner` uses. Anything shallower is a
 * tier catalog rather than an owner and takes part in no boundary.
 */
function ownerOf(relativePath) {
  const segments = segmentsOf(relativePath);
  if (segments[0] !== 'ui' || segments.length < 5) return null;
  return {
    owner: segments.slice(0, 4).join('/'),
    group: segments[2],
    tail: segments.slice(4),
  };
}

/**
 * Resolve one specifier against the virtual file set, mirroring how the
 * bundler resolves authored source: `./x` and `../x` from the importing
 * directory, `@/x` from `src/`, everything else (packages, engines resolved
 * through the registry, CSS) is out of scope for a source-tree boundary.
 */
function resolveSpecifier(fromRelativePath, specifier, files) {
  let base;
  if (specifier.startsWith('.')) {
    base = toPosix(path.posix.normalize(
      path.posix.join(path.posix.dirname(fromRelativePath), specifier),
    ));
  } else if (specifier.startsWith('@/')) {
    base = toPosix(path.posix.normalize(specifier.slice(2)));
  } else {
    return null;
  }
  if (base.startsWith('..')) return null;
  for (const extension of MODULE_EXTENSIONS) {
    if (files.has(`${base}${extension}`)) return `${base}${extension}`;
  }
  for (const extension of MODULE_EXTENSIONS) {
    const index = `${base}/index${extension}`;
    if (files.has(index)) return index;
  }
  return files.has(base) ? base : null;
}

/**
 * @param {Map<string, string>} files relative path -> source text
 * @returns {string[]} sorted `source -> target` edges that cross a family
 *   boundary into a private implementation branch
 */
export function auditPrivateRuntimeBoundary(files) {
  const crossings = [];
  for (const [relativePath, text] of files) {
    const from = ownerOf(relativePath);
    if (!from) continue;
    for (const match of text.matchAll(SPECIFIER_PATTERN)) {
      const target = resolveSpecifier(relativePath, match[1], files);
      if (!target) continue;
      const to = ownerOf(target);
      if (!to || to.owner === from.owner) continue;
      if (UI_SUPPORT_GROUPS.has(to.group)) continue;
      if (to.tail.length === 0) continue;
      if (!PRIVATE_IMPLEMENTATION_BRANCHES.has(to.tail[0])) continue;
      crossings.push(`${relativePath} -> ${target}`);
    }
  }
  return [...new Set(crossings)].sort();
}

/**
 * Production sources only. Tests are excluded on purpose: a cross-unit
 * contract test's job is to reach into a unit and pin its behavior, so
 * counting those edges would punish exactly the evidence this repo wants
 * written. Stories and declarations are excluded for the same reason
 * `surface-presentation-boundary` excludes them — they are authored evidence,
 * not shipped composition.
 */
async function productiveUiSources(root) {
  const files = new Map();
  async function visit(directory) {
    const entries = await readdir(directory, { withFileTypes: true });
    entries.sort((left, right) => left.name.localeCompare(right.name));
    for (const entry of entries) {
      const absolute = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        if (entry.name === 'tests' || entry.name === '__tests__') continue;
        if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue;
        await visit(absolute);
        continue;
      }
      if (!/\.(?:ts|tsx)$/.test(entry.name)) continue;
      if (/\.d\.ts$/.test(entry.name)) continue;
      if (/\.(?:test|spec|stories)\.(?:ts|tsx)$/.test(entry.name)) continue;
      const relative = `ui/${toPosix(path.relative(root, absolute))}`;
      files.set(relative, await readFile(absolute, 'utf8'));
    }
  }
  await visit(root);
  return files;
}

test('the drill fails on a planted cross-family reach into a private runtime', () => {
  // The exact shape this lane retired: a surface importing another family's
  // internal solver. If this fixture ever passes, the drill has stopped being
  // evidence and is only decoration.
  const planted = new Map([
    [
      'ui/surfaces/presentation/pages/data/dashboard/index.tsx',
      `import { resolveAdaptiveLayout } from "../../../../../patterns/data/widget-board/runtime/solver";\n`,
    ],
    [
      'ui/patterns/data/widget-board/runtime/solver/index.ts',
      'export function resolveAdaptiveLayout() {}\n',
    ],
  ]);
  assert.deepEqual(auditPrivateRuntimeBoundary(planted), [
    'ui/surfaces/presentation/pages/data/dashboard/index.tsx -> ui/patterns/data/widget-board/runtime/solver/index.ts',
  ]);

  // Aliased and deep variants of the same reach, so the drill cannot be
  // sidestepped by writing the import differently.
  const aliased = new Map([
    [
      'ui/structures/workspace/table-toolbar/index.tsx',
      [
        `import { useBoardState } from "@/ui/patterns/data/widget-board/runtime/state";`,
        `export type { BoardPolicy } from "../../../patterns/data/widget-board/policy/rules";`,
      ].join('\n'),
    ],
    ['ui/patterns/data/widget-board/runtime/state/index.ts', 'export const useBoardState = 1;\n'],
    ['ui/patterns/data/widget-board/policy/rules/index.ts', 'export type BoardPolicy = 1;\n'],
  ]);
  assert.deepEqual(auditPrivateRuntimeBoundary(aliased), [
    'ui/structures/workspace/table-toolbar/index.tsx -> ui/patterns/data/widget-board/policy/rules/index.ts',
    'ui/structures/workspace/table-toolbar/index.tsx -> ui/patterns/data/widget-board/runtime/state/index.ts',
  ]);
});

test('the drill stays silent on the sanctioned composition surface', () => {
  // Everything here is a real shape from this tree. A rule that also flagged
  // these would be unusable, so they are asserted as green rather than left to
  // chance: a shared support owner, a sibling engine implementation, a
  // presentation branch, and an owner's own internals.
  const sanctioned = new Map([
    [
      'ui/surfaces/presentation/pages/data/dashboard/index.tsx',
      [
        `import { resolveAdaptiveLayout } from "../../../../../patterns/runtime/adaptive-layout/runtime";`,
        `import { useAdaptiveEnvironment } from "../../../../../patterns/runtime/adaptive-layout/presentation/react";`,
      ].join('\n'),
    ],
    ['ui/patterns/runtime/adaptive-layout/runtime/index.ts', 'export const resolveAdaptiveLayout = 1;\n'],
    [
      'ui/patterns/runtime/adaptive-layout/presentation/react/index.ts',
      'export const useAdaptiveEnvironment = 1;\n',
    ],
    [
      'ui/patterns/commerce/pricing-table/engines/modern/index.tsx',
      `import { Tag } from "../../../../primitives/display/Tag/engines/modern";\n`,
    ],
    ['ui/primitives/display/Tag/engines/modern/index.tsx', 'export const Tag = 1;\n'],
    [
      'ui/patterns/data/widget-board/engines/foundation/index.tsx',
      `import { useAdaptiveBoardLayout } from "../../runtime/adaptive/react";\n`,
    ],
    ['ui/patterns/data/widget-board/runtime/adaptive/react/index.ts', 'export const useAdaptiveBoardLayout = 1;\n'],
  ]);
  assert.deepEqual(auditPrivateRuntimeBoundary(sanctioned), []);
});

test('no UI family reaches into another family private runtime branch', async () => {
  const files = await productiveUiSources(uiRoot);
  assert.ok(files.size > 1000, `expected a full UI scan, got ${files.size} files`);
  const crossings = auditPrivateRuntimeBoundary(files);

  const unregistered = crossings.filter((edge) => !REGISTERED_DEBT.has(edge));
  assert.deepEqual(
    unregistered,
    [],
    'a UI family imported another family private implementation branch; declare the capability as shared support instead',
  );

  // Decrease-only: a registered edge that no longer exists must leave the list
  // in the same change that retires it, so the ledger can never drift into a
  // blanket exemption.
  const stale = [...REGISTERED_DEBT].filter((edge) => !crossings.includes(edge));
  assert.deepEqual(stale, [], 'registered debt was fixed; delete these entries from REGISTERED_DEBT');
});
