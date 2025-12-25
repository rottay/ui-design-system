/**
 * Statistic Component Exports
 */

export { Statistic } from './Statistic';

export type {
  StatisticBaseProps,
  StatisticProps,
  CountdownProps,
} from './types';

export {
  formatNumber,
  parseCountdownFormat,
  getTimeDiff,
} from './types';

// Engine exports for direct usage
export { default as TitanStatistic } from './engines/titan';
export { default as HermesStatistic } from './engines/hermes';
export { default as ApolloStatistic } from './engines/apollo';
export { default as AthenaStatistic } from './engines/athena';
