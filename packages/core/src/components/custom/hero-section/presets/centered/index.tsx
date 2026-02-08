/**
 * HeroSection - Centered Preset
 * Full-width centered hero with badge, title, description, CTAs, and media
 */

import { createPreset, PresetContext } from '../../../factory';
import {
  createBadgeStyle,
  createSectionHeaderStyle,
} from '../../../helpers';
import type { HeroSectionProps } from '../../core';

export const CenteredHeroSection = createPreset<HeroSectionProps>({
  name: 'HeroSection.Centered',
  render: ({ primitives, props, tokens, engine }: PresetContext<HeroSectionProps>) => {
    const { Box, Stack, Button } = primitives;
    const { title, subtitle, description, actions = [], media, badge, className, style } = props;

    return (
      <Box
        className={className}
        style={{
          padding: `${tokens.spacing[8]}px ${tokens.spacing[4]}px`,
          textAlign: 'center',
          ...style,
        }}
      >
        <Stack direction="vertical" spacing="lg" style={{ maxWidth: '800px', margin: '0 auto' }}>
          {badge && (
            <Box style={{ display: 'flex', justifyContent: 'center' }}>
              <Box
                style={{
                  ...createBadgeStyle(tokens, 'primary'),
                  backgroundColor: tokens.colors.primaryScale[50],
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
                color: tokens.colors.primaryScale[600],
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              {subtitle}
            </Box>
          )}

          <Box
            style={{
              fontSize: tokens.typography.fontSize['4xl'],
              fontWeight: tokens.typography.fontWeight.bold,
              color: tokens.colors.neutral[900],
              lineHeight: tokens.typography.lineHeight.tight,
            }}
          >
            {title}
          </Box>

          {description && (
            <Box
              style={{
                fontSize: tokens.typography.fontSize.lg,
                color: tokens.colors.neutral[600],
                lineHeight: tokens.typography.lineHeight.relaxed,
                maxWidth: '600px',
                margin: '0 auto',
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
    );
  },
});
