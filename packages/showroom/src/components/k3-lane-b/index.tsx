"use client";

/**
 * K3 Lane B probe (showroom): navigation families.
 *
 * One identical component tree for the six Lane-B families (Menu, Breadcrumb,
 * Pagination, Segmented, Steps, Stepper) rendered under two opposing
 * governed sources:
 *  - `bithire-static`: the checked-in BitHire BrandTheme (file-first path);
 *  - `themanagement-db`: the DB Appearance construction mirrored from
 *    `@/components/brand-locale-evidence` (DB-owned runtime path).
 *
 * The density posture sweeps compact | comfortable | spacious through
 * `appearance.general.density` only (`comfortable` maps to the canonical
 * `normal` alias at the Appearance boundary), and the locale sweep renders
 * EN/ES/AR with `dir="rtl"` for Arabic — the lane's indentation, connector
 * and seam hooks are logical, so the Arabic cell is the RTL witness.
 *
 * The state axis is `rest | disabled | error`: Pagination and Segmented own
 * a whole-control disabled posture; Menu/Steps/Stepper carry disabled ITEMS
 * in every cell (their per-item disabled contract); Steps/Stepper own the
 * error posture through the `status` prop on the current step; Breadcrumb
 * has neither and renders its rest anatomy in every state cell (the K3-A
 * pattern — no contract exists for it). Every cell is deterministic and
 * URL-addressable; no fixture value here is product content.
 */

import { useState } from "react";

import {
  Box,
  Breadcrumb,
  DesignSystemProvider,
  Heading,
  Menu,
  Pagination,
  Segmented,
  Stack,
  Stepper,
  Steps,
  Text,
  bithireBrandTheme,
  type TenantConfig,
} from "@rottay/design-system";
import { Icon } from "@rottay/design-system/icons";

import { tenantConfigFor as brandLocaleTenantConfigFor } from "@/components/brand-locale-evidence";

export type LaneBSource = "bithire-static" | "themanagement-db";
export type LaneBLocale = "en" | "es" | "ar";
export type LaneBDensity = "compact" | "comfortable" | "spacious";
export type LaneBState = "rest" | "disabled" | "error";

/**
 * Pass-2 visual-evidence variants: isolated cells for the state postures the
 * default tree cannot show at once. Absent by default — the lane's e2e spec
 * and axe matrix always render the default tree, so these are purely
 * additive (URL-addressable) capture cells.
 *
 *  - `menu-collapsed`: submenus closed + the `inline`/`inlineCollapsed`
 *    icon rail (the default tree only shows the expanded submenu).
 *  - `breadcrumb-overflow`: 7 crumbs under `maxItems={4}` — the ellipsis
 *    overflow contract.
 *  - `pagination-compact`: `size="sm"` dense posture.
 *  - `steps-finished`: `current` past the last step — every step `finish`.
 *  - `stepper-horizontal`: the horizontal direction (default is vertical).
 */
export type LaneBVariant =
  | "menu-collapsed"
  | "breadcrumb-overflow"
  | "pagination-compact"
  | "steps-finished"
  | "stepper-horizontal";

export interface K3LaneBProbeProps {
  source: LaneBSource;
  locale: LaneBLocale;
  density: LaneBDensity;
  state: LaneBState;
  variant?: LaneBVariant;
}

/**
 * The tenant-facing Appearance vocabulary has no `comfortable` literal:
 * `normal` is the canonical alias (TenantAppearanceGeneral['density']).
 */
function toAppearanceDensity(
  density: LaneBDensity
): "compact" | "normal" | "spacious" {
  return density === "comfortable" ? "normal" : density;
}

function tenantConfig(
  source: LaneBSource,
  locale: LaneBLocale,
  density: LaneBDensity
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

const COPY: Record<
  LaneBLocale,
  {
    navTitle: string;
    menuDashboard: string;
    menuAnalytics: string;
    menuSettings: string;
    menuProfile: string;
    menuBilling: string;
    menuWorkspace: string;
    menuMembers: string;
    menuMembersLong: string;
    menuDelete: string;
    crumbHome: string;
    crumbCatalog: string;
    crumbLong: string;
    crumbBrand: string;
    crumbEditorial: string;
    crumbCurrent: string;
    paginationLabel: string;
    segmentedLabel: string;
    segList: string;
    segGrid: string;
    segCards: string;
    stepsTitle: string;
    stepAccount: string;
    stepAccountDesc: string;
    stepVerification: string;
    stepVerificationSub: string;
    stepVerificationDesc: string;
    stepPayment: string;
    stepPaymentDesc: string;
    stepDone: string;
    stepperAccount: string;
    stepperAccountDesc: string;
    stepperReview: string;
    stepperReviewDesc: string;
    stepperPublish: string;
    stepperPublishDesc: string;
  }
> = {
  en: {
    navTitle: "Navigation specimen",
    menuDashboard: "Dashboard",
    menuAnalytics: "Analytics",
    menuSettings: "Settings",
    menuProfile: "Profile",
    menuBilling: "Billing",
    menuWorkspace: "Workspace",
    menuMembers: "Members",
    menuMembersLong:
      "Workspace members with an intentionally overlong label that must ellipsize cleanly inside the menu frame",
    menuDelete: "Delete workspace",
    crumbHome: "Home",
    crumbCatalog: "Catalog",
    crumbLong: "Seasonal collection with a deliberately long segment label",
    crumbBrand: "Brand",
    crumbEditorial: "Editorial",
    crumbCurrent: "Current page",
    paginationLabel: "Results pages",
    segmentedLabel: "View mode",
    segList: "List",
    segGrid: "Grid",
    segCards: "Cards",
    stepsTitle: "Onboarding flow",
    stepAccount: "Account",
    stepAccountDesc: "Create your credentials",
    stepVerification: "Verification",
    stepVerificationSub: "Required",
    stepVerificationDesc: "Confirm the work email address",
    stepPayment: "Payment",
    stepPaymentDesc: "Add a billing method",
    stepDone: "Done",
    stepperAccount: "Draft",
    stepperAccountDesc: "Write content",
    stepperReview: "Review",
    stepperReviewDesc: "Check details",
    stepperPublish: "Publish",
    stepperPublishDesc: "Go live",
  },
  es: {
    navTitle: "Espécimen de navegación",
    menuDashboard: "Panel",
    menuAnalytics: "Analítica",
    menuSettings: "Configuración",
    menuProfile: "Perfil",
    menuBilling: "Facturación",
    menuWorkspace: "Espacio de trabajo",
    menuMembers: "Miembros",
    menuMembersLong:
      "Miembros del espacio de trabajo con una etiqueta intencionadamente larga que debe elidir limpiamente dentro del marco del menú",
    menuDelete: "Eliminar espacio",
    crumbHome: "Inicio",
    crumbCatalog: "Catálogo",
    crumbLong: "Colección de temporada con una etiqueta de segmento deliberadamente larga",
    crumbBrand: "Marca",
    crumbEditorial: "Editorial",
    crumbCurrent: "Página actual",
    paginationLabel: "Páginas de resultados",
    segmentedLabel: "Modo de vista",
    segList: "Lista",
    segGrid: "Cuadrícula",
    segCards: "Tarjetas",
    stepsTitle: "Flujo de incorporación",
    stepAccount: "Cuenta",
    stepAccountDesc: "Crea tus credenciales",
    stepVerification: "Verificación",
    stepVerificationSub: "Requerido",
    stepVerificationDesc: "Confirma el correo de trabajo",
    stepPayment: "Pago",
    stepPaymentDesc: "Añade un método de facturación",
    stepDone: "Listo",
    stepperAccount: "Borrador",
    stepperAccountDesc: "Escribir contenido",
    stepperReview: "Revisión",
    stepperReviewDesc: "Revisar detalles",
    stepperPublish: "Publicar",
    stepperPublishDesc: "Salir en vivo",
  },
  ar: {
    navTitle: "عينة التنقل",
    menuDashboard: "لوحة التحكم",
    menuAnalytics: "التحليلات",
    menuSettings: "الإعدادات",
    menuProfile: "الملف الشخصي",
    menuBilling: "الفوترة",
    menuWorkspace: "مساحة العمل",
    menuMembers: "الأعضاء",
    menuMembersLong:
      "أعضاء مساحة العمل مع تسمية طويلة عمداً يجب أن تُقتطع بأناقة داخل إطار القائمة",
    menuDelete: "حذف مساحة العمل",
    crumbHome: "الرئيسية",
    crumbCatalog: "الكتالوج",
    crumbLong: "مجموعة الموسم مع تسمية قطعة طويلة عمداً",
    crumbBrand: "العلامة",
    crumbEditorial: "الإصدارات",
    crumbCurrent: "الصفحة الحالية",
    paginationLabel: "صفحات النتائج",
    segmentedLabel: "وضع العرض",
    segList: "قائمة",
    segGrid: "شبكة",
    segCards: "بطاقات",
    stepsTitle: "مسار الإعداد",
    stepAccount: "الحساب",
    stepAccountDesc: "أنشئ بيانات الدخول",
    stepVerification: "التحقق",
    stepVerificationSub: "مطلوب",
    stepVerificationDesc: "أكّد بريد العمل الإلكتروني",
    stepPayment: "الدفع",
    stepPaymentDesc: "أضف وسيلة فوترة",
    stepDone: "تم",
    stepperAccount: "مسودة",
    stepperAccountDesc: "كتابة المحتوى",
    stepperReview: "مراجعة",
    stepperReviewDesc: "تدقيق التفاصيل",
    stepperPublish: "نشر",
    stepperPublishDesc: "الإطلاق المباشر",
  },
};

/** The shared menu specimen: one tree, reused by the default and variant cells. */
function menuItems(copy: (typeof COPY)[LaneBLocale]) {
  return [
    { key: "dashboard", label: copy.menuDashboard, icon: <Icon name="navigation.home" decorative /> },
    { key: "analytics", label: copy.menuAnalytics, icon: <Icon name="analytics.dashboard" decorative /> },
    {
      key: "settings",
      label: copy.menuSettings,
      icon: <Icon name="navigation.settings" decorative />,
      children: [
        { key: "profile", label: copy.menuProfile },
        { key: "billing", label: copy.menuBilling, disabled: true },
      ],
    },
    { key: "divider-1", type: "divider" as const, label: "" },
    {
      key: "workspace",
      type: "group" as const,
      label: copy.menuWorkspace,
      children: [
        { key: "members", label: copy.menuMembers },
        { key: "members-long", label: copy.menuMembersLong },
      ],
    },
    { key: "delete", label: copy.menuDelete, danger: true, icon: <Icon name="action.delete" decorative /> },
  ];
}

function SpecimenTree({
  locale,
  state,
}: Pick<K3LaneBProbeProps, "locale" | "state">) {
  const copy = COPY[locale];
  const disabled = state === "disabled";
  const stepStatus = state === "error" ? ("error" as const) : ("process" as const);

  // Pagination/Steps are controlled-only contracts; the probe holds their
  // current page/step so keyboard/pointer activation is observable.
  const [page, setPage] = useState(6);
  const [step, setStep] = useState(1);

  return (
    <Stack spacing="xl" data-testid="k3b-root">
      <Heading level="h2" data-testid="k3b-title">
        {copy.navTitle}
      </Heading>

      <div data-testid="k3b-menu">
        <Menu
          mode="vertical"
          defaultSelectedKeys={["analytics"]}
          defaultOpenKeys={["settings"]}
          items={menuItems(copy)}
        />
      </div>

      <div data-testid="k3b-breadcrumb">
        <Breadcrumb
          items={[
            { key: "home", label: copy.crumbHome, href: "#", icon: <Icon name="navigation.home" decorative /> },
            { key: "catalog", label: copy.crumbCatalog, href: "#" },
            { key: "long", label: copy.crumbLong, href: "#" },
            { key: "current", label: copy.crumbCurrent },
          ]}
        />
      </div>

      <div data-testid="k3b-pagination">
        <Text size="sm" color="secondary">
          {copy.paginationLabel}
        </Text>
        <Pagination
          current={page}
          total={230}
          pageSize={10}
          showTotal
          disabled={disabled}
          onChange={(next) => setPage(next)}
        />
      </div>

      <div data-testid="k3b-segmented">
        <Segmented
          ariaLabel={copy.segmentedLabel}
          defaultValue="grid"
          disabled={disabled}
          options={[
            { label: copy.segList, value: "list", icon: <Icon name="layout.list" decorative /> },
            { label: copy.segGrid, value: "grid", icon: <Icon name="layout.grid" decorative /> },
            { label: copy.segCards, value: "cards", icon: <Icon name="layout.cards" decorative />, disabled: true },
          ]}
        />
      </div>

      <Stack spacing="xs" data-testid="k3b-steps">
        <Text weight="semibold">{copy.stepsTitle}</Text>
        <Steps
          current={step}
          status={stepStatus}
          onChange={(next) => setStep(next)}
          items={[
            { title: copy.stepAccount, description: copy.stepAccountDesc },
            {
              title: copy.stepVerification,
              subTitle: copy.stepVerificationSub,
              description: copy.stepVerificationDesc,
            },
            { title: copy.stepPayment, description: copy.stepPaymentDesc },
            { title: copy.stepDone, disabled: true },
          ]}
        />
      </Stack>

      <div data-testid="k3b-stepper">
        <Stepper
          direction="vertical"
          clickable
          defaultCurrent={1}
          status={stepStatus}
          items={[
            { title: copy.stepperAccount, description: copy.stepperAccountDesc },
            { title: copy.stepperReview, description: copy.stepperReviewDesc },
            { title: copy.stepperPublish, description: copy.stepperPublishDesc, disabled: true },
          ]}
        />
      </div>
    </Stack>
  );
}

/**
 * The Pass-2 variant cells (see {@link LaneBVariant}). Rendered INSTEAD of
 * the default tree when `variant` is present, so each capture isolates one
 * posture. Same wrappers (`k3b-root`/`k3b-frame`) as the default tree.
 */
function VariantTree({
  locale,
  state,
  variant,
}: Pick<K3LaneBProbeProps, "locale" | "state" | "variant">) {
  const copy = COPY[locale];
  const stepStatus = state === "error" ? ("error" as const) : ("process" as const);

  // Pagination/Steps are controlled-only contracts; the probe holds their
  // current page/step so keyboard/pointer activation is observable.
  const [page, setPage] = useState(6);
  const [step, setStep] = useState(1);

  return (
    <Stack spacing="xl" data-testid="k3b-root">
      <Heading level="h2" data-testid="k3b-title">
        {copy.navTitle}
      </Heading>

      {variant === "menu-collapsed" ? (
        <>
          <div data-testid="k3b-menu-collapsed">
            <Menu
              mode="vertical"
              defaultSelectedKeys={["analytics"]}
              items={menuItems(copy)}
            />
          </div>
          <div data-testid="k3b-menu-rail">
            <Menu
              mode="inline"
              inlineCollapsed
              defaultSelectedKeys={["analytics"]}
              items={menuItems(copy)}
            />
          </div>
        </>
      ) : null}

      {variant === "breadcrumb-overflow" ? (
        <div data-testid="k3b-breadcrumb-overflow">
          <Breadcrumb
            maxItems={4}
            items={[
              { key: "home", label: copy.crumbHome, href: "#", icon: <Icon name="navigation.home" decorative /> },
              { key: "catalog", label: copy.crumbCatalog, href: "#" },
              { key: "long", label: copy.crumbLong, href: "#" },
              { key: "brand", label: copy.crumbBrand, href: "#" },
              { key: "editorial", label: copy.crumbEditorial, href: "#" },
              { key: "current", label: copy.crumbCurrent },
            ]}
          />
        </div>
      ) : null}

      {variant === "pagination-compact" ? (
        <div data-testid="k3b-pagination-compact">
          <Text size="sm" color="secondary">
            {copy.paginationLabel}
          </Text>
          <Pagination
            size="sm"
            current={page}
            total={230}
            pageSize={10}
            showTotal
            disabled={state === "disabled"}
            onChange={(next) => setPage(next)}
          />
        </div>
      ) : null}

      {variant === "steps-finished" ? (
        <Stack spacing="xs" data-testid="k3b-steps-finished">
          <Text weight="semibold">{copy.stepsTitle}</Text>
          <Steps
            current={3}
            items={[
              { title: copy.stepAccount, description: copy.stepAccountDesc },
              { title: copy.stepVerification, description: copy.stepVerificationDesc },
              { title: copy.stepDone },
            ]}
          />
        </Stack>
      ) : null}

      {variant === "stepper-horizontal" ? (
        <div data-testid="k3b-stepper-horizontal">
          <Stepper
            direction="horizontal"
            clickable
            current={step}
            status={stepStatus}
            onChange={(next) => setStep(next)}
            items={[
              { title: copy.stepperAccount, description: copy.stepperAccountDesc },
              { title: copy.stepperReview, description: copy.stepperReviewDesc },
              { title: copy.stepperPublish, description: copy.stepperPublishDesc, disabled: true },
            ]}
          />
        </div>
      ) : null}
    </Stack>
  );
}

export function K3LaneBProbe({ source, locale, density, state, variant }: K3LaneBProbeProps) {
  return (
    <DesignSystemProvider
      tenantConfig={{ ...tenantConfig(source, locale, density), locale }}
      vertical="bithire"
      locale={locale}
      forceEngine="modern"
      forceTheme="light"
    >
      <Box
        data-testid="k3b-canvas"
        style={{
          background: "var(--ds-color-background)",
          color: "var(--ds-color-text-primary)",
          minHeight: "100vh",
          inlineSize: "100%",
        }}
      >
        <Box
          data-testid="k3b-frame"
          data-k3b-source={source}
          data-k3b-density={density}
          data-k3b-state={state}
          dir={locale === "ar" ? "rtl" : "ltr"}
          style={{
            padding: 24,
            minHeight: "100vh",
            maxInlineSize: 760,
            marginInline: "auto",
          }}
        >
          {variant === undefined ? (
            <SpecimenTree locale={locale} state={state} />
          ) : (
            <VariantTree locale={locale} state={state} variant={variant} />
          )}
        </Box>
      </Box>
    </DesignSystemProvider>
  );
}
