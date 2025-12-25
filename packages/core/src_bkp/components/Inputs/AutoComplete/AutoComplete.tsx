'use client';

import { createEngineComponent, lazyEngine } from '../../../engine/createEngineComponent';
import type { AutoCompleteProps } from './types';
import TitanAutoComplete from './engines/titan';

/**
 * AutoComplete Component
 *
 * Multi-engine autocomplete that automatically uses the correct implementation
 * based on the current engine context.
 *
 * Engines:
 * - titan: Ant Design AutoComplete (default, full featured)
 * - hermes: DaisyUI-based autocomplete (lazy loaded)
 * - apollo: Native HTML + Tailwind autocomplete (lazy loaded)
 * - athena: Re-exports apollo implementation
 *
 * @example
 * ```tsx
 * // Basic usage
 * <AutoComplete
 *   options={['Option 1', 'Option 2', 'Option 3']}
 *   placeholder="Search..."
 * />
 *
 * // With custom options
 * <AutoComplete
 *   options={[
 *     { value: '1', label: 'First option' },
 *     { value: '2', label: 'Second option' },
 *   ]}
 *   onSelect={(value, option) => console.log(value, option)}
 * />
 *
 * // With filtering
 * <AutoComplete
 *   options={options}
 *   filterOption={(input, option) =>
 *     option.label.toLowerCase().includes(input.toLowerCase())
 *   }
 * />
 * ```
 */
export const AutoComplete = createEngineComponent<AutoCompleteProps>(
  {
    titan: TitanAutoComplete,
    hermes: lazyEngine(() =>
      import('./engines/hermes').then((m) => ({
        default: m.default,
      }))
    ),
    apollo: lazyEngine(() =>
      import('./engines/apollo').then((m) => ({
        default: m.default,
      }))
    ),
    athena: lazyEngine(() =>
      import('./engines/athena').then((m) => ({
        default: m.default,
      }))
    ),
  },
  { displayName: 'AutoComplete' }
);
