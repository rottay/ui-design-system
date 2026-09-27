/**
 * The probe fleet's governed sources, as probe-ground requests.
 *
 * One bundled vertical against two DB-owned customer documents that differ only in
 * how much they author. The DB documents are v1 `TenantThemeDocument`s: they author
 * inks, rules and a full dark palette, which no decision document can express, so
 * they ride the kernel's `legacy` source and compile to the bytes they always did.
 */

import type { GroundRequest } from "@/components/probe-ground";

export type FleetSource = "bithire-static" | "themanagement-db" | "themanagement-seeds";

/** The density axis the probe matrix sweeps. */
export type FleetDensity = "compact" | "comfortable" | "spacious";

/** Locales the probe matrix renders. `ar` is the RTL case. */
export type FleetLocale = "en" | "es" | "ar";

/** The ground a cell renders on; on the DB path it selects the authored palette. */
export type FleetTheme = "light" | "dark";

/** The testid every probe's artifact `<style>` carries, so e2e can find it. */
export const FLEET_ARTIFACT_TESTID = "showroom-tenant-artifact";

/** The document vocabulary has no `comfortable`; `normal` is its canonical alias. */
const DOCUMENT_DENSITY: Record<FleetDensity, "compact" | "normal" | "spacious"> = {
  compact: "compact",
  comfortable: "normal",
  spacious: "spacious",
};

const THEMANAGEMENT_LIGHT_PALETTE = {
  primary: "#0F766E",
  secondary: "#8C6D46",
  accent: "#B44F3C",
  background: "#FBF6EC",
  foreground: {
    primary: "#2E261C",
    secondary: "#5C4F3D",
    muted: "#6B5B48",
    disabled: "#74644F",
  },
  border: { primary: "#C8B9A5", secondary: "#E2D9CC" },
  backgroundMode: "light",
} as const;

/**
 * Authored, not flipped: `backgroundMode: 'dark'` alone re-ramps the scales but keeps
 * the stated light ground and inks, which the artifact selector then pins.
 */
const THEMANAGEMENT_DARK_PALETTE = {
  primary: "#0F766E",
  secondary: "#8C6D46",
  accent: "#B44F3C",
  background: "#17130E",
  foreground: {
    primary: "#F2EADC",
    secondary: "#C9BCA6",
    muted: "#A2937C",
    disabled: "#6E6252",
  },
  border: { primary: "#3A3128", secondary: "#2A231C" },
  backgroundMode: "dark",
} as const;

/** Every dial sits inside the bithire envelope; radiusScale 0.8 is its floor. */
const THEMANAGEMENT_DOCUMENT = {
  schemaVersion: 1,
  mode: "advanced",
  visualFoundation: {
    general: {
      palette: THEMANAGEMENT_LIGHT_PALETTE,
      typography: {
        typePairing: "editorial",
        fontFamilyHeading: "Georgia, 'Times New Roman', serif",
        fontFamilyBase: "Optima, Candara, 'Noto Sans', sans-serif",
        scale: 1.04,
      },
      shape: { buttonStyle: "soft", radiusScale: 0.8 },
      motion: { intensity: 0.62, durationScale: 1.08 },
      density: "spacious",
      surfaces: { elevation: "elevated", effectIntensity: 0.45 },
      navigation: { sidebarTone: "strong" },
    },
  },
} as const;

const THEMANAGEMENT_IDENTITY = {
  tenantId: "8b2e6d41-0c39-4a7f-b5d2-9e14c6a08f37",
  slug: "themanagementmiami",
  name: "The Management Miami",
} as const;

/** A distinct tenant: the artifact selector is keyed by slug, one artifact per scope. */
const THEMANAGEMENT_SEEDS_IDENTITY = {
  tenantId: "3d7c1a52-6b48-4e19-9f03-2c85d7ae610b",
  slug: "themanagementseeds",
  name: "The Management (seeds only)",
} as const;

/** The seeds allowlist in the DB DOCUMENT vocabulary, which is what the claim is about. */
export const SEEDS_ONLY_DOCUMENT_ALLOWLIST: Readonly<Record<string, readonly string[]>> = Object.freeze({
  "": Object.freeze(["schemaVersion", "mode", "visualFoundation"]),
  visualFoundation: Object.freeze(["general"]),
  "visualFoundation.general": Object.freeze(["palette"]),
  "visualFoundation.general.palette": Object.freeze(["primary", "secondary", "accent", "background"]),
});

/** The four seeds of the same customer, picked field by field, never spread. */
export function seedsOnlyDocument(primary: string = THEMANAGEMENT_LIGHT_PALETTE.primary) {
  return {
    schemaVersion: 1,
    mode: "advanced",
    visualFoundation: {
      general: {
        palette: {
          primary,
          secondary: THEMANAGEMENT_LIGHT_PALETTE.secondary,
          accent: THEMANAGEMENT_LIGHT_PALETTE.accent,
          background: THEMANAGEMENT_LIGHT_PALETTE.background,
        },
      },
    },
  };
}

function themanagementDocument(theme: FleetTheme, density?: FleetDensity, recipeProfile?: string) {
  return {
    ...THEMANAGEMENT_DOCUMENT,
    visualFoundation: {
      ...THEMANAGEMENT_DOCUMENT.visualFoundation,
      general: {
        ...THEMANAGEMENT_DOCUMENT.visualFoundation.general,
        palette: theme === "dark" ? THEMANAGEMENT_DARK_PALETTE : THEMANAGEMENT_LIGHT_PALETTE,
        ...(density ? { density: DOCUMENT_DENSITY[density] } : {}),
      },
      ...(recipeProfile ? { recipeProfile } : {}),
    },
  };
}

export interface FleetGroundOptions {
  readonly locale?: FleetLocale;
  /** Static path: a `DensityScope` posture. DB path: the document's own density. Seeds: neither. */
  readonly density?: FleetDensity;
  readonly theme?: FleetTheme;
  /** A governed recipe-profile id, compiled into the DB document. */
  readonly recipeProfile?: string;
  /** `themanagement-seeds` only: the authored primary seed. */
  readonly seedPrimary?: string;
}

/** The slug each source mounts, so a page can refuse a substituted tenant. */
export const FLEET_SLUG: Record<FleetSource, string> = {
  "bithire-static": "bithire",
  "themanagement-db": THEMANAGEMENT_IDENTITY.slug,
  "themanagement-seeds": THEMANAGEMENT_SEEDS_IDENTITY.slug,
};

/**
 * The kernel request for one fleet cell. Density never reaches the mount: the static
 * path scopes it and the DB path compiles it, and applying it twice would move paint.
 */
export function fleetGroundRequest(source: FleetSource, options: FleetGroundOptions = {}): GroundRequest {
  const { locale = "en", density, theme = "light", recipeProfile, seedPrimary } = options;
  if (source === "themanagement-db") {
    return {
      slug: THEMANAGEMENT_IDENTITY.slug,
      mode: theme,
      locale,
      source: {
        kind: "legacy",
        document: themanagementDocument(theme, density, recipeProfile),
        tenantId: THEMANAGEMENT_IDENTITY.tenantId,
        name: THEMANAGEMENT_IDENTITY.name,
      },
    };
  }
  if (source === "themanagement-seeds") {
    return {
      slug: THEMANAGEMENT_SEEDS_IDENTITY.slug,
      mode: theme,
      locale,
      source: {
        kind: "legacy",
        document: seedsOnlyDocument(seedPrimary),
        tenantId: THEMANAGEMENT_SEEDS_IDENTITY.tenantId,
        name: THEMANAGEMENT_SEEDS_IDENTITY.name,
      },
    };
  }
  return { slug: "bithire", mode: theme, locale, source: { kind: "static", vertical: "bithire" } };
}
