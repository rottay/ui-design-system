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
 * A vertical's rules sit on its DB tenants' own element, so the tabled aliases
 * they state with other text are listed per vertical from its artifact's bytes.
 *
 * A CONTAINER scope (an element below the document root) inherits every root
 * alias already resolved at the root, the left-out ones included. They are
 * tabled apart for that door alone: the text the cascade gives the root (layer
 * rank from the base entry's `@layer` statement, then specificity, then bundle
 * order), and the context rules that reach the root or the scope, in ascending
 * cascade order, so the scope re-emits each context where it applied. A root
 * rule the winning text outranks never applies and is not re-emitted.
 *
 * The DS root's own MODE channels are tabled apart as well: every name a live
 * base-stylesheet rule declares under a root-state mode selector (the default
 * theme's dark block, the patterns' and button's dark contexts), with the text
 * the same cascade law gives the root with no mode hook and in each mode. A
 * container scope below a document in a mode restates them from there; a name
 * whose mode reading is not a clean declaration is stopped and counted.
 *
 *   node scripts/generate/root-aliases/index.mjs            print the census
 *   node scripts/generate/root-aliases/index.mjs --write    write the table
 *   node scripts/generate/root-aliases/index.mjs --check    fail on drift
 */
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const CORE_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const REPO_ROOT = resolve(CORE_ROOT, "../..");
export const EDGES_PATH = join(CORE_ROOT, "artifacts/generated/manifest/cascade/edges/index.json");
export const VERTICAL_ARTIFACTS_DIR = join(CORE_ROOT, "src/foundation/tokens/css/facade/artifacts");
export const BASE_ENTRY_PATH = join(CORE_ROOT, "src/foundation/tokens/css/facade/entrypoints/base/index.css");
const SOURCE_PREFIX = "packages/core/src/foundation/tokens/css/";
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

const IMPORT = /@import\s+['"](\.[^'"]+)['"]\s*(layer\([^)]+\))?\s*;/g;

/**
 * Where each live source file sits in the served cascade: its top-level layer's
 * rank (unlayered above every layer) and its position in bundle order, read by
 * inlining the base entry's `@import`s exactly as the bundle composer does. A
 * file the entry never imports is dead CSS and has no position.
 */
export function bundleCascade(entry = BASE_ENTRY_PATH) {
  const strip = (text) => text.replace(/\/\*[\s\S]*?\*\//g, "");
  const statement = strip(readFileSync(entry, "utf8")).match(/@layer\s+([\w-]+(?:\s*,\s*[\w-]+)+)\s*;/);
  if (!statement) throw new Error(`root aliases: no @layer order statement in ${entry}`);
  const layers = statement[1].split(/\s*,\s*/);
  const files = new Map();
  let order = 0;
  const walk = (path, layer) => {
    const file = relative(REPO_ROOT, path);
    if (files.has(file) || !existsSync(path)) return;
    files.set(file, null);
    for (const [, importPath, directive] of strip(readFileSync(path, "utf8")).matchAll(IMPORT)) {
      const child = directive ? directive.slice(6, -1).trim() : null;
      walk(resolve(dirname(path), importPath), layer ?? child);
    }
    files.set(file, { layer, order: order++ });
  };
  walk(entry, null);
  return { layers, files };
}

/** [a, b, c] of the most specific branch of a selector list. */
export function specificity(selector) {
  let best = [0, 0, 0];
  for (const branch of splitTopLevel(selector, /,/)) {
    const count = [0, 0, 0];
    let rest = branch.replace(/:(where|is|not|has)\(((?:[^()]|\([^()]*\))*)\)/g, (_, fn, inner) => {
      if (fn !== "where") specificity(inner).forEach((value, index) => (count[index] += value));
      return " ";
    });
    rest = rest.replace(/::?[\w-]+\((?:[^()]|\([^()]*\))*\)/g, () => (count[1]++, " "));
    rest = rest.replace(/\[[^\]]*\]/g, () => (count[1]++, " "));
    rest = rest.replace(/::[\w-]+/g, () => (count[2]++, " "));
    rest = rest.replace(/#[\w-]+/g, () => (count[0]++, " "));
    rest = rest.replace(/[.:][\w-]+/g, () => (count[1]++, " "));
    count[2] += (rest.match(/(?:^|[\s>+~])[a-zA-Z][\w-]*/g) ?? []).length;
    if (compareKeys(count, best) > 0) best = count;
  }
  return best;
}

function compareKeys(left, right) {
  for (let index = 0; index < Math.max(left.length, right.length); index++) {
    const delta = (left[index] ?? 0) - (right[index] ?? 0);
    if (delta !== 0) return delta;
  }
  return 0;
}

/** Whether every branch's subject compound can only be the document root (`:root`, `html`) outside a `:where`/`:is`. */
export function rootOnlySelector(selector) {
  return splitTopLevel(selector, /,/).every((branch) => {
    const compounds = splitTopLevel(branch.replace(/\s*([>+~])\s*/g, " "), /\s/);
    const subject = (compounds[compounds.length - 1] ?? "").replace(/:(?:where|is|not|has)\((?:[^()]|\([^()]*\))*\)/g, "");
    return /:root\b/.test(subject) || /^html\b/.test(subject);
  });
}

/** One declaration site's cascade key: layer rank, specificity, bundle order, line. Null for dead CSS. */
function cascadeKey(cascade, entry) {
  const position = cascade.files.get(entry.file);
  if (!position) return null;
  const inner = entry.chain.find((prelude) => /^@layer\b/.test(prelude));
  const layer = position.layer ?? (inner ? inner.slice(6).trim().split(".")[0] : null);
  const rank = layer === null ? cascade.layers.length : cascade.layers.indexOf(layer);
  if (rank < 0) throw new Error(`root aliases: layer ${layer} of ${entry.file} is not in the entry's order`);
  return [rank, ...specificity(entry.rule), position.order, entry.line];
}

const siteOf = (entry) => `${entry.file.replace(SOURCE_PREFIX, "")}:${entry.line}`;

/**
 * The left-out aliases a container scope restates: the root text the cascade
 * gives the root, and the context rules that reach the root or the scope, in
 * ascending cascade order across every alias.
 */
function deriveContainerAliases(excluded, sites, linesOf, cascade) {
  const aliases = [];
  const contexts = [];
  const unrestatable = [];
  const outranked = [];
  for (const [exclusion, names] of Object.entries(excluded)) {
    if (exclusion === "important") continue;
    for (const name of names) {
      const keyed = sites
        .get(name)
        .map((entry) => ({ ...entry, key: cascadeKey(cascade, entry) }))
        .filter((entry) => entry.key !== null);
      const roots = keyed.filter((entry) => isRootSelector(entry.joined));
      if (roots.length === 0) {
        unrestatable.push(name);
        continue;
      }
      const winner = roots.reduce((best, entry) => (compareKeys(entry.key, best.key) > 0 ? entry : best));
      aliases.push({ name, exclusion, value: declaredValue(linesOf(winner.file), winner.line, name), site: siteOf(winner) });
      for (const entry of keyed) {
        if (isRootSelector(entry.joined) || !rootStateSelector(entry.rule)) continue;
        const at = entry.chain.slice(0, -1).filter((prelude) => !/^@layer\b/.test(prelude));
        if (at.some((prelude) => !prelude.startsWith("@"))) {
          throw new Error(`root aliases: ${name} at ${siteOf(entry)} sits in a nested style rule`);
        }
        const rootOnly = rootOnlySelector(entry.rule);
        if (rootOnly && compareKeys(entry.key, winner.key) < 0) {
          outranked.push(`${name} @ ${siteOf(entry)}`);
          continue;
        }
        contexts.push({
          name,
          at,
          selector: entry.rule,
          rootOnly,
          value: declaredValue(linesOf(entry.file), entry.line, name),
          site: siteOf(entry),
          key: entry.key,
        });
      }
    }
  }
  aliases.sort((left, right) => left.name.localeCompare(right.name));
  contexts.sort((left, right) => compareKeys(left.key, right.key) || left.name.localeCompare(right.name));
  return {
    aliases,
    contexts: contexts.map(({ key, ...context }) => context),
    unrestatable: unrestatable.sort(),
    outranked: outranked.sort(),
  };
}

const MODE_HOOK = /data-theme|\.(?:dark|light)\b/;

/** The document-root states the mode table resolves: no mode hook, and each mode's hook. */
export const ROOT_MODE_STATES = [null, "light", "dark"];

const ATTRIBUTE = /^\[\s*([\w-]+)\s*(?:([~|^$*]?=)\s*(?:'([^']*)'|"([^"]*)"|([^\]\s]+))\s*)?\]$/;

/**
 * Whether a compound can match the document root carrying only `theme` as its
 * `data-theme` (null: no hook). `undefined` when it names a token this reading
 * does not model.
 */
function rootCompoundMatches(compound, theme) {
  const tokens = compound.match(/:(?:where|is|not)\((?:[^()]|\((?:[^()]|\([^()]*\))*\))*\)|::?[\w-]+(?:\((?:[^()]|\([^()]*\))*\))?|\[[^\]]*\]|\.[\w-]+|#[\w-]+|\*|[a-zA-Z][\w-]*/g) ?? [];
  if (tokens.join("").replace(/\s+/g, "") !== compound.replace(/\s+/g, "")) return undefined;
  let unknown = false;
  for (const token of tokens) {
    let matched;
    const fn = token.match(/^:(where|is|not)\((.*)\)$/s);
    if (fn) {
      const arms = splitTopLevel(fn[2], /,/).map((arm) => rootSelectorMatches(arm, theme));
      if (arms.includes(true)) matched = fn[1] !== "not";
      else if (arms.includes(undefined)) matched = undefined;
      else matched = fn[1] === "not";
    } else if (token === ":root" || token === "html" || token === "*") {
      matched = true;
    } else if (token.startsWith("[")) {
      const [, attr, op, ...quoted] = token.match(ATTRIBUTE) ?? [];
      const value = quoted.find((part) => part !== undefined);
      if (!attr) matched = undefined;
      else if (attr !== "data-theme") matched = false;
      else if (!op) matched = theme !== null;
      else if (op === "=") matched = theme === value;
      else matched = undefined;
    } else if (/^[a-zA-Z.#]/.test(token) || token === ":host") {
      // another element, a class (a mode class included: the state carries the attribute hook) or an id
      matched = false;
    } else {
      matched = undefined;
    }
    if (matched === false) return false;
    if (matched === undefined) unknown = true;
  }
  return unknown ? undefined : true;
}

/** Whether any branch of a selector list is a single compound matching the root in `theme`. */
function rootSelectorMatches(selector, theme) {
  let unknown = false;
  for (const branch of splitTopLevel(selector, /,/)) {
    const compounds = splitTopLevel(branch.replace(/\s*([>+~])\s*/g, " $1 "), /\s/);
    if (compounds.length !== 1) continue;
    const matched = rootCompoundMatches(compounds[0], theme);
    if (matched === true) return true;
    if (matched === undefined) unknown = true;
  }
  return unknown ? undefined : false;
}

/**
 * The DS root's own mode channels: every name a live base-stylesheet rule
 * declares under a root-state MODE selector (one that matches the document root
 * in one mode state and not in another), with the text the cascade gives the
 * root in each state (layer rank, then specificity, then bundle order). A name
 * whose mode reading is not a clean declaration -- a mode rule under an
 * at-rule or a nested rule, a root-state rule this reading cannot resolve, or a
 * text the cascade cannot settle without another root state -- is stopped and
 * counted, never tabled.
 */
function deriveContainerModeTexts(sites, linesOf, cascade) {
  const texts = [];
  const stopped = {};
  const stop = (name, why) => (stopped[name] ??= why);
  for (const [name, declared] of [...sites].sort(([left], [right]) => left.localeCompare(right))) {
    const live = declared
      .map((entry) => ({ ...entry, key: cascadeKey(cascade, entry) }))
      .filter((entry) => entry.key !== null && rootStateSelector(entry.rule));
    const scoped = [];
    let modeScoped = false;
    for (const entry of live) {
      const matches = ROOT_MODE_STATES.map((theme) => rootSelectorMatches(entry.rule, theme));
      const conditional = entry.chain.slice(0, -1).some((prelude) => !/^@layer\b/.test(prelude));
      const varies = matches.some((matched) => matched !== matches[0]);
      if (varies) modeScoped = true;
      if (matches.includes(undefined)) {
        if (varies || matches.includes(true) || MODE_HOOK.test(entry.rule)) stop(name, `unresolved root-state rule ${entry.rule} @ ${siteOf(entry)}`);
        continue;
      }
      if (conditional) {
        if (varies) stop(name, `mode rule under ${entry.chain.slice(0, -1).join(" ")} @ ${siteOf(entry)}`);
        continue;
      }
      if (matches.some(Boolean)) scoped.push({ ...entry, matches });
    }
    if (!modeScoped || stopped[name]) continue;
    const row = { name };
    for (const [index, theme] of ROOT_MODE_STATES.entries()) {
      const applying = scoped.filter((entry) => entry.matches[index]);
      if (applying.length === 0) {
        row[theme ?? "base"] = null;
        continue;
      }
      const winner = applying.reduce((best, entry) => (compareKeys(entry.key, best.key) > 0 ? entry : best));
      const value = declaredValue(linesOf(winner.file), winner.line, name);
      if (value.includes("!important")) stop(name, `!important @ ${siteOf(winner)}`);
      row[theme ?? "base"] = value;
      row[`${theme ?? "base"}Site`] = siteOf(winner);
    }
    if (stopped[name]) continue;
    texts.push(row);
  }
  return { texts, stopped };
}

export function deriveRootAliases(
  artifact = JSON.parse(readFileSync(EDGES_PATH, "utf8")),
  cascade = bundleCascade()
) {
  const files = new Map();
  const linesOf = (file) => {
    if (!files.has(file)) files.set(file, readFileSync(join(REPO_ROOT, file), "utf8").split("\n"));
    return files.get(file);
  };

  const sites = new Map();
  const site = (name, file, line) => {
    const chain = ruleChainAt(linesOf(file), line, name);
    if (!sites.has(name)) sites.set(name, []);
    sites.get(name).push({ file, line, chain, joined: chain.join(" "), rule: chain[chain.length - 1] ?? "" });
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
  return {
    rootAliases: operands.size,
    ordered,
    excluded,
    edgesDigest: artifact.digests?.edges ?? null,
    verticalOutright: deriveVerticalOutright(ordered),
    container: deriveContainerAliases(excluded, sites, linesOf, cascade),
    modeTexts: deriveContainerModeTexts(sites, linesOf, cascade),
  };
}

const collapse = (value) =>
  value.replace(/\s+/g, " ").replace(/\(\s/g, "(").replace(/\s\)/g, ")").trim();

/** Whether every branch of a selector list is one compound: a rule on the matched element itself. */
function sameElementSelector(selector) {
  return splitTopLevel(selector, /,/).every(
    (branch) => splitTopLevel(branch.replace(/\s*([>+~])\s*/g, " "), /\s/).length === 1
  );
}

/** Per vertical artifact: the tabled aliases its same-element rules state with other text than the root's. */
export function deriveVerticalOutright(ordered, dir = VERTICAL_ARTIFACTS_DIR) {
  const root = new Map(ordered);
  const outright = {};
  const verticals = readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && existsSync(join(dir, entry.name, "index.css")))
    .map((entry) => entry.name)
    .sort();
  for (const vertical of verticals) {
    const css = readFileSync(join(dir, vertical, "index.css"), "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
    const names = new Set();
    for (const [, prelude, body] of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
      const selector = prelude.trim();
      if (selector.startsWith("@") || !sameElementSelector(selector)) continue;
      for (const declaration of splitTopLevel(body, /;/)) {
        const colon = declaration.indexOf(":");
        const name = declaration.slice(0, colon).trim();
        if (colon < 0 || !root.has(name)) continue;
        if (collapse(declaration.slice(colon + 1)) !== root.get(name)) names.add(name);
      }
    }
    outright[vertical] = [...names].sort();
  }
  return outright;
}

export function renderTable({ ordered, edgesDigest, verticalOutright, container, modeTexts }) {
  const rows = ordered.map(([name, value]) => `  [${JSON.stringify(name)}, ${JSON.stringify(value)}],`);
  const verticalRows = Object.entries(verticalOutright).flatMap(([vertical, names]) => [
    `  ${JSON.stringify(vertical)}: [`,
    ...names.map((name) => `    ${JSON.stringify(name)},`),
    "  ],",
  ]);
  return [
    "// Generated by scripts/generate/root-aliases/index.mjs from the cascade edges artifact and the vertical artifacts. Do not edit.",
    "",
    `export const ROOT_ALIASES_EDGES_DIGEST = ${JSON.stringify(edgesDigest)};`,
    "",
    "/** Every alias declared only at the document root, in dependency order, with its root text. */",
    "export const ROOT_ALIASES: readonly (readonly [name: string, value: string])[] = [",
    ...rows,
    "];",
    "",
    "/** Per vertical: the tabled aliases its own element rules state with other text than the root's. */",
    "export const VERTICAL_OUTRIGHT: Readonly<Record<string, readonly string[]>> = {",
    ...verticalRows,
    "};",
    "",
    "/** Why ROOT_ALIASES leaves an alias out. */",
    'export type ContainerAliasExclusion = "contextVarying" | "divergentRootText";',
    "",
    "/** A left-out alias as a container scope restates it: the cascade-winning root text and the site it is read from. */",
    "export interface ContainerAlias {",
    "  readonly name: string;",
    "  readonly exclusion: ContainerAliasExclusion;",
    "  readonly value: string;",
    "  readonly site: string;",
    "}",
    "",
    "/** A context rule a container scope re-emits for one alias: its at-rules, its selector, and whether that selector only matches the root. */",
    "export interface ContainerAliasContext {",
    "  readonly name: string;",
    "  readonly at: readonly string[];",
    "  readonly selector: string;",
    "  readonly rootOnly: boolean;",
    "  readonly value: string;",
    "  readonly site: string;",
    "}",
    "",
    "/** Every alias ROOT_ALIASES leaves out, as a container scope restates it. */",
    "export const CONTAINER_ALIASES: readonly ContainerAlias[] = [",
    ...container.aliases.map(
      (alias) =>
        `  { name: ${JSON.stringify(alias.name)}, exclusion: ${JSON.stringify(alias.exclusion)}, value: ${JSON.stringify(alias.value)}, site: ${JSON.stringify(alias.site)} },`
    ),
    "];",
    "",
    "/** Their context rules, in ascending cascade order across every alias: a later rule wins where both apply. */",
    "export const CONTAINER_ALIAS_CONTEXTS: readonly ContainerAliasContext[] = [",
    ...container.contexts.map(
      (context) =>
        `  { name: ${JSON.stringify(context.name)}, at: ${JSON.stringify(context.at)}, selector: ${JSON.stringify(context.selector)}, rootOnly: ${context.rootOnly}, value: ${JSON.stringify(context.value)}, site: ${JSON.stringify(context.site)} },`
    ),
    "];",
    "",
    "/** A DS-root mode channel: the text the cascade gives the document root with no mode hook and in each mode (null: undeclared there), and the sites they are read from (a mode's site omitted where it is the base site). */",
    "export interface ContainerModeText {",
    "  readonly name: string;",
    "  readonly base: string | null;",
    "  readonly light: string | null;",
    "  readonly dark: string | null;",
    "  readonly sites: Readonly<Partial<Record<\"base\" | \"light\" | \"dark\", string>>>;",
    "}",
    "",
    "/** Every name the base stylesheets declare under a root-state mode selector, by name. */",
    "export const CONTAINER_MODE_TEXTS: readonly ContainerModeText[] = [",
    ...modeTexts.texts.map((row) => {
      const sites = Object.fromEntries(
        ["base", "light", "dark"]
          .filter((state) => row[`${state}Site`] && (state === "base" || row[`${state}Site`] !== row.baseSite))
          .map((state) => [state, row[`${state}Site`]])
      );
      return `  { name: ${JSON.stringify(row.name)}, base: ${JSON.stringify(row.base)}, light: ${JSON.stringify(row.light)}, dark: ${JSON.stringify(row.dark)}, sites: ${JSON.stringify(sites)} },`;
    }),
    "];",
    "",
  ].join("\n");
}

/** The container table's census: restated aliases per exclusion class, contexts per context rule, and what was left out. */
function containerCensus({ aliases, contexts, unrestatable, outranked }) {
  const count = (items, keyOf) =>
    Object.fromEntries(
      [...items.reduce((map, item) => map.set(keyOf(item), (map.get(keyOf(item)) ?? 0) + 1), new Map())].sort(
        (left, right) => right[1] - left[1] || left[0].localeCompare(right[0])
      )
    );
  return {
    aliases: aliases.length,
    byExclusion: count(aliases, (alias) => alias.exclusion),
    contexts: contexts.length,
    byContext: count(contexts, (context) => [...context.at, context.selector].join(" ")),
    unrestatable,
    outranked: outranked.length,
  };
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
      verticalOutright: Object.fromEntries(
        Object.entries(derived.verticalOutright).map(([vertical, names]) => [vertical, names.length])
      ),
      containerRestated: containerCensus(derived.container),
      containerModeTexts: {
        names: derived.modeTexts.texts.length,
        dark: derived.modeTexts.texts.filter((row) => row.dark !== row.base).length,
        light: derived.modeTexts.texts.filter((row) => row.light !== row.base).length,
        stopped: derived.modeTexts.stopped,
      },
    })}\n`
  );
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main(process.argv.slice(2));
