/**
 * Byte oracle for the lowering: the committed first-party artifacts.
 *
 * The artifacts are tracked build outputs produced before this pipeline
 * existed, so they are the one oracle in the repository that this code cannot
 * have written. Every compiled channel and every mode-block channel the
 * artifact declares must still compile to the same value from the same authored
 * theme; a lowering that quietly changed a derivation shows up here as a value
 * diff rather than as a passing self-comparison.
 */

import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { FIRST_PARTY_THEMES } from "@/foundation/tokens/ts/presentation/brand-themes";
import type { FirstPartyVerticalId } from "@/foundation/contracts/kernel/verticals";

import { resolveTheme } from "../../resolution";
import { resolveAdapter } from "../../../presentation/adapters";
import { compileTheme } from "..";

const ARTIFACTS = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../../../../../../../foundation/tokens/css/facade/artifacts"
);
const modern = resolveAdapter("modern");
const SLUGS: readonly FirstPartyVerticalId[] = ["rottay", "bithire", "evnto"];

/** Every `--ds-*` declaration inside the artifact block whose selector matches. */
function declarations(css: string, selectorTest: (selector: string) => boolean) {
  const found = new Map<string, string>();
  const blocks = css.split("}");
  for (const block of blocks) {
    const open = block.lastIndexOf("{");
    if (open === -1) continue;
    const selector = block.slice(0, open).split("*/").pop()!.trim();
    if (!selectorTest(selector)) continue;
    for (const line of block.slice(open + 1).split("\n")) {
      const match = /^\s*(--[a-zA-Z0-9-]+)\s*:\s*(.+);\s*$/u.exec(line);
      if (match) found.set(match[1], match[2].trim());
    }
  }
  return found;
}

describe("the lowering reproduces the committed artifact channels", () => {
  for (const slug of SLUGS) {
    const css = readFileSync(resolve(ARTIFACTS, slug, "index.css"), "utf-8");

    it(`${slug}: every base-block channel compiles to the artifact's value`, () => {
      const compiled = compileTheme(resolveTheme(FIRST_PARTY_THEMES[slug]), modern);
      const artifact = declarations(
        css,
        (selector) => selector.includes(`data-tenant='${slug}'`) && !selector.includes("data-theme")
      );
      expect(artifact.size).toBeGreaterThan(100);
      const drift: string[] = [];
      for (const [channel, value] of artifact) {
        const actual = compiled.cssVariables[channel];
        if (actual !== value) drift.push(`${channel}: artifact=${value} compiled=${actual}`);
      }
      expect(drift).toEqual([]);
    });

    it(`${slug}: every artifact channel is still produced by the lowering`, () => {
      const compiled = compileTheme(resolveTheme(FIRST_PARTY_THEMES[slug]), modern);
      const artifact = declarations(
        css,
        (selector) => selector.includes(`data-tenant='${slug}'`) && !selector.includes("data-theme")
      );
      const missing = [...artifact.keys()].filter(
        (channel) => compiled.cssVariables[channel] === undefined
      );
      expect(missing).toEqual([]);
    });

    it(`${slug}: each authored mode block compiles to the artifact's mode values`, () => {
      const compiled = compileTheme(resolveTheme(FIRST_PARTY_THEMES[slug]), modern);
      for (const block of compiled.modeBlocks) {
        const artifact = declarations(
          css,
          (selector) =>
            selector.includes(`data-tenant='${slug}'`) &&
            selector.includes(`data-theme='${block.mode}'`)
        );
        expect(artifact.size).toBeGreaterThan(0);
        const drift: string[] = [];
        for (const [channel, value] of artifact) {
          const actual = block.cssVariables[channel];
          if (actual !== value) drift.push(`${block.mode} ${channel}: artifact=${value} compiled=${actual}`);
        }
        expect(drift).toEqual([]);
      }
    });
  }
});
