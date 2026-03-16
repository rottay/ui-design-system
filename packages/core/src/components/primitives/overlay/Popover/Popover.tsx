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
import { createEngineComponent } from '../../../../engines/factory';
import type { PopoverProps } from './Popover.types';

export {
  type PopoverProps,
  type PopoverTrigger,
  type PopoverPlacement,
  POPOVER_DEFAULTS,
} from './Popover.types';

/** Popover component with multi-engine support. No compound sub-components. */
export const Popover = createEngineComponent<PopoverProps>('Popover', {
  classic: () => import('./engines/classic'),  // Ant Design Popover
  modern: () => import('./engines/modern'),     // DaisyUI / Tailwind
  rustic: () => import('./engines/rustic'),      // Vanilla portal
});

export default Popover;
