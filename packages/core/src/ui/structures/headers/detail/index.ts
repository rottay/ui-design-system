'use client';

/**
 * @fileoverview DetailHeader — structures-tier detail-page header with back
 * navigation, breadcrumb trail, hero identity cluster, status badge, action
 * rail, optional metadata region, optional tab strip and optional
 * context-rail slot.
 *
 * @description
 * DetailHeader is chrome, not a surface: it wraps the top of an entity-detail
 * page. Pairs with the `record` building blocks (`RecordField`,
 * `RecordFieldGrid`) and with `form-sections` (`FormSections`) to compose a
 * full detail screen. Use it when a rich detail-page header is wanted without
 * committing to the full `DetailSurface` config contract.
 *
 * Engine-free: it composes engine-switched primitives (Badge, Breadcrumb,
 * Button, Tooltip), which resolve through the engine system themselves, so
 * one DOM tree serves every engine and one skin paints it.
 *
 * @module Structures/Headers/DetailHeader
 * @category Structure
 * @package @rottay/design-system
 */

export type {
  DetailHeaderAction,
  DetailHeaderArchetype,
  DetailHeaderIcon,
  DetailHeaderMetadataItem,
  DetailHeaderProps,
  DetailHeaderStatus,
  DetailHeaderTab,
} from './contracts';
export { DETAIL_HEADER_DEFAULTS } from './contracts';

export { DetailHeader, default } from './runtime/rendering';
