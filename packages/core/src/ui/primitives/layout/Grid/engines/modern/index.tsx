/**
 * @fileoverview Grid Modern Engine - Rottay Design System
 * @description Modern, token-aware implementation of the Grid component.
 * Projects deterministic CSS Grid structure without generated utility classes.
 *
 * @remarks
 * Structural values are emitted as inline styles and responsive media rules so
 * every supported value remains available in downstream consumer bundles. Gap
 * tokens stay connected to the DS custom-property contract for white-labeling.
 *
 * @example Using Modern Engine
 * ```tsx
 * import { Grid } from '@rottay/design-system';
 *
 * // Use Modern engine for deterministic responsive tracks
 * <Grid engine="modern" columns={3} gap="md">
 *   <Grid.Item span={2}>
 *     Two-column item
 *   </Grid.Item>
 * </Grid>
 * // Container uses repeat(3, minmax(0, 1fr)) and the DS medium gap token.
 *
 * // Combine with global EngineProvider
 * <EngineProvider engine="modern">
 *   <Grid columns={4} gap="lg">
 *     Four safely shrinking tracks
 *   </Grid>
 * </EngineProvider>
 * ```
 *
 * @see {@link Grid} - The main engine-aware component
 * @see {@link ClassicGrid} - Ant Design implementation
 * @see {@link RusticGrid} - Pure HTML/CSS implementation
 * @module Grid/Engines/Modern
 * @category Layout
 * @package @rottay/design-system
 */

"use client";

import React, {
  forwardRef,
  useId,
  type ElementType,
  type Ref,
  type CSSProperties,
} from "react";
import type {
  GridProps,
  GridItemProps,
  GridGap,
  ResponsiveValue,
} from "../../contracts";
import { GRID_DEFAULTS, GRID_ITEM_DEFAULTS, GAP_MAP } from "../../contracts";
import {
  generateResponsiveGridCSS,
  isResponsiveGridValue,
  type ResponsiveGridTemplateValue,
} from "../../runtime/responsive";

/**
 * Converts a semantic gap token or raw pixel number into a CSS-compatible string.
 * Values stay connected to the spacing token contract when a token is supplied.
 */
const resolveGap = (gap: GridGap | number | undefined): string | undefined => {
  if (gap === undefined) return undefined;
  if (typeof gap === "number") {
    return Number.isFinite(gap) && gap >= 0 ? `${gap}px` : "0px";
  }
  return GAP_MAP[gap as GridGap] || GAP_MAP.md;
};

/** Defensive runtime normalization for values crossing untyped boundaries. */
const resolveTrackCount = (value: number): number => {
  if (!Number.isFinite(value)) return GRID_DEFAULTS.columns as number;
  return Math.min(12, Math.max(1, Math.trunc(value)));
};

/** Spans are positive bounded integers; invalid placement is omitted. */
const resolveSpan = (value: number | undefined): number | undefined => {
  if (value === undefined || !Number.isFinite(value) || value <= 0) {
    return undefined;
  }
  return Math.min(12, Math.max(1, Math.trunc(value)));
};

/** Grid line zero/non-finite values are invalid; negative lines remain legal. */
const resolveLine = (
  value: number | "auto" | undefined
): number | "auto" | undefined => {
  if (value === undefined || value === "auto") return value;
  if (!Number.isFinite(value) || value === 0) return undefined;
  return Math.trunc(value);
};

/**
 * Converts a column/row definition into a CSS grid-template value.
 * Numeric values become `repeat(N, minmax(0, 1fr))` so long content cannot
 * force a track wider than its allocated share.
 */
const resolveColumns = (
  columns: ResponsiveGridTemplateValue | undefined
): string | undefined => {
  if (columns === undefined) return undefined;
  if (columns === "auto") return "auto";
  if (columns === "none") return "none";
  if (typeof columns === "number")
    return `repeat(${resolveTrackCount(columns)}, minmax(0, 1fr))`;
  if (typeof columns === "string") return columns;
  return undefined;
};

/**
 * Assembles inline CSSProperties for the grid container.
 *
 * The Modern engine projects structural values deterministically. Semantic gap
 * values remain connected to DS tokens; no runtime-generated utility class is
 * required to survive consumer build pruning.
 *
 * @param props - The full set of GridProps from the consumer.
 * @returns A CSSProperties object to spread onto the container element.
 */
const buildGridStyles = (props: GridProps): CSSProperties => {
  const {
    columns,
    rows,
    gap,
    spacing,
    columnGap,
    rowGap,
    templateColumns,
    templateRows,
    templateAreas,
    minColumnWidth,
    autoFlow,
    autoColumns,
    autoRows,
    alignItems,
    justifyItems,
    placeItems,
    alignContent,
    justifyContent,
    width,
    height,
    minHeight,
    minWidth,
    maxWidth,
    overflow,
    inline,
    motion,
    style,
  } = props;
  const effectiveGap = gap ?? spacing ?? GRID_DEFAULTS.gap;
  const computedStyle: CSSProperties = {
    display: inline ? "inline-grid" : "grid",
    minInlineSize: 0,
  };
  if (templateColumns) computedStyle.gridTemplateColumns = templateColumns;
  else if (minColumnWidth !== undefined) {
    const trackMinimum =
      typeof minColumnWidth === "number"
        ? Number.isFinite(minColumnWidth) && minColumnWidth >= 0
          ? `${minColumnWidth}px`
          : "0px"
        : minColumnWidth;
    computedStyle.gridTemplateColumns = `repeat(auto-fit, minmax(min(100%, ${trackMinimum}), 1fr))`;
  } else if (columns !== undefined && !isResponsiveGridValue(columns))
    computedStyle.gridTemplateColumns = resolveColumns(
      columns as ResponsiveGridTemplateValue
    );
  if (templateRows) computedStyle.gridTemplateRows = templateRows;
  else if (rows !== undefined && !isResponsiveGridValue(rows))
    computedStyle.gridTemplateRows = resolveColumns(
      rows as ResponsiveGridTemplateValue
    );
  if (templateAreas) computedStyle.gridTemplateAreas = templateAreas;
  const resolvedGap = resolveGap(effectiveGap);
  if (resolvedGap) computedStyle.gap = resolvedGap;
  if (columnGap !== undefined) computedStyle.columnGap = resolveGap(columnGap);
  if (rowGap !== undefined) computedStyle.rowGap = resolveGap(rowGap);
  if (autoFlow) computedStyle.gridAutoFlow = autoFlow;
  if (autoColumns) computedStyle.gridAutoColumns = autoColumns;
  if (autoRows) computedStyle.gridAutoRows = autoRows;
  if (placeItems) computedStyle.placeItems = placeItems;
  else {
    if (alignItems) computedStyle.alignItems = alignItems;
    if (justifyItems) computedStyle.justifyItems = justifyItems;
  }
  if (alignContent) computedStyle.alignContent = alignContent;
  if (justifyContent) computedStyle.justifyContent = justifyContent;
  if (width !== undefined) computedStyle.width = width;
  if (height !== undefined) computedStyle.height = height;
  if (minHeight !== undefined) computedStyle.minHeight = minHeight;
  if (minWidth !== undefined) computedStyle.minWidth = minWidth;
  if (maxWidth !== undefined) computedStyle.maxWidth = maxWidth;
  if (overflow) computedStyle.overflow = overflow;
  if (motion === "rearrange")
    computedStyle.transition = "var(--ds-transition-rearrange)";
  else if (motion === "none") computedStyle.transition = "none";
  if (style) Object.assign(computedStyle, style);
  return computedStyle;
};

/**
 * Assembles inline CSSProperties for a grid item.
 *
 * Handles common spans and advanced placement in one structural style contract.
 */
const buildGridItemStyles = (props: GridItemProps): CSSProperties => {
  const {
    span,
    colSpan,
    rowSpan,
    colStart,
    colEnd,
    rowStart,
    rowEnd,
    area,
    alignSelf,
    justifySelf,
    placeSelf,
    zIndex,
    style,
  } = props;
  const computedStyle: CSSProperties = {
    minInlineSize: 0,
    minBlockSize: 0,
  };
  // Named area takes full precedence over col/row placement
  if (area) computedStyle.gridArea = area;
  else {
    const effectiveColSpan = resolveSpan(colSpan ?? span);
    const effectiveRowSpan = resolveSpan(rowSpan);
    const effectiveColStart = resolveLine(colStart);
    const effectiveColEnd = resolveLine(colEnd);
    const effectiveRowStart = resolveLine(rowStart);
    const effectiveRowEnd = resolveLine(rowEnd);
    // Build gridColumn: "start / span N" or "start / end" or "span N"
    if (
      effectiveColStart !== undefined ||
      effectiveColEnd !== undefined ||
      effectiveColSpan !== undefined
    ) {
      let col =
        effectiveColStart !== undefined ? String(effectiveColStart) : "";
      if (effectiveColSpan !== undefined)
        col = col
          ? `${col} / span ${effectiveColSpan}`
          : `span ${effectiveColSpan}`;
      else if (effectiveColEnd !== undefined)
        col = col ? `${col} / ${effectiveColEnd}` : `auto / ${effectiveColEnd}`;
      if (col) computedStyle.gridColumn = col;
    }
    if (
      effectiveRowStart !== undefined ||
      effectiveRowEnd !== undefined ||
      effectiveRowSpan !== undefined
    ) {
      let row =
        effectiveRowStart !== undefined ? String(effectiveRowStart) : "";
      if (effectiveRowSpan !== undefined)
        row = row
          ? `${row} / span ${effectiveRowSpan}`
          : `span ${effectiveRowSpan}`;
      else if (effectiveRowEnd !== undefined)
        row = row ? `${row} / ${effectiveRowEnd}` : `auto / ${effectiveRowEnd}`;
      if (row) computedStyle.gridRow = row;
    }
  }
  if (placeSelf) computedStyle.placeSelf = placeSelf;
  else {
    if (alignSelf) computedStyle.alignSelf = alignSelf;
    if (justifySelf) computedStyle.justifySelf = justifySelf;
  }
  if (zIndex !== undefined) computedStyle.zIndex = zIndex;
  if (style) Object.assign(computedStyle, style);
  return computedStyle;
};

// Gap is now resolved via inline style using DS CSS custom properties.
// This ensures tenant overrides (--ds-spacing-*) flow through.

/**
 * Modern Grid container using deterministic structural styles and token-backed
 * spacing. Responsive breakpoint objects trigger scoped media rules.
 *
 * @param props - Grid container props including columns, rows, gap, template overrides, etc.
 * @returns A polymorphic, ref-forwarding grid container element.
 */
const ModernGrid = forwardRef<HTMLElement, GridProps>((props, ref) => {
  const {
    as: Component = GRID_DEFAULTS.as,
    className = "",
    children,
    gap,
    columns,
    rows,
    id,
    spacing: _spacing,
    columnGap: _columnGap,
    rowGap: _rowGap,
    templateColumns: _templateColumns,
    templateRows: _templateRows,
    templateAreas: _templateAreas,
    minColumnWidth,
    autoFlow: _autoFlow,
    autoColumns: _autoColumns,
    autoRows: _autoRows,
    alignItems: _alignItems,
    justifyItems: _justifyItems,
    placeItems: _placeItems,
    alignContent: _alignContent,
    justifyContent: _justifyContent,
    width: _width,
    height: _height,
    minHeight: _minHeight,
    minWidth: _minWidth,
    maxWidth: _maxWidth,
    overflow: _overflow,
    inline: _inline,
    motion: _motion,
    style: _style,
    engine: _engine,
    ...htmlAttributes
  } = props;

  const reactId = useId();
  const gridId = `grid-${reactId.replace(/:/g, "")}`;
  const hasResponsiveColumns =
    minColumnWidth === undefined && isResponsiveGridValue(columns);
  const hasResponsiveRows = isResponsiveGridValue(rows);
  const needsResponsiveCSS = hasResponsiveColumns || hasResponsiveRows;

  // Clear inline template values when responsive CSS will provide them via
  // media queries, preventing the inline styles from overriding the injected rules
  const computedStyle = buildGridStyles({
    ...props,
    style: needsResponsiveCSS
      ? {
          ...props.style,
          gridTemplateColumns:
            props.templateColumns ||
            (hasResponsiveColumns
              ? undefined
              : props.style?.gridTemplateColumns),
          gridTemplateRows:
            props.templateRows ||
            (hasResponsiveRows ? undefined : props.style?.gridTemplateRows),
        }
      : props.style,
  });
  const responsiveCSS = needsResponsiveCSS
    ? generateResponsiveGridCSS(
        gridId,
        resolveColumns,
        hasResponsiveColumns
          ? (columns as ResponsiveValue<ResponsiveGridTemplateValue>)
          : undefined,
        hasResponsiveRows
          ? (rows as ResponsiveValue<ResponsiveGridTemplateValue>)
          : undefined
      )
    : null;

  // Gap resolved via inline style using DS CSS custom properties
  if (gap && typeof gap === "string" && gap in GAP_MAP) {
    computedStyle.gap = GAP_MAP[gap as keyof typeof GAP_MAP];
  }

  const ElementType = Component as ElementType;

  return (
    <>
      {responsiveCSS && (
        <style dangerouslySetInnerHTML={{ __html: responsiveCSS }} />
      )}
      {React.createElement(
        ElementType,
        {
          ...htmlAttributes,
          ref: ref as Ref<HTMLElement>,
          className: `rottay-grid rottay-grid--modern ${className}`.trim(),
          style: computedStyle,
          id,
          "data-component": "grid",
          "data-grid-id": needsResponsiveCSS ? gridId : undefined,
          "data-layout-motion":
            props.motion === "rearrange" ? "rearrange" : undefined,
        },
        children
      )}
    </>
  );
});

ModernGrid.displayName = "ModernGrid";

/**
 * Modern GridItem component with safe intrinsic sizing and deterministic
 * placement styles for spans, line positions, and named areas.
 *
 * @param props - Grid item positioning props (span, colSpan, rowSpan, area, etc.)
 * @returns A polymorphic, ref-forwarding grid item element.
 */
const ModernGridItem = forwardRef<HTMLElement, GridItemProps>((props, ref) => {
  const {
    as: Component = GRID_ITEM_DEFAULTS.as,
    className = "",
    children,
    span: _span,
    colSpan: _colSpan,
    rowSpan: _rowSpan,
    id,
    colStart: _colStart,
    colEnd: _colEnd,
    rowStart: _rowStart,
    rowEnd: _rowEnd,
    area: _area,
    alignSelf: _alignSelf,
    justifySelf: _justifySelf,
    placeSelf: _placeSelf,
    zIndex: _zIndex,
    style: _style,
    ...htmlAttributes
  } = props;

  const computedStyle = buildGridItemStyles(props);

  const ElementType = Component as ElementType;

  return React.createElement(
    ElementType,
    {
      ...htmlAttributes,
      ref: ref as Ref<HTMLElement>,
      className:
        `rottay-grid-item rottay-grid-item--modern ${className}`.trim(),
      style: computedStyle,
      id,
      "data-component": "grid-item",
    },
    children
  );
});

ModernGridItem.displayName = "ModernGridItem";

// Export as default for engine factory
export default ModernGrid;

// Named exports
export { ModernGrid, ModernGridItem };
