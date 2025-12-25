/**
 * Design System Types
 *
 * Core type definitions for the design system.
 */

// Engine types
export * from './engine';
export type {
  Engine,
  EngineFeatures,
} from './engine';
export {
  ENGINE_LIBRARY_MAP,
  ENGINE_FEATURES,
  DEFAULT_ENGINE,
  ENGINES,
} from './engine';

// Component types
export * from './components';

// Re-export theme types from themes for convenience
export type { TemplateName, TemplateConfig } from '../themes/types';
