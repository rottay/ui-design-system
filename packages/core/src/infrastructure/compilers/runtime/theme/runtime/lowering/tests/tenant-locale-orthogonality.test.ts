import { describe, expect, it } from "vitest";

import type {
  BrandTheme,
  TenantAppearance,
} from "@/foundation/contracts/composition/tenants/themes";
import {
  LOCALE_CONFIGS,
  TRANSLATION_CATALOG,
} from "@/foundation/i18n/runtime/catalog";
import { resolveTranslation } from "@/foundation/i18n/runtime/resolution";
import { themanagementmiamiBrandTheme } from "@tests/fixtures/brand-themes/themanagementmiami";
import { brandThemeToTenantAppearance } from "@/components/patterns/customization/brand-studio/runtime/file-export";
import {
  compileTenantThemeConfig,
  getTenantThemeVerticalEnvelope,
  hydrateTenantThemeConfig,
} from "@/infrastructure/compilers/composition/tenant-theme";
import { firstPartyFixture } from "@tests/support/theme-lowering";

const bithireBrandTheme = firstPartyFixture('bithire');

const LOCALES = ["en", "es", "ar"] as const;
type Locale = (typeof LOCALES)[number];

const BASE_COPY: Record<Locale, string> = {
  en: "No data",
  es: "Sin datos",
  ar: "لا توجد بيانات",
};

const MANAGEMENT_COPY: Record<Locale, string> = {
  en: "No talent profiles yet",
  es: "Todavía no hay perfiles de talento",
  ar: "لا توجد ملفات مواهب بعد",
};

const managementProjectedAppearance = brandThemeToTenantAppearance(
  themanagementmiamiBrandTheme
);

const managementAppearance: TenantAppearance = {
  general: managementProjectedAppearance.general,
};

/**
 * The two transport shapes, named locally.
 *
 * They are deliberately NOT `Pick<TenantConfig, ...>`: a tenant config carries
 * neither a theme nor an appearance, so the fixtures below describe what each
 * TRANSPORT hands the compiler, not what a runtime config holds.
 */
interface StaticTransportFixture {
  slug: string;
  vertical: string;
  brandTheme: BrandTheme;
}
interface DbTransportFixture {
  slug: string;
  vertical: string;
  appearance: TenantAppearance;
  customTranslations: { components: { empty: { description: string } } };
}

/**
 * The DB transport, authored the way the document schema admits it: the
 * migration projection above emits a `var(--ds-font-pack-…)` heading stack and
 * an absent `palette.dark.background`, both refused by name at the document
 * boundary, and `radiusScale` 0.76 sits below the BitHire envelope floor.
 * `typePairing: 'editorial'` is what carries the editorial display pack here,
 * which is the same channel through the door a customer travels.
 */
const managementDocument = {
  schemaVersion: 1,
  mode: "simple",
  appearance: {
    palette: {
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
    },
    typography: {
      fontFamilyBase: themanagementmiamiBrandTheme.typography?.fontFamilyBase,
      typePairing: "editorial",
    },
    shape: { buttonStyle: "soft", radiusScale: 0.8 },
  },
} as const;

const managementDbVariables = compileTenantThemeConfig(
  hydrateTenantThemeConfig(managementDocument, {
    tenantId: "tenant_themanagementmiami",
    slug: "themanagementmiami",
    verticalKey: "bithire",
    rowVersion: 1,
  }),
  { verticalEnvelope: getTenantThemeVerticalEnvelope("bithire")! }
).variables;

/**
 * The same document at a radius the bithire vertical does NOT already carry,
 * so the pin above records "the document agrees with its vertical" rather than
 * "the door stopped emitting the channel".
 */
const radiusScaleFor = (radiusScale: number): string | undefined =>
  compileTenantThemeConfig(
    hydrateTenantThemeConfig(
      {
        ...managementDocument,
        appearance: {
          ...managementDocument.appearance,
          shape: { ...managementDocument.appearance.shape, radiusScale },
        },
      },
      {
        tenantId: "tenant_themanagementmiami",
        slug: "themanagementmiami",
        verticalKey: "bithire",
        rowVersion: 1,
      }
    ),
    { verticalEnvelope: getTenantThemeVerticalEnvelope("bithire")! }
  ).variables["--ds-radius-scale"];

const bithireStaticConfig = {
  slug: "bithire",
  vertical: "bithire",
  brandTheme: bithireBrandTheme,
} satisfies StaticTransportFixture;

function managementDbConfig(locale: Locale) {
  return {
    slug: "themanagementmiami",
    vertical: "bithire",
    appearance: managementAppearance,
    customTranslations: {
      components: { empty: { description: MANAGEMENT_COPY[locale] } },
    },
  } satisfies DbTransportFixture;
}

function resolveEmptyCopy(
  locale: Locale,
  customTranslations?: DbTransportFixture["customTranslations"]
): string | undefined {
  return resolveTranslation({
    key: "components.empty.description",
    locale,
    fallbackLocale: "es",
    customTranslations,
    catalog: TRANSLATION_CATALOG,
  });
}

describe("tenant identity and locale are independent runtime axes", () => {
  it("uses static BrandTheme for BitHire and a DB document for The Management", () => {
    const management = managementDbConfig("en");

    expect(bithireStaticConfig.brandTheme).toBe(bithireBrandTheme);
    expect(bithireStaticConfig).not.toHaveProperty("appearance");
    expect(management.appearance).toBe(managementAppearance);
    expect(management).not.toHaveProperty("brandTheme");
    expect(managementDbVariables["--ds-color-primary"]).toBe("#0F766E");
    expect(managementDbVariables["--ds-font-family-heading"]).toContain(
      "--ds-font-pack-editorial-display"
    );
    // WO-DER-06 derivation-lane registry (D6-2c-ii, 2026-09-15): the bithire
    // radius base; pinned to the measured state until the lane lands. The
    // document asks for `radiusScale: 0.8`, which the authored theme's 1.25
    // baseline made a real delta; the bithire preset's own
    // `shape.radius-scale` IS 0.8, so the document now agrees with its vertical
    // and the channel is correctly absent from the tenant delta. The mechanism
    // is asserted rather than assumed, so an emitter that stopped emitting
    // altogether could not hide behind this pin.
    expect(managementDocument.appearance.shape.radiusScale).toBe(0.8);
    expect(managementDbVariables["--ds-radius-scale"]).toBeUndefined();
    expect(radiusScaleFor(1.1)).toBe("1.1");
    expect(bithireStaticConfig.vertical).toBe(management.vertical);
  });

  it.each(LOCALES)(
    "resolves %s from the shared catalog for BitHire and from DB copy for The Management",
    (locale) => {
      const management = managementDbConfig(locale);
      const catalogValue = resolveEmptyCopy(locale);
      const bithireValue = resolveEmptyCopy(locale);
      const managementValue = resolveEmptyCopy(
        locale,
        management.customTranslations
      );

      expect(catalogValue).toBe(BASE_COPY[locale]);
      expect(bithireValue).toBe(BASE_COPY[locale]);
      expect(managementValue).toBe(MANAGEMENT_COPY[locale]);
      expect(managementValue).not.toBe(bithireValue);
      expect(LOCALE_CONFIGS[locale].direction).toBe(
        locale === "ar" ? "rtl" : "ltr"
      );
    }
  );

  it("renders genuinely different locale copy inside each brand", () => {
    const bithireLocalized = LOCALES.map((locale) => resolveEmptyCopy(locale));
    const managementLocalized = LOCALES.map((locale) =>
      resolveEmptyCopy(locale, managementDbConfig(locale).customTranslations)
    );

    expect(new Set(bithireLocalized).size).toBe(LOCALES.length);
    expect(new Set(managementLocalized).size).toBe(LOCALES.length);
    expect(LOCALE_CONFIGS.en.direction).toBe("ltr");
    expect(LOCALE_CONFIGS.es.direction).toBe("ltr");
    expect(LOCALE_CONFIGS.ar.direction).toBe("rtl");
  });

  it("keeps locale out of both visual-authority payloads", () => {
    expect(bithireBrandTheme).not.toHaveProperty("locale");
    expect(managementAppearance).not.toHaveProperty("locale");
    expect(themanagementmiamiBrandTheme).not.toHaveProperty("locale");

    // A tenant override must not mutate the process-wide catalog used by the
    // next tenant or route.
    void resolveEmptyCopy("en", managementDbConfig("en").customTranslations);
    expect(resolveEmptyCopy("en")).toBe(BASE_COPY.en);
  });
});
