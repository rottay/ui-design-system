#!/usr/bin/env node
/**
 * Deterministic CSS cascade gate (DS-A001).
 *
 * Tailwind v4 and Rottay share one named layer order. First-party paint must
 * live in its owning DS layer, except for the deliberately unlayered root
 * authorities: the document-wide @property registry, compiled tenant
 * artifacts, and the Arabic root typography floor. Tenant artifacts are the
 * final authored authority for the channels in their coverage declaration;
 * putting them in a named layer would make unlayered application paint win.
 */
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import postcss from "postcss";
import {
  packageRoot as findPackageRoot,
  repoRoot as findRepoRoot,
} from '../../../../../libraries/repo-root/index.mjs';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const packageRoot = findPackageRoot(scriptDir);
const repoRoot = findRepoRoot(scriptDir);

export const CANONICAL_LAYER_ORDER =
  "@layer theme, base, rottay-framework, rottay-reset, rottay-tokens, rottay-motion, rottay-components, rottay-engines, rottay-structures, rottay-surfaces, rottay-personality, rottay-responsive, components, utilities;";

const args = process.argv.slice(2);
const entryArgs = [];
for (let index = 0; index < args.length; index += 1) {
  if (args[index] === "--entry") entryArgs.push(resolve(args[index + 1]));
}

const entrypoints = entryArgs.length
  ? entryArgs
  : discoverEntrypoints(
      resolve(packageRoot, "src/foundation/tokens/css/facade/entrypoints")
    );

const modernFrameworkProjection = resolve(
  packageRoot,
  "src/foundation/tokens/css/runtime/engines/modern/framework-token-projection/index.css"
);
const modernThemePaint = resolve(
  packageRoot,
  "src/foundation/tokens/css/runtime/engines/modern/theme/index.css"
);
const modernFrameworkBridge = resolve(
  packageRoot,
  "src/foundation/tokens/css/runtime/engines/modern/framework-bridge/index.css"
);
const engineIndex = resolve(
  packageRoot,
  "src/foundation/tokens/css/runtime/engines/index.css"
);

const MODERN_FRAMEWORK_TOKEN_PROPERTIES = new Set([
  "--color-primary",
  "--color-primary-content",
  "--color-secondary",
  "--color-secondary-content",
  "--color-accent",
  "--color-accent-content",
  "--color-neutral",
  "--color-neutral-content",
  "--color-base-100",
  "--color-base-200",
  "--color-base-300",
  "--color-base-content",
  "--color-success",
  "--color-success-content",
  "--color-warning",
  "--color-warning-content",
  "--color-error",
  "--color-error-content",
  "--color-info",
  "--color-info-content",
  "--radius-selector",
  "--radius-field",
  "--radius-box",
  "--size-selector",
  "--size-field",
  "--border",
  "--depth",
  "--noise",
]);

const DIRECT_DS_TOKEN_REFERENCE = /^var\(--ds-[a-z0-9-]+\)$/;

const IMPORT_RE = /@import\s+(['"])([^'"]+)\1\s*(?:layer\(([^)]*)\))?\s*;/g;
const UNLAYERED_REGISTRIES = new Set(["foundation/base/properties/index.css"]);
const UNLAYERED_ROOT_AUTHORITIES = new Set([
  "foundation/responsive/language-arabic-root/index.css",
]);
const PAINT_BRIDGE_RE = /(?:patterns|collapse|personality)-paint\.css$/;

function normalizedSpecifier(specifier) {
  return specifier
    .replaceAll("\\", "/")
    .replace(/^(?:\.\.\/)+/, "")
    .replace(/^\.\//, "");
}

/**
 * The marker class a sheet's own selectors carry. It is a CONSISTENCY SIGNAL,
 * not the tier authority: a structure whose skin forgot to emit
 * `.ds-structure` still belongs above `rottay-engines`, and reading the marker
 * as the answer is exactly what left 20 structure families painting BELOW the
 * engine they exist to refine (F-16). `resolveSkinTier` consults it only after
 * every source-derived route has failed.
 */
export function markerTier(absolutePath) {
  if (!existsSync(absolutePath)) return "rottay-components";
  return ownMarkerTier(readFileSync(absolutePath, "utf8")) ?? "rottay-components";
}

function ownMarkerTier(css) {
  const body = css.replace(/\/\*[\s\S]*?\*\//g, "");
  if (/\.ds-surface[.[:]/.test(body)) return "rottay-surfaces";
  if (/\.ds-structure[.[:]/.test(body)) return "rottay-structures";
  return null;
}

/**
 * The physical component root a family lives under decides its cascade tier.
 * `primitives` and `patterns` are both engine-agnostic component paint;
 * `structures` and `surfaces` are the two tiers that must be able to outrank
 * an engine skin without escaping the cascade.
 */
const TIER_OF_COMPONENT_ROOT = new Map([
  ["primitives", "rottay-components"],
  ["patterns", "rottay-components"],
  ["structures", "rottay-structures"],
  ["surfaces", "rottay-surfaces"],
]);

const TIER_RANK = new Map([
  ["rottay-components", 0],
  ["rottay-structures", 1],
  ["rottay-surfaces", 2],
]);

const FAMILY_INVENTORY = resolve(
  packageRoot,
  "scripts/check/modern-rescue/family-inventory/index.json"
);

/**
 * Every family owner the generated inventory records, resolved onto the
 * physical tree.
 *
 * WHY THE INVENTORY. A shared skin does not name its owner and no component
 * imports it, so the skin path alone cannot establish a tier. The inventory is
 * the repository's ONE generated source-binding record (regenerate it with
 * `node scripts/check/evidence/framework/cli/index.mjs inventory --write`); its
 * `sourceOwner` is a real directory, and the tier is read from that directory's
 * physical root rather than from anything the inventory asserts. A family that
 * moves from `structures/` to `surfaces/` therefore retiers its skin with no
 * edit here, and there is no second hand-written tier roster to drift.
 *
 * The historical governance manifest is NOT read: it binds a sheet to every
 * family whose anatomy that sheet touches, which is many-to-many and is not
 * ownership. It stays an audit cross-check, published by `skinTierCensus()`.
 */
function loadFamilyOwners(inventoryPath = FAMILY_INVENTORY, ownerRoot = packageRoot) {
  const inventory = JSON.parse(readFileSync(inventoryPath, "utf8"));
  const owners = [];
  for (const row of inventory.rows ?? []) {
    const rel = String(row.sourceOwner ?? "").replace(/^packages\/core\//, "");
    const match = /^src\/components\/([a-z]+)\//.exec(rel);
    if (!match) continue;
    const tier = TIER_OF_COMPONENT_ROOT.get(match[1]);
    if (!tier) continue;
    const directory = resolve(ownerRoot, rel);
    if (!existsSync(directory)) continue;
    owners.push({ id: row.id, slug: rel.split("/").pop(), directory, tier });
  }
  return owners;
}

const SKIN_MARKER_CLASSES = new Set(["ds-surface", "ds-structure"]);

/**
 * The `ds-`/`rottay-` class tokens a skin selects, minus the two tier markers
 * (which every tier member carries and so identify nobody) and the engine root
 * classes. An engine-suffixed token is also offered unsuffixed, because
 * `.rottay-menu--modern` is painted for the component that stamps
 * `rottay-menu`.
 */
export function skinSubjectClasses(css) {
  const body = css.replace(/\/\*[\s\S]*?\*\//g, "");
  const classes = new Set();
  for (const match of body.matchAll(/\.((?:ds|rottay)-[a-z0-9][a-z0-9-]*)/g)) {
    const token = match[1];
    if (SKIN_MARKER_CLASSES.has(token) || token.startsWith("ds-engine-")) continue;
    classes.add(token);
    const bare = token.replace(/--?(?:modern|classic|rustic)$/, "");
    if (bare !== token) classes.add(bare);
  }
  return [...classes];
}

function indexOwnersByStampedClass(owners) {
  const byClass = new Map();
  for (const owner of owners) {
    const walk = (dir) => {
      let entries;
      try {
        entries = readdirSync(dir, { withFileTypes: true });
      } catch {
        return;
      }
      for (const entry of entries) {
        const full = resolve(dir, entry.name);
        if (entry.isDirectory()) {
          if (entry.name !== "node_modules" && entry.name !== "tests") walk(full);
          continue;
        }
        if (!/\.tsx?$/.test(entry.name) || /\.(test|spec)\.tsx?$/.test(entry.name)) continue;
        for (const match of readFileSync(full, "utf8").matchAll(
          /["'`]((?:ds|rottay)-[a-z0-9][a-z0-9-]*)/g
        )) {
          if (!byClass.has(match[1])) byClass.set(match[1], new Set());
          byClass.get(match[1]).add(owner);
        }
      }
    };
    walk(owner.directory);
  }
  return byClass;
}

export function buildSkinTierIndex(inventoryPath = FAMILY_INVENTORY, ownerRoot = packageRoot) {
  const owners = loadFamilyOwners(inventoryPath, ownerRoot);
  const bySlug = new Map();
  for (const owner of owners) {
    if (!bySlug.has(owner.slug)) bySlug.set(owner.slug, []);
    bySlug.get(owner.slug).push(owner);
  }
  return { owners, bySlug, byClass: indexOwnersByStampedClass(owners) };
}

let skinTierIndex = null;
function defaultSkinTierIndex() {
  if (!skinTierIndex) skinTierIndex = buildSkinTierIndex();
  return skinTierIndex;
}

const uniqueTier = (tiers) => {
  const set = new Set(tiers);
  return set.size === 1 ? [...set][0] : null;
};

/**
 * The cascade tier of a shared presentation skin, derived from source in one
 * fixed order. Every route answers the SAME question -- which component family
 * owns this sheet -- and the first route that answers it unambiguously wins, so
 * there is exactly one owner of the decision.
 *
 *  1. `family-owner`         the family whose owner directory IS this slug.
 *  2. `stamped-class`        the families whose sources stamp the classes this
 *                            sheet selects; used when the sheet is a shared
 *                            variant sheet rather than a family of its own.
 *  3. `family-owner-prefix`  a companion sheet named after its family
 *                            (`stats-header-keyframes` -> `stats-header`).
 *                            Only the LONGEST matching owner slug is read:
 *                            falling back to shorter prefixes is how
 *                            `empty-state-surface` once resolved to `empty`.
 *  4. `ambiguous-owner-highest-tier` a slug two tiers both claim resolves to
 *                            the higher one: a sheet bound too LOW is
 *                            overridden by the engine (the F-16 defect), while
 *                            one bound at the higher tier is still overridable
 *                            by the app.
 *  5. `own-marker`           only for a sheet with no live family owner at all.
 *  6. `engine-agnostic-default` a keyframes-only sheet that addresses nothing.
 *
 * A path that does not exist resolves to `null` rather than to a tier: a
 * dangling import must fail, not inherit `rottay-components` by accident.
 */
export function resolveSkinTier(absolutePath, index = defaultSkinTierIndex()) {
  const segments = absolutePath.replaceAll("\\", "/").split("/");
  const parent = segments[segments.length - 2];
  const slug = parent === "skin" ? segments[segments.length - 1].replace(/\.css$/, "") : parent;
  // A sheet that is not on disk contributes NO content routes. It is never
  // defaulted into `rottay-components`: either its slug names a live family or
  // the answer is `null`, and a null answer is a failure upstream.
  const css = existsSync(absolutePath) ? readFileSync(absolutePath, "utf8") : null;

  const exact = index.bySlug.get(slug) ?? [];
  let tier = uniqueTier(exact.map((owner) => owner.tier));
  if (tier) return { tier, via: "family-owner", evidence: exact[0].id };

  const stamped = new Set();
  if (css !== null) {
    for (const token of skinSubjectClasses(css)) {
      for (const owner of index.byClass.get(token) ?? []) stamped.add(owner);
    }
    tier = uniqueTier([...stamped].map((owner) => owner.tier));
    if (tier) return { tier, via: "stamped-class", evidence: [...stamped][0].id };
  }

  const prefixes = [...index.bySlug.keys()]
    .filter((name) => slug.startsWith(`${name}-`))
    .sort((left, right) => right.length - left.length);
  if (prefixes.length > 0) {
    const candidates = index.bySlug.get(prefixes[0]);
    tier = uniqueTier(candidates.map((owner) => owner.tier));
    if (tier) return { tier, via: "family-owner-prefix", evidence: candidates[0].id };
  }

  const contested = [...exact, ...stamped].map((owner) => owner.tier);
  if (contested.length > 0) {
    const highest = [...new Set(contested)].sort(
      (left, right) => TIER_RANK.get(right) - TIER_RANK.get(left)
    )[0];
    return {
      tier: highest,
      via: "ambiguous-owner-highest-tier",
      evidence: `${exact.length} owner-slug / ${stamped.size} stamped-class candidates`,
    };
  }

  if (css === null) return null;
  const marker = ownMarkerTier(css);
  if (marker) return { tier: marker, via: "own-marker", evidence: "selector tier marker" };
  return { tier: "rottay-components", via: "engine-agnostic-default", evidence: "no owner, no marker" };
}

function expectedLayer(specifier, cssRoot = CSS_ROOT) {
  const normalized = normalizedSpecifier(specifier);
  // Only the shared SKIN sheets carry a tier. The 31 sibling sheets under
  // `presentation/components/` are per-component token contracts -- a `:root`
  // block of `--ds-<component>-*` channels with no anatomy and no tier -- and
  // they belong to the engine-agnostic component base by construction.
  if (normalized.includes("presentation/components/skin/")) {
    return resolveSkinTier(resolve(cssRoot, normalized))?.tier ?? null;
  }
  if (normalized.includes("presentation/components/")) {
    return "rottay-components";
  }
  if (normalized.includes("runtime/bridges/")) {
    return "rottay-components";
  }
  if (normalized.includes("runtime/engines/")) return "rottay-engines";
  if (normalized.includes("runtime/personality")) return "rottay-personality";
  if (normalized.includes("foundation/responsive/")) return "rottay-responsive";
  if (normalized.includes("foundation/animations/")) return "rottay-motion";
  // Token-authoring channels only. This is an explicit per-channel list, not a
  // broad `foundation/` catch-all: a new foundation channel must be classified
  // deliberately, so it fails as "no cascade owner" until an owner declares it.
  if (
    normalized.includes("foundation/base/") ||
    normalized.includes("foundation/themes/") ||
    normalized.includes("foundation/monochrome/")
  )
    return "rottay-tokens";
  return null;
}

const BASE_ENTRYPOINT_RE = /^\.\.\/base\/index\.css$/;

/**
 * `resolveImports` follows the same synthetic-fixture rule the CLI already
 * applies to reachability, header claims and the inline ratchet: a drill that
 * points `--entry` at a hand-written classification fixture is asserting how a
 * SPECIFIER is classified, and its targets are text, not files. Every audit of
 * the real tree runs with resolution ON, which is where the fail-open was.
 */
export function auditCascadeEntrypoint(path, { resolveImports = true } = {}) {
  const failures = [];
  if (!existsSync(path)) return [`entrypoint does not exist: ${path}`];

  const css = readFileSync(path, "utf8");
  // A vertical entrypoint derives from `base`, which is where the canonical
  // order is declared once. Restating it there would create a second place to
  // keep in sync, which is the defect this gate exists to prevent.
  const derivesFromBase = [...css.matchAll(IMPORT_RE)].some(
    (match) => match[2].startsWith(".") && BASE_ENTRYPOINT_RE.test(match[2])
  );
  const orderIndex = css.indexOf(CANONICAL_LAYER_ORDER);
  const firstImport = css.search(/@import\s/);
  if (!derivesFromBase) {
    if (orderIndex < 0)
      failures.push("missing canonical Tailwind + Rottay layer order");
    if (firstImport >= 0 && (orderIndex < 0 || orderIndex > firstImport)) {
      failures.push("canonical layer order must be established before imports");
    }
  } else if (orderIndex >= 0) {
    failures.push(
      "derived entrypoint must not restate the canonical layer order; base owns it"
    );
  }

  for (const match of css.matchAll(IMPORT_RE)) {
    const specifier = match[2];
    const layer = match[3]?.trim() || null;
    if (!specifier.startsWith(".")) continue;

    // A first-party import that resolves to nothing paints nothing, and every
    // classifier downstream answers for a file it never read: the tier
    // resolver used to hand back `rottay-components` for a path that does not
    // exist, so a dangling import claiming a higher tier was reported as an
    // ordinary "wrong cascade owner" and a dangling import claiming
    // `rottay-components` was reported as correct. Resolution is checked first,
    // and its own failure is named for what it is.
    if (resolveImports && !existsSync(resolve(dirname(path), specifier))) {
      failures.push(`first-party import does not resolve: ${specifier}`);
      continue;
    }

    const normalized = normalizedSpecifier(specifier);
    if (PAINT_BRIDGE_RE.test(normalized)) {
      failures.push(`obsolete paint bridge import: ${specifier}`);
      continue;
    }

    if (UNLAYERED_REGISTRIES.has(normalized)) {
      if (layer)
        failures.push(
          `document-wide registry must remain unlayered: ${specifier}`
        );
      continue;
    }

    // A derived entrypoint pulls `base` and its vertical's `@font-face` packs
    // unlayered: both carry their own layering (or, for @font-face, none).
    if (
      BASE_ENTRYPOINT_RE.test(specifier) ||
      normalized.includes("foundation/typography/font-packs/")
    ) {
      if (layer) {
        failures.push(
          `entrypoint derivation and font packs must remain unlayered: ${specifier}`
        );
      }
      continue;
    }

    if (
      UNLAYERED_ROOT_AUTHORITIES.has(normalized) ||
      normalized.includes("facade/artifacts/") ||
      normalized.startsWith("artifacts/")
    ) {
      if (layer) {
        failures.push(
          `root paint authority must remain unlayered: ${specifier}`
        );
      }
      continue;
    }

    const expected = expectedLayer(specifier);
    if (!expected) {
      failures.push(`first-party import has no cascade owner: ${specifier}`);
      continue;
    }
    if (!layer) {
      failures.push(
        `unlayered first-party import: ${specifier}; expected layer(${expected})`
      );
      continue;
    }
    if (layer !== expected) {
      failures.push(
        `wrong cascade owner: ${specifier} uses layer(${layer}); expected layer(${expected})`
      );
    }
  }
  return failures;
}

/**
 * Files under the CSS root that no entrypoint imports, each with the reason
 * it is allowed to sit outside the cascade. Anything unreachable and NOT
 * listed here is a defect: the gate can otherwise certify a layered/unlayered
 * split forever while one half silently reaches no bundle, which is exactly
 * how patterns-paint.css lost 246 declarations between 2026-07-25 and
 * 2026-08-02 without a single gate complaining.
 */
export const UNREACHABLE_BY_DESIGN = new Map([
  ["foundation/typography/font-packs/editorial-display/index.css", "font pack no vertical currently selects"],
  ["foundation/typography/font-packs/editorial-text/index.css", "font pack no vertical currently selects"],
  ["presentation/components/index.css", "alternative component aggregator, not on the shipped entrypoint path"],
  ["presentation/components/patterns-paint/index.css", "tombstone: migrated into patterns.css 2026-08-02, whole-file RETIRE_PROPOSED"],
  ["runtime/engines/modern/compiled/index.css", "build product of build:modern-css"],
]);

/**
 * The roster source, parsed rather than restated. Two file classes reach the
 * shipped bundle without any `@import` naming them: the compiled tenant
 * artifact and the `@font-face` packs its vertical declares. The build reads
 * both from `FIRST_PARTY_VERTICAL_ROSTER` by path
 * (`scripts/build/verticals/css-build`), so the roster -- not an entrypoint --
 * is what makes them reachable.
 *
 * Before WO-CAN-03 that fact was hidden: `facade/entrypoints/bithire` happened
 * to import three packs directly, so three of the four selected packs looked
 * reachable through the graph and the fourth, `geometric-display`, sat in
 * UNREACHABLE_BY_DESIGN describing itself as "no vertical currently selects"
 * while `evnto` had selected it all along.
 */
const ROSTER_SOURCE = resolve(
  packageRoot,
  "src/foundation/tokens/ts/presentation/brand-themes/index.ts"
);

export function readFirstPartyRoster(rosterPath = ROSTER_SOURCE) {
  if (!existsSync(rosterPath)) return null;
  const source = readFileSync(rosterPath, "utf8");
  const start = source.indexOf("export const FIRST_PARTY_VERTICAL_ROSTER");
  if (start < 0) return null;
  const block = source.slice(start, source.indexOf("\n  ]);", start));
  const rows = [];
  for (const match of block.matchAll(
    /entry\(\s*([A-Za-z0-9_]+)BrandTheme\s*,[\s\S]*?fontPacks:\s*\[([^\]]*)\]/g
  )) {
    rows.push({
      slug: match[1],
      fontPacks: [...match[2].matchAll(/["']([a-z0-9-]+)["']/g)].map((pack) => pack[1]),
    });
  }
  return rows.length > 0 ? rows : null;
}

/**
 * Relative CSS paths the build mounts by roster lookup instead of by import.
 * Returns `null` when the roster cannot be read, so the caller fails closed
 * rather than silently treating every artifact as unreachable-by-design.
 */
export function rosterMountedCss(rosterPath = ROSTER_SOURCE) {
  const roster = readFirstPartyRoster(rosterPath);
  if (!roster) return null;
  const paths = new Set();
  for (const row of roster) {
    paths.add(`facade/artifacts/${row.slug}/index.css`);
    for (const pack of row.fontPacks) {
      paths.add(`foundation/typography/font-packs/${pack}/index.css`);
    }
  }
  return paths;
}

const CSS_ROOT = resolve(packageRoot, "src/foundation/tokens/css");

export function collectReachable(entry, root, seen = new Set()) {
  const full = resolve(entry);
  if (seen.has(full) || !existsSync(full)) return seen;
  seen.add(full);
  for (const match of readFileSync(full, "utf8").matchAll(IMPORT_RE)) {
    if (!match[2].startsWith(".")) continue;
    collectReachable(resolve(dirname(full), match[2]), root, seen);
  }
  return seen;
}

function collectCss(dir, out = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (entry.name !== "tests" && entry.name !== "__tests__") {
        collectCss(resolve(dir, entry.name), out);
      }
    } else if (entry.name.endsWith(".css")) {
      out.push(resolve(dir, entry.name));
    }
  }
  return out;
}

/**
 * Both halves of every split must ship. A file this gate governs is only
 * allowed to be unreachable from every entrypoint if it says why.
 */
export function auditGovernedFilesAreReachable({
  cssRoot = CSS_ROOT,
  entrypoints: entries,
  allowlist = UNREACHABLE_BY_DESIGN,
  rosterPath = ROSTER_SOURCE,
} = {}) {
  const failures = [];
  if (!existsSync(cssRoot)) return [`css root does not exist: ${cssRoot}`];

  const entryDir = resolve(cssRoot, "facade/entrypoints");
  const roots =
    entries ??
    (existsSync(entryDir)
      ? readdirSync(entryDir, { withFileTypes: true })
          .flatMap((entry) => {
            if (entry.isFile() && entry.name.endsWith(".css")) {
              return [resolve(entryDir, entry.name)];
            }
            if (entry.isDirectory()) {
              const index = resolve(entryDir, entry.name, "index.css");
              return existsSync(index) ? [index] : [];
            }
            return [];
          })
      : []);
  if (roots.length === 0) return [`no entrypoints found under ${entryDir}`];

  const reachable = new Set();
  for (const root of roots) collectReachable(root, cssRoot, reachable);

  // Roster-mounted files reach the bundle through the build's roster lookup,
  // not through an `@import`. Failing closed here matters: an unreadable
  // roster must not downgrade every artifact and font pack to "unreachable".
  const mountedByRoster = rosterMountedCss(rosterPath);
  if (!mountedByRoster) {
    return [
      `first-party roster is unreadable at ${relative(packageRoot, rosterPath).replaceAll("\\", "/")}; cannot resolve which artifacts and font packs the build mounts`,
    ];
  }
  for (const rel of mountedByRoster) {
    const file = resolve(cssRoot, rel);
    if (!existsSync(file)) {
      failures.push(
        `roster mounts ${rel}, which does not exist; the build would fail on a path the roster declares`
      );
      continue;
    }
    reachable.add(file);
  }

  for (const file of collectCss(cssRoot)) {
    const key = relative(cssRoot, file).replaceAll("\\", "/");
    const declared = allowlist.has(key);
    if (reachable.has(file)) {
      if (declared) {
        failures.push(
          `stale unreachable-by-design entry: ${key} IS imported; remove it from UNREACHABLE_BY_DESIGN`
        );
      }
      continue;
    }
    if (!declared) {
      failures.push(
        `governed file reaches no bundle: ${key} is imported by no entrypoint. Either import it from an entrypoint under its cascade owner, or declare it in UNREACHABLE_BY_DESIGN with the reason.`
      );
    }
  }
  return failures;
}

/**
 * `[data-engine='modern']` on the root is the CSS engine-selection authority
 * (D-18). The modern framework projection and bridge gate on it, never on
 * `[data-tenant]`: a tenant is who is looking, an engine is what is rendering,
 * and a tenant-gated engine sheet is inert on every tenant-less mount and live
 * on every mount running a different engine.
 */
const MODERN_ENGINE_ROOT = "[data-engine='modern']";

export function auditModernThemeOwnership({
  projectionPath = modernFrameworkProjection,
  paintPath = modernThemePaint,
  bridgePath = modernFrameworkBridge,
  indexPath = engineIndex,
} = {}) {
  const failures = [];
  for (const path of [projectionPath, paintPath, bridgePath, indexPath]) {
    if (!existsSync(path)) failures.push(`modern ownership file missing: ${path}`);
  }
  if (failures.length > 0) return failures;

  const projectionCss = readFileSync(projectionPath, "utf8");
  const paintCss = readFileSync(paintPath, "utf8");
  const bridgeCss = readFileSync(bridgePath, "utf8");
  const indexCss = readFileSync(indexPath, "utf8");
  const projectionRoot = postcss.parse(projectionCss, { from: projectionPath });
  const paintRoot = postcss.parse(paintCss, { from: paintPath });
  const bridgeRoot = postcss.parse(bridgeCss, { from: bridgePath });

  projectionRoot.walkRules((rule) => {
    if (rule.selector !== MODERN_ENGINE_ROOT) {
      failures.push(
        `modern framework projection is not gated on the engine root ${MODERN_ENGINE_ROOT}: ${rule.selector}`
      );
    }
  });
  projectionRoot.walkDecls((declaration) => {
    if (!MODERN_FRAMEWORK_TOKEN_PROPERTIES.has(declaration.prop)) {
      failures.push(
        `modern framework projection owns a non-framework token: ${declaration.prop}`
      );
    }
    if (!DIRECT_DS_TOKEN_REFERENCE.test(declaration.value.trim())) {
      failures.push(
        `modern framework projection must directly reference one canonical --ds-* token: ${declaration.prop}: ${declaration.value}`
      );
    }
  });
  paintRoot.walkDecls((declaration) => {
    if (declaration.prop.startsWith("--")) {
      failures.push(
        `modern theme paint redefines a token: ${declaration.prop}`
      );
    }
  });
  bridgeRoot.walkRules((rule) => {
    if (!rule.selector.includes(MODERN_ENGINE_ROOT)) {
      failures.push(
        `modern framework bridge has a selector not gated on ${MODERN_ENGINE_ROOT}: ${rule.selector}`
      );
    }
  });
  bridgeRoot.walkDecls((declaration) => {
    if (declaration.prop.startsWith("--")) {
      failures.push(
        `modern framework bridge redefines a token: ${declaration.prop}`
      );
    }
  });

  for (const [label, css] of [
    ["theme paint", paintCss],
    ["framework bridge", bridgeCss],
  ]) {
    if (/\.divider(?:\b|-horizontal\b|-vertical\b)/.test(css)) {
      failures.push(`${label} resurrects generic Daisy divider ownership`);
    }
    if (/\.inline-flex\.flex-row|\[style\*=["']gap["']\]/.test(css)) {
      failures.push(`${label} resurrects global Space utility hacks`);
    }
  }

  const projectionImport = indexCss.indexOf(
    "@import './modern/framework-token-projection/index.css';"
  );
  const paintImport = indexCss.indexOf("@import './modern/theme/index.css';");
  const bridgeImport = indexCss.indexOf(
    "@import './modern/framework-bridge/index.css';"
  );
  if (
    projectionImport < 0 ||
    paintImport < 0 ||
    bridgeImport < 0 ||
    projectionImport > paintImport ||
    paintImport > bridgeImport
  ) {
    failures.push(
      "modern ownership order must be framework token projection, theme paint, framework bridge"
    );
  }

  return failures;
}

/**
 * Every directory under `facade/entrypoints/` that owns an `index.css` is a
 * public entrypoint the gate must audit. Naming them one by one is how
 * `styles/index.css` was allowed to drift away from `base/index.css` in three
 * material ways while the gate reported PASS on both.
 */
export function discoverEntrypoints(entrypointDir) {
  if (!existsSync(entrypointDir)) return [];
  return readdirSync(entrypointDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && entry.name !== "tests")
    .map((entry) => resolve(entrypointDir, entry.name, "index.css"))
    .filter((path) => existsSync(path))
    .sort();
}

/**
 * The legacy entrypoint directories WO-CAN-03 removed. `base/index.css` is the
 * only authored CSS entrypoint; `styles.css` and every `./styles/*` package
 * export are produced by `scripts/build/verticals/css-build` from `base` plus
 * the compiled tenant artifact named by `FIRST_PARTY_VERTICAL_ROSTER`.
 *
 * These four were a second authored copy of the same 450-file graph that no
 * build ever read. The copy had silently lost the unlayered Arabic tracking
 * floor, swapped the Collapse bridge for the Collapse token sheet and pinned a
 * hardcoded `44px` touch floor, while every header in the tree kept reasoning
 * from it (F-16, F-62).
 */
export const RETIRED_ENTRYPOINT_DIRS = ["styles", "rottay", "bithire", "evnto"];

/**
 * Source roots scanned for a resurrected reference to a retired entrypoint.
 * A line whose first non-blank characters open or continue a comment is
 * historical prose, not a resolution, and is skipped; every other line that
 * names a retired entrypoint path is a live consumer.
 *
 * `src`/`scripts`/`tests` is NOT the consumer surface. `.storybook/preview.tsx`
 * imported `entrypoints/styles/index.css` and `build-storybook` is a
 * main-branch CI step, so a scan limited to the three source roots certified a
 * deletion that broke the build; the Showroom is the other real consumer of
 * this package's CSS and is scanned for the same reason. Roots are resolved
 * against the package and the workspace so a drill can point them at a sandbox.
 */
function consumerScanRoots({ packageRoot: pkg = packageRoot, repoRoot: repo = repoRoot } = {}) {
  return [
    resolve(pkg, "src"),
    resolve(pkg, "scripts"),
    resolve(pkg, "tests"),
    resolve(pkg, ".storybook"),
    resolve(repo, "packages/showroom/src"),
    resolve(repo, "packages/showroom/e2e"),
    resolve(repo, "packages/showroom/scripts"),
  ];
}

const CONSUMER_SCAN_EXTENSIONS = new Set([".ts", ".tsx", ".mjs", ".js", ".cjs", ".json", ".css"]);
const CONSUMER_SCAN_SKIP_DIRS = new Set([
  "node_modules",
  "dist",
  ".next",
  "build",
  "coverage",
  "playwright-report",
  "test-results",
]);
const RETIRED_ENTRYPOINT_REFERENCE_RE = new RegExp(
  `facade/entrypoints/(?:${RETIRED_ENTRYPOINT_DIRS.join("|")})(?:/index)?\\.css`
);

/**
 * The same reference spelled as a tail, which is how a consumer that already
 * holds the entrypoint directory names one:
 * `join(ENTRY_DIR, 'styles/index.css')`. Without this the death proof passes
 * while a resolver still asks for a directory that no longer exists.
 *
 * Read ONLY inside a file that also names `facade/entrypoints`, and never on a
 * line about artifacts: `join(artifactsDir, 'rottay/index.css')` is the
 * compiled tenant artifact for the SAME three slugs and is exactly the thing
 * the retired entrypoints were replaced by.
 */
const RETIRED_ENTRYPOINT_TAIL_RE = new RegExp(
  `["'](?:${RETIRED_ENTRYPOINT_DIRS.join("|")})/index\\.css["']`
);
const ARTIFACT_LINE_RE = /artifact/i;

/**
 * The third shape, and the one that survived the first migration: a consumer
 * that never writes the retired path at all, but ITERATES the entrypoint slugs
 * and composes the path from a directory literal.
 * `MarkdownView.pass1-premium.test.tsx` read
 * `for (const entry of ['base', 'styles'])` and joined each slug onto
 * `facade/entrypoints`; no line held a full path and no line held a
 * `styles/index.css` tail, so both earlier shapes passed while the test read a
 * deleted file.
 *
 * The discriminating signal is the ALTERNATION: a quoted `base` next to a
 * quoted retired slug. A bare `'bithire'` on its own is the vertical roster
 * slug that `css-build` and the tenant artifacts legitimately name, so the slug
 * alone must never fire.
 */
const RETIRED_ENTRYPOINT_SLUG_ALTERNATION_RE = new RegExp(
  `(?:["']base["'][^\\n]{0,40}?["'](?:${RETIRED_ENTRYPOINT_DIRS.join("|")})["']` +
    `|["'](?:${RETIRED_ENTRYPOINT_DIRS.join("|")})["'][^\\n]{0,40}?["']base["'])`
);

function collectSourceFiles(dir, out = []) {
  if (!existsSync(dir)) return out;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = resolve(dir, entry.name);
    if (entry.isDirectory()) {
      if (CONSUMER_SCAN_SKIP_DIRS.has(entry.name)) continue;
      collectSourceFiles(full, out);
      continue;
    }
    const dot = entry.name.lastIndexOf(".");
    if (dot >= 0 && CONSUMER_SCAN_EXTENSIONS.has(entry.name.slice(dot))) out.push(full);
  }
  return out;
}

/**
 * The death proof for the four retired entrypoints, and it fails CLOSED in
 * both halves: the directories must be absent, AND no file under `src/`,
 * `scripts/` or `tests/` may resolve a path back into one. A deletion whose
 * consumers were left pointing at the removed path is not a migration, and a
 * gate that only checked `readdir` would certify exactly that.
 *
 * `base` remaining the single discovered entrypoint is asserted here rather
 * than inferred, so re-adding a sibling directory fails immediately instead of
 * quietly widening the audited set.
 */
export function auditSingleEntrypoint({
  cssRoot = CSS_ROOT,
  packageRoot: root = packageRoot,
  repoRoot: workspace = repoRoot,
  scanRoots,
  entrypoints: entries,
} = {}) {
  const failures = [];
  const entrypointDir = resolve(cssRoot, "facade/entrypoints");
  const basePath = resolve(entrypointDir, "base/index.css");
  if (!existsSync(basePath)) return [`base entrypoint is missing: ${basePath}`];

  const discovered = entries ?? discoverEntrypoints(entrypointDir);
  if (discovered.length !== 1 || discovered[0] !== basePath) {
    failures.push(
      `expected exactly one entrypoint (base/index.css); found ${discovered.length}: ${discovered
        .map((path) => relative(entrypointDir, path).replaceAll("\\", "/"))
        .join(", ")}`
    );
  }

  for (const name of RETIRED_ENTRYPOINT_DIRS) {
    if (existsSync(resolve(entrypointDir, name))) {
      failures.push(`retired entrypoint directory is back: facade/entrypoints/${name}`);
    }
  }

  const roots = scanRoots ?? consumerScanRoots({ packageRoot: root, repoRoot: workspace });
  for (const dir of roots) {
    for (const file of collectSourceFiles(dir)) {
      const source = readFileSync(file, "utf8");
      const resolvesEntrypoints = source.includes("facade/entrypoints");
      const lines = source.split("\n");
      for (let index = 0; index < lines.length; index += 1) {
        const line = lines[index];
        const hit =
          RETIRED_ENTRYPOINT_REFERENCE_RE.test(line) ||
          (resolvesEntrypoints &&
            !ARTIFACT_LINE_RE.test(line) &&
            (RETIRED_ENTRYPOINT_TAIL_RE.test(line) ||
              RETIRED_ENTRYPOINT_SLUG_ALTERNATION_RE.test(line)));
        if (!hit) continue;
        const trimmed = line.trim();
        if (trimmed.startsWith("*") || trimmed.startsWith("//") || trimmed.startsWith("/*")) {
          continue;
        }
        failures.push(
          `${relative(workspace, file).replaceAll("\\", "/")}:${index + 1} still resolves a retired entrypoint; repoint it at facade/entrypoints/base/index.css or at the roster artifact path`
        );
      }
    }
  }
  return failures;
}

/**
 * The per-skin tier decision, published so the census can be read without
 * re-deriving it: which tier each shared skin resolves to, by which route, and
 * what the entrypoint currently binds it to. `markerTier` is reported beside
 * the answer as a consistency signal -- it is never what produced it.
 */
export function skinTierCensus({ cssRoot = CSS_ROOT, entrypoint } = {}) {
  const entry = entrypoint ?? resolve(cssRoot, "facade/entrypoints/base/index.css");
  const css = readFileSync(entry, "utf8");
  const index = defaultSkinTierIndex();
  const rows = [];
  for (const match of css.matchAll(IMPORT_RE)) {
    const specifier = match[2];
    if (!specifier.startsWith(".")) continue;
    const normalized = normalizedSpecifier(specifier);
    if (!normalized.includes("presentation/components/skin/")) continue;
    const absolute = resolve(cssRoot, normalized);
    const resolved = resolveSkinTier(absolute, index);
    rows.push({
      skin: normalized,
      bound: match[3]?.trim() || null,
      tier: resolved?.tier ?? null,
      via: resolved?.via ?? "unresolvable",
      evidence: resolved?.evidence ?? null,
      marker: ownMarkerTier(readFileSync(absolute, "utf8")),
    });
  }
  return rows;
}

/**
 * A header that states a cascade position the entrypoint contradicts is worse
 * than no header: 172 engine skins documented themselves as unlayered while
 * every one of them was imported into `layer(rottay-engines)`, and the files
 * that reasoned from that note reasoned from a fiction (F-16, F-95).
 *
 * Only explicit, machine-checkable assertions are read: a "deliberately
 * unlayered" claim, and a `layer(NAME)`/`layer NAME` claim made about this
 * file's own import. Prose that names another owner's layer is not a claim.
 */
const UNLAYERED_CLAIM_RE = /deliberately\s+unlayered/i;

/**
 * A layered sheet cannot outrank the compiled tenant artifact: the artifact is
 * unlayered, and unlayered paint beats every named layer regardless of its
 * position in the order. `foundation/responsive/index.css` documented the
 * opposite for as long as it existed (F-95), and the Arabic root floor had to
 * be imported unlayered precisely because the claim was false.
 */
const BEATS_TENANT_CLAIM_RE =
  /(?:outrank|outranks|beats?|wins? over|above)[^.]{0,80}\btenant\s+artifacts?/i;

/**
 * The own-layer claim is read ONLY from the file's `LAYER:` paragraph, which is
 * the convention every skin header in this tree already uses. Prose elsewhere
 * routinely names another owner's layer ("runtime/personality.css is imported
 * layer(rottay-personality)"), and reading those as self-claims is how a
 * truthfulness gate turns into noise.
 */
function ownLayerClaim(headerText) {
  const lines = headerText.split("\n");
  const start = lines.findIndex((line) => /^\s*\*\s*LAYER:/.test(line));
  if (start < 0) return null;
  const paragraph = [];
  for (let index = start; index < lines.length; index += 1) {
    if (index > start && /^\s*\*\s*$/.test(lines[index])) break;
    paragraph.push(lines[index]);
  }
  const match = paragraph
    .join(" ")
    .match(/\blayer\s*\(?\s*`?(rottay-[a-z-]+)`?\s*\)?/i);
  return match ? match[1] : null;
}

/**
 * Header claims this gate knows are wrong and does not yet own the fix for.
 * Decrease-only: an entry that no longer mismatches is itself a failure, so
 * the list cannot outlive the debt.
 */
/**
 * Header claims that contradict the entrypoint and whose fix this gate does
 * not own. Decrease-only: an entry that no longer mismatches is itself a
 * failure, so the list cannot outlive the debt. Both groups live under
 * `presentation/components/**`, outside the WO-CAN-03 write set (which owns
 * `facade/entrypoints/**` and header-only edits under `runtime/engines/**`).
 */
const WRONG_LAYER_HEADER_DEBT = [
  "presentation/components/skin/active-filters-bar/index.css",
  "presentation/components/skin/activity-surface/index.css",
  "presentation/components/skin/audit/index.css",
  "presentation/components/skin/auth-surface/index.css",
  "presentation/components/skin/billing/index.css",
  "presentation/components/skin/chat-surface/index.css",
  "presentation/components/skin/collection-header/index.css",
  "presentation/components/skin/collection-workspace-render-dispatch/index.css",
  "presentation/components/skin/collection-workspace/index.css",
  "presentation/components/skin/command-center/index.css",
  "presentation/components/skin/compare/index.css",
  "presentation/components/skin/dashboard-header/index.css",
  "presentation/components/skin/dashboard/index.css",
  "presentation/components/skin/decision-inbox/index.css",
  "presentation/components/skin/detail-form-surface/index.css",
  "presentation/components/skin/detail-header/index.css",
  "presentation/components/skin/edit-fields/index.css",
  "presentation/components/skin/edit-header/index.css",
  "presentation/components/skin/editor-surface/index.css",
  "presentation/components/skin/empty-state-surface/index.css",
  "presentation/components/skin/field-filters-panel/index.css",
  "presentation/components/skin/file-browser/index.css",
  "presentation/components/skin/form-header/index.css",
  "presentation/components/skin/form-sections/index.css",
  "presentation/components/skin/form-surface/index.css",
  "presentation/components/skin/guided-draft-form/index.css",
  "presentation/components/skin/import-export/index.css",
  "presentation/components/skin/integration/index.css",
  "presentation/components/skin/kanban-surface/index.css",
  "presentation/components/skin/layout-header/index.css",
  "presentation/components/skin/layout-sidebar/index.css",
  "presentation/components/skin/list/index.css",
  "presentation/components/skin/marketing-surface/index.css",
  "presentation/components/skin/media-surface/index.css",
  "presentation/components/skin/mobile-header/index.css",
  "presentation/components/skin/notification-surface/index.css",
  "presentation/components/skin/operational-surface/index.css",
  "presentation/components/skin/pricing-surface/index.css",
  "presentation/components/skin/record-workbench/index.css",
  "presentation/components/skin/record/index.css",
  "presentation/components/skin/report/index.css",
  "presentation/components/skin/saved-views-menu/index.css",
  "presentation/components/skin/scheduler-surface/index.css",
  "presentation/components/skin/scope-switcher/index.css",
  "presentation/components/skin/search-command-bar/index.css",
  "presentation/components/skin/search/index.css",
  "presentation/components/skin/selection-preview-rail/index.css",
  "presentation/components/skin/settings/index.css",
  "presentation/components/skin/surface-section-card/index.css",
  "presentation/components/skin/surface-states/index.css",
  "presentation/components/skin/team/index.css",
  "presentation/components/skin/view-mode-switcher/index.css",
  "presentation/components/skin/visualization/index.css",
  "presentation/components/skin/wizard-surface/index.css",
];

/**
 * Emptied by WO-CAN-03: `foundation/responsive/index.css` was F-95's first
 * target and its header now states the real rank. The group is kept so the
 * claim shape stays named and a reappearance lands somewhere obvious.
 */
const TENANT_OVERRIDE_HEADER_DEBT = [];

const UNLAYERED_HEADER_DEBT = [
  "presentation/components/skin/activity-cards/index.css",
  "presentation/components/skin/activity-compact/index.css",
  "presentation/components/skin/activity-ticker/index.css",
  "presentation/components/skin/activity-timeline/index.css",
  "presentation/components/skin/adaptive-overlay/index.css",
  "presentation/components/skin/alert-compounds/index.css",
  "presentation/components/skin/app-shell/index.css",
  "presentation/components/skin/assistant/index.css",
  "presentation/components/skin/avatar-compounds/index.css",
  "presentation/components/skin/bottom-tab-bar/index.css",
  "presentation/components/skin/branding-preview-sandbox/index.css",
  "presentation/components/skin/breadcrumb-compounds/index.css",
  "presentation/components/skin/bulk-select-toggle/index.css",
  "presentation/components/skin/carousel-compounds/index.css",
  "presentation/components/skin/chart-area/index.css",
  "presentation/components/skin/chart-bar/index.css",
  "presentation/components/skin/chart-bullet/index.css",
  "presentation/components/skin/chart-c/index.css",
  "presentation/components/skin/chart-calendar-heatmap/index.css",
  "presentation/components/skin/chart-gantt/index.css",
  "presentation/components/skin/chart-heatmap/index.css",
  "presentation/components/skin/chart-line/index.css",
  "presentation/components/skin/chart-pie/index.css",
  "presentation/components/skin/chart-radar/index.css",
  "presentation/components/skin/chart-treemap/index.css",
  "presentation/components/skin/chart-waterfall/index.css",
  "presentation/components/skin/checkbox-group/index.css",
  "presentation/components/skin/data-table-mobile/index.css",
  "presentation/components/skin/data-terminal-card/index.css",
  "presentation/components/skin/drawer-compounds/index.css",
  "presentation/components/skin/gallery-view/index.css",
  "presentation/components/skin/image-compounds/index.css",
  "presentation/components/skin/layout-primitives/index.css",
  "presentation/components/skin/loading-overlay/index.css",
  "presentation/components/skin/menu-compounds/index.css",
  "presentation/components/skin/metrics-cards/index.css",
  "presentation/components/skin/metrics-chart/index.css",
  "presentation/components/skin/metrics-minimal/index.css",
  "presentation/components/skin/metrics-rows/index.css",
  "presentation/components/skin/modal-compounds/index.css",
  "presentation/components/skin/overlay-modal-compounds/index.css",
  "presentation/components/skin/presence/index.css",
  "presentation/components/skin/profile/index.css",
  "presentation/components/skin/progress-compounds/index.css",
  "presentation/components/skin/radio-group/index.css",
  "presentation/components/skin/select-compounds/index.css",
  "presentation/components/skin/skeleton-compounds/index.css",
  "presentation/components/skin/statistic-compounds/index.css",
  "presentation/components/skin/stats-header/index.css",
  "presentation/components/skin/status-filter-pills/index.css",
  "presentation/components/skin/stepper-compounds/index.css",
  "presentation/components/skin/toast-compounds/index.css",
  "presentation/components/skin/token-inspector/index.css",
  "presentation/components/skin/tooltip-compounds/index.css",
  "presentation/components/skin/voice-input-button/index.css",
];

/**
 * Rustic is a FROZEN engine: Modern is the sole productive engine, and the
 * WO-CAN-03 write set may correct engine headers only where the correction is
 * also the engine being maintained. These 110 headers make the same false
 * "deliberately unlayered" claim the Modern set made -- every one of them is
 * imported into `layer(rottay-engines)` by `base/index.css` -- and the
 * correction is deferred rather than smuggled into a frozen tree.
 *
 * Decrease-only like every other group here: correcting one of these files
 * without removing its row is a gate failure, so the freeze cannot quietly
 * become permanent.
 */
const FROZEN_ENGINE_HEADER_DEBT = [
  "runtime/engines/rustic/skin/activity-log/index.css",
  "runtime/engines/rustic/skin/affix/index.css",
  "runtime/engines/rustic/skin/alert-dialog/index.css",
  "runtime/engines/rustic/skin/alert/index.css",
  "runtime/engines/rustic/skin/anchor/index.css",
  "runtime/engines/rustic/skin/approval-workflow/index.css",
  "runtime/engines/rustic/skin/autocomplete/index.css",
  "runtime/engines/rustic/skin/avatar/index.css",
  "runtime/engines/rustic/skin/back-top/index.css",
  "runtime/engines/rustic/skin/badge/index.css",
  "runtime/engines/rustic/skin/breadcrumb/index.css",
  "runtime/engines/rustic/skin/button/index.css",
  "runtime/engines/rustic/skin/calendar/index.css",
  "runtime/engines/rustic/skin/callout/index.css",
  "runtime/engines/rustic/skin/card/index.css",
  "runtime/engines/rustic/skin/carousel/index.css",
  "runtime/engines/rustic/skin/cascader/index.css",
  "runtime/engines/rustic/skin/checkbox/index.css",
  "runtime/engines/rustic/skin/collapse/index.css",
  "runtime/engines/rustic/skin/color-picker/index.css",
  "runtime/engines/rustic/skin/command-palette/index.css",
  "runtime/engines/rustic/skin/comment-thread/index.css",
  "runtime/engines/rustic/skin/confirm-dialog/index.css",
  "runtime/engines/rustic/skin/context-menu/index.css",
  "runtime/engines/rustic/skin/data-table/index.css",
  "runtime/engines/rustic/skin/date-picker/index.css",
  "runtime/engines/rustic/skin/descriptions/index.css",
  "runtime/engines/rustic/skin/detail-panel/index.css",
  "runtime/engines/rustic/skin/drawer/index.css",
  "runtime/engines/rustic/skin/dropdown/index.css",
  "runtime/engines/rustic/skin/empty-state/index.css",
  "runtime/engines/rustic/skin/empty/index.css",
  "runtime/engines/rustic/skin/environment-toggle/index.css",
  "runtime/engines/rustic/skin/file-manager/index.css",
  "runtime/engines/rustic/skin/filter-builder/index.css",
  "runtime/engines/rustic/skin/filter-panel/index.css",
  "runtime/engines/rustic/skin/float-button/index.css",
  "runtime/engines/rustic/skin/form-builder/index.css",
  "runtime/engines/rustic/skin/form-field/index.css",
  "runtime/engines/rustic/skin/form/index.css",
  "runtime/engines/rustic/skin/hover-card/index.css",
  "runtime/engines/rustic/skin/image/index.css",
  "runtime/engines/rustic/skin/input-number/index.css",
  "runtime/engines/rustic/skin/input-residual/index.css",
  "runtime/engines/rustic/skin/input/index.css",
  "runtime/engines/rustic/skin/invoice-template/index.css",
  "runtime/engines/rustic/skin/kbd/index.css",
  "runtime/engines/rustic/skin/layout/index.css",
  "runtime/engines/rustic/skin/link/index.css",
  "runtime/engines/rustic/skin/list/index.css",
  "runtime/engines/rustic/skin/live-feed/index.css",
  "runtime/engines/rustic/skin/locale-switcher/index.css",
  "runtime/engines/rustic/skin/mentions/index.css",
  "runtime/engines/rustic/skin/menu/index.css",
  "runtime/engines/rustic/skin/message/index.css",
  "runtime/engines/rustic/skin/modal/index.css",
  "runtime/engines/rustic/skin/notification-center/index.css",
  "runtime/engines/rustic/skin/notification/index.css",
  "runtime/engines/rustic/skin/otp-input/index.css",
  "runtime/engines/rustic/skin/page-shell/index.css",
  "runtime/engines/rustic/skin/pagination/index.css",
  "runtime/engines/rustic/skin/password-input/index.css",
  "runtime/engines/rustic/skin/pattern-calendar-view/index.css",
  "runtime/engines/rustic/skin/pattern-kanban-board/index.css",
  "runtime/engines/rustic/skin/pattern-map-view/index.css",
  "runtime/engines/rustic/skin/pattern-timeline/index.css",
  "runtime/engines/rustic/skin/pattern-tree-view/index.css",
  "runtime/engines/rustic/skin/popconfirm/index.css",
  "runtime/engines/rustic/skin/popover/index.css",
  "runtime/engines/rustic/skin/pricing-table/index.css",
  "runtime/engines/rustic/skin/progress/index.css",
  "runtime/engines/rustic/skin/qrcode/index.css",
  "runtime/engines/rustic/skin/radio/index.css",
  "runtime/engines/rustic/skin/rate/index.css",
  "runtime/engines/rustic/skin/result/index.css",
  "runtime/engines/rustic/skin/saved-views/index.css",
  "runtime/engines/rustic/skin/segmented/index.css",
  "runtime/engines/rustic/skin/select/index.css",
  "runtime/engines/rustic/skin/sheet/index.css",
  "runtime/engines/rustic/skin/shortcuts-overlay/index.css",
  "runtime/engines/rustic/skin/skeleton/index.css",
  "runtime/engines/rustic/skin/slider/index.css",
  "runtime/engines/rustic/skin/spinner/index.css",
  "runtime/engines/rustic/skin/splitter/index.css",
  "runtime/engines/rustic/skin/statistic/index.css",
  "runtime/engines/rustic/skin/stats-grid/index.css",
  "runtime/engines/rustic/skin/step-wizard/index.css",
  "runtime/engines/rustic/skin/stepper/index.css",
  "runtime/engines/rustic/skin/steps/index.css",
  "runtime/engines/rustic/skin/switch/index.css",
  "runtime/engines/rustic/skin/table/index.css",
  "runtime/engines/rustic/skin/tabs/index.css",
  "runtime/engines/rustic/skin/tag-input/index.css",
  "runtime/engines/rustic/skin/tag/index.css",
  "runtime/engines/rustic/skin/tenant-preview/index.css",
  "runtime/engines/rustic/skin/textarea/index.css",
  "runtime/engines/rustic/skin/time-picker/index.css",
  "runtime/engines/rustic/skin/timeline/index.css",
  "runtime/engines/rustic/skin/toast/index.css",
  "runtime/engines/rustic/skin/toggle/index.css",
  "runtime/engines/rustic/skin/tooltip/index.css",
  "runtime/engines/rustic/skin/tour/index.css",
  "runtime/engines/rustic/skin/transfer/index.css",
  "runtime/engines/rustic/skin/tree-select/index.css",
  "runtime/engines/rustic/skin/tree/index.css",
  "runtime/engines/rustic/skin/typography/index.css",
  "runtime/engines/rustic/skin/upload/index.css",
  "runtime/engines/rustic/skin/user-profile-card/index.css",
  "runtime/engines/rustic/skin/watermark/index.css",
  "runtime/engines/rustic/skin/workspace-switcher/index.css",
];

export const HEADER_CLAIM_DEBT = new Map([
  ...WRONG_LAYER_HEADER_DEBT.map((rel) => [
    rel,
    "retiered to its owning family's tier by WO-CAN-03; the header still describes the old cascade position",
  ]),
  ...UNLAYERED_HEADER_DEBT.map((rel) => [
    rel,
    "pre-existing false 'deliberately unlayered' header (F-16 class)",
  ]),
  ...TENANT_OVERRIDE_HEADER_DEBT.map((rel) => [
    rel,
    "pre-existing false 'outranks the tenant artifact' header (F-95)",
  ]),
  ...FROZEN_ENGINE_HEADER_DEBT.map((rel) => [
    rel,
    "false 'deliberately unlayered' header in the FROZEN rustic engine; Modern is the sole productive engine",
  ]),
]);

export function auditHeaderLayerClaims({
  cssRoot = CSS_ROOT,
  entrypoints: entries,
  debt = HEADER_CLAIM_DEBT,
} = {}) {
  const failures = [];
  const entrypointDir = resolve(cssRoot, "facade/entrypoints");
  const roots = entries ?? discoverEntrypoints(entrypointDir);

  // Effective layer of every first-party file, taken from the import that
  // pulls it in. A file reached through an unlayered import is unlayered.
  const layerOf = new Map();
  const visit = (file, inheritedLayer) => {
    const rel = relative(cssRoot, file).replaceAll("\\", "/");
    if (layerOf.has(rel)) return;
    if (!existsSync(file)) return;
    layerOf.set(rel, inheritedLayer);
    for (const match of readFileSync(file, "utf8").matchAll(IMPORT_RE)) {
      if (!match[2].startsWith(".")) continue;
      visit(resolve(dirname(file), match[2]), match[3]?.trim() || inheritedLayer);
    }
  };
  for (const root of roots) visit(root, null);

  const seen = new Set();
  for (const [rel, layer] of layerOf) {
    if (rel.startsWith("facade/entrypoints/") || rel.startsWith("facade/artifacts/")) {
      continue;
    }
    const file = resolve(cssRoot, rel);
    const header = readFileSync(file, "utf8").match(/^\/\*[\s\S]*?\*\//);
    if (!header) continue;
    const text = header[0];

    const problems = [];
    if (layer && UNLAYERED_CLAIM_RE.test(text)) {
      problems.push(`claims "deliberately unlayered" but is imported into layer(${layer})`);
    }
    if (layer && BEATS_TENANT_CLAIM_RE.test(text)) {
      problems.push(
        `claims it outranks the tenant artifact but is imported into layer(${layer}), which unlayered tenant paint beats`
      );
    }
    const claimed = ownLayerClaim(text);
    if (claimed && claimed !== layer) {
      problems.push(
        `claims layer(${claimed}) but is imported into ${
          layer ? `layer(${layer})` : "no layer"
        }`
      );
    }

    const declared = debt.get(rel);
    if (problems.length === 0) {
      if (declared) {
        failures.push(
          `stale header-claim debt: ${rel} no longer mismatches; remove it from HEADER_CLAIM_DEBT`
        );
      }
      continue;
    }
    seen.add(rel);
    if (declared) continue;
    failures.push(`${rel}: ${problems[0]}`);
  }
  for (const rel of debt.keys()) {
    if (!seen.has(rel) && !layerOf.has(rel)) {
      failures.push(`stale header-claim debt: ${rel} is not reachable from any entrypoint`);
    }
  }
  return failures;
}

/**
 * The reason structures and surfaces reached for `style={{ }}` was mechanical:
 * their skins sat in `rottay-components`, BELOW `rottay-engines`, so the only
 * way a higher tier could win a channel an engine skin painted was to escape
 * the cascade entirely (F-16 -> F-64). With the tier layers above the engine
 * layer that escape is no longer necessary, so the census is pinned here and
 * is decrease-only. The drain itself belongs to WO-FAM-10/11; this counter
 * exists so it cannot silently grow back in the meantime.
 *
 * Production TSX only: tests, stories and fixtures build throwaway scenes and
 * are not paint the DS ships.
 */
export const INLINE_STYLE_ESCAPE_CEILINGS = new Map([
  ["structures", 158],
  // 24 -> 23 (WO-CAN-04): the `oauth-transition` surface left the package with
  // its inline escape. Decrease-only, and the gate refuses a ceiling that sits
  // above the measurement, so this is lowered rather than left slack.
  ["surfaces", 23],
]);

const INLINE_STYLE_RE = /style=\{\{/g;

export function countInlineStyleEscapes(tier, { componentsRoot } = {}) {
  const root = resolve(
    componentsRoot ?? resolve(packageRoot, "src/components"),
    tier
  );
  if (!existsSync(root)) return 0;
  let total = 0;
  const walk = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = resolve(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name === "tests" || entry.name === "__tests__") continue;
        walk(full);
        continue;
      }
      if (!entry.name.endsWith(".tsx")) continue;
      if (/\.(?:test|stories)\.tsx$/.test(entry.name)) continue;
      total += (readFileSync(full, "utf8").match(INLINE_STYLE_RE) ?? []).length;
    }
  };
  walk(root);
  return total;
}

export function auditInlineStyleEscapes(options = {}) {
  const failures = [];
  for (const [tier, ceiling] of INLINE_STYLE_ESCAPE_CEILINGS) {
    const measured = countInlineStyleEscapes(tier, options);
    if (measured > ceiling) {
      failures.push(
        `${tier}: ${measured} inline style escapes, ceiling ${ceiling}. The tier layers already win over engine paint; move the channel into the skin instead of escaping the cascade.`
      );
    }
    if (measured < ceiling) {
      failures.push(
        `${tier}: ${measured} inline style escapes, below the ceiling ${ceiling}. Lower INLINE_STYLE_ESCAPE_CEILINGS to ${measured} so the ratchet keeps its teeth.`
      );
    }
  }
  return failures;
}

// Importable: the audits above are exported for drills, so the CLI body only
// runs when this file IS the process entry.
const isCli =
  process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);

const failures = !isCli
  ? []
  : entrypoints.flatMap((entry) =>
      auditCascadeEntrypoint(entry, { resolveImports: entryArgs.length === 0 }).map(
        (failure) => `${entry}: ${failure}`
      )
    );
if (isCli) {
  failures.push(
    ...auditModernThemeOwnership().map(
      (failure) => `modern-theme-ownership: ${failure}`
    )
  );
  // Reachability, parity and header claims are properties of the real tree, so
  // they are skipped when the caller pointed --entry at a synthetic fixture.
  if (entryArgs.length === 0) {
    failures.push(
      ...auditGovernedFilesAreReachable().map(
        (failure) => `both-halves-ship: ${failure}`
      )
    );
    failures.push(
      ...auditSingleEntrypoint().map((failure) => `single-entrypoint: ${failure}`)
    );
    failures.push(
      ...auditHeaderLayerClaims().map((failure) => `header-layer-claim: ${failure}`)
    );
    failures.push(
      ...auditInlineStyleEscapes().map(
        (failure) => `inline-style-escape: ${failure}`
      )
    );
  }
}

if (isCli && failures.length > 0) {
  console.error(
    `css-layer-paint-gate: FAIL\n${failures
      .map((failure) => `- ${failure}`)
      .join("\n")}`
  );
  process.exit(1);
}

if (isCli && args.includes("--tier-census")) {
  const rows = skinTierCensus();
  const mismatched = rows.filter((row) => row.bound !== row.tier);
  const markerDisagrees = rows.filter((row) => row.marker && row.marker !== row.tier);
  console.log(JSON.stringify({ total: rows.length, mismatched, markerDisagrees, rows }, null, 2));
}

if (isCli) {
  console.log(
    `css-layer-paint-gate: PASS (${entrypoints.length} entrypoint${
      entrypoints.length === 1 ? "" : "s"
    })`
  );
}
