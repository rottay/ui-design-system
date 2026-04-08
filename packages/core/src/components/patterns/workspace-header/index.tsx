'use client';

/**
 * @fileoverview WorkspaceHeader pattern -- premium hero header for
 * workspace landing pages with eyebrow chip, hero title, subtitle,
 * quick actions cluster, compact meta chips and shortcut hints.
 *
 * @description
 * Engine-free pattern that pairs with the EntityTableWorkspace family of
 * list/workspace pages. Sits visually above ListToolbar / TableToolbar.
 * The pattern packs four optional clusters around the title:
 *   - eyebrow chip (uppercase pill identifying the workspace)
 *   - quick actions cluster (right-side action buttons in a raised pill)
 *   - meta items (tone-coded compact chips for status/count signals)
 *   - shortcuts (compact pill hints for keyboard navigation)
 *
 * Visually distinct from `CockpitHeader` (detail-page style: 22px title,
 * plain background, simple actions) and `WorkbenchHeader` (briefing style:
 * exception count, saved view selector). Use this pattern when you want a
 * 36px hero title, a subtle grid background, and a packed right rail.
 *
 * The pattern stays domain-agnostic: it knows nothing about tenants,
 * users, or any specific entity. All copy comes from props.
 *
 * @module @rottay/design-system/patterns/workspace-header
 */

import type { ReactNode } from 'react';

import { Keyboard } from 'lucide-react';

import { Box, Button, Flex, Text } from '../../primitives';

export interface WorkspaceHeaderQuickAction {
  key: string;
  label: string;
  icon?: ReactNode;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'default';
}

export interface WorkspaceHeaderMetaItem {
  key: string;
  label: string;
  tone?: 'neutral' | 'primary' | 'success';
}

export interface WorkspaceHeaderShortcut {
  key: string;
  label: string;
}

export interface WorkspaceHeaderProps {
  /** Uppercase eyebrow chip rendered above the action cluster. */
  eyebrow: string;
  /** Hero title (36px). */
  title: string;
  /** Subtitle rendered below the title. */
  subtitle: string;
  /** Compact tone-coded chips rendered below the action cluster. */
  metaItems?: WorkspaceHeaderMetaItem[];
  /** Compact pill hints rendered after the meta items. */
  shortcuts?: WorkspaceHeaderShortcut[];
  /** Right-side action buttons rendered in a raised pill cluster. */
  quickActions?: WorkspaceHeaderQuickAction[];
}

export function WorkspaceHeader({
  eyebrow,
  title,
  subtitle,
  metaItems,
  shortcuts,
  quickActions,
}: WorkspaceHeaderProps) {
  const compactMetaItems = metaItems ?? [];
  const eyebrowChip = eyebrow ? (
    <Text
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        minHeight: 22,
        padding: '0 9px',
        borderRadius: 999,
        border: '1px solid color-mix(in srgb, var(--ds-color-border-secondary) 82%, transparent)',
        background: 'color-mix(in srgb, var(--ds-color-bg-primary) 56%, transparent)',
        fontSize: 9,
        fontWeight: 700,
        textTransform: 'uppercase' as const,
        letterSpacing: '0.13em',
        color: 'color-mix(in srgb, var(--ds-color-text-muted) 90%, white 10%)',
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
        padding: '18px 18px 14px',
        background:
          'linear-gradient(180deg, color-mix(in srgb, var(--ds-surface-card) 97%, white 3%), color-mix(in srgb, var(--ds-surface-card) 94%, var(--ds-color-bg-primary) 6%))',
        borderBottom: '1px solid color-mix(in srgb, var(--ds-color-border-subtle) 88%, transparent)',
      }}
    >
      <Box
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          backgroundImage: `
            linear-gradient(color-mix(in srgb, var(--ds-color-primary) 5%, transparent) 1px, transparent 1px),
            linear-gradient(90deg, color-mix(in srgb, var(--ds-color-primary) 5%, transparent) 1px, transparent 1px)
          `,
          backgroundSize: '34px 34px',
          opacity: 0.34,
        }}
      />

      <Box
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          background:
            'linear-gradient(180deg, color-mix(in srgb, white 2%, transparent), transparent 46%, color-mix(in srgb, black 4%, transparent))',
        }}
      />

      <Flex
        align="start"
        justify="between"
        gap={18}
        wrap="wrap"
        style={{ position: 'relative', zIndex: 1 }}
      >
        <Box style={{ minWidth: 0, flex: '1 1 560px', maxWidth: 820 }}>
          <Box
            as="h2"
            style={{
              fontFamily: 'var(--ds-font-family-heading)',
              fontSize: 36,
              fontWeight: 780,
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
              fontSize: 12,
              color: 'color-mix(in srgb, var(--ds-color-text-secondary) 86%, white 14%)',
              marginTop: 7,
              lineHeight: 1.5,
              maxWidth: 560,
              textWrap: 'pretty',
            }}
          >
            {subtitle}
          </Text>
          <Box
            aria-hidden
            style={{
              marginTop: 10,
              width: 88,
              height: 2,
              borderRadius: 999,
              background:
                'linear-gradient(90deg, color-mix(in srgb, var(--ds-color-primary) 42%, white 8%), color-mix(in srgb, var(--ds-color-primary) 12%, transparent) 68%, transparent)',
            }}
          />
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
                  marginBottom: 10,
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
                padding: 2,
                borderRadius: 15,
                border: '1px solid color-mix(in srgb, var(--ds-color-border-secondary) 82%, transparent)',
                background:
                  'linear-gradient(180deg, color-mix(in srgb, var(--ds-surface-card) 90%, white 10%), color-mix(in srgb, var(--ds-surface-card) 92%, var(--ds-color-bg-primary) 8%))',
                boxShadow:
                  'inset 0 1px 0 color-mix(in srgb, white 6%, transparent), 0 10px 28px color-mix(in srgb, black 8%, transparent)',
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
                      minHeight: 32,
                      paddingInline: action.variant === 'primary' ? 14 : 11,
                      borderRadius: '999px',
                      boxShadow: action.variant === 'primary' ? 'var(--ds-elevation-1)' : 'none',
                      fontSize: 11,
                    }}
                  >
                    {action.icon && (
                      <Box
                        as="span"
                        style={{
                          display: 'inline-flex',
                          marginRight: 6,
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
                  marginTop: 12,
                  display: 'grid',
                  gap: 6,
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
                                border: '1px solid color-mix(in srgb, var(--ds-color-border-secondary) 84%, transparent)',
                                background: 'color-mix(in srgb, var(--ds-color-bg-primary) 52%, transparent)',
                                color: 'var(--ds-color-text-secondary)',
                              };

                      return (
                        <Box
                          key={item.key}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            minHeight: 22,
                            padding: '0 8px',
                            borderRadius: 999,
                            fontSize: 10,
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
                        gap: 6,
                        minHeight: 20,
                        padding: '0 8px',
                        borderRadius: 999,
                        border: '1px solid color-mix(in srgb, var(--ds-color-border-secondary) 84%, transparent)',
                        background: 'color-mix(in srgb, var(--ds-color-bg-primary) 48%, transparent)',
                        color: 'var(--ds-color-text-muted)',
                        fontSize: 8,
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
                          minHeight: 20,
                          padding: '0 8px',
                          borderRadius: 999,
                          border: '1px solid color-mix(in srgb, var(--ds-color-border-secondary) 84%, transparent)',
                          background: 'color-mix(in srgb, var(--ds-color-bg-primary) 48%, transparent)',
                          color: 'var(--ds-color-text-muted)',
                          fontSize: 9,
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
