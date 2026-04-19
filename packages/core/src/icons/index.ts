/**
 * @fileoverview Icon exports - Rottay Design System
 * @description Public barrel for shared icon primitives, the createIcon factory,
 * the full catalog of DS-wrapped lucide icons, and legacy hand-rolled components.
 */

// Factory
export { createIcon } from './factory';
export type { DSIconProps, IconSize } from './factory';

// Catalog (DS-wrapped lucide icons)
export * from './catalog';

// Types
export type { SvgIconProps, IconComponent } from './types';
export { ICON_SIZE_MAP } from './types';

// Token references
export { ICON_SIZE_TOKENS } from './tokens';
export type { IconSizeToken } from './tokens';

// Legacy hand-rolled components (backward compatibility)
// These are kept for existing consumers. New code should use the catalog icons.
export {
  BaseIcon,
  AlertIcon,
  LoaderIcon,
} from './components';

// The following legacy components have catalog equivalents with the same name.
// They are intentionally NOT re-exported here to avoid conflicts.
// Legacy: UserIcon, UsersIcon, CheckIcon, XIcon, InfoIcon,
//   ChevronDownIcon, ChevronUpIcon, ChevronLeftIcon, ChevronRightIcon,
//   SearchIcon, EyeIcon, EyeOffIcon, CameraIcon
// Use the catalog versions instead (imported from './catalog').
