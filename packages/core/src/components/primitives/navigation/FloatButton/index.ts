/**
 * FloatButton - Engine Router (Compound Component)
 */
import { createEngineComponent } from '../../../../system/engines/factory';
import type { FloatButtonProps, FloatButtonGroupProps, FloatButtonBackTopProps } from './types';

export {
  type FloatButtonProps,
  type FloatButtonGroupProps,
  type FloatButtonBackTopProps,
  FLOAT_BUTTON_DEFAULTS,
} from './types';

const FloatButtonBase = createEngineComponent<FloatButtonProps>('FloatButton', {
  titan: () => import('./engines/titan').then(m => ({ default: m.FloatButton })),
  hermes: () => import('./engines/hermes').then(m => ({ default: m.FloatButton })),
  apollo: () => import('./engines/apollo').then(m => ({ default: m.FloatButton })),
});

const Group = createEngineComponent<FloatButtonGroupProps>('FloatButton.Group', {
  titan: () => import('./engines/titan').then(m => ({ default: m.Group })),
  hermes: () => import('./engines/hermes').then(m => ({ default: m.Group })),
  apollo: () => import('./engines/apollo').then(m => ({ default: m.Group })),
});

const BackTop = createEngineComponent<FloatButtonBackTopProps>('FloatButton.BackTop', {
  titan: () => import('./engines/titan').then(m => ({ default: m.BackTop })),
  hermes: () => import('./engines/hermes').then(m => ({ default: m.BackTop })),
  apollo: () => import('./engines/apollo').then(m => ({ default: m.BackTop })),
});

export const FloatButton = Object.assign(FloatButtonBase, {
  Group,
  BackTop,
});

export default FloatButton;
