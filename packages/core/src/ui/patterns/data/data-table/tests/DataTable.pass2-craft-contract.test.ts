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
    "../../../../../foundation/tokens/css/runtime/engines/modern/skin/data-table.css"
  ),
  "utf8"
);
const mobileSkin = readFileSync(
  join(
    here,
    "../../../../../foundation/tokens/css/presentation/components/skin/data-table-mobile.css"
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
      "--ds-table-sort-bg-active",
      "--ds-table-sort-border-active",
      "--ds-table-drop-indicator-border",
      "--ds-table-header-pinned-bg",
      "--ds-table-pinned-cell-bg-selected",
      "--ds-table-pinned-cell-bg-hover",
      "--ds-table-header-focus-shadow",
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
      /\[data-part="body-row"\]\[data-selected="true"\]\s*\{([^}]*)\}/
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
    expect(mobileSkin).toContain("--ds-table-mobile-summary-divider");
    expect(mobileSkin).toContain("--ds-table-mobile-card-focus-ring");
    expect(mobileSkin).not.toMatch(
      /ds-data-table__mobile-card--selected[^{}]*\{[^}]*border-inline-start/
    );
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
