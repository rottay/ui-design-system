import { describe, expect, it } from "vitest";

import {
  resolveStatsGridColumnCount,
  resolveStatsGridColumns,
} from "../layout";

describe("StatsGrid adaptive layout", () => {
  it("progresses from one phone column to two tablet columns and four desktop columns", () => {
    expect(resolveStatsGridColumnCount(undefined, "phone")).toBe(1);
    expect(resolveStatsGridColumnCount(undefined, "tablet")).toBe(2);
    expect(resolveStatsGridColumnCount(undefined, "desktop")).toBe(4);
  });

  it("treats an explicit columns value as a responsive desktop ceiling", () => {
    expect(resolveStatsGridColumnCount(3, "phone")).toBe(1);
    expect(resolveStatsGridColumnCount(3, "tablet")).toBe(2);
    expect(resolveStatsGridColumnCount(3, "desktop")).toBe(3);
    expect(resolveStatsGridColumnCount(1, "tablet")).toBe(1);
  });

  it("uses zero-minimum tracks so long content cannot widen the grid", () => {
    expect(resolveStatsGridColumns(4, "phone")).toBe(
      "repeat(1, minmax(0, 1fr))"
    );
    expect(resolveStatsGridColumns(4, "tablet")).toBe(
      "repeat(2, minmax(0, 1fr))"
    );
    expect(resolveStatsGridColumns(3, "desktop")).toBe(
      "repeat(3, minmax(0, 1fr))"
    );
  });
});
