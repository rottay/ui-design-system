#!/usr/bin/env node
/**
 * Canonical taxonomy parity gate (WO-CRA-23, source-plumbing item 10).
 *
 * WHY THIS FILE EXISTS. `CLAUDE.md` fixes exactly five family layers --
 * `primitive | pattern | structure | surface | chart` -- and states that
 * `commercial` is a marketing adjective and `composition` a dependency role,
 * so neither may ever be a layer. Until this gate existed nothing enforced
 * that. Worse, the live blocking gate enforced the opposite: `EXPECTED_COUNTS`
 * in `scripts/quality-evidence/programs/modern-rescue/program-check.mjs`
 * REQUIRED `surface-composition: 4` and `commercial: 11`, so the 252-row
 * denominator was held in place by a rule that mandated the two forbidden
 * layers. This gate was the opposing authority and landed RED at 72
 * violations; that red was the finding, not a bug in the gate. Those rows have
 * since been adjudicated and `EXPECTED_COUNTS` names only the five legal
 * layers. The denominator is derived, not restated here: read it from
 * `program.json` -> `denominators.visibleFamilies`.
 *
 * WHAT IT REFUSES. Four independent bindings must agree, and a disagreement
 * is a failure rather than a warning:
 *
 *   source   the folder named by each row's `sourceOwner` exists, sits under
 *            the UI tree, and no unclaimed sibling component folder hides
 *            beside a claimed one.
 *   public   every component a row declares is actually reachable from the
 *            package root AS A VALUE, and the declaration it reaches lives
 *            inside that row's own `sourceOwner`. Computed from source by
 *            `lib/root-public-resolver.mjs`, which knows nothing about the
 *            inventory's opinion -- the row's own `sourceResolution` and
 *            `declaredComponentsPublic` fields are deliberately NOT read,
 *            because they descend from the same generator run as the claim
 *            they would be confirming.
 *
 *            Wiring it found two rows that every other binding agreed on and
 *            source did not. `primitive/navigation/link` declared `Link`; the
 *            root's `Link` is Typography's compound, and the navigation
 *            primitive is published as `NavLink` (see the alias comment in
 *            `primitives/navigation/index.ts`). `pattern/data/cell-renderers`
 *            declared `CellRenderers`, which is `export type CellRenderers =
 *            typeof cellRenderers` -- a type alias, so nothing can render it.
 *            Both rows self-certified `RESOLVED_SOURCE_AND_PUBLIC_EXPORT`.
 *
 *            The reverse half of this binding is fail-closed: a public name the
 *            resolver cannot follow to a declaration -- `MISSING`, `UNRESOLVED`,
 *            `AMBIGUOUS`, `CYCLE_ONLY` -- is a violation in its own right, one
 *            message per name. See `UNRESOLVABLE_EXPORT_KINDS` for why skipping
 *            them was the worst available default.
 *   manifest `family-inventory.json`, `manifest/index.json` and the per-family
 *            `manifest/families/{layer}/{category}/{slug}.json` files describe
 *            the same set of ids -- no ghost row, no orphan cell.
 *   showroom every registry entry resolves to a family and publishes that
 *            family's own name and category, and every family is reachable in
 *            the Showroom, modulo the declared slug conventions. Slug alone is
 *            too weak: `normalizeFamilySlug` strips the `pattern` prefix, so a
 *            registry could publish `page-shell` as the wrong component under
 *            the wrong group and still match on slug.
 *
 * WHY NO BASELINE. A decrease-only baseline is the right shape for counted
 * debt that shrinks (see `daisy.classConsumers`). It is the wrong shape here:
 * a forbidden layer is not a quantity to reduce, and baselining today's rows
 * would relabel a law as a budget. `CLAUDE.md` says never baseline a new
 * finding. So this gate carries no baseline and reports everything. The drill
 * in `taxonomy-parity-gate.test.mjs` is blocking from day one, because a gate
 * nobody has proven can fail is not evidence of anything.
 *
 * WHY IT IS BLOCKING. It is registered `blocking: true` in
 * `ci-gates.manifest.mjs`, carrying no exclusion record -- the manifest
 * rejects that half-state. Each condition the exclusion was owed to is closed:
 * the relabel landed, the `public` binding is wired, and the reverse
 * projection is fail-closed, so its green means "everything resolved" rather
 * than "nothing disagreed". The 21 root exports that the old non-VALUE skip
 * hid -- behind the `widget-board/runtime/solver -> runtime/adaptive` rename
 * -- were repointed in `src/index.ts` by the lane that owned them. All 255
 * rows pass.
 *
 * FRESHNESS IS A PREREQUISITE, NOT AN ASSUMPTION. This gate reads
 * `manifest/index.json` and the per-family cells as evidence and does not
 * regenerate them, so against a stale manifest it would certify rows nobody
 * rebuilt. `ci-gates.manifest.mjs` therefore runs
 * `manifest/generator.mjs --check` as its own blocking entry, positioned ahead
 * of this chain. That ordering is the contract; the
 * `validateCustomizationManifest()` side effect inside program-check is not a
 * substitute for it.
 *
 * WHAT IT DOES NOT DO. It moves no file and rewrites no manifest.
 *
 * Usage: node scripts/taxonomy/taxonomy-parity-gate/index.mjs [--json]
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { createRootPublicResolver } from '../../lib/root-public-resolver.mjs';
import { packageRoot as findPackageRoot, repoRoot as findRepoRoot } from '../../lib/repo-root/index.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const CORE_ROOT = findPackageRoot(HERE);
const REPOSITORY_ROOT = findRepoRoot(HERE);

const PROGRAM_ROOT = path.join(
  CORE_ROOT,
  'scripts/quality-evidence/programs/modern-rescue',
);
const UI_ROOT_RELATIVE = 'packages/core/src/ui';
const SHOWROOM_REGISTRY_ROOT = path.join(
  REPOSITORY_ROOT,
  'packages/showroom/src/data/registry',
);

/** The package root barrel -- the only thing a consumer can actually import. */
const ROOT_ENTRY_FILE = path.join(CORE_ROOT, 'src/index.ts');

/**
 * Public component-shaped values that deliberately have no family row.
 *
 * The reverse projection asks a blunt question -- "what can a consumer render
 * that the catalog never mentions?" -- and the honest answers are not all the
 * same. A shared chart-engine part is genuinely support: it has one owner, it
 * is not sold as a product, and giving it a row would inflate the denominator
 * with something no one adopts. A public overlay primitive is a different
 * animal, and calling it support to make a gate green would be exactly the
 * false green this binding exists to catch.
 *
 * So `support` settles the question and `pending-adjudication` refuses to.
 * Pending entries are reported as findings and keep the gate red on purpose:
 * they are visible, counted, and owner-assigned, which is what an undecided
 * classification should look like. Adding a name here is a decision, not a
 * silencer -- a value that is missing from this map entirely fails as
 * `public-unowned`, so nothing escapes by being forgotten.
 */
const GOVERNED_PUBLIC_SUPPORT = {
  // Chart-engine internals, shared by all 18 chart families rather than owned by
  // any one of them. The `chart` cohort is their owner; they are parts of the
  // rendering engine, not chart products a consumer picks from a catalog.
  ChartFamilyFrame: { owner: 'chart/*', disposition: 'support', reason: 'shared chart frame' },
  ChartScaffold: { owner: 'chart/*', disposition: 'support', reason: 'shared chart scaffold' },
  ChartTooltip: { owner: 'chart/*', disposition: 'support', reason: 'shared chart tooltip' },
  TooltipValue: { owner: 'chart/*', disposition: 'support', reason: 'chart tooltip part' },
  TooltipSeries: { owner: 'chart/*', disposition: 'support', reason: 'chart tooltip part' },
  ChartFrame: { owner: 'chart/*', disposition: 'support', reason: 'chart engine projection frame' },
  ChartMetricTrendView: { owner: 'chart/*', disposition: 'support', reason: 'chart engine projection' },
  ChartRankedRowsView: { owner: 'chart/*', disposition: 'support', reason: 'chart engine projection' },
  ChartImperativePlot: { owner: 'chart/*', disposition: 'support', reason: 'chart engine renderer' },
  // Pulse runtime part, owned by the pattern that animates through it.
  PulseValue: { owner: 'pattern/runtime/pulse', disposition: 'support', reason: 'pulse runtime part' },

  // --- adjudicated 2026-08-12, no longer declared here ----------------------
  // Eight names sat in this block as `pending-adjudication`. All eight were
  // decided by the owner, and a decided name does not belong in a map whose
  // whole purpose is to hold the undecided ones:
  //
  //   - `Overlay`, `FocusTrap`, `Portal`, `PortalScope` are runtime
  //     implementation support, not products. They stopped being public rather
  //     than becoming four `primitive/overlay/*` rows, so nothing here can
  //     claim them: if any is still reachable from the package root, this gate
  //     must say `public-unowned` and mean it.
  //   - `SurfaceActionBar`, `SurfaceTabbedLabel`, `SurfaceSectionCard` are one
  //     composite family, `structure/shell/surface-chrome`, over one owner.
  //   - `SurfaceErrorBoundary` joined `structure/feedback/surface-lifecycle`.
  //
  // Their rows in `family-inventory.json` own them now. Re-adding any of them
  // here would be the gate grading its own homework.
};

/**
 * Every way a public name can fail to reach a declaration, and what each one
 * costs a consumer. `TYPE_ONLY` is absent on purpose -- a published type is
 * legal public API -- the clear majority of the root's names are types -- and
 * owes no family row.
 *
 * WHY THESE ARE VIOLATIONS AND NOT SKIPS. The reverse projection used to open
 * with `if (resolution.state !== 'VALUE') continue`, which reads as "only real
 * values can be unowned components" and is exactly backwards. A name with no
 * terminal file is not a name with nothing behind it -- it is a name whose
 * terminal file NOBODY CAN SEE, so it is invisible to the ownership question,
 * to the `sourceOwner` containment test, and to `isComponentShaped`. The
 * package root advertised it either way. That skip hid 21 real exports: the
 * `widget-board/runtime/solver -> runtime/adaptive` rename landed in source
 * while `src/index.ts` still named the old specifier, so every one of those 21
 * imports throws for a consumer, and this gate printed `OK`.
 *
 * A state that is not listed here is not a pass either -- see the fallback at
 * the call site. A resolver that grows a sixth state must not silently widen
 * the hole this closes.
 */
const UNRESOLVABLE_EXPORT_KINDS = Object.freeze({
  MISSING: {
    kind: 'public-missing',
    consequence:
      'the root barrel advertises a name that nothing declares, so the import throws at runtime',
  },
  UNRESOLVED: {
    kind: 'public-unresolved',
    consequence:
      'the root barrel names a module specifier that reaches no file, so nothing behind it is importable',
  },
  AMBIGUOUS: {
    kind: 'public-ambiguous',
    consequence:
      'two `export *` paths publish different declarations under one name, so what a consumer gets depends on resolution order',
  },
  CYCLE_ONLY: {
    kind: 'public-cycle-only',
    consequence:
      'the name exists only inside a re-export cycle -- no module in the ring actually declares it',
  },
});

/**
 * The five canonical layers, verbatim from `CLAUDE.md`. `chart` is a dedicated
 * inventory cohort whose production owner still lives below
 * `ui/patterns/visualization/charts/`; that physical nesting is intended and is
 * not what the duplicated-segment check below is looking for.
 */
export const CANONICAL_LAYERS = Object.freeze([
  'primitive',
  'pattern',
  'structure',
  'surface',
  'chart',
]);

/**
 * Layer values that are known-wrong rather than merely unknown. Naming them
 * lets the report say WHY a value is refused instead of only that it is not on
 * the allowlist -- the difference between "unrecognised" and "this is the
 * documented defect". Any other unknown value still fails, via the allowlist.
 */
const REFUSED_LAYER_REASONS = Object.freeze({
  commercial:
    'a marketing adjective, not an architectural role; classify by what the component does',
  'surface-composition':
    '`composition` is a dependency role inside an owner, never a family layer',
  composition:
    '`composition` is a dependency role inside an owner, never a family layer',
  misc: 'a catch-all is not a taxonomy',
  shared: 'a catch-all is not a taxonomy',
  _internal: 'implementation-only support owners have no family row',
});

/**
 * Folder names that are support owners rather than component families. Derived
 * from the source tree's own vocabulary (`CLAUDE.md`, "Core source-tree
 * hierarchy") plus the engine names, so a family folder is never mistaken for
 * one of these and vice versa.
 */
const SUPPORT_FOLDER_NAMES = new Set([
  'foundation',
  'infrastructure',
  'runtime',
  'composition',
  'presentation',
  'facade',
  'public',
  'kernel',
  'contracts',
  'policy',
  'quality',
  'spec',
  'validation',
  'react',
  'engines',
  'classic',
  'modern',
  'rustic',
  'custom',
  'tests',
  '__tests__',
  'fixtures',
  'examples',
  'stories',
  'generated',
  'tokens',
  'types',
  'hooks',
  'utils',
  'internal',
  'shared',
  'lib',
  'families',
]);

const SHOWROOM_REGISTRIES = Object.freeze([
  { file: 'primitives.ts', layers: ['primitive'] },
  { file: 'patterns.ts', layers: ['pattern'] },
  { file: 'structures.ts', layers: ['structure'] },
  { file: 'surfaces.ts', layers: ['surface'] },
  { file: 'charts.ts', layers: ['chart'] },
]);

function readJson(pathname) {
  return JSON.parse(fs.readFileSync(pathname, 'utf8'));
}

/**
 * Slug comparison across the inventory/Showroom boundary. The two sides use
 * different conventions and the Showroom is not even self-consistent -- it
 * ships `bar-chart` next to `scatter` -- so a raw string compare would report
 * drift that is only spelling. Separators are dropped, then the `pattern`
 * prefix and the `chart` suffix, which are the two conventions actually
 * observed. Nothing else is stripped: removing `map` too would collide
 * `heat-map` with `map-view`.
 */
export function normalizeFamilySlug(slug) {
  const flat = String(slug)
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
  const withoutPrefix = flat.startsWith('pattern') ? flat.slice('pattern'.length) : flat;
  const withoutSuffix = withoutPrefix.endsWith('chart')
    ? withoutPrefix.slice(0, -'chart'.length)
    : withoutPrefix;
  return withoutSuffix || withoutPrefix || flat;
}

/**
 * Removes comments so a commented-out registry entry cannot be counted as a
 * live one. This is a string-aware scan rather than a regex: descriptions
 * legitimately contain `//` (URLs), and a naive strip would truncate an entry
 * mid-literal and silently drop the families after it.
 */
function stripComments(source) {
  let out = '';
  let quote = null;
  for (let index = 0; index < source.length; index += 1) {
    const character = source[index];
    const next = source[index + 1];
    if (quote) {
      out += character;
      if (character === '\\') {
        out += next ?? '';
        index += 1;
      } else if (character === quote) quote = null;
      continue;
    }
    if (character === "'" || character === '"' || character === '`') {
      quote = character;
      out += character;
      continue;
    }
    if (character === '/' && next === '/') {
      while (index < source.length && source[index] !== '\n') index += 1;
      out += '\n';
      continue;
    }
    if (character === '/' && next === '*') {
      index += 2;
      while (index < source.length && !(source[index] === '*' && source[index + 1] === '/')) index += 1;
      index += 1;
      out += ' ';
      continue;
    }
    out += character;
  }
  return out;
}

/**
 * Parses component entries out of a Showroom registry. The registries are
 * TypeScript literals, so a regex reads them without pulling a TS toolchain
 * into a gate; if a registry ever stops being a flat literal this returns
 * nothing and the parity check fails loudly rather than silently passing.
 *
 * The `name:` follower is load-bearing. Each registry also exports a group
 * table -- `{ slug: 'data', label: 'Data', count }` -- whose entries are
 * navigation categories, not components. Matching bare `slug:` swept those in
 * and reported every group as a family with no row.
 *
 * Returns records, not bare slugs. A slug-only reading let a registry name a
 * component something the design system does not export -- `page-shell` was
 * published as `PageShell` while the family, the source and the package root
 * all say `PatternPageShell` -- and file it under a group that contradicted the
 * row. Both fields are now carried so the caller can hold them to the row.
 *
 * The grouping key differs per registry by design: primitives use `category`,
 * patterns/structures/surfaces use `group`, charts use `family`. A missing key
 * yields `group: null`, which the caller reports rather than skips.
 */
export function parseShowroomRegistry(source) {
  // The grouping key must not require a trailing comma: it is legitimately the
  // last field of an entry, and demanding one made those entries read as having
  // no group at all.
  const pattern =
    /\{\s*slug:\s*'([a-z0-9-]+)',\s*name:\s*'([^']*)',\s*(?:(?:category|group|family):\s*'([a-z0-9-]+)')?/g;
  return [...stripComments(source).matchAll(pattern)].map((match) => ({
    slug: match[1],
    name: match[2],
    group: match[3] ?? null,
  }));
}

/**
 * Resolves the folder a `component-symbol` row actually lives in. Those rows
 * name a container as `sourceOwner` -- `pattern/data/pattern-data-table` owns
 * `ui/patterns/data` -- while the code sits in a child such as
 * `ui/patterns/data/data-table`. Without this the unowned-folder check reports
 * every one of those children as unclaimed, which is a defect in the check and
 * not a finding about the tree.
 */
function claimComponentSymbolFolders(repositoryRoot, owner, slug, category, claimed) {
  // A folder may spell the family more tersely than the row id does. Charts
  // live in `charts/families/bullet` for `bullet-chart`, and header structures
  // in `headers/detail` for `detail-header`: the folder omits the suffix its
  // category already implies. Both spellings are accepted, and grouping
  // segments such as `families/` are dropped before comparing, so the check
  // does not manufacture findings out of the tree's own shorthand.
  const singular = String(category ?? '').replace(/s$/, '');
  const targets = new Set([normalizeFamilySlug(slug)]);
  if (singular) {
    const flat = normalizeFamilySlug(slug);
    const tail = normalizeFamilySlug(singular);
    if (tail && flat.endsWith(tail)) targets.add(flat.slice(0, -tail.length));
  }
  targets.delete('');

  const walk = (relative, depth) => {
    if (depth > 3) return;
    const absolute = path.join(repositoryRoot, relative);
    if (!fs.existsSync(absolute)) return;
    for (const entry of fs.readdirSync(absolute, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      const childRelative = `${relative}/${entry.name}`;
      const suffix = childRelative
        .slice(owner.length + 1)
        .split('/')
        .filter((segment) => !SUPPORT_FOLDER_NAMES.has(segment))
        .join('/');
      if (targets.has(normalizeFamilySlug(suffix))) {
        // Claim the match and every folder between it and the container, so a
        // grouping level such as `layout/responsive` is not itself reported.
        let cursor = childRelative;
        while (cursor.length > owner.length) {
          claimed.add(cursor);
          cursor = path.posix.dirname(cursor);
        }
        continue;
      }
      walk(childRelative, depth + 1);
    }
  };
  walk(owner, 1);
}

function collectFamilyManifestFiles(root) {
  const found = [];
  if (!fs.existsSync(root)) return found;
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.isFile() && entry.name.endsWith('.json')) found.push(full);
    }
  };
  walk(root);
  return found;
}

function hasIndexModule(dir) {
  return (
    fs.existsSync(path.join(dir, 'index.ts')) || fs.existsSync(path.join(dir, 'index.tsx'))
  );
}

/**
 * Whether a folder can render anything at all, i.e. whether its subtree holds a
 * single `.tsx` file.
 *
 * An index module alone does not make a component folder. A UI tier root has a
 * `foundation` support branch (`CLAUDE.md`, "Core source-tree hierarchy"), and
 * that branch hosts BOTH real leaf families and the shared utilities those
 * families import -- `primitives/foundation` currently holds five families next
 * to `calendar` (date arithmetic and month/day tables), `compose-refs` (a
 * cross-React-major callback-ref composer) and `scroll-reveal` (scrollport
 * geometry). Those three export functions and constants; none of them exports a
 * component, and reporting them as families with a missing inventory row states
 * something untrue about the tree.
 *
 * The discriminator is JSX, because a family has to paint. It is checked over
 * the whole subtree, not just the index: an engine-switched primitive's index is
 * a `.ts` that forwards to `engines/{classic,modern,rustic}/index.tsx`, so a
 * top-level-only test would excuse every engine-backed family. Tests and
 * stories count too -- a folder with a `.tsx` story is rendering a component,
 * whatever the production extension says -- so the escape cannot be widened by
 * moving the JSX one level down or into a fixture.
 */
function hasRenderableComponent(dir) {
  const stack = [dir];
  while (stack.length > 0) {
    const current = stack.pop();
    let entries;
    try {
      entries = fs.readdirSync(current, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const entry of entries) {
      if (entry.isDirectory()) stack.push(path.join(current, entry.name));
      else if (entry.isFile() && entry.name.endsWith('.tsx')) return true;
    }
  }
  return false;
}

/**
 * The whole audit, as a pure function of the four bindings, so the drill can
 * run it against a planted fixture tree without touching the real repository.
 */
export function auditTaxonomyParity({
  repositoryRoot = REPOSITORY_ROOT,
  programRoot = PROGRAM_ROOT,
  showroomRegistryRoot = SHOWROOM_REGISTRY_ROOT,
  // Narrowed only by the drills, so a fixture can model one tier without its
  // four stub registries reading as four empty-registry findings. The real run
  // always takes the default and checks all five.
  registries = SHOWROOM_REGISTRIES,
  // Injected by the drills so a planted negative can be modelled against a
  // fixture barrel instead of the real one.
  rootEntryFile = ROOT_ENTRY_FILE,
  resolverFactory = createRootPublicResolver,
} = {}) {
  const violations = [];
  const add = (kind, detail) => violations.push({ kind, detail });

  const inventory = readJson(path.join(programRoot, 'family-inventory.json'));
  const rows = inventory?.rows ?? [];

  // --- layer legality -----------------------------------------------------
  for (const row of rows) {
    if (CANONICAL_LAYERS.includes(row.layer)) continue;
    const reason = REFUSED_LAYER_REASONS[row.layer] ?? 'not one of the five canonical layers';
    add('forbidden-layer', `${row.id}: layer "${row.layer}" is refused -- ${reason}`);
  }

  // --- category that only restates its layer ------------------------------
  // `commercial/commercial/*` is the form `CLAUDE.md` names as a forbidden
  // duplicated path, and `chart/chart/*` has the same shape: a category that
  // only restates the layer carries no information, and it is how a bogus tier
  // gets smuggled in as a folder name.
  //
  // ONLY the layer/category pair is checked. An earlier revision compared every
  // adjacent pair, which flagged `primitive/layout/layout` -- a component
  // genuinely named `Layout` sitting in the `layout` category. A slug that
  // happens to match its category is a naming coincidence, not a smuggled tier,
  // and a gate that reports it teaches readers to skim past this whole kind.
  for (const row of rows) {
    const [layer, category] = String(row.id).split('/');
    if (category && category === layer) {
      add('duplicated-segment', `${row.id}: category "${category}" only restates its layer`);
    }
  }

  // --- identity uniqueness ------------------------------------------------
  const idCounts = new Map();
  const familyCounts = new Map();
  for (const row of rows) {
    idCounts.set(row.id, (idCounts.get(row.id) ?? 0) + 1);
    familyCounts.set(row.family, (familyCounts.get(row.family) ?? 0) + 1);
  }
  for (const [id, count] of idCounts) {
    if (count > 1) add('duplicate-identity', `id ${id} appears ${count} times`);
  }
  for (const [family, count] of familyCounts) {
    if (count > 1) {
      add(
        'duplicate-identity',
        `family ${family} claims ${count} rows; a public component has exactly one canonical family id`,
      );
    }
  }

  // --- source binding -----------------------------------------------------
  const claimedOwners = new Set();
  for (const row of rows) {
    const owner = row.sourceOwner ?? '';
    if (!owner.startsWith(`${UI_ROOT_RELATIVE}/`)) {
      add('source-binding', `${row.id}: sourceOwner "${owner}" is outside ${UI_ROOT_RELATIVE}`);
      continue;
    }
    if (!fs.existsSync(path.join(repositoryRoot, owner))) {
      add('source-binding', `${row.id}: sourceOwner "${owner}" does not exist`);
      continue;
    }
    claimedOwners.add(owner);
  }
  for (const row of rows) {
    if (row.resolvedBy !== 'component-symbol') continue;
    const owner = row.sourceOwner ?? '';
    if (!claimedOwners.has(owner)) continue;
    claimComponentSymbolFolders(
      repositoryRoot,
      owner,
      String(row.id).split('/').pop(),
      row.category,
      claimedOwners,
    );
  }
  // A row may name a folder nested below the family folder -- the gallery view
  // owns `data/gallery-view/presentation/gallery`. The intermediate folders are
  // owned by that claim, not unowned, so claim the chain back to the container.
  for (const owner of [...claimedOwners]) {
    let cursor = path.posix.dirname(owner);
    while (cursor.startsWith(`${UI_ROOT_RELATIVE}/`)) {
      claimedOwners.add(cursor);
      cursor = path.posix.dirname(cursor);
    }
  }

  // --- unowned sibling folders -------------------------------------------
  // A folder-slug family proves its parent directory is a family container.
  // Every other indexed, non-support child of that container must therefore be
  // claimed too. This is deliberately narrower than "every indexed folder must
  // be a row": 29 rows resolve by `component-symbol` and legitimately share a
  // host folder, so a blanket rule would report them as unowned.
  const containers = new Set();
  for (const row of rows) {
    if (row.resolvedBy !== 'folder-slug') continue;
    const owner = row.sourceOwner ?? '';
    if (claimedOwners.has(owner)) containers.add(path.posix.dirname(owner));
  }
  for (const container of [...containers].sort()) {
    const absolute = path.join(repositoryRoot, container);
    if (!fs.existsSync(absolute)) continue;
    for (const entry of fs.readdirSync(absolute, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      if (SUPPORT_FOLDER_NAMES.has(entry.name)) continue;
      const childRelative = `${container}/${entry.name}`;
      if (claimedOwners.has(childRelative)) continue;
      if (!hasIndexModule(path.join(absolute, entry.name))) continue;
      if (!hasRenderableComponent(path.join(absolute, entry.name))) continue;
      add(
        'unowned-folder',
        `${childRelative} is an indexed component folder beside claimed families but owns no inventory row`,
      );
    }
  }

  // --- manifest parity ----------------------------------------------------
  const manifestIndexPath = path.join(programRoot, 'manifest/index.json');
  const inventoryIds = new Set(rows.map((row) => row.id));
  if (fs.existsSync(manifestIndexPath)) {
    const manifestIndex = readJson(manifestIndexPath);
    const manifestFamilies = manifestIndex?.families ?? {};
    const manifestIds = new Set(
      Array.isArray(manifestFamilies)
        ? manifestFamilies.map((family) => family.id ?? family.familyId)
        : Object.keys(manifestFamilies),
    );
    for (const id of inventoryIds) {
      if (!manifestIds.has(id)) add('manifest-parity', `inventory id ${id} has no manifest family`);
    }
    for (const id of manifestIds) {
      if (!inventoryIds.has(id)) add('manifest-parity', `manifest family ${id} has no inventory row`);
    }
  } else {
    add('manifest-parity', 'manifest/index.json is missing');
  }

  const familyFiles = collectFamilyManifestFiles(path.join(programRoot, 'manifest/families'));
  const familyFileIds = new Set(
    familyFiles.map((file) =>
      path
        .relative(path.join(programRoot, 'manifest/families'), file)
        .replaceAll('\\', '/')
        .replace(/\.json$/, ''),
    ),
  );
  for (const id of inventoryIds) {
    if (!familyFileIds.has(id)) {
      add('manifest-parity', `inventory id ${id} has no manifest/families cell`);
    }
  }
  for (const id of familyFileIds) {
    if (!inventoryIds.has(id)) {
      add('manifest-parity', `manifest/families cell ${id} has no inventory row`);
    }
  }

  // --- showroom parity ----------------------------------------------------
  for (const registry of registries) {
    const registryPath = path.join(showroomRegistryRoot, registry.file);
    if (!fs.existsSync(registryPath)) {
      add('showroom-parity', `registry ${registry.file} is missing`);
      continue;
    }
    const entries = parseShowroomRegistry(fs.readFileSync(registryPath, 'utf8'));
    if (entries.length === 0) {
      add('showroom-parity', `registry ${registry.file} parsed to zero entries`);
      continue;
    }
    const registered = new Set(entries.map((entry) => normalizeFamilySlug(entry.slug)));
    const expected = new Map();
    for (const row of rows) {
      if (!registry.layers.includes(row.layer)) continue;
      expected.set(normalizeFamilySlug(String(row.id).split('/').pop()), row);
    }
    for (const [normalized, row] of expected) {
      if (!registered.has(normalized)) {
        add('showroom-parity', `${row.id} has no entry in ${registry.file}`);
      }
    }
    for (const entry of entries) {
      const row = expected.get(normalizeFamilySlug(entry.slug));
      if (!row) {
        add('showroom-parity', `${registry.file} entry "${entry.slug}" resolves to no family row`);
        continue;
      }
      // A matching slug is not agreement. The Showroom publishes the `name` as
      // the component a reader will import, and the group as where it lives, so
      // both have to be the row's -- otherwise the catalog documents a symbol
      // under a name or a category the design system does not actually use.
      const named = new Set([row.family, ...(row.components ?? [])]);
      if (!named.has(entry.name)) {
        add(
          'showroom-name-parity',
          `${registry.file} publishes "${entry.slug}" as ${entry.name}, but ${row.id} names ${[...named].join(' / ')}`,
        );
      }
      if (entry.group === null) {
        add(
          'showroom-parity',
          `${registry.file} entry "${entry.slug}" has no category/group/family key to check against ${row.id}`,
        );
      } else if (entry.group !== row.category) {
        add(
          'showroom-group-parity',
          `${registry.file} files "${entry.slug}" under "${entry.group}", but ${row.id} is category "${row.category}"`,
        );
      }
    }
  }

  // --- public reachability -------------------------------------------------
  // The only binding an incorrect inventory cannot fake, because it is computed
  // from source by a resolver that never reads a row's own claim about itself.
  const resolver = resolverFactory({ entryFile: rootEntryFile });

  const ownersByLength = rows
    .filter((row) => typeof row.sourceOwner === 'string' && row.sourceOwner.length > 0)
    .map((row) => ({ id: row.id, owner: path.join(repositoryRoot, row.sourceOwner) }))
    // Longest first: the most specific declared territory wins. Lane 2 removed
    // the only nested pair, and `owner-nesting-drill` keeps it that way.
    .sort((left, right) => right.owner.length - left.owner.length);

  const contains = (file, owner) => file === owner || file.startsWith(owner + path.sep);
  const ownerOf = (file) => ownersByLength.find((candidate) => contains(file, candidate.owner)) ?? null;

  // Forward: everything a row declares must be reachable AS A VALUE and must
  // land inside that row's own territory.
  for (const row of rows) {
    if (!Array.isArray(row.components) || !row.sourceOwner) continue;
    const territory = path.join(repositoryRoot, row.sourceOwner);

    for (const component of row.components) {
      const resolution = resolver.resolve(component);

      if (resolution.state !== 'VALUE') {
        add(
          'public-binding',
          `${row.id} declares "${component}", but the package root resolves it as ${resolution.state}` +
            `${resolution.reason ? ` (${resolution.reason})` : ''} -- nothing can render it`,
        );
        continue;
      }

      const file = resolution.terminal?.file;
      if (!file) {
        add(
          'public-binding',
          `${row.id} declares "${component}", which the root re-exports from outside this package ` +
            `("${resolution.terminal?.module ?? 'unknown'}") -- a third-party symbol is never a family`,
        );
        continue;
      }

      if (!contains(file, territory)) {
        const actual = ownerOf(file);
        add(
          'public-binding',
          `${row.id} declares "${component}", but the root's "${component}" is declared in ` +
            `${path.relative(repositoryRoot, file)}${actual ? `, which belongs to ${actual.id}` : ''} ` +
            `-- not inside this row's sourceOwner`,
        );
      }
    }
  }

  // Reverse: every public component-shaped value under the UI tiers must be
  // attributable to exactly one row, or be declared support. Without this the
  // forward pass alone would let a whole public component escape the catalog
  // simply by never being named in it.
  const uiRoot = path.join(repositoryRoot, 'packages/core/src/ui') + path.sep;

  for (const [name, resolution] of resolver.enumerate()) {
    // Fail-closed first: a name the resolver could not follow to a declaration
    // is reported BY NAME before any component/ownership filtering, because
    // every one of those filters needs the terminal this name does not have.
    // Nothing here is conditioned on PascalCase or on sitting under the UI
    // tree either -- both are read off the terminal, so applying them would
    // re-hide precisely the names that have none.
    if (resolution.state !== 'VALUE') {
      if (resolution.state === 'TYPE_ONLY') continue;
      const refusal = UNRESOLVABLE_EXPORT_KINDS[resolution.state];
      const terminals = Array.isArray(resolution.terminals)
        ? ` [${resolution.terminals
            .map((terminal) =>
              terminal?.file ? path.relative(repositoryRoot, terminal.file) : (terminal?.module ?? 'unknown'),
            )
            .join(' | ')}]`
        : '';
      add(
        refusal?.kind ?? 'public-unresolvable',
        `"${name}" is published by the package root but resolves as ${resolution.state}` +
          `${resolution.reason ? ` (${resolution.reason})` : ''}${terminals} -- ` +
          `${refusal?.consequence ?? 'the resolver refused to name a terminal declaration for it'}`,
      );
      continue;
    }
    const file = resolution.terminal?.file;
    if (!file || !file.startsWith(uiRoot)) continue;
    // Component naming, not component behaviour: a lowercase value or a hook is
    // reachable and legal, but it is not a family product.
    if (!/^[A-Z]/.test(name) || /^use[A-Z]/.test(name)) continue;
    if (!resolver.isComponentShaped(resolution)) continue;
    if (ownerOf(file)) continue;

    const declared = GOVERNED_PUBLIC_SUPPORT[name];
    if (!declared) {
      add(
        'public-unowned',
        `"${name}" (${path.relative(repositoryRoot, file)}) is a public component-shaped value that ` +
          `no inventory row owns and no support declaration covers`,
      );
      continue;
    }
    if (declared.disposition === 'pending-adjudication') {
      add(
        'public-support-unadjudicated',
        `"${name}" (${path.relative(repositoryRoot, file)}) is declared pending adjudication: ` +
          `${declared.reason}`,
      );
    }
  }

  return { violations, rowCount: rows.length };
}

function main() {
  const asJson = process.argv.includes('--json');
  const { violations, rowCount } = auditTaxonomyParity();

  if (asJson) {
    console.log(JSON.stringify({ rowCount, violations }, null, 2));
    process.exit(violations.length === 0 ? 0 : 1);
  }

  const byKind = new Map();
  for (const violation of violations) {
    if (!byKind.has(violation.kind)) byKind.set(violation.kind, []);
    byKind.get(violation.kind).push(violation.detail);
  }

  console.log(`taxonomy parity: ${rowCount} inventory rows`);
  if (violations.length === 0) {
    console.log('OK -- source, public, manifest and Showroom agree');
    process.exit(0);
  }

  for (const [kind, details] of [...byKind].sort()) {
    console.log(`\n${kind} (${details.length})`);
    for (const detail of details) console.log(`  - ${detail}`);
  }
  console.log(`\nFAIL -- ${violations.length} taxonomy parity violations`);
  process.exit(1);
}

if (import.meta.url === `file://${process.argv[1]}`) main();
