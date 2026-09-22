/**
 * The single admission grammar for CSS text, tested at the boundary itself.
 *
 * Every productive emitter routes through `admitCssVariables`, so a hole here
 * is a hole in the first-party artifact, the DB artifact, the brand-studio
 * preview and the tenant preview at once.
 */

import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import { expandExpressiveProfiles } from "@/foundation/tokens/ts/presentation/expressive-profiles/expansion";
import { isSafeVisualValue } from "@/infrastructure/compilers/runtime/theme/facade/foundation/admission/runtime/limits";

import {
  ALLOWED_VALUE_FUNCTIONS,
  admitCssVariables,
  isSafeCssChannelName,
  isSafeCssDeclaration,
  isSafeCssValue,
} from "..";

const NUL = String.fromCharCode(0);
const BEL = String.fromCharCode(7);
const ESC = String.fromCharCode(27);
const DEL = String.fromCharCode(127);
const LF = String.fromCharCode(10);
const CR = String.fromCharCode(13);
const TAB = String.fromCharCode(9);

describe("the value grammar refuses every structural breakout", () => {
  const hostile: readonly [string, string][] = [
    ["declaration terminator", "#000; color: red"],
    ["rule close then a new rule", "#000; } body { display: none; } .x {"],
    ["bare closing brace", "red }"],
    ["bare opening brace", "red {"],
    ["style element close", "red</style><script>alert(1)</script>"],
    ["comment open", "red /* x"],
    ["comment close", "red */"],
    ["important", "red !important"],
    ["spaced important", "red !  important"],
    ["url fetch", "url(https://example.test/x.png)"],
    ["spaced url", "url (https://example.test/x.png)"],
    ["javascript scheme", "javascript:alert(1)"],
    ["data scheme", "data:text/css,x"],
    ["expression", "expression(alert(1))"],
    ["moz binding", "-moz-binding"],
    ["backslash escape", "\\3c /style>"],
    ["square brackets", "attr[href]"],
    ["at-rule outside quotes", "@import 'x'"],
    ["at-rule after a closed string", '"safe" @import'],
    ["unbalanced open paren", "rgba(0, 0, 0, 0.5"],
    ["unbalanced close paren", "rgba(0, 0, 0, 0.5))"],
    ["unbalanced quote", '"unterminated'],
    ["unknown function", "evil(1)"],
    ["empty", ""],
    ["leading whitespace", " red"],
    ["trailing whitespace", "red "],
    ["over length", `#${"0".repeat(600)}`],
    ["NUL", `red${NUL}`],
    ["BEL", `red${BEL}`],
    ["ESC", `red${ESC}`],
    ["DEL", `red${DEL}`],
  ];

  for (const [label, value] of hostile) {
    it(`refuses ${label}`, () => {
      expect(isSafeCssValue(value)).toBe(false);
    });
  }

  it("refuses a breakout hidden inside an otherwise legal function", () => {
    expect(isSafeCssValue("rgba(0,0,0,1); } body { display:none } .x {")).toBe(false);
  });

  it("refuses a non-string", () => {
    expect(isSafeCssValue(undefined as unknown as string)).toBe(false);
    expect(isSafeCssValue(null as unknown as string)).toBe(false);
    expect(isSafeCssValue(12 as unknown as string)).toBe(false);
  });
});

describe("the value grammar admits every shape the compiler really emits", () => {
  const legitimate: readonly [string, string][] = [
    ["a hex color", "#4f46e5"],
    ["an rgba color", "rgba(20, 40, 59, 0.16)"],
    ["a color-mix", "color-mix(in srgb, #fff 20%, transparent)"],
    ["a var reference with fallback", "var(--ds-color-primary, #000)"],
    ["a font stack", "Inter, -apple-system, 'Segoe UI', sans-serif"],
    ["a gradient", "linear-gradient(180deg, #fff 0%, #000 100%)"],
    ["a calc", "calc(1rem * 1.25)"],
    ["a clamp", "clamp(0.5rem, 1vw, 1rem)"],
    ["a cubic-bezier", "cubic-bezier(0.4, 0, 0.2, 1)"],
    ["a linear() easing", "linear(0, 0.2131, 0.445, 0.6115, 0.9982, 1)"],
    ["a nested transform", "scale(1.02) translateY(-2px)"],
    ["a quoted provenance marker", '"rottay/bithire-technical@1"'],
    ["a quote inside a quoted string", `"a'b"`],
    ["a multi-line shadow", `0 4px 12px rgba(20, 40, 59, 0.16),${LF}    0 2px 4px rgba(20, 40, 59, 0.1)`],
    ["a carriage-return shadow", `0 1px 2px #000,${CR}${LF} 0 2px 4px #000`],
    ["a tabbed value", `0 1px 2px${TAB}#000`],
  ];

  for (const [label, value] of legitimate) {
    it(`admits ${label}`, () => {
      expect(isSafeCssValue(value)).toBe(true);
    });
  }

  it("admits `@` inside quotes and refuses it outside, in the same value shape", () => {
    expect(isSafeCssValue('"rottay/technical-sharp@1"')).toBe(true);
    expect(isSafeCssValue("rottay/technical-sharp@1")).toBe(false);
  });
});

describe("the channel-name grammar", () => {
  it("admits canonical DS channels", () => {
    expect(isSafeCssChannelName("--ds-color-primary")).toBe(true);
    expect(isSafeCssChannelName("--ds-motion-spring-gentle")).toBe(true);
  });

  it("refuses anything that is not a DS channel", () => {
    for (const name of [
      "--rt-color-primary",
      "--x",
      "color",
      "--ds-color primary",
      "--ds-color:primary",
      "--ds-",
      "} body { --ds-a",
    ]) {
      expect(isSafeCssChannelName(name), name).toBe(false);
    }
  });
});

describe("admitCssVariables omits whole entries and never repairs one", () => {
  it("keeps the safe entries, in source order, byte-identical", () => {
    const admitted = admitCssVariables({
      "--ds-color-primary": "#4f46e5",
      "--ds-evil": "#000; } body { display: none } .x {",
      "--ds-color-bg-primary": "#ffffff",
    });
    expect(Object.keys(admitted)).toEqual(["--ds-color-primary", "--ds-color-bg-primary"]);
    expect(admitted["--ds-color-primary"]).toBe("#4f46e5");
  });

  it("omits a hostile NAME as well as a hostile value", () => {
    const admitted = admitCssVariables({
      "--ds-ok": "#fff",
      "} body { color": "red",
      "--evil": "#fff",
    });
    expect(Object.keys(admitted)).toEqual(["--ds-ok"]);
  });

  it("drops null and undefined without throwing", () => {
    const admitted = admitCssVariables({
      "--ds-a": null as unknown as string,
      "--ds-b": undefined as unknown as string,
      "--ds-c": "#fff",
    });
    expect(Object.keys(admitted)).toEqual(["--ds-c"]);
  });

  it("never rewrites: an admitted value is the authored string", () => {
    const value = `0 4px 12px rgba(20, 40, 59, 0.16),${LF}    0 2px 4px rgba(20, 40, 59, 0.1)`;
    expect(admitCssVariables({ "--ds-card-shadow": value })["--ds-card-shadow"]).toBe(value);
  });

  it("isSafeCssDeclaration requires both halves", () => {
    expect(isSafeCssDeclaration("--ds-a", "#fff")).toBe(true);
    expect(isSafeCssDeclaration("--evil", "#fff")).toBe(false);
    expect(isSafeCssDeclaration("--ds-a", "#fff; }")).toBe(false);
    expect(isSafeCssDeclaration("--ds-a", 12)).toBe(false);
  });
});

/**
 * The repeating-gradient class (D6-2c-i, 2026-09-15). Admission admitted
 * `repeating-linear-gradient` while this table did not, so the `micro-grid`
 * and `pinstripe` motif rows compiled into a channel the emitter dropped
 * without a trace. The values below are read from the expansion owner, not
 * copied, so the test measures the bytes the pipeline really emits.
 */
describe("the repeating gradient class is admitted at emission", () => {
  const TEXTURE_CHANNEL = "--ds-material-canvas-texture";
  const microGrid = expandExpressiveProfiles({ motif: "micro-grid" }).variables[TEXTURE_CHANNEL]!;
  const pinstripe = expandExpressiveProfiles({ motif: "pinstripe" }).variables[TEXTURE_CHANNEL]!;

  it("reads both real emitter values from the expansion rows", () => {
    expect(microGrid).toHaveLength(329);
    expect(microGrid.startsWith("repeating-linear-gradient(")).toBe(true);
    expect(microGrid.split("repeating-linear-gradient(")).toHaveLength(3);
    expect(pinstripe.startsWith("repeating-linear-gradient(90deg, ")).toBe(true);
  });

  it("admits the micro-grid value at both doors", () => {
    expect(isSafeCssValue(microGrid)).toBe(true);
    expect(isSafeVisualValue(microGrid, `emitted.${TEXTURE_CHANNEL}`, false)).toBe(true);
  });

  it("admits the pinstripe value at both doors", () => {
    expect(isSafeCssValue(pinstripe)).toBe(true);
    expect(isSafeVisualValue(pinstripe, `emitted.${TEXTURE_CHANNEL}`, false)).toBe(true);
  });

  it("admits a repeating radial gradient", () => {
    const radial =
      "repeating-radial-gradient(circle at 50% 50%, color-mix(in srgb, var(--ds-color-primary) 4%, transparent) 0 2px, transparent 2px 16px)";
    expect(isSafeCssValue(radial)).toBe(true);
    expect(isSafeVisualValue(radial, "emitted.--ds-material-canvas-texture", false)).toBe(true);
  });

  it("emits the texture channel with its authored string intact", () => {
    const admitted = admitCssVariables({
      "--ds-color-primary": "#1C3FBF",
      [TEXTURE_CHANNEL]: microGrid,
    });
    expect(Object.keys(admitted)).toEqual(["--ds-color-primary", TEXTURE_CHANNEL]);
    expect(admitted[TEXTURE_CHANNEL]).toBe(microGrid);
  });

  it("still refuses a fetch inside a repeating gradient, at any depth", () => {
    const fetching = "repeating-linear-gradient(0deg, url(x) 0 1px, transparent 1px 24px)";
    const nested =
      "repeating-linear-gradient(0deg, color-mix(in srgb, url(https://example.test/x.png) 2%, transparent) 0 1px, transparent 1px 24px)";
    for (const value of [fetching, nested]) {
      expect(isSafeCssValue(value)).toBe(false);
      expect(isSafeVisualValue(value, `emitted.${TEXTURE_CHANNEL}`, false)).toBe(false);
      expect(admitCssVariables({ [TEXTURE_CHANNEL]: value })).toEqual({});
    }
  });

  it("refuses repeating-conic-gradient on purpose: no emitter produces it", () => {
    const conic = "repeating-conic-gradient(from 0deg, #000 0 10deg, #fff 10deg 20deg)";
    expect(ALLOWED_VALUE_FUNCTIONS.has("repeating-conic-gradient")).toBe(false);
    expect(isSafeCssValue(conic)).toBe(false);
    expect(isSafeVisualValue(conic, `emitted.${TEXTURE_CHANNEL}`, false)).toBe(false);
  });
});

/**
 * One table for both doors. Admission's own copy is what let the two grammars
 * drift twice (saturate/linear one way, the repeating gradients the other), so
 * the table is imported from here and nowhere restated.
 */
describe("admission and emission share one function table", () => {
  // The admission grammar moved to the schema owner (S19-A01) so the v1
  // producers below the facade could read it. That owner is this one's SIBLING
  // under `compilers/kernel/foundation`, so the table it consumes moved down to
  // `foundation/kernel/css` where both may read it downward (S19-A01 repair).
  const TABLE_OWNER = resolve(
    process.cwd(),
    "src/foundation/kernel/css/value-functions/index.ts"
  );
  const GRAMMAR_OWNER = resolve(
    process.cwd(),
    "src/infrastructure/compilers/kernel/foundation/schemas/tenant-theme/index.ts"
  );
  const EMISSION_OWNER = resolve(process.cwd(), "src/infrastructure/compilers/kernel/foundation/css/value-safety/index.ts");
  const ADMISSION_OWNER = resolve(
    process.cwd(),
    "src/infrastructure/compilers/runtime/theme/facade/foundation/admission/runtime/limits/index.ts"
  );
  const TABLE_IMPORT = /import \{ ALLOWED_VALUE_FUNCTIONS \} from ['"]@\/foundation\/kernel\/css\/value-functions['"];/;

  it("both doors read the kernel table and no door declares one of its own", () => {
    const grammar = readFileSync(GRAMMAR_OWNER, "utf8");
    const emission = readFileSync(EMISSION_OWNER, "utf8");
    expect(grammar).toMatch(TABLE_IMPORT);
    expect(emission).toMatch(TABLE_IMPORT);
    for (const source of [
      grammar,
      emission,
      readFileSync(ADMISSION_OWNER, "utf8"),
    ]) {
      expect(source).not.toMatch(
        /ALLOWED_VALUE_FUNCTIONS\s*(?::[^=]+)?=\s*new Set\(/
      );
      expect(source.match(/new Set\(\[\s*"(?:rgb|linear-gradient)"/g) ?? []).toEqual(
        []
      );
    }
    expect(readFileSync(TABLE_OWNER, "utf8")).toMatch(
      /export const ALLOWED_VALUE_FUNCTIONS: ReadonlySet<string> = new Set\(\[/
    );
  });

  it("carries exactly the two repeating names and nothing beyond the table", () => {
    expect(ALLOWED_VALUE_FUNCTIONS.has("repeating-linear-gradient")).toBe(true);
    expect(ALLOWED_VALUE_FUNCTIONS.has("repeating-radial-gradient")).toBe(true);
    for (const name of ["url", "attr", "image", "image-set", "src", "element", "expression"]) {
      expect(ALLOWED_VALUE_FUNCTIONS.has(name), name).toBe(false);
    }
  });

  it("both doors answer alike for every name in the table, and for a name outside it", () => {
    const sample = (name: string): string =>
      name === "var" ? "var(--ds-color-primary)" : `${name}(1)`;
    for (const name of ALLOWED_VALUE_FUNCTIONS) {
      const value = sample(name);
      expect(isSafeCssValue(value), value).toBe(true);
      expect(isSafeVisualValue(value, "emitted.--ds-probe", false), value).toBe(true);
    }
    expect(isSafeCssValue("repeating-conic-gradient(1)")).toBe(false);
    expect(isSafeVisualValue("repeating-conic-gradient(1)", "emitted.--ds-probe", false)).toBe(false);
  });
});

/**
 * The safe-area class (WO-EVI-02). `env()` is the only honest value for the
 * two `--ds-action-dock-safe-area-*` channels, and the grammar dropped both in
 * silence. The name stays out of the shared function table on purpose: that
 * table is also the tenant publication vocabulary, so the bound is stated here
 * and nowhere else, and the publication door goes on refusing every `env()`.
 */
describe("the safe-area class is admitted at emission and bounded to four insets", () => {
  const EMITTED = [
    "var(--ds-safe-area-top, env(safe-area-inset-top, 0px))",
    "var(--ds-safe-area-bottom, env(safe-area-inset-bottom, 0px))",
  ] as const;

  const admitted: readonly [string, string][] = [
    ["the bare inset", "env(safe-area-inset-top)"],
    ["a cased inset, because CSS idents are case-insensitive", "env(Safe-Area-Inset-Top)"],
    ["every one of the four insets", "env(safe-area-inset-right)"],
    ["an inset with a length fallback", "env(safe-area-inset-bottom, 0px)"],
    ["an inset nested in calc", "calc(env(safe-area-inset-top) + 8px)"],
    ["an inset nested in var, the shape the dock really emits", EMITTED[0]],
    ["calc nested inside the fallback", "env(safe-area-inset-left, calc(1rem + 2px))"],
    ["a var fallback that carries its own comma", "env(safe-area-inset-top, var(--ds-spacing-2, 8px))"],
  ];

  for (const [label, value] of admitted) {
    it(`admits ${label}`, () => {
      expect(isSafeCssValue(value)).toBe(true);
    });
  }

  const refused: readonly [string, string][] = [
    ["an environment variable outside the four insets", "env(foo)"],
    ["a UA keyboard inset", "env(keyboard-inset-height)"],
    ["a titlebar area inset", "env(titlebar-area-height, 0px)"],
    ["an inset prefix that is not the whole name", "env(safe-area-inset-topmost)"],
    ["an empty argument list", "env()"],
    ["an empty fallback", "env(safe-area-inset-top,)"],
    ["a fetching fallback", "env(safe-area-inset-top, url(https://example.test/x.png))"],
    ["a rule-closing fallback", "env(safe-area-inset-top, 0px) } body { display: none } .x {"],
    ["an unknown function in the fallback", "env(safe-area-inset-top, evil(1))"],
    ["an unbalanced env", "env(safe-area-inset-top"],
    ["an over-closed env", "env(safe-area-inset-top))"],
    ["a hostile env nested inside an admitted one", "env(safe-area-inset-top, env(foo))"],
    ["a hostile env nested inside calc", "calc(env(foo) + 8px)"],
    ["an indexed environment variable", "env(safe-area-inset-top 0)"],
  ];

  for (const [label, value] of refused) {
    it(`refuses ${label}`, () => {
      expect(isSafeCssValue(value)).toBe(false);
    });
  }

  it("emits both dock channels with their authored strings intact", () => {
    const variables = {
      "--ds-action-dock-safe-area-top": EMITTED[0],
      "--ds-action-dock-safe-area-bottom": EMITTED[1],
    };
    expect(admitCssVariables(variables)).toEqual(variables);
  });

  it("keeps `env` out of the shared table, so the publication door still refuses it", () => {
    expect(ALLOWED_VALUE_FUNCTIONS.has("env")).toBe(false);
    for (const [, value] of admitted) {
      expect(isSafeVisualValue(value, "tenant.--ds-probe", true), value).toBe(false);
      expect(isSafeVisualValue(value, "emitted.--ds-probe", false), value).toBe(false);
    }
  });
});
