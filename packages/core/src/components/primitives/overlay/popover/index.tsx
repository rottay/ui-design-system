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
import { isFrozenEngineName } from '@/foundation/contracts/kernel/engine-identity';
import type { PopoverProps } from './contracts';

export {
  type PopoverProps,
  type PopoverTrigger,
  type PopoverPlacement,
  type PopoverRecipe,
  type PopoverDensity,
  type PopoverRole,
  type PopoverTouchBehavior,
  POPOVER_DEFAULTS,
} from './contracts';

/** Popover component with multi-engine support. No compound sub-components. */
export const Popover = createEngineComponent<PopoverProps>(
  'Popover',
  {
    classic: () => import('./engines/classic'),  // Ant Design Popover
    modern: () => import('./engines/modern'),     // Token-owned Modern overlay
    rustic: () => import('./engines/rustic'),      // Vanilla portal
  },
  {
    // The anchored mode exists only in the Modern engine; a frozen engine
    // would render its own trigger wrapper and ignore the external anchor.
    admitProps: ({ anchor }, engine) =>
      anchor !== undefined && isFrozenEngineName(engine)
        ? `the anchored mode (\`anchor\`) is implemented by the modern engine only; the frozen "${engine}" engine cannot pin a surface to a caller-owned element. This refusal is development-only.`
        : undefined,
  }
);

export default Popover;
