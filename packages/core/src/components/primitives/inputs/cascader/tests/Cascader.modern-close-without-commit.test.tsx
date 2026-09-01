import React from 'react';
import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { renderWithEngine } from '@tests/support/engine';
import { Cascader as ModernCascader } from '../engines/modern';

const options = [
  {
    value: 'zhejiang',
    label: 'Zhejiang',
    children: [
      { value: 'hangzhou', label: 'Hangzhou' },
      { value: 'ningbo', label: 'Ningbo' },
    ],
  },
  { value: 'jiangsu', label: 'Jiangsu' },
];

/** Closing without a leaf commit must restore the path represented by value. */
describe('Cascader modern close-without-commit', () => {
  it('drops an uncommitted drill on Escape instead of leaving it in the trigger', () => {
    renderWithEngine(
      <ModernCascader options={options} placeholder="Select location" />,
      'modern'
    );

    const trigger = screen.getByRole('combobox');
    fireEvent.click(trigger);
    fireEvent.click(screen.getByText('Zhejiang'));

    // Drilling alone must not become the trigger's committed value.
    expect(screen.getByText('Hangzhou')).toBeInTheDocument();
    expect(trigger).toHaveAttribute('aria-label', 'Zhejiang');

    fireEvent.keyDown(trigger, { key: 'Escape' });

    expect(screen.queryByText('Hangzhou')).not.toBeInTheDocument();
    expect(trigger).toHaveAttribute('aria-label', 'Select location');
    expect(screen.getByText('Select location')).toBeInTheDocument();
    expect(document.querySelector('[data-part="clear-button"]')).toBeNull();
  });

  it('drops an uncommitted drill when clicking outside the cascader', () => {
    renderWithEngine(
      <ModernCascader options={options} placeholder="Select location" />,
      'modern'
    );

    const trigger = screen.getByRole('combobox');
    fireEvent.click(trigger);
    fireEvent.click(screen.getByText('Zhejiang'));
    expect(screen.getByText('Hangzhou')).toBeInTheDocument();

    fireEvent.mouseDown(document.body);

    expect(screen.queryByText('Hangzhou')).not.toBeInTheDocument();
    expect(trigger).toHaveAttribute('aria-label', 'Select location');
    expect(document.querySelector('[data-part="clear-button"]')).toBeNull();
  });

  it('drops an uncommitted drill when the trigger is clicked closed again', () => {
    renderWithEngine(
      <ModernCascader options={options} placeholder="Select location" />,
      'modern'
    );

    const trigger = screen.getByRole('combobox');
    fireEvent.click(trigger);
    fireEvent.click(screen.getByText('Zhejiang'));
    expect(screen.getByText('Hangzhou')).toBeInTheDocument();

    fireEvent.click(trigger);

    expect(screen.queryByText('Hangzhou')).not.toBeInTheDocument();
    expect(trigger).toHaveAttribute('aria-label', 'Select location');

    // Reopening must show the root column again, not resume mid-drill.
    fireEvent.click(trigger);
    expect(screen.queryByText('Hangzhou')).not.toBeInTheDocument();
    expect(screen.getByText('Zhejiang')).toBeInTheDocument();
    expect(screen.getByText('Jiangsu')).toBeInTheDocument();
  });

  it('does not disturb a genuine commit: leaf click still closes with the new value shown', () => {
    renderWithEngine(
      <ModernCascader options={options} placeholder="Select location" />,
      'modern'
    );

    fireEvent.click(screen.getByRole('combobox'));
    fireEvent.click(screen.getByText('Zhejiang'));
    fireEvent.click(screen.getByText('Hangzhou'));

    expect(screen.getByText('Zhejiang / Hangzhou')).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toHaveAttribute('aria-label', 'Zhejiang / Hangzhou');
  });

  it('pre-expands every column of a value set before the dropdown is ever opened', () => {
    renderWithEngine(
      <ModernCascader options={options} value={['zhejiang', 'hangzhou']} />,
      'modern'
    );

    fireEvent.click(screen.getByRole('combobox'));

    // A preset value must expose every drilled column on first open.
    expect(screen.getByText('Jiangsu')).toBeInTheDocument();
    expect(screen.getByText('Ningbo')).toBeInTheDocument();
    const hangzhou = screen.getByText('Hangzhou').closest('[data-part="option"]');
    expect(hangzhou).toHaveAttribute('data-selected', 'true');
  });

  // A controlled consumer that refuses the value never changes `value`, so the sync effect
  // has no dependency change to react to unless a commit attempt is itself observable.
  it('reverts the trigger when a controlled consumer refuses the committed value', () => {
    const onChange = vi.fn();
    renderWithEngine(
      <ModernCascader options={options} value={[]} onChange={onChange} placeholder="Select location" />,
      'modern'
    );

    fireEvent.click(screen.getByRole('combobox'));
    fireEvent.click(screen.getByText('Zhejiang'));
    fireEvent.click(screen.getByText('Hangzhou'));

    expect(onChange).toHaveBeenCalledWith(['zhejiang', 'hangzhou'], expect.anything());
    // `value` stayed [], so the trigger must show the placeholder, not the refused leaf.
    expect(screen.getByRole('combobox')).toHaveTextContent('Select location');
    expect(screen.getByRole('combobox')).not.toHaveTextContent('Hangzhou');
  });
});
