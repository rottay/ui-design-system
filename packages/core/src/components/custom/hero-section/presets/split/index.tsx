/**
 * HeroSection - Split Preset
 * Left text + CTAs, right media. 50/50 split with responsive flex
 */

import { createPreset, PresetContext } from '../../../factory';
import { createBadgeStyle } from '../../../helpers';
import type { HeroSectionProps } from '../../core';

export const SplitHeroSection = createPreset<HeroSectionProps>({
  name: 'HeroSection.Split',
  render: ({ primitives, props, tokens }: PresetContext<HeroSectionProps>) => {
    const { Box, Stack, Button } = primitives;
    const { title, subtitle, description, actions = [], media, badge, className, style } = props;

    return (
      <Box
        className={className}
        style={{
          padding: `${tokens.spacing[8]}px ${tokens.spacing[4]}px`,
          ...style,
        }}
      >
        <Box
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: tokens.spacing[8],
            maxWidth: '1200px',
            margin: '0 auto',
            flexWrap: 'wrap',
          }}
        >
          {/* Left: Text + CTAs */}
          <Box style={{ flex: '1 1 450px', minWidth: '300px' }}>
            <Stack direction="vertical" spacing="lg">
              {badge && (
                <Box
                  style={{
                    ...createBadgeStyle(tokens, 'primary'),
                    backgroundColor: tokens.colors.primaryScale[50],
                    color: tokens.colors.primaryScale[600],
                    border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.primaryScale[200]}`,
                    width: 'fit-content',
                  }}
                >
                  {badge}
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
                  }}
                >
                  {description}
                </Box>
              )}

              {actions.length > 0 && (
                <Box style={{ display: 'flex', gap: tokens.spacing[3], flexWrap: 'wrap' }}>
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
            </Stack>
          </Box>

          {/* Right: Media */}
          {media && (
            <Box style={{ flex: '1 1 450px', minWidth: '300px', display: 'flex', justifyContent: 'center' }}>
              {media}
            </Box>
          )}
        </Box>
      </Box>
    );
  },
});
