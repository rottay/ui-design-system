/**
 * @file Descriptions - Engine Implementations
 * @description Exports all engine implementations for the Descriptions component.
 * Each engine provides a different rendering strategy while maintaining
 * consistent API and functionality.
 */

export { default as titan } from './titan';
export { default as hermes } from './hermes';
export { default as apollo } from './apollo';

// Named exports for direct engine access
export {
  TitanDescriptions,
  TitanItem,
  Descriptions as TitanDescriptionsAlias,
  Item as TitanItemAlias,
} from './titan';

export {
  HermesDescriptions,
  HermesItem,
  Descriptions as HermesDescriptionsAlias,
  Item as HermesItemAlias,
} from './hermes';

export {
  ApolloDescriptions,
  ApolloItem,
  Descriptions as ApolloDescriptionsAlias,
  Item as ApolloItemAlias,
} from './apollo';
