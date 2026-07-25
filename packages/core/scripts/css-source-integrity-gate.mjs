import { readdirSync, readFileSync } from "node:fs";
import { extname, join, relative } from "node:path";

const packageRoot = new URL("..", import.meta.url).pathname;
const sourceRoot = join(packageRoot, "src");
const patchResidue = /^\+(?=\/\*|@|[.#:[a-zA-Z*])/;
const conflictMarker = /^(?:<{7}|={7}|>{7})(?:\s|$)/;
// Emphasis must wrap the component rather than hang from one chromatic edge.
// Neutral hierarchy/divider lines remain valid; this targets only semantic or
// brand-colored left rails, including inset-shadow implementations.
const chromaticLeftRail =
  /(?:border-(?:left|inline-start)(?:-color)?\s*:|inset\s+[1-9]\d*px\s+0\s+0)[^;]{0,260}var\(--ds-color-(?:primary|secondary|accent|success|warning|error|info)(?=[-),])/gi;
const chromaticPseudoRail =
  /::(?:before|after)[^{]*\{(?=[^}]*inset-inline-start\s*:\s*0)(?=[^}]*(?:inline-size|width)\s*:\s*[1-4](?:\.\d+)?px)(?=[^}]*(?:background|background-color)\s*:[^}]*(?:var\(--ds-(?:color|gradient|tint)|linear-gradient|color-mix))[^}]*\}/gi;
const invalidSpacingFamily = /--ds-space-[0-9]+/g;

function cssFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const absolutePath = join(directory, entry.name);

    if (entry.isDirectory()) return cssFiles(absolutePath);
    return entry.isFile() && extname(entry.name) === ".css" ? [absolutePath] : [];
  });
}

function authoredSourceFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const absolutePath = join(directory, entry.name);

    if (entry.isDirectory()) return authoredSourceFiles(absolutePath);
    return entry.isFile() && [".css", ".ts", ".tsx"].includes(extname(entry.name))
      ? [absolutePath]
      : [];
  });
}

const findings = [];

for (const file of cssFiles(sourceRoot)) {
  const source = readFileSync(file, "utf8");
  const lines = source.split(/\r?\n/);

  lines.forEach((line, index) => {
    if (patchResidue.test(line) || conflictMarker.test(line)) {
      findings.push(`${relative(packageRoot, file)}:${index + 1}: ${line}`);
    }
  });

  for (const match of source.matchAll(chromaticLeftRail)) {
    const lineNumber = source.slice(0, match.index).split(/\r?\n/).length;
    const declaration = match[0].replace(/\s+/g, " ").trim();
    findings.push(
      `${relative(packageRoot, file)}:${lineNumber}: chromatic left rail: ${declaration}`
    );
  }

  for (const match of source.matchAll(chromaticPseudoRail)) {
    const lineNumber = source.slice(0, match.index).split(/\r?\n/).length;
    findings.push(
      `${relative(packageRoot, file)}:${lineNumber}: chromatic pseudo-element left rail`
    );
  }
}

for (const file of authoredSourceFiles(sourceRoot)) {
  const source = readFileSync(file, "utf8");
  for (const match of source.matchAll(invalidSpacingFamily)) {
    const lineNumber = source.slice(0, match.index).split(/\r?\n/).length;
    findings.push(
      `${relative(packageRoot, file)}:${lineNumber}: invalid spacing token ${match[0]}; use --ds-spacing-*`
    );
  }
}

if (findings.length > 0) {
  console.error(
    "CSS source integrity gate failed. Remove patch/conflict residue, invalid spacing tokens, or chromatic left rails:"
  );
  findings.forEach((finding) => console.error(`- ${finding}`));
  process.exitCode = 1;
} else {
  console.log("CSS source integrity gate passed.");
}
