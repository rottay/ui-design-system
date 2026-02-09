'use client';

/**
 * CtaSection - Centered Preset
 * Premium centered CTA with gradient background, decorative elements,
 * floating badge, accent bar, and animated action buttons.
 */

import { useState, useMemo } from 'react';
import { createPreset, PresetContext } from '../../../factory';
import {
  createSurfaceStyle,
  createBadgeStyle,
  createAccentBarStyle,
  createHoverStyle,
  getHoverTransform,
  getCardHoverShadow,
} from '../../../helpers';
import type { CtaSectionProps } from '../../core';

export const CenteredCtaSection = createPreset<CtaSectionProps>({
  name: 'CtaSection.Centered',
  render: ({ primitives, props, tokens, engine }: PresetContext<CtaSectionProps>) => {
    const { Box, Text, Button, Stack } = primitives;
    const { title, description, actions, media, className, style } = props;

    const isGlass = engine === 'modern' && !!tokens.glass;

    const [hovered, setHovered] = useState(false);
    const [hoveredAction, setHoveredAction] = useState<string | null>(null);

    const surfaceStyle = useMemo(() => createSurfaceStyle(tokens, {
      elevation: 'md',
      glass: isGlass,
    }), [tokens, isGlass]);

    const accentBarStyle = useMemo(
      () => createAccentBarStyle(tokens, { position: 'top' }),
      [tokens],
    );

    const badgeStyle = useMemo(
      () => createBadgeStyle(tokens, 'primary'),
      [tokens],
    );

    const hoverBase = useMemo(() => createHoverStyle(tokens), [tokens]);

    const containerStyle = useMemo<React.CSSProperties>(() => ({
      ...surfaceStyle,
      position: 'relative' as const,
      overflow: 'hidden' as const,
      background: hovered
        ? `linear-gradient(180deg, ${tokens.colors.primaryScale[100]}, ${tokens.colors.common.white})`
        : `linear-gradient(180deg, ${tokens.colors.primaryScale[50]}, ${tokens.colors.common.white})`,
      padding: `${tokens.spacing[10]}px ${tokens.spacing[6]}px`,
      ...hoverBase,
      boxShadow: hovered ? getCardHoverShadow(tokens, 'md') : tokens.shadows.md,
      ...style,
    }), [surfaceStyle, hoverBase, tokens, hovered, style]);

    const decorativeCircleBase = useMemo<React.CSSProperties>(() => ({
      position: 'absolute' as const,
      borderRadius: tokens.borderRadius.full,
      backgroundColor: tokens.colors.primaryScale[100],
      opacity: 0.4,
      pointerEvents: 'none' as const,
    }), [tokens]);

    const titleStyle = useMemo<React.CSSProperties>(() => ({
      fontSize: tokens.typography.fontSize['3xl'],
      fontWeight: tokens.typography.fontWeight.bold,
      color: tokens.colors.neutral[900],
      lineHeight: tokens.typography.lineHeight.tight,
      margin: 0,
    }), [tokens]);

    const descriptionStyle = useMemo<React.CSSProperties>(() => ({
      fontSize: tokens.typography.fontSize.lg,
      color: tokens.colors.neutral[600],
      lineHeight: tokens.typography.lineHeight.relaxed,
      maxWidth: '540px',
      margin: '0 auto',
    }), [tokens]);

    const getActionStyle = (actionKey: string, variant?: 'primary' | 'secondary'): React.CSSProperties => {
      const isActionHovered = hoveredAction === actionKey;
      const isPrimary = variant !== 'secondary';

      const base: React.CSSProperties = {
        transition: `all ${tokens.motion.hover}`,
        fontWeight: tokens.typography.fontWeight.semibold,
        fontSize: tokens.typography.fontSize.md,
        borderRadius: tokens.borderRadius.md,
        padding: `${tokens.spacing[2]}px ${tokens.spacing[5]}px`,
      };

      if (isPrimary) {
        return {
          ...base,
          backgroundColor: isActionHovered
            ? tokens.colors.primaryScale[700]
            : tokens.colors.primaryScale[600],
          color: tokens.colors.common.white,
          border: 'none',
          transform: isActionHovered ? tokens.motion.transform : 'none',
          boxShadow: isActionHovered ? tokens.shadows.lg : tokens.shadows.sm,
        };
      }

      return {
        ...base,
        backgroundColor: isActionHovered
          ? tokens.colors.primaryScale[50]
          : 'transparent',
        color: tokens.colors.primaryScale[600],
        border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.primaryScale[300]}`,
        transform: isActionHovered ? tokens.motion.transform : 'none',
        boxShadow: isActionHovered ? tokens.shadows.sm : 'none',
      };
    };

    const starDecorStyle = useMemo<React.CSSProperties>(() => ({
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: tokens.spacing[5],
      height: tokens.spacing[5],
      borderRadius: tokens.borderRadius.full,
      backgroundColor: tokens.colors.primaryScale[100],
      color: tokens.colors.primaryScale[500],
      fontSize: tokens.typography.fontSize.sm,
      marginBottom: tokens.spacing[2],
    }), [tokens]);

    return (
      <Box
        className={className}
        style={containerStyle}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Accent bar */}
        <Box style={{ ...accentBarStyle, position: 'absolute' as const, top: 0, left: 0 }} />

        {/* Decorative floating circles */}
        <Box style={{
          ...decorativeCircleBase,
          width: tokens.spacing[16],
          height: tokens.spacing[16],
          top: `-${tokens.spacing[4]}px`,
          right: `-${tokens.spacing[4]}px`,
        }} />
        <Box style={{
          ...decorativeCircleBase,
          width: tokens.spacing[10],
          height: tokens.spacing[10],
          bottom: tokens.spacing[6],
          left: `-${tokens.spacing[3]}px`,
          opacity: 0.25,
        }} />
        <Box style={{
          ...decorativeCircleBase,
          width: tokens.spacing[6],
          height: tokens.spacing[6],
          top: tokens.spacing[8],
          left: tokens.spacing[10],
          opacity: 0.3,
          backgroundColor: tokens.colors.secondaryScale?.[100] || tokens.colors.primaryScale[200],
        }} />

        {/* Content */}
        <Stack
          direction="vertical"
          spacing="lg"
          style={{
            maxWidth: '700px',
            margin: '0 auto',
            textAlign: 'center' as const,
            position: 'relative' as const,
            zIndex: 1,
          }}
        >
          {/* Floating badge */}
          <Box style={{ display: 'flex', justifyContent: 'center' }}>
            <Box style={{
              ...badgeStyle,
              gap: tokens.spacing[1],
              paddingLeft: tokens.spacing[3],
              paddingRight: tokens.spacing[3],
            }}>
              <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold }}>
                New
              </Text>
            </Box>
          </Box>

          {/* Icon decoration */}
          <Box style={{ display: 'flex', justifyContent: 'center' }}>
            <Box style={starDecorStyle}>
              <span aria-hidden="true">&#9733;</span>
            </Box>
          </Box>

          {/* Title */}
          <Text style={titleStyle}>{title}</Text>

          {/* Description */}
          {description && (
            <Text style={descriptionStyle}>{description}</Text>
          )}

          {/* Media slot */}
          {media && (
            <Box style={{
              display: 'flex',
              justifyContent: 'center',
              padding: `${tokens.spacing[2]}px 0`,
            }}>
              {media}
            </Box>
          )}

          {/* Action buttons */}
          <Box style={{
            display: 'flex',
            gap: tokens.spacing[3],
            justifyContent: 'center',
            flexWrap: 'wrap' as const,
            paddingTop: tokens.spacing[2],
          }}>
            {actions.map((action) => (
              <Button
                key={action.key}
                variant={action.variant === 'secondary' ? 'default' : 'primary'}
                size="lg"
                onClick={action.onClick}
                onMouseEnter={() => setHoveredAction(action.key)}
                onMouseLeave={() => setHoveredAction(null)}
                style={getActionStyle(action.key, action.variant)}
              >
                {action.label}
              </Button>
            ))}
          </Box>
        </Stack>
      </Box>
    );
  },
});
