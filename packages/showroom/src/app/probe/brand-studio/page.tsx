'use client';

import {
  Box,
  DesignSystemProvider,
  Heading,
  PatternBrandStudio,
  Stack,
  getKnownTenantConfig,
  type BrandTheme,
} from '@rottay/design-system';

import { FLAGSHIP_SPECS, StateGallery } from '@/composition/components/state-gallery';

// ---------------------------------------------------------------------------
// Brand Studio capture surface (stable capture target for WO-CRA-05)
//
// One provider owns the DOM and forces the modern engine so the flagship
// galleries render as real premium components. The studio's two preview panels
// self-ground (dark + light) through a scoped <style> block, so both grounds
// coexist on a single html-anchored provider without fighting over the tenant.
// ---------------------------------------------------------------------------

const STUDIO_SLUGS = FLAGSHIP_SPECS.map((spec) => spec.slug);

const CAPTURE_BRAND_THEME: BrandTheme = {
  id: 'capture-draft',
  name: 'Capture Draft',
  palette: {
    primaryColor: '#4f46e5',
    secondaryColor: '#0ea5e9',
    accentColor: '#f59e0b',
    successColor: '#16a34a',
    warningColor: '#d97706',
    errorColor: '#dc2626',
    infoColor: '#2563eb',
    darkPrimaryColor: '#818cf8',
    darkBackgroundColor: '#0b1020',
  },
  typography: {
    fontFamilyBase: 'Inter, system-ui, sans-serif',
    headingWeightBias: 'heavier',
    labelStyle: 'sentence',
  },
  surfaces: {
    borderRadius: { sm: '6px', md: '10px', lg: '14px', xl: '20px' },
    effectIntensity: 1,
  },
};

export default function BrandStudioProbePage() {
  const tenantConfig = getKnownTenantConfig('rottay') ?? undefined;

  return (
    <DesignSystemProvider forceEngine="modern" tenantConfig={tenantConfig} skipCssLoading>
      <Box style={{ minHeight: '100vh', padding: 24, background: 'var(--ds-color-bg-primary)' }}>
        <Stack spacing="md">
          <Heading level="h1" size="lg" weight="bold">
            Brand Studio probe
          </Heading>
          <PatternBrandStudio
            value={CAPTURE_BRAND_THEME}
            galleries={() => (
              <Stack spacing="lg" fullWidth>
                {STUDIO_SLUGS.map((slug) => (
                  <StateGallery key={slug} slug={slug} />
                ))}
              </Stack>
            )}
          />
        </Stack>
      </Box>
    </DesignSystemProvider>
  );
}
