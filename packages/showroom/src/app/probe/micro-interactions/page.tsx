'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Box,
  Stack,
  Text,
  Card,
  Collapse,
  CountUp,
  CopyToCheck,
  HamburgerToX,
  PulseValue,
  Skeleton,
  Toast,
  ToastProvider,
  useToast,
} from '@rottay/design-system';
import { TortureSurface, type TortureFixture } from '@/components/torture-surface';

// ---------------------------------------------------------------------------
// Micro-interaction catalog probe (WO-CRA-07 sighted proof)
//
// One capture route holding all seven catalog items so a screenshot is the
// evidence the WO's gate asks for. Every item is driven by ONE state flag that
// flips shortly after mount, so the capture harness can photograph the same
// page at three moments -- before the flip, mid-flight, and settled -- and read
// the transition from the difference between them. Nothing here loops.
//
//   ?fixture=rottay|bithire|torture-dark|torture-light|themanagementmiami
//                          which tenant palette owns the page (default rottay)
//   ?delay=<ms>            when the state flip fires (default 600)
//
// The reduced-motion proof needs no query param: Playwright's
// `reducedMotion: 'reduce'` context sets the media query, and every item is
// built to hold still under it while staying fully legible. That is the point
// of capturing the settled frame -- under reduced motion the settled frame IS
// the only frame, so a legible settled frame proves nothing is lost.
// ---------------------------------------------------------------------------

const FIXTURES: readonly string[] = [
  'rottay',
  'bithire',
  'torture-dark',
  'torture-light',
  'themanagementmiami',
];

/** The value the pulse item flashes on. Changed exactly once, by the state flip. */
const PULSE_BEFORE = 42;
const PULSE_AFTER = 57;

function Item({ label, hint, children }: { label: string; hint: string; children: React.ReactNode }) {
  return (
    <Box
      style={{
        borderRadius: 16,
        border: '1px solid var(--ds-color-border)',
        background: 'var(--ds-color-bg-elevated)',
        padding: 16,
        minHeight: 168,
      }}
    >
      <Stack spacing="sm" fullWidth>
        <Text size="sm" weight="semibold" style={{ display: 'block', color: 'var(--ds-color-text-primary)' }}>
          {label}
        </Text>
        <Text size="xs" style={{ display: 'block', color: 'var(--ds-color-text-secondary)' }}>
          {hint}
        </Text>
        <Box style={{ paddingTop: 8 }}>{children}</Box>
      </Stack>
    </Box>
  );
}

/**
 * Pushes three toasts on mount so the container's stacking physics have a stack
 * to settle. They are pushed with a stagger so the capture at `delay` catches
 * the third one still arriving under the two that already settled.
 */
function ToastStackDriver() {
  const { show } = useToast();

  useEffect(() => {
    // duration 0 disables auto-dismiss: the stack must still be standing when
    // the harness photographs it.
    const ids = [
      window.setTimeout(() => show({ title: 'Candidate moved to Interview', variant: 'success', duration: 0 }), 0),
      window.setTimeout(() => show({ title: 'Scorecard saved', variant: 'info', duration: 0 }), 180),
      window.setTimeout(() => show({ title: 'Offer letter queued', variant: 'default', duration: 0 }), 360),
    ];
    return () => ids.forEach(window.clearTimeout);
  }, [show]);

  return null;
}

function CatalogContent() {
  const searchParams = useSearchParams();

  const fixture = useMemo<TortureFixture>(() => {
    const raw = searchParams.get('fixture');
    return (raw && FIXTURES.includes(raw) ? raw : 'rottay') as TortureFixture;
  }, [searchParams]);

  const delay = useMemo(() => {
    const raw = Number(searchParams.get('delay'));
    return Number.isFinite(raw) && raw > 0 ? raw : 600;
  }, [searchParams]);

  // The single flip every item reads. `false` is the "before" frame the harness
  // captures first; the flip is what each item animates through.
  const [active, setActive] = useState(false);

  useEffect(() => {
    const id = window.setTimeout(() => setActive(true), delay);
    return () => window.clearTimeout(id);
  }, [delay]);

  return (
    <TortureSurface fixture={fixture}>
      <ToastProvider position="top-right" max={5}>
        <ToastStackDriver />
        <Toast.Container />
        <Box
          data-testid="probe-ground"
          data-active={active ? 'true' : 'false'}
          style={{ minHeight: '100vh', padding: 24, background: 'var(--ds-color-bg-primary)' }}
        >
          <Box style={{ maxWidth: 1120, margin: '0 auto' }}>
            <Stack spacing="lg" fullWidth>
              <Box>
                <Text
                  as={'h1' as never}
                  size="lg"
                  weight="bold"
                  style={{ display: 'block', color: 'var(--ds-color-text-primary)' }}
                >
                  Micro-interaction catalog — {fixture}
                </Text>
                <Text size="sm" style={{ display: 'block', marginTop: 4, color: 'var(--ds-color-text-secondary)' }}>
                  Seven items, one state flip, zero loops. Each rides --ds-motion-* and the --ds-effect-intensity dial.
                </Text>
              </Box>

              <Box
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                  gap: 16,
                  alignItems: 'stretch',
                }}
              >
                <Item
                  label="1 — Number ticker"
                  hint="Tabular numerals: the digits never reflow as they tick."
                >
                  <Box data-testid="item-ticker">
                    <Text size="lg" weight="bold" style={{ color: 'var(--ds-color-text-primary)' }}>
                      <CountUp from={0} to={1250} durationMs={2000} prefix="$" />
                    </Text>
                  </Box>
                </Item>

                <Item
                  label="2 — Skeleton crossfade"
                  hint="Content fades in over the skeleton; it never pops."
                >
                  <Box data-testid="item-crossfade">
                    <Skeleton.Transition loading={!active} skeleton={<Skeleton.Card />}>
                      <Card title="Ana Moreau" style={{ width: '100%' }}>
                        <Text size="sm" style={{ color: 'var(--ds-color-text-secondary)' }}>
                          Senior Platform Engineer
                        </Text>
                      </Card>
                    </Skeleton.Transition>
                  </Box>
                </Item>

                <Item label="3 — Toast stacking" hint="Three toasts settle top-right; transform-only offsets.">
                  <Text size="xs" style={{ color: 'var(--ds-color-text-secondary)' }}>
                    Rendered in the fixed container above the page, not inline.
                  </Text>
                </Item>

                <Item label="4 — Collapse" hint="grid-template-rows 0fr to 1fr. No max-height bound.">
                  <Box data-testid="item-collapse">
                    <Collapse activeKey={active ? ['1'] : []} bordered>
                      <Collapse.Panel header="Compensation" panelKey="1">
                        <Text size="sm" style={{ color: 'var(--ds-color-text-secondary)' }}>
                          Base 145,000 USD. Equity refresh at 24 months. The panel body has no height
                          bound, so long content is never clipped by an arbitrary pixel ceiling.
                        </Text>
                      </Collapse.Panel>
                    </Collapse>
                  </Box>
                </Item>

                <Item label="5 — Icon morphs" hint="Hamburger to X, copy to check. Transform and opacity only.">
                  <Box
                    data-testid="item-morphs"
                    style={{ display: 'flex', gap: 24, alignItems: 'center', color: 'var(--ds-color-text-primary)' }}
                  >
                    <HamburgerToX open={active} />
                    <CopyToCheck copied={active} />
                  </Box>
                </Item>

                <Item label="6 — Data-changed pulse" hint="Exactly one flash on change. Never loops.">
                  <Box data-testid="item-pulse">
                    <Text size="lg" weight="bold" style={{ color: 'var(--ds-color-text-primary)' }}>
                      <PulseValue value={active ? PULSE_AFTER : PULSE_BEFORE}>
                        {active ? PULSE_AFTER : PULSE_BEFORE} open roles
                      </PulseValue>
                    </Text>
                  </Box>
                </Item>

                <Item label="7 — Success choreography" hint="SVG stroke draw on the motion cadence.">
                  <Box
                    data-testid="item-check"
                    style={{ display: 'flex', gap: 12, alignItems: 'center', minHeight: 32 }}
                  >
                    {active ? <Toast.Check size={28} /> : null}
                    <Text size="sm" style={{ color: 'var(--ds-color-text-secondary)' }}>
                      {active ? 'Offer accepted' : 'Awaiting confirmation'}
                    </Text>
                  </Box>
                </Item>
              </Box>
            </Stack>
          </Box>
        </Box>
      </ToastProvider>
    </TortureSurface>
  );
}

export default function MicroInteractionsProbePage() {
  return (
    <Suspense fallback={null}>
      <CatalogContent />
    </Suspense>
  );
}
