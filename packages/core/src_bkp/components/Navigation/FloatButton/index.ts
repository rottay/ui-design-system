/**
 * FloatButton Component Exports
 */

export { FloatButton } from './FloatButton';

export type {
  FloatButtonBaseProps,
  FloatButtonProps,
  FloatButtonType,
  FloatButtonShape,
  FloatButtonBadge,
  FloatButtonGroupProps,
  FloatButtonGroupTrigger,
  FloatButtonBackTopProps,
} from './types';

// Engine exports for direct usage
export { default as TitanFloatButton } from './engines/titan';
export { default as HermesFloatButton } from './engines/hermes';
export { default as ApolloFloatButton } from './engines/apollo';
export { default as AthenaFloatButton } from './engines/athena';
