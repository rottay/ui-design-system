/** The sidebar tone as a style row (ratified 2026-09-22), through the v3 door: a style proposes a tone the
 *  tenant can always outrank, and the tone only chooses steps of the tenant's own ramps.
 *
 *  Plan tier (owner, 2026-09-22 point 5: "Standard y Pro heredan la misma calidad: cambia la posibilidad
 *  de editar"): inheritance is not activation. A style's rows reach a standard-plan tenant as inheritance,
 *  as a vertical preset's do; the tier refusal judges only the tenant's own authored selections. Measured
 *  premise: projectDecisionsToV1 does not refuse a style's pro-tier row; tierIssues reads only
 *  direct-override entries. */
import { describe, expect, it, vi } from "vitest";

import { ledgerOwnerOfLeaf } from "@/foundation/contracts/composition/tenants/themes/provenance";
import { mergeThemePatches } from "@/foundation/contracts/composition/tenants/themes/iso";
import { sidebarToneToVariables } from "@/infrastructure/compilers/kernel/foundation/css/chrome-variables";
import { verticalDefaultMode } from "@/infrastructure/compilers/kernel/foundation/modes";
import { compileThemeIntent } from "@/infrastructure/compilers/runtime/theme/facade/runtime/compile";
import { documentThemeIntent } from "@/infrastructure/compilers/runtime/theme/runtime/ingress/presentation/document";
import { draftPreviewThemeIntent } from "@/infrastructure/compilers/runtime/theme/runtime/ingress/presentation/preview";
import { assertStyleAuthorable } from "@/contracts/theme/runtime/styles/runtime/partition";
import { projectDecisionsToV1 } from "@/infrastructure/compilers/runtime/theme/runtime/ingress";
import { baselineFor, styleThemePatch } from "../../..";

vi.mock("@/contracts/theme/runtime/styles/composition/registry", async (importOriginal) => {
  const original = await importOriginal<typeof import("@/contracts/theme/runtime/styles/composition/registry")>();
  const { defineThemeStyle, themeStyleDigest } = await import("@/contracts/theme/runtime/styles/foundation/document");
  const { assertStyleAuthorable, assertStyleEmitsSomething } = await import(
    "@/contracts/theme/runtime/styles/runtime/partition"
  );
  const publish = (
    id: string,
    decisions: Record<string, unknown>,
    verticals: "all" | string[] = "all",
    exclusionReasons?: Record<string, string>
  ) => {
    const document = { decisions };
    const record = defineThemeStyle({
      document,
      manifest: {
        id,
        version: 1,
        title: "Sidebar-tone drill",
        workOrder: "WO-DER-09",
        publishedOn: "2026-09-24",
        digest: themeStyleDigest(document as never),
        rows: Object.keys(decisions),
        provenance: Object.fromEntries(Object.keys(decisions).map((row) => [row, "a drill reason"])),
        verticals,
        ...(exclusionReasons ? { exclusionReasons } : {}),
      },
    } as never);
    for (const row of record.manifest.rows) assertStyleAuthorable(id, row);
    assertStyleEmitsSomething(id, record.manifest.rows);
    return record;
  };
  const drills = [
    publish("tone-subtle", { "navigation.sidebar-tone": "subtle" }),
    publish("tone-strong", { "navigation.sidebar-tone": "strong" }),
    publish("tone-inverse", { "navigation.sidebar-tone": "inverse" }),
    publish("tone-no-evnto", { "navigation.sidebar-tone": "strong" }, ["bithire", "rottay"], {
      evnto: "a drill exclusion",
    }),
    publish("pro-nesting", { "shape.nesting": "concentric" }),
    publish("pro-nesting-no-evnto", { "shape.nesting": "concentric" }, ["bithire", "rottay"], {
      evnto: "a drill exclusion",
    }),
  ];
  return {
    ...original,
    THEME_STYLE_REGISTRY: Object.freeze({
      ...original.THEME_STYLE_REGISTRY,
      ...Object.fromEntries(drills.map((record) => [original.themeStyleKey(record.ref), record])),
    }),
    THEME_STYLE_IDS: Object.freeze([...original.THEME_STYLE_IDS, ...drills.map((record) => record.ref.id)]),
    themeStyleVersions: (id: string) => {
      const known = original.themeStyleVersions(id);
      return known.length > 0 ? known : drills.filter((record) => record.ref.id === id).map((record) => record.ref.version);
    },
  };
});

const TONES = ["subtle", "strong", "inverse"] as const;
const MODES = ["light", "dark"] as const;
const SIX = [
  "--ds-sidebar-bg",
  "--ds-sidebar-text",
  "--ds-sidebar-text-muted",
  "--ds-sidebar-item-bg-hover",
  "--ds-sidebar-item-bg-active",
  "--ds-sidebar-item-color-active",
] as const;

type Vertical = "bithire" | "rottay" | "evnto";

function compile(input: {
  vertical?: Vertical;
  decisions?: Record<string, unknown>;
  overrides?: Record<string, unknown>;
  style?: string;
  plan?: "standard" | "pro";
}) {
  const intent = documentThemeIntent({
    vertical: input.vertical ?? "bithire",
    slug: "acme",
    document: {
      version: 3,
      plan: input.plan ?? "standard",
      decisions: input.decisions ?? {},
      ...(input.overrides ? { overrides: input.overrides } : {}),
      ...(input.style ? { style: { id: input.style, version: 1 } } : {}),
    } as never,
  });
  return { intent, compiled: compileThemeIntent(intent).compiled };
}

/** The six channels as they resolve in `mode`: the base block, then that mode's delta. */
function six(compiled: ReturnType<typeof compile>["compiled"], mode: (typeof MODES)[number]) {
  const block = compiled.modeBlocks.find((candidate) => candidate.mode === mode);
  const effective = { ...compiled.cssVariables, ...(block?.cssVariables ?? {}) };
  return Object.fromEntries(SIX.map((name) => [name, effective[name]]));
}

const ledgerOf = (intent: ReturnType<typeof compile>["intent"]) => intent.ledger as never;

describe("sidebar tone as a style row, through the v3 door", () => {
  it("covers both mode blocks, so the dark assertions are not vacuous", () => {
    const { compiled } = compile({ style: "tone-strong" });
    const modes = new Set([
      compiled.colorScheme ?? verticalDefaultMode("bithire"),
      ...compiled.modeBlocks.map((block) => block.mode),
    ]);
    expect([...modes].sort()).toEqual(["dark", "light"]);
  });

  it("H1: a tenant who states nothing inherits the style's tone, in light AND dark, recorded as preset-inherited", () => {
    for (const tone of TONES) {
      const { intent, compiled } = compile({ style: `tone-${tone}` });
      for (const mode of MODES) {
        expect({ tone, mode, channels: six(compiled, mode) }).toEqual({
          tone,
          mode,
          channels: sidebarToneToVariables(tone, mode),
        });
      }
      const owner = ledgerOwnerOfLeaf(ledgerOf(intent), "chrome.sidebar.tone") as { provenance: string; ref: { kind: string } };
      expect({ tone, provenance: owner?.provenance, kind: owner?.ref.kind }).toEqual({
        tone,
        provenance: "preset-inherited",
        kind: "style-reference",
      });
    }
  });

  it("H2: every proposed tone is a choice of palette channels -- no literal, no seed", () => {
    for (const tone of TONES) {
      for (const mode of MODES) {
        const values = Object.values(sidebarToneToVariables(tone, mode));
        expect(values).toHaveLength(6);
        for (const value of values) expect({ tone, mode, value }).toEqual({ tone, mode, value: expect.stringMatching(/^var\(--ds-color-/u) });
      }
    }
  });

  it("H3: the tone never moves the brand: with the tenant's own seeds it reads the tenant's ramp", () => {
    const seeds = { "palette.seeds": { primary: "#0F766E" } };
    const seeded = compile({ decisions: seeds });
    const seededStyled = compile({ decisions: seeds, style: "tone-strong" });
    const unseeded = compile({ style: "tone-strong" });
    expect(six(seededStyled.compiled, "light")).toEqual(sidebarToneToVariables("strong", "light"));
    expect(seededStyled.compiled.cssVariables["--ds-color-primary-900"]).toBe(
      seeded.compiled.cssVariables["--ds-color-primary-900"]
    );
    expect(seededStyled.compiled.cssVariables["--ds-color-primary-900"]).not.toBe(
      unseeded.compiled.cssVariables["--ds-color-primary-900"]
    );
  });

  it("R2: a tenant's own tone outranks the style's, and the style entry carries no tone leaf", () => {
    const { intent, compiled } = compile({ decisions: { "navigation.sidebar-tone": "subtle" }, style: "tone-strong" });
    for (const mode of MODES) expect(six(compiled, mode)).toEqual(sidebarToneToVariables("subtle", mode));
    const owner = ledgerOwnerOfLeaf(ledgerOf(intent), "chrome.sidebar.tone") as { provenance: string; ref: { kind: string; id?: string } };
    expect(owner?.provenance).toBe("direct-override");
    expect(owner?.ref).toMatchObject({ kind: "decision", id: "navigation.sidebar-tone" });
    const styleEntries = ((intent.ledger as { entries: readonly { ref: { kind: string }; effectiveLeaves: readonly string[] }[] }).entries).filter(
      (entry) => entry.ref.kind === "style-reference"
    );
    for (const entry of styleEntries) expect(entry.effectiveLeaves).not.toContain("chrome.sidebar.tone");
  });

  it("R3: a tenant's sidebar leaf outranks the style's tone for that channel; the other five follow the tone", () => {
    // Sanctioned overrides are themselves pro-tier, so the leaf is stated on the pro plan.
    const { compiled } = compile({ overrides: { chrome: { sidebar: { bg: "#123456" } } }, style: "tone-strong", plan: "pro" });
    const light = six(compiled, "light");
    const strong = sidebarToneToVariables("strong", "light");
    expect(light["--ds-sidebar-bg"]).toBe("#123456");
    for (const name of SIX.filter((channel) => channel !== "--ds-sidebar-bg")) {
      expect({ name, value: light[name] }).toEqual({ name, value: strong[name] });
    }
  });

  it("R4: a style excluded for a vertical is refused there by name and admitted elsewhere", () => {
    expect(() => compile({ vertical: "evnto", style: "tone-no-evnto" })).toThrow(
      /style "tone-no-evnto" is not published for evnto; it declares bithire \| rottay \(a drill exclusion\)/u
    );
    expect(six(compile({ vertical: "bithire", style: "tone-no-evnto" }).compiled, "light")).toEqual(
      sidebarToneToVariables("strong", "light")
    );
  });

  it("R4 tier, premise: the projection does not refuse a style's pro-tier row", () => {
    expect(() =>
      projectDecisionsToV1({ version: 2, plan: "standard", decisions: { "shape.nesting": "concentric" } } as never)
    ).not.toThrow();
  });

  it("R4 tier: a standard-plan tenant naming a style INHERITS its pro-tier row, with a pro author's quality", () => {
    const { intent, compiled } = compile({ style: "pro-nesting", plan: "standard" });
    const bare = compile({ plan: "standard" }).compiled;
    const authoredByPro = compile({ plan: "pro", decisions: { "shape.nesting": "concentric" } }).compiled;
    expect(compiled.cssVariables).not.toEqual(bare.cssVariables);
    expect(compiled.cssVariables).toEqual(authoredByPro.cssVariables);
    const entries = (intent.ledger as { entries: readonly { ref: { kind: string }; provenance: string; effectiveLeaves: readonly string[] }[] }).entries;
    const styled = entries.find((entry) => entry.ref.kind === "style-reference");
    expect(styled?.provenance).toBe("preset-inherited");
    expect(styled?.effectiveLeaves.length).toBeGreaterThan(0);
    for (const leaf of styled?.effectiveLeaves ?? []) {
      const owner = ledgerOwnerOfLeaf(intent.ledger as never, leaf) as { provenance: string };
      expect({ leaf, provenance: owner?.provenance }).toEqual({ leaf, provenance: "preset-inherited" });
    }
  });

  it("R4 tier: the tenant's OWN pro-tier selection is still refused on a standard plan, style or no style", () => {
    const own = { "shape.nesting": "concentric" };
    const refusal = /decision "shape\.nesting" is tier pro; plan standard entitles standard/u;
    expect(() => compile({ decisions: own, plan: "standard" })).toThrow(refusal);
    expect(() => compile({ decisions: own, plan: "standard", style: "pro-nesting" })).toThrow(refusal);
  });

  it("R4 tier: a style carrying pro rows is refused only where the vertical or registration law says so", () => {
    expect(() => compile({ vertical: "evnto", style: "pro-nesting-no-evnto", plan: "standard" })).toThrow(
      /style "pro-nesting-no-evnto" is not published for evnto/u
    );
    expect(() => compile({ vertical: "bithire", style: "pro-nesting-no-evnto", plan: "standard" })).not.toThrow();
    // A pro-tier BRAND row is refused at registration for its class, never for its tier.
    expect(() => assertStyleAuthorable("pro-brand", "palette.contrast-posture")).toThrow(
      /"palette\.contrast-posture", which is brand-class/u
    );
  });

  it("L1: the draft door still names the tone leaf direct-override (CAT-04's recorded carriedFrom limit, not fixed here)", () => {
    const STYLE = { id: "tone-strong", version: 1 } as const;
    const composed = mergeThemePatches(
      baselineFor("bithire", "acme"),
      styleThemePatch({ vertical: "bithire", plan: "pro", style: STYLE })
    );
    const intent = draftPreviewThemeIntent({ vertical: "bithire", slug: "acme", draft: composed, carriedFrom: composed, style: STYLE });
    const owner = ledgerOwnerOfLeaf(intent.ledger as never, "chrome.sidebar.tone") as { provenance: string };
    expect(owner?.provenance).toBe("direct-override");
  });
});
