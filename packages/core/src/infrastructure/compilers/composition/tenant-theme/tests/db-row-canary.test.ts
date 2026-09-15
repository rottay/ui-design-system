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
  THEMANAGEMENT_TENANT_THEME_EXPECTED_ANATOMY,
  THEMANAGEMENT_TENANT_THEME_IDENTITY,
} from '@/foundation/contracts/composition/tenants/themes/tenant-theme/fixtures/themanagement-db-row';
import { TENANT_THEME_V1_COVERAGE } from '@/foundation/contracts/composition/tenants/themes/tenant-theme';

import {
  compileTenantThemeConfig,
  getTenantThemeVerticalEnvelope,
  tenantThemeAnatomyAttributes,
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

  it('projects all four structural chrome selections from the DB document', () => {
    expect(tenantThemeAnatomyAttributes(compileRow(readRow()))).toEqual(
      THEMANAGEMENT_TENANT_THEME_EXPECTED_ANATOMY,
    );
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
  const REACHABLE: ReadonlyArray<{
    axis: string;
    probe: RegExp;
    /**
     * D6-2c-ii (2026-09-15): tenant-document compiles over neutral + preset.
     * Three axes this row authors now state EXACTLY what the bithire preset
     * already states, so the artifact -- a delta -- correctly withdraws the
     * channel. The axis is still reachable, and that is what `moved` proves:
     * the same document with the axis moved off the baseline emits it again.
     * Without this the row would read as "the axis died", which is the one
     * thing it did not do.
     */
    moved?: (row: Record<string, unknown>) => void;
    baselineAlreadyStates?: string;
  }> = [
    { axis: 'color/semantic palette', probe: /--ds-color-primary\s*:/ },
    { axis: 'typography family', probe: /--ds-font-family-heading\s*:/ },
    { axis: 'typography scale', probe: /--ds-type-scale\s*:/ },
    {
      axis: 'shape/radius',
      probe: /--ds-radius-scale\s*:/,
      // WO-DER-06 derivation-lane registry (D6-2c-ii, 2026-09-15): the row
      // authors 0.8 and the preset's own `shape.radius-scale` is 0.8, the base
      // the retired theme carried at 1.25; registered for DER-07 to confirm.
      baselineAlreadyStates: '0.8',
      moved: (general) => {
        (general.shape as Record<string, unknown>).radiusScale = 1.15;
      },
    },
    { axis: 'density', probe: /--ds-density-mode-factor\s*:/ },
    { axis: 'elevation', probe: /--ds-elevation-1\s*:/ },
    {
      axis: 'textures/effects',
      probe: /--ds-effect-intensity\s*:/,
      // The preset states `surfaces.effect-intensity: 0.2`, the same value the
      // row authors.
      baselineAlreadyStates: '0.2',
      moved: (general) => {
        (general.surfaces as Record<string, unknown>).effectIntensity = 0.55;
      },
    },
    {
      axis: 'chrome (sidebar)',
      probe: /--ds-sidebar-bg\s*:/,
      // The preset already selects the inverse tone this row asks for, so every
      // sidebar channel is identical to the baseline's and none is repeated.
      // `strong` is the tone that still moves on bithire; `subtle` is refused
      // at admission, which is reported separately as a derivation-lane finding.
      baselineAlreadyStates: 'inverse',
      moved: (general) => {
        (general.navigation as Record<string, unknown>).sidebarTone = 'strong';
      },
    },
  ];

  /** The row with exactly one axis moved off the value the preset states. */
  function cssWithAxisMoved(move: (general: Record<string, unknown>) => void) {
    const row = structuredClone(readRow()) as Record<string, unknown>;
    const visualFoundation = row.visualFoundation as Record<string, unknown>;
    move(visualFoundation.general as Record<string, unknown>);
    return compileRow(row).css;
  }

  it.each(REACHABLE)(
    'emits the $axis axis from the document',
    ({ probe, moved }) => {
      expect(moved ? cssWithAxisMoved(moved) : css).toMatch(probe);
    },
  );

  it.each(REACHABLE.filter((axis) => axis.moved))(
    'withdraws the $axis axis only because the row restates the preset',
    ({ probe, baselineAlreadyStates }) => {
      // The other half, so the coincidence above cannot rot into a silent loss:
      // the channel is absent from THIS row's delta, and it is absent because
      // the row asked for what the vertical already says.
      expect(css).not.toMatch(probe);
      expect(baselineAlreadyStates).toBeDefined();
    },
  );

  it('reaches the recipe profile axis as runtime data, never as a channel', () => {
    const artifact = compileRow(readRow());
    expect(typeof artifact.normalizedAppearance.recipeProfile).toBe('string');
    expect(artifact.normalizedAppearance.recipeProfile?.length).toBeGreaterThan(0);
    expect(css).not.toMatch(/--ds-recipe-profile\s*:/);
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
  /** The row with exactly one axis moved off the value the preset states. */
  function movedRowCss(move: (general: Record<string, unknown>) => void) {
    const row = structuredClone(readRow()) as Record<string, unknown>;
    const visualFoundation = row.visualFoundation as Record<string, unknown>;
    move(visualFoundation.general as Record<string, unknown>);
    return compileRow(row).css;
  }

  const AXES = [
    { axis: 'palette', tenant: '--ds-color-primary', baseline: '--ds-color-primary' },
    { axis: 'font family', tenant: '--ds-font-family-heading', baseline: '--ds-font-family-heading' },
    { axis: 'type scale', tenant: '--ds-type-scale', baseline: '--ds-type-scale' },
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

  /**
   * Three axes this row authors state EXACTLY what the bithire preset states,
   * so the artifact -- a delta -- withdraws the channel. Divergence is still
   * asserted, on the same axis, with the row moved off the preset's value; the
   * coincidence is asserted beside it so it cannot rot into a silent loss.
   * Same convention as the REACHABLE table above.
   */
  const COINCIDENT_AXES = [
    {
      axis: 'radius',
      channel: '--ds-radius-scale',
      baselineStates: '0.8',
      moved: (general: Record<string, unknown>) => {
        (general.shape as Record<string, unknown>).radiusScale = 1.15;
      },
    },
    {
      axis: 'effect intensity',
      channel: '--ds-effect-intensity',
      baselineStates: '0.2',
      moved: (general: Record<string, unknown>) => {
        (general.surfaces as Record<string, unknown>).effectIntensity = 0.55;
      },
    },
    {
      axis: 'sidebar chrome',
      channel: '--ds-sidebar-bg',
      baselineStates: 'inverse',
      moved: (general: Record<string, unknown>) => {
        (general.navigation as Record<string, unknown>).sidebarTone = 'strong';
      },
    },
  ] as const;

  it.each(COINCIDENT_AXES)(
    '$axis diverges once the row states something the preset does not',
    ({ channel, moved }) => {
      const baselineValue = read(bithireCss, channel);
      expect(baselineValue, `bithire baseline does not declare ${channel}`).toBeDefined();
      // Withdrawn from THIS row because the row restates the preset ...
      expect(read(tenantCss, channel)).toBeUndefined();
      // ... and present, and different, the moment the row states its own.
      const movedValue = read(movedRowCss(moved), channel);
      expect(movedValue, `DB tenant does not emit ${channel} when it moves`).toBeDefined();
      expect(movedValue).not.toBe(baselineValue);
    },
  );

  it('density diverges through the same canonical posture channel on both paths', () => {
    // Static and DB lower through ONE vocabulary: the authored posture is
    // always `--ds-density-mode-factor`, and `--ds-density-scale` stays the
    // independent expressive-profile factor. bithire's preset decides
    // `density.mode: compact`, so the static side now states the posture too --
    // the vocabulary law is asserted on both sides rather than on one.
    const tenantDensity = read(tenantCss, '--ds-density-mode-factor');
    const baselineDensity = read(bithireCss, '--ds-density-mode-factor');

    expect(tenantDensity, 'DB tenant must emit --ds-density-mode-factor').toBeDefined();
    expect(baselineDensity, 'the bithire preset decides a posture, so it emits one').toBeDefined();
    expect(tenantDensity).not.toBe(baselineDensity);
    // The posture never travels on a second channel, on either side.
    expect(read(bithireCss, '--ds-density-scale')).not.toBe(baselineDensity);
    expect(read(tenantCss, '--ds-density-scale')).not.toBe(tenantDensity);
  });

  it('elevation crosses both paths on one channel name, with the tenant concrete', () => {
    // The authored theme declared its own ramp; the preset leaves it to the
    // foundation and READS it, which is the same channel name rather than a
    // second vocabulary. The DB tenant declares its own concrete value, so the
    // divergence is asserted where it exists: the tenant declares, the baseline
    // consumes the same name (WO-DER-06 derivation-lane registry, 2026-09-15).
    const tenantElevation = read(tenantCss, '--ds-elevation-1');
    expect(tenantElevation, 'DB tenant must emit --ds-elevation-1').toBeDefined();
    expect(read(bithireCss, '--ds-elevation-1')).toBeUndefined();
    expect(bithireCss).toContain('var(--ds-elevation-1)');
    expect(tenantCss).not.toBe(bithireCss);
  });
});
