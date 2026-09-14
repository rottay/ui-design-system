'use client';

/**
 * @fileoverview Callout - folded into Alert.
 * Callout is Alert with a title, a body and an action tray; the Modern engine
 * renders both through one alert surface.
 *
 * @example Migration
 * ```tsx
 * // Before
 * <Callout tone="warning" title="Attention" action={<Button>Renew</Button>} closable>
 *   Your subscription expires in 3 days.
 * </Callout>
 * // After
 * <Alert tone="warning" message="Attention" description="Your subscription expires in 3 days."
 *   action={<Button>Renew</Button>} closable />
 * ```
 *
 * @module Callout
 * @category Display
 */

import { createEngineComponent } from '../../../../infrastructure/runtime/engines/presentation/component-factory';
import type { CalloutProps } from './contracts';
import { loadModernCallout } from '../../feedback/alert';

export {
  type CalloutProps,
  type CalloutVariant,
  type CalloutTone,
  CALLOUT_DEFAULTS,
  CALLOUT_COLORS,
  TONE_TO_CALLOUT_VARIANT,
} from './contracts';

/** @deprecated Callout is folded into Alert: use `<Alert message description action />`. */
export const Callout = createEngineComponent<CalloutProps>('Callout', {
  classic: () => import('./engines/classic'),
  modern: loadModernCallout,
  rustic: () => import('./engines/rustic'),
});

Callout.displayName = 'Callout';
