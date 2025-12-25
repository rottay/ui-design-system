/**
 * Timeline Component Exports
 */

export { Timeline } from './Timeline';

export type {
  TimelineItem,
  TimelineMode,
  TimelineProps,
} from './types';

export {
  getDotColorClass,
  getDotColorStyle,
  getItemPosition,
} from './types';

// Engine exports for direct usage
export { default as TitanTimeline } from './engines/titan';
export { default as HermesTimeline } from './engines/hermes';
export { default as ApolloTimeline } from './engines/apollo';
export { default as AthenaTimeline } from './engines/athena';
