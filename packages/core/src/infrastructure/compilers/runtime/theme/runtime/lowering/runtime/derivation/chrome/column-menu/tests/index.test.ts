/**
 * The column-menu family under the shared contract battery: generated from the
 * one template every family answers, never restated here in its own words.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import postcss from "postcss";

import { describe, expect, it } from "vitest";

import type { FlatTheme } from "@/foundation/contracts/composition/tenants/themes";
import {
  describeFamilyContract,
  FIXTURE_TENANT_FACTS,
  type FamilyFixture,
} from "@tests/support/family-contract";
import { firstPartyFixture } from "@tests/support/theme-lowering";
import type { FamilyDeriver } from "../../../../../foundation/contract";
import { buildLoweringContext, runDerivation } from "../../../../pipeline";
import { FAMILY_DERIVERS } from "../../..";
import { columnMenuChromeDeriver, deriveColumnMenuChannels } from "..";

const MINIMAL_THEME: FlatTheme = { id: "minimal", name: "Minimal" };

const FIXTURES: readonly FamilyFixture[] = [
  { label: "rottay", theme: firstPartyFixture("rottay") },
  { label: "bithire", theme: firstPartyFixture("bithire") },
  { label: "evnto", theme: firstPartyFixture("evnto") },
  { label: "minimal", theme: MINIMAL_THEME },
  {
    label: "bithire under a tenant floor",
    theme: firstPartyFixture("bithire"),
    tenant: FIXTURE_TENANT_FACTS,
  },
  {
    label: "minimal under a tenant floor",
    theme: MINIMAL_THEME,
    tenant: FIXTURE_TENANT_FACTS,
  },
];

describeFamilyContract(columnMenuChromeDeriver, FIXTURES);

const SKIN = readFileSync(
  resolve(
    process.cwd(),
    "src/foundation/tokens/css/presentation/components/skin/column-menu/index.css"
  ),
  "utf8"
)
  .replace(/\/\*[\s\S]*?\*\//g, "")
  .replace(/\s+/g, " ")
  .replace(/\( /g, "(")
  .replace(/ \)/g, ")");

const SURFACE_FOCUS =
  '.ds-structure.ds-column-menu-panel[data-part="surface"]:is([data-state~="focus-visible"], :focus-visible)';
const PANEL_FOCUS =
  '.ds-structure.ds-column-menu-panel[data-part="surface"] [data-part="panel"]:is([data-state~="focus-visible"], :focus-visible):not(:focus-within:not(:focus))';
const PANEL_ELEVATION =
  "var(--ds-column-menu-panel-shadow, var(--ds-material-overlay-shadow, var(--ds-elevation-4, 0 24px 64px color-mix(in srgb, var(--ds-color-text-primary) 14%, transparent))))";

/**
 * Read the original ordered declarations through an exact column-menu selector member.
 * @param css Authored or forced-colors slice of the owning skin, kept separate by the caller.
 * @param selector One of the original surface/panel selectors pinned below by the assertions.
 * @returns Every matching rule's declaration tuple, or no evidence for a foreign/ambiguous header.
 * @throws When the stylesheet cannot be parsed; malformed input must not look like missing paint.
 */
function declarationsOf(css: string, selector: string): string[][] {
  const panel =
    '.ds-structure.ds-column-menu-panel[data-part="surface"] [data-part="panel"]';
  const isPanel = [panel, PANEL_FOCUS, `${PANEL_FOCUS}::after`].includes(
    selector
  );
  if (!isPanel && selector !== SURFACE_FOCUS) return [];
  // Only the owned panel token gets a class twin; the Popover surface stays foreign.
  const twin = isPanel
    ? selector.replace('[data-part="panel"]', ".ds-column-menu-panel__panel")
    : selector;
  const accepted = [selector, twin];
  const tuples: string[][] = [];
  let ambiguous = false;
  postcss.parse(css).walkRules((rule) => {
    // PostCSS's list parser preserves nested :is/:not commas as part of one member.
    const members = postcss.list
      .comma(rule.raws.selector?.raw ?? rule.selector)
      .map((member) => member.replace(/\s+/g, " ").trim());
    if (!members.some((member) => accepted.includes(member))) return;
    if (
      new Set(members).size !== members.length ||
      members.some((member) => !accepted.includes(member))
    ) {
      ambiguous = true;
      return;
    }
    const contexts: string[] = [];
    for (
      let parent = rule.parent;
      parent && parent.type !== "root";
      parent = parent.parent
    ) {
      if (parent.type !== "atrule") {
        ambiguous = true;
        return;
      }
      contexts.unshift(`@${parent.name} ${parent.params}`);
    }
    // The surface alone composes inside these containers; panel focus never borrows them.
    const context = contexts.join("\n");
    const allowed = ["", "@media (forced-colors: active)"];
    if (!isPanel)
      allowed.push(
        "@container not (style(--ds-column-menu-panel-focus-ring: none) or style(--ds-column-menu-panel-shadow: none) or style(--ds-material-overlay-shadow: none) or style(--ds-elevation-4: none))",
        "@container style(--ds-column-menu-panel-focus-ring: none)"
      );
    if (!allowed.includes(context)) {
      ambiguous = true;
      return;
    }
    // Preserve duplicate declarations, values and source order for the unchanged tuple assertions.
    tuples.push(
      rule.nodes
        .filter((node) => node.type === "decl")
        .map((node) => node.toString().trim())
    );
  });
  return ambiguous ? [] : tuples;
}

const FORCED_START = SKIN.indexOf("@media (forced-colors: active)");
const FORCED_END = SKIN.indexOf("@media (prefers-reduced-motion: reduce)");
const AUTHORED = SKIN.slice(0, FORCED_START) + SKIN.slice(FORCED_END);
const FORCED = SKIN.slice(FORCED_START, FORCED_END);

const context = () => buildLoweringContext({ theme: firstPartyFixture("bithire") });

describe("chrome/column-menu", () => {
  it("reads the panel focus through the exact part, class and pair without splitting :is commas", () => {
    const classFocus =
      '.ds-structure.ds-column-menu-panel[data-part="surface"] .ds-column-menu-panel__panel:is([data-state~="focus-visible"], :focus-visible):not(:focus-within:not(:focus))';
    const expected = [
      "outline: var(--ds-column-menu-panel-focus-outline, var(--ds-focus-ring-width) solid transparent)",
      "outline-offset: var(--ds-column-menu-panel-focus-outline-offset, -2px)",
    ];
    // These are three representations of one owner's declarations, not three paint sources.
    for (const header of [
      PANEL_FOCUS,
      classFocus,
      `${PANEL_FOCUS}, ${classFocus}`,
    ]) {
      expect(
        declarationsOf(`${header} { ${expected.join("; ")}; }`, PANEL_FOCUS)
      ).toEqual([expected]);
    }
  });

  it("cannot borrow a foreign, ambiguous, misplaced or altered panel focus tuple", () => {
    const classFocus =
      '.ds-structure.ds-column-menu-panel[data-part="surface"] .ds-column-menu-panel__panel:is([data-state~="focus-visible"], :focus-visible):not(:focus-within:not(:focus))';
    const expected = [
      "outline: var(--ds-column-menu-panel-focus-outline, var(--ds-focus-ring-width) solid transparent)",
      "outline-offset: var(--ds-column-menu-panel-focus-outline-offset, -2px)",
    ];
    const body = `${expected.join("; ")};`;
    const intact = `${PANEL_FOCUS}, ${classFocus} { ${body} }`;
    // Each causal change is preceded by the intact result; declarations must keep their order.
    for (const [cause, css] of [
      [
        "wrong owner",
        `${PANEL_FOCUS.replace(
          "ds-column-menu-panel",
          "ds-foreign-panel"
        )} { ${body} }`,
      ],
      [
        "wrong part",
        `${PANEL_FOCUS.replace(
          '[data-part="panel"]',
          '[data-part="row"]'
        )} { ${body} }`,
      ],
      [
        "wrong hook",
        `${classFocus.replace("__panel", "__header")} { ${body} }`,
      ],
      ["mixed member", `${PANEL_FOCUS}, .ds-foreign-panel { ${body} }`],
      ["duplicate member", `${PANEL_FOCUS}, ${PANEL_FOCUS} { ${body} }`],
      ["duplicate rule", `${intact} ${intact}`],
      ["wrong context", `@media (hover: hover) { ${intact} }`],
      [
        "surface-only container",
        `@container style(--ds-column-menu-panel-focus-ring: none) { ${intact} }`,
      ],
      ["wrong value", intact.replace("-2px", "-3px")],
      [
        "wrong order",
        `${PANEL_FOCUS} { ${[...expected].reverse().join("; ")}; }`,
      ],
    ]) {
      expect(declarationsOf(intact, PANEL_FOCUS), cause).toEqual([expected]);
      expect(declarationsOf(css, PANEL_FOCUS), cause).not.toEqual([expected]);
    }
  });

  it("is registered once, at rank derived", () => {
    expect(
      FAMILY_DERIVERS.filter((deriver) => deriver === columnMenuChromeDeriver)
    ).toHaveLength(1);
    expect(columnMenuChromeDeriver.family).toBe("column-menu");
    expect(columnMenuChromeDeriver.rank).toBe("derived");
  });

  it("rides the panel rhythm on the density scale, at today's px when the dial is unset", () => {
    const dense = (px: number) => `calc(${px}px * var(--ds-density-effective-scale, 1))`;
    const vars = deriveColumnMenuChannels();
    expect(columnMenuChromeDeriver.consumes).toContain("density");
    expect({
      header: vars["--ds-column-menu-header-padding"],
      body: vars["--ds-column-menu-body-padding"],
      row: vars["--ds-column-menu-row-padding"],
      sectionGap: vars["--ds-column-menu-section-gap"],
      sectionPadding: vars["--ds-column-menu-section-padding-block-start"],
      footer: vars["--ds-column-menu-footer-padding"],
    }).toEqual({
      header: `${dense(18)} ${dense(20)} ${dense(16)}`,
      body: dense(14),
      row: `${dense(13)} ${dense(15)}`,
      sectionGap: dense(8),
      sectionPadding: dense(14),
      footer: dense(12),
    });
    // The count pill's box is fixed, so its inline padding is too.
    expect(vars["--ds-column-menu-count-padding-inline"]).toBe("8px");
  });

  it("rests the panel focus on the tenant's focus signature, never on a recipe of its own", () => {
    for (const fixture of FIXTURES) {
      const derived = columnMenuChromeDeriver.derive(
        buildLoweringContext({ theme: fixture.theme, tenant: fixture.tenant }),
        {}
      );
      expect(
        {
          ring: derived["--ds-column-menu-panel-focus-ring"],
          outline: derived["--ds-column-menu-panel-focus-outline"],
          offset: derived["--ds-column-menu-panel-focus-outline-offset"],
        },
        fixture.label
      ).toEqual({
        ring: "var(--ds-focus-ring)",
        outline: "var(--ds-focus-ring-width) solid transparent",
        offset: "-2px",
      });
    }
    expect(columnMenuChromeDeriver.produces).toContain("--ds-column-menu-panel-focus-ring");
  });

  it("wears the signature on the Popover surface that holds focus, in front of its elevation, and keeps every hook read", () => {
    expect(declarationsOf(AUTHORED, SURFACE_FOCUS)).toEqual([
      [
        "outline: var(--ds-column-menu-panel-focus-outline, var(--ds-focus-ring-width) solid transparent)",
        "outline-offset: var(--ds-column-menu-panel-focus-outline-offset, -2px)",
        "box-shadow: var(--ds-column-menu-panel-focus-ring, var(--ds-focus-ring))",
      ],
      [`box-shadow: var(--ds-column-menu-panel-focus-ring, var(--ds-focus-ring)), ${PANEL_ELEVATION}`],
      [`box-shadow: ${PANEL_ELEVATION}`],
    ]);
    // A `none` on either side voids the shared list, so the two compose only where both are stated.
    expect(SKIN).toContain(
      "@container not (style(--ds-column-menu-panel-focus-ring: none) or style(--ds-column-menu-panel-shadow: none) or style(--ds-material-overlay-shadow: none) or style(--ds-elevation-4: none))"
    );
    expect(SKIN).toContain("@container style(--ds-column-menu-panel-focus-ring: none)");
    expect(declarationsOf(FORCED, SURFACE_FOCUS)).toEqual([
      [
        "outline: max(2px, var(--ds-focus-ring-width)) solid Highlight",
        "outline-offset: var(--ds-column-menu-panel-focus-outline-offset, -2px)",
        "box-shadow: none",
      ],
    ]);
  });

  it("carries the signature on an overlay inside the clipping surface for the panel's own focus only", () => {
    expect(FORCED_START).toBeGreaterThan(-1);
    expect(FORCED_END).toBeGreaterThan(FORCED_START);

    expect(declarationsOf(AUTHORED, PANEL_FOCUS)).toEqual([
      [
        "outline: var(--ds-column-menu-panel-focus-outline, var(--ds-focus-ring-width) solid transparent)",
        "outline-offset: var(--ds-column-menu-panel-focus-outline-offset, -2px)",
      ],
    ]);
    expect(declarationsOf(AUTHORED, `${PANEL_FOCUS}::after`)).toEqual([
      [
        "position: absolute",
        "inset: calc(var(--ds-focus-ring-offset) + var(--ds-focus-ring-width))",
        "z-index: var(--ds-z-index-relative-above, 1)",
        'content: ""',
        "border-radius: max(0px, calc(var(--ds-column-menu-panel-radius, var(--ds-radius-xl, 20px)) - var(--ds-focus-ring-offset) - var(--ds-focus-ring-width)))",
        "box-shadow: var(--ds-column-menu-panel-focus-ring, var(--ds-focus-ring))",
        "pointer-events: none",
      ],
    ]);
    expect(
      declarationsOf(
        AUTHORED,
        '.ds-structure.ds-column-menu-panel[data-part="surface"] [data-part="panel"]'
      ).flat()
    ).toContain("position: relative");

    expect(declarationsOf(FORCED, PANEL_FOCUS)).toEqual([
      [
        "outline: max(2px, var(--ds-focus-ring-width)) solid Highlight",
        "outline-offset: var(--ds-column-menu-panel-focus-outline-offset, -2px)",
      ],
    ]);
    expect(declarationsOf(FORCED, `${PANEL_FOCUS}::after`)).toEqual([["display: none"]]);

    // A solid contour rebuilt from the colour operands is one fixed shape under every signature.
    expect(SKIN).not.toMatch(/--ds-focus-ring-color|--ds-color-border-focus/);
  });

  it("lets a tenant statement of each panel focus hook outrank the signature reference", () => {
    const stated = {
      "--ds-column-menu-panel-focus-ring": "0 0 0 3px currentColor",
      "--ds-column-menu-panel-focus-outline": "3px solid currentColor",
      "--ds-column-menu-panel-focus-outline-offset": "-3px",
    };
    const tenant: FamilyDeriver = {
      family: "stated-tenant-panel-focus",
      rank: "tenant",
      consumes: ["chrome.*"],
      produces: [
        "--ds-column-menu-panel-focus-ring",
        "--ds-column-menu-panel-focus-outline",
        "--ds-column-menu-panel-focus-outline-offset",
      ],
      derive: () => stated,
    };
    const result = runDerivation(context(), [columnMenuChromeDeriver, tenant]);
    for (const [channel, value] of Object.entries(stated)) {
      expect(result.channels[channel], channel).toBe(value);
      expect(result.provenance.get(channel)?.rank, channel).toBe("tenant");
    }
  });
});
