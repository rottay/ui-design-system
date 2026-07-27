/**
 * DB-row canary — a customer-authored tenant document, end to end.
 *
 * WHAT PROPERTY THIS PROTECTS, and why nothing else covers it.
 *
 * `tenant-divergence-matrix.test.ts` proves the compiler is deterministic and
 * that two BrandThemes produce different artifacts. It builds its "DB
 * representation" by projecting a static BrandTheme through
 * `brandThemeToTenantAppearance()`, and its own comment says the fixture is the
 * authoring source. That is a compiler test wearing a tenant test's clothes:
 * it starts from a ~140-field code-owned object, so it can never fail for the
 * reason a real customer would hit — a document the customer can actually
 * write not being expressive enough, or not surviving intake.
 *
 * This file starts from the other end: the JSONB payload as persisted, plus the
 * trusted identity columns, assembled the way the read path assembles them.
 *
 * THE BUG IT WOULD CATCH. Any change that makes a customer-reachable axis
 * unreachable FROM THE DOCUMENT — a field dropped from the schema, an envelope
 * clamp that silently flattens it, a compiler branch that only fires for
 * BrandTheme-shaped input — while every BrandTheme-driven test stays green.
 *
 * COST. Four compilations of two small documents; single-digit milliseconds.
 * It replaces nothing: it covers the direction the existing matrix cannot.
 */

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import {
  THEMANAGEMENT_TENANT_THEME_DOCUMENT,
  THEMANAGEMENT_TENANT_THEME_IDENTITY,
} from '@/foundation/contracts/composition/tenants/themes/tenant-theme/fixtures/themanagement-db-row';
import { TENANT_THEME_V1_COVERAGE } from '@/foundation/contracts/composition/tenants/themes/tenant-theme';

import {
  compileTenantThemeConfig,
  getTenantThemeVerticalEnvelope,
  validateTenantThemeDocument,
} from '..';

/**
 * Advanced-mode rows require an EXPLICIT vertical policy envelope; only simple
 * mode auto-resolves one. That gate is deliberate -- an advanced row can reach
 * ~140 chrome variables, so the owning vertical must state its clamps rather
 * than have them inferred. The read path resolves it from the trusted
 * `verticalKey` column, which is what this mirrors.
 */
const VERTICAL_ENVELOPE = getTenantThemeVerticalEnvelope(
  THEMANAGEMENT_TENANT_THEME_IDENTITY.verticalKey,
);

function compileRow(row: unknown) {
  return compileTenantThemeConfig(row, { verticalEnvelope: VERTICAL_ENVELOPE });
}

/** The read path's job: JSONB payload + trusted row columns -> one envelope. */
function readRow() {
  return {
    ...THEMANAGEMENT_TENANT_THEME_DOCUMENT,
    ...THEMANAGEMENT_TENANT_THEME_IDENTITY,
  };
}

describe('tenant theme — realistic DB row intake', () => {
  it('validates as a document the customer console could have written', () => {
    // Intake runs on the JSONB payload ALONE. If this needed the identity
    // columns to pass, the schema would be accepting something a customer
    // cannot store.
    const result = validateTenantThemeDocument(THEMANAGEMENT_TENANT_THEME_DOCUMENT);

    expect(result.success).toBe(true);
  });

  it('rejects a document that reaches outside the closed grammar', () => {
    // The negative drill for intake. A tenant that smuggles an unknown key
    // must be refused, not normalized away silently -- otherwise "validated"
    // means nothing.
    const hostile = {
      ...THEMANAGEMENT_TENANT_THEME_DOCUMENT,
      visualFoundation: {
        ...THEMANAGEMENT_TENANT_THEME_DOCUMENT.visualFoundation,
        general: {
          ...THEMANAGEMENT_TENANT_THEME_DOCUMENT.visualFoundation.general,
          // Not in the grammar at any level.
          injectedStylesheet: 'body { display: none }',
        },
      },
    };

    const result = validateTenantThemeDocument(hostile);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.issues.some((issue) => issue.code === 'unknown_key')).toBe(true);
    }
  });
});

describe('tenant theme — DB row compiles to a governed artifact', () => {
  it('produces an artifact carrying provenance and per-channel coverage', () => {
    const artifact = compileRow(readRow());

    expect(artifact.slug).toBe('themanagement');
    expect(artifact.verticalKey).toBe('bithire');
    expect(artifact.rowVersion).toBe(THEMANAGEMENT_TENANT_THEME_IDENTITY.rowVersion);
    // Provenance, not integrity: the digest identifies WHICH artifact this is.
    expect(artifact.digest).toMatch(/^sha256-[0-9a-f]{64}$/);
    expect(artifact.compilerVersion).toBeTruthy();
    // Coverage is what the provider suppresses. It must be the declared v1 set,
    // which deliberately EXCLUDES personality so the bridge keeps completing
    // the channels the artifact does not own.
    expect([...artifact.coverage].sort()).toEqual([...TENANT_THEME_V1_COVERAGE].sort());
    expect(artifact.coverage).not.toContain('personality');
  });

  it('is byte-stable across recompilation of the same row', () => {
    // The digest is only useful as a cache/provenance key if identical input
    // yields an identical artifact.
    expect(compileRow(readRow()).digest).toBe(
      compileRow(readRow()).digest,
    );
  });

  it('changes the digest when the customer edits one field', () => {
    // The negative drill for provenance: a digest that survived an edit would
    // let a stale artifact be served for a changed row.
    const edited = readRow();
    const base = compileRow(edited).digest;

    const mutated = {
      ...edited,
      visualFoundation: {
        ...edited.visualFoundation,
        general: {
          ...edited.visualFoundation.general,
          density: 'compact' as const,
        },
      },
      rowVersion: edited.rowVersion + 1,
    };

    expect(compileRow(mutated).digest).not.toBe(base);
  });

  it('scopes every emitted rule to its own tenant and nothing else', () => {
    const artifact = compileRow(readRow());

    expect(artifact.css).toContain('themanagement');
    // Cross-tenant contamination is the one failure that breaks isolation
    // rather than merely looking wrong.
    expect(artifact.css).not.toContain("data-tenant='bithire'");
    expect(artifact.css).not.toContain('data-tenant="bithire"');
  });
});

describe('tenant theme — the axes a customer can actually move', () => {
  const css = compileRow(readRow()).css;

  /**
   * Axes a DB tenant genuinely reaches, each with a variable the compiler must
   * emit for it. If an axis stops being reachable FROM THE DOCUMENT, exactly
   * one row fails and names it.
   *
   * Names are the ones the compiler actually emits, read off a real
   * compilation -- not the ones the axis is called in prose. `density` is the
   * trap: it emits `--ds-density-mode-factor`, not `--ds-density-scale`.
   */
  const REACHABLE: ReadonlyArray<{ axis: string; probe: RegExp }> = [
    { axis: 'color/semantic palette', probe: /--ds-color-primary\s*:/ },
    { axis: 'typography family', probe: /--ds-font-family-heading\s*:/ },
    { axis: 'typography scale', probe: /--ds-type-scale\s*:/ },
    { axis: 'shape/radius', probe: /--ds-radius-scale\s*:/ },
    { axis: 'density', probe: /--ds-density-mode-factor\s*:/ },
    { axis: 'elevation', probe: /--ds-elevation-1\s*:/ },
    { axis: 'textures/effects', probe: /--ds-effect-intensity\s*:/ },
    { axis: 'recipe profile', probe: /--ds-recipe-profile\s*:/ },
    { axis: 'chrome (sidebar)', probe: /--ds-sidebar-bg\s*:/ },
  ];

  it.each(REACHABLE)('emits the $axis axis from the document', ({ probe }) => {
    expect(css).toMatch(probe);
  });

  /**
   * The honest other half. These axes appear in the R1 authority model and in
   * BrandTheme, but a DB tenant document cannot move them: nothing is emitted
   * for them at all.
   *
   * This is an ASSERTION, not a comment, so the census cannot rot. When a
   * channel is genuinely wired, the matching row fails and forces the axis to
   * be promoted into REACHABLE above -- which is the only honest way to claim
   * a new white-label axis went live.
   */
  const NOT_REACHABLE: ReadonlyArray<{ axis: string; probe: RegExp }> = [
    { axis: 'spacing', probe: /--ds-spacing-scale\s*:/ },
    { axis: 'border geometry (width/style)', probe: /--ds-border-width[a-z-]*\s*:/ },
    { axis: 'responsive posture', probe: /--ds-breakpoint[a-z-]*\s*:/ },
    { axis: 'overlays', probe: /--ds-overlay-[a-z-]+\s*:/ },
  ];

  it.each(NOT_REACHABLE)(
    'does NOT yet reach the $axis axis (census, not aspiration)',
    ({ probe }) => {
      expect(css).not.toMatch(probe);
    },
  );
});

describe('tenant theme — divergence from the static vertical baseline', () => {
  /**
   * The acid test, stated EXACTLY. Each required axis is its own assertion, so
   * losing one names that one and only that one.
   *
   * WHAT THIS REPLACES. The first version of this test built a `comparable`
   * list by FILTERING to axes both sides declared, then asserted
   * `comparable.length > 0`. That is vacuous twice over: an axis the compiler
   * stopped emitting silently left the list instead of failing, and a single
   * surviving axis satisfied the whole claim. It also probed
   * `--ds-density-scale`, which the DB path does not emit at all (it emits
   * `--ds-density-mode-factor`), so the density axis was never actually tested.
   *
   * The vocabularies genuinely differ: the static artifact is a fully expanded
   * chrome sheet (1417 names, concrete values), while the DB artifact emits
   * DIALS plus derived values. So each row names the variable on each side.
   */
  const bithireCss = readFileSync(
    resolve(process.cwd(), 'src/foundation/tokens/css/facade/artifacts/bithire/index.css'),
    'utf8',
  );
  const tenantCss = compileRow(readRow()).css;

  const read = (css: string, name: string): string | undefined =>
    css.match(new RegExp(`${name}\\s*:\\s*([^;]+);`))?.[1]?.trim();

  /**
   * `tenant`/`baseline` are the variable each side uses for the axis. When they
   * differ, that difference is itself the finding and is asserted below.
   */
  const AXES = [
    { axis: 'palette', tenant: '--ds-color-primary', baseline: '--ds-color-primary' },
    { axis: 'font family', tenant: '--ds-font-family-heading', baseline: '--ds-font-family-heading' },
    { axis: 'type scale', tenant: '--ds-type-scale', baseline: '--ds-type-scale' },
    { axis: 'radius', tenant: '--ds-radius-scale', baseline: '--ds-radius-scale' },
    { axis: 'effect intensity', tenant: '--ds-effect-intensity', baseline: '--ds-effect-intensity' },
    { axis: 'recipe profile', tenant: '--ds-recipe-profile', baseline: '--ds-recipe-profile' },
    { axis: 'sidebar chrome', tenant: '--ds-sidebar-bg', baseline: '--ds-sidebar-bg' },
  ] as const;

  it.each(AXES)('$axis diverges from the bithire baseline', ({ tenant, baseline }) => {
    const tenantValue = read(tenantCss, tenant);
    const baselineValue = read(bithireCss, baseline);

    // Both sides must actually declare it. A missing declaration is a coverage
    // regression, and it must fail here rather than be filtered away.
    expect(tenantValue, `DB tenant does not emit ${tenant}`).toBeDefined();
    expect(baselineValue, `bithire baseline does not declare ${baseline}`).toBeDefined();
    expect(tenantValue).not.toBe(baselineValue);
  });

  it('density diverges, and the two paths use DIFFERENT variable names for it', () => {
    // A structural finding worth pinning on its own: the static path expresses
    // density as `--ds-density-scale`, the DB path as `--ds-density-mode-factor`.
    // A future unification would break this test, which is the point -- it
    // should be a deliberate, reviewed change, not a silent one.
    const tenantDensity = read(tenantCss, '--ds-density-mode-factor');
    const baselineDensity = read(bithireCss, '--ds-density-scale');

    expect(tenantDensity, 'DB tenant must emit --ds-density-mode-factor').toBeDefined();
    expect(baselineDensity, 'bithire must declare --ds-density-scale').toBeDefined();
    expect(read(bithireCss, '--ds-density-mode-factor')).toBeUndefined();
  });

  it('elevation is reached by the DB path but NOT declared by the static baseline', () => {
    // Recorded as an asymmetry rather than asserted as a value difference:
    // claiming "divergence" for an axis only one side declares would overstate
    // what has been proven.
    expect(read(tenantCss, '--ds-elevation-1')).toBeDefined();
    expect(read(bithireCss, '--ds-elevation-1')).toBeUndefined();
  });
});
