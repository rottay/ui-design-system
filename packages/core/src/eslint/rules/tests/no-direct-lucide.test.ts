import { describe, expect, it } from "vitest";

import { noDirectLucide } from "../no-direct-lucide";

function visitors(filename = "/app/src/example.tsx") {
  const reports: Array<{ messageId?: string; data?: Record<string, string> }> =
    [];
  const created = noDirectLucide.create({
    filename,
    options: [],
    report: (descriptor) => reports.push(descriptor),
  });
  return { created, reports };
}

describe("no-direct-lucide", () => {
  it("blocks runtime imports from the package root and subpaths", () => {
    const { created, reports } = visitors();

    created.ImportDeclaration?.({
      source: { value: "lucide-react" },
      specifiers: [{ type: "ImportSpecifier", importKind: "value" }],
    });
    created.ImportDeclaration?.({
      source: { value: "lucide-react/dist/cjs/icons/search" },
      specifiers: [{ type: "ImportDefaultSpecifier" }],
    });

    expect(reports.map((report) => report.data?.source)).toEqual([
      "lucide-react",
      "lucide-react/dist/cjs/icons/search",
    ]);
  });

  it("allows declarations that are entirely type-only during migration", () => {
    const { created, reports } = visitors();

    created.ImportDeclaration?.({
      importKind: "type",
      source: { value: "lucide-react" },
      specifiers: [{ type: "ImportSpecifier", importKind: "value" }],
    });
    created.ImportDeclaration?.({
      source: { value: "lucide-react" },
      specifiers: [{ type: "ImportSpecifier", importKind: "type" }],
    });
    created.ExportNamedDeclaration?.({
      exportKind: "type",
      source: { value: "lucide-react" },
    });

    expect(reports).toEqual([]);
  });

  it("blocks re-exports, require and dynamic import escape hatches", () => {
    const { created, reports } = visitors();

    created.ExportAllDeclaration?.({ source: { value: "lucide-react" } });
    created.ExportNamedDeclaration?.({
      source: { value: "lucide-react/icons" },
    });
    created.CallExpression?.({
      callee: { type: "Identifier", name: "require" },
      arguments: [{ value: "lucide-react" }],
    });
    created.ImportExpression?.({ source: { value: "lucide-react" } });
    created.CallExpression?.({
      callee: { type: "Import" },
      arguments: [{ value: "lucide-react/dynamic" }],
    });

    expect(reports).toHaveLength(5);
    expect(reports.every((report) => report.messageId === "useDS")).toBe(true);
  });

  it("keeps the legacy DS catalog exemption narrowly scoped", () => {
    const exempt = visitors("/repo/packages/core/src/icons/catalog/actions.ts");
    const semantic = visitors(
      "/repo/packages/core/src/icons/semantic/runtime.ts"
    );

    expect(Object.keys(exempt.created)).toEqual([]);
    semantic.created.ImportDeclaration?.({
      source: { value: "lucide-react" },
      specifiers: [{ type: "ImportSpecifier" }],
    });
    expect(semantic.reports).toHaveLength(1);
  });
});
