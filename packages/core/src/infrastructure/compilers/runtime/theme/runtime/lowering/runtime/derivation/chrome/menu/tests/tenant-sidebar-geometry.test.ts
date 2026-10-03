/**
 * The four tenant sidebar geometry fields that name a menu node. Each authored
 * value is emitted at its `--ds-sidebar-*` root, the menu channel chains that
 * root ahead of its resting value, and the Modern skin paints the channel on
 * the node the field names. A tenant that authors nothing keeps the resting
 * value, under the document root and under a nested provider root alike.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import postcss from "postcss";
import { describe, expect, it } from "vitest";

import type { BrandSidebarChrome, FlatTheme } from "@/foundation/contracts/composition/tenants/themes";
import { compileThemeIntent, emitThemeCss, firstPartyScope, staticThemeIntent } from "@/entrypoints/server";
import {
  compileTenantThemeConfig,
  getTenantThemeVerticalEnvelope,
  hydrateTenantThemeConfig,
} from "@/infrastructure/compilers/composition/tenant-theme";
import { projectFirstPartyArtifactScopes } from "@/infrastructure/compilers/kernel/foundation/css/scope-projection";
import { compileFlatThemeThroughDoor } from "@tests/support/theme-door";
import { menuChromeDeriver } from "..";

const VERTICALS = ["rottay", "bithire", "evnto"] as const;
type Vertical = (typeof VERTICALS)[number];

interface Wire {
  readonly field: string;
  /** The field authored on its own, and the value it carries. */
  readonly sidebar: BrandSidebarChrome;
  readonly authored: string;
  readonly root: string;
  readonly channel: string;
  /** What the channel resolves to when the root is unset. */
  readonly rest: string;
  /** The node the field names and the declarations that paint the channel on it. */
  readonly node: string;
  readonly declarations: readonly string[];
}

const WIRES: readonly Wire[] = [
  {
    field: "itemHeight",
    sidebar: { itemHeight: "56px" },
    authored: "56px",
    root: "--ds-sidebar-item-height",
    channel: "--ds-menu-item-height",
    rest: "var(--ds-spacing-12)",
    node: "[data-part='item'][data-level='top']",
    declarations: ["block-size"],
  },
  {
    field: "iconSize",
    sidebar: { iconSize: "20px" },
    authored: "20px",
    root: "--ds-sidebar-icon-size",
    channel: "--ds-menu-icon-size",
    rest: "var(--ds-icon-sm-size)",
    node: "[data-part='icon']",
    declarations: ["font-size"],
  },
  {
    field: "iconColumnSize",
    sidebar: { iconColumnSize: "32px" },
    authored: "32px",
    root: "--ds-sidebar-icon-column-size",
    channel: "--ds-menu-icon-column-size",
    rest: "var(--ds-spacing-6)",
    node: "[data-part='icon']",
    declarations: ["inline-size", "block-size"],
  },
  {
    field: "childPaddingInline",
    sidebar: { childPaddingInline: "12px" },
    authored: "12px",
    root: "--ds-sidebar-child-padding-inline",
    channel: "--ds-menu-child-padding-inline",
    rest: "var(--ds-sidebar-item-indent, var(--ds-spacing-2))",
    node: "[data-part='item'][data-level='child']",
    declarations: ["padding-inline-start", "padding-inline-end"],
  },
];

const chainOf = (wire: Wire) => `var(${wire.root}, ${wire.rest})`;

const BASE: FlatTheme = { id: "sidebar-geometry", name: "Sidebar geometry", palette: { primaryColor: "#336699" } };
const authoring = (sidebar: BrandSidebarChrome): FlatTheme => ({ ...BASE, chrome: { sidebar } });
const compileFlat = (theme: FlatTheme) => compileFlatThemeThroughDoor({ flatTheme: theme, tenantSlug: "fixture" });

const SKIN = postcss.parse(
  readFileSync(resolve(process.cwd(), "src/foundation/tokens/css/runtime/engines/modern/skin/menu/index.css"), "utf8")
);

/** The value the skin declares for `property` on the rule whose selector list ends at `node`. */
function skinDeclaration(node: string, property: string): string | undefined {
  let found: string | undefined;
  SKIN.walkRules((rule) => {
    if (!rule.selectors.some((selector) => selector.trim() === `.ds-menu--modern[data-part='root'] ${node}`)) return;
    rule.walkDecls(property, (decl) => {
      found = decl.value.replace(/\s+/g, " ");
    });
  });
  return found;
}

/** The declarations of the first rule whose selector satisfies `owns`. */
function declarationsAt(css: string, owns: (selector: string) => boolean): Record<string, string> {
  const declared: Record<string, string> = {};
  let taken = false;
  postcss.parse(css).walkRules((rule) => {
    if (taken || rule.parent?.type !== "root" || !owns(rule.selector)) return;
    taken = true;
    rule.walkDecls((decl) => {
      declared[decl.prop] = decl.value;
    });
  });
  return declared;
}

const DB_IDENTITY = { tenantId: "t_sidebar_geometry", slug: "acme", rowVersion: 1 } as const;
const compileDocument = (vertical: Vertical, sidebar: BrandSidebarChrome) =>
  compileTenantThemeConfig(
    hydrateTenantThemeConfig(
      { schemaVersion: 1, mode: "advanced", visualFoundation: { advanced: { chrome: { sidebar } } } },
      { ...DB_IDENTITY, verticalKey: vertical }
    ),
    { verticalEnvelope: getTenantThemeVerticalEnvelope(vertical) }
  );

const EVERY_FIELD: BrandSidebarChrome = Object.assign({}, ...WIRES.map((wire) => wire.sidebar));

describe("tenant sidebar geometry reaches the menu node it names", () => {
  it.each(WIRES)("$field is emitted at $root and chained by $channel", (wire) => {
    const compiled = compileFlat(authoring(wire.sidebar));
    expect(compiled.cssVariables[wire.root]).toBe(wire.authored);
    expect(compiled.cssVariables[wire.channel]).toBe(chainOf(wire));
    expect(compiled.cssString).toContain(`${wire.root}: ${wire.authored};`);
    expect(compiled.cssString).toContain(`${wire.channel}: ${chainOf(wire)};`);
    for (const other of WIRES) {
      if (other === wire) continue;
      expect(compiled.cssVariables[other.root], other.root).toBeUndefined();
    }
  });

  it.each(WIRES)("the Modern skin paints $channel on the node $field names", (wire) => {
    expect(menuChromeDeriver.produces).toContain(wire.channel);
    for (const property of wire.declarations) {
      expect(skinDeclaration(wire.node, property), `${wire.node} ${property}`).toContain(`var(${wire.channel},`);
    }
  });

  it("lets the child padding outrank the indent it used to share a channel with", () => {
    const both = compileFlat(authoring({ childPaddingInline: "12px", itemIndent: "6px" }));
    expect(both.cssVariables["--ds-sidebar-child-padding-inline"]).toBe("12px");
    expect(both.cssVariables["--ds-sidebar-item-indent"]).toBe("6px");
    expect(both.cssVariables["--ds-menu-child-padding-inline"]).toBe(
      "var(--ds-sidebar-child-padding-inline, var(--ds-sidebar-item-indent, var(--ds-spacing-2)))"
    );
  });
});

describe("a tenant that authors no sidebar geometry keeps the resting value", () => {
  it.each(VERTICALS)("%s states none of the four roots and rests each channel on its constant", (vertical) => {
    const compiled = compileThemeIntent(staticThemeIntent(vertical)).compiled;
    const css = emitThemeCss(compiled, firstPartyScope(vertical));
    for (const wire of WIRES) {
      expect(compiled.cssVariables[wire.root], wire.root).toBeUndefined();
      expect(css, wire.root).not.toContain(`${wire.root}:`);
      expect(compiled.cssVariables[wire.channel], wire.channel).toBe(chainOf(wire));
    }
  });

  it("emits no root for a theme that authors a sibling field only", () => {
    const compiled = compileFlat(authoring({ itemGap: "10px", itemChildHeight: "36px" }));
    for (const wire of WIRES) {
      expect(compiled.cssVariables[wire.root], wire.root).toBeUndefined();
      expect(compiled.cssVariables[wire.channel], wire.channel).toBe(chainOf(wire));
    }
  });
});

describe("the chain resolves under a nested provider root", () => {
  const providerRoot = (vertical: Vertical) => `:where([data-ds-root][data-vertical='${vertical}'])`;

  it.each(VERTICALS)("%s: the tenant artifact and the vertical compile land on the same element", (vertical) => {
    const artifact = compileDocument(vertical, EVERY_FIELD);
    const tenantScope = artifact.scopes.combinedSelector;
    expect(tenantScope).toBe(`[data-ds-root][data-vertical="${vertical}"][data-tenant][data-tenant="acme"]`);

    const tenantRule = declarationsAt(artifact.css, (selector) => selector === tenantScope);
    const verticalRule = declarationsAt(
      projectFirstPartyArtifactScopes(
        emitThemeCss(compileThemeIntent(staticThemeIntent(vertical)).compiled, firstPartyScope(vertical)),
        vertical,
        vertical
      ),
      (selector) => selector === `:is(html[data-tenant='${vertical}'], ${providerRoot(vertical)})`
    );

    for (const wire of WIRES) {
      // The authored root is stated on the provider root element itself...
      expect(artifact.variables[wire.root], wire.root).toBe(wire.authored);
      expect(tenantRule[wire.root], wire.root).toBe(wire.authored);
      // ...and the channel that reads it is declared by the vertical's rule on
      // that same element, so the read resolves there and not at the document
      // root, which a nested provider leaves without any tenant attribute.
      expect(verticalRule[wire.channel], wire.channel).toBe(chainOf(wire));
      expect(tenantRule[wire.channel], wire.channel).toBeUndefined();
    }
  });

  it.each(VERTICALS)("%s: a document that authors none of the four states none of the roots", (vertical) => {
    const artifact = compileDocument(vertical, { width: "280px" });
    expect(artifact.variables["--ds-sidebar-width"]).toBe("280px");
    for (const wire of WIRES) {
      expect(artifact.variables[wire.root], wire.root).toBeUndefined();
      expect(artifact.variables[wire.channel], wire.channel).toBeUndefined();
      expect(artifact.css, wire.root).not.toContain(wire.root);
    }
  });
});
