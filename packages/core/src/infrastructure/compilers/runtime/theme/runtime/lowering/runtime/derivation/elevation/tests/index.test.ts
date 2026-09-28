/**
 * The elevation family: one ladder per posture, one stacking scale.
 *
 * The bands are declared twice by necessity -- once in TypeScript so the
 * compiler can emit them per tenant, once in CSS so an untenanted document
 * still stacks. This pins the pair, which is what keeps two declarations from
 * becoming two authorities.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import type { FlatTheme } from "@/foundation/contracts/composition/tenants/themes";
import { buildLoweringContext } from "../../../pipeline";
import { deriveBorderPosture } from "../border";
import { deriveElevationChannels } from "..";
import {
  DARK_GROUND_ELEVATION_LADDER,
  LIGHT_GROUND_ELEVATION_LADDER,
  deriveElevationLadder,
} from "../ladder";
import { Z_INDEX_BANDS, deriveZIndexBands } from "../z-index";

const Z_INDEX_CSS = readFileSync(
  resolve(
    process.cwd(),
    "src/foundation/tokens/css/foundation/base/z-index/index.css"
  ),
  "utf8"
);

/**
 * The BANDS only. Everything after the component header is an alias onto a
 * band -- `--ds-z-index-affix: 100` included -- and an alias is not a step of
 * the scale.
 */
const Z_INDEX_SCALE = Z_INDEX_CSS.slice(
  Z_INDEX_CSS.indexOf("THE SCALE"),
  Z_INDEX_CSS.indexOf("COMPONENT-SPECIFIC Z-INDEX")
);

const FOUNDATION_CSS = readFileSync(
  resolve(
    process.cwd(),
    "src/foundation/tokens/css/foundation/themes/default/index.css"
  ),
  "utf8"
);

/** The dark ramp WO-ENG-03 shipped (`artifacts/rottay/index.css` at a4bc94927^). */
const WO_ENG_03_DARK_RAMP = `
  --ds-elevation-0: none;
  --ds-elevation-1: inset 0 1px 0 rgba(255, 255, 255, 0.04), 0 1px 2px rgba(0, 0, 0, 0.40), 0 2px 6px rgba(0, 0, 0, 0.28);
  --ds-elevation-2: inset 0 1px 0 rgba(255, 255, 255, 0.05), 0 2px 4px rgba(0, 0, 0, 0.44), 0 6px 16px rgba(0, 0, 0, 0.34);
  --ds-elevation-3: inset 0 1px 0 rgba(255, 255, 255, 0.06), 0 6px 12px rgba(0, 0, 0, 0.46), 0 12px 28px rgba(0, 0, 0, 0.40);
  --ds-elevation-4: inset 0 1px 0 rgba(255, 255, 255, 0.07), 0 12px 24px rgba(0, 0, 0, 0.50), 0 20px 44px rgba(0, 0, 0, 0.44), 0 0 24px color-mix(in srgb, var(--ds-color-primary, #ffffff) 8%, transparent);
  --ds-elevation-5: inset 0 1px 0 rgba(255, 255, 255, 0.08), 0 20px 40px rgba(0, 0, 0, 0.56), 0 32px 64px rgba(0, 0, 0, 0.48), 0 0 32px color-mix(in srgb, var(--ds-color-primary, #ffffff) 10%, transparent);
`;

const declarations = (css: string): Record<string, string> =>
  Object.fromEntries(
    [...css.matchAll(/(--ds-elevation-\d): ([^;]+);/gu)].map((match) => [
      match[1],
      match[2],
    ])
  );

const theme = (surfaces: FlatTheme["surfaces"]): FlatTheme => ({
  id: "t",
  name: "T",
  surfaces,
});

const ladderFor = (surfaces: FlatTheme["surfaces"]): Record<string, string> => {
  const bt = theme(surfaces);
  return deriveElevationLadder(bt, buildLoweringContext({ theme: bt }).expressive.expansion);
};

describe("elevation/z-index", () => {
  it("emits every band the CSS scale declares, at the same number", () => {
    const emitted = deriveZIndexBands();
    for (const [band, value] of Object.entries(Z_INDEX_BANDS)) {
      expect(emitted[`--ds-z-index-${band}`]).toBe(String(value));
      expect(Z_INDEX_SCALE).toContain(`--ds-z-index-${band}: ${value};`);
    }
  });

  it("declares no band the CSS scale does not name, and vice versa", () => {
    const inCss = [...Z_INDEX_SCALE.matchAll(/--ds-z-index-([a-z]+): (\d+);/g)]
      .map((match) => match[1])
      .sort();
    expect(inCss).toEqual(Object.keys(Z_INDEX_BANDS).sort());
  });
});

describe("elevation/ladder", () => {
  const ladderOf = (posture: "flat" | "soft" | "elevated") =>
    ladderFor({ elevation: posture });

  it("states all seven roles for a non-identity posture", () => {
    for (const posture of ["flat", "elevated"] as const) {
      const ladder = ladderOf(posture);
      for (const role of [0, 1, 2, 3, 4, 5, 6]) {
        expect(ladder[`--ds-elevation-${role}`], `${posture}/${role}`).toBeDefined();
      }
    }
  });

  it("states nothing at all for the identity posture", () => {
    expect(ladderOf("soft")).toEqual({});
  });

  it("lets an authored ladder refine the posture it sits on", () => {
    const refined = ladderFor({
      elevation: "flat",
      elevations: { level2: "0 0 0 1px hotpink" },
    });
    expect(refined["--ds-elevation-2"]).toBe("0 0 0 1px hotpink");
    expect(refined["--ds-elevation-1"]).toBe(ladderOf("flat")["--ds-elevation-1"]);
  });
});

describe("elevation/ladder on a dark ground", () => {
  const onGround = (
    backgroundColor: string | undefined,
    surfaces: FlatTheme["surfaces"] = {},
    surface: "light" | "dark" = "dark",
    overlay = false
  ): Record<string, string> => {
    const bt: FlatTheme = {
      id: "t",
      name: "T",
      surfaces,
      ...(backgroundColor ? { palette: { backgroundColor } } : {}),
    };
    return deriveElevationLadder(
      bt,
      buildLoweringContext({ theme: bt }).expressive.expansion,
      surface,
      overlay
    );
  };

  it("restates levels 0..5 byte for byte as the WO-ENG-03 ramp", () => {
    const shipped = declarations(WO_ENG_03_DARK_RAMP);
    expect(Object.keys(shipped)).toHaveLength(6);
    for (const [channel, value] of Object.entries(shipped)) {
      expect(DARK_GROUND_ELEVATION_LADDER[channel], channel).toBe(value);
    }
  });

  it("continues level 6 by the ramp's own 4-to-5 increments", () => {
    const numbers = (channel: string) =>
      [...DARK_GROUND_ELEVATION_LADDER[channel]!.matchAll(/\d+(?:\.\d+)?/gu)].map(
        (match) => Number(match[0])
      );
    const [four, five, six] = [4, 5, 6].map((level) =>
      numbers(`--ds-elevation-${level}`)
    );
    expect(six).toHaveLength(five!.length);
    six!.forEach((value, index) => {
      const step = five![index]! - four![index]!;
      expect(value, `number ${index}`).toBeCloseTo(five![index]! + step, 6);
    });
    expect(DARK_GROUND_ELEVATION_LADDER["--ds-elevation-6"]).toContain(
      "rgba(255, 255, 255, 0.09)"
    );
    expect(DARK_GROUND_ELEVATION_LADDER["--ds-elevation-6"]).toContain(
      "var(--ds-color-primary, #ffffff) 12%"
    );
  });

  it("restates the foundation's light ladder byte for byte", () => {
    const foundation = declarations(FOUNDATION_CSS);
    expect(Object.keys(foundation).sort()).toEqual(
      Object.keys(LIGHT_GROUND_ELEVATION_LADDER).sort()
    );
    expect(LIGHT_GROUND_ELEVATION_LADDER).toEqual(foundation);
  });

  it("the foundation names the deriver as the dark producer", () => {
    expect(FOUNDATION_CSS).toContain("derivation/elevation/ladder");
    expect(FOUNDATION_CSS).not.toContain("in their tenant\n     artifact");
  });

  it("emits the hairline ladder for a soft or defaulted posture on a dark ground", () => {
    expect(onGround(undefined)).toEqual(DARK_GROUND_ELEVATION_LADDER);
    expect(onGround("#0A0A0C", { elevation: "soft" })).toEqual(
      DARK_GROUND_ELEVATION_LADDER
    );
    expect(onGround("#0A0A0C", undefined)).toEqual(DARK_GROUND_ELEVATION_LADDER);
  });

  it("reads the ground by NTSC luminance, not the declared surface", () => {
    expect(onGround("#F5F5F5", {}, "dark")).toEqual({});
    expect(onGround("#1E293B", {}, "light")).toEqual(
      DARK_GROUND_ELEVATION_LADDER
    );
  });

  it("leaves a light base block exactly as it was: nothing stated", () => {
    expect(onGround(undefined, {}, "light")).toEqual({});
    expect(onGround("#FFFFFF", { elevation: "soft" }, "light")).toEqual({});
  });

  it("restates the light ladder on a light overlay, so a dark base cannot leak into it", () => {
    expect(onGround("#FFFFFF", {}, "light", true)).toEqual(
      LIGHT_GROUND_ELEVATION_LADDER
    );
  });

  it("yields to a stated posture and to an authored level", () => {
    for (const posture of ["flat", "elevated"] as const) {
      expect(onGround("#0A0A0C", { elevation: posture })).toEqual(
        ladderFor({ elevation: posture })
      );
    }
    const refined = onGround("#0A0A0C", {
      elevations: { level2: "0 0 0 1px hotpink" },
    });
    expect(refined["--ds-elevation-2"]).toBe("0 0 0 1px hotpink");
    expect(refined["--ds-elevation-1"]).toBe(
      DARK_GROUND_ELEVATION_LADDER["--ds-elevation-1"]
    );
  });
});

describe("surfaces.border-style (kit row 18)", () => {
  const posture = (borderStyle: "none" | "hairline" | "strong") =>
    deriveBorderPosture({
      id: "t",
      name: "T",
      surfaces: { borderStyle },
    } as FlatTheme);

  it("authors the three border-width ROLES the declared families read", () => {
    expect(posture("none")).toEqual({
      "--ds-edge-hairline-width": "0px",
      "--ds-edge-standard-width": "0px",
      "--ds-edge-emphasis-width": "1px",
    });
    expect(posture("strong")["--ds-edge-standard-width"]).toBe("1.5px");
    expect(posture("hairline")["--ds-edge-standard-width"]).toBe("1px");
  });

  it("never touches the structural border-width scale", () => {
    // A posture modulates roles; the `--ds-border-width-{0,1,2,4,8}` scale is
    // the ruler it is measured against and is not a dial.
    for (const step of ["none", "hairline", "strong"] as const) {
      expect(
        Object.keys(posture(step)).filter((channel) =>
          /^--ds-border-width-/u.test(channel)
        )
      ).toEqual([]);
    }
  });

  it("states nothing when the theme decided nothing", () => {
    expect(deriveBorderPosture({ id: "t", name: "T" } as FlatTheme)).toEqual({});
    expect(
      deriveBorderPosture({
        id: "t",
        name: "T",
        surfaces: { borderStyle: "potato" as never },
      } as FlatTheme)
    ).toEqual({});
    expect(
      deriveBorderPosture({
        id: "t",
        name: "T",
        surfaces: { borderStyle: "hasOwnProperty" as never },
      } as FlatTheme)
    ).toEqual({});
  });

  it("leaves the shadow ladder an elevation POSTURE states to the posture", () => {
    // The row states WIDTHS and nothing of the ladder: the roles are the
    // posture's on every rank -- a tenant that authors the posture has the
    // `tenant` family re-state them two ranks above this one -- so a keyline
    // that claimed one inside this family would be overruled on the full
    // compile. Fenced here and on the door in
    // `document-v2/tests/decision-reach.test.ts`.
    const context = buildLoweringContext({
      theme: {
        id: "t",
        name: "T",
        surfaces: { elevation: "elevated", borderStyle: "strong" },
      } as FlatTheme,
    });
    const channels = deriveElevationChannels(
      context.theme,
      context.expressive.expansion
    );
    expect(
      Object.keys(posture("strong")).filter((channel) =>
        /^--ds-elevation-/u.test(channel)
      )
    ).toEqual([]);
    // The family's elevation channels are the seven roles and nothing else.
    expect(
      Object.keys(channels)
        .filter((channel) => /^--ds-elevation-/u.test(channel))
        .sort()
    ).toEqual([0, 1, 2, 3, 4, 5, 6].map((role) => `--ds-elevation-${role}`));
    // The widths ARE the row's, beside the posture that keeps the ladder.
    expect(channels["--ds-edge-standard-width"]).toBe("1.5px");
    // The shadow ladder the posture states is untouched by the keyline.
    expect(channels["--ds-elevation-3"]).toBe(
      ladderFor({ elevation: "elevated" })["--ds-elevation-3"]
    );
  });
});
