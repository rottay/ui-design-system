'use client';

/**
 * FooterSection - MultiColumn Preset
 * Full footer: logo + description top, multiple link columns, social, newsletter, copyright
 */

import { useState } from 'react';
import { createPreset, PresetContext } from '../../../factory';
import type { FooterSectionProps } from '../../core';
import {
  createHoverStyle,
  createPanelHeaderStyle,
} from '../../../helpers';

export const MultiColumnFooterSection = createPreset<FooterSectionProps>({
  name: 'FooterSection.MultiColumn',
  render: ({ primitives, props, tokens, engine }: PresetContext<FooterSectionProps>) => {
    const { Box, Stack, Input, Button } = primitives;
    const { columns: rawColumns = [], social: rawSocial = [], copyright, newsletter, logo, className, style } = props;

    const columns = Array.isArray(rawColumns) ? rawColumns : [];
    const social = Array.isArray(rawSocial) ? rawSocial : [];
    const [email, setEmail] = useState('');

    const handleSubscribe = () => {
      if (newsletter && email) {
        newsletter.onSubscribe(email);
        setEmail('');
      }
    };

    return (
      <Box
        className={className}
        style={{
          backgroundColor: tokens.colors.neutral[50],
          borderTop: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
          ...style,
        }}
      >
        <Box
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: `${tokens.spacing[10]}px ${tokens.spacing[4]}px ${tokens.spacing[6]}px`,
          }}
        >
          <Stack direction="vertical" spacing="xl">
            {/* Top: Logo + Newsletter */}
            <Box
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: tokens.spacing[8],
                paddingBottom: tokens.spacing[8],
                borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
              }}
            >
              {/* Logo */}
              {logo && (
                <Box>
                  <Box style={{ marginBottom: tokens.spacing[3] }}>{logo}</Box>
                  <Box
                    style={{
                      fontSize: tokens.typography.fontSize.sm,
                      color: tokens.colors.neutral[600],
                      lineHeight: tokens.typography.lineHeight.relaxed,
                    }}
                  >
                    Building the future of digital experiences.
                  </Box>
                </Box>
              )}

              {/* Newsletter */}
              {newsletter && (
                <Box>
                  <Box
                    style={{
                      fontSize: tokens.typography.fontSize.sm,
                      fontWeight: tokens.typography.fontWeight.semibold,
                      color: tokens.colors.neutral[900],
                      marginBottom: tokens.spacing[3],
                    }}
                  >
                    Subscribe to our newsletter
                  </Box>
                  <Box style={{ display: 'flex', gap: tokens.spacing[2] }}>
                    <Input
                      type="email"
                      placeholder={newsletter.placeholder}
                      value={email}
                      onChange={(value) => setEmail(value as string)}
                      style={{ flex: 1 }}
                    />
                    <Button variant="primary" onClick={handleSubscribe}>
                      Subscribe
                    </Button>
                  </Box>
                </Box>
              )}
            </Box>

            {/* Middle: Link columns */}
            {columns.length > 0 && (
              <Box
                style={{
                  display: 'grid',
                  gridTemplateColumns: `repeat(auto-fit, minmax(150px, 1fr))`,
                  gap: tokens.spacing[8],
                  paddingBottom: tokens.spacing[8],
                  borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                }}
              >
                {columns.map((column, idx) => (
                  <Box key={idx}>
                    <Box
                      style={{
                        fontSize: tokens.typography.fontSize.sm,
                        fontWeight: tokens.typography.fontWeight.semibold,
                        color: tokens.colors.neutral[900],
                        marginBottom: tokens.spacing[3],
                      }}
                    >
                      {column.title}
                    </Box>
                    <Stack direction="vertical" spacing="xs">
                      {column.links.map((link, linkIdx) => (
                        <Box
                          key={linkIdx}
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
                    </Stack>
                  </Box>
                ))}
              </Box>
            )}

            {/* Bottom: Social + Copyright */}
            <Box
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: tokens.spacing[4],
              }}
            >
              <Box
                style={{
                  fontSize: tokens.typography.fontSize.sm,
                  color: tokens.colors.neutral[500],
                }}
              >
                {copyright}
              </Box>

              {social.length > 0 && (
                <Box style={{ display: 'flex', gap: tokens.spacing[3] }}>
                  {social.map((link) => (
                    <Box
                      key={link.key}
                      onClick={link.onClick}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '36px',
                        height: '36px',
                        borderRadius: tokens.borderRadius.md,
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
            </Box>
          </Stack>
        </Box>
      </Box>
    );
  },
});
