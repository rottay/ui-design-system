'use client';

import { useState } from 'react';

import {
  Badge,
  Box,
  Card,
  Flex,
  Heading,
  PatternBrandStudio,
  Stack,
  Text,
  type BrandTheme,
} from '@rottay/design-system';

import { FLAGSHIP_SPECS, StateGallery } from '@/components/state-gallery';

// The flagship set (button, input, select, card, badge, table, tabs, modal) is
// the live evidence the preview renders under each ground.
const STUDIO_SLUGS = FLAGSHIP_SPECS.map((spec) => spec.slug);

const INITIAL_BRAND_THEME: BrandTheme = {
  id: 'studio-draft',
  name: 'Studio Draft',
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
    fontFamilyHeading: 'Inter, system-ui, sans-serif',
    headingWeightBias: 'heavier',
    labelStyle: 'sentence',
  },
  surfaces: {
    borderRadius: { sm: '6px', md: '10px', lg: '14px', xl: '20px' },
    effectIntensity: 1,
  },
  motion: {
    entrance: 'fade',
    entranceDuration: 200,
    hoverLift: 2,
  },
};

export default function ThemeBuilderPage() {
  const [theme, setTheme] = useState<BrandTheme>(INITIAL_BRAND_THEME);

  return (
    <Stack spacing="lg">
      <Card
        style={{
          padding: 24,
          border: '1px solid var(--ds-color-border-secondary)',
          background: 'linear-gradient(180deg, var(--ds-color-bg-secondary), var(--ds-color-bg-surface))',
        }}
      >
        <Stack spacing="sm">
          <Flex align="center" gap={8} style={{ flexWrap: 'wrap' }}>
            <Badge variant="primary">Theme Builder</Badge>
            <Badge variant="secondary">BrandTheme -&gt; live preview</Badge>
          </Flex>
          <Heading level="h1" size="2xl" weight="bold" style={{ letterSpacing: '-0.03em' }}>
            Author a bounded BrandTheme and watch it compile onto light and dark
            grounds in real time.
          </Heading>
          <Text size="md" style={{ color: 'var(--ds-color-text-secondary)' }}>
            Every edit is compiled with the same brand compiler the runtime uses,
            injected into two scoped preview grounds, and validated for WCAG
            contrast inline. The same component states render on both grounds so
            drift is easy to trust.
          </Text>
        </Stack>
      </Card>

      <Box
        style={{
          padding: 20,
          borderRadius: 16,
          border: '1px solid var(--ds-color-border-secondary)',
          background: 'var(--ds-color-bg-elevated)',
        }}
      >
        <PatternBrandStudio
          value={theme}
          onChange={setTheme}
          galleries={() => (
            <Stack spacing="lg" fullWidth>
              {STUDIO_SLUGS.map((slug) => (
                <StateGallery key={slug} slug={slug} />
              ))}
            </Stack>
          )}
        />
      </Box>
    </Stack>
  );
}
