/**
 * @fileoverview Display primitives barrel export.
 * Re-exports all display-category primitive components.
 */

export { Avatar, AvatarGroup, AvatarBadge, AvatarFallback } from './avatar';
export type { AvatarProps, AvatarSize, AvatarShape, AvatarStatus, AvatarVariant, AvatarTone, AvatarGroupProps, AvatarBadgeProps, AvatarFallbackProps } from './avatar';
export { TONE_TO_AVATAR_VARIANT } from './avatar';

export { Badge } from './badge';
export type {
  BadgeProps,
  BadgeVariant,
  BadgeSize,
  BadgeStyle,
  BadgeStatus,
  BadgeKind,
  BadgePosition,
} from './badge';
export { TONE_TO_BADGE_VARIANT } from './badge';

export { Card } from './card';
export type { CardProps, CardVariant } from './card';

export { Image, ImageFallback, ImageSkeleton } from './image';
export type { ImageProps, ImageFallbackProps, ImageSkeletonProps, ImageFit, ImageRadius, ImageStatus, ImageGroupProps, ImageLoadState } from './image';

export { Tag, TagGroup } from './tag';
export type { TagProps, TagSize, TagVariant, TagTone, TagRadius, TagGroupProps } from './tag';
export { TONE_TO_TAG_VARIANT } from './tag';

export { Tooltip } from './tooltip';
export type {
  TooltipProps,
  TooltipTriggerProps,
  TooltipContentProps,
  TooltipPlacement,
  TooltipTriggerType,
  TooltipTouchBehavior,
} from './tooltip';

export { Heading, Text, Paragraph, Link, Typography } from './typography';
export type { HeadingProps, TextProps, ParagraphProps, LinkProps, HeadingLevel, TextSize, TextWeight, TextAlign, TextColor } from './typography';

export { Table } from './table';
export type {
  TableProps,
  ColumnType,
  TablePaginationConfig,
  TableRowSelection,
  ExpandableConfig,
  TableSize,
  TableLayout,
  SortOrder,
  FilterMode,
} from './table';

export { Calendar } from './calendar';
export type { CalendarProps, CalendarMode, CalendarHeaderRenderProps } from './calendar';

export { List } from './list';
export type { ListProps, ListItemProps, ListItemMetaProps } from './list';

export { Empty } from './empty';
export type { EmptyProps } from './empty';

export { Statistic } from './statistic';
export type { StatisticProps, CountdownProps } from './statistic';

export { Carousel } from './carousel';
export type { CarouselProps, CarouselRef, CarouselEffect, CarouselDotPosition, CarouselSize, CarouselItemProps } from './carousel';

export { Descriptions } from './descriptions';
export type { DescriptionsProps, DescriptionsItemProps, DescriptionsLayout, DescriptionsSize } from './descriptions';

export { Timeline } from './timeline';
export type { TimelineProps, TimelineItemProps, TimelineMode } from './timeline';

export { Tree } from './tree';
export type { TreeProps, TreeNodeProps, TreeDataNode, TreeDropInfo, TreeDragStartInfo } from './tree';

export { QRCode } from './qr-code';
export type { QRCodeProps, QRCodeStatus, QRCodeErrorLevel, QRCodeType } from './qr-code';

// Kbd
export { Kbd } from './kbd';
export type { KbdProps, KbdSize } from './kbd';
export { KBD_DEFAULTS } from './kbd';

// Callout
export { Callout } from './callout';
export type { CalloutProps, CalloutVariant, CalloutTone } from './callout';
export { CALLOUT_DEFAULTS, CALLOUT_COLORS, TONE_TO_CALLOUT_VARIANT } from './callout';

// CodeBlock
export { CodeBlock, registerHighlighter, getHighlighter, useHighlighter, CODE_BLOCK_DEFAULTS } from './code-block';
export type { CodeBlockProps, HighlighterAdapter, HighlightTokenLine, HighlightTokenSpan } from './code-block';

// MarkdownView
export { MarkdownView, parseMarkdown, parseInline, sanitizeHref } from './markdown-view';
export type {
  MarkdownViewProps,
  MarkdownDensity,
  MarkdownLinkPolicy,
  MarkdownLinkScheme,
  MarkdownCodeSlotProps,
  MarkdownNode,
  MarkdownBlockNode,
  MarkdownInlineNode,
} from './markdown-view';

// Typewriter
export { Typewriter } from './typewriter';
export type { TypewriterProps, TypewriterMode } from './typewriter';

// CropMarks
export { CropMarks } from './crop-marks';
export type { CropMarksProps } from './crop-marks';

// TextureBackdrop
export { TextureBackdrop } from './texture-backdrop';
export type { TextureBackdropProps, TextureBackdropPattern } from './texture-backdrop';
