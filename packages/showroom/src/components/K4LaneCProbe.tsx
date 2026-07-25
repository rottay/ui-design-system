"use client";

/**
 * K4 Lane C probe (showroom): specialized display families.
 *
 * One identical component tree for the six Lane-C families (Carousel, Image,
 * QRCode, ColorPicker, FloatButton, Watermark) rendered under two opposing
 * governed sources:
 *  - `bithire-static`: the checked-in BitHire BrandTheme (file-first path);
 *  - `themanagement-db`: the DB Appearance construction mirrored from
 *    `@/components/brand-locale-evidence` (DB-owned runtime path).
 *
 * The probe exists to give Pass-1/Pass-2 evidence a URL-addressable render of
 * the states K4-C changed:
 *  - Carousel: logical arrow/dot placement + skin-owned root frame (also a
 *    vertical and a fade cell; RTL mirrors under `dir="rtl"` for `ar`).
 *  - Image: loading pulse (skin-owned `ds-foundation-pulse`), error fallback,
 *    zoomable (the zoom badge is logical `end-2`).
 *  - QRCode: active / loading / expired / scanned chrome (skin-owned
 *    geometry), token-resolved canvas colors.
 *  - ColorPicker: the token-backed default (no defaultValue -> swatch follows
 *    tenant `--ds-color-primary`), an always-open popup, presets, disabled.
 *  - FloatButton: skin-owned paint + hover/press/focus after the Daisy drain,
 *    badge dot/count (logical offsets), Group open, BackTop visible. All
 *    instances are pinned `position: static` so the probe never overlays the
 *    page; the fixed `end-6` placement is asserted in vitest instead.
 *  - Watermark: canvas pattern over content (verify-only family).
 *
 * Density sweeps compact | comfortable | spacious through
 * `appearance.general.density` only, locale sweeps EN/ES/AR with `dir="rtl"`
 * for Arabic, and `state` retunes the deterministic states on the SAME
 * markup. No fixture value here is product content.
 */

import {
  Box,
  Carousel,
  ColorPicker,
  DesignSystemProvider,
  FloatButton,
  Heading,
  Image,
  QRCode,
  Stack,
  Text,
  Watermark,
  bithireBrandTheme,
  type TenantConfig,
} from "@rottay/design-system";

import { tenantConfigFor as brandLocaleTenantConfigFor } from "@/components/brand-locale-evidence";

export type K4LaneCSource = "bithire-static" | "themanagement-db";
export type K4LaneCLocale = "en" | "es" | "ar";
export type K4LaneCDensity = "compact" | "comfortable" | "spacious";
export type K4LaneCState = "rest" | "loading" | "error";
export type K4LaneCTheme = "light" | "dark";

export interface K4LaneCProbeProps {
  source: K4LaneCSource;
  locale: K4LaneCLocale;
  density: K4LaneCDensity;
  state: K4LaneCState;
  theme?: K4LaneCTheme;
}

/**
 * The tenant-facing Appearance vocabulary has no `comfortable` literal:
 * `normal` is the canonical alias (TenantAppearanceGeneral['density']).
 */
function toAppearanceDensity(
  density: K4LaneCDensity
): "compact" | "normal" | "spacious" {
  return density === "comfortable" ? "normal" : density;
}

function tenantConfig(
  source: K4LaneCSource,
  locale: K4LaneCLocale,
  density: K4LaneCDensity
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

const COPY: Record<K4LaneCLocale, Record<string, string>> = {
  en: {
    title: "Specialized display specimen",
    carouselCaption: "Carousel (logical arrows/dots, vertical, fade)",
    imageCaption: "Image (loaded / loading pulse / error / zoomable)",
    qrcodeCaption: "QRCode (active / loading / expired / scanned)",
    colorpickerCaption: "ColorPicker (token default / open popup / presets / disabled)",
    floatbuttonCaption: "FloatButton (variants, badges, group, back-top)",
    watermarkCaption: "Watermark (canvas pattern)",
    slide: "Slide",
    zoom: "Zoom",
    watermarkText: "Watermarked content",
  },
  es: {
    title: "Espécimen de visualización especializada",
    carouselCaption: "Carrusel (flechas/puntos lógicos, vertical, fundido)",
    imageCaption: "Imagen (cargada / pulso de carga / error / ampliable)",
    qrcodeCaption: "Código QR (activo / cargando / caducado / escaneado)",
    colorpickerCaption: "Selector de color (predeterminado por token / panel abierto / preajustes / deshabilitado)",
    floatbuttonCaption: "Botón flotante (variantes, insignias, grupo, volver arriba)",
    watermarkCaption: "Marca de agua (patrón en canvas)",
    slide: "Diapositiva",
    zoom: "Ampliar",
    watermarkText: "Contenido con marca de agua",
  },
  ar: {
    title: "عينة العرض المتخصص",
    carouselCaption: "الشرائح (أسهم/نقاط منطقية، عمودي، تلاشي)",
    imageCaption: "الصورة (محملة / نبض التحميل / خطأ / قابلة للتكبير)",
    qrcodeCaption: "رمز QR (نشط / قيد التحميل / منتهي / تم مسحه)",
    colorpickerCaption: "منتقي الألوان (افتراضي بالرمز / لوحة مفتوحة / إعدادات مسبقة / معطل)",
    floatbuttonCaption: "زر عائم (متغيرات، شارات، مجموعة، العودة للأعلى)",
    watermarkCaption: "علامة مائية (نمط canvas)",
    slide: "شريحة",
    zoom: "تكبير",
    watermarkText: "محتوى بعلامة مائية",
  },
};

const SLIDE_BACKGROUNDS = [
  "var(--ds-color-primary)",
  "var(--ds-color-secondary)",
  "var(--ds-color-success)",
];

// Deterministic 1x1 asset for the loaded Image cell; the broken URL drives
// the error cell. Neither is product content.
const VALID_IMG =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64'%3E%3Crect width='64' height='64' fill='%237c9cbf'/%3E%3C/svg%3E";
const BROKEN_IMG = "/__k4c_probe_missing__.png";

// Returns an ARRAY: React.Children.toArray (which the Carousel engine uses to
// count slides) does not traverse fragments — a <SlideCells/> fragment child
// collapses to ONE slide with the three divs stacked (Pass-2 sighted finding).
function slideCells(label: string) {
  return SLIDE_BACKGROUNDS.map((background, index) => (
    <div
      key={background}
      style={{
        background,
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        // K4-C round 2 (axe): the ink was `--ds-color-text-on-primary`,
        // which TMM's runtime channel never declares — it falls through to
        // the dark :root platform fallback (#0C0C0E) and fails on every
        // semantic bg (3.57:1 worst). The foundation white constant is
        // tenant-independent and clears AA on all six source/color pairs
        // (worst: bithire success 4.58:1).
        color: "var(--ds-color-white)",
      }}
    >
      {label} {index + 1}
    </div>
  ));
}

function SpecimenTree({
  locale,
  state,
}: Pick<K4LaneCProbeProps, "locale" | "state">) {
  const copy = COPY[locale];
  // The lead QRCode cell retunes with the sweep state: rest -> active,
  // loading -> loading, error -> expired (the family's failure-shaped state).
  const leadQrStatus = state === "loading" ? "loading" : state === "error" ? "expired" : "active";

  return (
    <Stack spacing="lg" data-testid="k4c-root" data-ds-root="">
      <Heading level="h2" data-testid="k4c-title">
        {copy.title}
      </Heading>

      {/* Carousel: horizontal w/ arrows+dots (RTL-mirroring cell), vertical, fade */}
      <Stack spacing="sm" data-testid="k4c-carousel">
        <Text size="xs" color="secondary">
          {copy.carouselCaption}
        </Text>
        <Stack direction="horizontal" spacing="md" wrap>
          {/* The track defaults to 300px when --ds-carousel-height is
              undeclared (documented foundation gap) — cells pass an explicit
              height through the documented style API so sections never overlap. */}
          <Box style={{ position: "relative", inlineSize: 280, blockSize: 120 }} data-testid="k4c-carousel-horizontal">
            <Carousel arrows dots style={{ height: 120 }}>
              {slideCells(copy.slide)}
            </Carousel>
          </Box>
          <Box style={{ position: "relative", inlineSize: 140, blockSize: 120 }} data-testid="k4c-carousel-vertical">
            <Carousel arrows dots vertical style={{ height: 120 }}>
              {slideCells(copy.slide)}
            </Carousel>
          </Box>
          <Box style={{ position: "relative", inlineSize: 140, blockSize: 120 }} data-testid="k4c-carousel-fade">
            <Carousel dots fade style={{ height: 120 }}>
              {slideCells(copy.slide)}
            </Carousel>
          </Box>
        </Stack>
      </Stack>

      {/* Image: loaded / loading pulse / error / zoomable (torture-page idiom:
          src="" never settles, so the loading cell shows the skin-owned pulse) */}
      <Stack spacing="sm" data-testid="k4c-image">
        <Text size="xs" color="secondary">
          {copy.imageCaption}
        </Text>
        <Box style={{ display: "flex", gap: 8 }}>
          <Image src={VALID_IMG} alt="Loaded" width={64} height={64} bordered shadow />
          <Image src="" alt="Loading" width={64} height={64} />
          <Image src={BROKEN_IMG} alt="Errored" width={64} height={64} />
          <Image
            src={VALID_IMG}
            alt="Zoomable"
            width={64}
            height={64}
            zoomable
            hoverOverlay={<Text size="xs">{copy.zoom}</Text>}
          />
        </Box>
      </Stack>

      {/* QRCode: the four statuses side by side; `state` picks the lead cell */}
      <Stack spacing="sm" data-testid="k4c-qrcode">
        <Text size="xs" color="secondary">
          {copy.qrcodeCaption}
        </Text>
        <Box style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {/* Status cells at 96px: at 72 the expired overlay's two-line text +
              32px refresh control overflow (Pass-2 sighted finding). */}
          <QRCode value="https://rottay.com/k4c" size={96} bordered status={leadQrStatus} onRefresh={leadQrStatus === "expired" ? () => undefined : undefined} />
          <QRCode value="https://rottay.com/k4c" size={96} status="loading" />
          <QRCode value="https://rottay.com/k4c" size={96} status="expired" onRefresh={() => undefined} />
          <QRCode value="https://rottay.com/k4c" size={96} status="scanned" />
        </Box>
      </Stack>

      {/* ColorPicker: token-backed default (no defaultValue), open popup, presets, disabled */}
      <Stack spacing="sm" data-testid="k4c-colorpicker">
        <Text size="xs" color="secondary">
          {copy.colorpickerCaption}
        </Text>
        <Stack direction="horizontal" spacing="lg" wrap>
          <Box data-testid="k4c-colorpicker-token">
            {/* No defaultValue: the swatch follows tenant --ds-color-primary (K4-C) */}
            <ColorPicker showText onChange={() => undefined} />
          </Box>
          <ColorPicker
            open
            defaultValue="#2a7d4f"
            presets={[{ label: "Brand", colors: ["#1677ff", "#52c41a", "#faad14"] }]}
            allowClear
            onChange={() => undefined}
          />
          <ColorPicker disabled defaultValue="#52c41a" onChange={() => undefined} />
        </Stack>
      </Stack>

      {/* FloatButton: variants x shapes x badges, Group open, BackTop visible.
          All pinned static so the probe renders in-flow; fixed placement is
          covered by vitest assertions. */}
      <Stack spacing="sm" data-testid="k4c-floatbutton">
        <Text size="xs" color="secondary">
          {copy.floatbuttonCaption}
        </Text>
        <Stack direction="horizontal" spacing="lg" wrap style={{ alignItems: "flex-end" }}>
          <Box style={{ display: "flex", gap: 12, position: "relative" }} data-testid="k4c-floatbutton-variants">
            <FloatButton icon={<span aria-hidden="true">+</span>} type="default" badge={{ count: 3 }} style={{ position: "static" }} />
            <FloatButton icon={<span aria-hidden="true">+</span>} type="primary" shape="circle" badge={{ dot: true }} style={{ position: "static" }} />
            <FloatButton description="Square" type="default" shape="square" badge={{ count: 128 }} style={{ position: "static" }} />
          </Box>
          <Box data-testid="k4c-floatbutton-group">
            <FloatButton.Group open trigger="click" icon={<span aria-hidden="true">?</span>} style={{ position: "static" }}>
              <FloatButton icon={<span aria-hidden="true">a</span>} style={{ position: "static" }} />
              <FloatButton icon={<span aria-hidden="true">b</span>} style={{ position: "static" }} />
            </FloatButton.Group>
          </Box>
          <Box data-testid="k4c-floatbutton-backtop">
            <FloatButton.BackTop visibilityHeight={0} style={{ position: "static" }} />
          </Box>
        </Stack>
      </Stack>

      {/* Watermark: canvas pattern over content */}
      <Stack spacing="sm" data-testid="k4c-watermark">
        <Text size="xs" color="secondary">
          {copy.watermarkCaption}
        </Text>
        <Watermark content="K4C Draft">
          <Box
            style={{
              padding: 24,
              minBlockSize: 80,
              background: "var(--ds-color-bg-primary)",
            }}
          >
            <Text size="sm">{copy.watermarkText}</Text>
          </Box>
        </Watermark>
      </Stack>
    </Stack>
  );
}

export function K4LaneCProbe({ source, locale, density, state, theme = "light" }: K4LaneCProbeProps) {
  return (
    <DesignSystemProvider
      tenantConfig={{ ...tenantConfig(source, locale, density), locale }}
      vertical="bithire"
      locale={locale}
      forceEngine="modern"
      forceTheme={theme}
    >
      <Box
        data-testid="k4c-canvas"
        style={{
          background: "var(--ds-color-background)",
          color: "var(--ds-color-text-primary)",
          minHeight: "100vh",
          inlineSize: "100%",
        }}
      >
        <Box
          data-testid="k4c-frame"
          data-k4c-source={source}
          data-k4c-density={density}
          data-k4c-state={state}
          data-k4c-theme={theme}
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
              K4 lane C probe — specialized display
            </h1>
            <SpecimenTree locale={locale} state={state} />
          </main>
        </Box>
      </Box>
    </DesignSystemProvider>
  );
}

export default K4LaneCProbe;
