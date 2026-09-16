/**
 * The five measured reads, and nothing else.
 *
 * Each function below answers one node or edge kind from ONE source. None of
 * them falls back to another source when the first is silent: a silent source
 * means the fact was not measured, and the graph omits the row rather than
 * guessing it. That is the whole difference between this and the manifest it
 * replaces.
 */
import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, relative } from "node:path";
import { pathToFileURL } from "node:url";

import { buildEdges, serialize } from "../../check/modern-rescue/cascade/extraction/index.mjs";

export const VERTICALS = Object.freeze(["bithire", "evnto", "rottay"]);

const SKIN_ROOTS = Object.freeze([
  "src/foundation/tokens/css/runtime/engines/modern/skin",
  "src/foundation/tokens/css/presentation/components/skin",
]);
const COMPONENT_ROOT = "src/components";
const DERIVATION_ROOT =
  "src/infrastructure/compilers/runtime/theme/runtime/lowering/runtime/derivation";
const CASCADE_EDGES = "artifacts/generated/manifest/cascade/edges/index.json";
const CSS_ROOT = "src/foundation/tokens/css";
const CSS_ROOT_REL = "packages/core/src/foundation/tokens/css";

export const sha256 = (text) => createHash("sha256").update(text).digest("hex");

/** The built door. Its freshness is the caller's assertion, never assumed here. */
async function loadDist(root) {
  const at = (relativePath) => import(pathToFileURL(join(root, relativePath)).href);
  const [server, pipeline, derivation, catalog] = await Promise.all([
    at("dist/server.js"),
    at("dist/infrastructure/compilers/runtime/theme/runtime/lowering/runtime/pipeline/index.js"),
    at("dist/infrastructure/compilers/runtime/theme/runtime/lowering/runtime/derivation/index.js"),
    at("dist/contracts/theme/runtime/catalog/index.js"),
  ]);
  return { server, pipeline, derivation, catalog };
}

/**
 * Expand a catalog keypath into the concrete keypaths it names.
 *
 * `palette.{primaryColor,secondaryColor,accentColor,backgroundColor}` is one row
 * governing four leaves, and the derivers name the leaves. Expanding here is
 * reading the catalog's own notation, not inventing a mapping.
 */
export function expandKeypath(keypath) {
  const brace = keypath.match(/^(.*)\{([^}]*)\}(.*)$/);
  if (!brace) return [keypath];
  return brace[2].split(",").map((part) => `${brace[1]}${part.trim()}${brace[3]}`);
}

/**
 * DECISION nodes: the typed catalog, the one authored list in the chain.
 *
 * `keypath.brandTheme` travels with the row because it is the ONLY measured join
 * to the derivers: a deriver declares what it consumes in FlatTheme keypaths
 * (`surfaces.radiusScale`), never in control ids (`shape.radius-scale`). Joining
 * the two id vocabularies directly reported eleven decisions as moving nothing,
 * which was the join being wrong rather than the compiler being inert.
 */
export function decisionNodes(catalog) {
  return catalog.THEME_CONTROL_CATALOG.map((row) => ({
    kind: "decision",
    id: row.id,
    tier: row.tier,
    group: row.group,
    domain: row.domain.kind,
    keypaths: expandKeypath(row.keypath.brandTheme).sort(),
  })).sort((a, b) => a.id.localeCompare(b.id));
}

/**
 * DERIVER nodes: the registry the compiler iterates.
 *
 * The file is RESOLVED from the family against the derivation tree rather than
 * declared on the deriver, so a deriver that moves house moves here too. A
 * family with no folder of its own is a deriver declared inline in a group
 * index; it keeps the group's file, which is where it really lives.
 */
export function deriverNodes(derivation, root) {
  const base = join(root, DERIVATION_ROOT);
  const groups = readdirSync(base, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);
  const chromeBase = join(base, "chrome");
  const chrome = existsSync(chromeBase)
    ? readdirSync(chromeBase, { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => e.name)
    : [];

  return derivation.FAMILY_DERIVERS.map((deriver) => {
    const file = chrome.includes(deriver.family)
      ? `${DERIVATION_ROOT}/chrome/${deriver.family}/index.ts`
      : groups.includes(deriver.family)
        ? `${DERIVATION_ROOT}/${deriver.family}/index.ts`
        : `${DERIVATION_ROOT}/index.ts`;
    return {
      kind: "deriver",
      id: deriver.family,
      family: deriver.family,
      rank: deriver.rank,
      consumes: [...deriver.consumes].sort(),
      file,
    };
  }).sort((a, b) => a.id.localeCompare(b.id));
}

/**
 * The dry-run: 3 verticals x 2 modes, through the real pipeline.
 *
 * `runDerivation` returns its own `provenance` map, so which family produced a
 * channel is the COMPILER's answer. Reading `produces` instead would publish an
 * authored pattern as if it were a measurement, which is exactly the substitution
 * F-04 found in the manifest.
 */
export function dryRun({ server, pipeline }) {
  const producedBy = new Map();
  const blocks = [];
  for (const vertical of VERTICALS) {
    const compiled = server.compileThemeIntent(server.staticThemeIntent(vertical));
    const theme = compiled.resolution.theme;
    const base = compiled.compiled.colorScheme;
    const overlays = compiled.compiled.modeBlocks.map((block) => block.mode);
    const runs = [
      { mode: base, request: { theme } },
      ...overlays.map((mode) => ({ mode, request: { theme, mode, modePrefix: `modes.${mode}.` } })),
    ];
    for (const { mode, request } of runs) {
      const result = pipeline.runDerivation(pipeline.buildLoweringContext(request));
      for (const [channel, provenance] of result.provenance) {
        if (!producedBy.has(channel)) producedBy.set(channel, new Map());
        const ranks = producedBy.get(channel);
        if (!ranks.has(provenance.family)) ranks.set(provenance.family, new Set());
        ranks.get(provenance.family).add(provenance.rank);
      }
      blocks.push({ vertical, mode, channels: Object.keys(result.channels).length });
    }
  }
  return { producedBy, blocks: blocks.sort((a, b) => `${a.vertical}/${a.mode}`.localeCompare(`${b.vertical}/${b.mode}`)) };
}

/** CHANNEL nodes: every name the dry-run emitted, with the families that produced it. */
export function channelNodes(producedBy) {
  return [...producedBy.entries()]
    .map(([name, families]) => ({
      kind: "channel",
      name,
      producedBy: [...families.keys()].sort(),
      ranks: [...new Set([...families.values()].flatMap((set) => [...set]))].sort(),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

/** The committed read census. Its own digest travels with the graph as provenance. */
export function readCascade(root) {
  const path = join(root, CASCADE_EDGES);
  if (!existsSync(path)) {
    throw new Error(`theme-graph: ${CASCADE_EDGES} is missing -- run cascade:extract --write`);
  }
  const text = readFileSync(path, "utf8");
  return { document: JSON.parse(text), digest: sha256(text) };
}

/**
 * The read census measured from the CSS source by the extractor that owns it,
 * serialized exactly as that extractor commits it.
 */
export function measureCascade(root, { cssRoot = join(root, CSS_ROOT) } = {}) {
  const text = serialize(buildEdges({ cssRoot, cssRootRel: CSS_ROOT_REL }));
  return { document: JSON.parse(text), digest: sha256(text) };
}

/** Is the committed census the one the skin source measures today? Read-only. */
export function cascadeDrift(committed, measured) {
  if (committed.digest === measured.digest) return [];
  const had = new Set(committed.document.readSites.map((site) => site.readSiteId));
  const has = new Set(measured.document.readSites.map((site) => site.readSiteId));
  const lost = [...had].filter((id) => !has.has(id)).length;
  const gained = [...has].filter((id) => !had.has(id)).length;
  return [
    `${CASCADE_EDGES} is stale against the CSS source (read-site ids -${lost} +${gained}, `
    + `committed ${committed.digest.slice(0, 12)}, source ${measured.digest.slice(0, 12)}) -- `
    + "run cascade:extract --write, then ds:derive",
  ];
}

/**
 * FAMILY nodes: the skin tree on disk, with the component tier that owns each one.
 *
 * The tier is read from where the component actually sits, so it cannot disagree
 * with the tree. A skin whose family has no component folder is emitted with no
 * tier field at all rather than a placeholder one.
 */
export function familyNodes(root) {
  const tiers = new Map();
  const componentBase = join(root, COMPONENT_ROOT);
  for (const tier of ["primitives", "patterns", "structures", "surfaces"]) {
    const tierBase = join(componentBase, tier);
    if (!existsSync(tierBase)) continue;
    for (const group of readdirSync(tierBase, { withFileTypes: true }).filter((e) => e.isDirectory())) {
      for (const family of readdirSync(join(tierBase, group.name), { withFileTypes: true }).filter((e) => e.isDirectory())) {
        if (!tiers.has(family.name)) tiers.set(family.name, tier.replace(/s$/, ""));
      }
    }
  }
  const families = new Set();
  for (const skinRoot of SKIN_ROOTS) {
    const base = join(root, skinRoot);
    if (!existsSync(base)) continue;
    for (const entry of readdirSync(base, { withFileTypes: true })) {
      if (entry.isDirectory()) families.add(entry.name);
    }
  }
  return [...families].sort().map((id) => {
    const tier = tiers.get(id);
    return tier === undefined ? { kind: "family", id } : { kind: "family", id, tier };
  });
}

/** The family a consumer file paints, read from its own path. No path, no edge. */
export function familyOfFile(file) {
  for (const skinRoot of SKIN_ROOTS) {
    const marker = `${skinRoot}/`;
    const at = file.indexOf(marker);
    if (at !== -1) return file.slice(at + marker.length).split("/")[0].replace(/\.css$/, "");
  }
  const component = file.match(/src\/components\/(?:primitives|patterns|structures|surfaces)\/[^/]+\/([^/]+)\//);
  return component ? component[1] : undefined;
}

export { CASCADE_EDGES, CSS_ROOT, CSS_ROOT_REL, DERIVATION_ROOT, SKIN_ROOTS };
