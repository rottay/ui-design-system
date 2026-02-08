/**
 * CtaSection - Centered Preset
 * White background, centered title + description + buttons, subtle border top/bottom
 */

import { createPreset, PresetContext } from '../../../factory';
import type { CtaSectionProps } from '../../core';

export const CenteredCtaSection = createPreset<CtaSectionProps>({
  name: 'CtaSection.Centered',
  render: ({ primitives, props, tokens, engine }: PresetContext<CtaSectionProps>) => {
    const { Box, Stack, Button } = primitives;
    const { title, description, actions, className, style } = props;

    return (
      <Box
        className={className}
        style={{
          borderTop: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
          borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
          padding: `${tokens.spacing[8]}px ${tokens.spacing[4]}px`,
          backgroundColor: tokens.colors.common.white,
          ...style,
        }}
      >
        <Stack direction="vertical" spacing="lg" style={{ maxWidth: '700px', margin: '0 auto', textAlign: 'center' }}>
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
        </Stack>
      </Box>
    );
  },
});
