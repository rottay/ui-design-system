import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { packageRoot as findPackageRoot } from './lib/repo-root/index.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const CORE_ROOT = findPackageRoot(HERE);
const REPO_ROOT = path.resolve(CORE_ROOT, '../..');

const CSS_ROOT = path.join(CORE_ROOT, 'src/foundation/tokens/css');
const ENTRYPOINTS = [
  path.join(CSS_ROOT, 'facade/entrypoints/base.css'),
  path.join(CSS_ROOT, 'facade/entrypoints/styles.css'),
];
const FAMILIES = path.join(
  CORE_ROOT,
  'scripts/quality-evidence/programs/modern-rescue/manifest/families',
);

/** A family's skin is evidence. If the file it lives in stops shipping, the
 *  family's appearance changes and nothing in the program notices, because the
 *  manifest binds source modules and the skin is a separate artifact.
 *
 *  The concrete loss this pins: `pattern/visualization/pattern-tree-view` owns
 *  two components, and their skins do not share a naming stem. Three files are
 *  named for `pattern-tree-view` and carry `.ds-pattern-tree-view`; the fourth
 *  is `tree-view-connector.css` carrying `.rt-tree-view`, which is what
 *  `TreeViewConnector` actually renders. A sweep keyed on the family slug finds
 *  the first three and silently drops the fourth -- so the connector's skin fell
 *  out of the family's evidence while remaining live in the shipped CSS.
 *
 *  Attribution below is by selector, taken from the files and the components
 *  that render them, not by filename stem. That is the whole point: the stem is
 *  what lost the file.
 *
 *  This gate deliberately does NOT require every live skin to be family-bound.
 *  391 skins ship and 5 are bound, so that assertion would be a 386-row
 *  baseline, not a drill. It asserts the narrower thing that is true today and
 *  must stay true: a skin claimed as evidence must exist and must still ship. */

/** Canonical skin evidence, keyed by family id. Paths are repo-relative. */
const FAMILY_SKINS = {
  'pattern/visualization/pattern-tree-view': {
    components: ['PatternTreeView', 'TreeViewConnector'],
    skins: [
      // TreeViewConnector -- `.rt-tree-view`, the file that went missing.
      'packages/core/src/foundation/tokens/css/presentation/components/skin/tree-view-connector.css',
      // PatternTreeView -- `.ds-pattern-tree-view` / `.ds-tree-view-*`.
      'packages/core/src/foundation/tokens/css/runtime/engines/modern/skin/tree-view.css',
      'packages/core/src/foundation/tokens/css/runtime/engines/modern/skin/pattern-tree-view.css',
      'packages/core/src/foundation/tokens/css/runtime/engines/rustic/skin/pattern-tree-view.css',
    ],
  },
};

/** The selector each skin file must actually define, so the attribution above
 *  is checked against the file rather than asserted about it. */
const SKIN_SELECTORS = {
  'presentation/components/skin/tree-view-connector.css': '.rt-tree-view',
  'runtime/engines/modern/skin/tree-view.css': '.ds-tree-view-modern',
  'runtime/engines/modern/skin/pattern-tree-view.css': '.ds-pattern-tree-view',
  'runtime/engines/rustic/skin/pattern-tree-view.css': '.ds-tree-view-rustic',
};

/** Resolves the whole import graph, not just the entrypoint's direct imports.
 *  Both quote styles are accepted: the aggregators under `foundation/` are
 *  written with single quotes, and a double-quote-only regex reports files
 *  reached through them as dead. That is how this check first read the live
 *  `transitions.css` as missing. */
function liveImports(entrypoint) {
  const imported = new Set();
  const queue = [entrypoint];
  const seen = new Set(queue);
  while (queue.length > 0) {
    const file = queue.pop();
    if (!existsSync(file)) continue;
    const source = readFileSync(file, 'utf8');
    for (const match of source.matchAll(/@import\s+(?:url\()?['"]([^'"]+\.css)['"]/g)) {
      const resolved = path.resolve(path.dirname(file), match[1]);
      imported.add(resolved);
      if (!seen.has(resolved)) {
        seen.add(resolved);
        queue.push(resolved);
      }
    }
  }
  return imported;
}

/** Walks a parsed family row and collects every `sourceBindings` entry, which
 *  the schema allows to be an array or a role -> binding object map. The
 *  optional `#Symbol` suffix is stripped so the path can be resolved. */
function collectSourceBindings(node, into) {
  if (Array.isArray(node)) {
    for (const item of node) collectSourceBindings(item, into);
    return;
  }
  if (!node || typeof node !== 'object') return;
  for (const [key, value] of Object.entries(node)) {
    if (key === 'sourceBindings') {
      const list = Array.isArray(value)
        ? value
        : value && typeof value === 'object'
          ? Object.values(value)
          : [];
      for (const binding of list) {
        if (typeof binding === 'string') into.add(binding.split('#')[0]);
      }
      continue;
    }
    collectSourceBindings(value, into);
  }
}

function familyFiles(dir, files = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) familyFiles(full, files);
    else if (entry.name.endsWith('.json')) files.push(full);
  }
  return files;
}

const LIVE = ENTRYPOINTS.map((entrypoint) => ({
  entrypoint,
  imported: liveImports(entrypoint),
}));

test('the facade entrypoints parse into a non-empty import set', () => {
  // Parse guard. A regex that matched nothing would make every liveness check
  // below vacuous in the direction that passes.
  for (const { entrypoint, imported } of LIVE) {
    assert.ok(
      imported.size > 100,
      `${path.basename(entrypoint)} parsed only ${imported.size} imports`,
    );
  }
});

test('every claimed skin exists on disk', () => {
  for (const [familyId, record] of Object.entries(FAMILY_SKINS)) {
    for (const skin of record.skins) {
      assert.ok(existsSync(path.join(REPO_ROOT, skin)), `${familyId} claims a missing skin: ${skin}`);
    }
  }
});

test('every claimed skin still ships in both facade entrypoints', () => {
  // This is the loss itself: a skin can be deleted from an entrypoint without
  // touching the component, and the family looks unchanged until it is seen.
  for (const [familyId, record] of Object.entries(FAMILY_SKINS)) {
    for (const skin of record.skins) {
      const absolute = path.join(REPO_ROOT, skin);
      for (const { entrypoint, imported } of LIVE) {
        assert.ok(
          imported.has(absolute),
          `${familyId}: ${path.basename(skin)} is not imported by ${path.basename(entrypoint)}`,
        );
      }
    }
  }
});

test('each claimed skin defines the selector it is attributed by', () => {
  // Attribution by filename stem is what dropped tree-view-connector.css, so
  // the mapping is verified against the selector the file actually defines.
  for (const record of Object.values(FAMILY_SKINS)) {
    for (const skin of record.skins) {
      const relative = skin.replace('packages/core/src/foundation/tokens/css/', '');
      const selector = SKIN_SELECTORS[relative];
      assert.ok(selector, `no selector attribution recorded for ${relative}`);
      const css = readFileSync(path.join(REPO_ROOT, skin), 'utf8');
      assert.ok(
        css.includes(selector),
        `${relative} is attributed by ${selector} but does not define it`,
      );
    }
  }
});

test('the claimed family owns the components its skins render', () => {
  const rows = familyFiles(FAMILIES).map((file) => JSON.parse(readFileSync(file, 'utf8')));
  assert.ok(rows.length > 200, `parsed only ${rows.length} family rows`);

  for (const [familyId, record] of Object.entries(FAMILY_SKINS)) {
    const row = rows.find((candidate) => candidate.familyId === familyId);
    assert.ok(row, `${familyId} has no family row`);
    for (const component of record.components) {
      assert.ok(
        row.identity.components.includes(component),
        `${familyId} does not own ${component}, so it cannot own that component's skin`,
      );
    }
  }
});

test('a CSS path bound by any family row resolves and still ships', () => {
  // The general form of the same decay: a sourceBinding that points at a file
  // which was deleted or dropped from the facade is dead evidence that still
  // reads as evidence.
  // Collected from parsed `sourceBindings` only. A regex over the raw JSON also
  // picks up `knownDefects[].sourcePattern`, which is a glob by design and
  // never resolves as a literal path -- a false failure against a correct file.
  const bound = new Set();
  for (const file of familyFiles(FAMILIES)) {
    collectSourceBindings(JSON.parse(readFileSync(file, 'utf8')), bound);
  }
  const cssBound = [...bound].filter((binding) => binding.endsWith('.css'));
  assert.ok(cssBound.length > 0, 'no CSS sourceBindings found at all; the scan is wrong');

  for (const skin of cssBound) {
    const absolute = path.join(REPO_ROOT, skin);
    assert.ok(existsSync(absolute), `bound CSS does not exist: ${skin}`);
    for (const { entrypoint, imported } of LIVE) {
      assert.ok(
        imported.has(absolute),
        `bound CSS ${path.basename(skin)} is not imported by ${path.basename(entrypoint)}`,
      );
    }
  }
});
