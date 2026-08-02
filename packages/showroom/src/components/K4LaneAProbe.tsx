"use client";

/**
 * K4 Lane A probe (showroom): feedback/overlay families.
 *
 * One identical component tree for the six Lane-A families (Toast,
 * Notification, Dropdown, ContextMenu, HoverCard, Tour) rendered under two
 * opposing governed sources:
 *  - `bithire-static`: the checked-in BitHire BrandTheme (file-first path);
 *  - `themanagement-db`: the DB Appearance construction mirrored from
 *    `@/components/brand-locale-evidence` (DB-owned runtime path).
 *
 * The probe exists to give Pass-1/Pass-2 evidence a URL-addressable render of
 * the states K4-A changed:
 *  - Toast: tone row incl. gradient; action + progress + closable chrome
 *    (skin-owned after the stale-`alert` docblock fix; no behavior change).
 *  - Notification: item tones rendered IN FLOW (no fixed overlay), plus a
 *    live provider firing topLeft / bottomRight placements -- the stack
 *    container is skin-owned and placement is logical, so bottomRight lands
 *    on the reading-END edge and mirrors under `dir="rtl"` (ar).
 *  - Dropdown: open in-tree surfaces at bottomLeft / bottomRight / bottom
 *    (logical inset-inline placement), submenu + divider + group + danger +
 *    disabled + selected; the submenu chevron mirrors via the icon facade.
 *  - ContextMenu: right-click target; the panel opens toward the
 *    reading-START side (bottom-start LTR / bottom-end RTL) with skin-owned
 *    row chrome drained from inline styles and Tailwind utilities.
 *  - HoverCard: controlled-open cards at bottom-start / bottom-end / top --
 *    align mirrors along the inline axis under `dir="rtl"`.
 *  - Tour: anchored step with mask={false} (spotlight + skin-owned surface
 *    chrome, logical close button) targeting an in-probe anchor.
 *
 * Density sweeps compact | comfortable | spacious through
 * `appearance.general.density` only, locale sweeps EN/ES/AR with `dir="rtl"`
 * for Arabic, theme sweeps light | dark, and `state` retunes the lead
 * feedback tones on the SAME markup. No fixture value here is product
 * content.
 */

import { useState } from "react";

import {
  Box,
  ContextMenu,
  DesignSystemProvider,
  Dropdown,
  Heading,
  HoverCard,
  NotificationItem,
  NotificationProvider,
  Stack,
  Text,
  Toast,
  Tour,
  bithireBrandTheme,
  useNotification,
  type DropdownPlacement,
  type NotificationPlacement,
  type TenantConfig,
} from "@rottay/design-system";

import { tenantConfigFor as brandLocaleTenantConfigFor } from "@/components/brand-locale-evidence";

export type K4LaneASource = "bithire-static" | "themanagement-db";
export type K4LaneALocale = "en" | "es" | "ar";
export type K4LaneADensity = "compact" | "comfortable" | "spacious";
export type K4LaneAState = "rest" | "loading" | "error";
export type K4LaneATheme = "light" | "dark";

export interface K4LaneAProbeProps {
  source: K4LaneASource;
  locale: K4LaneALocale;
  density: K4LaneADensity;
  state: K4LaneAState;
  theme?: K4LaneATheme;
}

/**
 * The tenant-facing Appearance vocabulary has no `comfortable` literal:
 * `normal` is the canonical alias (TenantAppearanceGeneral['density']).
 */
function toAppearanceDensity(
  density: K4LaneADensity
): "compact" | "normal" | "spacious" {
  return density === "comfortable" ? "normal" : density;
}

function tenantConfig(
  source: K4LaneASource,
  locale: K4LaneALocale,
  density: K4LaneADensity
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

const COPY: Record<K4LaneALocale, Record<string, string>> = {
  en: {
    title: "Feedback/overlay specimen",
    toastCaption: "Toast (tones, action, progress, closable)",
    notificationCaption: "Notification (in-flow item tones + live logical placement)",
    dropdownCaption: "Dropdown (logical placement, submenu, group, danger, selected)",
    contextMenuCaption: "ContextMenu (right-click: opens toward the reading-start side)",
    hoverCardCaption: "HoverCard (align mirrors along the inline axis)",
    tourCaption: "Tour (anchored, mask off, skin-owned chrome)",
    fireTopLeft: "Fire topLeft",
    fireBottomRight: "Fire bottomRight",
    firedMessage: "Placement evidence",
    firedDescription: "Skin-owned stack container; logical edge under RTL.",
    toastTitle: "Report ready",
    toastDescription: "The export finished without errors.",
    actionLabel: "Undo",
    triggerArea: "Right-click inside this area",
    tourAnchor: "Tour target",
    tourStepTitle: "Skin-owned tour chrome",
    tourStepDescription: "Close button sits at the reading-end corner.",
    hoverTrigger: "@handle",
    hoverContent: "Profile preview painted by the tenant skin.",
  },
  es: {
    title: "Espécimen de retroalimentación/superposición",
    toastCaption: "Toast (tonos, acción, progreso, cerrable)",
    notificationCaption: "Notificación (tonos en flujo + colocación lógica en vivo)",
    dropdownCaption: "Dropdown (colocación lógica, submenú, grupo, peligro, seleccionado)",
    contextMenuCaption: "Menú contextual (clic derecho: abre hacia el lado de inicio de lectura)",
    hoverCardCaption: "HoverCard (la alineación refleja en el eje en línea)",
    tourCaption: "Tour (anclado, sin máscara, cromo del skin)",
    fireTopLeft: "Disparar topLeft",
    fireBottomRight: "Disparar bottomRight",
    firedMessage: "Evidencia de colocación",
    firedDescription: "Contenedor del skin; borde lógico bajo RTL.",
    toastTitle: "Informe listo",
    toastDescription: "La exportación terminó sin errores.",
    actionLabel: "Deshacer",
    triggerArea: "Clic derecho dentro de esta área",
    tourAnchor: "Objetivo del tour",
    tourStepTitle: "Cromo del tour del skin",
    tourStepDescription: "El botón de cierre queda en la esquina del final de lectura.",
    hoverTrigger: "@usuario",
    hoverContent: "Vista de perfil pintada por el skin del tenant.",
  },
  ar: {
    title: "عينة التغذية الراجعة/التراكب",
    toastCaption: "Toast (درجات، إجراء، تقدم، قابل للإغلاق)",
    notificationCaption: "الإشعارات (درجات داخل التدفق + موضع منطقي مباشر)",
    dropdownCaption: "القائمة المنسدلة (موضع منطقي، قائمة فرعية، مجموعة، خطر، محدد)",
    contextMenuCaption: "القائمة السياقية (زر أيمن: تفتح نحو جهة بداية القراءة)",
    hoverCardCaption: "بطاقة التحويم (المحاذاة تنعكس على المحور السطري)",
    tourCaption: "الجولة (مرساة، بلا قناع، إطار من الـ skin)",
    fireTopLeft: "إطلاق topLeft",
    fireBottomRight: "إطلاق bottomRight",
    firedMessage: "دليل الموضع",
    firedDescription: "حاوية من الـ skin؛ حافة منطقية تحت RTL.",
    toastTitle: "التقرير جاهز",
    toastDescription: "اكتمل التصدير بدون أخطاء.",
    actionLabel: "تراجع",
    triggerArea: "انقر بالزر الأيمن داخل هذه المنطقة",
    tourAnchor: "هدف الجولة",
    tourStepTitle: "إطار الجولة من الـ skin",
    tourStepDescription: "زر الإغلاق في زاوية نهاية القراءة.",
    hoverTrigger: "@المعرف",
    hoverContent: "معاينة الملف الشخصي مطلية بسمة المستأجر.",
  },
};

/** Live notification triggers: must render inside NotificationProvider. */
function NotificationTriggers({ copy }: { copy: Record<string, string> }) {
  const [api] = useNotification();
  const fire = (placement: NotificationPlacement) =>
    api.info({
      message: copy.firedMessage,
      description: copy.firedDescription,
      placement,
      duration: 0,
    });

  return (
    <Box style={{ display: "flex", gap: 8 }} data-testid="k4a-notification-live">
      <button type="button" onClick={() => fire("topLeft")}>
        {copy.fireTopLeft}
      </button>
      <button type="button" onClick={() => fire("bottomRight")}>
        {copy.fireBottomRight}
      </button>
    </Box>
  );
}

const DROPDOWN_ITEMS = [
  { key: "group", type: "group" as const, label: "Actions" },
  { key: "edit", label: "Edit" },
  { key: "share", label: "Share", children: [{ key: "copy-link", label: "Copy link" }] },
  { key: "divider", type: "divider" as const },
  { key: "disabled", label: "Disabled", disabled: true },
  { key: "delete", label: "Delete", danger: true },
];

/**
 * Dismissible dropdown cell: starts open so capture cells document the
 * placement, but Escape/outside-click/item-click close it through
 * `onOpenChange` (a statically pinned `open` prop can never dismiss — the R1
 * interactive spec's Escape step failed on exactly that).
 */
function OpenableDropdown({
  placement,
  arrow,
  label,
  selectable,
}: {
  placement: DropdownPlacement;
  arrow?: boolean;
  label: string;
  selectable?: boolean;
}) {
  const [open, setOpen] = useState(true);
  return (
    <Dropdown
      open={open}
      onOpenChange={setOpen}
      placement={placement}
      arrow={arrow}
      trigger={["click"]}
      menu={{ items: DROPDOWN_ITEMS, selectable, selectedKeys: selectable ? ["edit"] : undefined }}
    >
      <button type="button">{label}</button>
    </Dropdown>
  );
}

function SpecimenTree({
  locale,
  state,
}: Pick<K4LaneAProbeProps, "locale" | "state">) {
  const copy = COPY[locale];
  // The lead feedback cells retune with the sweep state: rest -> success,
  // loading -> warning, error -> error (same markup otherwise).
  const leadTone = state === "loading" ? "warning" : state === "error" ? "error" : "success";

  return (
    <Stack spacing="lg" data-testid="k4a-root" data-ds-root="">
      <Heading level="h2" data-testid="k4a-title">
        {copy.title}
      </Heading>

      {/* Notification: in-flow item tones (no fixed overlay) + live provider */}
      <Stack spacing="sm" data-testid="k4a-notification">
        <Text size="xs" color="secondary">
          {copy.notificationCaption}
        </Text>
        <Stack spacing="sm" style={{ maxInlineSize: 420 }} data-testid="k4a-notification-items">
          <NotificationItem
            id="k4a-lead"
            type={leadTone === "warning" ? "warning" : leadTone === "error" ? "error" : "success"}
            message={copy.firedMessage}
            description={copy.firedDescription}
            duration={0}
            closable
          />
          <NotificationItem
            id="k4a-open"
            type="open"
            message={copy.firedMessage}
            duration={0}
            closable
            actions={<button type="button">{copy.actionLabel}</button>}
          />
        </Stack>
        <NotificationProvider>
          <NotificationTriggers copy={copy} />
        </NotificationProvider>
      </Stack>

      {/* Dropdown: open in-tree surfaces at the three logical alignments.
          The row spans the full frame with space-between and the centered
          placement in the middle, so at 390px every surface opens INWARD
          (in-tree placement has no collision handling by design): start hugs
          the start edge, end hugs the end edge, centre sits mid-frame. */}
      <Stack spacing="sm" data-testid="k4a-dropdown">
        <Text size="xs" color="secondary">
          {copy.dropdownCaption}
        </Text>
        <Stack
          direction="horizontal"
          spacing="lg"
          wrap
          style={{ alignItems: "flex-start", justifyContent: "space-between", inlineSize: "100%" }}
        >
          <Box data-testid="k4a-dropdown-start">
            <OpenableDropdown placement="bottomLeft" label="bottomLeft" selectable />
          </Box>
          <Box data-testid="k4a-dropdown-center">
            <OpenableDropdown placement="bottom" arrow label="bottom" />
          </Box>
          <Box data-testid="k4a-dropdown-end">
            <OpenableDropdown placement="bottomRight" label="bottomRight" />
          </Box>
        </Stack>
      </Stack>

      {/* ContextMenu: right-click target; the panel opens reading-start-ward */}
      <Stack spacing="sm" data-testid="k4a-contextmenu">
        <Text size="xs" color="secondary">
          {copy.contextMenuCaption}
        </Text>
        <ContextMenu
          items={[
            { key: "group", type: "group", label: "Actions" },
            { key: "open", label: "Open", shortcut: "O" },
            { key: "divider", type: "divider" },
            { key: "disabled", label: "Disabled", disabled: true },
            { key: "delete", label: "Delete", danger: true },
          ]}
          trigger={
            <Box
              style={{
                border: "1px dashed var(--ds-color-border-subtle)",
                borderRadius: "var(--ds-radius-md)",
                padding: 24,
                maxInlineSize: 420,
              }}
            >
              <Text size="sm">{copy.triggerArea}</Text>
            </Box>
          }
          onSelect={() => undefined}
        />
      </Stack>

      {/* HoverCard: controlled-open cards; align mirrors along the inline axis.
          minBlockSize reserves the card's open footprint so the statically
          open surfaces never cover the next section's cells in captures. */}
      <Stack spacing="sm" data-testid="k4a-hovercard" style={{ minBlockSize: 132 }}>
        <Text size="xs" color="secondary">
          {copy.hoverCardCaption}
        </Text>
        <Stack direction="horizontal" spacing="lg" wrap style={{ alignItems: "flex-start" }}>
          <Box data-testid="k4a-hovercard-start">
            <HoverCard open side="bottom" align="start" content={<Text size="sm">{copy.hoverContent}</Text>} trigger={<Text size="sm">{copy.hoverTrigger}</Text>} />
          </Box>
          <Box data-testid="k4a-hovercard-end">
            <HoverCard open side="bottom" align="end" content={<Text size="sm">{copy.hoverContent}</Text>} trigger={<Text size="sm">{copy.hoverTrigger}</Text>} />
          </Box>
          <Box data-testid="k4a-hovercard-top">
            <HoverCard open side="top" align="center" content={<Text size="sm">{copy.hoverContent}</Text>} trigger={<Text size="sm">{copy.hoverTrigger}</Text>} />
          </Box>
        </Stack>
      </Stack>

      {/* Toast: tone row, action + progress + closable chrome (standalone).
          DELIBERATELY the section right before Tour (R2): the statically open
          Tour surface is fixed and can flip above its anchor when the anchor
          is near the viewport edge, covering whatever sits ~one section above
          it. Toast is the only family with NO interactive spec step, so the
          surface can never intercept a pointer over an interactive cell
          (it covered the HoverCard trigger before this reorder). */}
      <Stack spacing="sm" data-testid="k4a-toast">
        <Text size="xs" color="secondary">
          {copy.toastCaption}
        </Text>
        <Stack spacing="sm" style={{ maxInlineSize: 420 }}>
          <Box data-testid="k4a-toast-lead">
            <Toast
              engine="modern"
              variant={leadTone}
              title={copy.toastTitle}
              description={copy.toastDescription}
              duration={0}
              showProgress={false}
              closable
              visible
            />
          </Box>
          <Toast
            engine="modern"
            variant="info"
            title={copy.toastTitle}
            duration={0}
            showProgress={false}
            closable
            action={{ label: copy.actionLabel, onClick: () => undefined }}
            visible
          />
          <Toast
            engine="modern"
            variant="gradient"
            title={copy.toastTitle}
            description={copy.toastDescription}
            duration={0}
            showProgress={false}
            closable
            visible
          />
        </Stack>
      </Stack>

      {/* Tour: anchored step, mask off (spotlight + skin-owned chrome). Kept
          LAST so its open surface only ever neighbours the non-interactive
          toast section. */}
      <Stack spacing="sm" data-testid="k4a-tour">
        <Text size="xs" color="secondary">
          {copy.tourCaption}
        </Text>
        <Box
          data-testid="k4a-tour-anchor"
          style={{
            display: "inline-block",
            border: "1px solid var(--ds-color-border-subtle)",
            borderRadius: "var(--ds-radius-md)",
            padding: "8px 16px",
            maxInlineSize: 220,
          }}
        >
          <Text size="sm">{copy.tourAnchor}</Text>
        </Box>
        <Tour
          open
          mask={false}
          type="primary"
          steps={[
            {
              target: '[data-testid="k4a-tour-anchor"]',
              title: copy.tourStepTitle,
              description: copy.tourStepDescription,
            },
          ]}
          onClose={() => undefined}
          onFinish={() => undefined}
        />
      </Stack>
    </Stack>
  );
}

export function K4LaneAProbe({ source, locale, density, state, theme = "light" }: K4LaneAProbeProps) {
  return (
    <DesignSystemProvider
      tenantConfig={{ ...tenantConfig(source, locale, density), locale }}
      vertical="bithire"
      locale={locale}
      forceEngine="modern"
      forceTheme={theme}
    >
      <Box
        data-testid="k4a-canvas"
        style={{
          background: "var(--ds-color-background)",
          color: "var(--ds-color-text-primary)",
          minHeight: "100vh",
          inlineSize: "100%",
        }}
      >
        <Box
          data-testid="k4a-frame"
          data-k4a-source={source}
          data-k4a-density={density}
          data-k4a-state={state}
          data-k4a-theme={theme}
          dir={locale === "ar" ? "rtl" : "ltr"}
          style={{
            padding: 24,
            minHeight: "100vh",
            maxInlineSize: 880,
            marginInline: "auto",
          }}
        >
          <main>
            <h1
              style={{
                position: "absolute",
                inlineSize: 1,
                blockSize: 1,
                padding: 0,
                margin: -1,
                overflow: "hidden",
                clip: "rect(0 0 0 0)",
                whiteSpace: "nowrap",
                border: 0,
              }}
            >
              K4 lane A probe — feedback and overlay
            </h1>
            <SpecimenTree locale={locale} state={state} />
          </main>
        </Box>
      </Box>
    </DesignSystemProvider>
  );
}

export default K4LaneAProbe;
