'use client';

/**
 * @fileoverview Tenant authoring composition with compiled-artifact injection.
 * @description Allows creating, previewing, and activating tenant themes without
 * manual CSS file creation or registry updates. Designed for onboarding flows,
 * admin consoles, and tenant preview tooling.
 *
 * The hook mounts a COMPILED ARTIFACT and nothing else. It used to take a
 * `TenantConfig` and run a runtime CSS generator over it, which made this hook
 * a third producer of tenant paint alongside the two compilers. It now takes
 * the canonical DB ingress — a `TenantThemeDocument` (compiled here) or an
 * already-compiled `TenantThemeArtifact` — and injects `artifact.css`
 * verbatim. What an onboarding flow previews is therefore byte-identical to
 * what the tenant will be served.
 *
 * @example
 * ```tsx
 * function TenantOnboarding() {
 *   const { createTenant, injectTenantCss, removeTenantCss } = useCreateTenant();
 *
 *   const handleCreate = () => {
 *     createTenant({ slug: 'acme', name: 'ACME Corp', primaryColor: '#3B82F6' });
 *     injectTenantCss({
 *       document: draftThemeDocument,
 *       identity: { tenantId, slug: 'acme', verticalKey: 'rottay', rowVersion: 1 },
 *     });
 *   };
 *
 *   return <button onClick={handleCreate}>Create Tenant</button>;
 * }
 * ```
 */

import { useCallback, useEffect, useRef } from 'react';
import type { TenantConfig } from '../../../../../../../foundation/contracts';
import type {
  TenantThemeArtifact,
  TenantThemeConfigIdentity,
  TenantThemeVerticalEnvelope,
} from '../../../../../../../foundation/contracts/composition/tenants/themes/tenant-theme';
import {
  createTenantConfig as createConfig,
  type TenantCreationConfig,
} from '../../../../runtime/authoring/configuration';
import {
  compileTenantThemeConfig,
  hydrateTenantThemeConfig,
} from '../../../../../../compilers/composition/tenant-theme';
import {
  TENANT_THEME_ARTIFACT_DIGEST_ATTRIBUTE,
  TENANT_THEME_ARTIFACT_SLUG_ATTRIBUTE,
  TENANT_THEME_ARTIFACT_VERTICAL_ATTRIBUTE,
  tenantThemeArtifactElementId,
  verifyTenantThemeArtifactV1,
} from '@/infrastructure/runtime/theming/foundation/visual-authority';
import { assertTenantIdentityAllowed } from '@/foundation/tokens/ts/presentation/brand-themes';

/**
 * What to mount: a compiled artifact, or the document to compile into one.
 *
 * A document needs its trusted row identity (`tenantId`/`slug`/`verticalKey`/
 * `rowVersion`) because the compiler refuses to take identity from the JSONB
 * payload — a draft cannot name itself into another tenant's scope.
 */
export type TenantCssSource =
  | { artifact: TenantThemeArtifact }
  | {
      document: unknown;
      identity: TenantThemeConfigIdentity;
      verticalEnvelope?: TenantThemeVerticalEnvelope;
    };

function resolveArtifact(source: TenantCssSource): TenantThemeArtifact {
  if ('artifact' in source) return source.artifact;
  return compileTenantThemeConfig(
    hydrateTenantThemeConfig(source.document, source.identity),
    source.verticalEnvelope ? { verticalEnvelope: source.verticalEnvelope } : {},
  );
}

/**
 * The SSR emitter owns this shape. Deriving it here rather than restating the
 * prefix is what keeps a hydrating client from either duplicating the server's
 * scope or failing to recognise the element the server already wrote.
 */
function getStyleTagId(slug: string): string {
  return tenantThemeArtifactElementId(slug);
}

interface MountedArtifactRecord {
  readonly baseline: Element | null;
  readonly parent: Node;
  readonly previousSibling: Node | null;
  readonly nextSibling: Node | null;
  readonly document: Document;
  readonly id: string;
  mounted: HTMLStyleElement;
}

interface ArtifactOwnerRecord {
  readonly owner: object;
  readonly record: MountedArtifactRecord;
}

const DOCUMENT_ARTIFACT_OWNERS = new WeakMap<
  Document,
  Map<string, ArtifactOwnerRecord>
>();

function getArtifactOwners(document: Document): Map<string, ArtifactOwnerRecord> {
  const existing = DOCUMENT_ARTIFACT_OWNERS.get(document);
  if (existing) return existing;
  const created = new Map<string, ArtifactOwnerRecord>();
  DOCUMENT_ARTIFACT_OWNERS.set(document, created);
  return created;
}

function restoreMountedArtifact(record: MountedArtifactRecord): void {
  const current = record.document.getElementById(record.id);
  // A different node with the same id is an external takeover. Preserve it and
  // do not resurrect our predecessor on top of the new owner.
  if (current && current !== record.mounted && current !== record.baseline) return;

  // We own the exact mounted node even if another actor moved it. Remove that
  // node where it lives, then restore the predecessor at its recorded parent
  // and anchor rather than moving the predecessor to the foreign location.
  record.mounted.remove();
  if (!record.baseline || record.baseline.parentNode) return;
  if (record.nextSibling?.parentNode === record.parent) {
    record.parent.insertBefore(record.baseline, record.nextSibling);
  } else if (record.previousSibling?.parentNode === record.parent) {
    record.parent.insertBefore(record.baseline, record.previousSibling.nextSibling);
  } else {
    record.parent.appendChild(record.baseline);
  }
}

function isAtRecordedAnchor(record: MountedArtifactRecord): boolean {
  if (record.mounted.parentNode !== record.parent) return false;
  if (record.nextSibling?.parentNode === record.parent) {
    return record.mounted.nextSibling === record.nextSibling;
  }
  if (record.previousSibling?.parentNode === record.parent) {
    return record.mounted.previousSibling === record.previousSibling;
  }
  return record.mounted.nextSibling === null;
}

/**
 * Hook for runtime tenant creation with CSS injection.
 *
 * Returns:
 * - `createTenant` - Generates a complete TenantConfig from minimal input
 * - `injectTenantCss` - Compiles (if needed) and injects `artifact.css`
 * - `removeTenantCss` - Removes injected CSS for a given tenant slug
 *
 * This hook is intentionally app-facing. It is the bridge for onboarding flows,
 * tenant preview tooling, and admin consoles that need to materialize a tenant
 * before the platform persists it.
 */
export function useCreateTenant() {
  // Tracks which tenant slugs have been injected into the DOM so the hook
  // can clean up on re-injection and consumers can introspect active previews.
  const injectedSlugs = useRef<Set<string>>(new Set());
  const mountedArtifacts = useRef<Map<string, MountedArtifactRecord>>(new Map());
  const owner = useRef<object | null>(null);
  if (!owner.current) owner.current = {};
  const ownerToken = owner.current;

  const createTenant = useCallback(
    (config: TenantCreationConfig): TenantConfig => {
      return createConfig(config);
    },
    []
  );

  const injectTenantCss = useCallback((source: TenantCssSource): TenantThemeArtifact => {
    // Compile FIRST, before touching the DOM. A document that fails validation
    // throws here, with the previously injected artifact still mounted —
    // rather than removing a working stylesheet and then discovering the
    // replacement is invalid, which leaves the tenant unpainted.
    const candidateArtifact = resolveArtifact(source);
    assertTenantIdentityAllowed({ slug: candidateArtifact.slug });
    const verification = verifyTenantThemeArtifactV1(candidateArtifact, {
      slug: candidateArtifact.slug,
      verticalKey: candidateArtifact.verticalKey,
    });
    if (!verification.ok) {
      throw new Error(`[design-system] Refusing invalid TenantThemeArtifact: ${verification.error}`);
    }
    const artifact = verification.artifact;

    if (typeof document === 'undefined') {
      return artifact;
    }

    const id = getStyleTagId(artifact.slug);
    const owners = getArtifactOwners(document);
    const ownerRecord = owners.get(artifact.slug);
    if (ownerRecord && ownerRecord.owner !== ownerToken) {
      throw new Error(
        `[design-system] Tenant style "${id}" is owned by another useCreateTenant instance.`,
      );
    }

    const previousRecord = mountedArtifacts.current.get(artifact.slug);
    if (ownerRecord && previousRecord !== ownerRecord.record) {
      throw new Error(`[design-system] Tenant style ownership drift for "${id}".`);
    }
    const existing = document.getElementById(id);
    if (previousRecord && existing !== previousRecord.mounted) {
      throw new Error(
        `[design-system] Refusing to replace externally-owned tenant style "${id}".`,
      );
    }
    if (previousRecord && !isAtRecordedAnchor(previousRecord)) {
      throw new Error(
        `[design-system] Refusing to replace moved tenant style "${id}".`,
      );
    }

    // The data-tenant-css attribute allows DevTools inspection and automated
    // tests to locate tenant-specific style blocks in the document head. The
    // digest is stamped beside it so a preview that did not recompile is
    // visible without diffing the CSS.
    const style = document.createElement('style');
    style.id = id;
    style.setAttribute('data-tenant-css', artifact.slug);
    style.setAttribute(TENANT_THEME_ARTIFACT_DIGEST_ATTRIBUTE, artifact.digest);
    style.setAttribute(TENANT_THEME_ARTIFACT_SLUG_ATTRIBUTE, artifact.slug);
    style.setAttribute(TENANT_THEME_ARTIFACT_VERTICAL_ATTRIBUTE, artifact.verticalKey);
    style.textContent = artifact.css;

    if (previousRecord) {
      previousRecord.mounted.replaceWith(style);
      previousRecord.mounted = style;
    } else if (existing) {
      const parent = existing.parentNode;
      if (!parent) throw new Error(`[design-system] Tenant style "${id}" has no parent.`);
      const record: MountedArtifactRecord = {
        baseline: existing,
        parent,
        previousSibling: existing.previousSibling,
        nextSibling: existing.nextSibling,
        document,
        id,
        mounted: style,
      };
      existing.replaceWith(style);
      mountedArtifacts.current.set(artifact.slug, record);
      owners.set(artifact.slug, { owner: ownerToken, record });
    } else {
      const record: MountedArtifactRecord = {
        baseline: null,
        parent: document.head,
        previousSibling: document.head.lastChild,
        nextSibling: null,
        document,
        id,
        mounted: style,
      };
      document.head.appendChild(style);
      mountedArtifacts.current.set(artifact.slug, record);
      owners.set(artifact.slug, { owner: ownerToken, record });
    }

    injectedSlugs.current.add(artifact.slug);
    return artifact;
  }, [ownerToken]);

  const removeTenantCss = useCallback((slug: string): void => {
    if (typeof document === 'undefined') {
      return;
    }

    const record = mountedArtifacts.current.get(slug);
    if (!record) return;
    const owners = getArtifactOwners(record.document);
    const ownerRecord = owners.get(slug);
    if (ownerRecord?.owner !== ownerToken || ownerRecord.record !== record) {
      throw new Error(
        `[design-system] Refusing to remove tenant style not owned by this hook: "${getStyleTagId(slug)}".`,
      );
    }
    restoreMountedArtifact(record);
    owners.delete(slug);

    injectedSlugs.current.delete(slug);
    mountedArtifacts.current.delete(slug);
  }, [ownerToken]);

  useEffect(() => () => {
    for (const [slug, record] of mountedArtifacts.current) {
      const owners = getArtifactOwners(record.document);
      const ownerRecord = owners.get(slug);
      if (ownerRecord?.owner === ownerToken && ownerRecord.record === record) {
        restoreMountedArtifact(record);
        owners.delete(slug);
      }
    }
    mountedArtifacts.current.clear();
    injectedSlugs.current.clear();
  }, [ownerToken]);

  return {
    createTenant,
    injectTenantCss,
    removeTenantCss,
  };
}
