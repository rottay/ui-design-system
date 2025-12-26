/**
 * Typography - Engine Implementations
 *
 * Exports all engine-specific implementations of Typography components.
 * Each engine provides Heading, Text, and Paragraph components.
 *
 * @module Typography/engines
 */

// Titan (Ant Design) engine exports
export {
  default as titan,
  TitanHeading,
  TitanText,
  TitanParagraph,
} from './titan';

// Hermes (DaisyUI/Tailwind) engine exports
export {
  default as hermes,
  HermesHeading,
  HermesText,
  HermesParagraph,
} from './hermes';

// Apollo (Vanilla/CSS) engine exports
export {
  default as apollo,
  ApolloHeading,
  ApolloText,
  ApolloParagraph,
} from './apollo';
