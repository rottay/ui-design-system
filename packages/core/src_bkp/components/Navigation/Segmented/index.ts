/**
 * Segmented Component Exports
 */

export { Segmented } from './Segmented';

export type {
  SegmentedBaseProps,
  SegmentedProps,
  SegmentedValue,
  SegmentedOption,
  SegmentedSize,
} from './types';

export {
  normalizeOption,
  normalizeOptions,
  getSizeClasses,
} from './types';

// Engine exports for direct usage
export { default as TitanSegmented } from './engines/titan';
export { default as HermesSegmented } from './engines/hermes';
export { default as ApolloSegmented } from './engines/apollo';
export { default as AthenaSegmented } from './engines/athena';
