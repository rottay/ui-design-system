#!/usr/bin/env node
/**
 * application-boundary-gate — private-anatomy sub-gate for cross-repository
 * application styling (DS-Q006 of the design-platform program).
 *
 * This gate does NOT prove the complete application boundary by itself. It
 * prevents growth in six deterministic categories and declares the missing
 * i18n-bypass detector explicitly. Each category is counted independently so
 * a broad heuristic cannot be mistaken for complete architecture proof.
 *
 * A "reach" is an application stylesheet selector that addresses DS-internal
 * anatomy the public contract does not offer for styling:
 *   - engine class anatomy: `.rottay-<family>` and `.rottay-<family>--<variant>`;
 *   - part anatomy: `[data-part=...]` selectors qualified by a DS class;
 *   - DS skin BEM anatomy: `.ds-<x>__<y>` ONLY when the block matches a class
 *     the DS itself ships (application-local `.ds-*` BEM conventions are the
 *     app's own vocabulary and are deliberately NOT counted — a naive `.ds-`
 *     regex overcounts ~58x against genuine reaches).
 *
 * The checked-in baseline records existing debt with owner and removal reason.
 * Removing debt is always green; any new reach fails `--check`. The baseline
 * is decrease-only: this script refuses to add entries; a genuinely new
 * permanent exception requires editing the baseline in review with a reason.
 */
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { packageRoot as findPackageRoot } from '../../../../libraries/repo-root/index.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const CORE_ROOT = findPackageRoot(HERE);
const BASELINE_PATH = join(HERE, "baseline/index.json");
const OBLIGATIONS_PATH = join(HERE, "obligations/index.json");

function argValue(flag) {
  const index = process.argv.indexOf(flag);
  return index >= 0 && process.argv[index + 1] ? process.argv[index + 1] : null;
}

/**
 * CORPUS RESOLUTION, FAIL-CLOSED.
 *
 * This gate hardcoded a sibling-of-workspace path and never read
 * `APP_BITHIRE_ROOT`, the variable `ci.yml` exports for exactly this purpose.
 * On a runner that path does not exist, and `if (!existsSync(root)) continue`
 * emptied all six censuses -- so the gate printed "tighten opportunity: 56" and
 * exited 0. It has never run against a corpus in CI.
 *
 * Precedence is the one already reviewed in
 * `boundaries/applications/styles/index.mjs`: `--app-root` > `APP_BITHIRE_ROOT`
 * > sibling of the workspace. An explicit-but-broken root fails; it never falls
 * back, because a fallback is how a gate ends up auditing the wrong tree.
 */
const nonEmpty = (value) => (typeof value === "string" && value.trim() !== "" ? value : null);
const APP_BITHIRE_ROOT = resolve(
  nonEmpty(argValue("--app-root"))
    ?? nonEmpty(process.env.APP_BITHIRE_ROOT)
    ?? resolve(CORE_ROOT, "../../../app-bithire"),
);

/** Stable logical prefix for baseline keys, independent of where the corpus is mounted. */
const CORPUS_KEY_PREFIX = "app-bithire";

/** Sibling application repositories scanned by this gate (gat-09 precedent). */
const APPLICATIONS = {
  [CORPUS_KEY_PREFIX]: join(APP_BITHIRE_ROOT, "src"),
};

/** DS-shipped class anatomy detectable in application selectors. */
const ENGINE_CLASS_PATTERN = /\.rottay-[a-z0-9-]+/g;
// `[data-part=...]` is deliberately NOT a reach: the public styling contract
// documents data-part hooks for scoped application styling (CLAUDE.md,
// application styling boundary). Only class anatomy is private.

/**
 * DS skin BEM blocks actually shipped by the package. Derived from the DS
 * skin sources at run time so the census cannot drift from reality.
 */
function collectDsBemBlocks() {
  const roots = [
    join(CORE_ROOT, "src/foundation/tokens/css/presentation/components"),
    join(CORE_ROOT, "src/foundation/tokens/css/runtime/engines/modern/skin"),
  ];
  const blocks = new Set();
  for (const root of roots) {
    if (!existsSync(root)) continue;
    for (const file of cssFiles(root)) {
      const source = stripCssComments(readFileSync(file, "utf8"));
      for (const match of source.matchAll(/\.(ds-[a-z0-9-]+)__/g)) {
        blocks.add(match[1]);
      }
    }
  }
  return blocks;
}

export function stripCssComments(source) {
  return source.replace(/\/\*[\s\S]*?\*\//g, "");
}

function* cssFiles(root) {
  for (const entry of readdirSync(root)) {
    const absolute = join(root, entry);
    const info = statSync(absolute);
    if (info.isDirectory()) {
      if (entry === "node_modules" || entry.startsWith(".")) continue;
      yield* cssFiles(absolute);
    } else if (entry.endsWith(".css")) {
      yield absolute;
    }
  }
}

export function censusApplicationReaches() {
  const dsBemBlocks = collectDsBemBlocks();
  const reaches = [];
  for (const [application, root] of Object.entries(APPLICATIONS)) {
    if (!existsSync(root)) continue;
    for (const file of cssFiles(root)) {
      const source = stripCssComments(readFileSync(file, "utf8"));
      const relativeFile = `${application}/${relative(resolve(root, ".."), file)}`;
      for (const match of source.matchAll(ENGINE_CLASS_PATTERN)) {
        reaches.push({ id: `${relativeFile} :: ${match[0]}`, kind: "engine-class" });
      }
      for (const match of source.matchAll(/\.(ds-[a-z0-9-]+)__/g)) {
        if (dsBemBlocks.has(match[1])) {
          reaches.push({
            id: `${relativeFile} :: .${match[1]}__`,
            kind: "ds-bem",
          });
        }
      }
    }
  }
  const counted = new Map();
  for (const reach of reaches) {
    counted.set(reach.id, (counted.get(reach.id) ?? 0) + 1);
  }
  return counted;
}

function loadBaseline() {
  return JSON.parse(readFileSync(BASELINE_PATH, "utf8"));
}

// ---------------------------------------------------------------------------
// OLA 5 Phase 1 — additional executable boundary categories. Each category is
// censused, reported and baselined SEPARATELY so the output states exactly
// what it proves. Together with the private-anatomy census above they remain a
// PARTIAL DS-Q006 boundary: `i18n-bypass` is declared but not implemented
// because no deterministic cross-repo detector for the app i18n contract
// exists in this repository yet.
// ---------------------------------------------------------------------------

const SUPPLIER_PACKAGE_PATTERN =
  "(?:daisyui|tailwind-variants|@phosphor-icons(?:/react)?|antd|lucide-react)";
const SUPPLIER_IMPORT_PATTERN = new RegExp(
  `(?:from\\s+|import\\s*(?:\\(\\s*)?|require\\s*\\(\\s*)['"](${SUPPLIER_PACKAGE_PATTERN}(?:/[^'"]*)?)['"]`,
  "g"
);
const COLOR_LITERAL_PATTERN =
  /(?:#[0-9a-fA-F]{3,8}\b|\brgba?\(|\bhsla?\(|\boklch\()/g;
const RADIUS_LITERAL_PATTERN =
  /border-radius\s*:\s*[^;{}]*\b[0-9.]+(?:px|r?em)\b/g;
const RAW_DURATION_PATTERN =
  /(?:transition|animation)[a-z-]*\s*:[^;{}]*\b[0-9.]+m?s\b/g;
const DS_DECLARATION_PATTERN = /(--ds-[a-z0-9-]+)\s*:/g;
const NATIVE_INTERACTIVE_PATTERN = /<(?:button|input|select|textarea)\b/g;
const RAW_FONT_FAMILY_PATTERN = /font-family\s*:\s*([^;{}]+)/g;
const RAW_SHADOW_PATTERN = /(?:box|text)-shadow\s*:\s*([^;{}]+)/g;
const TENANT_STYLE_BRANCH_PATTERN =
  /\[(?:data-tenant|data-account-tenant|data-css-tenant)\s*=\s*["'][^"']+["']\]/g;

export function stripTsComments(source) {
  let output = "";
  let state = "code";

  for (let index = 0; index < source.length; index += 1) {
    const character = source[index];
    const next = source[index + 1];

    if (state === "line-comment") {
      if (character === "\n") {
        state = "code";
        output += "\n";
      } else {
        output += " ";
      }
      continue;
    }

    if (state === "block-comment") {
      if (character === "*" && next === "/") {
        output += "  ";
        index += 1;
        state = "code";
      } else {
        output += character === "\n" ? "\n" : " ";
      }
      continue;
    }

    if (state !== "code") {
      output += character;
      if (character === "\\") {
        if (next !== undefined) {
          output += next;
          index += 1;
        }
      } else if (character === state) {
        state = "code";
      }
      continue;
    }

    if (character === "/" && next === "/") {
      output += "  ";
      index += 1;
      state = "line-comment";
    } else if (character === "/" && next === "*") {
      output += "  ";
      index += 1;
      state = "block-comment";
    } else {
      output += character;
      if (character === "'" || character === '"' || character === "`") {
        state = character;
      }
    }
  }

  return output;
}

/**
 * Every `--ds-*` hook the package actually ships:
 *   - declarations and reads in production DS CSS (a documented component
 *     hook may intentionally be read with a fallback rather than declared);
 *   - compiler-emitted channel keys in production compiler source.
 *
 * Tests and docs are excluded so a negative assertion or aspirational name
 * cannot legalize an application write.
 */
function collectShippedDsNames() {
  const names = new Set();
  const visitCss = (root) => {
    for (const entry of readdirSync(root)) {
      const absolute = join(root, entry);
      if (statSync(absolute).isDirectory()) visitCss(absolute);
      else if (entry.endsWith(".css")) {
        const source = stripCssComments(readFileSync(absolute, "utf8"));
        for (const match of source.matchAll(/(--ds-[a-z0-9-]+)/g)) {
          names.add(match[1]);
        }
      }
    }
  };
  const cssRoot = join(CORE_ROOT, "src/foundation/tokens/css");
  if (existsSync(cssRoot)) visitCss(cssRoot);

  const compilerRoot = join(CORE_ROOT, "src/infrastructure/compilers");
  if (existsSync(compilerRoot)) {
    for (const file of filesUnder(compilerRoot, [".ts", ".tsx"])) {
      if (file.split(/[\\/]/).includes("tests")) continue;
      const source = stripTsComments(readFileSync(file, "utf8"));
      for (const match of source.matchAll(/["'`]((?:--ds-)[a-z0-9-]+)["'`]/g)) {
        names.add(match[1]);
      }
    }
  }
  return names;
}

function* filesUnder(root, extensions) {
  for (const entry of readdirSync(root)) {
    const absolute = join(root, entry);
    const info = statSync(absolute);
    if (info.isDirectory()) {
      if (entry === "node_modules" || entry.startsWith(".")) continue;
      yield* filesUnder(absolute, extensions);
    } else if (
      extensions.some((extension) => entry.endsWith(extension)) &&
      !/\.(?:test|spec|stories)\.[cm]?[jt]sx?$/.test(entry)
    ) {
      yield absolute;
    }
  }
}

function pushMatches(sites, file, source, pattern, transform = (m) => m[0]) {
  for (const match of source.matchAll(pattern)) {
    sites.push(`${file} :: ${transform(match)}`);
  }
}

function isSharedChromeFile(relativeFile) {
  return (
    relativeFile.startsWith("src/styles/") ||
    relativeFile.startsWith("src/components/") ||
    relativeFile.startsWith("src/ui/") ||
    relativeFile.startsWith("src/vertical/surface/") ||
    relativeFile.startsWith("src/features/_shared/")
  );
}

export function censusRawSharedChrome(source) {
  const sites = [];
  pushMatches(sites, "<fixture>", source, COLOR_LITERAL_PATTERN, (match) =>
    `color:${match[0].replace(/\($/, "")}`
  );
  pushMatches(
    sites,
    "<fixture>",
    source,
    RADIUS_LITERAL_PATTERN,
    () => "radius-literal"
  );
  pushMatches(
    sites,
    "<fixture>",
    source,
    RAW_DURATION_PATTERN,
    () => "raw-duration"
  );
  for (const match of source.matchAll(RAW_FONT_FAMILY_PATTERN)) {
    if (!match[1].trim().startsWith("var(")) {
      sites.push("<fixture> :: font-family-literal");
    }
  }
  for (const match of source.matchAll(RAW_SHADOW_PATTERN)) {
    if (!match[1].trim().startsWith("var(")) {
      sites.push("<fixture> :: shadow-literal");
    }
  }
  return sites.map((site) => site.replace("<fixture> :: ", ""));
}

export function censusNativeReconstructions(source) {
  return [...source.matchAll(NATIVE_INTERACTIVE_PATTERN)].map(
    (match) => match[0]
  );
}

export function censusSupplierImports(source) {
  return [...source.matchAll(SUPPLIER_IMPORT_PATTERN)].map(
    (match) => match[1]
  );
}

export function censusTenantStyleBranches(source) {
  return [...source.matchAll(TENANT_STYLE_BRANCH_PATTERN)].map(
    (match) => match[0]
  );
}

/**
 * Return the DS custom properties an application writes without a shipped DS
 * declaration/read. Kept pure so the decrease-only integration census has a
 * causal fixture: comments and known names may never hide an unknown write.
 */
export function censusUndocumentedDsWrites(source, shippedDsNames) {
  const uncommented = stripCssComments(source);
  return [...uncommented.matchAll(DS_DECLARATION_PATTERN)]
    .map((match) => match[1])
    .filter((property) => !shippedDsNames.has(property));
}

/** Census the OLA-5 boundary categories (excludes private-anatomy above). */
export function censusBoundaryCategories() {
  const shippedDsNames = collectShippedDsNames();
  const sites = {
    "native-reconstruction": [],
    "raw-shared-chrome-literals": [],
    "undocumented-ds-writes": [],
    "supplier-imports": [],
    "tenant-style-branch": [],
  };

  for (const [application, root] of Object.entries(APPLICATIONS)) {
    if (!existsSync(root)) continue;
    const appPrefix = resolve(root, "..");

    for (const file of cssFiles(root)) {
      const relativeFile = `${application}/${relative(appPrefix, file)}`;
      const applicationRelativeFile = relative(appPrefix, file);
      const source = stripCssComments(readFileSync(file, "utf8"));

      if (isSharedChromeFile(applicationRelativeFile)) {
        for (const signature of censusRawSharedChrome(source)) {
          sites["raw-shared-chrome-literals"].push(
            `${relativeFile} :: ${signature}`
          );
        }
      }

      for (const property of censusUndocumentedDsWrites(
        source,
        shippedDsNames
      )) {
        sites["undocumented-ds-writes"].push(
          `${relativeFile} :: ${property}`
        );
      }

      for (const signature of censusTenantStyleBranches(source)) {
        sites["tenant-style-branch"].push(
          `${relativeFile} :: ${signature}`
        );
      }
    }

    for (const file of filesUnder(root, [".tsx", ".jsx"])) {
      const relativeFile = `${application}/${relative(appPrefix, file)}`;
      const source = stripTsComments(readFileSync(file, "utf8"));
      for (const signature of censusNativeReconstructions(source)) {
        sites["native-reconstruction"].push(
          `${relativeFile} :: ${signature}`
        );
      }
    }

    for (const file of filesUnder(root, [".ts", ".tsx", ".js", ".jsx"])) {
      const relativeFile = `${application}/${relative(appPrefix, file)}`;
      const source = stripTsComments(readFileSync(file, "utf8"));
      for (const signature of censusSupplierImports(source)) {
        sites["supplier-imports"].push(
          `${relativeFile} :: ${signature}`
        );
      }
    }
  }

  const counted = {};
  for (const [category, list] of Object.entries(sites)) {
    const map = new Map();
    for (const site of list) map.set(site, (map.get(site) ?? 0) + 1);
    counted[category] = map;
  }
  return counted;
}

export function diffCensus(current, baselineEntries) {
  const known = new Map(Object.entries(baselineEntries ?? {}));
  const added = [];
  const grown = [];
  for (const [id, count] of current) {
    const entry = known.get(id);
    if (!entry) added.push({ id, count });
    else if (count > entry.count) grown.push({ id, from: entry.count, to: count });
  }
  const removed = [...known.keys()].filter((id) => !current.has(id));
  return { added, grown, removed };
}

function evaluateCategory(name, current, baselineEntries, failures) {
  const known = new Map(Object.entries(baselineEntries ?? {}));
  const totalSites = [...current.values()].reduce((a, b) => a + b, 0);
  const { added, grown, removed } = diffCensus(current, baselineEntries);
  console.log(
    `  ${name}: ${totalSites} site(s), ${current.size} distinct, baseline ${known.size}` +
      (removed.length > 0 ? ` (tighten: ${removed.length} gone)` : "")
  );
  for (const { id, count } of added) {
    failures.push(`[${name}] new: ${id} (x${count})`);
  }
  for (const { id, from, to } of grown) {
    failures.push(`[${name}] grew: ${id} ${from} -> ${to}`);
  }
}

/* -------------------------------------------------------------------------- */
/* ds-module-boundary                                                         */
/* -------------------------------------------------------------------------- */

/**
 * The Law-1 member that did not exist anywhere in this repository: does the
 * application reach past the DS's PUBLISHED contract?
 *
 * The five existing categories measure class anatomy, white-label reachability
 * and supplier leakage. None of them classifies an application's module
 * specifiers against `package.json#exports`, which is the boundary the
 * ownership contract actually states. The map is read live rather than copied,
 * so a subpath the package stops publishing becomes a violation the same day.
 *
 * Ships at ceiling 0: measured today, the corpus imports ten distinct DS
 * subpaths and every one is declared, with zero `/dist/` and zero `/src/`
 * reaches. A real falsifiable law from day one, with no debt absorbed.
 */
const DS_PACKAGE = "@rottay/design-system";
const DEEP_REACH = /(^|\/)(dist|src|node_modules)(\/|$)/;

export function declaredExportSubpaths(exportsMap) {
  const keys = [];
  const walk = (node) => {
    if (!node || typeof node !== "object") return;
    for (const key of Object.keys(node)) {
      if (key.startsWith(".")) keys.push(key);
    }
  };
  walk(exportsMap);
  return keys;
}

export function classifyDsSpecifier(specifier, declaredSubpaths) {
  if (specifier === DS_PACKAGE) return "public";
  if (!specifier.startsWith(`${DS_PACKAGE}/`)) return null;
  const subpath = `.${specifier.slice(DS_PACKAGE.length)}`;
  if (DEEP_REACH.test(subpath)) return "deep-reach";
  for (const declared of declaredSubpaths) {
    if (declared === subpath) return "public";
    if (declared.includes("*")) {
      const [head, tail] = declared.split("*");
      if (subpath.startsWith(head) && subpath.endsWith(tail) && subpath.length >= head.length + tail.length) {
        return "public";
      }
    }
  }
  return "undeclared-subpath";
}

export function censusDsSpecifiers(source, declaredSubpaths, { css = false } = {}) {
  const text = css ? stripCssComments(source) : stripTsComments(source);
  const found = [];
  const patterns = css
    ? [/@import\s+(['"])([^'"]+)\1/g, /url\(\s*(['"])([^'"]+)\1\s*\)/g]
    : [
        /\bfrom\s*(['"])([^'"]+)\1/g,
        /\bimport\s*(['"])([^'"]+)\1/g,
        /\brequire\s*\(\s*(['"])([^'"]+)\1\s*\)/g,
        /\bimport\s*\(\s*(['"])([^'"]+)\1\s*\)/g,
      ];
  for (const pattern of patterns) {
    for (const match of text.matchAll(pattern)) {
      const verdict = classifyDsSpecifier(match[2], declaredSubpaths);
      if (verdict && verdict !== "public") found.push({ specifier: match[2], verdict });
    }
  }
  return found;
}

function* moduleFiles(root) {
  for (const entry of readdirSync(root)) {
    const absolute = join(root, entry);
    const info = statSync(absolute);
    if (info.isDirectory()) {
      if (entry === "node_modules" || entry.startsWith(".")) continue;
      yield* moduleFiles(absolute);
    } else if (/\.(ts|tsx|js|jsx|mjs|cjs)$/.test(entry)) {
      yield absolute;
    }
  }
}

/** Site list -> id->count map, the shape every category census returns. */
export function tally(sites) {
  const map = new Map();
  for (const site of sites) map.set(site, (map.get(site) ?? 0) + 1);
  return map;
}

export function censusDsModuleBoundary() {
  const manifest = JSON.parse(readFileSync(join(CORE_ROOT, "package.json"), "utf8"));
  const declaredSubpaths = declaredExportSubpaths(manifest.exports);
  const sites = [];
  for (const [application, root] of Object.entries(APPLICATIONS)) {
    const appPrefix = resolve(root, "..");
    for (const file of moduleFiles(root)) {
      const relativeFile = `${application}/${relative(appPrefix, file)}`;
      for (const { specifier } of censusDsSpecifiers(readFileSync(file, "utf8"), declaredSubpaths)) {
        sites.push(`${relativeFile} :: ${specifier}`);
      }
    }
    for (const file of cssFiles(root)) {
      const relativeFile = `${application}/${relative(appPrefix, file)}`;
      for (const { specifier } of censusDsSpecifiers(readFileSync(file, "utf8"), declaredSubpaths, { css: true })) {
        sites.push(`${relativeFile} :: ${specifier}`);
      }
    }
  }
  return sites;
}

/* -------------------------------------------------------------------------- */
/* obligations                                                                */
/* -------------------------------------------------------------------------- */

/**
 * Bounded, expiring cross-repo obligations. NOT the decrease-only baseline.
 *
 * Removing the false green surfaces ten pre-existing signatures in
 * `app-bithire/src/components/landing/**` that this repository cannot fix. They
 * may not enter `baseline.categories`, which is the decrease-only ceiling, and
 * they may not be excluded: the landing CSS reads `var(--ds-*)` 96 times, a
 * sibling landing file is already baselined in the same category, and the
 * landing surface is tenant-branded at runtime.
 *
 * So they are recorded with an owner, a reason, the corpus SHA they were
 * measured at, and an EXECUTABLE expiry. An obligation is exact in both
 * directions: growth is a regression and shrinkage is an unrecorded partial
 * drain, so the ledger can neither absorb new debt nor fossilise.
 */
export function loadObligations() {
  if (!existsSync(OBLIGATIONS_PATH)) return { corpusPin: null, obligations: [] };
  return JSON.parse(readFileSync(OBLIGATIONS_PATH, "utf8"));
}

export function resolveCorpusSha(appRoot) {
  const headFile = resolve(appRoot, ".git/HEAD");
  if (!existsSync(headFile)) return null;
  const head = readFileSync(headFile, "utf8").trim();
  if (!head.startsWith("ref: ")) return head;
  const refFile = resolve(appRoot, ".git", head.slice(5));
  return existsSync(refFile) ? readFileSync(refFile, "utf8").trim() : null;
}

export function evaluateObligations(ledger, censusById, corpusSha) {
  const failures = [];
  const consumed = new Set();
  const entries = ledger.obligations ?? [];
  if (entries.length === 0) return { failures, consumed };

  if (!corpusSha) {
    failures.push(
      "[obligations] the corpus SHA could not be resolved, so the pin cannot be verified; " +
        "an obligation ledger without a verifiable pin is an unbounded excuse",
    );
  } else if (ledger.corpusPin !== corpusSha) {
    failures.push(
      `[obligations] corpus pin moved from ${ledger.corpusPin} to ${corpusSha}; ` +
        "every obligation must be re-derived or drained",
    );
  }

  for (const entry of entries) {
    for (const field of ["id", "category", "owner", "reason", "measuredAt", "expiresWhen"]) {
      if (typeof entry[field] !== "string" || entry[field].trim() === "") {
        failures.push(`[obligations] ${entry.id ?? "<unnamed>"} is missing ${field}`);
      }
    }
    if (typeof entry.count !== "number") {
      failures.push(`[obligations] ${entry.id ?? "<unnamed>"} is missing an exact count`);
      continue;
    }
    const live = censusById.get(entry.id);
    if (live === undefined) {
      failures.push(`[obligations] drained; delete the entry: ${entry.id}`);
      continue;
    }
    if (live !== entry.count) {
      failures.push(`[obligations] count mismatch for ${entry.id}: expected ${entry.count}, measured ${live}`);
      continue;
    }
    consumed.add(entry.id);
  }
  return { failures, consumed };
}

function main() {
  const check = process.argv.includes("--check");

  // FAIL-CLOSED PREFLIGHT. A blocking gate that returns 0 because it could not
  // find its corpus is green for the worst possible reason: it did not look.
  // `--optional` is deliberately absent -- `validateManifest` forbids it in a
  // blocking run array, so offering it here would only invite the half-state.
  if (!existsSync(APP_BITHIRE_ROOT)) {
    console.error(
      `application-boundary-gate: corpus missing — ${APP_BITHIRE_ROOT} is not checked out.`,
    );
    console.error("  Check out app-bithire beside ui-design-system, pass --app-root <dir>,");
    console.error("  or export APP_BITHIRE_ROOT as the CI workflow does.");
    process.exit(1);
  }
  if (!statSync(APP_BITHIRE_ROOT).isDirectory() || !existsSync(join(APP_BITHIRE_ROOT, "src"))) {
    console.error(
      `application-boundary-gate: corpus at ${APP_BITHIRE_ROOT} has no src/ — it is not an application checkout.`,
    );
    process.exit(1);
  }

  // Print WHAT was audited. A cross-repo gate whose corpus is invisible cannot
  // be reviewed: the reader has no way to tell which revision produced the
  // numbers below.
  const corpusSha = resolveCorpusSha(APP_BITHIRE_ROOT);
  console.log(`application-boundary-gate: corpus ${APP_BITHIRE_ROOT}`);
  console.log(
    `application-boundary-gate: corpus SHA ${corpusSha ?? "unavailable (no .git — exported tree)"}`,
  );

  const current = censusApplicationReaches();
  const baseline = loadBaseline();
  const { added, grown, removed } = diffCensus(current, baseline.reaches);

  const newReaches = [
    ...added.map(({ id, count }) => `${id} (x${count})`),
    ...grown.map(({ id, from, to }) => `${id} grew ${from} -> ${to}`),
  ];

  console.log(
    "application-boundary-gate (DS-Q006 PARTIAL: private-anatomy + 5 executable categories; i18n-bypass declared, not implemented)"
  );
  console.log(
    `  private-anatomy: ${[...current.values()].reduce((a, b) => a + b, 0)} reach site(s), ` +
      `${current.size} distinct, baseline ${Object.keys(baseline.reaches).length}`
  );
  if (removed.length > 0) {
    console.log(`  tighten opportunity: ${removed.length} baselined reach(es) no longer present`);
  }

  const failures = [];
  const categories = censusBoundaryCategories();
  categories["ds-module-boundary"] = tally(censusDsModuleBoundary());
  const liveById = new Map();
  for (const [name, categoryCensus] of Object.entries(categories)) {
    for (const [id, count] of categoryCensus) liveById.set(id, count);
    evaluateCategory(
      name,
      categoryCensus,
      baseline.categories?.[name],
      failures
    );
  }

  // Obligations are consulted AFTER the baseline diff, never inside it. An id
  // present in both files is an error: the ledger may not be used to launder
  // new debt into the decrease-only ceiling.
  const ledger = loadObligations();
  const baselinedIds = new Set(
    Object.values(baseline.categories ?? {}).flatMap((entries) => Object.keys(entries ?? {})),
  );
  for (const entry of ledger.obligations ?? []) {
    if (baselinedIds.has(entry.id)) {
      failures.push(`[obligations] ${entry.id} also appears in baseline.categories; it is not a ceiling`);
    }
  }
  const { failures: obligationFailures, consumed } = evaluateObligations(ledger, liveById, corpusSha);
  failures.push(...obligationFailures);
  const remaining = failures.filter(
    (failure) => !(/^\[[a-z-]+\] new: /.test(failure) && consumed.has(failure.replace(/^\[[a-z-]+\] new: /, "").replace(/ \(x\d+\)$/, ""))),
  );
  failures.length = 0;
  failures.push(...remaining);
  for (const id of consumed) {
    const entry = ledger.obligations.find((candidate) => candidate.id === id);
    console.log(`  obligation (owner ${entry.owner}, expires on ${entry.expiresWhen}): ${id} = ${entry.count}`);
  }

  if (newReaches.length > 0 || failures.length > 0) {
    console.error("application-boundary-gate FAILED — new boundary violations:");
    for (const reach of newReaches) console.error(`  - [private-anatomy] ${reach}`);
    for (const failure of failures.slice(0, 40)) console.error(`  - ${failure}`);
    if (failures.length > 40) {
      console.error(`  ... and ${failures.length - 40} more`);
    }
    process.exit(check ? 1 : 0);
  }
  console.log("[application-boundary-gate] OK — no new boundary violations.");
}

const invokedDirectly =
  process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (invokedDirectly) main();
