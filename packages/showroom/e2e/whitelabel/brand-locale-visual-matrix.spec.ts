import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

import {
  devices,
  test,
  expect,
  type Locator,
  type Page,
} from "@playwright/test";

import { themanagementmiamiBrandTheme as canonicalManagementTheme } from "../../../core/src/foundation/tokens/ts/presentation/brand-themes/fixtures/themanagementmiami";
import { themanagementmiamiBrandTheme as showroomManagementTheme } from "../../src/components/torture-surface/fixtures";

type Fixture = "bithire" | "themanagementmiami";
type Locale = "en" | "es" | "ar";
type Viewport = "desktop" | "mobile";

const FIXTURES: readonly Fixture[] = ["bithire", "themanagementmiami"];
const LOCALES: readonly Locale[] = ["en", "es", "ar"];
const VIEWPORTS: Record<Viewport, { width: number; height: number }> = {
  desktop: { width: 1280, height: 900 },
  mobile: { width: 393, height: 852 },
};
const BROWSER_LOCALES: Record<Locale, string> = {
  en: "en-US",
  es: "es-AR",
  ar: "ar-SA",
};
const CONTEXTS = {
  desktop: {
    // Browser selection belongs to the Playwright project. Keep this nested
    // override to context-safe fields so the matrix can vary interaction
    // semantics without forcing a second worker/browser type.
    viewport: VIEWPORTS.desktop,
    deviceScaleFactor: 1,
    hasTouch: false,
    isMobile: false,
  },
  mobile: {
    // Real mobile interaction semantics, normalized to CSS-pixel screenshots
    // so the committed baseline remains portable and reasonably sized.
    userAgent: devices["Pixel 7"].userAgent,
    viewport: VIEWPORTS.mobile,
    deviceScaleFactor: 1,
    hasTouch: true,
    isMobile: true,
  },
} as const;

// Same product markup must still read as two companies. This full-viewport
// floor deliberately counts canvas colour, so it is only supplementary: the
// structural channel assertions below separately require type, corner, depth,
// surface and control changes and prevent a background-only false positive.
const REAL_TENANT_VISUAL_DIVERGENCE_FLOOR = 0.2;
const REAL_TENANT_FOREGROUND_DIVERGENCE_FLOOR = 0.12;
const SAME_CELL_STABILITY_CEILING = 0.0005;
const MOBILE_TOUCH_TARGET_FLOOR = 44;

const DIST_FRESHNESS_GATE = fileURLToPath(
  new URL("../../../core/scripts/dist-freshness-gate.mjs", import.meta.url)
);

const EXPECTED_COPY: Record<Fixture, Record<Locale, string>> = {
  bithire: {
    en: "No data",
    es: "Sin datos",
    ar: "لا توجد بيانات",
  },
  themanagementmiami: {
    en: "No talent profiles yet",
    es: "Todavía no hay perfiles de talento",
    ar: "لا توجد ملفات مواهب بعد",
  },
};

const EXPECTED_COMMON_COPY: Record<
  Locale,
  {
    save: string;
    cancel: string;
    search: string;
    searchPlaceholder: string;
    filter: string;
    filterSummary: string;
    actions: string;
    actionsSummary: string;
    live: string;
    keyMetrics: string;
    rowsSelected: string;
    connected: string;
    shortcuts: string;
    page: string;
    showMore: string;
    noResults: string;
  }
> = {
  en: {
    save: "Save",
    cancel: "Cancel",
    search: "Search",
    searchPlaceholder: "Search...",
    filter: "Filter",
    filterSummary: "Filter · 3",
    actions: "Actions",
    actionsSummary: "More",
    live: "Live",
    keyMetrics: "Key metrics",
    rowsSelected: "3 rows selected",
    connected: "Connected",
    shortcuts: "Shortcuts",
    page: "Page 1 of 6",
    showMore: "Show more",
    noResults: "No results",
  },
  es: {
    save: "Guardar",
    cancel: "Cancelar",
    search: "Buscar",
    searchPlaceholder: "Buscar...",
    filter: "Filtrar",
    filterSummary: "Filtrar · 3",
    actions: "Acciones",
    actionsSummary: "Más",
    live: "En vivo",
    keyMetrics: "Métricas clave",
    rowsSelected: "3 filas seleccionadas",
    connected: "Conectado",
    shortcuts: "Atajos",
    page: "Página 1 de 6",
    showMore: "Mostrar más",
    noResults: "Sin resultados",
  },
  ar: {
    save: "حفظ",
    cancel: "إلغاء",
    search: "بحث",
    searchPlaceholder: "بحث...",
    filter: "تصفية",
    filterSummary: "تصفية · 3",
    actions: "الإجراءات",
    actionsSummary: "المزيد",
    live: "مباشر",
    keyMetrics: "المؤشرات الرئيسية",
    rowsSelected: "تم تحديد 3 صفوف",
    connected: "متصل",
    shortcuts: "الاختصارات",
    page: "الصفحة 1 من 6",
    showMore: "إظهار المزيد",
    noResults: "لا توجد نتائج",
  },
};

interface ChromeReadings {
  fontFamily: string;
  headingFontFamily: string;
  canvasBackground: string;
  primaryBackground: string;
  primaryColor: string;
  buttonRadius: string;
  buttonShadow: string;
  cardBackground: string;
  cardRadius: string;
  cardBorderColor: string;
  cardShadow: string;
}

interface PixelDiffMetrics {
  fullRatio: number;
  foregroundRatio: number;
  foregroundPixels: number;
}

interface ContrastTarget {
  label: string;
  selector: string;
  multiple?: boolean;
}

interface ContrastReading {
  label: string;
  selector: string;
  text: string;
  foreground: string;
  background: string;
  fontSize: number;
  fontWeight: number;
  largeText: boolean;
  requiredRatio: number;
  actualRatio: number;
  unresolvedColors: string[];
}

const EVIDENCE_CONTRAST_TARGETS: readonly ContrastTarget[] = [
  { label: "brand title", selector: '[data-testid="evidence-brand-title"]' },
  {
    label: "localized description",
    selector: '[data-testid="localized-empty-copy"]',
  },
  {
    label: "card empty state",
    selector: '[data-testid="evidence-primary-body"]',
  },
  {
    label: "show more",
    selector: '[data-testid="evidence-show-more"]',
  },
  {
    label: "no results",
    selector: '[data-testid="evidence-no-results"]',
  },
  {
    label: "tab",
    selector: '[data-testid="evidence-tabs"] [role="tab"]',
    multiple: true,
  },
  {
    label: "primary button",
    selector: '[data-testid="evidence-primary-action"]',
  },
  {
    label: "secondary button",
    selector: '[data-testid="evidence-secondary-action"]',
  },
] as const;

function colorDistance(left: string, right: string): number {
  const channels = (value: string) =>
    (value.match(/[\d.]+/g) ?? []).slice(0, 3).map(Number);
  const a = channels(left);
  const b = channels(right);
  if (a.length !== 3 || b.length !== 3) return 0;
  return Math.sqrt(
    a.reduce((sum, channel, index) => sum + (channel - b[index]) ** 2, 0)
  );
}

function radiusDelta(left: string, right: string): number {
  return Math.abs(Number.parseFloat(left) - Number.parseFloat(right));
}

async function readContrastMatrix(
  page: Page,
  targets: readonly ContrastTarget[] = EVIDENCE_CONTRAST_TARGETS
): Promise<ContrastReading[]> {
  return page.evaluate((targetSpecs) => {
    interface Rgba {
      red: number;
      green: number;
      blue: number;
      alpha: number;
    }

    const clamp = (value: number, minimum: number, maximum: number) =>
      Math.min(maximum, Math.max(minimum, value));

    const parseChannel = (value: string): number => {
      const parsed = Number.parseFloat(value);
      return value.endsWith("%")
        ? clamp((parsed / 100) * 255, 0, 255)
        : clamp(parsed, 0, 255);
    };

    const parseAlpha = (value: string | undefined): number => {
      if (value === undefined) return 1;
      const parsed = Number.parseFloat(value);
      return value.endsWith("%")
        ? clamp(parsed / 100, 0, 1)
        : clamp(parsed, 0, 1);
    };

    const parseRgb = (value: string): Rgba | null => {
      const normalized = value.trim().toLowerCase();
      if (normalized === "transparent") {
        return { red: 0, green: 0, blue: 0, alpha: 0 };
      }

      // Chromium serializes computed color-mix() results as CSS Color 4
      // `color(srgb ...)` values. They are ordinary sRGB colours, so the gate
      // must measure them instead of treating a standards-compliant computed
      // value as unverifiable.
      const srgbMatch = normalized.match(/^color\(srgb\s+(.+)\)$/);
      if (srgbMatch) {
        const contents = srgbMatch[1];
        if (!contents) return null;
        const [channelSource, slashAlpha] = contents.split("/").map((part) =>
          part.trim()
        );
        if (!channelSource) return null;
        const channels = channelSource.split(/\s+/).filter(Boolean);
        if (channels.length !== 3) return null;
        const parseSrgbChannel = (channel: string) =>
          channel.endsWith("%")
            ? clamp((Number.parseFloat(channel) / 100) * 255, 0, 255)
            : clamp(Number.parseFloat(channel) * 255, 0, 255);
        const [red = "", green = "", blue = ""] = channels;
        const parsed = {
          red: parseSrgbChannel(red),
          green: parseSrgbChannel(green),
          blue: parseSrgbChannel(blue),
          alpha: parseAlpha(slashAlpha),
        };
        return Object.values(parsed).every(Number.isFinite) ? parsed : null;
      }

      const match = normalized.match(/^rgba?\((.*)\)$/);
      if (!match) return null;
      const contents = match[1];
      if (!contents) return null;

      const [channelSource, slashAlpha] = contents.split("/").map((part) =>
        part.trim()
      );
      if (!channelSource) return null;
      const channels = channelSource
        .split(/[\s,]+/)
        .filter(Boolean);
      const legacyAlpha = slashAlpha === undefined && channels.length === 4
        ? channels.pop()
        : undefined;
      if (channels.length !== 3) return null;
      const [red = "", green = "", blue = ""] = channels;

      const parsed = {
        red: parseChannel(red),
        green: parseChannel(green),
        blue: parseChannel(blue),
        alpha: parseAlpha(slashAlpha ?? legacyAlpha),
      };
      return Object.values(parsed).every(Number.isFinite) ? parsed : null;
    };

    const composite = (foreground: Rgba, background: Rgba): Rgba => {
      const alpha =
        foreground.alpha + background.alpha * (1 - foreground.alpha);
      if (alpha === 0) return { red: 0, green: 0, blue: 0, alpha: 0 };
      const channel = (front: number, back: number) =>
        (front * foreground.alpha +
          back * background.alpha * (1 - foreground.alpha)) /
        alpha;
      return {
        red: channel(foreground.red, background.red),
        green: channel(foreground.green, background.green),
        blue: channel(foreground.blue, background.blue),
        alpha,
      };
    };

    const effectiveBackground = (
      element: Element
    ): { color: Rgba; unresolved: string[] } => {
      const ancestors: Element[] = [];
      for (
        let current: Element | null = element;
        current;
        current = current.parentElement
      ) {
        ancestors.unshift(current);
      }

      // An otherwise transparent browser canvas is painted white by default.
      // Every rgba layer from <html> down to the target is then composited in
      // painting order, so transparent tabs/buttons inherit the real surface.
      let color: Rgba = { red: 255, green: 255, blue: 255, alpha: 1 };
      const unresolved: string[] = [];
      for (const ancestor of ancestors) {
        const cssColor = getComputedStyle(ancestor).backgroundColor;
        const parsed = parseRgb(cssColor);
        if (!parsed) {
          unresolved.push(`${ancestor.tagName.toLowerCase()}:${cssColor}`);
          continue;
        }
        color = composite(parsed, color);
      }
      return { color, unresolved };
    };

    const linearChannel = (channel: number) => {
      const srgb = channel / 255;
      return srgb <= 0.04045
        ? srgb / 12.92
        : ((srgb + 0.055) / 1.055) ** 2.4;
    };
    const luminance = (color: Rgba) =>
      0.2126 * linearChannel(color.red) +
      0.7152 * linearChannel(color.green) +
      0.0722 * linearChannel(color.blue);
    const contrastRatio = (left: Rgba, right: Rgba) => {
      const lighter = Math.max(luminance(left), luminance(right));
      const darker = Math.min(luminance(left), luminance(right));
      return (lighter + 0.05) / (darker + 0.05);
    };
    const serialize = (color: Rgba) =>
      `rgba(${color.red.toFixed(2)}, ${color.green.toFixed(2)}, ${color.blue.toFixed(2)}, ${color.alpha.toFixed(3)})`;
    const numericWeight = (value: string) => {
      const parsed = Number.parseInt(value, 10);
      if (Number.isFinite(parsed)) return parsed;
      if (value === "bold" || value === "bolder") return 700;
      if (value === "lighter") return 300;
      return 400;
    };

    const readings: ContrastReading[] = [];
    for (const target of targetSpecs) {
      const elements = Array.from(document.querySelectorAll(target.selector));
      if (elements.length === 0) {
        readings.push({
          label: target.label,
          selector: target.selector,
          text: "",
          foreground: "unresolved",
          background: "unresolved",
          fontSize: 0,
          fontWeight: 0,
          largeText: false,
          requiredRatio: 4.5,
          actualRatio: 0,
          unresolvedColors: ["missing contrast target"],
        });
        continue;
      }

      const selected = target.multiple ? elements : elements.slice(0, 1);
      for (const [index, element] of selected.entries()) {
        const style = getComputedStyle(element);
        const background = effectiveBackground(element);
        const parsedForeground = parseRgb(style.color);
        const unresolvedColors = [...background.unresolved];
        if (!parsedForeground) unresolvedColors.push(`color:${style.color}`);

        const fontSize = Number.parseFloat(style.fontSize);
        const fontWeight = numericWeight(style.fontWeight);
        if (!Number.isFinite(fontSize)) {
          unresolvedColors.push(`font-size:${style.fontSize}`);
        }
        const largeText =
          fontSize >= 24 || (fontSize >= 18.66 && fontWeight >= 700);
        const requiredRatio = largeText ? 3 : 4.5;
        const foreground = parsedForeground
          ? composite(parsedForeground, background.color)
          : { red: 0, green: 0, blue: 0, alpha: 1 };

        if (element.getClientRects().length === 0) {
          unresolvedColors.push("contrast target is not rendered");
        }
        readings.push({
          label:
            target.multiple && elements.length > 1
              ? `${target.label} ${index + 1}`
              : target.label,
          selector: target.selector,
          text: element.textContent?.trim() ?? "",
          foreground: parsedForeground
            ? serialize(foreground)
            : style.color,
          background: serialize(background.color),
          fontSize,
          fontWeight,
          largeText,
          requiredRatio,
          actualRatio: parsedForeground
            ? contrastRatio(foreground, background.color)
            : 0,
          unresolvedColors,
        });
      }
    }
    return readings;
  }, targets);
}

async function assertEvidenceContrast(page: Page): Promise<void> {
  const readings = await readContrastMatrix(page);
  const expectedReadingCount = EVIDENCE_CONTRAST_TARGETS.reduce(
    (count, target) => count + (target.multiple ? 3 : 1),
    0
  );
  expect(
    readings.length,
    "contrast gate did not inspect every required evidence target"
  ).toBe(expectedReadingCount);

  const failures = readings
    .filter(
      (reading) =>
        reading.unresolvedColors.length > 0 ||
        reading.actualRatio + Number.EPSILON < reading.requiredRatio
    )
    .map((reading) => ({
      target: `${reading.label}: ${reading.text}`,
      ratio: Number(reading.actualRatio.toFixed(2)),
      required: reading.requiredRatio,
      largeText: reading.largeText,
      font: `${reading.fontSize}px/${reading.fontWeight}`,
      foreground: reading.foreground,
      background: reading.background,
      unresolved: reading.unresolvedColors,
    }));

  expect(
    failures,
    "WCAG contrast failed on the rendered tenant/locale evidence surface"
  ).toEqual([]);
}

async function horizontalCenter(locator: Locator): Promise<number> {
  const box = await locator.boundingBox();
  if (!box) throw new Error("brand-locale evidence control is not visible");
  return box.x + box.width / 2;
}

async function assertResponsiveAnatomy(
  page: Page,
  viewport: Viewport
): Promise<void> {
  const primary = await page.getByTestId("evidence-card").boundingBox();
  const secondary = await page
    .getByTestId("evidence-secondary-card")
    .boundingBox();
  if (!primary || !secondary)
    throw new Error("responsive evidence cards are not visible");

  if (viewport === "mobile") {
    expect(
      secondary.y,
      "mobile evidence cards did not collapse to one column"
    ).toBeGreaterThanOrEqual(primary.y + primary.height - 1);
    expect(
      Math.abs(secondary.x - primary.x),
      "mobile evidence cards do not share the same grid edge"
    ).toBeLessThanOrEqual(2);
    return;
  }

  const horizontallySeparated =
    primary.x + primary.width <= secondary.x + 1 ||
    secondary.x + secondary.width <= primary.x + 1;
  expect(
    horizontallySeparated,
    "desktop evidence cards overlap instead of remaining in two columns"
  ).toBe(true);
  expect(
    Math.abs(secondary.y - primary.y),
    "desktop evidence cards are not aligned"
  ).toBeLessThanOrEqual(2);
}

async function assertTabDirection(page: Page, locale: Locale): Promise<void> {
  const copy = EXPECTED_COMMON_COPY[locale];
  const search = await horizontalCenter(
    page.getByRole("tab", { name: copy.search })
  );
  const actions = await horizontalCenter(
    page.getByRole("tab", { name: copy.actions })
  );

  if (locale === "ar") {
    expect(search, "RTL tab order did not mirror visually").toBeGreaterThan(
      actions
    );
  } else {
    expect(search, "LTR tab order is reversed").toBeLessThan(actions);
  }
}

async function assertActionDirection(page: Page, locale: Locale): Promise<void> {
  const primary = await horizontalCenter(
    page.getByTestId("evidence-primary-action")
  );
  const secondary = await horizontalCenter(
    page.getByTestId("evidence-secondary-action")
  );

  if (locale === "ar") {
    expect(
      primary,
      "RTL actions inherited the language but did not mirror visually"
    ).toBeGreaterThan(secondary);
  } else {
    expect(primary, "LTR action order is reversed").toBeLessThan(secondary);
  }
}

async function assertLocalizedCopy(page: Page, locale: Locale): Promise<void> {
  const copy = EXPECTED_COMMON_COPY[locale];
  const assertions: ReadonlyArray<readonly [string, string]> = [
    ["evidence-primary-action", copy.save],
    ["evidence-secondary-action", copy.cancel],
    ["evidence-primary-eyebrow", copy.live],
    ["evidence-primary-title", copy.keyMetrics],
    ["evidence-primary-subtitle", copy.rowsSelected],
    ["evidence-secondary-eyebrow", copy.connected],
    ["evidence-secondary-title", copy.shortcuts],
    ["evidence-secondary-subtitle", copy.page],
    ["evidence-show-more", copy.showMore],
    ["evidence-no-results", copy.noResults],
  ];

  for (const [testId, value] of assertions) {
    await expect(
      page.getByTestId(testId),
      `${testId} leaked locale copy`
    ).toHaveText(value);
  }

  const searchTab = page.getByRole("tab", { name: copy.search });
  const filterTab = page.getByRole("tab", { name: copy.filter });
  const actionsTab = page.getByRole("tab", { name: copy.actions });

  await expect(page.getByTestId("evidence-search-copy")).toHaveText(
    copy.searchPlaceholder
  );
  await filterTab.click();
  await expect(page.getByTestId("evidence-filter-copy")).toHaveText(
    copy.filterSummary
  );
  await actionsTab.click();
  await expect(page.getByTestId("evidence-actions-copy")).toHaveText(
    copy.actionsSummary
  );
  await searchTab.click();
  await expect(searchTab).toHaveAttribute("aria-selected", "true");

  const renderedCopy = await page
    .getByTestId("brand-locale-evidence")
    .innerText();
  expect(
    renderedCopy,
    "an unresolved translation key reached the visible specimen"
  ).not.toMatch(/\b(?:common|components)\.[a-z0-9_.]+\b/i);

  const englishLeakCanaries = [
    "Key metrics",
    "Shortcuts",
    "Show more",
    "No results",
    "3 rows selected",
    "Page 1 of 6",
  ];
  if (locale !== "en") {
    for (const canary of englishLeakCanaries) {
      expect(
        renderedCopy,
        `English copy leaked into ${locale}: ${canary}`
      ).not.toContain(canary);
    }
  }
}

async function assertRuntimeEnvironment(
  page: Page,
  fixture: Fixture,
  locale: Locale,
  viewport: Viewport
): Promise<void> {
  const expectedViewport = VIEWPORTS[viewport];
  const evidence = await page.evaluate(() => ({
    width: window.innerWidth,
    height: window.innerHeight,
    language: navigator.language,
    maxTouchPoints: navigator.maxTouchPoints,
    coarsePointer: matchMedia("(pointer: coarse)").matches,
    hoverNone: matchMedia("(hover: none)").matches,
    reducedMotion: matchMedia("(prefers-reduced-motion: reduce)").matches,
    fontsStatus: document.fonts.status,
    loadedFontFamilies: Array.from(document.fonts)
      .filter((fontFace) => fontFace.status === "loaded")
      .map((fontFace) => fontFace.family.replace(/["']/g, ""))
      .sort(),
    runningAnimations: document
      .getAnimations()
      .filter((animation) => animation.playState === "running")
      .map((animation) => {
        const target = (animation.effect as KeyframeEffect | null)?.target;
        return target instanceof Element
          ? `${target.tagName.toLowerCase()}${target.id ? `#${target.id}` : ""}`
          : "unknown";
      }),
  }));

  expect(evidence.width).toBe(expectedViewport.width);
  expect(evidence.height).toBe(expectedViewport.height);
  expect(evidence.language.toLowerCase()).toMatch(new RegExp(`^${locale}`));
  expect(evidence.reducedMotion, "reduced-motion context was not applied").toBe(
    true
  );
  expect(evidence.fontsStatus, "font loading did not settle").toBe("loaded");
  const requiredFontFamilies =
    fixture === "bithire" ? ["Public Sans", "Space Grotesk"] : ["Fraunces"];
  for (const family of requiredFontFamilies) {
    expect(
      evidence.loadedFontFamilies,
      `${fixture} rendered before its authored ${family} face loaded`
    ).toContain(family);
  }
  expect(
    evidence.runningAnimations,
    "reduced-motion left active visual animations in the capture"
  ).toEqual([]);

  if (viewport === "mobile") {
    expect(
      evidence.maxTouchPoints,
      "mobile context has no touch input"
    ).toBeGreaterThan(0);
    expect(
      evidence.coarsePointer,
      "mobile context is still a fine pointer"
    ).toBe(true);
    expect(
      evidence.hoverNone,
      "mobile context still advertises hover"
    ).toBe(true);
  } else {
    expect(evidence.maxTouchPoints).toBe(0);
    expect(evidence.coarsePointer).toBe(false);
  }
}

async function assertMobileTouchTargets(page: Page): Promise<void> {
  const undersized = await page
    .getByTestId("brand-locale-evidence")
    .locator('button, [role="tab"]')
    .evaluateAll((elements, floor) =>
      elements.flatMap((element) => {
        const rect = element.getBoundingClientRect();
        return rect.width + 0.5 < floor || rect.height + 0.5 < floor
          ? [
              {
                label:
                  element.getAttribute("aria-label") ??
                  element.textContent?.trim() ??
                  element.tagName,
                width: rect.width,
                height: rect.height,
              },
            ]
          : [];
      }),
      MOBILE_TOUCH_TARGET_FLOOR
    );

  expect(
    undersized,
    `mobile actions are smaller than ${MOBILE_TOUCH_TARGET_FLOOR}px`
  ).toEqual([]);
}

async function waitForSettledCell(
  page: Page,
  fixture: Fixture,
  locale: Locale
): Promise<void> {
  await page.waitForFunction(
    ({ expectedFixture, expectedLocale }) => {
      const root = document.querySelector(
        '[data-testid="brand-locale-evidence"]'
      );
      const action = document.querySelector(
        '[data-testid="evidence-primary-action"]'
      );
      return Boolean(
        root &&
          action &&
          document.documentElement.dataset.tenant === expectedFixture &&
          document.documentElement.lang === expectedLocale &&
          getComputedStyle(action).backgroundColor !== "rgba(0, 0, 0, 0)"
      );
    },
    { expectedFixture: fixture, expectedLocale: locale },
    { timeout: 30_000 }
  );

  await page.evaluate(async () => {
    await document.fonts.ready;
    const sample = () => {
      const root = document.querySelector<HTMLElement>(
        '[data-testid="brand-locale-evidence"]'
      );
      const action = document.querySelector<HTMLElement>(
        '[data-testid="evidence-primary-action"]'
      );
      const card = document.querySelector<HTMLElement>(
        '[data-testid="evidence-card"]'
      );
      const title = document.querySelector<HTMLElement>(
        '[data-testid="evidence-brand-title"]'
      );
      if (!root || !action || !card || !title)
        throw new Error("brand-locale evidence anatomy missing while settling");
      const rootRect = root.getBoundingClientRect();
      const cardRect = card.getBoundingClientRect();
      const titleRect = title.getBoundingClientRect();
      const actionStyle = getComputedStyle(action);
      const cardStyle = getComputedStyle(card);
      return JSON.stringify({
        fonts: document.fonts.status,
        root: [rootRect.width, rootRect.height],
        title: [titleRect.x, titleRect.y, titleRect.width, titleRect.height],
        card: [cardRect.x, cardRect.y, cardRect.width, cardRect.height],
        action: [
          actionStyle.backgroundColor,
          actionStyle.borderTopLeftRadius,
          actionStyle.fontFamily,
        ],
        cardStyle: [
          cardStyle.backgroundColor,
          cardStyle.borderTopLeftRadius,
          cardStyle.boxShadow,
        ],
        scroll: [
          document.documentElement.scrollWidth,
          document.documentElement.scrollHeight,
        ],
      });
    };
    const frame = () =>
      new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

    let previous = sample();
    for (let attempt = 0; attempt < 8; attempt += 1) {
      await frame();
      await frame();
      const current = sample();
      if (current === previous) return;
      previous = current;
    }
    throw new Error("brand-locale evidence did not stabilize within 16 frames");
  });
}

async function gotoCell(
  page: Page,
  fixture: Fixture,
  locale: Locale
): Promise<void> {
  // Use the page-level runtime API instead of the legacy context typing. This
  // makes the media feature observable before first paint and keeps the gate
  // honest even when the installed Playwright types omit `reducedMotion`.
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(
    `/probe/brand-locale-evidence?fixture=${fixture}&locale=${locale}`,
    { waitUntil: "networkidle" }
  );
  await waitForSettledCell(page, fixture, locale);
}

async function switchCellInPlace(
  page: Page,
  fixture: Fixture,
  locale: Locale
): Promise<void> {
  await page.evaluate(
    ({ nextFixture, nextLocale }) => {
      const probe = window as Window & {
        __setBrandLocaleEvidenceCell?: (next: {
          fixture: Fixture;
          locale: Locale;
        }) => void;
      };
      if (!probe.__setBrandLocaleEvidenceCell) {
        throw new Error("brand-locale in-place switch hook is unavailable");
      }
      probe.__setBrandLocaleEvidenceCell({
        fixture: nextFixture,
        locale: nextLocale,
      });
    },
    { nextFixture: fixture, nextLocale: locale }
  );
  await waitForSettledCell(page, fixture, locale);
}

async function readChrome(page: Page): Promise<ChromeReadings> {
  return page.evaluate(() => {
    const root = document.querySelector<HTMLElement>(
      '[data-testid="brand-locale-evidence"]'
    );
    const action = document.querySelector<HTMLElement>(
      '[data-testid="evidence-primary-action"]'
    );
    const card = document.querySelector<HTMLElement>(
      '[data-testid="evidence-card"]'
    );
    const heading = document.querySelector<HTMLElement>(
      '[data-testid="evidence-brand-title"]'
    );
    if (!root || !action || !card || !heading)
      throw new Error("brand-locale evidence anatomy missing");

    const rootStyle = getComputedStyle(root);
    const headingStyle = getComputedStyle(heading);
    const actionStyle = getComputedStyle(action);
    const cardStyle = getComputedStyle(card);
    return {
      fontFamily: rootStyle.fontFamily,
      headingFontFamily: headingStyle.fontFamily,
      canvasBackground: rootStyle.backgroundColor,
      primaryBackground: actionStyle.backgroundColor,
      primaryColor: actionStyle.color,
      buttonRadius: actionStyle.borderTopLeftRadius,
      buttonShadow: actionStyle.boxShadow,
      cardBackground: cardStyle.backgroundColor,
      cardRadius: cardStyle.borderTopLeftRadius,
      cardBorderColor: cardStyle.borderTopColor,
      cardShadow: cardStyle.boxShadow,
    };
  });
}

async function assertOverlayChrome(page: Page, fixture: Fixture): Promise<void> {
  await page.getByTestId("evidence-tooltip-trigger").click();
  const tooltip = page.locator('[role="tooltip"]:visible');
  await expect(tooltip).toBeVisible();
  const tooltipChrome = await tooltip.evaluate((node) => {
    const style = getComputedStyle(node);
    return {
      background: style.backgroundColor,
      radius: style.borderTopLeftRadius,
    };
  });
  await page.keyboard.press("Escape");
  await expect(tooltip).toBeHidden();

  await page.getByTestId("evidence-popover-trigger").click();
  const popover = page.getByRole("dialog");
  await expect(popover).toBeVisible();
  const popoverChrome = await popover.evaluate((node) => {
    const style = getComputedStyle(node);
    return {
      background: style.backgroundColor,
      radius: style.borderTopLeftRadius,
    };
  });
  await page.keyboard.press("Escape");
  await expect(popover).toBeHidden();
  await page.mouse.move(0, 0);
  await page.evaluate(
    () =>
      new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
      )
  );

  if (fixture === "themanagementmiami") {
    expect(tooltipChrome.background).toBe("rgb(20, 34, 56)");
    expect(Number.parseFloat(tooltipChrome.radius)).toBeGreaterThan(5);
    expect(Number.parseFloat(tooltipChrome.radius)).toBeLessThan(7);
    expect(popoverChrome.background).toBe("rgb(255, 252, 246)");
    expect(Number.parseFloat(popoverChrome.radius)).toBeGreaterThan(8);
    expect(Number.parseFloat(popoverChrome.radius)).toBeLessThan(11);
  } else {
    expect(tooltipChrome.background).not.toBe("rgb(20, 34, 56)");
    expect(popoverChrome.background).not.toBe("rgb(255, 252, 246)");
  }
}

async function pixelDiffMetrics(
  page: Page,
  a: Buffer,
  b: Buffer
): Promise<PixelDiffMetrics> {
  return page.evaluate(
    async ({ aSrc, bSrc }: { aSrc: string; bSrc: string }) => {
      const load = (src: string) =>
        new Promise<HTMLImageElement>((resolve, reject) => {
          const image = new Image();
          image.onload = () => resolve(image);
          image.onerror = () =>
            reject(new Error("brand-locale screenshot decode failed"));
          image.src = src;
        });
      const [imageA, imageB] = await Promise.all([load(aSrc), load(bSrc)]);
      if (
        imageA.naturalWidth !== imageB.naturalWidth ||
        imageA.naturalHeight !== imageB.naturalHeight
      ) {
        throw new Error(
          `brand-locale dimensions differ: ${imageA.naturalWidth}x${imageA.naturalHeight} vs ${imageB.naturalWidth}x${imageB.naturalHeight}`
        );
      }

      const width = imageA.naturalWidth;
      const height = imageA.naturalHeight;
      const pixels = (image: HTMLImageElement) => {
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const context = canvas.getContext("2d");
        if (!context) throw new Error("2d context unavailable");
        context.drawImage(image, 0, 0);
        return context.getImageData(0, 0, width, height).data;
      };

      const aPixels = pixels(imageA);
      const bPixels = pixels(imageB);
      let different = 0;
      let foregroundDifferent = 0;
      let foregroundPixels = 0;
      const aGround = [aPixels[0], aPixels[1], aPixels[2]];
      const bGround = [bPixels[0], bPixels[1], bPixels[2]];
      for (let pixel = 0; pixel < width * height; pixel += 1) {
        const offset = pixel * 4;
        const changed =
          Math.abs(aPixels[offset] - bPixels[offset]) > 12 ||
          Math.abs(aPixels[offset + 1] - bPixels[offset + 1]) > 12 ||
          Math.abs(aPixels[offset + 2] - bPixels[offset + 2]) > 12;
        if (changed) different += 1;

        // Remove each tenant's own top-left canvas colour from the denominator.
        // A global background recolor therefore contributes to `fullRatio` but
        // cannot make `foregroundRatio` pass by itself.
        const isForeground =
          Math.abs(aPixels[offset] - aGround[0]) > 8 ||
          Math.abs(aPixels[offset + 1] - aGround[1]) > 8 ||
          Math.abs(aPixels[offset + 2] - aGround[2]) > 8 ||
          Math.abs(bPixels[offset] - bGround[0]) > 8 ||
          Math.abs(bPixels[offset + 1] - bGround[1]) > 8 ||
          Math.abs(bPixels[offset + 2] - bGround[2]) > 8;
        if (isForeground) {
          foregroundPixels += 1;
          if (changed) foregroundDifferent += 1;
        }
      }
      return {
        fullRatio: different / (width * height),
        foregroundRatio:
          foregroundPixels === 0 ? 0 : foregroundDifferent / foregroundPixels,
        foregroundPixels,
      };
    },
    {
      aSrc: `data:image/png;base64,${a.toString("base64")}`,
      bSrc: `data:image/png;base64,${b.toString("base64")}`,
    }
  );
}

test.describe.configure({ mode: "serial" });

test.beforeAll(() => {
  // The showroom consumes the package through its public dist exports. Without
  // this precondition a green browser matrix can be exercising yesterday's DS
  // while the source under review has already changed.
  const result = spawnSync(process.execPath, [DIST_FRESHNESS_GATE, "--check"], {
    encoding: "utf8",
  });
  expect(
    result.status,
    `white-label evidence requires fresh @rottay/design-system dist:\n${result.stdout}${result.stderr}`
  ).toBe(0);
});

test("The Management showroom specimen is structurally identical to the canonical core fixture", () => {
  expect(showroomManagementTheme).toEqual(canonicalManagementTheme);
});

for (const viewport of Object.keys(VIEWPORTS) as Viewport[]) {
  test.describe(`${viewport} interaction context`, () => {
    test.use({ ...CONTEXTS[viewport] });

    for (const locale of LOCALES) {
      test.describe(`${locale} browser locale`, () => {
        test.use({ locale: BROWSER_LOCALES[locale] });

        test(`BitHire static and The Management DB diverge in ${locale}`, async ({
          page,
        }) => {
          test.setTimeout(120_000);

          const screenshots = new Map<Fixture, Buffer>();
          const chrome = new Map<Fixture, ChromeReadings>();

          for (const fixture of FIXTURES) {
            await gotoCell(page, fixture, locale);

            const root = page.getByTestId("brand-locale-evidence");
            await expect(root).toHaveAttribute("lang", locale);
            await expect(root).toHaveAttribute(
              "dir",
              locale === "ar" ? "rtl" : "ltr"
            );
            await expect(root).toHaveAttribute("data-evidence-locale", locale);
            await expect(root).toHaveAttribute(
              "data-evidence-direction",
              locale === "ar" ? "rtl" : "ltr"
            );
            await expect(root).toHaveAttribute(
              "data-evidence-source",
              fixture === "bithire" ? "SOURCE:STATIC" : "SOURCE:DB"
            );
            await expect(root).toHaveAttribute(
              "data-evidence-config-path",
              fixture === "bithire" ? "brand-theme" : "appearance"
            );
            await expect(page.getByTestId("localized-empty-copy")).toHaveText(
              EXPECTED_COPY[fixture][locale]
            );
            await expect(page.getByTestId("evidence-primary-body")).toHaveText(
              EXPECTED_COPY[fixture][locale]
            );
            await assertLocalizedCopy(page, locale);
            await assertTabDirection(page, locale);
            await assertActionDirection(page, locale);
            await assertResponsiveAnatomy(page, viewport);
            await assertEvidenceContrast(page);
            await assertRuntimeEnvironment(page, fixture, locale, viewport);
            await assertOverlayChrome(page, fixture);
            if (viewport === "mobile") await assertMobileTouchTargets(page);

            const documentEvidence = await page.evaluate(() => ({
              tenant: document.documentElement.dataset.tenant,
              lang: document.documentElement.lang,
              dir: document.documentElement.dir,
              computedDirection: getComputedStyle(
                document.querySelector(
                  '[data-testid="brand-locale-evidence"]'
                ) as Element
              ).direction,
              viewportOverflow:
                document.documentElement.scrollWidth >
                document.documentElement.clientWidth,
              inlinePrimary: document.documentElement.style.getPropertyValue(
                "--ds-color-primary"
              ),
              inlineEffectIntensity:
                document.documentElement.style.getPropertyValue(
                  "--ds-effect-intensity"
                ),
              inlineTooltipBackground:
                document.documentElement.style.getPropertyValue(
                  "--ds-tooltip-bordered-background"
                ),
              inlinePopoverBackground:
                document.documentElement.style.getPropertyValue(
                  "--ds-popover-bordered-background"
                ),
            }));
            expect(documentEvidence).toMatchObject({
              tenant: fixture,
              lang: locale,
              dir: locale === "ar" ? "rtl" : "ltr",
              computedDirection: locale === "ar" ? "rtl" : "ltr",
              viewportOverflow: false,
            });
            if (fixture === "themanagementmiami") {
              expect(
                documentEvidence.inlinePrimary.toLowerCase(),
                "The Management did not traverse the DB Appearance variable path"
              ).toBe("#0f766e");
              expect(
                documentEvidence.inlineEffectIntensity,
                "The Management general surface-detail dial did not reach the runtime root"
              ).toBe("0.45");
              expect(
                documentEvidence.inlineTooltipBackground.toLowerCase(),
                "The Management tooltip chrome did not traverse the DB Appearance path"
              ).toBe("#142238");
              expect(
                documentEvidence.inlinePopoverBackground.toLowerCase(),
                "The Management popover chrome did not traverse the DB Appearance path"
              ).toBe("#fffcf6");
            } else {
              expect(
                documentEvidence.inlinePrimary,
                "BitHire static identity leaked into the DB Appearance path"
              ).toBe("");
              expect(
                documentEvidence.inlineEffectIntensity,
                "BitHire static material identity leaked into the DB Appearance path"
              ).toBe("");
              expect(
                documentEvidence.inlineTooltipBackground,
                "BitHire static tooltip identity leaked into the DB Appearance path"
              ).toBe("");
              expect(
                documentEvidence.inlinePopoverBackground,
                "BitHire static popover identity leaked into the DB Appearance path"
              ).toBe("");
            }

            chrome.set(fixture, await readChrome(page));
            // Re-capture the exact same settled cell before comparing brands.
            // This makes determinism a measured prerequisite rather than an
            // assumption hidden behind a permissive screenshot threshold.
            const screenshot = await page.screenshot({
              animations: "disabled",
              caret: "hide",
              fullPage: false,
              scale: "css",
            });
            await page.evaluate(
              () =>
                new Promise<void>((resolve) =>
                  requestAnimationFrame(() =>
                    requestAnimationFrame(() => resolve())
                  )
                )
            );
            const repeatedScreenshot = await page.screenshot({
              animations: "disabled",
              caret: "hide",
              fullPage: false,
              scale: "css",
            });
            const stability = await pixelDiffMetrics(
              page,
              screenshot,
              repeatedScreenshot
            );
            expect(
              stability.fullRatio,
              `${fixture} ${locale}/${viewport} is not pixel-stable`
            ).toBeLessThanOrEqual(SAME_CELL_STABILITY_CEILING);

            screenshots.set(fixture, screenshot);
            await expect(page).toHaveScreenshot(
              `${fixture}-${locale}-${viewport}.png`
            );
          }

          const bithire = chrome.get("bithire");
          const management = chrome.get("themanagementmiami");
          if (!bithire || !management)
            throw new Error("brand chrome readings missing");

          const changedChannels = (
            Object.keys(bithire) as Array<keyof ChromeReadings>
          ).filter((channel) => bithire[channel] !== management[channel]);
          expect(
            changedChannels.length,
            `real tenants changed only ${
              changedChannels.join(", ") || "no"
            } chrome channels`
          ).toBeGreaterThanOrEqual(6);
          expect(bithire.fontFamily).toContain("Public Sans");
          expect(bithire.headingFontFamily).toContain("Space Grotesk");
          expect(management.fontFamily).toContain("Optima");
          expect(management.headingFontFamily).toContain("Fraunces");
          expect(bithire.fontFamily).not.toBe(management.fontFamily);
          expect(bithire.headingFontFamily).not.toBe(
            management.headingFontFamily
          );
          expect(bithire.primaryBackground).not.toBe(
            management.primaryBackground
          );
          expect(bithire.buttonRadius).not.toBe(management.buttonRadius);
          expect(bithire.cardRadius).not.toBe(management.cardRadius);
          expect(
            bithire.cardBackground !== management.cardBackground,
            "tenant card surfaces are identical"
          ).toBe(true);

          // String inequality is too weak: aliases or sub-pixel differences can
          // technically differ while remaining imperceptible. These floors require
          // a customer-visible change on five independent visual axes.
          expect(
            colorDistance(
              bithire.primaryBackground,
              management.primaryBackground
            ),
            "tenant primary controls are not materially different"
          ).toBeGreaterThan(24);
          expect(
            Math.max(
              radiusDelta(bithire.buttonRadius, management.buttonRadius),
              radiusDelta(bithire.cardRadius, management.cardRadius)
            ),
            "tenant corner systems differ by less than two pixels"
          ).toBeGreaterThanOrEqual(2);
          expect(
            colorDistance(
              bithire.canvasBackground,
              management.canvasBackground
            ),
            "tenant canvas surfaces are not materially different"
          ).toBeGreaterThan(10);
          expect(
            bithire.buttonShadow !== management.buttonShadow ||
              bithire.cardShadow !== management.cardShadow,
            "tenant depth differs only by an invisible border alias"
          ).toBe(true);
          const bithireScreenshot = screenshots.get("bithire");
          const managementScreenshot = screenshots.get("themanagementmiami");
          if (!bithireScreenshot || !managementScreenshot)
            throw new Error("brand screenshots missing");
          const visualDivergence = await pixelDiffMetrics(
            page,
            bithireScreenshot,
            managementScreenshot
          );
          expect(
            visualDivergence.fullRatio,
            `BitHire and The Management ${locale}/${viewport} look too similar`
          ).toBeGreaterThan(REAL_TENANT_VISUAL_DIVERGENCE_FLOOR);
          expect(
            visualDivergence.foregroundPixels,
            "foreground mask found too little non-canvas evidence"
          ).toBeGreaterThan(5_000);
          expect(
            visualDivergence.foregroundRatio,
            `BitHire and The Management ${locale}/${viewport} differ only on canvas`
          ).toBeGreaterThan(REAL_TENANT_FOREGROUND_DIVERGENCE_FLOOR);

          // Exercise the transition the forward-only matrix used to miss. A DB
          // customer followed by the bundled vertical must restore identical
          // static chrome and remove every inline Appearance variable/style.
          // `performance.timeOrigin` proves this happened inside the same
          // document rather than being cleaned accidentally by a full reload.
          const documentTimeOrigin = await page.evaluate(
            () => performance.timeOrigin
          );
          await switchCellInPlace(page, "bithire", locale);
          expect(await page.evaluate(() => performance.timeOrigin)).toBe(
            documentTimeOrigin
          );
          await expect(
            page.getByTestId("brand-locale-evidence")
          ).toHaveAttribute("data-evidence-config-path", "brand-theme");
          await expect(page.getByTestId("localized-empty-copy")).toHaveText(
            EXPECTED_COPY.bithire[locale]
          );
          expect(await readChrome(page)).toEqual(bithire);
          const cleanupEvidence = await page.evaluate(() => ({
            inlinePrimary: document.documentElement.style.getPropertyValue(
              "--ds-color-primary"
            ),
            staleManagementChrome: Boolean(
              document.getElementById("ds-chrome-themanagementmiami")
            ),
          }));
          expect(cleanupEvidence).toEqual({
            inlinePrimary: "",
            staleManagementChrome: false,
          });
        });
      });
    }
  });
}
