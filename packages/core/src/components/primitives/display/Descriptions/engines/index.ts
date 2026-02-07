/**
 * @file Descriptions - Engine Implementations
 * @description Exports all engine implementations for the Descriptions component.
 * Each engine provides a different rendering strategy while maintaining
 * consistent API and functionality.
 */

export { default as classic } from './classic';
export { default as modern } from './modern';
export { default as rustic } from './rustic';

// Named exports for direct engine access
export {
  ClassicDescriptions,
  ClassicItem,
  Descriptions as ClassicDescriptionsAlias,
  Item as ClassicItemAlias,
} from './classic';

export {
  ModernDescriptions,
  ModernItem,
  Descriptions as ModernDescriptionsAlias,
  Item as ModernItemAlias,
} from './modern';

export {
  RusticDescriptions,
  RusticItem,
  Descriptions as RusticDescriptionsAlias,
  Item as RusticItemAlias,
} from './rustic';
