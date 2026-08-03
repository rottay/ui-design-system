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
 * The overlay pulses the logo and renders three trailing dots after the
 * message text — that is the visual vocabulary the family owns; the brand
 * identity is the consumer's. Both animation shorthands now live in
 * `presentation/components/skin/loading-overlay.css` (identical keyframes,
 * durations and stagger, transcribed verbatim): an inline `animation` can
 * never be silenced by the reduced-motion guard, so the assignment moved to
 * the skin — where the guard actually works. The pre-step test that pinned
 * the two inline shorthand strings in this source must be re-pinned by
 * Codex to the skin-owned form (same migration contract the skin documents
 * for the backdrop blur). Every other paint and all geometry were already
 * skin-owned.
 *
 * Accessibility: the root is a polite `status` live region so the loading
 * message reaches assistive technology, and it stamps `aria-busy` while
 * visible. Making the covered CONTENT inert while the overlay is visible is
 * the consumer's side of the contract (the structure cannot reach its
 * siblings — see the family report).
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
      aria-busy="true"
    >
      <Flex direction="column" align="center" gap={12}>
        {logo && (
          <Box data-part="logo">
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
              data-dot-index={i}
              size="sm"
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
