import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { DesignSystemProvider } from '..';
import { useTranslation } from '../../../../i18n';
import type { TenantConfig } from '../../../types';

const I18N_TEST_TENANT: TenantConfig = {
  slug: 'i18n-test',
  name: 'I18n Test',
  engine: 'rustic',
  theme: 'light',
  locale: 'es',
  fallbackLocale: 'en',
  plan: 'enterprise',
  features: ['all'],
  branding: {
    companyName: 'I18n Test',
  },
  customTranslations: {
    components: {
      surfaces: {
        chat: {
          send: 'Mandar',
        },
      },
    },
  },
};

function TranslationProbe(): React.ReactElement {
  const { t } = useTranslation('components');

  return (
    <div>
      <span data-testid="send-copy">{t('surfaces.chat.send')}</span>
      <span data-testid="loading-copy">{t('surfaces.states.loading_title')}</span>
    </div>
  );
}

describe('DesignSystemProvider i18n integration', () => {
  it('wires tenant locale and translation overrides into the root provider stack', () => {
    render(
      <DesignSystemProvider tenantConfig={I18N_TEST_TENANT} skipCssLoading>
        <TranslationProbe />
      </DesignSystemProvider>
    );

    expect(screen.getByTestId('send-copy')).toHaveTextContent('Mandar');
    expect(screen.getByTestId('loading-copy')).toHaveTextContent('Cargando superficie');
    expect(document.documentElement.lang).toBe('es');
  });

  it('supports RTL locales through the root provider contract', () => {
    render(
      <DesignSystemProvider
        tenantConfig={{
          ...I18N_TEST_TENANT,
          customTranslations: undefined,
        }}
        locale="ar"
        skipCssLoading
      >
        <TranslationProbe />
      </DesignSystemProvider>
    );

    expect(screen.getByTestId('send-copy')).toHaveTextContent('إرسال');
    expect(document.documentElement.lang).toBe('ar');
    expect(document.documentElement.dir).toBe('rtl');
  });
});
