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

const HERE = dirname(fileURLToPath(import.meta.url));
const CORE_ROOT = resolve(HERE, "..");
const BASELINE_PATH = join(HERE, "application-boundary-gate.baseline.json");

/** Sibling application repositories scanned by this gate (gat-09 precedent). */
const APPLICATIONS = {
  "app-bithire": resolve(CORE_ROOT, "../../../app-bithire/src"),
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

      for (const match of source.matchAll(DS_DECLARATION_PATTERN)) {
        if (!shippedDsNames.has(match[1])) {
          sites["undocumented-ds-writes"].push(
            `${relativeFile} :: ${match[1]}`
          );
        }
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

function evaluateCategory(name, current, baselineEntries, failures) {
  const known = new Map(Object.entries(baselineEntries ?? {}));
  const totalSites = [...current.values()].reduce((a, b) => a + b, 0);
  const removed = [...known.keys()].filter((id) => !current.has(id)).length;
  console.log(
    `  ${name}: ${totalSites} site(s), ${current.size} distinct, baseline ${known.size}` +
      (removed > 0 ? ` (tighten: ${removed} gone)` : "")
  );
  for (const [id, count] of current) {
    const entry = known.get(id);
    if (!entry) failures.push(`[${name}] new: ${id} (x${count})`);
    else if (count > entry.count) {
      failures.push(`[${name}] grew: ${id} ${entry.count} -> ${count}`);
    }
  }
}

function main() {
  const check = process.argv.includes("--check");
  const current = censusApplicationReaches();
  const baseline = loadBaseline();
  const baselineIds = new Map(
    Object.entries(baseline.reaches).map(([id, entry]) => [id, entry])
  );

  const newReaches = [];
  for (const [id, count] of current) {
    const known = baselineIds.get(id);
    if (!known) newReaches.push(`${id} (x${count})`);
    else if (count > known.count) {
      newReaches.push(`${id} grew ${known.count} -> ${count}`);
    }
  }
  const removed = [...baselineIds.keys()].filter((id) => !current.has(id));

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
  for (const [name, categoryCensus] of Object.entries(categories)) {
    evaluateCategory(
      name,
      categoryCensus,
      baseline.categories?.[name],
      failures
    );
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
