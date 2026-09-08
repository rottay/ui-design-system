/**
 * @fileoverview The MUST-BE side of the converse ratchet: every `--ds-*` name a
 * tenant can actually reach, by any of the three routes.
 *
 * THE QUESTION NOTHING ELSE ASKS. `tenant-channel-consumer-gate` enumerates
 * DECLARED channels and hunts for readers — the dead-dial direction, and it is
 * blind here by construction: `--ds-color-border` has hundreds of readers and
 * is not a declared channel, so it can never appear in that gate's output.
 * `theme-channel-parity-gate` asks whether a name is OWNED by some typed field,
 * which static BrandTheme ownership satisfies without any tenant being able to
 * write it. This module asks the third question: *can the tenant reach this?*
 *
 * INTERPOLATED EMISSIONS ARE INVISIBLE TO TEXT SCANS, and that is the trap this
 * module is built around. `--ds-metric-card-bg` appears nowhere in the source:
 * it is emitted by `setPremiumCardVars(vars, "metric-card", …)` through
 * `` `--ds-${namespace}-bg` ``. A reach set built by grepping would miss every
 * such name and report it as unreachable — inflating the defect count with
 * names that are perfectly reachable. So interpolated families are ENUMERATED
 * from the code: the emitter's template skeletons are read from its body, and
 * its value sets are read from its call sites.
 *
 * THE TOTALITY CHECK IS WHAT MAKES THAT SAFE. Enumerators are attributed to the
 * FUNCTION that emits, and every emitter function found in the corpus must have
 * one. An emitter nobody enumerated does not silently narrow the reach set — it
 * FAILS the gate with `E0-unattributed-emitter`. A silent miss here would
 * inflate the defect count, so the failure is loud and the direction is safe.
 *
 * NOT FROM `dist`. Every path below is committed source.
 */
import { existsSync, readFileSync } from 'node:fs';

export const CHROME_VARIABLES = 'packages/core/src/infrastructure/compilers/kernel/foundation/css/chrome-variables/index.ts';
/**
 * The theme lowering's channel writers: one owner per concern, so a template is
 * attributed to the writer that actually emits it rather than to whichever file
 * the compiler happened to be collapsed into.
 */
const LOWERING = 'packages/core/src/infrastructure/compilers/runtime/theme/runtime/lowering';
export const LOWERING_FOUNDATION_CHROME = `${LOWERING}/foundation/chrome/index.ts`;
export const LOWERING_FOUNDATION_FLOORS = `${LOWERING}/foundation/floors/index.ts`;
export const LOWERING_FOUNDATION_GROUND = `${LOWERING}/foundation/ground/index.ts`;
export const LOWERING_FOUNDATION_INTAKE = `${LOWERING}/foundation/intake/index.ts`;
export const LOWERING_FOUNDATION_MATERIALS = `${LOWERING}/foundation/materials/index.ts`;
export const LOWERING_FOUNDATION_MODE_OVERLAY = `${LOWERING}/foundation/mode-overlay/index.ts`;
export const LOWERING_FOUNDATION_MOTION = `${LOWERING}/foundation/motion/index.ts`;
export const LOWERING_FOUNDATION_PALETTE = `${LOWERING}/foundation/palette/index.ts`;
export const LOWERING_FOUNDATION_PERSONALITY = `${LOWERING}/foundation/personality/index.ts`;
export const LOWERING_FOUNDATION_RAMPS = `${LOWERING}/foundation/ramps/index.ts`;
export const LOWERING_FOUNDATION_SEEDS = `${LOWERING}/foundation/seeds/index.ts`;
export const LOWERING_FOUNDATION_SHAPE = `${LOWERING}/foundation/shape/index.ts`;
export const LOWERING_FOUNDATION_SIDEBAR = `${LOWERING}/foundation/sidebar/index.ts`;
export const LOWERING_FOUNDATION_TINT = `${LOWERING}/foundation/tint/index.ts`;
export const LOWERING_FOUNDATION_TYPE_RAMP = `${LOWERING}/foundation/type-ramp/index.ts`;
export const LOWERING_FOUNDATION_TYPOGRAPHY = `${LOWERING}/foundation/typography/index.ts`;
export const LOWERING_RUNTIME_MODE_BLOCKS = `${LOWERING}/runtime/mode-blocks/index.ts`;
export const LOWERING_FOUNDATION_CONTRACT = `${LOWERING}/foundation/contract/index.ts`;
export const LOWERING_FOUNDATION_DIAL = `${LOWERING}/foundation/dial/index.ts`;
export const LOWERING_FOUNDATION_EXPRESSIVE = `${LOWERING}/foundation/expressive/index.ts`;
const DERIVATION = `${LOWERING}/runtime/derivation`;
export const LOWERING_DERIVATION_CHARTS = `${DERIVATION}/charts/index.ts`;
export const LOWERING_RUNTIME_DERIVATION = Object.freeze([
  `${DERIVATION}/axes/index.ts`,
  LOWERING_DERIVATION_CHARTS,
  `${DERIVATION}/chrome/index.ts`,
  `${DERIVATION}/expressive/index.ts`,
  `${DERIVATION}/motion/index.ts`,
  `${DERIVATION}/palette/index.ts`,
  `${DERIVATION}/ramps/index.ts`,
  `${DERIVATION}/recipes/index.ts`,
  `${DERIVATION}/seeds/index.ts`,
  `${DERIVATION}/surfaces/index.ts`,
  `${DERIVATION}/tenant/index.ts`,
  `${DERIVATION}/tint/index.ts`,
  `${DERIVATION}/type-roles/index.ts`,
  `${DERIVATION}/typography/index.ts`,
]);
export const LOWERING_RUNTIME_PIPELINE = `${LOWERING}/runtime/pipeline/index.ts`;
export const LOWERING_ORCHESTRATION = `${LOWERING}/index.ts`;

/**
 * The lowering's canonical single owner, kept under its historical name.
 *
 * `scripts/check/modern-rescue/**` is a protected tree and one of its readers
 * imports this binding by name. The channel assembly it used to name is one
 * deriver per family behind a ranked merge now, so the single-owner spelling
 * points at the orchestrator that runs them. Readers that need every channel
 * writer take `LOWERING_SOURCES`.
 */
export const BRAND_THEME = LOWERING_RUNTIME_PIPELINE;
export const TENANT_THEME = 'packages/core/src/foundation/contracts/composition/tenants/themes/tenant-theme/index.ts';
export const LOWERING_SOURCES = Object.freeze([
  LOWERING_FOUNDATION_CHROME,
  LOWERING_FOUNDATION_FLOORS,
  LOWERING_FOUNDATION_GROUND,
  LOWERING_FOUNDATION_INTAKE,
  LOWERING_FOUNDATION_MATERIALS,
  LOWERING_FOUNDATION_MODE_OVERLAY,
  LOWERING_FOUNDATION_MOTION,
  LOWERING_FOUNDATION_PALETTE,
  LOWERING_FOUNDATION_PERSONALITY,
  LOWERING_FOUNDATION_RAMPS,
  LOWERING_FOUNDATION_SEEDS,
  LOWERING_FOUNDATION_SHAPE,
  LOWERING_FOUNDATION_SIDEBAR,
  LOWERING_FOUNDATION_TINT,
  LOWERING_FOUNDATION_TYPE_RAMP,
  LOWERING_FOUNDATION_TYPOGRAPHY,
  LOWERING_FOUNDATION_CONTRACT,
  LOWERING_FOUNDATION_DIAL,
  LOWERING_FOUNDATION_EXPRESSIVE,
  ...LOWERING_RUNTIME_DERIVATION,
  LOWERING_RUNTIME_PIPELINE,
  LOWERING_RUNTIME_MODE_BLOCKS,
  LOWERING_ORCHESTRATION,
]);

export const REACH_SOURCES = Object.freeze([
  CHROME_VARIABLES,
  ...LOWERING_SOURCES,
  TENANT_THEME,
]);

const read = (root, path) => readFileSync(`${root}/${path}`, 'utf8');

/* ────────────────────────── source scanning ────────────────────────── */

/**
 * Walk a balanced bracket pair from `at` (which must be the opening bracket)
 * and return the index of its closing partner, or -1.
 */
function closingBracket(source, at, open, close) {
  let depth = 0;
  for (let index = at; index < source.length; index += 1) {
    if (source[index] === open) depth += 1;
    else if (source[index] === close) {
      depth -= 1;
      if (depth === 0) return index;
    }
  }
  return -1;
}

/**
 * The `{` that opens a function's body, given the index of the `(` or `<` that
 * opens its signature.
 *
 * The signature has to be STEPPED OVER, not searched through. Taking the first
 * `{` after the function name finds a default parameter value instead:
 * `chromeToVariables(chrome, context: ChromeVariableContext = {})` handed back
 * a two-character body, the `size` loop inside the real body bound nothing, and
 * its two interpolated emitters were attributed to `<module>`. That is the
 * failure this gate is built to refuse — E0 held the line and refused to report
 * a number, which is why the miss surfaced as a red rather than as a quietly
 * inflated defect count.
 */
function bodyBraceAfterSignature(source, at) {
  let cursor = at;
  if (source[cursor] === '<') {
    cursor = closingBracket(source, cursor, '<', '>');
    if (cursor === -1) return -1;
    cursor = source.indexOf('(', cursor);
    if (cursor === -1) return -1;
  }
  const closingParen = closingBracket(source, cursor, '(', ')');
  if (closingParen === -1) return -1;
  // Return-type annotations in this corpus are named types (`Record<…>`,
  // `void`, `string`), never object literals, so the next `{` is the body.
  return source.indexOf('{', closingParen);
}

/** Every `function NAME(...) { … }` with the source range of its body. */
export function functionBodies(source) {
  const bodies = [];
  const pattern = /function\s+([A-Za-z0-9_$]+)\s*[(<]/g;
  let match = pattern.exec(source);
  while (match !== null) {
    const braceAt = bodyBraceAfterSignature(source, pattern.lastIndex - 1);
    if (braceAt !== -1) {
      let depth = 0;
      let end = braceAt;
      while (end < source.length) {
        if (source[end] === '{') depth += 1;
        else if (source[end] === '}') {
          depth -= 1;
          if (depth === 0) break;
        }
        end += 1;
      }
      bodies.push({ name: match[1], start: braceAt, end, body: source.slice(braceAt, end + 1) });
    }
    match = pattern.exec(source);
  }
  return bodies;
}

/** Every `vars[`…`] = …` template skeleton, with the function that emits it. */
export function templateEmissions(source) {
  const bodies = functionBodies(source);
  const emissions = [];
  const pattern = /vars\[`([^`]+)`\]\s*=/g;
  let match = pattern.exec(source);
  while (match !== null) {
    const owner = bodies.filter((fn) => match.index > fn.start && match.index < fn.end).sort((a, b) => b.start - a.start)[0];
    emissions.push({ template: match[1], owner: owner?.name ?? '<module>', index: match.index });
    match = pattern.exec(source);
  }
  return emissions;
}

/** Literal `--ds-*` strings — the greppable half of the reach set. */
export function literalTokens(source) {
  const found = new Set();
  for (const match of source.matchAll(/["'`](--ds-[A-Za-z0-9-]+)["'`]/g)) found.add(match[1]);
  return found;
}

/** `const NAME = ` … `` template assignments inside a function body. */
function localTemplate(body, name) {
  const match = new RegExp(`const\\s+${name}\\s*=\\s*\`([^\`]+)\``).exec(body);
  return match?.[1] ?? null;
}

/** Distinct literal arguments at a call site, by argument position. */
export function callSiteArguments(source, fnName, positions) {
  const sets = positions.map(() => new Set());
  const pattern = new RegExp(`${fnName}\\s*\\(([^)]*)\\)`, 'g');
  for (const match of source.matchAll(pattern)) {
    const args = match[1].split(',').map((entry) => entry.trim());
    positions.forEach((position, slot) => {
      const literal = /^["']([^"']+)["']$/.exec(args[position] ?? '');
      if (literal) sets[slot].add(literal[1]);
    });
  }
  return sets.map((set) => [...set].sort());
}

/**
 * Members of a `const NAME = [ … ] as const` array.
 *
 * NUMBERS COUNT. `RAMP_STEPS = [50, 100, …]` is unquoted, and a reader that
 * only took quoted strings returned an empty set — which silently produced
 * zero names for every colour-ramp emitter and would have reported the whole
 * ramp as tenant-unreachable. The totality check caught it; this is the fix.
 */
export function constArray(source, name) {
  const match = new RegExp(`${name}\\s*(?::[^=]+)?=\\s*\\[([^\\]]*)\\]`).exec(source);
  if (!match) return [];
  const quoted = [...match[1].matchAll(/["']([^"']+)["']/g)].map((entry) => entry[1]);
  if (quoted.length > 0) return quoted;
  return [...match[1].matchAll(/(?:^|[,[\s])(-?\d+(?:\.\d+)?)(?=\s*[,\]]|\s*$)/g)].map((entry) => entry[1]);
}

/**
 * `TENANT_THEME_OVERRIDE_TOKENS` — literal entries plus spreads.
 *
 * THE SPREADS ARE THEMSELVES CROSS-PRODUCTS. Neither expands to a list of
 * strings anybody can read:
 *
 *   const TENANT_SEMANTIC_SURFACE_TOKENS = ROLES.flatMap((role) =>
 *     FACETS.map((facet) => `--ds-material-${role}-${facet}`));
 *
 * So the same interpolation trap that hides `--ds-metric-card-bg` also hides
 * every name on the raw-dial allowlist. Reading the literal lines of this
 * array yields 67; resolving the spreads yields the real figure (67 literals
 * + 160 surface + 63 typography = 290 at the time of writing — derived, never
 * pinned here). Both spread
 * shapes are resolved here, and an unresolvable spread THROWS rather than
 * quietly shrinking the reach set — a smaller reach set means a larger
 * reported defect, so silence in this direction manufactures findings.
 */
function resolveCrossProduct(source, name) {
  const direct = new RegExp(`${name}\\s*(?::[^=]+)?=\\s*\\[([\\s\\S]*?)\\]\\s*as const`).exec(source);
  if (direct) return [...direct[1].matchAll(/["'](--ds-[A-Za-z0-9-]+)["']/g)].map((entry) => entry[1]);

  const product = new RegExp(
    `${name}\\s*(?::[^=]+)?=\\s*\\n?\\s*([A-Za-z0-9_]+)\\.flatMap\\([\\s\\S]*?([A-Za-z0-9_]+)\\.map\\([\\s\\S]*?\`([^\`]+)\``,
  ).exec(source);
  if (!product) return null;

  const [, outerName, innerName, template] = product;
  const outer = constArray(source, outerName);
  const inner = constArray(source, innerName);
  if (outer.length === 0 || inner.length === 0) return null;

  const holes = [...template.matchAll(/\$\{([^}]+)\}/g)].map((entry) => entry[0]);
  if (holes.length !== 2) return null;
  const names = [];
  for (const outerValue of outer) {
    for (const innerValue of inner) {
      names.push(template.replace(holes[0], outerValue).replace(holes[1], innerValue));
    }
  }
  return names;
}

export function overrideTokens(root) {
  const source = read(root, TENANT_THEME);
  const block = /TENANT_THEME_OVERRIDE_TOKENS\s*=\s*\[([\s\S]*?)\]\s*as const/.exec(source);
  if (!block) throw new Error('tenant-reach: TENANT_THEME_OVERRIDE_TOKENS not found — the allowlist moved');

  const literals = [...block[1].matchAll(/["'](--ds-[A-Za-z0-9-]+)["']/g)].map((entry) => entry[1]);
  const names = new Set(literals);
  const spreadNames = [...block[1].matchAll(/\.\.\.([A-Za-z0-9_]+)/g)].map((entry) => entry[1]);
  const spreads = [];

  for (const spread of spreadNames) {
    const resolved = resolveCrossProduct(source, spread);
    if (resolved === null) {
      throw new Error(
        `tenant-reach: spread ${spread} in the override allowlist could not be resolved. Refusing to continue — an unresolved spread shrinks the reach set and manufactures findings.`,
      );
    }
    for (const name of resolved) names.add(name);
    spreads.push({ name: spread, resolved: resolved.length });
  }

  return { names, spreads, literals: literals.length };
}

/* ─────────────────────── interpolated enumerators ─────────────────────── */

/**
 * Files searched when a loop iterates a NAMED constant rather than an inline
 * array. The vocabularies live beside the contracts, not beside the emitters.
 */
const CONSTANT_SOURCES = Object.freeze([
  CHROME_VARIABLES,
  ...LOWERING_SOURCES,
  TENANT_THEME,
  'packages/core/src/foundation/kernel/color/oklch/ramp/index.ts',
  // ON_TONE_ROLES: deriveStatusTintFloor (the palette writer) iterates it but does not
  // declare it -- the vocabulary lives beside the readable-ink contract it was
  // authored for, not beside this second, later emitter.
  'packages/core/src/infrastructure/compilers/kernel/foundation/css/color-math/readable-ink/index.ts',
]);

/**
 * Sources a static reader cannot resolve, because the values come from the
 * TENANT'S OWN DOCUMENT at runtime — `Object.entries(palette.ramps)` iterates
 * whatever the customer wrote. Each is declared with the vocabulary it draws
 * from and the reason, because the alternative is a silent gap that shrinks
 * the reach set and manufactures findings. Anything dynamic and undeclared
 * still fails the totality check.
 */
const DYNAMIC_SOURCES = Object.freeze({
  'rampRoleSpecs(palette)': {
    vocabulary: ['primary', 'secondary', 'accent', 'success', 'warning', 'error', 'info'],
    reason: 'ramp roles are the fixed palette role vocabulary; the specs are built per tenant but the role names are closed',
  },
  'Object.entries(palette.ramps ?? {})': {
    vocabulary: ['primary', 'secondary', 'accent', 'success', 'warning', 'error', 'info'],
    reason: 'the tenant supplies the ramp values; the keys are the same closed role vocabulary',
  },
});

function kebab(value) {
  return String(value).replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
}

/**
 * Values bound by `for (const X of …)` inside one emitter body.
 *
 * Three shapes are resolved, and every one of them appears in this corpus:
 *   for (const role of ['primary', …])      inline array
 *   for (const role of SEMANTIC_ROLES)      named constant
 *   for (const { name } of TYPE_RAMP)       destructured field of an object list
 */
export function loopBindings(body, resolveConstant) {
  const bindings = {};
  // The source expression may itself contain a call — `rampRoleSpecs(palette)`,
  // `Object.entries(palette.ramps ?? {})` — so one level of nested parentheses
  // is allowed. A matcher that stopped at the first `)` bound nothing for those
  // loops and reported the whole tenant colour ramp as unreachable.
  for (const match of body.matchAll(
    /for\s*\(\s*const\s+(\{[^}]*\}|\[[^\]]*\]|[A-Za-z0-9_$]+)\s+of\s+((?:[^()]|\([^()]*\))*?)\)\s*\{/g,
  )) {
    const [, binder, sourceExpression] = match;
    const source = sourceExpression.trim().replace(/\s+as const$/, '');
    let values = null;

    const inline = /^\[([\s\S]*)\]$/.exec(source);
    if (inline) values = [...inline[1].matchAll(/["']([^"']*)["']/g)].map((entry) => entry[1]);
    else if (/^[A-Za-z0-9_$]+$/.test(source)) values = resolveConstant(source);
    else if (DYNAMIC_SOURCES[source]) values = DYNAMIC_SOURCES[source].vocabulary;

    if (!values || values.length === 0) continue;

    if (binder.startsWith('{')) {
      for (const field of binder.slice(1, -1).split(',').map((entry) => entry.trim()).filter(Boolean)) {
        const objects = resolveConstant(source, field);
        if (objects && objects.length > 0) bindings[field] = objects;
      }
      continue;
    }
    bindings[binder] = values;
    // `const kebabRole = …` derivations are common enough to be worth binding.
    bindings[`kebab${binder[0].toUpperCase()}${binder.slice(1)}`] = values.map(kebab);
    bindings[`${binder}.name`] = values;
  }
  return bindings;
}

/**
 * One entry per EMITTER FUNCTION that builds names by interpolation.
 *
 * The value sets are DERIVED — from the emitter's own loop bindings, or from
 * the literal arguments at its call sites — never typed here. A table of
 * hand-copied vocabularies would drift the first time somebody adds a button
 * variant, and it would drift silently in the direction that invents defects.
 */
export function buildEnumerators(root) {
  // A reduced root (a build fixture, say) legitimately omits a vocabulary file
  // that a full checkout has -- that is a missing DOMAIN for whatever constant
  // lived there, resolved (or not) the same way a domain from a present file
  // that lacks the constant is: `resolveConstant` returns null and the caller
  // stays unattributed. It is never a reason to crash the whole enumerator
  // build, which every emitter's attribution depends on.
  const sources = new Map(
    CONSTANT_SOURCES.filter((path) => existsSync(`${root}/${path}`)).map((path) => [path, read(root, path)]),
  );
  const chrome = sources.get(CHROME_VARIABLES);

  const resolveConstant = (name, field) => {
    for (const source of sources.values()) {
      if (field) {
        const block = new RegExp(`${name}\\s*(?::[^=]+)?=\\s*\\[([\\s\\S]*?)\\n\\s*\\]`).exec(source);
        if (block) {
          const values = [...block[1].matchAll(new RegExp(`${field}\\s*:\\s*["']([^"']+)["']`, 'g'))].map((entry) => entry[1]);
          if (values.length > 0) return values;
        }
        continue;
      }
      const values = constArray(source, name);
      if (values.length > 0) return values;
    }
    return null;
  };

  const callSiteEnumerator = (id, fn, positions, holeNames, label, file = CHROME_VARIABLES) => {
    const sets = callSiteArguments(sources.get(file) ?? chrome, fn, positions);
    const holes = Object.fromEntries(holeNames.map((hole, index) => [hole, sets[index]]));
    return {
      id,
      file,
      functions: [fn],
      holes,
      evidence: `${label}: ${holeNames.map((hole, index) => `${hole} [${sets[index].join(', ')}]`).join(' × ')} — read from ${fn}(…) call sites`,
    };
  };

  const enumerators = [
    callSiteEnumerator('control-size', 'setControlSizeVars', [1, 2], ['family', 'size'], 'control geometry'),
    callSiteEnumerator('segmented-size', 'setSegmentedSizeVars', [1], ['size'], 'segmented geometry'),
    callSiteEnumerator('premium-card', 'setPremiumCardVars', [1], ['namespace'], 'premium card namespaces'),
    callSiteEnumerator('button-variant', 'setButtonVariantVars', [1], ['prefix'], 'button variants'),
    callSiteEnumerator('button-hover-alias', 'setLegacyButtonHoverBgAlias', [1], ['prefix'], 'button hover aliases'),
    // The tint ramps bind their scale by PARAMETER, and they live in the
    // lowering's tint writer rather than chrome-variables.
    callSiteEnumerator('tint-ramp', 'setTintRampVariables', [1], ['scale'], 'tint ramp scales', LOWERING_FOUNDATION_TINT),
  ];

  // Everything else binds its values in a loop inside its own body.
  const loopEmitters = [
    [LOWERING_FOUNDATION_RAMPS, 'deriveTenantColorRamps', 'brand colour ramps'],
    [LOWERING_FOUNDATION_MATERIALS, 'semanticSurfaceRolesToCssVariables', 'semantic material roles'],
    [LOWERING_FOUNDATION_TYPE_RAMP, 'setTypeRampVariables', 'the type ramp'],
    [LOWERING_FOUNDATION_TYPOGRAPHY, 'setSemanticTypographyVariables', 'semantic typography roles'],
    [LOWERING_FOUNDATION_PALETTE, 'deriveStatusTintFloor', 'status tint floor bg/border/alpha'],
    [CHROME_VARIABLES, 'chromeToVariables', 'button geometry sizes'],
  ];

  for (const [file, fn, label] of loopEmitters) {
    const source = sources.get(file) ?? read(root, file);
    const body = functionBodies(source).find((entry) => entry.name === fn)?.body ?? '';
    const holes = loopBindings(body, resolveConstant);
    // Steps and indices that are not loop-bound.
    holes.step = holes.step ?? resolveConstant('RAMP_STEPS') ?? [];
    holes['index + 1'] = Array.from({ length: 10 }, (_, index) => String(index + 1));
    enumerators.push({
      id: fn,
      file,
      functions: [fn],
      holes,
      evidence: `${label}: ${Object.entries(holes)
        .filter(([hole]) => !hole.startsWith('kebab') && !hole.endsWith('.name'))
        .map(([hole, values]) => `${hole} [${values.slice(0, 8).join(', ')}${values.length > 8 ? ', …' : ''}]`)
        .join(' × ')}`,
    });
  }

  return enumerators;
}

/** Substitute one template skeleton against a hole map, yielding every name. */
export function expandTemplate(template, holes, prefixResolver) {
  let expansions = [template];
  if (expansions[0].startsWith('${')) {
    const name = /^\$\{([A-Za-z0-9_.]+)\}/.exec(expansions[0])?.[1];
    if (!name) return [];
    // A leading hole is either a local `const prefix = ` … `` or a PARAMETER
    // bound at the call site. The tint ramps are the second kind, and a
    // resolver that only looked for the local const produced nothing for them.
    if (holes[name]) {
      expansions = holes[name].map((value) => expansions[0].replace(`\${${name}}`, value));
    } else {
      const resolved = prefixResolver(name);
      if (!resolved) return [];
      expansions = [expansions[0].replace(`\${${name}}`, resolved)];
    }
  }
  for (let guard = 0; guard < 6; guard += 1) {
    const next = [];
    let changed = false;
    for (const candidate of expansions) {
      const hole = /\$\{([^}]+)\}/.exec(candidate);
      if (!hole) {
        next.push(candidate);
        continue;
      }
      changed = true;
      const values = holes[hole[1].trim()];
      if (!values) continue;
      for (const value of values) next.push(candidate.replace(hole[0], value));
    }
    expansions = next;
    if (!changed) break;
  }
  return expansions.filter((name) => name.startsWith('--ds-') && !name.includes('${'));
}

/**
 * The full reach set, plus the evidence and the totality verdict.
 *
 * `unattributed` is not a warning. An emitter nobody enumerated means the reach
 * set is too small, which means the defect count is too big — so the gate that
 * consumes this must refuse to report a number until the list is empty.
 */
export function tenantReach({ root }) {
  const enumerators = buildEnumerators(root);
  const reach = new Map();
  const claim = (name, route) => {
    if (!reach.has(name)) reach.set(name, new Set());
    reach.get(name).add(route);
  };

  for (const path of REACH_SOURCES) {
    for (const name of literalTokens(read(root, path))) claim(name, 'typed-literal');
  }

  const { names: overrides, spreads } = overrideTokens(root);
  for (const name of overrides) claim(name, 'override-token');

  const attributed = new Map();
  for (const enumerator of enumerators) {
    for (const fn of enumerator.functions) attributed.set(`${enumerator.file}::${fn}`, enumerator);
  }

  const unattributed = [];
  const perEnumerator = new Map();

  for (const path of [CHROME_VARIABLES, ...LOWERING_SOURCES]) {
    const source = read(root, path);
    const bodies = new Map(functionBodies(source).map((fn) => [fn.name, fn.body]));
    for (const emission of templateEmissions(source)) {
      if (!emission.template.includes('${')) {
        if (emission.template.startsWith('--ds-')) claim(emission.template, 'typed-literal');
        continue;
      }
      const enumerator = attributed.get(`${path}::${emission.owner}`);
      if (!enumerator) {
        unattributed.push({ file: path, owner: emission.owner, template: emission.template });
        continue;
      }
      const body = bodies.get(emission.owner) ?? '';
      const names = expandTemplate(emission.template, enumerator.holes, (local) => localTemplate(body, local));
      if (names.length === 0 && emission.template.includes('${')) {
        unattributed.push({ file: path, owner: emission.owner, template: emission.template, reason: 'enumerator produced no names' });
        continue;
      }
      for (const name of names) claim(name, `interpolated:${enumerator.id}`);
      if (!perEnumerator.has(enumerator.id)) perEnumerator.set(enumerator.id, new Set());
      for (const name of names) perEnumerator.get(enumerator.id).add(name);
    }
  }

  return { reach, enumerators, perEnumerator, unattributed, overrideCount: overrides.size, overrideSpreads: spreads };
}
