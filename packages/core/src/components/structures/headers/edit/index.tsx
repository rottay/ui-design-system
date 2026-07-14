'use client';

/**
 * @fileoverview EditHeader — structures-tier edit-form header with back
 * navigation, breadcrumb trail, hero title cluster, status badge, save/
 * cancel actions, and optional structured action rail.
 *
 * @description
 * Engine-free structures family for entity-edit pages. Pairs with the
 * `record` building blocks (`RecordFieldGrid`,
 * `RecordField`) and with `form-sections` (`FormSections`)
 * to compose a full edit screen.
 *
 * EditHeader is chrome, not a surface. The heavier DS `FormSurface` is
 * a full-page config object with `FormSurfaceConfig` + presentation/
 * behavior/visual/permissions layers and an integrated field renderer.
 * EditHeader is just the header strip — consumers compose it with their
 * own form body. Use this when you want a rich edit-page header without
 * committing to the full surface config contract.
 *
 * Sibling chrome families:
 *   - DetailHeader — read-only detail pages with optional tabs and
 *     metadata strips
 *   - FormHeader — create-form pages with required-icon badge and a
 *     lighter action rail
 *   - EditHeader (this file) — edit pages with Save / Cancel / saving
 *     state built into the header action rail
 *
 * Features:
 *   - Back button (uses NavigationLinkProvider Link adapter when
 *     mounted, falls back to native `<a>`)
 *   - Breadcrumb trail (same Link adapter resolution)
 *   - Optional entityId chip (monospace, truncated to 8 chars)
 *   - Hero title cluster: optional eyebrow chip, title, optional status
 *     pill, optional subtitle
 *   - Optional icon badge (LucideIcon, displayed in colored box; the
 *     `colorVariant` prop controls the box tone)
 *   - Action rail with Save / Cancel built-ins, optional structured
 *     `actions[]` (using SharedHeaderActionDescriptor from the shared
 *     header-actions helper), and an `extraActions` ReactNode slot
 *   - `saving` state on the Save button
 *   - `loading` state for the entire header (renders a centered Spinner
 *     placeholder)
 *   - Optional context-rail / children slot inside a card below the hero
 *   - 4 archetype variants (control, editorial, technical, governance)
 *     each with their own gradient + grid background pattern
 *
 * The family stays domain-agnostic. All copy is consumer-supplied; the
 * component knows nothing about tenants, users, or any specific entity.
 */

import { type CSSProperties, type ReactNode } from 'react';

import { ArrowLeftOutlined } from '@ant-design/icons';
import { Save, X } from 'lucide-react';
import type { ComponentType } from 'react';
type LucideIcon = ComponentType<any>;

import { Box, Button, Flex, Spinner, Stack, Text, Tooltip } from '../../../primitives';
import { useNavigationLink } from '../../../../runtime/adapters/navigation';
import {
  type SharedHeaderActionDescriptor,
  resolveSharedHeaderActionIcon,
  resolveSharedHeaderActionTooltip,
  resolveSharedHeaderActionVariant,
} from '../../../patterns/foundation/header-actions';

/* ============================================================================
 * TYPES
 * ========================================================================== */

export interface EditHeaderProps {
  /** Icon to display (Lucide icon) */
  icon?: LucideIcon;
  /** Main title */
  title: string;
  /** Subtitle/description */
  subtitle?: string;
  /** Entity ID to display */
  entityId?: string;
  /** Back link href */
  backHref: string;
  /** Back link label */
  backLabel?: string;
  /** Color variant for accents */
  colorVariant?: 'primary' | 'warning' | 'info' | 'success' | 'error' | 'secondary';
  /** Loading state */
  loading?: boolean;
  /** Save button loading state */
  saving?: boolean;
  /** Breadcrumb items */
  breadcrumb?: Array<{ label: string; href?: string }>;
  /** Save action */
  onSave?: () => void;
  /** Cancel action */
  onCancel?: () => void;
  /** Additional actions */
  extraActions?: ReactNode;
  /** Structured quick actions shown before Save/Cancel */
  actions?: SharedHeaderActionDescriptor[];
  /** Status badge */
  status?: {
    label: string;
    color: 'success' | 'warning' | 'error' | 'info' | 'secondary';
  };
  /** Additional content rendered below the header chrome */
  children?: ReactNode;
  /** Visual archetype for the hero shell */
  archetype?: 'editorial' | 'control' | 'technical' | 'governance';
  /** Short eyebrow label above the title */
  eyebrow?: string;
  /** Optional context rail rendered below the hero copy */
  contextRail?: ReactNode;
}

const VARIANT_TOKEN_MAP: Record<'primary' | 'warning' | 'info' | 'success' | 'error' | 'secondary', string> = {
  primary: 'primary',
  warning: 'warning',
  info: 'info',
  success: 'success',
  error: 'error',
  secondary: 'secondary',
};

function getVariantTone(variant?: 'primary' | 'warning' | 'info' | 'success' | 'error' | 'secondary') {
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

/* ============================================================================
 * COMPONENT
 * ========================================================================== */

export function EditHeader({
  icon: Icon,
  title,
  subtitle,
  entityId,
  backHref,
  backLabel = 'Back',
  colorVariant = 'secondary',
  loading = false,
  saving = false,
  breadcrumb,
  onSave,
  onCancel,
  extraActions,
  actions = [],
  status,
  children,
  archetype = 'control',
  eyebrow,
  contextRail,
}: EditHeaderProps) {
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
  const statusTone = getVariantTone(status?.color ?? 'secondary');

  if (loading) {
    return (
      <Box
        data-part="root"
        data-loading="true"
        style={{
          position: 'relative',
          overflow: 'hidden',
          background: 'var(--ds-surface-card, var(--ds-color-bg-elevated))',
          border: '1px solid var(--ds-color-border-secondary)',
          padding: 48,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Spinner size="lg" />
      </Box>
    );
  }

  return (
    <Box
      data-part="root"
      className="ds-structure ds-edit-header"
      style={{
        width: '100%',
        background: 'var(--ds-surface-card, var(--ds-color-bg-elevated))',
        border: '1px solid var(--ds-color-border-secondary)',
        borderRadius: 20,
        overflow: 'hidden',
        boxShadow: '0 12px 28px color-mix(in srgb, var(--ds-color-text-primary) 10%, transparent)',
      }}
    >
      <Box
        data-part="top-bar"
        style={{
          padding: '12px 24px',
          borderBottom: '1px solid var(--ds-color-border-secondary)',
          background: 'var(--ds-color-bg-secondary)',
        }}
      >
        <Flex justify="between" align="center">
          <Flex align="center" gap={20}>
            {renderHrefAnchor(
              backHref,
              <Flex
                data-part="back-button"
                align="center"
                gap={8}
                className="back-button"
                style={{
                  padding: '8px 12px',
                  background: 'transparent',
                  border: '1px solid var(--ds-color-border-secondary)',
                  borderRadius: 10,
                  cursor: 'pointer',
                }}
              >
                <ArrowLeftOutlined data-part="back-icon" style={{ fontSize: 14, color: 'var(--ds-color-text-secondary)' }} />
                <Text data-part="back-label" size="xs" weight="medium" style={{ color: 'var(--ds-color-text-secondary)' }}>
                  {backLabel}
                </Text>
              </Flex>,
              { textDecoration: 'none' },
            )}

            {breadcrumb && breadcrumb.length > 0 && (
              <>
                <Box data-part="breadcrumb-divider" style={{ width: 1, height: 16, background: 'var(--ds-color-border-secondary)' }} />
                <Flex align="center" gap={8}>
                  {breadcrumb.map((item, index) => (
                    <Flex key={index} align="center" gap={8}>
                      {index > 0 && (
                        <Text data-part="breadcrumb-separator" size="xs" style={{ color: 'var(--ds-color-text-muted)' }}>/</Text>
                      )}
                      {item.href ? (
                        renderHrefAnchor(
                          item.href,
                          <Text data-part="breadcrumb-link" size="xs" style={{ color: 'var(--ds-color-text-secondary)' }} className="breadcrumb-link">
                            {item.label}
                          </Text>,
                          { textDecoration: 'none' },
                        )
                      ) : (
                        <Text data-part="breadcrumb-item" size="xs" style={{ color: 'var(--ds-color-text-secondary)' }}>
                          {item.label}
                        </Text>
                      )}
                    </Flex>
                  ))}
                </Flex>
              </>
            )}
          </Flex>

          <Flex align="center" gap={16}>
            {entityId && (
              <Text
                data-part="entity-id"
                size="xs"
                style={{
                  color: 'var(--ds-color-text-secondary)',
                  fontFamily: 'monospace',
                  padding: '4px 10px',
                  border: '1px solid var(--ds-color-border-secondary)',
                  borderRadius: 999,
                }}
              >
                ID: {entityId.slice(0, 8)}
              </Text>
            )}
          </Flex>
        </Flex>
      </Box>

      <Box data-part="hero-panel" data-archetype={archetype} style={{ padding: '28px', ...buildPatternStyle(archetype) }}>
        <Flex justify="between" align="center" gap={20} wrap="wrap">
          <Flex align="center" gap={20}>
            {Icon && (
              <Box
                data-part="icon-badge"
                style={{
                  width: 52,
                  height: 52,
                  background: iconTone.background,
                  border: `1px solid ${iconTone.border}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 14,
                }}
              >
                <Icon data-part="icon-badge-glyph" style={{ width: 24, height: 24, color: iconTone.color }} />
              </Box>
            )}
            <Stack spacing="xs">
              {eyebrow ? (
                <Text
                  data-part="eyebrow"
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
              <Flex align="center" gap={12}>
                <Text data-part="title" style={{ fontSize: 28, fontWeight: 700, color: 'var(--ds-color-text-primary)', letterSpacing: '-0.03em' }}>
                  {title}
                </Text>
                {status && (
                  <Box
                    data-part="status-pill"
                    style={{
                      padding: '4px 12px',
                      background: statusTone.background,
                      border: `1px solid ${statusTone.border}`,
                      borderRadius: 999,
                    }}
                  >
                    <Text data-part="status-pill-text" size="xs" weight="medium" style={{ color: statusTone.color, textTransform: 'capitalize' }}>
                      {status.label}
                    </Text>
                  </Box>
                )}
              </Flex>
              {subtitle && (
                <Text data-part="subtitle" size="sm" style={{ color: 'var(--ds-color-text-secondary)' }}>{subtitle}</Text>
              )}
            </Stack>
          </Flex>

          <Flex data-part="actions" gap={12} wrap="wrap" style={{ marginLeft: 'auto' }}>
            {actions.map((action, index) => {
              const ActionIcon = resolveSharedHeaderActionIcon(action);

              return (
                <Tooltip key={`${action.label}-${index}`} content={resolveSharedHeaderActionTooltip(action)}>
                  <Button
                    variant={resolveSharedHeaderActionVariant(action)}
                    icon={ActionIcon ? <ActionIcon style={{ width: 14, height: 14 }} /> : undefined}
                    onClick={action.onClick}
                    href={action.href}
                    loading={action.loading}
                    disabled={action.disabled}
                  >
                    {action.label}
                  </Button>
                </Tooltip>
              );
            })}
            {extraActions}
            {onCancel && (
              <Button
                variant="secondary"
                icon={<X style={{ width: 14, height: 14 }} />}
                onClick={onCancel}
              >
                Cancel
              </Button>
            )}
            {onSave && (
              <Button
                variant="primary"
                icon={<Save style={{ width: 14, height: 14 }} />}
                onClick={onSave}
                loading={saving}
              >
                Save Changes
              </Button>
            )}
          </Flex>
        </Flex>

        {contextRail || children ? (
          <Box
            data-part="context-card"
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
            {contextRail ? <Box data-part="context-rail">{contextRail}</Box> : null}
            {children ? (
              <Box data-part="context-card-children" style={{ marginTop: contextRail ? 18 : 0 }}>
                {children}
              </Box>
            ) : null}
          </Box>
        ) : null}
      </Box>

      <style>{`
        .back-button {
          transition: all 0.2s ease;
        }
        .back-button:hover {
          border-color: var(--ds-color-border);
          background: color-mix(in srgb, var(--ds-color-bg-secondary) 90%, transparent);
        }
        .breadcrumb-link:hover {
          color: var(--ds-color-text-secondary) !important;
        }
      `}</style>
    </Box>
  );
}

export default EditHeader;
