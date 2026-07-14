'use client';

/**
 * @fileoverview LoadingOverlay — structures-tier semi-transparent overlay
 * rendered over content during data fetches.
 *
 * @description
 * Generic, engine-free loading shell that prevents layout shift by
 * absolutely positioning a blurred overlay above the parent container.
 * Consumers pass their own brand mark via the `logo` slot — this chrome
 * family ships no brand assets so any vertical can drop in its own
 * animated logo.
 *
 * The overlay always pulses the logo with a 1.8s ease-in-out animation
 * and renders three trailing dots after the message text. This is the
 * visual vocabulary the family owns; the brand identity is the
 * consumer's.
 */

import type { ReactNode } from 'react';

import { Box, Flex, Text } from '../../../primitives';

export interface LoadingOverlayProps {
  /** Whether the overlay is visible */
  visible: boolean;
  /** Optional message rendered below the logo */
  message?: string;
  /**
   * Optional brand mark rendered above the message. Pass an animated SVG or
   * any ReactNode. The pattern wraps the node in a pulsing container, so the
   * logo itself does not need its own animation.
   */
  logo?: ReactNode;
}

export function LoadingOverlay({ visible, message = 'Loading', logo }: LoadingOverlayProps) {
  if (!visible) return null;

  return (
    <Box
      className="ds-loading-overlay"
      data-part="root"
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 10,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: 0.92,
      }}
    >
      <Flex direction="column" align="center" gap={12}>
        {logo && (
          <Box
            data-part="logo"
            style={{ animation: 'ds-loading-overlay-pulse 1.8s ease-in-out infinite' }}
          >
            {logo}
          </Box>
        )}
        <Flex align="center" gap={2}>
          <Text
            data-part="message"
            size="sm"
            style={{
              fontFamily: 'var(--ds-font-mono, monospace)',
              letterSpacing: '0.05em',
            }}
          >
            {message}
          </Text>
          {[0, 1, 2].map((i) => (
            <Text
              key={i}
              data-part="dot"
              size="sm"
              style={{
                animation: `ds-loading-overlay-dots 1.4s ease-in-out ${i * 0.2}s infinite`,
              }}
            >
              .
            </Text>
          ))}
        </Flex>
      </Flex>
    </Box>
  );
}
