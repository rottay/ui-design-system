/**
 * @fileoverview The mount, as a test does it: bytes AND scope.
 *
 * Every suite that exercises admission used to hand-roll "append a `<style>`
 * with the three proof attributes" and stop there. That is only half of what
 * `mountTenantTheme` performs, and admission now proves the other half, so a
 * fixture that stamps only the bytes describes a document that renders
 * unstyled. This helper is the whole mount for a test: the element AND the root
 * scope the artifact's selector is attached to.
 *
 * @module Runtime/Theming/VisualAuthority/Tests/MountFixture
 * @package @rottay/design-system
 */

import type { TenantThemeArtifact } from '@/foundation/contracts/composition/tenants/themes/tenant-theme';

import {
  TENANT_THEME_ARTIFACT_DIGEST_ATTRIBUTE,
  TENANT_THEME_ARTIFACT_SLUG_ATTRIBUTE,
  TENANT_THEME_ARTIFACT_VERTICAL_ATTRIBUTE,
} from '../../foundation/admission';

/** The identity a tenant artifact's scope selector is keyed on. */
export interface TenantThemeScopeIdentity {
  readonly slug: string;
  readonly verticalKey: string;
}

/** Stamp the root attributes a tenant scope selector matches on. */
export function stampTenantThemeScopeFor(
  identity: TenantThemeScopeIdentity,
  root: Element = document.documentElement,
): void {
  root.setAttribute('data-ds-root', '');
  root.setAttribute('data-vertical', identity.verticalKey);
  root.setAttribute('data-tenant', identity.slug);
}

/** Stamp the root attributes an artifact's scope selector matches on. */
export function stampTenantThemeScope(
  artifact: TenantThemeArtifact,
  root: Element = document.documentElement,
): void {
  root.setAttribute(artifact.scopes.root.attribute, '');
  root.setAttribute(artifact.scopes.vertical.attribute, artifact.scopes.vertical.value);
  root.setAttribute(artifact.scopes.tenant.attribute, artifact.scopes.tenant.value);
}

/** Remove the scope stamp, leaving a document an artifact cannot paint. */
export function clearTenantThemeScope(root: Element = document.documentElement): void {
  root.removeAttribute('data-ds-root');
  root.removeAttribute('data-vertical');
  root.removeAttribute('data-tenant');
}

export interface MountTenantThemeArtifactFixtureOptions {
  /** Element id, when a suite asserts on it. */
  readonly id?: string;
  /** Skip the root stamp, to exercise a byte-perfect but unscoped mount. */
  readonly scope?: boolean;
}

/**
 * Mount one artifact the way the server does, and return its element.
 *
 * The style is appended to `<head>` and the document root is stamped, so
 * `resolveVisualAuthority` can prove both halves.
 */
export function mountTenantThemeArtifactFixture(
  artifact: TenantThemeArtifact,
  options: MountTenantThemeArtifactFixtureOptions = {},
): HTMLStyleElement {
  const style = document.createElement('style');
  if (options.id !== undefined) style.id = options.id;
  style.setAttribute(TENANT_THEME_ARTIFACT_DIGEST_ATTRIBUTE, artifact.digest);
  style.setAttribute(TENANT_THEME_ARTIFACT_SLUG_ATTRIBUTE, artifact.slug);
  style.setAttribute(TENANT_THEME_ARTIFACT_VERTICAL_ATTRIBUTE, artifact.verticalKey);
  style.textContent = artifact.css;
  document.head.appendChild(style);
  if (options.scope !== false) stampTenantThemeScope(artifact);
  return style;
}
