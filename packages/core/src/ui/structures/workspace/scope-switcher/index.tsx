'use client';

/**
 * @fileoverview ScopeSwitcher — structures-tier horizontal scope pill strip for
 * switching between predefined data subsets.
 *
 * @description
 * Engine-free structures family for switching between DATA scopes (e.g.
 * "All", "Active", "Archived" — consumer-supplied data subsets, NOT
 * deployment environments; the sibling pattern `environment-toggle` PT25
 * owns deployment-environment switching with its confirmation/banner
 * semantics — different domain, different contract).
 *
 * COMPOSITION LAW (S22): the scope switcher IS the certified Segmented
 * primitive — the hand-rolled Box-as-button pills (aria-pressed, no roving)
 * are retired, and with them the APG gap: the primitive owns
 * role=radiogroup/radio, aria-checked, the roving tab stop and the
 * RTL-aware arrow contract. Unlike environment-toggle (which kept its own
 * anatomy because Segmented cannot carry a per-option STYLE channel), this
 * family needs no per-option paint channel: the active fill is uniform and
 * the count badge rides INSIDE the option's ReactNode label, so the
 * composition is lossless. What the pattern keeps: the root frame (section
 * vs inline variants), the count badge paint (tabular figures), the scroll
 * region, the i18n group label, and the forced-colors contract for those
 * owned pieces.
 *
 * The family stays domain-agnostic. Scope keys, labels, counts, and
 * filter predicates are consumer-supplied via the ScopeDefinition shape;
 * the rail itself knows nothing about tenants, users, or any specific
 * entity.
 */

import { useOptionalTranslation } from '@/infrastructure/runtime/i18n';
import { Box } from '../../../primitives';
import ModernSegmented from '../../../primitives/navigation/Segmented/engines/modern';

/** Definition of a single scope pill rendered by the strip. */
export interface ScopeDefinition {
  key: string;
  label: string;
  count?: number;
  /** Optional filter predicate the consumer applies when this scope is active. */
  filter?: Record<string, unknown>;
}

export interface ScopeSwitcherProps {
  scopes: ScopeDefinition[];
  activeScope: string;
  onScopeChange: (scopeKey: string) => void;
  /** Visual variant. `inline` renders compact for toolbars / table headers. */
  variant?: 'section' | 'inline';
}

export function ScopeSwitcher({
  scopes,
  activeScope,
  onScopeChange,
  variant = 'section',
}: ScopeSwitcherProps) {
  const i18n = useOptionalTranslation('components');
  /**
   * Catalog lookup with an honest English floor: when the provider is absent
   * or echoes the raw key (missing entry), the historical default wins.
   */
  const tOr = (key: string, fallback: string): string => {
    const resolved = i18n?.t(key);
    if (resolved === undefined || resolved === key || resolved === `components.${key}`) {
      return fallback;
    }
    return resolved;
  };

  if (!scopes.length) return null;

  const isInline = variant === 'inline';

  return (
    <Box
      data-part="root"
      data-inline={isInline}
      className="ds-structure ds-scope-switcher"
    >
      {/* Composed Segmented (P81): radiogroup semantics, roving keyboard and
          option chrome belong to the primitive; the count badge is the
          pattern's own content inside the option label. */}
      <ModernSegmented
        data-part="switcher"
        options={scopes.map((scope) => ({
          value: scope.key,
          label: (
            <>
              {scope.label}
              {typeof scope.count === 'number' && (
                <span data-part="count-badge" data-active={scope.key === activeScope}>
                  {scope.count}
                </span>
              )}
            </>
          ),
        }))}
        value={activeScope}
        onChange={(value) => onScopeChange(String(value))}
        size={isInline ? 'small' : 'middle'}
        ariaLabel={tOr('scopeSwitcher.groupLabel', 'Scope')}
      />
    </Box>
  );
}

// Compatibility aliases for pre-Checkpoint-D names. Deprecated —
// migrate to the canonical new names above. Scheduled for removal
// in Checkpoint F if no consumers remain.
export { ScopeSwitcher as WorkspaceScopes };
export type {
  ScopeSwitcherProps as WorkspaceScopesProps,
  ScopeDefinition as WorkspaceScopeDefinition,
};
