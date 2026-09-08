/**
 * @fileoverview The v2 decision document, named through the PUBLIC server entrypoint.
 *
 * The v2 door already has a suite; it imports the owners directly and proves the
 * lowering. This one proves the other half: that a consumer outside this package
 * can NAME the document, the decisions, both fail-closed errors, the admission
 * and the migration, and that the names it gets still converge on the one
 * `ThemeIntent` and the one `compileThemeIntent`.
 *
 * The load-bearing assertions are the last three. A published name that produced
 * a second patch, a second admission answer or a second compile route would be a
 * reachable API and still a broken contract, so the surface is checked by what it
 * COMPILES TO -- byte-identical CSS against the v1 equivalent -- and by what it
 * refuses to publish at all.
 */

import { describe, expect, it } from 'vitest';

import * as server from '../../../../src/entrypoints/server';
import {
  CHROME_ANATOMY_FAMILIES,
  EXPRESSIVE_AXIS_KEYS,
  KEPT_THEME_DECISION_IDS,
  MOTION_DIAL_KEYS,
  NEW_THEME_DECISION_IDS,
  PALETTE_SEED_ROLES,
  PALETTE_STATUS_SEED_ROLES,
  TENANT_THEME_DOCUMENT_VERSION_V2,
  THEME_DECISION_BOUNDS,
  THEME_DECISION_IDS,
  THEME_DECISION_TIERS,
  THEME_DECISION_TIER_BY_ID,
  THEME_PLANS,
  THEME_PLAN_TIERS,
  TYPOGRAPHY_FAMILY_ROLES,
  TenantThemeDocumentV2Error,
  ThemePatchMigrationError,
  activatedDecisionIds,
  admitDocument,
  assertTenantThemeDocumentV2,
  compileThemeIntent,
  documentThemeAdmission,
  documentThemeIntent,
  emitThemeCss,
  isTenantThemeDocumentV2,
  migrateAndAdmitDocument,
  migrateDocumentV1ToV2,
  previewThemeAdmission,
  previewThemeIntent,
  tenantArtifactScope,
} from '../../../../src/entrypoints/server';
import type {
  ChromeAnatomy,
  DecisionProjection,
  DensityMode,
  DocumentAdmission,
  ExpressiveProfiles,
  MotionDial,
  PaletteDarkMode,
  PaletteSeeds,
  PaletteStatusSeeds,
  SanctionedOverrides,
  TenantThemeDocument,
  TenantThemeDocumentAny,
  TenantThemeDocumentV1,
  TenantThemeDocumentV2,
  ThemeDecisionId,
  ThemeDecisions,
  ThemeIntent,
  ThemePlan,
  TypographyFamilies,
  UnlitReason,
} from '../../../../src/entrypoints/server';

const PRIMARY = '#4F46E5';

const v1Seeds = (primary: string): TenantThemeDocumentV1 =>
  ({
    schemaVersion: 1,
    mode: 'simple',
    appearance: { palette: { primary } },
  }) as unknown as TenantThemeDocument;

const v2 = (
  decisions: TenantThemeDocumentV2['decisions'],
  plan: ThemePlan = 'standard'
): TenantThemeDocumentV2 => ({ version: 2, plan, decisions });

const cssOf = (intent: ThemeIntent) =>
  emitThemeCss(
    compileThemeIntent(intent).compiled,
    tenantArtifactScope('rottay', 'acme')
  );

describe('tenant document v2 is nameable through @rottay/design-system/server', () => {
  it('publishes the closed 29-row kit, its tiers and its plans', () => {
    expect(THEME_DECISION_IDS).toHaveLength(29);
    expect(Object.keys(THEME_DECISION_TIER_BY_ID)).toHaveLength(29);
    expect(NEW_THEME_DECISION_IDS).toHaveLength(10);
    expect(KEPT_THEME_DECISION_IDS).toHaveLength(19);
    expect(TENANT_THEME_DOCUMENT_VERSION_V2).toBe(2);
    expect(THEME_DECISION_BOUNDS['typography.scale']).toBeDefined();
    for (const keySet of [
      PALETTE_SEED_ROLES,
      PALETTE_STATUS_SEED_ROLES,
      TYPOGRAPHY_FAMILY_ROLES,
      MOTION_DIAL_KEYS,
      EXPRESSIVE_AXIS_KEYS,
      CHROME_ANATOMY_FAMILIES,
    ]) {
      expect(keySet.length).toBeGreaterThan(0);
    }
  });

  it('keeps `internal` a PLAN, never a third customer tier', () => {
    expect([...THEME_DECISION_TIERS]).toEqual(['standard', 'pro']);
    expect([...THEME_PLANS]).toEqual(['standard', 'pro', 'internal']);
    expect([...THEME_PLAN_TIERS.internal]).toEqual(['standard', 'pro']);
    expect([...THEME_PLAN_TIERS.pro]).toEqual(['standard', 'pro']);
    expect([...THEME_PLAN_TIERS.standard]).toEqual(['standard']);
  });

  it('names, narrows and reports a v2 document', () => {
    const document = v2({ 'palette.seeds': { primary: PRIMARY } });
    expect(isTenantThemeDocumentV2(document)).toBe(true);
    expect(assertTenantThemeDocumentV2(document)).toBe(document);
    expect([...activatedDecisionIds(document)]).toEqual(['palette.seeds']);
  });

  it('refuses a raw --ds-* override by its path, with the v2 error (D-03)', () => {
    const laundered = {
      version: 2,
      plan: 'pro',
      decisions: {},
      overrides: { chrome: { cardComponent: { '--ds-color-primary': 'red' } } },
    };
    expect(() => assertTenantThemeDocumentV2(laundered)).toThrow(
      TenantThemeDocumentV2Error
    );
    expect(() => assertTenantThemeDocumentV2(laundered)).toThrow(
      /raw channel "--ds-color-primary"/u
    );
  });

  it('refuses a Pro override under a Standard plan, naming the tier', () => {
    expect(() =>
      assertTenantThemeDocumentV2({
        version: 2,
        plan: 'standard',
        decisions: {},
        overrides: { chrome: { cardComponent: { bg: '#fff' } } },
      })
    ).toThrow(/tier pro; plan standard entitles standard/u);
  });

  it('reports what an activated decision moved, and what it did not', () => {
    const lit = admitDocument({
      vertical: 'rottay',
      document: v2({ 'palette.seeds': { primary: PRIMARY } }),
    });
    expect(lit.version).toBe(2);
    expect(lit.decisions).toHaveLength(1);
    expect(lit.decisions[0]?.lit).toBe(true);
    expect(lit.unlit).toHaveLength(0);

    // `states.emphasis` is lit since WO-DER-02; the unlit arm reads a decision
    // the catalog still gives no keypath.
    const alsoLit = admitDocument({
      vertical: 'rottay',
      document: v2({ 'states.emphasis': 'strong' }),
    });
    expect(alsoLit.unlit).toHaveLength(0);
    expect(alsoLit.decisions[0]?.keypaths).toEqual([
      'appearance.general.states.emphasis',
    ]);

    const unlit = admitDocument({
      vertical: 'rottay',
      document: v2({ 'surfaces.border-style': 'hairline' }),
    });
    expect(unlit.unlit.map((projection) => projection.id)).toEqual([
      'surfaces.border-style',
    ]);
    expect(unlit.unlit[0]?.reason).toBe('no-keypath-today');
  });

  it('carries the SAME intent the two producers build, and one patch per document', () => {
    const document = v2({ 'palette.seeds': { primary: PRIMARY } });
    const persisted = documentThemeAdmission({
      vertical: 'rottay',
      slug: 'acme',
      document,
    });
    const preview = previewThemeAdmission({
      vertical: 'rottay',
      slug: 'acme',
      document,
    });

    expect(persisted.intent).toEqual(
      documentThemeIntent({ vertical: 'rottay', slug: 'acme', document })
    );
    expect(preview.intent).toEqual(
      previewThemeIntent({ vertical: 'rottay', slug: 'acme', document })
    );
    expect(persisted.intent.origin).toBe('tenant-document');
    expect(preview.intent.origin).toBe('preview');
    expect(persisted.admission.patch).toEqual(preview.admission.patch);
  });

  it('compiles through the one door to the same bytes as the v1 equivalent', () => {
    const { intent } = documentThemeAdmission({
      vertical: 'rottay',
      slug: 'acme',
      document: v2({ 'palette.seeds': { primary: PRIMARY } }),
    });
    const css = cssOf(intent);
    expect(css).toContain('--ds-color-primary');
    expect(css).toBe(
      cssOf(
        documentThemeIntent({
          vertical: 'rottay',
          slug: 'acme',
          document: v1Seeds(PRIMARY),
        })
      )
    );
  });

  it('publishes the migration as reachable, total and fail-closed by name', () => {
    const migrated = migrateDocumentV1ToV2(v1Seeds(PRIMARY));
    expect(migrated.version).toBe(2);
    expect(migrated.plan).toBe('standard');
    expect(migrated.decisions['palette.seeds']?.primary).toBe(PRIMARY);

    const admitted = migrateAndAdmitDocument({
      vertical: 'bithire',
      document: v1Seeds(PRIMARY),
    });
    expect(admitted.migrated.version).toBe(2);
    expect(admitted.version).toBe(2);

    const unmigratable = {
      schemaVersion: 1,
      mode: 'advanced',
      visualFoundation: {
        advanced: { tokenOverrides: { '--ds-shadow-card': '0 0 0' } },
      },
    } as unknown as TenantThemeDocument;
    expect(() => migrateDocumentV1ToV2(unmigratable)).toThrow(
      ThemePatchMigrationError
    );
    expect(() => migrateDocumentV1ToV2(unmigratable)).toThrow(
      /--ds-shadow-card/u
    );
  });

  it('does NOT publish a patch-level route around the intent', () => {
    for (const internal of [
      'documentAnyThemePatch',
      'projectDecisionsToV1',
      'v1KeypathOf',
    ]) {
      expect(server).not.toHaveProperty(internal);
    }
  });
});

/**
 * The type half of the same surface: a consumer that cannot NAME the shapes it
 * persists writes them structurally and drifts. Checked by `typecheck:tests`.
 */
describe('the v2 contract types are nameable from the same entrypoint', () => {
  it('types a complete document, its decisions and its admission', () => {
    const seeds: PaletteSeeds = { primary: PRIMARY };
    const status: PaletteStatusSeeds = { success: '#0a0' };
    const families: TypographyFamilies = {
      base: 'humanist-text',
      heading: 'editorial-display',
    };
    const dial: MotionDial = { intensity: 1 };
    const anatomy: ChromeAnatomy = { table: 'zebra', cardComponent: 'framed' };
    const profiles: ExpressiveProfiles = {};
    const dark: PaletteDarkMode = 'auto';
    const density: DensityMode = 'spacious';
    const overrides: SanctionedOverrides = {
      chrome: { cardComponent: { bg: '#fff' } },
    };
    const decisions: Partial<ThemeDecisions> = {
      'palette.seeds': seeds,
      'palette.status-seeds': status,
      'typography.families': families,
      'motion.dial': dial,
      'chrome.anatomy': anatomy,
      'profiles.expressive': profiles,
      'palette.dark-mode': dark,
      'density.mode': density,
    };
    const document: TenantThemeDocumentV2 = {
      version: 2,
      plan: 'internal',
      decisions,
      overrides,
    };
    const either: TenantThemeDocumentAny = document;
    const ids: readonly ThemeDecisionId[] = activatedDecisionIds(document);
    const admission: DocumentAdmission = admitDocument({
      vertical: 'rottay',
      document: either,
    });
    const projections: readonly DecisionProjection[] = admission.unlit;
    const reason: UnlitReason | undefined = projections[0]?.reason;

    expect(ids.length).toBeGreaterThan(0);
    expect(admission.version).toBe(2);
    expect(reason ?? 'no-keypath-today').toBeTypeOf('string');
  });
});
