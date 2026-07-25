"use client";

/**
 * K0.6 first-party recipe-profile evidence probe.
 *
 * Renders one identical tree of already-accepted families (Button, Card,
 * Tabs, Tag, Input, Typography) under a first-party static BrandTheme with
 * an optional governed recipe-profile override, so the profile decision for
 * each vertical is made from sighted geometry/anatomy evidence — never by
 * blindly filling the field. The profile override is applied at runtime
 * through the tenantConfig object only; the theme source file is untouched.
 */

import {
  Box,
  Button,
  Card,
  DesignSystemProvider,
  Heading,
  Input,
  Stack,
  Tabs,
  Tag,
  Text,
  bithireBrandTheme,
  evntoBrandTheme,
  rottayBrandTheme,
  type BrandTheme,
  type TenantConfig,
} from "@rottay/design-system";

export type ProfileEvidenceTheme = "platform" | "bithire" | "evnto";
export type ProfileEvidenceProfile =
  | "none"
  | "technical-sharp"
  | "editorial-round";
export type ProfileEvidenceLocale = "en" | "es" | "ar";

export interface K0ProfileEvidenceProps {
  theme: ProfileEvidenceTheme;
  profile: ProfileEvidenceProfile;
  locale: ProfileEvidenceLocale;
}

const BASE_THEMES: Record<ProfileEvidenceTheme, BrandTheme> = {
  platform: rottayBrandTheme,
  bithire: bithireBrandTheme,
  evnto: evntoBrandTheme,
};

/**
 * Each vertical theme must render under its own vertical key: the merge
 * chain applies the vertical baseline/preset (evnto owns an
 * experience-baseline preset) before the BrandTheme. A mismatched vertical
 * renders washed text and wrong chrome — proven by the first evnto capture.
 */
const VERTICALS: Record<ProfileEvidenceTheme, string> = {
  platform: "rottay",
  bithire: "bithire",
  evnto: "evnto",
};

/**
 * Probe-local completion of evnto's under-declared tokens, applied to the
 * clone only — the evnto source file is NOT touched (it is co-owned by the
 * app-evnto identity program). The source gap is REPORTED in the wave
 * handoff: `palette.textPrimaryColor` / `textSecondaryColor` and
 * `chrome.tabs` are undeclared, so dark-first foundation defaults leak onto
 * evnto's light canvas (washed title/body, dark-gradient tab tray) under
 * the runtime compile path. Values below are modeled on evnto's own
 * declared chrome (#171717 ink, rgba(0,0,0,0.06-0.12) borders, #FFFFFF /
 * #FAFAFA surfaces) so the profile comparison stays legible.
 */
const EVNTO_PROBE_COMPLETION: {
  palette: Pick<
    NonNullable<BrandTheme["palette"]>,
    "textPrimaryColor" | "textSecondaryColor"
  >;
  surfaces: NonNullable<BrandTheme["surfaces"]>;
  chrome: BrandTheme["chrome"];
} = {
  palette: {
    textPrimaryColor: "#171717",
    textSecondaryColor: "#57534A",
  },
  surfaces: {
    ...evntoBrandTheme.surfaces,
    surfaceRoles: {
      card: {
        background: "#FFFFFF",
        border: "rgba(0, 0, 0, 0.08)",
        shadow: "0 1px 3px rgba(0, 0, 0, 0.06)",
      },
      inset: {
        background: "#FAFAFA",
        border: "rgba(0, 0, 0, 0.06)",
      },
    },
  } as NonNullable<BrandTheme["surfaces"]>,
  chrome: {
    tabs: {
      border: "rgba(0, 0, 0, 0.08)",
      color: "var(--ds-color-text-secondary)",
      colorHover: "#171717",
      colorActive: "#171717",
      bgHover: "#FAFAFA",
      borderActive: "#171717",
      listBg: "color-mix(in srgb, #FAFAFA 82%, #FFFFFF)",
      listBorder: "rgba(0, 0, 0, 0.08)",
      itemRadius: "10px",
      activeBg: "#FFFFFF",
      indicatorHeight: "2px",
      panelBg: "#FFFFFF",
      panelBorder: "rgba(0, 0, 0, 0.08)",
    },
  } as BrandTheme["chrome"],
};

const COPY: Record<ProfileEvidenceLocale, Record<string, string>> = {
  en: {
    title: "Recipe profile evidence",
    body: "Same markup, governed personality.",
    action: "Primary action",
    quiet: "Quiet action",
    cardTitle: "Pipeline summary",
    cardBody: "Deterministic fixture copy for inspection.",
    field: "Candidate name",
    tabOne: "Overview",
    tabTwo: "Activity",
    tabThree: "Settings",
    tagA: "Reviewed",
    tagB: "Priority",
  },
  es: {
    title: "Evidencia de perfil de receta",
    body: "Mismo markup, personalidad gobernada.",
    action: "Acción principal",
    quiet: "Acción silenciosa",
    cardTitle: "Resumen del pipeline",
    cardBody: "Texto determinista de inspección.",
    field: "Nombre del candidato",
    tabOne: "Resumen",
    tabTwo: "Actividad",
    tabThree: "Ajustes",
    tagA: "Revisado",
    tagB: "Prioridad",
  },
  ar: {
    title: "دليل ملف الوصفة",
    body: "نفس الترميز، شخصية محكومة.",
    action: "الاجراء الرئيسي",
    quiet: "اجراء هادئ",
    cardTitle: "ملخص خط الانابيب",
    cardBody: "نص حتمي للفحص البصري.",
    field: "اسم المرشح",
    tabOne: "نظرة عامة",
    tabTwo: "النشاط",
    tabThree: "الاعدادات",
    tagA: "تمت المراجعة",
    tagB: "اولوية",
  },
};

function themeFor(
  theme: ProfileEvidenceTheme,
  profile: ProfileEvidenceProfile
): BrandTheme {
  const base = BASE_THEMES[theme];
  const completed: BrandTheme =
    theme === "evnto"
      ? {
          ...base,
          palette: {
            ...(base.palette as NonNullable<BrandTheme["palette"]>),
            ...EVNTO_PROBE_COMPLETION.palette,
          },
          surfaces: EVNTO_PROBE_COMPLETION.surfaces,
          chrome: { ...base.chrome, ...EVNTO_PROBE_COMPLETION.chrome },
        }
      : base;
  if (profile === "none") return completed;
  return {
    ...completed,
    recipes: { schemaVersion: 1, profile: `rottay/${profile}@1` },
  };
}

export function K0ProfileEvidence({
  theme,
  profile,
  locale,
}: K0ProfileEvidenceProps) {
  const copy = COPY[locale];
  const tenantConfig: TenantConfig = {
    slug: `k0-${theme}`,
    name: `K0 ${theme}`,
    vertical: VERTICALS[theme],
    engine: "modern",
    theme: "light",
    plan: "enterprise",
    features: ["*"],
    branding: { companyName: `K0 ${theme}` },
    brandTheme: themeFor(theme, profile),
  };

  return (
    <DesignSystemProvider
      tenantConfig={{ ...tenantConfig, locale }}
      vertical={VERTICALS[theme]}
      locale={locale}
      forceEngine="modern"
      forceTheme="light"
    >
      <Box
        data-testid="pe-canvas"
        style={{
          background: "var(--ds-color-background)",
          color: "var(--ds-color-text-primary)",
          minHeight: "100vh",
          inlineSize: "100%",
        }}
      >
        <Box
          data-testid="pe-frame"
          data-pe-theme={theme}
          data-pe-profile={profile}
          data-pe-locale={locale}
          dir={locale === "ar" ? "rtl" : "ltr"}
          style={{
            padding: 24,
            minHeight: "100vh",
            maxInlineSize: 1100,
            marginInline: "auto",
          }}
        >
          <Stack spacing="lg" data-testid="pe-root">
            <div>
              <Heading level="h2" data-testid="pe-title">
                {copy.title}
              </Heading>
              <Text data-testid="pe-body">{copy.body}</Text>
            </div>

            <Stack direction="horizontal" spacing="sm" data-testid="pe-buttons">
              <Button data-testid="pe-button-primary">{copy.action}</Button>
              <Button data-testid="pe-button-quiet" variant="ghost">
                {copy.quiet}
              </Button>
            </Stack>

            <Stack direction="horizontal" spacing="sm" data-testid="pe-tags">
              <Tag data-testid="pe-tag-a">{copy.tagA}</Tag>
              <Tag data-testid="pe-tag-b" variant="warning">
                {copy.tagB}
              </Tag>
            </Stack>

            <div data-testid="pe-field">
              <Input data-testid="pe-input" placeholder={copy.field} aria-label={copy.field} />
            </div>

            <Card data-testid="pe-card" title={copy.cardTitle}>
              <Text data-testid="pe-card-body">{copy.cardBody}</Text>
            </Card>

            <div data-testid="pe-tabs">
              <Tabs
                items={[
                  { key: "one", label: copy.tabOne, children: <Text>{copy.tabOne}</Text> },
                  { key: "two", label: copy.tabTwo, children: <Text>{copy.tabTwo}</Text> },
                  { key: "three", label: copy.tabThree, children: <Text>{copy.tabThree}</Text> },
                ]}
              />
            </div>
          </Stack>
        </Box>
      </Box>
    </DesignSystemProvider>
  );
}
