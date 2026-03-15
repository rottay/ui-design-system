import React, { createRef } from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import ModernTour from './engines/modern';
import RusticTour from './engines/rustic';

function mockRect(element: HTMLElement, rect: Partial<DOMRect>): void {
  Object.defineProperty(element, 'getBoundingClientRect', {
    configurable: true,
    value: () =>
      ({
        x: rect.left ?? 0,
        y: rect.top ?? 0,
        top: rect.top ?? 0,
        left: rect.left ?? 0,
        right: rect.right ?? 200,
        bottom: rect.bottom ?? 120,
        width: rect.width ?? 200,
        height: rect.height ?? 40,
        toJSON: () => ({}),
      }) as DOMRect,
  });
}

describe('Tour real engine coverage', () => {
  it('covers the rustic engine with selector and function targets, mask objects, navigation, finish, and escape closing', async () => {
    const onChange = vi.fn();
    const onClose = vi.fn();
    const onFinish = vi.fn();

    render(
      <div>
        <div
          id="tour-anchor"
          ref={(node) => {
            if (node) {
              mockRect(node, { top: 40, left: 60, width: 180, height: 32, bottom: 72 });
            }
          }}
        >
          Anchor
        </div>
        <RusticTour
          open
          type="primary"
          mask={{ color: 'rgba(1, 2, 3, 0.4)' }}
          onChange={onChange}
          onClose={onClose}
          onFinish={onFinish}
          steps={[
            {
              target: '#tour-anchor',
              title: 'Welcome',
              description: 'Start here',
              cover: <div>Cover content</div>,
            },
            {
              target: () => document.getElementById('tour-anchor'),
              title: 'Finish setup',
            },
          ]}
        />
      </div>
    );

    const dialog = await screen.findByRole('dialog');
    expect(dialog).toHaveTextContent('Welcome');
    expect(dialog).toHaveTextContent('Start here');
    expect(dialog).toHaveTextContent('Cover content');
    expect(dialog.getAttribute('style') ?? '').toContain('border: 2px solid');

    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith(1);
    });
    expect(screen.getByText('Finish setup')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Previous' })).toBeInTheDocument();

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'Finish' }));
    expect(onFinish).toHaveBeenCalled();
  });

  it('covers the modern engine with ref targets, controlled steps, mask=false, and finish/previous branches', async () => {
    const onChange = vi.fn();
    const onClose = vi.fn();
    const onFinish = vi.fn();
    const ref = createRef<HTMLDivElement>();

    render(
      <div>
        <div
          data-testid="tour-ref-anchor"
          ref={(node) => {
            if (node) {
              mockRect(node, { top: 24, left: 32, width: 160, height: 28, bottom: 52 });
            }
            ref.current = node;
          }}
        >
          Ref anchor
        </div>
        <ModernTour
          open
          current={1}
          mask={false}
          onChange={onChange}
          onClose={onClose}
          onFinish={onFinish}
          steps={[
            { target: ref, title: 'Intro' },
            { target: ref, title: 'Review', description: 'Double-check the settings' },
          ]}
        />
      </div>
    );

    expect(await screen.findByText('Review')).toBeInTheDocument();
    expect(screen.getByText('Double-check the settings')).toBeInTheDocument();
    expect(document.body.querySelector('.fixed.inset-0')).toBeNull();
    expect(screen.getByRole('button', { name: 'Previous' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Previous' }));
    expect(onChange).toHaveBeenCalledWith(0);

    fireEvent.click(screen.getByRole('button', { name: 'Finish' }));
    expect(onFinish).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });
});
