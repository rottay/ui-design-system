/**
 * CtaSection - Split Preset
 * Left text, right graphic/media area with light primary background
 */

import { createPreset, PresetContext } from '../../../factory';
import type { CtaSectionProps } from '../../core';

export const SplitCtaSection = createPreset<CtaSectionProps>({
  name: 'CtaSection.Split',
  render: ({ primitives, props, tokens, engine }: PresetContext<CtaSectionProps>) => {
    const { Box, Stack, Button } = primitives;
    const { title, description, actions, media, className, style } = props;

    return (
      <Box
        className={className}
        style={{
          backgroundColor: tokens.colors.primaryScale[50],
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
          {/* Left: Text + Actions */}
          <Box style={{ flex: '1 1 450px' }}>
            <Stack direction="vertical" spacing="lg">
              <Box
                style={{
                  fontSize: tokens.typography.fontSize['3xl'],
                  fontWeight: tokens.typography.fontWeight.bold,
                  color: tokens.colors.neutral[900],
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
            </Stack>
          </Box>

          {/* Right: Media */}
          {media && (
            <Box style={{ flex: '1 1 450px', display: 'flex', justifyContent: 'center' }}>
              {media}
            </Box>
          )}
        </Box>
      </Box>
    );
  },
});
