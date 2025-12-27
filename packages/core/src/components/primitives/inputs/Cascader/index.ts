/**
 * Cascader - Engine Router
 *
 * This module exports the Cascader component with multi-engine support.
 * Cascader provides hierarchical multi-level selection for nested data.
 *
 * @module Cascader
 * @example
 * ```tsx
 * import { Cascader } from '@rottay/design-system';
 *
 * // Basic usage
 * <Cascader
 *   options={[
 *     {
 *       value: 'zhejiang',
 *       label: 'Zhejiang',
 *       children: [
 *         { value: 'hangzhou', label: 'Hangzhou' },
 *       ],
 *     },
 *   ]}
 *   placeholder="Select location"
 * />
 *
 * // With onChange callback
 * <Cascader
 *   options={options}
 *   value={value}
 *   onChange={(val, opts) => setValue(val)}
 * />
 *
 * // Multiple selection
 * <Cascader options={options} multiple />
 *
 * // Expand on hover
 * <Cascader options={options} expandTrigger="hover" />
 * ```
 */
import { createEngineComponent } from '../../../../system/engines/factory';
import type { CascaderProps } from './types';

export {
  type CascaderProps,
  type CascaderOption,
  type CascaderValue,
  type CascaderSize,
  type CascaderExpandTrigger,
  CASCADER_DEFAULTS,
} from './types';

export const Cascader = createEngineComponent<CascaderProps>('Cascader', {
  titan: () => import('./engines/titan'),
  hermes: () => import('./engines/hermes'),
  apollo: () => import('./engines/apollo'),
});

export default Cascader;
