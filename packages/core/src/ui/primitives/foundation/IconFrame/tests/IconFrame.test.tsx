import React, { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { IconFrame } from '..';

describe('IconFrame', () => {
  it('renders the semantic branch as a named image', () => {
    render(<IconFrame icon="status.success" label="Completed" tone="success" />);
    const frame = screen.getByRole('img', { name: 'Completed' });
    expect(frame.tagName).toBe('SPAN');
    expect(frame.getAttribute('data-tone')).toBe('success');
  });

  it('renders the decorative branch hidden from assistive technology', () => {
    const { container } = render(<IconFrame icon="data.gauge" decorative />);
    const frame = container.querySelector('.ds-icon-frame') as HTMLElement;
    expect(frame.getAttribute('aria-hidden')).toBe('true');
    expect(frame.getAttribute('role')).toBeNull();
    expect(frame.getAttribute('aria-label')).toBeNull();
  });

  it('keeps the frame exposed when a decorative frame carries a badge', () => {
    const { container } = render(
      <IconFrame icon="data.gauge" decorative badge={<span>3</span>} />
    );
    const frame = container.querySelector('.ds-icon-frame') as HTMLElement;
    expect(frame.getAttribute('aria-hidden')).toBeNull();
    expect(frame.querySelector('[data-part="badge"]')).toHaveTextContent('3');
  });

  it('is presentation-only: no control, no interactive vocabulary', () => {
    const { container } = render(<IconFrame icon="status.success" label="Completed" />);
    expect(container.querySelector('button')).toBeNull();
    expect(container.querySelector('[data-interactive]')).toBeNull();
  });

  it('stamps the visual axes with their contract defaults', () => {
    const { container } = render(<IconFrame icon="status.success" label="Completed" />);
    const frame = container.querySelector('.ds-icon-frame') as HTMLElement;
    expect(frame.getAttribute('data-size')).toBe('md');
    expect(frame.getAttribute('data-shape')).toBe('rounded');
    expect(frame.getAttribute('data-variant')).toBe('subtle');
    expect(frame.getAttribute('data-tone')).toBe('neutral');
  });

  it('reports busy and disabled states accessibly, never color-only', () => {
    const { container } = render(
      <IconFrame icon="status.success" label="Syncing" loading disabled />
    );
    const frame = container.querySelector('.ds-icon-frame') as HTMLElement;
    expect(frame.getAttribute('aria-busy')).toBe('true');
    expect(frame.getAttribute('data-loading')).toBe('true');
    expect(frame.getAttribute('aria-disabled')).toBe('true');
    expect(frame.getAttribute('data-disabled')).toBe('true');
  });

  it('forwards its ref to the frame element', () => {
    const ref = createRef<HTMLSpanElement>();
    render(<IconFrame ref={ref} icon="status.success" label="Completed" />);
    expect(ref.current?.classList.contains('ds-icon-frame')).toBe(true);
  });
});
