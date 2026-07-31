'use client';

/**
 * @fileoverview LoadingOverlay — structures-tier semi-transparent overlay
 * rendered over content during data fetches.
 *
 * @description
 * Generic, engine-free loading shell that prevents layout shift by
 * absolutely positioning a scrim above the parent container. Consumers pass
 * their own brand mark via the `logo` slot — this chrome family ships no
 * brand assets so any vertical can drop in its own animated logo.
 *
 * The overlay pulses the logo (1.8s ease-in-out) and renders three trailing
 * dots after the message text — that is the visual vocabulary the family
 * owns; the brand identity is the consumer's. Both animation shorthands
 * stay inline in this file BY FROZEN CONTRACT (the pre-step test pins their
 * exact strings in the source); every other paint and all geometry live in
 * `presentation/components/skin/loading-overlay.css`.
 *
 * Accessibility: the root is a polite `status` live region so the loading
 * message reaches assistive technology. Making the covered CONTENT inert
 * while the overlay is visible is the consumer's side of the contract (the
 * structure cannot reach its siblings — see the family report).
 */

import type { ReactNode } from 'react';

import { Box, Flex, Text } from '../../../primitives';
import { useOptionalTranslation } from '@/infrastructure/runtime/i18n';

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

export function LoadingOverlay({ visible, message: messageProp, logo }: LoadingOverlayProps) {
  // Optional channel with an English floor: the overlay renders standalone
  // (no I18nProvider) without crashing, and never echoes a raw key.
  const i18n = useOptionalTranslation('components');
  const message = messageProp ?? i18n?.tOr('loadingOverlay.message', 'Loading') ?? 'Loading';

  if (!visible) return null;

  return (
    <Box
      className="ds-loading-overlay"
      data-part="root"
      role="status"
      aria-live="polite"
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
              aria-hidden="true"
            >
              .
            </Text>
          ))}
        </Flex>
      </Flex>
    </Box>
  );
}
