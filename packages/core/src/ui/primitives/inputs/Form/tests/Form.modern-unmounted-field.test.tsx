import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Form as ModernForm } from '../engines/modern';
import { I18nProvider } from '@/infrastructure/runtime/i18n';

function ConditionalForm({
  onFinish,
  onFinishFailed,
}: {
  onFinish: (values: unknown) => void;
  onFinishFailed: (info: { errorFields: Array<{ name: unknown }> }) => void;
}) {
  const [showOptional, setShowOptional] = React.useState(true);
  return (
    <I18nProvider locale="en" fallbackLocale="en">
      <button type="button" onClick={() => setShowOptional(false)}>
        Hide reason
      </button>
      <ModernForm onFinish={onFinish} onFinishFailed={onFinishFailed}>
        {showOptional && (
          <ModernForm.Item name="reason" label="Reason" rules={[{ required: true, message: 'Reason is required' }]}>
            <input />
          </ModernForm.Item>
        )}
        <button type="submit">Save</button>
      </ModernForm>
    </I18nProvider>
  );
}

describe('Form modern engine - unmounted field registration', () => {
  it('stops blocking submit once a conditional field unmounts', async () => {
    const user = userEvent.setup();
    const onFinish = vi.fn();
    const onFinishFailed = vi.fn();

    render(<ConditionalForm onFinish={onFinish} onFinishFailed={onFinishFailed} />);

    await user.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(onFinishFailed).toHaveBeenCalledTimes(1));
    expect(onFinish).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: 'Hide reason' }));
    expect(screen.queryByLabelText('Reason')).toBeNull();

    onFinishFailed.mockClear();
    await user.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => expect(onFinish).toHaveBeenCalledTimes(1));
    expect(onFinishFailed).not.toHaveBeenCalled();
  });

  it('clears the error message state of a field that unmounts', async () => {
    const user = userEvent.setup();

    function ErrorSummaryForm() {
      const [show, setShow] = React.useState(true);
      return (
        <I18nProvider locale="en" fallbackLocale="en">
          <button type="button" onClick={() => setShow(false)}>
            Hide reason
          </button>
          <ModernForm>
            {show && (
              <ModernForm.Item name="reason" label="Reason" rules={[{ required: true, message: 'Reason is required' }]}>
                <input />
              </ModernForm.Item>
            )}
            <ModernForm.ErrorList />
            <button type="submit">Save</button>
          </ModernForm>
        </I18nProvider>
      );
    }

    render(<ErrorSummaryForm />);

    await user.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(screen.getAllByText('Reason is required').length).toBeGreaterThan(0));

    await user.click(screen.getByRole('button', { name: 'Hide reason' }));

    await waitFor(() => expect(screen.queryByText('Reason is required')).toBeNull());
  });
});
