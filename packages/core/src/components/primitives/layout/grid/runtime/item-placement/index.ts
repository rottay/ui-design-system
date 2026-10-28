"use client";

import { createContext } from "react";
import type { GridItemProps } from "../../contracts";

export const GridTrackLimit = createContext<number | undefined>(undefined);

export const limitAutomaticColumnSpan = (
  span: number | undefined,
  colStart: GridItemProps["colStart"],
  colEnd: GridItemProps["colEnd"],
  trackLimit: number | undefined
): number | undefined => {
  const automaticColumn = (colStart === undefined || colStart === "auto") &&
    (colEnd === undefined || colEnd === "auto");
  return span !== undefined && trackLimit !== undefined && automaticColumn
    ? Math.min(span, trackLimit)
    : span;
};
