/**
 * Contract for the font-pack registry (W4-B1).
 *
 * Pins the FONT_PACK_MANIFEST shape, that every declared face file exists on
 * disk, that every @font-face carries font-display: swap, and that each pack css
 * defines its --ds-font-pack-<id> custom property in :root with exactly the
 * family list the manifest advertises as its fallbackStack.
 */
import { existsSync, readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { FIRST_PARTY_VERTICAL_ROSTER } from "@/foundation/presets/verticals/roster";
import {
  FONT_PACK_MANIFEST,
  FONT_PACK_IDS,
} from "../manifest/index";

const packsDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const coreRoot = resolve(packsDir, "../../../../../../../");

const EXPECTED_IDS = [
  "arabic-text",
  "editorial-display",
  "editorial-text",
  "geometric-display",
  "grotesk-display",
  "humanist-text",
  "plex-mono",
];

function packCss(id: string): string {
  return readFileSync(resolve(packsDir, id, "index.css"), "utf8");
}

describe("FONT_PACK_MANIFEST shape", () => {
  it("registers exactly the catalogued packs", () => {
    expect([...FONT_PACK_IDS].sort()).toEqual(EXPECTED_IDS);
  });

  it("gives every entry a well-formed shape", () => {
    for (const id of FONT_PACK_IDS) {
      const entry = FONT_PACK_MANIFEST[id];
      expect(entry.id, id).toBe(id);
      expect(["display", "text", "mono", "script"]).toContain(entry.role);
      expect(entry.cssSubpath).toBe(`@rottay/design-system/fonts/${id}.css`);
      expect(entry.variable).toBe(`--ds-font-pack-${id}`);
      expect(entry.fallbackStack.length).toBeGreaterThan(0);
      expect(entry.files.length).toBeGreaterThan(0);
      for (const face of entry.files) {
        expect(face.path.startsWith("./"), `${id} path`).toBe(true);
        expect(face.path.endsWith(".woff2"), `${id} woff2`).toBe(true);
        expect(face.family.length).toBeGreaterThan(0);
        expect(String(face.weight)).toMatch(/^\d{3}( \d{3})?$/);
        expect(face.style).toBe("normal");
        expect(typeof face.variable).toBe("boolean");
      }
    }
  });

  it("ships every declared face binary as a real woff2 (wOF2 signature)", () => {
    for (const id of FONT_PACK_IDS) {
      for (const face of FONT_PACK_MANIFEST[id].files) {
        const abs = resolve(packsDir, id, face.path);
        expect(existsSync(abs), `${id} ${face.path}`).toBe(true);
        const sig = readFileSync(abs).subarray(0, 4).toString("latin1");
        expect(sig, `${id} ${face.path} signature`).toBe("wOF2");
      }
    }
  });
});

describe("font-pack css", () => {
  it("defines --ds-font-pack-<id> in :root matching the manifest fallbackStack", () => {
    for (const id of FONT_PACK_IDS) {
      const css = packCss(id);
      const entry = FONT_PACK_MANIFEST[id];
      const decl = new RegExp(
        `${entry.variable.replace(/[-]/g, "\\-")}\\s*:\\s*([^;]+);`
      ).exec(css);
      expect(decl, `${id} declares its var`).not.toBeNull();
      expect(decl![1].replace(/\s+/g, " ").trim()).toBe(entry.fallbackStack);
    }
  });

  it("carries font-display: swap on every @font-face", () => {
    for (const id of FONT_PACK_IDS) {
      const css = packCss(id);
      const faces = css.match(/@font-face\s*\{[^}]*\}/g) ?? [];
      expect(faces.length, `${id} has faces`).toBeGreaterThan(0);
      for (const face of faces) {
        expect(/font-display\s*:\s*swap/.test(face), `${id} face swap`).toBe(true);
      }
    }
  });

  it("references only the face files the manifest declares", () => {
    for (const id of FONT_PACK_IDS) {
      const css = packCss(id);
      const urls = [...css.matchAll(/url\(\s*'([^']+)'\s*\)/g)].map((m) => m[1]);
      const declared = FONT_PACK_MANIFEST[id].files.map((f) => f.path);
      expect(new Set(urls)).toEqual(new Set(declared));
    }
  });
});

describe("first-party vertical font ownership", () => {
  const readBundle = (name: string): string =>
    readFileSync(
      resolve(coreRoot, "artifacts/generated/css/verticals", name.replace(/\.css$/u, ''), "index.css"),
      "utf8",
    );

  it("projects each roster row's exact font-pack ownership into its bundle", () => {
    for (const row of FIRST_PARTY_VERTICAL_ROSTER) {
      const css = readBundle(row.bundleFile);
      // Read as plain strings: a roster row declares a subset of the manifest,
      // and a pack no row declares must assert expected=false.
      const packs: readonly string[] = row.fontPacks;
      for (const id of FONT_PACK_IDS) {
        const expected = packs.includes(id);
        for (const face of FONT_PACK_MANIFEST[id].files) {
          expect(
            css.includes(`url('./fonts/${face.path.slice(2)}')`),
            `${row.slug} ${id} ${face.path}`,
          ).toBe(expected);
        }
      }
    }
  });

  // This arm FLIPPED. It was written to assert that NO vertical bundle shipped
  // arabic-text, because 8ae785f1e landed the pack deliberately unrostered.
  // Rostering it on all three is the measured intent here: the pack is coverage,
  // not a style choice -- it carries the family withArabicSafeFallback already
  // compiles into every base/heading/display stack, so a bundle without it makes
  // that tail a bet on a system install. It is free for a latin page because the
  // face is unicode-range-gated, which the next assertion measures in the bundle
  // rather than trusting from the pack source.
  it("ships the arabic-text face in every vertical bundle, range-gated", () => {
    const [face] = FONT_PACK_MANIFEST["arabic-text"].files;
    for (const row of FIRST_PARTY_VERTICAL_ROSTER) {
      expect(row.fontPacks, `${row.slug} roster`).toContain("arabic-text");
      const css = readBundle(row.bundleFile);
      expect(
        css.includes(`url('./fonts/${face.path.slice(2)}')`),
        `${row.slug} arabic face`,
      ).toBe(true);
      const block = /@font-face\s*\{[^}]*Noto Sans Arabic[^}]*\}/.exec(css);
      expect(block, `${row.slug} arabic @font-face`).not.toBeNull();
      expect(block![0], `${row.slug} arabic range`).toMatch(/U\+0600-06FF/);
      expect(block![0], `${row.slug} latin range`).not.toMatch(/U\+0000-00FF/);
    }
  });
});
