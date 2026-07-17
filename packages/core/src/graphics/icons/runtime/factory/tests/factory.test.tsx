import React, { createRef } from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Circle } from 'lucide-react';
import { afterEach, describe, expect, it } from 'vitest';

import { createIcon } from '..';

const TestIcon = createIcon(Circle, 'TestIcon');

afterEach(cleanup);

describe('createIcon accessibility and rendering contract', () => {
  it('is decorative by default', () => {
    const { container } = render(<TestIcon />);
    const icon = container.querySelector('svg');

    expect(icon).toHaveAttribute('aria-hidden', 'true');
    expect(icon).not.toHaveAttribute('aria-label');
    expect(icon).not.toHaveAttribute('role');
  });

  it('uses aria-label as an accessible image name', () => {
    render(<TestIcon aria-label="Candidate search" />);

    const icon = screen.getByRole('img', { name: 'Candidate search' });
    expect(icon).not.toHaveAttribute('aria-hidden');
    expect(icon.querySelector('title')).toBeNull();
  });

  it('renders title and exposes it as the accessible image name', () => {
    render(<TestIcon title="Candidate status" />);

    const icon = screen.getByRole('img', { name: 'Candidate status' });
    expect(icon).not.toHaveAttribute('aria-hidden');
    expect(icon).toHaveAttribute('aria-label', 'Candidate status');
    expect(icon.querySelector('title')).toHaveTextContent('Candidate status');
  });

  it('keeps an explicit aria-label authoritative while retaining title content', () => {
    render(<TestIcon aria-label="Accessible name" title="Visual title" />);

    const icon = screen.getByRole('img', { name: 'Accessible name' });
    expect(icon).toHaveAttribute('aria-label', 'Accessible name');
    expect(icon.querySelector('title')).toHaveTextContent('Visual title');
  });

  it('resolves token and numeric sizes while preserving visual defaults and hooks', () => {
    const { container, rerender } = render(
      <TestIcon size="lg" className="consumer-icon" data-testid="icon" />,
    );
    const icon = screen.getByTestId('icon');

    expect(icon).toHaveAttribute('width', 'var(--ds-icon-lg-size, 24px)');
    expect(icon).toHaveAttribute('height', 'var(--ds-icon-lg-size, 24px)');
    expect(icon).toHaveAttribute('stroke', 'currentColor');
    expect(icon).toHaveAttribute('stroke-width', 'var(--ds-icon-stroke-width, 1.5)');
    expect(icon).toHaveClass('rottay-icon', 'consumer-icon');

    rerender(<TestIcon size={28} data-testid="icon" />);
    expect(container.querySelector('svg')).toHaveAttribute('width', '28');
    expect(container.querySelector('svg')).toHaveAttribute('height', '28');
  });

  it('forwards its ref to the rendered svg', () => {
    const ref = createRef<SVGSVGElement>();
    const { container } = render(<TestIcon ref={ref} />);

    expect(ref.current).toBe(container.querySelector('svg'));
  });

  it('preserves the accessible contract during SSR', () => {
    const markup = renderToStaticMarkup(<TestIcon size="sm" title="Server status" />);
    const container = document.createElement('div');
    container.innerHTML = markup;
    const icon = container.querySelector('svg');

    expect(icon).toHaveAttribute('width', 'var(--ds-icon-sm-size, 16px)');
    expect(icon).toHaveAttribute('role', 'img');
    expect(icon).toHaveAttribute('aria-label', 'Server status');
    expect(icon).not.toHaveAttribute('aria-hidden');
    expect(icon?.querySelector('title')).toHaveTextContent('Server status');
  });
});
