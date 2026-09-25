import React from 'react';
import { render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { I18nProvider } from '@/infrastructure/runtime/i18n';
import ModernUserProfileCard from '../engines/modern';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('Modern UserProfileCard — provider locale', () => {
  // No supported locale changes the case mapping of a first grapheme, so the
  // witness is the locale the mapping is asked for.
  it('upper-cases the avatar initial in the provider text locale', () => {
    const upper = vi.spyOn(String.prototype, 'toLocaleUpperCase');
    const { container } = render(
      <I18nProvider locale="ar">
        <ModernUserProfileCard user={{ name: 'élodie', role: 'PM' }} />
      </I18nProvider>,
    );

    expect(container.querySelector('[data-part="avatar-initial"]')).toHaveTextContent('É');
    expect(upper).toHaveBeenCalledWith('ar-SA');
  });
});
