import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, relative, resolve } from "node:path";
import { gzipSync } from "node:zlib";

import { describe, expect, it } from "vitest";

import type { FirstPartyVerticalId } from "@/foundation/contracts/kernel/verticals";

import { compileTheme } from "../../../lowering";
import { staticThemeIntent } from "../../../ingress";
import { resolveAdapter } from "../../../../presentation/adapters";
import { emitTenantArtifactCss } from "../../artifact";
import { admitCssVariables } from "@/infrastructure/compilers/kernel/foundation/css/value-safety";
import {
  containerModeBlocks,
  containerScope,
  emitDeclarations,
  emitOverlayDeclarations,
  emitThemeCss,
  firstPartyScope,
} from "..";
import {
  CONTAINER_ALIAS_CONTEXTS,
  CONTAINER_ALIASES,
  CONTAINER_MODE_TEXTS,
  containerReach,
  ROOT_ALIASES,
  rootAliasRedeclarations,
  rootModeTexts,
  VERTICAL_OUTRIGHT,
} from "../root-aliases";
import { resolveFirstParty } from "@tests/support/theme-lowering";
import {
  FIRST_PARTY_ARTIFACT_SPECS,
  renderFirstPartyArtifact,
} from "@/infrastructure/compilers/runtime/tenant-css/artifact-renderer";
import {
  bundleCascade,
  deriveRootAliases,
  renderTable,
  rootOnlySelector,
  specificity,
  TABLE_PATH,
} from "../../../../../../../../../scripts/generate/root-aliases/index.mjs";

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

describe("a vertical's own element rules", () => {
  const collapse = (value: string) =>
    value.replace(/\s+/g, " ").replace(/\(\s/g, "(").replace(/\s\)/g, ")").trim();

  for (const slug of slugs) {
    it(`${slug}: the listed aliases are exactly the ones its compile states with other text`, () => {
      const compiled = compileTheme(resolveFirstParty(staticThemeIntent(slug)), modern);
      const divergent = new Set<string>();
      for (const block of [
        compiled.cssVariables,
        ...compiled.modeBlocks.map((mode) => mode.cssVariables),
        ...(compiled.contrastBlocks ?? []).map((contrast) => contrast.cssVariables),
      ]) {
        for (const [name, value] of Object.entries(admitCssVariables(block))) {
          if (TABLE.has(name) && collapse(value) !== TABLE.get(name)) divergent.add(name);
        }
      }
      expect(VERTICAL_OUTRIGHT[slug]).toEqual([...divergent].sort());
    });
  }

  it("a tenant of the vertical never restates them, and the chain runs on through them", () => {
    const css = emitTenantArtifactCss({
      verticalKey: "bithire",
      slug: "t",
      compilerVersion: "v",
      digest: "d",
      variables: { "--ds-color-info-400": "#010203", "--ds-color-info-500": "#040506" },
    });
    const [base] = rules(css);
    expect(VERTICAL_OUTRIGHT.bithire).toContain("--ds-color-info");
    expect(base?.names).not.toContain("--ds-color-info");
    expect(base?.names).toContain("--ds-button-info-bg");
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

describe("a container scope restates the left-out aliases its operands reach (N1-a)", () => {
  const compiled = (cssVariables: Record<string, string>) => ({
    cssVariables,
    modeBlocks: [],
    runtime: { personality: {}, tokenOverrides: {} },
  });
  const scope = containerScope("[data-sb]");

  it("a divergentRootText alias takes the cascade-winning root text in a container, never at a root door", () => {
    const container = emitThemeCss(compiled({ "--ds-shadow-sm": "none" }), scope, { container: {} });
    const [base] = rules(container);
    expect(container).toContain("  --ds-card-shadow: var(--_ds-personality-resolved-card-shadow, var(--ds-shadow-sm));\n");
    expect(base?.names).toContain("--ds-card-elevated-shadow");

    const door = emitThemeCss(compiled({ "--ds-shadow-sm": "none" }), firstPartyScope("bithire"));
    expect(door).not.toContain("--ds-card-shadow:");
    expect(door).toBe(emitThemeCss(compiled({ "--ds-shadow-sm": "none" }), firstPartyScope("bithire"), {}));
  });

  it("a contextVarying alias is re-emitted with its context rule, after the base rule", () => {
    const css = emitThemeCss(compiled({ "--ds-edge-standard-width": "0px" }), scope, { container: {} });
    const base = css.indexOf("[data-sb] {\n");
    const restated = css.indexOf("  --ds-button-border-width: var(--ds-edge-standard-width, 1px);\n");
    const context = css.indexOf(
      "@media (prefers-contrast: more) {\n:where(:root) [data-sb] {\n  --ds-button-border-width: 2px;\n}\n}"
    );
    expect(base).toBe(0);
    expect(restated).toBeGreaterThan(base);
    expect(context).toBeGreaterThan(restated);
  });

  it("a context that can match the scope itself is re-emitted on it as well as under it", () => {
    const lang = CONTAINER_ALIAS_CONTEXTS.find(
      (context) => context.name === "--ds-type-display-letter-spacing" && context.selector === ":lang(ar)"
    );
    expect(lang?.rootOnly).toBe(false);
    const css = emitThemeCss(compiled({ "--ds-letter-spacing-tight": "1px" }), scope, { container: {} });
    expect(css).toContain(
      ":where(:lang(ar)) [data-sb], [data-sb]:where(:lang(ar)) {\n  --ds-type-display-letter-spacing: 0;"
    );
  });

  it("a name the enclosing root states outright is never restated with root text", () => {
    const css = emitThemeCss(compiled({ "--ds-shadow-sm": "none" }), scope, {
      container: { outright: ["--ds-card-shadow"] },
    });
    expect(css).not.toContain("--ds-card-shadow:");
  });

  it("containerReach walks the enclosing texts first and the root aliases, left-out ones included, after", () => {
    const reached = containerReach(["--ds-focus-ring-offset"], {
      "--ds-avatar-focus-ring": "0 0 0 var(--ds-avatar-focus-ring-offset) red",
    });
    expect(reached.has("--ds-avatar-focus-ring-offset")).toBe(true);
    expect(reached.has("--ds-avatar-focus-ring")).toBe(true);
    expect(containerReach(["--ds-focus-ring-offset"], {}).has("--ds-avatar-focus-ring")).toBe(false);
  });
});

describe("a container scope's mode rules follow the document's mode", () => {
  const scope = containerScope("[data-sb]");
  const DARK_DOCUMENT = ":where(:where(:root, [data-ds-root]):is([data-theme='dark'], .dark)) [data-sb]";
  const compiled = (
    cssVariables: Record<string, string>,
    dark: Record<string, string>
  ) => ({
    cssVariables,
    modeBlocks: [{ mode: "dark" as const, colorScheme: "dark" as const, cssVariables: dark }],
    runtime: { personality: {}, tokenOverrides: {} },
  });

  it("a container's mode rule is the scope under a document in that mode, after the base and context rules", () => {
    const css = emitThemeCss(compiled({ "--ds-edge-standard-width": "0px" }, { "--ds-color-primary": "#010203" }), scope, {
      container: {},
    });
    expect(css).not.toContain("[data-sb][data-theme='dark']");
    const rule = css.indexOf(`${DARK_DOCUMENT} {\n  color-scheme: dark;\n  --ds-color-primary: #010203;\n}`);
    expect(rule).toBeGreaterThan(css.indexOf("@media (prefers-contrast: more)"));
  });

  it("the mode rule's readers re-resolve in the base rule, where the root doors restate them", () => {
    const css = emitThemeCss(compiled({}, { "--ds-color-primary": "#010203" }), scope, { container: {} });
    const [base] = rules(css);
    expect(base?.selector).toBe("[data-sb]");
    expect(base?.names).toContain("--ds-card-header-icon-color");
  });

  it("a root door keeps the mode hook on its own element, byte for byte", () => {
    const theme = compiled({ "--ds-color-primary": "#123456" }, { "--ds-color-primary": "#010203" });
    const door = emitThemeCss(theme, firstPartyScope("bithire"));
    expect(door).toContain("html[data-tenant='bithire'][data-theme='dark'], html[data-tenant='bithire'].dark {\n");
    expect(door).not.toContain(":where(:root, [data-ds-root])");
    const preview = emitThemeCss(theme, containerScope("[data-sb]"));
    expect(preview).toContain("[data-sb][data-theme='dark'], [data-sb].dark {\n");
  });

  describe("the contrast deltas keep the root's lattice by order (M4: base < contrast < mode < mode contrast)", () => {
    const theme = {
      cssVariables: { "--ds-x": "base" },
      modeBlocks: [{ mode: "dark" as const, colorScheme: "dark" as const, cssVariables: { "--ds-x": "dark" } }],
      contrastBlocks: [
        { cssVariables: { "--ds-x": "contrast-base" } },
        { mode: "dark" as const, cssVariables: { "--ds-x": "contrast-dark" } },
      ],
      runtime: { personality: {}, tokenOverrides: {} },
    };

    it("a container emits the mode-less delta before the mode rules and the mode-tagged delta after them", () => {
      const css = emitThemeCss(theme, scope, { container: {} });
      const contrastBase = css.indexOf("@media (prefers-contrast: more) {\n[data-sb] {\n  --ds-x: contrast-base;\n}\n}");
      const mode = css.indexOf(`${DARK_DOCUMENT} {\n  color-scheme: dark;\n  --ds-x: dark;\n}`);
      const contrastDark = css.indexOf(
        `@media (prefers-contrast: more) {\n${DARK_DOCUMENT} {\n  --ds-x: contrast-dark;\n}\n}`
      );
      expect(contrastBase).toBeGreaterThan(0);
      expect(mode).toBeGreaterThan(contrastBase);
      expect(contrastDark).toBeGreaterThan(mode);
    });

    it("a root door keeps one contrast rule after its mode rules, byte for byte", () => {
      const door = emitThemeCss(theme, firstPartyScope("bithire"));
      expect(door).toBe(
        [
          "html[data-tenant='bithire'] {\n  --ds-x: base;\n}",
          "html[data-tenant='bithire'][data-theme='dark'], html[data-tenant='bithire'].dark {\n  color-scheme: dark;\n  --ds-x: dark;\n}",
          "@media (prefers-contrast: more) {\nhtml[data-tenant='bithire'] {\n  --ds-x: contrast-base;\n}\n" +
            "html[data-tenant='bithire'][data-theme='dark'], html[data-tenant='bithire'].dark {\n  --ds-x: contrast-dark;\n}\n}",
        ].join("\n\n")
      );
    });
  });

  describe("containerModeBlocks", () => {
    const untouched = {
      cssVariables: { "--ds-color-primary": "#111111", "--ds-glow": "none", "--ds-ink": "#000000" },
      modeBlocks: [
        {
          mode: "dark" as const,
          colorScheme: "dark" as const,
          cssVariables: { "--ds-glow": "0 0 4px var(--ds-color-primary)", "--ds-ink": "#ffffff" },
        },
      ],
    };

    it("a stated channel whose mode value differs from its base text is restated in that mode", () => {
      const proposed = {
        cssVariables: { ...untouched.cssVariables, "--ds-color-primary": "#222222" },
        modeBlocks: [
          { ...untouched.modeBlocks[0]!, cssVariables: { ...untouched.modeBlocks[0]!.cssVariables, "--ds-color-primary": "#333333" } },
        ],
      };
      const [dark] = containerModeBlocks({ "--ds-color-primary": "#222222" }, proposed, untouched);
      expect(dark?.mode).toBe("dark");
      expect(dark?.cssVariables["--ds-color-primary"]).toBe("#333333");
    });

    it("a mode text that reads a stated operand its base text does not is carried in that mode", () => {
      const proposed = { ...untouched, cssVariables: { ...untouched.cssVariables, "--ds-color-primary": "#222222" } };
      const [dark] = containerModeBlocks({ "--ds-color-primary": "#222222" }, proposed, untouched);
      expect(dark?.cssVariables).toEqual({ "--ds-glow": "0 0 4px var(--ds-color-primary)" });
    });

    it("nothing moved in a mode and nothing stated: no mode block, never an invented channel", () => {
      expect(containerModeBlocks({}, untouched, untouched)).toEqual([]);
      const [dark] = containerModeBlocks({ "--ds-ink": "#000000" }, untouched, untouched);
      expect(dark?.cssVariables).toEqual({ "--ds-ink": "#ffffff" });
      expect(Object.keys(dark?.cssVariables ?? {})).not.toContain("--ds-unknown");
    });

    it("a DS root mode channel the scope states is restated with the DS root's mode text", () => {
      const [dark] = containerModeBlocks({ "--ds-color-neutral-900": "#171717" }, untouched, untouched);
      expect(dark?.cssVariables["--ds-color-neutral-900"]).toBe("#f8fafc");
      // What a dark document's root paints for the same channel: the DS dark block, no compile over it.
      expect(rootModeTexts("dark")["--ds-color-neutral-900"]).toBe("#f8fafc");
    });

    it("a DS root mode text that reads a stated channel is carried in that mode (M1 class c)", () => {
      const [dark] = containerModeBlocks({ "--ds-surface-card": "#101010" }, untouched, untouched);
      expect(dark?.cssVariables["--ds-table-bg"]).toBe("var(--ds-surface-card)");
      expect(dark?.cssVariables["--ds-table-row-bg"]).toBe("var(--ds-surface-card)");
      expect(dark?.cssVariables ?? {}).not.toHaveProperty("--ds-table-header-bg");
    });

    it("a DS channel a compile states keeps the compile's text: the vertical outranks the DS layer", () => {
      const [dark] = containerModeBlocks(
        { "--ds-color-neutral-900": "#171717" },
        { ...untouched, cssVariables: { ...untouched.cssVariables, "--ds-color-neutral-900": "#171717" } },
        untouched,
      );
      expect(dark?.cssVariables ?? {}).not.toHaveProperty("--ds-color-neutral-900");
    });

    it("a DS alias the base rule already restates with its mode text gets no mode rule", () => {
      const [dark] = containerModeBlocks({ "--ds-color-primary": "#222222" }, untouched, untouched);
      expect(dark?.cssVariables ?? {}).not.toHaveProperty("--ds-menu-item-bg-active");
    });
  });
});

describe("the DS root's own mode channels (CONTAINER_MODE_TEXTS)", () => {
  const derived = deriveRootAliases();
  const row = (name: string) => CONTAINER_MODE_TEXTS.find((entry) => entry.name === name);

  it("tables every name the base stylesheets declare under a root-state mode rule, none stopped", () => {
    expect(CONTAINER_MODE_TEXTS.length).toBe(161);
    expect(derived.modeTexts.stopped).toEqual({});
    const tabled = new Set([
      ...ROOT_ALIASES.map(([name]) => name),
      ...CONTAINER_ALIASES.map((alias) => alias.name),
      ...CONTAINER_ALIAS_CONTEXTS.map((context) => context.name),
    ]);
    expect(CONTAINER_MODE_TEXTS.filter((entry) => !tabled.has(entry.name)).length).toBe(116);
  });

  it("carries the cascade-winning text per mode, read from its site", () => {
    expect(row("--ds-color-neutral-900")).toEqual({
      name: "--ds-color-neutral-900",
      base: "#171717",
      light: "#171717",
      dark: "#f8fafc",
      sites: { base: "foundation/themes/default/index.css:62", dark: "foundation/themes/default/index.css:2107" },
    });
    expect(row("--ds-table-bg")).toMatchObject({ base: "#ffffff", dark: "var(--ds-surface-card)" });
    // The components layer's bare :root rule outranks the token layer's dark block.
    expect(row("--ds-card-bg")).toMatchObject({ dark: "var(--ds-color-bg-elevated)" });
    expect(row("--ds-card-bg")?.sites).toEqual({ base: "presentation/components/card/index.css:26" });
    expect(row("--ds-button-error-bg-hover")).toMatchObject({ base: "var(--ds-color-error-600)", dark: "var(--ds-color-error-400)" });
    expect(row("--ds-color-surface-muted")).toMatchObject({ base: null, dark: "#152033" });
    expect(rootModeTexts(null)["--ds-color-surface-muted"]).toBe("initial");
  });

  it("ranks the winner by layer, stops a mode rule under an at-rule, and never invents a text", () => {
    const repo = resolve(TABLE_PATH.split("/packages/core/")[0] as string);
    const dir = mkdtempSync(join(tmpdir(), "root-mode-texts-"));
    writeFileSync(
      join(dir, "theme.css"),
      [
        ":root { --a: #111; --b: #222; --m: #333; }",
        ":root[data-theme='dark'] { --a: #eee; --b: #ddd; }",
        "@media (prefers-color-scheme: dark) { :root[data-theme='dark'] { --m: #444; } }",
      ].join("\n") + "\n",
    );
    writeFileSync(join(dir, "comp.css"), ":root { --b: #bbb; }\n");
    writeFileSync(join(dir, "entry.css"), '@layer t, c;\n@import "./theme.css" layer(t);\n@import "./comp.css" layer(c);\n');
    const file = (name: string) => relative(repo, join(dir, name));
    const pin = (channel: string, name: string, line: number) => ({ channel, file: file(name), line });
    const artifact = {
      edges: [],
      digests: {},
      literalPins: [
        pin("--a", "theme.css", 1), pin("--b", "theme.css", 1), pin("--m", "theme.css", 1),
        pin("--a", "theme.css", 2), pin("--b", "theme.css", 2), pin("--m", "theme.css", 3),
        pin("--b", "comp.css", 1),
      ],
    };
    const { modeTexts } = deriveRootAliases(artifact, bundleCascade(join(dir, "entry.css")));
    expect(modeTexts.texts.map((entry: { name: string }) => entry.name)).toEqual(["--a", "--b"]);
    expect(modeTexts.texts[0]).toMatchObject({ base: "#111", light: "#111", dark: "#eee" });
    expect(modeTexts.texts[1]).toMatchObject({ base: "#bbb", dark: "#bbb" });
    expect(Object.keys(modeTexts.stopped)).toEqual(["--m"]);
  });
});

describe("the mode table and the context table never contest a name (M4)", () => {
  // A container's mode rules follow its context rules at equal weight, so a
  // mode-table name that also had a context rule would let the mode rule
  // outrank it by order. Today the only contexts the two tables share are the
  // DS's own plain dark rules, and those carry the table's dark text, so a mode
  // rule can only restate them. A regen that breaks either fact stops here.
  const modeRow = new Map(CONTAINER_MODE_TEXTS.map((row) => [row.name, row]));
  const isDarkContext = (selector: string) => /\[data-theme='dark'\]/.test(selector) && /\.dark\b/.test(selector);
  const shared = CONTAINER_ALIAS_CONTEXTS.filter((context) => modeRow.has(context.name));

  it("no mode-table name has an at-rule, density, :lang or other non-mode context", () => {
    const contested = shared.filter((context) => context.at.length > 0 || !isDarkContext(context.selector));
    expect(contested.map((context) => `${context.name} @ ${context.at.join(" ")} ${context.selector}`)).toEqual([]);
  });

  it("every dark context is a mode-table name carrying the table's dark text", () => {
    const dark = CONTAINER_ALIAS_CONTEXTS.filter((context) => isDarkContext(context.selector));
    expect(dark.length).toBe(32);
    expect(shared.length).toBe(32);
    const drift = dark.filter((context) => modeRow.get(context.name)?.dark !== context.value);
    expect(drift.map((context) => `${context.name}: ${context.value} vs ${modeRow.get(context.name)?.dark}`)).toEqual([]);
  });
});

describe("the cascade winner among a left-out alias's root texts", () => {
  it("ranks layer, then specificity, then bundle order", () => {
    const dir = mkdtempSync(join(tmpdir(), "root-aliases-"));
    writeFileSync(join(dir, "low.css"), ":root { --x: low; }\n");
    writeFileSync(join(dir, "high.css"), ":root { --x: high; }\n");
    writeFileSync(join(dir, "plain.css"), ":root { --x: plain; }\n");
    writeFileSync(
      join(dir, "entry.css"),
      '@layer a, b;\n@import "./high.css" layer(b);\n@import "./low.css" layer(a);\n@import "./plain.css";\n'
    );
    const { layers, files } = bundleCascade(join(dir, "entry.css"));
    const at = (name: string) => [...files].find(([file]) => file.endsWith(`/${name}`))?.[1];
    expect(layers).toEqual(["a", "b"]);
    expect(at("high.css")).toMatchObject({ layer: "b", order: 0 });
    expect(at("low.css")).toMatchObject({ layer: "a", order: 1 });
    expect(at("plain.css")).toMatchObject({ layer: null, order: 2 });
    expect(specificity(":root[data-theme='dark'], html.dark")).toEqual([0, 2, 0]);
    expect(specificity(":where(:root, [data-ds-root]):is([data-theme='dark'], .dark)")).toEqual([0, 1, 0]);
    expect(specificity("html[lang]:lang(ar)")).toEqual([0, 2, 1]);
    expect(rootOnlySelector("html[lang]:lang(ar)")).toBe(true);
    expect(rootOnlySelector(":where(:root, [data-ds-root]):is([data-theme='dark'], .dark)")).toBe(false);
  });

  it("the personality layer outranks the token layer; within one layer the later file wins", () => {
    const winner = (name: string) => CONTAINER_ALIASES.find((alias) => alias.name === name);
    expect(winner("--ds-card-shadow")).toMatchObject({
      exclusion: "divergentRootText",
      site: "runtime/personality/index.css:40",
    });
    expect(winner("--ds-shadow-focus-ring")?.site).toBe("foundation/themes/default/index.css:841");
    expect(CONTAINER_ALIASES.length).toBe(deriveRootAliases().excluded.contextVarying.length + deriveRootAliases().excluded.divergentRootText.length);
  });
});
