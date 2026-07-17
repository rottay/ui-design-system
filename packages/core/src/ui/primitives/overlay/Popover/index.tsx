'use client';

/**
 * @fileoverview Popover - floating content panel for rich overlays.
 * Unlike Tooltip (plain text), Popover supports complex ReactNode content.
 * Triggers: click, hover, focus. 12 placement positions. Controlled/uncontrolled.
 * Multi-engine: Classic (Ant Design), Modern (DaisyUI), Rustic (Vanilla portal).
 *
 * @example
 * ```tsx
 * <Popover trigger="click" title="Settings" content={<SettingsPanel />}>
 *   <Button>Open</Button>
 * </Popover>
 * ```
 *
 * @module Popover
 * @category Overlay
 */
import { createEngineComponent } from '../../../../infrastructure/runtime/engines/presentation/component-factory';
import type { PopoverProps } from './contracts';

export {
  type PopoverProps,
  type PopoverTrigger,
  type PopoverPlacement,
  POPOVER_DEFAULTS,
} from './contracts';

/** Popover component with multi-engine support. No compound sub-components. */
export const Popover = createEngineComponent<PopoverProps>('Popover', {
  classic: () => import('./engines/classic'),  // Ant Design Popover
  modern: () => import('./engines/modern'),     // DaisyUI / Tailwind
  rustic: () => import('./engines/rustic'),      // Vanilla portal
});

export default Popover;
