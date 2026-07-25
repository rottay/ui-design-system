"use client";

/**
 * K1 Lane B probe (showroom): text & boolean control families.
 *
 * One identical component tree for the eight Lane-B families (Input,
 * Textarea, PasswordInput, FormField, Checkbox, Radio, Switch, Toggle)
 * rendered under two opposing governed sources:
 *  - `bithire-static`: the checked-in BitHire BrandTheme (file-first path);
 *  - `themanagement-db`: the DB Appearance construction mirrored from
 *    `@/components/brand-locale-evidence` (DB-owned runtime path).
 *
 * The density posture sweeps compact | comfortable | spacious through
 * `appearance.general.density` only (`comfortable` maps to the canonical
 * `normal` alias at the Appearance boundary), and the locale sweep renders
 * EN/ES/AR with `dir="rtl"` for Arabic. Every cell is deterministic and
 * URL-addressable; no fixture value here is product content.
 */

import {
  Box,
  Checkbox,
  DesignSystemProvider,
  FormField,
  Heading,
  Input,
  PasswordInput,
  Radio,
  Stack,
  Switch,
  Text,
  Textarea,
  Toggle,
  bithireBrandTheme,
  type TenantConfig,
} from "@rottay/design-system";

import { tenantConfigFor as brandLocaleTenantConfigFor } from "@/components/brand-locale-evidence";

export type LaneBSource = "bithire-static" | "themanagement-db";
export type LaneBLocale = "en" | "es" | "ar";
export type LaneBDensity = "compact" | "comfortable" | "spacious";
export type LaneBState = "rest" | "disabled" | "error" | "loading";

export interface K1LaneBProbeProps {
  source: LaneBSource;
  locale: LaneBLocale;
  density: LaneBDensity;
  state: LaneBState;
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

const COPY: Record<LaneBLocale, Record<string, string>> = {
  en: {
    title: "Controls specimen",
    fullName: "Full name",
    fullNameHelp: "Exactly as it appears on the signed contract.",
    fullNamePlaceholder: "Ada Lovelace",
    bioLabel:
      "Candidate biography with an intentionally overlong label that must wrap without clipping or overlapping the control below",
    bioPlaceholder: "Summarize the candidate's track record…",
    passwordLabel: "Password",
    passwordError:
      "The password you entered does not meet the security policy: it must contain at least twelve characters, one uppercase letter, one number, and one special symbol.",
    addonLabel: "Monthly salary",
    addonError: "Enter a valid amount greater than zero.",
    notificationsLegend: "Notifications",
    notifyEmail: "Email digests",
    notifySms: "SMS alerts",
    notifyLong:
      "Push notifications for every pipeline stage transition including screening, interviews, offers, and counter-offers",
    billingLegend: "Billing cycle",
    billingMonthly: "Monthly",
    billingAnnual: "Annual (two months included)",
    toggleLabel: "Public profile",
    on: "On",
    off: "Off",
  },
  es: {
    title: "Espécimen de controles",
    fullName: "Nombre completo",
    fullNameHelp: "Tal como aparece en el contrato firmado.",
    fullNamePlaceholder: "Ada Lovelace",
    bioLabel:
      "Biografía del candidato con una etiqueta intencionadamente larga que debe ajustarse sin cortarse ni solapar el control inferior",
    bioPlaceholder: "Resume la trayectoria del candidato…",
    passwordLabel: "Contraseña",
    passwordError:
      "La contraseña introducida no cumple la política de seguridad: debe contener al menos doce caracteres, una letra mayúscula, un número y un símbolo especial.",
    addonLabel: "Salario mensual",
    addonError: "Ingrese un monto válido mayor que cero.",
    notificationsLegend: "Notificaciones",
    notifyEmail: "Resúmenes por correo",
    notifySms: "Alertas SMS",
    notifyLong:
      "Notificaciones push para cada transición de etapa del pipeline incluyendo cribado, entrevistas, ofertas y contraofertas",
    billingLegend: "Ciclo de facturación",
    billingMonthly: "Mensual",
    billingAnnual: "Anual (dos meses incluidos)",
    toggleLabel: "Perfil público",
    on: "Sí",
    off: "No",
  },
  ar: {
    title: "عينة عناصر التحكم",
    fullName: "الاسم الكامل",
    fullNameHelp: "كما يظهر تماماً في العقد الموقع.",
    fullNamePlaceholder: "أدا لوفلايس",
    bioLabel:
      "السيرة الذاتية للمرشح مع تسمية طويلة عمداً يجب أن تلتف دون اقتطاع أو تداخل مع عنصر التحكم أدناه",
    bioPlaceholder: "لخص مسيرة المرشح المهنية…",
    passwordLabel: "كلمة المرور",
    passwordError:
      "كلمة المرور التي أدخلتها لا تستوفي سياسة الأمان: يجب أن تحتوي على اثني عشر حرفاً على الأقل وحرف كبير واحد ورقم واحد ورمز خاص واحد.",
    addonLabel: "الراتب الشهري",
    addonError: "أدخل مبلغاً صالحاً أكبر من صفر.",
    notificationsLegend: "الإشعارات",
    notifyEmail: "ملخصات البريد",
    notifySms: "تنبيهات الرسائل",
    notifyLong:
      "إشعارات فورية لكل انتقال بين مراحل خط التوظيف بما في ذلك الفرز والمقابلات والعروض والعروض المضادة",
    billingLegend: "دورة الفوترة",
    billingMonthly: "شهري",
    billingAnnual: "سنوي (شهران مجاناً)",
    toggleLabel: "ملف عام",
    on: "نعم",
    off: "لا",
  },
};

function SpecimenTree({
  locale,
  state,
}: Pick<K1LaneBProbeProps, "locale" | "state">) {
  const copy = COPY[locale];
  const disabled = state === "disabled";
  const loading = state === "loading";
  const passwordError = state === "error" ? copy.passwordError : undefined;
  const addonError = state === "error" ? copy.addonError : undefined;

  return (
    <Stack spacing="lg" data-testid="lb-root">
      <Heading level="h2" data-testid="lb-title">
        {copy.title}
      </Heading>

      <FormField
        data-testid="lb-formfield"
        label={copy.fullName}
        name="lb-full-name"
        required
        help={copy.fullNameHelp}
        disabled={disabled}
      >
        <Input
          data-testid="lb-input"
          placeholder={copy.fullNamePlaceholder}
          clearable
          loading={loading}
        />
      </FormField>

      <FormField
        data-testid="lb-formfield-bio"
        label={copy.bioLabel}
        name="lb-bio"
        disabled={disabled}
      >
        <Textarea
          data-testid="lb-textarea"
          rows={3}
          showCount
          maxLength={280}
          allowClear
          placeholder={copy.bioPlaceholder}
        />
      </FormField>

      <FormField
        data-testid="lb-formfield-password"
        label={copy.passwordLabel}
        name="lb-password"
        required
        error={passwordError}
        disabled={disabled}
      >
        <PasswordInput
          data-testid="lb-password"
          defaultValue="sup3r-secret"
          strengthIndicator
          strengthLevel="fair"
        />
      </FormField>

      <FormField
        data-testid="lb-formfield-addon"
        label={copy.addonLabel}
        name="lb-addon"
        error={addonError}
        disabled={disabled}
      >
        <Input.Group compact data-testid="lb-addon-group">
          <Input.Addon position="before" data-testid="lb-addon-before">
            $
          </Input.Addon>
          <Input
            data-testid="lb-addon-input"
            defaultValue="12000"
            aria-label={copy.addonLabel}
          />
          <Input.Addon
            position="after"
            variant="transparent"
            data-testid="lb-addon-after"
          >
            .00
          </Input.Addon>
        </Input.Group>
      </FormField>

      <Stack spacing="xs" data-testid="lb-checkbox">
        <Text weight="semibold">{copy.notificationsLegend}</Text>
        <Checkbox.Group
          name="lb-notifications"
          disabled={disabled}
          defaultValue={["email"]}
          options={[
            { value: "email", label: copy.notifyEmail },
            { value: "sms", label: copy.notifySms },
            { value: "push", label: copy.notifyLong },
          ]}
        />
        {/* Certified single: the canonical engine paints data-part="box"
            (the Group options-renderer paints data-part="option-box"), so
            state/keyboard/coarse evidence samples this specimen. */}
        <div data-testid="lb-checkbox-single" style={{ flexShrink: 0 }}>
          <Checkbox
            name="lb-notify-email-single"
            value="email"
            label={copy.notifyEmail}
            defaultChecked
            disabled={disabled}
          />
        </div>
      </Stack>

      <Stack spacing="xs" data-testid="lb-radio">
        <Text weight="semibold">{copy.billingLegend}</Text>
        <Radio.Group
          name="lb-billing"
          disabled={disabled}
          defaultValue="annual"
          options={[
            { value: "monthly", label: copy.billingMonthly },
            { value: "annual", label: copy.billingAnnual },
          ]}
        />
        <div data-testid="lb-radio-single" style={{ flexShrink: 0 }}>
          <Radio
            name="lb-billing-single"
            value="monthly"
            label={copy.billingMonthly}
            disabled={disabled}
          />
        </div>
      </Stack>

      <Stack direction="horizontal" spacing="xl" wrap data-testid="lb-switch-toggle-row">
        <div data-testid="lb-switch" style={{ flexShrink: 0 }}>
          <Switch
            defaultChecked
            disabled={disabled}
            loading={loading}
            checkedChildren={copy.on}
            unCheckedChildren={copy.off}
          />
        </div>
        <div data-testid="lb-toggle" style={{ flexShrink: 0 }}>
          <Toggle
            label={copy.toggleLabel}
            defaultChecked
            disabled={disabled}
            loading={loading}
          />
        </div>
      </Stack>
    </Stack>
  );
}

export function K1LaneBProbe({ source, locale, density, state }: K1LaneBProbeProps) {
  return (
    <DesignSystemProvider
      tenantConfig={{ ...tenantConfig(source, locale, density), locale }}
      vertical="bithire"
      locale={locale}
      forceEngine="modern"
      forceTheme="light"
    >
      <Box
        data-testid="lb-canvas"
        style={{
          background: "var(--ds-color-background)",
          color: "var(--ds-color-text-primary)",
          minHeight: "100vh",
          inlineSize: "100%",
        }}
      >
        <Box
          data-testid="lb-frame"
          data-lb-source={source}
          data-lb-density={density}
          data-lb-state={state}
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
