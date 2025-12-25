/**
 * BackTop Component Exports
 */

export { BackTop } from './BackTop';

export type {
  BackTopBaseProps,
  BackTopProps,
} from './types';

export {
  DEFAULT_BACKTOP_ICON,
  scrollToTop,
  getScrollTop,
} from './types';

// Engine exports for direct usage
export { default as TitanBackTop } from './engines/titan';
export { default as HermesBackTop } from './engines/hermes';
export { default as ApolloBackTop } from './engines/apollo';
export { default as AthenaBackTop } from './engines/athena';
