/**
 * @fileoverview Wave G0 — Regression Harness And Baseline Capture
 *
 * Safety net capturing current first-party premium outputs and shared
 * generator coverage BEFORE any structural refactoring.
 *
 * Coverage matrix (post-G1):
 * - palette: SHARED (generated via color scale)
 * - personality: SHARED (animation, chart, card, accent, typography)
 * - density: SHARED (--ds-density-scale)
 * - sidebar: SHARED (--ds-sidebar-* from BrandTheme.chrome.sidebar)
 * - controls: SHARED (--ds-button-*, --ds-input-* from BrandTheme.chrome.controls)
 * - table: SHARED (--ds-table-header-* from BrandTheme.chrome.table)
 * - layout: SHARED (--ds-layout-* from BrandTheme.chrome.layout)
 * - shell: SHARED (--ds-shell-* from BrandTheme.chrome.shell)
 *
 * When the shared pipeline is extended in G1, tests in the
 * "currently first-party-only" sections should start passing through
 * the shared path too.
 */

import postcss from 'postcss';
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { brandThemeToChromeVariables } from "@/infrastructure/compilers/runtime/theme/runtime/lowering/foundation/chrome";
import { firstPartyFixture, lowerBrandThemeFixture } from "@tests/support/theme-lowering";
import {
  isBundledTenant,
  BUNDLED_TENANT_SLUGS,
} from '@/infrastructure/runtime/tenant/foundation/configuration/registry';
import { themanagementmiamiBrandTheme } from '@tests/fixtures/brand-themes/themanagementmiami';

const bithireBrandTheme = firstPartyFixture('bithire');
const evntoBrandTheme = firstPartyFixture('evnto');
const rottayBrandTheme = firstPartyFixture('rottay');

// ── Helpers ─────────────────────────────────────────────

/** Extract all CSS variable declarations from a CSS string. */
function extractVars(css: string): string[] {
  const matches = css.match(/--[\w-]+(?=\s*:)/g);
  return matches ? [...new Set(matches)] : [];
}

/** Check that a CSS string contains all expected variable prefixes. */
function expectVarPrefixes(css: string, prefixes: string[]) {
  const vars = extractVars(css);
  for (const prefix of prefixes) {
    const found = vars.some((v) => v.startsWith(prefix));
    expect(found, `expected CSS to contain vars starting with ${prefix}`).toBe(true);
  }
}

/** Read a first-party CSS file and return its content. */
function readTenantCss(tenant: string): string {
  const cssPath = resolve(
    process.cwd(),
    `src/foundation/tokens/css/facade/artifacts/${tenant}/index.css`
  );
  return readFileSync(cssPath, 'utf-8');
}

/**
 * Collapses the incidental whitespace a value carries from its source
 * formatting down to one canonical single-line form: internal line
 * breaks/indentation from a multi-line declaration are collapsed, and
 * spacing directly against a paren is removed. The whitespace around every
 * comma is normalized DETERMINISTICALLY to exactly one space after and none
 * before, regardless of what the source did — including a source with NO
 * space after the comma at all, e.g. `var(--ds-surface-inset,#ffffff)`.
 * That last rule is not optional: an earlier version of this function only
 * stripped space BEFORE a comma, so a perfectly valid, correctly-authored
 * declaration that simply omitted the space after its comma stayed
 * permanently mismatched against the canonical expected string — the same
 * false-negative class the line-anchored regex helper had, just moved one
 * layer down. Used only by `collectDeclarationValues` below; a value already
 * written in the canonical single-line form passes through unchanged.
 */
function normalizeDeclarationValue(rawValue: string): string {
  return rawValue
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/\(\s+/g, '(')
    .replace(/\s+\)/g, ')')
    .replace(/\s*,\s*/g, ', ');
}

/**
 * Collects every declaration for `property`, PARSED rather than pattern-
 * matched — see the "SECOND HARDENING" note on the `it` block below for the
 * regex-based helper this replaced (deleted, not merely retired) and why.
 * `walkDecls(property, ...)` only visits actual
 * Declaration nodes whose `prop` exactly equals `property`; PostCSS never
 * turns a CSS comment into a Declaration node, so an occurrence sitting
 * inside a comment contributes nothing to the result rather than a false
 * match. A value spread across several physical lines is one Declaration
 * with one `.value` to the parser regardless of its source line breaks, so
 * normalization only has to collapse incidental whitespace, never
 * reconstruct anything. Every occurrence is collected in document order —
 * including a duplicate declared again later in the file — so the caller
 * can assert on the count as well as the content; a single well-formed
 * declaration is exactly a one-element array.
 */
function collectDeclarationValues(css: string, property: string): string[] {
  const values: string[] = [];
  postcss.parse(css).walkDecls(property, (decl) => {
    values.push(normalizeDeclarationValue(decl.value));
  });
  return values;
}

// ── First-party tenants, compiled once ──────────────────
//
// This file used to hold `TenantConfig` objects (slug, branding, `vertical`)
// and compile them per test via the now-retired the retired runtime tenant-CSS generator. That
// generator resolved a `vertical` string, a legacy `branding` literal, and
// `includeDarkSelector` itself; `compileTheme` needs none of that -- it
// takes a BrandTheme and a slug and always emits both the base block and
// every authored mode block in one `cssString` (no `includeDarkSelector`
// toggle to thread through). Precomputed here once since compilation is pure
// and every test below only reads the result.

const COMPILED_BY_TENANT = {
  bithire: lowerBrandThemeFixture({ brandTheme: bithireBrandTheme, tenantSlug: 'bithire' }),
  evnto: lowerBrandThemeFixture({ brandTheme: evntoBrandTheme, tenantSlug: 'evnto' }),
  rottay: lowerBrandThemeFixture({ brandTheme: rottayBrandTheme, tenantSlug: 'rottay' }),
};

/**
 * The BASE block of a compiled theme, without its mode blocks.
 *
 * `cssString` is the base block followed by one block per authored mode,
 * joined by a blank line. Every assertion in this file is about what a
 * tenant's DEFAULT mode emits -- it is the successor of the retired
 * generator's `includeDarkSelector: false`, which is what these baselines were
 * captured against. Reading the whole string instead would collect a channel
 * twice whenever a mode legitimately restates it (bithire's dark overlay
 * authors its own `--ds-input-bg`), turning a per-block property into a
 * cross-block one and failing for a reason the assertion never described.
 *
 * Mode-block emission has its own coverage in `mode-block-ramps.test.ts` and
 * in the artifact renderer's `mode-blocks.test.ts`.
 */
const baseBlock = (css: string): string => css.split('\n\n')[0];

/**
 * A theme that AUTHORS what the first-party presets decide.
 *
 * D6-2c-ii (2026-09-15): tenant-document compiles over neutral + preset, so no
 * vertical authors chrome, a palette ramp or a personality family any more.
 * Every property in this file that needs an AUTHORING subject takes The
 * Management -- a real customer theme carried as a fixture -- rather than a
 * vertical that no longer has one.
 */
const THEMANAGEMENT = lowerBrandThemeFixture({
  brandTheme: themanagementmiamiBrandTheme,
  tenantSlug: 'themanagementmiami',
});
const THEMANAGEMENT_CSS = baseBlock(THEMANAGEMENT.cssString);

const CSS_BY_TENANT: Record<'bithire' | 'evnto' | 'rottay', string> = {
  bithire: baseBlock(COMPILED_BY_TENANT.bithire.cssString),
  evnto: baseBlock(COMPILED_BY_TENANT.evnto.cssString),
  rottay: baseBlock(COMPILED_BY_TENANT.rottay.cssString),
};

/**
 * Base block PLUS every mode block, for the one section that is explicitly
 * about how the two relate.
 */
const FULL_CSS_BY_TENANT: Record<'bithire' | 'evnto' | 'rottay', string> = {
  bithire: COMPILED_BY_TENANT.bithire.cssString,
  evnto: COMPILED_BY_TENANT.evnto.cssString,
  rottay: COMPILED_BY_TENANT.rottay.cssString,
};

// ══════════════════════════════════════════════════════════
// SECTION 1: Shared Pipeline Baseline
// These vars are generated by compileTheme() today.
// If any of these break, the shared pipeline regressed.
// ══════════════════════════════════════════════════════════

describe('shared pipeline: palette baseline', () => {
  // D6-2c-ii (2026-09-15): tenant-document compiles over neutral + preset. The
  // ramp is derived FROM a palette seed, and only bithire's preset carries one
  // (`palette.seeds`); rottay's and evnto's are structural, so they seed no
  // colour and the pipeline correctly derives no scale for them. The property
  // is the derivation, not the vertical, so it is graded where a seed exists --
  // here and on The Management below.
  it.each(['bithire', 'themanagementmiami'] as const)(
    '%s seeds a palette, so the pipeline generates its full primary color scale',
    (tenant) => {
      const css = tenant === 'bithire' ? CSS_BY_TENANT.bithire : THEMANAGEMENT_CSS;
      for (const step of [50, 100, 200, 300, 400, 500, 600, 700, 800, 900]) {
        expect(css).toContain(`--ds-color-primary-${step}`);
      }
    }
  );

  it.each(['evnto', 'rottay'] as const)(
    '%s seeds no palette, so no scale is invented for it',
    (tenant) => {
      // DECLARATIONS, not occurrences: both still READ a ramp step through the
      // sidebar tone (`var(--ds-color-primary-200)`), and a substring check
      // would call that a generated scale.
      const css = CSS_BY_TENANT[tenant];
      for (const step of [50, 100, 200, 300, 400, 500, 600, 700, 800, 900]) {
        expect(
          collectDeclarationValues(css, `--ds-color-primary-${step}`),
          `${tenant} declares --ds-color-primary-${step} with no palette seed`
        ).toEqual([]);
      }
    }
  );
});

// `--ds-personality-*` custom properties were the retired runtime tenant-CSS
// generator's OWN naming convention for the structured `personality` object
// -- a conversion `compileTheme` never re-implements. Its compiled
// `cssString` carries no `--ds-personality-*` declarations at all; the
// personality this compiler derives from brandTheme.motion/charts/chrome/
// typography is the STRUCTURED `result.personality` object instead, so this
// section now asserts that directly.
describe('shared pipeline: personality baseline', () => {
  // D6-2c-ii (2026-09-15): tenant-document compiles over neutral + preset. A
  // personality family is derived from what the THEME authors
  // (motion/charts/chrome/typography), and the three presets decide exactly one
  // of those -- `motion.dial`. So the vertical leg grades the one family they
  // decide and the emptiness of the other four, and the derivation itself is
  // graded on a theme that authors all four (The Management, here and in
  // `brand-compiler.test.ts`). Asserting emptiness rather than deleting the
  // rows is what stops a preset later deciding a chart or card posture and
  // nobody noticing.
  it.each(['bithire', 'evnto', 'rottay'] as const)(
    '%s generates the animation personality its preset decides',
    (tenant) => {
      const personality = COMPILED_BY_TENANT[tenant].personality;
      expect(personality.animation?.intensity).toBeDefined();
    }
  );

  it.each(['bithire', 'evnto', 'rottay'] as const)(
    '%s decides no chart, card, accent or typography personality',
    (tenant) => {
      const personality = COMPILED_BY_TENANT[tenant].personality;
      expect(personality.chart).toEqual({});
      expect(personality.card).toEqual({});
      expect(personality.accent).toEqual({});
      expect(personality.typography).toEqual({});
    }
  );

  it('derives every family for a theme that authors them', () => {
    const personality = THEMANAGEMENT.personality;
    expect(personality.animation?.intensity).toBeDefined();
    expect(personality.animation?.entrance).toBeDefined();
    expect(personality.chart?.lineStyle).toBeDefined();
    expect(personality.chart?.tooltipStyle).toBeDefined();
    expect(personality.card?.paddingDensity).toBeDefined();
    expect(personality.accent?.badgeShape).toBeDefined();
    expect(personality.typography?.headingLetterSpacing).toBeDefined();
  });
});

describe('shared pipeline: density baseline', () => {
  // D6-2c-ii (2026-09-15): tenant-document compiles over neutral + preset; the
  // posture is now the governed `density.mode` decision and reaches
  // `--ds-density-mode-factor`, where the retired themes authored the raw
  // `--ds-density-scale` dial (bithire 0.9, evnto 1.125). bithire decides
  // `compact` -> 0.85; rottay and evnto decide `normal` -> 1. Both channels are
  // asserted so the raw dial cannot quietly come back as a second spelling.
  it('bithire compiles its compact posture to the governed factor', () => {
    expect(CSS_BY_TENANT.bithire).toContain('--ds-density-mode-factor: 0.85');
    expect(CSS_BY_TENANT.bithire).toContain('--ds-density-scale: 1');
  });

  it('evnto compiles its normal posture to the governed factor', () => {
    expect(CSS_BY_TENANT.evnto).toContain('--ds-density-mode-factor: 1');
    expect(CSS_BY_TENANT.evnto).toContain('--ds-density-scale: 1');
  });
});

// ══════════════════════════════════════════════════════════
// SECTION 2: the chrome the COMPILED artifact carries
//
// This section used to snapshot the HANDWRITTEN first-party CSS, whose premise
// was "these premium vars exist in handwritten CSS but are NOT yet generated by
// the shared pipeline". That premise is void: a first-party vertical is the
// neutral foundation plus its preset document, the handwritten chrome is
// retired, and the pipeline is the only producer. So the receipts are re-anchored
// on what the pipeline PRODUCES, measured per artifact, and the chrome it does
// not produce is named rather than dropped.
//
// WO-DER-06 derivation-lane registry (2026-09-15, entries 11:24/12:41): sidebar
// geometry, the non-primary button variants, layout and shell chrome have no
// producer under neutral+preset. rottay and evnto are structural-neutral by
// owner scope (no palette seeds), so their palette-fed chrome has no subject at
// all; bithire seeds a palette and keeps the primary control chrome.
// ══════════════════════════════════════════════════════════

/** The tone-derived sidebar pair every vertical still compiles. */
const SIDEBAR_TONE_CHROME = [
  '--ds-sidebar-bg',
  '--ds-sidebar-text',
  '--ds-sidebar-item-color',
  '--ds-sidebar-item-bg-active',
] as const;

/** Chrome the retired authored themes supplied and no preset decision produces. */
const SIDEBAR_CHROME_WITHOUT_PRODUCER = [
  '--ds-sidebar-group-font-size',
  '--ds-sidebar-icon-size',
  '--ds-sidebar-border',
  '--ds-sidebar-width',
  '--ds-sidebar-collapsed-width',
  '--ds-sidebar-header-height',
  '--ds-sidebar-item-font-size',
  '--ds-sidebar-footer-bg',
] as const;

function expectVarPrefixesAbsent(css: string, prefixes: readonly string[]) {
  const vars = extractVars(css);
  for (const prefix of prefixes) {
    const found = vars.some((v) => v.startsWith(prefix));
    expect(found, `expected CSS NOT to contain vars starting with ${prefix}`).toBe(false);
  }
}

describe('first-party CSS baseline: sidebar vars', () => {
  it.each(['bithire', 'rottay', 'evnto'] as const)(
    '%s compiles the tone-derived sidebar pair',
    (tenant) => {
      expectVarPrefixes(readTenantCss(tenant), [...SIDEBAR_TONE_CHROME]);
    }
  );

  it.each(['bithire', 'rottay', 'evnto'] as const)(
    '%s carries no sidebar chrome the preset cannot produce',
    (tenant) => {
      // Reddens the day the derivation lane gives this family a producer, which
      // is the event the registration exists for.
      expectVarPrefixesAbsent(readTenantCss(tenant), SIDEBAR_CHROME_WITHOUT_PRODUCER);
    }
  );
});

describe('first-party CSS baseline: controls vars', () => {
  it('bithire compiles the primary button chrome its seed feeds', () => {
    const css = readTenantCss('bithire');
    // First-party CSS uses the same engine-consumed -color names as the shared pipeline.
    expectVarPrefixes(css, ['--ds-button-primary-bg', '--ds-button-primary-color']);
    expect(css).not.toContain('--ds-button-primary-text');
    expect(css).not.toContain('--ds-button-secondary-text');
  });

  it('bithire CSS has input chrome', () => {
    const css = readTenantCss('bithire');
    expectVarPrefixes(css, [
      '--ds-input-bg',
      '--ds-input-border',
      '--ds-input-border-focus',
    ]);
  });

  it('no vertical compiles a button variant beyond primary', () => {
    // The authored themes carried the secondary/default/ghost/success variants;
    // no preset decision produces them. Named, not dropped.
    for (const tenant of ['bithire', 'rottay', 'evnto'] as const) {
      expectVarPrefixesAbsent(readTenantCss(tenant), [
        '--ds-button-secondary-bg',
        '--ds-button-default-bg',
        '--ds-button-ghost-bg',
        '--ds-button-success-bg',
      ]);
    }
  });

  it('the structural-neutral verticals compile no palette-fed control chrome', () => {
    // rottay and evnto author no palette seeds by owner scope, so button and
    // input chrome has no subject on them at all.
    for (const tenant of ['rottay', 'evnto'] as const) {
      expectVarPrefixesAbsent(readTenantCss(tenant), [
        '--ds-button-primary-bg',
        '--ds-input-bg',
        '--ds-input-border',
      ]);
    }
  });
});

describe('first-party CSS baseline: table vars', () => {
  it('bithire compiles table header chrome from its seed', () => {
    expectVarPrefixes(readTenantCss('bithire'), ['--ds-table-header-bg']);
  });

  it('the structural-neutral verticals compile none', () => {
    expectVarPrefixesAbsent(readTenantCss('rottay'), ['--ds-table-header-bg']);
    expectVarPrefixesAbsent(readTenantCss('evnto'), ['--ds-table-header-bg']);
  });
});

describe('first-party CSS baseline: layout and shell vars', () => {
  it('no vertical compiles layout or shell chrome', () => {
    // rottay's authored theme was the only source of these; the pipeline has no
    // producer for either family.
    for (const tenant of ['bithire', 'rottay', 'evnto'] as const) {
      expectVarPrefixesAbsent(readTenantCss(tenant), [
        '--ds-layout-bg',
        '--ds-layout-header-bg',
        '--ds-layout-header-backdrop',
        '--ds-layout-sider-bg',
        '--ds-shell-grid-size',
        '--ds-shell-grid-line',
      ]);
    }
  });
});

// ══════════════════════════════════════════════════════════
// SECTION 3: Gap documentation
// Verify that the shared pipeline does NOT yet generate
// these categories — so we know what G1 needs to close.
// ══════════════════════════════════════════════════════════

describe('shared pipeline: chrome vars NOW generated (G1)', () => {
  const bithireCss = CSS_BY_TENANT.bithire;
  /**
   * D6-2c-ii (2026-09-15): tenant-document compiles over neutral + preset. This
   * section grades the SHARED PIPELINE's ability to lower `theme.chrome` into
   * `--ds-*` channels, so its subject has to be a theme that authors chrome.
   * rottay's and bithire's presets author none, so the families whose subject
   * was a first-party literal are re-anchored on The Management; the two
   * families bithire still reaches through its own decisions stay on bithire.
   */
  const authoredChromeCss = THEMANAGEMENT_CSS;

  it('an authored sidebar lowers to the sidebar vars, with correct values', () => {
    // The retired rottay theme carried this family (#0D0D10 / #ECECEC / 296px /
    // #A0A0A5, footer aliased to the ground). `--ds-sidebar-width` is not
    // asserted: it is a structural width no customer theme in the tree authors,
    // so there is no subject for it here.
    expect(authoredChromeCss).toContain('--ds-sidebar-bg: #FFFEFB');
    expect(authoredChromeCss).toContain('--ds-sidebar-text: #2E261C');
    expect(authoredChromeCss).toContain('--ds-sidebar-item-color: #5C4F3D');
    expect(authoredChromeCss).toContain('--ds-sidebar-footer-bg: #FBF3E7');
  });

  it('bithire generates button variant vars with correct values', () => {
    // A2-16 idiom (alias + resolution): the brand ground is authored once on
    // the cascade root and the button channel reads it, so the literal is
    // asserted where it is DECLARED, not duplicated on the channel.
    // D6-2c-ii (2026-09-15): tenant-document compiles over neutral + preset;
    // the seed moves #3A6FB0 -> #2F5BE8 (the preset's `palette.seeds.primary`)
    // and the ink resolves through `--ds-color-text-on-primary` instead of the
    // retired theme's `--ds-control-on-brand` leaf. The two SECONDARY channels
    // move to the authoring subject: bithire's preset authors no secondary
    // button chrome, so it emits neither.
    expect(bithireCss).toContain('--ds-button-primary-bg: var(--ds-color-primary)');
    expect(bithireCss).toContain('--ds-color-primary: #2F5BE8');
    expect(bithireCss).toContain('--ds-button-primary-color: var(--ds-color-text-on-primary)');
    expect(authoredChromeCss).toContain('--ds-button-secondary-color: #0F766E');
    expect(authoredChromeCss).toContain('--ds-button-secondary-border: #0F766E');
  });

  /**
   * R1 Cohort 1 — semantic migration of three pins, authorized 2026-08-05.
   *
   * WHY THEY MOVED. BitHire's field chrome used to author flat literals, and
   * those literals compile into the VERTICAL artifact, whose selector arm
   * `:where([data-ds-root][data-vertical='bithire'])` matches EVERY tenant in
   * the vertical. So they were not BitHire's paint, they were the whole
   * vertical's paint, and no tenant could reach them: --ds-input-border and
   * --ds-input-border-focus measured BYTE-IDENTICAL across two tenants whose
   * grounds already diverged. Rebasing each onto its governed authority is what
   * made the field group tenant-causal (now rgb(215,226,234) cool for BitHire
   * vs rgb(201,195,182) warm for The Management).
   *
   * WHY THIS IS STRONGER, NOT LOOSER. The old assertions pinned one literal and
   * said nothing about where it came from. Each replacement pins THREE facts:
   * the channel is emitted, it resolves through the named authority, and
   * BitHire's own value survives as the fallback so nothing moves for a tenant
   * that authors no inset surface. The negative assertion then forbids the
   * regression this round fought across eight separate instances — a channel
   * silently reverting to a bare literal — which no previous pin expressed.
   *
   * HARDENING (post-migration audit, historical). The pins above were not
   * line-anchored: `\s*` can cross newlines, so an unanchored regex could
   * theoretically be satisfied by text spanning a comment or trailing an
   * unrelated declaration. The three positive checks WENT THROUGH
   * `extractDeclarationValue`, which anchored to a single physical
   * declaration line (start of line, the exact property name, up to the
   * terminating `;`, end of line) and compared the extracted value for exact
   * string equality — strictly stronger than a substring `toMatch`, since
   * nothing could follow the pinned value on that line either. The negative
   * was also hex/rgba-specific, so `white`, `hsl(...)`, `color-mix(...)`, or
   * a gradient literal would have slipped through uncaught. It became generic
   * over shape: for these three properties, any declaration whose value did
   * not begin with `var(` failed, anchored the same way so it could not be
   * defeated by a comment or a neighboring line. `extractDeclarationValue`
   * itself no longer exists — see SECOND HARDENING immediately below for why
   * and for what replaced it; this paragraph is retained as history, not as
   * a description of the code currently in this file.
   *
   * SECOND HARDENING — POSTCSS MIGRATION (independent code audit veto, 2026-08-05). The
   * line-anchored regex above turned out to share the exact defect it was
   * hardened to fix: it pattern-matches a structured language instead of
   * parsing it. Three concrete holes, one root cause: `extractDeclarationValue`
   * ACCEPTED a declaration sitting inside a multi-line block comment, because
   * a regex has no concept of "inside a comment"; its negative counterpart
   * MISSED a bare value split across multiple physical lines and a duplicate
   * declaration re-declared later in the file, because a `^...$` per-line
   * anchor cannot see past one line; and by the same limitation a
   * legitimately multi-line `var(...)` declaration could itself fail the
   * anchor, so a CORRECT value read as a missing property.
   * `extractDeclarationValue` has been DELETED, not merely retired in place:
   * once this block moved to `collectDeclarationValues`, nothing else in the
   * file used it, and a known-defective helper left sitting in the file —
   * with its own documentation still describing it as the current approach —
   * is exactly the kind of stale, code-misdescribing comment this round has
   * already been corrected for twice. Removing it is the fix, not a
   * scope violation.
   *
   * `collectDeclarationValues` (above) replaces the anchor with an actual
   * `postcss.parse(...).walkDecls(property, ...)` parse. PostCSS never emits
   * a comment as a Declaration node, so a commented-out occurrence —
   * single-line or spanning multiple lines — contributes nothing to the
   * collected array rather than a false match. A value spread across
   * physical lines is one Declaration with one `.value` regardless of its
   * source line breaks, so `normalizeDeclarationValue` only has to collapse
   * incidental whitespace (including a comma with no space after it in the
   * source, which an earlier version of that normalizer still got wrong —
   * see its own doc comment) to reach the same string a single-line writing
   * would produce. Every occurrence — including a second, conflicting
   * declaration later in the file — is collected, in order, so the assertion
   * below is exact-ARRAY equality: a duplicate makes the array longer than
   * one element and fails on length alone; a commented-out or altogether
   * missing declaration makes it come up short; a wrong value fails on
   * content. All three failure shapes are one assertion, not three separate
   * regexes to keep in sync. The var()-shape check is kept as its own
   * explicit, separate assertion afterward — not merely implied by the three
   * expected strings happening to start with `var(` — so a future edit to
   * what these channels resolve to cannot silently drop authority-routing
   * coverage by coincidence, and it uses `startsWith`, not a substring test,
   * specifically because a value like
   * `color-mix(in srgb, var(--ds-surface-inset) 50%, white)` CONTAINS
   * `var(--ds-surface-inset)` as a nested reference — a substring check
   * would wrongly accept it as authority-routed when the declaration itself
   * is not. Every claim in this paragraph — comment-hiding (single- and
   * multi-line), multi-line normalization, the duplicate-declaration case,
   * the bare-literal case, the bare-multi-line-value case, and the
   * color-mix/startsWith case — is proven by a durable assertion inside the
   * `it` body below, not only by this prose.
   */
  it('bithire generates input vars through their governed authorities', () => {
    // D6-2c-ii (2026-09-15): tenant-document compiles over neutral + preset.
    // The three channels keep their law -- emitted, authority-routed, never a
    // bare literal -- and change which authority they route THROUGH, because
    // bithire's authored fallbacks went with the theme: the ground moves to the
    // governed input surface root, and the focus pair onto the border-focus
    // root the interaction floor owns.
    const INPUT_AUTHORITY_CHANNELS: Record<string, string> = {
      '--ds-input-bg': 'var(--ds-color-bg-input)',
      '--ds-input-border-focus': 'var(--ds-color-border-focus, var(--ds-color-primary))',
      '--ds-input-shadow-focus':
        '0 0 0 3px color-mix(in srgb, var(--ds-color-border-focus, var(--ds-color-primary)) 20%, transparent)',
    };

    // Exactly one declaration per channel, and it is exactly the governed
    // value. A duplicate (array length > 1), a commented-out declaration
    // (walkDecls never visits it, so the array comes up short rather than
    // falsely satisfied), and a multi-line-but-otherwise-correct value
    // (normalizes to the same one-element array a single-line writing would)
    // are all resolved by one array equality per channel.
    for (const [property, expected] of Object.entries(INPUT_AUTHORITY_CHANNELS)) {
      expect(collectDeclarationValues(bithireCss, property)).toEqual([expected]);
    }

    // Explicit, separate negative: every declaration collected for these
    // three properties — not only the value each is expected to equal today
    // — must be authority-routed through var(...). The channels must never
    // regress to a bare literal again in ANY shape (hex, rgb/rgba, hsl, a
    // named color, color-mix, a gradient, ...), not just the hex/rgba shapes
    // a prior regression happened to take, and this stays a real parse
    // rather than a resurrected regex.
    //
    // D6-2c-ii (2026-09-15): `--ds-input-shadow-focus` is now a `color-mix()`
    // OVER the governed root rather than a `var()` onto it, so the shape law is
    // stated as "the declaration names its authority and carries no bare
    // literal of its own" -- `startsWith('var(')` for the two aliases, and for
    // the mix, that it references the root and bakes no colour. The narrower
    // spelling would have failed a correct value, which is the false-negative
    // class the hardening notes above exist to prevent.
    const VAR_ROUTED = ['--ds-input-bg', '--ds-input-border-focus'];
    const collectedAcrossAllThree = Object.keys(INPUT_AUTHORITY_CHANNELS).flatMap((property) =>
      collectDeclarationValues(bithireCss, property).map((value) => ({ property, value }))
    );
    expect(collectedAcrossAllThree.length).toBeGreaterThan(0);
    expect(
      collectedAcrossAllThree.map(({ property, value }) => ({
        property,
        isVarAuthority: VAR_ROUTED.includes(property)
          ? value.startsWith('var(')
          : value.includes('var(--ds-color-border-focus') && !/#[0-9a-f]{3,8}/iu.test(value),
      }))
    ).toEqual(collectedAcrossAllThree.map(({ property }) => ({ property, isVarAuthority: true })));

    // ── Adversarial proofs, durable ──────────────────────────────────
    // Every fixture below is synthetic CSS run through the SAME
    // `collectDeclarationValues` used against the real generated stylesheet
    // above — not a parallel copy of the parsing logic that could silently
    // drift from what actually protects the pins. Each assertion states the
    // PRECISE result the parser must produce, not merely that it differs
    // from the governed value, so a failure here says exactly what broke.

    // (1) A declaration sitting inside a SINGLE-LINE comment contributes
    // nothing: PostCSS never turns a comment into a Declaration node, so
    // only the live literal below it is collected.
    expect(
      collectDeclarationValues(
        `:root {\n  /* --ds-input-bg: var(--ds-surface-inset, #ffffff); */\n  --ds-input-bg: #ffffff;\n}`,
        '--ds-input-bg'
      )
    ).toEqual(['#ffffff']);

    // (2) The same, but the comment spans MULTIPLE physical lines — the
    // exact shape of the regex hole this migration closed (`\s*` in the old
    // pattern could theoretically cross into a comment; here there is no
    // pattern to cross anything, only a parse that never emits one).
    expect(
      collectDeclarationValues(
        `:root {\n  /*\n   * legacy note:\n   * --ds-input-bg: var(--ds-surface-inset, #ffffff);\n   * superseded below\n   */\n  --ds-input-bg: #ffffff;\n}`,
        '--ds-input-bg'
      )
    ).toEqual(['#ffffff']);

    // (3) A CORRECT declaration written across multiple physical lines
    // normalizes to the exact canonical string a one-line writing would —
    // the false NEGATIVE the original line-anchored regex had. Asserted
    // against the governed constant, not a re-typed literal, so this proof
    // cannot silently drift from what the real check expects.
    expect(
      collectDeclarationValues(
        `:root {\n  --ds-input-border-focus: var(\n    --ds-color-border-focus,\n    var(--ds-color-primary)\n  );\n}`,
        '--ds-input-border-focus'
      )
    ).toEqual([INPUT_AUTHORITY_CHANNELS['--ds-input-border-focus']]);

    // (4) A duplicate declaration re-declared later in the file is a SECOND
    // array entry, not a silent overwrite — the exact-array equality above
    // fails on length, not merely on content.
    expect(
      collectDeclarationValues(
        `:root {\n  --ds-input-bg: var(--ds-color-bg-input);\n}\nhtml[data-tenant='drift'] {\n  --ds-input-bg: #eeeeee;\n}`,
        '--ds-input-bg'
      )
    ).toEqual([INPUT_AUTHORITY_CHANNELS['--ds-input-bg'], '#eeeeee']);

    // (5) A bare named colour is collected verbatim: it fails the governed
    // equality check and the var()-shape check the same way a hex or rgba
    // literal would.
    expect(collectDeclarationValues(`:root {\n  --ds-input-bg: white;\n}`, '--ds-input-bg')).toEqual([
      'white',
    ]);

    // (6) A BARE (non-var()) value split across multiple physical lines —
    // multi-line formatting alone must not make an incorrect value read as
    // correct just because normalization also collapses it to one line.
    expect(
      collectDeclarationValues(
        `:root {\n  --ds-input-shadow-focus: 0 0 0 3px\n    rgba(58, 111, 176, 0.16);\n}`,
        '--ds-input-shadow-focus'
      )
    ).toEqual(['0 0 0 3px rgba(58, 111, 176, 0.16)']);

    // (7) color-mix(...) CONTAINING a nested var() reference is collected
    // whole and fails the var()-shape check via `startsWith` — the sharp
    // case: a naive `.includes('var(')` would have wrongly passed it, since
    // the nested reference is a genuine substring of the value.
    const colorMixValues = collectDeclarationValues(
      `:root {\n  --ds-input-bg: color-mix(in srgb, var(--ds-surface-inset) 50%, white);\n}`,
      '--ds-input-bg'
    );
    expect(colorMixValues).toEqual(['color-mix(in srgb, var(--ds-surface-inset) 50%, white)']);
    expect(colorMixValues[0]?.startsWith('var(')).toBe(false);
    expect(colorMixValues[0]?.includes('var(')).toBe(true);

    // (8) The exact no-space-after-comma input the doc comments above
    // describe is proven here, through the same collectDeclarationValues path
    // the real pins use, not only asserted in prose. D6-2c-ii (2026-09-15):
    // it moves to the border-focus channel, because the governed input ground
    // is now a single-argument `var()` and a proof about comma normalization
    // needs a value that HAS a comma. Still asserted against the governed
    // constant rather than a re-typed literal, so it cannot drift.
    expect(
      collectDeclarationValues(
        `:root {\n  --ds-input-border-focus: var(--ds-color-border-focus,var(--ds-color-primary));\n}`,
        '--ds-input-border-focus'
      )
    ).toEqual([INPUT_AUTHORITY_CHANNELS['--ds-input-border-focus']]);
  });

  it('an authored layout lowers to the layout vars, with correct values', () => {
    // The retired rottay theme carried this family, aliasing the page ground to
    // --ds-color-bg-primary and the sider to --ds-sidebar-bg. The Management
    // authors its layout as literals, so the family is graded on the values it
    // declares; the ALIAS idiom itself is still graded on bithire, which routes
    // its button ground through the cascade root above.
    expect(authoredChromeCss).toContain('--ds-layout-bg: #FFFEFB');
    expect(authoredChromeCss).toContain('--ds-color-bg-primary: #FBF6EC');
    expect(authoredChromeCss).toContain('--ds-layout-header-bg: rgba(255, 254, 251, 0.90)');
    expect(authoredChromeCss).toContain('--ds-layout-sider-bg: #FFFEFB');
  });

  it('an authored shell lowers to the shell grid vars', () => {
    // No theme in the tree authors `chrome.shell` since the rottay theme was
    // retired (it carried 28px / rgba(255, 255, 255, 0.03)), so the family's
    // subject is authored here rather than dropped: the lowering is what is
    // under test, and it is the same call the provider makes for a DB tenant.
    const shell = brandThemeToChromeVariables({
      id: 'shell-probe',
      name: 'Shell probe',
      chrome: { shell: { gridSize: '28px', gridLine: 'rgba(255, 255, 255, 0.03)' } },
    });
    expect(shell['--ds-shell-grid-size']).toBe('28px');
    expect(shell['--ds-shell-grid-line']).toBe('rgba(255, 255, 255, 0.03)');
  });

  it('an authored table lowers to the table header vars', () => {
    // The retired rottay theme authored #131316 with its ink aliased to
    // --ds-color-text-page; The Management authors the family as literals, so
    // the ground, the ink and the weight are graded on it.
    expect(authoredChromeCss).toContain('--ds-table-header-bg: #FFFFFF');
    expect(authoredChromeCss).toContain('--ds-table-header-color: #5C4F3D');
    expect(authoredChromeCss).toContain('--ds-table-header-font-weight: 700');
  });

  it('bithire routes its table ground through the governed surface root', () => {
    // D6-2c-ii (2026-09-15): tenant-document compiles over neutral + preset;
    // the ground moves from the authored literal #f3f2ef to the secondary
    // surface root, and the authored `600` header weight goes with the theme --
    // the preset decides no table typography, so the channel is not emitted.
    expect(bithireCss).toContain('--ds-table-header-bg: var(--ds-color-bg-secondary)');
    expect(collectDeclarationValues(bithireCss, '--ds-table-header-font-weight')).toEqual([]);
  });

  it('DB-backed tenant with BrandTheme gets same chrome vars', () => {
    const css = lowerBrandThemeFixture({
      brandTheme: themanagementmiamiBrandTheme,
      tenantSlug: 'db-premium',
    }).cssString;
    expect(css).toContain('--ds-sidebar-bg: #FFFEFB');
    expect(css).toContain('--ds-layout-bg: #FFFEFB');
    expect(css).toContain('--ds-color-bg-primary: #FBF6EC');
    expect(css).toContain('--ds-table-header-bg: #FFFFFF');
    expect(css).toContain("html[data-tenant='db-premium']");
  });
});

// ══════════════════════════════════════════════════════════
// SECTION 4: Dark mode safety + variable naming correctness
// ══════════════════════════════════════════════════════════

// Rottay is dark-DEFAULT (appearance.defaultMode: 'dark'), which flips this
// section from its original framing: rottay's dark sidebar/layout chrome is
// the BASE block (no `[data-theme=...]` scoping needed, since dark IS the
// unscoped default), and its LIGHT chrome is the one authored as a
// `[data-theme='light']`-scoped mode-block overlay. The safety property is
// the same either way -- a mode's own chrome must not leak into the wrong
// block -- just checked against the tenant whose default mode this suite
// actually has (rottay), rather than assuming "dark" is always the overlay.
describe('mode blocks: chrome vars stay in their own scope', () => {
  it("rottay's dark (base, default) chrome is unscoped and does not appear inside the light mode block", () => {
    const css = FULL_CSS_BY_TENANT.rottay;
    const lightMatch = css.match(/\[data-theme='light'\][^{]*\{([^}]+)\}/s);
    expect(lightMatch, 'expected a compiled light mode block').not.toBeNull();
    const lightBlock = lightMatch![1];
    expect(lightBlock).not.toContain('--ds-sidebar-bg: #0D0D10');
    expect(lightBlock).not.toContain('--ds-color-bg-primary: #0C0C0E');
  });

  it("rottay's light mode block carries only what its mode DECIDES", () => {
    // D6-2c-ii (2026-09-15): tenant-document compiles over neutral + preset.
    // The retired theme authored a `modes.light` chrome overlay (#F4F4F3 ground
    // and #FAFAF9 page) and rottay's preset authors no mode overlay at all, so
    // the light block is now the colour-scheme switch and nothing else. The
    // scoping law it guards is unchanged and still asserted by its siblings:
    // whatever the block DOES carry stays inside it.
    const css = FULL_CSS_BY_TENANT.rottay;
    const lightMatch = css.match(/\[data-theme='light'\][^{]*\{([^}]+)\}/s);
    const lightBlock = lightMatch![1];
    expect(lightBlock).toContain('color-scheme: light');
    expect(lightBlock).not.toContain('--ds-sidebar-bg:');
    expect(lightBlock).not.toContain('--ds-layout-bg:');
  });

  it('the base block carries the vertical\'s decided chrome directly, unscoped', () => {
    // The sidebar tone is the one chrome family rottay's preset decides
    // (`navigation.sidebar-tone`), and it lands in the base block as an alias
    // onto the governed roots rather than as the retired theme's literals
    // (#0D0D10 / #0C0C0E / 28px grid, all of which went with the theme).
    const base = CSS_BY_TENANT.rottay;
    expect(base).toContain('--ds-sidebar-bg: var(--ds-color-bg-secondary)');
    expect(base).toContain('--ds-sidebar-text: var(--ds-color-text-primary)');
    expect(collectDeclarationValues(base, '--ds-shell-grid-size')).toEqual([]);
  });

  it("a channel the light overlay does NOT restate (shell.gridSize) is inherited, not duplicated in the light block", () => {
    // Only `chrome.shell.gridLine` is authored in rottay's modes.light
    // overlay, not `gridSize` -- so the light block must not carry
    // `--ds-shell-grid-size` at all; the base value cascades through.
    const css = FULL_CSS_BY_TENANT.rottay;
    const lightMatch = css.match(/\[data-theme='light'\][^{]*\{([^}]+)\}/s);
    const lightBlock = lightMatch![1];
    expect(lightBlock).not.toContain('--ds-shell-grid-size');
  });
});

describe('variable naming: engines consume --ds-button-*-color', () => {
  // D6-2c-ii (2026-09-15): tenant-document compiles over neutral + preset. The
  // law is a NAMING law -- whatever button ink a theme reaches is spelled
  // `-color`, never `-text` -- so it is stated over whatever each subject
  // actually emits. bithire's preset reaches the primary ink only; the
  // secondary, default and ghost variants need authored chrome, so the full
  // variant sweep moves to the theme that authors them.
  it('shared pipeline emits -color not -text for button text vars', () => {
    const css = CSS_BY_TENANT.bithire;
    expect(css).toContain('--ds-button-primary-color');
    expect(css).not.toContain('--ds-button-primary-text');
    expect(css).not.toContain('--ds-button-secondary-text');
  });

  it('an authored theme emits -color for all button variants', () => {
    const css = THEMANAGEMENT_CSS;
    expect(css).toContain('--ds-button-primary-color');
    expect(css).toContain('--ds-button-secondary-color');
    expect(css).toContain('--ds-button-default-color');
    expect(css).toContain('--ds-button-ghost-color');
    expect(css).not.toContain('--ds-button-primary-text');
  });

  it('no tenant emits a -text spelling on any button variant', () => {
    for (const css of [CSS_BY_TENANT.bithire, CSS_BY_TENANT.rottay, CSS_BY_TENANT.evnto, THEMANAGEMENT_CSS]) {
      expect(css).not.toMatch(/--ds-button-[a-z]+-text\s*:/u);
    }
  });
});

describe('dynamic tenant runtime chrome: scoped <style> path', () => {
  it('brandThemeToChromeVariables produces vars for scoped injection', () => {
    // This is what DesignSystemProvider uses to build the <style> tag
    // for dynamic tenants (skipCssLoading=false).
    // D6-2c-ii (2026-09-15): tenant-document compiles over neutral + preset, so
    // the subject is a theme that authors chrome. The retired rottay theme's
    // values (#0D0D10 sidebar, 28px shell grid, #131316 table) were what this
    // read before; a vertical now yields only the six sidebar-tone channels,
    // asserted below so the shrink is recorded rather than implied.
    const vars = brandThemeToChromeVariables(themanagementmiamiBrandTheme);
    expect(vars['--ds-sidebar-bg']).toBe('#FFFEFB');
    expect(vars['--ds-layout-bg']).toBe('#FFFEFB');
    expect(vars['--ds-button-primary-color']).toBe('#FFFEFB');
    expect(vars['--ds-table-header-bg']).toBe('#FFFFFF');
  });

  it('a vertical yields only the chrome its preset decides', () => {
    // rottay and bithire decide `navigation.sidebar-tone` and no other chrome,
    // so this call produces that family and nothing else -- each channel an
    // alias onto a governed root rather than a literal.
    for (const theme of [rottayBrandTheme, bithireBrandTheme]) {
      const vars = brandThemeToChromeVariables(theme);
      expect(Object.keys(vars).sort()).toEqual([
        '--ds-sidebar-bg',
        '--ds-sidebar-item-bg-active',
        '--ds-sidebar-item-bg-hover',
        '--ds-sidebar-item-color-active',
        '--ds-sidebar-text',
        '--ds-sidebar-text-muted',
      ]);
      for (const value of Object.values(vars)) expect(value).toMatch(/^var\(--ds-/u);
    }
  });

  it('scoped CSS string uses tenant selector (dark-mode safe)', () => {
    const vars = brandThemeToChromeVariables(themanagementmiamiBrandTheme);
    const entries = Object.entries(vars).filter(([, v]) => v != null);
    const declarations = entries.map(([k, v]) => `  ${k}: ${v};`).join('\n');
    const scopedCss = `html[data-tenant='db-customer'] {\n${declarations}\n}`;

    // Scoped selector — will NOT override dark-mode tenant CSS
    expect(scopedCss).toContain("html[data-tenant='db-customer']");
    expect(scopedCss).toContain('--ds-button-primary-bg: #0F766E');
    expect(scopedCss).toContain('--ds-sidebar-bg: #FFFEFB');
    // NOT inline on :root — proper specificity
    expect(scopedCss).not.toContain(':root');
  });

  it('dynamic tenant without brandTheme produces no chrome CSS', () => {
    // No brandTheme -> no chrome vars.
    const vars = brandThemeToChromeVariables({ id: '', name: '' });
    expect(Object.keys(vars).length).toBe(0);
  });
});

describe('DesignSystemProvider chrome injection logic', () => {
  // These tests verify the condition logic used by DesignSystemProvider
  // to decide when to pass generatedChromeCss to ThemeProvider.
  // The actual injection is: brandTheme exists AND tenant is NOT bundled.

  it('BUNDLED_TENANT_SLUGS matches CSS bundle (foundation/tokens/css/facade/artifacts/index.css)', () => {
    // Must include all tenants whose CSS is in the bundle
    expect(BUNDLED_TENANT_SLUGS.has('rottay')).toBe(true);
    expect(BUNDLED_TENANT_SLUGS.has('bithire')).toBe(true);
    expect(BUNDLED_TENANT_SLUGS.has('evnto')).toBe(true);
    // Customer tenants are never bundled or auto-registered. The Management
    // Miami is supplied explicitly from its published DB artifact in product
    // code and only from a checked-in fixture in regression tests.
    expect(BUNDLED_TENANT_SLUGS.has('themanagementmiami')).toBe(false);
    expect(BUNDLED_TENANT_SLUGS.size).toBe(3);
  });

  it('bundled tenants do NOT get generated chrome CSS', () => {
    expect(isBundledTenant('bithire')).toBe(true);
    expect(isBundledTenant('rottay')).toBe(true);
    expect(isBundledTenant('evnto')).toBe(true);
  });

  it('themanagementmiami is NOT bundled -- its explicit DB config gets generated chrome CSS', () => {
    expect(isBundledTenant('themanagementmiami')).toBe(false);
  });

  it('unknown DB tenants DO get generated chrome CSS', () => {
    expect(isBundledTenant('acme-corp')).toBe(false);
    expect(isBundledTenant('db-customer')).toBe(false);
  });

  it('the full condition: brandTheme + not-bundled = chrome CSS', () => {
    // Simulating the DesignSystemProvider condition:
    // normalizedConfig.brandTheme && !isBundledTenant(normalizedConfig.slug)

    // DB tenant with brandTheme -> gets chrome
    const dbWithBrand = { brandTheme: bithireBrandTheme, slug: 'acme-corp' };
    expect(!!dbWithBrand.brandTheme && !isBundledTenant(dbWithBrand.slug)).toBe(true);

    // Bundled tenant with brandTheme -> NO chrome (already in CSS)
    const bundledWithBrand = { brandTheme: bithireBrandTheme, slug: 'bithire' };
    expect(!!bundledWithBrand.brandTheme && !isBundledTenant(bundledWithBrand.slug)).toBe(false);

    // themanagementmiami (real brandTheme, not bundled) -> DOES get generated
    // chrome CSS, the same as any DB-driven tenant.
    const tmm = { brandTheme: themanagementmiamiBrandTheme, slug: 'themanagementmiami' };
    expect(!!tmm.brandTheme && !isBundledTenant(tmm.slug)).toBe(true);

    // DB tenant without brandTheme -> NO chrome (nothing to generate)
    const dbNoBrand = { brandTheme: undefined, slug: 'acme-corp' };
    expect(!!dbNoBrand.brandTheme && !isBundledTenant(dbNoBrand.slug)).toBe(false);
  });
});
