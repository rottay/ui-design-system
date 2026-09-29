/**
 * The root-declared aliases a scope must re-declare to re-resolve them.
 *
 * Read off the cascade edges artifact: every `decl` edge whose rule is the bare
 * document root is an alias -> operand edge. A name the DS also declares in
 * any other context (a mode rule, an engine class, an at-rule) is left out:
 * restating its root text in a tenant block would override that context on the
 * same element. The value text is the root declaration's own, read from the
 * edge's file:line with whitespace collapsed.
 *
 *   node scripts/generate/root-aliases/index.mjs            print the census
 *   node scripts/generate/root-aliases/index.mjs --write    write the table
 *   node scripts/generate/root-aliases/index.mjs --check    fail on drift
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const CORE_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const REPO_ROOT = resolve(CORE_ROOT, "../..");
export const EDGES_PATH = join(CORE_ROOT, "artifacts/generated/manifest/cascade/edges/index.json");
export const TABLE_PATH = join(
  CORE_ROOT,
  "src/infrastructure/compilers/runtime/theme/runtime/emission/css/root-aliases/generated/index.ts"
);

const ROOT_SELECTOR = /^(?::root|html)(?:\s*,\s*(?::root|html|:host))*$/;
export { rootStateSelector };

export const isRootSelector = (selector) =>
  ROOT_SELECTOR.test(String(selector ?? "").replace(/\s+/g, " ").trim());

/** One declaration's value text at file:line, comments dropped, whitespace collapsed. */
function declaredValue(lines, line, name) {
  let text = lines.slice(line - 1).join("\n");
  text = text.slice(text.indexOf(name) + name.length);
  text = text.slice(text.indexOf(":") + 1).replace(/\/\*[\s\S]*?\*\//g, "");
  let depth = 0;
  let value = "";
  for (const char of text) {
    if (char === "(") depth++;
    else if (char === ")") depth--;
    else if ((char === ";" || char === "}") && depth === 0) break;
    value += char;
  }
  return value.replace(/\s+/g, " ").replace(/\(\s/g, "(").replace(/\s\)/g, ")").trim();
}

/** The rule preludes enclosing a declaration, outermost first. */
function ruleChainAt(lines, line, name) {
  const current = lines[line - 1] ?? "";
  const text = [...lines.slice(0, line - 1), current.slice(0, Math.max(0, current.indexOf(name)))]
    .join("\n")
    .replace(/\/\*[\s\S]*?\*\//g, "");
  const chain = [];
  let depth = 0;
  for (let index = text.length - 1; index >= 0; index--) {
    const char = text[index];
    if (char === "}") depth++;
    else if (char === "{") {
      if (depth > 0) {
        depth--;
        continue;
      }
      let from = index - 1;
      while (from >= 0 && !";{}".includes(text[from])) from--;
      chain.unshift(text.slice(from + 1, index).replace(/\s+/g, " ").trim());
    }
  }
  return chain;
}

/** Top-level split on `separator`, parentheses and brackets respected. */
function splitTopLevel(text, separator) {
  const parts = [];
  let depth = 0;
  let part = "";
  for (const char of text) {
    if (char === "(" || char === "[") depth++;
    else if (char === ")" || char === "]") depth--;
    if (depth === 0 && separator.test(char)) {
      if (part.trim()) parts.push(part.trim());
      part = "";
      continue;
    }
    part += char;
  }
  if (part.trim()) parts.push(part.trim());
  return parts;
}

const ROOT_STATE_TOKEN =
  /:root|\bhtml\b|:host|\*|\[(?:data-(?:theme|tenant|vertical|density|engine|ds-root|contrast|mode)|dir|lang)\b[^\]]*\]|\.(?:dark|light)\b|\.ds-engine-[\w-]+|:(?:not|lang|dir)\((?:[^()]|\([^()]*\))*\)/g;

/** Whether a compound selector names only document-root state, so it can match the scope element. */
function rootStateCompound(compound) {
  const reduced = compound.replace(/:(?:where|is)\(((?:[^()]|\([^()]*\))*)\)/g, (_, inner) =>
    splitTopLevel(inner, /,/).some(rootStateSelector) ? "" : "\u0000"
  );
  return reduced.replace(ROOT_STATE_TOKEN, "").trim() === "";
}

/** Whether any branch of a selector list ends in a root-state compound. */
function rootStateSelector(selector) {
  return splitTopLevel(selector, /,/).some((branch) => {
    const compounds = splitTopLevel(branch.replace(/\s*([>+~])\s*/g, " "), /\s/);
    return compounds.length > 0 && rootStateCompound(compounds[compounds.length - 1]);
  });
}

export function deriveRootAliases(artifact = JSON.parse(readFileSync(EDGES_PATH, "utf8"))) {
  const files = new Map();
  const linesOf = (file) => {
    if (!files.has(file)) files.set(file, readFileSync(join(REPO_ROOT, file), "utf8").split("\n"));
    return files.get(file);
  };

  const sites = new Map();
  const site = (name, file, line) => {
    const chain = ruleChainAt(linesOf(file), line, name);
    if (!sites.has(name)) sites.set(name, []);
    sites.get(name).push({ file, line, joined: chain.join(" "), rule: chain[chain.length - 1] ?? "" });
  };
  const declEdges = artifact.edges.filter((edge) => edge.edgeClass === "decl");
  const seen = new Set();
  for (const edge of declEdges) {
    const key = `${edge.to}|${edge.file}|${edge.line}`;
    if (seen.has(key)) continue;
    seen.add(key);
    site(edge.to, edge.file, edge.line);
  }
  for (const pin of artifact.literalPins) {
    site(pin.channel, pin.file, pin.line);
  }

  const operands = new Map();
  for (const edge of declEdges) {
    if (!isRootSelector(edge.selector)) continue;
    if (!operands.has(edge.to)) operands.set(edge.to, new Set());
    operands.get(edge.to).add(edge.from);
  }

  const excluded = { contextVarying: [], divergentRootText: [], important: [] };
  const values = new Map();
  for (const name of [...operands.keys()].sort()) {
    const declared = sites.get(name);
    const atRoot = declared.filter((entry) => isRootSelector(entry.joined));
    if (declared.some((entry) => !isRootSelector(entry.joined) && rootStateSelector(entry.rule))) {
      excluded.contextVarying.push(name);
      continue;
    }
    const texts = new Set(atRoot.map((entry) => declaredValue(linesOf(entry.file), entry.line, name)));
    if (texts.size !== 1) {
      excluded.divergentRootText.push(name);
      continue;
    }
    const [value] = texts;
    if (value.includes("!important")) {
      excluded.important.push(name);
      continue;
    }
    values.set(name, value);
  }

  // Kahn over every reference the root text makes, fallbacks included: an alias follows every alias it reads.
  const reads = (value) => [...value.matchAll(/var\(\s*(--[\w-]+)/g)].map((match) => match[1]);
  const pending = new Map(
    [...values].map(([name, value]) => [name, [...new Set(reads(value))].filter((o) => values.has(o) && o !== name)])
  );
  const ordered = [];
  const placed = new Set();
  while (pending.size > 0) {
    const ready = [...pending].filter(([, reads]) => reads.every((o) => placed.has(o))).map(([n]) => n).sort();
    if (ready.length === 0) throw new Error(`root aliases: cycle among ${[...pending.keys()].slice(0, 8).join(", ")}`);
    for (const name of ready) {
      ordered.push([name, values.get(name)]);
      placed.add(name);
      pending.delete(name);
    }
  }
  return { rootAliases: operands.size, ordered, excluded, edgesDigest: artifact.digests?.edges ?? null };
}

export function renderTable({ ordered, edgesDigest }) {
  const rows = ordered.map(([name, value]) => `  [${JSON.stringify(name)}, ${JSON.stringify(value)}],`);
  return [
    "// Generated by scripts/generate/root-aliases/index.mjs from the cascade edges artifact. Do not edit.",
    "",
    `export const ROOT_ALIASES_EDGES_DIGEST = ${JSON.stringify(edgesDigest)};`,
    "",
    "/** Every alias declared only at the document root, in dependency order, with its root text. */",
    "export const ROOT_ALIASES: readonly (readonly [name: string, value: string])[] = [",
    ...rows,
    "];",
    "",
  ].join("\n");
}

function main(argv) {
  const derived = deriveRootAliases();
  const text = renderTable(derived);
  if (argv.includes("--write")) {
    writeFileSync(TABLE_PATH, text);
  } else if (argv.includes("--check")) {
    let current = "";
    try {
      current = readFileSync(TABLE_PATH, "utf8");
    } catch {
      // absent table is drift
    }
    if (current !== text) {
      process.stderr.write("root-aliases: the table drifted from the cascade edges; run --write\n");
      process.exit(1);
    }
  }
  process.stdout.write(
    `${JSON.stringify({
      rootAliases: derived.rootAliases,
      tabled: derived.ordered.length,
      contextVarying: derived.excluded.contextVarying.length,
      divergentRootText: derived.excluded.divergentRootText,
      important: derived.excluded.important,
    })}\n`
  );
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main(process.argv.slice(2));
