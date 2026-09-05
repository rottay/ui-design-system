/**
 * The adapter registry: one door in, no fallback out, and a refusal when a
 * tenant activates a control the rendering engine has no route to.
 */

import { afterEach, describe, expect, it } from "vitest";

import { TENANT_CAPABILITY_REGISTRY } from "@/foundation/contracts/composition/tenants/capabilities";
import type {
  ControlId,
  EngineAdapter,
} from "@/foundation/contracts/composition/tenants/themes/engine-adapter";
import { ENGINE_NAMES, type EngineName } from "@/foundation/contracts/kernel/engine-identity";

import { classicThemeAdapter } from "../presentation/classic";
import { defineEngineAdapter } from "../foundation/definition";
import { modernThemeAdapter } from "../presentation/modern";
import {
  EngineControlUnsupportedError,
  assertEngineSupportsActivatedControls,
  controlsActivatedBy,
} from "../facade/admission";
import {
  THEME_ENGINE_ADAPTERS,
  clearRegisteredEngineAdapters,
  registerEngineAdapter,
  resolveAdapter,
} from "../facade/registry";
import { rusticThemeAdapter } from "../presentation/rustic";

afterEach(() => clearRegisteredEngineAdapters());

describe("resolveAdapter has no fallback", () => {
  it("resolves the three shipped engines", () => {
    expect(resolveAdapter("modern")).toBe(modernThemeAdapter);
    expect(resolveAdapter("classic")).toBe(classicThemeAdapter);
    expect(resolveAdapter("rustic")).toBe(rusticThemeAdapter);
  });

  it("throws on `custom` with no registered adapter", () => {
    expect(() => resolveAdapter("custom")).toThrow(/no theme adapter for engine "custom"/);
  });

  it("throws on an unknown engine rather than substituting one", () => {
    expect(() => resolveAdapter("nonsense" as EngineName)).toThrow(
      /There is no fallback engine/
    );
  });

  it("is TOTAL over the roster, with `custom` a declared absence", () => {
    expect(Object.keys(THEME_ENGINE_ADAPTERS).sort()).toEqual([...ENGINE_NAMES].sort());
    expect(THEME_ENGINE_ADAPTERS.custom).toBeNull();
  });
});

describe("a new engine enters through exactly one door", () => {
  const stub = (id: EngineName): EngineAdapter =>
    defineEngineAdapter({
      id,
      tokenBaseline: modernThemeAdapter.tokenBaseline,
      controls: modernThemeAdapter.controls,
      project: () => ({ seeds: {}, modes: [] }),
    });

  it("registers `custom` and makes it resolvable", () => {
    registerEngineAdapter(stub("custom"));
    expect(resolveAdapter("custom").id).toBe("custom");
  });

  it("refuses an id that is not on the roster", () => {
    expect(() => registerEngineAdapter(stub("fifth" as EngineName))).toThrow(
      /not in ENGINE_NAMES/
    );
  });

  it("refuses to replace a shipped adapter", () => {
    expect(() => registerEngineAdapter(stub("classic"))).toThrow(/may not be replaced/);
  });

  it("refuses a second registration of the same id", () => {
    registerEngineAdapter(stub("custom"));
    expect(() => registerEngineAdapter(stub("custom"))).toThrow(/already registered/);
  });
});

describe("activation is read off the tenant's own authored paths", () => {
  it("maps a brand-theme keypath to the control that owns it", () => {
    expect(controlsActivatedBy(new Set(["motion.intensity"]))).toContain("motion.dial");
    expect(controlsActivatedBy(new Set(["typography.typePairing"]))).toContain(
      "typography.pairing"
    );
    expect(controlsActivatedBy(new Set(["palette.primaryColor"]))).toContain("palette.seeds");
  });

  it("names nothing for a path no control declares", () => {
    expect(controlsActivatedBy(new Set(["nothing.at.all"]))).toEqual([]);
  });

  it("covers every control with a resolvable authoring path", () => {
    // A control whose authoring path can never be matched is a control the
    // refusal below can never protect.
    const unreachable = TENANT_CAPABILITY_REGISTRY.filter(
      (control) =>
        controlsActivatedBy(
          new Set([control.brandThemePath.replace(/\{([^,}]+)[^}]*\}/g, "$1").replace(/\.\*$/, ".x")])
        ).length === 0
    ).map((control) => control.id);
    expect(unreachable).toEqual([]);
  });
});

describe("activating an unsupported control is refused, never quietly compiled", () => {
  it("refuses a rustic tenant that dials motion", () => {
    expect(() =>
      assertEngineSupportsActivatedControls(rusticThemeAdapter, new Set(["motion.intensity"]))
    ).toThrow(EngineControlUnsupportedError);
  });

  it("refuses a classic tenant that selects an anatomy variant", () => {
    expect(() =>
      assertEngineSupportsActivatedControls(
        classicThemeAdapter,
        new Set(["chrome.cardComponent.anatomy"])
      )
    ).toThrow(/chrome.anatomy/);
  });

  it("names the engine and the reason, so the refusal is actionable", () => {
    try {
      assertEngineSupportsActivatedControls(classicThemeAdapter, new Set(["typography.scale"]));
      expect.unreachable("expected a refusal");
    } catch (error) {
      expect(error).toBeInstanceOf(EngineControlUnsupportedError);
      const refusal = error as EngineControlUnsupportedError;
      expect(refusal.engine).toBe("classic");
      expect(refusal.controls).toContain("typography.scale" as ControlId);
      expect(refusal.message).toMatch(/antd sizes from its own fontSize token/);
    }
  });

  it("admits the same selection under modern, which is native for every control", () => {
    expect(() =>
      assertEngineSupportsActivatedControls(
        modernThemeAdapter,
        new Set(["motion.intensity", "typography.scale", "chrome.cardComponent.anatomy"])
      )
    ).not.toThrow();
  });

  it("admits a control the engine supports", () => {
    expect(() =>
      assertEngineSupportsActivatedControls(classicThemeAdapter, new Set(["palette.primaryColor"]))
    ).not.toThrow();
  });
});
