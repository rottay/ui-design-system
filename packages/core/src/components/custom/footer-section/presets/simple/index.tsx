/**
 * FooterSection - Simple Preset
 * Single row: copyright left, links right, subtle top border
 */

import { createPreset, PresetContext } from '../../../factory';
import type { FooterSectionProps } from '../../core';

export const SimpleFooterSection = createPreset<FooterSectionProps>({
  name: 'FooterSection.Simple',
  render: ({ primitives, props, tokens, engine }: PresetContext<FooterSectionProps>) => {
    const { Box } = primitives;
    const { columns = [], copyright, className, style } = props;

    // Flatten all links from all columns
    const allLinks = columns.flatMap((col) => col.links);

    return (
      <Box
        className={className}
        style={{
          backgroundColor: tokens.colors.common.white,
          borderTop: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
          padding: `${tokens.spacing[4]}px ${tokens.spacing[4]}px`,
          ...style,
        }}
      >
        <Box
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: tokens.spacing[4],
          }}
        >
          {/* Left: Copyright */}
          <Box
            style={{
              fontSize: tokens.typography.fontSize.sm,
              color: tokens.colors.neutral[500],
            }}
          >
            {copyright}
          </Box>

          {/* Right: Links */}
          {allLinks.length > 0 && (
            <Box style={{ display: 'flex', gap: tokens.spacing[4], flexWrap: 'wrap' }}>
              {allLinks.map((link, idx) => (
                <Box
                  key={idx}
                  onClick={link.onClick}
                  style={{
                    fontSize: tokens.typography.fontSize.sm,
                    color: tokens.colors.neutral[600],
                    cursor: link.onClick || link.href ? 'pointer' : 'default',
                    transition: `color ${tokens.transitions?.fast || tokens.motion.hover}`,
                  }}
                  onMouseEnter={(e) => {
                    if (link.onClick || link.href) {
                      e.currentTarget.style.color = tokens.colors.primaryScale[600];
                      e.currentTarget.style.transform = tokens.motion.transform;
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = tokens.colors.neutral[600];
                    e.currentTarget.style.transform = 'none';
                  }}
                >
                  {link.label}
                </Box>
              ))}
            </Box>
          )}
        </Box>
      </Box>
    );
  },
});
