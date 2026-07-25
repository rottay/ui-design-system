"use client";

/**
 * K1 Lane C probe (showroom): feedback & readiness families.
 *
 * One identical component tree for the eight Lane-C families (Alert, Callout,
 * Message, Progress, Skeleton, Spinner, Empty, Result) rendered under two
 * opposing governed sources:
 *  - `bithire-static`: the checked-in BitHire BrandTheme (file-first path);
 *  - `themanagement-db`: the DB Appearance construction mirrored from
 *    `@/components/brand-locale-evidence` (DB-owned runtime path).
 *
 * The density posture sweeps compact | comfortable | spacious through
 * `appearance.general.density` only (`comfortable` maps to the canonical
 * `normal` alias at the Appearance boundary), the locale sweep renders
 * EN/ES/AR with `dir="rtl"` for Arabic, and the state sweep (rest | loading |
 * empty | error) retunes tones/statuses on the SAME markup -- the tree never
 * changes shape, so every data-testid exists in every cell. Every cell is
 * deterministic and URL-addressable; no fixture value here is product content.
 */

import {
  Alert,
  Box,
  Button,
  Callout,
  DesignSystemProvider,
  Empty,
  Heading,
  MessageItem,
  Progress,
  Result,
  Skeleton,
  Spinner,
  Stack,
  bithireBrandTheme,
  type TenantConfig,
} from "@rottay/design-system";

import { tenantConfigFor as brandLocaleTenantConfigFor } from "@/components/brand-locale-evidence";

export type LaneCSource = "bithire-static" | "themanagement-db";
export type LaneCLocale = "en" | "es" | "ar";
export type LaneCDensity = "compact" | "comfortable" | "spacious";
export type LaneCState = "rest" | "loading" | "empty" | "error";

export interface K1LaneCProbeProps {
  source: LaneCSource;
  locale: LaneCLocale;
  density: LaneCDensity;
  state: LaneCState;
}

/**
 * The tenant-facing Appearance vocabulary has no `comfortable` literal:
 * `normal` is the canonical alias (TenantAppearanceGeneral['density']).
 */
function toAppearanceDensity(
  density: LaneCDensity
): "compact" | "normal" | "spacious" {
  return density === "comfortable" ? "normal" : density;
}

function tenantConfig(
  source: LaneCSource,
  locale: LaneCLocale,
  density: LaneCDensity
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

const COPY: Record<LaneCLocale, Record<string, string>> = {
  en: {
    title: "Feedback & readiness specimen",
    alertTitle: "Certificate expiring",
    alertBody:
      "The TLS certificate for the evidence archive expires in 14 days. Renew it from the security console to keep synchronization running for every workspace in this tenant without interruption.",
    calloutTitle:
      "Quarterly compliance review window opens next Monday at 09:00 UTC for all workspaces in this tenant",
    calloutBody:
      "Prepare the evidence packages ahead of the window. Packages that were rejected in the previous cycle keep their review state and can be resubmitted directly from the operations dashboard without losing the audit trail.",
    calloutAction: "Open dashboard",
    calloutInfoTitle: "Scheduled maintenance",
    calloutInfoBody: "Reporting exports pause for 20 minutes on Sunday.",
    messageContent: "Evidence package uploaded and queued for review.",
    messageLoading: "Uploading evidence package…",
    emptyDescription:
      "No candidates match the current filter combination across all three active pipelines. Loosen the seniority requirement or clear the location filter to widen the pool.",
    emptyAction: "Create candidate",
    resultTitle: "Evidence package approved for the quarterly audit trail",
    resultBody:
      "All 14 documents passed review. The package is now locked and the signed audit receipt is available from the operations dashboard.",
    resultErrorTitle: "Evidence package rejected during the final verification pass",
    resultErrorBody:
      "Three documents failed the integrity check. Re-upload the corrected files; every approved document keeps its current review state.",
    resultAction: "View package",
    resultRetry: "Re-upload files",
    spinnerLabel: "Synchronizing workspaces",
    skeletonCaption: "Card-shaped placeholder",
  },
  es: {
    title: "Espécimen de feedback y preparación",
    alertTitle: "Certificado por caducar",
    alertBody:
      "El certificado TLS del archivo de evidencias caduca en 14 días. Renuévelo desde la consola de seguridad para mantener la sincronización de todos los espacios de trabajo sin interrupciones.",
    calloutTitle:
      "La ventana de revisión de cumplimiento trimestral abre el próximo lunes a las 09:00 UTC para todos los espacios de trabajo",
    calloutBody:
      "Prepare los paquetes de evidencia antes de la ventana. Los paquetes rechazados en el ciclo anterior conservan su estado de revisión y pueden reenviarse directamente desde el panel de operaciones sin perder el rastro de auditoría.",
    calloutAction: "Abrir panel",
    calloutInfoTitle: "Mantenimiento programado",
    calloutInfoBody: "Las exportaciones de informes se pausan 20 minutos el domingo.",
    messageContent: "Paquete de evidencia subido y en cola para revisión.",
    messageLoading: "Subiendo paquete de evidencia…",
    emptyDescription:
      "Ningún candidato coincide con la combinación de filtros actual en los tres pipelines activos. Amplíe el requisito de antigüedad o quite el filtro de ubicación para ampliar el grupo.",
    emptyAction: "Crear candidato",
    resultTitle: "Paquete de evidencia aprobado para la auditoría trimestral",
    resultBody:
      "Los 14 documentos pasaron la revisión. El paquete queda bloqueado y el recibo de auditoría firmado está disponible en el panel de operaciones.",
    resultErrorTitle: "Paquete de evidencia rechazado en la verificación final",
    resultErrorBody:
      "Tres documentos no superaron la comprobación de integridad. Vuelva a subir los archivos corregidos; cada documento aprobado conserva su estado de revisión.",
    resultAction: "Ver paquete",
    resultRetry: "Volver a subir archivos",
    spinnerLabel: "Sincronizando espacios de trabajo",
    skeletonCaption: "Marcador con forma de tarjeta",
  },
  ar: {
    title: "عينة التغذية الراجعة والجاهزية",
    alertTitle: "الشهادة على وشك الانتهاء",
    alertBody:
      "تنتهي صلاحية شهادة TLS لأرشيف الأدلة خلال 14 يوماً. جددها من وحدة تحكم الأمان للحفاظ على استمرار المزامنة لجميع مساحات العمل دون انقطاع.",
    calloutTitle:
      "تفتح نافذة مراجعة الامتثال الفصلية يوم الاثنين المقبل الساعة 09:00 بتوقيت UTC لجميع مساحات العمل",
    calloutBody:
      "جهز حزم الأدلة قبل النافذة. تحتفظ الحزم المرفوضة في الدورة السابقة بحالة المراجعة ويمكن إعادة تقديمها مباشرة من لوحة العمليات دون فقدان سجل التدقيق.",
    calloutAction: "فتح اللوحة",
    calloutInfoTitle: "صيانة مجدولة",
    calloutInfoBody: "تتوقف عمليات تصدير التقارير لمدة 20 دقيقة يوم الأحد.",
    messageContent: "تم رفع حزمة الأدلة وهي في قائمة المراجعة.",
    messageLoading: "جاري رفع حزمة الأدلة…",
    emptyDescription:
      "لا يوجد مرشحون يطابقون مجموعة المرشحات الحالية عبر خطوط التوظيف الثلاثة النشطة. خفف شرط الأقدمية أو امسح مرشح الموقع لتوسيع المجموعة.",
    emptyAction: "إنشاء مرشح",
    resultTitle: "تمت الموافقة على حزمة الأدلة لسجل التدقيق الفصلي",
    resultBody:
      "اجتازت جميع الوثائق الأربع عشرة المراجعة. أصبحت الحزمة مقفلة الآن وإيصال التدقيق الموقع متاح من لوحة العمليات.",
    resultErrorTitle: "رفضت حزمة الأدلة أثناء التحقق النهائي",
    resultErrorBody:
      "فشلت ثلاث وثائق في فحص السلامة. أعد رفع الملفات المصححة؛ تحتفظ كل وثيقة معتمدة بحالة المراجعة الحالية.",
    resultAction: "عرض الحزمة",
    resultRetry: "إعادة رفع الملفات",
    spinnerLabel: "جاري مزامنة مساحات العمل",
    skeletonCaption: "عنصر نائب بشكل بطاقة",
  },
};

function SpecimenTree({
  locale,
  state,
}: Pick<K1LaneCProbeProps, "locale" | "state">) {
  const copy = COPY[locale];
  const loading = state === "loading";
  const error = state === "error";

  return (
    <Stack spacing="lg" data-testid="lc-root">
      <Heading level="h2" data-testid="lc-title">
        {copy.title}
      </Heading>

      {/* Alert: title + long body + dismiss, two tones (state retunes the first) */}
      <Stack spacing="sm" data-testid="lc-alert">
        <Alert
          tone={error ? "danger" : loading ? "info" : "warning"}
          message={copy.alertTitle}
          description={copy.alertBody}
          closable
          showIcon
        />
        <Alert tone="success" message={copy.messageContent} compact showIcon />
      </Stack>

      {/* Callout: overlong title + long body + action + dismiss, two tones */}
      <Stack spacing="sm" data-testid="lc-callout">
        <Callout
          tone={error ? "danger" : "warning"}
          title={copy.calloutTitle}
          closable
          action={<Button size="sm">{copy.calloutAction}</Button>}
        >
          {copy.calloutBody}
        </Callout>
        <Callout tone="info" title={copy.calloutInfoTitle} closable>
          {copy.calloutInfoBody}
        </Callout>
      </Stack>

      {/* Message: deterministic inline item (the imperative dispatch surface) */}
      <div data-testid="lc-message">
        <MessageItem
          id="lc-message-item"
          type={loading ? "loading" : error ? "error" : "success"}
          content={loading ? copy.messageLoading : copy.messageContent}
          duration={0}
          closable
        />
      </div>

      {/* Progress: determinate line + circle, and an indeterminate line */}
      <Stack spacing="sm" data-testid="lc-progress">
        <Progress percent={65} status={error ? "error" : loading ? "active" : "normal"} />
        <Progress percent={65} type="circle" status={error ? "error" : "normal"} />
        <Progress percent={0} indeterminate status={error ? "error" : "normal"} />
      </Stack>

      {/* Skeleton block sized like a card, next to a Spinner */}
      <Stack direction="horizontal" spacing="lg" wrap data-testid="lc-skeleton">
        <div style={{ inlineSize: 280 }}>
          <Skeleton active avatar avatarSize={40} title paragraph={{ rows: 2 }} />
        </div>
        <Stack spacing="xs" data-testid="lc-spinner">
          <Spinner size="lg" label={copy.spinnerLabel} />
        </Stack>
      </Stack>

      {/* Empty and Result side by side, both with actions */}
      <Stack direction="horizontal" spacing="lg" wrap>
        <div data-testid="lc-empty" style={{ flex: "1 1 320px", minInlineSize: 0 }}>
          <Empty
            description={copy.emptyDescription}
          >
            <Button size="sm">{copy.emptyAction}</Button>
          </Empty>
        </div>
        <div data-testid="lc-result" style={{ flex: "1 1 320px", minInlineSize: 0 }}>
          <Result
            status={error ? "error" : loading ? "info" : "success"}
            title={error ? copy.resultErrorTitle : copy.resultTitle}
            subTitle={error ? copy.resultErrorBody : copy.resultBody}
            extra={
              <Button size="sm">{error ? copy.resultRetry : copy.resultAction}</Button>
            }
          />
        </div>
      </Stack>
    </Stack>
  );
}

export function K1LaneCProbe({ source, locale, density, state }: K1LaneCProbeProps) {
  return (
    <DesignSystemProvider
      tenantConfig={{ ...tenantConfig(source, locale, density), locale }}
      vertical="bithire"
      locale={locale}
      forceEngine="modern"
      forceTheme="light"
    >
      <Box
        data-testid="lc-canvas"
        style={{
          background: "var(--ds-color-background)",
          color: "var(--ds-color-text-primary)",
          minHeight: "100vh",
          inlineSize: "100%",
        }}
      >
        <Box
          data-testid="lc-frame"
          data-lc-source={source}
          data-lc-density={density}
          data-lc-state={state}
          dir={locale === "ar" ? "rtl" : "ltr"}
          style={{
            padding: 24,
            minHeight: "100vh",
            maxInlineSize: 880,
            marginInline: "auto",
          }}
        >
          <SpecimenTree locale={locale} state={state} />
        </Box>
      </Box>
    </DesignSystemProvider>
  );
}
