'use client';

/**
 * @fileoverview ScopeSwitcher — structures-tier horizontal scope pill strip for
 * switching between predefined data subsets.
 *
 * @description
 * Engine-free structures family that renders a horizontal row of scope pills (e.g.
 * "All", "Active", "Archived"). Each pill carries a label and an optional
 * count badge, and the active pill is highlighted with the primary tint.
 * Supports two visual variants: `section` (the default standalone bar) and
 * `inline` (compact, used inside toolbars or table headers).
 *
 * The family stays domain-agnostic. Scope keys, labels, counts, and
 * filter predicates are consumer-supplied via the ScopeDefinition shape;
 * the rail itself knows nothing about tenants, users, or any specific
 * entity.
 */

import { useOptionalTranslation } from '@/infrastructure/runtime/i18n';
import { Box, Flex, Text } from '../../../primitives';

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
      role="group"
      aria-label={tOr('scopeSwitcher.groupLabel', 'Scope')}
      style={{
        padding: isInline ? 0 : '8px 16px',
        overflowX: 'auto',
        WebkitOverflowScrolling: 'touch',
      }}
    >
      <Flex
        align="center"
        gap={isInline ? 5 : 8}
        data-ds-scope-switcher-row="true"
        style={{
          minWidth: isInline ? 'max-content' : 'min-content',
          flexWrap: isInline ? 'nowrap' : 'wrap',
        }}
      >
        {scopes.map((scope) => {
          const isActive = scope.key === activeScope;
          const hasCount = typeof scope.count === 'number';

          return (
            <Box
              key={scope.key}
              as="button"
              data-part="pill"
              data-active={isActive}
              aria-pressed={isActive}
              onClick={() => onScopeChange(scope.key)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: isInline ? 5 : 8,
                height: isInline ? 30 : 32,
                padding: isInline ? '0 7px' : '0 12px',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}
            >
              <Text
                data-part="pill-label"
                size="sm"
                style={{
                  lineHeight: 1,
                }}
              >
                {scope.label}
              </Text>
              {hasCount && (
                <Box
                  data-part="count-badge"
                  data-active={isActive}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minWidth: 18,
                    height: 18,
                    padding: isInline ? '0 4px' : '0 6px',
                    flexShrink: 0,
                  }}
                >
                  {scope.count}
                </Box>
              )}
            </Box>
          );
        })}
      </Flex>
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
