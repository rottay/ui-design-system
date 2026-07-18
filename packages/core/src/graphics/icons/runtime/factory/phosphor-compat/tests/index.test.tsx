import React, { createRef, forwardRef } from 'react';
import type { SVGProps } from 'react';
import { BriefcaseIcon } from '@phosphor-icons/react/dist/ssr/Briefcase';
import { cleanup, render, screen } from '@testing-library/react';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, describe, expect, it } from 'vitest';

import type { DSIconComponent, DSIconProps } from '../../../../foundation/contracts';
import { createPhosphorCompatibilityIcon } from '..';

type WeightProbeProps = SVGProps<SVGSVGElement> & {
  readonly size?: string | number;
  readonly color?: string;
  readonly weight?: string;
};

const WeightProbe = forwardRef<SVGSVGElement, WeightProbeProps>(
  function WeightProbe({ size, color, weight, children, ...props }, ref) {
    return (
      <svg
        ref={ref}
        width={size}
        height={size}
        fill={color}
        data-resolved-weight={weight}
        {...props as SVGProps<SVGSVGElement>}
      >
        {children}
      </svg>
    );
  },
);

const TestIcon: DSIconComponent = createPhosphorCompatibilityIcon(
  WeightProbe,
  'PhosphorCompatibilityTestIcon',
);
const ActualSsrIcon = createPhosphorCompatibilityIcon(
  BriefcaseIcon,
  'PhosphorCompatibilityBriefcaseIcon',
);

afterEach(cleanup);

describe('createPhosphorCompatibilityIcon', () => {
  it('preserves the decorative and named accessibility contract, including SSR title output', () => {
    const { container } = render(<TestIcon />);
    const decorative = container.querySelector('svg');

    expect(decorative).toHaveAttribute('aria-hidden', 'true');
    expect(decorative).not.toHaveAttribute('aria-label');
    expect(decorative).not.toHaveAttribute('role');

    render(<TestIcon aria-label="Candidate search" title="Search candidates" />);
    const named = screen.getByRole('img', { name: 'Candidate search' });
    expect(named).not.toHaveAttribute('aria-hidden');
    expect(named).toHaveAttribute('aria-label', 'Candidate search');
    expect(named.querySelector('title')).toHaveTextContent('Search candidates');

    const markup = renderToStaticMarkup(<TestIcon size="sm" title="Server status" />);
    expect(markup).toContain('role="img"');
    expect(markup).toContain('aria-label="Server status"');
    expect(markup).toContain('<title>Server status</title>');
  });

  it('preserves size, color, className, style, and ref behavior without supplier props', () => {
    const ref = createRef<SVGSVGElement>();
    render(
      <TestIcon
        ref={ref}
        size="lg"
        color="rebeccapurple"
        className="consumer-icon"
        style={{ opacity: 0.4 }}
        strokeWidth={2}
        absoluteStrokeWidth
        data-testid="icon"
      />,
    );
    const icon = screen.getByTestId('icon');

    expect(ref.current).toBe(icon);
    expect(icon).toHaveAttribute('width', 'var(--ds-icon-lg-size, 24px)');
    expect(icon).toHaveAttribute('height', 'var(--ds-icon-lg-size, 24px)');
    expect(icon).toHaveAttribute('fill', 'rebeccapurple');
    expect(icon).toHaveClass('rottay-icon', 'consumer-icon');
    expect(icon).toHaveStyle({ opacity: '0.4' });
    expect(icon).toHaveAttribute('data-resolved-weight', 'bold');
    expect(icon).not.toHaveAttribute('stroke-width');
    expect(icon).not.toHaveAttribute('absoluteStrokeWidth');
    expect(icon).not.toHaveAttribute('weight');
  });

  it('maps continuous public stroke widths to bounded Phosphor weights', () => {
    const cases: Array<[DSIconProps['strokeWidth'], string]> = [
      [undefined, 'regular'],
      [0.75, 'thin'],
      [1, 'light'],
      [1.5, 'regular'],
      ['2px', 'bold'],
      ['var(--consumer-icon-stroke-width)', 'regular'],
    ];

    for (const [strokeWidth, expectedWeight] of cases) {
      const { unmount } = render(<TestIcon strokeWidth={strokeWidth} data-testid="weight" />);
      expect(screen.getByTestId('weight')).toHaveAttribute('data-resolved-weight', expectedWeight);
      unmount();
    }
  });

  it('applies the resolved weight to a real SSR glyph without adding a public weight prop', () => {
    const regular = renderToStaticMarkup(<ActualSsrIcon strokeWidth={1.5} />);
    const bold = renderToStaticMarkup(<ActualSsrIcon strokeWidth={2} />);

    expect(regular).not.toContain('weight=');
    expect(bold).not.toContain('weight=');
    expect(regular).not.toContain('stroke-width=');
    expect(bold).not.toContain('stroke-width=');
    expect(regular).not.toEqual(bold);
  });
});
