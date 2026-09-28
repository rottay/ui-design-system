import type { GroundRequest } from "@/components/probe-ground";

export type SpecimenSource = "technical-static" | "editorial-db";
export type SpecimenLocale = "en" | "es" | "ar";

/**
 * The trusted identity columns of the published editorial row.
 *
 * `vertical` is `bithire` because the envelope that bounds the document
 * below is bithire's; the profile it selects is a `rottay/` registry id, which
 * is a namespace on the governed profile registry and not a vertical claim.
 */
const EDITORIAL_IDENTITY = {
  tenantId: "3f6c1d95-71ab-4e02-8c47-2d5b90ea6c18",
  slug: "q001l-editorial",
  vertical: "bithire",
  rowVersion: 1,
  name: "Editorial Round",
} as const;

/**
 * The published editorial document: round, soft, warm, elevated.
 *
 * Expressed as the bounded `TenantThemeDocument` a customer actually writes --
 * not a `FlatTheme` (that channel is reserved for checked-in vertical
 * identity) and not a raw `appearance` literal (that is visual payload no
 * declaration admits). Every dial sits inside the measured bithire envelope:
 * radiusScale 1.2 is its ceiling, effectIntensity 0.55 and motion intensity
 * 0.75 are inside 0-0.65 and 0-0.8, and typeScale 1.04 is inside 0.92-1.08.
 * The visual difference is carried by these governed dials plus the profile
 * selection -- nothing here restates a `--ds-*` value directly.
 */
const EDITORIAL_DOCUMENT = {
  schemaVersion: 1,
  mode: "advanced",
  visualFoundation: {
    recipeProfile: "rottay/editorial-round@1",
    general: {
      palette: {
        primary: "#B45309",
        secondary: "#7C3F18",
        accent: "#C26D2D",
        background: "#FFFAF3",
        foreground: {
          primary: "#2C1810",
          secondary: "#674332",
          muted: "#886858",
          disabled: "#AD9386",
        },
        border: { primary: "#D9B99D", secondary: "#EAD8C7" },
        backgroundMode: "light",
      },
      typography: {
        typePairing: "editorial",
        fontFamilyHeading: "Fraunces, Georgia, 'Times New Roman', serif",
        fontFamilyBase: "Fraunces, Georgia, 'Times New Roman', serif",
        scale: 1.04,
      },
      shape: { buttonStyle: "pill", radiusScale: 1.2 },
      motion: { intensity: 0.75, durationScale: 1.08 },
      density: "spacious",
      surfaces: { elevation: "soft", effectIntensity: 0.55 },
    },
  },
} as const;

/** The tenant each source mounts: the registry's own `bithire`, or the customer row. */
export const SPECIMEN_SLUG: Record<SpecimenSource, string> = {
  "technical-static": "bithire",
  "editorial-db": EDITORIAL_IDENTITY.slug,
};

/**
 * `bithire`'s compiled artifact selects `rottay/technical-sharp@1` and its CSS is
 * bundled; the editorial row is a v1 document compiled through the kernel's legacy door.
 */
export function specimenGroundRequest(source: SpecimenSource, locale: SpecimenLocale): GroundRequest {
  if (source === "editorial-db") {
    return {
      slug: EDITORIAL_IDENTITY.slug,
      mode: "light",
      locale,
      source: {
        kind: "legacy",
        vertical: EDITORIAL_IDENTITY.vertical,
        document: EDITORIAL_DOCUMENT,
        tenantId: EDITORIAL_IDENTITY.tenantId,
        rowVersion: EDITORIAL_IDENTITY.rowVersion,
        name: EDITORIAL_IDENTITY.name,
      },
    };
  }
  return { slug: SPECIMEN_SLUG[source], mode: "light", locale, source: { kind: "static", vertical: "bithire" } };
}
