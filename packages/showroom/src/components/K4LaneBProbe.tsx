"use client";

/**
 * K4 Lane B probe (showroom): AI-adjacent families.
 *
 * One identical component tree for the four Lane-B families (CodeBlock,
 * MarkdownView, VoiceInputButton, Calendar) rendered under two opposing
 * governed sources:
 *  - `bithire-static`: the checked-in BitHire BrandTheme (file-first path);
 *  - `themanagement-db`: the DB Appearance construction mirrored from
 *    `@/components/brand-locale-evidence` (DB-owned runtime path).
 *
 * Axes: locale EN/ES/AR (AR renders `dir="rtl"` -- the CodeBlock gutter,
 * MarkdownView blockquote/list indentation and Calendar nav-glyph flip are
 * the RTL witnesses), density compact | comfortable | spacious (MarkdownView
 * has no `spacious` step and maps it to `comfortable`), theme light | dark,
 * and state rest | stress (`stress` swaps in long/hostile content: overlong
 * code lines with wrap, a 60-line gutter, hostile markdown). Calendar renders
 * its today/selected/disabled/year-mode states in every cell; VoiceInputButton
 * renders the size x variant grid plus a deterministically-unsupported cell
 * (the Web Speech API constructor is removed around that mount). The voice
 * error state needs a real permission-denial flow and is covered by the
 * family vitest suite instead. Every cell is deterministic and
 * URL-addressable; no fixture value here is product content.
 */

import { useEffect, useState } from "react";

import {
  Box,
  Calendar,
  CodeBlock,
  DesignSystemProvider,
  Heading,
  MarkdownView,
  Stack,
  Text,
  VoiceInputButton,
  bithireBrandTheme,
  type TenantConfig,
} from "@rottay/design-system";

import { tenantConfigFor as brandLocaleTenantConfigFor } from "@/components/brand-locale-evidence";

export type LaneBSource = "bithire-static" | "themanagement-db";
export type LaneBLocale = "en" | "es" | "ar";
export type LaneBDensity = "compact" | "comfortable" | "spacious";
export type LaneBState = "rest" | "stress";
export type LaneBTheme = "light" | "dark";

export interface K4LaneBProbeProps {
  source: LaneBSource;
  locale: LaneBLocale;
  density: LaneBDensity;
  state: LaneBState;
  theme: LaneBTheme;
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
  density: LaneBDensity,
  theme: LaneBTheme
): TenantConfig {
  if (source === "themanagement-db") {
    const base = brandLocaleTenantConfigFor("themanagementmiami", locale);
    return {
      ...base,
      theme,
      appearance: {
        ...base.appearance,
        general: {
          ...base.appearance?.general,
          density: toAppearanceDensity(density),
          // Dark rides the DB Appearance channel: with a static BrandTheme
          // the runtime-injected light compile overrides the artifact's dark
          // blocks even when forceTheme sets data-theme="dark" (verified
          // live: tokens stayed light). backgroundMode is the General-tier
          // field that drives the dark projection.
          ...(theme === "dark" ? { backgroundMode: "dark" as const } : {}),
        },
      },
    };
  }

  return {
    slug: "bithire",
    name: "BitHire",
    vertical: "bithire",
    engine: "modern",
    theme,
    plan: "enterprise",
    features: ["*"],
    branding: { companyName: "BitHire" },
    // BitHire is first-party vertical identity and therefore comes from the
    // checked-in DS theme, never from a customer DB fixture. The semantic
    // posture enters exclusively through the Appearance channel.
    brandTheme: bithireBrandTheme,
    appearance: {
      general: {
        density: toAppearanceDensity(density),
        // See the comment on the DB branch: dark enters through Appearance.
        ...(theme === "dark" ? { backgroundMode: "dark" as const } : {}),
      },
    },
  };
}

const COPY: Record<
  LaneBLocale,
  {
    codeTitle: string;
    copyLabel: string;
    copiedLabel: string;
    markdownTitle: string;
    calendarTitle: string;
    calendarDefault: string;
    calendarDisabled: string;
    calendarYear: string;
    voiceTitle: string;
    voiceSupported: string;
    voiceUnsupported: string;
    voiceErrorNote: string;
  }
> = {
  en: {
    codeTitle: "CodeBlock — gutter, highlight band, long content",
    copyLabel: "Copy",
    copiedLabel: "Copied",
    markdownTitle: "MarkdownView — stress document",
    calendarTitle: "Calendar — today / selected / disabled / year",
    calendarDefault: "Today + selected",
    calendarDisabled: "Weekends disabled + valid range",
    calendarYear: "Year mode",
    voiceTitle: "VoiceInputButton — sizes, variants, support gate",
    voiceSupported: "Supported (live Web Speech API)",
    voiceUnsupported: "Unsupported (constructor removed → renders null)",
    voiceErrorNote: "Error/blocked state is covered by the family vitest suite.",
  },
  es: {
    codeTitle: "CodeBlock — gutter, banda de resaltado, contenido largo",
    copyLabel: "Copiar",
    copiedLabel: "Copiado",
    markdownTitle: "MarkdownView — documento de estrés",
    calendarTitle: "Calendar — hoy / seleccionado / deshabilitado / año",
    calendarDefault: "Hoy + seleccionado",
    calendarDisabled: "Fines de semana deshabilitados + rango válido",
    calendarYear: "Modo anual",
    voiceTitle: "VoiceInputButton — tamaños, variantes, compuerta de soporte",
    voiceSupported: "Con soporte (Web Speech API activa)",
    voiceUnsupported: "Sin soporte (constructor eliminado → renderiza null)",
    voiceErrorNote: "El estado de error/bloqueo se cubre en la suite vitest de la familia.",
  },
  ar: {
    codeTitle: "CodeBlock — الهامش، شريط التمييز، محتوى طويل",
    copyLabel: "نسخ",
    copiedLabel: "تم النسخ",
    markdownTitle: "MarkdownView — مستند إجهاد",
    calendarTitle: "Calendar — اليوم / المحدد / المعطل / السنة",
    calendarDefault: "اليوم + المحدد",
    calendarDisabled: "عطلة نهاية الأسبوع معطلة + نطاق صالح",
    calendarYear: "وضع السنة",
    voiceTitle: "VoiceInputButton — الأحجام، المتغيرات، بوابة الدعم",
    voiceSupported: "مدعوم (Web Speech API نشطة)",
    voiceUnsupported: "غير مدعوم (تمت إزالة المنشئ → يعرض null)",
    voiceErrorNote: "حالة الخطأ/الحظر مغطاة في مجموعة اختبارات vitest الخاصة بالعائلة.",
  },
};

const CODE_SAMPLE = `interface Candidate {
  id: string;
  name: string;
  stage: 'screening' | 'interview' | 'offer';
}

export function nextStage(candidate: Candidate): Candidate['stage'] | null {
  if (candidate.stage === 'screening') return 'interview';
  if (candidate.stage === 'interview') return 'offer';
  return null;
}`;

const LONG_CODE_SAMPLE = `const query = "SELECT candidates.id, candidates.name, scorecards.overall_score, interviews.scheduled_at FROM candidates INNER JOIN scorecards ON scorecards.candidate_id = candidates.id INNER JOIN interviews ON interviews.candidate_id = candidates.id WHERE candidates.stage = 'interview' ORDER BY scorecards.overall_score DESC LIMIT 25;";
const endpoint = "https://api.example.test/v1/tenants/acme/pipelines/hiring/candidates?filter[stage]=interview&sort=-score&page[size]=25&include=scorecards,interviews&fields[candidates]=id,name,stage";
${Array.from({ length: 58 }, (_, i) => `const metric${i + 3} = computeMetric(window${i + 3}, weights.recency, weights.signal);`).join("\n")}`;

const MARKDOWN_REST = `# Interview feedback

Strong **system design** instincts and *clear communication*.

- [x] Technical interview
- [ ] Offer approval

> "Reasoned about trade-offs before writing code." — Panel lead

| Area | Signal |
| ---- | -----: |
| Algorithms | Strong |
| Ownership | Strong |

\`\`\`ts
const decision = panel.every((v) => v.score >= 3) ? 'hire' : 'hold';
\`\`\``;

const MARKDOWN_STRESS = `# مستند الإجهاد — Stress document — Documento de estrés

Mixed **غامق** *مائل* \`code\` with a very long unbroken token: supercalifragilisticexpialidocious_supercalifragilisticexpialidocious_token_without_any_breaks_at_all.

> اقتباس طويل يمتد ليختبر اتجاه الحد الجانبي — a blockquote long enough to wrap across lines so the inline-start border is exercised in both directions, con suficiente texto para envolver.

1. الأول
2. الثاني
3. الثالث

- [x] مهمة منجزة مع نص طويل يمتد على سطرين عند العرض الضيق
- [ ] مهمة معلقة

| العمود أ | العمود ب | العمود ج |
| :------ | :-----: | ------: |
| قيمة طويلة نسبياً للاختبار | center | 42 |
| x | y | 3.14159 |

---

Safe [playbook link](https://example.test/playbook) next to a downgraded [javascript:alert(1)](javascript:alert(1)) and raw <script>alert(1)</script> text.

\`\`\`sql
SELECT * FROM candidates WHERE stage = 'offer' ORDER BY updated_at DESC LIMIT 50;
\`\`\``;

/** Renders VoiceInputButton with the SpeechRecognition constructor removed for the mount. */
function VoiceUnsupportedCell() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const w = window as unknown as {
      SpeechRecognition?: unknown;
      webkitSpeechRecognition?: unknown;
    };
    const saved = w.SpeechRecognition;
    const savedWebkit = w.webkitSpeechRecognition;
    delete w.SpeechRecognition;
    delete w.webkitSpeechRecognition;
    setReady(true);
    return () => {
      w.SpeechRecognition = saved;
      w.webkitSpeechRecognition = savedWebkit;
    };
  }, []);

  if (!ready) return null;
  return <VoiceInputButton lang="en-US" onTranscript={() => undefined} />;
}

function SpecimenTree({
  locale,
  density,
  state,
}: Pick<K4LaneBProbeProps, "locale" | "density" | "state">) {
  const copy = COPY[locale];
  const stress = state === "stress";
  // MarkdownView has no `spacious` step: it maps to its comfortable rhythm.
  const markdownDensity = density === "compact" ? "compact" : "comfortable";

  const today = new Date();
  const selected = new Date(today.getFullYear(), today.getMonth(), today.getDate() === 1 ? 2 : 1);

  return (
    <Stack spacing="xl" data-testid="k4b-root" data-ds-root="">
      <section data-testid="k4b-codeblock">
        <Heading level="h2">{copy.codeTitle}</Heading>
        <CodeBlock
          code={stress ? LONG_CODE_SAMPLE : CODE_SAMPLE}
          language="ts"
          title="candidate.ts"
          showLineNumbers
          highlightLines={stress ? [1, 2] : [8]}
          wrap={stress}
          maxHeight={stress ? 220 : undefined}
          copyLabel={copy.copyLabel}
          copiedLabel={copy.copiedLabel}
        />
      </section>

      <section data-testid="k4b-markdownview">
        <Heading level="h2">{copy.markdownTitle}</Heading>
        <MarkdownView
          source={stress ? MARKDOWN_STRESS : MARKDOWN_REST}
          density={markdownDensity}
          slots={{
            code: ({ code, language }) => (
              <CodeBlock
                code={code}
                language={language}
                showLineNumbers
                copyLabel={copy.copyLabel}
                copiedLabel={copy.copiedLabel}
              />
            ),
          }}
        />
      </section>

      <section data-testid="k4b-calendar">
        <Heading level="h2">{copy.calendarTitle}</Heading>
        <Stack direction="horizontal" spacing="lg" wrap>
          <div data-testid="k4b-calendar-default">
            <Text size="xs" color="secondary">{copy.calendarDefault}</Text>
            <Calendar fullscreen={false} defaultValue={selected} />
          </div>
          <div data-testid="k4b-calendar-disabled">
            <Text size="xs" color="secondary">{copy.calendarDisabled}</Text>
            <Calendar
              fullscreen={false}
              defaultValue={selected}
              disabledDate={(date) => date.getDay() === 0 || date.getDay() === 6}
              validRange={[
                new Date(today.getFullYear(), today.getMonth(), 1),
                new Date(today.getFullYear(), today.getMonth() + 2, 0),
              ]}
            />
          </div>
          <div data-testid="k4b-calendar-year">
            <Text size="xs" color="secondary">{copy.calendarYear}</Text>
            <Calendar fullscreen={false} mode="year" defaultValue={selected} />
          </div>
        </Stack>
      </section>

      <section data-testid="k4b-voiceinput">
        <Heading level="h2">{copy.voiceTitle}</Heading>
        <Stack spacing="md">
          <div data-testid="k4b-voice-supported">
            <Text size="xs" color="secondary">{copy.voiceSupported}</Text>
            <Stack direction="horizontal" spacing="md">
              {(["ghost", "filled"] as const).map((variant) =>
                (["sm", "md"] as const).map((size) => (
                  <VoiceInputButton
                    key={`${variant}-${size}`}
                    lang={locale === "ar" ? "ar-SA" : locale === "es" ? "es-AR" : "en-US"}
                    size={size}
                    variant={variant}
                    onTranscript={() => undefined}
                  />
                ))
              )}
            </Stack>
          </div>
          <div data-testid="k4b-voice-unsupported">
            <Text size="xs" color="secondary">{copy.voiceUnsupported}</Text>
            <VoiceUnsupportedCell />
          </div>
          <Text size="xs" color="secondary">{copy.voiceErrorNote}</Text>
        </Stack>
      </section>
    </Stack>
  );
}

export function K4LaneBProbe({ source, locale, density, state, theme }: K4LaneBProbeProps) {
  return (
    <DesignSystemProvider
      tenantConfig={{ ...tenantConfig(source, locale, density, theme), locale }}
      vertical="bithire"
      locale={locale}
      forceEngine="modern"
      forceTheme={theme}
    >
      <Box
        data-testid="k4b-canvas"
        style={{
          background: "var(--ds-color-background)",
          color: "var(--ds-color-text-primary)",
          minHeight: "100vh",
          inlineSize: "100%",
        }}
      >
        <Box
          data-testid="k4b-frame"
          data-k4b-source={source}
          data-k4b-density={density}
          data-k4b-state={state}
          data-k4b-theme={theme}
          dir={locale === "ar" ? "rtl" : "ltr"}
          style={{
            padding: 24,
            minHeight: "100vh",
            maxInlineSize: 960,
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
              K4 lane B probe — AI-adjacent
            </h1>
            <SpecimenTree locale={locale} density={density} state={state} />
          </main>
        </Box>
      </Box>
    </DesignSystemProvider>
  );
}
