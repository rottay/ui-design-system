/**
 * @fileoverview Container-scoped preview CSS for a compiled tenant-theme artifact.
 *
 * A compiled artifact's CSS is anchored to the provider-owned document-root
 * selector (`[data-ds-root][data-vertical][data-tenant]`); injecting it as-is
 * would restyle the whole host document when the previewed slug matches the
 * active tenant -- the exact hazard the W1 CMP-02 fix closed for the legacy
 * preview path. Rather than open a second injection path, this module uses the
 * shared preview-scope primitives -- the preview-root scope attribute, the
 * scope-selector builder, the slug sanitizer, and the declaration-value
 * whitelist -- and re-anchors the artifact's already compiler-sanitized
 * variables onto the preview container.
 *
 * The container is a box BELOW the document root, so the scope also carries the
 * compiled channels that read an artifact channel through a chain the root holds
 * (`containerReach`) and emits through the emission owner's container law, which
 * restates the root aliases those reads re-resolve (N1). Under a document in a
 * mode the vertical overlays, the scope states the artifact's mode values in
 * rules that follow the document's mode (`containerModeBlocks`).
 *
 * @remarks
 * The values are double-checked with the shared `isSafePreviewCssValue`
 * as defense in depth (they already passed the compiler's `isSafeVisualValue`).
 * That whitelist is intentionally the same one the legacy preview uses; a value
 * it does not admit (e.g. a `light-dark()` emission before the whitelist gains
 * that function) is dropped fail-closed rather than injected.
 */

import type { TenantThemeArtifact } from '@/foundation/contracts/composition/tenants/themes/tenant-theme';
import {
  assertTenantIdentityAllowed,
  isFirstPartyVerticalId,
} from '@/foundation/presets/verticals/roster';
import {
  compileThemeIntent,
  staticThemeIntent,
} from '@/infrastructure/compilers/runtime/theme';
import { verifyTenantThemeArtifactV1 } from '@/infrastructure/runtime/theming/foundation/visual-authority';
import {
  PREVIEW_SCOPE_ATTRIBUTE,
  buildPreviewScopeSelector,
  isSafePreviewCssValue,
  sanitizePreviewSlug,
} from '@/infrastructure/runtime/tenant/runtime/preview-scope';
import type { ThemeCompilationModeBlock } from '@/foundation/contracts/composition/tenants/themes/compiled';
import {
  containerScope,
  emitThemeCss,
} from '@/infrastructure/compilers/runtime/theme/runtime/emission';
import { containerModeBlocks } from '@/infrastructure/compilers/runtime/theme/runtime/emission/css';
import { containerReach } from '@/infrastructure/compilers/runtime/theme/runtime/emission/css/root-aliases';

export { PREVIEW_SCOPE_ATTRIBUTE };

export interface TenantThemePreviewScope {
  /** Sanitized, container-scoped stylesheet ready for a `<style>` block. */
  css: string;
  /** The selector every rule is anchored to; only the preview root carries it. */
  scopeSelector: string;
  /** The preview-root scope attribute value (the sanitized tenant slug). */
  safeSlug: string;
}

/**
 * Re-anchor a compiled artifact's variable block onto the preview container.
 *
 * The artifact slug is sanitized to the CMP-02 scope-attribute value, and every
 * `--ds-*` declaration that passes the shared value whitelist is emitted under
 * the preview scope selector. Returns an empty stylesheet when no declaration
 * survives, so an empty `<style>` never carries a dangling selector.
 */
export function buildTenantThemePreviewScope(
  artifact: TenantThemeArtifact
): TenantThemePreviewScope {
  if (!artifact || typeof artifact.slug !== 'string' || typeof artifact.verticalKey !== 'string') {
    throw new TypeError('[design-system] Invalid tenant preview artifact identity.');
  }
  assertTenantIdentityAllowed({ slug: artifact.slug });
  const verification = verifyTenantThemeArtifactV1(artifact, {
    slug: artifact.slug,
    verticalKey: artifact.verticalKey,
  });
  if (!verification.ok) {
    throw new TypeError(`[design-system] Invalid tenant preview artifact: ${verification.error}`);
  }
  const verifiedArtifact = verification.artifact;
  const safeSlug = sanitizePreviewSlug(verifiedArtifact.slug);
  const scopeSelector = buildPreviewScopeSelector(safeSlug);
  if (!isFirstPartyVerticalId(verifiedArtifact.verticalKey)) {
    throw new TypeError('[design-system] Invalid tenant preview artifact vertical.');
  }
  // The artifact is a delta over the vertical's static compile, which is what
  // the enclosing root states; its readers of a moved channel keep that text.
  const untouchedCompile = compileThemeIntent(
    staticThemeIntent(verifiedArtifact.verticalKey, verifiedArtifact.slug),
  ).compiled;
  const untouched = untouchedCompile.cssVariables;
  const enclosing: Record<string, string> = { ...untouched, ...verifiedArtifact.variables };
  const moved = Object.keys(verifiedArtifact.variables);
  const stated: Record<string, string> = { ...verifiedArtifact.variables };
  for (const name of containerReach(moved, enclosing)) {
    const value = enclosing[name];
    if (value !== undefined && !(name in stated)) stated[name] = value;
  }
  // The guard decides WHICH channels survive; the emission owner decides how a
  // declaration and a rule are spelled.
  const admit = (variables: Readonly<Record<string, string>>): Record<string, string> =>
    Object.fromEntries(
      Object.entries(variables).filter(
        ([name, value]) => name.startsWith('--ds-') && isSafePreviewCssValue(value),
      ),
    );
  const admitted = admit(stated);
  // The artifact's mode deltas sit over the vertical's own mode block with the
  // base delta applied (the delta owner's `themeChannelDelta`); under a
  // document in that mode the scope states what they move.
  const modes = new Set([
    ...untouchedCompile.modeBlocks.map((block) => block.mode),
    ...(verifiedArtifact.modeDeltas ?? []).map((block) => block.mode),
  ]);
  const proposedModeBlocks: ThemeCompilationModeBlock[] = [...modes].map((mode) => ({
    mode,
    colorScheme: mode,
    cssVariables: {
      ...untouchedCompile.modeBlocks.find((block) => block.mode === mode)?.cssVariables,
      ...verifiedArtifact.variables,
      ...verifiedArtifact.modeDeltas?.find((block) => block.mode === mode)?.variables,
    },
  }));
  const modeBlocks = containerModeBlocks(
    admitted,
    { cssVariables: enclosing, modeBlocks: proposedModeBlocks },
    untouchedCompile,
  )
    .map((block) => ({ ...block, cssVariables: admit(block.cssVariables) }))
    .filter((block) => Object.keys(block.cssVariables).length > 0);
  const css =
    Object.keys(admitted).length > 0 || modeBlocks.length > 0
      ? emitThemeCss(
          {
            cssVariables: admitted,
            modeBlocks,
            runtime: { personality: {}, tokenOverrides: {} },
          },
          containerScope(scopeSelector),
          { container: { outright: Object.keys(untouched) } },
        )
      : '';
  return { css, scopeSelector, safeSlug };
}
