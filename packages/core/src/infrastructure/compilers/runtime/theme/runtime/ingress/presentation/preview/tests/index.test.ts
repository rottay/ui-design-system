/**
 * The draft door reads one transport however the draft travelled.
 *
 * A governed Theme that crossed JSON has lost every `disposition: undefined`,
 * so a discriminant keyed on that key's presence re-lifted the draft and
 * compile refused `$.charts.value`. Each row compares the in-memory governed
 * draft, its JSON round-trip and the flat transport on patch, ledger, baseline
 * and compiled output.
 */
import { describe, expect, it } from "vitest";

import type { FlatTheme } from "@/foundation/contracts/composition/tenants/themes";
import {
  mergeThemePatches,
  type Theme,
} from "@/foundation/contracts/composition/tenants/themes/iso";
import { compileThemeIntent } from "../../../../../facade/runtime/compile";
import { readGovernedTheme } from "../../../../lowering/foundation/intake";
import { baselineFor } from "../../../runtime/document-v2";
import { draftPreviewThemeIntent, governedTenantTheme } from "..";

const VERTICAL = "bithire" as const;
const SLUG = "preview-transport";

const roundTrip = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

const intentOf = (draft: Theme | FlatTheme, carriedFrom?: Theme) =>
  draftPreviewThemeIntent({ vertical: VERTICAL, slug: SLUG, draft, carriedFrom });

function expectSameIntent(
  actual: ReturnType<typeof intentOf>,
  expected: ReturnType<typeof intentOf>
) {
  expect(actual.patch).toEqual(expected.patch);
  expect(actual.ledger).toEqual(expected.ledger);
  expect(actual.baseline).toEqual(expected.baseline);
  expect(compileThemeIntent(actual).compiled).toEqual(
    compileThemeIntent(expected).compiled
  );
}

const ACTIVE: FlatTheme = {
  id: SLUG,
  name: "Preview transport",
  palette: { primaryColor: "#2F5BE8" },
  motion: { intensity: 0.6, hoverScale: 1.01 },
  charts: { categoryColors: ["#123456", "#1F4E2C"] },
};

const INACTIVE: FlatTheme = {
  id: SLUG,
  name: "Preview transport",
  palette: { primaryColor: "#2F5BE8" },
};

describe("draftPreviewThemeIntent transport discriminant", () => {
  it("a JSON round-tripped governed draft with active motion matches the flat transport", () => {
    const governed = governedTenantTheme(ACTIVE);
    const serialized = roundTrip(governed);
    expect(Object.keys(serialized.motion)).toEqual(["value"]);

    const expected = intentOf(ACTIVE);
    expectSameIntent(intentOf(governed), expected);
    expectSameIntent(intentOf(serialized), expected);
    expect(
      compileThemeIntent(intentOf(serialized)).compiled.runtime.personality
        .animation?.hoverScale
    ).toBe(1.01);
  });

  it("a JSON round-tripped governed draft with inactive motion matches the flat transport", () => {
    const governed = governedTenantTheme(INACTIVE);
    const serialized = roundTrip(governed);
    expect(serialized.motion).toEqual({ disposition: "not-authored" });

    const expected = intentOf(INACTIVE);
    expectSameIntent(intentOf(governed), expected);
    expectSameIntent(intentOf(serialized), expected);
  });

  it("inheritance: a carried customization survives the round trip and stays out of the patch", () => {
    const custom = mergeThemePatches(baselineFor(VERTICAL, SLUG), {
      surfaces: { radiusScale: 1.15 },
    });
    const flat = roundTrip(readGovernedTheme(custom));
    const expected = intentOf(flat, custom);

    for (const draft of [custom, roundTrip(custom)]) {
      const intent = intentOf(draft, custom);
      expectSameIntent(intent, expected);
      expect(intent.patch).toEqual({});
      expect(
        compileThemeIntent(intent).compiled.cssVariables["--ds-radius-scale"]
      ).toBe("1.15");
    }
  });

  it("patch: a moved leaf reaches the patch identically on every transport", () => {
    const custom = mergeThemePatches(baselineFor(VERTICAL, SLUG), {
      surfaces: { radiusScale: 1.15 },
    });
    const baseline = baselineFor(VERTICAL, SLUG);
    const flat = roundTrip(readGovernedTheme(custom));
    const expected = intentOf(flat);

    expect(expected.patch).toEqual({ surfaces: { radiusScale: 1.15 } });
    expectSameIntent(intentOf(custom), expected);
    expectSameIntent(intentOf(roundTrip(custom)), expected);
    expect(intentOf(roundTrip(custom)).baseline).toEqual(baseline);
  });

  it("ledger: the round-tripped governed draft records the same provenance as the flat one", () => {
    const flat: FlatTheme = {
      ...ACTIVE,
      surfaces: { radiusScale: 1.15 },
    };
    const expected = intentOf(flat);
    const serialized = intentOf(roundTrip(governedTenantTheme(flat)));
    expect(serialized.ledger).toEqual(expected.ledger);
    expect(serialized.ledger).toEqual(intentOf(governedTenantTheme(flat)).ledger);
  });

  it("refuses a draft that mixes governed and unwrapped families", () => {
    const mixed = {
      ...roundTrip(governedTenantTheme(INACTIVE)),
      motion: { intensity: 0.6 },
    } as unknown as Theme;
    expect(() => intentOf(mixed)).toThrow(/mixes governed families/);
  });
});
