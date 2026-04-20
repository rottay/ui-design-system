/**
 * Component Registry - Barrel Export
 *
 * Central catalog of all design system components, charts, and icons.
 */

// Primitives
export {
  primitives,
  primitivesByCategory,
  primitiveCategories,
} from './primitives';
export type { PrimitiveEntry, PrimitiveCategory, EngineName } from './primitives';

// Patterns
export {
  patterns,
  patternsByGroup,
  patternGroups,
} from './patterns';
export type { PatternEntry, PatternGroup } from './patterns';

// Structures
export {
  structures,
  structuresByGroup,
  structureGroups,
} from './structures';
export type { StructureEntry, StructureGroup } from './structures';

// Surfaces
export {
  surfaces,
  surfacesByGroup,
  surfaceGroups,
} from './surfaces';
export type { SurfaceEntry, SurfaceGroup } from './surfaces';

// Charts
export {
  charts,
  chartsByFamily,
  chartFamilies,
} from './charts';
export type { ChartEntry, ChartFamily } from './charts';

// Icons
export {
  icons,
  iconsByCategory,
  iconCategories,
} from './icons';
export type { IconEntry, IconCategory } from './icons';
