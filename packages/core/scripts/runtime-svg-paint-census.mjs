#!/usr/bin/env node
import { readdirSync, realpathSync, statSync } from "node:fs";
import {
  basename,
  dirname,
  isAbsolute,
  join,
  relative,
  resolve,
  sep,
} from "node:path";
import { fileURLToPath } from "node:url";
import { countRuntimeSvgPaintByFile } from "./lib/runtime-svg-paint-counter.mjs";

/**
 * Productive component-tree census for runtime SVG presentation paint emitted through D3
 * `.attr`/`.style`, DOM `setAttribute`, or attributes on intrinsic SVG JSX
 * elements. Canvas `fillStyle`/`strokeStyle` is intentionally out of channel.
 */
const SOURCE_EXTENSION_RE = /\.(?:[cm]?[jt]s|[jt]sx)$/;
const DECLARATION_EXTENSION_RE = /\.d\.(?:[cm]?[jt]s|[jt]sx)$/;
const NON_PRODUCTION_DIRECTORY_RE =
  /\/(?:__tests__|tests?|__fixtures__|fixtures?|__stories__|stories|__mocks__|mocks)\//i;
const NON_PRODUCTION_BASENAME_RE =
  /(?:^|[._-])(?:tests?|spec|stories?|fixtures?|mocks?|test-utils?|test-helpers?|story-helpers?)(?:[._-]|$)/i;
const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function isSourceFile(path) {
  return SOURCE_EXTENSION_RE.test(path) && !DECLARATION_EXTENSION_RE.test(path);
}

export function isProductionSourceFile(path) {
  if (!isSourceFile(path)) return false;
  const normalized = `/${resolve(path).replaceAll("\\", "/")}`;
  return (
    !NON_PRODUCTION_DIRECTORY_RE.test(normalized) &&
    !NON_PRODUCTION_BASENAME_RE.test(basename(path))
  );
}

function isOutside(base, candidate) {
  const rel = relative(base, candidate);
  return rel === ".." || rel.startsWith(`..${sep}`) || isAbsolute(rel);
}

export function collectSourceFiles(
  path,
  { productionOnly = false } = {},
  files = [],
  state
) {
  const canonicalPath = realpathSync(resolve(path));
  const stats = statSync(canonicalPath);
  const scan =
    state ??
    {
      root: stats.isDirectory() ? canonicalPath : dirname(canonicalPath),
      visitedDirectories: new Set(),
      visitedFiles: new Set(),
    };

  if (isOutside(scan.root, canonicalPath)) {
    throw new Error(
      `runtime SVG census path resolves outside its scan root: ${path} -> ${canonicalPath}`
    );
  }

  if (!stats.isDirectory()) {
    if (
      stats.isFile() &&
      (productionOnly
        ? isProductionSourceFile(canonicalPath)
        : isSourceFile(canonicalPath)) &&
      !scan.visitedFiles.has(canonicalPath)
    ) {
      scan.visitedFiles.add(canonicalPath);
      files.push(canonicalPath);
    }
    return files;
  }

  if (scan.visitedDirectories.has(canonicalPath)) return files;
  scan.visitedDirectories.add(canonicalPath);

  for (const entry of readdirSync(canonicalPath, { withFileTypes: true })) {
    if (
      !entry.isDirectory() &&
      !entry.isFile() &&
      !entry.isSymbolicLink()
    ) {
      continue;
    }
    collectSourceFiles(
      join(canonicalPath, entry.name),
      { productionOnly },
      files,
      scan
    );
  }
  return files;
}

function displayPath(file) {
  const packageRelative = relative(packageRoot, resolve(file)).replaceAll(
    "\\",
    "/"
  );
  return packageRelative.startsWith("../") ? file : packageRelative;
}

export function runRuntimeSvgPaintCensus(args = process.argv.slice(2)) {
  const json = args.includes("--json");
  const includeZero = args.includes("--include-zero");
  const unknownFlags = args.filter(
    (arg) => arg.startsWith("--") && !["--json", "--include-zero"].includes(arg)
  );
  if (unknownFlags.length > 0) {
    throw new Error(`Unknown option: ${unknownFlags.join(", ")}`);
  }

  const paths = args.filter((arg) => !arg.startsWith("--"));
  const productionOnly = paths.length === 0;
  if (productionOnly) {
    paths.push(join(packageRoot, "src/components"));
  }
  const files = paths.flatMap((path) =>
    collectSourceFiles(path, { productionOnly })
  );
  const result = countRuntimeSvgPaintByFile(files);

  // Keep default JSON keys checkout-independent so the output can be used as a
  // committed gate baseline even when the CLI is invoked outside the package CWD.
  result.files = Object.fromEntries(
    Object.entries(result.files).map(([file, counts]) => [
      displayPath(file),
      counts,
    ])
  );
  result.unclassifiedSites = result.unclassifiedSites.map(
    ({ file, ...site }) => ({
      file: displayPath(file),
      ...site,
    })
  );

  if (json) {
    process.stdout.write(JSON.stringify(result, null, 2) + "\n");
    return result;
  }

  process.stdout.write(
    "gate\tpaint\td3\tjsx\tdom\tunknown\tstructural\tfile\n"
  );
  for (const [file, counts] of Object.entries(result.files)) {
    if (!includeZero && counts.count === 0 && counts.ignoredStructural === 0) {
      continue;
    }
    process.stdout.write(
      `${counts.count}\t${counts.classifiedPaint}\t${counts.d3Setters}\t${counts.jsxAttributes}\t${counts.domSetAttributes}\t${counts.unclassified}\t${counts.ignoredStructural}\t${file}\n`
    );
  }
  for (const site of result.unclassifiedSites) {
    process.stdout.write(
      `UNCLASSIFIED\t${site.file}:${site.line}:${site.column}\t${site.method}(${site.expression}, ...)\n`
    );
  }
  process.stdout.write(
    `TOTAL ${result.total} gate sites (${result.classifiedPaint} classified paint: ${result.d3Setters} d3, ${result.jsxAttributes} jsx, ${result.domSetAttributes} dom; ${result.unclassified} unclassified fail-closed; ${result.ignoredStructural} structural ignored)\n`
  );
  return result;
}

const isMain =
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  runRuntimeSvgPaintCensus();
}
