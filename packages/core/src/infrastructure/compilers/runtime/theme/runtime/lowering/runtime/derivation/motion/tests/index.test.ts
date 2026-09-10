/**
 * The motion family's two axes, kept apart.
 *
 * `motion.dial` decides how LONG a transition takes; `motion.character` decides
 * what curve it travels. A character that also moved a duration would apply one
 * axis twice, so the boundary is asserted here rather than described.
 */
import { describe, expect, it } from "vitest";

import type { BrandTheme } from "@/foundation/contracts/composition/tenants/themes";
import { buildLoweringContext } from "../../../pipeline";
import { deriveMotionCharacter } from "../character";
import { deriveMotionChannels } from "..";

const theme = (motion: BrandTheme["motion"]): BrandTheme =>
  ({ id: "t", name: "T", motion }) as BrandTheme;

const channelsFor = (motion: BrandTheme["motion"]): Record<string, string> => {
  const context = buildLoweringContext({ theme: theme(motion) });
  return deriveMotionChannels(context.theme, context.expressive.expansion);
};

describe("motion.character (kit row 23)", () => {
  it("reshapes the easing and entrance roles", () => {
    const rest = channelsFor(undefined);
    for (const character of ["mechanical", "playful"] as const) {
      const moved = channelsFor({ character });
      for (const channel of [
        "--ds-ease-standard",
        "--ds-ease-exit",
        "--ds-motion-ease-enter",
        "--ds-motion-ease-in-out",
        "--ds-motion-scale-in",
        "--ds-motion-offset-in",
        "--ds-motion-panel-offset",
      ]) {
        expect(moved[channel], `${character}/${channel}`).not.toBe(rest[channel]);
      }
    }
  });

  it("reaches no duration at all: the cadence belongs to the dial", () => {
    for (const character of ["mechanical", "organic", "playful"] as const) {
      expect(
        Object.keys(deriveMotionCharacter(theme({ character }))).filter(
          (channel) =>
            /^--ds-motion-(instant|calm|deliberate|fast|normal|slow|glacial|duration-scale|intensity)$/u.test(
              channel
            )
        ),
        character
      ).toEqual([]);
    }
    const rest = channelsFor(undefined);
    for (const character of ["mechanical", "playful"] as const) {
      const moved = channelsFor({ character });
      for (const channel of [
        "--ds-motion-instant",
        "--ds-motion-calm",
        "--ds-motion-deliberate",
        "--ds-motion-feedback",
        "--ds-motion-reveal",
      ]) {
        expect(moved[channel], `${character}/${channel}`).toBe(rest[channel]);
      }
    }
  });

  it("is the identity at `organic`, so the engine's own eases stay expressible", () => {
    expect(channelsFor({ character: "organic" })).toEqual(channelsFor(undefined));
  });

  it("refines the resting roles rather than sitting beside them", () => {
    // `REST_ROLES` is the value a role has when nobody chose; a chosen
    // character is a choice, so it settles after them in the one family.
    expect(channelsFor({ character: "mechanical" })["--ds-motion-scale-in"]).toBe(
      "1"
    );
    expect(channelsFor(undefined)["--ds-motion-scale-in"]).toBe("0.98");
  });

  it("states nothing for a word outside the domain or an INHERITED member", () => {
    expect(deriveMotionCharacter(theme({ character: "potato" as never }))).toEqual(
      {}
    );
    expect(
      deriveMotionCharacter(theme({ character: "valueOf" as never }))
    ).toEqual({});
    expect(channelsFor({ character: "potato" as never })).toEqual(
      channelsFor(undefined)
    );
  });
});
