import { describe, expect, it } from "vitest";

import type { TenantConfig } from "@/foundation/contracts";
import {
  LOCALE_CONFIGS,
  TRANSLATION_CATALOG,
} from "@/foundation/i18n/runtime/catalog";
import { resolveTranslation } from "@/foundation/i18n/runtime/resolution";
import { bithireBrandTheme } from "@/foundation/tokens/ts/presentation/brand-themes";
import { themanagementmiamiBrandTheme } from "@tests/fixtures/brand-themes/themanagementmiami";
import { brandThemeToTenantAppearance } from "@/components/patterns/customization/brand-studio/runtime/file-export";
import {
  compileTenantThemeConfig,
  getTenantThemeVerticalEnvelope,
  hydrateTenantThemeConfig,
} from "@/infrastructure/compilers/composition/tenant-theme";

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

const managementAppearance: NonNullable<TenantConfig["appearance"]> = {
  general: managementProjectedAppearance.general,
};

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

const bithireStaticConfig = {
  slug: "bithire",
  vertical: "bithire",
  brandTheme: bithireBrandTheme,
} satisfies Pick<TenantConfig, "slug" | "vertical" | "brandTheme">;

function managementDbConfig(locale: Locale) {
  return {
    slug: "themanagementmiami",
    vertical: "bithire",
    appearance: managementAppearance,
    customTranslations: {
      components: { empty: { description: MANAGEMENT_COPY[locale] } },
    },
  } satisfies Pick<
    TenantConfig,
    "slug" | "vertical" | "appearance" | "customTranslations"
  >;
}

function resolveEmptyCopy(
  locale: Locale,
  customTranslations?: TenantConfig["customTranslations"]
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
    expect(managementDbVariables["--ds-radius-scale"]).toBe("0.8");
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
