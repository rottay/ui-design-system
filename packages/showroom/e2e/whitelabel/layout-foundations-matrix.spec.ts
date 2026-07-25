import { devices, expect, test, type Page } from "@playwright/test";

type Fixture = "bithire" | "themanagementmiami";
type Locale = "en" | "es" | "ar";
type Viewport = "desktop" | "mobile";

const FIXTURES: readonly Fixture[] = ["bithire", "themanagementmiami"];
const LOCALES: readonly Locale[] = ["en", "es", "ar"];
const CONTEXTS = {
  desktop: {
    viewport: { width: 1280, height: 900 },
    deviceScaleFactor: 1,
    hasTouch: false,
    isMobile: false,
  },
  mobile: {
    userAgent: devices["Pixel 7"].userAgent,
    viewport: { width: 393, height: 852 },
    deviceScaleFactor: 1,
    hasTouch: true,
    isMobile: true,
  },
} as const;
const BROWSER_LOCALES: Record<Locale, string> = {
  en: "en-US",
  es: "es-AR",
  ar: "ar-SA",
};
const EXPECTED_EMPTY_COPY: Record<Fixture, Record<Locale, string>> = {
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
const EXPECTED_UI_COPY: Record<
  Locale,
  {
    save: string;
    cancel: string;
    more: string;
    metrics: string;
    live: string;
    actions: string;
    noResults: string;
  }
> = {
  en: {
    save: "Save",
    cancel: "Cancel",
    more: "More",
    metrics: "Key metrics",
    live: "Live",
    actions: "Actions",
    noResults: "No results",
  },
  es: {
    save: "Guardar",
    cancel: "Cancelar",
    more: "Más",
    metrics: "Métricas clave",
    live: "En vivo",
    actions: "Acciones",
    noResults: "Sin resultados",
  },
  ar: {
    save: "حفظ",
    cancel: "إلغاء",
    more: "المزيد",
    metrics: "المؤشرات الرئيسية",
    live: "مباشر",
    actions: "الإجراءات",
    noResults: "لا توجد نتائج",
  },
};

async function waitForCell(
  page: Page,
  fixture: Fixture,
  locale: Locale
): Promise<void> {
  const root = page.getByTestId("layout-foundations-evidence");
  await expect(root).toHaveAttribute("data-evidence-brand", fixture);
  await expect(root).toHaveAttribute("data-evidence-locale", locale);
  await expect(root).toHaveAttribute(
    "data-evidence-direction",
    locale === "ar" ? "rtl" : "ltr"
  );
  await page.evaluate(async () => {
    await document.fonts.ready;
    await new Promise<void>((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
    );
  });
}

async function gotoCell(
  page: Page,
  fixture: Fixture,
  locale: Locale
): Promise<void> {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(
    `/probe/layout-foundations-evidence?fixture=${fixture}&locale=${locale}`,
    { waitUntil: "networkidle" }
  );
  await waitForCell(page, fixture, locale);
}

async function switchCell(
  page: Page,
  fixture: Fixture,
  locale: Locale
): Promise<void> {
  await page.evaluate(
    ({ nextFixture, nextLocale }) => {
      const probe = window as Window & {
        __setLayoutFoundationsCell?: (next: {
          fixture: Fixture;
          locale: Locale;
        }) => void;
      };
      if (!probe.__setLayoutFoundationsCell) {
        throw new Error(
          "layout-foundations in-place switch hook is unavailable"
        );
      }
      probe.__setLayoutFoundationsCell({
        fixture: nextFixture,
        locale: nextLocale,
      });
    },
    { nextFixture: fixture, nextLocale: locale }
  );
  await waitForCell(page, fixture, locale);
}

async function readLayout(page: Page) {
  return page.evaluate(() => {
    const required = (testId: string) => {
      const node = document.querySelector<HTMLElement>(
        `[data-testid="${testId}"]`
      );
      if (!node) throw new Error(`missing layout evidence node: ${testId}`);
      return node;
    };
    const root = required("layout-foundations-evidence");
    const container = required("layout-evidence-container");
    const stack = required("layout-evidence-stack");
    const grid = required("layout-evidence-grid");
    const box = required("layout-evidence-box");
    const aspect = required("layout-evidence-aspect-ratio");
    const aspectChild = required("layout-evidence-aspect-child");
    const header = required("layout-evidence-header-flex");
    const wrappingFlex = required("layout-evidence-wrapping-flex");
    const space = required("layout-evidence-space");
    const divider = required("layout-evidence-divider");
    const heading = required("layout-evidence-heading");
    const primaryAction = required("layout-evidence-primary-action");
    const secondaryAction = required("layout-evidence-secondary-action");
    const tertiaryAction = required("layout-evidence-tertiary-action");
    const longCopy = required("layout-evidence-long-copy");
    const rootRect = root.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    const aspectRect = aspect.getBoundingClientRect();
    const aspectChildRect = aspectChild.getBoundingClientRect();
    const primaryActionRect = primaryAction.getBoundingClientRect();
    const secondaryActionRect = secondaryAction.getBoundingClientRect();
    const tertiaryActionRect = tertiaryAction.getBoundingClientRect();
    const dividerText =
      divider.querySelector<HTMLElement>('[data-part="text"]');
    const dividerBefore = divider.querySelector<HTMLElement>(
      '[data-part="line-before"]'
    );
    const dividerAfter = divider.querySelector<HTMLElement>(
      '[data-part="line-after"]'
    );
    if (!dividerText || !dividerBefore || !dividerAfter) {
      throw new Error("divider anatomy missing");
    }
    const dividerTextRect = dividerText.getBoundingClientRect();
    const dividerBeforeRect = dividerBefore.getBoundingClientRect();
    const dividerAfterRect = dividerAfter.getBoundingClientRect();
    const rootStyle = getComputedStyle(root);
    const containerStyle = getComputedStyle(container);
    const stackStyle = getComputedStyle(stack);
    const boxStyle = getComputedStyle(box);
    const gridStyle = getComputedStyle(grid);
    const headerStyle = getComputedStyle(header);
    const wrappingFlexStyle = getComputedStyle(wrappingFlex);
    const spaceStyle = getComputedStyle(space);
    const dividerStyle = getComputedStyle(divider);
    const headingStyle = getComputedStyle(heading);
    const primaryActionStyle = getComputedStyle(primaryAction);
    const htmlStyle = getComputedStyle(document.documentElement);
    const spaceSeparators = space.querySelectorAll('[data-part="separator"]');
    const wrappingFlexChildren = Array.from(
      wrappingFlex.children
    ) as HTMLElement[];
    const wrappedRows = new Set(
      wrappingFlexChildren.map((child) =>
        Math.round(child.getBoundingClientRect().top)
      )
    ).size;
    const measuredNodes = [
      root,
      container,
      stack,
      grid,
      box,
      aspect,
      header,
      wrappingFlex,
      space,
      divider,
      longCopy,
    ];
    const internalOverflows = measuredNodes
      .filter(
        (node) =>
          node.scrollWidth > node.clientWidth + 1 ||
          node.scrollHeight > node.clientHeight + 1
      )
      .map((node) => node.dataset.testid ?? node.tagName);

    return {
      rootWidth: rootRect.width,
      containerLeft: containerRect.left - rootRect.left,
      containerRight: rootRect.right - containerRect.right,
      containerWidth: containerRect.width,
      containerMaxWidth: containerStyle.maxWidth,
      containerPaddingInline: [
        containerStyle.paddingLeft,
        containerStyle.paddingRight,
      ],
      stackDirection: stackStyle.flexDirection,
      stackGap: stackStyle.gap,
      gridColumns: gridStyle.gridTemplateColumns.split(" ").filter(Boolean)
        .length,
      gridGap: gridStyle.gap,
      gridAlignItems: gridStyle.alignItems,
      headerDirection: headerStyle.flexDirection,
      headerWrap: headerStyle.flexWrap,
      headerGap: headerStyle.gap,
      headerAlign: headerStyle.alignItems,
      headerJustify: headerStyle.justifyContent,
      wrappingFlexWrap: wrappingFlexStyle.flexWrap,
      wrappingFlexRows: wrappedRows,
      spaceDirection: spaceStyle.direction,
      spaceWrap: spaceStyle.flexWrap,
      spaceGap: spaceStyle.gap,
      spaceSeparatorCount: spaceSeparators.length,
      actionPositions: {
        primary: [primaryActionRect.x, primaryActionRect.y],
        secondary: [secondaryActionRect.x, secondaryActionRect.y],
        tertiary: [tertiaryActionRect.x, tertiaryActionRect.y],
      },
      dividerDirection: dividerStyle.direction,
      dividerOrientation: divider.getAttribute("aria-orientation"),
      dividerTextPosition: [dividerTextRect.x, dividerTextRect.width],
      dividerSegments: [dividerBeforeRect.width, dividerAfterRect.width],
      ratio: aspectRect.width / aspectRect.height,
      aspectChildFill: [
        aspectChildRect.width / aspectRect.width,
        aspectChildRect.height / aspectRect.height,
      ],
      boxRadius: boxStyle.borderTopLeftRadius,
      boxBackground: boxStyle.backgroundColor,
      boxBorder: boxStyle.borderTopColor,
      boxShadow: boxStyle.boxShadow,
      boxPadding: [boxStyle.paddingTop, boxStyle.paddingLeft],
      rootFont: rootStyle.fontFamily,
      headingFont: headingStyle.fontFamily,
      headingSize: headingStyle.fontSize,
      primaryActionChrome: [
        primaryActionStyle.backgroundColor,
        primaryActionStyle.borderTopLeftRadius,
        primaryActionStyle.height,
        primaryActionStyle.fontFamily,
      ],
      density: htmlStyle.getPropertyValue("--ds-density-scale").trim(),
      radiusToken: htmlStyle.getPropertyValue("--ds-radius-lg").trim(),
      surfaceToken: htmlStyle.getPropertyValue("--ds-surface-card").trim(),
      primaryToken: htmlStyle.getPropertyValue("--ds-color-primary").trim(),
      effectIntensity: htmlStyle
        .getPropertyValue("--ds-effect-intensity")
        .trim(),
      internalOverflows,
      viewportOverflow:
        document.documentElement.scrollWidth >
        document.documentElement.clientWidth,
      tenant: document.documentElement.dataset.tenant,
      documentLang: document.documentElement.lang,
      documentDirection: document.documentElement.dir,
      inlinePrimary:
        document.documentElement.style.getPropertyValue("--ds-color-primary"),
      inlineDensity: document.documentElement.style.getPropertyValue(
        "--ds-density-mode-factor"
      ),
      inlineEffectIntensity: document.documentElement.style.getPropertyValue(
        "--ds-effect-intensity"
      ),
    };
  });
}

function visualFingerprint(reading: Awaited<ReturnType<typeof readLayout>>) {
  return {
    typography: [reading.rootFont, reading.headingFont, reading.headingSize],
    density: [
      reading.density,
      reading.stackGap,
      ...reading.containerPaddingInline,
    ],
    shape: [reading.radiusToken, reading.boxRadius],
    material: [
      reading.surfaceToken,
      reading.boxBackground,
      reading.boxBorder,
      reading.boxShadow,
      reading.effectIntensity,
    ],
    control: reading.primaryActionChrome,
    color: reading.primaryToken,
  };
}

test.describe.configure({ mode: "serial" });

for (const viewport of Object.keys(CONTEXTS) as Viewport[]) {
  test.describe(`${viewport} layout foundations`, () => {
    test.use({ ...CONTEXTS[viewport] });

    for (const locale of LOCALES) {
      test.describe(`${locale} locale`, () => {
        test.use({ locale: BROWSER_LOCALES[locale] });

        test(`static and DB layout contracts hold in ${locale}`, async ({
          page,
        }) => {
          test.setTimeout(120_000);
          const readings = new Map<
            Fixture,
            Awaited<ReturnType<typeof readLayout>>
          >();

          for (const fixture of FIXTURES) {
            await gotoCell(page, fixture, locale);
            const root = page.getByTestId("layout-foundations-evidence");
            await expect(root).toHaveAttribute("lang", locale);
            await expect(root).toHaveAttribute(
              "dir",
              locale === "ar" ? "rtl" : "ltr"
            );
            await expect(root).toHaveAttribute(
              "data-evidence-source",
              fixture === "bithire" ? "SOURCE:STATIC" : "SOURCE:APPEARANCE"
            );
            await expect(root).toHaveAttribute(
              "data-evidence-config-path",
              fixture === "bithire" ? "brand-theme" : "appearance"
            );
            await expect(root).toContainText(
              EXPECTED_EMPTY_COPY[fixture][locale]
            );
            for (const copy of Object.values(EXPECTED_UI_COPY[locale])) {
              await expect(root).toContainText(copy);
            }

            const reading = await readLayout(page);
            expect(reading).toMatchObject({
              viewportOverflow: false,
              internalOverflows: [],
              tenant: fixture,
              documentLang: locale,
              documentDirection: locale === "ar" ? "rtl" : "ltr",
              stackDirection: "column",
              headerWrap: "wrap",
              wrappingFlexWrap: "wrap",
              spaceDirection: locale === "ar" ? "rtl" : "ltr",
              spaceWrap: "wrap",
              spaceSeparatorCount: 2,
              dividerDirection: locale === "ar" ? "rtl" : "ltr",
              dividerOrientation: "horizontal",
            });
            expect(
              Math.abs(reading.containerLeft - reading.containerRight)
            ).toBeLessThan(2);
            expect(reading.containerWidth).toBeLessThanOrEqual(
              reading.rootWidth
            );
            expect(
              Number.parseFloat(reading.containerMaxWidth)
            ).toBeLessThanOrEqual(1280);
            expect(reading.containerPaddingInline).toEqual([
              reading.containerPaddingInline[0],
              reading.containerPaddingInline[0],
            ]);
            expect(Number.parseFloat(reading.stackGap)).toBeGreaterThan(0);
            expect(Number.parseFloat(reading.gridGap)).toBeGreaterThan(0);
            expect(reading.gridAlignItems).toBe("stretch");
            expect(Number.parseFloat(reading.headerGap)).toBeGreaterThan(0);
            expect(reading.headerJustify).toBe("space-between");
            expect(reading.wrappingFlexRows).toBeGreaterThan(1);
            expect(Number.parseFloat(reading.spaceGap)).toBeGreaterThan(0);
            expect(reading.ratio).toBeGreaterThan(1.76);
            expect(reading.ratio).toBeLessThan(1.79);
            for (const fill of reading.aspectChildFill) {
              expect(fill).toBeGreaterThan(0.98);
              expect(fill).toBeLessThanOrEqual(1.01);
            }
            expect(Number.parseFloat(reading.boxRadius)).toBeGreaterThan(0);
            expect(reading.boxBackground).not.toBe("rgba(0, 0, 0, 0)");
            expect(reading.boxBorder).not.toBe("rgba(0, 0, 0, 0)");
            expect(reading.boxShadow).not.toBe("");
            expect(Number.parseFloat(reading.boxPadding[0])).toBeGreaterThan(0);
            expect(Number.parseFloat(reading.boxPadding[1])).toBeGreaterThan(0);
            if (locale === "ar") {
              expect(reading.actionPositions.primary[0]).toBeGreaterThan(
                reading.actionPositions.secondary[0]
              );
            } else {
              expect(reading.actionPositions.primary[0]).toBeLessThan(
                reading.actionPositions.secondary[0]
              );
            }
            // `start` is a logical contract: the first DOM segment stays the
            // short inline-start segment while CSS direction mirrors its
            // physical side. No locale-side prop inversion is permitted.
            expect(reading.dividerSegments[0]).toBeLessThan(
              reading.dividerSegments[1]
            );

            if (viewport === "mobile") {
              expect(reading.gridColumns).toBe(1);
              expect(reading.headerDirection).toBe("column");
              expect(reading.headerAlign).toBe("flex-start");
            } else {
              expect(reading.gridColumns).toBe(3);
              expect(reading.headerDirection).toBe("row");
              expect(reading.headerAlign).toBe("center");
            }
            if (fixture === "themanagementmiami") {
              expect(reading.inlinePrimary.toLowerCase()).toBe("#0f766e");
            } else {
              expect(reading.inlinePrimary).toBe("");
            }

            readings.set(fixture, reading);
            await expect(page).toHaveScreenshot(
              `${fixture}-${locale}-${viewport}.png`,
              {
                animations: "disabled",
                caret: "hide",
                fullPage: viewport === "mobile",
              }
            );
          }

          const bitHire = readings.get("bithire");
          const management = readings.get("themanagementmiami");
          if (!bitHire || !management)
            throw new Error("tenant readings missing");
          const bitHireFingerprint = visualFingerprint(bitHire);
          const managementFingerprint = visualFingerprint(management);
          const changedChannels = Object.keys(bitHireFingerprint).filter(
            (channel) =>
              JSON.stringify(
                bitHireFingerprint[channel as keyof typeof bitHireFingerprint]
              ) !==
              JSON.stringify(
                managementFingerprint[
                  channel as keyof typeof managementFingerprint
                ]
              )
          );
          expect(changedChannels).toEqual(
            expect.arrayContaining([
              "typography",
              "density",
              "shape",
              "material",
              "control",
              "color",
            ])
          );
        });
      });
    }
  });
}

test("static to Appearance to static cleans every measured runtime channel", async ({
  page,
}) => {
  await gotoCell(page, "bithire", "en");
  const initial = await readLayout(page);
  expect(initial.inlinePrimary).toBe("");
  expect(initial.inlineDensity).toBe("");
  expect(initial.inlineEffectIntensity).toBe("");

  await switchCell(page, "themanagementmiami", "ar");
  const appearance = await readLayout(page);
  expect(appearance.inlinePrimary.toLowerCase()).toBe("#0f766e");
  expect(appearance.inlineDensity).not.toBe("");
  expect(appearance.inlineEffectIntensity).toBe("0.45");
  await expect(page.getByTestId("layout-foundations-evidence")).toContainText(
    EXPECTED_EMPTY_COPY.themanagementmiami.ar
  );

  await switchCell(page, "bithire", "es");
  const restored = await readLayout(page);
  expect(restored.inlinePrimary).toBe("");
  expect(restored.inlineDensity).toBe("");
  expect(restored.inlineEffectIntensity).toBe("");
  expect(visualFingerprint(restored)).toEqual(visualFingerprint(initial));
  await expect(page.getByTestId("layout-foundations-evidence")).toContainText(
    EXPECTED_EMPTY_COPY.bithire.es
  );
});

test("responsive thresholds keep every foundation aligned without overflow", async ({
  page,
}) => {
  for (const cell of [
    { width: 768, height: 900, columns: 2, header: "row" },
    { width: 1024, height: 900, columns: 3, header: "row" },
    { width: 1600, height: 1000, columns: 3, header: "row" },
  ] as const) {
    await page.setViewportSize({ width: cell.width, height: cell.height });
    await gotoCell(page, "bithire", "en");
    const reading = await readLayout(page);
    expect(reading.gridColumns).toBe(cell.columns);
    expect(reading.headerDirection).toBe(cell.header);
    expect(reading.viewportOverflow).toBe(false);
    expect(reading.internalOverflows).toEqual([]);
    expect(reading.containerWidth).toBeLessThanOrEqual(1280);
    expect(
      Math.abs(reading.containerLeft - reading.containerRight)
    ).toBeLessThan(2);
  }
});
