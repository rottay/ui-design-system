/**
 * @fileoverview Icon exports - Rottay Design System
 * @description Public compatibility barrel. The supplier-independent semantic
 * Icon facade and generated named packs are the default product API; the
 * historical named catalog remains available during its one-minor migration.
 */

// One-minor named-icon compatibility factory
export { createIcon } from './runtime/factory';
export type {
  DSIconComponent,
  DSIconProps,
  DSIconSourceComponent,
  IconSize,
} from './runtime/factory';

// Compatibility catalog (historical names; do not use for new roles)
export * from './presentation/catalog';

// Types
export type { SvgIconProps, IconComponent } from './foundation/contracts';
export { ICON_SIZE_MAP } from './foundation/contracts';

// Token references
export { ICON_SIZE_TOKENS } from './foundation';
export type { IconSizeToken } from './foundation';

// Legacy hand-rolled components (backward compatibility)
// These are kept for existing consumers. New code should use semantic Icon
// roles or a focused generated pack from @rottay/design-system/icons/*.
export {
  AlertIcon,
  LoaderIcon,
} from './presentation/legacy';
export { BaseIcon } from './foundation/contracts/base';

// The following legacy components have catalog equivalents with the same name.
// They are intentionally NOT re-exported here to avoid conflicts.
// Legacy: UserIcon, UsersIcon, CheckIcon, XIcon, InfoIcon,
//   ChevronDownIcon, ChevronUpIcon, ChevronLeftIcon, ChevronRightIcon,
//   SearchIcon, EyeIcon, EyeOffIcon, CameraIcon
// Use the catalog versions instead (imported from './catalog').
