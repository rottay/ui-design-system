import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ModernResult from '../engines/modern';

describe('Result modern status region name', () => {
  it('names the status region from the rendered title', () => {
    render(<ModernResult status="success" title="Payment Successful" subTitle="Order confirmed." />);
    expect(screen.getByRole('status', { name: 'Payment Successful' })).toBeInTheDocument();
  });

  it('leaves the region unnamed rather than dangling when no title is given', () => {
    const { container } = render(<ModernResult status="error" subTitle="Try again." />);
    expect(container.querySelector('[data-part="root"]')).not.toHaveAttribute('aria-labelledby');
  });
});
