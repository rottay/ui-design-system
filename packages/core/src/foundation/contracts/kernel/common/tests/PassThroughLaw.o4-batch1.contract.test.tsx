/**
 * Pass-through law contract (P-88) for the tail families whose part and state
 * held sets are empty: AspectRatio, Descriptions, Empty, QRCode, Segmented,
 * Timeline, Rate, Toggle, VoiceInputButton, the Tooltip compound parts and
 * SemanticSurface. A caller `data-part`/`data-state` reaches no element
 * they paint and the owner's own part survives; `id`, `aria-label`, every
 * other `data-*` and `className` keep forwarding (the honesty law).
 */
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, waitFor } from '@testing-library/react';

import ModernDescriptions from '@/components/primitives/display/descriptions/engines/modern';
import ModernEmpty from '@/components/primitives/display/empty/engines/modern';
import ModernQRCode from '@/components/primitives/display/qr-code/engines/modern';
import ModernTimeline from '@/components/primitives/display/timeline/engines/modern';
import { TooltipContent } from '@/components/primitives/display/tooltip/compound/content';
import { TooltipTrigger } from '@/components/primitives/display/tooltip/compound/trigger';
import ModernRate from '@/components/primitives/feedback/rate/engines/modern';
import RusticRate from '@/components/primitives/feedback/rate/engines/rustic';
import ModernToggle from '@/components/primitives/inputs/toggle/engines/modern';
import RusticToggle from '@/components/primitives/inputs/toggle/engines/rustic';
import { VoiceInputButton } from '@/components/primitives/inputs/voice-input-button';
import ModernAspectRatio from '@/components/primitives/layout/aspect-ratio/engines/modern';
import {
  SemanticSurface,
  SemanticSurfaceSupport,
} from '@/components/primitives/layout/semantic-surface';
import ModernSegmented from '@/components/primitives/navigation/segmented/engines/modern';
import { renderWithEngine, renderWithEngineContext } from '@tests/support/engine';

const CALLER_PART = 'p88-caller-part';
const CALLER_STATE = 'p88-caller-state';

const OPTIONS = [
  { value: 'a', label: 'Alpha' },
  { value: 'b', label: 'Bravo' },
];

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
    ['AspectRatio', 'modern', <ModernAspectRatio key="aspect-ratio" {...caller}>Media</ModernAspectRatio>, ".ds-aspect-ratio--modern[data-part='root']"],
    ['Empty', 'modern', <ModernEmpty key="empty" {...caller} />, ".rottay-empty--modern[data-part='root']"],
    ['QRCode', 'modern', <ModernQRCode key="qr-code" value="v" {...caller} />, ".rottay-qrcode--modern[data-part='root']"],
    ['Timeline', 'modern', <ModernTimeline key="timeline" items={[{ children: 'a' }]} {...caller} />, "ol.caller-hook[data-part='root']"],
    ['Descriptions', 'modern', <ModernDescriptions key="descriptions" {...caller} title="Title" />, ".rottay-descriptions--modern[data-part='root']"],
    ['Rate', 'modern', <ModernRate key="rate-modern" {...caller} />, ".caller-hook[data-part='root']"],
    ['Rate', 'rustic', <RusticRate key="rate-rustic" {...caller} />, ".caller-hook[data-part='root']"],
    ['Toggle', 'modern', <ModernToggle key="toggle-modern" {...caller} />, ".ds-toggle--modern[data-part='root']"],
    ['Toggle', 'rustic', <RusticToggle key="toggle-rustic" {...caller} />, ".ds-toggle--rustic[data-part='root']"],
    ['Tooltip content', 'modern', <TooltipContent key="tooltip-content" {...caller}>Hint</TooltipContent>, ".ds-tooltip-content[data-part='content']"],
    ['Tooltip trigger', 'modern', <TooltipTrigger key="tooltip-trigger" {...caller}><button type="button">Open</button></TooltipTrigger>, '.ds-tooltip-trigger:not([data-part])'],
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

  // Segmented names its radiogroup through `ariaLabel` and forwards no caller
  // attribute bag; `className` is its composition door.
  it('Segmented (modern) drops the caller part, keeps its own root part and lands the caller class', () => {
    const { container } = renderWithEngine(
      <ModernSegmented ariaLabel="Period" options={OPTIONS} className="caller-hook" data-part={CALLER_PART} />,
      'modern',
    );

    expect(container.querySelector(`[data-part="${CALLER_PART}"]`)).toBeNull();
    expect(container.querySelector(".ds-segmented--modern.caller-hook[data-part='root']")).toBeTruthy();
  });

  describe('VoiceInputButton', () => {
    const w = window as unknown as { SpeechRecognition?: unknown };

    beforeEach(() => {
      w.SpeechRecognition = class {
        start() {}
        stop() {}
        abort() {}
      };
    });
    afterEach(() => {
      delete w.SpeechRecognition;
    });

    it('never surfaces a caller part or state, at rest or pressed, and still forwards id and data-*', async () => {
      const { container } = renderWithEngineContext(
        <VoiceInputButton
          lang="en-US"
          onTranscript={vi.fn()}
          id="p88-caller-id"
          data-custom="caller-data"
          className="caller-hook"
          data-part={CALLER_PART}
          data-state={CALLER_STATE}
        />,
        'classic',
      );
      await waitFor(() => expect(container.querySelector('.ds-voice-input-button')).not.toBeNull());

      const root = container.querySelector<HTMLElement>('.ds-voice-input-button')!;
      expect(root).toHaveAttribute('data-part', 'root');
      expect(root).not.toHaveAttribute('data-state');

      fireEvent.pointerDown(root);
      expect(root.getAttribute('data-state')?.split(' ')).toContain('pressed');
      expect(root.getAttribute('data-state')).not.toContain(CALLER_STATE);
      fireEvent.pointerUp(root);
      expect(root).not.toHaveAttribute('data-state');

      expect(container.querySelector(`[data-part="${CALLER_PART}"]`)).toBeNull();
      expect(container.querySelector(`[data-state~="${CALLER_STATE}"]`)).toBeNull();
      expect(root).toHaveAttribute('id', 'p88-caller-id');
      expect(root).toHaveAttribute('data-custom', 'caller-data');
      expect(root).toHaveClass('caller-hook');
    });
  });
});
