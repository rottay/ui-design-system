import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { message, notification } from 'antd';

import ClassicToast from '../engines/classic';

describe('Toast classic static api', () => {
  it('covers success, error, warning, info, loading, and destroy helpers', () => {
    const successSpy = vi.spyOn(message, 'success').mockImplementation(() => undefined as never);
    const errorSpy = vi.spyOn(message, 'error').mockImplementation(() => undefined as never);
    const warningSpy = vi.spyOn(message, 'warning').mockImplementation(() => undefined as never);
    const infoSpy = vi.spyOn(message, 'info').mockImplementation(() => undefined as never);
    const loadingSpy = vi.spyOn(message, 'loading').mockImplementation(() => undefined as never);
    const messageDestroySpy = vi.spyOn(message, 'destroy').mockImplementation(() => undefined as never);
    const notificationDestroySpy = vi.spyOn(notification, 'destroy').mockImplementation(() => undefined as never);

    const onClose = vi.fn();

    ClassicToast.success('Saved', { duration: 2000, onClose });
    ClassicToast.error('Failed', { duration: 4000 });
    ClassicToast.warning('Watch out');
    ClassicToast.info('Heads up');
    ClassicToast.loading('Working', { duration: 0 });
    ClassicToast.destroy();

    expect(successSpy).toHaveBeenCalledWith(expect.objectContaining({ content: 'Saved', duration: 2, onClose }));
    expect(errorSpy).toHaveBeenCalledWith(expect.objectContaining({ content: 'Failed', duration: 4 }));
    expect(warningSpy).toHaveBeenCalledWith(expect.objectContaining({ content: 'Watch out', duration: 3 }));
    expect(infoSpy).toHaveBeenCalledWith(expect.objectContaining({ content: 'Heads up', duration: 3 }));
    expect(loadingSpy).toHaveBeenCalledWith(expect.objectContaining({ content: 'Working', duration: 3 }));
    expect(messageDestroySpy).toHaveBeenCalledTimes(1);
    expect(notificationDestroySpy).toHaveBeenCalledTimes(1);
  });
});
