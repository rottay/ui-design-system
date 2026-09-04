/**
 * @fileoverview PatternBrandStudio public types.
 *
 * PatternBrandStudio edits a bounded BrandTheme and renders a live, dual-ground
 * preview. It is domain-agnostic: the component knows nothing about tenants,
 * candidates, events, or any product vocabulary. Real component galleries are
 * supplied by the consumer through the {@link BrandStudioGalleriesSlot} render
 * slot so the design system never depends on a product surface.
 *
 * @module Patterns/Customization/BrandStudio/Contracts
 * @package @rottay/design-system
 */

import type { ReactNode } from 'react';
import type { BrandTheme } from '../../../../../foundation/contracts/composition/tenants/themes';
import type {
  TenantThemeArtifact,
  TenantThemeConfigIdentity,
  TenantThemeDocument,
  TenantThemeVerticalEnvelope,
} from '../../../../../foundation/contracts/composition/tenants/themes/tenant-theme';
import type {
  BrandingColors,
  ContrastViolation,
  ContrastSuggestion,
} from '@/foundation/kernel/accessibility/branding-contrast';

/** Which ground a preview panel renders the in-flight theme against. */
export type BrandStudioSurfaceKey = 'light' | 'dark';

/**
 * Configuration for one preview ground.
 *
 * The ground itself is design-system-owned and selected by {@link baseTheme}:
 * the brand compiler emits only the overrides a theme sets, so each panel needs
 * a neutral background/text/border/surface scaffold underneath the compiled
 * edit, and that scaffold is the DS's own. It is not a consumer input. A raw
 * `--ds-*` map supplied here would enter AFTER compilation and be written into
 * the panel's `<style>` block without passing the compiler that owns every
 * other value in it; the intended ground is expressed by picking a ground, and
 * anything beyond it by authoring the theme the panel compiles.
 */
export interface BrandStudioSurfaceConfig {
  key: BrandStudioSurfaceKey;
  /** Selects which DS-owned preview ground this panel compiles against. */
  baseTheme: 'light' | 'dark';
  /** Passed to `resolveTheme` as the resolved theme's `id`, for selector scoping. */
  tenantSlug: string;
  /** Human-readable label rendered above the panel. */
  label?: string;
}

/** Context handed to the galleries render slot for each preview panel. */
export interface BrandStudioGalleryContext {
  surface: BrandStudioSurfaceKey;
  baseTheme: 'light' | 'dark';
  tenantSlug: string;
}

/**
 * Render slot for the preview galleries. The consumer returns the real
 * component states to display inside the scoped preview panel. Returning the
 * same node for both surfaces is expected: each panel scope re-grounds the
 * shared markup light or dark.
 */
export type BrandStudioGalleriesSlot = (ctx: BrandStudioGalleryContext) => ReactNode;

/** Result of validating one preview ground's derived colors. */
export interface BrandStudioContrastReport {
  surface: BrandStudioSurfaceKey;
  /** The hex colors actually submitted to the WCAG validator. */
  colors: BrandingColors;
  valid: boolean;
  violations: ContrastViolation[];
  suggestions: ContrastSuggestion[];
}

/**
 * Render slot for the surfaces shown inside the themed tenant-theme preview
 * scope. The consumer returns generic component states (e.g. the DS preview
 * fixtures); the studio wraps them in the scoped, sanitized container so the
 * compiled artifact re-skins them live. Keeping this a slot is what lets the
 * design system preview real surfaces without depending on a product surface.
 */
export type BrandStudioTenantThemeGalleriesSlot = (ctx: {
  artifact: TenantThemeArtifact;
}) => ReactNode;

/**
 * Optional live-preview channel for a DB-tenant theme document. When supplied,
 * PatternBrandStudio compiles the document through the tenant-theme compiler
 * (debounced), renders inline validation issues for an invalid document, and on
 * success re-skins the {@link BrandStudioTenantThemeGalleriesSlot} content inside
 * the CMP-02 preview scope, with the APCA autocorrections and font-pack warnings
 * reported beneath it.
 */
export interface BrandStudioTenantThemePreviewConfig {
  /** The bounded tenant theme document being edited (simple or advanced). */
  document: TenantThemeDocument;
  /** Trusted row identity (tenantId/slug/verticalKey/rowVersion). */
  identity: TenantThemeConfigIdentity;
  /**
   * Code-owned vertical policy envelope. Optional: a simple document resolves
   * its registered vertical envelope automatically; an advanced document
   * without one fails closed into inline issues.
   */
  envelope?: TenantThemeVerticalEnvelope;
  /** Recompile debounce in ms. Defaults to 150. */
  debounceMs?: number;
  /** Content rendered inside the themed preview scope. */
  galleries?: BrandStudioTenantThemeGalleriesSlot;
  /** Optional heading rendered above the tenant-theme preview. */
  label?: string;
}

export interface PatternBrandStudioProps {
  /**
   * The BrandTheme being edited. Accepts a partial theme; `id`/`name` are
   * defaulted when absent. The component is controlled: it never mutates the
   * value in place and emits the next theme through {@link onChange}.
   */
  value: BrandTheme | Partial<BrandTheme>;
  /** Called with the next full BrandTheme after any edit. */
  onChange?: (next: BrandTheme) => void;
  /** Render slot for the live preview galleries. */
  galleries?: BrandStudioGalleriesSlot;
  /** Overrides for the light preview ground. */
  lightSurface?: Partial<BrandStudioSurfaceConfig>;
  /** Overrides for the dark preview ground. */
  darkSurface?: Partial<BrandStudioSurfaceConfig>;
  /** Optional heading rendered above the editor. */
  title?: string;
  /** Optional supporting copy rendered below the heading. */
  description?: string;
  /**
   * Optional live preview of a DB-tenant theme document. When present, the
   * studio renders a second preview section driven by the tenant-theme compiler
   * (validation issues, APCA autocorrections, font-pack warnings) below the
   * BrandTheme preview grid. Independent of {@link value}; the BrandTheme editor
   * is unchanged when this is absent.
   */
  tenantThemePreview?: BrandStudioTenantThemePreviewConfig;
}
