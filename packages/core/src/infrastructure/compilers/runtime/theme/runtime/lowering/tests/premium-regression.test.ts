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
import { lowerBrandThemeFixture } from "@tests/support/theme-lowering";
import {
  isBundledTenant,
  BUNDLED_TENANT_SLUGS,
} from '@/infrastructure/runtime/tenant/foundation/configuration/registry';
import { bithireBrandTheme, evntoBrandTheme, rottayBrandTheme } from '@/foundation/tokens/ts/presentation/brand-themes';
import { themanagementmiamiBrandTheme } from '@tests/fixtures/brand-themes/themanagementmiami';

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
  it.each(['bithire', 'evnto', 'rottay'] as const)(
    '%s generates full primary color scale',
    (tenant) => {
      const css = CSS_BY_TENANT[tenant];
      for (const step of [50, 100, 200, 300, 400, 500, 600, 700, 800, 900]) {
        expect(css).toContain(`--ds-color-primary-${step}`);
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
  it.each(['bithire', 'evnto', 'rottay'] as const)(
    '%s generates animation personality',
    (tenant) => {
      const personality = COMPILED_BY_TENANT[tenant].personality;
      expect(personality.animation?.intensity).toBeDefined();
      expect(personality.animation?.entrance).toBeDefined();
    }
  );

  it.each(['bithire', 'evnto', 'rottay'] as const)(
    '%s generates chart personality',
    (tenant) => {
      const personality = COMPILED_BY_TENANT[tenant].personality;
      expect(personality.chart?.lineStyle).toBeDefined();
      expect(personality.chart?.tooltipStyle).toBeDefined();
    }
  );

  it.each(['bithire', 'evnto', 'rottay'] as const)(
    '%s generates card personality',
    (tenant) => {
      const personality = COMPILED_BY_TENANT[tenant].personality;
      expect(personality.card?.paddingDensity).toBeDefined();
    }
  );

  it.each(['bithire', 'evnto', 'rottay'] as const)(
    '%s generates accent personality',
    (tenant) => {
      const personality = COMPILED_BY_TENANT[tenant].personality;
      expect(personality.accent?.badgeShape).toBeDefined();
    }
  );

  it.each(['bithire', 'evnto', 'rottay'] as const)(
    '%s generates typography personality',
    (tenant) => {
      const personality = COMPILED_BY_TENANT[tenant].personality;
      expect(personality.typography?.headingLetterSpacing).toBeDefined();
    }
  );
});

describe('shared pipeline: density baseline', () => {
  it('bithire generates density scale from brandTheme', () => {
    expect(CSS_BY_TENANT.bithire).toContain('--ds-density-scale: 0.9');
  });

  it('evnto generates density scale from brandTheme', () => {
    // evnto brandTheme itself authors 1.125 (matching, but no longer routed
    // through, the evnto VerticalPreset's own 1.125 -- compileTheme
    // does not resolve `vertical: 'evnto'` internally any more; a caller who
    // wants the vertical baseline layered in passes it explicitly via
    // `verticalTokenOverrides`, exercised in `brand-compiler.test.ts`).
    expect(CSS_BY_TENANT.evnto).toContain('--ds-density-scale: 1.125');
  });
});

// ══════════════════════════════════════════════════════════
// SECTION 2: First-Party CSS Snapshot Baseline
// These premium vars exist in handwritten CSS but are NOT yet
// generated by the shared pipeline. When G1 completes, some
// of these should move to Section 1.
// ══════════════════════════════════════════════════════════

describe('first-party CSS baseline: sidebar vars', () => {
  it('bithire CSS has sidebar chrome', () => {
    const css = readTenantCss('bithire');
    expectVarPrefixes(css, [
      '--ds-sidebar-bg',
      '--ds-sidebar-text',
      '--ds-sidebar-item-color',
      '--ds-sidebar-item-bg-active',
      '--ds-sidebar-group-font-size',
      '--ds-sidebar-icon-size',
    ]);
  });

  it('rottay CSS has sidebar chrome', () => {
    const css = readTenantCss('rottay');
    expectVarPrefixes(css, [
      '--ds-sidebar-bg',
      '--ds-sidebar-border',
      '--ds-sidebar-width',
      '--ds-sidebar-collapsed-width',
      '--ds-sidebar-header-height',
      '--ds-sidebar-item-font-size',
      '--ds-sidebar-footer-bg',
    ]);
  });

  it('evnto CSS has sidebar chrome', () => {
    const css = readTenantCss('evnto');
    expectVarPrefixes(css, [
      '--ds-sidebar-bg',
      '--ds-sidebar-text',
      '--ds-sidebar-item-color',
      '--ds-sidebar-group-font-size',
    ]);
  });
});

describe('first-party CSS baseline: controls vars', () => {
  it('bithire CSS has button chrome', () => {
    const css = readTenantCss('bithire');
    // First-party CSS uses the same engine-consumed -color names as the shared pipeline.
    expectVarPrefixes(css, [
      '--ds-button-primary-bg',
      '--ds-button-primary-color',
      '--ds-button-secondary-bg',
      '--ds-button-secondary-color',
    ]);
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

  it('rottay CSS has full button variant chrome', () => {
    const css = readTenantCss('rottay');
    expectVarPrefixes(css, [
      '--ds-button-primary-bg',
      '--ds-button-secondary-bg',
      '--ds-button-default-bg',
      '--ds-button-ghost-bg',
      '--ds-button-success-bg',
    ]);
  });

  it('evnto CSS has button and input chrome', () => {
    const css = readTenantCss('evnto');
    expectVarPrefixes(css, [
      '--ds-button-primary-bg',
      '--ds-button-secondary-bg',
      '--ds-input-bg',
      '--ds-input-border',
    ]);
  });
});

describe('first-party CSS baseline: table vars', () => {
  it.each(['bithire', 'rottay', 'evnto'] as const)(
    '%s CSS has table header chrome',
    (tenant) => {
      const css = readTenantCss(tenant);
      expectVarPrefixes(css, ['--ds-table-header-bg']);
    }
  );
});

describe('first-party CSS baseline: layout vars', () => {
  it('rottay CSS has layout chrome', () => {
    const css = readTenantCss('rottay');
    expectVarPrefixes(css, [
      '--ds-layout-bg',
      '--ds-layout-header-bg',
      '--ds-layout-header-backdrop',
      '--ds-layout-sider-bg',
    ]);
  });
});

describe('first-party CSS baseline: shell vars', () => {
  it('rottay CSS has shell grid chrome', () => {
    const css = readTenantCss('rottay');
    expectVarPrefixes(css, [
      '--ds-shell-grid-size',
      '--ds-shell-grid-line',
    ]);
  });
});

// ══════════════════════════════════════════════════════════
// SECTION 3: Gap documentation
// Verify that the shared pipeline does NOT yet generate
// these categories — so we know what G1 needs to close.
// ══════════════════════════════════════════════════════════

describe('shared pipeline: chrome vars NOW generated (G1)', () => {
  const rottayCss = CSS_BY_TENANT.rottay;
  const bithireCss = CSS_BY_TENANT.bithire;

  it('rottay generates sidebar vars with correct values', () => {
    expect(rottayCss).toContain('--ds-sidebar-bg: #0D0D10');
    expect(rottayCss).toContain('--ds-sidebar-text: #ECECEC');
    expect(rottayCss).toContain('--ds-sidebar-width: 296px');
    expect(rottayCss).toContain('--ds-sidebar-item-color: #A0A0A5');
    // R-1 re-anchor (D-1b): F2.4 (8f58229e3) rewired the BASE footer ground
    // from the literal to the governed root; the base literal does not come
    // back. D-1b restitutes the LIGHT overlay (asserted below). Colour truth
    // kept the A2-16 way: the alias, and what the root resolves to.
    expect(rottayCss).toContain('--ds-sidebar-footer-bg: var(--ds-sidebar-bg)');
    expect(rottayCss).toContain('--ds-sidebar-bg: #0D0D10');
    // D-1b also restitutes the LIGHT overlay ground (#F4F4F3) so a tenant moving
    // --ds-sidebar-bg cannot govern light through the alias. Not asserted here:
    // this fixture holds only the base block (`html[data-tenant='rottay']`), and
    // the overlay lives in the mode block. The artifact carries it.
  });

  it('bithire generates button variant vars with correct values', () => {
    // A2-16 idiom (alias + resolution): the brand ground is authored once on
    // the cascade root and the button channel reads it, so the literal is
    // asserted where it is DECLARED, not duplicated on the channel.
    expect(bithireCss).toContain('--ds-button-primary-bg: var(--ds-color-primary)');
    expect(bithireCss).toContain('--ds-color-primary: #3A6FB0');
    // Same root, read with its authored literal as the in-place fallback --
    // the fallback is asserted verbatim so a silent widening is still red.
    expect(bithireCss).toContain('--ds-button-secondary-color: var(--ds-color-primary, #3A6FB0)');
    // Control ink and brand border route through the semantic control tokens.
    // The artifact extension used to override both here; R1-P moved the value
    // that actually shipped into the theme, so these are what production paints.
    expect(bithireCss).toContain('--ds-button-primary-color: var(--ds-control-on-brand)');
    expect(bithireCss).toContain('--ds-button-secondary-border: var(--ds-control-brand-border)');
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
    const INPUT_AUTHORITY_CHANNELS: Record<string, string> = {
      '--ds-input-bg': 'var(--ds-surface-inset, #ffffff)',
      '--ds-input-border-focus': 'var(--ds-material-control-border-active, #3A6FB0)',
      '--ds-input-shadow-focus':
        'var(--ds-material-control-focus-ring, 0 0 0 3px rgba(58, 111, 176, 0.16), 0 2px 8px rgba(20, 40, 59, 0.08))',
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
    const collectedAcrossAllThree = Object.keys(INPUT_AUTHORITY_CHANNELS).flatMap((property) =>
      collectDeclarationValues(bithireCss, property).map((value) => ({ property, value }))
    );
    expect(collectedAcrossAllThree.length).toBeGreaterThan(0);
    expect(
      collectedAcrossAllThree.map(({ property, value }) => ({
        property,
        isVarAuthority: value.startsWith('var('),
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
        `:root {\n  --ds-input-border-focus: var(\n    --ds-material-control-border-active,\n    #3A6FB0\n  );\n}`,
        '--ds-input-border-focus'
      )
    ).toEqual([INPUT_AUTHORITY_CHANNELS['--ds-input-border-focus']]);

    // (4) A duplicate declaration re-declared later in the file is a SECOND
    // array entry, not a silent overwrite — the exact-array equality above
    // fails on length, not merely on content.
    expect(
      collectDeclarationValues(
        `:root {\n  --ds-input-bg: var(--ds-surface-inset, #ffffff);\n}\nhtml[data-tenant='drift'] {\n  --ds-input-bg: #eeeeee;\n}`,
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
    // describe (`var(--ds-surface-inset,#ffffff)`) is proven here, through
    // the same collectDeclarationValues path the real pins use, not only
    // asserted in prose.
    expect(
      collectDeclarationValues(
        `:root {\n  --ds-input-bg: var(--ds-surface-inset,#ffffff);\n}`,
        '--ds-input-bg'
      )
    ).toEqual([INPUT_AUTHORITY_CHANNELS['--ds-input-bg']]);
  });

  it('rottay generates layout vars with correct values', () => {
    // Same A2-16 idiom as the sider ground below: the page ground is authored
    // on --ds-color-bg-primary and the layout channel reads it, which is what
    // lets the light mode block move one root instead of every channel.
    expect(rottayCss).toContain('--ds-layout-bg: var(--ds-color-bg-primary)');
    expect(rottayCss).toContain('--ds-color-bg-primary: #0C0C0E');
    expect(rottayCss).toContain('--ds-layout-header-bg: rgba(12, 12, 14, 0.82)');
    // R-1 re-anchor (D-1): F2.4 (a7929df5a) rewired the BASE sider ground from
    // the literal to the governed root; the base literal does not come back.
    // Assert the alias and what the root resolves to (A2-16 idiom).
    expect(rottayCss).toContain('--ds-layout-sider-bg: var(--ds-sidebar-bg)');
    expect(rottayCss).toContain('--ds-sidebar-bg: #0D0D10');
  });

  it('rottay generates shell vars with correct values', () => {
    expect(rottayCss).toContain('--ds-shell-grid-size: 28px');
    expect(rottayCss).toContain('--ds-shell-grid-line: rgba(255, 255, 255, 0.03)');
  });

  it('rottay generates table vars with correct values', () => {
    expect(rottayCss).toContain('--ds-table-header-bg: #131316');
    // The AUTHORED header ink, verbatim. The lifted `#B3B3B8` this once
    // expected was the retired runtime generator's output: that path ran
    // `enforceTextContrast` over its final composed map, so an ink that missed
    // the threshold against its own header ground was raised before shipping.
    // `compileTheme` does not autocorrect -- it compiles what the theme
    // says -- and the note beside the old expectation already recorded that
    // "the authored value still reaches the static artifact unchanged". With
    // the generator gone, the static value is the only one, and it is this.
    // R-1 re-anchor (D-1b): F4A-6 (3393f70d4) authored the --ds-color-text-page
    // root and rewired this BASE ink onto it, so the literal above is now the
    // ROOT's value, not the channel's. Same A2-16 idiom: alias + resolution.
    expect(rottayCss).toContain('--ds-table-header-color: var(--ds-color-text-page)');
    expect(rottayCss).toContain('--ds-color-text-page: #A0A0A5');
    // D-1b restitutes the LIGHT overlay ink (#6B6B6B) for the same reason; like
    // the sidebar footer it is not visible in this base-block fixture.
  });

  it('bithire generates table vars with correct values', () => {
    expect(bithireCss).toContain('--ds-table-header-bg: #f3f2ef');
    expect(bithireCss).toContain('--ds-table-header-font-weight: 600');
  });

  it('DB-backed tenant with BrandTheme gets same chrome vars', () => {
    const css = lowerBrandThemeFixture({ brandTheme: rottayBrandTheme, tenantSlug: 'db-premium' }).cssString;
    expect(css).toContain('--ds-sidebar-bg: #0D0D10');
    expect(css).toContain('--ds-layout-bg: var(--ds-color-bg-primary)');
    expect(css).toContain('--ds-color-bg-primary: #0C0C0E');
    expect(css).toContain('--ds-shell-grid-size: 28px');
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

  it("rottay's light mode block carries its OWN authored chrome", () => {
    const css = FULL_CSS_BY_TENANT.rottay;
    const lightMatch = css.match(/\[data-theme='light'\][^{]*\{([^}]+)\}/s);
    const lightBlock = lightMatch![1];
    expect(lightBlock).toContain('--ds-sidebar-bg: #F4F4F3');
    // The layout channel is not redeclared per mode: the light block moves the
    // root it reads, which is the whole point of routing it through the root.
    expect(lightBlock).toContain('--ds-color-bg-primary: #FAFAF9');
    expect(lightBlock).not.toContain('--ds-layout-bg:');
  });

  it('the base (dark) block carries the default chrome directly, unscoped', () => {
    const base = CSS_BY_TENANT.rottay;
    expect(base).toContain('--ds-sidebar-bg: #0D0D10');
    expect(base).toContain('--ds-layout-bg: var(--ds-color-bg-primary)');
    expect(base).toContain('--ds-color-bg-primary: #0C0C0E');
    expect(base).toContain('--ds-shell-grid-size: 28px');
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
  it('shared pipeline emits -color not -text for button text vars', () => {
    const css = CSS_BY_TENANT.bithire;
    // Engines consume --ds-button-primary-color, NOT --ds-button-primary-text
    expect(css).toContain('--ds-button-primary-color');
    expect(css).not.toContain('--ds-button-primary-text');
    expect(css).toContain('--ds-button-secondary-color');
    expect(css).not.toContain('--ds-button-secondary-text');
  });

  it('rottay pipeline emits -color for all button variants', () => {
    const css = CSS_BY_TENANT.rottay;
    expect(css).toContain('--ds-button-primary-color');
    expect(css).toContain('--ds-button-secondary-color');
    expect(css).toContain('--ds-button-default-color');
    expect(css).toContain('--ds-button-ghost-color');
    expect(css).not.toContain('--ds-button-primary-text');
  });
});

describe('dynamic tenant runtime chrome: scoped <style> path', () => {
  it('brandThemeToChromeVariables produces vars for scoped injection', () => {
    // This is what DesignSystemProvider uses to build the <style> tag
    // for dynamic tenants (skipCssLoading=false)
    const vars = brandThemeToChromeVariables(rottayBrandTheme);
    expect(vars['--ds-sidebar-bg']).toBe('#0D0D10');
    expect(vars['--ds-layout-bg']).toBe('var(--ds-color-bg-primary)');
    expect(vars['--ds-button-primary-color']).toBe('#0C0C0E');
    expect(vars['--ds-shell-grid-size']).toBe('28px');
    expect(vars['--ds-table-header-bg']).toBe('#131316');
  });

  it('scoped CSS string uses tenant selector (dark-mode safe)', () => {
    const vars = brandThemeToChromeVariables(bithireBrandTheme);
    const entries = Object.entries(vars).filter(([, v]) => v != null);
    const declarations = entries.map(([k, v]) => `  ${k}: ${v};`).join('\n');
    const scopedCss = `html[data-tenant='db-customer'] {\n${declarations}\n}`;

    // Scoped selector — will NOT override dark-mode tenant CSS
    expect(scopedCss).toContain("html[data-tenant='db-customer']");
    expect(scopedCss).toContain('--ds-button-primary-bg: var(--ds-color-primary)');
    expect(scopedCss).toContain('--ds-sidebar-bg: #ffffff');
    expect(scopedCss).toContain('--ds-command-home-panel-border: #A9C9EA');
    expect(scopedCss).toContain('--ds-command-home-meter-fill: linear-gradient(90deg, #315F86, #6F98BC)');
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
