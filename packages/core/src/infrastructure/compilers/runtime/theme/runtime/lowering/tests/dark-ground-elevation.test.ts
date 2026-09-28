/**
 * A dark ground lifts its surfaces with a hairline, through every door.
 *
 * The rendered first-party artifact is compared rule by rule against the
 * committed one, so a light rule that moved by a single byte is a failure and
 * the only admissible difference is an elevation declaration.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import type { TenantThemeDocument } from "@/foundation/contracts/composition/tenants";
import {
  compileTenantThemeConfig,
  getTenantThemeVerticalEnvelope,
  hydrateTenantThemeConfig,
} from "@/infrastructure/compilers/composition/tenant-theme";
import { compileThemeIntent } from "@/infrastructure/compilers/runtime/theme";
import { documentThemeAdmission } from "@/infrastructure/compilers/runtime/theme/runtime/ingress/presentation/document";
import {
  FIRST_PARTY_ARTIFACT_SPECS,
  renderFirstPartyArtifact,
} from "@/infrastructure/compilers/runtime/tenant-css/artifact-renderer";
import {
  DARK_GROUND_ELEVATION_LADDER,
  LIGHT_GROUND_ELEVATION_LADDER,
} from "../runtime/derivation/elevation";

const HAIRLINE = /^inset 0 1px 0 rgba\(255, 255, 255, 0\.0\d\), /u;
const ELEVATION = /^ {2}--ds-elevation-\d: /u;

type Rule = { selector: string; lines: readonly string[] };

const rules = (css: string): Rule[] =>
  [...css.matchAll(/^([^\s/*][^\n]*)\{\n([\s\S]*?)\n\}/gmu)].map((match) => ({
    selector: match[1]!.trim(),
    lines: match[2]!.split("\n"),
  }));

const declarations = (lines: readonly string[]): Record<string, string> =>
  Object.fromEntries(
    lines
      .map((line) => /^ {2}(--ds-elevation-\d): (.+);$/u.exec(line))
      .filter((match): match is RegExpExecArray => match !== null)
      .map((match) => [match[1]!, match[2]!])
  );

const isLightRule = (selector: string) => selector.includes("[data-theme='light']");
const isDarkRule = (selector: string) => selector.includes("[data-theme='dark']");

const artifacts = FIRST_PARTY_ARTIFACT_SPECS.map((spec) => {
  const rendered = rules(renderFirstPartyArtifact({ spec }).css);
  const committed = rules(
    readFileSync(
      resolve(
        process.cwd(),
        `src/foundation/tokens/css/facade/artifacts/${spec.slug}/index.css`
      ),
      "utf8"
    )
  );
  const base = rendered.find(
    (rule) => !isLightRule(rule.selector) && !isDarkRule(rule.selector) && !rule.selector.includes("data-density")
  )!;
  return { slug: spec.slug, rendered, committed, base };
});

describe("dark-ground elevation, first-party artifacts", () => {
  it("rottay's dark base rule carries the hairline ladder, 0..6", () => {
    const { base } = artifacts.find((artifact) => artifact.slug === "rottay")!;
    expect(base.lines).toContain("  color-scheme: dark;");
    expect(declarations(base.lines)).toEqual(DARK_GROUND_ELEVATION_LADDER);
    for (const level of [1, 2, 3, 4, 5, 6]) {
      expect(declarations(base.lines)[`--ds-elevation-${level}`]).toMatch(HAIRLINE);
    }
  });

  it("rottay's light rule resolves to the foundation ladder, not the dark one beneath it", () => {
    const { rendered } = artifacts.find((artifact) => artifact.slug === "rottay")!;
    const light = rendered.find((rule) => isLightRule(rule.selector))!;
    const { ["--ds-elevation-0"]: _level0, ...restated } = LIGHT_GROUND_ELEVATION_LADDER;
    expect(declarations(light.lines)).toEqual(restated);
  });

  it("every dark rule of a light-default vertical carries the hairline ladder", () => {
    for (const { slug, rendered, base } of artifacts.filter((a) => a.slug !== "rottay")) {
      expect(base.lines, slug).toContain("  color-scheme: light;");
      const dark = rendered.find((rule) => isDarkRule(rule.selector));
      expect(dark, slug).toBeDefined();
      expect(declarations(dark!.lines), slug).toEqual(DARK_GROUND_ELEVATION_LADDER);
    }
  });

  it("a light-default vertical's light base rule states no elevation at all", () => {
    for (const { slug, base } of artifacts.filter((a) => a.slug !== "rottay")) {
      expect(declarations(base.lines), slug).toEqual({});
    }
  });

  it("differs from the committed artifact by elevation declarations only, and never in a light-ground rule", () => {
    for (const { slug, rendered, committed, base } of artifacts) {
      expect(rendered.map((rule) => rule.selector), slug).toEqual(
        committed.map((rule) => rule.selector)
      );
      rendered.forEach((rule, index) => {
        const before = committed[index]!.lines.filter((line) => !ELEVATION.test(line));
        const after = rule.lines.filter((line) => !ELEVATION.test(line));
        expect(after, `${slug} ${rule.selector}`).toEqual(before);
        const lightGround =
          slug === "rottay" ? false : rule === base || rule.selector.includes("data-density");
        if (lightGround) {
          expect(rule.lines, `${slug} ${rule.selector}`).toEqual(committed[index]!.lines);
        }
      });
    }
  });
});

describe("dark-ground elevation, DB tenant door", () => {
  const document = (backgroundMode: "light" | "dark") =>
    ({
      schemaVersion: 1,
      mode: "advanced",
      visualFoundation: {
        general: { palette: { primary: "#2F6B9A", backgroundMode } },
      },
    }) as TenantThemeDocument;

  const compiledDark = (vertical: "bithire" | "rottay") => {
    const { intent } = documentThemeAdmission({
      vertical,
      slug: "acme",
      document: document("dark"),
      ranges: getTenantThemeVerticalEnvelope(vertical)!.ranges,
    });
    const { compiled } = compileThemeIntent(intent);
    const dark = compiled.modeBlocks.find((block) => block.mode === "dark");
    return {
      ...compiled.cssVariables,
      ...(compiled.colorScheme === "dark" ? {} : (dark?.cssVariables ?? {})),
    };
  };

  const artifactCss = (vertical: "bithire" | "rottay", backgroundMode: "light" | "dark") =>
    compileTenantThemeConfig(
      hydrateTenantThemeConfig(document(backgroundMode), {
        tenantId: "tenant_acme",
        slug: "acme",
        verticalKey: vertical,
        rowVersion: 1,
      }),
      { verticalEnvelope: getTenantThemeVerticalEnvelope(vertical) }
    ).css;

  for (const vertical of ["bithire", "rottay"] as const) {
    it(`a dark DB tenant on ${vertical} compiles the hairline ladder in its dark block`, () => {
      const variables = compiledDark(vertical);
      for (const [channel, value] of Object.entries(DARK_GROUND_ELEVATION_LADDER)) {
        expect(variables[channel], channel).toBe(value);
      }
    });

    it(`the ${vertical} tenant artifact overrides no elevation of the vertical artifact beneath it`, () => {
      for (const backgroundMode of ["light", "dark"] as const) {
        expect(artifactCss(vertical, backgroundMode)).not.toMatch(/--ds-elevation-\d:/u);
      }
    });
  }
});
