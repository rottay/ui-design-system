/**
 * @fileoverview Layout primitives barrel export.
 * Re-exports all layout-category primitive components.
 */

export { Box } from './box';
export type {
  BoxProps,
  BoxSpacing,
  BoxBorderRadius,
  BoxShadow,
  BoxDisplay,
  BoxPosition,
  BoxOverflow,
} from './box';
export { BOX_DEFAULTS, SPACING_MAP, RADIUS_MAP, SHADOW_MAP } from './box';

export {
  SemanticSurface,
  SemanticSurfaceSupport,
  SEMANTIC_SURFACE_DEFAULTS,
} from './semantic-surface';
export type {
  SemanticSurfaceElement,
  SemanticSurfaceProps,
  SemanticSurfaceSupportProps,
} from './semantic-surface';
export { Stack } from './stack';
export type {
  StackProps,
  StackDirection,
  StackAlign,
  StackJustify,
  StackSpacing,
  StackSpacingPreset,
} from './stack';
export {
  STACK_DEFAULTS,
  SPACING_MAP as STACK_SPACING_MAP,
  ALIGN_MAP as STACK_ALIGN_MAP,
  JUSTIFY_MAP as STACK_JUSTIFY_MAP,
  resolveSpacing as resolveStackSpacing,
} from './stack';

export { Grid, GridItem } from './grid';
export type {
  GridProps,
  GridItemProps,
  GridColumns,
  GridColumnsValue,
  GridRows,
  GridGap,
  GridGapValue,
  GridAutoFlow,
  GridAlignItems,
  GridJustifyItems,
  GridAlignContent,
  GridJustifyContent,
  GridPlaceItems,
  ResponsiveValue,
} from './grid';
export {
  GRID_DEFAULTS,
  GRID_ITEM_DEFAULTS,
  GAP_MAP,
  ALIGN_ITEMS_MAP,
  JUSTIFY_ITEMS_MAP,
} from './grid';

export { Divider } from './divider';
export type {
  DividerProps,
  DividerOrientation,
  DividerVariant,
  DividerTextPosition,
  DividerThickness,
  DividerThicknessPreset,
  DividerSpacing,
} from './divider';
export {
  DIVIDER_DEFAULTS,
  SPACING_MAP as DIVIDER_SPACING_MAP,
  THICKNESS_MAP,
  DEFAULT_COLORS as DIVIDER_DEFAULT_COLORS,
  getThicknessValue,
} from './divider';

// Wave 4 - New Layout Components
export { Container } from './container';
export type { ContainerProps, ContainerMaxWidth, ContainerPadding } from './container';
export { CONTAINER_DEFAULTS, CONTAINER_MAX_WIDTHS, CONTAINER_PADDINGS } from './container';

export { Flex } from './flex';
export type { FlexProps, FlexDirection, FlexWrap, FlexJustify, FlexAlign } from './flex';
export { FLEX_DEFAULTS, FLEX_JUSTIFY_MAP, FLEX_ALIGN_MAP } from './flex';

export { Space } from './space';
export type { SpaceProps, SpaceSize, LegacySpaceSize, SpaceDirection, SpaceAlign } from './space';
export { SPACE_DEFAULTS, SPACE_SIZE_MAP, SPACE_ALIGN_MAP } from './space';

export { Layout } from './system';
export type {
  LayoutProps,
  LayoutHeaderProps,
  LayoutSiderProps,
  LayoutContentProps,
  LayoutFooterProps,
} from './system';
export { LAYOUT_DEFAULTS } from './system';

export { Splitter } from './splitter';
export type { SplitterProps, SplitterPanelProps } from './splitter';
export { SPLITTER_DEFAULTS } from './splitter';

export { Collapse, useCollapseTokens } from './collapse';
export type {
  CollapseProps,
  CollapsePanelProps,
  CollapseSize,
  LegacyCollapseSize,
  UseCollapseTokensOptions,
  UseCollapseTokensResult,
} from './collapse';
export { COLLAPSE_DEFAULTS } from './collapse';

// AspectRatio
export { AspectRatio } from './aspect-ratio';
export type { AspectRatioProps, AspectRatioPreset } from './aspect-ratio';
export { ASPECT_RATIO_DEFAULTS, RATIO_PRESETS } from './aspect-ratio';

// ScrollArea
export { ScrollArea } from './scroll-area';
export type { ScrollAreaProps, ScrollAreaOrientation, ScrollAreaScrollbarSize } from './scroll-area';
export { SCROLL_AREA_DEFAULTS, SCROLLBAR_SIZES } from './scroll-area';

// AsciiFrame
export { AsciiFrame } from './ascii-frame';
export type { AsciiFrameProps, AsciiFrameVariant } from './ascii-frame';

// InvertSection
export { InvertSection } from './invert-section';
export type { InvertSectionProps, InvertSectionSurface } from './invert-section';

// CSS-first responsive visibility and content swapping
export * from './responsive';
