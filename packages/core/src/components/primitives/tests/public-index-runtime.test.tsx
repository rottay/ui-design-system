import React from 'react';
import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { Callout } from '../display/Callout';
import { Descriptions } from '../display/Descriptions';
import { Kbd } from '../display/Kbd';
import { OTPInput } from '../inputs/OTPInput';
import { PasswordInput } from '../inputs/PasswordInput';
import { TagInput } from '../inputs/TagInput';
import { AspectRatio } from '../layout/AspectRatio';
import { Collapse } from '../layout/Collapse';
import {
  describeEachEngine,
  renderWithEngine,
} from '../../../testing/helpers/engine-test-utils';

describeEachEngine('public primitive indexes', (engine) => {
  it('loads Callout through the public component and preserves close behavior', async () => {
    const handleClose = vi.fn();

    renderWithEngine(
      <Callout
        title="Attention"
        closable
        onClose={handleClose}
        action={<button type="button">Review</button>}
      >
        Subscription expires soon.
      </Callout>,
      engine
    );

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('Attention');
    expect(alert).toHaveTextContent('Subscription expires soon.');
    expect(screen.getByRole('button', { name: 'Review' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /close/i }));
    expect(handleClose).toHaveBeenCalledTimes(1);

    await waitFor(() => {
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });

  it('loads Descriptions and Descriptions.Item through the public compound API', async () => {
    renderWithEngine(
      <Descriptions title="User profile" extra={<button type="button">Manage</button>} column={2}>
        <Descriptions.Item label="Name">Ada Lovelace</Descriptions.Item>
        <Descriptions.Item label="Role">Mathematician</Descriptions.Item>
      </Descriptions>,
      engine
    );

    expect(await screen.findByText('User profile')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Manage' })).toBeInTheDocument();
    expect(screen.getByText(/Ada Lovelace/)).toBeInTheDocument();
    expect(screen.getByText(/Mathematician/)).toBeInTheDocument();
  });

  it('loads Kbd through the public component and renders a semantic keyboard key', async () => {
    renderWithEngine(<Kbd size="lg">Ctrl</Kbd>, engine);

    const key = (await screen.findByText('Ctrl')).closest('kbd');
    expect(key).not.toBeNull();
    expect(key?.tagName.toLowerCase()).toBe('kbd');
  });

  it('loads AspectRatio through the public component and keeps engine-specific ratio styling', async () => {
    renderWithEngine(
      <AspectRatio ratio={2} maxWidth="320px" data-testid="aspect-ratio">
        <span>Wide content</span>
      </AspectRatio>,
      engine
    );

    const root = await screen.findByTestId('aspect-ratio');
    expect(root).toHaveStyle({ maxWidth: '320px' });
    expect(screen.getByText('Wide content')).toBeInTheDocument();

    if (engine === 'modern') {
      expect(root.style.aspectRatio).toBe('2');
    } else {
      const ratioBox = root.firstElementChild as HTMLDivElement | null;
      expect(ratioBox).not.toBeNull();
      expect(ratioBox?.style.paddingBottom).toBe('50%');
    }
  });

  it('loads Collapse and Collapse.Panel through the public compound API', async () => {
    renderWithEngine(
      <Collapse accordion defaultActiveKey="first">
        <Collapse.Panel header="First section" panelKey="first">
          First body
        </Collapse.Panel>
        <Collapse.Panel header="Second section" panelKey="second" extra={<button type="button">Extra</button>}>
          Second body
        </Collapse.Panel>
      </Collapse>,
      engine
    );

    expect(await screen.findByText('First section')).toBeInTheDocument();
    expect(screen.getByText('Second section')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Extra' })).toBeInTheDocument();

    if (engine !== 'classic') {
      expect(screen.getByText('First body')).toBeInTheDocument();
      fireEvent.click(screen.getByText('Second section'));
      expect(await screen.findByText('Second body')).toBeInTheDocument();
    }
  });

  it('loads OTPInput through the public component and completes a code', async () => {
    const handleChange = vi.fn();
    const handleComplete = vi.fn();

    renderWithEngine(
      <OTPInput length={4} onChange={handleChange} onComplete={handleComplete} />,
      engine
    );

    const first = await screen.findByLabelText('Digit 1 of 4');
    const second = screen.getByLabelText('Digit 2 of 4');
    const third = screen.getByLabelText('Digit 3 of 4');
    const fourth = screen.getByLabelText('Digit 4 of 4');

    fireEvent.change(first, { target: { value: '1' } });
    fireEvent.change(second, { target: { value: '2' } });
    fireEvent.change(third, { target: { value: '3' } });
    fireEvent.change(fourth, { target: { value: '4' } });

    expect(handleChange).toHaveBeenLastCalledWith('1234');
    expect(handleComplete).toHaveBeenCalledWith('1234');
  });

  it('loads PasswordInput through the public component and toggles visibility', async () => {
    const handlePressEnter = vi.fn();

    renderWithEngine(
      <PasswordInput
        placeholder="Enter password"
        defaultValue="secret"
        showToggle
        strengthIndicator
        strengthLevel="good"
        onPressEnter={handlePressEnter}
        error
        errorMessage="Weak password"
      />,
      engine
    );

    const input = await screen.findByPlaceholderText('Enter password');
    expect(input).toHaveAttribute('type', 'password');
    expect(screen.getByText('Weak password')).toBeInTheDocument();

    fireEvent.click(
      engine === 'classic'
        ? screen.getByRole('img', { name: /eye-invisible/i })
        : screen.getByRole('button', { name: /show password/i })
    );
    expect(screen.getByPlaceholderText('Enter password')).toHaveAttribute('type', 'text');

    fireEvent.keyDown(screen.getByPlaceholderText('Enter password'), { key: 'Enter' });
    expect(handlePressEnter).toHaveBeenCalledTimes(1);
  });

  it('loads TagInput through the public component and supports add/remove flows', async () => {
    const handleChange = vi.fn();
    const handleRemove = vi.fn();

    renderWithEngine(
      <TagInput value={['react']} onChange={handleChange} onRemove={handleRemove} />,
      engine
    );

    expect(await screen.findByText('react')).toBeInTheDocument();

    if (engine === 'classic') {
      expect(screen.getByRole('combobox')).toBeInTheDocument();
      return;
    }

    const removeButton = screen.getByRole('button', { name: 'Remove react' });
    fireEvent.click(removeButton);
    expect(handleChange).toHaveBeenCalledWith([]);
    expect(handleRemove).toHaveBeenCalledWith('react', 0);

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'typescript' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(handleChange).toHaveBeenCalledWith(['react', 'typescript']);
  });
});
