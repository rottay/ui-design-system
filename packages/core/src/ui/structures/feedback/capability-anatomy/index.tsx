'use client';

/**
 * @fileoverview Capability anatomy: the inventory of what a surface can do.
 *
 * @description A labelled, data-independent list of the capabilities a surface
 * registered, rendered beside a surface that failed or degraded. It answers
 * "what was this page supposed to offer?" when the page itself cannot say so,
 * which is why it lives in `structures/feedback` next to the lifecycle states
 * it accompanies.
 *
 * It is deliberately NOT part of the `surface-lifecycle` family. Every member
 * of that family renders one lifecycle moment
 * (`loading | empty | error | stale | offline`) and is interchangeable with the
 * others through `useSurfaceState`. This renders none of them: it takes a
 * capability registry, it has no lifecycle position, and it is composed
 * alongside a state rather than instead of content. Folding it in would have
 * made the family a bag of things that happen to appear near an error.
 *
 * Its prop type comes from `structures/foundation/chrome/contracts` --
 * `SurfaceCapabilityRegistration` is chrome vocabulary that the surfaces tier
 * re-exports, not surfaces vocabulary. That is why this component sits here
 * rather than one tier up, where it previously lived on the
 * `surfaces/runtime/helpers/states` support path.
 *
 * All paint belongs to `.ds-capability-anatomy` in the skin; this stamps
 * anatomy (`data-part`, `data-capability-*`) and nothing else.
 */

import type { ReactNode } from 'react';

import { Box } from '../../../primitives/layout/Box';
import { Text } from '../../../primitives/display/Typography/compound/Text';
import type { SurfaceCapabilityRegistration } from '../../foundation/chrome/contracts';
import { useSurfaceTranslations } from '../../foundation/chrome/runtime/i18n';

export interface SurfaceCapabilityAnatomyProps {
  capabilities: ReadonlyArray<SurfaceCapabilityRegistration>;
  label?: ReactNode;
  ariaLabel?: string;
}

/** Responsive, data-independent inventory shown beside a failed surface load. */
export function SurfaceCapabilityAnatomy({
  capabilities,
  label,
  ariaLabel,
}: SurfaceCapabilityAnatomyProps): React.ReactElement | null {
  const { tSurface } = useSurfaceTranslations();

  if (capabilities.length === 0) return null;

  return (
    <Box
      className="ds-surface ds-capability-anatomy"
      data-part="capability-anatomy"
      data-capability-count={capabilities.length}
      aria-label={ariaLabel ?? tSurface('states.capability_aria')}
    >
      <Text
        data-part="capability-anatomy-label"
        size="xs"
        color="muted"
      >
        {label ?? tSurface('states.capability_label')}
      </Text>
      <Box
        role="list"
        data-part="capability-list"
      >
        {capabilities.map((capability) => (
          <Box
            role="listitem"
            key={`${capability.kind}-${capability.id}`}
            data-part="capability"
            data-capability-kind={capability.kind}
            data-capability-id={capability.id}
            data-disabled={capability.disabled ? 'true' : undefined}
          >
            <Text size="sm" data-part="capability-label">
              {capability.label ?? capability.id}
            </Text>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
