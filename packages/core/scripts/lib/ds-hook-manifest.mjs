/**
 * THE PUBLIC APPLICATION HOOK MANIFEST — derivation, not a hand-list.
 *
 * WHY THIS FILE EXISTS
 * --------------------
 * The independent audit (2026-07-26, Codex finding C3) recorded that the
 * application/DS customization contract was under-specified: the app boundary
 * gate counted 190 `--ds-*` assignments in app CSS and treated every one that
 * was not a bare `:root` as legitimate by construction. "Not bare `:root`" does
 * not prove that a selector is feature-local, that it targets a public hook, or
 * that it cannot repaint an entire DS subtree.
 *
 * C3 requires "a public-hook allowlist generated from the supplier contract".
 * That literal instruction cannot be followed: `supplier-contract.json` is the
 * npm SUPPLIER-REACHABILITY map (which external packages an entrypoint pulls
 * in). It contains no CSS custom property and has byte-exact schema invariants
 * enforced by `dependency-honesty.mjs`; bolting a CSS vocabulary onto it would
 * corrupt an unrelated contract. So this module derives the hook allowlist from
 * the DS sources that actually declare custom-property ownership, and states
 * that substitution openly rather than silently.
 *
 * THE FIVE OWNERSHIP CLASSES (all derived from authored DS source)
 * ----------------------------------------------------------------
 * A1  TENANT CHANNEL — every concrete `--ds-*` output of the governed
 *     white-label compilers: chrome, static BrandTheme and DB appearance.
 *     These are written at ROOT on behalf of a tenant. An application that
 *     authors the same property in static CSS under any scoped selector WINS
 *     over `:root` and silently overrides the tenant's brand. They are
 *     therefore closed channels, never application hooks.
 *
 * A2  FOUNDATION TOKEN — root-equivalent declarations in authored DS CSS.
 *     The DS owns the value. An app assigning one re-derives a DS-owned token,
 *     and every descendant that reads it repaints — the exact "repaint an
 *     entire subtree" hazard C3 names.
 *
 * A3  UNADJUDICATED READ — read by the DS (`var(--ds-x, …)`) but owned by
 *     neither A1 nor A2 and not explicitly promoted. This is debt, not API.
 *     Existing names are decrease-only; a new name is a blocking finding.
 *
 * A4  PUBLIC HOOK — an A3-shaped read explicitly promoted in PROMOTIONS with
 *     owner, scope, type, fallback and white-label terms. Promotion is the only
 *     path into the application customization contract. Merely writing
 *     `var(--ds-x, fallback)` cannot create public API.
 *
 * A5  COMPONENT TOKEN — supplied below root by a component stylesheet/source.
 *     It is a DS-owned component channel, not a tenant dial and not application
 *     API. An explicit A4 promotion may expose a component slot; absent that
 *     owner decision it stays closed.
 *
 * Private implementation properties use `--_ds-*`. They are deliberately
 * invisible to this manifest and may never be assigned by an application.
 *
 * WHY GENERATED ARTIFACTS ARE EXCLUDED (the circularity trap)
 * ----------------------------------------------------------
 * `foundation/tokens/css/facade/artifacts/{bithire,evnto,rottay}/index.css` are
 * BUILD PRODUCTS that concatenate the vertical's own `_source/extension.css`.
 * Anchoring to them would let an application legalize its own writes by
 * round-tripping them through a generated snapshot: author `--ds-card-side-accent`
 * in the app, rebuild the artifact, and the property "becomes" a DS hook. Every
 * artifact, fixture and test directory is excluded for that reason. This was not
 * hypothetical — an early derivation over the full tree classified
 * `--ds-listing-grid-gap` and `--ds-tabs-list-bg` as DS-owned purely because the
 * bithire artifact had absorbed them.
 *
 * DRIFT IS FATAL, NEVER SILENT
 * ----------------------------
 * Each anchor declares a minimum yield. If an anchor file/directory disappears,
 * is renamed, or stops yielding names — a refactor moving the chrome emitter,
 * a CSS root relocation — derivation THROWS. It must never degrade into an
 * empty or partial allowlist, because an empty allowlist would silently
 * reclassify legal hook writes as violations and a partial one would silently
 * legalize root tokens. There is no hand-maintained fallback list anywhere in
 * this module.
 */

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, resolve, sep } from 'node:path';
import ts from 'typescript';
import {
  parseEmitterMappings,
  parseTypeRegistry,
} from './theme-channel-parity-graph.mjs';

// ---------------------------------------------------------------------------
// Selector analysis
//
// Shared with the gate so the manifest's notion of "root-equivalent" and the
// gate's notion cannot drift apart. postcss-selector-parser is NOT a dependency
// of this package and the closure forbids adding one, so this is a small
// purpose-built parser: it only has to answer "is the SUBJECT of this complex
// selector root scope?", not to model full Selectors Level 4.
// ---------------------------------------------------------------------------

/**
 * Split a selector list on top-level commas only. Commas inside `[]`, `()` and
 * quotes belong to the enclosing construct — `:is(html, :root)` and
 * `[data-x="a,b"]` must survive as single units.
 */
export function splitSelectorList(selector) {
  const parts = [];
  let depthParen = 0;
  let depthBracket = 0;
  let quote = null;
  let current = '';
  for (let index = 0; index < selector.length; index += 1) {
    const char = selector[index];
    if (quote) {
      current += char;
      if (char === quote && selector[index - 1] !== '\\') quote = null;
      continue;
    }
    if (char === '"' || char === "'") {
      quote = char;
      current += char;
      continue;
    }
    if (char === '(') depthParen += 1;
    else if (char === ')') depthParen = Math.max(0, depthParen - 1);
    else if (char === '[') depthBracket += 1;
    else if (char === ']') depthBracket = Math.max(0, depthBracket - 1);

    if (char === ',' && depthParen === 0 && depthBracket === 0) {
      parts.push(current.trim());
      current = '';
      continue;
    }
    current += char;
  }
  if (current.trim()) parts.push(current.trim());
  return parts.filter(Boolean);
}

/**
 * Return the SUBJECT compound of a complex selector: the last compound, i.e.
 * the element the declarations actually apply to. `[data-tenant] .feature-card`
 * declares onto `.feature-card`, not onto the tenant root.
 */
export function subjectCompound(complexSelector) {
  let depthParen = 0;
  let depthBracket = 0;
  let quote = null;
  let lastBreak = -1;
  for (let index = 0; index < complexSelector.length; index += 1) {
    const char = complexSelector[index];
    if (quote) {
      if (char === quote && complexSelector[index - 1] !== '\\') quote = null;
      continue;
    }
    if (char === '"' || char === "'") {
      quote = char;
      continue;
    }
    if (char === '(') depthParen += 1;
    else if (char === ')') depthParen = Math.max(0, depthParen - 1);
    else if (char === '[') depthBracket += 1;
    else if (char === ']') depthBracket = Math.max(0, depthBracket - 1);
    if (depthParen > 0 || depthBracket > 0) continue;
    if (char === ' ' || char === '\t' || char === '\n' || char === '>' || char === '+' || char === '~') {
      lastBreak = index;
    }
  }
  return complexSelector.slice(lastBreak + 1).trim();
}

/**
 * Root-state attributes. Writing `--ds-*` onto a bare one of these is authoring
 * the DS root by another name — the "equivalent root selectors other than bare
 * `:root`" that C3 point 4 forbids.
 */
const ROOT_STATE_ATTRIBUTES = Object.freeze([
  'data-ds-root',
  'data-tenant',
  'data-tenant-theme',
  'data-tenant-theme-mode',
  'data-vertical',
  'data-theme',
  'data-engine',
  'data-ds-engine',
  'data-mode',
  'data-color-scheme',
  'data-density',
]);

const FUNCTIONAL_PSEUDO = /^:(?:is|where|matches|any|-moz-any|-webkit-any)\((.*)\)$/s;

/**
 * Tokenize a compound selector into its simple-selector parts, keeping
 * bracketed/parenthesized units intact.
 */
function compoundParts(compound) {
  const parts = [];
  let current = '';
  let depthParen = 0;
  let depthBracket = 0;
  let quote = null;
  for (let index = 0; index < compound.length; index += 1) {
    const char = compound[index];
    if (quote) {
      current += char;
      if (char === quote && compound[index - 1] !== '\\') quote = null;
      continue;
    }
    if (char === '"' || char === "'") {
      quote = char;
      current += char;
      continue;
    }
    // Decide the split BEFORE updating depth: an opening `[` or `(` is itself
    // the boundary, so testing after the increment would keep `html[data-x]` as
    // one indivisible part and hide the `html` root signal behind it.
    const atTop = depthParen === 0 && depthBracket === 0;
    const startsNew = atTop && (char === '.' || char === '#' || char === '[' || char === ':');
    if (startsNew && current) {
      parts.push(current);
      current = '';
    }

    if (char === '(') depthParen += 1;
    else if (char === ')') depthParen = Math.max(0, depthParen - 1);
    else if (char === '[') depthBracket += 1;
    else if (char === ']') depthBracket = Math.max(0, depthBracket - 1);

    current += char;
  }
  if (current) parts.push(current);
  return parts.filter(Boolean);
}

/**
 * Is this compound the document root, the universal selector, or a bare
 * root-state attribute?
 *
 * A compound is root-equivalent when it names root (`:root`/`html`/`body`/`*`)
 * or consists ONLY of root-state attributes. The moment a class, id, element or
 * pseudo-element narrows it — `[data-tenant] .feature-card`, `html .rt-panel` —
 * it is a feature scope, not the root, and is allowed to carry a public hook.
 */
export function isRootEquivalentCompound(compound) {
  const trimmed = compound.trim();
  if (!trimmed) return false;
  if (trimmed === '*' || trimmed === '&') return false;

  const parts = compoundParts(trimmed);
  if (parts.length === 0) return false;

  let sawRootSignal = false;
  for (const part of parts) {
    const functional = FUNCTIONAL_PSEUDO.exec(part);
    if (functional) {
      // `:is(html, :root)` is root-equivalent if ANY branch is: the rule then
      // matches the root element. `:where()` differs only in specificity.
      const anyRoot = splitSelectorList(functional[1]).some((branch) =>
        isRootEquivalentCompound(subjectCompound(branch)),
      );
      if (anyRoot) sawRootSignal = true;
      continue;
    }
    if (part === ':root' || part === 'html' || part === 'body' || part === '*') {
      sawRootSignal = true;
      continue;
    }
    if (part.startsWith('[')) {
      const attribute = part.slice(1, -1).split(/[~^|$*]?=/)[0].trim();
      if (ROOT_STATE_ATTRIBUTES.includes(attribute)) {
        sawRootSignal = true;
        continue;
      }
      // A non-root attribute (e.g. `[data-part="header"]`) is a narrowing
      // qualifier: this is component scope, not the root.
      return false;
    }
    if (part.startsWith(':')) {
      // Structural/state pseudo-classes (`:hover`, `:dir(rtl)`) do not turn a
      // root into a feature scope, nor a feature scope into a root.
      continue;
    }
    // A class, id, or element name narrows the subject away from the root.
    return false;
  }
  return sawRootSignal;
}

/**
 * The universal selector repaints every element in its scope, which is the same
 * blast radius as authoring the root, so it is treated as root-equivalent even
 * though it names no root element. `[data-tenant='x'] * { --ds-card-bg: … }` is
 * the tenant-scoped global write C3 point 4 forbids.
 */
export function isRootEquivalentSelector(complexSelector) {
  const subject = subjectCompound(complexSelector);
  if (subject === '*') return true;
  return isRootEquivalentCompound(subject);
}

/**
 * Resolve a nested selector against its resolved parent list, per CSS Nesting.
 * Without this, `html { &[data-tenant='bithire'] { … } }` would be judged on the
 * fragment `&[data-tenant='bithire']` alone and escape root detection.
 */
export function resolveNestedSelectors(parentList, childSelector) {
  const children = splitSelectorList(childSelector);
  if (parentList.length === 0) return children;
  const resolved = [];
  for (const child of children) {
    for (const parent of parentList) {
      if (child.includes('&')) resolved.push(child.split('&').join(parent));
      else resolved.push(`${parent} ${child}`);
    }
  }
  return resolved;
}

// ---------------------------------------------------------------------------
// Interpolated emission families
//
// The chrome emitter does not spell every variable it writes. Whole families
// are built by string interpolation:
//
//   vars[`--ds-button-${prefix}-bg`] = btn.bg;              // 12 variants
//   vars[`--ds-${namespace}-padding`] = card.padding;       // 6 card families
//   const prefix = `--ds-${family}-${size}`;                // 2 x 5 controls
//   vars[`${prefix}-padding-x`] = value.paddingX;
//
// A literal-key scan cannot see any of these, so it under-reports the tenant
// channel — and under-reporting it is the dangerous direction: a variable the
// white-label compiler writes at `:root` gets misfiled as a plain foundation
// token or, worse, as an open public hook, and the gate then blesses an
// application write that silently overrides the tenant's brand.
//
// So the families are EXPANDED, and expanded by derivation: the emitter's own
// call sites and parameter types supply the substitution values. Adding a
// thirteenth button variant or a seventh card namespace is picked up with no
// edit here. Nothing is hand-listed.
// ---------------------------------------------------------------------------

/** Skip a quoted string or template literal starting at `index`. */
function skipQuoted(source, index) {
  const quote = source[index];
  let cursor = index + 1;
  while (cursor < source.length) {
    if (source[cursor] === '\\') {
      cursor += 2;
      continue;
    }
    if (source[cursor] === quote) return cursor + 1;
    cursor += 1;
  }
  return cursor;
}

/** Find the body of the block opened at `openIndex`, ignoring quotes and comments. */
function matchBlock(source, openIndex) {
  let depth = 0;
  let cursor = openIndex;
  while (cursor < source.length) {
    const char = source[cursor];
    if (char === '"' || char === "'" || char === '`') {
      cursor = skipQuoted(source, cursor);
      continue;
    }
    if (char === '/' && source[cursor + 1] === '/') {
      cursor = source.indexOf('\n', cursor);
      if (cursor === -1) break;
      continue;
    }
    if (char === '/' && source[cursor + 1] === '*') {
      cursor = source.indexOf('*/', cursor);
      if (cursor === -1) break;
      cursor += 2;
      continue;
    }
    if (char === '{') depth += 1;
    else if (char === '}') {
      depth -= 1;
      if (depth === 0) return source.slice(openIndex + 1, cursor);
    }
    cursor += 1;
  }
  return '';
}

/** Split an argument or parameter list on top-level commas. */
function splitTopLevel(text) {
  const parts = [];
  let depth = 0;
  let current = '';
  let cursor = 0;
  while (cursor < text.length) {
    const char = text[cursor];
    if (char === '"' || char === "'" || char === '`') {
      const end = skipQuoted(text, cursor);
      current += text.slice(cursor, end);
      cursor = end;
      continue;
    }
    if (char === '(' || char === '[' || char === '{' || char === '<') depth += 1;
    else if (char === ')' || char === ']' || char === '}' || char === '>') depth -= 1;
    if (char === ',' && depth === 0) {
      parts.push(current.trim());
      current = '';
      cursor += 1;
      continue;
    }
    current += char;
    cursor += 1;
  }
  if (current.trim()) parts.push(current.trim());
  return parts;
}

const STRING_LITERAL = /^(["'])((?:[^\\]|\\.)*?)\1$/;

/**
 * Expand every `--ds-*` variable the chrome emitter writes through string
 * interpolation. Returns the expanded names plus a per-family record so the
 * published manifest can show WHY a name is tenant-owned.
 */
export function deriveInterpolatedEmissions(source) {
  const names = new Set();
  const families = [];

  // 1. Index every function: parameter names, declared literal-union types, body.
  const functions = new Map();
  for (const match of source.matchAll(/function\s+([A-Za-z_$][\w$]*)\s*\(/g)) {
    const parenIndex = match.index + match[0].length - 1;
    let depth = 0;
    let cursor = parenIndex;
    for (; cursor < source.length; cursor += 1) {
      if (source[cursor] === '(') depth += 1;
      else if (source[cursor] === ')') {
        depth -= 1;
        if (depth === 0) break;
      }
    }
    const parameterText = source.slice(parenIndex + 1, cursor);
    const braceIndex = source.indexOf('{', cursor);
    if (braceIndex === -1) continue;
    const parameters = splitTopLevel(parameterText).map((parameter) => {
      const name = parameter.split(/[:=?]/)[0].trim().replace(/^\.\.\./, '');
      // A parameter typed as a literal union enumerates its own values:
      // `size: "xs" | "sm" | "md" | "lg" | "xl"` needs no call-site evidence.
      const typeValues = new Set();
      const colon = parameter.indexOf(':');
      if (colon !== -1) {
        for (const literal of parameter.slice(colon + 1).matchAll(/(["'])([^"']+)\1/g)) {
          typeValues.add(literal[2]);
        }
      }
      return { name, typeValues };
    });
    functions.set(match[1], { parameters, body: matchBlock(source, braceIndex) });
  }

  // 2. Collect the string literals each function actually receives per position.
  for (const [name, descriptor] of functions) {
    for (const call of source.matchAll(new RegExp(`(?<![\\w$.])${name}\\s*\\(`, 'g'))) {
      const parenIndex = call.index + call[0].length - 1;
      if (/function\s+$/.test(source.slice(Math.max(0, call.index - 10), call.index))) continue;
      let depth = 0;
      let cursor = parenIndex;
      for (; cursor < source.length; cursor += 1) {
        const char = source[cursor];
        if (char === '"' || char === "'" || char === '`') {
          cursor = skipQuoted(source, cursor) - 1;
          continue;
        }
        if (char === '(') depth += 1;
        else if (char === ')') {
          depth -= 1;
          if (depth === 0) break;
        }
      }
      const args = splitTopLevel(source.slice(parenIndex + 1, cursor));
      args.forEach((argument, position) => {
        const literal = STRING_LITERAL.exec(argument);
        if (literal && descriptor.parameters[position]) {
          descriptor.parameters[position].typeValues.add(literal[2]);
        }
      });
    }
  }

  // 3. Expand each `vars[`…`]` key template against those values.
  for (const [name, descriptor] of functions) {
    const scope = new Map();
    for (const parameter of descriptor.parameters) {
      if (parameter.typeValues.size > 0) scope.set(parameter.name, [...parameter.typeValues]);
    }
    // Local `const prefix = `--ds-${family}-${size}`` shortcuts resolve first.
    for (const local of descriptor.body.matchAll(/const\s+([A-Za-z_$][\w$]*)\s*=\s*`([^`]*)`/g)) {
      const expanded = expandTemplate(local[2], scope);
      if (expanded.length > 0) scope.set(local[1], expanded);
    }
    for (const key of descriptor.body.matchAll(/vars\[\s*`([^`]*)`\s*\]\s*=/g)) {
      if (!key[1].includes('${')) continue;
      const expanded = expandTemplate(key[1], scope).filter((value) => value.startsWith('--ds-'));
      if (expanded.length === 0) continue;
      families.push({ emitter: name, template: key[1], names: expanded.sort() });
      for (const value of expanded) names.add(value);
    }
  }

  return { names, families };
}

/** Cartesian expansion of a template's `${identifier}` slots. */
function expandTemplate(template, scope) {
  let results = [''];
  const pattern = /\$\{([A-Za-z_$][\w$]*)\}/g;
  let lastIndex = 0;
  let match;
  while ((match = pattern.exec(template)) !== null) {
    const literal = template.slice(lastIndex, match.index);
    const values = scope.get(match[1]);
    // An unresolvable slot means the family cannot be enumerated. Returning
    // nothing is correct: a partially expanded name would be a lie, and the
    // caller's minimum-yield check turns a systemic failure into a hard stop.
    if (!values) return [];
    results = results.flatMap((prefix) => values.map((value) => prefix + literal + value));
    lastIndex = pattern.lastIndex;
  }
  const tail = template.slice(lastIndex);
  return [...new Set(results.map((value) => value + tail))];
}

// ---------------------------------------------------------------------------
// Anchor derivation
// ---------------------------------------------------------------------------

/** Generated snapshots, fixtures and tests never speak for DS ownership. */
const EXCLUDED_PATH = /(?:^|[\\/])(?:facade[\\/]artifacts|__tests__|tests|__fixtures__|fixtures|stories|node_modules|dist)(?:[\\/]|$)/;

/**
 * Parse exact `var(--ds-*)` calls and retain whether the call carries its own
 * fallback. This is deliberately a small CSS-value scanner rather than a
 * source regex:
 *
 * - quoted prose is ignored;
 * - dynamic names such as `--ds-control-${size}` are rejected;
 * - nested var() calls are each reported independently;
 * - a comma only counts as a fallback at the current var() depth.
 *
 * The distinction is architectural, not cosmetic. A public hook is optional:
 * if a consumer reads it without a fallback, some authored DS source must
 * supply it in the same runtime. Otherwise a legal application that does not
 * customize the hook can receive an invalid declaration.
 */
export function customPropertyReadDetails(value) {
  const reads = [];
  let quote = null;
  let escaped = false;

  for (let index = 0; index < value.length; index += 1) {
    const char = value[index];
    if (quote) {
      if (escaped) {
        escaped = false;
        continue;
      }
      if (char === '\\') {
        escaped = true;
        continue;
      }
      if (char === quote) quote = null;
      continue;
    }
    if (char === '"' || char === "'") {
      quote = char;
      continue;
    }
    if (!value.startsWith('var(', index)) continue;

    let cursor = index + 4;
    while (/\s/.test(value[cursor] ?? '')) cursor += 1;
    const propertyMatch = /^(--ds-[a-z0-9-]+)/.exec(value.slice(cursor));
    if (!propertyMatch) continue;
    const property = propertyMatch[1];
    cursor += property.length;
    while (/\s/.test(value[cursor] ?? '')) cursor += 1;
    if (value[cursor] !== ',' && value[cursor] !== ')') continue;

    let depth = 1;
    let hasFallback = false;
    let nestedQuote = null;
    let nestedEscaped = false;
    for (let nested = index + 4; nested < value.length; nested += 1) {
      const nestedChar = value[nested];
      if (nestedQuote) {
        if (nestedEscaped) {
          nestedEscaped = false;
          continue;
        }
        if (nestedChar === '\\') {
          nestedEscaped = true;
          continue;
        }
        if (nestedChar === nestedQuote) nestedQuote = null;
        continue;
      }
      if (nestedChar === '"' || nestedChar === "'") {
        nestedQuote = nestedChar;
        continue;
      }
      if (nestedChar === '(') depth += 1;
      else if (nestedChar === ')') {
        depth -= 1;
        if (depth === 0) break;
      } else if (nestedChar === ',' && depth === 1) {
        hasFallback = true;
      }
    }
    reads.push({ property, hasFallback });
  }
  return reads;
}

function unwrapStaticExpression(node) {
  let current = node;
  while (
    current &&
    (
      ts.isAsExpression(current) ||
      ts.isTypeAssertionExpression(current) ||
      ts.isParenthesizedExpression(current) ||
      (ts.isSatisfiesExpression && ts.isSatisfiesExpression(current))
    )
  ) {
    current = current.expression;
  }
  return current;
}

function staticStringValue(node) {
  const current = unwrapStaticExpression(node);
  if (
    current &&
    (ts.isStringLiteralLike(current) || ts.isNoSubstitutionTemplateLiteral(current))
  ) {
    return current.text;
  }
  return null;
}

function createSourceFile(source, fileName) {
  return ts.createSourceFile(
    fileName,
    source,
    ts.ScriptTarget.Latest,
    true,
    fileName.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  );
}

/**
 * Exact custom-property suppliers authored in TypeScript/TSX:
 *
 * - object/style keys (`{ '--ds-x': value }`);
 * - `style.setProperty('--ds-x', value)`;
 * - indexed assignment (`vars['--ds-x'] = value`).
 *
 * Comments, type prose and interpolated names are not suppliers. These local
 * component token maps must be visible to the hook-safety contract; otherwise
 * a computed slot such as Collapse's state variables is falsely reported as
 * missing even though the component stamps it at runtime.
 */
export function componentSourceSuppliers(source, fileName = 'component.tsx') {
  const sourceFile = createSourceFile(source, fileName);
  const suppliers = new Set();

  const add = (candidate) => {
    if (candidate?.startsWith('--ds-')) suppliers.add(candidate);
  };

  const visit = (node) => {
    if (ts.isPropertyAssignment(node)) {
      add(
        ts.isComputedPropertyName(node.name)
          ? staticStringValue(node.name.expression)
          : staticStringValue(node.name),
      );
    }
    if (
      ts.isCallExpression(node) &&
      ts.isPropertyAccessExpression(node.expression) &&
      node.expression.name.text === 'setProperty'
    ) {
      add(staticStringValue(node.arguments[0]));
    }
    if (
      ts.isBinaryExpression(node) &&
      node.operatorToken.kind === ts.SyntaxKind.EqualsToken &&
      ts.isElementAccessExpression(node.left)
    ) {
      add(staticStringValue(node.left.argumentExpression));
    }
    ts.forEachChild(node, visit);
  };

  visit(sourceFile);
  return suppliers;
}

/**
 * Extract exact CSS custom-property reads from authored TypeScript/TSX strings.
 *
 * Source-wide regexes are not a trustworthy parser here: they see comments and
 * documentation as runtime reads, and a template such as
 * `var(--ds-select-trigger-${size}-height)` as the invalid public hook
 * `--ds-select-trigger-`. The public manifest is an API, so only exact names
 * present in runtime string/template segments may enter it.
 *
 * Template expressions are inspected segment by segment. This retains exact
 * reads whose fallback value is dynamic (`var(--ds-card-bg, ${fallback})`) but
 * deliberately refuses to invent a partial name when interpolation occurs
 * inside the custom-property identifier.
 */
export function componentSourceReads(source, fileName = 'component.tsx') {
  const sourceFile = createSourceFile(source, fileName);
  const reads = new Set();

  const scanLiteral = (value) => {
    for (const read of customPropertyReadDetails(value)) reads.add(read.property);
  };

  const visit = (node) => {
    if (ts.isStringLiteralLike(node)) {
      scanLiteral(node.text);
      return;
    }
    if (ts.isTemplateExpression(node)) {
      scanLiteral(node.head.text);
      for (const span of node.templateSpans) {
        visit(span.expression);
        scanLiteral(span.literal.text);
      }
      return;
    }
    ts.forEachChild(node, visit);
  };

  visit(sourceFile);
  return reads;
}

/** Same AST boundary as `componentSourceReads`, retaining fallback posture. */
export function componentSourceReadDetails(source, fileName = 'component.tsx') {
  const sourceFile = createSourceFile(source, fileName);
  const reads = [];

  const scanLiteral = (value) => reads.push(...customPropertyReadDetails(value));
  const visit = (node) => {
    if (ts.isStringLiteralLike(node)) {
      scanLiteral(node.text);
      return;
    }
    if (ts.isTemplateExpression(node)) {
      scanLiteral(node.head.text);
      for (const span of node.templateSpans) {
        visit(span.expression);
        scanLiteral(span.literal.text);
      }
      return;
    }
    ts.forEachChild(node, visit);
  };

  visit(sourceFile);
  return reads;
}

/**
 * Extract real var(--ds-*) calls from a CSS declaration value.
 *
 * PostCSS has already removed comments from the declaration tree. This small
 * scanner additionally ignores quoted content such as
 * `content: "var(--ds-example)"`, which is prose rather than a CSS read.
 */
function cssDeclarationReads(value) {
  return customPropertyReadDetails(value).map((read) => read.property);
}

/**
 * Anchor descriptors. `minimum` is the yield below which the source is presumed
 * broken rather than merely small. These numbers are floors chosen far under
 * the observed yield (A1 721, A2 ~3.5k, A3 ~2.8k at seed); they exist to catch
 * a moved or emptied anchor, not to ratchet a count.
 */
export const ANCHORS = Object.freeze({
  tenantChannel: Object.freeze({
    id: 'tenant-channel',
    path: 'src/infrastructure/compilers/kernel/foundation/css/chrome-variables/index.ts',
    kind: 'file',
    minimum: 200,
    // Floor for the `vars[`--ds-${…}`]` key templates. 70 expand at seed; a
    // collapse to single digits means the emitter shape changed, not that the
    // compiler got smaller.
    interpolatedFamilyMinimum: 30,
    describes: 'governed white-label chrome emission table (written at :root per tenant)',
  }),
  brandThemeEmitter: Object.freeze({
    id: 'brand-theme-emitter',
    path: 'src/infrastructure/compilers/kernel/runtime/brand-theme/index.ts',
    kind: 'file',
    describes:
      'canonical static BrandTheme compiler (palette, typography, material, motion and chrome root channels)',
  }),
  appearanceEmitter: Object.freeze({
    id: 'appearance-emitter',
    path: 'src/infrastructure/compilers/kernel/runtime/appearance/index.ts',
    kind: 'file',
    describes:
      'canonical DB appearance compiler (tenant-authored runtime root channels)',
  }),
  themeContracts: Object.freeze({
    id: 'theme-contracts',
    path: 'src/foundation/contracts',
    kind: 'directory',
    describes:
      'typed BrandTheme/TenantAppearance ownership graph used to expand mapped compiler emissions',
  }),
  styleRoots: Object.freeze({
    id: 'authored-ds-css',
    path: 'src/foundation/tokens/css',
    kind: 'directory',
    minimum: 100,
    describes: 'authored DS stylesheets (root declarations = DS-owned foundation tokens)',
  }),
  componentReads: Object.freeze({
    id: 'component-sources',
    path: 'src/ui',
    kind: 'directory',
    minimum: 100,
    describes: 'DS component sources (var() reads = consumption without ownership)',
  }),
});

/**
 * OWNER-REVIEWED PROMOTIONS — the exported customization contract's positive list.
 *
 * A promotion says: this `--ds-*` property is a per-context COMPONENT SLOT, and an
 * application may assign it under its own feature scope. Promotion is never
 * automatic and never bulk: the derivation classifies a property as DS-owned, and
 * only an entry here — with the seven declared fields — overrides that.
 *
 * Every entry answers the same seven questions, because those are what an app
 * developer needs in order to consume the contract without reading DS source:
 *   owner            which component/family actually reads the property
 *   slot             the scope under which assigning it is supported
 *   valueType        what may be assigned
 *   fallback         what resolves when nobody assigns it
 *   sinceVersion     when the slot became public
 *   whiteLabelCompat what a tenant still controls through it (see below)
 *   subtreeRepaint   the blast radius, so "repaints a whole DS subtree" is a
 *                    stated fact rather than an unknown
 *
 * whiteLabelCompat vocabulary:
 *   not-tenant-emitted  the chrome compiler never writes this name, so no tenant
 *                       decision can be overridden by a scoped app write.
 *   propagates-channel  the app value reads the tenant's own channel, so the
 *                       tenant's value still lands inside the scope.
 *   derives-from-palette the app value chains through tenant palette/surface
 *                       tokens, so brand colour propagates — but a tenant's
 *                       explicit override of THIS channel does not reach the
 *                       scope. This is the residual white-label risk, and it is
 *                       declared here rather than buried in a baseline.
 *
 * The value constraint below is enforced, not advisory: an assignment to a
 * promoted hook may not contain a raw colour literal. A promoted slot exists so
 * an application can re-express a tenant's own tokens for one surface, never so
 * it can hard-code a brand colour the tenant cannot change.
 */
export const PROMOTED_HOOK_VALUE_CONSTRAINT = Object.freeze({
  id: 'tenant-derived',
  describes:
    'an assignment to a promoted hook must chain through DS/tenant tokens; a raw ' +
    'colour literal would pin brand paint an application user cannot re-theme',
  // Colour literals only. Geometry literals (12px, 0.045, none, max-content) are
  // structure, not brand, and are the normal content of a layout slot.
  forbiddenValue: /#[0-9a-fA-F]{3,8}\b|\b(?:rgba?|hsla?|oklch|oklab|lab|lch)\s*\(/,
});

export const PROMOTIONS = Object.freeze([
  Object.freeze({
    id: 'command-grid-overlay',
    properties: Object.freeze(['--ds-command-grid-opacity']),
    owner: 'the decorative command-grid overlay, `:where(.ds-command-grid)` in presentation/components/patterns.css',
    slot: 'any application feature scope that contains a command-grid overlay',
    valueType: '<number> in 0..1',
    fallback: '0.18 at the read site; 0.16 is the DS default declaration',
    sinceVersion: '2.19.36',
    whiteLabelCompat: 'not-tenant-emitted',
    subtreeRepaint:
      'one absolutely-positioned, pointer-events:none decorative element. No text, ' +
      'control or surface below the scope changes.',
    rationale:
      'The overlay exists to sit at different strengths on a hero, a matrix and a ' +
      'card; a single global opacity cannot serve all three. The chrome compiler ' +
      'emits the rest of the --ds-command-* family but deliberately not this one, ' +
      'so no tenant decision is at stake.',
  }),
  Object.freeze({
    id: 'chart-plot-surface',
    properties: Object.freeze(['--ds-chart-plot-bg']),
    owner: 'chart gridline/axis strokes in presentation/components/skin/chart-foundation.css',
    slot: 'the chart panel element of an application chart surface',
    valueType: '<color> or <image> resolving through DS surface tokens',
    fallback: 'var(--ds-color-bg-primary) at every read site',
    sinceVersion: '2.19.36',
    whiteLabelCompat: 'not-tenant-emitted',
    subtreeRepaint:
      'the plotting area of the chart that owns the scope; sibling charts and all ' +
      'surrounding chrome are untouched.',
    rationale:
      'Read with the documented component-variable fallback, which is the DS saying ' +
      'the panel may supply its own plot surface. Activity, heatmap and team charts ' +
      'each need a different plot ground within one page.',
  }),
  Object.freeze({
    id: 'listing-grid-geometry',
    properties: Object.freeze(['--ds-listing-grid-min-card-width', '--ds-listing-grid-gap']),
    owner: 'collection grid layout (surfaces render-dispatch, presentation/components/patterns.css)',
    slot: 'an application collection/flow scope',
    valueType: '<length>',
    fallback: 'the tenant-compiled listing grid geometry',
    sinceVersion: '2.19.36',
    whiteLabelCompat: 'derives-from-palette',
    subtreeRepaint:
      'grid track sizing inside the one collection that owns the scope. Geometry ' +
      'only — no colour, border or shadow is re-derived.',
    rationale:
      'Density is a per-collection editorial decision: an applications board and an ' +
      'AI-interview board carry different card counts per row at the same brand. The ' +
      'tenant still owns every painted value of the grid.',
  }),
  Object.freeze({
    id: 'signal-card-tone',
    properties: Object.freeze(['--ds-signal-card-accent', '--ds-signal-card-soft']),
    owner: 'the signal-card skin (premium card chrome family)',
    slot: 'an application card scope carrying a semantic tone attribute (data-signal-tone / data-metric-tone)',
    valueType: '<color> resolving through DS semantic colour tokens',
    fallback: 'the tenant-compiled signal-card accent',
    sinceVersion: '2.19.36',
    whiteLabelCompat: 'derives-from-palette',
    subtreeRepaint:
      'the accent rule, soft wash and icon chip of the single card that owns the ' +
      'scope.',
    rationale:
      'A signal card states success, warning or error. Those are semantic roles the ' +
      'tenant already owns as --ds-color-success/-warning/-error, and the tone ' +
      'attribute selects among them; the single compiled accent cannot express six ' +
      'tones at once. Every assignment chains to a tenant semantic colour.',
  }),
  Object.freeze({
    id: 'metric-card-anatomy',
    properties: Object.freeze([
      '--ds-metric-card-bg',
      '--ds-metric-card-shadow',
      '--ds-metric-card-shadow-hover',
      '--ds-metric-card-padding',
      '--ds-metric-card-min-height',
    ]),
    owner: 'the metric-card structure (ui/structures/dashboard/insights) and premium card chrome',
    slot: 'an application metric-card scope under a declared anatomy axis (data-anatomy-card / data-anatomy-layout)',
    valueType: '<length> for padding/min-height; DS shadow and surface tokens for bg/shadow',
    fallback: 'the tenant-compiled metric-card chrome',
    sinceVersion: '2.19.36',
    whiteLabelCompat: 'derives-from-palette',
    subtreeRepaint: 'metric cards inside the declared anatomy scope only.',
    rationale:
      'The anatomy axis is a product-level layout mode (underline vs floating) that ' +
      'the DS exposes precisely so a vertical can restate card elevation and rhythm. ' +
      'The values re-express DS tokens — var(--ds-card-bg), var(--ds-shadow-none), ' +
      'var(--ds-spacing-4) — so the tenant palette continues to propagate.',
  }),
  Object.freeze({
    id: 'tabs-chrome',
    properties: Object.freeze([
      '--ds-tabs-list-bg',
      '--ds-tabs-list-border',
      '--ds-tabs-list-radius',
      '--ds-tabs-list-padding',
      '--ds-tabs-list-width',
      '--ds-tabs-list-max-width',
      '--ds-tabs-item-radius',
      '--ds-tabs-gap',
      '--ds-tabs-md-height',
      '--ds-tabs-active-bg',
      '--ds-tabs-active-shadow',
      '--ds-tabs-icon-bg',
      '--ds-tabs-icon-bg-active',
      '--ds-tab-bg-hover',
      '--ds-tab-color',
      '--ds-tab-color-hover',
      '--ds-tab-color-active',
    ]),
    owner: 'the Tabs primitive skin across engines',
    slot: 'a single application tab-strip scope',
    valueType: 'DS surface/colour/spacing/radius tokens; no raw literals',
    fallback: 'the tenant-compiled tabs chrome (BrandTheme chrome.tabs)',
    sinceVersion: '2.19.36',
    whiteLabelCompat: 'derives-from-palette',
    subtreeRepaint:
      'the one tab strip that owns the scope. RESIDUAL RISK: a tenant that sets ' +
      'chrome.tabs does not reach inside this scope. Declared, not hidden — this ' +
      'family is the strongest candidate for a DS-side per-scope override slot.',
    rationale:
      'Eight of these names the DS reads but never declares, which is the ' +
      'component-variable pattern in its purest form: the DS asks the context for a ' +
      'value. The feature tab strip is a navigational identity surface a vertical is ' +
      'expected to shape. Every value chains through --ds-surface-*, --ds-color-* ' +
      'and --ds-spacing-*, so a tenant palette change still flows through.',
  }),
  Object.freeze({
    id: 'button-variant-chrome',
    properties: Object.freeze([
      '--ds-button-default-bg',
      '--ds-button-default-bg-hover',
      '--ds-button-default-border',
      '--ds-button-default-border-hover',
      '--ds-button-secondary-bg',
      '--ds-button-secondary-bg-hover',
      '--ds-button-secondary-bg-active',
      '--ds-button-secondary-border',
      '--ds-button-secondary-border-hover',
      '--ds-button-secondary-color',
      '--ds-button-default-hover-bg',
      '--ds-button-secondary-hover-bg',
      '--ds-button-danger-bg',
      '--ds-button-danger-hover-bg',
      '--ds-button-danger-border',
      '--ds-button-error-bg',
      '--ds-button-error-bg-hover',
      '--ds-button-error-border',
      '--ds-button-ghost-bg',
      '--ds-button-disabled-bg',
      '--ds-button-disabled-border',
      '--ds-button-disabled-border-color',
      '--ds-button-disabled-color',
      '--ds-button-disabled-opacity',
    ]),
    owner: 'the Button primitive skin across engines (modern/rustic/classic) and the Button contract tokens',
    slot: 'an explicit application control scope — a chip, suggestion, choice option, icon button or detail action bar',
    valueType: 'DS surface/colour tokens and color-mix over them; no raw literals',
    fallback: 'the tenant-compiled button chrome (BrandTheme chrome.controls)',
    sinceVersion: '2.19.36',
    whiteLabelCompat: 'derives-from-palette',
    subtreeRepaint:
      'buttons rendered inside the declared control scope. RESIDUAL RISK: a tenant ' +
      'that sets chrome.controls for these variants does not reach inside the scope. ' +
      'Declared, not hidden.',
    rationale:
      'The app re-uses the Button primitive to render chips and toggle options rather ' +
      'than rebuilding a native control — which is the outcome the DS wants — and a ' +
      'chip is not painted like a form button. Two entries ' +
      '(--ds-button-*-bg-hover assigned from --ds-button-*-hover-bg) are pure ' +
      'bridges over a DS naming split and propagate the tenant value verbatim.',
  }),
  Object.freeze({
    id: 'control-geometry',
    properties: Object.freeze(['--ds-button-sm-padding-x', '--ds-radius-button']),
    owner: 'button sizing in the engine skins; --ds-radius-button in the control geometry family',
    slot: 'an explicit application control scope',
    valueType: '<length>',
    fallback: 'the tenant-compiled control geometry',
    sinceVersion: '2.19.36',
    whiteLabelCompat: 'derives-from-palette',
    subtreeRepaint: 'geometry of the controls inside the scope; no painted value changes.',
    rationale:
      'A square icon button needs zero horizontal padding and a pill chip needs a full ' +
      'radius, whatever the brand. Shape follows the control role, not the tenant.',
  }),
  Object.freeze({
    id: 'table-in-card-bridge',
    properties: Object.freeze([
      '--ds-table-bg',
      '--ds-table-border',
      '--ds-table-row-bg',
      '--ds-table-cell-color',
      '--ds-card-bg',
      '--ds-card-border',
      '--ds-card-body-color',
    ]),
    owner: 'the Table and Card primitives',
    slot: 'the composition scope where a table is nested inside a card surface',
    valueType: 'the keyword `inherit`, or a var() read of the sibling channel',
    fallback: 'the tenant-compiled table and card chrome',
    sinceVersion: '2.19.36',
    whiteLabelCompat: 'propagates-channel',
    subtreeRepaint:
      'the table/card pair inside the composition scope. No value is invented: each ' +
      'assignment either inherits or reads the sibling primitive channel.',
    rationale:
      'Composing two DS primitives into one visual object requires telling the inner ' +
      'one to stop painting its own frame. Every assignment here is `inherit` or a ' +
      'direct read of the tenant channel it bridges, so the tenant value reaches the ' +
      'scope unchanged — this family overrides nothing.',
  }),
  Object.freeze({
    id: 'workspace-shell-overlay',
    properties: Object.freeze(['--ds-workspace-shell-overlay']),
    owner: 'the workspace shell frame',
    slot: 'a declared workspace frame variant',
    valueType: '<image> or the keyword `none`',
    fallback: 'the tenant-compiled workspace shell overlay',
    sinceVersion: '2.19.36',
    whiteLabelCompat: 'derives-from-palette',
    subtreeRepaint: 'the decorative overlay layer of the one frame that owns the scope.',
    rationale:
      'A detail frame suppresses the workspace overlay so the record content is the ' +
      'only figure on the page. Suppression is a layout decision the frame variant ' +
      'exists to express.',
  }),
  Object.freeze({
    id: 'application-shell-composition',
    properties: Object.freeze([
      '--ds-shell-navigation-border',
      '--ds-shell-navigation-border-inline-end',
      '--ds-shell-navigation-radius',
      '--ds-shell-navigation-shadow',
      '--ds-shell-navigation-body-padding',
      '--ds-shell-navigation-logo-padding',
      '--ds-shell-navigation-footer-padding',
      '--ds-shell-header-inset-block-start',
      '--ds-shell-header-inset-inline',
      '--ds-shell-header-padding-inline',
      '--ds-shell-header-background',
      '--ds-shell-header-border',
      '--ds-shell-header-border-block-end',
      '--ds-shell-header-radius',
      '--ds-shell-header-shadow',
      '--ds-shell-bottom-inset',
    ]),
    owner: 'the application shell, navigation and header structures',
    slot: 'one vertical application-shell scope',
    valueType: 'DS spacing/radius/elevation/surface tokens and structural lengths; no raw colours',
    fallback: 'the shell structure defaults resolved from tenant channels',
    sinceVersion: '2.19.36',
    whiteLabelCompat: 'derives-from-palette',
    subtreeRepaint:
      'the navigation and header chrome of the one application shell that owns the scope.',
    rationale:
      'A vertical may compose its navigation as inset, flush or floating without ' +
      'forking the shell. Paint remains chained through tenant surface, border and ' +
      'elevation channels; the application only selects the composition posture.',
  }),
  Object.freeze({
    id: 'record-and-empty-state-geometry',
    properties: Object.freeze([
      '--ds-record-facts-header-height',
      '--ds-record-facts-header-padding',
      '--ds-record-facts-compact-item-height',
      '--ds-record-facts-compact-item-padding',
      '--ds-empty-state-card-padding-block',
      '--ds-empty-state-card-padding-inline',
    ]),
    owner: 'RecordFacts and EmptyState presentation families',
    slot: 'one record-facts or empty-state surface scope',
    valueType: 'DS spacing tokens or structural <length> values',
    fallback: 'the component family geometry',
    sinceVersion: '2.19.36',
    whiteLabelCompat: 'not-tenant-emitted',
    subtreeRepaint: 'geometry of the one record or empty-state surface; no paint changes.',
    rationale:
      'Record density and empty-state copy length are content-dependent composition ' +
      'decisions. Exposing their local geometry keeps products on the canonical ' +
      'components without giving the application ownership of global spacing tokens.',
  }),
  Object.freeze({
    id: 'action-dock-and-sheet-geometry',
    properties: Object.freeze([
      '--ds-action-dock-gap',
      '--ds-action-dock-safe-area-bottom',
      '--ds-action-dock-z-index',
      '--ds-sheet-max-height',
    ]),
    owner: 'ActionDock and Sheet overlay structures',
    slot: 'one mobile action-dock or sheet scope',
    valueType: 'DS spacing/z-index channels or structural <length> values',
    fallback: 'the component safe-area, stacking and sheet-size defaults',
    sinceVersion: '2.19.36',
    whiteLabelCompat: 'not-tenant-emitted',
    subtreeRepaint: 'the one mobile dock or sheet instance in the scope.',
    rationale:
      'Safe areas, host stacking contexts and available mobile height belong to the ' +
      'embedding product. The hooks keep those constraints local while preserving the ' +
      'canonical dock and sheet implementations.',
  }),
  Object.freeze({
    id: 'filter-panel-inline-composition',
    properties: Object.freeze([
      '--ds-filter-panel-inline-wrap',
      '--ds-filter-panel-inline-flex',
      '--ds-filter-panel-inline-min-width',
      '--ds-filter-panel-inline-control-width',
    ]),
    owner: 'the FilterPanel inline layout',
    slot: 'one inline filter-panel scope',
    valueType: 'CSS flex/wrap keywords and structural lengths',
    fallback: 'the responsive FilterPanel layout defaults',
    sinceVersion: '2.19.36',
    whiteLabelCompat: 'not-tenant-emitted',
    subtreeRepaint: 'inline control geometry of the one filter panel; no paint changes.',
    rationale:
      'The host collection determines how many filters share a row. These hooks expose ' +
      'that composition decision without allowing the app to restyle FilterPanel chrome.',
  }),
  Object.freeze({
    id: 'progress-semantic-accent',
    properties: Object.freeze(['--ds-progress-arc-color']),
    owner: 'the circular Progress primitive arc',
    slot: 'one semantic metric or progress scope',
    valueType: '<color> resolving through a DS/tenant semantic colour token',
    fallback: 'the Progress semantic accent',
    sinceVersion: '2.19.36',
    whiteLabelCompat: 'derives-from-palette',
    subtreeRepaint: 'the arc of the one progress indicator in the scope.',
    rationale:
      'Progress communicates different semantic roles in one page. The product selects ' +
      'the role while the tenant palette continues to provide the actual colour.',
  }),
]);

function assertAnchorExists(coreRoot, anchor) {
  const absolute = resolve(coreRoot, anchor.path);
  let stats;
  try {
    stats = statSync(absolute);
  } catch {
    throw new Error(
      `hook-manifest anchor MISSING: ${anchor.id} expected ${anchor.kind} at ${anchor.path}\n` +
        `  this anchor ${anchor.describes}\n` +
        '  the manifest cannot be derived without it and must not fall back to a hand-list.\n' +
        '  if the source moved, update ANCHORS in scripts/lib/ds-hook-manifest.mjs.',
    );
  }
  const kindOk = anchor.kind === 'directory' ? stats.isDirectory() : stats.isFile();
  if (!kindOk) {
    throw new Error(
      `hook-manifest anchor WRONG KIND: ${anchor.id} at ${anchor.path} is not a ${anchor.kind}`,
    );
  }
  return absolute;
}

function collectFiles(root, extensions) {
  const found = [];
  const walk = (directory) => {
    let entries;
    try {
      entries = readdirSync(directory, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      const full = join(directory, entry.name);
      // Match against the path RELATIVE TO THE ANCHOR, never the bare entry
      // name: the exclusions are multi-segment (`facade/artifacts`) and a
      // name-only test would silently admit every generated artifact — exactly
      // the circularity this module exists to prevent.
      const relativePath = relative(root, full);
      if (EXCLUDED_PATH.test(`${sep}${relativePath}${sep}`)) continue;
      if (entry.isDirectory()) {
        walk(full);
        continue;
      }
      if (extensions.some((extension) => entry.name.endsWith(extension))) found.push(full);
    }
  };
  walk(root);
  return found.sort();
}

/**
 * Walk a stylesheet's rule tree with postcss and split `--ds-*` declarations
 * into root-equivalent and scoped, resolving CSS nesting on the way down.
 */
function scanStylesheet(postcss, css, onDeclaration) {
  const root = postcss.parse(css);
  const visit = (container, parentSelectors) => {
    for (const node of container.nodes ?? []) {
      if (node.type === 'decl') {
        if (node.prop?.startsWith('--ds-')) onDeclaration(node.prop, parentSelectors);
        continue;
      }
      if (node.type === 'rule') {
        visit(node, resolveNestedSelectors(parentSelectors, node.selector));
        continue;
      }
      if (node.type === 'atrule') {
        // `@media`/`@supports` do not change the subject; `@layer`/`@scope`
        // blocks keep the enclosing selector context.
        visit(node, parentSelectors);
      }
    }
  };
  visit(root, []);
  return root;
}

/**
 * Derive the manifest. `postcss` is injected so drills can run without the
 * dependency resolving from a temporary fixture directory.
 */
export function deriveHookManifest({ coreRoot, postcss, promotions = PROMOTIONS }) {
  if (!coreRoot) throw new Error('deriveHookManifest requires coreRoot');
  if (!postcss) throw new Error('deriveHookManifest requires an injected postcss');

  const chromePath = assertAnchorExists(coreRoot, ANCHORS.tenantChannel);
  const brandThemeEmitterPath = assertAnchorExists(coreRoot, ANCHORS.brandThemeEmitter);
  const appearanceEmitterPath = assertAnchorExists(coreRoot, ANCHORS.appearanceEmitter);
  const themeContractsRoot = assertAnchorExists(coreRoot, ANCHORS.themeContracts);
  const stylesRoot = assertAnchorExists(coreRoot, ANCHORS.styleRoots);
  const componentRoot = assertAnchorExists(coreRoot, ANCHORS.componentReads);

  // A1 — tenant channel. The chrome emitter still gets its stricter local
  // derivation because it builds many names through helpers and interpolation.
  // The full static/DB compiler graph is then unioned in through the shared
  // typed parser used by theme-channel-parity-gate. Reusing that parser is a
  // deliberate single-system choice: public-hook ownership and theme parity
  // cannot disagree about what a compiler emits.
  //
  // Assignment KEYS only: `vars["--ds-card-bg"] =` and object-literal keys. A
  // `--ds-*` inside a value string is a read, not an emission.
  // The quote must CLOSE immediately after the property name (backreference
  // \1). Without that, a template literal carrying CSS text —
  // `` `--ds-listing-grid-gap: ${value};` `` — reads as an emission key and
  // wrongly promotes a hook into the tenant-owned channel.
  const chromeSource = readFileSync(chromePath, 'utf8');
  const tenantChannel = new Set();
  for (const match of chromeSource.matchAll(/\[\s*(["'`])(--ds-[a-z0-9-]+)\1\s*\]\s*=/g)) {
    tenantChannel.add(match[2]);
  }
  for (const match of chromeSource.matchAll(/(["'`])(--ds-[a-z0-9-]+)\1\s*:/g)) {
    tenantChannel.add(match[2]);
  }

  // A1b — the families the emitter builds by interpolation. Without these the
  // channel is under-reported and app writes onto tenant-owned button, card and
  // control-size variables read as ordinary foundation tokens or open hooks.
  const interpolated = deriveInterpolatedEmissions(chromeSource);
  for (const name of interpolated.names) tenantChannel.add(name);

  const contractFiles = collectFiles(themeContractsRoot, ['.ts']);
  const contractSources = contractFiles.map((file) => ({
    file,
    text: readFileSync(file, 'utf8'),
  }));
  const { registry, ambiguous } = parseTypeRegistry(contractSources);
  const compilerSources = [chromePath, brandThemeEmitterPath, appearanceEmitterPath].map(
    (file) => ({ file, text: readFileSync(file, 'utf8') }),
  );
  const compilerGraph = parseEmitterMappings(compilerSources, registry);
  const compilerPatterns = new Set();
  for (const emission of compilerGraph.emissions) {
    if (emission.name) tenantChannel.add(emission.name);
    if (emission.pattern) compilerPatterns.add(emission.pattern);
  }

  // A2 — authored DS stylesheets: root-equivalent declarations are DS-owned.
  const styleFiles = collectFiles(stylesRoot, ['.css']);
  const foundationTokens = new Set();
  const scopedDeclarations = new Set();
  const componentSuppliers = new Set();
  const reads = new Set();
  for (const file of styleFiles) {
    const css = readFileSync(file, 'utf8');
    try {
      const stylesheet = scanStylesheet(postcss, css, (property, selectors) => {
        const rootEquivalent =
          selectors.length === 0 || selectors.some((selector) => isRootEquivalentSelector(selector));
        if (rootEquivalent) foundationTokens.add(property);
        else scopedDeclarations.add(property);
      });
      stylesheet.walkDecls((declaration) => {
        for (const property of cssDeclarationReads(declaration.value ?? '')) reads.add(property);
      });
    } catch (error) {
      throw new Error(
        `hook-manifest: unparseable DS stylesheet ${relative(coreRoot, file)}: ${error.message}`,
      );
    }
  }

  // A3/A5 — component sources contribute exact reads and exact local
  // suppliers. A read with no supplier remains unadjudicated; a supplied
  // component channel is DS-owned and closed unless PROMOTIONS explicitly
  // exposes it.
  const componentFiles = collectFiles(componentRoot, ['.ts', '.tsx']);
  for (const file of componentFiles) {
    const source = readFileSync(file, 'utf8');
    for (const property of componentSourceReads(source, file)) reads.add(property);
    for (const property of componentSourceSuppliers(source, file)) {
      componentSuppliers.add(property);
    }
  }

  // Owner-reviewed promotions (see PROMOTIONS). The derivation refuses to promote
  // a property the DS does not actually read: a promotion may legalise tuning of a
  // channel the DS consumes, never conjure a hook out of a name nothing consumes.
  const promoted = [];
  const refusedPromotions = [];
  for (const family of promotions) {
    for (const property of family.properties) {
      if (reads.has(property)) promoted.push(property);
      else refusedPromotions.push({ property, family: family.id });
    }
  }
  const promotedSet = new Set(promoted);
  const componentTokens = new Set(
    [...reads].filter(
      (property) =>
        scopedDeclarations.has(property) ||
        componentSuppliers.has(property),
    ),
  );
  const unownedReads = [...reads].filter(
    (property) =>
      !foundationTokens.has(property) &&
      !tenantChannel.has(property) &&
      !componentTokens.has(property),
  );
  const hooks = [...promotedSet].sort();
  const unadjudicatedReads = [...new Set(
    unownedReads.filter((property) => !promotedSet.has(property)),
  )].sort();

  const yields = {
    tenantChannel: tenantChannel.size,
    compilerConcreteEmissions: compilerGraph.emissions.filter((emission) => emission.name).length,
    compilerEmissionPatterns: compilerPatterns.size,
    themeContractFiles: contractFiles.length,
    ambiguousThemeContractTypes: ambiguous.length,
    unresolvedCompilerEmissions: compilerGraph.unresolved.length,
    interpolatedFamilies: interpolated.families.length,
    interpolatedNames: interpolated.names.size,
    foundationTokens: foundationTokens.size,
    componentTokens: componentTokens.size,
    componentSuppliers: componentSuppliers.size,
    reads: reads.size,
    hooks: hooks.length,
    unadjudicatedReads: unadjudicatedReads.length,
    promoted: promoted.length,
    styleFiles: styleFiles.length,
    componentFiles: componentFiles.length,
  };

  const shortfalls = [];
  // The interpolated families are the half of the channel a literal-key scan
  // cannot see. If they stop expanding — a refactor to a lookup table, a helper
  // renamed, arguments moved behind a constant — the channel silently halves and
  // tenant-owned names start reading as open hooks. That must be fatal, not quiet.
  if (interpolated.families.length < ANCHORS.tenantChannel.interpolatedFamilyMinimum) {
    shortfalls.push(
      `${ANCHORS.tenantChannel.id}: ${interpolated.families.length} interpolated emission ` +
        `families (< ${ANCHORS.tenantChannel.interpolatedFamilyMinimum}) — the emitter's ` +
        '`vars[`--ds-${…}`]` templates no longer expand',
    );
  }
  if (refusedPromotions.length > 0) {
    shortfalls.push(
      'promotions name properties the DS does not read: ' +
        refusedPromotions.map((entry) => `${entry.property} (${entry.family})`).join(', ') +
        '\n    a promotion legalises tuning of a channel the DS consumes; it cannot invent one.' +
        '\n    Either the read moved and PROMOTIONS must follow it, or the entry is stale.',
    );
  }
  if (contractFiles.length === 0) {
    shortfalls.push(`${ANCHORS.themeContracts.id}: no authored contract sources found`);
  }
  if (ambiguous.length > 0) {
    shortfalls.push(
      `${ANCHORS.themeContracts.id}: ambiguous type ownership for ${ambiguous.join(', ')}`,
    );
  }
  if (compilerGraph.unresolved.length > 0) {
    shortfalls.push(
      `compiler ownership graph has ${compilerGraph.unresolved.length} unresolved emissions`,
    );
  }
  if (yields.compilerConcreteEmissions === 0) {
    shortfalls.push('no concrete static/DB compiler emissions found');
  }
  if (yields.tenantChannel < ANCHORS.tenantChannel.minimum) {
    shortfalls.push(
      `${ANCHORS.tenantChannel.id}: ${yields.tenantChannel} emitted names (< ${ANCHORS.tenantChannel.minimum})`,
    );
  }
  if (yields.styleFiles < ANCHORS.styleRoots.minimum) {
    shortfalls.push(
      `${ANCHORS.styleRoots.id}: ${yields.styleFiles} stylesheets (< ${ANCHORS.styleRoots.minimum})`,
    );
  }
  if (yields.componentFiles < ANCHORS.componentReads.minimum) {
    shortfalls.push(
      `${ANCHORS.componentReads.id}: ${yields.componentFiles} sources (< ${ANCHORS.componentReads.minimum})`,
    );
  }
  if (yields.foundationTokens === 0) shortfalls.push('no root-declared foundation tokens found');
  if (shortfalls.length > 0) {
    throw new Error(
      'hook-manifest ANCHOR DRIFT: a derivation source yielded implausibly little.\n' +
        shortfalls.map((line) => `  - ${line}`).join('\n') +
        '\n  Refusing to emit a partial allowlist: a short manifest silently reclassifies\n' +
        '  legal hook writes as violations and legalizes DS-owned root tokens.',
    );
  }

  return {
    schemaVersion: 4,
    hooks,
    hookSet: new Set(hooks),
    unadjudicatedReads,
    unadjudicatedReadSet: new Set(unadjudicatedReads),
    foundationTokens: new Set(foundationTokens),
    tenantChannel,
    componentTokens,
    componentTokenSet: new Set(componentTokens),
    scopedDeclarations,
    promotions,
    promotedSet,
    interpolatedFamilies: interpolated.families,
    compilerEmissionPatterns: [...compilerPatterns].sort(),
    yields,
  };
}

/**
 * THE CONSUMABLE PUBLIC ARTIFACT.
 *
 * This is what an application developer reads instead of the DS source, and what
 * the freshness gate byte-compares against a re-derivation. It answers three
 * questions in the order a consumer asks them: what may I assign, what are the
 * declared slots and their terms, and what is closed to me and why.
 *
 * `generatedFrom` records the anchors so a stale artifact is diagnosable rather
 * than merely wrong.
 */
export function serializeHookManifest(manifest) {
  const declarations = {};
  for (const family of manifest.promotions) {
    for (const property of family.properties) {
      if (!manifest.hookSet.has(property)) continue;
      declarations[property] = {
        family: family.id,
        owner: family.owner,
        slot: family.slot,
        valueType: family.valueType,
        fallback: family.fallback,
        sinceVersion: family.sinceVersion,
        whiteLabelCompat: family.whiteLabelCompat,
        subtreeRepaint: family.subtreeRepaint,
        rationale: family.rationale,
      };
    }
  }

  return `${JSON.stringify(
    {
      schemaVersion: manifest.schemaVersion,
      generatedBy: 'scripts/app-ds-hook-contract-gate.mjs --manifest-write',
      generatedFrom: Object.values(ANCHORS).map((anchor) => ({
        id: anchor.id,
        path: anchor.path,
        describes: anchor.describes,
      })),
      derivation: {
        publicHook:
          'read by the DS via var() and explicitly promoted with a complete owner-reviewed ' +
          'slot declaration; no implicit read becomes application API',
        unadjudicatedRead:
          'read by the DS via var() but owned by neither a governed tenant compiler channel ' +
          'nor a DS root/internal declaration and not explicitly promoted; decrease-only debt, not API',
        componentToken:
          'supplied below root by authored component CSS/source; a DS-owned component channel, ' +
          'not tenant configuration or application API',
        foundationToken: 'root-declared in authored DS CSS; the DS owns the value',
        tenantChannel:
          'emitted at :root by the governed chrome, static BrandTheme or DB appearance ' +
          'compiler on behalf of a tenant; concrete outputs are derived with the same typed ' +
          'graph as theme-channel parity, plus chrome interpolation families',
      },
      contract: {
        mayAssign:
          'only a property listed in publicHooks, under an explicit application/feature scope',
        mustNotAssign:
          'anything in foundationTokens, tenantChannel, componentTokens or unadjudicatedReads; private ' +
          '--_ds-* properties; and nothing at all on a root or root-equivalent selector',
        appNamespace: '--rt-* is application-owned and always legal, including at root',
        valueConstraint: PROMOTED_HOOK_VALUE_CONSTRAINT.describes,
      },
      counts: manifest.yields,
      declaredSlots: declarations,
      publicHooks: manifest.hooks,
      unadjudicatedReads: manifest.unadjudicatedReads,
      componentTokens: [...manifest.componentTokens].sort(),
      foundationTokens: [...manifest.foundationTokens].sort(),
      tenantChannel: [...manifest.tenantChannel].sort(),
    },
    null,
    2,
  )}\n`;
}
