/**
 * Pass-through law contract (P-88) for the classic typography engine, on each of
 * its six render paths: the element keeps its own `root` part, a caller
 * `data-part`/`data-state` never reaches it, and `id`, `aria-label`, every other
 * `data-*` and `className` keep forwarding (the honesty law).
 */
import React from 'react';
import { describe, expect, it } from 'vitest';

import { ClassicHeading, ClassicLink, ClassicParagraph, ClassicText } from '@/components/primitives/display/typography/engines/classic';
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

describe('P-88 pass-through law: the classic typography engine', () => {
  it.each([
    ['Heading (h6)', <ClassicHeading key="h6" {...caller} level="h6">Heading</ClassicHeading>],
    ['Heading (Title)', <ClassicHeading key="title" {...caller} level="h2">Heading</ClassicHeading>],
    ['Text (element)', <ClassicText key="element" {...caller} as="p">Text</ClassicText>],
    ['Text (AntText)', <ClassicText key="ant-text" {...caller}>Text</ClassicText>],
    ['Paragraph', <ClassicParagraph key="paragraph" {...caller}>Paragraph</ClassicParagraph>],
    ['Link', <ClassicLink key="link" {...caller} href="/somewhere">Link</ClassicLink>],
  ] as const)('classic %s keeps its root part, drops the caller part and state, and still forwards id, aria-label, data-* and className', (_path, ui) => {
    const { container } = renderWithEngine(ui, 'classic');

    expect(container.querySelector(`[data-part="${CALLER_PART}"]`)).toBeNull();
    expect(container.querySelector(`[data-state="${CALLER_STATE}"]`)).toBeNull();

    const forwarded = container.querySelector('[data-custom="caller-data"]') as HTMLElement;
    expect(forwarded).toBeTruthy();
    expect(forwarded).toHaveAttribute('data-part', 'root');
    expect(forwarded).not.toHaveAttribute('data-state');
    expect(forwarded).toHaveClass('rottay-typography--classic');
    expect(container.querySelector('#p88-caller-id')).toBeTruthy();
    expect(container.querySelector('[aria-label="Caller label"]')).toBeTruthy();
    expect(container.querySelector('.caller-hook')).toBeTruthy();
  });
});
