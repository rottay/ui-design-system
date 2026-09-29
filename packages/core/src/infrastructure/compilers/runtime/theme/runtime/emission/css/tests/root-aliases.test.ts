import { readFileSync, writeFileSync } from "node:fs";
import { gzipSync } from "node:zlib";

import { describe, expect, it } from "vitest";

import type { FirstPartyVerticalId } from "@/foundation/contracts/kernel/verticals";

import { compileTheme } from "../../../lowering";
import { staticThemeIntent } from "../../../ingress";
import { resolveAdapter } from "../../../../presentation/adapters";
import { emitTenantArtifactCss } from "../../artifact";
import { emitDeclarations, emitOverlayDeclarations, emitThemeCss, firstPartyScope } from "..";
import { ROOT_ALIASES, rootAliasRedeclarations } from "../root-aliases";
import { resolveFirstParty } from "@tests/support/theme-lowering";
import {
  FIRST_PARTY_ARTIFACT_SPECS,
  renderFirstPartyArtifact,
} from "@/infrastructure/compilers/runtime/tenant-css/artifact-renderer";
// @ts-expect-error untyped generator module
import { deriveRootAliases, renderTable, TABLE_PATH } from "../../../../../../../../../scripts/generate/root-aliases/index.mjs";

const modern = resolveAdapter("modern");
const slugs: readonly FirstPartyVerticalId[] = ["rottay", "bithire", "evnto"];
const TABLE = new Map(ROOT_ALIASES.map(([name, value]) => [name, value]));
const readsOf = (value: string) => [...value.matchAll(/var\(\s*(--[\w-]+)/g)].map((m) => m[1] as string);

function rules(css: string): { selector: string; names: string[] }[] {
  return [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map((match) => ({
    selector: (match[1] as string).trim(),
    names: [...(match[2] as string).matchAll(/^\s*(--[\w-]+)\s*:/gm)].map((m) => m[1] as string),
  }));
}

describe("the root-alias table", () => {
  it("is the cascade edges artifact's projection, byte for byte", () => {
    expect(readFileSync(TABLE_PATH, "utf8")).toBe(renderTable(deriveRootAliases()));
  });

  it("lists every alias after every tabled alias it reads", () => {
    const seen = new Set<string>();
    const late: string[] = [];
    for (const [name, value] of ROOT_ALIASES) {
      for (const operand of readsOf(value)) {
        if (TABLE.has(operand) && operand !== name && !seen.has(operand)) late.push(`${name} <- ${operand}`);
      }
      seen.add(name);
    }
    expect(late).toEqual([]);
    expect(ROOT_ALIASES.length).toBeGreaterThan(2000);
  });

  it("carries the Card corner chain in dependency order", () => {
    const at = (name: string) => ROOT_ALIASES.findIndex(([row]) => row === name);
    expect(TABLE.get("--ds-card-border-radius")).toBe("var(--ds-radius-lg)");
    expect(TABLE.get("--ds-card-radius")).toBe("var(--ds-card-border-radius)");
    expect(at("--ds-radius-lg")).toBeLessThan(at("--ds-card-border-radius"));
    expect(at("--ds-card-border-radius")).toBeLessThan(at("--ds-card-radius"));
  });
});

describe("a scope restates the root aliases its operands re-resolve", () => {
  it("a chain re-resolves transitively, in table order", () => {
    const restated = Object.keys(rootAliasRedeclarations(["--ds-radius-lg-base"], new Set()));
    expect(restated).not.toContain("--ds-radius-md");
    expect(restated.indexOf("--ds-radius-lg")).toBeLessThan(restated.indexOf("--ds-card-border-radius"));
    expect(restated.indexOf("--ds-card-border-radius")).toBeLessThan(restated.indexOf("--ds-card-radius"));
  });

  it("an outright statement wins, and the chain still runs through it", () => {
    const lines = emitDeclarations({ "--ds-radius-lg-base": "8px", "--ds-card-border-radius": "3px" });
    expect(lines.filter((line) => line.startsWith("  --ds-card-border-radius:"))).toEqual([
      "  --ds-card-border-radius: 3px;",
    ]);
    expect(lines).toContain("  --ds-card-radius: var(--ds-card-border-radius);");
  });

  it("an overlay block restates nothing", () => {
    expect(emitOverlayDeclarations({ "--ds-radius-scale": "1.2" })).toEqual(["  --ds-radius-scale: 1.2;"]);
  });
});

describe("byte identity: a scope that moves no operand emits nothing extra", () => {
  const artifact = (variables: Record<string, string>) =>
    emitTenantArtifactCss({ verticalKey: "bithire", slug: "t", compilerVersion: "v", digest: "d", variables });

  it("an empty DB delta emits an empty base rule", () => {
    expect(artifact({})).toContain(`[data-tenant="t"] {\n\n}`);
  });

  it("a DB delta whose channels no root alias reads is unchanged", () => {
    const unread = { "--ds-probe-unread-channel": "1px" };
    expect(artifact(unread)).toContain(`{\n${emitOverlayDeclarations(unread).join("\n")}\n}`);
  });

  it("a mode-only delta restates its readers in the base rule, never in the mode rule", () => {
    const css = emitTenantArtifactCss({
      verticalKey: "bithire",
      slug: "t",
      compilerVersion: "v",
      digest: "d",
      variables: {},
      modeDeltas: [{ mode: "dark", variables: { "--ds-color-primary": "#010203" } }],
    });
    const [base, dark] = rules(css);
    expect(base?.names).toContain("--ds-checkbox-primary-bg");
    expect(dark?.names).toEqual(["--ds-color-primary"]);
  });
});

describe("the first-party artifacts: only the base rule gains lines, and only reached aliases", () => {
  const measured: Record<string, unknown> = {};

  for (const slug of slugs) {
    it(`${slug}`, () => {
      const compiled = compileTheme(resolveFirstParty(staticThemeIntent(slug)), modern);
      const css = emitThemeCss(compiled, firstPartyScope(slug));
      const [base, ...rest] = rules(css);
      const own = new Set(Object.keys(compiled.cssVariables));
      const stated = new Set([
        ...own,
        ...compiled.modeBlocks.flatMap((block) => Object.keys(block.cssVariables)),
        ...(compiled.contrastBlocks ?? []).flatMap((block) => Object.keys(block.cssVariables)),
      ]);
      const added = (base?.names ?? []).filter((name) => !own.has(name));
      const reached = new Set(stated);
      const unreached = added.filter((name) => {
        const value = TABLE.get(name);
        const ok = value !== undefined && readsOf(value).some((operand) => reached.has(operand));
        reached.add(name);
        return !ok;
      });
      expect(unreached).toEqual([]);
      expect(added.length).toBeGreaterThan(0);

      for (const rule of rest) {
        const block =
          compiled.modeBlocks.find((mode) => rule.selector.includes(`'${mode.mode}'`))?.cssVariables ??
          compiled.densityScopeBlock?.cssVariables ??
          {};
        expect(rule.names.filter((name) => !(name in block))).toEqual([]);
      }

      const lines = added.map((name) => `  ${name}: ${TABLE.get(name)};\n`).join("");
      const spec = FIRST_PARTY_ARTIFACT_SPECS.find((candidate) => candidate.slug === slug);
      const rendered = spec ? renderFirstPartyArtifact({ spec }).css : "";
      const withoutLines = rendered.split(lines).join("");
      measured[slug] = {
        restatedAliases: added.length,
        artifactBytes: rendered.length,
        bytesAdded: rendered.length - withoutLines.length,
        gzipAdded: gzipSync(rendered).length - gzipSync(withoutLines).length,
        gzipTotal: gzipSync(rendered).length,
      };
      if (process.env.ROOT_ALIAS_BYTES_OUT) {
        writeFileSync(process.env.ROOT_ALIAS_BYTES_OUT, `${JSON.stringify(measured, null, 2)}\n`);
      }
    });
  }
});
