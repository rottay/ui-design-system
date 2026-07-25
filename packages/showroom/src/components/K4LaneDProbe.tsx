"use client";

/**
 * K4 Lane D probe (showroom): stress inputs — Mentions, OTPInput, Transfer.
 *
 * One deterministic component tree for the three Lane-D families, rendered
 * under two opposing governed sources:
 *  - `bithire-static`: the checked-in BitHire BrandTheme (file-first path);
 *  - `themanagement-db`: the DB Appearance construction mirrored from
 *    `@/components/brand-locale-evidence` (DB-owned runtime path).
 *
 * Axes (all URL-addressable through the wired route):
 *  - locale EN/ES/AR — the AR cell sets `dir="rtl"` on the frame and is the
 *    RTL witness for the K4-D logical conversions (Transfer `panel-title`
 *    `margin-inline-start`, Mentions dropdown `inset-block-*`, and the
 *    mirrored Transfer pagination glyphs under `[dir='rtl']`);
 *  - density compact | comfortable | spacious through
 *    `appearance.general.density` (`comfortable` maps to the canonical
 *    `normal` alias) — witnesses the density-scaled OTP slot boxes and the
 *    `--ds-spacing-*` channels the drained Transfer geometry now rides;
 *  - state rest | error | disabled — Mentions `status="error"`, OTPInput
 *    `error + errorMessage`, Transfer has no error channel and renders its
 *    rest anatomy (documented); disabled renders all three disabled;
 *  - ground light | dark through `forceTheme` — BitHire carries authored
 *    dark channels; the DB source projects its Appearance over the dark base
 *    exactly as the production merge chain would.
 *
 * Long/hostile content is a fixture property of every cell (long option
 * labels, an unbreakable long word, long Transfer titles, long OTP error
 * copy), not a separate axis. The Mentions suggestion popup and the Transfer
 * search/pagination interactions open only on real input events, so their
 * open-state captures are e2e work (type `@a` / click the pager), not
 * something a static probe can render. No fixture value here is product
 * content.
 */

import {
  Box,
  DesignSystemProvider,
  Heading,
  Mentions,
  OTPInput,
  Stack,
  Transfer,
  bithireBrandTheme,
  type MentionsOption,
  type TenantConfig,
  type TransferItem,
} from "@rottay/design-system";

import { tenantConfigFor as brandLocaleTenantConfigFor } from "@/components/brand-locale-evidence";

export type K4LaneDSource = "bithire-static" | "themanagement-db";
export type K4LaneDLocale = "en" | "es" | "ar";
export type K4LaneDDensity = "compact" | "comfortable" | "spacious";
export type K4LaneDState = "rest" | "error" | "disabled";
export type K4LaneDGround = "light" | "dark";

export interface K4LaneDProbeProps {
  source: K4LaneDSource;
  locale: K4LaneDLocale;
  density: K4LaneDDensity;
  state: K4LaneDState;
  ground: K4LaneDGround;
}

/**
 * The tenant-facing Appearance vocabulary has no `comfortable` literal:
 * `normal` is the canonical alias (TenantAppearanceGeneral['density']).
 */
function toAppearanceDensity(
  density: K4LaneDDensity
): "compact" | "normal" | "spacious" {
  return density === "comfortable" ? "normal" : density;
}

function tenantConfig(
  source: K4LaneDSource,
  locale: K4LaneDLocale,
  density: K4LaneDDensity,
  ground: K4LaneDGround
): TenantConfig {
  if (source === "themanagement-db") {
    const base = brandLocaleTenantConfigFor("themanagementmiami", locale);
    return {
      ...base,
      theme: ground,
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
    theme: ground,
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
  K4LaneDLocale,
  {
    mentionsHeading: string;
    mentionsPlaceholder: string;
    mentionsValue: string;
    mentionsOptions: MentionsOption[];
    otpHeading: string;
    otpError: string;
    transferHeading: string;
    transferTitles: [string, string];
    transferItems: TransferItem[];
  }
> = {
  en: {
    mentionsHeading: "Mentions",
    mentionsPlaceholder: "Type @ to mention a teammate",
    mentionsValue:
      "Handoff note for the release review: @ please double-check the migration window with the infrastructure group.",
    mentionsOptions: [
      { value: "alejandra", label: "Alejandra Konstantinopoulos-Weissensteiner" },
      { value: "superlong", label: "SupercalifragilisticexpialidociousLongdomainname" },
      { value: "grace", label: "Grace Hopper — Compiler Lead, Distributed Systems Group" },
      { value: "edsger", label: "Edsger Dijkstra", disabled: true },
      { value: "barbara", label: "Barbara Liskov" },
    ],
    otpHeading: "OTPInput",
    otpError:
      "The verification code you entered has expired after three attempts; request a fresh code and try again.",
    transferHeading: "Transfer",
    transferTitles: ["Available permissions", "Granted permissions"],
    transferItems: [
      { key: "rec-read", title: "Read candidate records" },
      { key: "rec-write", title: "Create and edit candidate records" },
      { key: "rec-export", title: "Export personally identifiable information to CSV" },
      { key: "billing", title: "Manage billing and subscription invoices" },
      { key: "superlong", title: "SupercalifragilisticexpialidociousLongpermissionname" },
      { key: "audit", title: "View the immutable audit trail" },
      { key: "sso", title: "Configure single sign-on", disabled: true },
      { key: "api", title: "Generate API access tokens" },
      { key: "webhooks", title: "Manage outbound webhook subscriptions" },
      { key: "archive", title: "Archive closed requisitions" },
      { key: "templates", title: "Edit interview scorecard templates" },
      { key: "reports", title: "Schedule recurring analytics reports" },
    ],
  },
  es: {
    mentionsHeading: "Menciones",
    mentionsPlaceholder: "Escribe @ para mencionar a alguien",
    mentionsValue:
      "Nota de entrega para la revisión del release: @ por favor confirma la ventana de migración con el grupo de infraestructura.",
    mentionsOptions: [
      { value: "alejandra", label: "Alejandra Konstantinopoulos-Weissensteiner" },
      { value: "superlong", label: "SupercalifragilisticexpialidociousLongdomainname" },
      { value: "grace", label: "Grace Hopper — Líder de Compiladores, Grupo de Sistemas Distribuidos" },
      { value: "edsger", label: "Edsger Dijkstra", disabled: true },
      { value: "barbara", label: "Barbara Liskov" },
    ],
    otpHeading: "Código de verificación",
    otpError:
      "El código de verificación que ingresaste expiró después de tres intentos; solicita un código nuevo e inténtalo de nuevo.",
    transferHeading: "Transferencia",
    transferTitles: ["Permisos disponibles", "Permisos concedidos"],
    transferItems: [
      { key: "rec-read", title: "Leer expedientes de candidatos" },
      { key: "rec-write", title: "Crear y editar expedientes de candidatos" },
      { key: "rec-export", title: "Exportar información de identificación personal a CSV" },
      { key: "billing", title: "Gestionar facturas de facturación y suscripción" },
      { key: "superlong", title: "SupercalifragilisticexpialidociousLongpermissionname" },
      { key: "audit", title: "Ver el registro de auditoría inmutable" },
      { key: "sso", title: "Configurar inicio de sesión único", disabled: true },
      { key: "api", title: "Generar tokens de acceso a la API" },
      { key: "webhooks", title: "Gestionar suscripciones de webhooks salientes" },
      { key: "archive", title: "Archivar requisiciones cerradas" },
      { key: "templates", title: "Editar plantillas de evaluación de entrevistas" },
      { key: "reports", title: "Programar informes analíticos recurrentes" },
    ],
  },
  ar: {
    mentionsHeading: "الإشارات",
    mentionsPlaceholder: "اكتب @ للإشارة إلى زميل",
    mentionsValue:
      "ملاحظة تسليم لمراجعة الإصدار: @ يرجى التحقق مرة أخرى من نافذة الترحيل مع مجموعة البنية التحتية.",
    mentionsOptions: [
      { value: "alejandra", label: "أليخاندرا كونستانتينوبولوس-فايسنشتاينر" },
      { value: "superlong", label: "SupercalifragilisticexpialidociousLongdomainname" },
      { value: "grace", label: "غريس هوبر — قائدة المترجمات، مجموعة الأنظمة الموزعة" },
      { value: "edsger", label: "إدسخر ديكسترا", disabled: true },
      { value: "barbara", label: "باربارا ليسكوف" },
    ],
    otpHeading: "رمز التحقق",
    otpError:
      "انتهت صلاحية رمز التحقق الذي أدخلته بعد ثلاث محاولات؛ اطلب رمزًا جديدًا وحاول مرة أخرى.",
    transferHeading: "النقل",
    transferTitles: ["الأذونات المتاحة", "الأذونات الممنوحة"],
    transferItems: [
      { key: "rec-read", title: "قراءة سجلات المرشحين" },
      { key: "rec-write", title: "إنشاء سجلات المرشحين وتعديلها" },
      { key: "rec-export", title: "تصدير معلومات التعريف الشخصية إلى CSV" },
      { key: "billing", title: "إدارة فواتير الاشتراك والفوترة" },
      { key: "superlong", title: "SupercalifragilisticexpialidociousLongpermissionname" },
      { key: "audit", title: "عرض سجل التدقيق غير القابل للتغيير" },
      { key: "sso", title: "تكوين تسجيل الدخول الموحد", disabled: true },
      { key: "api", title: "إنشاء رموز الوصول إلى واجهة برمجة التطبيقات" },
      { key: "webhooks", title: "إدارة اشتراكات الويب هوك الصادرة" },
      { key: "archive", title: "أرشفة الطلبات المغلقة" },
      { key: "templates", title: "تحرير قوالب تقييم المقابلات" },
      { key: "reports", title: "جدولة التقارير التحليلية المتكررة" },
    ],
  },
};

function SpecimenTree({
  locale,
  state,
}: Pick<K4LaneDProbeProps, "locale" | "state">) {
  const copy = COPY[locale];
  const disabled = state === "disabled";
  const error = state === "error";

  return (
    <Stack spacing="xl" data-testid="k4d-root">
      <section data-testid="k4d-mentions">
        <Heading level="h2">{copy.mentionsHeading}</Heading>
        <div data-testid="k4d-mentions-primary">
          <Mentions
            options={copy.mentionsOptions}
            defaultValue={copy.mentionsValue}
            placeholder={copy.mentionsPlaceholder}
            status={error ? "error" : undefined}
            disabled={disabled}
            rows={3}
            onChange={() => undefined}
          />
        </div>
        {/* Fixed second posture: the warning channel renders in every cell. */}
        <div data-testid="k4d-mentions-warning">
          <Mentions
            options={copy.mentionsOptions}
            defaultValue={copy.mentionsValue}
            status="warning"
            rows={2}
            onChange={() => undefined}
          />
        </div>
      </section>

      <section data-testid="k4d-otpinput">
        <Heading level="h2">{copy.otpHeading}</Heading>
        <div data-testid="k4d-otp-primary">
          <OTPInput
            length={6}
            value={disabled ? "123" : "12"}
            error={error}
            errorMessage={error ? copy.otpError : undefined}
            disabled={disabled}
            onChange={() => undefined}
          />
        </div>
        {/* Fixed size pair: witnesses the data-size skin geometry + density scale. */}
        <Stack direction="horizontal" spacing="lg" wrap data-testid="k4d-otp-sizes">
          <OTPInput length={4} size="sm" value="12" onChange={() => undefined} />
          <OTPInput length={4} size="lg" value="12" onChange={() => undefined} />
        </Stack>
      </section>

      <section data-testid="k4d-transfer">
        <Heading level="h2">{copy.transferHeading}</Heading>
        <div data-testid="k4d-transfer-primary">
          <Transfer
            dataSource={copy.transferItems}
            defaultTargetKeys={["audit", "api"]}
            titles={copy.transferTitles}
            showSearch
            pagination={{ pageSize: 4 }}
            disabled={disabled}
            onChange={() => undefined}
          />
        </div>
        {/* Fixed second posture: one-way without pager/search chrome. */}
        <div data-testid="k4d-transfer-oneway">
          <Transfer
            dataSource={copy.transferItems.slice(0, 3)}
            defaultTargetKeys={["rec-read"]}
            oneWay
            onChange={() => undefined}
          />
        </div>
      </section>
    </Stack>
  );
}

export function K4LaneDProbe({ source, locale, density, state, ground }: K4LaneDProbeProps) {
  return (
    <DesignSystemProvider
      tenantConfig={{ ...tenantConfig(source, locale, density, ground), locale }}
      vertical="bithire"
      locale={locale}
      forceEngine="modern"
      forceTheme={ground}
    >
      <Box
        data-ds-root=""
        data-testid="k4d-canvas"
        style={{
          background: "var(--ds-color-background)",
          color: "var(--ds-color-text-primary)",
          minHeight: "100vh",
          inlineSize: "100%",
        }}
      >
        <Box
          data-testid="k4d-frame"
          data-k4d-source={source}
          data-k4d-density={density}
          data-k4d-state={state}
          data-k4d-ground={ground}
          dir={locale === "ar" ? "rtl" : "ltr"}
          style={{
            padding: 24,
            minHeight: "100vh",
            maxInlineSize: 720,
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
              K4 lane D probe — stress inputs
            </h1>
            <SpecimenTree locale={locale} state={state} />
          </main>
        </Box>
      </Box>
    </DesignSystemProvider>
  );
}

export default K4LaneDProbe;
