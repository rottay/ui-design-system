'use client';

/**
 * @fileoverview CollectionHeader — structures-tier hero header for
 * workspace landing pages with eyebrow chip, hero title, subtitle,
 * quick actions cluster, compact meta chips and shortcut hints.
 *
 * @description
 * Engine-free structures family that pairs with the EntityTableWorkspace family of
 * list/workspace pages. Sits visually above ListToolbar / TableToolbar.
 * The pattern packs four optional clusters around the title:
 *   - eyebrow chip (uppercase pill identifying the workspace)
 *   - quick actions cluster (right-side action buttons in a raised pill)
 *   - meta items (tone-coded compact chips for status/count signals)
 *   - shortcuts (compact pill hints for keyboard navigation)
 *
 * Visually distinct from `CockpitHeader` (detail-page style: 22px title,
 * plain background, simple actions) and `WorkbenchHeader` (briefing style:
 * exception count, saved view selector). Use this structures family when you want a
 * 36px hero title, a flat card background, and a packed right rail.
 *
 * The family stays domain-agnostic: it knows nothing about tenants,
 * users, or any specific entity. All copy comes from props.
 */

import type { ReactNode } from 'react';

import { Keyboard } from 'lucide-react';

import { Box, Button, Flex, Text } from '../../../primitives';

export interface CollectionHeaderQuickAction {
  key: string;
  label: string;
  icon?: ReactNode;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'default';
}

export interface CollectionHeaderMetaItem {
  key: string;
  label: string;
  tone?: 'neutral' | 'primary' | 'success';
}

export interface CollectionHeaderShortcut {
  key: string;
  label: string;
}

export interface CollectionHeaderProps {
  /** Uppercase eyebrow chip rendered above the action cluster. */
  eyebrow: string;
  /** Hero title (36px). */
  title: string;
  /** Subtitle rendered below the title. */
  subtitle: string;
  /** Compact tone-coded chips rendered below the action cluster. */
  metaItems?: CollectionHeaderMetaItem[];
  /** Compact pill hints rendered after the meta items. */
  shortcuts?: CollectionHeaderShortcut[];
  /** Right-side action buttons rendered in a raised pill cluster. */
  quickActions?: CollectionHeaderQuickAction[];
}

export function CollectionHeader({
  eyebrow,
  title,
  subtitle,
  metaItems,
  shortcuts,
  quickActions,
}: CollectionHeaderProps) {
  const compactMetaItems = metaItems ?? [];
  const eyebrowChip = eyebrow ? (
    <Text
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        minHeight: 'var(--ds-spacing-6, 22px)',
        padding: '0 var(--ds-spacing-2, 9px)',
        borderRadius: 999,
        border: '1px solid var(--ds-color-border-subtle)',
        background: 'var(--ds-surface-panel)',
        fontSize: 'var(--ds-font-size-xs, 9px)',
        fontWeight: 700,
        textTransform: 'uppercase' as const,
        letterSpacing: '0.13em',
        color: 'var(--ds-color-text-muted)',
        lineHeight: 1,
      }}
    >
      {eyebrow}
    </Text>
  ) : null;

  return (
    <Box
      style={{
        position: 'relative',
        overflow: 'hidden',
        padding: 'var(--ds-spacing-5, 18px) var(--ds-spacing-5, 18px) var(--ds-spacing-3, 14px)',
        background: 'var(--ds-surface-card)',
        borderBottom: '1px solid var(--ds-color-border-subtle)',
      }}
    >
      <Flex
        align="start"
        justify="between"
        gap={18}
        wrap="wrap"
        style={{ position: 'relative' }}
      >
        <Box style={{ minWidth: 0, flex: '1 1 560px', maxWidth: 820 }}>
          <Box
            as="h2"
            style={{
              fontFamily: 'var(--ds-font-family-heading)',
              fontSize: 'var(--ds-font-size-4xl, 36px)',
              fontWeight: 'var(--ds-font-weight-bold, 780)' as any,
              letterSpacing: '-0.05em',
              color: 'var(--ds-color-text-primary)',
              margin: 0,
              marginTop: 0,
              lineHeight: 0.92,
              textWrap: 'balance',
            }}
          >
            {title}
          </Box>
          <Text
            style={{
              fontSize: 'var(--ds-font-size-sm, 12px)',
              color: 'var(--ds-color-text-secondary)',
              marginTop: 'var(--ds-spacing-2, 7px)',
              lineHeight: 1.5,
              maxWidth: 560,
              textWrap: 'pretty',
            }}
          >
            {subtitle}
          </Text>
        </Box>

        {quickActions && quickActions.length > 0 && (
          <Box
            style={{
              flexShrink: 0,
              flex: '0 0 auto',
              width: 'auto',
              maxWidth: 'none',
            }}
          >
            {eyebrowChip && (
              <Box
                style={{
                  marginBottom: 'var(--ds-spacing-3, 10px)',
                  display: 'flex',
                  justifyContent: 'flex-end',
                }}
              >
                {eyebrowChip}
              </Box>
            )}
            <Box
              style={{
                display: 'inline-flex',
                justifyContent: 'flex-end',
                padding: 'var(--ds-spacing-1, 2px)',
                borderRadius: 'var(--ds-radius-md, 15px)',
                border: '1px solid var(--ds-color-border-subtle)',
                background: 'var(--ds-surface-panel)',
                boxShadow: 'var(--ds-elevation-1)',
              }}
            >
              <Flex align="center" gap={8} wrap="wrap" justify="end">
                {quickActions.map((action) => (
                  <Button
                    key={action.key}
                    size="sm"
                    variant={
                      action.variant === 'primary'
                        ? 'primary'
                        : action.variant === 'secondary'
                          ? 'secondary'
                          : 'default'
                    }
                    onClick={action.onClick}
                    style={{
                      minHeight: 'var(--ds-spacing-8, 32px)',
                      paddingInline: action.variant === 'primary' ? 'var(--ds-spacing-3, 14px)' : 'var(--ds-spacing-3, 11px)',
                      borderRadius: '999px',
                      boxShadow: action.variant === 'primary' ? 'var(--ds-elevation-1)' : 'none',
                      fontSize: 'var(--ds-font-size-xs, 11px)',
                    }}
                  >
                    {action.icon && (
                      <Box
                        as="span"
                        style={{
                          display: 'inline-flex',
                          marginRight: 'var(--ds-spacing-1, 6px)',
                        }}
                      >
                        {action.icon}
                      </Box>
                    )}
                    {action.label}
                  </Button>
                ))}
              </Flex>
            </Box>

            {(compactMetaItems.length > 0 || (shortcuts && shortcuts.length > 0)) && (
              <Box
                style={{
                  marginTop: 'var(--ds-spacing-3, 12px)',
                  display: 'grid',
                  gap: 'var(--ds-spacing-1, 6px)',
                  justifyItems: 'end',
                }}
              >
                {compactMetaItems.length > 0 && (
                  <Flex align="center" gap={8} wrap="wrap" justify="end">
                    {compactMetaItems.map((item) => {
                      const toneStyles =
                        item.tone === 'primary'
                          ? {
                              border: '1px solid color-mix(in srgb, var(--ds-color-primary) 22%, transparent)',
                              background: 'color-mix(in srgb, var(--ds-color-primary) 8%, transparent)',
                              color: 'var(--ds-color-primary)',
                            }
                          : item.tone === 'success'
                            ? {
                                border: '1px solid color-mix(in srgb, var(--ds-color-success) 18%, transparent)',
                                background: 'color-mix(in srgb, var(--ds-color-success) 8%, transparent)',
                                color: 'var(--ds-color-success)',
                              }
                            : {
                                border: '1px solid var(--ds-color-border-subtle)',
                                background: 'var(--ds-surface-panel)',
                                color: 'var(--ds-color-text-secondary)',
                              };

                      return (
                        <Box
                          key={item.key}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            minHeight: 'var(--ds-spacing-6, 22px)',
                            padding: '0 var(--ds-spacing-2, 8px)',
                            borderRadius: 999,
                            fontSize: 'var(--ds-font-size-xs, 10px)',
                            fontWeight: 700,
                            letterSpacing: '0.02em',
                            ...toneStyles,
                          }}
                        >
                          {item.label}
                        </Box>
                      );
                    })}
                  </Flex>
                )}

                {shortcuts && shortcuts.length > 0 && (
                  <Flex align="center" gap={8} wrap="wrap" justify="end">
                    <Box
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 'var(--ds-spacing-1, 6px)',
                        minHeight: 'var(--ds-spacing-5, 20px)',
                        padding: '0 var(--ds-spacing-2, 8px)',
                        borderRadius: 999,
                        border: '1px solid var(--ds-color-border-subtle)',
                        background: 'var(--ds-surface-panel)',
                        color: 'var(--ds-color-text-muted)',
                        fontSize: 'var(--ds-font-size-xs, 8px)',
                        fontWeight: 700,
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase' as const,
                      }}
                    >
                      <Keyboard style={{ width: 10, height: 10 }} />
                      Shortcuts
                    </Box>
                    {shortcuts.map((shortcut) => (
                      <Box
                        key={shortcut.key}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          minHeight: 'var(--ds-spacing-5, 20px)',
                          padding: '0 var(--ds-spacing-2, 8px)',
                          borderRadius: 999,
                          border: '1px solid var(--ds-color-border-subtle)',
                          background: 'var(--ds-surface-panel)',
                          color: 'var(--ds-color-text-muted)',
                          fontSize: 'var(--ds-font-size-xs, 9px)',
                          fontWeight: 700,
                          letterSpacing: '0.03em',
                          lineHeight: 1,
                        }}
                      >
                        {shortcut.label}
                      </Box>
                    ))}
                  </Flex>
                )}
              </Box>
            )}
          </Box>
        )}

        {!quickActions?.length && eyebrowChip}
      </Flex>
    </Box>
  );
}

// Compatibility aliases for pre-Checkpoint-D names. Deprecated —
// migrate to the canonical new names above. Scheduled for removal in
// Checkpoint F if no consumers remain.
export { CollectionHeader as WorkspaceHeader };
export type {
  CollectionHeaderProps as WorkspaceHeaderProps,
  CollectionHeaderQuickAction as WorkspaceHeaderQuickAction,
  CollectionHeaderMetaItem as WorkspaceHeaderMetaItem,
  CollectionHeaderShortcut as WorkspaceHeaderShortcut,
};
