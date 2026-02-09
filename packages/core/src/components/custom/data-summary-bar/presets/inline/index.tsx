'use client';

import React, { useState, useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import type { DataSummaryBarProps, SummaryMetric } from '../../core';
import {
  createCardStyle,
  createBadgeStyle,
  createAccentBarStyle,
  createHoverStyle,
  getHoverTransform,
  getCardHoverShadow,
} from '../../../helpers';

/* ------------------------------------------------------------------ */
/*  Color scale resolver                                               */
/* ------------------------------------------------------------------ */

function getScale(tokens: any, color?: SummaryMetric['color']) {
  const map: Record<string, any> = {
    primary: tokens.colors.primaryScale,
    success: tokens.colors.successScale,
    warning: tokens.colors.warningScale,
    error: tokens.colors.errorScale,
    info: tokens.colors.infoScale,
  };
  return map[color || 'primary'] || tokens.colors.primaryScale;
}

function getColorKey(color?: SummaryMetric['color']): 'primary' | 'success' | 'warning' | 'error' | 'info' {
  return color || 'primary';
}

/* ------------------------------------------------------------------ */
/*  Preset                                                             */
/* ------------------------------------------------------------------ */

export const Inline = createPreset<DataSummaryBarProps>((context: PresetContext<DataSummaryBarProps>) => {
  const { primitives, props, tokens, engine } = context;
  const { Box, Text, Spinner } = primitives;
  const { metrics, className, style } = props;

  const isGlass = tokens.surface.useGlass && !!tokens.glass;
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [isLoading] = useState(false);

  /* -- memoised styles -------------------------------------------- */

  const containerStyle = useMemo(() => ({
    ...createCardStyle(tokens, { elevation: 'md', glass: isGlass }),
    display: 'flex',
    flexDirection: 'column' as const,
    overflow: 'hidden',
    padding: 0,
    ...style,
  }), [tokens, isGlass, style]);

  const accentBarStyle = useMemo(
    () => createAccentBarStyle(tokens, { position: 'top' }),
    [tokens],
  );

  const metricsRowStyle = useMemo(() => ({
    display: 'flex',
    alignItems: 'stretch',
    gap: 0,
    padding: `${tokens.spacing[3]} ${tokens.spacing[4]}`,
    overflowX: 'auto' as const,
    flex: 1,
  }), [tokens]);

  const hoverBase = useMemo(() => createHoverStyle(tokens), [tokens]);
  const hoverTransform = useMemo(() => getHoverTransform(tokens), [tokens]);
  const hoverShadow = useMemo(() => getCardHoverShadow(tokens, 'sm'), [tokens]);

  /* -- loading state ---------------------------------------------- */

  if (isLoading) {
    return (
      <Box className={className} style={containerStyle}>
        <Box style={accentBarStyle} />
        <Box style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: tokens.spacing[6],
        }}>
          <Spinner size="sm" />
        </Box>
      </Box>
    );
  }

  /* -- render ----------------------------------------------------- */

  return (
    <Box className={className} style={containerStyle}>
      {/* Accent bar */}
      <Box style={accentBarStyle} />

      {/* Metrics row */}
      <Box style={metricsRowStyle}>
        {metrics.map((metric, index) => {
          const scale = getScale(tokens, metric.color);
          const colorKey = getColorKey(metric.color);
          const isHovered = hoveredIndex === index;
          const badgeStyle = createBadgeStyle(tokens, colorKey);

          const metricCardStyle: React.CSSProperties = {
            ...hoverBase,
            display: 'flex',
            alignItems: 'center',
            gap: tokens.spacing[3],
            padding: `${tokens.spacing[3]} ${tokens.spacing[4]}`,
            borderRadius: tokens.borderRadius.md,
            backgroundColor: isHovered ? scale[50] : 'transparent',
            transform: isHovered ? hoverTransform.transform : 'none',
            boxShadow: isHovered ? hoverShadow : 'none',
            flex: 1,
            minWidth: 0,
            whiteSpace: 'nowrap',
          };

          const iconContainerStyle: React.CSSProperties = {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: tokens.spacing[9],
            height: tokens.spacing[9],
            borderRadius: tokens.borderRadius.md,
            backgroundColor: scale[100],
            color: scale[600],
            flexShrink: 0,
          };

          const valueBadgeStyle: React.CSSProperties = {
            ...badgeStyle,
            fontSize: tokens.typography.fontSize.sm,
            fontWeight: tokens.typography.fontWeight.bold,
            padding: `${tokens.spacing[1]} ${tokens.spacing[3]}`,
          };

          const dividerStyle: React.CSSProperties = {
            width: tokens.surface.borderWidth || '1px',
            alignSelf: 'stretch',
            marginTop: tokens.spacing[2],
            marginBottom: tokens.spacing[2],
            background: `linear-gradient(to bottom, transparent, ${tokens.colors.neutral[200]}, transparent)`,
            flexShrink: 0,
          };

          return (
            <React.Fragment key={metric.key}>
              <Box
                style={metricCardStyle}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {/* Icon container */}
                {metric.icon && (
                  <Box style={iconContainerStyle}>
                    <Text style={{ fontSize: tokens.typography.fontSize.lg }}>
                      {metric.icon}
                    </Text>
                  </Box>
                )}

                {/* Label & value stack */}
                <Box style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[1], minWidth: 0 }}>
                  <Text style={{
                    fontSize: tokens.typography.fontSize.xs,
                    fontWeight: tokens.typography.fontWeight.medium,
                    color: tokens.colors.neutral[500],
                    textTransform: 'uppercase' as const,
                    letterSpacing: '0.04em',
                  }}>
                    {metric.label}
                  </Text>

                  {/* Value badge */}
                  <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                    <Text style={valueBadgeStyle}>
                      {metric.value}
                    </Text>

                    {/* Trend arrow (decorative based on color) */}
                    {metric.color === 'success' && (
                      <Text style={{
                        fontSize: tokens.typography.fontSize.xs,
                        fontWeight: tokens.typography.fontWeight.semibold,
                        color: tokens.colors.successScale[600],
                      }}>
                        {'↑'}
                      </Text>
                    )}
                    {metric.color === 'error' && (
                      <Text style={{
                        fontSize: tokens.typography.fontSize.xs,
                        fontWeight: tokens.typography.fontWeight.semibold,
                        color: tokens.colors.errorScale[600],
                      }}>
                        {'↓'}
                      </Text>
                    )}
                    {metric.color === 'warning' && (
                      <Text style={{
                        fontSize: tokens.typography.fontSize.xs,
                        fontWeight: tokens.typography.fontWeight.semibold,
                        color: tokens.colors.warningScale[600],
                      }}>
                        {'→'}
                      </Text>
                    )}
                  </Box>
                </Box>
              </Box>

              {/* Gradient divider between metrics */}
              {index < metrics.length - 1 && (
                <Box style={dividerStyle} />
              )}
            </React.Fragment>
          );
        })}
      </Box>
    </Box>
  );
});
