/**
 * RA02 (WO-CAN-04 amendment): the override policy has to hold at the REAL
 * provider boundary, with no tenant-context or provider mock.
 *
 * The delivered guard collected the tenant's decided channels from
 * `config.personality`, `config.brandTheme` and `config.appearance`, and the
 * runtime projection strips exactly those three fields before a component ever
 * sees the config. Behind `DesignSystemProvider` the hook therefore adjudicated
 * against an EMPTY set and admitted every selection it exists to refuse. The
 * existing policy test built the raw `TenantProvider` directly, so it never
 * crossed the bridge that failed.
 */

import React from "react";
import { describe, expect, it, afterEach } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";

import { DesignSystemProvider } from "@/infrastructure/runtime/bootstrap";
import {
  getCodeOwnedRuntimeConfig,
  getKnownTenantConfig,
  tenantDecidedChannels,
} from "@/infrastructure/runtime/tenant/foundation/configuration/registry";
import { firstPartyEngineVisual } from "@/infrastructure/compilers/runtime/theme";

import { useSurfaceProfileDefaults } from "../..";
import {
  useSurfaceProfileDefaultsWithOverrides,
  useSurfaceVisualOverrideVerdicts,
} from "..";

const VERTICALS = ["bithire", "rottay", "evnto"] as const;
/**
 * Every field here speaks for a channel all three verticals actually decide.
 *
 * D6-2c-ii-RED (2026-09-15): the retired authored themes decided the whole
 * animation block, so `entranceStyle` and `entranceDuration` used to be
 * contradicted too. The presets decide `animation.intensity` and
 * `card.paddingDensity`, and those are the channels this law is measured on --
 * the selection is re-aimed, not shortened, so every verdict must still refuse.
 */
const SELECTION = {
  density: "spacious",
  sectionSpacing: "lg",
  animateEntrance: false,
} as const;

function Probe(): React.ReactElement {
  const base = useSurfaceProfileDefaults();
  const resolved = useSurfaceProfileDefaultsWithOverrides(SELECTION);
  const verdicts = useSurfaceVisualOverrideVerdicts(SELECTION);
  return (
    <pre data-testid="probe">{JSON.stringify({ base, resolved, verdicts })}</pre>
  );
}

afterEach(cleanup);

describe("the real DesignSystemProvider carries the tenant's decisions", () => {
  it("refuses selections that contradict a decided channel, in all three verticals", () => {
    for (const vertical of VERTICALS) {
      render(
        <DesignSystemProvider
          tenantConfig={getKnownTenantConfig(vertical)}
          vertical={vertical}
          engineVisual={firstPartyEngineVisual(vertical, "modern")}
          skipCssLoading
        >
          <Probe />
        </DesignSystemProvider>
      );
      const probe = JSON.parse(screen.getByTestId("probe").textContent ?? "{}");
      expect(probe.verdicts.length).toBeGreaterThan(0);
      for (const verdict of probe.verdicts) {
        expect(verdict.admitted).toBe(false);
        expect(verdict.refusedBecause).toBe("tenant-decided");
      }
      // Nothing was applied: the surface keeps the defaults the tenant's own
      // profile resolves to, whatever they happen to be.
      expect(probe.resolved).toEqual(probe.base);
      // Per selected field, and coincidence-proof: where the selection really
      // differs from the tenant's own answer, the selected value must not land.
      for (const [field, selected] of Object.entries(SELECTION)) {
        if (probe.base[field] === selected) continue;
        expect(probe.resolved[field], `${vertical}: ${field}`).not.toBe(selected);
      }
      cleanup();
    }
  });

  it("carries the decided-channel NAMES across the projection, not a visual payload", () => {
    for (const vertical of VERTICALS) {
      const config = getKnownTenantConfig(vertical);
      expect(config).toBeDefined();
      const projected = getCodeOwnedRuntimeConfig(config!);
      // There is nothing to strip: `TenantConfig` declares none of the five
      // visual fields, so neither the source nor its projection can carry one
      // and no competing JS writer can be reintroduced.
      for (const field of ['personality', 'brandTheme', 'appearance', 'tokenOverrides', 'engine']) {
        expect(config!).not.toHaveProperty(field);
        expect(projected).not.toHaveProperty(field);
      }
      // The census the finding measured as 27 -> 0 is preserved instead.
      const raw = tenantDecidedChannels(config);
      expect(raw.size).toBeGreaterThan(0);
      expect([...tenantDecidedChannels(projected)].sort()).toEqual([...raw].sort());
    }
  });
});
