/**
 * FooterSection - Centered Preset
 * Logo + links centered, social below, copyright at bottom, all centered text
 */

import { createPreset, PresetContext } from '../../../factory';
import type { FooterSectionProps } from '../../core';
import {
  createFilterPillStyle,
  createHoverStyle,
} from '../../../helpers';

export const CenteredFooterSection = createPreset<FooterSectionProps>({
  name: 'FooterSection.Centered',
  render: ({ primitives, props, tokens, engine }: PresetContext<FooterSectionProps>) => {
    const { Box, Stack } = primitives;
    const { columns: rawColumns = [], social: rawSocial = [], copyright, logo, className, style } = props;

    const columns = Array.isArray(rawColumns) ? rawColumns : [];
    const social = Array.isArray(rawSocial) ? rawSocial : [];

    // Flatten all links from all columns
    const allLinks = columns.flatMap((col) => col.links);

    return (
      <Box
        className={className}
        style={{
          backgroundColor: tokens.colors.neutral[50],
          borderTop: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
          padding: `${tokens.spacing[8]}px ${tokens.spacing[4]}px`,
          ...style,
        }}
      >
        <Box
          style={{
            maxWidth: '800px',
            margin: '0 auto',
            textAlign: 'center',
          }}
        >
          <Stack direction="vertical" spacing="lg">
            {/* Logo */}
            {logo && (
              <Box style={{ display: 'flex', justifyContent: 'center' }}>
                {logo}
              </Box>
            )}

            {/* Links */}
            {allLinks.length > 0 && (
              <Box style={{ display: 'flex', gap: tokens.spacing[4], flexWrap: 'wrap', justifyContent: 'center' }}>
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

            {/* Social */}
            {social.length > 0 && (
              <Box style={{ display: 'flex', gap: tokens.spacing[3], justifyContent: 'center' }}>
                {social.map((link) => (
                  <Box
                    key={link.key}
                    onClick={link.onClick}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '40px',
                      height: '40px',
                      borderRadius: tokens.borderRadius.full,
                      color: tokens.colors.neutral[600],
                      cursor: 'pointer',
                      transition: `all ${tokens.motion.hover}`,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = tokens.colors.primaryScale[50];
                      e.currentTarget.style.color = tokens.colors.primaryScale[600];
                      e.currentTarget.style.transform = tokens.motion.transform;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = tokens.colors.neutral[600];
                      e.currentTarget.style.transform = 'none';
                    }}
                  >
                    {link.icon}
                  </Box>
                ))}
              </Box>
            )}

            {/* Copyright */}
            <Box
              style={{
                fontSize: tokens.typography.fontSize.sm,
                color: tokens.colors.neutral[500],
                paddingTop: tokens.spacing[4],
                borderTop: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
              }}
            >
              {copyright}
            </Box>
          </Stack>
        </Box>
      </Box>
    );
  },
});
