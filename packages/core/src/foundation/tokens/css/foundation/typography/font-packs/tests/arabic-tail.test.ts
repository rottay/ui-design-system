/**
 * The DS-A007 Arabic-safe tail names a family the package now SHIPS.
 *
 * `withArabicSafeFallback` compiles "Noto Sans Arabic" into every
 * --ds-font-family-base/heading/display stack of every tenant and vertical
 * artifact. Until the arabic-text pack existed that family was a bet on a
 * system install: the invariant's checker passed on the string while the
 * browser fell through to the generic sans-serif the invariant exists to
 * prevent. These assertions pin the two halves to each other, so renaming the
 * mandatory family or the pack's @font-face breaks here rather than silently
 * in an Arabic page.
 */
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  MANDATORY_FALLBACK_FONT_CHANNELS,
  MANDATORY_FONT_FALLBACK_FAMILY,
  hasMandatoryFontFallback,
  withArabicSafeFallback,
} from "@/foundation/kernel/typography";
import { FONT_PACK_MANIFEST } from "../manifest/index";

const packsDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const entry = FONT_PACK_MANIFEST["arabic-text"];
const css = readFileSync(resolve(packsDir, "arabic-text/index.css"), "utf8");

const unquote = (family: string): string => family.replace(/^["']|["']$/g, "");

describe("arabic-text pack backs the DS-A007 tail", () => {
  it("declares a face under exactly the mandatory family name", () => {
    const declared = entry.files.map((face) => face.family);
    expect(declared).toContain(unquote(MANDATORY_FONT_FALLBACK_FAMILY));
    expect(css).toContain(
      `font-family: '${unquote(MANDATORY_FONT_FALLBACK_FAMILY)}';`
    );
  });

  it("satisfies the invariant checker with its own fallback stack", () => {
    expect(hasMandatoryFontFallback(entry.fallbackStack)).toBe(true);
    expect(withArabicSafeFallback(entry.fallbackStack)).toBe(entry.fallbackStack);
  });

  it("resolves the family every mandatory channel already carries", () => {
    for (const channel of MANDATORY_FALLBACK_FONT_CHANNELS) {
      const compiled = withArabicSafeFallback("'Public Sans', sans-serif");
      expect(hasMandatoryFontFallback(compiled), channel).toBe(true);
      expect(
        entry.files.some((face) => compiled.includes(face.family)),
        channel
      ).toBe(true);
    }
  });

  it("gates the download on the Arabic ranges instead of loading for latin pages", () => {
    expect(css).toMatch(/unicode-range:/);
    expect(css).toMatch(/U\+0600-06FF/);
    expect(css).not.toMatch(/U\+0000-00FF/);
  });
});
