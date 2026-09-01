/**
 * @fileoverview Font-pack load probe for the tenant-theme preview.
 *
 * A tenant document may reference a code-owned font pack through the validated
 * `var(--ds-font-pack-<id>)` channel. The pack CSS is an opt-in subpath an app
 * imports separately; when it is not loaded in the host document the variable
 * resolves to nothing and the family list silently falls through to the
 * authored fallbacks -- degraded, not broken. This probe reads the host
 * document's computed value for each referenced pack variable and reports the
 * ones that are undefined so Brand Studio can warn the author instead of
 * shipping a silently degraded preview. The DOM read is injectable so the probe
 * is deterministic under test.
 */

/** Matches a `var(--ds-font-pack-<id>` reference and captures the variable name. */
const FONT_PACK_REFERENCE = /var\(\s*(--ds-font-pack-[a-z0-9-]+)/giu;

/** One referenced font-pack variable that did not resolve in the host document. */
export interface TenantThemePackWarning {
  /** The `--ds-font-pack-*` variable that resolved to nothing. */
  variable: string;
  /** The compiled artifact token that referenced it (e.g. `--ds-font-family-heading`). */
  referencedBy: string;
}

export interface ProbeTenantThemePackWarningsOptions {
  /**
   * Reader for a CSS custom property on the host document. Defaults to the
   * document element's computed style; injected in tests.
   */
  resolveVariable?: (variable: string) => string;
}

/** Artifact fragment carrying the compiled variable map. */
interface ArtifactWithVariables {
  variables: Readonly<Record<string, string>>;
}

function defaultResolveVariable(variable: string): string {
  if (typeof document === 'undefined' || typeof getComputedStyle !== 'function') {
    return '';
  }
  return getComputedStyle(document.documentElement).getPropertyValue(variable);
}

/**
 * Report every `--ds-font-pack-*` variable an artifact references that does not
 * resolve to a value in the host document.
 */
export function probeTenantThemePackWarnings(
  artifact: ArtifactWithVariables | null | undefined,
  options: ProbeTenantThemePackWarningsOptions = {}
): readonly TenantThemePackWarning[] {
  if (!artifact) return [];
  const resolveVariable = options.resolveVariable ?? defaultResolveVariable;
  const seen = new Set<string>();
  const warnings: TenantThemePackWarning[] = [];
  for (const [referencedBy, value] of Object.entries(artifact.variables)) {
    for (const match of value.matchAll(FONT_PACK_REFERENCE)) {
      const variable = match[1];
      const dedupeKey = `${referencedBy}::${variable}`;
      if (seen.has(dedupeKey)) continue;
      seen.add(dedupeKey);
      if (resolveVariable(variable).trim().length === 0) {
        warnings.push({ variable, referencedBy });
      }
    }
  }
  return warnings;
}
