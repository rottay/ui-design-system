'use client';

import { Suspense, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { Box, Card, ScrollReveal, Stack, Text } from '@rottay/design-system';
import { TenantPaletteSurface, surfaceLabelFor, type SurfaceTenant } from '@/components/state-gallery';

// ---------------------------------------------------------------------------
// Scroll-reveal evidence surface (WO-CRA-08 scroll-driven reveal capture)
//
// A long page of ScrollReveal sections. Where the browser supports the view()
// scroll timeline the reveal is CSS-driven (ds-scroll-reveal); otherwise the
// primitive falls back to the framer-motion whileInView path. Each section is
// tall enough to enter from below the fold so the reveal is visible while
// scrolling.
//
// One tenant per load (tenant + theme are html-anchored by the palette
// surface). Chrome-free so a screenshot is pure component evidence. Params:
//   ?tenant=rottay|bithire|evnto   which palette owns the page (default rottay
//                                  = dark ground; bithire = light ground)
//
// The reduced-motion run is the same route captured while the browser emulates
// `prefers-reduced-motion: reduce`; the reveal resolves to a static paint.
// ---------------------------------------------------------------------------

const TENANTS: SurfaceTenant[] = ['rottay', 'bithire', 'evnto'];

function sanitizeTenant(raw: string | null): SurfaceTenant {
  return raw && (TENANTS as string[]).includes(raw) ? (raw as SurfaceTenant) : 'rottay';
}

interface RevealSection {
  id: number;
  title: string;
  body: string;
}

const SECTIONS: RevealSection[] = Array.from({ length: 12 }, (_, index) => ({
  id: index + 1,
  title: `Section ${index + 1}`,
  body:
    'Scroll-driven reveal proof. This block fades and lifts into place as it ' +
    'enters the viewport, driven by the view() timeline where supported and by ' +
    'IntersectionObserver otherwise.',
}));

function ScrollRevealContent() {
  const searchParams = useSearchParams();
  const tenant = useMemo(() => sanitizeTenant(searchParams.get('tenant')), [searchParams]);

  return (
    <TenantPaletteSurface tenant={tenant}>
      <Box style={{ minHeight: '100vh', padding: 24, background: 'var(--ds-color-bg-primary)' }}>
        <Box style={{ maxWidth: 760, margin: '0 auto' }}>
          <Stack spacing="lg" fullWidth>
            <Box>
              <Text
                as={'h1' as never}
                size="lg"
                weight="bold"
                style={{ display: 'block', color: 'var(--ds-color-text-primary)' }}
              >
                Scroll reveal — {tenant} · {surfaceLabelFor(tenant)}
              </Text>
              <Text size="sm" style={{ display: 'block', marginTop: 4, color: 'var(--ds-color-text-secondary)' }}>
                Scroll to reveal each section. Load ?tenant=bithire for the light ground.
              </Text>
            </Box>

            {SECTIONS.map((section) => (
              <ScrollReveal
                key={section.id}
                threshold={0.2}
                style={{
                  minHeight: '70vh',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                }}
              >
                <Card variant="elevated">
                  <Card.Body>
                    <Stack spacing="sm">
                      <Text
                        as={'h2' as never}
                        size="md"
                        weight="semibold"
                        style={{ display: 'block', color: 'var(--ds-color-text-primary)' }}
                      >
                        {section.title}
                      </Text>
                      <Text style={{ display: 'block', color: 'var(--ds-color-text-secondary)' }}>
                        {section.body}
                      </Text>
                    </Stack>
                  </Card.Body>
                </Card>
              </ScrollReveal>
            ))}
          </Stack>
        </Box>
      </Box>
    </TenantPaletteSurface>
  );
}

export default function ScrollRevealProbePage() {
  return (
    <Suspense fallback={null}>
      <ScrollRevealContent />
    </Suspense>
  );
}
