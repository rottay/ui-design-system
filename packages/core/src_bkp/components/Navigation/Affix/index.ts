/**
 * Affix Component Exports
 */

export { Affix } from './Affix';

export type {
  AffixBaseProps,
  AffixProps,
} from './types';

// Engine exports for direct usage
export { default as TitanAffix } from './engines/titan';
export { default as HermesAffix } from './engines/hermes';
export { default as ApolloAffix } from './engines/apollo';
export { default as AthenaAffix } from './engines/athena';
