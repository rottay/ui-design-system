"use client";

/**
 * K0.6 first-party recipe-profile evidence probe.
 *
 * Renders one identical tree of already-accepted families (Button, Card,
 * Tabs, Tag, Input, Typography) under each first-party vertical AS IT ACTUALLY
 * SHIPS: the code-owned registry tenant, unspread, with the recipe profile its
 * own checked-in BrandTheme authored.
 *
 * IT USED TO ASK A QUESTION THE CONTRACT NO LONGER PERMITS. The original probe
 * swept a `profile` URL axis by cloning the vertical's BrandTheme, writing
 * `recipes.profile` onto the clone, and handing the result to the provider as
 * `tenantConfig.brandTheme`. Measured against the real resolver, a runtime
 * BrandTheme is unrenderable under EVERY declaration -- `undefined` and
 * `authority: 'provider'` both resolve `uncompiled-visual-payload`, and
 * `compiled-artifact` lists a raw tenant brandTheme as a hard conflict. A
 * blocked resolution renders `<LoadingScreen />`, so every capture this probe
 * has ever produced was a photograph of a spinner. Worse, code-owned identity
 * is WeakSet object identity, so even spreading the registry config forfeits
 * it. There is exactly one legal home for a hand-authored BrandTheme: the
 * checked-in registry, where `getCodeOwnedRuntimeConfig` strips it before the
 * visual-payload census. So the probe now READS the registry instead of
 * simulating it.
 *
 * The `profile` axis is therefore gone rather than renamed. What each vertical
 * has authored is a fact of the source tree, not a URL parameter:
 * `rottay` -> `rottay/technical-sharp@1`, `bithire` ->
 * `rottay/network-professional@1`, `evnto` -> none. Those are stamped on the
 * frame as `data-pe-authored-profile` so a capture states its own subject.
 *
 * THE EVNTO CELL RENDERS ITS REAL GAP, on purpose. `evntoBrandTheme` leaves
 * `palette.textPrimaryColor` / `textSecondaryColor` and `chrome.tabs`
 * undeclared, so dark-first foundation defaults land on evnto's light canvas
 * (washed title and body, dark-gradient tab tray). A previous version of this
 * file carried an `EVNTO_PROBE_COMPLETION` patch that filled those channels in
 * so "the profile comparison stays legible" -- which made the probe render a
 * vertical that does not exist. The gap belongs to the app-evnto identity
 * program; this probe's job is to show it, not to cover it.
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
} from "@rottay/design-system";
import { getKnownTenantConfig } from "@rottay/design-system/server";

export type ProfileEvidenceVertical = "rottay" | "bithire" | "evnto";
export type ProfileEvidenceLocale = "en" | "es" | "ar";

export interface K0ProfileEvidenceProps {
  vertical: ProfileEvidenceVertical;
  locale: ProfileEvidenceLocale;
}

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

export function K0ProfileEvidence({
  vertical,
  locale,
}: K0ProfileEvidenceProps) {
  const copy = COPY[locale];

  // The registry's OWN object. Not a literal that copies its fields and not a
  // spread of it: code-owned identity is object identity, and either
  // alternative produces an ordinary tenant carrying an uncompiled BrandTheme,
  // which blocks. `locale` travels on the provider prop below for the same
  // reason -- the code-owned projection keeps only
  // `branding | engine | features | name | plan | slug | theme | vertical`.
  const tenantConfig = getKnownTenantConfig(vertical);
  if (!tenantConfig) {
    throw new Error(`The bundled ${vertical} tenant is missing from the registry`);
  }

  // Read for the stamp only. The BrandTheme never reaches the provider from
  // here -- the registry hands it to the compiler through the code-owned path.
  const authoredProfile = tenantConfig.brandTheme?.recipes?.profile ?? "none";

  return (
    <DesignSystemProvider
      tenantConfig={tenantConfig}
      vertical={tenantConfig.vertical}
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
          data-pe-vertical={vertical}
          data-pe-authored-profile={authoredProfile}
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
