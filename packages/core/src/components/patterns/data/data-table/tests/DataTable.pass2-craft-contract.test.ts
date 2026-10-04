import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

const here = dirname(fileURLToPath(import.meta.url));
const modernEngine = readFileSync(
  join(here, "../engines/modern/index.tsx"),
  "utf8"
);
const modernSkin = readFileSync(
  join(
    here,
    "../../../../../foundation/tokens/css/runtime/engines/modern/skin/data-table/index.css"
  ),
  "utf8"
);
const mobileSkin = readFileSync(
  join(
    here,
    "../../../../../foundation/tokens/css/presentation/components/skin/data-table-mobile/index.css"
  ),
  "utf8"
);
const interactionsSkin = readFileSync(
  join(
    here,
    "../../../../../foundation/tokens/css/presentation/components/skin/data-table-interactions/index.css"
  ),
  "utf8"
);
const storySource = readFileSync(join(here, "../DataTable.stories.tsx"), "utf8");

describe("DataTable pass 2 craft contract", () => {
  it("composes DS Tooltip for move and resize affordances", () => {
    expect(modernEngine).toContain('import { Tooltip }');
    expect(modernEngine).toContain(
      'className="ds-data-table__column-tooltip ds-data-table__column-tooltip--reorder"'
    );
    expect(modernEngine).toContain(
      'className="ds-data-table__column-tooltip ds-data-table__column-tooltip--resize"'
    );
  });

  it("exposes sortable, capability and selection states as stable anatomy", () => {
    expect(modernEngine).toContain("data-sort-state={sortState}");
    expect(modernEngine).toContain(
      'data-reorderable={reorderable && onColumnReorder ? "true" : "false"}'
    );
    expect(modernEngine).toContain(
      'data-resizable={resizable && onColumnResize ? "true" : "false"}'
    );
    expect(modernEngine).toContain(
      "aria-selected={selectable ? isSelected : undefined}"
    );
  });

  it("keeps premium interaction paint configurable through table tokens", () => {
    for (const token of [
      "--ds-data-table-sort-bg-active",
      "--ds-data-table-sort-border-active",
      "--ds-data-table-drop-indicator-border",
      "--ds-data-table-header-pinned-bg",
      "--ds-data-table-pinned-cell-bg-selected",
      "--ds-data-table-pinned-cell-bg-hover",
      "--ds-data-table-header-focus-shadow",
    ]) {
      expect(modernSkin, `missing ${token}`).toContain(token);
    }
  });

  it("collapses low-priority columns from container width, while preserving pinned context", () => {
    expect(modernSkin).toMatch(
      /@container ds-table \(max-width: 52rem\)[\s\S]*\[data-col-priority="low"\]:not\(\[data-pinned="true"\]\)[\s\S]*display: none/
    );
    expect(modernSkin).toMatch(
      /@container ds-table \(max-width: 640px\)[\s\S]*\[data-col-priority="low"\]\[data-pinned="true"\][\s\S]*display: table-cell/
    );
  });

  it("uses all-around selection and drop feedback instead of an accent rail", () => {
    const selectedRule = modernSkin.match(
      /\[data-part="body-row"\]\[data-selected="true"\]\s*>\s*td\s*\{([^}]*)\}/
    )?.[1];
    const dropRule = modernSkin.match(
      /\[data-part="drop-indicator"\]\[data-part="drop-indicator"\]\s*\{([\s\S]*?)\}/g
    );
    const finalDropRule = dropRule?.[dropRule.length - 1];

    expect(selectedRule).toContain("inset 0 0 0");
    expect(selectedRule).not.toContain("border-inline-start");
    expect(finalDropRule).toContain("border: 1px solid");
    expect(finalDropRule).not.toContain("border-inline-start");
  });

  it("segments mobile summaries and retains an all-around focus ring", () => {
    expect(mobileSkin).toContain("--ds-data-table-mobile-summary-divider");
    expect(mobileSkin).toContain("--ds-data-table-mobile-card-focus-ring");
    expect(mobileSkin).not.toMatch(
      /ds-data-table__mobile-card--selected[^{}]*\{[^}]*border-inline-start/
    );
  });

  describe("keyboard focus wears the tenant focus signature", () => {
    const skin = modernSkin.replace(/\/\*[\s\S]*?\*\//g, "");
    const FOCUS = String.raw`:is\(\[data-state~="focus-visible"\], :focus-visible\)`;
    const ROW = String.raw`\[data-part="body-row"\]${FOCUS}`;
    const GROUP_ROW = String.raw`\[data-part="group-header-row"\]${FOCUS}`;
    const HEADER = String.raw`\[data-part="header-cell"\]\[data-sortable="true"\]${FOCUS}`;
    const SELF = String.raw`:not\(:focus-within:not\(:focus\)\)`;
    const bodies = (selector: string): string[] =>
      [...skin.matchAll(new RegExp(`${selector}\\s*[,{][^{}]*\\{([^}]*)\\}|${selector}\\s*\\{([^}]*)\\}`, "g"))].map(
        (match) => match[1] ?? match[2] ?? ""
      );
    const declaration = (body: string, property: string): string | undefined =>
      body.match(new RegExp(`(?:^|[;\\s])${property}:\\s*([^;]+);`))?.[1].trim();
    const forcedColors = skin.slice(skin.lastIndexOf("@media (forced-colors: active)"));

    it.each([
      ["a body row", ROW, "var(--ds-table-row-focus-shadow, var(--ds-focus-ring))", "2"],
      ["a group header row", GROUP_ROW, "var(--ds-table-row-focus-shadow, var(--ds-focus-ring))", "2"],
      [
        "a sortable header cell",
        HEADER,
        "var(--ds-data-table-header-focus-shadow, var(--ds-focus-ring))",
        undefined,
      ],
    ])("hosts one overlay on %s, and a system-colour outline in forced colors", (_label, node, shadow, zIndex) => {
      const stated = bodies(`${node}${SELF}::after`);
      // A row overlay takes its stacking tier from the rule it shares with the pinned cells.
      const [tier, overlay, forced, ...extra] = zIndex === undefined ? [undefined, ...stated] : stated;
      expect(extra).toEqual([]);
      expect(tier?.trim()).toBe(zIndex === undefined ? undefined : `z-index: ${zIndex};`);
      expect(declaration(overlay ?? "", "content")).toBe('""');
      expect(declaration(overlay ?? "", "position")).toBe("absolute");
      expect(declaration(overlay ?? "", "inset")).toBe(
        "calc(var(--ds-focus-ring-offset) + var(--ds-focus-ring-width))"
      );
      expect(declaration(overlay ?? "", "pointer-events")).toBe("none");
      expect(declaration(overlay ?? "", "box-shadow")).toBe(shadow);
      expect(declaration(overlay ?? "", "z-index")).toBeUndefined();
      expect(overlay).not.toContain("outline");

      expect(declaration(forced ?? "", "outline")).toBe(
        "max(2px, var(--ds-focus-ring-width)) solid Highlight"
      );
      expect(declaration(forced ?? "", "inset")).toBe(
        "calc(var(--ds-focus-ring-offset) + max(2px, var(--ds-focus-ring-width)))"
      );
      expect(declaration(forced ?? "", "outline-offset")).toBe("var(--ds-focus-ring-offset)");
      expect(declaration(forced ?? "", "box-shadow")).toBe("none");
      expect(forcedColors).toContain(forced);
    });

    it("shows an overlay only while its host holds focus itself, never for a focused descendant", () => {
      const overlays = [...skin.matchAll(/:focus-visible\)([^\s,{]*)::after/g)].map(([, tail]) => tail);
      // Six overlay rules, and the two row overlays named again by the tier rule.
      expect(overlays).toHaveLength(8);
      for (const tail of overlays) {
        expect(tail).toBe(":not(:focus-within:not(:focus))");
      }
    });

    it("keeps the row overlay above its pinned cells and under the sticky header", () => {
      const pinned = skin.match(
        /\[data-part="data-cell"\]\[data-pinned="true"\]\s*\{[^}]*z-index:\s*(\d+);/
      )?.[1];
      const stickyHead = skin.match(
        /\[data-part="table-head"\]\[data-sticky="true"\]\s*\{[^}]*z-index:\s*(\d+);/
      )?.[1];
      expect(pinned).toBe("2");
      expect(Number(stickyHead)).toBeGreaterThan(2);
      const tiers = [...skin.matchAll(/([^{}]*)\{\s*z-index:\s*2;\s*\}/g)]
        .map(([, selectors]) => selectors ?? "")
        .filter((selectors) => selectors.includes("::after"));
      expect(tiers).toHaveLength(1);
      expect(tiers[0]).toMatch(new RegExp(`${ROW}${SELF}::after`));
      expect(tiers[0]).toMatch(new RegExp(`${GROUP_ROW}${SELF}::after`));
      expect(tiers[0]).toContain('[data-part="header-cell"][data-pinned="true"]');
      expect(tiers[0]).toContain('[data-part="data-cell"][data-pinned="true"]');
    });

    it("never pins a sticky header cell back to relative while it holds focus", () => {
      const positioned = [...skin.matchAll(new RegExp(`(${HEADER}[^{}]*)\\{([^}]*)\\}`, "g"))].filter(
        ([, , body]) => /position:\s*relative/.test(body ?? "")
      );
      expect(positioned).toHaveLength(1);
      expect(positioned[0]?.[1]).toContain(':not([data-pinned="true"])');
    });

    it("paints no per-cell band and no ring rebuilt from the width or colour operands", () => {
      expect(bodies(`${ROW} > td`)).toEqual([]);
      expect(skin).not.toMatch(new RegExp(`${ROW}\\s*>\\s*\\[data-part="data-cell"\\]`));
      expect(skin).not.toMatch(new RegExp(`${HEADER}\\[data-pinned="true"\\]`));
      const focusRules = [...skin.matchAll(/([^{}]*)\{([^{}]*)\}/g)].filter(([, selector]) =>
        new RegExp(`${ROW}|${GROUP_ROW}|${HEADER}`).test(selector ?? "")
      );
      expect(focusRules.length).toBeGreaterThan(0);
      for (const [, , body] of focusRules) {
        expect(body).not.toMatch(/inset 0 0 0 var\(--ds-focus-ring-width/);
        expect(body).not.toMatch(/outline(?:-color)?:[^;]*(?:--ds-focus-ring-color|--ds-color-primary)/);
        expect(body).not.toMatch(/box-shadow:[^;]*--ds-focus-ring-(?:width|color|offset)/);
      }
    });
  });

  describe("the shared interactions and mobile skins state no focus recipe of their own", () => {
    const interactions = interactionsSkin.replace(/\/\*[\s\S]*?\*\//g, "");
    const mobile = mobileSkin.replace(/\/\*[\s\S]*?\*\//g, "");
    const rules = (source: string): [string, string][] =>
      [...source.matchAll(/([^{}]*)\{([^{}]*)\}/g)].map(([, selector, body]) => [
        (selector ?? "").replace(/\s+/g, " ").trim(),
        body ?? "",
      ]);

    it("leaves the row and the sortable header to the engine skin, forced colors included", () => {
      const focusSelectors = rules(interactions)
        .map(([selector]) => selector)
        .filter((selector) => selector.includes("focus-visible"));
      expect(focusSelectors.length).toBeGreaterThan(0);
      for (const selector of focusSelectors) {
        expect(selector).toContain(".ds-resize-handle");
        expect(selector).not.toMatch(/\btr\[|\bth\[/);
      }
    });

    it("hosts the resize handle's focus on an overlay wearing the signature", () => {
      const HANDLE =
        '.ds-engine-modern:where(.ds-pattern-data-table) .ds-resize-handle:is([data-state~="focus-visible"], :focus-visible)';
      const own = rules(interactions).filter(([selector]) => selector === HANDLE);
      const overlays = rules(interactions).filter(([selector]) => selector === `${HANDLE}::after`);
      expect(own).toHaveLength(1);
      expect(own[0]?.[1]).toMatch(/outline:\s*none;/);
      expect(overlays).toHaveLength(2);
      const [overlay, forced] = overlays.map(([, body]) => body);
      expect(overlay).toMatch(/box-shadow:\s*var\(--ds-focus-ring\);/);
      expect(overlay).toMatch(
        /inset:\s*calc\(var\(--ds-focus-ring-offset\) \+ var\(--ds-focus-ring-width\)\);/
      );
      expect(overlay).toMatch(/pointer-events:\s*none;/);
      expect(forced).toMatch(/outline:\s*max\(2px, var\(--ds-focus-ring-width\)\) solid Highlight;/);
      expect(forced).toMatch(/box-shadow:\s*none;/);
      expect(interactions.slice(interactions.indexOf("@media (forced-colors: active)"))).toContain(forced);
    });

    it("builds no solid outline or ring from the width and colour operands on a focused node", () => {
      for (const [selector, body] of [...rules(interactions), ...rules(mobile)]) {
        if (!selector.includes("focus-visible") || selector.includes("__bar")) continue;
        expect(body, selector).not.toMatch(/outline:[^;]*solid\s+var\(--ds-(?:color-primary|focus-ring-color)/);
        expect(body, selector).not.toMatch(/box-shadow:[^;]*--ds-focus-ring-(?:width|color|offset)/);
      }
    });

    it("leaves the mobile card's focus to the Card skin and hands it the tenant's mobile-card ring", () => {
      const cardFocus = rules(mobile).filter(
        ([selector]) =>
          selector.includes(".ds-data-table__mobile-card") && /focus-visible/.test(selector)
      );
      expect(cardFocus).toEqual([]);
      for (const [selector, body] of rules(mobile)) {
        if (!selector.includes(".ds-data-table__mobile-card")) continue;
        expect(body, selector).not.toMatch(/--ds-card-focus-ring-(?:color|width)\s*:/);
      }
      const hook = rules(mobile).filter(([, body]) => /--ds-card-focus-ring\s*:/.test(body));
      expect(hook).toHaveLength(1);
      expect(hook[0]?.[0]).toBe(".ds-pattern-data-table.ds-data-table--mobile .ds-data-table__mobile-card");
      expect(hook[0]?.[1]).toMatch(
        /--ds-card-focus-ring:\s*var\(--ds-data-table-mobile-card-focus-ring, var\(--ds-focus-ring\)\);/
      );
      const cardSkin = readFileSync(
        join(here, "../../../../../foundation/tokens/css/runtime/engines/modern/skin/card/index.css"),
        "utf8"
      ).replace(/\/\*[\s\S]*?\*\//g, "");
      const painted = rules(cardSkin).filter(
        ([selector, body]) =>
          selector.includes("[data-variant='outlined'][data-actionable='true'][data-state~='focus-visible']") &&
          /box-shadow:/.test(body)
      );
      expect(painted.length).toBeGreaterThan(0);
      for (const [selector, body] of painted) {
        expect(body, selector).toMatch(/box-shadow:\s*var\(--ds-card-focus-ring, var\(--ds-focus-ring\)\)[,;]/);
      }
    });
  });

  describe("the inline cell editor's raw controls wear the tenant focus signature", () => {
    const cellEditor = readFileSync(join(here, "../engines/modern/cell-editor/index.tsx"), "utf8");
    const mobile = mobileSkin.replace(/\/\*[\s\S]*?\*\//g, "");
    const EDITOR_FOCUS =
      '.ds-pattern-data-table :is([data-part="editor-input"], [data-part="editor-checkbox"]):is([data-state~="focus-visible"], :focus-visible)';
    const editorRules = [...mobile.matchAll(/([^{}]*)\{([^{}]*)\}/g)]
      .map(([, selector, body]) => [(selector ?? "").replace(/\s+/g, " ").trim(), body ?? ""] as const)
      .filter(([selector]) => /editor-(?:input|checkbox)/.test(selector) && selector.includes("focus-visible"));

    it("covers every focusable control the editor renders, and each is a raw element", () => {
      const controls = [...cellEditor.matchAll(/<(input|select|textarea|button)\b[\s\S]*?data-part="([a-z-]+)"/g)].map(
        ([, tag, part]) => `${tag}:${part}`
      );
      expect([...new Set(controls)].sort()).toEqual(["input:editor-checkbox", "input:editor-input", "select:editor-input"]);
      expect(cellEditor).not.toMatch(/<(?:Input|Select|Checkbox|DatePicker|InputNumber)\b/);
    });

    it("paints the signature once, on the control, and a system-colour outline in forced colors", () => {
      expect(editorRules.map(([selector]) => selector)).toEqual([EDITOR_FOCUS, EDITOR_FOCUS]);
      const [[, body], [, forced]] = editorRules as unknown as [[string, string], [string, string]];
      expect(body).toMatch(/outline:\s*var\(--ds-focus-ring-width\) solid transparent;/);
      expect(body).toMatch(/outline-offset:\s*var\(--ds-focus-ring-offset\);/);
      expect(body).toMatch(/box-shadow:\s*var\(--ds-focus-ring\);/);
      expect(forced).toMatch(/outline:\s*max\(2px, var\(--ds-focus-ring-width\)\) solid Highlight;/);
      expect(forced).toMatch(/outline-offset:\s*var\(--ds-focus-ring-offset\);/);
      expect(forced).toMatch(/box-shadow:\s*none;/);
      expect(mobile.slice(mobile.lastIndexOf("@media (forced-colors: active)"))).toContain(forced);
      for (const skin of [modernSkin, interactionsSkin]) {
        expect(skin).not.toMatch(/editor-(?:input|checkbox)[^{}]*focus/);
      }
    });

    it("is not outranked by the engine bridge's bare select focus, the one bridge focus rule on a form control", () => {
      const bridge = readFileSync(
        join(here, "../../../../../foundation/tokens/css/runtime/engines/modern/framework-bridge/index.css"),
        "utf8"
      ).replace(/\/\*[\s\S]*?\*\//g, "");
      const focusSelectors = [...bridge.matchAll(/([^{}]*)\{[^{}]*\}/g)]
        .map(([, selector]) => (selector ?? "").replace(/\s+/g, " ").trim())
        .filter((selector) => /\b(?:input|select|textarea)\b[^,]*:focus/.test(selector));
      expect(focusSelectors).toEqual(["[data-engine='modern'] select:not([data-part='editor-input']):focus"]);
    });

    it("keeps the editing cell unclipped, so the ring is whole inside the cell padding", () => {
      const editing = modernSkin.match(/\[data-part="data-cell"\]\[data-editing="true"\]\s*\{([^}]*)\}/)?.[1] ?? "";
      expect(editing).toMatch(/overflow:\s*visible;/);
      expect(editing).toMatch(/padding:\s*4px 6px;/);
    });
  });

  it("keeps a same-anatomy white-label proof with divergent tokens and locales", () => {
    expect(storySource).toContain("WhiteLabelSameMarkup");
    expect(storySource).toContain("bitHireTableTokens");
    expect(storySource).toContain("managementTableTokens");
    expect(storySource).toContain('lang="es"');
    expect(storySource).toContain('tableLabel: "Candidate decision queue"');
    expect(storySource).toContain(
      'tableLabel: "Cola de decisiones de talento"'
    );
  });
});
