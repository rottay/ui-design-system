#!/usr/bin/env node
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { countEmbeddedCssPaintByFile } from "./lib/embedded-css-paint-counter.mjs";
import { collectSourceFiles } from "./runtime-svg-paint-census.mjs";

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function displayPath(file) {
  const packageRelative = relative(packageRoot, resolve(file)).replaceAll(
    "\\",
    "/"
  );
  return packageRelative.startsWith("../") ? file : packageRelative;
}

export function runEmbeddedCssPaintCensus(args = process.argv.slice(2)) {
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
  if (productionOnly) paths.push(join(packageRoot, "src/components"));
  const files = paths.flatMap((path) =>
    collectSourceFiles(path, { productionOnly })
  );
  const result = countEmbeddedCssPaintByFile(files);
  result.files = Object.fromEntries(
    Object.entries(result.files).map(([file, counts]) => [
      displayPath(file),
      counts,
    ])
  );
  result.failureSites = result.failureSites.map(({ file, ...site }) => ({
    file: displayPath(file),
    ...site,
  }));

  if (json) {
    process.stdout.write(JSON.stringify(result, null, 2) + "\n");
    return result;
  }

  process.stdout.write(
    "gate\tpaint\tunknown\tparse\tdynamic-prop\tunknown-sink\tcss-literals\troots\tfile\n"
  );
  for (const [file, counts] of Object.entries(result.files)) {
    if (!includeZero && counts.count === 0) continue;
    process.stdout.write(
      `${counts.count}\t${counts.classifiedPaint}\t${counts.unclassified}\t${counts.parseFailures}\t${counts.dynamicProperties}\t${counts.unknownSinks}\t${counts.cssLiterals}\t${counts.roots}\t${file}\n`
    );
  }
  for (const site of result.failureSites) {
    process.stdout.write(
      `UNCLASSIFIED\t${site.file}:${site.line}:${site.column}\t${site.kind}\t${site.message ?? site.expression}\n`
    );
  }
  process.stdout.write(
    `TOTAL ${result.total} gate sites (${result.classifiedPaint} classified paint; ${result.unclassified} unclassified fail-closed: ${result.parseFailures} parse, ${result.dynamicProperties} dynamic properties, ${result.unknownSinks} unknown sinks) across ${Object.keys(result.files).length} files\n`
  );
  return result;
}

const isMain =
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) runEmbeddedCssPaintCensus();
