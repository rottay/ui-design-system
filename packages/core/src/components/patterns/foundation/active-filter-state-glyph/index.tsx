'use client';

/**
 * @fileoverview The one lifecycle-glyph decision shared by the ListToolbar
 * chips and the ActiveFiltersBar rail.
 *
 * @description
 * Renders `ActiveFilterState` as SHAPE (never hue alone) with the governed
 * status role, at the `xs` rung of the icon ramp rather than a per-family pixel
 * literal. `applied` — and an absent state — renders nothing, because an empty
 * icon slot is still a slot in the composed chip. The caller keeps its own
 * anatomy marker, its visually hidden state word and its localized copy.
 */

import type { ReactElement } from 'react';

import type { ActiveFilterState } from '@/foundation/contracts/runtime/components/patterns/data';
import { StatusDraftIcon } from '@/graphics/icons/semantic/generated/roles/status-draft';
import { StatusErrorIcon } from '@/graphics/icons/semantic/generated/roles/status-error';

/** The anatomy marker stays the CALLER's declaration: the family-cut part census
 *  reads each family's own source, so a shared owner must never name it. */
export function renderActiveFilterStateGlyph(
  state: ActiveFilterState | undefined,
  marker?: { readonly 'data-part'?: string },
): ReactElement | undefined {
  const Glyph =
    state === 'draft' ? StatusDraftIcon : state === 'invalid' ? StatusErrorIcon : undefined;
  if (!Glyph) return undefined;
  return <Glyph decorative size="xs" data-part={marker?.['data-part']} />;
}
