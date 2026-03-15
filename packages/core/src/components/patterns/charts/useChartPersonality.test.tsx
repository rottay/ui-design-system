import React from 'react';
import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { DesignSystemProvider } from '../../../design-system';
import type { TenantConfig } from '../../../contracts';
import { useChartPersonality } from './hooks';
import { mockMatchMedia } from '../../../testing/helpers/match-media';

const CHART_TEST_TENANT: TenantConfig = {
  slug: 'chart-test',
  name: 'Chart Test',
  engine: 'rustic',
  theme: 'light',
  plan: 'enterprise',
  features: ['all'],
  branding: {
    companyName: 'Chart Test',
  },
};

function buildWrapper(productProfile: 'events.organizer' | 'recruiting.operator') {
  return function Wrapper({ children }: { children: React.ReactNode }): React.ReactElement {
    return (
      <DesignSystemProvider
        tenantConfig={CHART_TEST_TENANT}
        productProfile={productProfile}
        forceEngine="rustic"
        skipCssLoading
      >
        {children}
      </DesignSystemProvider>
    );
  };
}

describe('useChartPersonality', () => {
  it('resolves different chart defaults for expressive and dense product profiles', () => {
    mockMatchMedia(1440, false);

    const eventsResult = renderHook(() => useChartPersonality(), {
      wrapper: buildWrapper('events.organizer'),
    });
    const recruitingResult = renderHook(() => useChartPersonality(), {
      wrapper: buildWrapper('recruiting.operator'),
    });

    expect(eventsResult.result.current.lineMode).toBe('smooth');
    expect(eventsResult.result.current.showDots).toBe(false);
    expect(eventsResult.result.current.useGradientFill).toBe(true);
    expect(recruitingResult.result.current.lineMode).toBe('sharp');
    expect(recruitingResult.result.current.showDots).toBe(true);
    expect(recruitingResult.result.current.useGradientFill).toBe(false);
  });
});
