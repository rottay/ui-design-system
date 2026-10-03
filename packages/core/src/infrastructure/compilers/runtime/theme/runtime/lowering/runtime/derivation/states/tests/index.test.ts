import { describe, expect, it } from "vitest";

import { compileThemeIntent } from "@/entrypoints/server";
import type { FlatTheme } from "@/foundation/contracts/composition/tenants/themes";
import { emitTenantArtifactCss } from "@/infrastructure/compilers/runtime/theme/runtime/emission";
import {
  containerScope,
  emitDeclarations,
  emitThemeCss,
} from "@/infrastructure/compilers/runtime/theme/runtime/emission/css";
import {
  CONTAINER_ALIAS_CONTEXTS,
  CONTAINER_ALIASES,
  containerAliasRedeclarations,
  ROOT_ALIASES,
} from "@/infrastructure/compilers/runtime/theme/runtime/emission/css/root-aliases";
import { flatThemeIntent } from "@tests/support/theme-door";
import { lowerFlatThemeFixture } from "@tests/support/theme-lowering";

import { deriveStateChannels } from "..";

const DIAL = "--ds-state-disabled-opacity";
const BUTTON = "--ds-button-disabled-opacity";
const ALIAS_LINE = `  ${BUTTON}: var(${DIAL});`;

const POSTURES = [
  ["subtle", "0.68"],
  ["medium", "0.6"],
  ["strong", "0.5"],
] as const;

type Posture = (typeof POSTURES)[number][0];

const themed = (stateEmphasis: Posture, extra: Partial<FlatTheme> = {}): FlatTheme => ({
  id: "states-probe",
  name: "States probe",
  surfaces: { stateEmphasis },
  ...extra,
});

const declarationsOf = (css: string, name: string): string[] =>
  [...css.matchAll(new RegExp(`^\\s*${name}:\\s*([^;]+);`, "gm"))].map((match) => match[1] as string);

function tenantDelta(variables: Record<string, string>): string {
  return emitTenantArtifactCss({ verticalKey: "bithire", slug: "t", compilerVersion: "v", digest: "d", variables });
}

describe("the disabled dial", () => {
  for (const [posture, opacity] of POSTURES) {
    it(`${posture} states ${opacity}`, () => {
      expect(deriveStateChannels(themed(posture))[DIAL]).toBe(opacity);
    });
  }

  it("an unauthored theme takes the medium posture", () => {
    expect(deriveStateChannels({ id: "plain", name: "Plain" })[DIAL]).toBe("0.6");
  });

  it("is the deriver's only disabled-opacity statement: the Button channel has one emission path", () => {
    for (const [posture] of POSTURES) {
      expect(Object.keys(deriveStateChannels(themed(posture)))).not.toContain(BUTTON);
    }
  });
});

describe("the Button disabled opacity follows the dial of its own scope", () => {
  it("is tabled as a root alias of the dial", () => {
    expect(new Map(ROOT_ALIASES).get(BUTTON)).toBe(`var(${DIAL})`);
  });

  for (const [posture, opacity] of POSTURES) {
    it(`${posture}: a root-element block restates the alias once, after the dial it reads`, () => {
      const lines = emitDeclarations(deriveStateChannels(themed(posture)));
      expect(lines).toContain(`  ${DIAL}: ${opacity};`);
      expect(lines.filter((line) => line.startsWith(`  ${BUTTON}:`))).toEqual([ALIAS_LINE]);
      expect(lines.indexOf(`  ${DIAL}: ${opacity};`)).toBeLessThan(lines.indexOf(ALIAS_LINE));
    });

    it(`${posture}: a whole compile emitted through the root door restates the alias beside its own dial`, () => {
      const { cssVariables, cssString } = lowerFlatThemeFixture({ flatTheme: themed(posture) });
      expect(cssVariables[DIAL]).toBe(opacity);
      expect(cssVariables).not.toHaveProperty(BUTTON);
      expect(declarationsOf(cssString, DIAL)).toEqual([opacity]);
      expect(declarationsOf(cssString, BUTTON)).toEqual([`var(${DIAL})`]);
    });

    it(`${posture}: the container door restates the alias in the scope's base rule`, () => {
      const { compiled } = compileThemeIntent(flatThemeIntent({ flatTheme: themed(posture) }));
      const css = emitThemeCss(compiled, containerScope("[data-states-probe]"), { container: {} });
      const base = css.slice(0, css.indexOf("}"));
      expect(base.startsWith("[data-states-probe] {")).toBe(true);
      expect(declarationsOf(base, DIAL)).toEqual([opacity]);
      expect(declarationsOf(base, BUTTON)).toEqual([`var(${DIAL})`]);
      expect(declarationsOf(css, BUTTON)).toEqual([`var(${DIAL})`]);
    });
  }

  it("the container law reaches the alias from the dial, and an outright statement there keeps its value", () => {
    expect(containerAliasRedeclarations([DIAL], new Set([DIAL])).declarations[BUTTON]).toBe(`var(${DIAL})`);
    expect(containerAliasRedeclarations([DIAL], new Set([DIAL, BUTTON])).declarations).not.toHaveProperty(BUTTON);
    const { compiled } = compileThemeIntent(
      flatThemeIntent({ flatTheme: themed("strong", { chrome: { controls: { disabled: { opacity: 0.3 } } } }) })
    );
    const css = emitThemeCss(compiled, containerScope("[data-states-probe]"), { container: {} });
    expect(declarationsOf(css, BUTTON)).toEqual(["0.3"]);
  });
});

describe("the Button focus offset follows the signature of its own scope", () => {
  const OFFSET = "--ds-focus-ring-offset";
  const BUTTON_OFFSET = "--ds-button-focus-ring-offset";
  const ALIAS = `var(${OFFSET}, 2px)`;
  const SIGNATURES = [
    ["ring", "2px"],
    ["underline", "0px"],
    ["glow", "0px"],
  ] as const;
  const signed = (focusStyle: (typeof SIGNATURES)[number][0]) =>
    deriveStateChannels({ id: "focus-probe", name: "Focus probe", surfaces: { focusStyle } });

  it("is tabled as a root alias of the signature offset, with no context left to re-emit", () => {
    expect(new Map(ROOT_ALIASES).get(BUTTON_OFFSET)).toBe(ALIAS);
    expect(CONTAINER_ALIASES.map((alias) => alias.name)).not.toContain(BUTTON_OFFSET);
    expect(CONTAINER_ALIAS_CONTEXTS.map((context) => context.name)).not.toContain(BUTTON_OFFSET);
  });

  for (const [signature, offset] of SIGNATURES) {
    it(`${signature}: a tenant scope restates the alias beside the offset it states`, () => {
      const css = tenantDelta(signed(signature));
      expect(declarationsOf(css, OFFSET)).toEqual([offset]);
      expect(declarationsOf(css, BUTTON_OFFSET)).toEqual([ALIAS]);
    });

    it(`${signature}: the container door restates it in the base rule and re-emits no context for it`, () => {
      const { compiled } = compileThemeIntent(
        flatThemeIntent({ flatTheme: { id: "focus-probe", name: "Focus probe", surfaces: { focusStyle: signature } } })
      );
      const css = emitThemeCss(compiled, containerScope("[data-states-probe]"), { container: {} });
      expect(declarationsOf(css, OFFSET)).toEqual([offset]);
      expect(declarationsOf(css, BUTTON_OFFSET)).toEqual([ALIAS]);
    });
  }

  it("an authored Button offset keeps its value in the scope that states it", () => {
    const css = tenantDelta({ ...signed("glow"), [BUTTON_OFFSET]: "4px" });
    expect(declarationsOf(css, BUTTON_OFFSET)).toEqual(["4px"]);
  });
});

describe("precedence", () => {
  it("an authored control opacity wins over the dial in the compile and in the emitted scope", () => {
    const { cssVariables, cssString } = lowerFlatThemeFixture({
      flatTheme: themed("strong", { chrome: { controls: { disabled: { opacity: 0.3 } } } }),
    });
    expect(cssVariables[DIAL]).toBe("0.5");
    expect(cssVariables[BUTTON]).toBe("0.3");
    expect(declarationsOf(cssString, BUTTON)).toEqual(["0.3"]);
  });

  it("an outright statement in a root-element block is never overwritten by the alias", () => {
    const lines = emitDeclarations({ ...deriveStateChannels(themed("strong")), [BUTTON]: "0.3" });
    expect(lines.filter((line) => line.startsWith(`  ${BUTTON}:`))).toEqual([`  ${BUTTON}: 0.3;`]);
  });
});

describe("a tenant delta over its vertical", () => {
  it("a palette-only delta never states the Button disabled opacity", () => {
    const css = tenantDelta({ "--ds-color-primary": "#123456", "--ds-color-primary-500": "#123456" });
    expect(declarationsOf(css, BUTTON)).toEqual([]);
    expect(declarationsOf(css, DIAL)).toEqual([]);
  });

  it("an emphasis-only delta moves it through the alias", () => {
    const css = tenantDelta({ [DIAL]: "0.68" });
    expect(declarationsOf(css, DIAL)).toEqual(["0.68"]);
    expect(declarationsOf(css, BUTTON)).toEqual([`var(${DIAL})`]);
  });

  it("a delta stating both keeps the explicit value", () => {
    const css = tenantDelta({ [DIAL]: "0.68", [BUTTON]: "0.3" });
    expect(declarationsOf(css, BUTTON)).toEqual(["0.3"]);
  });
});
