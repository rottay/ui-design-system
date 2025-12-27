/**
 * Popover Component
 *
 * A floating content panel that displays additional information or controls
 * when triggered by user interaction. Supports multiple trigger methods,
 * customizable placement, and optional title/content sections.
 *
 * @component
 * @example
 * ```tsx
 * // Basic popover with hover trigger
 * <Popover content="This is the popover content" title="Info">
 *   <Button>Hover me</Button>
 * </Popover>
 *
 * // Popover with click trigger
 * <Popover
 *   trigger="click"
 *   content={<div>Custom content with <a href="#">links</a></div>}
 *   title="Actions"
 * >
 *   <Button>Click me</Button>
 * </Popover>
 *
 * // Controlled popover
 * <Popover
 *   open={isOpen}
 *   onOpenChange={setIsOpen}
 *   content="Controlled content"
 *   placement="right"
 * >
 *   <span>Trigger element</span>
 * </Popover>
 *
 * // Popover without arrow
 * <Popover content="No arrow" arrow={false}>
 *   <Button>Hover</Button>
 * </Popover>
 * ```
 *
 * @see {@link PopoverProps} for available props
 * @see {@link PopoverTrigger} for trigger options
 * @see {@link PopoverPlacement} for placement options
 */
import { createEngineComponent } from '../../../../system/engines/factory';
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
