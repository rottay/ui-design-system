"use client";

/**
 * K1 Lane A probe (showroom): identity & compact chrome families.
 *
 * One identical component tree for the five Lane-A families (Avatar, Badge,
 * Tag, Link, Kbd) rendered under two opposing governed sources:
 *  - `bithire-static`: the checked-in BitHire BrandTheme (file-first path);
 *  - `themanagement-db`: the DB Appearance construction mirrored from
 *    `@/components/brand-locale-evidence` (DB-owned runtime path).
 *
 * The density posture sweeps compact | comfortable | spacious through
 * `appearance.general.density` only (`comfortable` maps to the canonical
 * `normal` alias at the Appearance boundary), the locale sweep renders
 * EN/ES/AR with `dir="rtl"` for Arabic, and the state sweep applies
 * rest | disabled | loading to the families that expose those states.
 * Every cell is deterministic and URL-addressable; no fixture value here is
 * product content.
 */

import {
  Avatar,
  Badge,
  Box,
  DesignSystemProvider,
  Heading,
  Kbd,
  NavLink,
  Stack,
  Tag,
  Text,
  bithireBrandTheme,
  type TenantConfig,
} from "@rottay/design-system";

import { tenantConfigFor as brandLocaleTenantConfigFor } from "@/components/brand-locale-evidence";

export type LaneASource = "bithire-static" | "themanagement-db";
export type LaneALocale = "en" | "es" | "ar";
export type LaneADensity = "compact" | "comfortable" | "spacious";
export type LaneAState = "rest" | "disabled" | "loading";

export interface K1LaneAProbeProps {
  source: LaneASource;
  locale: LaneALocale;
  density: LaneADensity;
  state: LaneAState;
}

/**
 * The tenant-facing Appearance vocabulary has no `comfortable` literal:
 * `normal` is the canonical alias (TenantAppearanceGeneral['density']).
 */
function toAppearanceDensity(
  density: LaneADensity
): "compact" | "normal" | "spacious" {
  return density === "comfortable" ? "normal" : density;
}

function tenantConfig(
  source: LaneASource,
  locale: LaneALocale,
  density: LaneADensity
): TenantConfig {
  if (source === "themanagement-db") {
    const base = brandLocaleTenantConfigFor("themanagementmiami", locale);
    return {
      ...base,
      appearance: {
        ...base.appearance,
        general: {
          ...base.appearance?.general,
          density: toAppearanceDensity(density),
        },
      },
    };
  }

  return {
    slug: "bithire",
    name: "BitHire",
    vertical: "bithire",
    engine: "modern",
    theme: "light",
    plan: "enterprise",
    features: ["*"],
    branding: { companyName: "BitHire" },
    // BitHire is first-party vertical identity and therefore comes from the
    // checked-in DS theme, never from a customer DB fixture. The semantic
    // posture enters exclusively through the Appearance channel.
    brandTheme: bithireBrandTheme,
    appearance: { general: { density: toAppearanceDensity(density) } },
  };
}

const COPY: Record<LaneALocale, Record<string, string>> = {
  en: {
    title: "Identity & compact chrome specimen",
    teamLabel: "Interview panel",
    badgeCountNew: "7 new",
    badgeCountAlerts: "99+ alerts",
    badgeWatching: "Watching",
    badgeSelected: "Recommended",
    badgeRemove: "Remove filter",
    tagReviewed: "Reviewed",
    tagPriority: "Priority",
    tagOverlong:
      "Availability confirmed for every interview stage including technical panels and final references",
    tagRemove: "Remove tag",
    paragraphBefore: "Review the",
    paragraphLink: "shortlisted candidates",
    paragraphMiddle: "before Friday, or open the",
    paragraphExternal: "public job posting",
    paragraphAfter: "in a new tab.",
    standaloneLink: "Pipeline report",
    disabledLink: "Archived searches",
    kbdHintBefore: "Press",
    kbdHintAfter: "to open the command palette.",
  },
  es: {
    title: "Espécimen de identidad y chrome compacto",
    teamLabel: "Panel de entrevistas",
    badgeCountNew: "7 nuevas",
    badgeCountAlerts: "99+ alertas",
    badgeWatching: "Seguimiento",
    badgeSelected: "Recomendados",
    badgeRemove: "Quitar filtro",
    tagReviewed: "Revisado",
    tagPriority: "Prioridad",
    tagOverlong:
      "Disponibilidad confirmada para todas las etapas de entrevistas incluyendo paneles técnicos y referencias finales",
    tagRemove: "Quitar etiqueta",
    paragraphBefore: "Revisa los",
    paragraphLink: "candidatos preseleccionados",
    paragraphMiddle: "antes del viernes, o abre la",
    paragraphExternal: "oferta pública",
    paragraphAfter: "en una pestaña nueva.",
    standaloneLink: "Informe del pipeline",
    disabledLink: "Búsquedas archivadas",
    kbdHintBefore: "Pulsa",
    kbdHintAfter: "para abrir la paleta de comandos.",
  },
  ar: {
    title: "عينة الهوية وعناصر العرض المدمجة",
    teamLabel: "لجنة المقابلات",
    badgeCountNew: "7 جديدة",
    badgeCountAlerts: "+99 تنبيه",
    badgeWatching: "قيد المتابعة",
    badgeSelected: "موصى بهم",
    badgeRemove: "إزالة عامل التصفية",
    tagReviewed: "تمت المراجعة",
    tagPriority: "أولوية",
    tagOverlong:
      "تم تأكيد التوفر لجميع مراحل المقابلات بما في ذلك اللجان الفنية والمراجع النهائية",
    tagRemove: "إزالة الوسم",
    paragraphBefore: "راجع",
    paragraphLink: "المرشحين المختارين",
    paragraphMiddle: "قبل يوم الجمعة، أو افتح",
    paragraphExternal: "إعلان الوظيفة العام",
    paragraphAfter: "في علامة تبويب جديدة.",
    standaloneLink: "تقرير خط التوظيف",
    disabledLink: "عمليات البحث المؤرشفة",
    kbdHintBefore: "اضغط",
    kbdHintAfter: "لفتح لوحة الأوامر.",
  },
};

function SpecimenTree({
  locale,
  state,
}: Pick<K1LaneAProbeProps, "locale" | "state">) {
  const copy = COPY[locale];
  const disabled = state === "disabled";
  const loading = state === "loading";

  return (
    <Stack spacing="lg" data-testid="la-root">
      <Heading level="h2" data-testid="la-title">
        {copy.title}
      </Heading>

      <Stack spacing="xs" data-testid="la-avatar">
        <Text weight="semibold">{copy.teamLabel}</Text>
        <Avatar.Group max={3}>
          <Avatar name="Jane Doe" tone="primary" status="online" clickable onClick={() => undefined} />
          <Avatar name="فاطمة الزهراء" variant="secondary" status="busy" />
          <Avatar name="Alejandra Konstantinopoulos" tone="success" status="away" />
          <Avatar name="X" tone="warning" />
          <Avatar name="John Michael Doe" tone="danger" status="offline" />
          <Avatar src="https://broken.invalid/avatar.png" name="Error Fallback" />
        </Avatar.Group>
      </Stack>

      <Stack direction="horizontal" spacing="sm" wrap data-testid="la-badge">
        <Badge kind="pill" count={7} tone="primary" aria-label={copy.badgeCountNew} />
        <Badge kind="pill" count={128} max={99} tone="danger" aria-label={copy.badgeCountAlerts} />
        <Badge kind="chip" dot tone="success">
          {copy.badgeWatching}
        </Badge>
        <Badge kind="chip" selected onSelectedChange={() => undefined} aria-label={copy.badgeSelected}>
          {copy.badgeSelected}
        </Badge>
        <Badge
          kind="chip"
          removable
          removeLabel={copy.badgeRemove}
          onClose={() => undefined}
          disabled={disabled}
          loading={loading}
          loadingText={copy.badgeWatching}
        >
          {copy.badgeWatching}
        </Badge>
      </Stack>

      <Stack direction="horizontal" spacing="sm" wrap data-testid="la-tag">
        <Tag variant="success" closable closeLabel={copy.tagRemove} onClose={() => undefined}>
          {copy.tagReviewed}
        </Tag>
        <Tag variant="warning" radius="full" clickable onClick={() => undefined}>
          {copy.tagPriority}
        </Tag>
        <Tag variant="primary" outlined>
          {copy.tagOverlong}
        </Tag>
      </Stack>

      <div data-testid="la-link">
        <Text>
          {copy.paragraphBefore}{" "}
          <NavLink href="#" type="primary">
            {copy.paragraphLink}
          </NavLink>{" "}
          {copy.paragraphMiddle}{" "}
          <NavLink href="https://example.com" external>
            {copy.paragraphExternal}
          </NavLink>{" "}
          {copy.paragraphAfter}
        </Text>
        <Stack direction="horizontal" spacing="md">
          <NavLink href="#" underline={false} type="secondary">
            {copy.standaloneLink}
          </NavLink>
          <NavLink href="/archived" disabled={disabled}>
            {copy.disabledLink}
          </NavLink>
        </Stack>
      </div>

      <div data-testid="la-kbd">
        <Text>
          {copy.kbdHintBefore} <Kbd>⌘</Kbd> + <Kbd>K</Kbd> {copy.kbdHintAfter}
        </Text>
      </div>
    </Stack>
  );
}

export function K1LaneAProbe({ source, locale, density, state }: K1LaneAProbeProps) {
  return (
    <DesignSystemProvider
      tenantConfig={{ ...tenantConfig(source, locale, density), locale }}
      vertical="bithire"
      locale={locale}
      forceEngine="modern"
      forceTheme="light"
    >
      <Box
        data-testid="la-canvas"
        style={{
          background: "var(--ds-color-background)",
          color: "var(--ds-color-text-primary)",
          minHeight: "100vh",
          inlineSize: "100%",
        }}
      >
        <Box
          data-testid="la-frame"
          data-la-source={source}
          data-la-density={density}
          data-la-state={state}
          dir={locale === "ar" ? "rtl" : "ltr"}
          style={{
            padding: 24,
            minHeight: "100vh",
            maxInlineSize: 720,
            marginInline: "auto",
          }}
        >
          <SpecimenTree locale={locale} state={state} />
        </Box>
      </Box>
    </DesignSystemProvider>
  );
}
