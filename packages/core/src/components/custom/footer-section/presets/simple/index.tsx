'use client';

/**
 * FooterSection - Simple Preset
 * Premium single-row footer with gradient accent border, social icons,
 * optional logo, newsletter CTA, and styled link groups with hover effects
 */

import { useState, useMemo } from 'react';
import { createPreset, PresetContext } from '../../../factory';
import {
  createSurfaceStyle,
  createAccentBarStyle,
  createHoverStyle,
  createBadgeStyle,
} from '../../../helpers';
import type { FooterSectionProps } from '../../core';

export const SimpleFooterSection = createPreset<FooterSectionProps>({
  name: 'FooterSection.Simple',
  render: ({ primitives, props, tokens, engine }: PresetContext<FooterSectionProps>) => {
    const { Box, Text, Stack, Divider } = primitives;
    const isGlass = tokens.surface.useGlass && !!tokens.glass;
    const {
      columns: rawColumns = [],
      social: rawSocial = [],
      copyright,
      newsletter,
      logo,
      className,
      style,
    } = props;

    const columns = Array.isArray(rawColumns) ? rawColumns : [];
    const social = Array.isArray(rawSocial) ? rawSocial : [];

    const [hoveredLink, setHoveredLink] = useState<string | null>(null);
    const [hoveredSocial, setHoveredSocial] = useState<string | null>(null);
    const [emailValue, setEmailValue] = useState('');

    const containerStyle = useMemo(() => ({
      ...createSurfaceStyle(tokens, { elevation: 'sm', glass: isGlass }),
      backgroundColor: isGlass ? undefined : tokens.colors.common.white,
      position: 'relative' as const,
      overflow: 'hidden' as const,
      ...style,
    }), [tokens, isGlass, style]);

    const accentBarStyle = useMemo(
      () => createAccentBarStyle(tokens, { position: 'top' }),
      [tokens],
    );

    const allLinks = columns.flatMap((col) => col.links);

    return (
      <Box className={className} style={containerStyle}>
        {/* Gradient accent bar at top */}
        <div style={accentBarStyle} />

        <Box
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: `${tokens.spacing[6]}px ${tokens.spacing[4]}px`,
            display: 'flex',
            flexDirection: 'column' as const,
            gap: tokens.spacing[5],
          }}
        >
          {/* Top row: Logo + Newsletter */}
          {(logo || newsletter) && (
            <Box
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap' as const,
                gap: tokens.spacing[4],
              }}
            >
              {logo && (
                <Box
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: tokens.spacing[2],
                    color: tokens.colors.neutral[800],
                    fontSize: tokens.typography.fontSize.lg,
                    fontWeight: tokens.typography.fontWeight.bold,
                  }}
                >
                  {logo}
                </Box>
              )}

              {newsletter && (
                <Box
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: tokens.spacing[2],
                  }}
                >
                  <input
                    type="email"
                    placeholder={newsletter.placeholder}
                    value={emailValue}
                    onChange={(e) => setEmailValue(e.target.value)}
                    style={{
                      padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                      borderRadius: tokens.borderRadius.md,
                      border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[300]}`,
                      fontSize: tokens.typography.fontSize.sm,
                      color: tokens.colors.neutral[700],
                      backgroundColor: tokens.colors.neutral[50],
                      outline: 'none',
                      transition: `border-color ${tokens.motion.hover}`,
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = tokens.colors.primaryScale[400];
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = tokens.colors.neutral[300];
                    }}
                  />
                  <Box
                    onClick={() => {
                      if (emailValue) {
                        newsletter.onSubscribe(emailValue);
                        setEmailValue('');
                      }
                    }}
                    style={{
                      ...createBadgeStyle(tokens, 'primary'),
                      cursor: 'pointer',
                      padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                      fontWeight: tokens.typography.fontWeight.semibold,
                      transition: `all ${tokens.motion.hover}`,
                    }}
                  >
                    Subscribe
                  </Box>
                </Box>
              )}
            </Box>
          )}

          {(logo || newsletter) && <Divider />}

          {/* Middle row: Links grouped by column */}
          <Box
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              flexWrap: 'wrap' as const,
              gap: tokens.spacing[3],
            }}
          >
            {allLinks.map((link, idx) => {
              const linkKey = `link-${idx}`;
              const isHovered = hoveredLink === linkKey;
              const isInteractive = !!(link.onClick || link.href);

              return (
                <Box
                  key={linkKey}
                  onClick={link.onClick}
                  onMouseEnter={() => setHoveredLink(linkKey)}
                  onMouseLeave={() => setHoveredLink(null)}
                  style={{
                    fontSize: tokens.typography.fontSize.sm,
                    fontWeight: tokens.typography.fontWeight.medium,
                    color: isHovered
                      ? tokens.colors.primaryScale[600]
                      : tokens.colors.neutral[600],
                    cursor: isInteractive ? 'pointer' : 'default',
                    transition: `all ${tokens.motion.hover}`,
                    transform: isHovered && isInteractive ? tokens.motion.transform : 'none',
                    padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                    borderRadius: tokens.borderRadius.sm,
                    backgroundColor: isHovered
                      ? tokens.colors.primaryScale[50]
                      : 'transparent',
                  }}
                >
                  {link.label}
                </Box>
              );
            })}
          </Box>

          {/* Social icons row */}
          {social.length > 0 && (
            <>
              <Divider />
              <Box
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  gap: tokens.spacing[3],
                }}
              >
                {social.map((item) => {
                  const isHovered = hoveredSocial === item.key;

                  return (
                    <Box
                      key={item.key}
                      onClick={item.onClick}
                      onMouseEnter={() => setHoveredSocial(item.key)}
                      onMouseLeave={() => setHoveredSocial(null)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: tokens.spacing[8],
                        height: tokens.spacing[8],
                        borderRadius: tokens.borderRadius.full,
                        backgroundColor: isHovered
                          ? tokens.colors.primaryScale[100]
                          : tokens.colors.neutral[100],
                        color: isHovered
                          ? tokens.colors.primaryScale[600]
                          : tokens.colors.neutral[500],
                        cursor: item.onClick || item.href ? 'pointer' : 'default',
                        transition: `all ${tokens.motion.hover}`,
                        transform: isHovered ? tokens.motion.transform : 'none',
                        fontSize: tokens.typography.fontSize.lg,
                      }}
                    >
                      {item.icon}
                    </Box>
                  );
                })}
              </Box>
            </>
          )}

          {/* Bottom: Copyright */}
          {copyright && (
            <>
              <Divider />
              <Box
                style={{
                  textAlign: 'center' as const,
                  fontSize: tokens.typography.fontSize.xs,
                  color: tokens.colors.neutral[400],
                  letterSpacing: '0.02em',
                }}
              >
                {copyright}
              </Box>
            </>
          )}
        </Box>
      </Box>
    );
  },
});
