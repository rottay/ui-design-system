'use client';

/**
 * @fileoverview FloatButton -- floating action button with expandable group
 * and BackTop sub-components. Supports circle/square shapes and badge indicators.
 *
 * @example
 * ```tsx
 * import { FloatButton } from '@rottay/design-system';
 *
 * // Single action
 * <FloatButton icon={<PlusOutlined />} tooltip="Add" onClick={handleAdd} />
 *
 * // Expandable group
 * <FloatButton.Group trigger="click" icon={<QuestionCircleOutlined />}>
 *   <FloatButton icon={<CommentOutlined />} tooltip="Comments" />
 *   <FloatButton icon={<CustomerServiceOutlined />} tooltip="Support" />
 * </FloatButton.Group>
 *
 * // Scroll-to-top
 * <FloatButton.BackTop visibilityHeight={200} />
 * ```
 *
 * @module FloatButton
 * @category Navigation
 */

import { createEngineComponent } from '../../../../infrastructure/runtime/engines/presentation/component-factory';
import type { FloatButtonProps, FloatButtonGroupProps, FloatButtonBackTopProps } from './contracts';

export {
  type FloatButtonProps,
  type FloatButtonGroupProps,
  type FloatButtonBackTopProps,
  FLOAT_BUTTON_DEFAULTS,
} from './contracts';

/** @internal Base float button resolved via engine factory. */
const FloatButtonBase = createEngineComponent<FloatButtonProps>('FloatButton', {
  /** Ant Design implementation - full-featured with animations */
  classic: () => import('./engines/classic').then(m => ({ default: m.FloatButton })),
  /** DaisyUI/Tailwind implementation - utility-first styling */
  modern: () => import('./engines/modern').then(m => ({ default: m.FloatButton })),
  /** Vanilla HTML/CSS implementation - zero dependencies */
  rustic: () => import('./engines/rustic').then(m => ({ default: m.FloatButton })),
});

/** @internal Expandable group that reveals child float buttons on click/hover. */
const Group = createEngineComponent<FloatButtonGroupProps>('FloatButton.Group', {
  /** Ant Design implementation - full-featured with animations */
  classic: () => import('./engines/classic').then(m => ({ default: m.Group })),
  /** DaisyUI/Tailwind implementation - utility-first styling */
  modern: () => import('./engines/modern').then(m => ({ default: m.Group })),
  /** Vanilla HTML/CSS implementation - zero dependencies */
  rustic: () => import('./engines/rustic').then(m => ({ default: m.Group })),
});

/** @internal Scroll-to-top variant with visibility threshold. */
const BackTop = createEngineComponent<FloatButtonBackTopProps>('FloatButton.BackTop', {
  /** Ant Design implementation - full-featured with animations */
  classic: () => import('./engines/classic').then(m => ({ default: m.BackTop })),
  /** DaisyUI/Tailwind implementation - utility-first styling */
  modern: () => import('./engines/modern').then(m => ({ default: m.BackTop })),
  /** Vanilla HTML/CSS implementation - zero dependencies */
  rustic: () => import('./engines/rustic').then(m => ({ default: m.BackTop })),
});

// Assemble compound component: FloatButton + FloatButton.Group + FloatButton.BackTop
export const FloatButton = Object.assign(FloatButtonBase, {
  /** Expandable group that reveals child buttons on click or hover. */
  Group,
  /** Scroll-to-top button that appears when scroll exceeds threshold. */
  BackTop,
});

export default FloatButton;
