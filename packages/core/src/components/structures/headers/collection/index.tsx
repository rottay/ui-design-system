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

import { useEffect, useState, type ReactNode } from 'react';

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
  /** Typography treatment for the hero title. */
  titleTreatment?: 'default' | 'display' | 'dotted';
  /** Subtitle rendered below the title. */
  subtitle: string;
  /** Tone/treatment for the subtitle copy. */
  subtitleTreatment?: 'default' | 'mono-technical';
  /** Overall composition variant for premium workspace headers. */
  layoutVariant?: 'default' | 'editorial-tech';
  /** Compact tone-coded chips rendered below the action cluster. */
  metaItems?: CollectionHeaderMetaItem[];
  /** Placement for meta items relative to the action rail. */
  metaItemsPlacement?: 'below' | 'inline-start' | 'eyebrow-end';
  /** Compact pill hints rendered after the meta items. */
  shortcuts?: CollectionHeaderShortcut[];
  /** Right-side action buttons rendered in a raised pill cluster. */
  quickActions?: CollectionHeaderQuickAction[];
  /** When embedded, the header becomes visually transparent to a parent shell. */
  surfaceVariant?: 'default' | 'embedded';
}

export function CollectionHeader({
  eyebrow,
  title,
  titleTreatment = 'default',
  subtitle,
  subtitleTreatment = 'default',
  layoutVariant = 'default',
  metaItems,
  metaItemsPlacement = 'below',
  shortcuts,
  quickActions,
  surfaceVariant = 'default',
}: CollectionHeaderProps) {
  const [isCompactViewport, setIsCompactViewport] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return;
    }

    const mediaQuery = window.matchMedia('(max-width: 959px)');
    const syncViewport = () => setIsCompactViewport(mediaQuery.matches);
    syncViewport();

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', syncViewport);
      return () => mediaQuery.removeEventListener('change', syncViewport);
    }

    mediaQuery.addListener(syncViewport);
    return () => mediaQuery.removeListener(syncViewport);
  }, []);

  const embedded = surfaceVariant === 'embedded';
  const useDisplayTitle = titleTreatment === 'display';
  const useDottedTitle = titleTreatment === 'dotted';
  const useMonoSubtitle = subtitleTreatment === 'mono-technical';
  const editorialTech = layoutVariant === 'editorial-tech';
  const compactLayout = isCompactViewport;
  const displayInk = 'var(--ds-collection-header-display-color, var(--ds-color-primary))';
  const displayShade = 'var(--ds-collection-header-display-shade, var(--ds-color-text-primary))';
  const compactMetaItems = metaItems ?? [];
  const inlineMetaItems = metaItemsPlacement === 'inline-start' ? compactMetaItems : [];
  const eyebrowMetaItems = metaItemsPlacement === 'eyebrow-end' ? compactMetaItems : [];
  const belowMetaItems = metaItemsPlacement === 'below' ? compactMetaItems : [];
  const eyebrowChip = eyebrow ? (
    <Text
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        minHeight: 'var(--ds-spacing-6, 22px)',
        padding: '0 var(--ds-spacing-2, 9px)',
        borderRadius: 999,
        border: '1px solid var(--ds-color-border-subtle)',
        background: embedded
          ? 'color-mix(in srgb, var(--ds-surface-panel) 72%, transparent)'
          : 'var(--ds-surface-panel)',
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

  const renderMetaItem = (item: CollectionHeaderMetaItem) => {
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
          whiteSpace: 'nowrap',
          ...toneStyles,
        }}
      >
        {item.label}
      </Box>
    );
  };

  return (
    <Box
      style={{
        position: 'relative',
        overflow: 'hidden',
        padding: embedded
          ? editorialTech
            ? compactLayout
              ? 'var(--ds-spacing-4, 14px) var(--ds-spacing-4, 14px) var(--ds-spacing-1, 4px)'
              : 'var(--ds-spacing-4, 16px) var(--ds-spacing-5, 20px) var(--ds-spacing-1, 4px)'
            : 'var(--ds-spacing-5, 18px) var(--ds-spacing-5, 18px) var(--ds-spacing-2, 10px)'
          : editorialTech
            ? compactLayout
              ? 'var(--ds-spacing-4, 14px) var(--ds-spacing-4, 14px) var(--ds-spacing-2, 10px)'
              : 'var(--ds-spacing-5, 20px) var(--ds-spacing-5, 20px) var(--ds-spacing-3, 12px)'
            : 'var(--ds-spacing-5, 18px) var(--ds-spacing-5, 18px) var(--ds-spacing-3, 14px)',
        background: embedded ? 'transparent' : 'var(--ds-surface-card)',
        borderBottom: embedded ? 'none' : '1px solid var(--ds-color-border-subtle)',
      }}
    >
      <Flex
        align="start"
        justify="between"
        gap={compactLayout ? 14 : editorialTech ? 24 : 18}
        wrap="wrap"
        style={{ position: 'relative' }}
      >
        <Box
          style={{
            minWidth: 0,
            flex: compactLayout
              ? '1 1 100%'
              : editorialTech
                ? '1 1 clamp(300px, 42%, 560px)'
                : '1 1 clamp(280px, 38%, 460px)',
            maxWidth: compactLayout ? '100%' : editorialTech ? 680 : 560,
            display: 'grid',
            gap: editorialTech ? 0 : undefined,
          }}
        >
          <Box
            as="h2"
            style={{
              fontFamily: useDisplayTitle
                ? 'var(--ds-font-family-display, var(--ds-font-family-heading))'
                : 'var(--ds-font-family-heading)',
              fontSize: useDisplayTitle
                ? 'clamp(42px, 5.4vw, 58px)'
                : useDottedTitle
                  ? compactLayout
                    ? 'clamp(26px, 8.8vw, 34px)'
                    : editorialTech
                      ? 'clamp(40px, 5.2vw, 54px)'
                      : 'clamp(38px, 4.8vw, 52px)'
                : 'clamp(var(--ds-font-size-3xl, 30px), 2vw, var(--ds-font-size-4xl, 36px))',
              fontWeight: useDisplayTitle
                ? ('var(--ds-font-weight-semibold, 680)' as any)
                : useDottedTitle
                  ? (compactLayout
                      ? 'var(--ds-font-weight-bold, 760)'
                      : editorialTech
                        ? 'var(--ds-font-weight-semibold, 700)'
                        : 'var(--ds-font-weight-extrabold, 820)') as any
                : ('var(--ds-font-weight-bold, 700)' as any),
              letterSpacing: useDisplayTitle
                ? '0.015em'
                : useDottedTitle
                  ? compactLayout
                    ? '-0.022em'
                    : editorialTech
                      ? '-0.052em'
                      : '-0.04em'
                  : 0,
              color: useDottedTitle ? 'transparent' : 'var(--ds-color-text-primary)',
              margin: 0,
              marginTop: 0,
              lineHeight: useDisplayTitle
                ? 0.9
                : useDottedTitle
                  ? compactLayout
                    ? 0.92
                    : editorialTech
                      ? 0.84
                      : 0.88
                  : 1.05,
              textWrap: 'balance',
              display: 'block',
              width: 'fit-content',
              textRendering: 'optimizeLegibility',
              textShadow: useDisplayTitle
                ? `0 0 24px color-mix(in srgb, ${displayInk} 12%, transparent)`
                : undefined,
              textTransform: (useDisplayTitle || useDottedTitle) ? ('uppercase' as const) : undefined,
              backgroundImage: useDottedTitle
                ? [
                    compactLayout
                      ? `radial-gradient(circle at 1px 1px, color-mix(in srgb, ${displayInk} 76%, ${displayShade} 24%) 0 0.45px, transparent 0.65px)`
                      : editorialTech
                        ? `radial-gradient(circle at 1.35px 1.35px, color-mix(in srgb, ${displayInk} 78%, ${displayShade} 22%) 0 0.56px, transparent 0.72px)`
                        : `radial-gradient(circle, color-mix(in srgb, ${displayInk} 82%, ${displayShade} 18%) 0 1px, transparent 1.2px)`,
                    compactLayout
                      ? `linear-gradient(180deg, color-mix(in srgb, ${displayShade} 60%, ${displayInk} 40%) 0%, color-mix(in srgb, ${displayInk} 52%, transparent) 100%)`
                      : editorialTech
                        ? `linear-gradient(180deg, color-mix(in srgb, ${displayShade} 58%, ${displayInk} 42%) 0%, color-mix(in srgb, ${displayInk} 68%, ${displayShade} 20%) 54%, color-mix(in srgb, ${displayInk} 42%, transparent) 100%)`
                        : `linear-gradient(180deg, color-mix(in srgb, ${displayShade} 58%, ${displayInk} 42%) 0%, color-mix(in srgb, ${displayInk} 56%, transparent) 100%)`,
                  ].join(', ')
                : undefined,
              backgroundSize: useDottedTitle
                ? compactLayout
                  ? '4px 4px, 100% 100%'
                  : editorialTech
                    ? '5.2px 5.2px, 100% 100%'
                    : '6px 6px, 100% 100%'
                : undefined,
              backgroundPosition: useDottedTitle ? '0 0, 0 0' : undefined,
              WebkitBackgroundClip: useDottedTitle ? ('text, text' as any) : undefined,
              backgroundClip: useDottedTitle ? ('text, text' as any) : undefined,
              WebkitTextFillColor: useDottedTitle ? 'transparent' : undefined,
              WebkitTextStroke: useDottedTitle
                ? compactLayout
                  ? `0.24px color-mix(in srgb, ${displayInk} 20%, transparent)`
                  : editorialTech
                    ? `0.32px color-mix(in srgb, ${displayInk} 24%, transparent)`
                    : `1px color-mix(in srgb, ${displayInk} 28%, transparent)`
                : undefined,
              filter: useDottedTitle
                ? compactLayout
                  ? `drop-shadow(0 0 6px color-mix(in srgb, ${displayInk} 8%, transparent))`
                  : editorialTech
                    ? `drop-shadow(0 0 8px color-mix(in srgb, ${displayInk} 10%, transparent))`
                    : `drop-shadow(0 0 18px color-mix(in srgb, ${displayInk} 12%, transparent))`
                : undefined,
            }}
          >
            {title}
          </Box>
          {editorialTech && !compactLayout ? (
            <Flex
              align="start"
              gap={12}
              style={{
                marginTop: 'var(--ds-spacing-2, 10px)',
                maxWidth: 760,
              }}
            >
              <Box
                style={{
                  flexShrink: 0,
                  width: 28,
                  height: 1,
                  marginTop: 9,
                  background:
                    'linear-gradient(90deg, color-mix(in srgb, var(--ds-color-border-subtle) 82%, transparent) 0%, color-mix(in srgb, var(--ds-color-border-subtle) 34%, transparent) 100%)',
                }}
              />
              <Text
                style={{
                  display: 'block',
                  fontSize: useDisplayTitle
                    ? 'var(--ds-font-size-xs, 11px)'
                    : useDottedTitle
                      ? '10px'
                      : 'var(--ds-font-size-sm, 12px)',
                  color: 'color-mix(in srgb, var(--ds-color-text-secondary) 88%, var(--ds-color-primary) 12%)',
                  lineHeight: 1.56,
                  textWrap: 'pretty',
                  fontFamily: useMonoSubtitle
                    ? 'var(--ds-font-family-mono, var(--ds-font-family-base))'
                    : undefined,
                  letterSpacing: useMonoSubtitle ? '0.135em' : useDottedTitle ? '0.08em' : undefined,
                  textTransform: (useDisplayTitle || useDottedTitle || useMonoSubtitle) ? ('uppercase' as const) : undefined,
                  opacity: 0.92,
                  maxWidth: 680,
                }}
              >
                {subtitle}
              </Text>
            </Flex>
          ) : (
            <Flex
              align="start"
              gap={10}
              style={{
                marginTop: useDisplayTitle
                  ? 'var(--ds-spacing-2, 10px)'
                  : useDottedTitle
                    ? compactLayout
                      ? 'var(--ds-spacing-2, 6px)'
                      : 'var(--ds-spacing-2, 8px)'
                    : 'var(--ds-spacing-3, 10px)',
                paddingTop: compactLayout ? 'var(--ds-spacing-2, 8px)' : 'var(--ds-spacing-3, 10px)',
                maxWidth: compactLayout ? '100%' : 620,
                borderTop: '1px solid color-mix(in srgb, var(--ds-color-border-subtle) 72%, transparent)',
              }}
            >
              <Box
                aria-hidden
                style={{
                  width: 3,
                  minHeight: compactLayout ? 28 : 34,
                  alignSelf: 'stretch',
                  flexShrink: 0,
                  borderRadius: 999,
                  background:
                    'linear-gradient(180deg, color-mix(in srgb, var(--ds-color-primary) 48%, transparent) 0%, color-mix(in srgb, var(--ds-color-primary) 12%, transparent) 100%)',
                }}
              />
              <Text
                style={{
                  display: 'block',
                  fontSize: useDisplayTitle
                    ? 'var(--ds-font-size-xs, 11px)'
                    : useDottedTitle
                      ? compactLayout
                        ? '11px'
                        : 'var(--ds-font-size-xs, 10px)'
                      : 'var(--ds-font-size-sm, 12px)',
                  color: 'var(--ds-color-text-secondary)',
                  lineHeight: useDisplayTitle ? 1.65 : useDottedTitle ? (compactLayout ? 1.45 : 1.55) : 1.5,
                  textWrap: 'pretty',
                  fontFamily: useMonoSubtitle
                    ? 'var(--ds-font-family-mono, var(--ds-font-family-base))'
                    : undefined,
                  letterSpacing: useDisplayTitle
                    ? '0.03em'
                    : useMonoSubtitle
                      ? compactLayout
                        ? '0.05em'
                        : '0.09em'
                      : useDottedTitle
                        ? compactLayout
                          ? '0.03em'
                          : '0.08em'
                        : undefined,
                  textTransform: (useDisplayTitle || useDottedTitle || useMonoSubtitle) ? ('uppercase' as const) : undefined,
                  opacity: (useDisplayTitle || useDottedTitle) ? 0.88 : undefined,
                  maxWidth: '100%',
                }}
              >
                {subtitle}
              </Text>
            </Flex>
          )}
          {editorialTech && !compactLayout && (
            <Box
              style={{
                marginTop: 'var(--ds-spacing-3, 12px)',
                height: 1,
                width: 'min(100%, 720px)',
                background:
                  'linear-gradient(90deg, color-mix(in srgb, var(--ds-color-border-subtle) 76%, transparent) 0%, color-mix(in srgb, var(--ds-color-border-subtle) 40%, transparent) 40%, color-mix(in srgb, var(--ds-color-border-subtle) 18%, transparent) 72%, transparent 100%)',
              }}
            />
          )}
        </Box>

        {quickActions && quickActions.length > 0 && (
          <Box
            style={{
              flexShrink: 1,
              flex: compactLayout ? '1 1 100%' : '1 1 min(100%, 420px)',
              width: compactLayout ? '100%' : 'auto',
              maxWidth: compactLayout ? '100%' : 560,
              minWidth: compactLayout ? 0 : 300,
              marginLeft: compactLayout ? 0 : 'auto',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'stretch',
            }}
          >
            {(eyebrowChip || eyebrowMetaItems.length > 0) && (
              <Flex
                align="center"
                gap={8}
                wrap="wrap"
                justify={compactLayout ? 'start' : 'end'}
                style={{
                  marginBottom: editorialTech ? 'var(--ds-spacing-2, 8px)' : 'var(--ds-spacing-3, 10px)',
                }}
              >
                {eyebrowMetaItems.map(renderMetaItem)}
                {eyebrowChip}
              </Flex>
            )}
            <Box
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: compactLayout ? 'flex-start' : 'flex-end',
                flexWrap: 'wrap',
                gap: editorialTech ? 6 : 8,
                padding: 'var(--ds-spacing-1, 2px)',
                width: compactLayout ? '100%' : 'fit-content',
                maxWidth: '100%',
                borderRadius: 'var(--ds-radius-md, 15px)',
                border: '1px solid var(--ds-color-border-subtle)',
                background: embedded
                  ? editorialTech
                    ? 'color-mix(in srgb, var(--ds-surface-panel) 68%, transparent)'
                    : 'color-mix(in srgb, var(--ds-surface-panel) 76%, transparent)'
                  : 'var(--ds-surface-panel)',
                boxShadow: embedded
                  ? editorialTech
                    ? '0 8px 18px color-mix(in srgb, var(--ds-color-primary) 10%, transparent), inset 0 1px 0 color-mix(in srgb, var(--ds-color-bg-elevated) 52%, transparent)'
                    : '0 10px 24px color-mix(in srgb, var(--ds-color-primary) 12%, transparent), inset 0 1px 0 color-mix(in srgb, var(--ds-color-bg-elevated) 58%, transparent)'
                  : 'var(--ds-elevation-1)',
                alignSelf: compactLayout ? 'stretch' : 'flex-end',
              }}
            >
              {inlineMetaItems.length > 0 && (
                <Flex
                  align="center"
                  gap={6}
                  wrap="wrap"
                  justify={compactLayout ? 'start' : 'end'}
                  style={{
                    paddingLeft: 'var(--ds-spacing-2, 8px)',
                  }}
                >
                  {inlineMetaItems.map(renderMetaItem)}
                </Flex>
              )}
              <Flex align="center" gap={8} wrap="wrap" justify={compactLayout ? 'start' : 'end'}>
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

            {(belowMetaItems.length > 0 || (shortcuts && shortcuts.length > 0)) && (
              <Box
                style={{
                  marginTop: 'var(--ds-spacing-3, 12px)',
                  display: 'grid',
                  gap: 'var(--ds-spacing-1, 6px)',
                  justifyItems: compactLayout ? 'start' : 'end',
                }}
              >
                {belowMetaItems.length > 0 && (
                  <Flex align="center" gap={8} wrap="wrap" justify={compactLayout ? 'start' : 'end'}>
                    {belowMetaItems.map(renderMetaItem)}
                  </Flex>
                )}

                {shortcuts && shortcuts.length > 0 && (
                  <Flex align="center" gap={8} wrap="wrap" justify={compactLayout ? 'start' : 'end'}>
                    <Box
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 'var(--ds-spacing-1, 6px)',
                        minHeight: 'var(--ds-spacing-5, 20px)',
                        padding: '0 var(--ds-spacing-2, 8px)',
                        borderRadius: 999,
                        border: '1px solid var(--ds-color-border-subtle)',
                        background: embedded
                          ? 'color-mix(in srgb, var(--ds-surface-panel) 68%, transparent)'
                          : 'var(--ds-surface-panel)',
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
                          background: embedded
                            ? 'color-mix(in srgb, var(--ds-surface-panel) 66%, transparent)'
                            : 'var(--ds-surface-panel)',
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

        {!quickActions?.length && (eyebrowChip || compactMetaItems.length > 0 || (shortcuts && shortcuts.length > 0)) && (
          <Box
            style={{
              flexShrink: 1,
              flex: compactLayout ? '1 1 100%' : '1 1 min(100%, 420px)',
              width: compactLayout ? '100%' : 'auto',
              maxWidth: compactLayout ? '100%' : 560,
              minWidth: compactLayout ? 0 : 260,
              marginLeft: compactLayout ? 0 : 'auto',
              display: 'grid',
              gap: 'var(--ds-spacing-2, 8px)',
              justifyItems: compactLayout ? 'start' : 'end',
            }}
          >
            {(eyebrowChip || eyebrowMetaItems.length > 0) && (
              <Flex align="center" gap={8} wrap="wrap" justify={compactLayout ? 'start' : 'end'}>
                {eyebrowMetaItems.map(renderMetaItem)}
                {eyebrowChip}
              </Flex>
            )}

            {(inlineMetaItems.length > 0 || belowMetaItems.length > 0) && (
              <Flex align="center" gap={8} wrap="wrap" justify={compactLayout ? 'start' : 'end'}>
                {[...inlineMetaItems, ...belowMetaItems].map(renderMetaItem)}
              </Flex>
            )}

            {shortcuts && shortcuts.length > 0 && (
              <Flex align="center" gap={8} wrap="wrap" justify={compactLayout ? 'start' : 'end'}>
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
                      background: embedded
                        ? 'color-mix(in srgb, var(--ds-surface-panel) 66%, transparent)'
                        : 'var(--ds-surface-panel)',
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
