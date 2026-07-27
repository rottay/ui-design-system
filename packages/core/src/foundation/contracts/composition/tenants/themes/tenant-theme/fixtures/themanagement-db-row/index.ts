/**
 * The Management — a REALISTIC tenant theme row, authored in the DB contract.
 *
 * WHY THIS EXISTS. Every "DB tenant" proof in the tree until now built its
 * payload by projecting a static `BrandTheme` fixture through
 * `brandThemeToTenantAppearance()`. That proves the compiler is deterministic;
 * it does NOT prove a customer can express a distinct product through the
 * document a customer actually writes. The projection starts from a ~140-field
 * code-owned object and narrows; a customer starts from an empty JSONB row and
 * fills in the handful of fields the console exposes. Those are different
 * experiments, and only the second one answers "can a DB tenant look like a
 * different system?".
 *
 * So this fixture is authored FORWARD, in the document's own vocabulary:
 * `TenantThemeAdvancedDocument`, the exact JSONB payload the tenancy row
 * stores, plus the trusted identity columns the read path supplies. Nothing is
 * derived from `themanagementmiami`'s BrandTheme — that file supplied the
 * DESIGN INTENT (Art Deco geometry, warm earth palette, editorial serif), and
 * the values below are its expression through the customer-facing contract.
 *
 * WHAT IT IS NOT. Not a runtime tenant: it is never registered in
 * KNOWN_TENANTS, never compiled into a shipped CSS bundle, and never a second
 * source of truth for identity. It is a test/canary specimen, exactly like the
 * BrandTheme fixture beside it, and it must stay explicit-only.
 *
 * WHAT IT PROVES when compiled through `compileTenantTheme`:
 * 1. The document validates against the closed schema (fail-closed intake).
 * 2. Every axis a customer can reach is reachable from the DOCUMENT, not only
 *    from a BrandTheme.
 * 3. The resulting artifact diverges from bithire's static baseline on the
 *    axes a human perceives first — type, radius, density, elevation, motion,
 *    chrome — while sharing one component tree.
 *
 * DIVERGENCE IS DELIBERATE AND ORTHOGONAL TO BITHIRE. Per the owner decision
 * of 2026-07-09 there is no convergence requirement between tenants in the
 * same vertical. Where bithire is cool, bordered, sans and operational, this
 * row is warm, shadow-led, serif and editorial.
 */

import type {
  TenantThemeAdvancedDocument,
  TenantThemeConfigIdentity,
} from '../..';
import { TENANT_THEME_SCHEMA_VERSION } from '../..';

/**
 * The JSONB payload exactly as it would be persisted in the tenant theme row.
 *
 * `mode: 'advanced'` because the row exercises `recipeProfile` and a chrome
 * section; a `simple` row would carry only `appearance`. Identity and
 * `rowVersion` are deliberately ABSENT — they are trusted row columns, not
 * customer-writable JSON, and the contract keeps them out of the document so a
 * customer can never restate them.
 */
export const THEMANAGEMENT_TENANT_THEME_DOCUMENT: TenantThemeAdvancedDocument =
  {
    schemaVersion: TENANT_THEME_SCHEMA_VERSION,
    mode: 'advanced',
    visualFoundation: {
      general: {
        palette: {
          // Gulf teal / sandstone / terracotta against bithire's cool blues.
          primary: '#1F6F6B',
          secondary: '#B08D57',
          accent: '#C4633F',
          background: '#FBF8F3',
          foreground: {
            primary: '#2E261C',
            secondary: '#5A4E3F',
            muted: '#8A7A66',
            disabled: '#B5A894',
          },
          border: {
            primary: '#9B8A73',
            secondary: '#D9CDBA',
          },
          backgroundMode: 'light',
        },
        typography: {
          // Editorial serif display is the fastest-perceived divergence from
          // bithire's system sans. `typePairing` is the governed preset; the
          // explicit families win over it and are stated for determinism.
          typePairing: 'editorial',
          fontFamilyHeading: "'Fraunces', Georgia, 'Times New Roman', serif",
          fontFamilyBase:
            "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          scale: 1.04,
        },
        shape: {
          // Deco-crisp: the tightest radius ramp the envelope allows.
          //
          // FINDING (R1.1, 2026-07-26): numeric axes are clamped TWICE -- by
          // the global schema ([0.75, 1.25] here) and again, more tightly, by
          // the owning vertical envelope. Authored values of 0.72 and then 0.75
          // were both REJECTED; bithire allows only [0.8, 1.2].
          //
          // That second clamp is the real bound on white-label reach. For a
          // bithire tenant the numeric axes move by at most:
          //   typeScale  +/- 8%    radiusScale +/- 20%
          //   density    +/- 15%   effectIntensity 0..0.65
          // Those ranges are subtle by construction, so a "different system"
          // impression cannot come from geometry. It has to come from palette,
          // font family and chrome -- which is precisely why the platform reads
          // today as one product re-skinned rather than two systems.
          buttonStyle: 'sharp',
          radiusScale: 0.8,
        },
        density: 'spacious',
        surfaces: {
          // Shadow-led separation rather than bithire's border-led flatness.
          elevation: 'elevated',
          // The bithire envelope ceiling; 0.68 was rejected.
          effectIntensity: 0.65,
        },
        navigation: {
          sidebarTone: 'inverse',
        },
      },
      // A governed SELECTION, not a definition: the compiler validates this id
      // against the closed first-party registry and drops anything unknown.
      // An authored 'editorial' was REJECTED -- ids are versioned and namespaced.
      //
      // FINDING (R1.1, 2026-07-26): the registry holds exactly TWO profiles,
      // `rottay/technical-sharp@1` and `rottay/editorial-round@1`. Neither
      // matches this tenant exactly (it wants editorial TYPE with sharp
      // GEOMETRY), so the recipe-profile axis cannot express the combination.
      // The editorial profile is selected because the profile governs
      // composition and type recipes, while the sharp geometry is already
      // carried by `shape.buttonStyle` + `radiusScale`.
      recipeProfile: 'rottay/editorial-round@1',
    },
  };

/**
 * The trusted row columns the read path supplies alongside the JSONB payload.
 *
 * Kept separate from the document on purpose: joining them is the reader's
 * job, and a test that hands the compiler one object must be seen to have
 * assembled it from the two halves the database actually stores.
 */
export const THEMANAGEMENT_TENANT_THEME_IDENTITY: TenantThemeConfigIdentity = {
  tenantId: '3f1a9c52-7b4e-4d18-9a63-2c8f5e0d7146',
  slug: 'themanagement',
  verticalKey: 'bithire',
  rowVersion: 8,
};
