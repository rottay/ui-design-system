/**
 * Showroom Data Layer - Barrel Export
 *
 * Exports the component registry and navigation tree that drive
 * the showroom sidebar, pages, and search.
 */

// Registry
export {
  // Primitives
  primitives,
  primitivesByCategory,
  primitiveCategories,
  // Patterns
  patterns,
  patternsByGroup,
  patternGroups,
  // Structures
  structures,
  structuresByGroup,
  structureGroups,
  // Surfaces
  surfaces,
  surfacesByGroup,
  surfaceGroups,
  // Charts
  charts,
  chartsByFamily,
  chartFamilies,
  // Icons
  icons,
  iconsByCategory,
  iconCategories,
} from './registry';

export type {
  PrimitiveEntry,
  PrimitiveCategory,
  EngineName,
  PatternEntry,
  PatternGroup,
  StructureEntry,
  StructureGroup,
  SurfaceEntry,
  SurfaceGroup,
  ChartEntry,
  ChartFamily,
  IconEntry,
  IconCategory,
} from './registry';

// Navigation
export { navigation, getAllPaths } from './navigation';
export type { NavItem, NavSection } from './navigation';
