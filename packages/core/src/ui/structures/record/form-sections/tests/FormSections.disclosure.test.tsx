/**
 * FormSections disclosure contract (WO-CRA-23).
 *
 * The §4 anatomy evidence lives in the group-level
 * `record/tests/RecordBatch.contract.test.tsx`. This suite pins the one thing a
 * regression would silently undo: `summary` and `extra` are consumer ReactNode
 * that routinely hold controls, and they used to render INSIDE the header
 * `<button>` — invalid HTML, and the inner control could not be operated
 * because the press went to the disclosure.
 */

import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, waitFor } from '@testing-library/react';

import { FormSections } from '..';
import { renderWithEngine } from '../../../../../tooling/testing/helpers/engine';

const WAIT_TIMEOUT = 2000;

async function waitForPart(container: HTMLElement, part: string): Promise<Element> {
  await waitFor(
    () => {
      if (!container.querySelector(`[data-part="${part}"]`)) {
        throw new Error(`expected [data-part="${part}"] in <container>`);
      }
    },
    { timeout: WAIT_TIMEOUT },
  );
  return container.querySelector(`[data-part="${part}"]`) as Element;
}

const section = (extra?: React.ReactNode) => [
  {
    key: 'profile',
    title: 'Profile',
    summary: '3 of 5 complete',
    extra,
    children: <div>Profile content</div>,
  },
];

describe('FormSections disclosure', () => {
  it('keeps the consumer action slot outside the disclosure button', async () => {
    const onExtra = vi.fn();
    const { container } = renderWithEngine(
      <FormSections
        sections={section(
          <button type="button" data-testid="extra-action" onClick={onExtra}>
            Reset
          </button>,
        )}
        collapsible
      />,
      'modern',
    );

    const disclosure = await waitForPart(container, 'section-disclosure');
    const extra = container.querySelector('[data-testid="extra-action"]')!;
    const summary = container.querySelector('[data-part="section-summary"]')!;

    expect(disclosure.tagName).toBe('BUTTON');
    expect(disclosure.contains(extra)).toBe(false);
    expect(disclosure.contains(summary)).toBe(false);

    // Both stay inside the header, which is what the skin anchors on.
    const header = container.querySelector('[data-part="section-header"]')!;
    expect(header.contains(disclosure)).toBe(true);
    expect(header.contains(extra)).toBe(true);
    expect(header.contains(summary)).toBe(true);
  });

  it('routes a press on the consumer action to that action, not to the disclosure', async () => {
    const onExtra = vi.fn();
    const onChange = vi.fn();
    const { container } = renderWithEngine(
      <FormSections
        sections={section(
          <button type="button" data-testid="extra-action" onClick={onExtra}>
            Reset
          </button>,
        )}
        collapsible
        onChange={onChange}
      />,
      'modern',
    );

    await waitForPart(container, 'section-disclosure');
    fireEvent.click(container.querySelector('[data-testid="extra-action"]')!);

    expect(onExtra).toHaveBeenCalledTimes(1);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('carries the expanded state on the disclosure and never on the header', async () => {
    const { container } = renderWithEngine(
      <FormSections sections={section()} collapsible defaultActiveKeys={['profile']} />,
      'modern',
    );

    const disclosure = await waitForPart(container, 'section-disclosure');
    const header = container.querySelector('[data-part="section-header"]')!;

    expect(disclosure.getAttribute('aria-expanded')).toBe('true');
    expect(disclosure.getAttribute('aria-controls')).toBeTruthy();
    expect(header.getAttribute('aria-expanded')).toBeNull();
    // The skin's non-collapsible divider rule keys on this, not on the absence
    // of aria-expanded (which stopped being a reliable proxy once the button
    // moved inward).
    expect(header.getAttribute('data-collapsible')).toBe('true');
  });

  it('renders no disclosure button at all when the sections are not collapsible', async () => {
    const { container } = renderWithEngine(<FormSections sections={section()} />, 'modern');

    const header = await waitForPart(container, 'section-header');
    expect(header.tagName).not.toBe('BUTTON');
    expect(header.getAttribute('data-collapsible')).toBe('false');
    expect(container.querySelector('[data-part="section-disclosure"]')).toBeNull();
    expect(container.querySelector('[data-part="section-toggle"]')).toBeNull();
  });
});
