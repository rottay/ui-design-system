import { describe, expect, it } from "vitest";

import type { FlatTheme } from "@/foundation/contracts/composition/tenants/themes";
import { deriveTypeRoleChannels } from "@/infrastructure/compilers/runtime/theme/runtime/lowering/runtime/derivation/typography/roles";
import { deriveTypeWeightChannels, roleWeightOverlay } from "@/infrastructure/compilers/runtime/theme/runtime/lowering/runtime/derivation/typography/weights";
import { FAMILY_DERIVERS } from "../../..";
import type { FamilyDeriver } from "../../../../../foundation/contract";
import { buildLoweringContext, runDerivation } from "../../../../pipeline";
import { deriveNotifierChannels, notifierChromeDeriver } from "..";

function weights(theme: FlatTheme): Map<string, string> {
  return new Map(Object.entries({
    ...deriveTypeWeightChannels(theme),
    ...deriveTypeRoleChannels(theme, undefined, {
      numeric: {},
      weights: roleWeightOverlay(theme),
    }),
  }));
}

function resolveWeight(value: string | undefined, channels: Map<string, string>): string {
  if (value === undefined) throw new Error("Missing weight channel");
  const reference = /^var\((--ds-[a-z0-9-]+)\)$/.exec(value);
  if (reference === null) return value;
  const [, channel] = reference;
  if (channel === undefined) throw new Error("Missing reference name");
  return resolveWeight(channels.get(channel), channels);
}

const notifier = new Map(Object.entries(deriveNotifierChannels()));
const postures = [
  { roleWeights: "light", expected: "500" },
  { roleWeights: "regular", expected: "600" },
  { roleWeights: "strong", expected: "700" },
] as const;

describe("chrome/notifier title weight", () => {
  it.each(postures)("follows the real $roleWeights posture while preserving urgent, message and body weights", ({ roleWeights, expected }) => {
    const channels = weights({ id: "posture", name: "Posture", typography: { roleWeights } });
    expect(resolveWeight(notifier.get("--ds-notifier-title-font-weight"), channels)).toBe(expected);
    expect(resolveWeight(notifier.get("--ds-notifier-title-urgent-font-weight"), channels)).toBe("700");
    expect(resolveWeight(notifier.get("--ds-notifier-message-font-weight"), channels)).toBe("500");
    expect(resolveWeight(notifier.get("--ds-notifier-message-urgent-font-weight"), channels)).toBe("600");
    expect(channels.get("--ds-type-body-font-weight")).toBe("400");
    expect(channels.get("--ds-type-supporting-font-weight")).toBe("400");
  });

  it("follows a label-only 700 to 300 change independently of the section title", () => {
    const theme = (fontWeight: number): FlatTheme => ({
      id: "label-only", name: "Label only",
      typography: { roles: { label: { fontWeight }, sectionTitle: { fontWeight: 800 } } },
    });
    const before = weights(theme(700));
    const after = weights(theme(300));
    expect(resolveWeight(notifier.get("--ds-notifier-title-font-weight"), before)).toBe("700");
    expect(resolveWeight(notifier.get("--ds-notifier-title-font-weight"), after)).toBe("300");
    expect(before.get("--ds-type-section-title-font-weight")).toBe("800");
    expect(after.get("--ds-type-section-title-font-weight")).toBe("800");
  });

  it("lets the explicit label weight outrank the posture and ignores the semibold constant", () => {
    const channels = weights({
      id: "specific", name: "Specific",
      typography: { roleWeights: "strong", roles: { label: { fontWeight: 300 }, sectionTitle: { fontWeight: 800 } } },
    });
    channels.set("--ds-font-weight-semibold", "900");
    expect(resolveWeight(notifier.get("--ds-notifier-title-font-weight"), channels)).toBe("300");
    expect(resolveWeight(notifier.get("--ds-notifier-control-font-weight"), channels)).toBe("300");
    expect(resolveWeight(notifier.get("--ds-notifier-title-urgent-font-weight"), channels)).toBe("700");
  });

  it("preserves the title label metrics, supporting copy, material and state declarations", () => {
    expect(notifier.get("--ds-notifier-title-font-family")).toBe("var(--ds-type-label-font-family)");
    expect(notifier.get("--ds-notifier-title-font-size")).toBe("var(--ds-type-label-font-size)");
    expect(notifier.get("--ds-notifier-title-line-height")).toBe("var(--ds-type-label-line-height)");
    expect(notifier.get("--ds-notifier-title-letter-spacing")).toBe("var(--ds-letter-spacing-heading)");
    expect(notifier.get("--ds-notifier-description-font-family")).toBe("var(--ds-type-supporting-font-family)");
    expect(notifier.get("--ds-notifier-description-font-size")).toBe("var(--ds-type-supporting-font-size)");
    expect(notifier.get("--ds-notifier-toast-bg")).toBe("var(--ds-material-overlay-background)");
    expect(notifier.get("--ds-notifier-toast-shadow")).toBe("var(--ds-elevation-3)");
    expect(notifier.get("--ds-notifier-info-ink")).toBe("var(--ds-color-info-ink)");
    expect(notifier.get("--ds-notifier-press-scale")).toBe("var(--ds-state-press-scale)");
    expect(notifier.get("--ds-notifier-focus-ring")).toBe("var(--ds-focus-ring)");
  });

  it("keeps its declared output contract and single registration", () => {
    expect(FAMILY_DERIVERS.filter((deriver) => deriver === notifierChromeDeriver)).toHaveLength(1);
    expect(notifierChromeDeriver.family).toBe("notifier");
    expect(notifierChromeDeriver.rank).toBe("derived");
    expect(notifierChromeDeriver.consumes).toEqual([
      "palette.*", "surfaces.materials", "surfaces.elevation", "surfaces.effects", "typography.roles", "states.focus", "states.press",
    ]);
    expect([...notifier.keys()]).toEqual(notifierChromeDeriver.produces);
    expect(new Set(notifierChromeDeriver.produces).size).toBe(notifierChromeDeriver.produces.length);
  });

  const ranks = ["verticalOverride", "tenant"] as const;
  it.each(ranks)("yields the title weight to a %s statement", (rank) => {
    const stated: FamilyDeriver = {
      family: `stated-${rank}`, rank, consumes: ["chrome.*"],
      produces: ["--ds-notifier-title-font-weight"],
      derive: () => ({ "--ds-notifier-title-font-weight": "350" }),
    };
    const result = runDerivation(buildLoweringContext({ theme: { id: "rank", name: "Rank" } }), [...FAMILY_DERIVERS, stated]);
    expect(new Map(Object.entries(result.channels)).get("--ds-notifier-title-font-weight")).toBe("350");
    expect(result.provenance.get("--ds-notifier-title-font-weight")?.rank).toBe(rank);
  });
});
