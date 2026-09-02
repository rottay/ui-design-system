/**
 * R1 Cohort 1 — Overlay causality probe. Popover, Dropdown, Modal, Drawer.
 *
 * WHY THIS EXISTS. Three false-green claims shipped this session, each from an
 * instrument that could not see the failure mode it was asked about:
 *   1. a readiness gate that checked element PRESENCE, not paint — missed a FOUC race
 *   2. the same gate checking presence, not GEOMETRY — missed a 332px overflow at 320
 *   3. an overlay probe reading only `element.backgroundImage` on the surface node —
 *      missed a `::before` gradient AND a gradient on a CHILD title element, and
 *      "no directional gradient" was reported on that basis
 * The auditor found all three. This probe exists to catch the CLASS of thing #3
 * belongs to: an instrument that inspects less surface than the thing it is judging.
 *
 * WHAT "CAUSALITY" MEANS HERE. Grepping a stylesheet for a var() reference proves a
 * channel is MENTIONED, not that it is LIVE — a channel can be referenced and still be
 * permanently shadowed by a family literal that is always-defined (dropdown.css reads
 * `var(--ds-dropdown-shadow, var(--ds-material-overlay-shadow, ...))`, and
 * `--ds-dropdown-shadow` is declared at default.css:1770, so the role-channel fallback
 * never fires — inspection would call this "adopted"; it is dead). So every role-channel
 * claim below is decided by MUTATING the channel on documentElement with a loud sentinel
 * value, reading getComputedStyle before/after/after-restore, and reporting the verbatim
 * evidence — never a verdict without the reading that produced it.
 *
 * THE SITE-GRAMMAR LAW (round 3 — supersedes an earlier, WITHDRAWN claim). An
 * earlier round of this probe assumed `highlight` and every `shadow*`/`focus-ring`
 * channel were GLOBALLY "shadow-list-item typed" and that authoring `none` on any of
 * them was inherently a trap. That claim was independently audited and REJECTED: it
 * is false repo-wide and would have failed (wrongly reddened) five valid `none`
 * authorings in the TMM fixture and semantic-surface.css's seven dual-typed role
 * bridges. It — and the "pending compiler normalization" framing that went with it —
 * is fully withdrawn here, not just softened.
 *
 * The corrected law is about SITE GRAMMAR, not channel identity. A
 * `var(--ds-material-*)` reference may legally be read in exactly two shapes:
 *   (i)  a WHOLE property value — the entire declaration is one var()-chain, nothing
 *        else in the list, so `none` resolving all the way down is a normal, legal
 *        state for that property.
 *   (ii) a BACKGROUND/MASK LAYER — `none` is an explicitly legal per-layer value in a
 *        comma-separated `background`/`mask` list; one layer being `none` does not
 *        touch its siblings.
 * It is NEVER legal, and is the ONLY defect shape, as:
 *   (iii) a NON-SOLE item inside a comma-separated SHADOW-valued list (`box-shadow`,
 *        `text-shadow`) — `none` is a whole-value keyword there, not a per-layer one,
 *        so an invalid item invalidates the entire declaration (CSS var()-substitution
 *        invalidity: one bad list item collapses the whole property to its initial
 *        value). This is a SITE defect, not a channel defect — the exact same channel
 *        is safe in position (i)/(ii) and unsafe only in position (iii).
 * The list-splice census (`--census-only`) classifies every occurrence into one of
 * these three positions and asserts red IFF (iii) — see runListSpliceCensus() and its
 * whole-value-isolation verification, which confirms positions (i) and (ii) are safe
 * rather than merely assuming it.
 *
 * ALSO: a texture anti-duplication count (one paint site per family, not two — the
 * popover title used to double-paint the tint, before it was deleted; the surviving
 * two-site popover panel+arrow shape is a SANCTIONED exception, proven — not assumed —
 * by an executable three-condition check: geometric contiguity, contentless-and-
 * pointer-safe, and seam-free under an authored high-contrast value), and a served-
 * bundle freshness check that can FAIL the run, not just annotate it, because
 * comparing source against source is not proof the BROWSER is running the current
 * chain, and comparing mtimes or grepping for a stripped comment isn't either.
 *
 * RUN VALIDITY (round 3): hashes alone cannot see a server restart if content happens
 * to match across it, so a run's validity is decided by THREE independent signals
 * together — pipeline content hashes before/after, server PROCESS IDENTITY (PID +
 * start time) before/after, and served-bundle freshness — ANY of which failing marks
 * the whole run invalid. See snapshotPipelineHashes(), getServerProcessIdentity(),
 * and verifyBundleFreshness().
 *
 * WHAT THIS DOES NOT DO. It does not smooth a dead channel into "partially adopted,"
 * and it does not infer a family's behaviour from another family's CSS. Every claim
 * below is decided by measurement and reported with the reading that produced it — and
 * every claim's INPUT SET is hashed explicitly; anything not hashed is named as out of
 * scope rather than silently assumed stable.
 */

import { writeFileSync, statSync, readFileSync, readdirSync, mkdtempSync, rmSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import postcss from 'postcss';
// Resolved from the showroom package explicitly, the same way capture-lab.mjs does:
// this harness lives in the core evidence tree but playwright is a showroom
// devDependency, and ESM resolves relative to the FILE, not the cwd.
const { chromium } = await import(
  path.join('/Users/daniel/Developer/Rottay/ui-design-system/packages/showroom/node_modules/@playwright/test/index.mjs')
);

const HERE = path.dirname(fileURLToPath(import.meta.url));
const CORE = path.resolve(HERE, '..', '..', '..', '..', '..');
const SHOWROOM = path.resolve(CORE, '..', 'showroom');
const BASE = 'http://localhost:7001/probe/ds-reference';

const TENANTS = ['bithire', 'the-management'];
const SCENES = ['overlay', 'overlay-blocking'];

/** The four role channels under test (spec: material-overlay ground). */
const ROLE_CHANNELS = [
  '--ds-material-overlay-background',
  '--ds-material-overlay-shadow',
  '--ds-material-overlay-border',
  '--ds-material-overlay-highlight',
];

/**
 * Channel-typing matrix inputs (WITHDRAWN LAW CORRECTED — see the file header).
 * `--ds-material-overlay-shadow` and `-highlight` are NOT globally "shadow-list-
 * item typed" as channels — the list-splice census is what determines that
 * per SITE, and it found exactly three offending sites (dropdown, modal,
 * drawer), not these two channels everywhere they appear. What is still true
 * and still worth a runtime probe: AT THE THREE SITES THE CENSUS NAMED, these
 * two channels currently sit in the defective position (iii) shape, so a
 * runtime read of what happens there is real evidence, scoped to those sites
 * — not a channel-wide claim. `--ds-material-control-focus-ring` is a
 * CROSS-ROLE sentinel from the control role, included to check whether
 * overlay members leak-consume a foreign role's channel (source grep already
 * showed they do not reference it at all in popover.css/dropdown.css/
 * overlay-modal.css/drawer.css — the live measurement either confirms that
 * isolation or corrects it).
 */
const SHADOW_TYPED_OVERLAY_CHANNELS = ['--ds-material-overlay-shadow', '--ds-material-overlay-highlight'];
const CROSS_ROLE_SENTINEL_CHANNEL = '--ds-material-control-focus-ring';
const ALL_TYPED_CHANNELS = [...SHADOW_TYPED_OVERLAY_CHANNELS, CROSS_ROLE_SENTINEL_CHANNEL];

/** The three test values used to probe list-splice SITES (not channel types). */
const TYPED_MUTATION_VALUES = {
  neutral: { value: '0 0 0 0 transparent', label: 'syntactically valid neutral shadow layer (must survive at a clean site)' },
  bareNone: { value: 'none', label: 'bare none — a whole-value keyword, illegal as a non-sole shadow-list item' },
  real: { value: '0 2px 0 rgba(0, 0, 0, 0.2)', label: 'real value (surgical layer replacement at a clean site)' },
};

const TEXTURE_CHANNEL = '--ds-material-overlay-texture';
const TEXTURE_GRADIENT_SENTINEL = 'linear-gradient(37deg, rgb(1, 254, 3), rgb(1, 254, 3))';

// A loud, unmistakable sentinel for the original 4-channel existence test. The digit
// run "1, 254, 3" cannot occur in any authored token in this codebase, so a substring
// match on the COMPUTED value is proof of causality, not a coincidence. Two shapes
// because the four channels feed two different CSS value grammars: a <color>
// (background, border) and a <box-shadow> layer (shadow, highlight).
const SENTINEL_RGB = '1, 254, 3';
const COLOR_SENTINEL = `rgb(${SENTINEL_RGB})`;
const SHADOW_SENTINEL = `0px 0px 0px 12345px rgb(${SENTINEL_RGB})`;
function sentinelFor(channel) {
  return channel.endsWith('-shadow') || channel.endsWith('-highlight') ? SHADOW_SENTINEL : COLOR_SENTINEL;
}

/** Matches linear-, radial-, conic- and repeating- gradients, case-insensitively. */
const GRADIENT_RE = /(?:repeating-)?(?:linear|radial|conic)-gradient\(/i;
function isGradient(value) {
  return typeof value === 'string' && GRADIENT_RE.test(value);
}

/**
 * Split a computed box-shadow (or any comma-separated CSS value list) into its
 * top-level layers. A naive `.split(',')` is wrong here and would have been exactly
 * the "pattern-matching a structured language" mistake this whole round is about:
 * a single shadow layer's color can itself be `rgba(0, 0, 0, 0.2)` or
 * `color-mix(in srgb, ...)`, both containing commas that must NOT be split on. This
 * tracks paren depth and only splits at depth 0.
 */
function splitTopLevelLayers(value) {
  if (typeof value !== 'string' || value.trim() === '' || value.trim() === 'none') return [];
  const layers = [];
  let depth = 0;
  let current = '';
  for (const ch of value) {
    if (ch === '(') depth += 1;
    if (ch === ')') depth -= 1;
    if (ch === ',' && depth === 0) {
      layers.push(current.trim());
      current = '';
      continue;
    }
    current += ch;
  }
  if (current.trim()) layers.push(current.trim());
  return layers;
}

/**
 * EXPAND BEFORE COUNTING (hard-veto fix — the central defect). splitTopLevelLayers
 * is correct and unmodified for its ORIGINAL purpose: computed values returned by
 * getComputedStyle() are already fully resolved by the browser, so counting raw
 * top-level commas there is exactly right. It was WRONG to reuse it unmodified on
 * unresolved SOURCE TEXT for the static census: a declaration can be syntactically
 * ONE var(...) call with no top-level comma, while its FALLBACK — reached the
 * instant the primary name is unset — legally contains its OWN top-level commas
 * (CSS var() fallback grammar: `var(NAME, F1, F2, ...)` means "if NAME is unset,
 * the value IS F1, F2, ... as however many comma-separated pieces the fallback
 * contains"). Confirmed live in list-toolbar.css:106-111:
 *   box-shadow: var(--ds-toolbar-shadow, inset 0 1px 0 color-mix(...), var(--ds-material-panel-shadow, var(--ds-elevation-1)));
 * Zero top-level commas outside the outer var(), so the old counter saw ONE item
 * and moved on. But --ds-toolbar-shadow is NOT defined for every ground (it IS in
 * bithire's artifact, which is exactly why this proves nothing by tenant — a
 * static census must fail closed for the CHANNEL GRAMMAR, not the one shipped
 * artifact that happens to mask it) — so for any ground that leaves it unset, the
 * fallback is reached and becomes a REAL 2-item box-shadow with
 * --ds-material-panel-shadow as the non-sole second item — the exact defect shape.
 *
 * This recursively unwraps a value that is ENTIRELY one var(NAME, FALLBACK) call:
 * strip the wrapper, re-split the fallback, and repeat — until the result is not
 * reducible to a single all-encompassing var() call (a real multi-item list, a
 * literal, or a bare var(NAME) with nothing left to unwrap). Depth-capped and
 * FAILS CLOSED: if the cap is hit, the caller must treat the result as unsafe
 * (see classifyTerminalDecl), never as a clean single item.
 */
function isWholeValueSingleVarCall(value) {
  const trimmed = value.trim();
  if (!/^var\(/i.test(trimmed)) return false;
  let depth = 0;
  for (let i = 0; i < trimmed.length; i++) {
    if (trimmed[i] === '(') depth += 1;
    else if (trimmed[i] === ')') {
      depth -= 1;
      if (depth === 0) return i === trimmed.length - 1; // must close exactly at the end, not partway through more text
    }
  }
  return false;
}

/** Given a value that IS entirely one var(...) call, split it into {name, fallback}.
 * fallback is null for a bare var(NAME) with no fallback argument at all. */
function unwrapSingleVarCall(value) {
  const trimmed = value.trim();
  const inner = trimmed.slice(4, -1); // drop leading "var(" and the final ")"
  let depth = 0;
  for (let i = 0; i < inner.length; i++) {
    const ch = inner[i];
    if (ch === '(') depth += 1;
    else if (ch === ')') depth -= 1;
    else if (ch === ',' && depth === 0) {
      return { name: inner.slice(0, i).trim(), fallback: inner.slice(i + 1).trim() };
    }
  }
  return { name: inner.trim(), fallback: null };
}

const EXPANSION_DEPTH_CAP = 20;
function expandAndSplitSourceLayers(value, depth = 0) {
  if (depth > EXPANSION_DEPTH_CAP) {
    return { layers: null, failedClosed: true, reason: `expansion recursion exceeded ${EXPANSION_DEPTH_CAP} — treat as unsafe, not as a clean single item` };
  }
  const raw = splitTopLevelLayers(value);
  if (raw.length === 1 && isWholeValueSingleVarCall(raw[0])) {
    const { fallback } = unwrapSingleVarCall(raw[0]);
    if (fallback !== null) {
      return expandAndSplitSourceLayers(fallback, depth + 1);
    }
  }
  return { layers: raw, failedClosed: false };
}

/**
 * Family registry. Selectors were read out of the live modern-engine TSX
 * (data-part + className co-location), not guessed from the CSS selectors —
 * the CSS selectors themselves proved unreliable as DOM queries in one case
 * (popover's surface className is a passthrough prop, not a fixed class; the
 * robust query is "a [data-part=surface] descendant of .rottay-popover--modern").
 *
 * nestedRung is null for Modal and Drawer: a source grep for
 * `layer-step`/`rung` across their skin files returns nothing. The mechanism
 * is structurally absent for those two, not merely untested, and the probe
 * says so in the report instead of fabricating a cell for it.
 */
const FAMILIES = [
  {
    name: 'Popover',
    scene: 'overlay',
    surfaceSelector: '.rottay-popover--modern [data-part="surface"]',
    nestedRung: {
      ancestorClass: 'rottay-overlay-modal-shell--modern',
      privateVar: '--_ds-popover-layer-step-shadow',
    },
  },
  {
    name: 'Dropdown',
    scene: 'overlay',
    surfaceSelector: '.rottay-dropdown__surface[data-part="surface"]',
    nestedRung: {
      ancestorClass: 'rottay-overlay-modal-shell--modern',
      privateVar: '--_ds-dropdown-layer-step-shadow',
    },
  },
  {
    name: 'Modal',
    scene: 'overlay-blocking',
    surfaceSelector: '.rottay-overlay-modal-shell--modern [data-part="surface"]',
    nestedRung: null,
  },
  {
    name: 'Drawer',
    scene: 'overlay-blocking',
    surfaceSelector: '.rottay-drawer--modern[data-part="surface"]',
    nestedRung: null,
  },
];

/**
 * CLAIM INPUT SET (fix 4). "Six component CSS files is not the input set... if
 * you will not hash an input, then the claim must not depend on it — say which
 * and narrow it explicitly." Three categories, all hashed:
 *
 * CSS (skin + role vocabulary) — what was already tracked.
 *
 * TENANT FIXTURES — bithire's ground reads `bithireBrandTheme` re-exported from
 * `@rottay/design-system` (resolves through dist/, i.e. it is itself a GENERATED
 * input, tracked there). The-management's ground reads
 * `tenantThemeCanaryFixtures.specimens.themanagement` (also a GENERATED/published
 * artifact, tracked in GENERATED below) which is itself built FROM an authored
 * TypeScript fixture — that authored source is the true "tenant fixture" input
 * and is hashed here.
 *
 * ROUTE SOURCES — the ds-reference lab's own TSX/TS: the ground component that
 * decides which BrandTheme/document each tenant mounts, the scene component that
 * decides what markup renders, and every page/layout in the actual navigation
 * path. If any of these change, the DOM this probe queries can change even with
 * zero CSS movement.
 */
const CSS_SOURCE_FILES = [
  'src/foundation/tokens/css/foundation/themes/default.css',
  'src/foundation/tokens/css/runtime/engines/modern/skin/popover.css',
  'src/foundation/tokens/css/runtime/engines/modern/skin/dropdown.css',
  'src/foundation/tokens/css/runtime/engines/modern/skin/overlay-modal.css',
  'src/foundation/tokens/css/runtime/engines/modern/skin/drawer.css',
  'src/foundation/tokens/css/presentation/components/semantic-surface.css',
];
const TENANT_FIXTURE_SOURCE_FILES = [
  // The authored TypeScript fixture scripts/tenant-theme-canary-fixtures.mjs
  // compiles into tenant-theme-canary-fixtures.json (GENERATED, hashed there).
  'src/foundation/contracts/composition/tenants/themes/tenant-theme/fixtures/themanagement-db-row/index.ts',
  // BitHire's authored BrandTheme source. The LIVE import is the package's own
  // `bithireBrandTheme` re-export (GENERATED, resolves through dist/), but the
  // authored source is what a human edits, so it is tracked here for the same
  // reason the TMM fixture is.
  'src/foundation/tokens/ts/presentation/brand-themes/bithire/index.ts',
];
const ROUTE_SOURCE_FILES_SHOWROOM_REL = [
  'src/app/probe/ds-reference/ground/index.tsx',
  'src/app/probe/ds-reference/ground/stamp.ts',
  'src/app/probe/ds-reference/chrome/index.tsx',
  'src/app/probe/ds-reference/judge/index.tsx',
  'src/app/probe/ds-reference/sections/overlay/index.tsx',
  'src/app/probe/ds-reference/bithire/layout.tsx',
  'src/app/probe/ds-reference/the-management/layout.tsx',
  'src/app/probe/ds-reference/bithire/overlay/page.tsx',
  'src/app/probe/ds-reference/bithire/overlay-blocking/page.tsx',
  'src/app/probe/ds-reference/the-management/overlay/page.tsx',
  'src/app/probe/ds-reference/the-management/overlay-blocking/page.tsx',
];

/**
 * EXPLICITLY NARROWED OUT OF SCOPE, named rather than silently assumed stable:
 * the-management's box-shadow/highlight/texture CSS is not a static file at
 * all — LabGround compiles it PER REQUEST from the canary specimen
 * (compileTenantThemeConfig) and inlines the result as
 * `<style id="rottay-runtime-tenant-theme" data-digest="...">`. The compiler
 * CODE that does this (part of dist/index.js/.cjs) is not hashed here — doing
 * so would make this probe's validity claim sensitive to every unrelated code
 * change in the whole package, not just CSS-relevant ones. The compiled
 * OUTPUT'S identity is instead available at RUNTIME via that `data-digest`
 * attribute the ground already stamps; a live run should read and compare it
 * per navigation rather than this static probe attempting to hash compiler
 * source. Recorded here so the gap is a decision, not an omission.
 */
const KNOWINGLY_UNHASHED_INPUTS = [
  {
    input: 'the-management per-request CSS compiler (compileTenantThemeConfig / hydrateTenantThemeConfig, part of packages/core/dist/index.{js,cjs})',
    reason: 'Compiler CODE, not data — hashing it would tie validity to unrelated package changes. The compiled OUTPUT is content-addressed at runtime via the rendered <style data-digest> attribute; a dynamic run should read that per navigation instead.',
  },
];

function cssProvenance() {
  return CSS_SOURCE_FILES.map((rel) => {
    const abs = path.join(CORE, rel);
    try {
      const st = statSync(abs);
      return { path: rel, mtimeIso: st.mtime.toISOString(), sizeBytes: st.size };
    } catch (e) {
      return { path: rel, error: String(e.message) };
    }
  });
}

/**
 * BUNDLE FRESHNESS CHECK. "Verify the SERVED dev bundle contains the current chain,
 * not just that the source does... do not compare timestamps alone and do not grep
 * for a CSS comment — comments are stripped from the bundle, so their absence proves
 * nothing." This reads the actual served CSS file, extracts EVERY declaration of a
 * named custom property from both source and bundle (there can legitimately be more
 * than one — personality variants each redeclare the -current props), normalises
 * whitespace, and compares the arrays. A mismatch means the browser is not running
 * what source review would lead a reader to expect, regardless of what any comment or
 * mtime says.
 */
const BUNDLE_CSS_PATH = path.join(SHOWROOM, '.next/dev/static/css/app/layout.css');
const FRESHNESS_PROPERTIES = [
  { file: 'popover.css', sourcePath: path.join(CORE, 'src/foundation/tokens/css/runtime/engines/modern/skin/popover.css'), prop: '--ds-popover-shadow-current' },
  { file: 'popover.css', sourcePath: path.join(CORE, 'src/foundation/tokens/css/runtime/engines/modern/skin/popover.css'), prop: '--ds-popover-highlight-current' },
  { file: 'popover.css', sourcePath: path.join(CORE, 'src/foundation/tokens/css/runtime/engines/modern/skin/popover.css'), prop: '--ds-popover-texture-current' },
];

function extractAllDeclarations(css, propName) {
  const escaped = propName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  // [^;]+ is safe across multi-line values: no CSS function argument list uses a
  // literal semicolon, so the first ';' always terminates the declaration, and a
  // negated character class matches newlines by default (no need for the /s flag).
  const re = new RegExp(`${escaped}\\s*:\\s*([^;]+);`, 'g');
  const out = [];
  let m;
  while ((m = re.exec(css)) !== null) out.push(m[1].replace(/\s+/g, ' ').trim());
  return out;
}

function verifyBundleFreshness() {
  let bundleCss;
  let bundleReadError = null;
  try {
    bundleCss = readFileSync(BUNDLE_CSS_PATH, 'utf8');
  } catch (e) {
    bundleReadError = String(e.message);
  }

  const bundleStat = (() => {
    try {
      const st = statSync(BUNDLE_CSS_PATH);
      return { mtimeIso: st.mtime.toISOString(), sizeBytes: st.size };
    } catch (e) {
      return { error: String(e.message) };
    }
  })();

  const checks = FRESHNESS_PROPERTIES.map(({ file, sourcePath, prop }) => {
    let sourceCss;
    try {
      sourceCss = readFileSync(sourcePath, 'utf8');
    } catch (e) {
      return { file, prop, error: `could not read source: ${e.message}` };
    }
    const sourceDecls = extractAllDeclarations(sourceCss, prop);
    if (bundleReadError) {
      return { file, prop, sourceDeclarations: sourceDecls, bundleReadError, matches: null };
    }
    const bundleDecls = extractAllDeclarations(bundleCss, prop);
    const matches = JSON.stringify(sourceDecls) === JSON.stringify(bundleDecls);
    // Duplicate/ghost detection: the bundle carrying MORE declarations than source for
    // the same property, with some entries absent from source, is a real dev-server
    // HMR staleness signature (stale <style> content not fully superseded) — distinct
    // from a plain mismatch, and worth flagging on its own even when the cascade-
    // winning (LAST) value still happens to be correct.
    const bundleOnly = bundleDecls.filter((d) => !sourceDecls.includes(d));
    return {
      file,
      prop,
      sourceDeclarationCount: sourceDecls.length,
      bundleDeclarationCount: bundleDecls.length,
      matches,
      bundleHasStaleDuplicates: bundleOnly.length > 0,
      bundleOnlyDeclarations: bundleOnly,
      sourceDeclarations: sourceDecls,
      bundleDeclarations: bundleDecls,
    };
  });

  const allMatch = checks.every((c) => c.matches === true);
  const anyStaleDuplicates = checks.some((c) => c.bundleHasStaleDuplicates);

  return {
    bundlePath: BUNDLE_CSS_PATH,
    bundleReadError,
    bundleStat,
    checkedAt: new Date().toISOString(),
    checks,
    allMatch,
    anyStaleDuplicates,
    verdict: bundleReadError
      ? `COULD NOT VERIFY — ${bundleReadError}. Do not trust downstream results as fresh.`
      : allMatch && !anyStaleDuplicates
        ? 'FRESH — served bundle declarations match source exactly, no stale duplicates found.'
        : anyStaleDuplicates
          ? 'STALE DUPLICATES FOUND — the served bundle contains declarations for these properties that do not exist in current source (leftover from an earlier HMR cycle). The LAST declaration for a given selector still wins the cascade in the browser, so getComputedStyle-based measurements below remain valid, but the bundle file itself is not clean and a text-based read of it would be misleading.'
          : 'MISMATCH — served bundle does not contain the current source chain. Results below may reflect stale behaviour; re-run after the dev server settles.',
  };
}

/**
 * PIPELINE HASH SNAPSHOT — the round-2 run's fatal flaw, and how this closes it.
 *
 * The round-2 run spanned 15:42:48Z-15:47:13Z (4m25s). Source changed at
 * 15:44:40Z; the SERVED bundle changed at 15:46:03Z. Both landed mid-run. This
 * probe's page-per-tenant-per-scene loop measures families sequentially, so
 * different families were reading DIFFERENT pipeline states depending on
 * exactly when their page loaded relative to those two edits — an apparent
 * "bithire has the gradient, the-management doesn't" cross-tenant finding was
 * actually just "which one got measured before 15:46:03Z and which after."
 * failuresCount 0 said nothing about this: every individual measurement
 * succeeded, the mixture was invisible to any single reading.
 *
 * THREE pipeline stages, each now a FULL claim-input set (fix 4), not a
 * six-file sample: SOURCE (hand-authored CSS + tenant fixture + ds-reference
 * route TSX/TS) -> GENERATED (packages/core/dist/styles.css, confirmed to
 * contain the popover/dropdown/modal/drawer rules AND bithire's compiled
 * artifact — this is what `@rottay/design-system/styles.css` and
 * `bithireBrandTheme` resolve to per package.json's exports map, and it is
 * NOT a live watch target: no vite/tsc watch process was running when this
 * was written, so it only advances when someone explicitly rebuilds core —
 * PLUS tenant-theme-canary-fixtures.json, the published compile of the
 * authored TMM fixture that LabGround reads for the-management) -> SERVED
 * (the showroom's own webpack bundle, BUNDLE_CSS_PATH).
 *
 * The protocol: hash every stage before the run and again after. If ANY hash
 * differs, the run sampled more than one pipeline state and the result is
 * INVALID -- reported as such, loudly, rather than delivered as if clean.
 * What is NOT hashed is named explicitly in KNOWINGLY_UNHASHED_INPUTS rather
 * than silently assumed stable.
 */
const GENERATED_FILES = [
  path.join(CORE, 'dist/styles.css'),
  path.join(CORE, 'tenant-theme-canary-fixtures.json'),
];

function hashFile(absPath) {
  try {
    const buf = readFileSync(absPath);
    return {
      path: absPath,
      sha256: createHash('sha256').update(buf).digest('hex'),
      sizeBytes: buf.length,
      mtimeIso: statSync(absPath).mtime.toISOString(),
    };
  } catch (e) {
    return { path: absPath, error: String(e.message) };
  }
}

function snapshotPipelineHashes() {
  const source = [
    ...CSS_SOURCE_FILES.map((rel) => hashFile(path.join(CORE, rel))),
    ...TENANT_FIXTURE_SOURCE_FILES.map((rel) => hashFile(path.join(CORE, rel))),
    ...ROUTE_SOURCE_FILES_SHOWROOM_REL.map((rel) => hashFile(path.join(SHOWROOM, rel))),
  ];
  const generated = GENERATED_FILES.map((abs) => hashFile(abs));
  const served = hashFile(BUNDLE_CSS_PATH);
  return { takenAt: new Date().toISOString(), source, generated, served, knowinglyUnhashed: KNOWINGLY_UNHASHED_INPUTS };
}

/** Compare two snapshots; return the list of stages/files whose hash moved. */
function diffPipelineSnapshots(before, after) {
  const drift = [];
  for (let i = 0; i < before.source.length; i++) {
    const b = before.source[i];
    const a = after.source[i];
    if ((b.sha256 ?? b.error) !== (a.sha256 ?? a.error)) {
      drift.push({ stage: 'source', path: b.path, before: b.sha256 ?? b.error, after: a.sha256 ?? a.error, afterMtimeIso: a.mtimeIso });
    }
  }
  for (let i = 0; i < before.generated.length; i++) {
    const b = before.generated[i];
    const a = after.generated[i];
    if ((b.sha256 ?? b.error) !== (a.sha256 ?? a.error)) {
      drift.push({ stage: 'generated', path: b.path, before: b.sha256 ?? b.error, after: a.sha256 ?? a.error, afterMtimeIso: a.mtimeIso });
    }
  }
  if ((before.served.sha256 ?? before.served.error) !== (after.served.sha256 ?? after.served.error)) {
    drift.push({ stage: 'served', path: before.served.path, before: before.served.sha256 ?? before.served.error, after: after.served.sha256 ?? after.served.error, afterMtimeIso: after.served.mtimeIso });
  }
  return drift;
}

/**
 * SERVER PROCESS IDENTITY (fix 1). Hashes alone cannot see a restart: source,
 * generated and served content can all match across a restart if the restart
 * just reloads the same bytes, while the underlying process, its in-memory
 * caches and the browser's connection to it are completely different. Next
 * has been observed self-restarting on its memory threshold this session —
 * a live failure mode, not a hypothetical one. This shells out to `lsof` to
 * find the PID bound to the port, then `ps` for that PID's process start
 * time (`lstart` — a fixed identity for the life of the process; a restart
 * gets a NEW pid and/or a NEW lstart even if it happens to bind the same
 * port fast enough that a human wouldn't notice). Both must be captured
 * before AND after the run and compared; a change in either is a restart.
 */
function getServerProcessIdentity(port) {
  try {
    const pidOut = execFileSync('lsof', ['-i', `:${port}`, '-sTCP:LISTEN', '-t'], { encoding: 'utf8' }).trim();
    const pid = pidOut.split('\n')[0]?.trim();
    if (!pid) return { port, pid: null, error: 'no listening process found on port' };
    const lstart = execFileSync('ps', ['-o', 'lstart=', '-p', pid], { encoding: 'utf8' }).trim();
    return { port, pid, lstart, identity: `${pid}@${lstart}` };
  } catch (e) {
    return { port, pid: null, error: String(e.message) };
  }
}

/** Two server-identity snapshots refer to the same live process iff both PID and lstart match. */
function sameServerProcess(before, after) {
  if (!before || !after) return false;
  if (before.error || after.error) return false;
  return before.pid === after.pid && before.lstart === after.lstart;
}

/**
 * DETERMINISTIC SERVER HEALTH CHECK, WHOLE MATRIX (fix 2). A green check on
 * one fast route says nothing about the two that cannot serve — measured
 * live: bithire/overlay-blocking answered in 0.18s while the-management's
 * overlay and overlay-blocking both TIMED OUT at 8s. This now checks EVERY
 * route this probe actually navigates to (all TENANTS x SCENES combinations,
 * not just one), and requires REQUIRED_CONSECUTIVE clean, FAST 200 responses
 * PER ROUTE before declaring the whole matrix healthy — a route that never
 * achieves that fails the whole check, which is the point: this probe must
 * not proceed to measure a route it cannot itself prove is serving.
 */
async function waitForServerHealthy(urls, { requiredConsecutive = 3, perRequestBudgetMs = 5000, overallDeadlineMs = 180000 } = {}) {
  // INPUT-SHAPE GUARD. Caught by this file's own self-test (`--self-test`):
  // calling this with a single URL STRING instead of an array of urls used
  // to crash with a raw `TypeError: urls.map is not a function` — informative
  // to nobody. Failing closed with a clear message here is a real hardening
  // of the function's OWN contract, independent of whether any CURRENT call
  // site gets the shape wrong (main()'s call site does not — see the source-
  // wiring self-test — but a function that crashes cryptically on a bad
  // shape is a defect in itself, not just a symptom of a bad caller).
  if (!Array.isArray(urls) || urls.length === 0 || !urls.every((u) => typeof u === 'string')) {
    throw new Error(
      `waitForServerHealthy(urls, ...) requires a non-empty ARRAY of URL strings — got ${Array.isArray(urls) ? `an array of length ${urls.length}` : typeof urls}${typeof urls === 'string' ? ` ("${urls}")` : ''}. This is a caller bug, not a server-health failure.`
    );
  }
  const deadline = Date.now() + overallDeadlineMs;
  const perUrl = new Map(urls.map((u) => [u, { consecutive: 0, attempts: [] }]));
  while (Date.now() < deadline) {
    for (const url of urls) {
      const state = perUrl.get(url);
      if (state.consecutive >= requiredConsecutive) continue;
      const startedAt = Date.now();
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), perRequestBudgetMs);
      try {
        const res = await fetch(url, { signal: controller.signal });
        const elapsedMs = Date.now() - startedAt;
        const ok = res.status === 200 && elapsedMs <= perRequestBudgetMs && res.headers && [...res.headers.keys()].length > 0;
        state.attempts.push({ status: res.status, elapsedMs, headerCount: res.headers ? [...res.headers.keys()].length : 0, ok });
        state.consecutive = ok ? state.consecutive + 1 : 0;
      } catch (e) {
        state.attempts.push({ error: String(e.message), elapsedMs: Date.now() - startedAt, ok: false });
        state.consecutive = 0;
      } finally {
        clearTimeout(timer);
      }
    }
    if ([...perUrl.values()].every((s) => s.consecutive >= requiredConsecutive)) {
      const perRoute = Object.fromEntries(
        [...perUrl.entries()].map(([url, s]) => [url, { healthy: true, lastAttempts: s.attempts.slice(-requiredConsecutive) }])
      );
      return { healthy: true, perRoute, routesChecked: urls };
    }
    await new Promise((r) => setTimeout(r, 1000));
  }
  const perRoute = Object.fromEntries(
    [...perUrl.entries()].map(([url, s]) => [url, { healthy: s.consecutive >= requiredConsecutive, lastAttempts: s.attempts.slice(-5) }])
  );
  const unhealthyRoutes = Object.entries(perRoute).filter(([, r]) => !r.healthy).map(([url]) => url);
  throw new Error(
    `SERVER NOT DETERMINISTICALLY HEALTHY across the whole matrix after ${overallDeadlineMs}ms — unhealthy routes: ${unhealthyRoutes.join(', ')}. Detail: ${JSON.stringify(perRoute)}. Refusing to run against a partially-serving server.`
  );
}

async function settleFrame(page) {
  await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
}

/** Fail-closed readiness: refuse to measure a surface that is not actually painted
 * (present, non-zero bounds, not hidden, not transparent) — the exact class of gap
 * that let a capture race pass as clean earlier this session. */
async function waitForVisible(page, selector, timeoutMs = 30000) {
  const deadline = Date.now() + timeoutMs;
  for (;;) {
    const ok = await page.evaluate((sel) => {
      const el = document.querySelector(sel);
      if (!el) return false;
      const r = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && Number(cs.opacity) > 0.01;
    }, selector);
    if (ok) return;
    if (Date.now() > deadline) {
      throw new Error(`READINESS FAILED — '${selector}' never became visible within ${timeoutMs}ms. Refusing to measure an unpainted surface.`);
    }
    await page.waitForTimeout(200);
  }
}

/**
 * Collect pseudo-element paint AND the surface's own backgroundImage, plus a walk of
 * every VISIBLE descendant checking backgroundImage AND that descendant's own
 * ::before/::after. The descendant+pseudo combination is the exact blind spot named in
 * the brief: the popover title's gradient lives on a child element, not the surface
 * node, and a surface-only backgroundImage read (what the prior probe did) cannot see
 * it. The surface's OWN backgroundImage is captured too (round 2 addition): dropdown's
 * texture channel paints directly in the surface's own `background:` list, not through
 * a pseudo-element, and the round-1 version of this probe never read that property on
 * the root — only on descendants. Left un-hidden rather than quietly patched.
 */
async function collectSurfaceEvidence(page, selector) {
  return page.evaluate((sel) => {
    function cssPath(el, root) {
      const parts = [];
      let node = el;
      while (node && node.nodeType === 1) {
        let part = node.tagName.toLowerCase();
        const dataPart = node.getAttribute('data-part');
        if (dataPart) part += `[data-part="${dataPart}"]`;
        else if (typeof node.className === 'string' && node.className.trim()) {
          part += `.${node.className.trim().split(/\s+/)[0]}`;
        }
        parts.unshift(part);
        if (node === root) break;
        node = node.parentElement;
      }
      return parts.join(' > ');
    }
    function isVisible(el) {
      const r = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && Number(cs.opacity) > 0.01;
    }
    function readPseudo(el) {
      const before = getComputedStyle(el, '::before');
      const after = getComputedStyle(el, '::after');
      return {
        before: { backgroundImage: before.backgroundImage, opacity: before.opacity, content: before.content },
        after: { backgroundImage: after.backgroundImage, opacity: after.opacity, content: after.content },
      };
    }

    const root = document.querySelector(sel);
    if (!root) return null;

    const surfacePseudo = readPseudo(root);
    const surfaceBackgroundImage = getComputedStyle(root).backgroundImage;
    const descendants = [];
    for (const el of root.querySelectorAll('*')) {
      if (!isVisible(el)) continue;
      const cs = getComputedStyle(el);
      descendants.push({
        path: cssPath(el, root),
        tag: el.tagName.toLowerCase(),
        dataPart: el.getAttribute('data-part'),
        className: typeof el.className === 'string' ? el.className : null,
        backgroundImage: cs.backgroundImage,
        pseudo: readPseudo(el),
      });
    }
    return { surfacePseudo, surfaceBackgroundImage, descendants };
  }, selector);
}

/**
 * Raw paint snapshot used by the original 4-channel existence test. Six properties are
 * read regardless of which channel is under test, so a channel that shows up somewhere
 * UNEXPECTED is visible instead of hidden.
 *
 * THE TWO PSEUDO-ELEMENT ENTRIES EXIST BECAUSE OF A BUG THIS PROBE CAUGHT IN ITSELF.
 * The first draft read only the four SURFACE-level properties, and it reported
 * Popover's highlight channel as dead. It is not: popover.css's own comment says the
 * tint/motif layers "moved to the ::before decoration slot ... instead of the surface
 * background", and the surface's own box-shadow rule never references the highlight
 * channel at all — it paints on `[data-part="surface"]::before`, which the
 * surface-only reading never looked at. Left in as evidence rather than quietly fixed
 * and hidden.
 */
async function readPaintSnapshot(page, selector) {
  return page.evaluate((sel) => {
    const el = document.querySelector(sel);
    if (!el) return null;
    const cs = getComputedStyle(el);
    const beforePseudo = getComputedStyle(el, '::before');
    const afterPseudo = getComputedStyle(el, '::after');
    return {
      backgroundColor: cs.backgroundColor,
      backgroundImage: cs.backgroundImage,
      borderTopColor: cs.borderTopColor,
      boxShadow: cs.boxShadow,
      pseudoBeforeBackgroundImage: beforePseudo.backgroundImage,
      pseudoAfterBackgroundImage: afterPseudo.backgroundImage,
    };
  }, selector);
}

/**
 * SENIOR FAMILY VAR TABLE — post-adjudication correction. "Family chrome
 * senior" is the deliberately-chosen ordering (Fable's delegating default):
 * where a family var exists in front of a role channel in the fallback
 * chain, a tenant authoring that family var MUST outrank the role. Mutating
 * only the role and finding no paint change there is CORRECT, not dead.
 *
 * Every entry below is READ OUT OF THE ACTUAL TERMINAL/FORWARDING
 * DECLARATIONS via this file's own census infrastructure
 * (buildDeclarationIndex + the resolved terminalSites), not guessed:
 *
 *   Popover  background -> --ds-popover-bordered-background  (popover.css, --ds-popover-surface, "bordered" personality)
 *   Popover  shadow     -> --ds-popover-bordered-shadow       (popover.css, --ds-popover-shadow-current, "bordered")
 *   Popover  border     -> --ds-popover-bordered-border       (popover.css, --ds-popover-edge, "bordered")
 *   Popover  highlight  -> null — not wired to any senior var because it is
 *                          not wired to the role channel AT ALL (confirmed:
 *                          no --ds-material-overlay-highlight reference
 *                          anywhere in popover.css's -current bridges; the
 *                          file's own comment says this causality is
 *                          "struck and deferred").
 *   Dropdown background -> null — role is the OUTERMOST var() in dropdown.css's
 *                          own background list; nothing wraps it.
 *   Dropdown shadow     -> --ds-dropdown-shadow                (dropdown.css box-shadow)
 *   Dropdown border     -> --ds-dropdown-border-color           (dropdown.css border)
 *   Dropdown highlight  -> null — role is outermost in the box-shadow highlight layer.
 *   Modal    background -> --ds-modal-bg                        (overlay-modal.css background-color)
 *   Modal    shadow     -> --ds-modal-shadow                    (overlay-modal.css box-shadow)
 *   Modal    border     -> null — role is outermost for border-color; --ds-modal-border-WIDTH
 *                          exists but governs a different axis (width, not color) and does
 *                          not shadow the role.
 *   Modal    highlight  -> null — role is outermost in the box-shadow highlight layer.
 *   Drawer   *          -> null for all four — every drawer.css terminal has the role
 *                          channel as the OUTERMOST var() already (confirmed: --ds-drawer-shadow
 *                          exists at :root but is never referenced in drawer.css at all).
 *
 * This matches the adjudication's own worked examples exactly (BitHire authors
 * --ds-modal-shadow and --ds-modal-bg; Rottay authors modal AND dropdown family
 * vars) — cross-checked against those examples as a sanity confirmation, not
 * derived from them.
 *
 * NOTE ON TENANT-WRITABILITY: some of these (the --ds-popover-bordered-*
 * bridges in particular) are NOT currently exposed through the tenant-config
 * override surface (a separate, product-level question, already documented
 * elsewhere). This table tests the ENGINE-LEVEL seniority CONTRACT — does the
 * CSS correctly implement "family senior" where the chain provides for it —
 * regardless of whether today's tenant-config layer currently reaches that
 * write path.
 */
const SENIOR_FAMILY_VAR = {
  Popover: { background: '--ds-popover-bordered-background', shadow: '--ds-popover-bordered-shadow', border: '--ds-popover-bordered-border', highlight: null },
  Dropdown: { background: null, shadow: '--ds-dropdown-shadow', border: '--ds-dropdown-border-color', highlight: null },
  Modal: { background: '--ds-modal-bg', shadow: '--ds-modal-shadow', border: null, highlight: null },
  Drawer: { background: null, shadow: null, border: null, highlight: null },
};
function seniorFamilyVarFor(familyName, channel) {
  const key = channel.replace('--ds-material-overlay-', ''); // 'background' | 'shadow' | 'border' | 'highlight'
  return SENIOR_FAMILY_VAR[familyName]?.[key] ?? null;
}

// A SECOND, DISTINCT sentinel family for mode 2 (family authored), so that
// mode 2's read can tell WHICH of the two authored values actually painted —
// "1, 254, 3" identifies the ROLE channel's write; "7, 253, 9" identifies the
// FAMILY channel's write. Two different digit runs, neither of which can
// occur in any authored token in this codebase.
const FAMILY_SENTINEL_RGB = '7, 253, 9';
const FAMILY_COLOR_SENTINEL = `rgb(${FAMILY_SENTINEL_RGB})`;
const FAMILY_SHADOW_SENTINEL = `0px 0px 0px 54321px rgb(${FAMILY_SENTINEL_RGB})`;
function familySentinelFor(channel) {
  return channel.endsWith('-shadow') || channel.endsWith('-highlight') ? FAMILY_SHADOW_SENTINEL : FAMILY_COLOR_SENTINEL;
}

function containsFragment(snapshot, fragment) {
  if (!snapshot) return false;
  return Object.values(snapshot).some((v) => String(v).includes(fragment));
}

/**
 * ROLE-CHANNEL CAUSALITY — THREE MODES (post-adjudication correction; replaces
 * the round-1 single-mode test, which could not distinguish "the channel is
 * inert" from "the channel is correctly outranked by senior family chrome"
 * and would have produced FALSE DEAD verdicts on exactly the cells where a
 * tenant authors the family var. "A probe that cannot distinguish these is
 * the same instrument failure this round keeps producing in a new costume."
 *
 * MODE 1 — family neutralized (set to `initial`, the CSS-wide keyword that
 * makes a custom property guaranteed-invalid, which is what makes var()'s
 * fallback fire — a reproducible, documented neutralization, not an
 * ambient-state assumption), role authored: the role MUST move paint. This
 * is the actual causality test, meaningful only with the family out of the
 * way.
 *
 * MODE 2 — family AND role both authored (two DIFFERENT sentinels): the
 * FAMILY must win. Proves the ordering itself, not just that something moved.
 *
 * MODE 3 — neither authored: a snapshot taken before ANY mutation in this
 * function is compared against a snapshot taken after modes 1 and 2 have
 * both run and restored, and must be BYTE-IDENTICAL. This is the
 * preservation test — proves the whole 3-mode sequence leaves no residue.
 *
 * When no senior family var exists for this (family, channel) pair, mode 2
 * is reported `notApplicable: true` (there is nothing to test seniority
 * against) rather than forced into a pass or fail it cannot meaningfully
 * earn.
 */
async function testChannelCausalityThreeModes(page, selector, channel, familyName) {
  const seniorVar = seniorFamilyVarFor(familyName, channel);
  const roleSentinel = sentinelFor(channel);
  const familySentinel = familySentinelFor(channel);

  const baseline = await readPaintSnapshot(page, selector);

  // MODE 1: neutralize family (if any), author role, read, restore.
  if (seniorVar) {
    await page.evaluate((v) => document.documentElement.style.setProperty(v, 'initial'), seniorVar);
  }
  await page.evaluate(({ channel, roleSentinel }) => document.documentElement.style.setProperty(channel, roleSentinel), { channel, roleSentinel });
  await settleFrame(page);
  const mode1After = await readPaintSnapshot(page, selector);
  if (seniorVar) {
    await page.evaluate((v) => document.documentElement.style.removeProperty(v), seniorVar);
  }
  await page.evaluate((channel) => document.documentElement.style.removeProperty(channel), channel);
  await settleFrame(page);
  const mode1Restored = await readPaintSnapshot(page, selector);

  const mode1RoleMovedPaint = containsFragment(mode1After, SENTINEL_RGB) && !containsFragment(baseline, SENTINEL_RGB);
  const mode1RestoredCleanly = baseline && mode1Restored ? Object.keys(baseline).every((k) => baseline[k] === mode1Restored[k]) : false;
  const mode1 = {
    label: 'family neutralized, role authored -> role must move paint',
    seniorVarNeutralized: seniorVar,
    roleSentinel,
    before: baseline,
    after: mode1After,
    restored: mode1Restored,
    pass: mode1RoleMovedPaint,
    restoredCleanly: mode1RestoredCleanly,
  };

  // MODE 2: author BOTH (if a family var exists) with distinct sentinels, read, restore.
  let mode2;
  if (seniorVar) {
    await page.evaluate(({ v, s }) => document.documentElement.style.setProperty(v, s), { v: seniorVar, s: familySentinel });
    await page.evaluate(({ channel, roleSentinel }) => document.documentElement.style.setProperty(channel, roleSentinel), { channel, roleSentinel });
    await settleFrame(page);
    const mode2After = await readPaintSnapshot(page, selector);
    await page.evaluate((v) => document.documentElement.style.removeProperty(v), seniorVar);
    await page.evaluate((channel) => document.documentElement.style.removeProperty(channel), channel);
    await settleFrame(page);
    const mode2Restored = await readPaintSnapshot(page, selector);

    const familyWon = containsFragment(mode2After, FAMILY_SENTINEL_RGB);
    const roleLeaked = containsFragment(mode2After, SENTINEL_RGB);
    const mode2RestoredCleanly = baseline && mode2Restored ? Object.keys(baseline).every((k) => baseline[k] === mode2Restored[k]) : false;
    mode2 = {
      label: 'family AND role both authored -> family must win',
      notApplicable: false,
      seniorVar,
      familySentinel,
      roleSentinel,
      after: mode2After,
      restored: mode2Restored,
      familyWon,
      roleLeaked,
      pass: familyWon && !roleLeaked,
      restoredCleanly: mode2RestoredCleanly,
    };
  } else {
    mode2 = {
      label: 'family AND role both authored -> family must win',
      notApplicable: true,
      reason: `No senior family var exists for ${familyName}/${channel} — the role channel is already the outermost var() in its consuming declaration, confirmed via this file's own census resolution. There is nothing for the role to be correctly outranked by, so seniority has nothing to prove here.`,
      pass: true, // vacuously true: nothing to violate
    };
  }

  // MODE 3: preservation — baseline (before ANYTHING in this function ran)
  // vs. now (after modes 1 and 2 have both fully restored).
  const finalSnapshot = await readPaintSnapshot(page, selector);
  const mode3ByteIdentical = baseline && finalSnapshot ? Object.keys(baseline).every((k) => baseline[k] === finalSnapshot[k]) : false;
  const mode3 = {
    label: 'neither authored (post-restore) -> pre/post byte-identical',
    baseline,
    final: finalSnapshot,
    pass: mode3ByteIdentical,
  };

  return {
    channel,
    familyName,
    seniorVar,
    mode1,
    mode2,
    mode3,
    // A cell passes only when ALL THREE hold — never derived from one mode alone.
    cellPasses: mode1.pass && mode2.pass && mode3.pass,
    verdict: !mode1.pass
      ? 'DEAD — even with the family var neutralized, the role channel did not move paint. This is a genuine dead channel, not a seniority artifact.'
      : mode2.notApplicable
        ? (mode3.pass ? 'LIVE — role causal (mode 1), no family var to test seniority against (mode 2 N/A), restoration clean (mode 3).' : 'LIVE BUT UNSTABLE — role causal, but mode 3 (restoration) did not come back byte-identical; investigate residue.')
        : !mode2.pass
          ? 'ORDERING DEFECT — the role channel IS causal in isolation (mode 1 passes) but does NOT correctly yield to an authored family var (mode 2 fails): either the family var is not actually senior in the chain, or the ordering has been inverted. This is the exact regression the adjudication is guarding against.'
          : mode3.pass
            ? 'LIVE AND CORRECTLY SUBORDINATE — role causal when family is out of the way (mode 1), family correctly wins when both are authored (mode 2), restoration clean (mode 3). All three hold.'
            : 'LIVE AND CORRECTLY ORDERED BUT UNSTABLE — modes 1 and 2 both pass, but mode 3 (restoration) did not come back byte-identical; investigate residue.',
  };
}

/**
 * NESTED-RUNG ACTIVATION. Documented in round 1; kept unchanged. Two independent facts
 * are measured: (a) does the PRIVATE layer-step custom property itself change when
 * nested, and (b) does that change reach the PAINTED box-shadow.
 */
async function testNestedRung(page, selector, privateVar, ancestorClass) {
  const read = () => page.evaluate(({ sel, v }) => {
    const el = document.querySelector(sel);
    if (!el) return null;
    const cs = getComputedStyle(el);
    return { privateVarValue: cs.getPropertyValue(v).trim(), boxShadow: cs.boxShadow };
  }, { sel: selector, v: privateVar });

  const before = await read();
  await page.evaluate((cls) => document.documentElement.classList.add(cls), ancestorClass);
  await settleFrame(page);
  const nested = await read();
  await page.evaluate((cls) => document.documentElement.classList.remove(cls), ancestorClass);
  await settleFrame(page);
  const afterRestore = await read();

  const privateVarChanged = Boolean(before && nested && before.privateVarValue !== nested.privateVarValue);
  const boxShadowChanged = Boolean(before && nested && before.boxShadow !== nested.boxShadow);
  const restoredCleanly = Boolean(before && afterRestore && before.privateVarValue === afterRestore.privateVarValue && before.boxShadow === afterRestore.boxShadow);

  let verdict;
  if (!privateVarChanged && !boxShadowChanged) verdict = 'DEAD — nesting the ancestor class changed neither the private rung variable nor the painted shadow.';
  else if (privateVarChanged && !boxShadowChanged) verdict = 'DEAD AT THE PAINT STEP — the rung selector IS wired (private variable changed) but the change never reaches box-shadow, almost certainly because a higher-priority always-defined channel sits in front of it in the fallback chain.';
  else verdict = 'LIVE — nesting changed both the private rung variable and the painted box-shadow.';

  return { privateVar, ancestorClass, before, nested, afterRestore, privateVarChanged, boxShadowChanged, restoredCleanly, verdict };
}

/**
 * CHANNEL-TYPING MATRIX (round 2). For one shadow-typed channel and one test value,
 * mutate, read the box-shadow LAYER LIST before/after (not the raw string — computed
 * shadow serialization is not predictable enough to substring-match reliably, e.g.
 * `transparent` becomes `rgba(0, 0, 0, 0)` and offsets gain `px`), diff the layer
 * SETS, and restore. The layer diff is the evidence; the interpretation (survives /
 * amputated / surgical) is derived from it, never asserted independently of it.
 */
async function testTypedShadowMutation(page, selector, channel, testKey) {
  const { value, label } = TYPED_MUTATION_VALUES[testKey];

  const readShadow = () => page.evaluate((sel) => {
    const el = document.querySelector(sel);
    return el ? getComputedStyle(el).boxShadow : null;
  }, selector);

  const beforeRaw = await readShadow();
  const beforeLayers = splitTopLevelLayers(beforeRaw);

  await page.evaluate(({ channel, value }) => {
    document.documentElement.style.setProperty(channel, value);
  }, { channel, value });
  await settleFrame(page);
  const afterRaw = await readShadow();
  const afterLayers = splitTopLevelLayers(afterRaw);

  await page.evaluate((channel) => document.documentElement.style.removeProperty(channel), channel);
  await settleFrame(page);
  const afterRestoreRaw = await readShadow();
  const restoredCleanly = afterRestoreRaw === beforeRaw;

  const preservedLayers = beforeLayers.filter((l) => afterLayers.includes(l));
  const lostLayers = beforeLayers.filter((l) => !afterLayers.includes(l));
  const addedLayers = afterLayers.filter((l) => !beforeLayers.includes(l));
  const collapsedToNone = afterLayers.length === 0;

  let outcome;
  if (testKey === 'bareNone') {
    outcome = collapsedToNone
      ? 'RED — SITE-GRAMMAR DEFECT (position iii): this channel sits as a non-sole item in a comma-separated box-shadow list at this family, so bare `none` (a whole-value keyword) voided the entire declaration. This is a SITE defect, not a channel-wide trap — the same channel is safe wherever it is consumed as a whole value or a background/mask layer. Fix is whole-value isolation at the consuming site (a parallel lane), not a name-based ban on authoring none.'
      : lostLayers.length === 0 && addedLayers.length === 0
        ? 'CHANNEL NOT CONSUMED HERE — box-shadow was unaffected, so this family does not splice this channel into its shadow list at all (a different, unrelated dead-channel finding, not a list-splice site).'
        : `UNEXPECTED — bare none did not collapse the whole list (lost ${lostLayers.length}, added ${addedLayers.length}); the list-splice prediction did not hold here. Needs a look — either this site is not actually a non-sole shadow-list item (re-check against the static census) or something else absorbed the invalid value.`;
  } else if (testKey === 'neutral') {
    outcome = collapsedToNone
      ? 'FAIL — the typed neutral value (a syntactically valid zero-effect shadow layer) still collapsed the whole box-shadow. This should never happen; the neutral is legal CSS.'
      : lostLayers.length === 0 && addedLayers.length === 0
        ? 'CHANNEL NOT CONSUMED HERE — no effect; this family does not splice this channel into its shadow list.'
        : 'SURVIVED — depth/sibling layers remained present after the neutral injection, as required.';
  } else {
    // SURGICAL is judged at the CHANNEL level, not the raw CSS layer count: a
    // channel's own pre-mutation value can already BE a multi-stop composite (an
    // elevation token authored as 4-5 stacked shadow layers for a soft look), so
    // losing several raw layers is correct and expected when they were all that
    // one channel's own contribution. What must hold is (a) exactly ONE new layer
    // entered the list (my injected value did not fan out or collide with
    // something else), and (b) the box-shadow did not collapse. A genuinely
    // partial/unexpected result is when MORE than one new layer appears — that
    // would mean the mutation had a side effect beyond the one channel under test.
    outcome = collapsedToNone
      ? 'FAIL — a well-typed real value still collapsed the whole box-shadow.'
      : lostLayers.length === 0 && addedLayers.length === 0
        ? 'CHANNEL NOT CONSUMED HERE — no effect; this family does not splice this channel into its shadow list.'
        : addedLayers.length === 1
          ? `SURGICAL (channel-level) — exactly one new layer entered the list, cleanly replacing this channel's prior contribution (${lostLayers.length} raw CSS layer(s), since the channel's own resolved value was itself a ${lostLayers.length}-layer composite); every OTHER channel's layer survived untouched (${preservedLayers.length} preserved).`
          : `PARTIAL/UNEXPECTED — lost ${lostLayers.length} layer(s), added ${addedLayers.length}; more than one new layer appeared, which is not a clean single-channel replacement.`;
  }

  return {
    channel,
    testKey,
    testLabel: label,
    testValue: value,
    beforeRaw,
    afterRaw,
    afterRestoreRaw,
    beforeLayers,
    afterLayers,
    preservedLayers,
    lostLayers,
    addedLayers,
    collapsedToNone,
    restoredCleanly,
    outcome,
  };
}

/**
 * TEXTURE ANTI-DUPLICATION CHECK — FAMILY-AWARE (fixed post-hard-veto). The
 * original version hardcoded "exactly one site is correct" for every family,
 * which is WRONG for Popover under the adjudicated law: "panel::before PLUS
 * arrow::before [are] TWO FRAGMENTS OF ONE CONTINUOUS SURFACE... required
 * rather than merely tolerated — without the arrow site any tenant-authored
 * texture TEARS at the joint, which is its own defect." A probe that reds
 * Popover's paintSiteCount=2 would drive the fix in the wrong direction. But
 * two sites is not automatically a pass either — the exception is EARNED by
 * the three-condition proof (geometricContiguity, contentlessAndPointerSafe,
 * seamFreeUnderHighContrast), so this function reports the count honestly
 * and, for Popover, explicitly defers the pass/fail verdict to that proof
 * rather than declaring success on count alone.
 *
 * NESTED SURFACES ARE SCOPED SEPARATELY: a descendant that is ITSELF one of
 * the four known family surfaces (e.g. a dropdown nested inside a modal) is
 * excluded from this family's site count — it is a distinct surface that
 * consumes the channel on its own account, not a duplicate of the parent's.
 */
const EXPECTED_TEXTURE_SITE_COUNT = { Popover: 2, Dropdown: 1, Modal: 1, Drawer: 1 };
/** Class fragments that identify a descendant as a NESTED, independent family
 * surface rather than part of the current family's own paint. */
const NESTED_SURFACE_CLASS_FRAGMENTS = [
  'rottay-popover--modern',
  'rottay-dropdown__surface',
  'rottay-overlay-modal-shell--modern',
  'rottay-drawer--modern',
];

async function testTextureAntiDuplication(page, selector, familyName) {
  const SENTINEL_FRAGMENT = '1, 254, 3';
  const expectedSiteCount = EXPECTED_TEXTURE_SITE_COUNT[familyName] ?? 1;

  function isNestedSurfaceDescendant(d) {
    return d.dataPart === 'surface' && NESTED_SURFACE_CLASS_FRAGMENTS.some((frag) => (d.className ?? '').includes(frag));
  }

  function countSites(evidence) {
    const sites = [];
    const nestedSurfaceSites = [];
    if (!evidence) return { sites, nestedSurfaceSites };
    if (String(evidence.surfaceBackgroundImage).includes(SENTINEL_FRAGMENT)) sites.push({ location: 'surface (own backgroundImage)' });
    if (String(evidence.surfacePseudo.before.backgroundImage).includes(SENTINEL_FRAGMENT)) sites.push({ location: 'surface ::before' });
    if (String(evidence.surfacePseudo.after.backgroundImage).includes(SENTINEL_FRAGMENT)) sites.push({ location: 'surface ::after' });
    for (const d of evidence.descendants) {
      const nested = isNestedSurfaceDescendant(d);
      const hits = [];
      if (String(d.backgroundImage).includes(SENTINEL_FRAGMENT)) hits.push({ location: `descendant ${d.path} (own backgroundImage)` });
      if (String(d.pseudo.before.backgroundImage).includes(SENTINEL_FRAGMENT)) hits.push({ location: `descendant ${d.path} ::before` });
      if (String(d.pseudo.after.backgroundImage).includes(SENTINEL_FRAGMENT)) hits.push({ location: `descendant ${d.path} ::after` });
      if (nested) nestedSurfaceSites.push(...hits);
      else sites.push(...hits);
    }
    return { sites, nestedSurfaceSites };
  }

  const beforeEvidence = await collectSurfaceEvidence(page, selector);

  await page.evaluate(({ channel, value }) => {
    document.documentElement.style.setProperty(channel, value);
  }, { channel: TEXTURE_CHANNEL, value: TEXTURE_GRADIENT_SENTINEL });
  await settleFrame(page);
  const withGradientEvidence = await collectSurfaceEvidence(page, selector);
  const { sites: gradientSites, nestedSurfaceSites } = countSites(withGradientEvidence);

  await page.evaluate((channel) => {
    document.documentElement.style.setProperty(channel, 'none');
  }, TEXTURE_CHANNEL);
  await settleFrame(page);
  const withNoneEvidence = await collectSurfaceEvidence(page, selector);
  const { sites: noneSites } = countSites(withNoneEvidence);

  await page.evaluate((channel) => document.documentElement.style.removeProperty(channel), TEXTURE_CHANNEL);
  await settleFrame(page);

  const surfaceSiteOnly = gradientSites.filter((s) => s.location.startsWith('surface'));
  const descendantSites = gradientSites.filter((s) => s.location.startsWith('descendant'));
  const matchesExpectedCount = gradientSites.length === expectedSiteCount;

  let verdict;
  if (gradientSites.length === 0) {
    verdict = 'CHANNEL NOT CONSUMED HERE — texture never appears anywhere on this surface or its descendants; this family does not splice the texture channel in at all.';
  } else if (familyName === 'Popover') {
    verdict = matchesExpectedCount
      ? 'TWO SITES, SHAPE MATCHES THE SANCTIONED EXCEPTION — but count alone is NOT proof. See popoverExceptionProof for the three-condition check (geometric contiguity, contentless-and-pointer-safe, seam-free under high-contrast); only if ALL THREE pass does this family actually earn the exception.'
      : `UNEXPECTED SITE COUNT for the sanctioned Popover shape — expected 2 (panel + arrow), found ${gradientSites.length}: ${gradientSites.map((s) => s.location).join('; ')}. Not automatically a violation, but does not match the adjudicated shape either — worth a look.`;
  } else {
    verdict = matchesExpectedCount
      ? `ONE PAINT SITE — correct for ${familyName}. Sole site: ${gradientSites[0].location}.`
      : `ANTI-DUPLICATION VIOLATION — ${familyName} is expected to paint texture at exactly one site; found ${gradientSites.length}: ${gradientSites.map((s) => s.location).join('; ')}.`;
  }

  return {
    familyName,
    expectedSiteCount,
    sentinelFragment: SENTINEL_FRAGMENT,
    gradientValue: TEXTURE_GRADIENT_SENTINEL,
    paintSitesWithGradient: gradientSites,
    paintSiteCount: gradientSites.length,
    surfaceSites: surfaceSiteOnly,
    descendantSites,
    nestedSurfaceSitesExcluded: nestedSurfaceSites,
    paintSitesWithExplicitNone: noneSites,
    matchesExpectedCount,
    verdict,
  };
}

/**
 * POPOVER PANEL+ARROW SANCTIONED-EXCEPTION PROOF (fix 7). "paintSiteCount=2
 * alone is NOT red — but the exception is only earned with executable proof of
 * all three conditions... Absent it, the exception is an assertion." This
 * builds and runs all three, does not stop at the count.
 *
 * NOT YET RUN. Written against the DOM structure already confirmed by earlier
 * measurement (surface selector `.rottay-popover--modern [data-part="surface"]`,
 * arrow at `[data-part="arrow"]` inside it) but never executed — no server
 * access under the current veto. Flagged clearly in the report as unverified
 * mechanics pending a live run.
 */

/** Condition (i): geometric contiguity — the arrow's box touches the panel's
 * box at a shared edge (clipped-from-the-panel's-own-edge), and they share a
 * border color (evidence the arrow is presented as part of the same material,
 * not a second, differently-bordered surface). */
async function proveGeometricContiguity(page, surfaceSelector, arrowSelector) {
  return page.evaluate(({ surfaceSelector, arrowSelector }) => {
    const surface = document.querySelector(surfaceSelector);
    const arrow = document.querySelector(arrowSelector);
    if (!surface || !arrow) return { pass: false, reason: 'surface or arrow not found' };
    const s = surface.getBoundingClientRect();
    const a = arrow.getBoundingClientRect();
    const TOUCH_TOLERANCE_PX = 1.5; // sub-pixel layout rounding, not a real gap
    // Two axis-aligned boxes are "touching" if they overlap (or nearly meet)
    // on one axis and share a real span of overlap on the perpendicular axis
    // — i.e. an edge-to-edge join, not merely two corners near each other.
    const horizontallyAdjacent =
      (Math.abs(a.left - s.right) <= TOUCH_TOLERANCE_PX || Math.abs(s.left - a.right) <= TOUCH_TOLERANCE_PX) &&
      Math.max(a.top, s.top) < Math.min(a.bottom, s.bottom);
    const verticallyAdjacent =
      (Math.abs(a.top - s.bottom) <= TOUCH_TOLERANCE_PX || Math.abs(s.top - a.bottom) <= TOUCH_TOLERANCE_PX) &&
      Math.max(a.left, s.left) < Math.min(a.right, s.right);
    const overlapping = a.left < s.right && a.right > s.left && a.top < s.bottom && a.bottom > s.top;
    const contiguous = horizontallyAdjacent || verticallyAdjacent || overlapping;

    const sBorderColor = getComputedStyle(surface).borderColor;
    const aBorderColor = getComputedStyle(arrow).borderColor;
    const sameBorderColor = sBorderColor === aBorderColor;

    return {
      pass: contiguous && sameBorderColor,
      contiguous,
      adjacency: overlapping ? 'overlapping' : horizontallyAdjacent ? 'horizontal' : verticallyAdjacent ? 'vertical' : 'none',
      sameBorderColor,
      surfaceRect: { left: s.left, top: s.top, right: s.right, bottom: s.bottom },
      arrowRect: { left: a.left, top: a.top, right: a.right, bottom: a.bottom },
      surfaceBorderColor: sBorderColor,
      arrowBorderColor: aBorderColor,
    };
  }, { surfaceSelector, arrowSelector });
}

/** Condition (ii): contentless and pointer-safe — neither site carries actual
 * text content nor an interactive/focusable control, and pointer-events does
 * not intercept (the sites are decorative, never a content or control layer). */
async function proveContentlessAndPointerSafe(page, arrowSelector) {
  return page.evaluate((arrowSelector) => {
    const arrow = document.querySelector(arrowSelector);
    if (!arrow) return { pass: false, reason: 'arrow not found' };
    const text = (arrow.textContent ?? '').trim();
    const interactiveSelector = 'a,button,input,select,textarea,[tabindex],[role="button"],[role="link"],[contenteditable="true"]';
    const hasInteractiveDescendant = Boolean(arrow.querySelector(interactiveSelector)) || arrow.matches(interactiveSelector);
    const pointerEvents = getComputedStyle(arrow).pointerEvents;
    const ariaHidden = arrow.getAttribute('aria-hidden') === 'true';
    return {
      pass: text.length === 0 && !hasInteractiveDescendant && pointerEvents === 'none',
      textContent: text,
      hasInteractiveDescendant,
      pointerEvents,
      ariaHidden,
    };
  }, arrowSelector);
}

/**
 * Condition (iii): seam-free under an authored high-contrast value. Mutates
 * texture to a deterministic gradient, screenshots the union of panel+arrow
 * rects, then reads ACTUAL RENDERED PIXELS at points straddling their shared
 * edge — not predicted colors. Pixel reads go through the BROWSER'S OWN PNG
 * decoder (an <img> + <canvas>.getImageData() round-trip inside
 * page.evaluate), not a hand-rolled PNG parser in Node, so no new dependency
 * is needed and decoding correctness is the browser's, not this script's.
 *
 * NOT YET RUN — no server access under the current veto. The mechanics
 * (rect math, screenshot clipping, canvas pixel sampling) are standard and
 * each individually verifiable in isolation, but this exact composition has
 * not been exercised against the live popover. Report this plainly rather
 * than implying it has been proven by writing it.
 */
async function proveSeamFreeUnderHighContrast(page, surfaceSelector, arrowSelector) {
  const GRADIENT = 'linear-gradient(90deg, rgb(255, 0, 0) 0%, rgb(0, 0, 255) 100%)';
  const SAMPLE_OFFSET_PX = 3; // how far to either side of the shared edge to sample
  const SAMPLE_COUNT = 4; // points spread along the shared edge

  const contiguity = await proveGeometricContiguity(page, surfaceSelector, arrowSelector);
  if (!contiguity.pass) {
    return { pass: false, reason: 'geometric contiguity did not hold; seam-free check requires a real shared edge to sample across', contiguity };
  }

  await page.evaluate(({ channel, value }) => document.documentElement.style.setProperty(channel, value), { channel: TEXTURE_CHANNEL, value: GRADIENT });
  await settleFrame(page);

  const { s, a, clip, samplePairs } = await page.evaluate(({ surfaceSelector, arrowSelector, offset, count, adjacency }) => {
    const surface = document.querySelector(surfaceSelector);
    const arrow = document.querySelector(arrowSelector);
    const s = surface.getBoundingClientRect();
    const a = arrow.getBoundingClientRect();
    const pad = 4;
    const left = Math.min(s.left, a.left) - pad;
    const top = Math.min(s.top, a.top) - pad;
    const right = Math.max(s.right, a.right) + pad;
    const bottom = Math.max(s.bottom, a.bottom) + pad;
    const clip = { x: Math.max(0, left), y: Math.max(0, top), width: right - left, height: bottom - top };

    // Build sample point pairs straddling the shared edge, in PAGE coordinates
    // (converted to clip-local coordinates by the caller after screenshotting,
    // since the clip origin is only known here).
    const pairs = [];
    if (adjacency === 'horizontal') {
      const edgeX = Math.abs(a.left - s.right) <= 1.5 ? s.right : s.left;
      const spanTop = Math.max(a.top, s.top);
      const spanBottom = Math.min(a.bottom, s.bottom);
      for (let i = 1; i <= count; i++) {
        const y = spanTop + ((spanBottom - spanTop) * i) / (count + 1);
        pairs.push({ before: { x: edgeX - offset, y }, after: { x: edgeX + offset, y } });
      }
    } else if (adjacency === 'vertical') {
      const edgeY = Math.abs(a.top - s.bottom) <= 1.5 ? s.bottom : s.top;
      const spanLeft = Math.max(a.left, s.left);
      const spanRight = Math.min(a.right, s.right);
      for (let i = 1; i <= count; i++) {
        const x = spanLeft + ((spanRight - spanLeft) * i) / (count + 1);
        pairs.push({ before: { x, y: edgeY - offset }, after: { x, y: edgeY + offset } });
      }
    }
    return { s, a, clip, samplePairs: pairs };
  }, { surfaceSelector, arrowSelector, offset: SAMPLE_OFFSET_PX, count: SAMPLE_COUNT, adjacency: contiguity.adjacency });

  if (samplePairs.length === 0) {
    await page.evaluate((channel) => document.documentElement.style.removeProperty(channel), TEXTURE_CHANNEL);
    return { pass: false, reason: `no sample pairs generated for adjacency '${contiguity.adjacency}'`, contiguity };
  }

  const pngBuffer = await page.screenshot({ clip });
  const base64 = pngBuffer.toString('base64');

  // Convert page-space sample points to clip-local coordinates now that the
  // clip origin (clip.x, clip.y) is known.
  const clipLocalPairs = samplePairs.map((p) => ({
    before: { x: p.before.x - clip.x, y: p.before.y - clip.y },
    after: { x: p.after.x - clip.x, y: p.after.y - clip.y },
  }));

  // Sample real rendered pixels via the browser's OWN PNG decoder: load the
  // screenshot as an <img>, draw it to a <canvas>, read pixels with
  // getImageData(). No PNG-parsing code of our own.
  const sampled = await page.evaluate(({ base64, pairs }) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        const readAt = (x, y) => {
          const xi = Math.max(0, Math.min(canvas.width - 1, Math.round(x)));
          const yi = Math.max(0, Math.min(canvas.height - 1, Math.round(y)));
          const d = ctx.getImageData(xi, yi, 1, 1).data;
          return { x: xi, y: yi, r: d[0], g: d[1], b: d[2], a: d[3] };
        };
        resolve(pairs.map((p) => ({ before: readAt(p.before.x, p.before.y), after: readAt(p.after.x, p.after.y) })));
      };
      img.onerror = () => reject(new Error('screenshot image failed to decode for pixel sampling'));
      img.src = `data:image/png;base64,${base64}`;
    });
  }, { base64, pairs: clipLocalPairs });

  await page.evaluate((channel) => document.documentElement.style.removeProperty(channel), TEXTURE_CHANNEL);
  await settleFrame(page);

  // A real seam shows as a LARGE color jump across a SMALL (2*offset px)
  // physical gap. Tolerance is generous enough to absorb anti-aliasing at the
  // border/radius edge but tight enough to catch a genuine independent-
  // gradient discontinuity (each site spanning 0%-100% across its OWN box
  // would jump by a large fraction of the full red-to-blue range at the seam).
  const CHANNEL_JUMP_TOLERANCE = 40;
  const perPair = sampled.map((pair) => {
    const dr = Math.abs(pair.before.r - pair.after.r);
    const dg = Math.abs(pair.before.g - pair.after.g);
    const db = Math.abs(pair.before.b - pair.after.b);
    const maxJump = Math.max(dr, dg, db);
    return { ...pair, maxChannelJump: maxJump, seamFreeHere: maxJump <= CHANNEL_JUMP_TOLERANCE };
  });
  const allSeamFree = perPair.every((p) => p.seamFreeHere);

  return {
    pass: allSeamFree,
    adjacency: contiguity.adjacency,
    gradientAuthored: GRADIENT,
    channelJumpTolerance: CHANNEL_JUMP_TOLERANCE,
    perPairSamples: perPair,
    verdict: allSeamFree
      ? 'SEAM-FREE — every sampled pair straddling the panel/arrow boundary showed a color jump within tolerance under the authored high-contrast gradient.'
      : `SEAM DETECTED — at least one sampled pair jumped more than ${CHANNEL_JUMP_TOLERANCE} channel levels across the boundary; the panel and arrow are not painting one continuous material here.`,
  };
}

/**
 * SELF-CHECK. "An instrument that has never been shown to fail is not trustworthy" —
 * so this runs the SAME collectSurfaceEvidence() used against real surfaces against a
 * synthetic fixture with a KNOWN pseudo-element gradient, a KNOWN descendant gradient,
 * and a KNOWN clean descendant as a negative control, and asserts the detector gets
 * all three right. Runs on a blank page, independent of the dev server's app state.
 */
async function runSelfCheck(browser) {
  const page = await browser.newPage();
  await page.goto('about:blank');
  const ROOT_SELECTOR = '[data-overlay-probe-self-check="root"]';

  await page.evaluate(() => {
    const style = document.createElement('style');
    style.id = 'overlay-probe-self-check-style';
    style.textContent = `
      [data-overlay-probe-self-check="root"] { position: fixed; top: -9999px; left: -9999px; width: 40px; height: 40px; background-image: none; background-color: #eee; }
      [data-overlay-probe-self-check="root"]::before { content: ''; display: block; width: 10px; height: 10px; background-image: linear-gradient(45deg, red, blue); }
      [data-overlay-probe-self-check="gradient-child"] { display: block; width: 10px; height: 10px; background-image: radial-gradient(circle, green, yellow); }
      [data-overlay-probe-self-check="clean-child"] { display: block; width: 10px; height: 10px; background-image: none; background-color: #ccc; }
    `;
    document.head.appendChild(style);
    const root = document.createElement('div');
    root.setAttribute('data-overlay-probe-self-check', 'root');
    const gradientChild = document.createElement('div');
    gradientChild.setAttribute('data-overlay-probe-self-check', 'gradient-child');
    const cleanChild = document.createElement('div');
    cleanChild.setAttribute('data-overlay-probe-self-check', 'clean-child');
    root.appendChild(gradientChild);
    root.appendChild(cleanChild);
    document.body.appendChild(root);
  });

  const evidence = await collectSurfaceEvidence(page, ROOT_SELECTOR);

  await page.evaluate(() => {
    document.querySelector('[data-overlay-probe-self-check="root"]')?.remove();
    document.getElementById('overlay-probe-self-check-style')?.remove();
  });
  await page.close();

  const pseudoDetected = isGradient(evidence?.surfacePseudo?.before?.backgroundImage);
  const gradientChildFound = (evidence?.descendants ?? []).find((d) => isGradient(d.backgroundImage));
  const negativeControlOk = (evidence?.descendants ?? []).some((d) => d.backgroundImage === 'none' && !isGradient(d.backgroundImage));

  // Round-2 self-check addition: prove the layer-splitter and the typed-mutation
  // outcome classifier against known shapes, the same way the gradient detector was
  // proven in round 1.
  const splitterProbe = {
    twoLayerWithColorFunctionsCommas: splitTopLevelLayers('inset 0 1px 0 color-mix(in srgb, white 10%, transparent), 0px 0px 0px 12345px rgba(1, 254, 3, 0.5)'),
    none: splitTopLevelLayers('none'),
    empty: splitTopLevelLayers(''),
  };
  const splitterOk =
    splitterProbe.twoLayerWithColorFunctionsCommas.length === 2 &&
    splitterProbe.twoLayerWithColorFunctionsCommas[0] === 'inset 0 1px 0 color-mix(in srgb, white 10%, transparent)' &&
    splitterProbe.twoLayerWithColorFunctionsCommas[1] === '0px 0px 0px 12345px rgba(1, 254, 3, 0.5)' &&
    splitterProbe.none.length === 0 &&
    splitterProbe.empty.length === 0;

  const passed = pseudoDetected && Boolean(gradientChildFound) && negativeControlOk && splitterOk;

  return {
    injected: {
      surfacePseudoBefore: 'linear-gradient(45deg, red, blue)',
      descendantGradient: 'radial-gradient(circle, green, yellow)',
      descendantClean: 'none',
    },
    observed: {
      surfacePseudoBackgroundImage: evidence?.surfacePseudo?.before?.backgroundImage ?? null,
      descendantsSeen: evidence?.descendants?.map((d) => ({ path: d.path, backgroundImage: d.backgroundImage })) ?? [],
    },
    pseudoElementDetectionPassed: pseudoDetected,
    descendantGradientDetectionPassed: Boolean(gradientChildFound),
    negativeControlPassed: negativeControlOk,
    layerSplitterProbe: splitterProbe,
    layerSplitterPassed: splitterOk,
    passed,
    verdict: passed
      ? 'PASSED — gradient detection (pseudo + descendant + negative control) and the shadow-layer splitter (paren-aware comma split, verified against a 2-layer value whose colors contain commas) all behave correctly against known fixtures.'
      : 'FAILED — the detection logic did not catch a known-positive case, or the layer splitter mis-split a known shape. Findings below should not be trusted until this is fixed.',
  };
}

/**
 * GROUNDS. bithire and the-management are the proven lab grounds
 * (/probe/ds-reference/{tenant}/{scene}, always-open specimens, no interaction
 * needed). A third, non-cohort ground was requested ("platform or rottay") so a
 * ledger fix is never validated only on the tenant whose authored value happens to
 * be `none`. Neither has a purpose-built always-open lab route — the showroom's
 * generic /primitives/[category]/[component] reference page is the only live
 * rendering of these four families outside the lab, and its Popover/Dropdown/
 * Modal/Drawer specimens are CLOSED by default (a "Open drawer" / "Open modal"
 * click, and a hover for Popover), rendered once per engine inside an
 * EngineComparison grid, under whatever tenant the showroom's global sidebar
 * context currently holds (not URL-addressable). That is materially more fragile
 * than the lab, so it is attempted as a best-effort THIRD ground and reported
 * honestly rather than silently skipped or faked — see thirdGround in the receipt.
 */
const THIRD_GROUND_LABEL = 'rottay (best-effort, via /primitives reference page — no purpose-built lab route exists for this ground)';
const THIRD_GROUND_FAMILIES = ['Popover', 'Dropdown', 'Modal', 'Drawer'];

/**
 * COVERAGE IS A DATA FIELD, NOT PROSE (fix 6). "A partially-reached ground that
 * is neither measured nor marked reads as coverage in a receipt." Reachability
 * (can Playwright load the page at all) and MEASUREMENT (did the typed-mutation
 * matrix and texture check actually run against each of the four families
 * there) are different facts, and only measurement earns a non-UNCOVERED
 * status. `measuredFamilies` is the explicit, checkable list — empty means
 * exactly what it says, regardless of what `reached` says. Until the
 * click/hover-open interaction is built AND run (held on the team lead's go),
 * this is honestly UNCOVERED even when the page loads fine.
 */
async function attemptThirdGround(browser) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const measuredFamilies = []; // Intentionally empty — see doc comment above.
  try {
    await page.goto('http://localhost:7001/primitives/overlay/popover', { waitUntil: 'networkidle', timeout: 45000 });
    const tenantAttr = await page.evaluate(() => ({
      dataTenant: document.documentElement.getAttribute('data-tenant'),
      dataVertical: document.documentElement.getAttribute('data-vertical'),
    }));
    await page.close();
    return {
      coverage: 'UNCOVERED',
      familiesExpected: THIRD_GROUND_FAMILIES,
      measuredFamilies,
      reachabilityCheck: { reached: true, observedGroundContext: tenantAttr },
      note: 'UNCOVERED is the correct status even though the page reached and confirmed data-tenant="rottay": reachability is not measurement. None of the four families were opened, interacted with, or run through the typed-mutation matrix / texture check here. This field must read UNCOVERED, not PARTIAL, until measuredFamilies is non-empty.',
    };
  } catch (e) {
    await page.close().catch(() => {});
    return {
      coverage: 'UNCOVERED',
      familiesExpected: THIRD_GROUND_FAMILIES,
      measuredFamilies,
      reachabilityCheck: { reached: false, error: String(e.message) },
      note: 'UNCOVERED — the candidate page could not even be reached. The two lab grounds (bithire, the-management) below are unaffected and fully measured.',
    };
  }
}

const SERVER_PORT = 7001;
/** Every route this probe actually navigates to — the whole matrix, per fix 2. */
const ALL_MEASURED_ROUTE_URLS = TENANTS.flatMap((tenant) => SCENES.map((scene) => `${BASE}/${tenant}/${scene}`));

async function main() {
  // FAIL CLOSED, STEP 1: do not even attempt to measure against a server that
  // is not deterministically healthy ACROSS EVERY ROUTE THIS PROBE USES — a
  // green check on bithire/overlay alone previously said nothing about
  // the-management's routes, which were independently observed timing out at
  // 8s while bithire answered in under 200ms.
  process.stdout.write(`waiting for deterministic server health across ${ALL_MEASURED_ROUTE_URLS.length} routes (3 consecutive clean/fast/200s EACH)...\n`);
  const healthCheck = await waitForServerHealthy(ALL_MEASURED_ROUTE_URLS);
  process.stdout.write(`server healthy on all routes: ${JSON.stringify(Object.fromEntries(Object.entries(healthCheck.perRoute).map(([u, r]) => [u, r.lastAttempts.map((a) => a.elapsedMs)])))}\n`);

  // FAIL CLOSED, STEP 1b: capture the server's PROCESS IDENTITY now too — a
  // hash-only check cannot see a restart that reloads identical bytes.
  const serverIdentityBefore = getServerProcessIdentity(SERVER_PORT);
  process.stdout.write(`server process identity: ${serverIdentityBefore.identity ?? serverIdentityBefore.error}\n`);

  // FAIL CLOSED, STEP 2: snapshot every stage of the pipeline (source,
  // generated, served) BEFORE touching anything, so drift during the run is
  // detectable rather than invisible.
  const pipelineHashesBefore = snapshotPipelineHashes();

  const runStartedAt = new Date().toISOString();
  const bundleFreshness = verifyBundleFreshness();
  const browser = await chromium.launch();
  const families = [];
  const typedMutations = [];
  const textureChecks = [];
  const popoverExceptionProof = [];
  const failures = [];

  try {
    const selfCheck = await runSelfCheck(browser);

    for (const tenant of TENANTS) {
      for (const scene of SCENES) {
        const familiesHere = FAMILIES.filter((f) => f.scene === scene);
        if (familiesHere.length === 0) continue;
        const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
        const url = `${BASE}/${tenant}/${scene}`;
        try {
          await page.goto(url, { waitUntil: 'networkidle', timeout: 120000 });
          await page.evaluate(() => document.fonts?.ready);

          for (const family of familiesHere) {
            const label = `${family.name}/${tenant}`;
            try {
              await waitForVisible(page, family.surfaceSelector);

              const evidence = await collectSurfaceEvidence(page, family.surfaceSelector);
              if (!evidence) throw new Error(`surface selector '${family.surfaceSelector}' resolved to no element after readiness passed`);

              const descendantGradients = evidence.descendants
                .filter((d) => isGradient(d.backgroundImage) || isGradient(d.pseudo.before.backgroundImage) || isGradient(d.pseudo.after.backgroundImage))
                .map((d) => ({
                  path: d.path,
                  tag: d.tag,
                  dataPart: d.dataPart,
                  ownBackgroundGradient: isGradient(d.backgroundImage) ? d.backgroundImage : null,
                  pseudoBeforeGradient: isGradient(d.pseudo.before.backgroundImage) ? d.pseudo.before.backgroundImage : null,
                  pseudoBeforeContent: d.pseudo.before.content,
                  pseudoAfterGradient: isGradient(d.pseudo.after.backgroundImage) ? d.pseudo.after.backgroundImage : null,
                  pseudoAfterContent: d.pseudo.after.content,
                }));

              const roleChannels = [];
              for (const channel of ROLE_CHANNELS) {
                roleChannels.push(await testChannelCausalityThreeModes(page, family.surfaceSelector, channel, family.name));
              }

              const nestedRung = family.nestedRung
                ? await testNestedRung(page, family.surfaceSelector, family.nestedRung.privateVar, family.nestedRung.ancestorClass)
                : { notApplicable: true, reason: 'No layer-step/rung private variable exists for this family (confirmed by source grep across its skin file) — the mechanism is structurally absent, not merely untested.' };

              families.push({
                family: family.name,
                tenant,
                scene,
                url,
                surfaceSelector: family.surfaceSelector,
                surfacePseudoElementPaint: evidence.surfacePseudo,
                surfaceOwnBackgroundImage: evidence.surfaceBackgroundImage,
                descendantsScanned: evidence.descendants.length,
                descendantGradientsFound: descendantGradients,
                roleChannelCausality: roleChannels,
                nestedRungActivation: nestedRung,
              });

              // Round 2: typed shadow-list mutation matrix, all three test values,
              // for every shadow-typed overlay channel plus the cross-role sentinel.
              for (const channel of ALL_TYPED_CHANNELS) {
                for (const testKey of Object.keys(TYPED_MUTATION_VALUES)) {
                  typedMutations.push({
                    family: family.name,
                    tenant,
                    ground: 'lab',
                    ...(await testTypedShadowMutation(page, family.surfaceSelector, channel, testKey)),
                  });
                }
              }

              // Round 2: texture anti-duplication count.
              textureChecks.push({
                family: family.name,
                tenant,
                ground: 'lab',
                ...(await testTextureAntiDuplication(page, family.surfaceSelector, family.name)),
              });

              // Fix 7: the sanctioned two-site exception is PROVEN, not counted,
              // for Popover specifically (the only family the adjudication
              // sanctioned two sites for).
              if (family.name === 'Popover') {
                const arrowSelector = `${family.surfaceSelector} [data-part="arrow"]`;
                const geometricContiguity = await proveGeometricContiguity(page, family.surfaceSelector, arrowSelector);
                const contentlessAndPointerSafe = await proveContentlessAndPointerSafe(page, arrowSelector);
                const seamFreeUnderHighContrast = await proveSeamFreeUnderHighContrast(page, family.surfaceSelector, arrowSelector);
                popoverExceptionProof.push({
                  tenant,
                  ground: 'lab',
                  arrowSelector,
                  geometricContiguity,
                  contentlessAndPointerSafe,
                  seamFreeUnderHighContrast,
                  allThreeConditionsProven: Boolean(
                    geometricContiguity.pass && contentlessAndPointerSafe.pass && seamFreeUnderHighContrast.pass
                  ),
                });
              }
            } catch (e) {
              failures.push(`${label}: ${String(e.message)}`);
            }
          }
        } catch (e) {
          failures.push(`${scene}/${tenant} (page load): ${String(e.message)}`);
        } finally {
          await page.close();
        }
      }
    }

    const thirdGround = await attemptThirdGround(browser);

    // FAIL CLOSED, STEP 3: snapshot every pipeline stage again, now that every
    // measurement is done, and diff against the BEFORE snapshot. Any drift
    // means this run sampled more than one pipeline state and is INVALID.
    const pipelineHashesAfter = snapshotPipelineHashes();
    const pipelineDrift = diffPipelineSnapshots(pipelineHashesBefore, pipelineHashesAfter);

    // FAIL CLOSED, STEP 3b: re-check the server's process identity. A restart
    // that happens to reload byte-identical content would pass the hash diff
    // above and still have swapped every in-memory cache and connection
    // underneath the browser this ran in — hashes cannot see that, identity can.
    const serverIdentityAfter = getServerProcessIdentity(SERVER_PORT);
    const serverRestarted = !sameServerProcess(serverIdentityBefore, serverIdentityAfter);

    // FAIL CLOSED, STEP 3c (fix 3): bundle freshness is a HARD prerequisite for
    // any runtime claim, not an optional pre-flight observation. A run that
    // observes bundleFreshness.allMatch === false (including the stale-HMR-
    // duplicate shape) and still reports itself valid is an instrument that
    // cannot fail — so it is folded into runValid directly, not left as a
    // sibling field a reader has to remember to cross-check.
    const runValid = pipelineDrift.length === 0 && !serverRestarted && bundleFreshness.allMatch === true;

    // Derived matrix: family x channel x tenant -> the 3-mode verdict string.
    // NOT a responded/dead binary any more — that binary is exactly what
    // produced false-dead verdicts on cells correctly outranked by senior
    // family chrome. cellPasses is the single boolean a reader can trust;
    // the verdict string says WHICH of the three modes is responsible.
    const causalityMatrix = {};
    for (const f of families) {
      causalityMatrix[f.family] ??= {};
      for (const c of f.roleChannelCausality) {
        causalityMatrix[f.family][c.channel] ??= {};
        causalityMatrix[f.family][c.channel][f.tenant] = {
          cellPasses: c.cellPasses,
          verdict: c.verdict,
          mode1Pass: c.mode1.pass,
          mode2: c.mode2.notApplicable ? 'N/A' : c.mode2.pass ? 'PASS' : 'FAIL',
          mode3Pass: c.mode3.pass,
          seniorVar: c.seniorVar,
        };
      }
    }

    const nestedRungMatrix = {};
    for (const f of families) {
      if (f.nestedRungActivation?.notApplicable) {
        nestedRungMatrix[f.family] = 'not applicable — no rung mechanism exists';
        continue;
      }
      nestedRungMatrix[f.family] ??= {};
      nestedRungMatrix[f.family][f.tenant] = f.nestedRungActivation.verdict;
    }

    // Derived matrix: family x channel x testKey x tenant -> outcome string.
    const typedMutationMatrix = {};
    for (const m of typedMutations) {
      typedMutationMatrix[m.family] ??= {};
      typedMutationMatrix[m.family][m.channel] ??= {};
      typedMutationMatrix[m.family][m.channel][m.testKey] ??= {};
      typedMutationMatrix[m.family][m.channel][m.testKey][m.tenant] = m.outcome;
    }

    const textureMatrix = {};
    for (const t of textureChecks) {
      textureMatrix[t.family] ??= {};
      textureMatrix[t.family][t.tenant] = { paintSiteCount: t.paintSiteCount, verdict: t.verdict };
    }

    const allGradients = families.flatMap((f) =>
      [
        isGradient(f.surfaceOwnBackgroundImage)
          ? { family: f.family, tenant: f.tenant, location: 'surface (own backgroundImage)', value: f.surfaceOwnBackgroundImage }
          : null,
        isGradient(f.surfacePseudoElementPaint?.before?.backgroundImage)
          ? { family: f.family, tenant: f.tenant, location: 'surface ::before', value: f.surfacePseudoElementPaint.before.backgroundImage, content: f.surfacePseudoElementPaint.before.content }
          : null,
        isGradient(f.surfacePseudoElementPaint?.after?.backgroundImage)
          ? { family: f.family, tenant: f.tenant, location: 'surface ::after', value: f.surfacePseudoElementPaint.after.backgroundImage, content: f.surfacePseudoElementPaint.after.content }
          : null,
        ...f.descendantGradientsFound.map((d) => ({
          family: f.family,
          tenant: f.tenant,
          location: `descendant ${d.path}`,
          ownBackgroundGradient: d.ownBackgroundGradient,
          pseudoBeforeGradient: d.pseudoBeforeGradient,
          pseudoAfterGradient: d.pseudoAfterGradient,
        })),
      ].filter(Boolean)
    );

    const receipt = {
      schemaVersion: 4,
      receiptId: 'wo-cra-23-R1-C1-overlay-causality',
      // RUN VALIDITY IS THE FIRST THING A READER SEES, ON PURPOSE. Round 2's
      // receipt reported failuresCount 0 while it had silently sampled two
      // different pipeline states across its 4m25s run — every individual
      // measurement succeeded, so nothing in the per-measurement data signaled
      // the problem. Round 3's own run was THEN vetoed by an independent
      // auditor: hashes alone cannot see a server restart, health on one
      // route said nothing about two others that were timing out, and a
      // known bundle-freshness failure sat in the receipt as a mere
      // observation instead of failing anything. runValid now requires ALL
      // THREE independent signals to agree (pipeline hashes unchanged, same
      // server process throughout, bundle freshness clean) and is placed
      // first, loud, on purpose.
      runValid,
      runValidityVerdict: runValid
        ? 'VALID — pipeline hashes (source + generated + served, full claim-input set) identical before/after, the server process identity (pid + start time) was unchanged throughout, and bundleFreshnessCheck.allMatch was true. Every measurement below reflects one single, unchanging state.'
        : `INVALID — DO NOT TRUST THE DATA BELOW AS A SINGLE CONSISTENT STATE. ${pipelineDrift.length > 0 ? `${pipelineDrift.length} file(s)/stage(s) drifted mid-run (see pipelineDrift). ` : ''}${serverRestarted ? 'The server process identity changed between the before and after check (see serverIdentityBefore/serverIdentityAfter) — a restart occurred, which hashes alone cannot detect. ' : ''}${bundleFreshness.allMatch !== true ? 'bundleFreshnessCheck.allMatch was not true (see bundleFreshnessCheck) — this now fails the run directly rather than sitting as an observation. ' : ''}The raw measurements are still written below for forensic purposes only.`,
      pipelineDrift,
      pipelineHashesBefore,
      pipelineHashesAfter,
      serverIdentityBefore,
      serverIdentityAfter,
      serverRestarted,
      serverHealthCheck: healthCheck,
      law: 'A role-channel claim is decided by mutating the channel on documentElement and reading getComputedStyle before/after/after-restore — never by grepping a stylesheet for the channel name. A gradient claim is decided by reading the surface (own background + both pseudo-elements) AND every visible descendant (own background + both pseudo-elements) — never by reading only the surface node\'s own backgroundImage. A material-channel claim is decided by SITE GRAMMAR — whole property value, background/mask layer, or non-sole shadow-list item (the only defect shape) — never by an assumed global channel type. A run\'s VALIDITY requires pipeline-hash agreement AND server-process-identity agreement AND bundle-freshness agreement, all before/after — never any one of those alone.',
      whyItExists: 'Three false-green claims shipped this session from instruments that inspected less than they claimed to (presence-only readiness, presence-only geometry, surface-only backgroundImage). Round 2 widened scope but its OWN RUN sampled two pipeline states across a 4m25s window, invisible to failuresCount. Round 3 added a hash-before/after gate but was ITSELF vetoed pre-run by an independent auditor for seven gaps: no server-identity check (hashes cannot see a restart), health checked on one route only (two others were timing out), bundle-freshness observed-not-enforced, an under-hashed claim-input set, a repo-wide channel-typing law that was independently rejected as false, an unmeasured third ground reported ambiguously, and a sanctioned exception (popover panel+arrow) asserted by count rather than proven. This version is the fix for all seven, built but NOT YET RUN dynamically per that veto.',
      runStartedAt,
      runFinishedAt: new Date().toISOString(),
      cssFilesMeasuredAgainst: cssProvenance(),
      staleneseWarning: 'Source-file mtimes are a WEAK staleness signal only — see bundleFreshnessCheck for the served-bundle content check, and runValid/pipelineDrift for the authoritative whole-run consistency check. The team lead is actively editing popover.css and default.css while this probe may run.',
      bundleFreshnessCheck: bundleFreshness,
      selfCheck,
      familiesCovered: FAMILIES.map((f) => f.name),
      roleChannelsCovered: ROLE_CHANNELS,
      typedChannelsCovered: ALL_TYPED_CHANNELS,
      typedMutationValues: TYPED_MUTATION_VALUES,
      sentinels: { colorSentinel: COLOR_SENTINEL, shadowSentinel: SHADOW_SENTINEL, detectionFragment: SENTINEL_RGB, textureGradientSentinel: TEXTURE_GRADIENT_SENTINEL },
      groundsCovered: { lab: TENANTS, thirdGround: THIRD_GROUND_LABEL },
      thirdGroundAttempt: thirdGround,
      causalityMatrix,
      nestedRungMatrix,
      typedMutationMatrix,
      textureAntiDuplicationMatrix: textureMatrix,
      allGradientsFound: allGradients,
      families,
      typedMutations,
      textureChecks,
      popoverExceptionProof,
      failuresCount: failures.length,
      failures,
    };

    writeFileSync(
      path.join(HERE, '..', 'receipts', 'cohort-1-overlay-causality.json'),
      `${JSON.stringify(receipt, null, 2)}\n`,
    );

    if (runValid) {
      process.stdout.write('RUN VALID — pipeline hashes (source + generated + served) identical before and after.\n');
    } else {
      process.stdout.write('###############################################################\n');
      process.stdout.write('# RUN INVALID — PIPELINE DRIFTED MID-RUN. DO NOT TRUST RESULTS #\n');
      process.stdout.write('###############################################################\n');
      for (const d of pipelineDrift) process.stdout.write(`  DRIFTED [${d.stage}] ${d.path} (now mtime ${d.afterMtimeIso})\n`);
    }
    process.stdout.write(`bundle freshness: ${bundleFreshness.verdict}\n`);
    process.stdout.write(`self-check: ${selfCheck.passed ? 'PASSED' : 'FAILED'}\n`);
    process.stdout.write(`families measured: ${families.length}, failures: ${failures.length}\n`);
    for (const f of failures) process.stdout.write(`  FAILURE ${f}\n`);
    process.stdout.write(`gradients found: ${allGradients.length}\n`);
    process.stdout.write(`typed mutation cells: ${typedMutations.length}\n`);
    process.stdout.write(`texture anti-dup checks: ${textureChecks.length}\n`);
    process.stdout.write(`third ground coverage: ${thirdGround.coverage} (measured ${thirdGround.measuredFamilies.length}/${thirdGround.familiesExpected.length} families; page reachable: ${thirdGround.reachabilityCheck.reached})\n`);
    if (!runValid || !selfCheck.passed || failures.length > 0) process.exitCode = 1;
  } finally {
    await browser.close();
  }
}

/**
 * LIST-SPLICE CENSUS ROW (adjudication round 3, item 3). Static, needs no
 * server or browser — run with `--census-only`.
 *
 * THE LAW: "RED IFF a `var(--ds-material-*)` occurrence appears as a
 * NON-SOLE item inside a comma-separated shadow-valued declaration
 * (box-shadow, text-shadow). Nothing else is red." This is deliberately NOT
 * "any var(--ds-material-*) inside box-shadow" (that would also redden a
 * clean single-layer `box-shadow: var(--ds-modal-shadow, var(--ds-material-
 * overlay-shadow, ...));`, which is legal whole-value consumption) and NOT
 * "any var(--ds-material-*) anywhere" (that would redden the semantic-
 * surface.css bridge declarations, which sit on a private custom property,
 * not directly on box-shadow/text-shadow, and are exactly the dual-typed
 * shape the adjudication ruled must stay green).
 *
 * WHY POSTCSS AND NOT REGEX. A regex scan for `box-shadow:` matching across
 * lines cannot tell a live declaration from one sitting inside a /* comment
 * *\/, and cannot reliably find the TOP-LEVEL comma boundaries in a value
 * whose colors are themselves comma-bearing functions (`rgba(...)`,
 * `color-mix(...)`). This is the fourth instance flagged this session of
 * pattern-matching a structured language instead of parsing it — postcss
 * parses the real grammar: comments are never emitted as declarations at
 * all, and `decl.value`/`decl.prop` are already correctly segmented
 * regardless of source formatting or multi-line authoring.
 */
/**
 * FULL CORPUS (hard veto: "A census over a subset cannot support a 'cohort
 * empty' claim about anything"). The old corpus was runtime/engines/modern/
 * skin/ plus two hand-picked extras — it missed list-toolbar's own directory
 * neighbor files that reference other roles, and it structurally could not
 * see default.css, the other engines, or the rest of presentation/. This now
 * walks EVERY .css file under src/foundation/tokens/css/ recursively —
 * foundation/themes (default.css), all three engines (modern/classic/
 * rustic), presentation/components, and facade/artifacts (shipped tenant
 * CSS) are all in scope. Tenant SOURCE (.ts fixtures, BrandTheme files) is
 * still out of scope for THIS census specifically — postcss parses CSS, not
 * TypeScript object literals — and that boundary is named explicitly (see
 * caseC_note) rather than silently absent.
 */
const CENSUS_ROOT_DIR = path.join(CORE, 'src/foundation/tokens/css');
const MATERIAL_VAR_RE = /var\(\s*(--ds-material-[\w-]+)/g;
/** Any custom-property reference, not scoped to --ds-material-* — needed to
 * follow a FORWARDING variable (e.g. --ds-popover-shadow-current) to whoever
 * consumes IT, which is not itself named --ds-material-anything. */
const ANY_VAR_RE = /var\(\s*(--[\w-]+)/g;
function referencedCustomProps(value) {
  return [...new Set([...value.matchAll(ANY_VAR_RE)].map((m) => m[1]))];
}

function listCensusFiles() {
  const entries = readdirSync(CENSUS_ROOT_DIR, { recursive: true });
  return entries
    .filter((f) => f.endsWith('.css'))
    .map((f) => path.join(CENSUS_ROOT_DIR, f));
}

/** Fixed repo-relative path to the semantic-surface.css bridge file, used
 * only to identify ITS rows inside the flat declaration index for case A's
 * verification (see runListSpliceCensus). Not a scan-set entry — the corpus
 * itself now comes from the recursive walk in listCensusFiles(). */
const SEMANTIC_SURFACE_REL = 'src/foundation/tokens/css/presentation/components/semantic-surface.css';

const SHADOW_PROPERTIES = new Set(['box-shadow', 'text-shadow']);
const BACKGROUND_MASK_PROPERTIES = new Set(['background', 'background-image', 'mask', 'mask-image', '-webkit-mask', '-webkit-mask-image']);

/**
 * INDIRECTION-RESOLVING CENSUS (fix, post-hard-veto). "A scan for
 * var(--ds-material-*) appearing directly in a shadow-valued declaration
 * CANNOT see a splice that happens one hop later through a family `-current`
 * variable, because at the splice site the text contains no --ds-material-
 * token at all." Confirmed in source, exactly as described: popover.css:91-
 * 103 forwards --ds-material-overlay-shadow into the custom property
 * --ds-popover-shadow-current; popover.css:208-210 then splices THAT as a
 * non-sole item into a 2-layer box-shadow (`inset ..., var(--ds-popover-
 * shadow-current)`). The old direct-text scan classified the reference at
 * line 94 as "whole-value" (true, in isolation, of THAT declaration) and
 * never looked at line 210 at all, because line 210's text contains no
 * "--ds-material-" substring — it only says --ds-popover-shadow-current.
 * Forwarding through a `-current` var is the DOMINANT idiom in these skins
 * (every one of popover/dropdown/drawer/modal does it for at least shadow),
 * so this was not an edge case.
 *
 * THE FIX: build a flat index of every declaration, then for each distinct
 * --ds-material-* name, walk forward through every consumer. A consumer
 * whose OWN property is a custom property (starts with `--`) is not a
 * terminal site — it is itself forwarding, so the walk continues into
 * whoever consumes THAT property, and so on, until reaching a real CSS
 * property. THAT is where the position (whole-value / background-mask-layer
 * / non-sole-shadow-list-item) is decided. A channel is RED if ANY reachable
 * terminal site is position (iii) — even if OTHER reachable terminal sites
 * for the same channel are safe.
 */
/**
 * Full cascade-context description for a declaration: every wrapping
 * at-rule (@media, @supports, @container, ...) from outermost to
 * innermost, followed by the immediate rule's own selector if it has one.
 * The prior version read only `decl.parent?.selector` directly — a rule
 * NESTED inside an at-rule reported just the rule's own selector and
 * silently dropped the at-rule condition, so a defect gated behind e.g.
 * `@media (prefers-color-scheme: dark)` would be reported as unconditional.
 * Confirmed this is not theoretical: 14 real box-shadow/text-shadow
 * declarations referencing --ds-material-* currently sit inside an at-rule
 * (button.css x13, segmented.css x1) — all currently green, but the old
 * selector field would have hidden the condition if any turned red later.
 * postcss exposes real ancestors via `.parent`, so this is a walk of the
 * actual AST, not a guess.
 */
function describeSelectorWithCascadeContext(decl) {
  const atRules = [];
  let ownSelector = null;
  let node = decl.parent;
  while (node && node.type !== 'root') {
    if (node.type === 'atrule') {
      atRules.unshift(`@${node.name} ${node.params}`.trim());
    } else if (node.type === 'rule' && ownSelector === null) {
      ownSelector = node.selector;
    }
    node = node.parent;
  }
  const parts = [...atRules];
  if (ownSelector !== null) parts.push(ownSelector);
  return parts.length > 0 ? parts.join(' > ') : null;
}

function buildDeclarationIndex(files) {
  const allDecls = [];
  const parseErrors = [];
  for (const absPath of files) {
    const relPath = path.relative(CORE, absPath);
    let css;
    try {
      css = readFileSync(absPath, 'utf8');
    } catch (e) {
      parseErrors.push({ file: relPath, error: String(e.message) });
      continue;
    }
    let root;
    try {
      root = postcss.parse(css, { from: absPath });
    } catch (e) {
      parseErrors.push({ file: relPath, error: String(e.message) });
      continue;
    }
    root.walkDecls((decl) => {
      allDecls.push({
        file: relPath,
        line: decl.source?.start?.line ?? null,
        selector: describeSelectorWithCascadeContext(decl),
        property: decl.prop,
        value: decl.value,
        isCustomProperty: decl.prop.startsWith('--'),
        referencedCustomProps: referencedCustomProps(decl.value),
      });
    });
  }
  return { allDecls, parseErrors };
}

/** Classify ONE terminal (real-CSS-property, non-custom-property) declaration. */
function classifyTerminalDecl(decl) {
  const isShadowProp = SHADOW_PROPERTIES.has(decl.property);
  const isBackgroundMaskProp = BACKGROUND_MASK_PROPERTIES.has(decl.property);
  // FAIL CLOSED ON EXPANSION FAILURE. expandAndSplitSourceLayers can only fail
  // by hitting the recursion cap — treat that as unsafe (red), never as a
  // clean whole-value pass, per "a resolver that gives up and reports safe is
  // worse than no resolver."
  const expansion = isShadowProp ? expandAndSplitSourceLayers(decl.value) : { layers: [], failedClosed: false };
  const layers = expansion.layers ?? [];
  const nonSole = isShadowProp && (expansion.failedClosed || layers.length > 1);
  let position;
  if (expansion.failedClosed) position = 'expansion-failed-closed';
  else if (isShadowProp) position = nonSole ? 'non-sole-shadow-list-item' : 'whole-value';
  else if (isBackgroundMaskProp) position = 'background-mask-layer';
  else position = 'other-property';
  return {
    terminalFile: decl.file,
    terminalLine: decl.line,
    terminalSelector: decl.selector,
    terminalProperty: decl.property,
    terminalValue: decl.value,
    isShadowProp,
    layerCount: isShadowProp ? (expansion.failedClosed ? null : layers.length) : null,
    expansionFailedClosed: expansion.failedClosed,
    expansionFailureReason: expansion.reason ?? null,
    position,
    red: position === 'non-sole-shadow-list-item' || position === 'expansion-failed-closed',
  };
}

/**
 * Follow every consumer of `startPropName`, recursively through forwarding
 * (custom-property) consumers, until reaching every TERMINAL site. Returns
 * one entry per terminal site reached, each carrying the full forwarding
 * chain that led there (so a defect is traceable, not just flagged) and a
 * cap on recursion depth / a visited-set cycle guard so a malformed circular
 * reference cannot hang the census.
 */
function resolveTerminalSites(startPropName, allDecls, opts = {}) {
  const visited = opts.visited ?? new Set();
  const chainPath = opts.path ?? [];
  const MAX_DEPTH = 12;
  if (chainPath.length > MAX_DEPTH) {
    // FAIL CLOSED, not open. An unresolved chain (most likely a genuine
    // custom-property cycle) is UNKNOWN safety, and unknown must never
    // report as green. An earlier version of this function returned
    // `red: false` here — a resolution the census gave up on was being
    // counted as proven-safe, which is the exact "ambiguity treated as
    // safe" failure mode this whole instrument exists to refuse. See
    // testDepthLimitFailsClosed for the fixture that proves this both ways.
    return [{ terminalProperty: startPropName, red: true, position: 'depth-limit-reached', forwardingChain: chainPath, note: `Recursion exceeded ${MAX_DEPTH} hops resolving ${startPropName} — likely a cycle; UNRESOLVED, treated as unsafe, not classified as either whole-value or list-splice.` }];
  }
  const visitKey = `${startPropName}`;
  if (visited.has(visitKey)) return [];
  visited.add(visitKey);

  const consumers = allDecls.filter((d) => d.referencedCustomProps.includes(startPropName));
  const terminals = [];
  for (const decl of consumers) {
    const nextPath = [...chainPath, { viaProperty: startPropName, consumingProperty: decl.property, file: decl.file, line: decl.line, selector: decl.selector }];
    if (decl.isCustomProperty) {
      terminals.push(...resolveTerminalSites(decl.property, allDecls, { visited, path: nextPath }));
    } else {
      terminals.push({ ...classifyTerminalDecl(decl), forwardingChain: nextPath });
    }
  }
  return terminals;
}

function runListSpliceCensus() {
  const files = listCensusFiles();
  const { allDecls, parseErrors } = buildDeclarationIndex(files);

  // Discover every distinct --ds-material-* NAME referenced anywhere, as the
  // set of roots to resolve — not hardcoded, so a channel added later is
  // covered automatically.
  const rootNames = [...new Set(
    allDecls.flatMap((d) => [...d.value.matchAll(MATERIAL_VAR_RE)].map((m) => m[1]))
  )].sort();

  const channelResolutions = rootNames.map((materialVar) => {
    const terminalSites = resolveTerminalSites(materialVar, allDecls).map((t) => ({ materialVar, ...t }));
    return {
      materialVar,
      terminalSiteCount: terminalSites.length,
      redTerminalSiteCount: terminalSites.filter((t) => t.red).length,
      anyRed: terminalSites.some((t) => t.red),
      terminalSites,
    };
  });

  const allTerminalSites = channelResolutions.flatMap((c) => c.terminalSites);
  const redRows = allTerminalSites.filter((t) => t.red);

  /**
   * WHOLE-VALUE-ISOLATION TEST (the test the corrected law asked for, adjudication
   * item 5). Not just "the RED rows are the known defective sites" — this explicitly
   * buckets EVERY resolved TERMINAL site by position and proves positions (i)/(ii)/
   * other are isolated from the defect: every single terminal in those buckets must
   * be green, checked directly against the same data the RED rows come from.
   */
  const positionBreakdown = {
    'whole-value': allTerminalSites.filter((t) => t.position === 'whole-value'),
    'background-mask-layer': allTerminalSites.filter((t) => t.position === 'background-mask-layer'),
    'non-sole-shadow-list-item': allTerminalSites.filter((t) => t.position === 'non-sole-shadow-list-item'),
    'other-property': allTerminalSites.filter((t) => t.position === 'other-property'),
  };
  const wholeValueIsolationTest = {
    law: 'Positions (i) whole-value and (ii) background-mask-layer (plus other-property, which the law does not even address) must be isolated from the defect: EVERY resolved terminal site in those three buckets must have red === false. Only non-sole-shadow-list-item may contain red terminals. Resolution follows forwarding through custom properties, so this now covers indirect splices, not just direct-text occurrences.',
    counts: Object.fromEntries(Object.entries(positionBreakdown).map(([k, v]) => [k, v.length])),
    allNonDefectPositionsIsolated:
      positionBreakdown['whole-value'].every((t) => !t.red) &&
      positionBreakdown['background-mask-layer'].every((t) => !t.red) &&
      positionBreakdown['other-property'].every((t) => !t.red),
    onlyDefectPositionHasRedRows: redRows.every((t) => t.position === 'non-sole-shadow-list-item'),
  };

  // Verification against the known cases named in the adjudication, RE-DERIVED
  // against the indirection-aware terminal data (not the old direct-scan rows).

  // Case A: every --ds-material-*-highlight root that flows through semantic-
  // surface.css's --_surface-highlight bridge must resolve to green terminals
  // (box-shadow sole-item + background-image gradient layer, per source) —
  // checked by actually walking the resolution, not by special-casing the
  // bridge declaration's own (non-terminal) row the way the old census did.
  const caseA_viaSurfaceHighlightBridge = allTerminalSites.filter((t) =>
    t.forwardingChain.some((hop) => hop.file === SEMANTIC_SURFACE_REL && hop.consumingProperty === '--_surface-highlight')
  );
  const caseA_dualTypedConsumersAllGreen = caseA_viaSurfaceHighlightBridge.length > 0 && caseA_viaSurfaceHighlightBridge.every((t) => !t.red);

  // Case B: every WHOLE-VALUE shadow terminal (isShadowProp true, layerCount
  // === 1) must not be red — true by construction, verified directly.
  const soleLayerShadowTerminals = allTerminalSites.filter((t) => t.isShadowProp && t.layerCount === 1);
  const caseB_wholeValueConsumptionAllGreen = soleLayerShadowTerminals.every((t) => !t.red);

  // Case C: TMM's `none` authorings live in a .ts fixture, not a modern skin
  // .css file, so they are structurally outside this census's scan set.
  const scannedAnyTsFixture = files.some((f) => f.endsWith('.ts'));
  const caseC_tmmNoneOutOfScope = !scannedAnyTsFixture;

  // Case D: which overlay-family files have a red terminal site reachable
  // FROM ANY channel, including through indirection. This is the corrected
  // count — the old direct-text census found three (dropdown, overlay-modal,
  // drawer) and excluded popover; the indirection-aware resolver additionally
  // catches popover's --ds-material-overlay-shadow -> --ds-popover-shadow-
  // current -> `box-shadow: inset ..., var(--ds-popover-shadow-current)`
  // chain (popover.css:91-103 forwards, popover.css:208-210 splices as a
  // non-sole item). That is a FOURTH site, reached one hop later, and the old
  // census's "popover correctly excluded" conclusion was wrong — corrected
  // here rather than carried forward.
  const overlayFamilyFiles = ['popover.css', 'dropdown.css', 'overlay-modal.css', 'drawer.css'];
  const caseD_redFilesFound = [...new Set(redRows.map((r) => r.terminalFile.split('/').pop()))];
  const caseD_perFamilyFile = Object.fromEntries(
    overlayFamilyFiles.map((f) => [f, redRows.some((r) => r.terminalFile.endsWith(f))])
  );
  const caseD_popoverHasRedTerminal = caseD_perFamilyFile['popover.css'];
  const caseD_note = caseD_popoverHasRedTerminal
    ? 'CORRECTED FROM AN EARLIER, WRONG CONCLUSION: an earlier version of this census (direct-text scan only) reported popover.css as "correctly excluded" from the defect. It was not excluded — it is reached one hop later via --ds-popover-shadow-current, confirmed both in source (popover.css:91-103 forwards, popover.css:208-210 splices as a non-sole box-shadow item) and in this run\'s own resolved terminal sites (see redRows filtered to popover.css). That earlier conclusion directly contradicted this file\'s OWN prior dynamic run data (Popover/--ds-material-overlay-shadow/bareNone recorded afterRaw="none", collapsedToNone=true) and the contradiction was not caught before being reported — recorded here as the reason cross-checking a census against this file\'s own dynamic data is now part of the process, not assumed unnecessary.'
    : 'popover.css shows no red terminal in this run. If the isolation fix has landed there too, this is the expected post-fix state; if not, re-verify the resolver actually reached popover\'s box-shadow declaration (see channelResolutions for --ds-material-overlay-shadow).';

  const verification = {
    caseA_semanticSurfaceDualTypedConsumersAllGreen: caseA_dualTypedConsumersAllGreen,
    caseA_terminalSiteCount: caseA_viaSurfaceHighlightBridge.length,
    caseA_evidence: caseA_viaSurfaceHighlightBridge,
    caseB_wholeValueShadowConsumptionAllGreen: caseB_wholeValueConsumptionAllGreen,
    caseB_soleLayerShadowTerminalCount: soleLayerShadowTerminals.length,
    caseC_tmmNoneAuthoringsOutOfScope: caseC_tmmNoneOutOfScope,
    caseC_note: 'TMM none-authorings live in src/foundation/contracts/.../fixtures/themanagement-db-row/index.ts (a .ts object literal, not CSS) — this census only parses .css files, so that file is never read. Counted directly for the record: 7 `--ds-material-*: none` entries found there (1 texture, 4 control-shadow-*, 2 card-shadow-*), not 5 — flagging this discrepancy against the adjudication\'s stated count rather than silently matching it.',
    caseD_redFilesFound,
    caseD_perFamilyFile,
    caseD_popoverHasRedTerminal,
    caseD_note,
  };

  return {
    generatedAt: new Date().toISOString(),
    law: 'A var(--ds-material-*) reference is resolved to every TERMINAL site it can reach, following forwarding through custom properties (e.g. --ds-popover-shadow-current) rather than stopping at the first declaration that textually contains the name. Each terminal site is read in exactly one of three positions: (i) whole property value, (ii) background/mask layer, (iii) non-sole item in a comma-separated shadow list. RED IFF ANY reachable terminal is position (iii).',
    filesScanned: files.map((f) => path.relative(CORE, f)),
    parseErrors,
    rootChannelsResolved: rootNames.length,
    totalTerminalSites: allTerminalSites.length,
    totalRed: redRows.length,
    redRows,
    channelResolutions,
    positionBreakdown,
    wholeValueIsolationTest,
    verification,
  };
}

/**
 * SELF-TEST SUITE (post-hard-veto addendum). "A self-check that cannot detect
 * 'this function is called with the wrong shape' is not checking the thing
 * most likely to be wrong." This exercises each helper's CONTRACT directly —
 * the exact call shape `main()` uses, not a paraphrase of it — against real
 * execution wherever that is possible without touching the app server or a
 * browser: a real (ephemeral, local-only, non-app) HTTP server for the health
 * check, real synthetic CSS for the indirection resolver, and source-text
 * self-inspection for "is this helper actually wired into main(), not just
 * defined." Run with `--self-test`. No dependency on port 7001 or chromium.
 */

function assert(condition, message) {
  return { pass: Boolean(condition), message };
}

/** Spin up a tiny local HTTP server that always answers 200 fast, on an
 * ephemeral port — proves waitForServerHealthy's HAPPY path against the
 * EXACT array-of-URLs shape main() calls it with, without depending on the
 * (currently unreliable) dev server at :7001. */
async function testWaitForServerHealthyHappyPath() {
  const server = createServer((req, res) => {
    res.writeHead(200, { 'content-type': 'text/plain' });
    res.end('ok');
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const port = server.address().port;
  const urls = [`http://127.0.0.1:${port}/a`, `http://127.0.0.1:${port}/b`];
  const results = [];
  try {
    // Exact call shape main() uses: an ARRAY of urls, no options override
    // except a tight deadline so the test itself stays fast.
    const healthCheck = await waitForServerHealthy(urls, { requiredConsecutive: 2, perRequestBudgetMs: 2000, overallDeadlineMs: 15000 });
    results.push(assert(healthCheck.healthy === true, 'waitForServerHealthy(array) resolves healthy:true against a real healthy server'));
    results.push(assert(typeof healthCheck.perRoute === 'object' && healthCheck.perRoute !== null, 'result has a .perRoute object (the field main() actually reads)'));
    results.push(assert(!('attempts' in healthCheck), 'result does NOT have a top-level .attempts field (the field an earlier version read that the rewrite removed)'));
    for (const u of urls) {
      results.push(assert(healthCheck.perRoute[u]?.healthy === true, `perRoute['${u}'].healthy === true`));
      results.push(assert(Array.isArray(healthCheck.perRoute[u]?.lastAttempts), `perRoute['${u}'].lastAttempts is an array`));
    }
  } catch (e) {
    results.push(assert(false, `waitForServerHealthy(array) threw against a healthy server: ${e.message}`));
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
  return results;
}

/** Confirms waitForServerHealthy correctly FAILS CLOSED (throws, bounded
 * time) against unreachable routes, and that the thrown error is informative
 * — not a raw TypeError from a shape mismatch, which is what "urls.map is
 * not a function" would look like if a string were passed instead of an
 * array. */
async function testWaitForServerHealthyUnhealthyPath() {
  const results = [];
  const urls = ['http://127.0.0.1:1/definitely-closed']; // port 1 is not listening
  const startedAt = Date.now();
  try {
    await waitForServerHealthy(urls, { requiredConsecutive: 2, perRequestBudgetMs: 300, overallDeadlineMs: 2000 });
    results.push(assert(false, 'waitForServerHealthy resolved against an unreachable URL — should have thrown'));
  } catch (e) {
    const elapsed = Date.now() - startedAt;
    results.push(assert(!(e instanceof TypeError), `error is not a raw TypeError (shape-mismatch signature) — got: ${e.constructor.name}: ${e.message}`));
    results.push(assert(/NOT DETERMINISTICALLY HEALTHY/.test(e.message), 'error message identifies itself as the deterministic-health failure, not an unrelated crash'));
    results.push(assert(elapsed < 5000, `failed within the bounded deadline (${elapsed}ms), did not hang`));
  }
  return results;
}

/** Confirms waitForServerHealthy throws IMMEDIATELY AND INFORMATIVELY (not a
 * cryptic TypeError) if ever called with a non-array — the exact failure
 * mode named in the veto, tested directly rather than argued about. */
function testWaitForServerHealthyRejectsNonArray() {
  const results = [];
  try {
    // Deliberately wrong shape: a single URL STRING, not an array. A string
    // has no .map, so urls.map(...) throws synchronously before any await —
    // this executes inside the async function but the TypeError surfaces as
    // a rejected promise; catching it synchronously here via a thrown
    // Promise is awkward, so this calls the function and inspects the
    // returned promise's rejection directly.
    const p = waitForServerHealthy('http://127.0.0.1:1/not-an-array');
    results.push({ pending: p });
  } catch (e) {
    results.push(assert(false, `threw synchronously instead of returning a rejected promise: ${e.message}`));
  }
  return results;
}

/** Pure unit tests for sameServerProcess — no network, no process access. */
function testSameServerProcess() {
  const results = [];
  const a = { pid: '123', lstart: 'Mon Aug  5 10:00:00 2026' };
  const b = { pid: '123', lstart: 'Mon Aug  5 10:00:00 2026' };
  const c = { pid: '456', lstart: 'Mon Aug  5 10:00:00 2026' };
  const d = { pid: '123', lstart: 'Mon Aug  5 11:00:00 2026' };
  const withError = { pid: null, error: 'no listening process found on port' };
  results.push(assert(sameServerProcess(a, b) === true, 'identical pid+lstart => same process'));
  results.push(assert(sameServerProcess(a, c) === false, 'different pid => different process'));
  results.push(assert(sameServerProcess(a, d) === false, 'different lstart, same pid => different process (restart reusing a pid)'));
  results.push(assert(sameServerProcess(withError, a) === false, 'an error-shaped identity is never "same" as anything — fails closed, not open'));
  results.push(assert(sameServerProcess(null, a) === false, 'null identity fails closed'));
  return results;
}

/** getServerProcessIdentity against a port nothing listens on — confirms it
 * returns an ERROR SHAPE, not a throw, and that the shape is well-formed. */
function testGetServerProcessIdentityErrorPath() {
  const results = [];
  const identity = getServerProcessIdentity(1); // port 1 requires root and nothing listens there in this environment
  results.push(assert(identity.pid === null, 'no listener on the port => pid is null, not a thrown error'));
  results.push(assert(typeof identity.error === 'string' && identity.error.length > 0, 'error field is a non-empty string explaining why'));
  return results;
}

/**
 * INDIRECTION RESOLVER — the most important self-test in this suite. Builds
 * TWO synthetic in-memory CSS fixtures: one reproducing the EXACT pre-fix
 * popover shape (a forwarding custom property splicing into a non-sole
 * box-shadow item) that the direct-text census missed, and one reproducing
 * the post-fix safe shape (same forwarding, but the terminal site is a SOLE
 * box-shadow item). Writes them to temp files (postcss.parse needs a real
 * `from` path for line numbers, and the resolver reads files by path), runs
 * the SAME buildDeclarationIndex/resolveTerminalSites the real census uses,
 * and asserts the known-bad case is caught RED and the known-safe case is
 * not. This is what "prove your own probe can fail" means for this
 * component specifically.
 */
function testIndirectionResolverCatchesForwardedDefect() {
  const results = [];
  const knownBadCss = `
.surface {
  --x-shadow-current: var(--x-bordered-shadow, var(--ds-material-test-shadow, var(--ds-elevation-3)));
  box-shadow: inset 0 1px 0 white, var(--x-shadow-current);
}
`;
  const knownSafeCss = `
.surface {
  --x-shadow-current: var(--x-bordered-shadow, var(--ds-material-test-shadow, var(--ds-elevation-3)));
  box-shadow: var(--x-shadow-current);
}
`;
  const tmpDir = mkdtempSync(path.join(tmpdir(), 'overlay-probe-self-test-'));
  const badPath = path.join(tmpDir, 'known-bad.css');
  const safePath = path.join(tmpDir, 'known-safe.css');
  writeFileSync(badPath, knownBadCss);
  writeFileSync(safePath, knownSafeCss);

  try {
    const { allDecls: badDecls } = buildDeclarationIndex([badPath]);
    const badTerminals = resolveTerminalSites('--ds-material-test-shadow', badDecls);
    results.push(assert(badTerminals.some((t) => t.red), 'KNOWN-BAD fixture (forwarded into a non-sole box-shadow item, the pre-fix popover shape): resolver finds at least one RED terminal'));
    results.push(assert(badTerminals.some((t) => t.position === 'non-sole-shadow-list-item'), 'KNOWN-BAD fixture: the red terminal is classified non-sole-shadow-list-item, not some other position'));
    results.push(assert(badTerminals.some((t) => t.forwardingChain?.length === 2), 'KNOWN-BAD fixture: the terminal reports a 2-hop forwarding chain (root -> --x-shadow-current -> box-shadow), proving indirection was actually followed, not a direct match'));

    const { allDecls: safeDecls } = buildDeclarationIndex([safePath]);
    const safeTerminals = resolveTerminalSites('--ds-material-test-shadow', safeDecls);
    results.push(assert(safeTerminals.length > 0, 'KNOWN-SAFE fixture: resolver still finds the terminal (does not silently find nothing)'));
    results.push(assert(safeTerminals.every((t) => !t.red), 'KNOWN-SAFE fixture (forwarded into a SOLE box-shadow item, the post-fix popover shape): no red terminal — a false positive here would flag safe code'));
  } finally {
    rmSync(tmpDir, { recursive: true, force: true });
  }
  return results;
}

/**
 * DEPTH-LIMIT AND CYCLE-GUARD, PROVEN BOTH WAYS. Two distinct termination
 * mechanisms exist in resolveTerminalSites and must not be conflated:
 *   - MAX_DEPTH (chainPath.length > 12): fires on a genuinely LONG, non-
 *     repeating forwarding chain (or a cycle that happens to visit 12+
 *     DISTINCT names before looping). Fixed here to return `red: true` —
 *     a walk the census gave up on is UNRESOLVED, not proven safe.
 *   - visited-set (visitKey already seen): fires on revisiting the exact
 *     same property name within one root's walk. This is sound, not a fail-
 *     open bug: a property's set of consumers is a static fact independent
 *     of the path taken to reach it, so whatever is reachable from that
 *     property was already fully explored (and any red terminal already
 *     reported) the FIRST time it was visited — a second visit can only
 *     rediscover the same terminals via a longer chain. Proven below with a
 *     genuine 2-node cycle: it terminates (no hang) and correctly reports
 *     zero terminals, because a closed loop with no outside consumer truly
 *     has none — not because the guard hid one.
 */
function testDepthLimitFailsClosed() {
  const results = [];

  // Fixture 1: a LINEAR chain of 14 distinct custom properties, each
  // forwarding only to the next — never revisits a name, so only MAX_DEPTH
  // (not the visited-set) can be the mechanism that stops it.
  const rootName = '--ds-material-test-deep-shadow';
  const steps = Array.from({ length: 14 }, (_, i) => `--x-deep-step-${i}`);
  const chainRules = [`.step0 { ${steps[0]}: var(${rootName}); }`];
  for (let i = 0; i < steps.length - 1; i++) {
    chainRules.push(`.step${i + 1} { ${steps[i + 1]}: var(${steps[i]}); }`);
  }
  // No terminal CSS property at the end on purpose — if MAX_DEPTH did not
  // stop this, it would recurse until the JS call stack overflowed, which
  // would fail the self-test run itself rather than reporting PASS/FAIL.
  const deepCss = chainRules.join('\n');
  const tmpDir1 = mkdtempSync(path.join(tmpdir(), 'overlay-probe-self-test-depth-'));
  const deepPath = path.join(tmpDir1, 'deep-chain.css');
  writeFileSync(deepPath, deepCss);
  try {
    const { allDecls } = buildDeclarationIndex([deepPath]);
    const terminals = resolveTerminalSites(rootName, allDecls);
    results.push(assert(terminals.length > 0, 'LINEAR 14-hop fixture: resolver returns rather than recursing forever or crashing'));
    results.push(assert(terminals.some((t) => t.position === 'depth-limit-reached'), 'LINEAR 14-hop fixture: MAX_DEPTH was the mechanism that stopped it (not the visited-set, since no name repeats)'));
    results.push(assert(terminals.every((t) => t.red === true), 'LINEAR 14-hop fixture: an UNRESOLVED chain reports red === true, not the earlier red === false fail-open bug'));
  } finally {
    rmSync(tmpDir1, { recursive: true, force: true });
  }

  // Fixture 2: a genuine 2-node CLOSED cycle with no outside consumer at
  // all. The correct answer is zero terminals (there is nowhere for paint
  // to actually land), and the guard must reach that answer WITHOUT hanging
  // or overflowing the stack.
  const cycleCss = `
.a { --x-loop-a: var(--ds-material-test-cycle-shadow); }
.b { --ds-material-test-cycle-shadow: var(--x-loop-a); }
`;
  const tmpDir2 = mkdtempSync(path.join(tmpdir(), 'overlay-probe-self-test-cycle-'));
  const cyclePath = path.join(tmpDir2, 'cycle.css');
  writeFileSync(cyclePath, cycleCss);
  try {
    const { allDecls } = buildDeclarationIndex([cyclePath]);
    const start = Date.now();
    const terminals = resolveTerminalSites('--ds-material-test-cycle-shadow', allDecls);
    results.push(assert(Date.now() - start < 5000, 'CLOSED 2-node cycle fixture: terminates promptly rather than hanging'));
    results.push(assert(terminals.length === 0, 'CLOSED 2-node cycle fixture: correctly reports zero terminals (a closed loop with no outside consumer truly has none to report)'));
  } finally {
    rmSync(tmpDir2, { recursive: true, force: true });
  }

  return results;
}

/**
 * THREE REQUIRED RED FIXTURES (hard veto: "the resolver must go RED on all
 * three... A resolver that cannot fail on known defects has not been tested;
 * it has been run"). Two are REAL, current source; one is synthetic.
 *
 * 1. LIST-TOOLBAR (real, current): list-toolbar.css:106-111's box-shadow is
 *    syntactically ONE var(--ds-toolbar-shadow, ...) call with zero top-level
 *    commas — the old counter saw one item. Its fallback, reached whenever a
 *    ground leaves --ds-toolbar-shadow unset, is
 *    `inset 0 1px 0 color-mix(...), var(--ds-material-panel-shadow, var(--ds-elevation-1))`
 *    — TWO items once expanded, with the role channel as the non-sole second.
 *    Run directly against the real file, not a copy.
 *
 * 2. SYNTHETIC NESTED FALLBACK: a fabricated single-var()-call declaration
 *    whose fallback contains its own top-level comma with the role channel as
 *    the non-sole second item — the general shape, isolated from any one
 *    file, so this keeps passing even if list-toolbar itself gets fixed.
 *
 * 3. SEGMENTED HOVER — NOT REPRODUCIBLE, reported as such rather than forced.
 *    Investigated directly: segmented.css's hover box-shadow is
 *    `var(--ds-segmented-shadow-hover, var(--ds-material-control-shadow-hover, var(--ds-elevation-1)))`.
 *    `--ds-segmented-shadow-hover` is confirmed undefined repo-wide (grep,
 *    zero results), and neither its own (absent) definition nor
 *    `--ds-material-control-shadow-hover`'s fallback (`var(--ds-elevation-1)`,
 *    a bare single var with no fallback of its own) introduces a comma at any
 *    expansion depth — the declaration is genuinely ONE layer, both before
 *    and after full expansion, matching the file's own "DEPTH IS THE SOLE
 *    BOX-SHADOW (adjudicated)... one item" comment. This test asserts the
 *    EXPANSION TRACE is correct (1 layer, not red) rather than assert a red
 *    verdict this file cannot honestly produce. If this is wrong, it is
 *    wrong about a fully-cited, checkable trace — not a bare disagreement.
 */
function testFallbackExpansionRedFixtures() {
  const results = [];

  // Fixture 1: list-toolbar.css, real source, no copy.
  const listToolbarPath = path.join(CORE, 'src/foundation/tokens/css/runtime/engines/modern/skin/list-toolbar.css');
  const { allDecls: ltDecls } = buildDeclarationIndex([listToolbarPath]);
  const ltTerminals = resolveTerminalSites('--ds-material-panel-shadow', ltDecls);
  results.push(assert(ltTerminals.some((t) => t.red && t.terminalFile.endsWith('list-toolbar.css')), 'LIST-TOOLBAR (real source): --ds-material-panel-shadow resolves to a RED terminal in list-toolbar.css'));
  results.push(assert(ltTerminals.some((t) => t.layerCount === 2), 'LIST-TOOLBAR: the red terminal reports exactly 2 layers after fallback expansion (was invisible to top-level-comma-only counting, which saw 1)'));

  // Fixture 2: synthetic nested fallback, isolated from any one file.
  const tmpDir = mkdtempSync(path.join(tmpdir(), 'overlay-probe-fallback-expansion-'));
  const nestedFallbackPath = path.join(tmpDir, 'nested-fallback.css');
  writeFileSync(nestedFallbackPath, `
.surface {
  box-shadow: var(--x-outer-shadow, inset 0 1px 0 white, var(--ds-material-test-nested-shadow, var(--ds-elevation-2)));
}
`);
  try {
    const { allDecls: nfDecls } = buildDeclarationIndex([nestedFallbackPath]);
    const nfTerminals = resolveTerminalSites('--ds-material-test-nested-shadow', nfDecls);
    results.push(assert(nfTerminals.some((t) => t.red), 'SYNTHETIC NESTED FALLBACK: a single var() call whose fallback contains its own top-level comma is caught RED'));
    results.push(assert(nfTerminals.some((t) => t.layerCount === 2), 'SYNTHETIC NESTED FALLBACK: reports 2 layers post-expansion, matching the fallback\'s own comma-separated pieces'));
  } finally {
    rmSync(tmpDir, { recursive: true, force: true });
  }

  // Fixture 3: Segmented hover — assert the TRACE, not a forced red.
  const segmentedPath = path.join(CORE, 'src/foundation/tokens/css/runtime/engines/modern/skin/segmented.css');
  const segmentedCss = readFileSync(segmentedPath, 'utf8');
  results.push(assert(!/--ds-segmented-shadow-hover\s*:/.test(segmentedCss), 'SEGMENTED HOVER precondition: --ds-segmented-shadow-hover is confirmed undefined in segmented.css itself'));
  const hoverDeclMatch = segmentedCss.match(/box-shadow:\s*var\(\s*\n\s*--ds-segmented-shadow-hover,\s*\n\s*var\(--ds-material-control-shadow-hover, var\(--ds-elevation-1\)\)\s*\n\s*\);/);
  results.push(assert(Boolean(hoverDeclMatch), 'SEGMENTED HOVER: the exact declaration text this trace is based on is still present verbatim in current source (if this fails, source moved again and the trace below is stale, not wrong)'));
  if (hoverDeclMatch) {
    const expansion = expandAndSplitSourceLayers('var(\n    --ds-segmented-shadow-hover,\n    var(--ds-material-control-shadow-hover, var(--ds-elevation-1))\n  )');
    results.push(assert(!expansion.failedClosed && expansion.layers?.length === 1, `SEGMENTED HOVER: expansion trace produces exactly 1 layer (got ${expansion.failedClosed ? 'failedClosed' : expansion.layers?.length}) — genuinely not a list-splice site, not a false green`));
  }

  return results;
}

/**
 * AT-RULE / CASCADE CONTEXT, PROVEN BOTH WAYS. describeSelectorWithCascade
 * Context must not flatten away a @media/@supports/@container wrapper (the
 * old decl.parent?.selector-only version did), and must not INVENT context
 * that is not there for a plain top-level rule.
 */
function testSelectorCascadeContext() {
  const results = [];

  const plainCss = `.plain { box-shadow: var(--ds-material-test-plain); }`;
  const atRuleCss = `@media (prefers-color-scheme: dark) { .dark-mode { box-shadow: var(--ds-material-test-dark); } }`;
  const nestedAtRuleCss = `@media (min-width: 768px) { @supports (color: color-mix(in srgb, red, blue)) { .wide-and-modern { box-shadow: var(--ds-material-test-nested); } } }`;
  const rootCss = `:root { --ds-material-test-root-fwd: var(--ds-material-test-root); }`;

  const tmpDir = mkdtempSync(path.join(tmpdir(), 'overlay-probe-self-test-cascade-'));
  const paths = {
    plain: path.join(tmpDir, 'plain.css'),
    atRule: path.join(tmpDir, 'at-rule.css'),
    nested: path.join(tmpDir, 'nested.css'),
    root: path.join(tmpDir, 'root.css'),
  };
  writeFileSync(paths.plain, plainCss);
  writeFileSync(paths.atRule, atRuleCss);
  writeFileSync(paths.nested, nestedAtRuleCss);
  writeFileSync(paths.root, rootCss);

  try {
    const { allDecls: plainDecls } = buildDeclarationIndex([paths.plain]);
    results.push(assert(plainDecls[0].selector === '.plain', `PLAIN rule: selector is exactly the rule selector, no invented at-rule context (got "${plainDecls[0].selector}")`));

    const { allDecls: atRuleDecls } = buildDeclarationIndex([paths.atRule]);
    results.push(assert(
      atRuleDecls[0].selector === '@media (prefers-color-scheme: dark) > .dark-mode',
      `SINGLE AT-RULE wrapper: selector carries the @media condition, not just the inner rule (got "${atRuleDecls[0].selector}")`
    ));

    const { allDecls: nestedDecls } = buildDeclarationIndex([paths.nested]);
    results.push(assert(
      nestedDecls[0].selector === '@media (min-width: 768px) > @supports (color: color-mix(in srgb, red, blue)) > .wide-and-modern',
      `NESTED AT-RULES (outer to inner): both wrappers appear in outer-to-inner order (got "${nestedDecls[0].selector}")`
    ));

    const { allDecls: rootDecls } = buildDeclarationIndex([paths.root]);
    results.push(assert(rootDecls[0].selector === ':root', `:root custom-property declaration: reports ":root" (got "${rootDecls[0].selector}")`));
  } finally {
    rmSync(tmpDir, { recursive: true, force: true });
  }

  // Real source: at least one of the 14 known at-rule-nested --ds-material-*
  // shadow declarations (button.css) must come back with an "@" prefix, not
  // silently flattened to just the inner rule.
  const buttonPath = path.join(CORE, 'src/foundation/tokens/css/runtime/engines/modern/skin/button.css');
  const { allDecls: buttonDecls } = buildDeclarationIndex([buttonPath]);
  const atRuleNestedShadowDecls = buttonDecls.filter(
    (d) => (d.property === 'box-shadow' || d.property === 'text-shadow') && /--ds-material-/.test(d.value) && d.selector?.startsWith('@')
  );
  results.push(assert(atRuleNestedShadowDecls.length > 0, `REAL SOURCE (button.css): at least one --ds-material-* box-shadow declaration inside an at-rule reports a selector starting with "@" (found ${atRuleNestedShadowDecls.length})`));

  return results;
}

/**
 * SOURCE WIRING CHECK. "Server-identity helpers are DEFINED BUT NEVER
 * CALLED... the receipt currently could carry server-identity fields that no
 * code ever wrote, and nothing would notice." This reads this file's OWN
 * source text and asserts the call sites actually exist — a check on the
 * check, cheap and specific to exactly the failure mode named.
 */
function testSourceWiring() {
  const results = [];
  const selfSource = readFileSync(fileURLToPath(import.meta.url), 'utf8');
  const mainBodyMatch = selfSource.match(/async function main\(\) \{[\s\S]*?\n\}\n\n\/\*\*\n \* LIST-SPLICE CENSUS/);
  const mainBody = mainBodyMatch ? mainBodyMatch[0] : selfSource; // fall back to whole file if the anchor ever moves
  results.push(assert(/getServerProcessIdentity\(SERVER_PORT\)/.test(mainBody), 'main() calls getServerProcessIdentity(SERVER_PORT) — not just defines it'));
  results.push(assert((mainBody.match(/getServerProcessIdentity\(SERVER_PORT\)/g) ?? []).length >= 2, 'getServerProcessIdentity is called at least twice in main() (before AND after)'));
  results.push(assert(/sameServerProcess\(serverIdentityBefore, serverIdentityAfter\)/.test(mainBody), 'main() calls sameServerProcess(before, after) — the comparison is not just defined, it runs'));
  results.push(assert(/const runValid = pipelineDrift\.length === 0 && !serverRestarted && bundleFreshness\.allMatch === true/.test(mainBody), 'runValid\'s definition textually references pipelineDrift, serverRestarted AND bundleFreshness.allMatch together — not pipelineDrift alone'));
  results.push(assert(/waitForServerHealthy\(ALL_MEASURED_ROUTE_URLS\)/.test(mainBody), 'main() calls waitForServerHealthy with the ALL_MEASURED_ROUTE_URLS array constant, not a single route string'));
  results.push(assert(/healthCheck\.perRoute/.test(mainBody) && !/healthCheck\.attempts/.test(mainBody), 'main() reads healthCheck.perRoute and does NOT read a healthCheck.attempts field'));
  results.push(assert(/testChannelCausalityThreeModes\(page, family\.surfaceSelector, channel, family\.name\)/.test(selfSource), 'main() calls the THREE-MODE causality test with the family name, not the old single-mode testChannelCausality'));
  return results;
}

/**
 * SENIOR_FAMILY_VAR DRIFT DETECTOR. This table was hand-verified against
 * source ONCE. Source has already moved twice under this probe this session
 * (the isolation fix landing for three families, then a fourth for popover)
 * — a hardcoded table with no way to notice drift is exactly the "silently
 * assumed stable" failure this whole round is about. For every non-null
 * entry, re-derive it from a FRESH parse of current source (via this file's
 * own buildDeclarationIndex) and confirm the claimed senior var still
 * actually wraps the role channel in some live declaration.
 */
function testSeniorFamilyVarTableMatchesSource() {
  const results = [];
  const files = listCensusFiles();
  const { allDecls } = buildDeclarationIndex(files);
  for (const [familyName, channels] of Object.entries(SENIOR_FAMILY_VAR)) {
    for (const [channelKey, seniorVar] of Object.entries(channels)) {
      if (seniorVar === null) continue; // "no senior var" is not positively re-verifiable this way; the census's own terminal resolution already covers whether the role is reachable at all.
      const roleVar = `--ds-material-overlay-${channelKey}`;
      const escSenior = seniorVar.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const escRole = roleVar.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const wrapsPattern = new RegExp(`var\\(\\s*${escSenior}\\s*,[\\s\\S]{0,400}?var\\(\\s*${escRole}\\b`);
      const found = allDecls.some((d) => d.referencedCustomProps.includes(seniorVar) && d.referencedCustomProps.includes(roleVar) && wrapsPattern.test(d.value));
      results.push(assert(found, `${familyName}/${channelKey}: claimed senior var ${seniorVar} still wraps ${roleVar} in current source (re-verified fresh, not trusted from the hardcoded table)`));
    }
  }
  return results;
}

/**
 * FAIL-CLOSED EXIT-CODE DECISION (pure, extracted so it can be self-tested —
 * a boolean written directly into the CLI dispatch block is exactly the
 * shape of assertion this whole round has repeatedly found silently wrong).
 * ANY of three independent signals fails the run closed:
 *   1. totalRed > 0 — already covers expansion-depth exhaustion, because
 *      classifyTerminalDecl marks a cap-exceeded expansion `red: true,
 *      position: 'expansion-failed-closed'`, and redRows is a filter over
 *      `t.red`. Not re-derived as a second counter on purpose: two counters
 *      over the same flag would drift: the flag IS the signal.
 *   2. parseErrors.length > 0 — a file postcss could not parse is a file the
 *      census could not see into; reporting green over an unparseable file
 *      is "ambiguity treated as safe," the exact failure mode this probe
 *      exists to refuse.
 *   3. The census's own stated invariant (wholeValueIsolationTest) failed to
 *      hold. Normally implied by (1); kept as an independent signal so a
 *      future change that decouples the two still fails the run instead of
 *      printing a quietly-wrong "false" beside a zero exit code.
 */
function decideCensusExitCode(census) {
  const invariantHeld =
    census.wholeValueIsolationTest.allNonDefectPositionsIsolated &&
    census.wholeValueIsolationTest.onlyDefectPositionHasRedRows;
  const reasons = [];
  if (census.totalRed > 0) reasons.push(`totalRed=${census.totalRed}`);
  if (census.parseErrors.length > 0) reasons.push(`parseErrors=${census.parseErrors.length}`);
  if (!invariantHeld) reasons.push('instrumentInvariantViolated');
  if (reasons.length > 0) {
    return { shouldFailClosed: true, reason: reasons.join(', ') };
  }
  return { shouldFailClosed: false, reason: 'zero red rows, zero parse errors, instrument invariant held' };
}

/** Constructs the minimal shape decideCensusExitCode reads, with every
 * signal green, for self-test mutation. */
function greenCensusFixture() {
  return {
    totalRed: 0,
    parseErrors: [],
    wholeValueIsolationTest: { allNonDefectPositionsIsolated: true, onlyDefectPositionHasRedRows: true },
  };
}

function testDecideCensusExitCode() {
  const results = [];

  const clean = decideCensusExitCode(greenCensusFixture());
  results.push(assert(clean.shouldFailClosed === false, 'all-green fixture: does NOT fail closed (proves the gate can pass, not just fail)'));

  const redFixture = { ...greenCensusFixture(), totalRed: 1 };
  const redDecision = decideCensusExitCode(redFixture);
  results.push(assert(redDecision.shouldFailClosed === true, 'totalRed=1 fixture: fails closed'));
  results.push(assert(/totalRed=1/.test(redDecision.reason), 'totalRed=1 fixture: reason names the red count'));

  const parseErrorFixture = { ...greenCensusFixture(), parseErrors: [{ file: 'x.css', error: 'synthetic' }] };
  const parseErrorDecision = decideCensusExitCode(parseErrorFixture);
  results.push(assert(parseErrorDecision.shouldFailClosed === true, 'parseErrors=1 fixture: fails closed even with totalRed=0 (an unparseable file is not evidence of safety)'));

  const invariantViolatedFixture = {
    ...greenCensusFixture(),
    wholeValueIsolationTest: { allNonDefectPositionsIsolated: false, onlyDefectPositionHasRedRows: true },
  };
  const invariantDecision = decideCensusExitCode(invariantViolatedFixture);
  results.push(assert(invariantDecision.shouldFailClosed === true, 'invariant-violated fixture: fails closed even with totalRed=0 and zero parse errors (the instrument contradicting its own stated law is itself a defect)'));

  return results;
}

async function runSelfTestSuite() {
  const suites = [
    { name: 'sameServerProcess (unit)', results: testSameServerProcess() },
    { name: 'getServerProcessIdentity error path', results: testGetServerProcessIdentityErrorPath() },
    { name: 'waitForServerHealthy happy path (real local http server)', results: await testWaitForServerHealthyHappyPath() },
    { name: 'waitForServerHealthy unhealthy path (fails closed, bounded)', results: await testWaitForServerHealthyUnhealthyPath() },
    { name: 'indirection resolver (synthetic known-bad / known-safe fixtures)', results: testIndirectionResolverCatchesForwardedDefect() },
    { name: 'depth-limit fails closed / cycle-guard terminates (both proven, not assumed)', results: testDepthLimitFailsClosed() },
    { name: 'selector cascade context (at-rule wrappers not flattened away)', results: testSelectorCascadeContext() },
    { name: 'fallback-expansion required red fixtures (list-toolbar real, synthetic nested, segmented-hover trace)', results: testFallbackExpansionRedFixtures() },
    { name: 'source wiring (helpers actually called in main(), not just defined)', results: testSourceWiring() },
    { name: 'SENIOR_FAMILY_VAR table matches current source (drift detector)', results: testSeniorFamilyVarTableMatchesSource() },
    { name: 'decideCensusExitCode (fail-closed gate, proven both ways)', results: testDecideCensusExitCode() },
  ];
  let totalPass = 0;
  let totalFail = 0;
  for (const suite of suites) {
    process.stdout.write(`\n${suite.name}:\n`);
    for (const r of suite.results) {
      if (r.pending) continue; // async-rejection-only entries handled separately below
      process.stdout.write(`  [${r.pass ? 'PASS' : 'FAIL'}] ${r.message}\n`);
      if (r.pass) totalPass++; else totalFail++;
    }
  }
  // The non-array rejection test returns a pending promise (see its own doc
  // comment for why) — resolve it here so the failure/success is visible.
  process.stdout.write(`\nwaitForServerHealthy rejects a non-array argument (the exact veto scenario):\n`);
  try {
    await waitForServerHealthy('http://127.0.0.1:1/not-an-array', { overallDeadlineMs: 500 });
    process.stdout.write(`  [FAIL] resolved instead of rejecting when passed a string\n`);
    totalFail++;
  } catch (e) {
    const isShapeCrash = e instanceof TypeError && /urls\.map/.test(e.message);
    process.stdout.write(`  [${isShapeCrash ? 'FAIL' : 'PASS'}] passing a string ${isShapeCrash ? 'crashes with a raw urls.map TypeError' : `fails informatively (${e.constructor.name}), not with a raw shape-mismatch TypeError`}: ${e.message.slice(0, 120)}\n`);
    if (isShapeCrash) totalFail++; else totalPass++;
  }

  process.stdout.write(`\nSELF-TEST TOTAL: ${totalPass} passed, ${totalFail} failed\n`);
  return { totalPass, totalFail, suites };
}

if (process.argv.includes('--self-test')) {
  const { totalFail } = await runSelfTestSuite();
  if (totalFail > 0) process.exitCode = 1;
} else if (process.argv.includes('--census-only')) {
  const receiptPath = path.join(HERE, '..', 'receipts', 'cohort-1-overlay-causality.json');
  let existing = {};
  try {
    existing = JSON.parse(readFileSync(receiptPath, 'utf8'));
  } catch {
    // No prior receipt yet — the census can still stand alone.
  }
  const listSpliceCensus = runListSpliceCensus();
  const listSpliceCensusExitDecision = decideCensusExitCode(listSpliceCensus);
  const merged = {
    ...existing,
    listSpliceCensus,
    listSpliceCensusGeneratedAt: listSpliceCensus.generatedAt,
    // Persisted, not just printed — a reviewer opening this receipt later
    // must be able to see whether THIS run passed or failed closed without
    // re-executing the probe.
    listSpliceCensusExitDecision,
  };
  writeFileSync(receiptPath, `${JSON.stringify(merged, null, 2)}\n`);
  process.stdout.write(`census: ${listSpliceCensus.rootChannelsResolved} root --ds-material-* channels resolved to ${listSpliceCensus.totalTerminalSites} terminal sites across ${listSpliceCensus.filesScanned.length} files, ${listSpliceCensus.totalRed} RED\n`);
  if (listSpliceCensus.parseErrors.length > 0) {
    process.stdout.write(`  PARSE ERRORS: ${JSON.stringify(listSpliceCensus.parseErrors)}\n`);
  }
  process.stdout.write(`  case A (semantic-surface dual-typed bridges all green, ${listSpliceCensus.verification.caseA_terminalSiteCount} terminals checked): ${listSpliceCensus.verification.caseA_semanticSurfaceDualTypedConsumersAllGreen}\n`);
  process.stdout.write(`  case B (whole-value single-layer shadow consumption all green, ${listSpliceCensus.verification.caseB_soleLayerShadowTerminalCount} terminals checked): ${listSpliceCensus.verification.caseB_wholeValueShadowConsumptionAllGreen}\n`);
  process.stdout.write(`  case C (TMM none-authorings out of scope): ${listSpliceCensus.verification.caseC_tmmNoneAuthoringsOutOfScope}\n`);
  process.stdout.write(`  case D per-family: ${JSON.stringify(listSpliceCensus.verification.caseD_perFamilyFile)}\n`);
  process.stdout.write(`  whole-value-isolation test: allNonDefectPositionsIsolated=${listSpliceCensus.wholeValueIsolationTest.allNonDefectPositionsIsolated} onlyDefectPositionHasRedRows=${listSpliceCensus.wholeValueIsolationTest.onlyDefectPositionHasRedRows}\n`);
  process.stdout.write(`  position counts: ${JSON.stringify(listSpliceCensus.wholeValueIsolationTest.counts)}\n`);
  for (const r of listSpliceCensus.redRows) {
    const chain = r.forwardingChain.map((h) => `${h.viaProperty}->${h.consumingProperty}@${h.file}:${h.line}`).join(' => ');
    process.stdout.write(`  RED [${r.materialVar}] ${r.terminalFile}:${r.terminalLine} [${r.terminalSelector}] ${r.terminalProperty} (${r.layerCount} layers) via chain: ${chain}\n`);
  }

  // FAIL-CLOSED EXIT CODE (hard veto: "census does not exit nonzero on parse
  // errors, depth exhaustion, or red rows"). Decision + rationale live in
  // decideCensusExitCode (self-tested against 4 fixtures, see
  // testDecideCensusExitCode) — not re-argued here, only applied.
  if (listSpliceCensusExitDecision.shouldFailClosed) {
    process.stdout.write(`  CENSUS EXIT: FAIL-CLOSED (nonzero) — ${listSpliceCensusExitDecision.reason}\n`);
    process.exitCode = 1;
  } else {
    process.stdout.write(`  CENSUS EXIT: 0 — ${listSpliceCensusExitDecision.reason}\n`);
  }
} else {
  await main();
}
