/**
 * @fileoverview FloatButton Component - Rottay Design System
 * @description A floating action button component that provides quick access to primary actions.
 * Part of the Rottay Design System's navigation primitives collection.
 *
 * @remarks
 * The FloatButton component is built on Rottay's multi-engine architecture, allowing
 * seamless rendering across Titan (Ant Design), Hermes (DaisyUI), and Apollo
 * (Vanilla) engines. This ensures consistent behavior while adapting to your
 * project's styling framework.
 *
 * Multi-tenant theming is fully supported - float button styling automatically adapts
 * to your tenant's brand colors, spacing, and typography tokens.
 *
 * @example Basic Usage
 * ```tsx
 * import { FloatButton } from '@rottay/design-system';
 * import { PlusOutlined } from '@ant-design/icons';
 *
 * function MyComponent() {
 *   return (
 *     <FloatButton
 *       icon={<PlusOutlined />}
 *       tooltip="Add new item"
 *       onClick={() => console.log('clicked')}
 *     />
 *   );
 * }
 * ```
 *
 * @example With Compound Components (Group)
 * ```tsx
 * import { FloatButton } from '@rottay/design-system';
 * import { CustomerServiceOutlined, CommentOutlined, QuestionCircleOutlined } from '@ant-design/icons';
 *
 * <FloatButton.Group trigger="click" icon={<QuestionCircleOutlined />}>
 *   <FloatButton icon={<CommentOutlined />} tooltip="Comments" />
 *   <FloatButton icon={<CustomerServiceOutlined />} tooltip="Support" />
 * </FloatButton.Group>
 * ```
 *
 * @example BackTop Usage
 * ```tsx
 * import { FloatButton } from '@rottay/design-system';
 *
 * // Shows a back-to-top button when scrolled down
 * <FloatButton.BackTop
 *   visibilityHeight={200}
 *   tooltip="Back to top"
 *   type="primary"
 * />
 * ```
 *
 * @example Different Shapes and Types
 * ```tsx
 * // Circle (default)
 * <FloatButton shape="circle" type="default" icon={<PlusOutlined />} />
 *
 * // Square shape with primary type
 * <FloatButton shape="square" type="primary" icon={<EditOutlined />} />
 *
 * // With badge indicator
 * <FloatButton icon={<BellOutlined />} badge={{ count: 5 }} />
 *
 * // With dot badge
 * <FloatButton icon={<MessageOutlined />} badge={{ dot: true }} />
 * ```
 *
 * @example Multi-Tenant Theming
 * ```tsx
 * // FloatButton automatically inherits tenant theme
 * <ThemeProvider tenant="acme-corp">
 *   <FloatButton.Group>
 *     {/* Uses ACME Corp's brand colors and styling *\/}
 *     <FloatButton icon={<SettingOutlined />} />
 *   </FloatButton.Group>
 * </ThemeProvider>
 * ```
 *
 * @example Engine Override
 * ```tsx
 * // Force a specific rendering engine
 * <FloatButton engine="hermes" icon={<PlusOutlined />}>
 *   {/* Renders with DaisyUI/Tailwind styling *\/}
 * </FloatButton>
 * ```
 *
 * @see {@link FloatButtonProps} for complete prop documentation
 * @see {@link FloatButtonGroupProps} for group compound component props
 * @see {@link FloatButtonBackTopProps} for back-to-top compound component props
 *
 * @module FloatButton
 * @category Navigation
 * @package @rottay/design-system
 */

import { createEngineComponent } from '../../../../system/engines/factory';
import type { FloatButtonProps, FloatButtonGroupProps, FloatButtonBackTopProps } from './types';

// ============================================================================
// Type Exports
// ============================================================================

export {
  type FloatButtonProps,
  type FloatButtonGroupProps,
  type FloatButtonBackTopProps,
  FLOAT_BUTTON_DEFAULTS,
} from './types';

// ============================================================================
// Engine Component Factories
// ============================================================================

/**
 * Base FloatButton component created via engine factory.
 * @internal
 */
const FloatButtonBase = createEngineComponent<FloatButtonProps>('FloatButton', {
  /** Ant Design implementation - full-featured with animations */
  titan: () => import('./engines/titan').then(m => ({ default: m.FloatButton })),
  /** DaisyUI/Tailwind implementation - utility-first styling */
  hermes: () => import('./engines/hermes').then(m => ({ default: m.FloatButton })),
  /** Vanilla HTML/CSS implementation - zero dependencies */
  apollo: () => import('./engines/apollo').then(m => ({ default: m.FloatButton })),
});

/**
 * FloatButton.Group compound component created via engine factory.
 * Groups multiple float buttons with expandable trigger behavior.
 * @internal
 */
const Group = createEngineComponent<FloatButtonGroupProps>('FloatButton.Group', {
  /** Ant Design implementation - full-featured with animations */
  titan: () => import('./engines/titan').then(m => ({ default: m.Group })),
  /** DaisyUI/Tailwind implementation - utility-first styling */
  hermes: () => import('./engines/hermes').then(m => ({ default: m.Group })),
  /** Vanilla HTML/CSS implementation - zero dependencies */
  apollo: () => import('./engines/apollo').then(m => ({ default: m.Group })),
});

/**
 * FloatButton.BackTop compound component created via engine factory.
 * Provides scroll-to-top functionality with visibility threshold.
 * @internal
 */
const BackTop = createEngineComponent<FloatButtonBackTopProps>('FloatButton.BackTop', {
  /** Ant Design implementation - full-featured with animations */
  titan: () => import('./engines/titan').then(m => ({ default: m.BackTop })),
  /** DaisyUI/Tailwind implementation - utility-first styling */
  hermes: () => import('./engines/hermes').then(m => ({ default: m.BackTop })),
  /** Vanilla HTML/CSS implementation - zero dependencies */
  apollo: () => import('./engines/apollo').then(m => ({ default: m.BackTop })),
});

// ============================================================================
// Main Component with Compound Components
// ============================================================================

/**
 * FloatButton component with multi-engine support and compound components.
 *
 * @description
 * A floating action button that hovers above the UI. Ideal for:
 * - Primary actions (add, create, compose)
 * - Quick access menus (expandable groups)
 * - Scroll-to-top navigation
 * - Contextual shortcuts
 * - Help and support triggers
 *
 * @remarks
 * - Supports circle and square shapes
 * - Includes badge indicators (count or dot)
 * - Group component for expandable action menus
 * - BackTop component for scroll navigation
 * - Fully accessible with ARIA attributes
 * - Adapts to tenant theming automatically
 *
 * @param props - {@link FloatButtonProps}
 * @returns React component with Group and BackTop compound components
 *
 * @example
 * ```tsx
 * <FloatButton icon={<PlusOutlined />} onClick={handleAdd} tooltip="Add" />
 *
 * <FloatButton.Group trigger="hover">
 *   <FloatButton icon={<EditOutlined />} />
 *   <FloatButton icon={<ShareOutlined />} />
 * </FloatButton.Group>
 *
 * <FloatButton.BackTop visibilityHeight={300} />
 * ```
 */
export const FloatButton = Object.assign(FloatButtonBase, {
  /**
   * Group component for expandable float button menus.
   * Reveals child buttons on click or hover trigger.
   * @see {@link FloatButtonGroupProps}
   */
  Group,

  /**
   * BackTop component for scroll-to-top navigation.
   * Appears when scroll exceeds visibility threshold.
   * @see {@link FloatButtonBackTopProps}
   */
  BackTop,
});

export default FloatButton;
