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
 *   action={<Button>Renew</Button>} emphasis="subtle" announce="tone" closable />
 * ```
 *
 * @module Callout
 * @category Display
 */

import { createEngineComponent } from '../../../../infrastructure/runtime/engines/presentation/component-factory';
import type { CalloutPublicProps } from './contracts';
import { loadModernCallout } from '../../feedback/alert';

export {
  type CalloutPublicProps as CalloutProps,
  type CalloutTone,
  CALLOUT_DEFAULTS,
  CALLOUT_COLORS,
} from './contracts';

export const Callout = createEngineComponent<CalloutPublicProps>('Callout', {
  classic: () => import('./engines/classic'),
  modern: loadModernCallout,
  rustic: () => import('./engines/rustic'),
});

Callout.displayName = 'Callout';
