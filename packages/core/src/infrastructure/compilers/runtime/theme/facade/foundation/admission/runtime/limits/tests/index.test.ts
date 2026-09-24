import { describe, expect, it } from "vitest";

import type {
  ThemeCompilation,
  ThemeCompilationContrastBlock,
  ThemeCompilationModeBlock,
} from "@/foundation/contracts/composition/tenants/themes/compiled";

import { limitIssues, themeChannelDelta } from "..";

const compilation = (
  cssVariables: Record<string, string>,
  modeBlocks: readonly ThemeCompilationModeBlock[],
  contrastBlocks?: readonly ThemeCompilationContrastBlock[]
): ThemeCompilation => ({
  cssVariables,
  modeBlocks,
  ...(contrastBlocks ? { contrastBlocks } : {}),
  runtime: { personality: {}, tokenOverrides: {} },
});

const dark = (cssVariables: Record<string, string>): ThemeCompilationModeBlock => ({
  mode: "dark",
  cssVariables,
  colorScheme: "dark",
});

describe("themeChannelDelta: the tenant's prefers-contrast: more rules", () => {
  // Synthetic: no DB schema route reaches a per-mode contrast delta yet. on-warning is
  // the harmful shape — moved by the base delta, kept at rest in dark, so dark must restate it.
  const baseline = compilation(
    {
      "--ds-color-on-error": "#ffffff",
      "--ds-color-on-success": "#ffffff",
      "--ds-color-on-warning": "#ffffff",
    },
    [dark({ "--ds-color-on-success": "#fafafa" })]
  );
  const tenant = compilation(
    {
      "--ds-color-on-error": "#171717",
      "--ds-color-on-success": "#ffffff",
      "--ds-color-on-warning": "#171717",
    },
    [dark({ "--ds-color-on-success": "#fafafa" })],
    [
      { cssVariables: { "--ds-color-on-error": "#000000", "--ds-color-on-warning": "#000000" } },
      {
        mode: "dark",
        cssVariables: { "--ds-color-on-success": "#000000", "--ds-color-on-warning": "#171717" },
      },
    ]
  );
  const delta = themeChannelDelta(tenant, baseline);

  it("states the base delta over the tenant's resting base rule", () => {
    expect(delta.variables).toEqual({
      "--ds-color-on-error": "#171717",
      "--ds-color-on-warning": "#171717",
    });
    expect(delta.modeDeltas).toEqual([]);
    expect(delta.contrastDeltas[0]).toEqual({
      variables: { "--ds-color-on-error": "#000000", "--ds-color-on-warning": "#000000" },
    });
  });

  it("measures the dark delta against what the base delta already resolves there", () => {
    expect(delta.contrastDeltas).toHaveLength(2);
    // on-error rides the base delta untouched; on-warning must be pulled back.
    expect(delta.contrastDeltas[1]).toEqual({
      mode: "dark",
      variables: { "--ds-color-on-success": "#000000", "--ds-color-on-warning": "#171717" },
    });
  });

  it("resolves every state under the preference as the tenant's own compile does", () => {
    const contrastOf = (mode?: "dark") =>
      delta.contrastDeltas.find((block) => block.mode === mode)?.variables;
    const artifact = (mode?: "dark") => ({
      ...baseline.cssVariables,
      ...(mode ? baseline.modeBlocks[0].cssVariables : {}),
      ...delta.variables,
      ...contrastOf(),
      ...(mode ? delta.modeDeltas.find((block) => block.mode === mode)?.variables : {}),
      ...(mode ? contrastOf(mode) : {}),
    });
    const own = (mode?: "dark") => ({
      ...tenant.cssVariables,
      ...tenant.contrastBlocks![0].cssVariables,
      ...(mode ? tenant.modeBlocks[0].cssVariables : {}),
      ...(mode ? tenant.contrastBlocks![1].cssVariables : {}),
    });
    expect(artifact()).toEqual(own());
    expect(artifact("dark")).toEqual(own("dark"));
  });

  it("emits no contrast delta when neither compile moves under the preference", () => {
    expect(themeChannelDelta(baseline, baseline).contrastDeltas).toEqual([]);
  });
});

describe("themeChannelDelta: what a density boundary re-declares over the vertical's rule", () => {
  const SCALED = "calc(3.75rem * var(--ds-density-effective-scale, 1))";
  const scoped = (
    cssVariables: Record<string, string>,
    densityScope?: Record<string, string>
  ): ThemeCompilation => ({
    ...compilation(cssVariables, []),
    ...(densityScope ? { densityScopeBlock: { cssVariables: densityScope } } : {}),
  });
  const vertical = scoped({ "--ds-toolbar-min-height": SCALED }, { "--ds-toolbar-min-height": SCALED });

  it("states nothing when the boundary value is the vertical's", () => {
    expect(themeChannelDelta(vertical, vertical).densityScopeVariables).toEqual({});
  });

  it("carries a tenant statement into the boundary, where the vertical's rule would beat the root", () => {
    const stated = scoped({ "--ds-toolbar-min-height": "50px" }, { "--ds-toolbar-min-height": "50px" });
    const delta = themeChannelDelta(stated, vertical);
    expect(delta.variables).toEqual({ "--ds-toolbar-min-height": "50px" });
    expect(delta.densityScopeVariables).toEqual({ "--ds-toolbar-min-height": "50px" });
  });

  it("carries the tenant's root value for a channel the vertical projects and this compile does not", () => {
    const unprojected = scoped({ "--ds-toolbar-min-height": "50px" });
    expect(themeChannelDelta(unprojected, vertical).densityScopeVariables).toEqual({
      "--ds-toolbar-min-height": "50px",
    });
  });

  it("screens the boundary declarations like every other emitted map", () => {
    const hostile = { ...themeChannelDelta(vertical, vertical), densityScopeVariables: { "--ds-toolbar-min-height": "1px}body{x:y" } };
    expect(limitIssues(hostile).map((issue) => issue.code)).toContain("unsafe_value");
    expect(limitIssues(themeChannelDelta(vertical, vertical))).toEqual([]);
  });
});
