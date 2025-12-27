/**
 * Space - Engine Router
 *
 * This module exports the Space component with multi-engine support.
 * The Space component provides consistent spacing between elements
 * across Titan (Ant Design), Hermes (DaisyUI), and Apollo (Vanilla) engines.
 *
 * @module Space
 * @example
 * ```tsx
 * import { Space } from '@rottay/design-system';
 *
 * // Basic horizontal spacing
 * <Space size="middle">
 *   <Button>Button 1</Button>
 *   <Button>Button 2</Button>
 * </Space>
 *
 * // Vertical spacing
 * <Space direction="vertical" size="large">
 *   <Input placeholder="First" />
 *   <Input placeholder="Second" />
 * </Space>
 *
 * // With split separator
 * <Space split={<Divider type="vertical" />}>
 *   <Link>Link 1</Link>
 *   <Link>Link 2</Link>
 * </Space>
 * ```
 */
import { createEngineComponent } from '../../../../system/engines/factory';
import type { SpaceProps } from './types';

// Export types
export {
  type SpaceProps,
  type SpaceSize,
  type SpaceDirection,
  type SpaceAlign,
  SPACE_DEFAULTS,
  SPACE_SIZE_MAP,
  SPACE_ALIGN_MAP,
} from './types';

/**
 * Space component with multi-engine support.
 *
 * A layout component that adds consistent spacing between child elements.
 * Supports horizontal/vertical direction, wrapping, alignment, and split separators.
 *
 * @param props - Space component props
 * @returns React element
 */
export const Space = createEngineComponent<SpaceProps>('Space', {
  titan: () => import('./engines/titan'),
  hermes: () => import('./engines/hermes'),
  apollo: () => import('./engines/apollo'),
});

export default Space;
