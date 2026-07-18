'use client';

/**
 * @fileoverview useTenantThemePreview -- the Brand Studio live-preview runtime.
 *
 * Wraps the synchronous, dependency-free DB-tenant compiler
 * (`compileTenantThemeConfig`) in a debounced `useMemo` so an editor can recompile
 * on every keystroke without a worker. The hook NEVER throws: a structurally
 * invalid document returns the compiler's `TenantThemeValidationError.issues`
 * for inline rendering, and a valid document returns the compiled artifact plus
 * the derived preview payload (contrast adjustments, font-pack warnings, and the
 * container-scoped CSS + preview-root attributes that reuse the W1 CMP-02
 * scoping). The three surface fixtures render inside that scope; app-platform
 * console wiring is a separate cross-repo concern.
 *
 * @module Patterns/Customization/BrandStudio/Runtime/TenantThemePreview
 * @package @rottay/design-system
 */

import { useMemo, useState, useEffect } from 'react';

import type {
  TenantThemeArtifactV1,
  TenantThemeConfigIdentityV1,
  TenantThemeDocumentV1,
  TenantThemeValidationIssue,
  TenantThemeVerticalEnvelopeV1,
} from '@/foundation/contracts/composition/tenants/themes/tenant-theme';
import * as tenantThemeCompiler from '@/infrastructure/compilers/composition/tenant-theme';

import {
  selectTenantThemeAdjustments,
  type TenantThemeContrastAdjustmentV1,
} from './contrast-adjustments';
import {
  probeTenantThemePackWarnings,
  type ProbeTenantThemePackWarningsOptions,
  type TenantThemePackWarning,
} from './pack-warnings';
import {
  PREVIEW_SCOPE_ATTRIBUTE,
  buildTenantThemePreviewScope,
} from './preview-scope';

export { PREVIEW_SCOPE_ATTRIBUTE };
export {
  buildTenantThemePreviewScope,
  type TenantThemePreviewScope,
} from './preview-scope';
export {
  selectTenantThemeAdjustments,
  type TenantThemeContrastAdjustmentV1,
} from './contrast-adjustments';
export {
  probeTenantThemePackWarnings,
  type TenantThemePackWarning,
  type ProbeTenantThemePackWarningsOptions,
} from './pack-warnings';

/** Debounce applied to recompilation when the edited document changes. */
export const DEFAULT_TENANT_THEME_PREVIEW_DEBOUNCE_MS = 150;

export interface UseTenantThemePreviewInput {
  /** The bounded tenant theme document being edited (simple or advanced). */
  document: TenantThemeDocumentV1;
  /** Trusted row identity (tenantId/slug/verticalKey/rowVersion). */
  identity: TenantThemeConfigIdentityV1;
  /**
   * Code-owned vertical policy envelope. Optional: a simple document resolves
   * the registered envelope for its vertical automatically; an advanced
   * document without one fails closed into `issues`.
   */
  envelope?: TenantThemeVerticalEnvelopeV1;
  /** Recompile debounce in ms. Defaults to {@link DEFAULT_TENANT_THEME_PREVIEW_DEBOUNCE_MS}. */
  debounceMs?: number;
  /** Test seam for the font-pack computed-style probe. */
  packWarningsOptions?: ProbeTenantThemePackWarningsOptions;
}

export interface UseTenantThemePreviewResult {
  /** The compiled artifact, or `null` when the document is invalid. */
  artifact: TenantThemeArtifactV1 | null;
  /** Structured validation issues for inline rendering, or `null` when valid. */
  issues: readonly TenantThemeValidationIssue[] | null;
  /** APCA autocorrections the compiler recorded on the artifact (empty when none). */
  adjustments: readonly TenantThemeContrastAdjustmentV1[];
  /** Referenced font packs not loaded in the host document (empty when all resolve). */
  packWarnings: readonly TenantThemePackWarning[];
  /** Container-scoped, sanitized CSS to inject; empty when invalid. */
  css: string;
  /** The CMP-02 preview scope selector the CSS is anchored to. */
  previewScopeSelector: string;
  /** Attributes to stamp on the preview root: the scope attribute plus anatomy attributes. */
  previewRootAttributes: Record<string, string>;
}

/** The compile inputs that must be identical for the debounced artifact to be reused. */
interface TenantThemeCompileInput {
  document: TenantThemeDocumentV1;
  identity: TenantThemeConfigIdentityV1;
  envelope?: TenantThemeVerticalEnvelopeV1;
}

type TenantThemeCompileOutput =
  | { artifact: TenantThemeArtifactV1; issues: null }
  | { artifact: null; issues: readonly TenantThemeValidationIssue[] };

/**
 * Compile without ever throwing. Structured validation failures become `issues`;
 * any other failure is coerced into a single issue so the editor never crashes.
 */
export function compileTenantThemePreview(
  input: TenantThemeCompileInput
): TenantThemeCompileOutput {
  try {
    const artifact = tenantThemeCompiler.compileTenantThemeConfig(
      { ...input.document, ...input.identity },
      input.envelope ? { verticalEnvelope: input.envelope } : {}
    );
    return { artifact, issues: null };
  } catch (error) {
    if (error instanceof tenantThemeCompiler.TenantThemeValidationError) {
      return { artifact: null, issues: error.issues };
    }
    return {
      artifact: null,
      issues: [
        {
          code: 'invalid_value',
          path: '$',
          message:
            error instanceof Error ? error.message : 'Tenant theme compilation failed',
        },
      ],
    };
  }
}

/**
 * The compiler-owned projection from an artifact to its anatomy attributes
 * (`data-anatomy-card="underline"`, ...). Landlord-owned (W4-A); accessed
 * optionally so anatomy variants preview as their default until it lands.
 */
type AnatomyAttributeProjection = (
  artifact: Pick<TenantThemeArtifactV1, 'normalizedAppearance'>
) => Record<string, string>;

function resolveAnatomyAttributes(artifact: TenantThemeArtifactV1): Record<string, string> {
  const projection = (
    tenantThemeCompiler as unknown as {
      tenantThemeAnatomyAttributes?: AnatomyAttributeProjection;
    }
  ).tenantThemeAnatomyAttributes;
  return typeof projection === 'function' ? projection(artifact) : {};
}

/**
 * Live Brand Studio preview: compile a tenant theme document (debounced) and
 * derive everything the editor renders. See {@link UseTenantThemePreviewResult}.
 */
export function useTenantThemePreview(
  input: UseTenantThemePreviewInput
): UseTenantThemePreviewResult {
  const {
    document,
    identity,
    envelope,
    debounceMs = DEFAULT_TENANT_THEME_PREVIEW_DEBOUNCE_MS,
    packWarningsOptions,
  } = input;

  // Immediate first compile (initial state), then debounce subsequent edits so
  // rapid keystrokes coalesce into one recompile. Each dependency change resets
  // the timer; the effect cleanup drops the superseded one.
  const [debounced, setDebounced] = useState<TenantThemeCompileInput>({
    document,
    identity,
    envelope,
  });
  useEffect(() => {
    const handle = setTimeout(
      () => setDebounced({ document, identity, envelope }),
      debounceMs
    );
    return () => clearTimeout(handle);
  }, [document, identity, envelope, debounceMs]);

  const compiled = useMemo(() => compileTenantThemePreview(debounced), [debounced]);
  const artifact = compiled.artifact;

  const adjustments = useMemo(
    () => selectTenantThemeAdjustments(artifact),
    [artifact]
  );

  const packWarnings = useMemo(
    () => probeTenantThemePackWarnings(artifact, packWarningsOptions),
    [artifact, packWarningsOptions]
  );

  const preview = useMemo(() => {
    if (!artifact) {
      return {
        css: '',
        previewScopeSelector: '',
        previewRootAttributes: {} as Record<string, string>,
      };
    }
    const scope = buildTenantThemePreviewScope(artifact);
    return {
      css: scope.css,
      previewScopeSelector: scope.scopeSelector,
      previewRootAttributes: {
        [PREVIEW_SCOPE_ATTRIBUTE]: scope.safeSlug,
        ...resolveAnatomyAttributes(artifact),
      },
    };
  }, [artifact]);

  return {
    artifact,
    issues: compiled.issues,
    adjustments,
    packWarnings,
    css: preview.css,
    previewScopeSelector: preview.previewScopeSelector,
    previewRootAttributes: preview.previewRootAttributes,
  };
}
