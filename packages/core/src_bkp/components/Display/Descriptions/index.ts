/**
 * Descriptions Component Exports
 */

export { Descriptions } from './Descriptions';

export type {
  DescriptionsItem,
  DescriptionsLayout,
  DescriptionsSize,
  DescriptionsProps,
  DescriptionsItemProps,
} from './types';

export {
  getResponsiveColumn,
  distributeItemsIntoRows,
  getSizeClasses,
} from './types';

// Engine exports for direct usage
export { default as TitanDescriptions } from './engines/titan';
export { default as HermesDescriptions } from './engines/hermes';
export { default as ApolloDescriptions } from './engines/apollo';
export { default as AthenaDescriptions } from './engines/athena';
