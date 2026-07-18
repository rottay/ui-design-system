import React, { act, type ReactElement } from "react";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { cleanup, render } from "@testing-library/react";
import { hydrateRoot, type Root } from "react-dom/client";
import { renderToStaticMarkup, renderToString } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ICON_PROVENANCE, Icon } from "@/entrypoints/icons";
import {
  BRAND_MARK_PROVENANCE,
  BRAND_MARK_NAMES,
  CLOUD_SERVICES,
  CLOUD_SERVICE_MARK_PROVENANCE,
  MARK_TRADEMARK_NOTICE,
  BrandMark,
  CloudServiceMark,
} from "@/entrypoints/graphics/marks";
import {
  FEATURE_PICTOGRAM_PROVENANCE,
  FeaturePictogram,
} from "@/entrypoints/graphics/pictograms";

type AssetClass =
  | "semantic-icon"
  | "brand-mark"
  | "cloud-service-mark"
  | "feature-pictogram";

interface AssetFacadeCase {
  readonly assetClass: AssetClass;
  readonly accessibleName: string;
  readonly render: (
    intent: "labeled" | "decorative",
    testId?: string
  ) => ReactElement;
}

const ASSET_FACADES: readonly AssetFacadeCase[] = [
  {
    assetClass: "semantic-icon",
    accessibleName: "Next destination",
    render: (intent, testId) =>
      intent === "labeled" ? (
        <Icon
          name="navigation.forward"
          label="Next destination"
          data-testid={testId}
        />
      ) : (
        <Icon name="navigation.forward" decorative data-testid={testId} />
      ),
  },
  {
    assetClass: "brand-mark",
    accessibleName: "GitHub",
    render: (intent, testId) =>
      intent === "labeled" ? (
        <BrandMark name="github" label="GitHub" data-testid={testId} />
      ) : (
        <BrandMark name="github" decorative data-testid={testId} />
      ),
  },
  {
    assetClass: "cloud-service-mark",
    accessibleName: "AWS Lambda",
    render: (intent, testId) =>
      intent === "labeled" ? (
        <CloudServiceMark
          provider="aws"
          service="lambda"
          label="AWS Lambda"
          data-testid={testId}
        />
      ) : (
        <CloudServiceMark
          provider="aws"
          service="lambda"
          decorative
          data-testid={testId}
        />
      ),
  },
  {
    assetClass: "feature-pictogram",
    accessibleName: "Workflow automation",
    render: (intent, testId) =>
      intent === "labeled" ? (
        <FeaturePictogram
          name="workflow-automation"
          label="Workflow automation"
          data-testid={testId}
        />
      ) : (
        <FeaturePictogram
          name="workflow-automation"
          decorative
          data-testid={testId}
        />
      ),
  },
] as const;

const SERVER_SOURCE_PATHS = [
  "src/entrypoints/icons/index.ts",
  "src/entrypoints/graphics/marks/index.ts",
  "src/entrypoints/graphics/pictograms/index.ts",
  "src/graphics/icons/presentation/semantic-icon/index.tsx",
  "src/graphics/icons/runtime/semantic/create-icon/index.tsx",
  "src/graphics/brand-marks/presentation/brand-mark/index.tsx",
  "src/graphics/brand-marks/presentation/cloud-service-mark/index.tsx",
  "src/graphics/brand-marks/runtime/adapters/thesvg-react/index.ts",
  "src/graphics/brand-marks/runtime/adapters/thesvg-react/brand/index.tsx",
  "src/graphics/brand-marks/runtime/adapters/thesvg-react/cloud-service/index.tsx",
  "src/graphics/pictograms/presentation/feature-pictogram/index.tsx",
] as const;

const CSS_BY_ASSET_CLASS = {
  "semantic-icon":
    "src/foundation/tokens/css/presentation/components/semantic-icon.css",
  "brand-mark": "src/foundation/tokens/css/presentation/components/mark.css",
  "cloud-service-mark":
    "src/foundation/tokens/css/presentation/components/mark.css",
  "feature-pictogram":
    "src/foundation/tokens/css/presentation/components/feature-pictogram.css",
} as const satisfies Readonly<Record<AssetClass, string>>;

function readSource(path: string): string {
  return readFileSync(resolve(process.cwd(), path), "utf8");
}

function innerMarkup(markup: string): string {
  return markup.replace(/^<div dir="(?:ltr|rtl)">|<\/div>$/g, "");
}

function labeledMatrix(): ReactElement {
  return (
    <section data-testid="asset-facade-matrix">
      {ASSET_FACADES.map((entry) => (
        <div key={entry.assetClass}>
          {entry.render("labeled", entry.assetClass)}
        </div>
      ))}
    </section>
  );
}

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("CRA17 four-facade asset certification", () => {
  it("server-renders every facade deterministically, non-empty, and in one unique asset class", () => {
    const observedClasses = new Set<string>();

    for (const entry of ASSET_FACADES) {
      const first = renderToStaticMarkup(entry.render("decorative"));
      const second = renderToStaticMarkup(entry.render("decorative"));
      const host = document.createElement("div");
      host.innerHTML = first;
      const svg = host.querySelector("svg");

      expect(second, entry.assetClass).toBe(first);
      expect(svg, entry.assetClass).not.toBeNull();
      expect(svg?.childElementCount, entry.assetClass).toBeGreaterThan(0);
      expect(svg?.getAttribute("data-asset-class"), entry.assetClass).toBe(
        entry.assetClass
      );
      expect(
        host.querySelectorAll("[data-asset-class]"),
        entry.assetClass
      ).toHaveLength(1);
      expect(first, entry.assetClass).not.toMatch(
        /<image\b|https?:\/\/[^"']+\.svg/i
      );
      observedClasses.add(svg?.getAttribute("data-asset-class") ?? "");
    }

    expect([...observedClasses]).toEqual([
      "semantic-icon",
      "brand-mark",
      "cloud-service-mark",
      "feature-pictogram",
    ]);
  });

  it("hydrates the complete server matrix without changing markup or reporting a mismatch", async () => {
    const element = labeledMatrix();
    const host = document.createElement("div");
    host.innerHTML = renderToString(element);
    const serverMarkup = host.innerHTML;
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    let root: Root | undefined;

    await act(async () => {
      root = hydrateRoot(host, element);
    });

    expect(host.innerHTML).toBe(serverMarkup);
    expect(host.querySelectorAll("[data-asset-class]")).toHaveLength(4);
    expect(consoleError).not.toHaveBeenCalled();

    await act(async () => {
      root?.unmount();
    });
  });

  it("requires explicit informative or decorative accessibility intent on every facade", () => {
    const labeled = render(labeledMatrix());

    for (const entry of ASSET_FACADES) {
      const svg = labeled.getByTestId(entry.assetClass);
      expect(svg).toHaveAttribute("role", "img");
      expect(svg).toHaveAttribute("aria-label", entry.accessibleName);
      expect(svg).not.toHaveAttribute("aria-hidden");
      expect(svg).toHaveAttribute("focusable", "false");
    }

    labeled.rerender(
      <section>
        {ASSET_FACADES.map((entry) => (
          <div key={entry.assetClass}>
            {entry.render("decorative", entry.assetClass)}
          </div>
        ))}
      </section>
    );

    for (const entry of ASSET_FACADES) {
      const svg = labeled.getByTestId(entry.assetClass);
      expect(svg).toHaveAttribute("aria-hidden", "true");
      expect(svg).not.toHaveAttribute("role");
      expect(svg).not.toHaveAttribute("aria-label");
      expect(svg).toHaveAttribute("focusable", "false");
    }
  });

  it("keeps complete, licensed provenance records at each supplier boundary", () => {
    expect(ICON_PROVENANCE).toMatchObject({
      supplier: "Phosphor Icons",
      packageName: "@phosphor-icons/react",
      packageVersion: "2.1.10",
      license: "MIT",
      rendering: "local-ssr",
    });
    expect(Object.isFrozen(ICON_PROVENANCE)).toBe(true);

    const markRecords = [
      ...Object.values(BRAND_MARK_PROVENANCE),
      ...Object.values(CLOUD_SERVICE_MARK_PROVENANCE),
    ];
    expect(Object.keys(BRAND_MARK_PROVENANCE).sort()).toEqual(
      [...BRAND_MARK_NAMES].sort(),
    );
    expect(Object.keys(CLOUD_SERVICE_MARK_PROVENANCE).sort()).toEqual(
      [...CLOUD_SERVICES].sort(),
    );
    for (const record of markRecords) {
      expect(record.license).toMatch(/^(MIT|CC0-1\.0|CC-BY-ND-2\.0)$/);
      expect(record.url).toMatch(/^https:\/\//);
      expect(record.trademarkNotice).toBe(MARK_TRADEMARK_NOTICE);
      expect(Object.isFrozen(record)).toBe(true);
    }

    const pictogramRecords = Object.values(FEATURE_PICTOGRAM_PROVENANCE);
    expect(pictogramRecords).toHaveLength(8);
    for (const record of pictogramRecords) {
      expect(record).toMatchObject({
        source: "rottay-original",
        license: "LicenseRef-Rottay-Original-Product-Asset-1.0",
        rightsHolder: "Rottay",
        distribution: "internal-and-bundled-product",
        supplier: null,
        rendering: "local-svg-ssr",
      });
      expect(Object.isFrozen(record)).toBe(true);
    }
  });

  it("keeps focused server entrypoints and renderer boundaries RSC-safe and hook-free", () => {
    for (const path of SERVER_SOURCE_PATHS) {
      const source = readSource(path);
      expect(source, path).not.toMatch(/^\s*['"]use client['"];?/m);
      expect(source, path).not.toMatch(
        /\buse(?:State|Effect|LayoutEffect|InsertionEffect|Ref|Memo|Callback|Context|SyncExternalStore)\b/
      );
      expect(source, path).not.toMatch(
        /\b(?:window|document|navigator|localStorage|sessionStorage)\b/
      );
      expect(source, path).not.toMatch(/from ['"]react-dom\/client['"]/);
    }
  });

  it("preserves authored directionality in RTL without mirroring identity or explanatory assets", () => {
    const directionalIcon = renderToStaticMarkup(
      <div dir="rtl">
        <Icon name="navigation.forward" decorative />
      </div>
    );
    expect(directionalIcon).toContain('data-icon-mirrored="auto"');

    for (const entry of ASSET_FACADES.filter(
      ({ assetClass }) => assetClass !== "semantic-icon"
    )) {
      const ltr = renderToStaticMarkup(
        <div dir="ltr">{entry.render("decorative")}</div>
      );
      const rtl = renderToStaticMarkup(
        <div dir="rtl">{entry.render("decorative")}</div>
      );
      expect(innerMarkup(rtl), entry.assetClass).toBe(innerMarkup(ltr));
    }

    const iconCss = readSource(CSS_BY_ASSET_CLASS["semantic-icon"]);
    const markCss = readSource(CSS_BY_ASSET_CLASS["brand-mark"]);
    expect(iconCss).toContain("[data-icon-mirrored='auto']:dir(rtl)");
    expect(iconCss).toContain("transform: scaleX(-1)");
    expect(markCss).not.toMatch(/:dir\(|scaleX\(/);
  });

  it("ships explicit forced-colors behavior for all four classes through every CSS facade", () => {
    const iconCss = readSource(CSS_BY_ASSET_CLASS["semantic-icon"]);
    const markCss = readSource(CSS_BY_ASSET_CLASS["brand-mark"]);
    const pictogramCss = readSource(CSS_BY_ASSET_CLASS["feature-pictogram"]);

    expect(iconCss).toContain("@media (forced-colors: active)");
    expect(iconCss).toContain("color: CanvasText !important");
    expect(iconCss).toContain("forced-color-adjust: auto");
    expect(markCss).toContain("@media (forced-colors: active)");
    expect(markCss).toContain("[data-mark-kind='brand']");
    expect(markCss).toContain("[data-mark-kind='cloud-service']");
    expect(markCss).toContain("forced-color-adjust: none");
    expect(markCss).toContain("forced-color-adjust: auto");
    expect(pictogramCss).toContain("@media (forced-colors: active)");
    expect(pictogramCss).toContain("color: CanvasText !important");
    expect(pictogramCss).toContain("forced-color-adjust: auto");

    const cssEntrypoints = [
      "src/foundation/tokens/css/facade/entrypoints/styles.css",
      "src/foundation/tokens/css/facade/entrypoints/base.css",
      "src/foundation/tokens/css/presentation/components/index.css",
    ].map(readSource);
    for (const entrypoint of cssEntrypoints) {
      expect(entrypoint).toContain("semantic-icon.css");
      expect(entrypoint).toContain("mark.css");
      expect(entrypoint).toContain("feature-pictogram.css");
    }
  });
});
