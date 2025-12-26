/**
 * Layout primitives
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

export { Stack } from './Stack';
export type {
  StackProps,
  StackDirection,
  StackAlign,
  StackJustify,
  StackSpacing,
} from './Stack';

export { Grid } from './Grid';
export type { GridProps, GridColumns, GridGap } from './Grid';

export { Divider } from './Divider';
export type { DividerProps, DividerOrientation, DividerType } from './Divider';

// Wave 4 - New Layout Components
export { Container } from './Container';
export type { ContainerProps, ContainerMaxWidth, ContainerPadding } from './Container';
export { CONTAINER_DEFAULTS, CONTAINER_MAX_WIDTHS, CONTAINER_PADDINGS } from './Container';

export { Flex } from './Flex';
export type { FlexProps, FlexDirection, FlexWrap, FlexJustify, FlexAlign } from './Flex';
export { FLEX_DEFAULTS, FLEX_JUSTIFY_MAP, FLEX_ALIGN_MAP } from './Flex';

export { Space } from './Space';
export type { SpaceProps, SpaceSize, SpaceDirection, SpaceAlign } from './Space';
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

export { Collapse } from './Collapse';
export type { CollapseProps, CollapsePanelProps } from './Collapse';
export { COLLAPSE_DEFAULTS } from './Collapse';
