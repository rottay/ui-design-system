/**
 * @fileoverview Layout primitives barrel export.
 * Re-exports all layout-category primitive components.
 */

export { Box } from './Box';
export type {
  BoxProps,
  BoxSpacing,
  BoxBorderRadius,
  BoxShadow,
  BoxDisplay,
  BoxPosition,
  BoxOverflow,
} from './Box';
export { BOX_DEFAULTS, SPACING_MAP, RADIUS_MAP, SHADOW_MAP } from './Box';

export {
  SemanticSurface,
  SemanticSurfaceSupport,
  SEMANTIC_SURFACE_DEFAULTS,
} from './SemanticSurface';
export type {
  SemanticSurfaceElement,
  SemanticSurfaceProps,
  SemanticSurfaceSupportProps,
} from './SemanticSurface';
export { Stack } from './Stack';
export type {
  StackProps,
  StackDirection,
  StackAlign,
  StackJustify,
  StackSpacing,
  StackSpacingPreset,
} from './Stack';
export {
  STACK_DEFAULTS,
  SPACING_MAP as STACK_SPACING_MAP,
  ALIGN_MAP as STACK_ALIGN_MAP,
  JUSTIFY_MAP as STACK_JUSTIFY_MAP,
  resolveSpacing as resolveStackSpacing,
} from './Stack';

export { Grid, GridItem } from './Grid';
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
} from './Grid';
export {
  GRID_DEFAULTS,
  GRID_ITEM_DEFAULTS,
  GAP_MAP,
  ALIGN_ITEMS_MAP,
  JUSTIFY_ITEMS_MAP,
} from './Grid';

export { Divider } from './Divider';
export type {
  DividerProps,
  DividerOrientation,
  DividerVariant,
  DividerTextPosition,
  DividerThickness,
  DividerThicknessPreset,
  DividerSpacing,
} from './Divider';
export {
  DIVIDER_DEFAULTS,
  SPACING_MAP as DIVIDER_SPACING_MAP,
  THICKNESS_MAP,
  DEFAULT_COLORS as DIVIDER_DEFAULT_COLORS,
  getThicknessValue,
} from './Divider';

// Wave 4 - New Layout Components
export { Container } from './Container';
export type { ContainerProps, ContainerMaxWidth, ContainerPadding } from './Container';
export { CONTAINER_DEFAULTS, CONTAINER_MAX_WIDTHS, CONTAINER_PADDINGS } from './Container';

export { Flex } from './Flex';
export type { FlexProps, FlexDirection, FlexWrap, FlexJustify, FlexAlign } from './Flex';
export { FLEX_DEFAULTS, FLEX_JUSTIFY_MAP, FLEX_ALIGN_MAP } from './Flex';

export { Space } from './Space';
export type { SpaceProps, SpaceSize, LegacySpaceSize, SpaceDirection, SpaceAlign } from './Space';
export { SPACE_DEFAULTS, SPACE_SIZE_MAP, SPACE_ALIGN_MAP } from './Space';

export { Layout } from './Layout';
export type {
  LayoutProps,
  LayoutHeaderProps,
  LayoutSiderProps,
  LayoutContentProps,
  LayoutFooterProps,
} from './Layout';
export { LAYOUT_DEFAULTS } from './Layout';

export { Splitter } from './Splitter';
export type { SplitterProps, SplitterPanelProps } from './Splitter';
export { SPLITTER_DEFAULTS } from './Splitter';

export { Collapse, useCollapseTokens } from './Collapse';
export type {
  CollapseProps,
  CollapsePanelProps,
  CollapseSize,
  LegacyCollapseSize,
  UseCollapseTokensOptions,
  UseCollapseTokensResult,
} from './Collapse';
export { COLLAPSE_DEFAULTS } from './Collapse';

// AspectRatio
export { AspectRatio } from './AspectRatio';
export type { AspectRatioProps, AspectRatioPreset } from './AspectRatio';
export { ASPECT_RATIO_DEFAULTS, RATIO_PRESETS } from './AspectRatio';

// ScrollArea
export { ScrollArea } from './ScrollArea';
export type { ScrollAreaProps, ScrollAreaOrientation, ScrollAreaScrollbarSize } from './ScrollArea';
export { SCROLL_AREA_DEFAULTS, SCROLLBAR_SIZES } from './ScrollArea';

// CSS-first responsive visibility and content swapping
export * from './responsive';
