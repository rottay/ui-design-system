/**
 * Pass-through law contract (P-88) for the tail families whose part and state
 * held sets are empty: Descriptions, Rate, Toggle, the Tooltip compound parts
 * and SemanticSurface. A caller `data-part`/`data-state` reaches no element
 * they paint and the owner's own part survives; `id`, `aria-label`, every
 * other `data-*` and `className` keep forwarding (the honesty law).
 */
import React from 'react';
import { describe, expect, it } from 'vitest';

import ModernDescriptions from '@/components/primitives/display/descriptions/engines/modern';
import { TooltipContent } from '@/components/primitives/display/tooltip/compound/content';
import { TooltipTrigger } from '@/components/primitives/display/tooltip/compound/trigger';
import ModernRate from '@/components/primitives/feedback/rate/engines/modern';
import RusticRate from '@/components/primitives/feedback/rate/engines/rustic';
import ModernToggle from '@/components/primitives/inputs/toggle/engines/modern';
import RusticToggle from '@/components/primitives/inputs/toggle/engines/rustic';
import {
  SemanticSurface,
  SemanticSurfaceSupport,
} from '@/components/primitives/layout/semantic-surface';
import { renderWithEngine } from '@tests/support/engine';

const CALLER_PART = 'p88-caller-part';
const CALLER_STATE = 'p88-caller-state';

const caller = {
  id: 'p88-caller-id',
  'aria-label': 'Caller label',
  'data-custom': 'caller-data',
  className: 'caller-hook',
  'data-part': CALLER_PART,
  'data-state': CALLER_STATE,
} as const;

describe('P-88 pass-through law: tail families with empty held sets', () => {
  it.each([
    ['Descriptions', 'modern', <ModernDescriptions key="descriptions" {...caller} title="Title" />, ".rottay-descriptions--modern[data-part='root']"],
    ['Rate', 'modern', <ModernRate key="rate-modern" {...caller} />, ".caller-hook[data-part='root']"],
    ['Rate', 'rustic', <RusticRate key="rate-rustic" {...caller} />, ".caller-hook[data-part='root']"],
    ['Toggle', 'modern', <ModernToggle key="toggle-modern" {...caller} />, ".ds-toggle--modern[data-part='root']"],
    ['Toggle', 'rustic', <RusticToggle key="toggle-rustic" {...caller} />, ".ds-toggle--rustic[data-part='root']"],
    ['Tooltip content', 'modern', <TooltipContent key="tooltip-content" {...caller}>Hint</TooltipContent>, ".ds-tooltip-content[data-part='content']"],
    ['Tooltip trigger', 'modern', <TooltipTrigger key="tooltip-trigger" {...caller}>Open</TooltipTrigger>, '.ds-tooltip-trigger:not([data-part])'],
    [
      'Tooltip trigger (asChild)',
      'modern',
      <TooltipTrigger key="tooltip-trigger-child" asChild {...caller}><button type="button">Open</button></TooltipTrigger>,
      'button.caller-hook:not([data-part])',
    ],
    ['SemanticSurface', 'modern', <SemanticSurface key="surface" surfaceRole="panel" {...caller}>Body</SemanticSurface>, ".ds-semantic-surface[data-part='root']"],
    ['SemanticSurface support', 'modern', <SemanticSurfaceSupport key="support" {...caller}>Note</SemanticSurfaceSupport>, ".ds-semantic-surface__support[data-part='support']"],
  ] as const)('%s (%s) drops the caller part and state, keeps its own anatomy and still forwards id, aria-label, data-* and className', (_family, engine, ui, ownAnatomy) => {
    const { container } = renderWithEngine(ui, engine);

    expect(container.querySelector(`[data-part="${CALLER_PART}"]`)).toBeNull();
    expect(container.querySelector(`[data-state="${CALLER_STATE}"]`)).toBeNull();
    expect(container.querySelector(ownAnatomy)).toBeTruthy();

    expect(container.querySelector('[data-custom="caller-data"]')).toBeTruthy();
    expect(container.querySelector('#p88-caller-id')).toBeTruthy();
    expect(container.querySelector('[aria-label="Caller label"]')).toBeTruthy();
    expect(container.querySelector('.caller-hook')).toBeTruthy();
  });
});
