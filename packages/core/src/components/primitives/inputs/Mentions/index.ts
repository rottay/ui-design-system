/**
 * Mentions - Engine Router
 *
 * This module exports the Mentions component with multi-engine support.
 * Mentions provides @mentions functionality in text input with dropdown suggestions.
 *
 * @module Mentions
 * @example
 * ```tsx
 * import { Mentions } from '@rottay/design-system';
 *
 * // Basic usage
 * <Mentions
 *   options={[
 *     { value: 'john', label: 'John Doe' },
 *     { value: 'jane', label: 'Jane Smith' },
 *   ]}
 *   placeholder="Type @ to mention"
 * />
 *
 * // With search callback
 * <Mentions
 *   options={filteredOptions}
 *   onSearch={(text, prefix) => filterOptions(text)}
 * />
 *
 * // Custom prefix
 * <Mentions options={tags} prefix="#" />
 *
 * // Multiple prefixes
 * <Mentions options={options} prefix={['@', '#']} />
 * ```
 */
import { createEngineComponent } from '../../../../system/engines/factory';
import type { MentionsProps } from './types';

export {
  type MentionsProps,
  type MentionsOption,
  type MentionsPlacement,
  type MentionsStatus,
  MENTIONS_DEFAULTS,
} from './types';

export const Mentions = createEngineComponent<MentionsProps>('Mentions', {
  titan: () => import('./engines/titan'),
  hermes: () => import('./engines/hermes'),
  apollo: () => import('./engines/apollo'),
});

export default Mentions;
