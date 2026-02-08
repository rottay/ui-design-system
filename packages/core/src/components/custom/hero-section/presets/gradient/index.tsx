/**
 * HeroSection - Gradient Preset
 * Like centered but with gradient background and white text, glass overlay for modern engine
 */

import { createPreset, PresetContext } from '../../../factory';
import {
  createBadgeStyle,
  createSectionHeaderStyle,
} from '../../../helpers';
import type { HeroSectionProps } from '../../core';

export const GradientHeroSection = createPreset<HeroSectionProps>({
  name: 'HeroSection.Gradient',
  render: ({ primitives, props, tokens, engine }: PresetContext<HeroSectionProps>) => {
    const { Box, Stack, Button } = primitives;
    const { title, subtitle, description, actions = [], media, badge, className, style } = props;

    const useGlass = engine === 'modern' && tokens.glass;

    return (
      <Box
        className={className}
        style={{
          background: `linear-gradient(135deg, ${tokens.colors.primaryScale[600]} 0%, ${tokens.colors.primaryScale[800]} 100%)`,
          padding: `${tokens.spacing[10]}px ${tokens.spacing[4]}px`,
          position: 'relative',
          overflow: 'hidden',
          ...style,
        }}
      >
        {useGlass && (
          <Box
            style={{
              position: 'absolute',
              inset: 0,
              backdropFilter: tokens.glass?.blur,
              WebkitBackdropFilter: tokens.glass?.blur,
              backgroundColor: tokens.glass?.bg,
              border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.glass?.border}`,
            }}
          />
        )}

        <Box style={{ position: 'relative', zIndex: 1 }}>
          <Stack direction="vertical" spacing="lg" style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
            {badge && (
              <Box style={{ display: 'flex', justifyContent: 'center' }}>
                <Box
                  style={{
                    ...createBadgeStyle(tokens, 'primary'),
                    backgroundColor: tokens.colors.common.white,
                    color: tokens.colors.primaryScale[600],
                    border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.primaryScale[200]}`,
                  }}
                >
                  {badge}
                </Box>
              </Box>
            )}

            {subtitle && (
              <Box
                style={{
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  color: tokens.colors.common.white,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  opacity: 0.9,
                }}
              >
                {subtitle}
              </Box>
            )}

            <Box
              style={{
                fontSize: tokens.typography.fontSize['4xl'],
                fontWeight: tokens.typography.fontWeight.bold,
                color: tokens.colors.common.white,
                lineHeight: tokens.typography.lineHeight.tight,
              }}
            >
              {title}
            </Box>

            {description && (
              <Box
                style={{
                  fontSize: tokens.typography.fontSize.lg,
                  color: tokens.colors.common.white,
                  lineHeight: tokens.typography.lineHeight.relaxed,
                  maxWidth: '600px',
                  margin: '0 auto',
                  opacity: 0.9,
                }}
              >
                {description}
              </Box>
            )}

            {actions.length > 0 && (
              <Box style={{ display: 'flex', gap: tokens.spacing[3], justifyContent: 'center', flexWrap: 'wrap' }}>
                {actions.map((action) => (
                  <Button
                    key={action.key}
                    variant={action.variant === 'secondary' ? 'default' : 'primary'}
                    size="lg"
                    onClick={action.onClick}
                    style={action.variant === 'secondary' ? {
                      backgroundColor: 'transparent',
                      color: tokens.colors.common.white,
                      borderColor: tokens.colors.common.white,
                    } : undefined}
                  >
                    {action.label}
                  </Button>
                ))}
              </Box>
            )}

            {media && (
              <Box style={{ marginTop: tokens.spacing[6] }}>
                {media}
              </Box>
            )}
          </Stack>
        </Box>
      </Box>
    );
  },
});
