import { describe, expect, it } from "vitest";

import { noSizeTypeOutsideClassic } from "..";

function visitors(filename = "/repo/packages/core/src/ui/primitives/inputs/Switch/contracts/index.ts") {
  const reports: Array<{ messageId?: string }> = [];
  const created = noSizeTypeOutsideClassic.create({
    filename,
    options: [],
    report: (descriptor) => reports.push(descriptor),
  });
  return { created, reports };
}

describe("no-size-type-outside-classic", () => {
  it("blocks a type-only named import of SizeType outside engines/classic/", () => {
    const { created, reports } = visitors();

    created.ImportDeclaration?.({
      importKind: "type",
      source: { value: "../../../../../foundation/contracts/kernel/common" },
      specifiers: [
        { type: "ImportSpecifier", imported: { name: "SizeType" }, importKind: "type" },
      ],
    });

    expect(reports).toHaveLength(1);
    expect(reports[0]?.messageId).toBe("useCanonical");
  });

  it("blocks a mixed import where only one specifier is SizeType", () => {
    const { created, reports } = visitors();

    created.ImportDeclaration?.({
      source: { value: "../../../../../foundation/contracts/kernel/common" },
      specifiers: [
        { type: "ImportSpecifier", imported: { name: "Size" } },
        { type: "ImportSpecifier", imported: { name: "SizeType" }, importKind: "type" },
      ],
    });

    expect(reports).toHaveLength(1);
  });

  it("does not flag LegacySizeAlias or Size -- only the literal SizeType binding", () => {
    const { created, reports } = visitors();

    created.ImportDeclaration?.({
      importKind: "type",
      source: { value: "../../../../../foundation/contracts/kernel/common" },
      specifiers: [
        { type: "ImportSpecifier", imported: { name: "LegacySizeAlias" } },
        { type: "ImportSpecifier", imported: { name: "Size" } },
      ],
    });

    expect(reports).toEqual([]);
  });

  it("allows a renamed import -- checks the imported (source) name, not the local alias", () => {
    const { created, reports } = visitors();

    created.ImportDeclaration?.({
      importKind: "type",
      source: { value: "../../../../../foundation/contracts/kernel/common" },
      specifiers: [
        { type: "ImportSpecifier", imported: { name: "SizeType" }, local: { name: "LegacyStep" } },
      ],
    });

    expect(reports).toHaveLength(1);
  });

  it("blocks a named re-export of SizeType", () => {
    const { created, reports } = visitors();

    created.ExportNamedDeclaration?.({
      source: { value: "../../../../../foundation/contracts/kernel/common" },
      specifiers: [
        { type: "ExportSpecifier", local: { name: "SizeType" }, exported: { name: "SizeType" } },
      ],
    });

    expect(reports).toHaveLength(1);
  });

  it("exempts engines/classic/ paths -- the antd size-vocabulary bridge", () => {
    const { created } = visitors(
      "/repo/packages/core/src/ui/primitives/inputs/Switch/engines/classic/index.tsx",
    );

    expect(Object.keys(created)).toEqual([]);
  });

  it("respects a user-supplied exempt glob", () => {
    const created = noSizeTypeOutsideClassic.create({
      filename: "/repo/packages/core/src/ui/primitives/inputs/Switch/legacy-bridge/index.ts",
      options: [{ exempt: ["**/legacy-bridge/**"] }],
      report: () => {
        throw new Error("should not report inside an exempt path");
      },
    });

    expect(Object.keys(created)).toEqual([]);
  });

  it("does not flag an unrelated import from the same module", () => {
    const { created, reports } = visitors();

    created.ImportDeclaration?.({
      importKind: "type",
      source: { value: "../../../../../foundation/contracts/kernel/common" },
      specifiers: [{ type: "ImportSpecifier", imported: { name: "Tone" } }],
    });

    expect(reports).toEqual([]);
  });
});
