/**
 * `palette.seeds` brands the mode the tenant RENDERS.
 *
 * The seeds are mode-agnostic brand identity, so an unselected document tunes
 * the vertical's own default mode. Reading an absent `backgroundMode` as
 * `"light"` equated light with the body: on rottay, the one first-party
 * vertical whose default mode is dark, every seed landed in `modes.light` and
 * the canvas the tenant actually paints was untouched -- a STANDARD-tier
 * decision with no effect in the rendered mode.
 *
 * Measured per mode against the vertical's OWN baseline compile, because the
 * artifact's `modeDeltas` are a delta over the artifact's base block: a channel
 * the twin restates at the product's value appears there, and counting it would
 * report a reverted block as a branded one.
 */
import { describe, expect, it } from "vitest";

import type { FlatThemeMode } from "@/foundation/contracts/composition/tenants/themes";
import type { TenantThemeDocument } from "@/foundation/contracts/composition/tenants/themes/tenant-theme";
import type { ThemeCompilation } from "@/foundation/contracts/composition/tenants/themes/compiled";
import type { FirstPartyVerticalId } from "@/foundation/contracts/kernel/verticals";
import { ThemeAdmissionError } from "@/infrastructure/compilers/runtime/theme/facade/foundation/admission";

import { compileThemeIntent } from "../../../facade/runtime/compile";
import {
  documentThemeIntent,
  documentThemePatch,
  staticThemeIntent,
  ThemePatchMigrationError,
} from "..";
import { FIRST_PARTY_BASELINES } from "@tests/support/theme-lowering";

const VERTICALS = ["rottay", "bithire", "evnto"] as const;

/** Three hues, no ground and no ink: the standard-tier decision on its own. */
const SEEDS = {
  primary: "#1F4FA8",
  secondary: "#3C6E71",
  accent: "#B26B2E",
} as const;

const document = (palette: Record<string, unknown>): TenantThemeDocument =>
  ({
    schemaVersion: 1,
    mode: "simple",
    appearance: { palette },
  }) as unknown as TenantThemeDocument;

const defaultModeOf = (vertical: FirstPartyVerticalId): FlatThemeMode => {
  const mode = FIRST_PARTY_BASELINES[vertical].appearance?.defaultMode;
  if (!mode) throw new Error(`${vertical} declares no default mode`);
  return mode;
};

const effective = (
  compiled: ThemeCompilation,
  mode: FlatThemeMode
): Record<string, string> => ({
  ...compiled.cssVariables,
  ...compiled.modeBlocks?.find((block) => block.mode === mode)?.cssVariables,
});

/** One keypath of a patch, read without a cast per assertion. */
const at = (patch: unknown, ...path: readonly string[]): unknown =>
  path.reduce<unknown>(
    (node, key) => (node as Record<string, unknown> | undefined)?.[key],
    patch
  );

/** Channels whose value differs from the vertical's own compile, in one mode. */
function brandedChannels(
  vertical: FirstPartyVerticalId,
  doc: TenantThemeDocument,
  mode: FlatThemeMode
): string[] {
  const tenant = effective(
    compileThemeIntent(
      documentThemeIntent({ vertical, slug: `seed-mode-${vertical}`, document: doc })
    ).compiled,
    mode
  );
  const baseline = effective(
    compileThemeIntent(staticThemeIntent(vertical, `seed-mode-${vertical}`)).compiled,
    mode
  );
  return [...new Set([...Object.keys(tenant), ...Object.keys(baseline)])]
    .filter((channel) => tenant[channel] !== baseline[channel])
    .sort();
}

describe("palette.seeds brands the mode the tenant renders", () => {
  it("rottay is the dark-default vertical the routing law exists for", () => {
    expect(defaultModeOf("rottay")).toBe("dark");
    expect(defaultModeOf("bithire")).toBe("light");
    expect(defaultModeOf("evnto")).toBe("light");
  });

  for (const vertical of VERTICALS) {
    it(`${vertical}: seeds alone brand the rendered mode`, () => {
      const rendered = brandedChannels(vertical, document({ ...SEEDS }), defaultModeOf(vertical));
      expect(rendered.length).toBeGreaterThan(0);
      // The identity channels themselves, not an incidental neighbour.
      expect(rendered).toContain("--ds-color-primary");
      expect(rendered).toContain("--ds-color-secondary");
      expect(rendered).toContain("--ds-color-accent");
    });

    it(`${vertical}: the standard-tier path is admitted, in every mode`, () => {
      expect(() =>
        compileThemeIntent(
          documentThemeIntent({
            vertical,
            slug: `seed-mode-${vertical}`,
            document: document({ ...SEEDS }),
          })
        )
      ).not.toThrow();
    });
  }

  it("an explicit selection still names the mode it renders", () => {
    // `light` on a dark-default vertical is the overlay, and the base block on
    // a light-default one -- the pre-existing meaning, unchanged.
    const light = document({ ...SEEDS, backgroundMode: "light" });
    const rottayLight = documentThemePatch({ vertical: "rottay", document: light });
    const bithireLight = documentThemePatch({ vertical: "bithire", document: light });
    expect(at(rottayLight, "modes", "light", "palette", "primaryColor")).toBe(SEEDS.primary);
    expect(at(bithireLight, "palette", "primaryColor")).toBe(SEEDS.primary);

    const dark = document({ ...SEEDS, backgroundMode: "dark" });
    const rottayDark = documentThemePatch({ vertical: "rottay", document: dark });
    const bithireDark = documentThemePatch({ vertical: "bithire", document: dark });
    expect(at(rottayDark, "palette", "primaryColor")).toBe(SEEDS.primary);
    expect(at(bithireDark, "modes", "dark", "palette", "primaryColor")).toBe(SEEDS.primary);
  });

  it("`auto` keeps authored dark seeds on the dark mode, over the top-level ones", () => {
    const doc = document({
      ...SEEDS,
      backgroundMode: "auto",
      dark: { primary: "#D06A9F" },
    });
    const bithire = documentThemePatch({ vertical: "bithire", document: doc });
    expect(at(bithire, "palette", "primaryColor")).toBe(SEEDS.primary);
    expect(at(bithire, "modes", "dark", "palette", "primaryColor")).toBe("#D06A9F");

    // rottay's dark mode IS its base block, so the refinement lands there and
    // the top-level seeds it does not restate survive beneath it.
    const rottay = documentThemePatch({ vertical: "rottay", document: doc });
    expect(at(rottay, "palette", "primaryColor")).toBe("#D06A9F");
    expect(at(rottay, "palette", "secondaryColor")).toBe(SEEDS.secondary);
    expect(at(rottay, "modes")).toBeUndefined();
  });

  it("the rendered mode carries an ink derived from the tenant's own primary", () => {
    // The defect this half closes: rottay's dark body authors `#0C0C0E` as the
    // ink on ITS near-white primary, and a tenant that re-seeds the primary
    // used to keep it -- APCA Lc 17.6 on a pair the tenant never chose.
    const rendered = brandedChannels("rottay", document({ ...SEEDS }), "dark");
    expect(rendered).toContain("--ds-color-text-on-primary");
    const tenant = effective(
      compileThemeIntent(
        documentThemeIntent({
          vertical: "rottay",
          slug: "seed-mode-rottay",
          document: document({ ...SEEDS }),
        })
      ).compiled,
      "dark"
    );
    expect(tenant["--ds-color-text-on-primary"]).toBe("#ffffff");
  });

  it("NEGATIVE CONTROL: an out-of-domain seed is still refused BY NAME", () => {
    expect(() =>
      documentThemePatch({
        vertical: "rottay",
        document: document({ ...SEEDS, tertiary: "#123456" }),
      })
    ).toThrow(ThemePatchMigrationError);
    expect(() =>
      documentThemePatch({
        vertical: "rottay",
        document: document({ ...SEEDS, tertiary: "#123456" }),
      })
    ).toThrow(/unsupported general\.palette\.tertiary/u);
    expect(() =>
      documentThemePatch({
        vertical: "rottay",
        document: document({ ...SEEDS, backgroundMode: "sepia" }),
      })
    ).toThrow(/unsupported general\.palette\.backgroundMode "sepia"/u);
  });

  it("NEGATIVE CONTROL: the derivation cannot rescue a seed no ink can sit on", () => {
    // `#22C55E` measures APCA Lc 49.2 on the light ink and 58.3 on the dark
    // one: the derivation picks the better of the two and it is STILL under the
    // governed floor of 60. The floor must bite rather than be papered over by
    // the channel now having a producer.
    let refused: unknown;
    try {
      compileThemeIntent(
        documentThemeIntent({
          vertical: "rottay",
          slug: "seed-mode-rottay",
          document: document({ primary: "#22C55E" }),
        })
      );
    } catch (error) {
      refused = error;
    }
    expect(refused).toBeInstanceOf(ThemeAdmissionError);
    expect(
      (refused as ThemeAdmissionError).issues.map((issue) => issue.message)
    ).toEqual(
      expect.arrayContaining([
        expect.stringMatching(/--ds-color-text-on-primary has APCA Lc 58\.3 against --ds-color-primary/u),
      ])
    );
  });
});
