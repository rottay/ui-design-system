/**
 * `chrome.collapse.border` is the panel border COLOUR. It lowers to
 * `--ds-collapse-border-color`, the name the frozen engines already read as a
 * colour, and the Modern skin reads the same name as the colour operand of the
 * bordered panel. A tenant that authors nothing keeps the resting border.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import postcss from "postcss";
import { describe, expect, it } from "vitest";

import type { BrandCollapseChrome, FlatTheme } from "@/foundation/contracts/composition/tenants/themes";
import { compileThemeIntent, emitThemeCss, firstPartyScope, staticThemeIntent } from "@/entrypoints/server";
import {
  compileTenantThemeConfig,
  getTenantThemeVerticalEnvelope,
  hydrateTenantThemeConfig,
} from "@/infrastructure/compilers/composition/tenant-theme";
import { chromeToVariables } from "@/infrastructure/compilers/kernel/foundation/css/chrome-variables";
import { compileFlatThemeThroughDoor } from "@tests/support/theme-door";
import { collapseChromeDeriver } from "..";

const VERTICALS = ["rottay", "bithire", "evnto"] as const;
type Vertical = (typeof VERTICALS)[number];

const CHANNEL = "--ds-collapse-border-color";
const KEY_DERIVED = "--ds-collapse-border";
const AUTHORED = "#ff00aa";
/** The colour operand the bordered panel declared before the tenant channel was read. */
const REST = "var(--ds-collapse-root-default-idle-border-color, var(--ds-color-border))";

const CSS_ROOT = resolve(process.cwd(), "src/foundation/tokens/css/runtime/engines");
const source = (path: string) => readFileSync(resolve(CSS_ROOT, path), "utf8");
const stripComments = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, "");

const MODERN = source("modern/skin/collapse/index.css");
const CLASSIC = stripComments(source("classic/theme/index.css"));
const RUSTIC = stripComments(source("rustic/skin/collapse/index.css"));
const RUSTIC_ENGINE = readFileSync(
  resolve(process.cwd(), "src/components/primitives/layout/collapse/engines/rustic/index.tsx"),
  "utf8"
);

const PANEL = ".rottay-collapse:not(.rottay-collapse--borderless)[data-part='root'] [data-part='panel']";

/** The `border` shorthand of the bordered panel, outside any at-rule. */
function panelBorder(): string | undefined {
  let found: string | undefined;
  postcss.parse(MODERN).walkRules((rule) => {
    if (rule.parent?.type !== "root" || rule.selector !== PANEL) return;
    rule.walkDecls("border", (decl) => {
      found = decl.value.replace(/\s+/g, " ");
    });
  });
  return found;
}

const BASE: FlatTheme = { id: "collapse-border", name: "Collapse border", palette: { primaryColor: "#336699" } };
const compileFlat = (collapse?: BrandCollapseChrome) =>
  compileFlatThemeThroughDoor({
    flatTheme: collapse ? { ...BASE, chrome: { collapse } } : BASE,
    tenantSlug: "fixture",
  });

const DB_IDENTITY = { tenantId: "t_collapse_border", slug: "acme", rowVersion: 1 } as const;
const compileDocument = (vertical: Vertical, chrome: unknown) =>
  compileTenantThemeConfig(
    hydrateTenantThemeConfig(
      { schemaVersion: 1, mode: "advanced", visualFoundation: { advanced: { chrome } } },
      { ...DB_IDENTITY, verticalKey: vertical }
    ),
    { verticalEnvelope: getTenantThemeVerticalEnvelope(vertical) }
  );

describe("chrome.collapse.border reaches the panel border as a colour", () => {
  it("lowers to the colour name, never to the key-derived one", () => {
    const compiled = compileFlat({ border: AUTHORED });
    expect(compiled.cssVariables[CHANNEL]).toBe(AUTHORED);
    expect(compiled.cssVariables[KEY_DERIVED]).toBeUndefined();
    expect(compiled.cssString).toContain(`${CHANNEL}: ${AUTHORED};`);
  });

  it("keeps every other collapse field on its own channel", () => {
    expect(
      chromeToVariables({
        collapse: {
          bg: "#010101",
          border: AUTHORED,
          contentBg: "#020202",
          headerBg: "#030303",
          headerBgHover: "#040404",
          headerColor: "#050505",
        },
      })
    ).toEqual({
      "--ds-collapse-bg": "#010101",
      [CHANNEL]: AUTHORED,
      "--ds-collapse-content-bg": "#020202",
      "--ds-collapse-header-bg": "#030303",
      "--ds-collapse-header-bg-hover": "#040404",
      "--ds-collapse-header-color": "#050505",
    });
  });

  it("is the colour operand of the Modern bordered panel, ahead of the resting colour", () => {
    expect(panelBorder()).toBe(
      "var(--ds-collapse-root-default-idle-border-width, 1px) " +
        "var(--ds-collapse-root-default-idle-border-style, solid) " +
        `var(${CHANNEL}, ${REST})`
    );
    // The family deriver states no colour of its own, so the tenant's is the
    // only statement of the name and nothing derived can shadow it.
    expect(collapseChromeDeriver.produces).not.toContain(CHANNEL);
  });

  it("is the name the frozen engines read as a colour", () => {
    expect(CLASSIC).toContain(`border-color: var(${CHANNEL});`);
    expect(CLASSIC).toContain(`border-bottom: 1px solid var(${CHANNEL});`);
    expect(RUSTIC).toContain(`1px solid var(${CHANNEL},`);
    expect(RUSTIC_ENGINE).toContain(`1px solid var(${CHANNEL},`);
    for (const [engine, css] of [
      ["classic", CLASSIC],
      ["rustic", RUSTIC],
      ["modern", stripComments(MODERN)],
    ] as const) {
      expect(css, engine).not.toMatch(/var\(\s*--ds-collapse-border\s*[,)]/);
    }
  });

  it.each(VERTICALS)("%s: a document's border is stated on the provider root", (vertical) => {
    const artifact = compileDocument(vertical, { collapse: { border: AUTHORED } });
    expect(artifact.variables[CHANNEL]).toBe(AUTHORED);
    expect(artifact.variables[KEY_DERIVED]).toBeUndefined();
    expect(artifact.css).toContain(`${artifact.scopes.combinedSelector} {`);
    expect(artifact.scopes.combinedSelector.startsWith("[data-ds-root]")).toBe(true);
    expect(artifact.css).toContain(`  ${CHANNEL}: ${AUTHORED};`);
  });
});

describe("a tenant that authors no collapse border keeps the resting border", () => {
  it.each(VERTICALS)("%s states no collapse border colour", (vertical) => {
    const compiled = compileThemeIntent(staticThemeIntent(vertical)).compiled;
    expect(compiled.cssVariables[CHANNEL]).toBeUndefined();
    expect(emitThemeCss(compiled, firstPartyScope(vertical))).not.toContain(`${CHANNEL}:`);
  });

  it("emits nothing for a theme that authors another collapse field", () => {
    const compiled = compileFlat({ headerBg: "#030303" });
    expect(compiled.cssVariables["--ds-collapse-header-bg"]).toBe("#030303");
    expect(compiled.cssVariables[CHANNEL]).toBeUndefined();
    expect(compileFlat().cssVariables[CHANNEL]).toBeUndefined();
  });

  it.each(VERTICALS)("%s: a document that authors another field states no border", (vertical) => {
    const artifact = compileDocument(vertical, { collapse: { headerBg: "#030303" } });
    expect(artifact.variables["--ds-collapse-header-bg"]).toBe("#030303");
    expect(artifact.variables[CHANNEL]).toBeUndefined();
    expect(artifact.css).not.toContain(CHANNEL);
  });
});
