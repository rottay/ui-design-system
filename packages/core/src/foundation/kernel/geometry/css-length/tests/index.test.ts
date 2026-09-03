import { describe, expect, it } from "vitest";

import {
  cssLengthToPx,
  dialedCssLengthToPx,
  dimensionToPx,
  PX_PER_ROOT_EM,
} from "..";

describe("dimensionToPx keeps the tenant validator's convention", () => {
  it("treats unitless and px as px", () => {
    expect(dimensionToPx(12, "")).toBe(12);
    expect(dimensionToPx(12, "px")).toBe(12);
    expect(dimensionToPx(0, "px")).toBe(0);
    expect(dimensionToPx(-4, "px")).toBe(-4);
  });

  it("multiplies rem and em by the root em", () => {
    expect(PX_PER_ROOT_EM).toBe(16);
    expect(dimensionToPx(0.5, "rem")).toBe(8);
    expect(dimensionToPx(0.5, "em")).toBe(8);
    expect(dimensionToPx(1, "rem")).toBe(16);
  });

  it("refuses every other unit rather than defaulting", () => {
    for (const unit of ["%", "vh", "vw", "ch", "pt", "deg", "s", "fr"]) {
      expect(dimensionToPx(10, unit)).toBeNull();
    }
  });

  it("refuses a non-finite magnitude", () => {
    expect(dimensionToPx(Number.NaN, "px")).toBeNull();
    expect(dimensionToPx(Number.POSITIVE_INFINITY, "rem")).toBeNull();
  });
});

describe("cssLengthToPx parses one complete dimension, never a prefix", () => {
  it("converts the authored spellings", () => {
    expect(cssLengthToPx("10px")).toBe(10);
    expect(cssLengthToPx("10")).toBe(10);
    expect(cssLengthToPx("0.5rem")).toBe(8);
    expect(cssLengthToPx(".5rem")).toBe(8);
    expect(cssLengthToPx("1.5em")).toBe(24);
    expect(cssLengthToPx("  12px  ")).toBe(12);
    expect(cssLengthToPx("+8px")).toBe(8);
    expect(cssLengthToPx("-8px")).toBe(-8);
    expect(cssLengthToPx("0.5REM")).toBe(8);
  });

  it("never lets parseFloat turn a rem into a px", () => {
    // The exact defect this owner exists to close.
    expect(Number.parseFloat("0.5rem")).toBe(0.5);
    expect(cssLengthToPx("0.5rem")).toBe(8);
  });

  it("refuses anything that is not exactly one dimension", () => {
    for (const value of [
      "50%",
      "var(--elsewhere)",
      "10px 4px",
      "calc(10px + 2px)",
      "clamp(4px, 1vw, 12px)",
      "inherit",
      "initial",
      "",
      "   ",
      "px",
      "10px)",
      "1e2px",
    ]) {
      expect(cssLengthToPx(value)).toBeNull();
    }
  });
});

describe("dialedCssLengthToPx undoes the compiler's dialed operand", () => {
  it("passes a bare length straight through", () => {
    expect(dialedCssLengthToPx("10px")).toBe(10);
    expect(dialedCssLengthToPx("0.5rem")).toBe(8);
  });

  it("divides the dialed form by its divisor, in every supported unit", () => {
    expect(dialedCssLengthToPx("calc(10px / 1.25)")).toBe(8);
    expect(dialedCssLengthToPx("calc(0.5rem / 1.25)")).toBe(6.4);
    expect(dialedCssLengthToPx("calc(1em / 2)")).toBe(8);
    expect(dialedCssLengthToPx("calc(10 / 2)")).toBe(5);
    expect(dialedCssLengthToPx("calc(  10px  /  2  )")).toBe(5);
  });

  it("round-trips: authored / scale * scale is the authored px", () => {
    for (const [authored, scale] of [
      ["0.5rem", 1.25],
      ["10px", 1.4],
      ["1.25rem", 0.8],
    ] as const) {
      const operand = `calc(${authored} / ${scale})`;
      expect((dialedCssLengthToPx(operand) as number) * scale).toBeCloseTo(
        cssLengthToPx(authored) as number,
        10
      );
    }
  });

  it("refuses a zero or unusable divisor", () => {
    expect(dialedCssLengthToPx("calc(10px / 0)")).toBeNull();
    expect(dialedCssLengthToPx("calc(10px / -0)")).toBeNull();
    expect(dialedCssLengthToPx("calc(10px / scale)")).toBeNull();
    expect(dialedCssLengthToPx("calc(10px / var(--ds-radius-scale))")).toBeNull();
  });

  it("refuses an operand that is not one dimension over one divisor", () => {
    for (const value of [
      "calc(var(--x) / 2)",
      "calc(50% / 2)",
      "calc(10px / 1.25 / 2)",
      "calc(10px * 2)",
      "calc(10px)",
      "min(10px, 2vw)",
      "var(--elsewhere)",
    ]) {
      expect(dialedCssLengthToPx(value)).toBeNull();
    }
  });
});
