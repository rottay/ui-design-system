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
import { compileFlatThemeThroughDoor, flatThemeIntent } from "@tests/support/theme-door";

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
      const { cssVariables, cssString } = compileFlatThemeThroughDoor({ flatTheme: themed(posture) });
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

describe("the focus signatures", () => {
  const RING = "--ds-focus-ring";
  const WIDTH = "--ds-focus-ring-width";
  const OFFSET = "--ds-focus-ring-offset";
  const COLOUR = "var(--ds-focus-ring-color)";
  const GROUND = "var(--ds-color-bg-primary)";
  const HALO = `0 0 12px 2px color-mix(in srgb, ${COLOUR} 45%, transparent)`;
  const EMITTED = {
    ring: {
      width: "2px",
      offset: "2px",
      layers: [`0 0 0 var(${OFFSET}) ${GROUND}`, `0 0 0 calc(var(${OFFSET}) + var(${WIDTH})) ${COLOUR}`],
    },
    underline: {
      width: "2px",
      offset: "0px",
      layers: [
        `inset 0 calc(-1 * var(${WIDTH})) 0 0 ${COLOUR}`,
        `inset 0 calc(-1 * var(${WIDTH}) - 1px) 0 0 ${GROUND}`,
      ],
    },
    glow: {
      width: "1px",
      offset: "0px",
      layers: [`0 0 0 var(${WIDTH}) ${COLOUR}`, `inset 0 0 0 1px ${GROUND}`, HALO],
    },
  } as const;
  type Signature = keyof typeof EMITTED;
  const SIGNATURES: readonly Signature[] = ["ring", "underline", "glow"];
  const AUTHORED = "0 0 0 3px #C80064";

  const flat = (focusStyle: Signature): FlatTheme => ({
    id: "focus-probe",
    name: "Focus probe",
    surfaces: { focusStyle },
  });
  const signed = (focusStyle: Signature) => deriveStateChannels(flat(focusStyle));

  /** The layers of a shadow list: commas inside a function do not separate layers. */
  function layersOf(shadow: string): string[] {
    const layers: string[] = [];
    let depth = 0;
    let current = "";
    for (const char of shadow) {
      if (char === "(") depth += 1;
      if (char === ")") depth -= 1;
      if (char === "," && depth === 0) {
        layers.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
    layers.push(current.trim());
    return layers;
  }

  /** A layer with its colour operand removed: what is left is geometry. */
  const geometryOf = (layer: string): string =>
    layer.replace(HALO.slice("0 0 12px 2px ".length), "").replace(COLOUR, "").replace(GROUND, "").trim();

  for (const signature of SIGNATURES) {
    it(`${signature}: emits its exact width, offset and shadow`, () => {
      const channels = signed(signature);
      expect(channels[WIDTH]).toBe(EMITTED[signature].width);
      expect(channels[OFFSET]).toBe(EMITTED[signature].offset);
      expect(channels[RING]).toBe(EMITTED[signature].layers.join(", "));
      expect(layersOf(channels[RING] as string)).toEqual([...EMITTED[signature].layers]);
    });
  }

  it("an unauthored theme wears the ring", () => {
    expect(deriveStateChannels({ id: "plain", name: "Plain" })[RING]).toBe(EMITTED.ring.layers.join(", "));
  });

  it("underline is the focus line with a 1px ground band inside it, both inset", () => {
    const [line, band] = layersOf(signed("underline")[RING] as string);
    expect(line).toBe(`inset 0 calc(-1 * var(${WIDTH})) 0 0 ${COLOUR}`);
    expect(band).toBe(`inset 0 calc(-1 * var(${WIDTH}) - 1px) 0 0 ${GROUND}`);
  });

  it("glow is its ring, a literal 1px inner ground hairline the contrast floor cannot widen, and the halo", () => {
    const [ring, hairline, halo] = layersOf(signed("glow")[RING] as string);
    expect(ring).toBe(`0 0 0 var(${WIDTH}) ${COLOUR}`);
    expect(hairline).toBe(`inset 0 0 0 1px ${GROUND}`);
    expect(hairline).not.toContain(WIDTH);
    expect(halo).toBe(HALO);
  });

  it("every signature carries the ground the ring's gap reads, and no other colour operand", () => {
    for (const signature of SIGNATURES) {
      const shadow = signed(signature)[RING] as string;
      expect(shadow, signature).toContain(GROUND);
      const operands = [...shadow.matchAll(/var\((--ds-[a-z-]*(?:color|bg)[a-z-]*)\)/g)].map((match) => match[1]);
      expect(new Set(operands), signature).toEqual(new Set(["--ds-focus-ring-color", "--ds-color-bg-primary"]));
    }
  });

  it("the three signatures differ on geometry alone, with the colours taken out", () => {
    const geometries = SIGNATURES.map((signature) =>
      layersOf(signed(signature)[RING] as string).map(geometryOf).join(" | ")
    );
    expect(geometries).toEqual([
      `0 0 0 var(${OFFSET}) | 0 0 0 calc(var(${OFFSET}) + var(${WIDTH}))`,
      `inset 0 calc(-1 * var(${WIDTH})) 0 0 | inset 0 calc(-1 * var(${WIDTH}) - 1px) 0 0`,
      `0 0 0 var(${WIDTH}) | inset 0 0 0 1px | 0 0 12px 2px`,
    ]);
    expect(new Set(geometries).size).toBe(3);
  });

  for (const signature of SIGNATURES) {
    it(`${signature}: a tenant scope restates the signature beside its operands`, () => {
      const css = tenantDelta(signed(signature));
      expect(declarationsOf(css, RING)).toEqual([EMITTED[signature].layers.join(", ")]);
      expect(declarationsOf(css, WIDTH)).toEqual([EMITTED[signature].width]);
      expect(declarationsOf(css, OFFSET)).toEqual([EMITTED[signature].offset]);
    });

    it(`${signature}: the container door restates the signature in the scope's base rule`, () => {
      const { compiled } = compileThemeIntent(flatThemeIntent({ flatTheme: flat(signature) }));
      const css = emitThemeCss(compiled, containerScope("[data-states-probe]"), { container: {} });
      const base = css.slice(0, css.indexOf("}"));
      expect(base.startsWith("[data-states-probe] {")).toBe(true);
      expect(declarationsOf(base, RING)).toEqual([EMITTED[signature].layers.join(", ")]);
    });

    it(`${signature}: an authored ${RING} replaces the whole signature in the tenant scope and in the container door`, () => {
      expect(declarationsOf(tenantDelta({ ...signed(signature), [RING]: AUTHORED }), RING)).toEqual([AUTHORED]);
      const lines = emitDeclarations({ ...signed(signature), [RING]: AUTHORED });
      expect(lines.filter((line) => line.startsWith(`  ${RING}:`))).toEqual([`  ${RING}: ${AUTHORED};`]);
      const { compiled } = compileThemeIntent(flatThemeIntent({ flatTheme: flat(signature) }));
      const authored = { ...compiled, cssVariables: { ...compiled.cssVariables, [RING]: AUTHORED } };
      const css = emitThemeCss(authored, containerScope("[data-states-probe]"), { container: {} });
      expect(declarationsOf(css, RING)).toEqual([AUTHORED]);
    });
  }
});

describe("precedence", () => {
  it("an authored control opacity wins over the dial in the compile and in the emitted scope", () => {
    const { cssVariables, cssString } = compileFlatThemeThroughDoor({
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
