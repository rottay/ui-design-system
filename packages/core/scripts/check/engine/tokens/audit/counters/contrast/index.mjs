import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
// WO-GAT-04 (accessibility CI, proposal P-10): APCA is the perceptually-accurate contrast model
// (the successor to WCAG-2 ratios) used by the `a11y.apcaPairings` counter below. `apca-w3` is a
// ROOT devDependency (this script resolves it via Node's upward node_modules walk to the repo
// root, whichever workspace CWD invokes it). This is ADDITIVE gate machinery: it does NOT touch
// the shipped WCAG validator at src/foundation/kernel/accessibility/branding-contrast/index.ts (a published /server API).
import { calcAPCA } from 'apca-w3';
import { artifactsDir, foundationDir, tokensCssDir } from '../../context/paths/index.mjs';
import { parseCssRules, stripBlockComments } from '../../parsing/index.mjs';

/* ============================================================================
   APCA contrast gate (WO-GAT-04, proposal P-10, axis 2): evaluate a DOCUMENTED
   list of text/surface token pairings across every first-party palette with
   APCA (Accessible Perceptual Contrast Algorithm) Lc values, and count pairings
   below their threshold as failures. Decrease-only ratchet, like every other
   counter here. This is ADDITIVE to — never a replacement for — the shipped
   WCAG-2 validator at src/foundation/kernel/accessibility/branding-contrast/index.ts (a published /server
   API). APCA is the perceptually accurate successor: WCAG-2 ratios are known to
   mis-rank contrast (over-rating light-on-dark, under-rating dark-on-light),
   which the P-05 hostile-tenant palettes make actively misleading.

   ── THRESHOLDS (documented, fixed by proposal P-10) ────────────────────────
   APCA Lc is signed (polarity: negative = light text on dark bg). We compare
   the ABSOLUTE Lc against a floor:
     - body-text pairs:      |Lc| >= 60   (primary reading text)
     - large-text / UI pairs: |Lc| >= 45   (component labels, low-emphasis text,
                                            status accents)
   These map to the APCA bronze-tier guidance (60 = fluent body minimum at
   normal sizes; 45 = large/bold/UI minimum). We deliberately do NOT chase the
   90/75 silver tiers here — the gate's job is to catch the dark-blind and
   wash-out failures, and to ratchet them down, not to fail the whole system
   against an aspirational bar.

   ── PALETTES AND LEGS ──────────────────────────────────────────────────────
   The SAME pairing list is resolved against each first-party palette — the
   foundation defaults and the three tenant artifacts (rottay, bithire, evnto)
   — once per colour-scheme LEG (light, dark). A leg is the cascade a document
   in that scheme really gets, lowest to highest:
     1. foundation `:root`, then the foundation's scheme block for the leg
        (`:root[data-theme='dark'], html[data-theme='dark'], html.dark`);
     2. the pairing's component token layer `:root`, then that layer's scheme
        block (`:where(:root, [data-ds-root]):is([data-theme='dark'], .dark)`);
     3. the tenant artifact root block, then the artifact's scheme block
        (`…[data-theme='dark'], ….dark`).
   That order is the layer order of facade/entrypoints/base: rottay-tokens,
   then rottay-components, then the unlayered tenant paint. Within one source a
   scheme block overrides its base block. `var(--x)` chains are then followed
   to a concrete color. Each palette names the scheme its unqualified root
   block paints (`theme`); the other leg MUST have a scheme block in that
   source, otherwise that leg would silently re-measure the base values.

   ── SKIPS ARE GATED ────────────────────────────────────────────────────────
   Static `color-mix(in srgb, A p%, B)` is COMPOSITED by the resolver (both
   endpoints statically opaque — see apcaResolveColorMix), so a tinted ground
   is evaluated, not skipped. A pairing whose text OR bg does not resolve to a
   static opaque color — an undefined token, a gradient endpoint, a non-opaque
   rgba()/#rrggbbaa (APCA needs an opaque pair; compositing alpha needs a known
   backdrop), a non-srgb mix space, or a keyword we do not map — cannot be
   measured. Such a pairing is a `skip` ONLY when APCA_SKIP_DISPOSITIONS names
   it with a reason; any other unmeasured pairing, a palette or component-layer
   file that is missing, a palette with no scheme block for a leg, and a
   disposition whose pairing measures again all count as FAILURES of
   `a11y.apcaPairings` — in EITHER leg. The instrument cannot go blind while
   the counter stays at zero: evaluated + justified skips always equals
   pairings x palettes x legs.
   ============================================================================ */

const APCA_BODY_MIN = 60; // body-text pairs
const APCA_UI_MIN = 45; // large-text / UI / low-emphasis pairs

/**
 * The documented text/surface token pairings. `kind` selects the threshold.
 * Each pairing names the TWO `--ds-*` tokens (text foreground, then surface
 * background) exactly as the components consume them; the resolver follows
 * their `var()` chains per palette. The list mirrors what the WO-ENG-02
 * flagship galleries actually render: body/muted copy on the page ground, body
 * copy on the elevated card surface, the primary button label on its own fill,
 * the five badge tones the gallery renders (fg on own tone bg — self-contained,
 * surface-independent), and each semantic status color used AS text on the page
 * ground (the status-message/label pattern).
 */
const APCA_PAIRINGS = [
  // Body-reading text (|Lc| >= 60)
  {
    id: 'body-text-on-page-bg',
    kind: 'body',
    text: '--ds-color-text-primary',
    bg: '--ds-color-bg-primary',
  },
  {
    id: 'text-on-card-surface',
    kind: 'body',
    text: '--ds-color-text-primary',
    bg: '--ds-color-bg-elevated',
  },
  // Low-emphasis text (|Lc| >= 45): muted/secondary copy — timestamps, hints, help text
  {
    id: 'muted-text-on-page-bg',
    kind: 'ui',
    text: '--ds-color-text-muted',
    bg: '--ds-color-bg-primary',
  },
  // Primary button label on its own fill (|Lc| >= 45). The channels are
  // declared by the button's component token layer, not by the foundation
  // theme; a tenant artifact may still override them.
  {
    id: 'primary-button-label',
    kind: 'ui',
    text: '--ds-button-primary-color',
    bg: '--ds-button-primary-bg',
    componentLayer: 'presentation/components/button/index.css',
  },
  // Badge tone label on its own tone fill (|Lc| >= 45) — the 5 gallery tones
  {
    id: 'badge-primary',
    kind: 'ui',
    text: '--ds-badge-primary-color',
    bg: '--ds-badge-primary-bg',
  },
  {
    id: 'badge-secondary',
    kind: 'ui',
    text: '--ds-badge-secondary-color',
    bg: '--ds-badge-secondary-bg',
  },
  {
    id: 'badge-success',
    kind: 'ui',
    text: '--ds-badge-success-color',
    bg: '--ds-badge-success-bg',
  },
  {
    id: 'badge-warning',
    kind: 'ui',
    text: '--ds-badge-warning-color',
    bg: '--ds-badge-warning-bg',
  },
  {
    id: 'badge-error',
    kind: 'ui',
    text: '--ds-badge-error-color',
    bg: '--ds-badge-error-bg',
  },
  // Semantic status color used AS text on the page ground (|Lc| >= 45)
  {
    id: 'semantic-success-text',
    kind: 'ui',
    text: '--ds-color-success',
    bg: '--ds-color-bg-primary',
  },
  {
    id: 'semantic-info-text',
    kind: 'ui',
    text: '--ds-color-info',
    bg: '--ds-color-bg-primary',
  },
  {
    id: 'semantic-warning-text',
    kind: 'ui',
    text: '--ds-color-warning',
    bg: '--ds-color-bg-primary',
  },
  {
    id: 'semantic-error-text',
    kind: 'ui',
    text: '--ds-color-error',
    bg: '--ds-color-bg-primary',
  },
];

/** The colour-scheme legs every pairing is measured in, on every palette. */
const APCA_LEGS = ['light', 'dark'];

/**
 * The first-party palettes. `theme` is the scheme the palette's UNQUALIFIED
 * root block paints (the foundation `:root` and bithire/evnto are light-first;
 * rottay is dark-first); the opposite leg reads that source's scheme block.
 */
const APCA_PALETTES = [
  {
    id: 'default',
    kind: 'foundation',
    file: join(foundationDir, 'themes/default/index.css'),
    theme: 'light',
  },
  {
    id: 'rottay',
    kind: 'artifact',
    tenant: 'rottay',
    file: join(artifactsDir, 'rottay/index.css'),
    theme: 'dark',
  },
  {
    id: 'bithire',
    kind: 'artifact',
    tenant: 'bithire',
    file: join(artifactsDir, 'bithire/index.css'),
    theme: 'light',
  },
  {
    id: 'evnto',
    kind: 'artifact',
    tenant: 'evnto',
    file: join(artifactsDir, 'evnto/index.css'),
    theme: 'light',
  },
];

const BADGE_TONE_REASON =
  'no first-party producer: the foundation theme and the three tenant artifacts no longer declare ' +
  'this tone channel; its only remaining definition is the component default in ' +
  'presentation/components/badge/index.css, which only the frozen classic and rustic engines paint with';

/**
 * The ONLY pairings allowed to go unmeasured, each named with its reason.
 * Decrease-only: an entry whose pairing measures again is a failure until it
 * is removed, and an unmeasured pairing with no entry is a failure too. An
 * entry covers every leg of the palettes it names unless it carries `legs`;
 * a leg it covers that measures is stale, exactly like a palette.
 */
const APCA_SKIP_DISPOSITIONS = [
  { pair: 'badge-primary', palettes: ['default', 'rottay', 'bithire', 'evnto'], disposition: 'frozen-engine-only', reason: BADGE_TONE_REASON },
  { pair: 'badge-secondary', palettes: ['default', 'rottay', 'bithire', 'evnto'], disposition: 'frozen-engine-only', reason: BADGE_TONE_REASON },
  { pair: 'badge-success', palettes: ['default', 'rottay', 'bithire', 'evnto'], disposition: 'frozen-engine-only', reason: BADGE_TONE_REASON },
  { pair: 'badge-warning', palettes: ['default', 'rottay', 'bithire', 'evnto'], disposition: 'frozen-engine-only', reason: BADGE_TONE_REASON },
  { pair: 'badge-error', palettes: ['default', 'rottay', 'bithire', 'evnto'], disposition: 'frozen-engine-only', reason: BADGE_TONE_REASON },
];

/** Extract only the DIRECT (brace-depth-0) `--name: value;` declarations from a
 * rule body, skipping any nested rule (e.g. the `*, ::after { border-color }`
 * reset that tenant blocks carry) — those set inherited properties, not the
 * root token scale. */
function apcaTopLevelDecls(body) {
  const out = [];
  let depth = 0;
  let seg = '';
  for (let i = 0; i < body.length; i++) {
    const c = body[i];
    if (c === '{') {
      depth += 1;
      seg = '';
      continue;
    }
    if (c === '}') {
      if (depth > 0) depth -= 1;
      seg = '';
      continue;
    }
    if (depth !== 0) continue;
    if (c === ';') {
      const m = /(--[a-zA-Z0-9-]+)\s*:\s*([\s\S]+)/.exec(seg);
      if (m) out.push([m[1], m[2].trim()]);
      seg = '';
    } else {
      seg += c;
    }
  }
  return out;
}

/** Split a selector list on its TOP-LEVEL commas (`:is(a, b)` keeps its own). */
function apcaSplitSelectorList(selector) {
  const out = [];
  let depth = 0;
  let seg = '';
  for (const c of selector) {
    if (c === '(' || c === '[') depth += 1;
    else if (c === ')' || c === ']') depth -= 1;
    if (c === ',' && depth === 0) {
      out.push(seg);
      seg = '';
    } else {
      seg += c;
    }
  }
  out.push(seg);
  return out.map((member) => member.replace(/\s+/g, '')).filter(Boolean);
}

const APCA_SCHEME_QUALIFIER = (leg) => `(?:\\[data-theme=['"]${leg}['"]\\]|\\.${leg}|:is\\(\\[data-theme=['"]${leg}['"]\\],\\.${leg}\\))`;

/** Classify a foundation / component-layer rule for `leg`: 'base' for the bare
 * `:root` block, 'scheme' for a root block qualified by exactly that scheme
 * (`:root[data-theme='dark']`, `html.dark`, `:where(:root, [data-ds-root]):is(
 * [data-theme='dark'], .dark)`), null for anything else — a descendant rule,
 * the other scheme, an at-rule. `orderBound` marks the zero-specificity
 * `:where()` root, which beats `:root` by source order only. */
function apcaClassifyRootBlock(selector, leg) {
  const members = apcaSplitSelectorList(selector);
  if (members.includes(':root')) return { role: 'base' };
  const fixed = new RegExp(`^(?::root|html)${APCA_SCHEME_QUALIFIER(leg)}$`);
  const zero = new RegExp(`^:where\\(:root,\\[data-ds-root\\]\\)${APCA_SCHEME_QUALIFIER(leg)}$`);
  if (members.some((member) => fixed.test(member))) return { role: 'scheme', orderBound: false };
  if (members.some((member) => zero.test(member))) return { role: 'scheme', orderBound: true };
  return null;
}

/** Classify a tenant-artifact rule for `leg`: the tenant's ROOT token block —
 * the historical `html[data-tenant='T']` root or its dual-scope
 * `:is(html[data-tenant='T'], :where([data-ds-root][data-vertical='V']))`
 * projection, followed only by attached qualifiers (`:not(...)`, `.class`,
 * `[data-theme=...]`). Unqualified it is the 'base' block; qualified by the
 * leg's scheme it is that leg's 'scheme' block. Descendant scoping and the
 * OPPOSITE scheme are rejected. */
function apcaClassifyArtifactBlock(selector, tenant, leg) {
  const escapedTenant = tenant.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const tenantRoot = `html\\[data-tenant=['"]${escapedTenant}['"]\\]`;
  const verticalRoot = `:where\\(\\[data-ds-root\\]\\[data-vertical=['"][A-Za-z0-9_-]+['"]\\]\\)`;
  // Vertical artifacts are dual-scoped: the historical tenant root and an
  // embeddable vertical root share one :is() rule. The APCA evaluator follows
  // the tenant branch, but must admit that mechanically equivalent wrapper;
  // otherwise every artifact silently falls back to foundation colours.
  const root = `(?:${tenantRoot}|:is\\(${tenantRoot},${verticalRoot}\\))`;
  const rootRe = new RegExp(
    `^${root}(?::not\\([^)]*\\)|\\.[A-Za-z0-9_-]+|\\[data-theme=['"][^'"]*['"]\\])*$`
  );
  const opp = leg === 'light' ? 'dark' : 'light';
  const names = (scheme, negated) => {
    const lead = negated ? ':not\\(' : '(?<!:not\\()';
    return new RegExp(`${lead}(?:\\.${scheme}(?![A-Za-z0-9_-])|\\[data-theme=['"]${scheme}['"]\\])`);
  };
  let role = null;
  for (const member of apcaSplitSelectorList(selector)) {
    if (!rootRe.test(member)) continue;
    // Excluded from this leg: it requires the opposite scheme, or forbids this one.
    if (names(opp, false).test(member) || names(leg, true).test(member)) continue;
    if (names(leg, false).test(member) || names(opp, true).test(member)) role = role ?? 'scheme';
    else role = 'base';
  }
  return role ? { role, orderBound: false } : null;
}

/** Build a name -> raw-value map for one leg from every top-level rule of
 * `cssText` that `classify` admits. Base blocks merge in source order (LAST
 * wins); the leg's scheme blocks merge OVER them, as their higher specificity
 * does in the cascade. `schemeRules` counts the scheme blocks found, and
 * `ambiguous` names any token a base block redeclares after an order-bound
 * scheme block set it — the one shape this merge would read wrongly. */
function apcaCollectDecls(cssText, classify) {
  const stripped = stripBlockComments(cssText);
  const base = new Map();
  const scheme = new Map();
  const orderBound = new Set();
  const ambiguous = [];
  let schemeRules = 0;
  for (const rule of parseCssRules(stripped, 0, stripped.length)) {
    const kind = rule.selector ? classify(rule.selector) : null;
    if (!kind) continue;
    const body = stripped.slice(rule.bodyStart, rule.bodyEnd);
    if (kind.role === 'scheme') schemeRules += 1;
    for (const [n, v] of apcaTopLevelDecls(body)) {
      if (kind.role === 'scheme') {
        scheme.set(n, v);
        if (kind.orderBound) orderBound.add(n);
      } else {
        if (orderBound.has(n)) ambiguous.push(n);
        base.set(n, v);
      }
    }
  }
  return { defs: new Map([...base, ...scheme]), schemeRules, ambiguous };
}

/** Parse a concrete CSS color literal to an OPAQUE color string calcAPCA
 * accepts (`#rrggbb` or `rgb(r, g, b)`), or null when it is not a static opaque
 * color (gradient / non-opaque alpha / var-bearing / unmapped keyword) — the
 * "skip-with-count" cases. Static `color-mix(in srgb, ...)` is NOT handled here;
 * apcaResolveValue composites it before reaching this parser. */
function apcaParseColor(raw) {
  const str = raw.trim().replace(/\s*!important\s*$/i, '');
  const kw = { white: '#ffffff', black: '#000000' };
  if (Object.prototype.hasOwnProperty.call(kw, str.toLowerCase())) return kw[str.toLowerCase()];
  if (/^#[0-9a-fA-F]{6}$/.test(str)) return str;
  if (/^#[0-9a-fA-F]{3}$/.test(str)) return str;
  if (/^#[0-9a-fA-F]{8}$/.test(str)) return str.slice(7).toLowerCase() === 'ff' ? '#' + str.slice(1, 7) : null;
  if (/^#[0-9a-fA-F]{4}$/.test(str)) return str[4].toLowerCase() === 'f' ? '#' + str.slice(1, 4) : null;
  const m = /^rgba?\(\s*([0-9.]+)\s*[,\s]\s*([0-9.]+)\s*[,\s]\s*([0-9.]+)\s*(?:[,/]\s*([0-9.]+%?)\s*)?\)$/.exec(str);
  if (m) {
    let a = 1;
    if (m[4] !== undefined) a = m[4].endsWith('%') ? parseFloat(m[4]) / 100 : parseFloat(m[4]);
    if (!(a >= 1)) return null; // non-opaque needs compositing — skip
    return `rgb(${Math.round(+m[1])}, ${Math.round(+m[2])}, ${Math.round(+m[3])})`;
  }
  return null; // color-mix(), gradients, unresolved var(), unmapped keyword
}

/** Split a color-mix() argument list on its TOP-LEVEL comma only — endpoint
 * expressions may be var(--x, fallback) with their own commas. Returns the two
 * endpoint strings, or null when the shape is not `a, b`. */
function apcaSplitMixEndpoints(args) {
  let depth = 0;
  for (let i = 0; i < args.length; i++) {
    const c = args[i];
    if (c === '(') depth += 1;
    else if (c === ')') depth -= 1;
    else if (c === ',' && depth === 0) {
      return [args.slice(0, i).trim(), args.slice(i + 1).trim()];
    }
  }
  return null;
}

/** Parse one color-mix endpoint: `<color>` or `<color> N%`. The color part may
 * itself be a var() chain, so the percentage is stripped from the END. */
function apcaParseMixEndpoint(raw) {
  const m = /^([\s\S]*?)\s+([0-9.]+)%$/.exec(raw);
  if (m) return { color: m[1], pct: parseFloat(m[2]) };
  return { color: raw, pct: null };
}

/** Composite a STATIC `color-mix(in srgb, A p%, B [q%])` to an opaque
 * `rgb(r, g, b)` string, or null when either endpoint is unresolvable or the
 * mix space is not srgb. Per CSS Color 5, a missing percentage defaults to
 * 100 - p; two given percentages are normalized when they sum under 100.
 * Non-srgb spaces (oklch/oklab/...) stay skipped: compositing them needs the
 * full polar-space math and none of the governed pairing paths uses them. */
function apcaResolveColorMix(value, defs, seen) {
  const m = /^color-mix\(\s*in\s+([a-z-]+)\s*,\s*([\s\S]+)\)$/.exec(value);
  if (!m) return null;
  if (m[1] !== 'srgb') return null;
  const endpoints = apcaSplitMixEndpoints(m[2]);
  if (!endpoints) return null;
  const a = apcaParseMixEndpoint(endpoints[0]);
  const b = apcaParseMixEndpoint(endpoints[1]);
  let pA = a.pct;
  let pB = b.pct;
  if (pA === null && pB === null) return null;
  if (pA === null) pA = 100 - pB;
  if (pB === null) pB = 100 - pA;
  if (pA + pB <= 0) return null;
  const sum = pA + pB;
  const colorA = apcaResolveValue(a.color, defs, new Set(seen));
  const colorB = apcaResolveValue(b.color, defs, new Set(seen));
  if (!colorA || !colorB) return null;
  const toRgb = (c) => {
    const s = c.trim();
    if (s.startsWith('#')) {
      const h = s.length === 4
        ? s.slice(1).split('').map((x) => x + x).join('')
        : s.slice(1);
      return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
    }
    const rgbM = /^rgb\(\s*([0-9]+)\s*,\s*([0-9]+)\s*,\s*([0-9]+)\s*\)$/.exec(s);
    return rgbM ? [+rgbM[1], +rgbM[2], +rgbM[3]] : null;
  };
  const rgbA = toRgb(colorA);
  const rgbB = toRgb(colorB);
  if (!rgbA || !rgbB) return null;
  const mixed = rgbA.map((v, i) => Math.round((v * pA + rgbB[i] * pB) / sum));
  return `rgb(${mixed[0]}, ${mixed[1]}, ${mixed[2]})`;
}

/** Resolve a `--ds-*` token to a concrete opaque color within `defs`, following
 * `var(--x, fallback)` chains; null when it bottoms out on an undefined name or
 * a non-static value (see apcaParseColor). Static `color-mix(in srgb, ...)` is
 * composited (apcaResolveColorMix); gradients and non-opaque alpha stay skips. */
function apcaResolveColor(name, defs, seen = new Set()) {
  if (seen.has(name)) return null;
  seen.add(name);
  const raw = defs.get(name);
  if (raw === undefined) return null;
  return apcaResolveValue(raw, defs, seen);
}

function apcaResolveValue(raw, defs, seen) {
  const value = raw.trim().replace(/\s*!important\s*$/i, '');
  const varM = /^var\(\s*(--[a-zA-Z0-9-]+)\s*(?:,\s*([\s\S]+))?\)$/.exec(value);
  if (varM) {
    const inner = apcaResolveColor(varM[1], defs, new Set(seen));
    if (inner) return inner;
    return varM[2] !== undefined ? apcaResolveValue(varM[2].trim(), defs, seen) : null;
  }
  if (/^color-mix\(/.test(value)) return apcaResolveColorMix(value, defs, seen);
  return apcaParseColor(value);
}

/** Why a token gave APCA nothing to measure, in words. */
function apcaUnmeasuredCause(name, defs) {
  return defs.has(name) ? 'declared, but not a static opaque colour' : 'not declared in this cascade';
}

/**
 * Evaluate every pairing against every palette in every leg. Returns the
 * failure count, the justified-skip count, and a per-evaluation detail list
 * for the report. `failures` is what `a11y.apcaPairings` gates: pairs whose
 * |Lc| is below their threshold, plus every coverage breach (see
 * `coverageFailures`), in either leg.
 */
function evaluateApcaPairings({
  pairings = APCA_PAIRINGS,
  palettes = APCA_PALETTES,
  dispositions = APCA_SKIP_DISPOSITIONS,
  cssRoot = tokensCssDir,
  legs = APCA_LEGS,
} = {}) {
  const coverageFailures = [];
  const readSource = (file, label) => {
    if (existsSync(file)) return readFileSync(file, 'utf8');
    coverageFailures.push(`missing source: ${label} reads ${file}, which does not exist`);
    return '';
  };
  const collect = (text, label, leg, classify) => {
    const found = apcaCollectDecls(text, classify);
    for (const name of new Set(found.ambiguous)) {
      coverageFailures.push(
        `ambiguous cascade: ${label} redeclares ${name} in a base block after its ${leg} scheme block set it at equal specificity`
      );
    }
    return found;
  };
  // A palette whose base block paints the other scheme owes this leg a scheme
  // block; without one the leg would re-measure the base values and look covered.
  const requireSchemeBlock = (pal, leg, found, text) => {
    if (pal.theme === leg || found.schemeRules > 0 || text === '') return;
    coverageFailures.push(
      `missing source: palette ${pal.id} has no ${leg} scheme block in ${pal.file}; its ${leg} leg would re-measure the ${pal.theme} values`
    );
  };

  const foundation = palettes.find((pal) => pal.kind === 'foundation');
  const foundationText = foundation ? readSource(foundation.file, `palette ${foundation.id}`) : '';
  const layers = [...new Set(pairings.map((pair) => pair.componentLayer).filter(Boolean))];
  const layerText = new Map(layers.map((layer) => [layer, readSource(join(cssRoot, layer), `component layer ${layer}`)]));
  const artifactText = new Map(
    palettes.filter((pal) => pal.kind !== 'foundation').map((pal) => [pal.id, readSource(pal.file, `palette ${pal.id}`)])
  );

  const foundationDefs = new Map();
  const layerDefs = new Map();
  for (const leg of legs) {
    const found = collect(foundationText, `palette ${foundation?.id}`, leg, (sel) => apcaClassifyRootBlock(sel, leg));
    if (foundation) requireSchemeBlock(foundation, leg, found, foundationText);
    foundationDefs.set(leg, found.defs);
    for (const layer of layers) {
      const inLayer = collect(layerText.get(layer), `component layer ${layer}`, leg, (sel) => apcaClassifyRootBlock(sel, leg));
      layerDefs.set(`${leg}:${layer}`, inLayer.defs);
    }
  }

  const dispositionOf = new Map();
  for (const entry of dispositions) {
    for (const palette of entry.palettes) {
      for (const leg of entry.legs ?? legs) dispositionOf.set(`${palette}/${leg}:${entry.pair}`, entry);
    }
  }
  const usedDispositions = new Set();

  const results = [];
  const byLeg = Object.fromEntries(
    legs.map((leg) => [leg, { evaluated: 0, skipped: 0, belowThreshold: 0, unjustifiedSkips: 0, total: 0 }])
  );
  for (const pal of palettes) {
    for (const leg of legs) {
      let artDefs = new Map();
      if (pal.kind !== 'foundation') {
        const text = artifactText.get(pal.id);
        const found = collect(text, `palette ${pal.id}`, leg, (sel) => apcaClassifyArtifactBlock(sel, pal.tenant, leg));
        requireSchemeBlock(pal, leg, found, text);
        artDefs = found.defs;
      }
      const tally = byLeg[leg];
      for (const pair of pairings) {
        // Cascade order: foundation, then the pairing's component token layer,
        // then the tenant artifact (which wins) — each already merged for this leg.
        const defs = new Map([
          ...foundationDefs.get(leg),
          ...(layerDefs.get(`${leg}:${pair.componentLayer}`) ?? []),
          ...artDefs,
        ]);
        const textColor = apcaResolveColor(pair.text, defs);
        const bgColor = apcaResolveColor(pair.bg, defs);
        const threshold = pair.kind === 'body' ? APCA_BODY_MIN : APCA_UI_MIN;
        const key = `${pal.id}/${leg}:${pair.id}`;
        const row = {
          palette: pal.id,
          leg,
          pair: pair.id,
          kind: pair.kind,
          threshold,
          textToken: pair.text,
          bgToken: pair.bg,
          textColor,
          bgColor,
        };
        tally.total += 1;
        if (!textColor || !bgColor) {
          const unmeasured = [
            ...(textColor ? [] : [`${pair.text} is ${apcaUnmeasuredCause(pair.text, defs)}`]),
            ...(bgColor ? [] : [`${pair.bg} is ${apcaUnmeasuredCause(pair.bg, defs)}`]),
          ].join('; ');
          const entry = dispositionOf.get(key);
          if (entry) {
            usedDispositions.add(key);
            tally.skipped += 1;
            results.push({ ...row, status: 'skip', unmeasured, disposition: entry.disposition, reason: entry.reason });
          } else {
            tally.unjustifiedSkips += 1;
            coverageFailures.push(
              `unjustified skip: ${key} cannot be measured (${unmeasured}) and APCA_SKIP_DISPOSITIONS does not name it`
            );
            results.push({ ...row, lc: 'n/a', status: 'UNJUSTIFIED-SKIP', unmeasured });
          }
          continue;
        }
        const lcRaw = calcAPCA(textColor, bgColor);
        const absLc = Math.abs(typeof lcRaw === 'number' ? lcRaw : Number(lcRaw) || 0);
        const pass = absLc >= threshold;
        tally.evaluated += 1;
        if (!pass) tally.belowThreshold += 1;
        results.push({ ...row, lc: Number(absLc.toFixed(1)), status: pass ? 'pass' : 'FAIL' });
      }
    }
  }
  for (const key of dispositionOf.keys()) {
    if (usedDispositions.has(key)) continue;
    coverageFailures.push(
      `stale skip disposition: ${key} is named in APCA_SKIP_DISPOSITIONS but is not an unmeasured pairing; remove it`
    );
  }

  const sum = (field) => legs.reduce((n, leg) => n + byLeg[leg][field], 0);
  const total = pairings.length * palettes.length * legs.length;
  const belowThreshold = sum('belowThreshold');
  const skipped = sum('skipped');
  const unjustifiedSkips = sum('unjustifiedSkips');
  const evaluated = sum('evaluated');
  if (results.length !== total || evaluated + skipped + unjustifiedSkips !== total) {
    throw new Error(`APCA coverage accounting broke: ${evaluated} evaluated + ${skipped} justified skips + ${unjustifiedSkips} unjustified != ${total}`);
  }
  return {
    failures: belowThreshold + coverageFailures.length,
    belowThreshold,
    skipped,
    evaluated,
    total,
    unjustifiedSkips,
    coverageFailures,
    legs: [...legs],
    byLeg,
    dispositions: dispositions.map(({ pair, palettes: named, legs: namedLegs, disposition, reason }) => ({
      pair,
      palettes: named,
      legs: namedLegs ?? [...legs],
      disposition,
      reason,
    })),
    results,
  };
}

/** The one-line outcome every audit mode prints. `failures` is the gated
 * number; it is spelled out as its two parts so a coverage breach is never
 * read as a contrast failure, and a skip is named for what it is. */
function describeApcaOutcome(apca) {
  const perLeg = apca.legs
    .map((leg) => `${leg} ${apca.byLeg[leg].evaluated}/${apca.byLeg[leg].total} measured, ${apca.byLeg[leg].belowThreshold} below`)
    .join('; ');
  return (
    `${apca.failures} failures (${apca.belowThreshold} below threshold, ${apca.coverageFailures.length} coverage breaches), ` +
    `${apca.skipped} not measured under a named disposition, ${apca.evaluated} measured of ${apca.total} (${perLeg})`
  );
}

export {
  APCA_BODY_MIN,
  APCA_UI_MIN,
  APCA_LEGS,
  APCA_PAIRINGS,
  APCA_PALETTES,
  APCA_SKIP_DISPOSITIONS,
  describeApcaOutcome,
  evaluateApcaPairings,
};
