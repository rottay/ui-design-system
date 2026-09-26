import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { describe, expect, it } from "vitest";

const OWNERS = [
  "src/components/patterns/data/widget-board",
  "src/components/patterns/runtime/adaptive-layout",
];

function sources(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) return entry === "tests" ? [] : sources(path);
    return /\.(ts|tsx)$/.test(entry) ? [path] : [];
  });
}

describe("the DS never stores a board layout", () => {
  it("no widget-board or adaptive-layout source touches browser storage", () => {
    const files = OWNERS.flatMap((owner) => sources(resolve(process.cwd(), owner)));
    expect(files.length).toBeGreaterThan(5);
    const hits = files.filter((file) => /localStorage|sessionStorage|indexedDB/.test(readFileSync(file, "utf8")));
    expect(hits).toEqual([]);
  });
});
