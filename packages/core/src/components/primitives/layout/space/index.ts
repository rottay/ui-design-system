"use client";

/**
 * @fileoverview Space Component - Rottay Design System
 * @description A layout component that adds consistent spacing between child elements.
 * Supports horizontal and vertical directions, customizable gap sizes, element wrapping,
 * alignment, and optional split separators between items.
 * Part of the Rottay Design System's layout primitives collection.
 *
 * @remarks
 * The Space component simplifies the common task of adding uniform spacing between
 * inline or block elements without manual margin management. It provides:
 * - Preset sizes (sm, md, lg) or custom pixel values
 * - Horizontal and vertical directions
 * - Flexible wrapping for responsive layouts
 * - Alignment options (start, end, center, baseline)
 * - Split separators between child elements
 * - Support for asymmetric horizontal/vertical gaps via array syntax
 *
 * This component supports the Rottay multi-engine architecture:
 * - **Classic**: Wraps Ant Design's Space component with full feature parity
 * - **Modern**: Tailwind CSS implementation using flex and gap utilities
 * - **Rustic**: Pure CSS flexbox with inline styles
 *
 * @example Basic Horizontal Spacing
 * ```tsx
 * import { Space, Button } from '@rottay/design-system';
 *
 * <Space size="md">
 *   <Button>Button 1</Button>
 *   <Button>Button 2</Button>
 *   <Button>Button 3</Button>
 * </Space>
 * ```
 *
 * @example Vertical Spacing
 * ```tsx
 * import { Space, Input } from '@rottay/design-system';
 *
 * <Space direction="vertical" size="lg">
 *   <Input placeholder="Username" />
 *   <Input placeholder="Email" />
 *   <Input placeholder="Password" type="password" />
 * </Space>
 * ```
 *
 * @example With Split Separator
 * ```tsx
 * import { Space, Divider, Link } from '@rottay/design-system';
 *
 * <Space split={<Divider orientation="vertical" />}>
 *   <Link href="/home">Home</Link>
 *   <Link href="/about">About</Link>
 *   <Link href="/contact">Contact</Link>
 * </Space>
 * ```
 *
 * @example Custom Pixel Size
 * ```tsx
 * import { Space, Tag } from '@rottay/design-system';
 *
 * // 16px gap between items
 * <Space size={16}>
 *   <Tag>React</Tag>
 *   <Tag>TypeScript</Tag>
 *   <Tag>Vite</Tag>
 * </Space>
 * ```
 *
 * @example Asymmetric Gaps
 * ```tsx
 * import { Space, Card } from '@rottay/design-system';
 *
 * // [horizontal, vertical] gaps
 * <Space size={[8, 16]} wrap>
 *   <Card>Card 1</Card>
 *   <Card>Card 2</Card>
 *   <Card>Card 3</Card>
 * </Space>
 * ```
 *
 * @example Wrapping Layout
 * ```tsx
 * import { Space, Badge } from '@rottay/design-system';
 *
 * <Space wrap align="start">
 *   {tags.map(tag => (
 *     <Badge key={tag.id}>{tag.name}</Badge>
 *   ))}
 * </Space>
 * ```
 *
 * @example Engine Override
 * ```tsx
 * import { Space } from '@rottay/design-system';
 *
 * // Force Modern (Tailwind) implementation
 * <Space engine="modern" size="md" direction="vertical">
 *   <span>Item 1</span>
 *   <span>Item 2</span>
 * </Space>
 * ```
 *
 * @see {@link Stack} - For simpler stacking without split/wrap features
 * @see {@link Flex} - For more complex flexbox layouts
 * @see {@link Divider} - For visual separators
 *
 * @module Space
 * @category Layout
 * @package @rottay/design-system
 */
import type { ComponentRef, ForwardRefExoticComponent, PropsWithoutRef, RefAttributes } from "react";

import { createEngineComponent } from "../../../../infrastructure/runtime/engines/presentation/component-factory";
import type { SpaceEngineProps, SpaceSize } from "./contracts";

// Export types
export {
  type SpaceSize,
  type SpaceDirection,
  type SpaceAlign,
  SPACE_DEFAULTS,
  SPACE_SIZE_MAP,
  SPACE_ALIGN_MAP,
} from "./contracts";

/**
 * Props for the Space component.
 *
 * @example
 * ```tsx
 * <Space
 *   size="md"
 *   direction="horizontal"
 *   wrap={true}
 *   align="center"
 *   split={<Divider orientation="vertical" />}
 * >
 *   <Button>Action 1</Button>
 *   <Button>Action 2</Button>
 * </Space>
 * ```
 */
export interface SpaceProps extends Omit<SpaceEngineProps, "size"> {
  /**
   * Size of spacing between items.
   * - Preset: 'sm' | 'md' | 'lg'
   * - Number: Custom pixel value (e.g., 16)
   * - Array: [horizontal, vertical] gaps (e.g., [8, 16])
   * @default 'sm'
   */
  size?: SpaceSize | number | [number, number];
}

const SpaceBase = createEngineComponent<SpaceEngineProps>("Space", {
  classic: () => import("./engines/classic"),
  modern: () => import("./engines/modern"),
  rustic: () => import("./engines/rustic"),
});

/**
 * Space component with multi-engine support.
 *
 * A layout component that adds consistent spacing between child elements.
 * Supports horizontal/vertical direction, wrapping, alignment, and split separators.
 * The three engines read the `sm | md | lg` steps as given.
 *
 * @param props - Space component props
 * @returns React element
 */
export const Space: ForwardRefExoticComponent<
  PropsWithoutRef<SpaceProps> & RefAttributes<ComponentRef<typeof SpaceBase>>
> = SpaceBase;

export default Space;
