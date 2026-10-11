/**
 * Pass-through law contract (P-88) for the classic engines that stamp no part
 * and no state of their own: Select, Tag, Link, Textarea and Divider (both of
 * its render paths). A caller `data-part`/`data-state` reaches no element they
 * paint, so the element stays bare; `id`, `aria-label`, every other `data-*`
 * and `className` keep forwarding (the honesty law).
 */
import React from 'react';
import { describe, expect, it } from 'vitest';

import ClassicTag from '@/components/primitives/display/tag/engines/classic';
import ClassicSelect from '@/components/primitives/inputs/select/engines/classic';
import ClassicTextarea from '@/components/primitives/inputs/textarea/engines/classic';
import ClassicDivider from '@/components/primitives/layout/divider/engines/classic';
import ClassicLink from '@/components/primitives/navigation/link/engines/classic';
import { renderWithEngine } from '@tests/support/engine';

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

describe('P-88 pass-through law: classic engines with no part of their own', () => {
  it.each([
    ['Select', <ClassicSelect key="select" {...caller} options={OPTIONS} />],
    ['Tag', <ClassicTag key="tag" {...caller}>Tag</ClassicTag>],
    ['Link', <ClassicLink key="link" {...caller} href="/somewhere">Link</ClassicLink>],
    ['Textarea', <ClassicTextarea key="textarea" {...caller} />],
    ['Divider (plain line)', <ClassicDivider key="divider-line" {...caller} />],
    ['Divider (labelled)', <ClassicDivider key="divider-text" {...caller}>Label</ClassicDivider>],
  ] as const)('classic %s drops the caller part and state and still forwards id, aria-label, data-* and className', (_family, ui) => {
    const { container } = renderWithEngine(ui, 'classic');

    expect(container.querySelector(`[data-part="${CALLER_PART}"]`)).toBeNull();
    expect(container.querySelector(`[data-state="${CALLER_STATE}"]`)).toBeNull();

    const forwarded = container.querySelector('[data-custom="caller-data"]') as HTMLElement;
    expect(forwarded).toBeTruthy();
    expect(forwarded).not.toHaveAttribute('data-part');
    expect(forwarded).not.toHaveAttribute('data-state');
    expect(container.querySelector('#p88-caller-id')).toBeTruthy();
    expect(container.querySelector('[aria-label="Caller label"]')).toBeTruthy();
    expect(container.querySelector('.caller-hook')).toBeTruthy();
  });
});
