/**
 * @fileoverview misc patterns group barrel.
 * Miscellaneous patterns and families pending classification: tenant preview, user profile cards, file managers, pricing tables, page shells, headers.
 */

export * from './tenant-preview';
export * from './user-profile-card';
export * from './file-manager';
export * from './pricing-table';
export * from './cockpit-header';
export * from './workbench-header';
export * from './page-shell';
export * from './empty-state';
export { TokenInspector } from './token-inspector';
export { BrandingPreviewSandbox } from './branding-preview-sandbox';
export {
  PatternBrandStudio,
  serializeBrandTheme,
  deserializeBrandTheme,
  brandThemeToTenantAppearanceAdvanced,
} from './brand-studio';
export type {
  PatternBrandStudioProps,
  BrandStudioSurfaceConfig,
  BrandStudioSurfaceKey,
  BrandStudioGalleriesSlot,
  BrandStudioGalleryContext,
  BrandStudioContrastReport,
} from './brand-studio';
