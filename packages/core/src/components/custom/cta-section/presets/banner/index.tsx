/**
 * CtaSection - Banner Preset
 * Full-width colored banner with white text, title + description + buttons in a row
 */

import { createPreset, PresetContext } from '../../../factory';
import type { CtaSectionProps } from '../../core';

export const BannerCtaSection = createPreset<CtaSectionProps>({
  name: 'CtaSection.Banner',
  render: ({ primitives, props, tokens }: PresetContext<CtaSectionProps>) => {
    const { Box, Button } = primitives;
    const { title, description, actions, className, style } = props;

    return (
      <Box
        className={className}
        style={{
          backgroundColor: tokens.colors.primaryScale[600],
          padding: `${tokens.spacing[6]}px ${tokens.spacing[4]}px`,
          ...style,
        }}
      >
        <Box
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: tokens.spacing[6],
            maxWidth: '1200px',
            margin: '0 auto',
            flexWrap: 'wrap',
          }}
        >
          {/* Left: Text */}
          <Box style={{ flex: '1 1 400px' }}>
            <Box
              style={{
                fontSize: tokens.typography.fontSize['2xl'],
                fontWeight: tokens.typography.fontWeight.bold,
                color: tokens.colors.common.white,
                marginBottom: tokens.spacing[2],
              }}
            >
              {title}
            </Box>
            {description && (
              <Box
                style={{
                  fontSize: tokens.typography.fontSize.md,
                  color: tokens.colors.common.white,
                  opacity: 0.9,
                  lineHeight: tokens.typography.lineHeight.relaxed,
                }}
              >
                {description}
              </Box>
            )}
          </Box>

          {/* Right: Actions */}
          <Box style={{ display: 'flex', gap: tokens.spacing[3], flexWrap: 'wrap' }}>
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
                } : {
                  backgroundColor: tokens.colors.common.white,
                  color: tokens.colors.primaryScale[600],
                  borderColor: tokens.colors.common.white,
                }}
              >
                {action.label}
              </Button>
            ))}
          </Box>
        </Box>
      </Box>
    );
  },
});
