/**
 * @fileoverview Popover Component - Rottay Design System
 * @description A floating content panel that displays additional information or controls
 * when triggered by user interaction. Supports multiple trigger methods (click, hover, focus),
 * customizable placement with 12 position options, and optional title/content sections.
 *
 * @remarks
 * The Popover component is a versatile overlay for displaying rich content alongside
 * interactive elements. Unlike Tooltip (plain text), Popover supports complex content
 * including forms, lists, and interactive elements. It's commonly used for:
 * - Information panels and help text
 * - Settings and configuration panels
 * - User profile cards
 * - Rich contextual menus
 * - Quick-edit forms
 *
 * Key features:
 * - **Multi-engine support**: Titan (Ant Design), Hermes (DaisyUI), Apollo (Vanilla)
 * - **Flexible triggering**: Click, hover, or focus activation
 * - **12 placement positions**: Top, bottom, left, right with alignment variants
 * - **Controlled/uncontrolled**: Full state control or automatic management
 * - **Portal rendering**: Proper z-index stacking and scroll handling
 * - **Accessibility**: ARIA attributes for screen readers
 *
 * @example Basic popover with hover trigger
 * ```tsx
 * import { Popover, Button } from '@rottay/design-system';
 *
 * <Popover content="This is the popover content" title="Info">
 *   <Button>Hover me</Button>
 * </Popover>
 * ```
 *
 * @example Popover with click trigger and rich content
 * ```tsx
 * <Popover
 *   trigger="click"
 *   content={
 *     <div>
 *       <p>Custom content with <a href="#">links</a></p>
 *       <Button size="sm">Action</Button>
 *     </div>
 *   }
 *   title="Actions"
 * >
 *   <Button>Click me</Button>
 * </Popover>
 * ```
 *
 * @example Controlled popover with custom placement
 * ```tsx
 * const [isOpen, setIsOpen] = useState(false);
 *
 * <Popover
 *   open={isOpen}
 *   onOpenChange={setIsOpen}
 *   content="Controlled content"
 *   placement="rightTop"
 * >
 *   <span>Trigger element</span>
 * </Popover>
 * ```
 *
 * @example Multi-engine usage
 * ```tsx
 * // Titan engine (Ant Design - default)
 * <Popover engine="titan" content="Ant styled" title="Titan">
 *   <Button>Titan Popover</Button>
 * </Popover>
 *
 * // Hermes engine (DaisyUI/Tailwind)
 * <Popover engine="hermes" content="Tailwind styled" title="Hermes">
 *   <Button>Hermes Popover</Button>
 * </Popover>
 *
 * // Apollo engine (Pure HTML/CSS)
 * <Popover engine="apollo" content="Vanilla styled" title="Apollo">
 *   <Button>Apollo Popover</Button>
 * </Popover>
 * ```
 *
 * @see {@link PopoverProps} for available props
 * @see {@link PopoverTrigger} for trigger options
 * @see {@link PopoverPlacement} for placement options
 * @see {@link Tooltip} for simple text-only overlays
 * @module Popover
 * @category Overlay
 * @package @rottay/design-system
 */
import { createEngineComponent } from '../../../../core/engines/factory';
import type { PopoverProps } from './types';

export {
  type PopoverProps,
  type PopoverTrigger,
  type PopoverPlacement,
  POPOVER_DEFAULTS,
} from './types';

/**
 * Popover component with multi-engine support.
 * Displays floating content panels with various trigger methods.
 *
 * @param props - Popover configuration props
 * @param props.content - Content to display in the popover
 * @param props.title - Optional title for the popover
 * @param props.trigger - How to trigger the popover ('click' | 'hover' | 'focus')
 * @param props.placement - Position of the popover relative to trigger
 * @param props.open - Controlled open state
 * @param props.onOpenChange - Callback when open state changes
 * @param props.arrow - Whether to show arrow pointing to trigger
 * @param props.children - The trigger element
 * @returns The rendered Popover component
 */
export const Popover = createEngineComponent<PopoverProps>('Popover', {
  titan: () => import('./engines/titan'),
  hermes: () => import('./engines/hermes'),
  apollo: () => import('./engines/apollo'),
});

export default Popover;
