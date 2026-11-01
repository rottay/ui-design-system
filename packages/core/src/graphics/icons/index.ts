/**
 * @fileoverview Icon exports - Rottay Design System
 * @description Private in-package barrel: named supplier glyphs, glyph factory
 * and contracts. The public entry is `@rottay/design-system/icons`.
 */

export { createIcon } from './glyphs/runtime/factory';
export type {
  DSIconComponent,
  DSIconProps,
  DSIconSourceComponent,
  IconSize,
} from './glyphs/runtime/factory';

export * from './glyphs/presentation/catalog';

export type { SvgIconProps, IconComponent } from './glyphs/foundation/contracts';

export { ICON_SIZE_MAP, ICON_SIZE_TOKENS } from './glyphs/foundation';
export type { IconSizeToken } from './glyphs/foundation';

export { BaseIcon } from './glyphs/foundation/contracts/base';
