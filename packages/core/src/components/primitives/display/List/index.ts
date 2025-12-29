/**
 * @fileoverview List - Rottay Design System
 * @description Versatile list component for displaying collections of items.
 * Part of the Rottay Design System's display primitives collection.
 *
 * @remarks
 * **Multi-Engine Architecture:**
 * - **Titan**: Ant Design List with full feature support
 * - **Hermes**: DaisyUI/Tailwind list with responsive design
 * - **Apollo**: Pure CSS list with maximum accessibility
 *
 * **Key Features:**
 * - Bordered and borderless variants
 * - Header and footer support
 * - Loading states with skeleton
 * - Multiple sizes (small, default, large)
 * - Horizontal and vertical layouts
 * - Grid layout support
 * - Pagination integration
 * - Item actions
 * - Item metadata (avatar, title, description)
 *
 * **Compound Components:**
 * - `List.Item` - Individual list item container
 * - `List.Item.Meta` - Structured metadata display
 *
 * **Data Rendering:**
 * - Declarative: Use `List.Item` children
 * - Dynamic: Use `dataSource` + `renderItem`
 *
 * @example Declarative Usage
 * ```tsx
 * import { List, Avatar } from '@rottay/design-system';
 *
 * <List bordered>
 *   <List.Item>
 *     <List.Item.Meta
 *       avatar={<Avatar src="/user.jpg" />}
 *       title="John Doe"
 *       description="Software Engineer"
 *     />
 *   </List.Item>
 * </List>
 * ```
 *
 * @example Dynamic Rendering
 * ```tsx
 * <List
 *   dataSource={users}
 *   renderItem={(user) => (
 *     <List.Item actions={[<Button>Edit</Button>]}>
 *       <List.Item.Meta title={user.name} description={user.email} />
 *     </List.Item>
 *   )}
 *   pagination={{ pageSize: 10 }}
 * />
 * ```
 *
 * @example Grid Layout
 * ```tsx
 * <List
 *   dataSource={products}
 *   grid={{ column: 3, gutter: 16 }}
 *   renderItem={(product) => (
 *     <List.Item>
 *       <Card>{product.name}</Card>
 *     </List.Item>
 *   )}
 * />
 * ```
 *
 * @see {@link ListProps} for available props
 * @see {@link ListItemProps} for item props
 * @see {@link ListItemMetaProps} for metadata props
 * @module List
 * @category Display
 * @package @rottay/design-system
 */
import { createEngineComponent } from '../../../../core/engines/factory';
import type { ListProps, ListItemProps, ListItemMetaProps } from './types';

export {
  type ListProps,
  type ListItemProps,
  type ListItemMetaProps,
  LIST_DEFAULTS,
} from './types';

const ListBase = createEngineComponent<ListProps>('List', {
  titan: () => import('./engines/titan').then(m => ({ default: m.List })),
  hermes: () => import('./engines/hermes').then(m => ({ default: m.List })),
  apollo: () => import('./engines/apollo').then(m => ({ default: m.List })),
});

const Item = createEngineComponent<ListItemProps>('List.Item', {
  titan: () => import('./engines/titan').then(m => ({ default: m.Item })),
  hermes: () => import('./engines/hermes').then(m => ({ default: m.Item })),
  apollo: () => import('./engines/apollo').then(m => ({ default: m.Item })),
});

const Meta = createEngineComponent<ListItemMetaProps>('List.Item.Meta', {
  titan: () => import('./engines/titan').then(m => ({ default: m.Meta })),
  hermes: () => import('./engines/hermes').then(m => ({ default: m.Meta })),
  apollo: () => import('./engines/apollo').then(m => ({ default: m.Meta })),
});

export const List = Object.assign(ListBase, {
  Item: Object.assign(Item, { Meta }),
});

export default List;
