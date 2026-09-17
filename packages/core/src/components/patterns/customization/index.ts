/** Tenant and brand customization patterns. */
export * from './tenant-preview';
export { TokenInspector } from './token-inspector';
export { BrandingPreviewSandbox } from './branding-preview-sandbox';
export {
  PatternBrandStudio,
  serializeThemeDraft,
  deserializeThemeDraft,
  // SUPERSEDED (WO-DER-08): the flat pair stays published for one window so a
  // consumer moves on its own schedule. End trigger in the file-export owner.
  serializeFlatTheme,
  deserializeFlatTheme,
  flatThemeToTenantAppearance,
  flatThemeToTenantAppearanceAdvanced,
} from './brand-studio';
export type {
  BrandStudioDraft,
  PatternBrandStudioProps,
  BrandStudioSurfaceConfig,
  BrandStudioSurfaceKey,
  BrandStudioGalleriesSlot,
  BrandStudioGalleryContext,
  BrandStudioContrastReport,
} from './brand-studio';
export {
  useTenantThemePreview,
  compileTenantThemePreview,
  buildTenantThemePreviewScope,
  probeTenantThemePackWarnings,
  selectTenantThemeAdjustments,
  PREVIEW_SCOPE_ATTRIBUTE,
  DEFAULT_TENANT_THEME_PREVIEW_DEBOUNCE_MS,
  TenantThemePreviewReport,
} from './brand-studio';
export type {
  UseTenantThemePreviewInput,
  UseTenantThemePreviewResult,
  TenantThemePreviewScope,
  TenantThemeContrastAdjustment,
  TenantThemePackWarning,
  ProbeTenantThemePackWarningsOptions,
  TenantThemePreviewReportProps,
  BrandStudioTenantThemePreviewConfig,
  BrandStudioTenantThemeGalleriesSlot,
} from './brand-studio';
