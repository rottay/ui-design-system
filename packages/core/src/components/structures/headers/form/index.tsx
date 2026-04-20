'use client';

/**
 * @fileoverview FormHeader — structures-tier create-form header with
 * required icon badge, back navigation, breadcrumb trail, hero title
 * cluster, and an action rail.
 *
 * @description
 * Engine-free structures family for create-form pages. Sibling to the
 * other three header families in `chrome/`:
 *
 *   - DetailHeader: read-only detail pages with optional tabs and
 *     metadata strips
 *   - EditHeader: edit pages with built-in Save / Cancel buttons,
 *     saving state, optional entityId chip, and an optional icon
 *   - FormHeader (this file): create-form pages with a REQUIRED icon
 *     badge, a simpler action rail (one or two actions, or a custom
 *     array), and a `mode` discriminator for create / edit / view
 *     contexts
 *
 * FormHeader is chrome, not a surface. The heavier DS `FormSurface` is
 * a full-page config object with `FormSurfaceConfig` + presentation/
 * behavior/visual/permissions layers and an integrated field renderer.
 * FormHeader is just the header strip — consumers compose it with
 * their own form body. Use this when you want a rich create-form
 * header without committing to the full surface config contract.
 *
 * Features:
 *   - Required icon badge (LucideIcon, displayed in colored box; the
 *     `colorVariant` prop controls the box tone -- 5 options:
 *     primary, secondary, success, warning, info)
 *   - Back button (uses NavigationLinkProvider Link adapter when
 *     mounted, falls back to native `<a>`)
 *   - Breadcrumb trail (same Link adapter resolution)
 *   - Hero title cluster: optional eyebrow chip, title, optional
 *     subtitle
 *   - Action rail: a single `action`, or `secondaryAction` + `action`
 *     pair, or a free-form `actions[]` array using
 *     `FormHeaderAction` with the SharedHeaderActionKind vocabulary
 *     from the shared header-actions helper
 *   - `mode` indicator (`'create' | 'edit' | 'view'`) -- carried as
 *     part of the API for consumer routing logic; not currently
 *     rendered visually
 *   - Optional context-rail / children slot inside a card below the
 *     hero
 *   - 4 archetype variants (control, editorial, technical,
 *     governance) each with their own gradient + grid background
 *     pattern
 *
 * The family stays domain-agnostic. All copy is consumer-supplied;
 * the component knows nothing about tenants, users, or any specific
 * entity.
 */

import { type CSSProperties, type ReactNode } from 'react';

import { ArrowLeftIcon } from '../../../../icons/catalog/navigation';
import type { ComponentType } from 'react';
type LucideIcon = ComponentType<any>;

import { Box, Breadcrumb, Button, Flex, Stack, Text, Tooltip } from '../../../primitives';
import { useNavigationLink } from '../../../../runtime/adapters/navigation';
import {
  type SharedHeaderActionKind,
  resolveSharedHeaderActionIcon,
  resolveSharedHeaderActionTooltip,
  resolveSharedHeaderActionVariant,
} from '../../../patterns/foundation/header-actions';

export interface FormHeaderAction {
  label: string;
  kind?: SharedHeaderActionKind;
  icon?: LucideIcon;
  onClick: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'ghost' | 'error';
  tooltip?: string;
}

export interface FormHeaderProps {
  /** Main icon displayed next to title */
  icon: LucideIcon;
  /** Page title */
  title: string;
  /** Subtitle/description */
  subtitle?: string;
  /** Back navigation URL */
  backHref: string;
  /** Back button label */
  backLabel?: string;
  /** Primary action button */
  action?: FormHeaderAction;
  /** Secondary action button */
  secondaryAction?: FormHeaderAction;
  /** Optional action cluster for richer create flows */
  actions?: FormHeaderAction[];
  /** Color variant for accent elements */
  colorVariant?: 'primary' | 'secondary' | 'success' | 'warning' | 'info';
  /** Form mode indicator */
  mode?: 'create' | 'edit' | 'view';
  /** Optional breadcrumb items */
  breadcrumb?: Array<{ label: string; href?: string }>;
  /** Additional content to render below header */
  children?: ReactNode;
  /** Visual archetype for the hero shell */
  archetype?: 'editorial' | 'control' | 'technical' | 'governance';
  /** Short eyebrow label above the title */
  eyebrow?: string;
  /** Optional context rail rendered below the hero copy */
  contextRail?: ReactNode;
}

const VARIANT_TOKEN_MAP: Record<'primary' | 'secondary' | 'success' | 'warning' | 'info', string> = {
  primary: 'primary',
  secondary: 'secondary',
  success: 'success',
  warning: 'warning',
  info: 'info',
};

function getVariantTone(variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'info') {
  const token = VARIANT_TOKEN_MAP[variant || 'secondary'];

  if (token === 'secondary') {
    return {
      background: 'color-mix(in srgb, var(--ds-color-bg-secondary) 92%, transparent)',
      border: 'var(--ds-color-border-secondary)',
      color: 'var(--ds-color-text-secondary)',
    };
  }

  return {
    background: `color-mix(in srgb, var(--ds-color-${token}) 10%, var(--ds-color-bg-secondary) 90%)`,
    border: `color-mix(in srgb, var(--ds-color-${token}) 18%, var(--ds-color-border-secondary) 82%)`,
    color: `color-mix(in srgb, var(--ds-color-${token}) 78%, var(--ds-color-text-primary) 22%)`,
  };
}

function buildPatternStyle(archetype: 'editorial' | 'control' | 'technical' | 'governance'): CSSProperties {
  const tone =
    archetype === 'governance'
      ? 'color-mix(in srgb, var(--ds-color-text-primary) 17%, transparent)'
      : archetype === 'technical'
        ? 'color-mix(in srgb, var(--ds-color-text-muted) 22%, transparent)'
        : archetype === 'editorial'
          ? 'color-mix(in srgb, var(--ds-color-text-primary) 16%, transparent)'
          : 'color-mix(in srgb, var(--ds-color-text-secondary) 18%, transparent)';
  const toneSecondary =
    archetype === 'governance'
      ? 'color-mix(in srgb, var(--ds-color-text-secondary) 10%, transparent)'
      : archetype === 'technical'
        ? 'color-mix(in srgb, var(--ds-color-text-primary) 10%, transparent)'
        : archetype === 'editorial'
          ? 'color-mix(in srgb, var(--ds-color-text-secondary) 10%, transparent)'
          : 'color-mix(in srgb, var(--ds-color-text-primary) 9%, transparent)';
  const gridColor =
    archetype === 'technical'
      ? 'color-mix(in srgb, var(--ds-color-text-muted) 30%, transparent)'
      : archetype === 'governance'
        ? 'color-mix(in srgb, var(--ds-color-text-muted) 28%, transparent)'
        : archetype === 'editorial'
          ? 'color-mix(in srgb, var(--ds-color-text-muted) 28%, transparent)'
          : 'color-mix(in srgb, var(--ds-color-text-muted) 26%, transparent)';
  const grid = archetype === 'technical' ? 22 : archetype === 'governance' ? 24 : 26;

  return {
    backgroundImage: [
      `radial-gradient(circle at 12% 16%, ${tone} 0%, transparent 48%)`,
      `radial-gradient(circle at 84% 2%, ${toneSecondary} 0%, transparent 34%)`,
      'radial-gradient(circle at 74% 100%, color-mix(in srgb, var(--ds-color-text-primary) 6%, transparent) 0%, transparent 42%)',
      'linear-gradient(180deg, color-mix(in srgb, var(--ds-color-text-primary) 4%, transparent) 0%, transparent 28%)',
      'linear-gradient(180deg, transparent 0%, transparent 40%, color-mix(in srgb, var(--ds-surface-card, var(--ds-color-bg-elevated)) 52%, transparent) 100%)',
      'linear-gradient(180deg, color-mix(in srgb, var(--ds-color-bg-secondary) 84%, transparent) 0%, color-mix(in srgb, var(--ds-surface-card, var(--ds-color-bg-elevated)) 100%, transparent) 100%)',
      `linear-gradient(${gridColor} 1px, transparent 1px)`,
      `linear-gradient(90deg, ${gridColor} 1px, transparent 1px)`,
    ].join(', '),
    backgroundSize: `100% 100%, 100% 100%, 100% 100%, 100% 100%, 100% 100%, 100% 100%, ${grid}px ${grid}px, ${grid}px ${grid}px`,
    backgroundPosition: '0 0, 0 0, 0 0, 0 0, 0 0, 0 0, 0 0, 0 0',
  };
}

export function FormHeader({
  icon: MainIcon,
  title,
  subtitle,
  backHref,
  backLabel = 'Back',
  action,
  secondaryAction,
  actions,
  colorVariant = 'secondary',
  mode: _mode = 'create',
  breadcrumb,
  children,
  archetype = 'control',
  eyebrow,
  contextRail,
}: FormHeaderProps) {
  // Resolve the framework-specific Link component once. Falls back to a
  // native <a> tag when no NavigationLinkProvider is mounted, which keeps
  // the DS package framework-agnostic.
  const NavLink = useNavigationLink();
  const renderHrefAnchor = (href: string, content: ReactNode, style?: CSSProperties) => {
    if (NavLink) {
      return (
        <NavLink href={href} style={style}>
          {content}
        </NavLink>
      );
    }
    return (
      <a href={href} style={style}>
        {content}
      </a>
    );
  };

  const iconTone = getVariantTone(colorVariant);
  const breadcrumbItems = breadcrumb?.map((item, index) => ({
    key: String(index),
    label: item.href ? renderHrefAnchor(item.href, item.label) : item.label,
  }));
  const resolvedActions = actions ?? [secondaryAction, action].filter(Boolean) as FormHeaderAction[];

  return (
    <Box
      style={{
        width: '100%',
        background: 'var(--ds-surface-card, var(--ds-color-bg-elevated))',
        border: '1px solid var(--ds-color-border-secondary)',
        borderRadius: 20,
        marginBottom: 24,
        overflow: 'hidden',
        boxShadow: '0 12px 28px color-mix(in srgb, var(--ds-color-text-primary) 10%, transparent)',
      }}
    >
      <Box
        style={{
          padding: '12px 24px',
          borderBottom: '1px solid var(--ds-color-border-secondary)',
          background: 'var(--ds-color-bg-secondary)',
        }}
      >
        <Flex justify="between" align="center">
          <Flex align="center" gap={16}>
            {renderHrefAnchor(
              backHref,
              <Flex
                align="center"
                gap={8}
                style={{
                  padding: '8px 12px',
                  background: 'transparent',
                  border: '1px solid var(--ds-color-border)',
                  borderRadius: 10,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                <ArrowLeftIcon style={{ width: 14, height: 14, color: 'var(--ds-color-text-secondary)' }} />
                <Text size="xs" style={{ color: 'var(--ds-color-text-secondary)' }}>
                  {backLabel}
                </Text>
              </Flex>,
              { textDecoration: 'none' },
            )}

            {breadcrumbItems && breadcrumbItems.length > 0 ? (
              <>
                <Box style={{ width: 1, height: 18, background: 'var(--ds-color-border-secondary)' }} />
                <Breadcrumb items={breadcrumbItems} />
              </>
            ) : null}
          </Flex>

          <Flex align="center" gap={12} wrap="wrap">
            {resolvedActions.map((headerAction, index) => {
              const ActionIcon = resolveSharedHeaderActionIcon(headerAction);

              return (
                <Tooltip key={`${headerAction.label}-${index}`} content={resolveSharedHeaderActionTooltip(headerAction)}>
                  <Button
                    variant={resolveSharedHeaderActionVariant(headerAction)}
                    size="sm"
                    icon={ActionIcon ? <ActionIcon style={{ width: 14, height: 14 }} /> : undefined}
                    onClick={headerAction.onClick}
                    loading={headerAction.loading}
                    disabled={headerAction.disabled}
                  >
                    {headerAction.label}
                  </Button>
                </Tooltip>
              );
            })}
          </Flex>
        </Flex>
      </Box>

      <Box style={{ padding: 28, ...buildPatternStyle(archetype) }}>
        <Flex align="center" gap={16}>
          <Box
            style={{
              width: 52,
              height: 52,
              background: iconTone.background,
              border: `1px solid ${iconTone.border}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 14,
              flexShrink: 0,
            }}
          >
            <MainIcon style={{ width: 22, height: 22, color: iconTone.color }} />
          </Box>
          <Stack spacing="xs" style={{ minWidth: 0 }}>
            {eyebrow ? (
              <Text
                size="xs"
                weight="bold"
                style={{
                  color: 'var(--ds-color-text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.12em',
                  fontFamily: 'var(--ds-font-family-mono, monospace)',
                }}
              >
                {eyebrow}
              </Text>
            ) : null}
            <Text style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--ds-color-text-primary)' }}>
              {title}
            </Text>
            {subtitle && (
              <Text size="sm" style={{ color: 'var(--ds-color-text-secondary)' }}>
                {subtitle}
              </Text>
            )}
          </Stack>
        </Flex>

        {contextRail || children ? (
          <Box
            style={{
              marginTop: 22,
              padding: '16px 18px 18px',
              borderRadius: 18,
              border: '1px solid var(--ds-color-border-secondary)',
              background: 'linear-gradient(180deg, color-mix(in srgb, var(--ds-color-bg-secondary) 58%, transparent) 0%, color-mix(in srgb, var(--ds-color-bg-secondary) 74%, transparent) 100%)',
              backgroundImage: [
                'radial-gradient(circle at 18% 0%, color-mix(in srgb, var(--ds-color-text-primary) 7%, transparent) 0%, transparent 34%)',
                'radial-gradient(circle at 82% 100%, color-mix(in srgb, var(--ds-color-text-secondary) 6%, transparent) 0%, transparent 36%)',
                'linear-gradient(180deg, color-mix(in srgb, var(--ds-color-bg-secondary) 54%, transparent) 0%, color-mix(in srgb, var(--ds-color-bg-secondary) 74%, transparent) 100%)',
                'linear-gradient(color-mix(in srgb, var(--ds-color-text-muted) 15%, transparent) 1px, transparent 1px)',
                'linear-gradient(90deg, color-mix(in srgb, var(--ds-color-text-muted) 15%, transparent) 1px, transparent 1px)',
              ].join(', '),
              backgroundSize: '100% 100%, 100% 100%, 100% 100%, 24px 24px, 24px 24px',
              backgroundPosition: '0 0, 0 0, 0 0, 0 0, 0 0',
              boxShadow: 'inset 0 1px 0 color-mix(in srgb, var(--ds-color-text-primary) 4%, transparent)',
              backdropFilter: 'blur(8px)',
            }}
          >
            {contextRail ? <Box>{contextRail}</Box> : null}
            {children ? (
              <Box style={{ marginTop: contextRail ? 18 : 0 }}>
                {children}
              </Box>
            ) : null}
          </Box>
        ) : null}
      </Box>
    </Box>
  );
}

export default FormHeader;
