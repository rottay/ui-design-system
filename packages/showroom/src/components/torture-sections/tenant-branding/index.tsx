'use client';

import { useMemo } from 'react';
import {
  Badge,
  Box,
  BrandingPreviewSandbox,
  Button,
  Card,
  Input,
  PatternBrandStudio,
  PatternTenantPreview,
  Stack,
  Text,
  bithireBrandTheme,
  rottayBrandTheme,
  type BrandTheme,
  type TenantAppearance,
} from '@rottay/design-system';
import { useTortureFrame } from '@/components/torture-sections/frame';

// ---------------------------------------------------------------------------
// WO-SKIN-06 tenant branding -- tenant and branding preview inert fixture (?tenantBranding=1).
//
// The fixture intentionally uses the real rottay/bithire BrandTheme sources.
// TenantPreview exposes all ten steps of both palettes and every finite sample
// state; BrandingPreviewSandbox covers its createElement-only hierarchy; Brand
// Studio renders its editor, live ColorField swatches and both scoped grounds.
// ---------------------------------------------------------------------------

const TENANT_BRANDING_LOGO =
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"%3E%3Crect width="32" height="32" rx="8" fill="%234f46e5"/%3E%3Cpath d="M9 22V10h7.5a5 5 0 0 1 0 10H13v2H9Zm4-6h3.2a1 1 0 1 0 0-2H13v2Z" fill="white"/%3E%3C/svg%3E';

export function TenantBrandingStates() {
  const { fixture, engine } = useTortureFrame();
  const theme: BrandTheme = fixture === 'bithire' ? bithireBrandTheme : rottayBrandTheme;
  const primaryColor = theme.palette?.primaryColor ?? '#4f46e5';
  const secondaryColor = theme.palette?.secondaryColor ?? '#0ea5e9';
  const appearance = useMemo<TenantAppearance>(
    () => ({
      general: {
        palette: {
          primary: primaryColor,
          secondary: secondaryColor,
          accent: theme.palette?.accentColor,
        },
        typography: {
          fontFamilyBase: theme.typography?.fontFamilyBase,
          fontFamilyHeading: theme.typography?.fontFamilyHeading,
        },
        shape: { buttonStyle: 'soft' },
        surfaces: { elevation: 'elevated' },
      },
      advanced: { chrome: theme.chrome },
    }),
    [primaryColor, secondaryColor, theme]
  );

  return (
    <Box
      data-testid="probe-tenant-branding"
      style={{
        borderRadius: 16,
        border: '1px solid var(--ds-color-border)',
        background: 'var(--ds-color-bg-elevated)',
        padding: 16,
      }}
    >
      <Stack spacing="lg" fullWidth>
        <Stack spacing="sm" data-testid="probe-tenant-branding-tenant-preview">
          <Text size="xs" color="secondary">
            Tenant preview — both ten-step palettes and all sample states ({engine})
          </Text>
          <PatternTenantPreview
            config={{
              slug: `tenant-branding-${fixture}-${engine}`,
              name: `${theme.name} / ${engine}`,
              primaryColor,
              secondaryColor,
              logo: TENANT_BRANDING_LOGO,
              engine,
              personality: 'formal',
            }}
            components={['button', 'card', 'input', 'badge', 'table']}
            showColorPalette
            showPersonalityInfo
          />
        </Stack>

        <Stack spacing="sm" data-testid="probe-tenant-branding-branding-sandbox">
          <Text size="xs" color="secondary">
            Branding preview sandbox — full finite-state createElement tree
          </Text>
          <BrandingPreviewSandbox appearance={appearance} />
        </Stack>

        <Stack spacing="sm" data-testid="probe-tenant-branding-brand-studio">
          <Text size="xs" color="secondary">
            Brand Studio — live swatches, dark/light grounds and contrast reports
          </Text>
          <PatternBrandStudio
            vertical="bithire"
            value={theme}
            title={`${theme.name} Brand Studio`}
            description="Deterministic tenant branding migration baseline"
            onChange={() => undefined}
            galleries={({ surface }) => (
              <Stack spacing="sm" fullWidth>
                <Text size="xs" color="secondary">
                  {surface} preview states
                </Text>
                <Button variant="primary">Primary action</Button>
                <Input value="Deterministic input" readOnly />
                <Badge variant="success">Active</Badge>
                <Card title="Preview card">Scoped BrandTheme surface</Card>
              </Stack>
            )}
          />
        </Stack>
      </Stack>
    </Box>
  );
}
