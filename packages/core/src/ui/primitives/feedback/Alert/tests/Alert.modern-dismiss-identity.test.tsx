import React from 'react';
import { describe, expect, it } from 'vitest';
import { fireEvent, screen } from '@testing-library/react';

import ModernAlert from '../engines/modern';
import { renderWithEngine } from '@/tooling/testing/helpers/engine';

describe('Alert modern engine dismiss identity', () => {
  it('re-opens when a new message arrives after a dismissal', () => {
    const { rerender } = renderWithEngine(
      <ModernAlert tone="danger" message="Upload failed: file too large" closable />,
      'modern',
    );

    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();

    rerender(<ModernAlert tone="danger" message="Upload failed: network unreachable" closable />);

    expect(screen.getByRole('alert')).toHaveTextContent('Upload failed: network unreachable');
  });

  it('re-opens when an earlier message returns after being dismissed', () => {
    const { rerender } = renderWithEngine(
      <ModernAlert tone="danger" message="Upload failed" closable />,
      'modern',
    );

    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    rerender(<ModernAlert tone="danger" message="Retrying upload" closable />);
    expect(screen.getByRole('alert')).toHaveTextContent('Retrying upload');

    rerender(<ModernAlert tone="danger" message="Upload failed" closable />);

    expect(screen.getByRole('alert')).toHaveTextContent('Upload failed');
  });

  it('stays dismissed while the same message re-renders', () => {
    const { rerender } = renderWithEngine(
      <ModernAlert message="Session expires in 5 minutes" closable />,
      'modern',
    );

    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    rerender(<ModernAlert message="Session expires in 5 minutes" closable />);

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('stays dismissed for a non-primitive message node', () => {
    const { rerender } = renderWithEngine(
      <ModernAlert message={<span>Structured message</span>} closable />,
      'modern',
    );

    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    rerender(<ModernAlert message={<span>Structured message</span>} closable />);

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
