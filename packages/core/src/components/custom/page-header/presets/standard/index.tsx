'use client';

/**
 * PageHeader - Standard Preset
 * Breadcrumb + title/subtitle row + actions + optional divider.
 * Full token coverage with hover states and transitions on interactive elements.
 */

import { useState } from 'react';
import { createPreset, PresetContext } from '../../../factory';
import type { PageHeaderProps } from '../../core';
import { PAGE_HEADER_DEFAULTS } from '../../core';
import {
  createHoverStyle,
} from '../../../helpers';

export const StandardPageHeader = createPreset<PageHeaderProps>({
  name: 'PageHeader.Standard',
  render: ({ primitives, props, tokens, engine }: PresetContext<PageHeaderProps>) => {
    const { Box } = primitives;
    const {
      title,
      subtitle,
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
      <Box className={className} style={{
        boxShadow: tokens.shadows.sm, marginBottom: tokens.spacing[6], ...style }}>
        {/* Breadcrumb */}
        {breadcrumb.length > 0 && (
          <Box style={{
            display: 'flex',
            alignItems: 'center',
            gap: tokens.spacing[1],
            marginBottom: tokens.spacing[3],
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

        {/* Header row */}
        <Box style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: tokens.spacing[4],
        }}>
          {/* Title section */}
          <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3], minWidth: 0 }}>
            {icon && (
              <Box style={{ fontSize: tokens.typography.fontSize['2xl'], flexShrink: 0 }}>{icon}</Box>
            )}
            <Box>
              <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                <span style={{
                  fontSize: tokens.typography.fontSize['2xl'],
                  fontWeight: tokens.typography.fontWeight.bold,
                  color: tokens.colors.neutral[900],
                  lineHeight: 1.3,
                }}>
                  {title}
                </span>
                {status && <span>{status}</span>}
              </Box>
              {subtitle && (
                <Box style={{
                  marginTop: tokens.spacing[1],
                  fontSize: tokens.typography.fontSize.sm,
                  color: tokens.colors.neutral[500],
                }}>
                  {subtitle}
                </Box>
              )}
            </Box>
          </Box>

          {/* Actions */}
          {(actions.length > 0 || extra) && (
            <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], flexShrink: 0 }}>
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
                      padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`,
                      borderRadius: tokens.borderRadius.md,
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
                      fontSize: tokens.typography.fontSize.sm,
                      fontWeight: tokens.typography.fontWeight.medium,
                      cursor: action.disabled ? 'not-allowed' : 'pointer',
                      opacity: action.disabled ? 0.5 : 1,
                      fontFamily: 'inherit',
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

        {/* Children slot (tabs, filters, etc.) */}
        {children && (
          <Box style={{ marginTop: tokens.spacing[4] }}>
            {children}
          </Box>
        )}

        {/* Divider */}
        {divider && (
          <Box style={{
            marginTop: tokens.spacing[5],
            borderTop: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
          }} />
        )}
      </Box>
    );
  },
});
