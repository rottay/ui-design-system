'use client';

/**
 * PageHeader - Hero Preset
 * Large title + description + CTA buttons, suitable for landing/overview pages.
 * Modern engine gets a subtle gradient background on the hero area.
 * Full hover state and transition support on all interactive elements.
 */

import { useState } from 'react';
import { createPreset, PresetContext } from '../../../factory';
import type { PageHeaderProps } from '../../core';
import { PAGE_HEADER_DEFAULTS } from '../../core';
import {
  createEmptyStateStyle,
  createHoverStyle,
} from '../../../helpers';

export const HeroPageHeader = createPreset<PageHeaderProps>({
  name: 'PageHeader.Hero',
  render: ({ primitives, props, tokens, engine }: PresetContext<PageHeaderProps>) => {
    const { Box } = primitives;
    const {
      title,
      subtitle,
      description,
      breadcrumb = [],
      actions = [],
      extra,
      icon,
      status,
      divider = PAGE_HEADER_DEFAULTS.divider,
      children,
      className,
      style,
    } = props;

    const [hoveredAction, setHoveredAction] = useState<string | null>(null);
    const [hoveredBreadcrumb, setHoveredBreadcrumb] = useState<number | null>(null);

    const getButtonBackground = (
      action: (typeof actions)[0],
      isHovered: boolean,
    ) => {
      const isPrimary = action.variant === 'primary';
      const isDanger = action.variant === 'danger';
      const isGhost = action.variant === 'ghost';

      if (isPrimary) {
        return isHovered ? tokens.colors.primaryScale[700] : tokens.colors.primaryScale[600];
      }
      if (isDanger) {
        return isHovered ? tokens.colors.errorScale[100] : tokens.colors.errorScale[50];
      }
      if (isGhost) {
        return isHovered ? tokens.colors.neutral[50] : 'transparent';
      }
      return isHovered ? tokens.colors.neutral[50] : tokens.colors.common.white;
    };

    return (
      <Box className={className} style={{ marginBottom: tokens.spacing[8], ...style }}>
        {/* Breadcrumb */}
        {breadcrumb.length > 0 && (
          <Box style={{
            display: 'flex',
            alignItems: 'center',
            gap: tokens.spacing[1],
            marginBottom: tokens.spacing[4],
            fontSize: tokens.typography.fontSize.sm,
          }}>
            {breadcrumb.map((item, i) => {
              const isClickable = !!(item.onClick || item.href);
              const isHovered = hoveredBreadcrumb === i;

              return (
                <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: tokens.spacing[1] }}>
                  {i > 0 && (
                    <span style={{ color: tokens.colors.neutral[400], margin: `0 ${tokens.spacing[1]}px` }}>/</span>
                  )}
                  {isClickable ? (
                    <span
                      onClick={item.onClick}
                      onMouseEnter={() => setHoveredBreadcrumb(i)}
                      onMouseLeave={() => setHoveredBreadcrumb(null)}
                      style={{
                        color: isHovered ? tokens.colors.primaryScale[600] : tokens.colors.neutral[500],
                        cursor: 'pointer',
                        textDecoration: isHovered ? 'underline' : 'none',
                        transition: `all ${tokens.motion.hover}`,
                        transform: isHovered ? tokens.motion.transform : 'none',
                      }}
                    >
                      {item.label}
                    </span>
                  ) : (
                    <span style={{
                      color: tokens.colors.neutral[900],
                      fontWeight: tokens.typography.fontWeight.medium,
                    }}>
                      {item.label}
                    </span>
                  )}
                </span>
              );
            })}
          </Box>
        )}

        {/* Hero content */}
        <Box style={{
          textAlign: 'center',
          maxWidth: 720,
          margin: '0 auto',
          padding: `${tokens.spacing[6]}px 0`,
          borderRadius: engine === 'modern' ? tokens.borderRadius.lg : undefined,
          ...(engine === 'modern' && {
            background: `linear-gradient(135deg, ${tokens.colors.primaryScale[50]} 0%, transparent 50%)`,
            padding: `${tokens.spacing[8]}px ${tokens.spacing[6]}px`,
          }),
        }}>
          {icon && (
            <Box style={{ fontSize: tokens.typography.fontSize['4xl'], marginBottom: tokens.spacing[3] }}>
              {icon}
            </Box>
          )}

          <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: tokens.spacing[3] }}>
            <span style={{
              fontSize: tokens.typography.fontSize['3xl'],
              fontWeight: tokens.typography.fontWeight.bold,
              color: tokens.colors.neutral[900],
              lineHeight: 1.2,
            }}>
              {title}
            </span>
            {status && <span>{status}</span>}
          </Box>

          {subtitle && (
            <Box style={{
              marginTop: tokens.spacing[2],
              fontSize: tokens.typography.fontSize.lg,
              color: tokens.colors.neutral[600],
              fontWeight: tokens.typography.fontWeight.medium,
            }}>
              {subtitle}
            </Box>
          )}

          {description && (
            <Box style={{
              marginTop: tokens.spacing[3],
              fontSize: tokens.typography.fontSize.md,
              color: tokens.colors.neutral[500],
              lineHeight: tokens.typography.lineHeight.relaxed,
            }}>
              {description}
            </Box>
          )}

          {/* CTA actions */}
          {(actions.length > 0 || extra) && (
            <Box style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: tokens.spacing[3],
              marginTop: tokens.spacing[6],
            }}>
              {extra}
              {actions.map((action) => {
                const isPrimary = action.variant === 'primary';
                const isDanger = action.variant === 'danger';
                const isGhost = action.variant === 'ghost';
                const isHovered = hoveredAction === action.key;

                return (
                  <button
                    key={action.key}
                    onClick={action.onClick}
                    disabled={action.disabled || action.loading}
                    onMouseEnter={() => setHoveredAction(action.key)}
                    onMouseLeave={() => setHoveredAction(null)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: tokens.spacing[2],
                      padding: `${tokens.spacing[3]}px ${tokens.spacing[6]}px`,
                      borderRadius: tokens.borderRadius.lg,
                      border: isGhost
                        ? 'none'
                        : isPrimary
                          ? 'none'
                          : `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${isDanger ? tokens.colors.errorScale[300] : tokens.colors.neutral[300]}`,
                      backgroundColor: getButtonBackground(action, isHovered && !action.disabled),
                      color: isPrimary
                        ? tokens.colors.common.white
                        : isDanger
                          ? tokens.colors.errorScale[700]
                          : tokens.colors.neutral[700],
                      fontSize: tokens.typography.fontSize.md,
                      fontWeight: tokens.typography.fontWeight.semibold,
                      cursor: action.disabled ? 'not-allowed' : 'pointer',
                      opacity: action.disabled ? 0.5 : 1,
                      fontFamily: 'inherit',
                      boxShadow: isPrimary ? tokens.shadows.md : 'none',
                      transition: `all ${tokens.motion.hover}`,
                    }}
                  >
                    {action.icon && <span>{action.icon}</span>}
                    {action.loading ? 'Loading...' : action.label}
                  </button>
                );
              })}
            </Box>
          )}
        </Box>

        {/* Children */}
        {children && (
          <Box style={{ marginTop: tokens.spacing[4] }}>
            {children}
          </Box>
        )}

        {/* Divider */}
        {divider && (
          <Box style={{
            marginTop: tokens.spacing[6],
            borderTop: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
          }} />
        )}
      </Box>
    );
  },
});
