import React from 'react';
import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import ModernTagInput from '../engines/modern';
import { renderWithEngine } from '../../../../../tooling/testing/helpers/engine';

/**
 * TagInput real-engine coverage (K2-V Pass 1): the public component resolves
 * through the genuine engine factory and the modern engine composes the DS
 * Tag primitive for chips. The legacy TagInput.test.tsx mocks the component
 * factory outright, so behavior through real engines lives here.
 */
describe('TagInput real engines', () => {
  it.each(['modern', 'rustic'] as const)(
    'adds and removes tags through the real %s engine',
    async (engine) => {
      const { TagInput } = await import('..');
      const onChange = vi.fn();
      const onRemove = vi.fn();

      renderWithEngine(
        <TagInput engine={engine} value={['one']} onChange={onChange} onRemove={onRemove} />,
        engine
      );

      const input = await screen.findByRole('textbox');
      fireEvent.change(input, { target: { value: 'two' } });
      fireEvent.keyDown(input, { key: 'Enter' });
      expect(onChange).toHaveBeenCalledWith(['one', 'two']);

      // Backspace on the emptied input removes the last tag.
      fireEvent.keyDown(input, { key: 'Backspace' });
      expect(onChange).toHaveBeenCalledWith([]);
    }
  );

  it('modern engine composes the Tag primitive for chips (single chip paint owner)', async () => {
    renderWithEngine(<ModernTagInput value={['alpha', 'beta']} onChange={() => {}} />, 'modern');

    // Chips resolve through the lazy Tag engine; each is a real Tag subtree.
    const chipText = await screen.findByText('alpha');
    const chipShell = chipText.closest('span[class*="rottay-tag-shell"]');
    expect(chipShell).not.toBeNull();
    expect(chipShell).toHaveAttribute('data-variant', 'primary');

    // Close control is Tag's own (localized catalogue name or English floor).
    const closeButtons = await screen.findAllByRole('button', { name: /remove/i });
    expect(closeButtons.length).toBeGreaterThanOrEqual(2);
  });

  it('modern engine remove flows through onChange and onRemove via Tag onClose', async () => {
    const onChange = vi.fn();
    const onRemove = vi.fn();
    renderWithEngine(<ModernTagInput value={['alpha', 'beta']} onChange={onChange} onRemove={onRemove} />, 'modern');

    const closeButtons = await screen.findAllByRole('button', { name: /remove/i });
    fireEvent.click(closeButtons[0]);

    expect(onChange).toHaveBeenCalledWith(['beta']);
    expect(onRemove).toHaveBeenCalledWith('alpha', 0);
  });

  it('modern engine stamps skin-owned anatomy with no inline paint on root or input', async () => {
    const { container } = renderWithEngine(
      <ModernTagInput value={['alpha']} onChange={() => {}} size="lg" error errorMessage="Required" />,
      'modern'
    );

    const root = container.querySelector('.ds-tag-input.ds-tag-input--modern[data-part="root"]');
    expect(root).not.toBeNull();
    expect(root).toHaveAttribute('data-size', 'lg');
    expect(root).toHaveAttribute('data-error', 'true');
    expect(root?.getAttribute('style')).toBeNull();

    const input = container.querySelector('[data-part="input"]');
    expect(input?.getAttribute('style')).toBeNull();

    // Error messaging keeps its skin-addressable parts.
    expect(container.querySelector('[data-part="error-wrapper"]')).not.toBeNull();
    expect(container.querySelector('[data-part="error-message"]')).toHaveTextContent('Required');
  });

  it('modern engine hides chip close controls when disabled', async () => {
    renderWithEngine(<ModernTagInput value={['alpha']} onChange={() => {}} disabled />, 'modern');
    await screen.findByText('alpha');
    expect(screen.queryByRole('button', { name: /remove/i })).not.toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeDisabled();
  });

  it('modern engine names the inline input: aria-label prop wins, placeholder is the floor', async () => {
    const { rerender } = renderWithEngine(
      <ModernTagInput value={['alpha']} onChange={() => {}} aria-label="Skills" />,
      'modern'
    );
    // Explicit prop wins even when chips hide the visible placeholder.
    expect(await screen.findByRole('textbox', { name: 'Skills' })).toBeInTheDocument();

    rerender(<ModernTagInput value={['alpha']} onChange={() => {}} placeholder="Add frameworks" />);
    // No prop: the placeholder TEXT is the name floor (it stays non-empty as
    // a prop even when chips collapse the rendered placeholder attribute).
    expect(await screen.findByRole('textbox', { name: 'Add frameworks' })).toBeInTheDocument();
  });
});
