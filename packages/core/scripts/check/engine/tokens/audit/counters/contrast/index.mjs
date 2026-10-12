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

   ── PALETTES ───────────────────────────────────────────────────────────────
   The SAME pairing list is resolved against each first-party palette on its
   OWN default surface (the one TenantPaletteSurface renders in the WO-ENG-02
   galleries): the foundation defaults (dark) and the three tenant artifacts
   (rottay dark, bithire light, evnto light). Each artifact's tokens are merged
   OVER the foundation defaults (artifact wins — mirroring the real cascade,
   where html[data-tenant=…] overrides :root), then `var(--x)` chains are
   followed to a concrete color.

   ── SKIPS ARE GATED ────────────────────────────────────────────────────────
   Static `color-mix(in srgb, A p%, B)` is COMPOSITED by the resolver (both
   endpoints statically opaque — see apcaResolveColorMix), so a tinted ground
   is evaluated, not skipped. A pairing whose text OR bg does not resolve to a
   static opaque color — an undefined token, a gradient endpoint, a non-opaque
   rgba()/#rrggbbaa (APCA needs an opaque pair; compositing alpha needs a known
   backdrop), a non-srgb mix space, or a keyword we do not map — cannot be
   measured. Such a pairing is a `skip` ONLY when APCA_SKIP_DISPOSITIONS names
   it with a reason; any other unmeasured pairing, a palette or component-layer
   file that is missing, and a disposition whose pairing measures again all
   count as FAILURES of `a11y.apcaPairings`. The instrument cannot go blind
   while the counter stays at zero: evaluated + justified skips always equals
   pairings x palettes.
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

/**
 * The first-party palettes, each on the surface its WO-ENG-02 gallery renders.
 * `theme` selects which artifact block is the default (rottay is dark-first;
 * bithire/evnto are light-first), so the resolver reads the block that actually
 * paints, not the opposite-scheme override.
 */
const APCA_PALETTES = [
  {
    id: 'default',
    kind: 'foundation',
    file: join(foundationDir, 'themes/default/index.css'),
    theme: 'dark',
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
  'presentation/components/badge/index.css, which only the frozen classic and rustic themes paint with';

/**
 * The ONLY pairings allowed to go unmeasured, each named with its reason.
 * Decrease-only: an entry whose pairing measures again is a failure until it
 * is removed, and an unmeasured pairing with no entry is a failure too.
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

/** True when `selector` is the tenant's ROOT token block for its DEFAULT theme:
 * the historical `html[data-tenant='T']` root or its dual-scope
 * `:is(html[data-tenant='T'], :where([data-ds-root][data-vertical='V']))`
 * projection, followed only by attached qualifiers (`:not(...)`, `.class`,
 * `[data-theme=...]`). Descendant scoping and the OPPOSITE scheme are rejected. */
function apcaBlockMatchesDefault(selector, tenant, defaultTheme) {
  const compact = selector.replace(/\s+/g, '');
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
  if (!rootRe.test(compact)) return false;
  const opp = defaultTheme === 'light' ? 'dark' : 'light';
  const oppClass = new RegExp(`(?<!:not\\()\\.${opp}(?![A-Za-z0-9_-])`);
  const oppAttr = new RegExp(`(?<!:not\\()\\[data-theme=['"]${opp}['"]\\]`);
  if (oppClass.test(compact) || oppAttr.test(compact)) return false;
  return true;
}

/** Build a name -> raw-value map from every top-level rule of `cssText` whose
 * selector satisfies `matchSelector`, in source order (LAST wins — matching the
 * cascade, where a later same-scope block overrides an earlier one). */
function apcaCollectDecls(cssText, matchSelector) {
  const stripped = stripBlockComments(cssText);
  const defs = new Map();
  for (const rule of parseCssRules(stripped, 0, stripped.length)) {
    if (!rule.selector || !matchSelector(rule.selector)) continue;
    const body = stripped.slice(rule.bodyStart, rule.bodyEnd);
    for (const [n, v] of apcaTopLevelDecls(body)) defs.set(n, v);
  }
  return defs;
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

/**
 * Evaluate every pairing against every palette. Returns the failure count, the
 * justified-skip count, and a per-evaluation detail list for the report.
 * `failures` is what `a11y.apcaPairings` gates: pairs whose |Lc| is below their
 * threshold, plus every coverage breach (see `coverageFailures`).
 */
function evaluateApcaPairings({
  pairings = APCA_PAIRINGS,
  palettes = APCA_PALETTES,
  dispositions = APCA_SKIP_DISPOSITIONS,
  cssRoot = tokensCssDir,
} = {}) {
  const coverageFailures = [];
  const readSource = (file, label) => {
    if (existsSync(file)) return readFileSync(file, 'utf8');
    coverageFailures.push(`missing source: ${label} reads ${file}, which does not exist`);
    return '';
  };
  const isRoot = (sel) => sel.trim() === ':root';
  const foundation = palettes.find((pal) => pal.kind === 'foundation');
  const foundationDefs = foundation
    ? apcaCollectDecls(readSource(foundation.file, `palette ${foundation.id}`), isRoot)
    : new Map();
  const layerDefs = new Map();
  for (const layer of new Set(pairings.map((pair) => pair.componentLayer).filter(Boolean))) {
    layerDefs.set(layer, apcaCollectDecls(readSource(join(cssRoot, layer), `component layer ${layer}`), isRoot));
  }
  const dispositionOf = new Map();
  for (const entry of dispositions) {
    for (const palette of entry.palettes) dispositionOf.set(`${palette}:${entry.pair}`, entry);
  }
  const usedDispositions = new Set();

  const results = [];
  let belowThreshold = 0;
  let skipped = 0;
  for (const pal of palettes) {
    const artDefs = pal.kind === 'foundation'
      ? new Map()
      : apcaCollectDecls(
          readSource(pal.file, `palette ${pal.id}`),
          (sel) => apcaBlockMatchesDefault(sel, pal.tenant, pal.theme)
        );
    for (const pair of pairings) {
      // Cascade order: foundation :root, then the pairing's component token
      // layer, then the tenant artifact (which wins).
      const defs = new Map([...foundationDefs, ...(layerDefs.get(pair.componentLayer) ?? []), ...artDefs]);
      const textColor = apcaResolveColor(pair.text, defs);
      const bgColor = apcaResolveColor(pair.bg, defs);
      const threshold = pair.kind === 'body' ? APCA_BODY_MIN : APCA_UI_MIN;
      const key = `${pal.id}:${pair.id}`;
      const row = {
        palette: pal.id,
        pair: pair.id,
        kind: pair.kind,
        threshold,
        textToken: pair.text,
        bgToken: pair.bg,
        textColor,
        bgColor,
      };
      if (!textColor || !bgColor) {
        const entry = dispositionOf.get(key);
        if (entry) {
          usedDispositions.add(key);
          skipped += 1;
          results.push({ ...row, status: 'skip', disposition: entry.disposition, reason: entry.reason });
        } else {
          coverageFailures.push(
            `unjustified skip: ${key} does not resolve (${pair.text} -> ${textColor ?? 'unresolved'}, ` +
              `${pair.bg} -> ${bgColor ?? 'unresolved'}) and APCA_SKIP_DISPOSITIONS does not name it`
          );
          results.push({ ...row, lc: 'n/a', status: 'UNJUSTIFIED-SKIP' });
        }
        continue;
      }
      const lcRaw = calcAPCA(textColor, bgColor);
      const absLc = Math.abs(typeof lcRaw === 'number' ? lcRaw : Number(lcRaw) || 0);
      const pass = absLc >= threshold;
      if (!pass) belowThreshold += 1;
      results.push({ ...row, lc: Number(absLc.toFixed(1)), status: pass ? 'pass' : 'FAIL' });
    }
  }
  for (const key of dispositionOf.keys()) {
    if (usedDispositions.has(key)) continue;
    coverageFailures.push(
      `stale skip disposition: ${key} is named in APCA_SKIP_DISPOSITIONS but is not an unmeasured pairing; remove it`
    );
  }

  const total = pairings.length * palettes.length;
  const unjustifiedSkips = results.filter((r) => r.status === 'UNJUSTIFIED-SKIP').length;
  const evaluated = results.length - skipped - unjustifiedSkips;
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
    dispositions: dispositions.map(({ pair, palettes: named, disposition, reason }) => ({ pair, palettes: named, disposition, reason })),
    results,
  };
}

export {
  APCA_BODY_MIN,
  APCA_UI_MIN,
  APCA_PAIRINGS,
  APCA_PALETTES,
  APCA_SKIP_DISPOSITIONS,
  evaluateApcaPairings,
};
