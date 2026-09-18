/**
 * WorkbenchHeader, WO-FAM-10 sub-lot E.
 *
 * What this suite owns: the DOM and skin contract the family cut changed. The
 * card and every saved-view tab read their hover, press and keyboard ring off
 * the shared kernel's `data-state`; the quick-action Button IS the `action` part
 * and paints itself from the channels this slot states; and the loading state is
 * the shared anatomy renderer.
 */

import React from 'react';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import ModernWorkbenchHeader from '../engines/modern';

const SKIN = readFileSync(
  resolve(
    process.cwd(),
    'src/foundation/tokens/css/runtime/engines/modern/skin/workbench-header/index.css',
  ),
  'utf8',
);
/** The skin with its prose removed, so a rule is a rule and never a sentence. */
const RULES = SKIN.replace(/\/\*[\s\S]*?\*\//g, '');

const VIEWS = [
  { id: 'v1', label: 'Overview' },
  { id: 'v2', label: 'Exceptions' },
];

describe('WorkbenchHeader (WO-FAM-10 cut) — the kernel decides interaction', () => {
  it('decides the card hover and press once, in the kernel, and reads them off data-state', () => {
    const { container } = render(<ModernWorkbenchHeader title="Hub" />);
    const root = container.querySelector('[data-part="root"]') as HTMLElement;

    expect(root.getAttribute('data-state')).toBeNull();

    fireEvent.pointerEnter(root);
    expect(root.getAttribute('data-state')).toBe('hovered');

    fireEvent.pointerDown(root);
    expect(root.getAttribute('data-state')).toContain('pressed');

    fireEvent.pointerUp(root);
    fireEvent.pointerLeave(root);
    expect(root.getAttribute('data-state')).toBeNull();
  });

  it('never reports the card keyboard-focused because a tab inside it is', () => {
    const { container } = render(
      <ModernWorkbenchHeader title="Hub" savedViews={VIEWS} activeViewId="v1" />,
    );
    const root = container.querySelector('[data-part="root"]') as HTMLElement;
    const tab = screen.getByRole('tab', { name: 'Overview' });

    act(() => tab.focus());

    expect(tab.getAttribute('data-state')).toContain('focus-visible');
    expect(root.getAttribute('data-state')).toBeNull();
  });

  it('gives every tab the full triad without disturbing the roving tab stop', () => {
    render(<ModernWorkbenchHeader title="Hub" savedViews={VIEWS} activeViewId="v1" />);
    const inactive = screen.getByRole('tab', { name: 'Exceptions' });

    // Roving tabindex is unchanged by the state the kernel now stamps.
    expect(inactive).toHaveAttribute('tabindex', '-1');
    expect(screen.getByRole('tab', { name: 'Overview' })).toHaveAttribute('tabindex', '0');

    fireEvent.pointerEnter(inactive);
    expect(inactive.getAttribute('data-state')).toBe('hovered');
    fireEvent.pointerDown(inactive);
    expect(inactive.getAttribute('data-state')).toContain('pressed');
    fireEvent.pointerUp(inactive);
    fireEvent.pointerLeave(inactive);
    expect(inactive.getAttribute('data-state')).toBeNull();
  });
});

describe('WorkbenchHeader (WO-FAM-10 cut) — the quick action IS the Button', () => {
  it('carries the part and this header\'s tone on the control itself', () => {
    const { container } = render(
      <ModernWorkbenchHeader
        title="Hub"
        quickActions={[
          { label: 'New', onClick: vi.fn(), variant: 'primary' },
          { label: 'Archive', onClick: vi.fn() },
          { label: 'Delete', onClick: vi.fn(), variant: 'danger' },
        ]}
      />,
    );

    const actions = Array.from(container.querySelectorAll('[data-part="action"]'));
    expect(actions.map((el) => el.tagName)).toEqual(['BUTTON', 'BUTTON', 'BUTTON']);
    // The closed prop domain is the Button's own, so the tone this header states
    // and the tone the Button resolves are the same attribute, never two.
    expect(actions.map((el) => el.getAttribute('data-variant'))).toEqual([
      'primary',
      'default',
      'danger',
    ]);
    // No wrapper is left between the rail and the control.
    for (const action of actions) {
      expect(action.parentElement).toHaveAttribute('data-part', 'actions');
    }
  });

  it('lets the Button decide its own hover and press', () => {
    render(
      <ModernWorkbenchHeader
        title="Hub"
        quickActions={[{ label: 'New', onClick: vi.fn(), variant: 'primary' }]}
      />,
    );
    const action = screen.getByRole('button', { name: 'New' });

    expect(action.getAttribute('data-state')).toBeNull();
    fireEvent.pointerEnter(action);
    expect(action.getAttribute('data-state')).toBe('hovered');
    fireEvent.pointerLeave(action);
    expect(action.getAttribute('data-state')).toBeNull();
  });

  it('still fires the caller callback and honours a disabled action', () => {
    const onClick = vi.fn();
    const onDisabled = vi.fn();
    render(
      <ModernWorkbenchHeader
        title="Hub"
        quickActions={[
          { label: 'New', onClick },
          { label: 'Archive', onClick: onDisabled, disabled: true },
        ]}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'New' }));
    expect(onClick).toHaveBeenCalledTimes(1);

    expect(screen.getByRole('button', { name: 'Archive' })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'Archive' }));
    expect(onDisabled).not.toHaveBeenCalled();
  });
});

describe('WorkbenchHeader (WO-FAM-10 cut) — the skin owns no other component', () => {
  it('states each quick-action tone through the Button channels, selecting into nothing', () => {
    expect(RULES).not.toContain('.ds-button');

    for (const channel of [
      '--ds-button-primary-bg:',
      '--ds-button-primary-shadow-hover:',
      '--ds-button-error-border:',
      '--ds-button-error-bg-active:',
      '--ds-button-default-color:',
      '--ds-button-default-border-hover:',
    ]) {
      expect(RULES, channel).toContain(channel);
    }
    // The retired rules killed the Button's own focus ring with their own
    // box-shadow; nothing in this file states a box-shadow for a quick action.
    expect(RULES).not.toContain("[data-part='action'][data-variant='primary'] > ");
  });

  it('pairs every state pseudo-class with the token the kernel stamps', () => {
    const chunks = RULES.split('{').map((chunk) => (chunk.split('}').pop() ?? '').trim());
    for (const [pseudo, twin] of [
      [':hover', 'hovered'],
      [':active', 'pressed'],
      [':focus-visible', 'focus-visible'],
      [':disabled', 'disabled'],
    ] as const) {
      for (const selector of chunks.filter((chunk) => chunk.includes(pseudo))) {
        expect({ pseudo, selector }).toEqual({
          pseudo,
          selector: expect.stringContaining(`data-state~='${twin}'`),
        });
      }
    }
  });

  it('owns no skeleton part, no skeleton geometry and no pulse of its own', () => {
    expect(RULES).not.toContain('skeleton');
    expect(RULES).not.toContain('pulse');
  });
});
