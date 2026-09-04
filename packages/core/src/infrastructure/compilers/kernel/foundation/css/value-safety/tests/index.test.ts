/**
 * The single admission grammar for CSS text, tested at the boundary itself.
 *
 * Every productive emitter routes through `admitCssVariables`, so a hole here
 * is a hole in the first-party artifact, the DB artifact, the brand-studio
 * preview and the tenant preview at once.
 */

import { describe, expect, it } from "vitest";

import {
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
