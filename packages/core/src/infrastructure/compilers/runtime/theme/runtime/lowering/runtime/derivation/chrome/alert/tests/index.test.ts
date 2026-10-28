import { describe, expect, it } from "vitest";

import type { FlatTheme } from "@/foundation/contracts/composition/tenants/themes";
import { deriveTypeRoleChannels } from "@/infrastructure/compilers/runtime/theme/runtime/lowering/runtime/derivation/typography/roles";
import { deriveTypeWeightChannels, roleWeightOverlay } from "@/infrastructure/compilers/runtime/theme/runtime/lowering/runtime/derivation/typography/weights";
import { deriveModalChannels } from "../../modal";
import { alertChromeDeriver, deriveAlertChannels } from "..";

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

function sectionWeight(fontWeight: number): FlatTheme {
  return {
    id: "alert-title-weight",
    name: "Alert title weight",
    typography: { roles: { sectionTitle: { fontWeight } } },
  };
}

describe("chrome/alert title weight", () => {
  it("follows the section-title-only 700 to 300 posture beside Modal", () => {
    const alert = new Map(Object.entries(deriveAlertChannels()));
    const modal = new Map(Object.entries(deriveModalChannels()));
    const before = weights(sectionWeight(700));
    const after = weights(sectionWeight(300));
    expect(resolveWeight(modal.get("--ds-modal-title-font-weight"), before)).toBe("700");
    expect(resolveWeight(modal.get("--ds-modal-title-font-weight"), after)).toBe("300");
    expect(resolveWeight(alert.get("--ds-alert-title-font-weight"), before)).toBe("700");
    expect(resolveWeight(alert.get("--ds-alert-title-font-weight"), after)).toBe("300");
    expect(before.get("--ds-type-label-font-weight")).toBe("600");
    expect(after.get("--ds-type-label-font-weight")).toBe("600");
  });

  const postures = [
    { roleWeights: "light", expected: "500" },
    { roleWeights: "regular", expected: "600" },
    { roleWeights: "strong", expected: "700" },
  ] as const;
  it.each(postures)("follows the real $roleWeights role posture and preserves urgent/body weights", ({ roleWeights, expected }) => {
    const channels = weights({ id: "posture", name: "Posture", typography: { roleWeights } });
    const alert = new Map(Object.entries(deriveAlertChannels()));
    expect(resolveWeight(alert.get("--ds-alert-title-font-weight"), channels)).toBe(expected);
    expect(resolveWeight(alert.get("--ds-alert-title-urgent-font-weight"), channels)).toBe("700");
    expect(channels.get("--ds-type-body-font-weight")).toBe("400");
    expect(channels.get("--ds-type-supporting-font-weight")).toBe("400");
  });

  it("uses the section title even when the label and semibold weights disagree", () => {
    const theme = sectionWeight(300);
    const channels = weights({
      ...theme,
      typography: { roles: { sectionTitle: { fontWeight: 300 }, label: { fontWeight: 800 } } },
    });
    const alert = new Map(Object.entries(deriveAlertChannels()));
    channels.set("--ds-font-weight-semibold", "900");
    expect(channels.get("--ds-type-label-font-weight")).toBe("800");
    expect(resolveWeight(alert.get("--ds-alert-title-font-weight"), channels)).toBe("300");
    expect(resolveWeight(alert.get("--ds-alert-title-urgent-font-weight"), channels)).toBe("700");
  });

  it("preserves the title metrics, supporting copy, palette, elevation and urgent declarations", () => {
    const alert = new Map(Object.entries(deriveAlertChannels()));
    expect(alert.get("--ds-alert-title-font-family")).toBe("var(--ds-type-label-font-family)");
    expect(alert.get("--ds-alert-title-font-size")).toBe("var(--ds-type-label-font-size)");
    expect(alert.get("--ds-alert-title-line-height")).toBe("var(--ds-type-label-line-height)");
    expect(alert.get("--ds-alert-title-letter-spacing")).toBe("var(--ds-letter-spacing-heading)");
    expect(alert.get("--ds-alert-title-urgent-font-weight")).toBe("var(--ds-font-weight-bold)");
    expect(alert.get("--ds-alert-description-font-family")).toBe("var(--ds-type-supporting-font-family)");
    expect(alert.get("--ds-alert-description-font-size")).toBe("var(--ds-type-supporting-font-size)");
    expect(alert.get("--ds-alert-shadow")).toBe("var(--ds-elevation-1)");
    expect(alert.get("--ds-alert-title-color")).toBe("var(--ds-color-text-primary)");
    expect(alert.get("--ds-alert-info-ink")).toBe("var(--ds-color-info-ink)");
  });

  it("preserves the declared Alert family output contract", () => {
    expect(alertChromeDeriver.family).toBe("alert");
    expect(alertChromeDeriver.rank).toBe("derived");
    expect(alertChromeDeriver.consumes).toEqual([
      "palette.*", "surfaces.elevation", "surfaces.effects", "typography.roles", "states.focus",
    ]);
    expect(Object.keys(deriveAlertChannels())).toEqual(alertChromeDeriver.produces);
    expect(new Set(alertChromeDeriver.produces).size).toBe(alertChromeDeriver.produces.length);
  });
});
