'use client';

/**
 * PageHeader - Compact Preset
 * Single-line header with title + breadcrumb inline + actions right-aligned.
 * Minimal vertical footprint with full hover/transition support.
 */

import { useState } from 'react';
import { createPreset, PresetContext } from '../../../factory';
import type { PageHeaderProps } from '../../core';
import { PAGE_HEADER_DEFAULTS } from '../../core';
import {
  createHoverStyle,
} from '../../../helpers';

export const CompactPageHeader = createPreset<PageHeaderProps>({
  name: 'PageHeader.Compact',
  render: ({ primitives, props, tokens, engine }: PresetContext<PageHeaderProps>) => {
    const { Box } = primitives;
    const {
      title,
      breadcrumb = [],
      actions = [],
      extra,
      icon,
      status,
      divider = PAGE_HEADER_DEFAULTS.divider,
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
        boxShadow: tokens.shadows.sm, marginBottom: tokens.spacing[4], ...style }}>
        <Box style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: tokens.spacing[3],
          minHeight: tokens.spacing[10],
        }}>
          {/* Left: breadcrumb + title inline */}
          <Box style={{
            display: 'flex',
            alignItems: 'center',
            gap: tokens.spacing[2],
            minWidth: 0,
            overflow: 'hidden',
          }}>
            {icon && (
              <Box style={{ fontSize: tokens.typography.fontSize.lg, flexShrink: 0 }}>{icon}</Box>
            )}
            {breadcrumb.length > 0 && (
              <>
                {breadcrumb.map((item, i) => {
                  const isClickable = !!(item.onClick || item.href);
                  const isHovered = hoveredBreadcrumb === i;

                  return (
                    <span key={i} style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: tokens.spacing[1],
                      flexShrink: 0,
                    }}>
                      {isClickable ? (
                        <span
                          onClick={item.onClick}
                          onMouseEnter={() => setHoveredBreadcrumb(i)}
                          onMouseLeave={() => setHoveredBreadcrumb(null)}
                          style={{
                            fontSize: tokens.typography.fontSize.sm,
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
                          fontSize: tokens.typography.fontSize.sm,
                          color: tokens.colors.neutral[500],
                        }}>
                          {item.label}
                        </span>
                      )}
                      <span style={{
                        color: tokens.colors.neutral[400],
                        fontSize: tokens.typography.fontSize.sm,
                      }}>/</span>
                    </span>
                  );
                })}
              </>
            )}
            <span style={{
              fontSize: tokens.typography.fontSize.lg,
              fontWeight: tokens.typography.fontWeight.semibold,
              color: tokens.colors.neutral[900],
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}>
              {title}
            </span>
            {status && <span style={{ flexShrink: 0 }}>{status}</span>}
          </Box>

          {/* Right: actions */}
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
                      gap: tokens.spacing[1],
                      padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`,
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
                    {action.loading ? '...' : action.label}
                  </button>
                );
              })}
            </Box>
          )}
        </Box>

        {divider && (
          <Box style={{
            marginTop: tokens.spacing[3],
            borderTop: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
          }} />
        )}
      </Box>
    );
  },
});
