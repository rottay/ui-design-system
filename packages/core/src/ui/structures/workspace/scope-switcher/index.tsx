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
  if (!scopes.length) return null;

  const isInline = variant === 'inline';

  return (
    <Box
      data-part="root"
      data-inline={isInline}
      className="ds-structure ds-scope-switcher"
      style={{
        padding: isInline ? 0 : '8px 16px',
        overflowX: 'auto',
        WebkitOverflowScrolling: 'touch',
      }}
    >
      <Flex
        align="center"
        gap={8}
        data-ds-scope-switcher-row="true"
        style={{
          minWidth: 'min-content',
          flexWrap: 'wrap',
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
              onClick={() => onScopeChange(scope.key)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                height: isInline ? 30 : 32,
                padding: isInline ? '0 11px' : '0 12px',
                fontSize: 13,
                fontWeight: isActive ? 700 : 600,
                cursor: 'pointer',
                transition: 'transform 0.16s ease, box-shadow 0.16s ease, border-color 0.16s ease, background 0.16s ease, color 0.16s ease',
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}
            >
              <Text
                data-part="pill-label"
                size="sm"
                style={{
                  fontSize: 12,
                  fontWeight: 'inherit',
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
                    padding: '0 6px',
                    fontSize: 10,
                    fontWeight: 700,
                    lineHeight: 1,
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
