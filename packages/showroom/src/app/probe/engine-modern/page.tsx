'use client';

import { Suspense, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { Box, Stack, Text } from '@rottay/design-system';
import {
  StateGallery,
  TenantPaletteSurface,
  surfaceLabelFor,
  FLAGSHIP_SLUGS,
  RESPONSIVE_SLUGS,
  type SurfaceTenant,
} from '@/composition/components/state-gallery';

// ---------------------------------------------------------------------------
// Modern engine evidence surface (stable capture target for WO-ENG-11)
//
// One tenant per load (tenant palette + theme are html-anchored). Capture the
// dark ground with ?tenant=rottay and the light ground with ?tenant=bithire.
// Chrome-free so a screenshot is pure component evidence. Query params:
//   ?tenant=rottay|bithire|evnto  which palette owns the page (default rottay)
//   ?w=360|768|1280               fixed content width for the responsive law
//   ?slug=button                  capture a single component in isolation
//   ?set=flagship|responsive      which slug set ?slug looks up against and
//                                 which set renders when ?slug is absent
//                                 (default flagship; responsive covers
//                                 components absent from FLAGSHIP_SPECS)
// ---------------------------------------------------------------------------

const CAPTURE_WIDTHS: Record<string, number> = {
  '360': 360,
  '768': 768,
  '1280': 1280,
};

const TENANTS: SurfaceTenant[] = ['rottay', 'bithire', 'evnto'];

type GallerySet = 'flagship' | 'responsive';

function sanitizeTenant(raw: string | null): SurfaceTenant {
  return raw && (TENANTS as string[]).includes(raw) ? (raw as SurfaceTenant) : 'rottay';
}

function sanitizeSet(raw: string | null): GallerySet {
  return raw === 'responsive' ? 'responsive' : 'flagship';
}

function EvidenceContent() {
  const searchParams = useSearchParams();

  const tenant = useMemo(() => sanitizeTenant(searchParams.get('tenant')), [searchParams]);

  const set = useMemo(() => sanitizeSet(searchParams.get('set')), [searchParams]);

  const contentWidth = useMemo(() => {
    const raw = searchParams.get('w');
    return raw && CAPTURE_WIDTHS[raw] ? CAPTURE_WIDTHS[raw] : undefined;
  }, [searchParams]);

  const slugs = useMemo(() => {
    const setSlugs = set === 'responsive' ? RESPONSIVE_SLUGS : FLAGSHIP_SLUGS;
    const only = searchParams.get('slug');
    return only && setSlugs.includes(only) ? [only] : setSlugs;
  }, [searchParams, set]);

  return (
    <TenantPaletteSurface tenant={tenant}>
      <Box style={{ minHeight: '100vh', padding: 24, background: 'var(--ds-color-bg-primary)' }}>
        <Box style={{ maxWidth: contentWidth ?? 1360, margin: '0 auto' }}>
          <Stack spacing="lg" fullWidth>
            <Box>
              <Text
                as={'h1' as never}
                size="lg"
                weight="bold"
                style={{ display: 'block', color: 'var(--ds-color-text-primary)', textTransform: 'capitalize' }}
              >
                Modern engine evidence — {tenant} · {surfaceLabelFor(tenant)}
              </Text>
              <Text size="sm" style={{ display: 'block', marginTop: 4, color: 'var(--ds-color-text-secondary)' }}>
                Flagship variant + state galleries under the modern engine. Real component states only.
                Load ?tenant=bithire for the light ground.
              </Text>
            </Box>

            {slugs.map((slug) => (
              <Stack key={slug} spacing="sm">
                <Text
                  size="sm"
                  weight="semibold"
                  style={{ display: 'block', color: 'var(--ds-color-text-secondary)', textTransform: 'capitalize' }}
                >
                  {slug}
                </Text>
                <Box
                  style={{
                    borderRadius: 16,
                    border: '1px solid var(--ds-color-border)',
                    background: 'var(--ds-color-bg-elevated)',
                    padding: 16,
                  }}
                >
                  <StateGallery slug={slug} />
                </Box>
              </Stack>
            ))}
          </Stack>
        </Box>
      </Box>
    </TenantPaletteSurface>
  );
}

export default function EngineModernEvidencePage() {
  return (
    <Suspense fallback={null}>
      <EvidenceContent />
    </Suspense>
  );
}
