/**
 * @fileoverview Icon exports - Rottay Design System
 * @description Public icon barrel. The supplier-independent semantic Icon
 * facade, generated named packs, and named glyph catalog share this API.
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
export { ICON_SIZE_MAP } from './glyphs/foundation/contracts';

export { ICON_SIZE_TOKENS } from './glyphs/foundation';
export type { IconSizeToken } from './glyphs/foundation';

export { BaseIcon } from './glyphs/foundation/contracts/base';
