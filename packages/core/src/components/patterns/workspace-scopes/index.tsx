'use client';

/**
 * @fileoverview WorkspaceScopes pattern -- horizontal scope pill strip for
 * switching between predefined data subsets.
 *
 * @description
 * Engine-free pattern that renders a horizontal row of scope pills (e.g.
 * "All", "Active", "Archived"). Each pill carries a label and an optional
 * count badge, and the active pill is highlighted with the primary tint.
 * Supports two visual variants: `section` (the default standalone bar) and
 * `inline` (compact, used inside toolbars or table headers).
 *
 * The pattern stays domain-agnostic. Scope keys, labels, counts, and
 * filter predicates are consumer-supplied via the ScopeDefinition shape;
 * the rail itself knows nothing about tenants, users, or any specific
 * entity.
 */

import { Box, Flex, Text } from '../../primitives';

/** Definition of a single scope pill rendered by the strip. */
export interface WorkspaceScopeDefinition {
  key: string;
  label: string;
  count?: number;
  /** Optional filter predicate the consumer applies when this scope is active. */
  filter?: Record<string, unknown>;
}

export interface WorkspaceScopesProps {
  scopes: WorkspaceScopeDefinition[];
  activeScope: string;
  onScopeChange: (scopeKey: string) => void;
  /** Visual variant. `inline` renders compact for toolbars / table headers. */
  variant?: 'section' | 'inline';
}

export function WorkspaceScopes({
  scopes,
  activeScope,
  onScopeChange,
  variant = 'section',
}: WorkspaceScopesProps) {
  if (!scopes.length) return null;

  const isInline = variant === 'inline';

  return (
    <Box
      style={{
        padding: isInline ? 0 : '8px 16px',
        overflowX: 'auto',
        WebkitOverflowScrolling: 'touch',
        borderBottom: isInline
          ? 'none'
          : '1px solid color-mix(in srgb, var(--ds-color-border-subtle) 88%, transparent)',
        background: isInline
          ? 'transparent'
          : 'linear-gradient(180deg, color-mix(in srgb, var(--ds-surface-card) 95%, var(--ds-color-bg-primary) 5%), color-mix(in srgb, var(--ds-surface-card) 92%, var(--ds-color-bg-primary) 8%))',
      }}
    >
      <Flex
        align="center"
        gap={8}
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
              onClick={() => onScopeChange(scope.key)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                height: isInline ? 30 : 32,
                padding: isInline ? '0 11px' : '0 12px',
                borderRadius: 9999,
                border: isActive
                  ? '1px solid color-mix(in srgb, var(--ds-color-primary) 42%, transparent)'
                  : '1px solid color-mix(in srgb, var(--ds-color-border-secondary) 80%, transparent)',
                background: isActive
                  ? 'linear-gradient(180deg, color-mix(in srgb, var(--ds-color-primary) 14%, var(--ds-surface-card)), color-mix(in srgb, var(--ds-color-primary) 9%, var(--ds-surface-card)))'
                  : 'linear-gradient(180deg, color-mix(in srgb, var(--ds-surface-card) 90%, white 10%), color-mix(in srgb, var(--ds-surface-card) 86%, var(--ds-color-bg-primary) 14%))',
                color: isActive
                  ? 'var(--ds-color-text-primary)'
                  : 'var(--ds-color-text-secondary)',
                fontSize: 13,
                fontWeight: isActive ? 700 : 600,
                cursor: 'pointer',
                outline: 'none',
                transition: 'transform 0.16s ease, box-shadow 0.16s ease, border-color 0.16s ease, background 0.16s ease, color 0.16s ease',
                whiteSpace: 'nowrap',
                flexShrink: 0,
                boxShadow: isActive ? '0 6px 16px color-mix(in srgb, var(--ds-color-primary) 8%, transparent)' : 'inset 0 1px 0 color-mix(in srgb, white 4%, transparent)',
              }}
            >
              <Text
                size="sm"
                style={{
                  fontSize: 12,
                  fontWeight: 'inherit',
                  color: 'inherit',
                  lineHeight: 1,
                }}
              >
                {scope.label}
              </Text>
              {hasCount && (
                <Box
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minWidth: 18,
                    height: 18,
                    padding: '0 6px',
                    borderRadius: 999,
                    background: isActive
                      ? 'color-mix(in srgb, var(--ds-color-primary) 18%, transparent)'
                      : 'color-mix(in srgb, var(--ds-color-bg-primary) 60%, transparent)',
                    color: isActive
                      ? 'var(--ds-color-primary)'
                      : 'var(--ds-color-text-muted)',
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
