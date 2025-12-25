/**
 * Anchor Component Exports
 */

export { Anchor } from './Anchor';

export type {
  AnchorBaseProps,
  AnchorProps,
  AnchorLinkItem,
  AnchorDirection,
} from './types';

export {
  getAnchorElement,
  scrollToAnchor,
  getActiveAnchor,
  flattenItems,
} from './types';

// Engine exports for direct usage
export { default as TitanAnchor } from './engines/titan';
export { default as HermesAnchor } from './engines/hermes';
export { default as ApolloAnchor } from './engines/apollo';
export { default as AthenaAnchor } from './engines/athena';
